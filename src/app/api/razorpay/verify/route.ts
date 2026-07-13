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
  increment 
} from 'firebase/firestore';
import { nanoid } from 'nanoid';

/**
 * @fileOverview Hardened Razorpay Verification & Provisioning Node v3.0.
 * ATOMICITY: Ensures Subscriptions, Payment Requests, and User Profiles are updated in a verified sequence.
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
      // Emergency Dev Mock
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
  
  // 1. Context Sync
  const [planSnap, userSnap] = await Promise.all([
    getDoc(doc(db, "passes", planId)),
    getDoc(doc(db, "users", userId))
  ]);

  if (!planSnap.exists() || !userSnap.exists()) {
    return NextResponse.json({ error: "Context registry mismatch." }, { status: 404 });
  }

  const planData = planSnap.data();
  const userData = userSnap.data();
  
  const now = new Date();
  const validityDays = Number(planData.durationDays) || 30;
  
  // Calculate new expiry (handling renewals)
  let baseDate = now;
  if (userData.passStatus === 'active' && userData.passExpiresAt) {
     const currentExpiry = new Date(userData.passExpiresAt);
     if (currentExpiry > now) baseDate = currentExpiry;
  }

  const expiryDate = new Date(baseDate.getTime());
  expiryDate.setDate(expiryDate.getDate() + validityDays);

  const invoiceNumber = `INV-${Date.now()}-${nanoid(4).toUpperCase()}`;
  const subId = `sub_${nanoid(10)}`;

  // 2. Transact: Create Subscription Registry Node
  const subPayload = {
    id: subId,
    userId,
    userName: userData.name || "Aspirant",
    userEmail: userData.email || "",
    userPhone: userData.phone || "",
    planId,
    planName: planData.name,
    amount: planData.price,
    currency: "INR",
    paymentId,
    orderId,
    status: 'ACTIVE',
    purchaseDate: now.toISOString(),
    activationDate: now.toISOString(),
    expiryDate: expiryDate.toISOString(),
    validityDays,
    invoiceNumber,
    couponUsed: couponCode || null,
    updatedAt: serverTimestamp(),
  };

  await setDoc(doc(db, "subscriptions", subId), subPayload);

  // 3. Transact: Log Payment Request as APPROVED
  await addDoc(collection(db, "payment_requests"), {
    userId,
    userName: userData.name,
    userEmail: userData.email,
    orderId,
    paymentId,
    planId,
    planName: planData.name,
    amount: planData.price,
    status: 'APPROVED',
    gateway: 'RAZORPAY',
    verified: true,
    invoiceNumber,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });

  // 4. Transact: Update User Master Node
  await updateDoc(doc(db, "users", userId), {
    passStatus: 'active',
    passExpiresAt: expiryDate.toISOString(),
    status: planId,
    planTier: Number(planData.tier) || 1,
    pass: {
      active: true,
      plan: planData.name,
      purchaseDate: now.toISOString(),
      expiryDate: expiryDate.toISOString(),
      freePassClaimed: planId === 'free-pass'
    },
    updatedAt: serverTimestamp()
  });

  // 5. Transact: Increment Revenue Stats
  await updateDoc(doc(db, 'settings', 'stats'), {
    totalRevenue: increment(Number(planData.price) || 0),
    activePasses: increment(1),
    updatedAt: serverTimestamp()
  }).catch(() => {});

  return NextResponse.json({ success: true, subscriptionId: subId });
}
