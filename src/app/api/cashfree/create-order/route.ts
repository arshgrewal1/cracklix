import { NextResponse } from 'next/server';
import { Cashfree } from 'cashfree-pg';
import { initializeFirebase } from '@/firebase/app';
import { doc, getDoc } from 'firebase/firestore';

/**
 * @fileOverview Production Cashfree Order Engine v18.0.
 * HARDENED: Robust logging, environment auto-sync, and detailed error propagation.
 */

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { planId, userId, origin: clientOrigin } = body;
    
    const { firestore: db } = initializeFirebase();

    const clientId = process.env.CASHFREE_CLIENT_ID;
    const clientSecret = process.env.CASHFREE_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      console.error("[CASHFREE_CONFIG_ERROR]: Credentials not found in environment variables.");
      return NextResponse.json({ 
        error: 'Payment service is temporarily unavailable. Please try again later.' 
      }, { status: 503 });
    }

    // 1. Configure SDK Environment
    Cashfree.XClientId = clientId;
    Cashfree.XClientSecret = clientSecret;
    
    // Use NEXT_PUBLIC_CASHFREE_MODE if available, otherwise auto-detect
    const mode = process.env.NEXT_PUBLIC_CASHFREE_MODE?.toUpperCase() || 
                 (clientId.startsWith('TEST') ? 'SANDBOX' : 'PRODUCTION');
                 
    Cashfree.XEnvironment = mode === 'PRODUCTION' ? Cashfree.Environment.PRODUCTION : Cashfree.Environment.SANDBOX;

    console.log(`[CASHFREE_INIT]: Environment set to ${mode}`);

    if (!userId || !planId) {
      return NextResponse.json({ error: 'Context Missing: userId or planId required' }, { status: 400 });
    }

    // 2. Audit Price from Registry
    const planSnap = await getDoc(doc(db, "passes", planId));
    if (!planSnap.exists()) {
      console.error(`[CASHFREE_AUDIT]: Plan ${planId} not found in registry.`);
      return NextResponse.json({ error: 'Invalid plan node selected.' }, { status: 404 });
    }
    const planData = planSnap.data();

    // 3. Fetch Aspirant Profile
    const userSnap = await getDoc(doc(db, "users", userId));
    const userData = userSnap.data();

    // 4. Clean Phone (Strict 10-digit requirement for Cashfree)
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

    console.log("[CASHFREE_REQUEST]:", JSON.stringify(orderRequest, null, 2));

    const response = await Cashfree.PGCreateOrder("2023-08-01", orderRequest);
    
    console.log("[CASHFREE_RESPONSE]:", JSON.stringify(response.data, null, 2));

    if (!response.data.payment_session_id) {
       throw new Error("Gateway failed to return payment_session_id");
    }

    return NextResponse.json({
      payment_session_id: response.data.payment_session_id,
      order_id: response.data.order_id,
      environment: mode.toLowerCase()
    });

  } catch (error: any) {
    const errorDetails = error?.response?.data || error;
    console.error("[CASHFREE_CRITICAL_FAILURE]:", JSON.stringify(errorDetails, null, 2));
    
    const errorMessage = error?.response?.data?.message || error.message || 'Payment processing failed. Please try again.';
    return NextResponse.json({ 
      error: errorMessage,
      code: error?.response?.data?.code || 'INTERNAL_ERROR'
    }, { status: 500 });
  }
}
