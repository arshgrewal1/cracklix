
"use client"

import { useMemo, useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import { useDoc, useFirestore, useUser } from "@/firebase"
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
  Play,
  AlertCircle
} from "lucide-react"
import Link from "next/link"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

/**
 * @fileOverview Individual Mock Gateway v14.0.
 * HARDENED: Direct entrance audit with strict [RUNTIME_VAL] console telemetry.
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
    async function checkAccess() {
      if (mockLoading) return;
      if (!mock || !db) { setAccessChecked(true); return; }

      const tier = (mock.accessLevel || mock.accessType || 'FREE').trim().toUpperCase();
      const isPremium = tier === 'PREMIUM';
      
      if (user) {
         try {
           const resSnap = await getDocs(query(collection(db, "results"), where("userId", "==", user.uid), where("mockId", "==", mockId), limit(1)));
           setPreviousAttempts(resSnap.docs.map(d => d.data()));
         } catch (e) {}
      }

      // 1. ADMIN BYPASS
      const isAdmin = profile?.role === 'ADMIN' || profile?.role === 'SUPER_ADMIN';
      
      // 2. PASS HUB AUDIT
      let hasActivePass = false;
      if (isAdmin) {
         hasActivePass = true;
      } else if (profile?.pass && profile.pass.active === true) {
         const expiry = new Date(profile.pass.expiryDate);
         const now = new Date();
         if (expiry > now) hasActivePass = true;
      }
      
      // 3. LOCK LOGIC
      const locked = isPremium && !hasActivePass;

      // CRITICAL AUDIT LOG
      console.log(`[RUNTIME_VAL] GATEWAY_AUDIT | MOCK: "${mock.title}" | tier: "${tier}" | isPassActive: ${hasActivePass} | isLocked: ${locked}`);

      setIsLocked(locked);
      setAccessChecked(true);
    }
    checkAccess();
  }, [mock, mockLoading, user, profile, db, mockId]);

  const attemptsLeft = useMemo(() => {
     if (!mock?.attemptLimit || mock.attemptLimit === 0) return Infinity;
     return Math.max(0, mock.attemptLimit - previousAttempts.length);
  }, [mock, previousAttempts]);

  const isLimitReached = attemptsLeft === 0;

  if (mockLoading || userLoading || (user && !accessChecked)) return <div className="h-screen flex items-center justify-center bg-white"><Skeleton className="h-16 w-16 rounded-full animate-pulse" /></div>;

  if (!mock) return <div className="h-screen flex flex-col items-center justify-center text-slate-400 gap-4"><Info className="h-12 w-12 opacity-10" /><p className="font-black uppercase tracking-widest text-xs">Registry node missing</p></div>;

  const tier = (mock.accessLevel || mock.accessType || 'FREE').trim().toUpperCase();
  const isPremium = tier === 'PREMIUM';

  return (
    <div className="min-h-screen bg-white flex flex-col font-body">
      <Navbar />
      <main className="flex-1 text-left">
        <section className="bg-slate-50 border-b border-slate-100 py-8 md:py-12">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div className="flex items-start gap-4 flex-1">
                <Button variant="ghost" onClick={() => router.back()} className="rounded-full h-10 w-10 border border-slate-200 bg-white p-0"><ChevronLeft className="h-5 w-5" /></Button>
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                      <Badge className={cn(
                        "border-none text-[8px] font-black px-2 py-0.5 rounded uppercase tracking-widest shadow-sm", 
                        isPremium ? "bg-amber-100 text-amber-600" : "bg-emerald-50 text-emerald-600"
                      )}>
                        {isPremium ? 'PREMIUM HUB' : 'FREE ACCESS'}
                      </Badge>
                  </div>
                  <h1 className="text-xl md:text-4xl font-headline font-black text-[#0F172A] uppercase leading-tight tracking-tight">{mock.title}</h1>
                  <div className="flex items-center gap-6 pt-1 text-slate-500 font-bold text-[10px] md:text-sm uppercase tracking-widest">
                      <span className="flex items-center gap-2"><Clock className="h-4 w-4 text-primary" /> {mock.duration} Mins</span>
                      <span className="flex items-center gap-2"><BookOpen className="h-4 w-4 text-primary" /> {mock.totalQuestions} Qs</span>
                  </div>
                </div>
              </div>
              <div className="w-full md:w-auto">
                 {isLocked ? (
                    <Button onClick={() => router.push('/pass')} className="w-full h-14 md:h-16 px-10 bg-orange-500 hover:bg-orange-600 text-white font-black uppercase tracking-widest text-[11px] rounded-2xl shadow-xl gap-3 border-none transition-all active:scale-95 flex items-center justify-center"
                    >
                      <Lock className="h-5 w-5" /> UNLOCK WITH PASS
                    </Button>
                 ) : isLimitReached ? (
                    <div className="bg-rose-50 border border-rose-100 p-4 rounded-xl flex items-center gap-4 text-left shadow-sm">
                       <AlertCircle className="h-8 w-8 text-rose-600" />
                       <div><p className="text-[10px] font-black uppercase text-rose-700 tracking-widest leading-none mb-1">Attempt Limit Reached</p><p className="text-xs font-bold text-rose-500 uppercase leading-none">Max {mock.attemptLimit} attempts audited.</p></div>
                    </div>
                 ) : (
                    <Button asChild className="w-full h-14 md:h-16 px-10 bg-[#0F172A] hover:bg-black text-white font-black uppercase tracking-widest text-[11px] rounded-2xl shadow-xl border-none transition-all active:scale-95">
                      <Link href={`/mocks/${mockId}/instructions`} className="flex items-center justify-center gap-3"><Play className="h-5 w-5 fill-current" /> ATTEMPT NOW <ArrowRight className="h-4 w-4" /></Link>
                    </Button>
                 )}
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
