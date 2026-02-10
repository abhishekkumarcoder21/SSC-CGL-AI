'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from './context/UserContext';
import PaywallModal from './components/PaywallModal';
import ProgressBar from './components/ProgressBar';
import Link from 'next/link';
import styles from './page.module.css';

export default function HomePage() {
  const router = useRouter();
  const {
    profile, loaded, todayPlan, setTodayPlan, togglePlanItem,
    completionPct, canGeneratePlan, isPaid, recentTopics, getWeeklyStats,
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
    // Check if today's plan is from a previous day
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

  return (
    <div className="fade-in">
      {/* Date header */}
      <div className={styles.dateHeader}>
        <span className="text-xs text-muted">{dateStr}</span>
      </div>

      {/* 1. Today's Plan */}
      <section className="section">
        <div className="section-header">
          <h2>📋 Today&apos;s Plan</h2>
          {canGeneratePlan && todayPlan && (
            <button
              className="btn btn-ghost btn-sm"
              onClick={generatePlan}
              disabled={loading}
            >
              {loading ? '...' : '↻ Regen'}
            </button>
          )}
        </div>

        {loading && !todayPlan ? (
          <div className={styles.skeletons}>
            <div className={`skeleton ${styles.skeletonItem}`} />
            <div className={`skeleton ${styles.skeletonItem}`} />
            <div className={`skeleton ${styles.skeletonItem}`} />
          </div>
        ) : todayPlan ? (
          <div className={styles.planList}>
            {todayPlan.items.map((item, i) => (
              <div
                key={i}
                className={`${styles.planItem} ${item.completed ? styles.completed : ''}`}
                onClick={() => togglePlanItem(i)}
              >
                <div className={styles.checkbox}>
                  {item.completed ? '✓' : ''}
                </div>
                <div className={styles.planContent}>
                  <div className={styles.planSubject}>
                    {item.type === 'revision' && <span className="badge badge-amber">Revision</span>}
                    {item.subject}
                  </div>
                  <div className={styles.planTopic}>{item.topic}</div>
                </div>
                <div className={styles.planDuration}>{item.duration_minutes}m</div>
              </div>
            ))}
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

      {/* 3. Take Mock Test CTA */}
      <section className="section">
        <Link href="/mock-test" className={`btn btn-primary ${styles.ctaBtn}`}>
          📝 Take Mock Test
        </Link>
      </section>

      {/* 4. Rank snippet (small, not prominent) */}
      {rankSnippet && (
        <section className="section">
          <Link href="/rank" className={`card ${styles.rankSnippet}`}>
            <span className={styles.rankIcon}>🏅</span>
            <span className="text-sm">{rankSnippet.label}</span>
            <span className={styles.rankArrow}>→</span>
          </Link>
        </section>
      )}

      <PaywallModal
        isOpen={showPaywall}
        onClose={() => setShowPaywall(false)}
        feature="planner"
      />
    </div>
  );
}
