
import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { initializeFirebase } from '@/firebase/app';
import { doc, updateDoc, setDoc, serverTimestamp, getDoc } from 'firebase/firestore';

/**
 * @fileOverview Razorpay Security Node v6.0.
 * SECURITY: Cryptographic HMAC SHA256 validation to prevent spoofing.
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
    if (!keySecret) return NextResponse.json({ error: 'Configuration missing' }, { status: 500 });

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
       return NextResponse.json({ error: 'Verification fields missing' }, { status: 400 });
    }

    // 1. Cryptographic Signature Validation
    const hmac = crypto.createHmac('sha256', keySecret);
    hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
    const generated_signature = hmac.digest('hex');

    if (generated_signature !== razorpay_signature) {
      console.error("[RAZORPAY_SECURITY_ALERT]: Signature mismatch for user", userId);
      return NextResponse.json({ error: 'Security violation: Invalid signature' }, { status: 400 });
    }

    const { firestore: db } = initializeFirebase();
    
    // 2. Fetch Plan Metadata for Token Grant
    const planSnap = await getDoc(doc(db, 'passes', planId));
    if (!planSnap.exists()) return NextResponse.json({ error: 'Invalid plan reference' }, { status: 404 });
    const planData = planSnap.data();

    // 3. New Expiry Calculation
    const now = new Date();
    const duration = Number(planData.durationDays) || 30;
    const finalExpiry = new Date();
    finalExpiry.setDate(now.getDate() + duration);

    // 4. Update User Node (Grant Elite Tokens)
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

    // 5. Log Success in Transaction Ledger
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
    console.error("[RAZORPAY_VERIFY_CRITICAL]:", error);
    return NextResponse.json({ error: 'Internal registry sync failed' }, { status: 500 });
  }
}
