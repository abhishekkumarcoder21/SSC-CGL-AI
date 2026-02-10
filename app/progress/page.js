'use client';

import { useUser } from '../context/UserContext';
import ProgressBar from '../components/ProgressBar';
import styles from './page.module.css';

// Approximate total topics per subject for progress calculation
const TOTAL_TOPICS = {
    'Quantitative Aptitude': 15,
    'General Intelligence & Reasoning': 14,
    'English Language': 12,
    'General Awareness': 12,
};

export default function ProgressPage() {
    const { loaded, profile, completedTopicsBySubject, currentStreak, lastActiveDate, todayPlan, completionPct, mockHistory } = useUser();

    if (!loaded) {
        return <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}><div className="spinner" /></div>;
    }

    if (!profile) {
        return (
            <div className="fade-in" style={{ textAlign: 'center', padding: '40px 0' }}>
                <p className="text-muted">Complete onboarding to track progress.</p>
            </div>
        );
    }

    const subjects = Object.keys(TOTAL_TOPICS);

    return (
        <div className="fade-in">
            <h1 style={{ marginBottom: '4px' }}>📈 Your Progress</h1>
            <p className="text-sm text-muted" style={{ marginBottom: '24px' }}>
                Subject-level tracking. Stay honest.
            </p>

            {/* Streak */}
            <section className={`card ${styles.streakCard}`}>
                <div className={styles.streakIcon}>🔥</div>
                <div>
                    <div className={styles.streakNum}>{currentStreak}</div>
                    <div className="text-xs text-muted">day streak</div>
                </div>
                <div className={styles.streakDivider} />
                <div>
                    <div className={styles.streakNum}>{mockHistory.length}</div>
                    <div className="text-xs text-muted">mocks taken</div>
                </div>
                <div className={styles.streakDivider} />
                <div>
                    <div className={styles.streakNum}>{completionPct}%</div>
                    <div className="text-xs text-muted">today</div>
                </div>
            </section>

            {/* Subject Progress */}
            <section className="section" style={{ marginTop: '24px' }}>
                <h3 className="section-title" style={{ marginBottom: '16px' }}>Subject Coverage</h3>
                {subjects.map(subject => {
                    const completed = completedTopicsBySubject[subject] || 0;
                    const total = TOTAL_TOPICS[subject];
                    const shortName = subject === 'Quantitative Aptitude' ? 'Quant'
                        : subject === 'General Intelligence & Reasoning' ? 'Reasoning'
                            : subject === 'English Language' ? 'English'
                                : 'GK';

                    const pct = Math.round((completed / total) * 100);
                    const color = pct >= 60 ? 'green' : pct >= 30 ? 'amber' : 'red';

                    return (
                        <div key={subject} style={{ marginBottom: '16px' }}>
                            <ProgressBar
                                value={completed}
                                max={total}
                                label={shortName}
                                color={color}
                            />
                            <div className="text-xs text-muted" style={{ marginTop: '2px' }}>
                                {completed}/{total} topics covered
                            </div>
                        </div>
                    );
                })}
            </section>

            {/* Weekly grid */}
            <section className="section">
                <h3 className="section-title" style={{ marginBottom: '12px' }}>This Week</h3>
                <div className={styles.weekGrid}>
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => {
                        const today = new Date();
                        const dayOfWeek = today.getDay(); // 0=Sun
                        const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
                        const thisDay = new Date(today);
                        thisDay.setDate(today.getDate() + mondayOffset + i);
                        const isToday = thisDay.toDateString() === today.toDateString();
                        const isPast = thisDay < today && !isToday;
                        const isFuture = thisDay > today;

                        // Determine if this past day was active using streak data
                        let wasActive = false;
                        if (isToday) {
                            wasActive = completionPct > 0;
                        } else if (isPast && lastActiveDate) {
                            // Calculate if this day falls within the streak window
                            const lastActive = new Date(lastActiveDate + 'T00:00:00');
                            const dayStr = thisDay.toISOString().split('T')[0];
                            const lastActiveStr = lastActiveDate;
                            // Check if this day is <= lastActiveDate and within streak range
                            if (dayStr <= lastActiveStr) {
                                const daysBefore = Math.round((lastActive - thisDay) / (1000 * 60 * 60 * 24));
                                wasActive = daysBefore < currentStreak;
                            }
                        }

                        return (
                            <div
                                key={day}
                                className={`${styles.weekDay} ${isToday ? styles.weekToday : ''} ${isPast ? styles.weekPast : ''}`}
                            >
                                <span className="text-xs">{day}</span>
                                <div className={styles.weekDot}>
                                    {wasActive ? '✓' : (isFuture ? '' : '·')}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </section>
        </div>
    );
}
