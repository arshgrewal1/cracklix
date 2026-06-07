
import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';

/**
 * @fileOverview Production-Grade Razorpay Order Node v9.0.
 * Hardened: Strict integer paise conversion and 20-char receipt validation.
 */

export async function POST(request: Request) {
  try {
    const { amount } = await request.json();

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

    // 1. Strict Integer Conversion (Paise Protocol)
    const amountInPaise = Math.round(Number(amount) * 100);

    if (isNaN(amountInPaise) || amountInPaise < 100) {
      return NextResponse.json({ error: 'Minimum transaction amount is ₹1.' }, { status: 400 });
    }

    // 2. Short Alphanumeric Receipt (Strict < 40 chars)
    const receipt = `rcpt_${Date.now().toString().slice(-12)}`;

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
