
"use client"

import { useMemo, useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import { useDoc, useFirestore, useUser, useCollection } from "@/firebase"
import { doc, collection, query, where, getDocs, limit } from "firebase/firestore"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { 
  Clock, 
  BookOpen, 
  ShieldCheck, 
  ArrowRight, 
  ChevronLeft,
  Info,
  Lock,
  Zap,
  Gem,
  AlertCircle,
  History
} from "lucide-react"
import Link from "next/link"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

/**
 * @fileOverview Institutional Mock Node with Authentication & Tiered Attempt Guards.
 * UPDATED: Synchronized with Access Control (FREE/PREMIUM) requirements.
 */

export default function MockOverviewPage() {
  const params = useParams()
  const router = useRouter()
  const db = useFirestore()
  const { user, profile, loading: userLoading } = useUser()
  const mockId = params.id as string
  
  const { data: mock, loading: mockLoading } = useDoc<any>(useMemo(() => (db && mockId ? doc(db, "mocks", mockId) : null), [db, mockId]))
  
  const [isLocked, setIsLocked] = useState(false);
  const [accessChecked, setAccessChecked] = useState(false);
  const [previousAttempts, setPreviousAttempts] = useState<any[]>([]);

  useEffect(() => {
    async function checkAccessAndAttempts() {
      if (mockLoading) return;

      if (!mock || !db) {
        setAccessChecked(true);
        return;
      }

      // 1. Fetch User Results for this Mock
      if (user) {
         try {
           const qResults = query(collection(db, "results"), where("userId", "==", user.uid), where("mockId", "==", mockId));
           const resSnap = await getDocs(qResults);
           setPreviousAttempts(resSnap.docs.map(d => d.data()));
         } catch (e) {
           console.error("Attempt Fetch Error:", e);
         }
      }

      // 2. Pass Access Logic (Tiered Check)
      const mockTier = mock.accessType || 'FREE';
      
      if (mockTier === 'FREE') {
        setIsLocked(false);
        setAccessChecked(true);
        return;
      }

      if (profile?.role === 'ADMIN' || profile?.role === 'SUPER_ADMIN') {
        setIsLocked(false);
        setAccessChecked(true);
        return;
      }

      if (!user) {
        setIsLocked(true);
        setAccessChecked(true);
        return;
      }

      try {
        const subQuery = query(
          collection(db, "subscriptions"), 
          where("userId", "==", user.uid),
          where("status", "==", "active"),
          limit(1)
        );
        const subSnap = await getDocs(subQuery);
        
        let hasActivePass = false;
        if (!subSnap.empty) {
          const subData = subSnap.docs[0].data();
          const expiry = new Date(subData.expiryDate);
          if (expiry > new Date()) {
            hasActivePass = true;
          }
        }
        setIsLocked(!hasActivePass);
      } catch (e) {
        console.error("Access Audit Error:", e);
        setIsLocked(true);
      }
      setAccessChecked(true);
    }
    checkAccessAndAttempts();
  }, [mock, mockLoading, user, profile, db, mockId]);

  const attemptsLeft = useMemo(() => {
     if (!mock?.attemptLimit || mock.attemptLimit === 0) return Infinity;
     return Math.max(0, mock.attemptLimit - previousAttempts.length);
  }, [mock, previousAttempts]);

  const isLimitReached = attemptsLeft === 0;

  const handleStart = (e: React.MouseEvent) => {
    if (!user) {
      e.preventDefault();
      router.push(`/login?returnUrl=/mocks/${mockId}`);
      return;
    }
    if (isLocked) {
       e.preventDefault();
       router.push("/pass");
       return;
    }
    if (isLimitReached) {
       e.preventDefault();
       return;
    }
  };

  const showSkeleton = mockLoading || userLoading || (user && !accessChecked);

  if (showSkeleton) return (
    <div className="h-screen flex items-center justify-center bg-white">
      <Skeleton className="h-16 w-16 rounded-full animate-pulse" />
    </div>
  );

  if (!mock) return (
    <div className="h-screen flex flex-col items-center justify-center text-slate-400 gap-4">
      <Info className="h-12 w-12 opacity-10" />
      <p className="font-black uppercase tracking-widest text-xs">Registry node missing</p>
      <Button asChild variant="ghost" className="text-primary font-black uppercase text-[10px]">
        <Link href="/mocks">Back to List</Link>
      </Button>
    </div>
  );

  const isPremiumMock = (mock.accessType || 'FREE') === 'PREMIUM';

  return (
    <div className="min-h-screen bg-white flex flex-col font-body">
      <Navbar />
      
      <main className="flex-1">
        <section className="bg-slate-50 border-b border-slate-100 py-6 md:py-12">
          <div className="container mx-auto px-4 max-w-6xl text-left">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div className="flex items-start gap-4 flex-1">
                <Button variant="ghost" onClick={() => router.back()} className="rounded-full h-10 w-10 border border-slate-200 bg-white flex items-center justify-center text-slate-400 p-0">
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                      <Badge className={cn("border-none px-3 py-0.5 rounded font-black uppercase text-[8px] tracking-widest shadow-sm", isPremiumMock ? "bg-amber-100 text-amber-600" : "bg-emerald-50 text-emerald-600")}>
                        {isPremiumMock ? "PREMIUM SERIES" : "FREE SERIES"}
                      </Badge>
                      {isLocked && <Badge className="bg-slate-100 text-slate-500 border-none px-3 py-0.5 rounded font-black uppercase text-[8px] tracking-widest flex items-center gap-1"><Lock className="h-3 w-3" /> PASS REQUIRED</Badge>}
                  </div>
                  <h1 className="text-xl md:text-4xl font-headline font-black text-[#0F172A] uppercase leading-tight tracking-tight">{mock.title}</h1>
                  <div className="flex items-center gap-6 pt-1 text-slate-500 font-bold text-[10px] md:text-sm uppercase tracking-widest">
                      <span className="flex items-center gap-2"><Clock className="h-4 w-4 text-primary" /> {mock.duration} Mins</span>
                      <span className="flex items-center gap-2"><BookOpen className="h-4 w-4 text-primary" /> {mock.totalQuestions} Qs</span>
                      {mock.attemptLimit > 0 && <span className="flex items-center gap-2 text-rose-500"><History className="h-4 w-4" /> {attemptsLeft} Attempts Left</span>}
                  </div>
                </div>
              </div>

              <div className="w-full md:w-auto">
                 {isLocked ? (
                    <Button asChild className="w-full h-14 md:h-16 px-10 bg-amber-500 hover:bg-amber-600 text-white font-black uppercase tracking-widest text-[10px] rounded-xl shadow-xl gap-3">
                      <Link href="/pass"><Lock className="h-4 w-4" /> Unlock with Pass</Link>
                    </Button>
                 ) : isLimitReached ? (
                    <div className="bg-rose-50 border border-rose-100 p-4 rounded-xl flex items-center gap-4 text-left">
                       <AlertCircle className="h-8 w-8 text-rose-600" />
                       <div>
                          <p className="text-[10px] font-black uppercase text-rose-700 tracking-widest leading-none mb-1">Attempt Limit Reached</p>
                          <p className="text-xs font-bold text-rose-500 uppercase leading-none">Max {mock.attemptLimit} attempts audited.</p>
                       </div>
                    </div>
                 ) : (
                    <Button asChild onClick={handleStart} className="w-full h-14 md:h-16 px-10 bg-[#0F172A] hover:bg-black text-white font-black uppercase tracking-widest text-[10px] rounded-xl shadow-xl gap-3 group border-none">
                      <Link href={`/mocks/${mockId}/instructions`}>Start Practice <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" /></Link>
                    </Button>
                 )}
              </div>
            </div>
          </div>
        </section>

        <div className="container mx-auto px-4 py-8 max-w-6xl text-left">
           <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
              <div className="lg:col-span-8 space-y-8">
                 <div className="bg-slate-50 rounded-3xl p-8 border border-slate-100 space-y-6">
                    <h3 className="text-lg font-headline font-black uppercase text-[#0F172A] flex items-center gap-3"><Info className="h-5 w-5 text-primary" /> Institutional Guidelines</h3>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       <GuidelineItem text="Authentication node required for evaluation." />
                       <GuidelineItem text="Negative marking (-0.25) active for mismatched nodes." />
                       <GuidelineItem text={`Attempt Limit: ${mock.attemptLimit > 0 ? mock.attemptLimit + ' Max' : 'Unlimited'}`} />
                       <GuidelineItem text="Official 2026 marking scheme applied." />
                    </ul>
                 </div>
              </div>
           </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

function GuidelineItem({ text }: { text: string }) {
   return (
      <li className="flex gap-3 items-start">
         <ShieldCheck className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
         <span className="text-[11px] font-bold text-slate-500 uppercase tracking-tight">{text}</span>
      </li>
   )
}
