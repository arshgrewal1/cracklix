import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { firestore } from '@/firebase/app';
import { doc, getDoc, updateDoc, serverTimestamp, addDoc, collection } from 'firebase/firestore';

/**
 * @fileOverview Razorpay Signature Verification and Pass Activation.
 */

export async function POST(req: Request) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, userId, planId } = await req.json();
    const key_secret = process.env.RAZORPAY_KEY_SECRET;

    if (!key_secret) {
      return NextResponse.json({ error: 'Security key missing' }, { status: 500 });
    }

    // Validate Gateway Signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', key_secret)
      .update(body.toString())
      .digest('hex');

    if (expectedSignature === razorpay_signature) {
      // 1. Retrieve Plan Metadata
      const planSnap = await getDoc(doc(firestore, "passes", planId));
      if (!planSnap.exists()) throw new Error("Plan not found in registry");
      const planData = planSnap.data();

      const now = new Date();
      const expiry = new Date();
      expiry.setDate(now.getDate() + (planData.durationDays || 30));

      // 2. Synchronize User Pass Status
      const userRef = doc(firestore, "users", userId);
      await updateDoc(userRef, {
        pass: {
          active: true,
          plan: planData.id?.toUpperCase() || 'ELITE',
          purchaseDate: now.toISOString(),
          expiryDate: expiry.toISOString(),
          freePassClaimed: false
        },
        passStatus: 'active',
        passExpiresAt: expiry.toISOString(),
        status: planData.id,
        planTier: planData.tier || 1,
        updatedAt: serverTimestamp()
      });

      // 3. Log to Transaction Ledger
      await addDoc(collection(firestore, "payment_requests"), {
        userId,
        orderId: razorpay_order_id,
        paymentId: razorpay_payment_id,
        planId,
        amount: planData.price,
        status: 'APPROVED',
        gateway: 'RAZORPAY',
        verified: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ success: false, reason: "Signature verification failed" }, { status: 400 });
    }
  } catch (error: any) {
    console.error("[RAZORPAY_VERIFY_ERROR]", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
