
import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { initializeFirebase } from '@/firebase';
import { doc, updateDoc, setDoc, serverTimestamp, getDoc } from 'firebase/firestore';

/**
 * @fileOverview Payment Signature Verification Hub.
 * Hardened node for cryptographic audit of gateway responses.
 */

export async function POST(req: Request) {
  try {
    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature,
      userId,
      planId
    } = await req.json();

    const secret = process.env.RAZORPAY_KEY_SECRET!;

    // 1. Cryptographic Audit
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(body.toString())
      .digest('hex');

    const isAuthentic = expectedSignature === razorpay_signature;

    if (!isAuthentic) {
      return NextResponse.json({ error: 'Signature Mismatch - Integrity Compromised' }, { status: 400 });
    }

    const { firestore: db } = initializeFirebase();

    // 2. Fetch Plan Metadata
    const planSnap = await getDoc(doc(db, "passes", planId));
    const planData = planSnap?.data();
    
    if (!planData) {
      return NextResponse.json({ error: 'Plan Node Missing' }, { status: 404 });
    }

    // 3. Activate Elite Pass
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + (planData.durationDays || 30));

    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      pass: {
        active: true,
        plan: planData.id?.toUpperCase() || 'PREMIUM',
        purchaseDate: new Date().toISOString(),
        expiryDate: expiryDate.toISOString(),
        freePassClaimed: false
      },
      status: planData.id,
      updatedAt: serverTimestamp()
    });

    // 4. Log Transaction Node
    const paymentRef = doc(db, 'payment_requests', razorpay_payment_id);
    await setDoc(paymentRef, {
      id: razorpay_payment_id,
      orderId: razorpay_order_id,
      userId,
      planId,
      planName: planData.name,
      amount: planData.price,
      status: 'APPROVED',
      gateway: 'RAZORPAY',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[VERIFICATION ERROR]:', error);
    return NextResponse.json({ error: 'Internal Registry Synchronization Error' }, { status: 500 });
  }
}
