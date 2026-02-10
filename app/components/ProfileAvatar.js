'use client';

import { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext';
import { useRouter } from 'next/navigation';

export default function ProfileAvatar() {
    const { profile, currentStreak } = useUser();
    const router = useRouter();
    const [avatar, setAvatar] = useState(null);

    useEffect(() => {
        const saved = localStorage.getItem('ssc_avatar');
        if (saved) setAvatar(saved);

        // Listen for avatar changes
        const handleStorage = (e) => {
            if (e.key === 'ssc_avatar') setAvatar(e.newValue);
        };
        window.addEventListener('storage', handleStorage);
        return () => window.removeEventListener('storage', handleStorage);
    }, []);

    const firstName = profile?.first_name || profile?.display_name?.split(' ')[0] || '';
    const lastName = profile?.last_name || profile?.display_name?.split(' ').slice(1).join(' ') || '';
    const initials = firstName && lastName
        ? `${firstName[0]}${lastName[0]}`.toUpperCase()
        : firstName ? firstName[0].toUpperCase()
            : '👤';

    return (
        <div className="header-right-group">
            {/* Streak badge */}
            {currentStreak > 0 && (
                <div className="header-streak" title={`${currentStreak} day streak!`}>
                    <span className="streak-fire">🔥</span>
                    <span className="streak-count">{currentStreak}</span>
                </div>
            )}

            {/* Profile avatar */}
            <button
                className="header-avatar"
                onClick={() => router.push('/profile')}
                aria-label="Go to profile"
            >
                {avatar ? (
                    <img src={avatar} alt="Profile" className="header-avatar-img" />
                ) : (
                    <span className="header-avatar-initials">{initials}</span>
                )}
            </button>
        </div>
    );
}
