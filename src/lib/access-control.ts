import { doc, getDoc } from "firebase/firestore";
import { firestore } from "@/firebase/app";
import { UserProfile, TestSeries } from "@/types";

/**
 * @fileOverview Institutional Access Guard Node v3.0 [Series Aware].
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

    if (data.role === 'ADMIN' || data.role === 'SUPER_ADMIN') return true;

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
 * Deep audit for a specific Test Series.
 */
export function hasSeriesAccess(profile: UserProfile | null, series: TestSeries): {
  hasAccess: boolean;
  status: 'FREE' | 'PURCHASED' | 'LOCKED' | 'EXPIRED';
} {
  if (series.accessLevel === 'FREE') return { hasAccess: true, status: 'FREE' };
  
  if (!profile) return { hasAccess: false, status: 'LOCKED' };

  // 1. Admin Override
  if (profile.role === 'ADMIN' || profile.role === 'SUPER_ADMIN') return { hasAccess: true, status: 'PURCHASED' };

  // 2. Pass Validity Check
  const now = new Date();
  const expiry = profile.passExpiresAt ? new Date(profile.passExpiresAt) : null;
  const isPassActive = profile.passStatus === 'active' && expiry && expiry > now;

  if (!isPassActive) return { hasAccess: false, status: 'EXPIRED' };

  // 3. Granular Access Rules
  const allowedSeries = profile.pass?.allowedSeries || [];
  const allowedCategories = profile.pass?.allowedCategories || [];

  // All Access Pass (Usually Tier 2+)
  if (allowedCategories.includes('all') || allowedCategories.includes('*')) return { hasAccess: true, status: 'PURCHASED' };

  // Series-Specific Pass
  if (allowedSeries.includes(series.id)) return { hasAccess: true, status: 'PURCHASED' };

  // Authority-Wide Pass
  if (series.boardId && allowedCategories.includes(series.boardId)) return { hasAccess: true, status: 'PURCHASED' };

  return { hasAccess: false, status: 'LOCKED' };
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
    return false;
  }
}
