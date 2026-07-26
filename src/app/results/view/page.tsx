
"use client"

import React, { Suspense, useEffect, useState } from "react"
import ResultClient from "@/components/results/ResultClient"
import { Loader2, Zap, AlertCircle } from "lucide-react"
import { useFirestore, useUser } from "@/firebase"
import { doc, getDoc } from "firebase/firestore"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"

/**
 * @fileOverview Universal Result Hub Viewer v8.0 [Registry Resiliency Hub].
 * FIXED: Implemented an aggressive multi-path retry loop to handle propagation delays.
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
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    // Wait for auth to settle. If we're loading auth, don't start the search yet.
    if (authLoading || !db || !mockId) return;

    let isSubscribed = true;
    const MAX_RETRIES = 6; // Increased retries for extreme cases

    async function verifyRegistryNode() {
      try {
        if (retryCount === 0) setLoading(true);
        
        let activeAttemptId = attemptIdFromUrl;

        // 1. Resolve attempt ID if missing from URL
        if (!activeAttemptId && user) {
           const trackerSnap = await getDoc(doc(db, "attempts", `${user.uid}_${mockId}`));
           if (trackerSnap.exists()) {
              activeAttemptId = trackerSnap.data().attemptId;
           }
        }

        // 2. Multi-Path Registry Audit
        if (user) {
          // Check path A: with attemptId
          const pathA = activeAttemptId ? `${user.uid}_${mockId}_${activeAttemptId}` : null;
          // Check path B: legacy/base path
          const pathB = `${user.uid}_${mockId}`;

          const pathsToCheck = [pathA, pathB].filter(Boolean) as string[];
          
          for (const path of pathsToCheck) {
             const snap = await getDoc(doc(db, "results", path));
             if (snap.exists() && isSubscribed) {
                setResultFound(true);
                setLoading(false);
                return;
             }
          }
        } else {
           // Guest Path Check
           const guestRes = localStorage.getItem(`cracklix_guest_result_${mockId}`);
           if (guestRes && isSubscribed) {
              setResultFound(true);
              setLoading(false);
              return;
           }
        }

        // 3. Retry with Exponential Backoff
        if (retryCount < MAX_RETRIES) {
           const delay = 500 * Math.pow(1.5, retryCount);
           setTimeout(() => {
              if (isSubscribed) setRetryCount(prev => prev + 1);
           }, delay);
        } else {
           if (isSubscribed) {
              setResultFound(false);
              setLoading(false);
           }
        }
      } catch (err) {
        console.error("[AUDIT_ERROR]:", err);
        if (isSubscribed && retryCount >= MAX_RETRIES) {
           setResultFound(false);
           setLoading(false);
        }
      }
    }

    verifyRegistryNode();
    return () => { isSubscribed = false; };
  }, [db, mockId, attemptIdFromUrl, user, authLoading, retryCount]);

  if (loading) {
     return (
        <div className="h-screen flex flex-col items-center justify-center bg-white space-y-8 p-6">
           <div className="relative">
              <Zap className="h-14 w-14 text-primary animate-pulse" />
              <div className="absolute inset-0 border-2 border-primary/20 rounded-full animate-ping" />
           </div>
           <div className="text-center space-y-3">
              <p className="text-[11px] font-black uppercase text-[#0F172A] tracking-[0.4em]">Registry Handshake</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest max-w-[240px] text-center leading-relaxed">
                 Synchronizing performance node with the master ledger...
              </p>
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
              <h2 className="text-2xl md:text-3xl font-black text-[#0F172A] tracking-tight uppercase">Entry not found</h2>
              <p className="text-slate-500 font-medium text-sm md:text-lg max-w-sm mx-auto leading-relaxed">
                 We couldn't verify this attempt in the registry. Please ensure your connection is stable and try again.
              </p>
           </div>
           <div className="flex flex-col gap-3 w-full max-w-xs">
              <Button onClick={() => window.location.reload()} className="h-14 bg-primary text-white rounded-2xl font-bold border-none shadow-xl">Retry Audit</Button>
              <Button variant="ghost" onClick={() => router.push('/dashboard')} className="h-12 text-slate-400 font-bold uppercase text-[10px]">Back to portal</Button>
           </div>
        </div>
     );
  }

  return <ResultClient />;
}
