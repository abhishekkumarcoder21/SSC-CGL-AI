'use client';

import { useUser } from '../context/UserContext';
import styles from './page.module.css';

export default function PricingPage() {
    const { isPaid, upgrade, profile } = useUser();

    const features = [
        { name: 'AI Daily Study Planner', free: '1/day, no regen', paid: '1 + 2 regens/day' },
        { name: 'AI Mock Analyzer', free: '1 total', paid: 'Unlimited' },
        { name: 'Progress Tracker', free: '✓', paid: '✓' },
        { name: 'Consistency Rank', free: '✓', paid: '✓' },
        { name: 'Performance Rank', free: '✗', paid: '✓' },
        { name: 'Study Streak', free: '✓', paid: '✓' },
    ];

    if (isPaid) {
        return (
            <div className="fade-in" style={{ textAlign: 'center', padding: '40px 0' }}>
                <div style={{ fontSize: '3rem', marginBottom: '16px' }}>✅</div>
                <h2>You&apos;re on the Pro plan</h2>
                <p className="text-sm text-muted" style={{ marginTop: '8px' }}>
                    All features unlocked. Focus on your preparation.
                </p>

                {profile && (
                    <div className={`card ${styles.profileCard}`} style={{ marginTop: '24px', textAlign: 'left' }}>
                        <h3 style={{ marginBottom: '12px' }}>Profile</h3>
                        <div className="text-sm text-muted">Exam</div>
                        <div style={{ marginBottom: '8px' }}>{profile.exam}</div>
                        <div className="text-sm text-muted">Year</div>
                        <div style={{ marginBottom: '8px' }}>{profile.attemptYear}</div>
                        <div className="text-sm text-muted">Daily Hours</div>
                        <div style={{ marginBottom: '8px' }}>{profile.dailyHours}h</div>
                        <div className="text-sm text-muted">Strong</div>
                        <div style={{ marginBottom: '8px' }}>{profile.strongSubjects.join(', ') || '—'}</div>
                        <div className="text-sm text-muted">Weak</div>
                        <div>{profile.weakSubjects.join(', ') || '—'}</div>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="fade-in">
            <h1 style={{ marginBottom: '4px' }}>Upgrade to Pro</h1>
            <p className="text-sm text-muted" style={{ marginBottom: '24px' }}>
                Get unlimited AI analysis and full ranking access.
            </p>

            {/* Plans */}
            <div className={styles.planGrid}>
                <div className={`card ${styles.planCard} ${styles.popular}`}>
                    <div className={styles.planBadge}>Popular</div>
                    <div className={styles.planPrice}>₹199</div>
                    <div className="text-sm text-muted">/month</div>
                    <button className="btn btn-primary" style={{ marginTop: '16px' }} onClick={upgrade}>
                        Start Monthly
                    </button>
                </div>
                <div className={`card ${styles.planCard}`}>
                    <div className={`${styles.planBadge} ${styles.saveBadge}`}>Save 58%</div>
                    <div className={styles.planPrice}>₹999</div>
                    <div className="text-sm text-muted">/year</div>
                    <button className="btn btn-secondary" style={{ marginTop: '16px' }} onClick={upgrade}>
                        Start Yearly
                    </button>
                </div>
            </div>

            {/* Feature comparison */}
            <section className="section" style={{ marginTop: '32px' }}>
                <h3 className="section-title" style={{ marginBottom: '16px' }}>What you get</h3>
                <div className={styles.featureTable}>
                    <div className={styles.featureRow}>
                        <div className={styles.featureLabel}></div>
                        <div className={`${styles.featureVal} text-xs text-muted`}>Free</div>
                        <div className={`${styles.featureVal} text-xs text-accent`}>Pro</div>
                    </div>
                    {features.map((f) => (
                        <div key={f.name} className={styles.featureRow}>
                            <div className={`${styles.featureLabel} text-sm`}>{f.name}</div>
                            <div className={`${styles.featureVal} text-sm text-muted`}>{f.free}</div>
                            <div className={`${styles.featureVal} text-sm`}>{f.paid}</div>
                        </div>
                    ))}
                </div>
            </section>

            {profile && (
                <div className={`card ${styles.profileCard}`} style={{ marginTop: '24px' }}>
                    <h3 style={{ marginBottom: '12px' }}>Your Profile</h3>
                    <div className="text-sm text-muted">Exam: {profile.exam} | Year: {profile.attemptYear} | {profile.dailyHours}h/day</div>
                </div>
            )}
        </div>
    );
}
