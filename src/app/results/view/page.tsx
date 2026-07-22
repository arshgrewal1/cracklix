"use client"

import React, { Suspense, useMemo, useEffect, useState } from "react"
import ResultClient from "@/components/results/ResultClient"
import { Loader2, Zap } from "lucide-react"
import { useDoc, useFirestore, useUser } from "@/firebase"
import { doc, getDoc } from "firebase/firestore"
import { useRouter, useSearchParams } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

/**
 * @fileOverview Universal Result Hub Viewer v4.1.
 * UPDATED: Refined terminology and removed technical uppercase.
 */

export default function ResultViewPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return (
    <div className="h-screen flex items-center justify-center bg-[#F8FAFC]">
      <Loader2 className="animate-spin text-primary h-10 w-10" />
    </div>
  );

  return (
    <Suspense fallback={<div className="h-screen flex items-center justify-center bg-[#F8FAFC]"><Loader2 className="animate-spin text-primary" /></div>}>
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
        console.warn("[AUDIT] Orphan result link detected. Validating registry entry...");
        
        toast({
           variant: "destructive",
           title: "Registry standby",
           description: "Verification entry pending. Returning to portal."
        });

        router.replace("/dashboard");
     }
  }, [mock, mockLoading, mockId, user, db, router, toast]);

  if (mockLoading) {
     return (
        <div className="h-screen flex flex-col items-center justify-center bg-white space-y-6">
           <Zap className="h-10 w-10 text-primary animate-pulse" />
           <p className="text-[10px] font-black uppercase text-slate-300 tracking-[0.4em]">Auditing registry...</p>
        </div>
     );
  }

  // Allow guest viewing if guest param is present, otherwise block if no mock node
  const isGuest = searchParams.get('guest') === 'true';
  if (!mock && !isGuest) return null;

  return <ResultClient />;
}
