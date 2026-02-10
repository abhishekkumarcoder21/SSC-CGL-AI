'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from './context/UserContext';
import PaywallModal from './components/PaywallModal';
import ProgressBar from './components/ProgressBar';
import Link from 'next/link';
import StreakWidget from './components/StreakWidget';
import CompleteProfilePopup from './components/CompleteProfilePopup';
import styles from './page.module.css';

export default function HomePage() {
  const router = useRouter();
  const {
    profile, loaded, todayPlan, setTodayPlan, togglePlanItem,
    completionPct, canGeneratePlan, isPaid, recentTopics, getWeeklyStats,
    testAttempts, mockHistory, currentStreak,
  } = useUser();

  const [loading, setLoading] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [rankSnippet, setRankSnippet] = useState(null);

  // Redirect to onboarding if no profile
  useEffect(() => {
    if (loaded && !profile) {
      router.push('/onboarding');
    }
  }, [loaded, profile, router]);

  // Auto-generate plan if none exists for today
  useEffect(() => {
    if (loaded && profile && !todayPlan) {
      generatePlan();
    }
    if (todayPlan) {
      const today = new Date().toISOString().split('T')[0];
      if (todayPlan.date !== today) {
        generatePlan();
      }
    }
  }, [loaded, profile]); // eslint-disable-line

  // Fetch rank snippet
  useEffect(() => {
    if (loaded && profile) {
      fetchRankSnippet();
    }
  }, [loaded, profile]); // eslint-disable-line

  async function generatePlan() {
    if (!canGeneratePlan) {
      setShowPaywall(true);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/planner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile, recentTopics }),
      });
      const data = await res.json();
      if (data.plan) {
        setTodayPlan(data.plan);
      }
    } catch (err) {
      console.error('Plan generation failed:', err);
    } finally {
      setLoading(false);
    }
  }

  async function fetchRankSnippet() {
    try {
      const today = new Date().toISOString().split('T')[0];
      const cacheKey = `rank_cache_${today}`;
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        const parsed = JSON.parse(cached);
        setRankSnippet(parsed.consistency);
        return;
      }
      const stats = getWeeklyStats();
      const res = await fetch('/api/ranking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ weeklyStats: stats, mocks: [] }),
      });
      const data = await res.json();
      localStorage.setItem(cacheKey, JSON.stringify(data));
      setRankSnippet(data.consistency);
    } catch (err) {
      // Silently fail — rank snippet is non-critical
    }
  }

  if (!loaded || !profile) {
    return <div className={styles.loading}><div className="spinner" /></div>;
  }

  const today = new Date();
  const dateStr = today.toLocaleDateString('en-IN', {
    weekday: 'long', day: 'numeric', month: 'short', year: 'numeric',
  });

  // Compute dashboard data
  const lastAttempt = testAttempts?.[testAttempts.length - 1] || null;
  const last5Scores = (testAttempts || []).slice(-5).map(a => ({
    score: a.score,
    max: a.maxMarks,
    pct: a.maxMarks > 0 ? Math.round((a.score / a.maxMarks) * 100) : 0,
  }));
  const weakTopics = lastAttempt?.weakTopics?.slice(0, 3) || [];

  // Syllabus progress from localStorage
  const syllabusProgress = (() => {
    try {
      const raw = localStorage.getItem('ssc_syllabus_progress');
      if (!raw) return { pct: 0, done: 0 };
      const data = JSON.parse(raw);
      const done = Object.values(data).filter(Boolean).length;
      // Approximate total: ~200 subtopics based on our data
      return { pct: Math.round((done / 200) * 100), done };
    } catch { return { pct: 0, done: 0 }; }
  })();

  return (
    <div className="fade-in">
      {/* Date header */}
      <div className={styles.dateHeader}>
        <span className="text-xs text-muted">{dateStr}</span>
      </div>

      {/* Daily Streak */}
      <section className="section">
        <StreakWidget />
      </section>

      {/* Quick Stats Cards */}
      <section className={styles.statsGrid}>
        <div className={`card ${styles.statCard}`}>
          <div className={styles.statIcon}>🔥</div>
          <div className={styles.statNum}>{currentStreak || 0}</div>
          <div className={styles.statLabel}>Day Streak</div>
        </div>
        <div className={`card ${styles.statCard}`}>
          <div className={styles.statIcon}>📝</div>
          <div className={styles.statNum}>{testAttempts?.length || 0}</div>
          <div className={styles.statLabel}>Mocks Taken</div>
        </div>
        <div className={`card ${styles.statCard}`}>
          <div className={styles.statIcon}>📊</div>
          <div className={styles.statNum}>{lastAttempt ? `${lastAttempt.score}` : '—'}</div>
          <div className={styles.statLabel}>Last Score</div>
        </div>
        <div className={`card ${styles.statCard}`}>
          <div className={styles.statIcon}>📚</div>
          <div className={styles.statNum}>{syllabusProgress.pct}%</div>
          <div className={styles.statLabel}>Syllabus</div>
        </div>
      </section>

      {/* 1. Today's Plan */}
      <section className="section">
        <div className={styles.planHeader}>
          <div className={styles.planHeaderLeft}>
            <h2 className={styles.planTitle}>📋 Today&apos;s Plan</h2>
            <span className={styles.planCount}>
              {todayPlan ? `${todayPlan.items.filter(i => i.completed).length}/${todayPlan.items.length} done` : ''}
            </span>
          </div>
          {canGeneratePlan && todayPlan && (
            <button
              className={styles.regenBtn}
              onClick={generatePlan}
              disabled={loading}
            >
              {loading ? <span className={styles.regenSpin}>⟳</span> : '↻ Regen'}
            </button>
          )}
        </div>

        {/* Mini progress bar */}
        {todayPlan && todayPlan.items.length > 0 && (
          <div className={styles.planProgress}>
            <div
              className={styles.planProgressFill}
              style={{ width: `${completionPct}%` }}
            />
          </div>
        )}

        {loading && !todayPlan ? (
          <div className={styles.skeletons}>
            <div className={`skeleton ${styles.skeletonItem}`} />
            <div className={`skeleton ${styles.skeletonItem}`} />
            <div className={`skeleton ${styles.skeletonItem}`} />
          </div>
        ) : todayPlan ? (
          <div className={styles.planList}>
            {todayPlan.items.map((item, i) => {
              const subjectEmojis = {
                'Quantitative Aptitude': '🔢',
                'General Intelligence & Reasoning': '🧠',
                'English Language': '📖',
                'General Awareness': '🌍',
              };
              const subjectColors = {
                'Quantitative Aptitude': '#6C63FF',
                'General Intelligence & Reasoning': '#F59E0B',
                'English Language': '#10B981',
                'General Awareness': '#EF4444',
              };
              const emoji = subjectEmojis[item.subject] || '📚';
              const color = subjectColors[item.subject] || 'var(--accent-bright)';

              return (
                <div
                  key={i}
                  className={`${styles.planItem} ${item.completed ? styles.completed : ''}`}
                  onClick={() => togglePlanItem(i)}
                  style={{
                    '--subject-color': color,
                    animationDelay: `${i * 60}ms`,
                  }}
                >
                  <div className={styles.planItemLeft}>
                    <div className={styles.checkbox}>
                      {item.completed && <span className={styles.checkIcon}>✓</span>}
                    </div>
                    <div className={styles.subjectIcon}>{emoji}</div>
                    <div className={styles.planContent}>
                      <div className={styles.planSubject}>
                        {item.type === 'revision' && <span className={styles.revisionBadge}>Revision</span>}
                        {item.subject}
                      </div>
                      <div className={styles.planTopic}>{item.topic}</div>
                    </div>
                  </div>
                  <div className={styles.planDuration}>
                    <span className={styles.durationNum}>{item.duration_minutes}</span>
                    <span className={styles.durationLabel}>min</span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : null}
      </section>

      {/* 2. Completion % */}
      <section className="section">
        <ProgressBar
          value={completionPct}
          label="Completed"
          color={completionPct >= 80 ? 'green' : completionPct >= 40 ? 'amber' : 'red'}
        />
      </section>

      {/* Weak Areas from last mock */}
      {weakTopics.length > 0 && (
        <section className="section">
          <h3 className="section-title" style={{ marginBottom: '10px' }}>🚨 Weak Areas</h3>
          <div className={styles.weakGrid}>
            {weakTopics.map((topic, i) => (
              <div key={i} className={`card ${styles.weakChip}`}>
                <span className={styles.weakDot}>●</span>
                <span className="text-sm">{topic}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Score Trend Graph */}
      {last5Scores.length >= 2 && (
        <section className="section">
          <h3 className="section-title" style={{ marginBottom: '10px' }}>📈 Score Trend</h3>
          <div className={styles.trendChart}>
            {last5Scores.map((s, i) => (
              <div key={i} className={styles.trendBar}>
                <div
                  className={styles.trendFill}
                  style={{ height: `${Math.max(s.pct, 5)}%` }}
                />
                <span className={styles.trendLabel}>{s.score}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Quick Access Buttons */}
      <section className="section">
        <h3 className="section-title" style={{ marginBottom: '10px' }}>⚡ Quick Access</h3>
        <div className={styles.quickGrid}>
          <Link href="/mock-test" className={`card ${styles.quickCard}`}>
            <span className={styles.quickIcon}>📝</span>
            <span className={styles.quickLabel}>Take Mock</span>
          </Link>
          <Link href="/exam-overview" className={`card ${styles.quickCard}`}>
            <span className={styles.quickIcon}>🎯</span>
            <span className={styles.quickLabel}>Exam Info</span>
          </Link>
          <Link href="/syllabus" className={`card ${styles.quickCard}`}>
            <span className={styles.quickIcon}>📚</span>
            <span className={styles.quickLabel}>Syllabus</span>
          </Link>
          <Link href="/rank" className={`card ${styles.quickCard}`}>
            <span className={styles.quickIcon}>🏆</span>
            <span className={styles.quickLabel}>Ranking</span>
          </Link>
        </div>
      </section>

      {/* 4. Rank snippet */}
      {rankSnippet && (
        <section className="section">
          <Link href="/rank" className={`card ${styles.rankSnippet}`}>
            <span className={styles.rankIcon}>🏅</span>
            <span className="text-sm">{rankSnippet.label}</span>
            <span className={styles.rankArrow}>→</span>
          </Link>
        </section>
      )}

      <CompleteProfilePopup />

      <PaywallModal
        isOpen={showPaywall}
        onClose={() => setShowPaywall(false)}
        feature="planner"
      />
    </div>
  );
}
