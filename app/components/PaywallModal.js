'use client';

import Link from 'next/link';
import styles from './PaywallModal.module.css';

export default function PaywallModal({ isOpen, onClose, feature }) {
    if (!isOpen) return null;

    const messages = {
        planner: {
            title: 'Daily plan limit reached',
            desc: 'Free users get 1 plan per day. Upgrade to regenerate plans and unlock unlimited mock analysis.',
        },
        analyzer: {
            title: 'Free analysis used',
            desc: 'You\'ve used your free mock analysis. Upgrade to get unlimited AI-powered analysis for every mock test.',
        },
        rank: {
            title: 'Performance Rank locked',
            desc: 'Upgrade to see your performance rank and how your mock scores compare with active users.',
        },
    };

    const msg = messages[feature] || messages.analyzer;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className={styles.lockIcon}>🔒</div>
                <h2 className={styles.title}>{msg.title}</h2>
                <p className={styles.desc}>{msg.desc}</p>

                <div className={styles.plans}>
                    <div className={`card ${styles.planCard}`}>
                        <div className={styles.planPrice}>₹199<span>/month</span></div>
                        <div className={styles.planLabel}>Most popular</div>
                    </div>
                    <div className={`card ${styles.planCard}`}>
                        <div className={styles.planPrice}>₹999<span>/year</span></div>
                        <div className={styles.planLabel}>Save 58%</div>
                    </div>
                </div>

                <Link href="/pricing" className="btn btn-primary" onClick={onClose}>
                    View Plans
                </Link>
                <button className={`btn btn-ghost ${styles.dismiss}`} onClick={onClose}>
                    Maybe later
                </button>
            </div>
        </div>
    );
}
