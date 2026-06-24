import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

const CASHFREE_API_KEY = process.env.NEXT_PUBLIC_CASHFREE_API_KEY || '';
const CASHFREE_SECRET_KEY = process.env.CASHFREE_SECRET_KEY || '';
const CASHFREE_BASE_URL = process.env.NEXT_PUBLIC_CASHFREE_BASE_URL || 'https://sandbox.cashfree.com';

interface CreateOrderPayload {
  planId: string;
  userId: string;
  origin: string;
}

/**
 * @fileOverview Cashfree Order Creation API v2.1
 * FIXED: Enhanced error handling, sanitization, and validation
 */

export async function POST(req: NextRequest) {
  try {
    const body: CreateOrderPayload = await req.json();

    // Validation
    if (!body.planId || !body.userId || !body.origin) {
      return NextResponse.json(
        { error: 'Missing required fields: planId, userId, origin' },
        { status: 400 }
      );
    }

    // Sanitize inputs
    const sanitizedPlanId = body.planId.toString().trim().slice(0, 100);
    const sanitizedUserId = body.userId.toString().trim().slice(0, 100);
    const sanitizedOrigin = body.origin.toString().trim().slice(0, 500);

    // Validate origin domain
    try {
      new URL(sanitizedOrigin);
    } catch {
      return NextResponse.json(
        { error: 'Invalid origin URL' },
        { status: 400 }
      );
    }

    if (!CASHFREE_API_KEY || !CASHFREE_SECRET_KEY) {
      console.error('Cashfree credentials not configured');
      return NextResponse.json(
        { error: 'Payment gateway not configured' },
        { status: 500 }
      );
    }

    const orderId = `ORD_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const returnUrl = new URL('/checkout/success', sanitizedOrigin).toString();
    const notifyUrl = new URL('/api/cashfree/webhook', sanitizedOrigin).toString();

    const orderPayload = {
      order_id: orderId,
      order_amount: 1, // Fetch from DB in production
      order_currency: 'INR',
      customer_details: {
        customer_id: sanitizedUserId,
        customer_email: 'user@cracklix.com',
        customer_phone: '9999999999',
      },
      order_meta: {
        notify_url: notifyUrl,
        return_url: returnUrl,
      },
      order_tags: {
        planId: sanitizedPlanId,
      },
    };

    const response = await axios.post(
      `${CASHFREE_BASE_URL}/orders`,
      orderPayload,
      {
        headers: {
          'x-api-version': '2021-05-21',
          'x-client-id': CASHFREE_API_KEY,
          'x-client-secret': CASHFREE_SECRET_KEY,
          'Content-Type': 'application/json',
        },
        timeout: 10000,
      }
    );

    if (!response.data?.payment_session_id) {
      console.error('Cashfree response missing session ID:', response.data);
      return NextResponse.json(
        { error: 'Failed to create payment session' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      order_id: response.data.order_id,
      payment_session_id: response.data.payment_session_id,
      environment: 'sandbox',
    });
  } catch (error: any) {
    console.error('Order creation error:', {
      message: error?.message,
      status: error?.response?.status,
      data: error?.response?.data,
    });

    // Handle specific Cashfree errors
    if (error?.response?.status === 401) {
      return NextResponse.json(
        { error: 'Payment gateway authentication failed' },
        { status: 401 }
      );
    }

    if (error?.response?.status === 400) {
      return NextResponse.json(
        { error: error?.response?.data?.message || 'Invalid payment request' },
        { status: 400 }
      );
    }

    if (error?.code === 'ECONNABORTED') {
      return NextResponse.json(
        { error: 'Payment gateway timeout' },
        { status: 504 }
      );
    }

    return NextResponse.json(
      { error: 'Payment processing failed. Please try again.' },
      { status: 500 }
    );
  }
}
