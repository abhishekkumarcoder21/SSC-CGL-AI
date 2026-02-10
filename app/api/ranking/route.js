import { NextResponse } from 'next/server';

// Percentile buckets — deterministic, based on score
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

function computeConsistencyRank(stats) {
    const { last7DaysCompletionAvg, activeDaysThisWeek, currentStreak } = stats;

    const score =
        (last7DaysCompletionAvg * 50) +
        ((activeDaysThisWeek / 7) * 30) +
        ((Math.min(currentStreak, 30) / 30) * 20);

    const bucket = getBucket(score);

    return {
        score: Math.round(score),
        percentile: bucket.percentile,
        label: `Top ${100 - bucket.percentile}% among active users on this platform`,
    };
}

function computePerformanceRank(mocks) {
    if (!mocks || mocks.length < 2) {
        return {
            score: null,
            percentile: null,
            label: 'Take 2+ mocks to see your performance rank',
            locked: true,
        };
    }

    const lastTwo = mocks.slice(-2);
    const improvement = lastTwo[1].total - lastTwo[0].total;
    const improvementPct = (improvement / Math.max(lastTwo[0].total, 1)) * 100;

    let score;
    if (improvementPct > 10) score = 90;
    else if (improvementPct > 5) score = 75;
    else if (improvementPct > 0) score = 60;
    else if (improvementPct > -5) score = 40;
    else score = 25;

    const bucket = getBucket(score);

    return {
        score,
        percentile: bucket.percentile,
        label: `Your improvement rate is in the top ${100 - bucket.percentile}% among active users on this platform`,
        trend: improvementPct > 0 ? 'improving' : improvementPct < 0 ? 'declining' : 'flat',
    };
}

export async function POST(request) {
    try {
        const body = await request.json();
        const { weeklyStats, mocks } = body;

        const consistency = computeConsistencyRank(weeklyStats || {
            last7DaysCompletionAvg: 0,
            activeDaysThisWeek: 0,
            currentStreak: 0,
        });

        const performance = computePerformanceRank(mocks);

        return NextResponse.json({
            consistency,
            performance,
            computedDate: new Date().toISOString().split('T')[0],
        });
    } catch (error) {
        return NextResponse.json({ error: 'Ranking failed' }, { status: 500 });
    }
}
