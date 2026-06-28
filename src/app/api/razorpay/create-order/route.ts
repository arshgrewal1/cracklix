import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import { initializeFirebase } from "@/firebase/app";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { logEvent } from "@/lib/logger";

/**
 * Razorpay Order API (Enterprise Hardened v9.0)
 * Security: Origin validation, active plan lock, and real-time logging.
 */
export async function POST(req: Request) {
  try {
    // 1. ORIGIN SECURITY
    const origin = req.headers.get("origin");
    if (process.env.ALLOWED_ORIGIN && origin !== process.env.ALLOWED_ORIGIN) {
       return NextResponse.json({ error: "Unauthorized endpoint access." }, { status: 403 });
    }

    const { planId, userId, couponCode } = await req.json();

    if (!planId || !userId) {
      return NextResponse.json({ error: "Missing identity tokens." }, { status: 400 });
    }

    const keyId = process.env.RAZORPAY_KEY_ID?.trim();
    const keySecret = process.env.RAZORPAY_KEY_SECRET?.trim();

    if (!keyId || !keySecret) {
      await logEvent({ type: "critical", message: "Razorpay environment variables missing." });
      return NextResponse.json({ error: "Server configuration anomaly." }, { status: 503 });
    }

    const { firestore: db } = initializeFirebase();

    // 2. ACTIVE PLAN AUDIT
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
       const userData = userSnap.data();
       const now = new Date();
       if (userData.passStatus === 'active' && userData.passExpiresAt && new Date(userData.passExpiresAt) > now) {
          return NextResponse.json({ error: "Active pass already registered." }, { status: 400 });
       }
    }

    // 3. REGISTRY PRICE AUDIT
    const planRef = doc(db, "passes", planId);
    const planSnap = await getDoc(planRef);

    if (!planSnap.exists()) {
      return NextResponse.json({ error: "Pass tier not found in registry." }, { status: 404 });
    }

    const plan = planSnap.data();
    let price = Number(plan?.price);

    if (isNaN(price) || price < 0) {
      return NextResponse.json({ error: "Invalid price registry." }, { status: 400 });
    }

    // 4. COUPON VALIDATION
    if (couponCode) {
      const couponRef = doc(db, "coupons", couponCode.toUpperCase());
      const couponSnap = await getDoc(couponRef);
      if (couponSnap.exists() && couponSnap.data().active) {
        const cData = couponSnap.data();
        const discount = cData.type === 'percent' ? (price * cData.discount) / 100 : cData.discount;
        price = Math.max(1, price - discount);
      }
    }

    // 5. RAZORPAY HANDSHAKE
    const razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });

    const order = await razorpay.orders.create({
      amount: Math.round(price * 100),
      currency: "INR",
      receipt: `ORD_${Date.now()}_${userId.slice(-5)}`,
      notes: { userId, planId, planName: plan.name },
    });

    // 6. LOGGING & TRACING
    await logEvent({
       type: "payment",
       message: "Order created successfully",
       userId,
       planId,
       metadata: { orderId: order.id, amount: price }
    });

    await setDoc(doc(db, "payment_logs", order.id), {
       userId, planId, amount: price, status: "created",
       ip: req.headers.get("x-forwarded-for") || "unknown",
       createdAt: serverTimestamp()
    });

    return NextResponse.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      key: keyId,
    });
  } catch (error: any) {
    console.error("[RAZORPAY_CREATE_ERROR]", error);
    await logEvent({ type: "error", message: error.message, stack: error.stack });
    return NextResponse.json({ error: error.message || "Order creation failure" }, { status: 500 });
  }
}
