import { NextResponse } from "next/server";
import { firestore } from "@/firebase/app";
import { 
  collection, 
  getDocs, 
  query, 
  where, 
  writeBatch, 
  doc, 
  serverTimestamp 
} from "firebase/firestore";

/**
 * @fileOverview Operational Audit Node: Subscription Lifecycle Manager.
 * Checks for expired subscriptions and updates access registry.
 */

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const db = firestore;
    const now = new Date();
    
    // 1. Fetch active subscriptions where expiry is past
    const subsSnap = await getDocs(query(
      collection(db, "subscriptions"),
      where("status", "==", "ACTIVE"),
      where("expiryDate", "<", now.toISOString())
    ));

    if (subsSnap.empty) {
      return NextResponse.json({ success: true, count: 0, message: "Registry normalized." });
    }

    const batch = writeBatch(db);
    let auditCount = 0;

    subsSnap.forEach((subDoc) => {
       const sub = subDoc.data();
       
       // a. Mark subscription as EXPIRED
       batch.update(doc(db, "subscriptions", subDoc.id), {
          status: 'EXPIRED',
          updatedAt: serverTimestamp()
       });

       // b. Reset user pass status
       batch.update(doc(db, "users", sub.userId), {
          passStatus: 'expired',
          updatedAt: serverTimestamp()
       });

       auditCount++;
    });

    await batch.commit();

    return NextResponse.json({
      success: true,
      auditCount,
      timestamp: now.toISOString()
    });
  } catch (error: any) {
    console.error("[SUBSCRIPTION_AUDIT_FAILURE]:", error);
    return NextResponse.json({ error: "Audit failed" }, { status: 500 });
  }
}
