import { NextRequest, NextResponse } from 'next/server';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

/**
 * @fileOverview Payment Verification API v1.2
 * FIXED: Enhanced error handling and transaction safety
 */

let adminDb: any = null;

function getAdminDb() {
  if (!adminDb) {
    try {
      const app = initializeApp({
        credential: cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT || '{}')),
      });
      adminDb = getFirestore(app);
    } catch (error) {
      console.error('Firebase admin initialization failed:', error);
      throw new Error('Database initialization failed');
    }
  }
  return adminDb;
}

export async function POST(req: NextRequest) {
  try {
    const { userId, planId, transactionId } = await req.json();

    // Validation
    if (!userId || !planId || !transactionId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const db = getAdminDb();

    // Record manual payment for verification
    const paymentRef = doc(db, 'manual_payments', transactionId);
    await setDoc(paymentRef, {
      userId,
      planId,
      transactionId,
      status: 'PENDING_VERIFICATION',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Log for admin review
    const logRef = doc(db, 'payment_logs', `${userId}_${Date.now()}`);
    await setDoc(logRef, {
      userId,
      planId,
      transactionId,
      method: 'MANUAL_UPI',
      timestamp: new Date(),
    });

    return NextResponse.json({
      status: 'recorded',
      message: 'Payment recorded for verification',
    });
  } catch (error: any) {
    console.error('Payment verification error:', {
      message: error?.message,
      stack: error?.stack,
    });

    return NextResponse.json(
      { error: error?.message || 'Payment verification failed' },
      { status: 500 }
    );
  }
}
