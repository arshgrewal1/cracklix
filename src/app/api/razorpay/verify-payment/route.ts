
import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { initializeFirebase } from '@/firebase/app';
import { doc, updateDoc, setDoc, serverTimestamp, getDoc } from 'firebase/firestore';

/**
 * @fileOverview Razorpay Signature Verification Node v1.0.
 * SECURITY: Cryptographic validation before granting access.
 */

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature,
      userId,
      planId
    } = body;
    
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret) return NextResponse.json({ error: 'Config missing' }, { status: 500 });

    // 1. Signature Verification
    const generated_signature = crypto
      .createHmac('sha256', keySecret)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest('hex');

    if (generated_signature !== razorpay_signature) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    const { firestore: db } = initializeFirebase();
    
    // 2. Fetch Plan Metadata
    const planSnap = await getDoc(doc(db, 'passes', planId));
    if (!planSnap.exists()) return NextResponse.json({ error: 'Plan invalid' }, { status: 404 });
    const planData = planSnap.data();

    // 3. Calculate New Expiry
    const now = new Date();
    const duration = Number(planData.durationDays) || 30;
    const finalExpiry = new Date();
    finalExpiry.setDate(now.getDate() + duration);

    // 4. Update User Profile
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      pass: {
        active: true,
        plan: planData.name,
        purchaseDate: now.toISOString(),
        expiryDate: finalExpiry.toISOString(),
        freePassClaimed: false
      },
      passStatus: 'active',
      passExpiresAt: finalExpiry.toISOString(),
      status: planId,
      updatedAt: serverTimestamp()
    });

    // 5. Log Transaction
    await setDoc(doc(db, 'payment_requests', razorpay_payment_id), {
      id: razorpay_payment_id,
      orderId: razorpay_order_id,
      userId,
      planId,
      amount: Number(planData.price),
      status: 'APPROVED',
      gateway: 'RAZORPAY',
      verifiedAt: serverTimestamp()
    }, { merge: true });

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error("[RAZORPAY_VERIFY_FAILURE]:", error);
    return NextResponse.json({ error: 'Internal sync failed' }, { status: 500 });
  }
}
