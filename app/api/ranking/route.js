import { NextResponse } from 'next/server';
import { createServerSupabase } from '../../../lib/supabase/server';
import { supabaseAdmin } from '../../../lib/supabase/admin';

// Compute real percentiles by comparing user's stats against all users
export async function POST(request) {
    try {
        const supabase = await createServerSupabase();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            // Fallback for unauthenticated: use client-sent stats with deterministic buckets
            return handleLocalRanking(request);
        }

        // Get current user's stats
        const { data: myStats } = await supabaseAdmin
            .from('user_stats')
            .select('*')
            .eq('user_id', user.id)
            .single();

        if (!myStats) {
            return NextResponse.json({
                consistency: { score: 0, percentile: 20, label: 'Complete onboarding and take a mock to see your ranking' },
                performance: { score: null, percentile: null, label: 'Take 2+ mocks to see your performance rank', locked: true },
                computedDate: new Date().toISOString().split('T')[0],
            });
        }

        // Get ALL users' stats for comparison
        const { data: allStats } = await supabaseAdmin
            .from('user_stats')
            .select('current_streak, active_days_this_week, avg_score, best_score, total_mocks_taken');

        const totalUsers = allStats?.length || 1;

        // --- Consistency Ranking ---
        const myConsistencyScore = computeConsistencyScore(myStats);
        const consistencyScores = (allStats || []).map(s => computeConsistencyScore(s));
        const usersBelow = consistencyScores.filter(s => s < myConsistencyScore).length;
        const consistencyPercentile = Math.round((usersBelow / totalUsers) * 100);

        const consistency = {
            score: Math.round(myConsistencyScore),
            percentile: Math.max(consistencyPercentile, 5), // Minimum 5th percentile
            label: getConsistencyLabel(consistencyPercentile),
        };

        // --- Performance Ranking ---
        let performance;
        if (myStats.total_mocks_taken < 2) {
            performance = {
                score: null,
                percentile: null,
                label: 'Take 2+ mocks to see your performance rank',
                locked: true,
            };
        } else {
            const myPerfScore = computePerformanceScore(myStats);
            const perfScores = (allStats || [])
                .filter(s => s.total_mocks_taken >= 2)
                .map(s => computePerformanceScore(s));

            const perfUsersBelow = perfScores.filter(s => s < myPerfScore).length;
            const perfTotal = perfScores.length || 1;
            const perfPercentile = Math.round((perfUsersBelow / perfTotal) * 100);

            // Determine trend from user's last 2 mock scores
            const { data: recentAttempts } = await supabaseAdmin
                .from('diagnostic_attempts')
                .select('total_score')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })
                .limit(2);

            let trend = 'flat';
            if (recentAttempts && recentAttempts.length >= 2) {
                const diff = Number(recentAttempts[0].total_score) - Number(recentAttempts[1].total_score);
                trend = diff > 5 ? 'improving' : diff < -5 ? 'declining' : 'flat';
            }

            performance = {
                score: Math.round(myPerfScore),
                percentile: Math.max(perfPercentile, 5),
                label: `Your improvement rate is in the top ${Math.max(100 - perfPercentile, 5)}% among active users`,
                trend,
            };
        }

        // Update percentiles in user_stats for caching
        await supabaseAdmin.from('user_stats').update({
            consistency_percentile: consistency.percentile,
            performance_percentile: performance.percentile || 0,
        }).eq('user_id', user.id);

        return NextResponse.json({
            consistency,
            performance,
            totalUsers,
            computedDate: new Date().toISOString().split('T')[0],
        });
    } catch (error) {
        console.error('Ranking error:', error);
        // Fallback to local ranking
        return handleLocalRanking(request);
    }
}

// --- Score computation helpers ---

function computeConsistencyScore(stats) {
    const streakScore = Math.min((stats.current_streak || 0) / 30, 1) * 40;
    const activeDaysScore = ((stats.active_days_this_week || 0) / 7) * 35;
    const mocksScore = Math.min((stats.total_mocks_taken || 0) / 10, 1) * 25;
    return streakScore + activeDaysScore + mocksScore;
}

function computePerformanceScore(stats) {
    const avgScore = ((stats.avg_score || 0) / 200) * 50;
    const bestScore = ((stats.best_score || 0) / 200) * 30;
    const mocksVolume = Math.min((stats.total_mocks_taken || 0) / 20, 1) * 20;
    return avgScore + bestScore + mocksVolume;
}

function getConsistencyLabel(percentile) {
    if (percentile >= 90) return 'Top 10% — Outstanding dedication!';
    if (percentile >= 75) return 'Top 25% — Very consistent!';
    if (percentile >= 50) return 'Top 50% — Above average consistency';
    if (percentile >= 25) return 'Top 75% — Room for improvement';
    return 'Keep studying daily to climb up!';
}

// --- Fallback for unauthenticated users ---

const BUCKETS = [
    { min: 85, percentile: 95 },
    { min: 70, percentile: 80 },
    { min: 55, percentile: 65 },
    { min: 40, percentile: 50 },
    { min: 25, percentile: 35 },
    { min: 0, percentile: 20 },
];

function getBucket(score) {
    return BUCKETS.find(b => score >= b.min) || BUCKETS[BUCKETS.length - 1];
}

async function handleLocalRanking(request) {
    try {
        const body = await request.json();
        const { weeklyStats, mocks } = body;

        const stats = weeklyStats || { last7DaysCompletionAvg: 0, activeDaysThisWeek: 0, currentStreak: 0 };
        const score =
            (stats.last7DaysCompletionAvg * 50) +
            ((stats.activeDaysThisWeek / 7) * 30) +
            ((Math.min(stats.currentStreak, 30) / 30) * 20);

        const bucket = getBucket(score);

        const consistency = {
            score: Math.round(score),
            percentile: bucket.percentile,
            label: `Top ${100 - bucket.percentile}% among active users on this platform`,
        };

        let performance = {
            score: null,
            percentile: null,
            label: 'Take 2+ mocks to see your performance rank',
            locked: true,
        };

        if (mocks && mocks.length >= 2) {
            const lastTwo = mocks.slice(-2);
            const improvement = lastTwo[1].total - lastTwo[0].total;
            const improvementPct = (improvement / Math.max(lastTwo[0].total, 1)) * 100;
            let pScore = improvementPct > 10 ? 90 : improvementPct > 5 ? 75 : improvementPct > 0 ? 60 : improvementPct > -5 ? 40 : 25;
            const pBucket = getBucket(pScore);
            performance = {
                score: pScore,
                percentile: pBucket.percentile,
                label: `Your improvement rate is in the top ${100 - pBucket.percentile}%`,
                trend: improvementPct > 0 ? 'improving' : improvementPct < 0 ? 'declining' : 'flat',
            };
        }

        return NextResponse.json({
            consistency,
            performance,
            computedDate: new Date().toISOString().split('T')[0],
        });
    } catch {
        return NextResponse.json({ error: 'Ranking failed' }, { status: 500 });
    }
}
