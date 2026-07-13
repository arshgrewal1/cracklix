
"use client"

import React, { Suspense, useMemo, useEffect, useState } from "react"
import ResultClient from "@/components/results/ResultClient"
import { Loader2, Zap } from "lucide-react"
import { useDoc, useFirestore, useUser } from "@/firebase"
import { doc, deleteDoc, getDoc } from "firebase/firestore"
import { useRouter, useSearchParams } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

/**
 * @fileOverview Universal Result Hub Viewer v3.2.
 * FIXED: Support for daily_quizzes in the Result Guard to prevent incorrect redirects.
 */

export default function ResultViewPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return (
    <div className="h-screen flex items-center justify-center bg-white">
      <Loader2 className="animate-spin text-primary" />
    </div>
  );

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
  const [mock, setMock] = useState<any>(null);
  const [mockLoading, setMockLoading] = useState(true);

  useEffect(() => {
    async function verifyMock() {
      if (!db || !mockId) {
        setMockLoading(false);
        return;
      }

      try {
        // Check standard mocks first
        let snap = await getDoc(doc(db, "mocks", mockId));
        if (!snap.exists()) {
          // Check daily quizzes
          snap = await getDoc(doc(db, "daily_quizzes", mockId));
        }

        if (snap.exists()) {
          setMock(snap.data());
        }
      } catch (err) {
        console.error("[RESULT_GUARD_ERROR]:", err);
      } finally {
        setMockLoading(false);
      }
    }
    verifyMock();
  }, [db, mockId]);

  useEffect(() => {
     if (!mockLoading && mockId && !mock && user && db) {
        console.log("[AUDIT] Orphan result link detected. Cleaning record...");
        const resultId = `${user.uid}_${mockId}`;
        
        deleteDoc(doc(db, "results", resultId)).catch(() => {});
        
        toast({
           variant: "destructive",
           title: "Registry Mismatch",
           description: "This record is no longer valid. Returning to dashboard."
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

  if (!mock && mockId) return null;

  return <ResultClient />;
}
