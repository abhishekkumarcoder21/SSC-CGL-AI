import { NextResponse } from 'next/server';
import webpush from 'web-push';
import { createServerSupabase } from '../../../../lib/supabase/server';
import { supabaseAdmin } from '../../../../lib/supabase/admin';

webpush.setVapidDetails(
    `mailto:${process.env.VAPID_EMAIL}`,
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
);

// Notification templates
const TEMPLATES = {
    study_reminder: {
        title: '📚 Time to Study!',
        body: 'Your daily study session awaits. Consistency beats intensity — let\'s keep the streak going!',
        url: '/planner',
        tag: 'study-reminder',
    },
    streak_at_risk: {
        title: '🔥 Streak at Risk!',
        body: 'You haven\'t studied today. Open the app now to keep your streak alive!',
        url: '/dashboard',
        tag: 'streak-risk',
    },
    mock_reminder: {
        title: '📝 Mock Test Time',
        body: 'Take a mock test today to track your progress and find weak areas.',
        url: '/mock-test',
        tag: 'mock-reminder',
    },
    weekly_report: {
        title: '📊 Weekly Progress',
        body: 'Your weekly report is ready! Check your rankings and improvement trend.',
        url: '/progress',
        tag: 'weekly-report',
    },
};

export async function POST(request) {
    try {
        // Auth guard — only authenticated users can trigger notifications
        const supabase = await createServerSupabase();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { type, userId, customTitle, customBody } = await request.json();

        // Get notification content
        const template = TEMPLATES[type] || {};
        const notification = {
            title: customTitle || template.title || 'SSC CGL AI',
            body: customBody || template.body || 'You have a notification',
            url: template.url || '/',
            tag: template.tag || 'general',
        };

        // Get target subscriptions
        let query = supabaseAdmin
            .from('push_subscriptions')
            .select('*')
            .eq('active', true);

        if (userId) {
            query = query.eq('user_id', userId);
        }

        const { data: subscriptions, error } = await query;

        if (error) {
            console.error('Fetch subscriptions error:', error);
            return NextResponse.json({ error: 'Failed to fetch subscriptions' }, { status: 500 });
        }

        if (!subscriptions || subscriptions.length === 0) {
            return NextResponse.json({ sent: 0, message: 'No active subscriptions found' });
        }

        // Send to all active subscriptions
        let sent = 0;
        let failed = 0;
        const failedEndpoints = [];

        for (const sub of subscriptions) {
            const pushSubscription = {
                endpoint: sub.endpoint,
                keys: {
                    p256dh: sub.keys_p256dh,
                    auth: sub.keys_auth,
                },
            };

            try {
                await webpush.sendNotification(pushSubscription, JSON.stringify(notification));
                sent++;
            } catch (err) {
                failed++;
                // If subscription expired or invalid, mark inactive
                if (err.statusCode === 404 || err.statusCode === 410) {
                    failedEndpoints.push(sub.endpoint);
                }
            }
        }

        // Clean up expired subscriptions
        if (failedEndpoints.length > 0) {
            await supabaseAdmin
                .from('push_subscriptions')
                .update({ active: false })
                .in('endpoint', failedEndpoints);
        }

        return NextResponse.json({ sent, failed, total: subscriptions.length });
    } catch (error) {
        console.error('Send notification error:', error);
        return NextResponse.json({ error: 'Failed to send notifications' }, { status: 500 });
    }
}
