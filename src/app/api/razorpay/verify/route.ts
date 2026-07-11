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
  updateDoc 
} from 'firebase/firestore';
import { nanoid } from 'nanoid';

/**
 * @fileOverview Secure Razorpay Verification Node v2.0.
 * Provisioning: Automatically creates Subscriptions and Invoices on verification.
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
      return NextResponse.json({ error: 'Security key missing' }, { status: 500 });
    }

    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', key_secret)
      .update(body.toString())
      .digest('hex');

    if (expectedSignature === razorpay_signature) {
      return provisionSubscription(userId, planId, razorpay_order_id, razorpay_payment_id, couponCode);
    } else {
      return NextResponse.json({ success: false, reason: "Signature mismatch" }, { status: 400 });
    }
  } catch (error: any) {
    console.error("[RAZORPAY_VERIFY_ERROR]", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

async function provisionSubscription(userId: string, planId: string, orderId: string, paymentId: string, couponCode?: string) {
  const db = firestore;
  
  // 1. Fetch Plan & User Data
  const [planSnap, userSnap] = await Promise.all([
    getDoc(doc(db, "passes", planId)),
    getDoc(doc(db, "users", userId))
  ]);

  if (!planSnap.exists() || !userSnap.exists()) {
    return NextResponse.json({ error: "Context not found" }, { status: 404 });
  }

  const planData = planSnap.data();
  const userData = userSnap.data();
  
  const now = new Date();
  const validityDays = Number(planData.durationDays) || 30;
  const expiryDate = new Date();
  expiryDate.setDate(now.getDate() + validityDays);

  const invoiceNumber = `INV-${Date.now()}-${nanoid(4).toUpperCase()}`;
  const subId = `sub_${nanoid(10)}`;

  // 2. Provision Subscription Node
  const subPayload = {
    id: subId,
    userId,
    userName: userData.name || "Student",
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

  // 3. Log Payment Ledger
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

  // 4. Update User Profile Hub
  await updateDoc(doc(db, "users", userId), {
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

  return NextResponse.json({ success: true, subscriptionId: subId });
}
