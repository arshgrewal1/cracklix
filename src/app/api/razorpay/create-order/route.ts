import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';

/**
 * @fileOverview Production-Grade Razorpay Order Node v15.0.
 * Hardened: Strict integer paise conversion and short receipt ID protocol.
 */

export async function POST(request: Request) {
  try {
    const { amount } = await request.json();

    const key_id = process.env.RAZORPAY_KEY_ID || 'rzp_test_Synv8cGJNAB23X';
    const key_secret = process.env.RAZORPAY_KEY_SECRET || 'l2sDZOg2Ypc6QbIlDAivUDfc';

    if (!key_id || !key_secret) {
      return NextResponse.json({ error: 'Gateway credentials missing in registry.' }, { status: 500 });
    }

    const razorpay = new Razorpay({
      key_id: key_id,
      key_secret: key_secret,
    });

    // 1. Strict Integer Conversion (Razorpay Paise Protocol)
    const amountInPaise = Math.round(Number(amount) * 100);

    if (isNaN(amountInPaise) || amountInPaise < 100) {
      return NextResponse.json({ error: 'Minimum transaction node is ₹1.' }, { status: 400 });
    }

    // 2. Short Receipt Protocol (< 20 chars) for high compatibility
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
