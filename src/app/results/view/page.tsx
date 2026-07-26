"use client"

import React, { Suspense, useMemo, useEffect, useState } from "react"
import ResultClient from "@/components/results/ResultClient"
import { Loader2, Zap, AlertCircle } from "lucide-react"
import { useDoc, useFirestore, useUser } from "@/firebase"
import { doc, getDoc } from "firebase/firestore"
import { useRouter, useSearchParams } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"

/**
 * @fileOverview Universal Result Hub Viewer v5.0.
 * FIXED: Validates specific attemptId to ensure isolated source of truth.
 */

export default function ResultViewPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  if (!mounted) return (
    <div className="h-screen flex items-center justify-center bg-[#F8FAFC]">
      <Loader2 className="animate-spin text-primary h-10 w-10" />
    </div>
  );

  return (
    <Suspense fallback={<div className="h-screen flex items-center justify-center bg-[#F8FAFC]"><Loader2 className="animate-spin text-primary h-10 w-10" /></div>}>
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
  const attemptId = searchParams.get('attemptId');
  const [resultFound, setResultFound] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function verifyResult() {
      if (!db || !mockId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        // Source of Truth Registry Check
        const resultPath = attemptId && user 
          ? `results/${user.uid}_${mockId}_${attemptId}` 
          : user ? `results/${user.uid}_${mockId}` : null;

        if (resultPath) {
          const snap = await getDoc(doc(db, resultPath));
          setResultFound(snap.exists());
        } else if (searchParams.get('guest') === 'true') {
           // Guest logic check
           const guestRes = localStorage.getItem(`cracklix_guest_result_${mockId}`);
           setResultFound(!!guestRes);
        } else {
           setResultFound(false);
        }
      } catch (err) {
        console.error("[RESULT_GUARD_ERROR]:", err);
        setResultFound(false);
      } finally {
        setLoading(false);
      }
    }
    verifyResult();
  }, [db, mockId, attemptId, user, searchParams]);

  if (loading) {
     return (
        <div className="h-screen flex flex-col items-center justify-center bg-white space-y-6">
           <Zap className="h-10 w-10 text-primary animate-pulse" />
           <p className="text-[10px] font-black uppercase text-slate-300 tracking-[0.4em]">Synchronizing attempt...</p>
        </div>
     );
  }

  if (resultFound === false) {
     return (
        <div className="h-screen flex flex-col items-center justify-center text-center p-6 space-y-6 bg-[#F8FAFC]">
           <AlertCircle className="h-16 w-16 text-rose-500" />
           <div className="space-y-2">
              <h2 className="text-2xl font-black text-[#0F172A]">Registry entry not found</h2>
              <p className="text-slate-500 max-w-sm mx-auto">This test attempt node is no longer available in the master ledger.</p>
           </div>
           <Button onClick={() => router.push('/dashboard')} className="rounded-xl h-12 px-8">Return to portal</Button>
        </div>
     );
  }

  return <ResultClient />;
}