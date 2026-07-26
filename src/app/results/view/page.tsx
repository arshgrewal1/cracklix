"use client"

import React, { Suspense, useMemo, useEffect, useState } from "react"
import ResultClient from "@/components/results/ResultClient"
import { Loader2, Zap, AlertCircle } from "lucide-react"
import { useFirestore, useUser } from "@/firebase"
import { doc, getDoc } from "firebase/firestore"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"

/**
 * @fileOverview Universal Result Hub Viewer v6.0 [Attempt Guard].
 * Hardened: Enforces unique attempt-id synchronization for immutable data display.
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

  const mockId = searchParams.get('id');
  const attemptIdFromUrl = searchParams.get('attemptId');
  const [resultFound, setResultFound] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function verifyRegistryNode() {
      if (!db || !mockId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // 1. Resolve exact attempt reference
        let activeAttemptId = attemptIdFromUrl;

        // 2. If no attemptId in URL, try to resolve latest from user's attempt tracker
        if (!activeAttemptId && user) {
           const trackerSnap = await getDoc(doc(db, "attempts", `${user.uid}_${mockId}`));
           if (trackerSnap.exists()) {
              activeAttemptId = trackerSnap.data().attemptId;
           }
        }

        // 3. Final Verification in Results Collection
        if (activeAttemptId && user) {
          const resultPath = `results/${user.uid}_${mockId}_${activeAttemptId}`;
          const snap = await getDoc(doc(db, resultPath));
          
          if (!snap.exists()) {
             // Fallback for legacy items (no attemptId in path)
             const legacySnap = await getDoc(doc(db, `results/${user.uid}_${mockId}`));
             setResultFound(legacySnap.exists());
          } else {
             setResultFound(true);
          }
        } else if (searchParams.get('guest') === 'true') {
           const guestRes = localStorage.getItem(`cracklix_guest_result_${mockId}`);
           setResultFound(!!guestRes);
        } else {
           setResultFound(false);
        }
      } catch (err) {
        console.error("[RESULT_GUARD_AUDIT_FAILURE]:", err);
        setResultFound(false);
      } finally {
        setLoading(false);
      }
    }
    verifyRegistryNode();
  }, [db, mockId, attemptIdFromUrl, user, searchParams]);

  if (loading) {
     return (
        <div className="h-screen flex flex-col items-center justify-center bg-white space-y-6">
           <Zap className="h-10 w-10 text-primary animate-pulse" />
           <div className="text-center space-y-2">
              <p className="text-[10px] font-black uppercase text-[#0F172A] tracking-[0.4em]">Audit handshake</p>
              <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Verifying unique attempt node...</p>
           </div>
        </div>
     );
  }

  if (resultFound === false) {
     return (
        <div className="h-screen flex flex-col items-center justify-center text-center p-6 space-y-8 bg-[#F8FAFC]">
           <div className="h-20 w-20 bg-rose-50 rounded-[2rem] flex items-center justify-center text-rose-500 shadow-xl border border-rose-100">
              <AlertCircle className="h-10 w-10" />
           </div>
           <div className="space-y-3">
              <h2 className="text-2xl md:text-3xl font-black text-[#0F172A] tracking-tight uppercase">Registry entry missing</h2>
              <p className="text-slate-500 font-medium text-sm md:text-lg max-w-sm mx-auto leading-relaxed">
                 This test attempt node could not be verified in the master ledger. Retake the test to generate a fresh snapshot.
              </p>
           </div>
           <div className="flex flex-col gap-3 w-full max-w-xs">
              <Button onClick={() => router.push('/mocks')} className="h-14 bg-primary text-white rounded-2xl font-bold border-none shadow-xl">Browse Tests</Button>
              <Button variant="ghost" onClick={() => router.push('/dashboard')} className="h-12 text-slate-400 font-bold uppercase text-[10px]">Back to Portal</Button>
           </div>
        </div>
     );
  }

  return <ResultClient />;
}