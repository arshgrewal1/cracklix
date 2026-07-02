import { firestore as db } from "@/firebase/app";
import { doc, getDoc } from "firebase/firestore";
import {
  parseRequestBody,
  apiError,
  apiSuccess,
  withErrorHandling,
} from "@/lib/api-utils";

async function handler(req: Request) {
  const body = await parseRequestBody<{ code: string }>(req);
  if (!body) {
    return apiError("Malformed or missing request body", 400);
  }

  const { code } = body;

  if (!code || typeof code !== "string") {
    return apiError("Valid coupon code is required", 400);
  }

  const normalizedCode = String(code).trim().toUpperCase();

  if (!normalizedCode) {
    return apiError("Empty code node detected", 400);
  }

  const couponRef = doc(db, "coupons", normalizedCode);
  const snap = await getDoc(couponRef);

  if (!snap.exists()) {
    return apiError("Invalid coupon code node.", 404);
  }

  const data = snap.data();

  if (!data.active) {
    return apiError("This coupon is no longer active in the registry.", 400);
  }

  return apiSuccess({
    discount: Number(data.discount) || 0,
    type: data.type || "percent",
  });
}

export const POST = withErrorHandling(handler, "COUPON_VERIFY");
