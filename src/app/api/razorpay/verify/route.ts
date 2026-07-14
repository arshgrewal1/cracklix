import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { firestore } from '@/firebase/app';
import { 
  addDoc, 
  collection, 
  serverTimestamp, 
  doc, 
  getDoc, 
  setDoc,
  updateDoc,
  increment,
  runTransaction 
} from 'firebase/firestore';
import { nanoid } from 'nanoid';

/**
 * @fileOverview Hardened Razorpay Verification & Provisioning Node v3.1.
 * FIXED: Optimized atomicity with runTransaction to ensure registry integrity.
 */

export async function POST(req: Request) {
  try {
    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature, 
      userId, 
      planId,
      couponCode 
    } = await req.json();

    const key_secret = process.env.RAZORPAY_KEY_SECRET;

    if (!key_secret) {
      if (process.env.NODE_ENV === 'development' && razorpay_order_id?.startsWith('order_mock')) {
         return provisionSubscription(userId, planId, razorpay_order_id, "mock_pay_id", couponCode);
      }
      return NextResponse.json({ error: 'Gateway configuration missing.' }, { status: 500 });
    }

    // Verify Signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', key_secret)
      .update(body.toString())
      .digest('hex');

    if (expectedSignature === razorpay_signature) {
      return provisionSubscription(userId, planId, razorpay_order_id, razorpay_payment_id, couponCode);
    } else {
      return NextResponse.json({ success: false, reason: "Security: Signature mismatch" }, { status: 400 });
    }
  } catch (error: any) {
    console.error("[RAZORPAY_VERIFY_FAILURE]:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

async function provisionSubscription(userId: string, planId: string, orderId: string, paymentId: string, couponCode?: string) {
  const db = firestore;
  
  try {
     const subId = `sub_${nanoid(10)}`;
     const invoiceNumber = `INV-${Date.now()}-${nanoid(4).toUpperCase()}`;

     await runTransaction(db, async (transaction) => {
        const planRef = doc(db, "passes", planId);
        const userRef = doc(db, "users", userId);
        const statsRef = doc(db, "settings", "stats");

        const planSnap = await transaction.get(planRef);
        const userSnap = await transaction.get(userRef);

        if (!planSnap.exists() || !userSnap.exists()) {
           throw new Error("Context registry mismatch.");
        }

        const planData = planSnap.data();
        const userData = userSnap.data();
        
        const now = new Date();
        const validityDays = Number(planData.durationDays) || 30;
        
        let baseDate = now;
        if (userData.passStatus === 'active' && userData.passExpiresAt) {
           const currentExpiry = new Date(userData.passExpiresAt);
           if (currentExpiry > now) baseDate = currentExpiry;
        }

        const expiryDate = new Date(baseDate.getTime());
        expiryDate.setDate(expiryDate.getDate() + validityDays);

        // 1. Create Subscription
        const subRef = doc(db, "subscriptions", subId);
        transaction.set(subRef, {
           id: subId,
           userId,
           userName: userData.name || "Aspirant",
           userEmail: userData.email || "",
           planId,
           planName: planData.name,
           amount: planData.price,
           status: 'ACTIVE',
           purchaseDate: now.toISOString(),
           expiryDate: expiryDate.toISOString(),
           paymentId,
           orderId,
           invoiceNumber,
           updatedAt: serverTimestamp(),
        });

        // 2. Update User Profile
        transaction.update(userRef, {
           passStatus: 'active',
           passExpiresAt: expiryDate.toISOString(),
           status: planId,
           pass: {
             active: true,
             plan: planData.name,
             purchaseDate: now.toISOString(),
             expiryDate: expiryDate.toISOString(),
             freePassClaimed: planId === 'free-pass'
           },
           updatedAt: serverTimestamp()
        });

        // 3. Update Global Stats
        transaction.update(statsRef, {
           totalRevenue: increment(Number(planData.price) || 0),
           activePasses: increment(1),
           updatedAt: serverTimestamp()
        });
     });

     return NextResponse.json({ success: true, subscriptionId: subId });
  } catch (error: any) {
     console.error("[PROVISIONING_ERROR]:", error);
     return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
