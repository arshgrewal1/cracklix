
import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { initializeFirebase } from '@/firebase';
import { doc, getDoc, updateDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore';

/**
 * @fileOverview Institutional Razorpay Verification Hub v7.0.
 * Hardened: Domestic signature audit and automatic Firestore subscription update.
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

    const secret = process.env.RAZORPAY_KEY_SECRET || '';
    
    // 1. Verify Signature Node
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
    const generated_signature = hmac.digest('hex');

    if (generated_signature !== razorpay_signature) {
      console.error('[SECURITY_ALERT]: Payment signature mismatch.');
      return NextResponse.json({ error: 'Security audit failed. Transaction rejected.' }, { status: 400 });
    }

    // 2. Grant Access in Institutional Registry
    const { firestore: db } = initializeFirebase();
    const userRef = doc(db, 'users', userId);
    const planRef = doc(db, 'passes', planId);
    
    const planSnap = await getDoc(planRef);
    if (!planSnap.exists()) throw new Error("Plan node missing in master registry.");
    const planData = planSnap.data();

    // Calculate expiry (Default 30 days if Duration missing)
    const duration = planData.durationDays || 30;
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + duration);

    // Update Student Registry Node
    await updateDoc(userRef, {
      status: planId,
      passExpiryDate: expiryDate.toISOString(),
      updatedAt: serverTimestamp()
    });

    // Create Subscription Audit Hub Entry
    await addDoc(collection(db, 'subscriptions'), {
      userId,
      planId,
      planName: planData.name,
      status: 'active',
      startDate: serverTimestamp(),
      expiryDate: expiryDate.toISOString(),
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id,
      amount: planData.price,
      gateway: 'RAZORPAY_DOMESTIC',
      verified: true,
      updatedAt: serverTimestamp()
    });

    // Log to Finance Audit Collection
    await addDoc(collection(db, 'payments'), {
      userId,
      amount: planData.price,
      paymentId: razorpay_payment_id,
      planName: planData.name,
      createdAt: serverTimestamp()
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[VERIFY_ERROR]:', error);
    return NextResponse.json({ error: error.message || 'Verification node failure.' }, { status: 500 });
  }
}
