'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useUser } from '../context/UserContext';
import styles from './PaywallModal.module.css';

export default function PaywallModal({ isOpen, onClose, feature }) {
    const { isAuthenticated } = useAuth();
    const { refreshSubscription } = useUser();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Load Razorpay script
    useEffect(() => {
        if (isOpen && typeof window !== 'undefined' && !window.Razorpay) {
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.async = true;
            document.body.appendChild(script);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const featureMessages = {
        planner: 'Get unlimited plan regenerations with Pro.',
        analyzer: 'Unlock unlimited mock test analysis with Pro.',
        rank: 'See your performance rank with Pro.',
        default: 'Upgrade to Pro for full access.',
    };

    const message = featureMessages[feature] || featureMessages.default;

    const handlePayment = async (planType) => {
        if (!isAuthenticated) {
            setError('Please login first to subscribe.');
            return;
        }

        setLoading(true);
        setError('');

        try {
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

            const options = {
                key: orderData.key_id,
                amount: orderData.amount,
                currency: orderData.currency,
                name: 'SSC CGL AI',
                description: orderData.description,
                order_id: orderData.order_id,
                handler: async function (response) {
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
                            if (refreshSubscription) refreshSubscription();
                            onClose();
                        } else {
                            setError('Payment verification failed.');
                        }
                    } catch {
                        setError('Verification failed. Contact support.');
                    }
                    setLoading(false);
                },
                modal: {
                    ondismiss: function () {
                        setLoading(false);
                    },
                },
                theme: { color: '#6C63FF' },
            };

            const rzp = new window.Razorpay(options);
            rzp.on('payment.failed', function (resp) {
                setError(resp.error?.description || 'Payment failed.');
                setLoading(false);
            });
            rzp.open();
        } catch (err) {
            setError(err.message || 'Something went wrong');
            setLoading(false);
        }
    };

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={e => e.stopPropagation()}>
                <button className={styles.close} onClick={onClose}>✕</button>

                <div className={styles.icon}>👑</div>
                <h2 className={styles.title}>Upgrade to Pro</h2>
                <p className={styles.message}>{message}</p>

                {error && (
                    <p className="text-sm" style={{ color: '#ef4444', marginBottom: '12px' }}>{error}</p>
                )}

                <div className={styles.plans}>
                    <button
                        className={`btn btn-primary ${styles.planBtn}`}
                        onClick={() => handlePayment('monthly')}
                        disabled={loading}
                    >
                        {loading ? <span className="spinner" /> : '₹199/month'}
                    </button>
                    <button
                        className={`btn btn-secondary ${styles.planBtn}`}
                        onClick={() => handlePayment('yearly')}
                        disabled={loading}
                    >
                        {loading ? <span className="spinner" /> : '₹999/year (Save 58%)'}
                    </button>
                </div>

                <p className={styles.skip} onClick={onClose}>Maybe later</p>
            </div>
        </div>
    );
}
