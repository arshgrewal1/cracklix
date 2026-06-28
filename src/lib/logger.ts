import { initializeFirebase } from "@/firebase/app";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

/**
 * @fileOverview Institutional Event Logger v1.1.
 * Records system-wide telemetry for administrative audits.
 */
export async function logEvent(data: {
  type: "error" | "payment" | "auth" | "critical" | "info";
  message: string;
  userId?: string;
  planId?: string;
  stack?: string;
  metadata?: any;
}) {
  try {
    const { firestore: db } = initializeFirebase();

    await addDoc(collection(db, "logs"), {
      ...data,
      createdAt: serverTimestamp(),
      platform: "web-saas",
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'server-node'
    });
  } catch (e) {
    console.error("[LOGGER_FAILED]:", e);
  }
}
