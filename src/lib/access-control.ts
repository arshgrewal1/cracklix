import { doc, getDoc } from "firebase/firestore";
import { initializeFirebase } from "@/firebase/app";

/**
 * @fileOverview Institutional Access Guard Node v1.0.
 * Strictly audits the user_passes collection for active, non-expired preparaton nodes.
 */
export async function hasActivePass(userId: string): Promise<boolean> {
  const { firestore: db } = initializeFirebase();

  try {
    const ref = doc(db, "user_passes", userId);
    const snap = await getDoc(ref);

    if (!snap.exists()) return false;

    const data = snap.data();

    // 1. Status Audit
    if (!data.active) return false;

    // 2. Expiry Audit
    if (Date.now() > data.expiry) return false;

    return true;
  } catch (e) {
    console.error("[ACCESS_GUARD_FAILURE]:", e);
    return false;
  }
}
