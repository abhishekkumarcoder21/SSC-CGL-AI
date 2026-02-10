import { NextResponse } from 'next/server';
import { createServerSupabase } from '../../../lib/supabase/server';
import { supabaseAdmin } from '../../../lib/supabase/admin';

export async function POST() {
    try {
        const supabase = await createServerSupabase();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get all attempts for this user
        const { data: attempts } = await supabaseAdmin
            .from('diagnostic_attempts')
            .select('total_score, max_marks, section_scores, created_at')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

        if (!attempts || attempts.length === 0) {
            return NextResponse.json({ ok: true, message: 'No attempts to compute stats from' });
        }

        const totalMocks = attempts.length;
        const avgScore = attempts.reduce((sum, a) => sum + Number(a.total_score), 0) / totalMocks;
        const bestScore = Math.max(...attempts.map(a => Number(a.total_score)));
        const lastScore = Number(attempts[0].total_score);
        const lastActive = attempts[0].created_at.split('T')[0];

        // Compute section averages
        const sectionTotals = { qa: 0, gir: 0, eng: 0, gk: 0 };
        const sectionCounts = { qa: 0, gir: 0, eng: 0, gk: 0 };

        attempts.forEach(a => {
            if (a.section_scores && typeof a.section_scores === 'object') {
                Object.entries(a.section_scores).forEach(([key, val]) => {
                    if (Object.hasOwn(sectionTotals, key)) {
                        sectionTotals[key] += Number(val) || 0;
                        sectionCounts[key]++;
                    }
                });
            }
        });

        const sectionAverages = {};
        Object.keys(sectionTotals).forEach(key => {
            sectionAverages[key] = sectionCounts[key] > 0
                ? Math.round((sectionTotals[key] / sectionCounts[key]) * 100) / 100
                : 0;
        });

        // Compute active days this week
        const now = new Date();
        const weekAgo = new Date(now);
        weekAgo.setDate(weekAgo.getDate() - 7);
        const weekAgoStr = weekAgo.toISOString().split('T')[0];

        const uniqueDates = new Set(
            attempts
                .map(a => a.created_at.split('T')[0])
                .filter(d => d >= weekAgoStr)
        );
        const activeDaysThisWeek = uniqueDates.size;

        // Compute streak
        const allDates = [...new Set(attempts.map(a => a.created_at.split('T')[0]))].sort().reverse();
        let currentStreak = 0;
        const today = new Date().toISOString().split('T')[0];
        let checkDate = new Date(today);

        for (let i = 0; i < 365; i++) {
            const dateStr = checkDate.toISOString().split('T')[0];
            if (allDates.includes(dateStr)) {
                currentStreak++;
                checkDate.setDate(checkDate.getDate() - 1);
            } else if (i === 0) {
                // Today not active yet, check from yesterday
                checkDate.setDate(checkDate.getDate() - 1);
            } else {
                break;
            }
        }

        // Get existing longest streak
        const { data: existingStats } = await supabaseAdmin
            .from('user_stats')
            .select('longest_streak')
            .eq('user_id', user.id)
            .single();

        const longestStreak = Math.max(currentStreak, existingStats?.longest_streak || 0);

        await supabaseAdmin.from('user_stats').upsert({
            user_id: user.id,
            total_mocks_taken: totalMocks,
            avg_score: Math.round(avgScore * 100) / 100,
            best_score: bestScore,
            last_mock_score: lastScore,
            last_active_date: lastActive,
            current_streak: currentStreak,
            longest_streak: longestStreak,
            active_days_this_week: activeDaysThisWeek,
            section_averages: sectionAverages,
        });

        return NextResponse.json({ ok: true, stats: { totalMocks, avgScore, bestScore, currentStreak, activeDaysThisWeek } });
    } catch (error) {
        console.error('Update stats error:', error);
        return NextResponse.json({ error: 'Failed to update stats' }, { status: 500 });
    }
}
