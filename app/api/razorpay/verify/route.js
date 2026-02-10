import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { createServerSupabase } from '../../../../lib/supabase/server';
import { supabaseAdmin } from '../../../../lib/supabase/admin';

export async function POST(request) {
    try {
        const supabase = await createServerSupabase();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            plan_type,
        } = await request.json();

        // Verify signature
        const body = razorpay_order_id + '|' + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(body)
            .digest('hex');

        if (expectedSignature !== razorpay_signature) {
            return NextResponse.json({ error: 'Invalid payment signature' }, { status: 400 });
        }

        // Calculate expiry
        const now = new Date();
        const expiresAt = new Date(now);
        if (plan_type === 'yearly') {
            expiresAt.setFullYear(expiresAt.getFullYear() + 1);
        } else {
            expiresAt.setDate(expiresAt.getDate() + 30);
        }

        const amountPaise = plan_type === 'yearly' ? 99900 : 19900;

        // Deactivate any existing active subscriptions
        await supabaseAdmin
            .from('subscriptions')
            .update({ status: 'expired' })
            .eq('user_id', user.id)
            .eq('status', 'active');

        // Create new subscription
        const { error: subError } = await supabaseAdmin
            .from('subscriptions')
            .insert({
                user_id: user.id,
                plan_type,
                status: 'active',
                amount_paise: amountPaise,
                started_at: now.toISOString(),
                expires_at: expiresAt.toISOString(),
                payment_gateway: 'razorpay',
                gateway_subscription_id: razorpay_order_id,
                gateway_payment_id: razorpay_payment_id,
            });

        if (subError) {
            console.error('Subscription insert error:', subError);
            return NextResponse.json({ error: 'Failed to save subscription' }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            plan_type,
            expires_at: expiresAt.toISOString(),
        });
    } catch (error) {
        console.error('Verify payment error:', error);
        return NextResponse.json({ error: 'Payment verification failed' }, { status: 500 });
    }
}
