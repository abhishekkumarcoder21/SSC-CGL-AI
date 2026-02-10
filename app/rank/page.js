'use client';

import { useEffect, useState } from 'react';
import { useUser } from '../context/UserContext';
import PaywallModal from '../components/PaywallModal';
import styles from './page.module.css';

export default function RankPage() {
    const { loaded, profile, isPaid, getWeeklyStats, mockHistory } = useUser();
    const [ranking, setRanking] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showPaywall, setShowPaywall] = useState(false);
    const [showPercentile, setShowPercentile] = useState(false);

    useEffect(() => {
        if (loaded && profile) {
            fetchRanking();
        } else if (loaded) {
            setLoading(false);
        }
    }, [loaded, profile]); // eslint-disable-line

    async function fetchRanking() {
        try {
            // Check daily cache first
            const today = new Date().toISOString().split('T')[0];
            const cacheKey = `rank_cache_${today}`;
            const cached = localStorage.getItem(cacheKey);

            if (cached) {
                setRanking(JSON.parse(cached));
                setLoading(false);
                return;
            }

            const stats = getWeeklyStats();
            const res = await fetch('/api/ranking', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ weeklyStats: stats, mocks: mockHistory }),
            });
            const data = await res.json();
            localStorage.setItem(cacheKey, JSON.stringify(data));
            setRanking(data);
        } catch (err) {
            console.error('Ranking fetch failed:', err);
        } finally {
            setLoading(false);
        }
    }

    if (!loaded || loading) {
        return <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}><div className="spinner" /></div>;
    }

    if (!profile) {
        return (
            <div className="fade-in" style={{ textAlign: 'center', padding: '40px 0' }}>
                <p className="text-muted">Complete onboarding to see your ranking.</p>
            </div>
        );
    }

    return (
        <div className="fade-in">
            <h1 style={{ marginBottom: '4px' }}>🏆 Your Rankings</h1>
            <p className="text-sm text-muted" style={{ marginBottom: '24px' }}>
                Compared with active users on this platform. Updated daily.
            </p>

            {/* Consistency Rank */}
            {ranking?.consistency && (
                <section className={`card ${styles.rankCard}`}>
                    <div className={styles.rankHeader}>
                        <span className={styles.rankEmoji}>📊</span>
                        <h3>Consistency Rank</h3>
                    </div>
                    <div className={styles.percentileDisplay}>
                        <div className={styles.percentileNum}>
                            Top {100 - ranking.consistency.percentile}%
                        </div>
                        <div className="text-sm text-muted">{ranking.consistency.label}</div>
                    </div>
                    <div className={styles.scoreBar}>
                        <div className={styles.scoreBarBg}>
                            <div
                                className={styles.scoreBarFill}
                                style={{ width: `${ranking.consistency.score}%` }}
                            />
                        </div>
                        <span className="text-xs text-muted">Score: {ranking.consistency.score}/100</span>
                    </div>
                    <div className={styles.rankFactors}>
                        <span className="text-xs text-muted">Based on: plan completion, weekly activity, study streak</span>
                    </div>
                </section>
            )}

            {/* Performance Rank */}
            <section className={`card ${styles.rankCard}`} style={{ marginTop: '16px' }}>
                <div className={styles.rankHeader}>
                    <span className={styles.rankEmoji}>📈</span>
                    <h3>Performance Rank</h3>
                    {!isPaid && <span className="badge badge-accent">PRO</span>}
                </div>

                {!isPaid ? (
                    <div className={styles.lockedContent}>
                        <div className={styles.blurContent}>
                            <div className={styles.percentileNum}>Top ??%</div>
                            <div className="text-sm text-muted">Based on mock improvement trend</div>
                        </div>
                        <button
                            className="btn btn-primary btn-sm"
                            onClick={() => setShowPaywall(true)}
                            style={{ marginTop: '12px' }}
                        >
                            Unlock Performance Rank
                        </button>
                    </div>
                ) : ranking?.performance ? (
                    <div className={styles.percentileDisplay}>
                        {ranking.performance.percentile ? (
                            <>
                                <div className={styles.percentileNum}>
                                    Top {100 - ranking.performance.percentile}%
                                </div>
                                <div className="text-sm text-muted">{ranking.performance.label}</div>
                                {ranking.performance.trend && (
                                    <div className={`badge ${ranking.performance.trend === 'improving' ? 'badge-green' : ranking.performance.trend === 'declining' ? 'badge-red' : 'badge-amber'}`} style={{ marginTop: '8px' }}>
                                        {ranking.performance.trend === 'improving' ? '↑ Improving' : ranking.performance.trend === 'declining' ? '↓ Declining' : '→ Flat'}
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="text-sm text-muted">{ranking.performance.label}</div>
                        )}
                    </div>
                ) : null}
            </section>

            {/* Overall Percentile — hidden by default */}
            <section className="section" style={{ marginTop: '24px' }}>
                {!showPercentile ? (
                    <button
                        className="btn btn-ghost"
                        onClick={() => setShowPercentile(true)}
                        style={{ width: '100%', justifyContent: 'center' }}
                    >
                        Tap to see Overall Percentile
                    </button>
                ) : ranking?.consistency ? (
                    <div className={`card ${styles.overallCard}`}>
                        <div className="text-sm text-muted" style={{ marginBottom: '4px' }}>Overall Percentile</div>
                        <div className={styles.overallNum}>
                            {ranking.consistency.percentile}th
                        </div>
                        <div className="text-xs text-muted" style={{ marginTop: '4px' }}>
                            You&apos;re performing better than {ranking.consistency.percentile}% of active users
                        </div>
                    </div>
                ) : null}
            </section>

            <PaywallModal
                isOpen={showPaywall}
                onClose={() => setShowPaywall(false)}
                feature="rank"
            />
        </div>
    );
}
