'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '../context/UserContext';
import { useAuth } from '../context/AuthContext';

export default function CompleteProfilePopup() {
    const { profile } = useUser();
    const { isAuthenticated } = useAuth();
    const router = useRouter();
    const [show, setShow] = useState(false);
    const [dismissed, setDismissed] = useState(false);

    useEffect(() => {
        if (!isAuthenticated || !profile || dismissed) return;

        // Check if key profile fields are missing
        const hasName = profile.first_name || profile.display_name || profile.name;
        const dismissedBefore = localStorage.getItem('ssc_profile_popup_dismissed');

        if (!hasName && !dismissedBefore) {
            // Small delay for smooth entrance
            const timeout = setTimeout(() => setShow(true), 1200);
            return () => clearTimeout(timeout);
        }
    }, [isAuthenticated, profile, dismissed]);

    function handleGoToProfile() {
        setShow(false);
        router.push('/profile');
    }

    function handleDismiss() {
        setShow(false);
        setDismissed(true);
        localStorage.setItem('ssc_profile_popup_dismissed', 'true');
    }

    if (!show) return null;

    return (
        <>
            {/* Backdrop */}
            <div style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(0, 0, 0, 0.5)',
                backdropFilter: 'blur(4px)',
                zIndex: 9998,
                animation: 'fadeIn 0.3s ease',
            }} onClick={handleDismiss} />

            {/* Popup */}
            <div style={{
                position: 'fixed',
                bottom: '24px',
                left: '50%',
                transform: 'translateX(-50%)',
                width: 'calc(100% - 32px)',
                maxWidth: '400px',
                zIndex: 9999,
                background: 'var(--bg-card)',
                border: '1px solid var(--border-light)',
                borderRadius: '20px',
                padding: '28px 24px',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.2)',
                textAlign: 'center',
                animation: 'slideUpPopup 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
            }}>
                {/* Icon */}
                <div style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '16px',
                    background: 'linear-gradient(135deg, #6C63FF, #8b5cf6)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.5rem',
                    margin: '0 auto 16px',
                    boxShadow: '0 8px 24px rgba(108, 99, 255, 0.3)',
                }}>
                    👤
                </div>

                <h3 style={{
                    fontSize: '1.125rem',
                    fontWeight: 700,
                    marginBottom: '6px',
                    color: 'var(--text-primary)',
                }}>
                    Complete Your Profile
                </h3>

                <p style={{
                    fontSize: '0.875rem',
                    color: 'var(--text-muted)',
                    marginBottom: '20px',
                    lineHeight: 1.5,
                }}>
                    Add your name and photo for a personalized experience
                </p>

                <button
                    className="btn btn-primary"
                    onClick={handleGoToProfile}
                    style={{
                        width: '100%',
                        padding: '14px',
                        fontSize: '0.9375rem',
                        fontWeight: 700,
                        marginBottom: '10px',
                    }}
                >
                    Complete Profile →
                </button>

                <button
                    onClick={handleDismiss}
                    style={{
                        width: '100%',
                        padding: '10px',
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-muted)',
                        fontSize: '0.8125rem',
                        cursor: 'pointer',
                    }}
                >
                    Maybe Later
                </button>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes slideUpPopup {
                    from {
                        opacity: 0;
                        transform: translateX(-50%) translateY(30px);
                    }
                    to {
                        opacity: 1;
                        transform: translateX(-50%) translateY(0);
                    }
                }
            `}} />
        </>
    );
}
