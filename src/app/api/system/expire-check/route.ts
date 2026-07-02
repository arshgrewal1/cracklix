import { NextRequest, NextResponse } from "next/server";
import { firestore } from "@/firebase/app";
import { collection, getDocs, doc, writeBatch } from "firebase/firestore";

/**
 * @fileOverview Operational Expiry Cleanup Node.
 * Requires a shared secret (CRON_SECRET) to prevent unauthorized invocation.
 */
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

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
    });
  } catch (error: unknown) {
    console.error("[EXPIRY_AUDIT_ERROR]:", error);
    return NextResponse.json(
      { error: "Registry cleanup failed" },
      { status: 500 }
    );
  }
}
