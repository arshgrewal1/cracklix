
"use client"

import { useMemo, useEffect, useState } from "react"
import { useParams, useRouter, usePathname } from "next/navigation"
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
  AlertCircle,
  Home,
  Target
} from "lucide-react"
import Link from "next/link"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

/**
 * @fileOverview Individual Mock Gateway v19.6.
 * FIXED: Resolved JSX syntax errors and unmatched brackets.
 */

const SUPER_ADMIN_WHITELIST = ['arshdeepgrewal1122@gmail.com'];

export default function MockOverviewPage() {
  const params = useParams()
  const router = useRouter()
  const pathname = usePathname()
  const db = useFirestore()
  const { user, profile, loading: userLoading } = useUser()
  const mockId = params.id as string
  
  const { data: mock, loading: mockLoading } = useDoc<any>(useMemo(() => (db && mockId ? doc(db, "mocks", mockId) : null), [db, mockId]))
  
  const [isLocked, setIsLocked] = useState(false);
  const [accessChecked, setAccessChecked] = useState(false);
  const [previousAttempts, setPreviousAttempts] = useState<any[]>([]);

  useEffect(() => {
    if (!userLoading && !user) {
       router.push(`/login?returnUrl=${encodeURIComponent(pathname)}`);
    }
  }, [user, userLoading, router, pathname]);

  useEffect(() => {
    async function checkAccess() {
      if (mockLoading || !user) return;
      if (!mock || !db) { setAccessChecked(true); return; }

      const tier = (mock.accessLevel || mock.accessType || 'FREE').trim().toUpperCase();
      const isPremium = tier === 'PREMIUM';
      
      try {
        const resSnap = await getDocs(query(collection(db, "results"), where("userId", "==", user.uid), where("mockId", "==", mockId), limit(1)));
        setPreviousAttempts(resSnap.docs.map(d => d.data()));
      } catch (e) {}

      const userEmail = user?.email?.toLowerCase();
      const isFounder = userEmail && SUPER_ADMIN_WHITELIST.includes(userEmail);
      const isAdmin = profile?.role === 'ADMIN' || profile?.role === 'SUPER_ADMIN' || isFounder;
      
      let hasActivePass = false;
      if (isAdmin) {
         hasActivePass = true;
      } else if (profile?.pass && profile.pass.active === true) {
         const expiry = new Date(profile.pass.expiryDate);
         const now = new Date();
         if (expiry > now) hasActivePass = true;
      }
      
      const locked = isPremium && !hasActivePass;
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

  if (mockLoading || userLoading || (user && !accessChecked)) return (
    <div className="h-screen flex flex-col items-center justify-center bg-white space-y-6">
       <Zap className="h-12 w-12 text-primary animate-pulse" />
       <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-300">Synchronizing Prep Node...</p>
    </div>
  );

  if (!user) return null;

  if (!mock) return (
    <div className="h-screen flex flex-col items-center justify-center text-slate-400 gap-8 bg-white p-6">
       <div className="h-24 w-24 bg-slate-50 rounded-[2.5rem] flex items-center justify-center border border-slate-100 shadow-inner">
          <Info className="h-10 w-10 opacity-20" />
       </div>
       <div className="text-center space-y-2">
          <p className="font-black uppercase tracking-[0.3em] text-[10px] text-slate-400">Registry Sync Error</p>
          <h2 className="text-3xl font-headline font-black text-[#0F172A] uppercase">Test Not Found</h2>
          <p className="text-sm font-medium text-slate-500 max-w-xs mx-auto">This preparation series might have been archived or removed from the live registry.</p>
       </div>
       <Button asChild className="h-14 px-10 bg-[#0F172A] hover:bg-black text-white font-black uppercase text-[10px] tracking-widest rounded-2xl shadow-xl gap-3">
          <Link href="/"><Home className="h-4 w-4" /> Return to Hub</Link>
       </Button>
    </div>
  );

  const tier = (mock.accessLevel || mock.accessType || 'FREE').trim().toUpperCase();
  const isPremium = tier === 'PREMIUM';

  return (
    <div className="min-h-screen bg-white flex flex-col font-body">
      <Navbar />
      <main className="flex-1 text-left">
        <section className="bg-slate-50 border-b border-slate-100 py-8 md:py-24">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-10">
              <div className="flex items-start gap-4 flex-1">
                <Button variant="ghost" onClick={() => router.back()} className="rounded-full h-12 w-12 border border-slate-200 bg-white p-0 shadow-sm"><ChevronLeft className="h-6 w-6" /></Button>
                <div className="space-y-5">
                  <div className="flex flex-wrap items-center gap-3">
                      <Badge className={cn(
                        "border-none text-[8px] md:text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-[0.2em] shadow-lg", 
                        isPremium ? "bg-amber-100 text-amber-600 shadow-amber-500/10" : "bg-emerald-50 text-emerald-600 shadow-emerald-500/10"
                      )}>
                        {isPremium ? '🔒 PREMIUM TEST' : 'FREE TEST'}
                      </Badge>
                      {mock.attemptLimit > 0 && (
                        <Badge variant="outline" className="text-[10px] font-black uppercase border-slate-200 text-slate-400 px-3 py-1 rounded-full">
                           Limit: {mock.attemptLimit} Attempts
                        </Badge>
                      )}
                  </div>
                  <h1 className="text-3xl md:text-6xl font-headline font-black text-[#0F172A] uppercase leading-[0.95] tracking-tighter max-w-2xl">{mock.title}</h1>
                  <div className="flex items-center gap-8 pt-4 text-slate-500 font-bold text-xs md:text-lg uppercase tracking-widest">
                      <span className="flex items-center gap-2.5"><Clock className="h-5 w-5 text-primary" /> {mock.duration} Mins</span>
                      <span className="flex items-center gap-2.5"><BookOpen className="h-5 w-5 text-primary" /> {mock.totalQuestions} Qs</span>
                      {!isLocked && mock.attemptLimit > 0 && (
                        <span className="flex items-center gap-2.5"><Target className="h-5 w-5 text-emerald-500" /> {attemptsLeft} Left</span>
                      )}
                  </div>
                </div>
              </div>
              <div className="w-full md:w-auto pt-6 md:pt-0">
                 {isLocked ? (
                    <Button onClick={() => router.push('/pass')} className="w-full h-16 md:h-20 px-12 md:px-16 bg-orange-500 hover:bg-orange-600 text-white font-black uppercase tracking-[0.2em] text-[11px] md:text-sm rounded-[1.5rem] md:rounded-[2.5rem] shadow-4xl gap-4 border-none transition-all active:scale-95 flex items-center justify-center">
                      <Lock className="h-5 w-5 md:h-7 md:w-7" /> UNLOCK TEST
                    </Button>
                 ) : isLimitReached ? (
                    <div className="bg-rose-50 border-2 border-rose-100 p-8 rounded-[2rem] flex items-center gap-6 text-left shadow-2xl">
                       <AlertCircle className="h-10 w-10 text-rose-600" />
                       <div><p className="text-xs font-black uppercase text-rose-700 tracking-widest mb-1">Limit Reached</p><p className="text-lg font-bold text-rose-500 uppercase leading-none">Max attempts audited.</p></div>
                    </div>
                 ) : (
                    <Button asChild className="w-full h-16 md:h-20 px-12 md:px-20 bg-[#0F172A] hover:bg-black text-white font-black uppercase tracking-[0.2em] text-[11px] md:text-sm rounded-[1.5rem] md:rounded-[2.5rem] shadow-4xl border-none transition-all active:scale-95">
                      <Link href={`/mocks/${mockId}/instructions`} className="flex items-center justify-center gap-4"><Play className="h-6 w-6 fill-current" /> START TEST <ArrowRight className="h-5 w-5" /></Link>
                    </Button>
                 )}
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 bg-white">
           <div className="container mx-auto px-4 max-w-6xl">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                 <FeatureNode icon={<ShieldCheck className="text-emerald-500" />} title="Verified Hub" desc="Official board patterns" />
                 <FeatureNode icon={<Zap className="text-primary" />} title="Logic Solutions" desc="Step-by-step explanations" />
                 <FeatureNode icon={<Target className="text-blue-500" />} title="State Rankings" desc="See where you stand" />
              </div>
           </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}

function FeatureNode({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div className="p-10 rounded-[2.5rem] bg-slate-50 border border-slate-100 space-y-4 text-center">
      <div className="h-14 w-14 bg-white rounded-2xl flex items-center justify-center mx-auto shadow-xl">{icon}</div>
      <h3 className="text-xl font-black text-[#0F172A] uppercase">{title}</h3>
      <p className="text-slate-400 font-bold uppercase text-[9px] tracking-widest">{desc}</p>
    </div>
  );
}
