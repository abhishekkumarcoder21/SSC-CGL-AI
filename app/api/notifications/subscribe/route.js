import { NextResponse } from 'next/server';
import { createServerSupabase } from '../../../../lib/supabase/server';
import { supabaseAdmin } from '../../../../lib/supabase/admin';

export async function POST(request) {
    try {
        // Derive userId from authenticated session — never trust client-supplied userId
        const supabase = await createServerSupabase();
        const { data: { user } } = await supabase.auth.getUser();

        const { subscription } = await request.json();

        if (!subscription || !subscription.endpoint) {
            return NextResponse.json({ error: 'Valid push subscription required' }, { status: 400 });
        }

        // Upsert subscription — update if endpoint already exists
        const { error } = await supabaseAdmin
            .from('push_subscriptions')
            .upsert({
                user_id: user?.id || null,
                endpoint: subscription.endpoint,
                keys_p256dh: subscription.keys?.p256dh || '',
                keys_auth: subscription.keys?.auth || '',
                subscribed_at: new Date().toISOString(),
                active: true,
            }, { onConflict: 'endpoint' });

        if (error) {
            console.error('Push subscribe error:', error);
            return NextResponse.json({ error: 'Failed to save subscription' }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Subscribe error:', error);
        return NextResponse.json({ error: 'Subscription failed' }, { status: 500 });
    }
}

// DELETE — unsubscribe
export async function DELETE(request) {
    try {
        const { endpoint } = await request.json();

        if (!endpoint) {
            return NextResponse.json({ error: 'Endpoint required' }, { status: 400 });
        }

        await supabaseAdmin
            .from('push_subscriptions')
            .update({ active: false })
            .eq('endpoint', endpoint);

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Unsubscribe failed' }, { status: 500 });
    }
}
