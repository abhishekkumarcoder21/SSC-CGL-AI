'use client';

import { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext';

export default function NotificationPrompt() {
    const { user } = useUser();
    const [show, setShow] = useState(false);
    const [subscribed, setSubscribed] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Only show if push is supported and not already subscribed
        if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;
        if (typeof window === 'undefined') return;

        const dismissed = localStorage.getItem('push_prompt_dismissed');
        if (dismissed) return;

        // Check if already subscribed
        navigator.serviceWorker.ready.then(reg => {
            reg.pushManager.getSubscription().then(sub => {
                if (sub) {
                    setSubscribed(true);
                } else {
                    // Show prompt after short delay
                    setTimeout(() => setShow(true), 3000);
                }
            });
        });
    }, []);

    async function subscribe() {
        setLoading(true);
        try {
            // Register service worker
            const reg = await navigator.serviceWorker.register('/sw.js');
            await navigator.serviceWorker.ready;

            // Request push subscription
            const subscription = await reg.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY),
            });

            // Send subscription to server
            await fetch('/api/notifications/subscribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    subscription: subscription.toJSON(),
                    userId: user?.id || null,
                }),
            });

            setSubscribed(true);
            setShow(false);
        } catch (err) {
            console.error('Push subscription failed:', err);
            // User likely denied permission
            if (Notification.permission === 'denied') {
                localStorage.setItem('push_prompt_dismissed', 'denied');
            }
        } finally {
            setLoading(false);
        }
    }

    function dismiss() {
        setShow(false);
        localStorage.setItem('push_prompt_dismissed', Date.now().toString());
    }

    if (!show || subscribed) return null;

    return (
        <div style={{
            position: 'fixed',
            bottom: '80px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: 'calc(100% - 32px)',
            maxWidth: '420px',
            background: 'linear-gradient(135deg, rgba(99,102,241,0.95) 0%, rgba(139,92,246,0.95) 100%)',
            borderRadius: '16px',
            padding: '20px',
            boxShadow: '0 8px 32px rgba(99,102,241,0.4)',
            zIndex: 1000,
            backdropFilter: 'blur(12px)',
            animation: 'slideUp 0.4s ease-out',
        }}>
            <style>{`
                @keyframes slideUp {
                    from { transform: translateX(-50%) translateY(100px); opacity: 0; }
                    to   { transform: translateX(-50%) translateY(0); opacity: 1; }
                }
            `}</style>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <span style={{ fontSize: '1.75rem', lineHeight: 1 }}>🔔</span>
                <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: '0.9375rem', color: '#fff', marginBottom: '4px' }}>
                        Stay on Track!
                    </div>
                    <p style={{ fontSize: '0.8125rem', color: 'rgba(255,255,255,0.85)', margin: 0, lineHeight: 1.4 }}>
                        Get daily study reminders and streak alerts so you never miss a day.
                    </p>
                </div>
            </div>
            <div style={{ display: 'flex', gap: '8px', marginTop: '14px' }}>
                <button
                    onClick={subscribe}
                    disabled={loading}
                    style={{
                        flex: 1,
                        padding: '10px',
                        border: 'none',
                        borderRadius: '10px',
                        background: '#fff',
                        color: '#6366f1',
                        fontWeight: 700,
                        fontSize: '0.875rem',
                        cursor: loading ? 'wait' : 'pointer',
                        opacity: loading ? 0.7 : 1,
                    }}
                >
                    {loading ? 'Enabling...' : 'Enable Notifications'}
                </button>
                <button
                    onClick={dismiss}
                    style={{
                        padding: '10px 16px',
                        border: '1px solid rgba(255,255,255,0.3)',
                        borderRadius: '10px',
                        background: 'transparent',
                        color: 'rgba(255,255,255,0.7)',
                        fontSize: '0.875rem',
                        cursor: 'pointer',
                    }}
                >
                    Later
                </button>
            </div>
        </div>
    );
}

// Helper: convert VAPID key
function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}
