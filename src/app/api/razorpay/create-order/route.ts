
import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';

/**
 * @fileOverview Production-Grade Razorpay Order Node v7.0.
 * Hardened: Strict integer paise conversion and short receipt validation.
 */

export async function POST(request: Request) {
  try {
    const { amount, planId } = await request.json();

    const key_id = process.env.RAZORPAY_KEY_ID;
    const key_secret = process.env.RAZORPAY_KEY_SECRET;

    if (!key_id || !key_secret) {
      console.error('[GATEWAY_ERROR]: Credentials missing in registry.');
      return NextResponse.json({ error: 'Gateway configuration node is offline.' }, { status: 500 });
    }

    const razorpay = new Razorpay({
      key_id: key_id,
      key_secret: key_secret,
    });

    // 1. Strict Integer Conversion (Razorpay Protocol requires whole paise)
    const amountInPaise = Math.round(Number(amount) * 100);

    if (isNaN(amountInPaise) || amountInPaise < 100) {
      return NextResponse.json({ error: 'Minimum transaction amount is ₹1.' }, { status: 400 });
    }

    // 2. Short Alphanumeric Receipt (Razorpay Max Limit is 40 characters)
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
      currency: 'INR',
      key_id: key_id
    });
  } catch (error: any) {
    console.error('[RAZORPAY_ORDER_FAILURE]:', error);
    return NextResponse.json({ error: error.message || 'Order generation failed.' }, { status: 500 });
  }
}
