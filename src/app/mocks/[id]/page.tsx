"use client"

import { useMemo, useEffect, useState } from "react"
import { useParams, useRouter, usePathname } from "next/navigation"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import { useDoc, useFirestore, useUser } from "@/firebase"
import { doc, collection, query, where, getDocs, limit, getDoc } from "firebase/firestore"
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
  Target,
  RefreshCw
} from "lucide-react"
import Link from "next/link"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

/**
 * @fileOverview Individual Mock Gateway v25.0 (Ultra-Compact).
 * UPDATED: Drastically reduced typography and padding for mobile visibility.
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
  const [activeAttempt, setActiveAttempt] = useState<any>(null);
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
        const attemptSnap = await getDoc(doc(db, "attempts", `${user.uid}_${mockId}`));
        if (attemptSnap.exists()) {
           setActiveAttempt(attemptSnap.data());
        }

        const resSnap = await getDocs(query(collection(db, "results"), where("userId", "==", user.uid), where("mockId", "==", mockId)));
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

  const isLimitReached = attemptsLeft === 0 && (!activeAttempt || activeAttempt.status === 'COMPLETED');
  const isResumable = activeAttempt && activeAttempt.status === 'IN_PROGRESS';

  if (mockLoading || userLoading || (user && !accessChecked)) return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-white space-y-6">
       <Zap className="h-12 w-12 text-primary animate-pulse" />
       <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-300">Syncing Prep Item...</p>
    </div>
  );

  if (!user) return null;

  if (!mock) return (
    <div className="h-screen flex flex-col items-center justify-center text-slate-400 gap-8 bg-white p-6">
       <div className="h-24 w-24 bg-slate-50 rounded-[2.5rem] flex items-center justify-center border border-slate-100 shadow-inner">
          <Info className="h-10 w-10 opacity-20" />
       </div>
       <div className="text-center space-y-2">
          <p className="font-black uppercase tracking-[0.3em] text-[10px] text-slate-400">Sync Error</p>
          <h2 className="text-3xl font-headline font-black text-[#0F172A] uppercase">Test Not Found</h2>
          <p className="text-sm font-medium text-slate-500 max-w-xs mx-auto">This preparation item might have been archived or removed from the official list.</p>
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
        <section className="bg-slate-50 border-b border-slate-100 py-4 md:py-8 lg:py-10">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="flex items-start gap-4 flex-1">
                <Button variant="ghost" onClick={() => router.back()} className="rounded-full h-8 w-8 md:h-10 md:w-10 border border-slate-200 bg-white p-0 shadow-sm shrink-0"><ChevronLeft className="h-4 w-4" /></Button>
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                      <Badge className={cn(
                        "border-none text-[6px] md:text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest shadow-md", 
                        isPremium ? "bg-amber-100 text-amber-600" : "bg-emerald-50 text-emerald-600"
                      )}>
                        {isPremium ? '🔒 PREMIUM' : 'FREE'}
                      </Badge>
                  </div>
                  <h1 className="text-lg md:text-3xl lg:text-4xl font-headline font-black text-[#0F172A] uppercase leading-[1.1] tracking-tight max-w-2xl">{mock.title}</h1>
                  <div className="flex items-center gap-4 pt-1 text-slate-500 font-bold text-[8px] md:text-sm uppercase tracking-widest">
                      <span className="flex items-center gap-1.5"><Clock className="h-3 w-3 text-primary" /> {mock.duration}m</span>
                      <span className="flex items-center gap-1.5"><BookOpen className="h-3 w-3 text-primary" /> {mock.totalQuestions} Qs</span>
                  </div>
                </div>
              </div>
              <div className="w-full md:w-auto pt-2 md:pt-0">
                 {isLocked ? (
                    <Button onClick={() => router.push('/pass')} className="w-full h-10 md:h-12 px-6 bg-orange-500 hover:bg-orange-600 text-white font-black uppercase tracking-widest text-[8px] md:text-[10px] rounded-lg shadow-lg border-none transition-all active:scale-95">
                      <Lock className="h-3.5 w-3.5 mr-2" /> UNLOCK TEST
                    </Button>
                 ) : isLimitReached ? (
                    <Button asChild variant="outline" className="w-full h-10 rounded-lg border-slate-200 font-black uppercase text-[8px] tracking-widest gap-2">
                       <Link href={`/results/${mockId}`}><Target className="h-3 w-3" /> View Result</Link>
                    </Button>
                 ) : (
                    <Button asChild className="w-full h-11 md:h-14 px-8 bg-[#0F172A] hover:bg-black text-white font-black uppercase tracking-[0.2em] text-[9px] md:text-[10px] rounded-xl shadow-2xl border-none transition-all active:scale-95">
                      <Link href={`/mocks/${mockId}/instructions`} className="flex items-center justify-center gap-2">
                        {isResumable ? <RefreshCw className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5 fill-current text-primary" />} 
                        {isResumable ? 'RESUME' : 'START TEST'}
                      </Link>
                    </Button>
                 )}
              </div>
            </div>
          </div>
        </section>

        <section className="py-6 md:py-10 bg-white">
           <div className="container mx-auto px-4 max-w-6xl">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-6">
                 <FeatureNode icon={<ShieldCheck className="text-emerald-500 h-4 w-4" />} title="Official Hub" desc="Official Patterns" />
                 <FeatureNode icon={<Zap className="text-primary h-4 w-4" />} title="Solutions" desc="Logic Explained" />
                 <FeatureNode icon={<Target className="text-blue-500 h-4 w-4" />} title="Rankings" desc="State Merit" />
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
    <div className="p-3 md:p-5 rounded-xl bg-slate-50 border border-slate-100 space-y-1 text-center group hover:bg-white hover:shadow-lg transition-all">
      <div className="h-7 w-7 md:h-9 md:w-9 bg-white rounded-lg flex items-center justify-center mx-auto shadow-sm group-hover:scale-110 transition-transform">{icon}</div>
      <h3 className="text-[10px] md:text-xs font-black text-[#0F172A] uppercase tracking-tight">{title}</h3>
      <p className="text-slate-400 font-bold uppercase text-[6px] md:text-[8px] tracking-widest">{desc}</p>
    </div>
  );
}
