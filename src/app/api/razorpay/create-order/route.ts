import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';

/**
 * @fileOverview Hardened Razorpay Order Node.
 * Ensures amount is in whole paise and receipt ID is under 40 chars.
 */

export async function POST(request: Request) {
  try {
    const { amount, planId } = await request.json();

    const key_id = process.env.RAZORPAY_KEY_ID;
    const key_secret = process.env.RAZORPAY_KEY_SECRET;

    if (!key_id || !key_secret) {
      return NextResponse.json({ error: 'Razorpay keys missing in environment.' }, { status: 500 });
    }

    const razorpay = new Razorpay({
      key_id: key_id,
      key_secret: key_secret,
    });

    // 1. Convert to whole integer paise (Razorpay requirement)
    const amountInPaise = Math.round(Number(amount) * 100);

    if (isNaN(amountInPaise) || amountInPaise < 100) {
      return NextResponse.json({ error: 'Invalid transaction amount.' }, { status: 400 });
    }

    // 2. Generate sanitized receipt (Strict < 40 chars, alphanumeric/underscore only)
    const receipt = `rcpt_${Date.now().toString().slice(-10)}`;

    const options = {
      amount: amountInPaise,
      currency: 'INR',
      receipt: receipt,
    };

    const order = await razorpay.orders.create(options);

    return NextResponse.json({
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
    });
  } catch (error: any) {
    console.error('[RAZORPAY_ORDER_ERROR]:', error);
    return NextResponse.json({ error: error.message || 'Order generation failed' }, { status: 500 });
  }
}
