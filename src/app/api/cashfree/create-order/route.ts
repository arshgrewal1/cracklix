import { NextResponse } from 'next/server';
import { Cashfree } from 'cashfree-pg';
import { initializeFirebase } from '@/firebase/app';
import { doc, getDoc } from 'firebase/firestore';

/**
 * @fileOverview Hardened Cashfree Order Node v10.0.
 * FIXED: Advanced phone number normalization and site URL resolution.
 */

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { planId, userId, origin: clientOrigin } = body;
    
    const { firestore: db } = initializeFirebase();

    const clientId = process.env.CASHFREE_CLIENT_ID;
    const clientSecret = process.env.CASHFREE_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      console.error("[CASHFREE_CRITICAL]: Missing API credentials.");
      return NextResponse.json({ error: 'Gateway Configuration Error' }, { status: 500 });
    }

    Cashfree.XClientId = clientId;
    Cashfree.XClientSecret = clientSecret;
    const isProd = clientSecret.startsWith('cf_prod_');
    Cashfree.XEnvironment = isProd ? Cashfree.Environment.PRODUCTION : Cashfree.Environment.SANDBOX;

    if (!userId || !planId) {
      return NextResponse.json({ error: 'Context missing (UserId/PlanId)' }, { status: 400 });
    }

    // 1. Validate Plan in Registry
    const planSnap = await getDoc(doc(db, "passes", planId));
    if (!planSnap.exists()) {
      return NextResponse.json({ error: 'Invalid plan node' }, { status: 404 });
    }
    const planData = planSnap.data();

    // 2. Fetch Student Profile for details
    const userSnap = await getDoc(doc(db, "users", userId));
    const userData = userSnap.data();

    // CRITICAL: Cashfree requires EXACTLY 10 digits for phone, no prefixes.
    const rawPhone = userData?.phone || "9999999999";
    const cleanPhone = rawPhone.replace(/\D/g, '').slice(-10);

    // Capacitor Compatibility: Use client origin or fallback to environment URL
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://cracklix.vercel.app";
    const secureOrigin = (clientOrigin || siteUrl).replace('http://', 'https://');
    
    const orderId = `CRK_${Date.now()}_${userId.slice(-4)}`;

    const orderRequest = {
      order_amount: Number(planData.price),
      order_currency: "INR",
      order_id: orderId,
      customer_details: {
        customer_id: userId,
        customer_name: userData?.name || "Aspirant",
        customer_email: userData?.email || "student@cracklix.com",
        customer_phone: cleanPhone,
      },
      order_meta: {
        return_url: `${secureOrigin}/payment/success?order_id={order_id}&plan=${encodeURIComponent(planId)}`,
        notify_url: `${secureOrigin}/api/cashfree/webhook`
      },
      order_note: `Elite Pass: ${planData.name}`,
    };

    const response = await Cashfree.PGCreateOrder("2023-08-01", orderRequest);
    
    return NextResponse.json({
      payment_session_id: response.data.payment_session_id,
      order_id: response.data.order_id,
      environment: isProd ? 'production' : 'sandbox'
    });

  } catch (error: any) {
    console.error("[CASHFREE_ORDER_FAILURE]:", error?.response?.data || error);
    return NextResponse.json({ 
      error: error?.response?.data?.message || 'Gateway connection failed' 
    }, { status: 500 });
  }
}
