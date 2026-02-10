'use client';

import { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext';
import styles from './page.module.css';

// Generate mock leaderboard data
function generateLeaderboard(userProfile) {
    const names = [
        'Rahul Sharma', 'Priya Verma', 'Amit Kumar', 'Sneha Gupta', 'Vikram Singh',
        'Anjali Patel', 'Rohit Mishra', 'Pooja Yadav', 'Arjun Das', 'Kavita Joshi',
        'Suresh Reddy', 'Deepika Nair', 'Manish Tiwari', 'Ritu Chauhan', 'Sanjay Mehta',
        'Nisha Agarwal', 'Rajesh Pandey', 'Meena Iyer', 'Prakash Dubey', 'Swati Kapoor',
    ];

    const users = names.map((name, i) => ({
        rank: i + 1,
        name,
        score: Math.max(200 - (i * 8) + Math.floor(Math.random() * 10), 60),
        streak: Math.max(30 - i + Math.floor(Math.random() * 5), 1),
        mocks: Math.max(25 - i + Math.floor(Math.random() * 3), 2),
        isUser: false,
    }));

    // Insert user profile at a random rank
    if (userProfile?.name) {
        const userRank = 8 + Math.floor(Math.random() * 5);
        users.splice(userRank, 0, {
            rank: userRank + 1,
            name: userProfile.name || 'You',
            score: 145 + Math.floor(Math.random() * 20),
            streak: 12,
            mocks: 8,
            isUser: true,
        });
        // Re-rank
        users.forEach((u, i) => { u.rank = i + 1; });
    }

    return users.slice(0, 20);
}

export default function LeaderboardPage() {
    const { profile } = useUser();
    const [tab, setTab] = useState('weekly');
    const [leaderboard, setLeaderboard] = useState([]);

    useEffect(() => {
        setLeaderboard(generateLeaderboard(profile));
    }, [profile, tab]);

    const medalEmojis = ['🥇', '🥈', '🥉'];

    return (
        <div className="fade-in">
            <h1 style={{ marginBottom: '4px' }}>🏅 Leaderboard</h1>
            <p className="text-sm text-muted" style={{ marginBottom: '16px' }}>
                See how you rank among other SSC CGL aspirants.
            </p>

            {/* Tab Toggle */}
            <div className={styles.tabRow}>
                {['weekly', 'monthly', 'allTime'].map(t => (
                    <button
                        key={t}
                        className={`${styles.tabBtn} ${tab === t ? styles.tabActive : ''}`}
                        onClick={() => setTab(t)}
                    >
                        {t === 'weekly' ? '📅 Weekly' : t === 'monthly' ? '📆 Monthly' : '🏆 All Time'}
                    </button>
                ))}
            </div>

            {/* Top 3 */}
            <div className={styles.topThree}>
                {leaderboard.slice(0, 3).map((u, i) => (
                    <div key={u.rank} className={`${styles.topCard} ${i === 0 ? styles.gold : i === 1 ? styles.silver : styles.bronze}`}>
                        <div className={styles.topMedal}>{medalEmojis[i]}</div>
                        <div className={styles.topName}>{u.isUser ? '⭐ You' : u.name.split(' ')[0]}</div>
                        <div className={styles.topScore}>{u.score}</div>
                        <div className="text-xs text-muted">points</div>
                    </div>
                ))}
            </div>

            {/* Rest of leaderboard */}
            <div className={styles.leaderList}>
                {leaderboard.slice(3).map((u) => (
                    <div key={u.rank} className={`${styles.leaderRow} ${u.isUser ? styles.userRow : ''}`}>
                        <div className={styles.leaderRank}>#{u.rank}</div>
                        <div className={styles.leaderInfo}>
                            <div className={styles.leaderName}>
                                {u.isUser ? '⭐ You' : u.name}
                            </div>
                            <div className={styles.leaderMeta}>
                                <span className="text-xs text-muted">🔥 {u.streak}d</span>
                                <span className="text-xs text-muted">📝 {u.mocks} mocks</span>
                            </div>
                        </div>
                        <div className={styles.leaderScore}>{u.score}</div>
                    </div>
                ))}
            </div>
        </div>
    );
}
