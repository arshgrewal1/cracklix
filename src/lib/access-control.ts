import { doc, getDoc } from "firebase/firestore";
import { firestore } from "@/firebase/app";

/**
 * @fileOverview Institutional Access Guard Node v2.0.
 * Strictly audits the user_passes collection for active, non-expired preparaton nodes.
 */

/**
 * Checks if the user has an active pass based on user profile.
 */
export async function hasActivePass(userId: string): Promise<boolean> {
  const db = firestore;

  try {
    const ref = doc(db, "users", userId);
    const snap = await getDoc(ref);

    if (!snap.exists()) return false;

    const data = snap.data();
    const now = new Date();

    // 1. Status Audit
    if (data.passStatus !== 'active') return false;

    // 2. Expiry Audit
    if (data.passExpiresAt) {
      const expiry = new Date(data.passExpiresAt);
      if (now > expiry) return false;
    }

    return true;
  } catch (e) {
    console.error("[ACCESS_GUARD_FAILURE]:", e);
    return false;
  }
}

/**
 * Validates a specific payment ID from the ledger.
 */
export async function isPaymentValid(paymentId: string) {
  const db = firestore;
  try {
    const snap = await getDoc(doc(db, "payment_requests", paymentId));
    return snap.exists() && snap.data()?.status === "captured" && snap.data()?.verified === true;
  } catch (e) {
    console.error("[PAYMENT_VALIDATION_FAILURE]:", e);
    return false;
  }
}
