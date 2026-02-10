'use client';

import { useUser } from '../context/UserContext';

export default function StreakWidget() {
    const { currentStreak, lastActiveDate } = useUser();

    const today = new Date().toISOString().split('T')[0];
    const isActiveToday = lastActiveDate === today;

    // Generate last 7 days for visualization
    const days = [];
    for (let i = 6; i >= 0; i--) {
        const d = new Date(Date.now() - i * 86400000);
        const dateStr = d.toISOString().split('T')[0];
        const dayLabel = d.toLocaleDateString('en-IN', { weekday: 'narrow' });
        const isToday = i === 0;

        // Approximate which days were active based on streak count
        let active = false;
        if (currentStreak > 0 && lastActiveDate) {
            const lastActive = new Date(lastActiveDate);
            const thisDay = new Date(dateStr);
            const daysDiff = Math.round((lastActive - thisDay) / 86400000);
            active = daysDiff >= 0 && daysDiff < currentStreak;
        }

        days.push({ dateStr, dayLabel, isToday, active });
    }

    // Streak tier/label
    const getStreakTier = (streak) => {
        if (streak >= 30) return { label: 'Unstoppable!', emoji: '🏆', color: 'gold' };
        if (streak >= 14) return { label: 'On Fire!', emoji: '🔥', color: 'orange' };
        if (streak >= 7) return { label: 'Building Momentum', emoji: '⚡', color: 'accent' };
        if (streak >= 3) return { label: 'Getting Started', emoji: '🌱', color: 'green' };
        if (streak >= 1) return { label: 'Day ' + streak, emoji: '✨', color: 'accent' };
        return { label: 'Start Today!', emoji: '💪', color: 'muted' };
    };

    const tier = getStreakTier(currentStreak);

    return (
        <div className="streak-widget">
            <div className="streak-widget-header">
                <div className="streak-widget-count">
                    <span className="streak-emoji">{tier.emoji}</span>
                    <span className="streak-number">{currentStreak}</span>
                    <span className="streak-label">day{currentStreak !== 1 ? 's' : ''} streak</span>
                </div>
                <div className={`streak-tier streak-tier-${tier.color}`}>{tier.label}</div>
            </div>

            <div className="streak-days">
                {days.map((day, i) => (
                    <div key={i} className="streak-day-col">
                        <div
                            className={`streak-dot ${day.active ? 'streak-dot-active' : ''} ${day.isToday ? 'streak-dot-today' : ''}`}
                        >
                            {day.active && '✓'}
                        </div>
                        <span className={`streak-day-label ${day.isToday ? 'streak-day-today' : ''}`}>
                            {day.dayLabel}
                        </span>
                    </div>
                ))}
            </div>

            {!isActiveToday && currentStreak > 0 && (
                <div className="streak-warning">
                    ⚠️ Complete a task today to keep your streak!
                </div>
            )}
        </div>
    );
}
