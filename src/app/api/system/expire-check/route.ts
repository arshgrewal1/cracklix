import { NextResponse } from "next/server";
import { firestore } from "@/firebase/app";
import { collection, getDocs, updateDoc, doc, writeBatch } from "firebase/firestore";

/**
 * @fileOverview Operational Expiry Cleanup Node.
 * Manually or programmatically liquidates expired preparation nodes from the registry.
 */
export async function GET() {
  try {
    const db = firestore;
    const snap = await getDocs(collection(db, "user_passes"));
    const batch = writeBatch(db);
    let expiredCount = 0;
    const now = Date.now();

    snap.forEach((d) => {
      const data = d.data();
      if (data.active && now > data.expiry) {
        batch.update(doc(db, "user_passes", d.id), {
          active: false,
          updatedAt: new Date().toISOString()
        });
        expiredCount++;
      }
    });

    if (expiredCount > 0) {
       await batch.commit();
    }

    return NextResponse.json({
      success: true,
      expiredCount,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error("[EXPIRY_AUDIT_ERROR]:", error);
    return NextResponse.json(
      { error: error?.message || "Registry cleanup failed" },
      { status: 500 }
    );
  }
}
