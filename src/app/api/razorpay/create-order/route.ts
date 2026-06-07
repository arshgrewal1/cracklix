
import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';

/**
 * @fileOverview Backend Node for Razorpay Order Creation.
 */

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || '',
  key_secret: process.env.RAZORPAY_KEY_SECRET || '',
});

export async function POST(request: Request) {
  try {
    const { amount, planId } = await request.json();

    if (!amount || amount < 1) {
      return NextResponse.json({ error: 'Invalid amount node' }, { status: 400 });
    }

    // Razorpay expects amount in paise (e.g. 100 INR = 10000 paise)
    const options = {
      amount: Math.round(amount * 100), 
      currency: 'INR',
      receipt: `receipt_${planId}_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    return NextResponse.json({
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
    });
  } catch (error: any) {
    console.error('[RAZORPAY_ORDER_ERR]:', error);
    return NextResponse.json({ error: error.message || 'Order generation failed' }, { status: 500 });
  }
}
