import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

const CASHFREE_SECRET_KEY = process.env.CASHFREE_SECRET_KEY || '';

interface WebhookPayload {
  order_id: string;
  order_amount: number;
  order_currency: string;
  payment_id?: string;
  payment_status?: string;
  payment_method?: string;
  payment_time?: string;
  customer_id: string;
  signature: string;
}

/**
 * @fileOverview Cashfree Webhook Handler v1.5
 * FIXED: Enhanced signature verification and error handling
 */

function verifySignature(payload: any, signature: string): boolean {
  try {
    const { order_id, order_amount, order_currency, payment_status } = payload;
    const message = `${order_id}${order_amount}${order_currency}${payment_status || ''}`;
    const hmac = crypto
      .createHmac('sha256', CASHFREE_SECRET_KEY)
      .update(message)
      .digest('base64');
    return hmac === signature;
  } catch (error) {
    console.error('Signature verification error:', error);
    return false;
  }
}

export async function POST(req: NextRequest) {
  try {
    const body: WebhookPayload = await req.json();

    // Verify signature
    if (!verifySignature(body, body.signature)) {
      console.error('Invalid webhook signature');
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 403 }
      );
    }

    // Process payment based on status
    if (body.payment_status === 'SUCCESS') {
      console.log('Payment successful:', body.order_id);
      // Update user pass in Firestore
      return NextResponse.json({ status: 'success' });
    }

    if (body.payment_status === 'FAILED') {
      console.log('Payment failed:', body.order_id);
      return NextResponse.json({ status: 'failed' });
    }

    if (body.payment_status === 'USER_DROPPED') {
      console.log('User dropped payment:', body.order_id);
      return NextResponse.json({ status: 'dropped' });
    }

    return NextResponse.json({ status: 'received' });
  } catch (error: any) {
    console.error('Webhook processing error:', {
      message: error?.message,
      stack: error?.stack,
    });

    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
