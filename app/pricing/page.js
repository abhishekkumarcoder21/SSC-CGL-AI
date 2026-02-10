'use client';

import { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext';
import { useAuth } from '../context/AuthContext';
import styles from './page.module.css';

export default function PricingPage() {
    const { isPaid, refreshSubscription, profile } = useUser();
    const { isAuthenticated } = useAuth();
    const [loading, setLoading] = useState(null); // 'monthly' | 'yearly' | null
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    // Load Razorpay script
    useEffect(() => {
        if (typeof window !== 'undefined' && !window.Razorpay) {
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.async = true;
            document.body.appendChild(script);
        }
    }, []);

    const features = [
        { name: 'AI Daily Study Planner', free: '1/day, no regen', paid: '1 + 2 regens/day' },
        { name: 'AI Mock Analyzer', free: '1 total', paid: 'Unlimited' },
        { name: 'Progress Tracker', free: '✓', paid: '✓' },
        { name: 'Consistency Rank', free: '✓', paid: '✓' },
        { name: 'Performance Rank', free: '✗', paid: '✓' },
        { name: 'Study Streak', free: '✓', paid: '✓' },
    ];

    const handlePayment = async (planType) => {
        if (!isAuthenticated) {
            setError('Please login first to subscribe.');
            return;
        }

        setLoading(planType);
        setError('');

        try {
            // 1. Create order on server
            const orderRes = await fetch('/api/razorpay/create-order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ plan_type: planType }),
            });

            if (!orderRes.ok) {
                const errData = await orderRes.json();
                throw new Error(errData.error || 'Failed to create order');
            }

            const orderData = await orderRes.json();

            // 2. Open Razorpay checkout
            const options = {
                key: orderData.key_id,
                amount: orderData.amount,
                currency: orderData.currency,
                name: 'SSC CGL AI',
                description: orderData.description,
                order_id: orderData.order_id,
                handler: async function (response) {
                    // 3. Verify payment on server
                    try {
                        const verifyRes = await fetch('/api/razorpay/verify', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature,
                                plan_type: planType,
                            }),
                        });

                        const verifyData = await verifyRes.json();

                        if (verifyData.success) {
                            setSuccess(true);
                            if (refreshSubscription) refreshSubscription();
                        } else {
                            setError('Payment verification failed. Contact support.');
                        }
                    } catch {
                        setError('Payment verification failed. Your money is safe — contact support.');
                    }
                    setLoading(null);
                },
                modal: {
                    ondismiss: function () {
                        setLoading(null);
                    },
                },
                prefill: {
                    contact: profile?.phone || '',
                },
                theme: {
                    color: '#6C63FF',
                },
            };

            const rzp = new window.Razorpay(options);
            rzp.on('payment.failed', function (response) {
                setError(response.error?.description || 'Payment failed. Please try again.');
                setLoading(null);
            });
            rzp.open();
        } catch (err) {
            setError(err.message || 'Something went wrong');
            setLoading(null);
        }
    };

    if (success || isPaid) {
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

            {error && (
                <div className="card" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', marginBottom: '16px', padding: '12px' }}>
                    <p className="text-sm" style={{ color: '#ef4444' }}>{error}</p>
                </div>
            )}

            {/* Plans */}
            <div className={styles.planGrid}>
                <div className={`card ${styles.planCard} ${styles.popular}`}>
                    <div className={styles.planBadge}>Popular</div>
                    <div className={styles.planPrice}>₹199</div>
                    <div className="text-sm text-muted">/month</div>
                    <button
                        className="btn btn-primary"
                        style={{ marginTop: '16px' }}
                        onClick={() => handlePayment('monthly')}
                        disabled={loading !== null}
                    >
                        {loading === 'monthly' ? <span className="spinner" /> : 'Start Monthly'}
                    </button>
                </div>
                <div className={`card ${styles.planCard}`}>
                    <div className={`${styles.planBadge} ${styles.saveBadge}`}>Save 58%</div>
                    <div className={styles.planPrice}>₹999</div>
                    <div className="text-sm text-muted">/year</div>
                    <button
                        className="btn btn-secondary"
                        style={{ marginTop: '16px' }}
                        onClick={() => handlePayment('yearly')}
                        disabled={loading !== null}
                    >
                        {loading === 'yearly' ? <span className="spinner" /> : 'Start Yearly'}
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
