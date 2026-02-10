'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';

function getSupabaseClient() {
  if (typeof window === 'undefined') return null;
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL === 'your_supabase_project_url') return null;
  try {
    const { createClient } = require('../../lib/supabase/client');
    return createClient();
  } catch { return null; }
}
const UserContext = createContext(null);

const STORAGE_KEY = 'ssc_cgl_ai';
const SUBJECTS = ['Quantitative Aptitude', 'General Intelligence & Reasoning', 'English Language', 'General Awareness'];

const DEFAULT_STATE = {
  // Profile
  profile: null,
  isLoggedIn: false,
  isPaid: false,

  // Plan
  todayPlan: null,
  planGenerations: 0,
  planGenDate: null,

  // Mocks
  mockHistory: [],
  freeAnalysisUsed: false,

  // Progress
  completedTopicsBySubject: {
    'Quantitative Aptitude': 0,
    'General Intelligence & Reasoning': 0,
    'English Language': 0,
    'General Awareness': 0,
  },

  // Streak
  currentStreak: 0,
  lastActiveDate: null,

  // History for planner no-repeat rule
  recentTopics: [],

  // Mock test attempts
  testAttempts: [],
};

function loadLocal() {
  if (typeof window === 'undefined') return DEFAULT_STATE;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STATE;
    return { ...DEFAULT_STATE, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_STATE;
  }
}

function saveLocal(state) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch { /* quota */ }
}

export function UserProvider({ children }) {
  const { user, isAuthenticated } = useAuth();
  const [state, setState] = useState(DEFAULT_STATE);
  const [loaded, setLoaded] = useState(false);
  const [dbSynced, setDbSynced] = useState(false);

  const supabase = getSupabaseClient();

  // 1. Load from localStorage first (instant)
  useEffect(() => {
    setState(loadLocal());
    setLoaded(true);
  }, []);

  // 2. When authenticated, try loading from Supabase (if profile exists)
  useEffect(() => {
    if (!isAuthenticated || !user || dbSynced || !supabase) return;

    const syncFromDB = async () => {
      try {
        // Load profile
        const { data: profile } = await supabase
          .from('user_profile')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profile) {
          // Load stats
          const { data: stats } = await supabase
            .from('user_stats')
            .select('*')
            .eq('user_id', user.id)
            .single();

          // Load recent study plans
          const today = new Date().toISOString().split('T')[0];
          const { data: plans } = await supabase
            .from('study_plans')
            .select('*')
            .eq('user_id', user.id)
            .gte('plan_date', today)
            .order('generation_num', { ascending: false })
            .limit(1);

          // Load subscription status
          const { data: sub } = await supabase
            .from('subscriptions')
            .select('status, expires_at')
            .eq('user_id', user.id)
            .eq('status', 'active')
            .gte('expires_at', new Date().toISOString())
            .limit(1)
            .single();

          // Load recent attempts
          const { data: attempts } = await supabase
            .from('diagnostic_attempts')
            .select('id, paper_id, paper_title, total_score, max_marks, section_scores, cognitive_breakdown, weak_topics, hints_used, time_taken_seconds, created_at')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(10);

          const todayPlan = plans?.[0] ? {
            date: plans[0].plan_date,
            items: plans[0].items || [],
          } : state.todayPlan;

          const dbState = {
            profile: {
              exam: profile.exam,
              attemptYear: profile.attempt_year,
              dailyHours: profile.daily_hours,
              strongSubjects: profile.strong_subjects || [],
              weakSubjects: profile.weak_subjects || [],
            },
            isLoggedIn: true,
            isPaid: !!sub,
            currentStreak: stats?.current_streak || 0,
            lastActiveDate: stats?.last_active_date || null,
            todayPlan,
            testAttempts: (attempts || []).map(a => ({
              attemptId: a.id,
              paperId: a.paper_id,
              paperTitle: a.paper_title,
              date: new Date(a.created_at).toISOString().split('T')[0],
              score: a.total_score,
              maxMarks: a.max_marks,
              sections: a.section_scores,
              cognitiveBreakdown: a.cognitive_breakdown,
              weakTopics: a.weak_topics,
              hintsUsedCount: a.hints_used,
              timeTaken: a.time_taken_seconds,
            })),
          };

          setState(prev => ({ ...prev, ...dbState }));
          saveLocal({ ...state, ...dbState });
        }
      } catch (err) {
        console.error('DB sync error:', err);
      }
      setDbSynced(true);
    };

    syncFromDB();
  }, [isAuthenticated, user, dbSynced]);

  // 3. Save to localStorage on every state change
  useEffect(() => {
    if (loaded) saveLocal(state);
  }, [state, loaded]);

  const updateState = useCallback((updates) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  // ---- Profile ----
  const setProfile = useCallback(async (profile) => {
    updateState({ profile, isLoggedIn: true });

    if (isAuthenticated && user) {
      try {
        await supabase.from('user_profile').upsert({
          id: user.id,
          phone: user.phone || '',
          display_name: profile.name || null,
          exam: profile.exam || 'SSC CGL',
          attempt_year: profile.attemptYear || 2026,
          daily_hours: profile.dailyHours || 4,
          strong_subjects: profile.strongSubjects || [],
          weak_subjects: profile.weakSubjects || [],
          onboarding_done: true,
        });

        // Init stats row
        await fetch('/api/init-stats', { method: 'POST' });
      } catch (err) {
        console.error('Profile save error:', err);
      }
    }
  }, [isAuthenticated, user, updateState]);

  // ---- Plan ----
  const setTodayPlan = useCallback(async (plan) => {
    const today = new Date().toISOString().split('T')[0];
    const currentGenDate = state.planGenDate;
    const isNewDay = currentGenDate !== today;

    const topicsToday = plan.map(item => item.topic);
    let recentTopics = [...(state.recentTopics || [])];
    recentTopics = recentTopics.filter(rt => {
      const diff = (new Date(today) - new Date(rt.date)) / (1000 * 60 * 60 * 24);
      return diff < 3;
    });
    const existingToday = recentTopics.find(rt => rt.date === today);
    if (existingToday) {
      existingToday.topics = topicsToday;
    } else {
      recentTopics.push({ date: today, topics: topicsToday });
    }

    const items = plan.map(item => ({ ...item, completed: false }));
    const genNum = isNewDay ? 1 : (state.planGenerations + 1);

    updateState({
      todayPlan: { date: today, items },
      planGenerations: genNum,
      planGenDate: today,
      recentTopics,
    });

    // Save to DB
    if (isAuthenticated && user) {
      try {
        await supabase.from('study_plans').upsert({
          user_id: user.id,
          plan_date: today,
          generation_num: genNum,
          items,
          total_count: items.length,
          completed_count: 0,
        }, { onConflict: 'user_id,plan_date,generation_num' });
      } catch (err) {
        console.error('Plan save error:', err);
      }
    }
  }, [state.planGenDate, state.planGenerations, state.recentTopics, isAuthenticated, user, updateState]);

  const togglePlanItem = useCallback((index) => {
    if (!state.todayPlan) return;
    const items = [...state.todayPlan.items];
    items[index] = { ...items[index], completed: !items[index].completed };
    const completedCount = items.filter(i => i.completed).length;

    const today = new Date().toISOString().split('T')[0];
    let streak = state.currentStreak;
    if (state.lastActiveDate !== today && completedCount > 0) {
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      streak = (state.lastActiveDate === yesterday) ? streak + 1 : 1;
    }

    const completedTopics = { ...state.completedTopicsBySubject };
    const item = state.todayPlan.items[index];
    if (items[index].completed) {
      completedTopics[item.subject] = (completedTopics[item.subject] || 0) + 1;
    } else {
      completedTopics[item.subject] = Math.max(0, (completedTopics[item.subject] || 0) - 1);
    }

    updateState({
      todayPlan: { ...state.todayPlan, items },
      currentStreak: streak,
      lastActiveDate: today,
      completedTopicsBySubject: completedTopics,
    });
  }, [state.todayPlan, state.currentStreak, state.lastActiveDate, state.completedTopicsBySubject, updateState]);

  // ---- Mock ----
  const addMockResult = useCallback((mockData, analysis) => {
    const entry = {
      date: new Date().toISOString().split('T')[0],
      total: mockData.total,
      sections: mockData.sections,
      analysis,
    };
    updateState({
      mockHistory: [...state.mockHistory, entry],
      freeAnalysisUsed: !state.isPaid ? true : state.freeAnalysisUsed,
    });

    // Save analysis to DB
    if (isAuthenticated && user) {
      supabase.from('ai_analysis_results').insert({
        user_id: user.id,
        analysis: { ...analysis, mockData },
      }).then(() => { }).catch(() => { });
    }
  }, [state.mockHistory, state.isPaid, state.freeAnalysisUsed, isAuthenticated, user, updateState]);

  // ---- Test Attempts ----
  const saveTestAttempt = useCallback((attempt) => {
    // Update streak on test attempt
    const today = new Date().toISOString().split('T')[0];
    let streak = state.currentStreak;
    if (state.lastActiveDate !== today) {
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      streak = (state.lastActiveDate === yesterday) ? streak + 1 : 1;
    }

    updateState({
      testAttempts: [...state.testAttempts, attempt],
      currentStreak: streak,
      lastActiveDate: today,
    });

    // Save to DB
    if (isAuthenticated && user) {
      supabase.from('diagnostic_attempts').insert({
        user_id: user.id,
        paper_id: attempt.paperId,
        paper_title: attempt.paperTitle,
        total_score: attempt.score,
        max_marks: attempt.maxMarks,
        correct: attempt.correct || 0,
        wrong: attempt.wrong || 0,
        unattempted: attempt.unattempted || 0,
        hints_used: attempt.hintsUsedCount || 0,
        time_taken_seconds: attempt.timeTaken || null,
        section_scores: attempt.sections || {},
        cognitive_breakdown: attempt.cognitiveBreakdown || {},
        weak_topics: attempt.weakTopics || [],
        answers: attempt.answers || {},
        hints_data: attempt.hintsData || {},
      }).then(() => {
        // Update stats via API
        fetch('/api/update-stats', { method: 'POST' }).catch(() => { });
      }).catch(err => {
        console.error('Attempt save error:', err);
      });
    }
  }, [state.testAttempts, isAuthenticated, user, updateState]);

  // ---- Auth ----
  const login = useCallback(() => updateState({ isLoggedIn: true }), [updateState]);
  const upgrade = useCallback(() => updateState({ isPaid: true }), [updateState]);

  // ---- Profile Update ----
  const updateProfile = useCallback(async (profileData) => {
    // Update local state
    const newProfile = { ...(state.profile || {}), ...profileData };
    updateState({ profile: newProfile });

    // Sync to Supabase if authenticated
    if (isAuthenticated && user && supabase) {
      try {
        await supabase
          .from('user_profile')
          .update(profileData)
          .eq('id', user.id);
      } catch (err) {
        console.error('Failed to sync profile to DB:', err);
      }
    }
  }, [state.profile, isAuthenticated, user, supabase, updateState]);

  // ---- Subscription ----
  const refreshSubscription = useCallback(async () => {
    if (!isAuthenticated || !user || !supabase) {
      return; // no-op for local/unauthenticated mode — keep existing state
    }
    try {
      const { data: sub } = await supabase
        .from('subscriptions')
        .select('status, expires_at')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .gte('expires_at', new Date().toISOString())
        .limit(1)
        .single();
      updateState({ isPaid: !!sub });
    } catch {
      updateState({ isPaid: false }); // conservative default — don't grant Pro on errors
    }
  }, [isAuthenticated, user, supabase, updateState]);

  // ---- Computed ----
  const today = new Date().toISOString().split('T')[0];
  const completionPct = state.todayPlan?.items?.length
    ? Math.round((state.todayPlan.items.filter(i => i.completed).length / state.todayPlan.items.length) * 100)
    : 0;

  const canGeneratePlan = (() => {
    const isNewDay = state.planGenDate !== today;
    if (isNewDay) return true;
    if (state.isPaid) return state.planGenerations < 3;
    return state.planGenerations < 1;
  })();

  const canAnalyzeMock = state.isPaid || !state.freeAnalysisUsed;

  const getWeeklyStats = useCallback(() => {
    const plans = state.recentTopics || [];
    const activeDays = plans.length;
    const completionAvg = state.todayPlan?.items?.length
      ? state.todayPlan.items.filter(i => i.completed).length / state.todayPlan.items.length
      : 0;

    return {
      activeDaysThisWeek: Math.min(activeDays, 7),
      last7DaysCompletionAvg: completionAvg,
      currentStreak: state.currentStreak,
    };
  }, [state.recentTopics, state.todayPlan, state.currentStreak]);

  const value = {
    ...state,
    loaded,
    completionPct,
    canGeneratePlan,
    canAnalyzeMock,
    subjects: SUBJECTS,
    setProfile,
    setTodayPlan,
    togglePlanItem,
    addMockResult,
    saveTestAttempt,
    login,
    upgrade,
    refreshSubscription,
    updateProfile,
    getWeeklyStats,
    updateState,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error('useUser must be used inside UserProvider');
  return ctx;
}
