'use client';

import { initializeFirebase } from '@/firebase/app';
import { 
  collection, 
  doc, 
  addDoc, 
  serverTimestamp,
  updateDoc,
  getDoc
} from 'firebase/firestore';

/**
 * @fileOverview Hardened Testbook-Style Subscription Actions v5.1.
 * CONVERTED: From Server Actions to Client Functions for 'output: export' compatibility.
 */

export async function activateFreePass(userId: string, planId: string) {
  const { firestore: db } = initializeFirebase();

  try {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) throw new Error("User node not found.");
    const userData = userSnap.data();

    const planSnap = await getDoc(doc(db, "passes", planId));
    if (!planSnap.exists()) throw new Error("Pass node missing in registry.");
    const planData = planSnap.data();

    if (planData.price > 0) throw new Error("Security Violation: Paid plan via free node.");

    const now = new Date();
    const durationDays = planData.durationDays || 30;
    const currentExpiry = userData.passExpiresAt ? new Date(userData.passExpiresAt) : null;
    const isPassActive = currentExpiry && currentExpiry > now;

    let newExpiryDate: Date;

    if (isPassActive && userData.status === planId) {
      newExpiryDate = new Date(currentExpiry.getTime());
      newExpiryDate.setDate(newExpiryDate.getDate() + durationDays);
    } else {
      newExpiryDate = new Date();
      newExpiryDate.setDate(now.getDate() + durationDays);
    }

    await updateDoc(userRef, { 
      pass: {
        active: true,
        plan: planData.id?.toUpperCase() || 'FREE_PASS',
        purchaseDate: now.toISOString(),
        expiryDate: newExpiryDate.toISOString(),
        freePassClaimed: true
      },
      passStatus: 'active',
      passExpiresAt: newExpiryDate.toISOString(),
      status: planData.id,
      planTier: planData.tier || 0,
      updatedAt: serverTimestamp()
    });

    return { success: true };
  } catch (e: any) {
    console.error('Free Pass Activation Error:', e);
    throw new Error('Failed to activate free pass node.');
  }
}

export async function submitManualPayment(data: {
  userId: string;
  userEmail: string;
  userName: string;
  planId: string;
  transactionId: string;
}) {
  const { userId, userEmail, userName, planId, transactionId } = data;
  const { firestore: db } = initializeFirebase();

  try {
    const planSnap = await getDoc(doc(db, "passes", planId));
    if (!planSnap.exists()) throw new Error("Invalid Plan Node");
    const planData = planSnap.data();

    const reqRef = await addDoc(collection(db, 'payment_requests'), {
      userId,
      userEmail,
      userName,
      planId,
      planName: planData.name,
      amount: planData.price,
      transactionId,
      status: 'PENDING',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return { success: true, requestId: reqRef.id };
  } catch (e) {
    console.error('Manual Payment Submission Error:', e);
    throw new Error('Failed to submit verification request.');
  }
}

export async function approvePaymentRequest(requestId: string, adminId: string) {
  const { firestore: db } = initializeFirebase();

  try {
    const reqRef = doc(db, 'payment_requests', requestId);
    const snap = await getDoc(reqRef);
    
    if (!snap.exists()) throw new Error('Request not found');
    const data = snap.data();

    const userRef = doc(db, 'users', data.userId);
    const userSnap = await getDoc(userRef);
    const userData = userSnap.data() || {};

    const planSnap = await getDoc(doc(db, "passes", data.planId));
    if (!planSnap.exists()) throw new Error("Pass node missing in registry.");
    const planData = planSnap.data();

    const now = new Date();
    const durationDays = planData.durationDays || 30;
    const currentExpiry = userData.passExpiresAt ? new Date(userData.passExpiresAt) : null;
    const isPassActive = currentExpiry && currentExpiry > now;
    const newTier = planData.tier || 1;

    let newExpiryDate: Date;

    if (isPassActive && userData.status === data.planId) {
      newExpiryDate = new Date(currentExpiry.getTime());
      newExpiryDate.setDate(newExpiryDate.getDate() + durationDays);
    } else {
      newExpiryDate = new Date();
      newExpiryDate.setDate(now.getDate() + durationDays);
    }

    await updateDoc(userRef, { 
      pass: {
        active: true,
        plan: planData.id?.toUpperCase() || 'PREMIUM',
        purchaseDate: now.toISOString(),
        expiryDate: newExpiryDate.toISOString(),
        freePassClaimed: planData.id === 'free-pass'
      },
      passStatus: 'active',
      passExpiresAt: newExpiryDate.toISOString(),
      status: planData.id,
      planTier: newTier,
      updatedAt: serverTimestamp()
    });

    await updateDoc(reqRef, {
      status: 'APPROVED',
      approvedBy: adminId,
      updatedAt: serverTimestamp()
    });

    return { success: true };
  } catch (e) {
    console.error('Approval Error:', e);
    throw new Error('Failed to approve payment.');
  }
}
