
import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { firestore } from '@/firebase/app';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';

/**
 * @fileOverview Razorpay Signature Verification Node.
 * FIXED: Securely logs transactions; status update occurs on client to follow SDK constraints.
 */

export async function POST(req: Request) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, userId, planId } = await req.json();
    const key_secret = process.env.RAZORPAY_KEY_SECRET;

    if (!key_secret) {
      if (process.env.NODE_ENV === 'development' && razorpay_order_id?.startsWith('order_mock')) {
        return NextResponse.json({ success: true, mock: true });
      }
      return NextResponse.json({ error: 'Security key missing' }, { status: 500 });
    }

    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', key_secret)
      .update(body.toString())
      .digest('hex');

    if (expectedSignature === razorpay_signature) {
      // Log to Ledger
      await addDoc(collection(firestore, "payment_requests"), {
        userId,
        orderId: razorpay_order_id,
        paymentId: razorpay_payment_id,
        planId,
        status: 'APPROVED',
        gateway: 'RAZORPAY',
        verified: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ success: false, reason: "Signature mismatch" }, { status: 400 });
    }
  } catch (error: any) {
    console.error("[RAZORPAY_VERIFY_ERROR]", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
