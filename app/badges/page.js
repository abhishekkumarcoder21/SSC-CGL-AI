'use client';

import { useEffect, useState } from 'react';
import { useUser } from '../context/UserContext';
import styles from './page.module.css';

const ALL_BADGES = [
    { id: 'first_mock', title: 'Mock Master', desc: 'Complete your first mock test', emoji: '📝', condition: (stats) => stats.mocks >= 1 },
    { id: 'five_mocks', title: 'Consistent Tester', desc: 'Complete 5 mock tests', emoji: '🎯', condition: (stats) => stats.mocks >= 5 },
    { id: 'ten_mocks', title: 'Mock Champion', desc: 'Complete 10 mock tests', emoji: '🏆', condition: (stats) => stats.mocks >= 10 },
    { id: 'streak_3', title: 'Streak Starter', desc: 'Maintain a 3-day streak', emoji: '🔥', condition: (stats) => stats.streak >= 3 },
    { id: 'streak_7', title: 'Week Warrior', desc: 'Maintain a 7-day streak', emoji: '⚡', condition: (stats) => stats.streak >= 7 },
    { id: 'streak_30', title: 'Unstoppable', desc: 'Maintain a 30-day streak', emoji: '💪', condition: (stats) => stats.streak >= 30 },
    { id: 'first_note', title: 'Note Taker', desc: 'Create your first note', emoji: '📝', condition: (stats) => stats.notes >= 1 },
    { id: 'ten_notes', title: 'Study Nerd', desc: 'Create 10 notes', emoji: '📚', condition: (stats) => stats.notes >= 10 },
    { id: 'syllabus_25', title: 'Quarter Done', desc: 'Complete 25% syllabus', emoji: '📊', condition: (stats) => stats.syllabusPct >= 25 },
    { id: 'syllabus_50', title: 'Halfway There', desc: 'Complete 50% syllabus', emoji: '🎓', condition: (stats) => stats.syllabusPct >= 50 },
    { id: 'syllabus_100', title: 'Syllabus King', desc: 'Complete 100% syllabus', emoji: '👑', condition: (stats) => stats.syllabusPct >= 100 },
    { id: 'score_150', title: 'Scorer', desc: 'Score 150+ in a mock', emoji: '🌟', condition: (stats) => stats.highScore >= 150 },
    { id: 'score_175', title: 'High Scorer', desc: 'Score 175+ in a mock', emoji: '💫', condition: (stats) => stats.highScore >= 175 },
    { id: 'pyq_10', title: 'PYQ Solver', desc: 'Solve 10 PYQ questions', emoji: '📜', condition: (stats) => stats.pyqSolved >= 10 },
    { id: 'first_doubt', title: 'Curious Mind', desc: 'Ask your first doubt', emoji: '❓', condition: (stats) => stats.doubts >= 1 },
    { id: 'plan_complete', title: 'Planner', desc: 'Complete a full daily plan', emoji: '✅', condition: (stats) => stats.plansCompleted >= 1 },
];

export default function BadgesPage() {
    const { testAttempts, currentStreak } = useUser();
    const [stats, setStats] = useState({
        mocks: 0, streak: 0, notes: 0, syllabusPct: 0, highScore: 0, pyqSolved: 0, doubts: 0, plansCompleted: 0,
    });

    useEffect(() => {
        // Gather stats from various sources
        const notesCount = (() => {
            try { return JSON.parse(localStorage.getItem('ssc_user_notes') || '[]').length; } catch { return 0; }
        })();
        const syllabusPct = (() => {
            try {
                const data = JSON.parse(localStorage.getItem('ssc_syllabus_progress') || '{}');
                const done = Object.values(data).filter(Boolean).length;
                return Math.round((done / 200) * 100);
            } catch { return 0; }
        })();
        const doubtsCount = (() => {
            try { return JSON.parse(localStorage.getItem('ssc_doubts') || '[]').length; } catch { return 0; }
        })();
        const highScore = testAttempts?.reduce((max, a) => Math.max(max, a.score || 0), 0) || 0;

        setStats({
            mocks: testAttempts?.length || 0,
            streak: currentStreak || 0,
            notes: notesCount,
            syllabusPct,
            highScore,
            pyqSolved: 0, // Would track from PYQ page in future
            doubts: doubtsCount,
            plansCompleted: 0,
        });
    }, [testAttempts, currentStreak]);

    const earnedBadges = ALL_BADGES.filter(b => b.condition(stats));
    const lockedBadges = ALL_BADGES.filter(b => !b.condition(stats));

    return (
        <div className="fade-in">
            <h1 style={{ marginBottom: '4px' }}>🏆 Badges & Achievements</h1>
            <p className="text-sm text-muted" style={{ marginBottom: '16px' }}>
                {earnedBadges.length}/{ALL_BADGES.length} badges earned
            </p>

            {/* Progress Ring */}
            <div className={styles.progressSection}>
                <div className={styles.progressRing}>
                    <svg viewBox="0 0 100 100" className={styles.ringSvg}>
                        <circle cx="50" cy="50" r="42" fill="none" stroke="var(--border)" strokeWidth="6" />
                        <circle
                            cx="50" cy="50" r="42" fill="none"
                            stroke="var(--accent-bright)"
                            strokeWidth="6"
                            strokeLinecap="round"
                            strokeDasharray={`${(earnedBadges.length / ALL_BADGES.length) * 264} 264`}
                            transform="rotate(-90 50 50)"
                        />
                    </svg>
                    <div className={styles.ringText}>
                        <div className={styles.ringNum}>{earnedBadges.length}</div>
                        <div className="text-xs text-muted">earned</div>
                    </div>
                </div>
                <div className={styles.statCol}>
                    <div className={styles.miniStat}><span>🔥</span>{stats.streak} day streak</div>
                    <div className={styles.miniStat}><span>📝</span>{stats.mocks} mocks</div>
                    <div className={styles.miniStat}><span>📚</span>{stats.syllabusPct}% syllabus</div>
                    <div className={styles.miniStat}><span>📝</span>{stats.notes} notes</div>
                </div>
            </div>

            {/* Earned Badges */}
            {earnedBadges.length > 0 && (
                <section>
                    <h3 className={styles.sectionTitle}>✅ Earned Badges</h3>
                    <div className={styles.badgeGrid}>
                        {earnedBadges.map(badge => (
                            <div key={badge.id} className={`${styles.badgeCard} ${styles.earned}`}>
                                <div className={styles.badgeEmoji}>{badge.emoji}</div>
                                <div className={styles.badgeTitle}>{badge.title}</div>
                                <div className={styles.badgeDesc}>{badge.desc}</div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Locked Badges */}
            <section>
                <h3 className={styles.sectionTitle}>🔒 Locked Badges</h3>
                <div className={styles.badgeGrid}>
                    {lockedBadges.map(badge => (
                        <div key={badge.id} className={`${styles.badgeCard} ${styles.locked}`}>
                            <div className={styles.badgeEmoji}>{badge.emoji}</div>
                            <div className={styles.badgeTitle}>{badge.title}</div>
                            <div className={styles.badgeDesc}>{badge.desc}</div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}
