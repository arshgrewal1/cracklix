"use client"

import React, { Suspense, useMemo, useEffect } from "react"
import ResultClient from "@/components/results/ResultClient"
import { Loader2, Zap } from "lucide-react"
import { useDoc, useFirestore, useUser } from "@/firebase"
import { doc, deleteDoc } from "firebase/firestore"
import { useRouter, useSearchParams } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

/**
 * @fileOverview Universal Result Hub Viewer v2.2 (Static Ready).
 * FIXED: Added Suspense boundary for static export compatibility.
 */

export default function ResultViewPage() {
  return (
    <Suspense fallback={<div className="h-screen flex items-center justify-center bg-white"><Loader2 className="animate-spin text-primary" /></div>}>
      <ResultGuard />
    </Suspense>
  )
}

function ResultGuard() {
  const db = useFirestore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useUser();
  const { toast } = useToast();

  const mockId = searchParams.get('id');

  // Verify the mock exists before allowing the result to render
  const mockRef = useMemo(() => (db && mockId ? doc(db, "mocks", mockId) : null), [db, mockId]);
  const { data: mock, loading: mockLoading } = useDoc<any>(mockRef);

  useEffect(() => {
     if (!mockLoading && mockId && !mock && user && db) {
        console.log("[AUDIT] Orphan result deep-link detected. Liquidating stale record...");
        const resultId = `${user.uid}_${mockId}`;
        
        // Background delete
        deleteDoc(doc(db, "results", resultId)).catch(() => {});
        
        toast({
           variant: "destructive",
           title: "Registry Mismatch",
           description: "This preparation record is no longer valid. Returning to hub."
        });

        router.replace("/dashboard");
     }
  }, [mock, mockLoading, mockId, user, db, router, toast]);

  if (mockLoading) {
     return (
        <div className="h-screen flex flex-col items-center justify-center bg-white space-y-6">
           <Loader2 className="h-8 w-8 text-primary animate-spin" />
           <p className="text-[10px] font-black uppercase text-slate-300">Auditing Registry...</p>
        </div>
     );
  }

  if (!mock && mockId) return null; // Let useEffect handle redirect

  return <ResultClient />;
}
