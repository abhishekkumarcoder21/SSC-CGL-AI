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

        // Check if stats row already exists
        const { data: existing } = await supabaseAdmin
            .from('user_stats')
            .select('user_id')
            .eq('user_id', user.id)
            .single();

        if (!existing) {
            await supabaseAdmin.from('user_stats').insert({
                user_id: user.id,
                total_mocks_taken: 0,
                avg_score: 0,
                best_score: 0,
                current_streak: 0,
                longest_streak: 0,
                active_days_this_week: 0,
                topics_covered: 0,
            });
        }

        return NextResponse.json({ ok: true });
    } catch (error) {
        console.error('Init stats error:', error);
        return NextResponse.json({ error: 'Failed to init stats' }, { status: 500 });
    }
}
