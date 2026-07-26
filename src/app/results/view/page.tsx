"use client"

import React, { Suspense, useMemo, useEffect, useState } from "react"
import ResultClient from "@/components/results/ResultClient"
import { Loader2, Zap, AlertCircle } from "lucide-react"
import { useFirestore, useUser } from "@/firebase"
import { doc, getDoc } from "firebase/firestore"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"

/**
 * @fileOverview Universal Result Hub Viewer v6.2 [Registry Hardened].
 * FIXED: Persistent institutional loader to prevent 'No Result' flash during sync.
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
  const { user, loading: authLoading } = useUser();

  const mockId = searchParams.get('id');
  const attemptIdFromUrl = searchParams.get('attemptId');
  const [resultFound, setResultFound] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Wait for auth to resolve
    if (authLoading) return;

    async function verifyRegistryNode() {
      // 2. Immediate exit if critical params are missing
      if (!db || !mockId) {
        setLoading(false);
        setResultFound(false);
        return;
      }

      try {
        setLoading(true);
        
        let activeAttemptId = attemptIdFromUrl;

        // 3. Resolve attempt ID for logged-in users
        if (!activeAttemptId && user) {
           const trackerSnap = await getDoc(doc(db, "attempts", `${user.uid}_${mockId}`));
           if (trackerSnap.exists()) {
              activeAttemptId = trackerSnap.data().attemptId;
           }
        }

        // 4. Primary Document Verification
        if (user) {
          const docId = activeAttemptId ? `${user.uid}_${mockId}_${activeAttemptId}` : `${user.uid}_${mockId}`;
          const snap = await getDoc(doc(db, "results", docId));
          
          if (!snap.exists() && !activeAttemptId) {
             // Second attempt check for older logic
             const fallbackSnap = await getDoc(doc(db, "results", `${user.uid}_${mockId}`));
             setResultFound(fallbackSnap.exists());
          } else {
             setResultFound(snap.exists());
          }
        } else {
           // 5. Guest Fallback
           const guestRes = localStorage.getItem(`cracklix_guest_result_${mockId}`);
           setResultFound(!!guestRes);
        }
      } catch (err) {
        setResultFound(false);
      } finally {
        // Only stop loading once the verdict is definitive
        setLoading(false);
      }
    }
    verifyRegistryNode();
  }, [db, mockId, attemptIdFromUrl, user, authLoading]);

  if (loading) {
     return (
        <div className="h-screen flex flex-col items-center justify-center bg-white space-y-8">
           <div className="relative">
              <Zap className="h-14 w-14 text-primary animate-pulse" />
              <div className="absolute inset-0 border-2 border-primary/20 rounded-full animate-ping" />
           </div>
           <div className="text-center space-y-2">
              <p className="text-[11px] font-black uppercase text-[#0F172A] tracking-[0.4em]">Registry Handshake</p>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Generating official analysis...</p>
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
              <h2 className="text-2xl md:text-3xl font-black text-[#0F172A] tracking-tight uppercase">Registry Entry Missing</h2>
              <p className="text-slate-500 font-medium text-sm md:text-lg max-w-sm mx-auto leading-relaxed">
                 We couldn't verify this test attempt in the master ledger. Please retake the test to sync your performance.
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
