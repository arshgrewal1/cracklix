import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';

/**
 * @fileOverview Backend Node for Razorpay Order Creation.
 * FIXED: Hardened credential check and receipt length validation.
 */

export async function POST(request: Request) {
  try {
    const { amount, planId } = await request.json();

    const key_id = process.env.RAZORPAY_KEY_ID;
    const key_secret = process.env.RAZORPAY_KEY_SECRET;

    if (!key_id || !key_secret) {
      console.error('[RAZORPAY_CONFIG_ERR]: Missing API Keys in environment.');
      return NextResponse.json({ error: 'Gateway configuration error: Keys missing' }, { status: 500 });
    }

    const razorpay = new Razorpay({
      key_id: key_id,
      key_secret: key_secret,
    });

    // Razorpay requires amount in paise (1 INR = 100 paise)
    // Minimum amount must be 1 INR (100 paise)
    const amountInPaise = Math.round(Number(amount) * 100);

    if (isNaN(amountInPaise) || amountInPaise < 100) {
      return NextResponse.json({ error: 'Invalid amount (Minimum ₹1 required)' }, { status: 400 });
    }

    // Receipt ID must be max 40 chars
    const receiptId = `rcpt_${planId.slice(0, 10)}_${Date.now()}`.slice(0, 40);

    const options = {
      amount: amountInPaise,
      currency: 'INR',
      receipt: receiptId,
    };

    const order = await razorpay.orders.create(options);

    return NextResponse.json({
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
    });
  } catch (error: any) {
    console.error('[RAZORPAY_ORDER_ERR]:', error);
    return NextResponse.json({ 
      error: error.message || 'Order generation failed',
      details: error.description || 'Internal Gateway Error'
    }, { status: 500 });
  }
}
