import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { initializeFirebase } from '@/firebase';
import { doc, getDoc, updateDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore';

/**
 * @fileOverview Institutional Razorpay Verification Hub v12.0.
 * Hardened: Secure signature verification and automatic user registry update.
 */

export async function POST(request: Request) {
  try {
    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature,
      userId,
      planId
    } = await request.json();

    const secret = process.env.RAZORPAY_KEY_SECRET || 'l2sDZOg2Ypc6QbIlDAivUDfc';
    
    // 1. HMAC-SHA256 Signature Verification
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
    const generated_signature = hmac.digest('hex');

    if (generated_signature !== razorpay_signature) {
      return NextResponse.json({ error: 'Security audit failed. Transaction rejected.' }, { status: 400 });
    }

    // 2. Sync Access with Firestore Registry
    const { firestore: db } = initializeFirebase();
    const userRef = doc(db, 'users', userId);
    const planRef = doc(db, 'passes', planId);
    
    const planSnap = await getDoc(planRef);
    if (!planSnap.exists()) throw new Error("Pass node missing in registry.");
    const planData = planSnap.data();

    // Calculate Expiry Node
    const duration = planData.durationDays || 30;
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + duration);

    // Update User Profile
    await updateDoc(userRef, {
      status: planId,
      passExpiryDate: expiryDate.toISOString(),
      updatedAt: serverTimestamp()
    });

    // Log Transaction for Audit
    const userSnap = await getDoc(userRef);
    await addDoc(collection(db, 'payments'), {
      userId,
      userEmail: userSnap.data()?.email || 'N/A',
      planId,
      planName: planData.name,
      amount: planData.price,
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id,
      status: 'VERIFIED',
      createdAt: serverTimestamp()
    });

    // Create Official Subscription Entry
    await addDoc(collection(db, 'subscriptions'), {
      userId,
      planId,
      planName: planData.name,
      status: 'active',
      startDate: serverTimestamp(),
      expiryDate: expiryDate.toISOString(),
      transactionId: razorpay_payment_id,
      verified: true
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[VERIFICATION_FAILURE]:', error);
    return NextResponse.json({ error: error.message || 'Verification failure.' }, { status: 500 });
  }
}
