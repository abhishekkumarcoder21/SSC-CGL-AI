import { NextResponse } from 'next/server';
import { createServerSupabase } from '../../../lib/supabase/server';
import { supabaseAdmin } from '../../../lib/supabase/admin';

// One-time migration of localStorage data to Supabase
export async function POST(request) {
    try {
        const supabase = await createServerSupabase();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();

        // Check if already migrated
        const { data: existing } = await supabase
            .from('user_profile')
            .select('id')
            .eq('id', user.id)
            .single();

        if (existing) {
            return NextResponse.json({ status: 'already_migrated' });
        }

        // 1. Create profile
        const profile = body.profile || {};
        await supabase.from('user_profile').insert({
            id: user.id,
            phone: user.phone || '',
            display_name: profile.name || null,
            exam: profile.exam || 'SSC CGL',
            attempt_year: profile.attemptYear || 2026,
            daily_hours: profile.dailyHours || 4,
            strong_subjects: profile.strongSubjects || [],
            weak_subjects: profile.weakSubjects || [],
            onboarding_done: true,
        });

        // 2. Insert past attempts
        const attempts = body.testAttempts || [];
        if (attempts.length > 0) {
            const rows = attempts.map(a => ({
                user_id: user.id,
                paper_id: a.paperId || 'unknown',
                paper_title: a.paperTitle || 'Unknown Test',
                total_score: a.score || 0,
                max_marks: a.maxMarks || 200,
                section_scores: a.sections || {},
                cognitive_breakdown: a.cognitiveBreakdown || {},
                weak_topics: a.weakTopics || [],
            }));
            await supabase.from('diagnostic_attempts').insert(rows);
        }

        // 3. Init stats (via service_role)
        await supabaseAdmin.from('user_stats').insert({
            user_id: user.id,
            total_mocks_taken: attempts.length,
            current_streak: body.currentStreak || 0,
            last_active_date: body.lastActiveDate || null,
        });

        return NextResponse.json({ status: 'migrated' });
    } catch (error) {
        console.error('Migration error:', error);
        return NextResponse.json({ error: 'Migration failed' }, { status: 500 });
    }
}
