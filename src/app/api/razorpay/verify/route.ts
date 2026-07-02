import crypto from "crypto";
import Razorpay from "razorpay";
import { firestore as db } from "@/firebase/app";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import {
  parseRequestBody,
  apiError,
  apiSuccess,
  validateRequiredFields,
  getRazorpayCredentials,
  isApiErrorResponse,
  withErrorHandling,
} from "@/lib/api-utils";

async function handler(req: Request) {
  const body = await parseRequestBody<{
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
    userId: string;
    planId: string;
  }>(req);

  if (!body) {
    return apiError("Invalid payload format.", 400);
  }

  const validation = validateRequiredFields(body, [
    "razorpay_order_id",
    "razorpay_payment_id",
    "razorpay_signature",
    "userId",
    "planId",
  ]);
  if (validation) return validation;

  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, userId, planId } = body;

  const credentials = getRazorpayCredentials();
  if (isApiErrorResponse(credentials)) return credentials;

  const { keyId, keySecret } = credentials;

  const expectedSignature = crypto
    .createHmac("sha256", keySecret)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");

  if (expectedSignature !== razorpay_signature) {
    return apiError("Security signature mismatch. Transaction could not be verified.", 400);
  }

  const paymentRef = doc(db, "payment_requests", razorpay_payment_id);
  const paymentSnap = await getDoc(paymentRef);

  if (paymentSnap.exists() && paymentSnap.data().verified) {
    return apiSuccess({ message: "Transaction already synced and verified.", orderId: razorpay_order_id });
  }

  const razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });
  const payment = await razorpay.payments.fetch(razorpay_payment_id);
  const paymentStatus = String((payment as any).status || "").toLowerCase();

  if (!["captured", "authorized"].includes(paymentStatus)) {
    return apiError(`Invalid gateway status: ${paymentStatus}`, 400);
  }

  const planRef = doc(db, "passes", planId);
  const planSnap = await getDoc(planRef);
  if (!planSnap.exists()) {
    return apiError("Requested plan node not found in registry.", 404);
  }

  const planData = planSnap.data();
  const duration = Number(planData.durationDays || 30);
  const expiry = new Date();
  expiry.setDate(expiry.getDate() + duration);

  const userRef = doc(db, "users", userId);
  await setDoc(userRef, {
    pass: {
      active: true,
      plan: planData.name || String(planId).toUpperCase(),
      purchaseDate: new Date().toISOString(),
      expiryDate: expiry.toISOString(),
      paymentId: razorpay_payment_id,
      order_id: razorpay_order_id,
      freePassClaimed: false,
    },
    passStatus: "active",
    status: planId,
    planTier: Number(planData.tier || 1),
    passExpiresAt: expiry.toISOString(),
    updatedAt: serverTimestamp(),
  }, { merge: true });

  await setDoc(paymentRef, {
    paymentId: razorpay_payment_id,
    orderId: razorpay_order_id,
    userId,
    planId,
    amount: Number(payment.amount) / 100,
    currency: payment.currency || "INR",
    gateway: "RAZORPAY",
    status: paymentStatus,
    email: payment.email || "",
    contact: payment.contact || "",
    verified: true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return apiSuccess({ orderId: razorpay_order_id });
}

export const POST = withErrorHandling(handler, "RAZORPAY_VERIFY");
