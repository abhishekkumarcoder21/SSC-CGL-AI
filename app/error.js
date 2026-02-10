'use client';

import { useEffect } from 'react';

export default function Error({ error, reset }) {
    useEffect(() => {
        console.error('App error:', error);
    }, [error]);

    return (
        <div className="fade-in" style={{ textAlign: 'center', padding: '60px 20px' }}>
            <div style={{ fontSize: '3rem', marginBottom: '16px' }}>⚠️</div>
            <h2 style={{ marginBottom: '8px' }}>Something went wrong</h2>
            <p className="text-sm text-muted" style={{ marginBottom: '24px' }}>
                An unexpected error occurred. Please try again.
            </p>
            <button className="btn btn-primary" onClick={() => reset()}>
                Try Again
            </button>
        </div>
    );
}
