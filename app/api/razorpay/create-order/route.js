import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { createServerSupabase } from '../../../../lib/supabase/server';

const PLANS = {
    monthly: { amount: 19900, currency: 'INR', description: 'SSC CGL AI Pro — Monthly' },
    yearly: { amount: 99900, currency: 'INR', description: 'SSC CGL AI Pro — Yearly' },
};

export async function POST(request) {
    try {
        const supabase = await createServerSupabase();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { plan_type } = await request.json();

        if (!PLANS[plan_type]) {
            return NextResponse.json({ error: 'Invalid plan type' }, { status: 400 });
        }

        const plan = PLANS[plan_type];

        const razorpay = new Razorpay({
            key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET,
        });

        const order = await razorpay.orders.create({
            amount: plan.amount,
            currency: plan.currency,
            receipt: `order_${user.id}_${Date.now()}`,
            notes: {
                user_id: user.id,
                plan_type,
            },
        });

        return NextResponse.json({
            order_id: order.id,
            amount: plan.amount,
            currency: plan.currency,
            key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
            description: plan.description,
        });
    } catch (error) {
        console.error('Create order error:', error);
        return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
    }
}
