
import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { initializeFirebase } from '@/firebase';
import { doc, getDoc, updateDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore';

/**
 * @fileOverview Backend Hub for Razorpay Signature Verification & Subscription Grant.
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
    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(body.toString())
      .digest('hex');

    const isSignatureValid = expectedSignature === razorpay_signature;

    if (!isSignatureValid) {
      return NextResponse.json({ error: 'Signature mismatch. Transaction audit rejected.' }, { status: 400 });
    }

    // 2. Grant Subscription in Firestore
    const { firestore: db } = initializeFirebase();
    const userRef = doc(db, 'users', userId);
    const planRef = doc(db, 'passes', planId);
    
    const planSnap = await getDoc(planRef);
    if (!planSnap.exists()) throw new Error("Plan node missing");
    const planData = planSnap.data();

    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + (planData.durationDays || 30));

    // Update User Profile
    await updateDoc(userRef, {
      status: planId,
      passExpiryDate: expiryDate.toISOString(),
      updatedAt: serverTimestamp()
    });

    // Create Subscription Log
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
      gateway: 'RAZORPAY',
      createdAt: serverTimestamp()
    });

    // Create Payment Record
    await addDoc(collection(db, 'payments'), {
      userId,
      planId,
      amount: planData.price,
      paymentId: razorpay_payment_id,
      status: 'SUCCESS',
      createdAt: serverTimestamp()
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[RAZORPAY_VERIFY_ERR]:', error);
    return NextResponse.json({ error: error.message || 'Verification logic failure' }, { status: 500 });
  }
}
