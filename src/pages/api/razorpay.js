
import Razorpay from "razorpay";
import { NextResponse } from "next/server";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export async function POST(req) {
  const { amount, currency } = await req.json();

  const options = {
    amount: amount,
    currency: currency,
    receipt: "receipt_order_74394",
    payment_capture: 1,
  };

  try {
    const response = await razorpay.orders.create(options);
    return NextResponse.json({
      id: response.id,
      currency: response.currency,
      amount: response.amount,
    });
  } catch (error) {
    console.error("Error creating Razorpay order:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
