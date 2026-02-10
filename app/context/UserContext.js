'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const UserContext = createContext(null);

const STORAGE_KEY = 'ssc_cgl_ai';
const SUBJECTS = ['Quantitative Aptitude', 'General Intelligence & Reasoning', 'English Language', 'General Awareness'];

const DEFAULT_STATE = {
  // Profile
  profile: null, // { exam, attemptYear, dailyHours, strongSubjects, weakSubjects }
  isLoggedIn: false,
  isPaid: false,

  // Plan
  todayPlan: null,         // { date, items: [{subject, topic, duration, type, completed}] }
  planGenerations: 0,      // count for today
  planGenDate: null,       // date string of last gen

  // Mocks
  mockHistory: [],         // [{ date, total, sections: {qa, gir, eng, gk}, analysis }]
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
  recentTopics: [], // last 3 days of topics [{date, topics: [string]}]
};

function loadState() {
  if (typeof window === 'undefined') return DEFAULT_STATE;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STATE;
    return { ...DEFAULT_STATE, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_STATE;
  }
}

function saveState(state) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch { /* quota exceeded — fail silently */ }
}

export function UserProvider({ children }) {
  const [state, setState] = useState(DEFAULT_STATE);
  const [loaded, setLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    setState(loadState());
    setLoaded(true);
  }, []);

  // Save to localStorage on every state change
  useEffect(() => {
    if (loaded) saveState(state);
  }, [state, loaded]);

  const updateState = useCallback((updates) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  // Profile
  const setProfile = useCallback((profile) => {
    updateState({ profile });
  }, [updateState]);

  // Plan
  const setTodayPlan = useCallback((plan) => {
    const today = new Date().toISOString().split('T')[0];
    const currentGenDate = state.planGenDate;
    const isNewDay = currentGenDate !== today;

    // Track recent topics for no-repeat rule
    const topicsToday = plan.map(item => item.topic);
    let recentTopics = [...(state.recentTopics || [])];
    // Remove entries older than 3 days
    recentTopics = recentTopics.filter(rt => {
      const diff = (new Date(today) - new Date(rt.date)) / (1000 * 60 * 60 * 24);
      return diff < 3;
    });
    // Add today's
    const existingToday = recentTopics.find(rt => rt.date === today);
    if (existingToday) {
      existingToday.topics = topicsToday;
    } else {
      recentTopics.push({ date: today, topics: topicsToday });
    }

    updateState({
      todayPlan: {
        date: today,
        items: plan.map(item => ({ ...item, completed: false })),
      },
      planGenerations: isNewDay ? 1 : (state.planGenerations + 1),
      planGenDate: today,
      recentTopics,
    });
  }, [state.planGenDate, state.planGenerations, state.recentTopics, updateState]);

  const togglePlanItem = useCallback((index) => {
    if (!state.todayPlan) return;
    const items = [...state.todayPlan.items];
    items[index] = { ...items[index], completed: !items[index].completed };
    const completedCount = items.filter(i => i.completed).length;

    // Update streak
    const today = new Date().toISOString().split('T')[0];
    let streak = state.currentStreak;
    if (state.lastActiveDate !== today && completedCount > 0) {
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      streak = (state.lastActiveDate === yesterday) ? streak + 1 : 1;
    }

    // Update subject progress
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

  // Mock
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
  }, [state.mockHistory, state.isPaid, state.freeAnalysisUsed, updateState]);

  // Auth
  const login = useCallback(() => updateState({ isLoggedIn: true }), [updateState]);
  const upgrade = useCallback(() => updateState({ isPaid: true }), [updateState]);

  // Computed
  const today = new Date().toISOString().split('T')[0];
  const completionPct = state.todayPlan?.items?.length
    ? Math.round((state.todayPlan.items.filter(i => i.completed).length / state.todayPlan.items.length) * 100)
    : 0;

  const canGeneratePlan = (() => {
    const isNewDay = state.planGenDate !== today;
    if (isNewDay) return true;
    if (state.isPaid) return state.planGenerations < 3; // 1 gen + 2 regens
    return state.planGenerations < 1;
  })();

  const canAnalyzeMock = state.isPaid || !state.freeAnalysisUsed;

  // Weekly activity for ranking
  const getWeeklyStats = useCallback(() => {
    const plans = state.recentTopics || [];
    const activeDays = plans.length;

    // Approximate completion avg from plan
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
    login,
    upgrade,
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
