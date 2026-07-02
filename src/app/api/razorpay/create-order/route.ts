import Razorpay from "razorpay";
import { firestore as db } from "@/firebase/app";
import { doc, getDoc } from "firebase/firestore";
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
  const body = await parseRequestBody<{ planId: string; userId: string }>(req);
  if (!body) {
    return apiError("Malformed request body.", 400);
  }

  const validation = validateRequiredFields(body, ["planId", "userId"]);
  if (validation) return validation;

  const { planId, userId } = body;

  const credentials = getRazorpayCredentials();
  if (isApiErrorResponse(credentials)) return credentials;

  const { keyId, keySecret } = credentials;

  const planRef = doc(db, "passes", planId);
  const planSnap = await getDoc(planRef);

  if (!planSnap.exists()) {
    return apiError("Plan not found in registry.", 404);
  }

  const plan = planSnap.data();
  const price = Number(plan?.price);

  if (isNaN(price) || price < 0) {
    return apiError("Invalid price node detected.", 400);
  }

  const razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });
  const amountInPaise = Math.round(price * 100);

  const order = await razorpay.orders.create({
    amount: amountInPaise,
    currency: "INR",
    receipt: `ORD_${Date.now()}_${String(userId).slice(-5)}`,
    notes: { userId, planId, planName: plan.name || "Elite Pass" },
  });

  return apiSuccess({
    orderId: order.id,
    amount: order.amount,
    currency: order.currency,
    key: keyId,
  });
}

export const POST = withErrorHandling(handler, "RAZORPAY_ORDER");
