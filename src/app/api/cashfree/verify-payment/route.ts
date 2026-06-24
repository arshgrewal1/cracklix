import { NextResponse } from 'next/server';
import { Cashfree } from 'cashfree-pg';
import { initializeFirebase } from '@/firebase/app';
import { doc, updateDoc, setDoc, serverTimestamp, getDoc, arrayUnion } from 'firebase/firestore';

/**
 * @fileOverview Hardened Verification Node v8.0.
 * UPDATED: Support for multi-pass queuing (Scheduled Extensions).
 */

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { order_id, userId, planId } = body;
    
    const clientId = process.env.CASHFREE_CLIENT_ID;
    const clientSecret = process.env.CASHFREE_CLIENT_SECRET;

    if (!clientId || !clientSecret) return NextResponse.json({ error: 'Config missing' }, { status: 500 });

    Cashfree.XClientId = clientId;
    Cashfree.XClientSecret = clientSecret;
    Cashfree.XEnvironment = clientSecret.startsWith('cf_prod_') ? Cashfree.Environment.PRODUCTION : Cashfree.Environment.SANDBOX;

    if (!order_id || !userId || !planId) {
      return NextResponse.json({ error: 'Parameters missing' }, { status: 400 });
    }

    const response = await Cashfree.PGOrderFetchPayments("2023-08-01", order_id);
    const payments = response.data;
    const successNode = payments?.find(p => p.payment_status === 'SUCCESS');

    if (!successNode) {
      return NextResponse.json({ error: 'Payment not verified' }, { status: 400 });
    }

    const { firestore: db } = initializeFirebase();
    const normalizedPlanId = planId.toLowerCase().replace(/[\s_]+/g, '-');
    
    const planSnap = await getDoc(doc(db, 'passes', normalizedPlanId));
    if (!planSnap.exists()) return NextResponse.json({ error: 'Plan invalid' }, { status: 404 });
    const planData = planSnap.data();

    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    const userData = userSnap.data() || {};

    const now = new Date();
    const duration = Number(planData.durationDays) || 30;
    const currentExpiry = userData.passExpiresAt ? new Date(userData.passExpiresAt) : null;
    const isPassActive = currentExpiry && currentExpiry > now;
    
    if (isPassActive && userData.status !== normalizedPlanId) {
       // Logic: SCHEDULED EXTENSION (Queue different plan types)
       await updateDoc(userRef, {
          queuedPasses: arrayUnion({
             id: `q_${Date.now()}`,
             planId: normalizedPlanId,
             name: planData.name,
             durationDays: duration,
             purchasedAt: now.toISOString()
          }),
          updatedAt: serverTimestamp()
       });
    } else {
       // Logic: IMMEDIATE ACTIVATION / EXTENSION
       let finalExpiry: Date;
       if (isPassActive && userData.status === normalizedPlanId) {
          finalExpiry = new Date(currentExpiry.getTime());
          finalExpiry.setDate(finalExpiry.getDate() + duration);
       } else {
          finalExpiry = new Date();
          finalExpiry.setDate(now.getDate() + duration);
       }

       await updateDoc(userRef, {
          pass: {
             active: true,
             plan: planData.id?.toUpperCase() || 'PREMIUM',
             purchaseDate: now.toISOString(),
             expiryDate: finalExpiry.toISOString(),
             freePassClaimed: false
          },
          passStatus: 'active',
          passExpiresAt: finalExpiry.toISOString(),
          status: normalizedPlanId,
          planTier: planData.tier || 1,
          updatedAt: serverTimestamp()
       });
    }

    // Record verified transaction node
    await setDoc(doc(db, 'payment_requests', successNode.cf_payment_id!.toString()), {
      id: successNode.cf_payment_id!.toString(),
      orderId: order_id,
      userId,
      planId: normalizedPlanId,
      amount: Number(planData.price),
      status: 'APPROVED',
      gateway: 'CASHFREE',
      method: successNode.payment_group || 'UNKNOWN',
      verifiedAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }, { merge: true });

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error("[CASHFREE_VERIFICATION_CRITICAL]:", error);
    return NextResponse.json({ error: 'Internal sync failed' }, { status: 500 });
  }
}
