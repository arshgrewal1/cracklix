import { NextResponse } from 'next/server';
import { Cashfree } from 'cashfree-pg';
import { initializeFirebase } from '@/firebase/app';
import { doc, getDoc } from 'firebase/firestore';

/**
 * @fileOverview Production Cashfree Order Engine v16.0.
 * SECURITY: Validates pricing against Firestore registry before gateway handshake.
 * FIXED: Improved error messaging and credential validation.
 */

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { planId, userId, origin: clientOrigin } = body;
    
    const { firestore: db } = initializeFirebase();

    // Use specific names for Cashfree credentials
    const clientId = process.env.CASHFREE_CLIENT_ID;
    const clientSecret = process.env.CASHFREE_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      console.error("[CASHFREE_CONFIG_ERROR]: Missing CASHFREE_CLIENT_ID or CASHFREE_CLIENT_SECRET environment variables.");
      return NextResponse.json({ 
        error: 'Payment service is temporarily unavailable. Please try again later.' 
      }, { status: 503 });
    }

    // Configure SDK
    Cashfree.XClientId = clientId;
    Cashfree.XClientSecret = clientSecret;
    
    // Automatically detect environment based on key prefix or use explicit ENV
    const isProd = !clientId.startsWith('TEST');
    Cashfree.XEnvironment = isProd ? Cashfree.Environment.PRODUCTION : Cashfree.Environment.SANDBOX;

    if (!userId || !planId) {
      return NextResponse.json({ error: 'Context Missing' }, { status: 400 });
    }

    // 1. Audit Price from Registry
    const planSnap = await getDoc(doc(db, "passes", planId));
    if (!planSnap.exists()) {
      return NextResponse.json({ error: 'Invalid Plan' }, { status: 404 });
    }
    const planData = planSnap.data();

    // 2. Fetch Aspirant Profile
    const userSnap = await getDoc(doc(db, "users", userId));
    const userData = userSnap.data();

    // 3. Clean Phone (Required for Cashfree)
    const rawPhone = userData?.phone || "9999999999";
    const cleanPhone = rawPhone.replace(/\D/g, '').slice(-10);

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
        return_url: `${secureOrigin}/payment/success?order_id={order_id}&plan=${encodeURIComponent(planData.name || planId)}`,
        notify_url: `${secureOrigin}/api/cashfree/webhook`
      },
      order_note: `Cracklix Pass: ${planData.name}`,
    };

    const response = await Cashfree.PGCreateOrder("2023-08-01", orderRequest);
    
    return NextResponse.json({
      payment_session_id: response.data.payment_session_id,
      order_id: response.data.order_id,
      environment: isProd ? 'production' : 'sandbox'
    });

  } catch (error: any) {
    console.error("[CASHFREE_CRITICAL]:", error?.response?.data || error);
    const errorMessage = error?.response?.data?.message || 'Payment processing failed. Please try again.';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
