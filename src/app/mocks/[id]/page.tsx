"use client"

import React, { useMemo, useEffect, useState } from "react"
import { useParams, useRouter, usePathname } from "next/navigation"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import { useDoc, useFirestore, useUser } from "@/firebase"
import { doc, collection, query, where, getDocs, limit, getDoc } from "firebase/firestore"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
  RefreshCw,
  Smartphone,
  Layers,
  LucideIcon
} from "lucide-react"
import Link from "next/link"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

/**
 * @fileOverview Individual Mock Gateway v32.2 (Hardened Types).
 * FIXED: Removed React.cloneElement in favor of direct component reference rendering for type safety.
 */

const SUPER_ADMIN_WHITELIST = ['arshdeepgrewal1122@gmail.com'];

export default function MockOverviewPage() {
  const params = useParams()
  const router = useRouter()
  const pathname = usePathname()
  const db = useFirestore()
  const { user, profile, loading: userLoading, isDeviceAuthorized } = useUser()
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

  const isPremiumMock = mock && (mock.accessLevel || mock.accessType || 'FREE').trim().toUpperCase() === 'PREMIUM';
  const showDeviceBlock = isPremiumMock && !isDeviceAuthorized;

  if (mockLoading || userLoading || (user && !accessChecked)) return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-white space-y-6">
       <Zap className="h-12 w-12 text-primary animate-pulse" />
       <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-300">Synchronizing Prep Node...</p>
    </div>
  );

  if (!user) return null;

  if (!mock) return (
    <div className="h-screen flex flex-col items-center justify-center text-slate-400 gap-10 bg-white p-8">
       <div className="h-28 w-28 bg-slate-50 rounded-[3rem] flex items-center justify-center border border-slate-100 shadow-inner">
          <Info className="h-12 w-12 opacity-20" />
       </div>
       <div className="text-center space-y-3">
          <p className="font-black uppercase tracking-[0.3em] text-[10px] text-slate-400">Registry Failure</p>
          <h2 className="text-3xl md:text-5xl font-headline font-black text-[#0F172A] uppercase tracking-tight">Test Not Found</h2>
          <p className="text-sm md:text-lg font-medium text-slate-500 max-sm mx-auto leading-relaxed">This preparation item might have been archived or removed from the official registry.</p>
       </div>
       <Button asChild className="h-16 px-12 bg-[#0F172A] hover:bg-black text-white font-black uppercase text-[11px] tracking-[0.2em] rounded-2xl shadow-3xl gap-3 active:scale-95 border-none">
          <Link href="/"><Home className="h-4 w-4" /> Return Dashboard</Link>
       </Button>
    </div>
  );

  if (showDeviceBlock) return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
       <Navbar />
       <div className="max-w-md w-full bg-white rounded-[3rem] p-12 shadow-5xl border border-slate-100 space-y-8 animate-in fade-in zoom-in-95 duration-500">
          <div className="h-24 w-24 bg-rose-50 rounded-[2.5rem] flex items-center justify-center mx-auto text-rose-500 shadow-xl border border-rose-100">
             <Smartphone className="h-12 w-12" />
          </div>
          <div className="space-y-3 text-left">
             <h2 className="text-2xl md:text-3xl font-headline font-black text-[#0F172A] uppercase text-center tracking-tight">Security Lock</h2>
             <p className="text-slate-500 font-medium leading-relaxed text-center text-sm md:text-base px-2">
                This premium test is locked to your physical registered device. You are attempting to access from an unauthorized node.
             </p>
          </div>
          <Button asChild className="w-full h-16 md:h-20 bg-[#0F172A] text-white rounded-2xl md:rounded-3xl font-black uppercase text-[10px] md:text-[12px] tracking-[0.2em] shadow-4xl border-none active:scale-95">
             <Link href="/profile">Manage Device Hub</Link>
          </Button>
       </div>
       <Footer />
    </div>
  );

  const tier = (mock.accessLevel || mock.accessType || 'FREE').trim().toUpperCase();
  const isPremium = tier === 'PREMIUM';

  return (
    <div className="min-h-screen bg-white flex flex-col font-body overflow-x-hidden">
      <Navbar />
      <main className="flex-1 text-left pb-20">
        <section className="bg-slate-50 border-b border-slate-100 py-8 md:py-16">
          <div className="container mx-auto px-4 md:px-8 max-w-7xl">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 md:gap-16">
              <div className="flex items-start gap-5 md:gap-8 flex-1 min-w-0">
                <Button variant="ghost" onClick={() => router.back()} className="rounded-full h-10 w-10 md:h-14 md:w-14 border-2 border-slate-100 bg-white p-0 shadow-sm shrink-0 active:scale-90 transition-all hover:bg-slate-50"><ChevronLeft className="h-5 w-5 md:h-7 md:w-7" /></Button>
                <div className="space-y-3 min-w-0">
                  <div className="flex flex-wrap items-center gap-3">
                      <Badge className={cn(
                        "border-none text-[8px] md:text-[10px] font-black px-3 py-1 rounded-lg uppercase tracking-widest shadow-lg", 
                        isPremium ? "bg-amber-50 text-amber-600" : "bg-emerald-50 text-emerald-600"
                      )}>
                        {isPremium ? '🔒 PREMIUM NODE' : 'FREE ACCESS'}
                      </Badge>
                      <Badge variant="outline" className="border-slate-200 text-slate-400 text-[8px] md:text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-lg">ID: {mockId.slice(-8)}</Badge>
                  </div>
                  <h1 className="text-xl md:text-5xl lg:text-6xl font-headline font-black text-[#0F172A] uppercase leading-tight tracking-tight max-w-4xl break-words antialiased">{mock.title}</h1>
                  <div className="flex flex-wrap items-center gap-5 md:gap-8 pt-2 text-slate-500 font-black text-[9px] md:text-sm uppercase tracking-widest">
                      <span className="flex items-center gap-2 md:gap-3"><Clock className="h-4 w-4 md:h-5 md:w-5 text-primary" /> {mock.duration}m Duration</span>
                      <span className="flex items-center gap-2 md:gap-3"><BookOpen className="h-4 w-4 md:h-5 md:w-5 text-primary" /> {mock.totalQuestions} Questions</span>
                      <span className="flex items-center gap-2 md:gap-3"><Target className="h-4 w-4 md:h-5 md:w-5 text-primary" /> {mock.totalQuestions * (mock.positiveMarks || 1)} Marks</span>
                  </div>
                </div>
              </div>
              <div className="w-full md:w-auto shrink-0 pt-4 md:pt-0">
                 {isLocked ? (
                    <Button onClick={() => router.push('/pass')} className="w-full md:w-auto h-14 md:h-20 px-10 md:px-16 bg-orange-500 hover:bg-orange-600 text-white font-black uppercase text-[10px] md:text-[13px] tracking-[0.2em] rounded-2xl md:rounded-[2rem] shadow-4xl shadow-orange-500/20 border-none transition-all active:scale-95 flex items-center justify-center gap-4">
                      <Lock className="h-5 w-5 fill-current" /> UNLOCK PREMIUM TEST
                    </Button>
                 ) : isLimitReached ? (
                    <Button asChild variant="outline" className="w-full md:w-auto h-14 md:h-18 px-10 md:px-14 rounded-2xl md:rounded-3xl border-2 border-slate-200 font-black uppercase text-[10px] md:text-[11px] tracking-[0.2em] gap-4 transition-all active:scale-95">
                       <Link href={`/results/${mockId}`}><Target className="h-5 w-5" /> VIEW AUDIT RESULT</Link>
                    </Button>
                 ) : (
                    <Button asChild className="w-full md:w-auto h-14 md:h-20 px-10 md:px-16 bg-[#0F172A] hover:bg-black text-white font-black uppercase tracking-[0.2em] text-[10px] md:text-[13px] rounded-2xl md:rounded-[2rem] shadow-4xl transition-all active:scale-95 border-none flex items-center justify-center gap-4">
                      <Link href={`/mocks/${mockId}/instructions`} className="flex items-center justify-center gap-4">
                        {isResumable ? <RefreshCw className="h-5 w-5" /> : <Play className="h-5 w-5 fill-current text-primary" />} 
                        {isResumable ? 'RESUME PREPARATION' : 'INITIALIZE TEST ENGINE'}
                      </Link>
                    </Button>
                 )}
              </div>
            </div>
          </div>
        </section>

        <section className="py-10 md:py-24 bg-white">
           <div className="container mx-auto px-4 md:px-8 max-w-7xl">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-12">
                 <FeatureNode icon={ShieldCheck} title="OFFICIAL PATTERN" desc="Verified against upcoming board notifications." />
                 <FeatureNode icon={Zap} title="ELITE SOLUTIONS" desc="Bilingual rationalizations for every choice." />
                 <FeatureNode icon={Target} title="STATE MERIT" desc="Compare with toppers across 22 districts." />
              </div>

              <div className="mt-16 md:mt-32 p-8 md:p-20 bg-slate-900 rounded-[3rem] md:rounded-[5rem] text-white relative overflow-hidden group border border-white/5">
                 <div className="absolute top-0 right-0 p-12 opacity-5 rotate-12 group-hover:scale-110 transition-transform duration-1000"><Layers className="h-64 w-64 md:h-96 md:w-96" /></div>
                 <div className="relative z-10 max-w-3xl space-y-8 md:space-y-12">
                    <div className="space-y-4">
                       <p className="text-primary font-black uppercase tracking-[0.4em] text-[10px] md:text-[12px]">INSTITUTIONAL INTEGRITY</p>
                       <h2 className="text-3xl md:text-7xl font-headline font-black uppercase tracking-tight leading-tight">Master the <br/> Preparation Node</h2>
                    </div>
                    <p className="text-slate-400 text-base md:text-2xl font-medium leading-relaxed max-w-2xl">
                       This mock test covers the complete official syllabus including Punjabi Qualifying, GK, Mental Ability, and Quantitative Aptitude.
                    </p>
                    <div className="grid grid-cols-2 gap-6 md:gap-12">
                       <TrustStat label="Verified Questions" val={mock.totalQuestions} />
                       <TrustStat label="Accuracy Node" val="94%" />
                    </div>
                 </div>
              </div>
           </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}

function FeatureNode({ icon: Icon, title, desc }: { icon: LucideIcon, title: string, desc: string }) {
  return (
    <div className="p-8 md:p-12 rounded-[2.5rem] md:rounded-[3.5rem] bg-slate-50 border border-slate-100 space-y-5 md:space-y-8 group hover:bg-white hover:shadow-4xl transition-all duration-500 text-left border-b-4 border-b-slate-100 hover:border-b-primary">
      <div className="h-14 w-14 md:h-20 md:w-20 bg-white rounded-[1.5rem] md:rounded-[2rem] flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform duration-500">
        <Icon className="h-6 w-6 md:h-10 md:w-10 text-primary" />
      </div>
      <div className="space-y-2 md:space-y-3">
         <h3 className="text-lg md:text-2xl font-black text-[#0F172A] uppercase tracking-tight leading-none">{title}</h3>
         <p className="text-slate-400 font-bold uppercase text-[10px] md:text-[12px] leading-relaxed tracking-widest">{desc}</p>
      </div>
    </div>
  );
}

function TrustStat({ label, val }: any) {
   return (
      <div className="space-y-1">
         <p className="text-3xl md:text-6xl font-headline font-black text-white tabular-nums leading-none tracking-tighter">{val}</p>
         <p className="text-[9px] md:text-[12px] font-black uppercase text-slate-500 tracking-[0.3em]">{label}</p>
      </div>
   )
}
