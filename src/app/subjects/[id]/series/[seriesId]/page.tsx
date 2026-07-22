"use client"

import React, { useMemo, useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import { useDoc, useCollection, useFirestore, useUser } from "@/firebase"
import { collection, query, where, doc } from "firebase/firestore"
import { Card, CardContent } from "@/components/ui/card"
import { 
  Zap, 
  ChevronRight, 
  ShieldCheck, 
  CheckCircle2,
  Layers, 
  ArrowLeft,
  Trophy,
  Lock,
  BookOpen,
  Timer,
  Check,
  MoreVertical,
  Gem,
  ArrowRight,
  Info,
  Smartphone,
  Calendar,
  Loader2,
  RefreshCw
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { motion } from "framer-motion"
import { Skeleton } from "@/components/ui/skeleton"
import { TestSeries, Subject, MockTest } from "@/types"
import { cn } from "@/lib/utils"
import { AuthorityLogo } from "@/lib/exam-icons"
import { hasSeriesAccess } from "@/lib/access-control"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"

/**
 * @fileOverview Premium Series Hub Portal v12.0.
 * FIXED: Redesigned Purchase Dialog with Bottom Sheet ergonomics, 70vh constraint, and Price Cards.
 */

export default function SeriesDetailPortal() {
  const params = useParams()
  const subjectId = params?.id as string
  const seriesId = params?.seriesId as string
  
  const db = useFirestore()
  const router = useRouter()
  const { user, profile, loading: authLoading } = useUser()
  const [mounted, setMounted] = useState(false)
  const [selectedMockForPurchase, setSelectedMockForPurchase] = useState<any>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  const { data: subject } = useDoc<Subject>(useMemo(() => (db && subjectId ? doc(db, "subjects", subjectId) : null), [db, subjectId]));
  const { data: series, loading: serLoading } = useDoc<TestSeries>(useMemo(() => (db && seriesId ? doc(db, "test_series", seriesId) : null), [db, seriesId]));
  
  const mocksQuery = useMemo(() => (db && seriesId ? query(collection(db, "mocks"), where("published", "==", true), where("seriesId", "==", seriesId)) : null), [db, seriesId]);
  const { data: mocks, loading: mocksLoading } = useCollection<MockTest>(mocksQuery as any);

  const attemptsQuery = useMemo(() => (db && user && seriesId ? query(collection(db, "attempts"), where("userId", "==", user.uid)) : null), [db, user, seriesId]);
  const { data: attempts } = useCollection<any>(attemptsQuery);

  const seriesAccess = useMemo(() => {
     if (!series) return { hasAccess: false, status: 'LOCKED' };
     return hasSeriesAccess(profile, series);
  }, [profile, series]);

  if (!mounted || serLoading || authLoading) return <div className="h-screen w-full flex items-center justify-center bg-white"><Zap className="animate-spin text-primary h-10 w-10" /></div>

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-body text-left pb-safe overflow-x-hidden w-full relative">
      <Navbar />
      
      {/* 1. HERO SECTION */}
      <section className="bg-[#0F172A] text-white pt-10 pb-12 md:pt-16 md:pb-24 relative overflow-hidden">
         <div className="absolute top-0 right-0 w-1/3 h-full bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
         
         <div className="container mx-auto px-4 md:px-12 max-w-7xl relative z-10 space-y-10">
            <div className="flex items-center gap-3 text-slate-400 font-bold text-[10px] md:text-xs uppercase tracking-widest">
               <button onClick={() => router.back()} className="hover:text-white transition-colors flex items-center gap-2 border-none bg-transparent cursor-pointer">
                 <ArrowLeft className="h-3.5 w-3.5" /> {subject?.name || "Subject"}
               </button>
               <ChevronRight className="h-3 w-3 opacity-30" />
               <span className="text-primary">Series View</span>
            </div>

            <div className="flex flex-col lg:flex-row items-center lg:items-start justify-between gap-10 md:gap-16">
               <div className="flex flex-col md:flex-row items-center md:items-start gap-8 md:gap-10 flex-1 min-w-0">
                  <div className="shrink-0 relative group">
                     <AuthorityLogo boardId={series?.boardId} size="lg" className="h-20 w-20 md:h-32 md:w-32 rounded-3xl md:rounded-[3rem] bg-white/5 border-[4px] border-white/5 shadow-2xl backdrop-blur-xl group-hover:scale-105 transition-transform duration-500" />
                     <div className="absolute -bottom-2 -right-2 h-10 w-10 bg-primary rounded-xl flex items-center justify-center border-4 border-[#0F172A] shadow-xl">
                        <Layers className="h-5 w-5 text-white" />
                     </div>
                  </div>
                  
                  <div className="space-y-5 text-center md:text-left flex-1 min-w-0">
                     <div className="space-y-4">
                        <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-white leading-tight tracking-tight antialiased">
                           {series?.title}
                        </h1>
                        <div className="flex flex-wrap justify-center md:justify-start items-center gap-4">
                           <Badge className={cn(
                              "border-none px-5 py-2 rounded-xl font-black text-[10px] uppercase shadow-lg tracking-widest", 
                              seriesAccess.hasAccess ? "bg-emerald-600 text-white" : "bg-amber-50 text-white"
                           )}>
                              {seriesAccess.hasAccess ? 'Access Authorized' : 'Premium Series'}
                           </Badge>
                           <span className="text-slate-200 font-bold text-[12px] md:text-base tracking-tight">
                              {mocks?.length || 0} Professional Mocks
                           </span>
                        </div>
                     </div>
                     
                     <p className="text-slate-200 font-medium text-sm md:text-xl leading-relaxed max-w-2xl">
                        {series?.description || "Master official patterns with verified rationales and state ranking analytics."}
                     </p>
                  </div>
               </div>
               
               {seriesAccess.hasAccess && (
                  <div className="shrink-0 w-full md:w-auto mt-6 lg:mt-0">
                     <div className="bg-white/5 border border-white/10 p-6 md:p-8 rounded-[2rem] backdrop-blur-md space-y-4 min-w-[240px] shadow-2xl">
                        <div className="flex justify-between items-center text-[10px] font-black uppercase text-slate-400 tracking-widest">
                           <span>Preparation Mastery</span>
                           <span className="text-primary tabular-nums">
                              {Math.round((attempts?.filter(a => mocks?.some(m => m.id === a.mockId) && a.status === 'COMPLETED').length || 0) / (mocks?.length || 1) * 100)}%
                           </span>
                        </div>
                        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden shadow-inner">
                           <motion.div 
                             initial={{ width: 0 }}
                             animate={{ width: `${(attempts?.filter(a => mocks?.some(m => m.id === a.mockId) && a.status === 'COMPLETED').length || 0) / (mocks?.length || 1) * 100}%` }}
                             className="h-full bg-primary shadow-[0_0_15px_rgba(37,99,235,0.5)]" 
                           />
                        </div>
                        <p className="text-[10px] font-bold text-center text-slate-500 uppercase tracking-widest">Registry Sync Active</p>
                     </div>
                  </div>
               )}
            </div>
         </div>
      </section>

      {/* 2. TIMELINE SECTION */}
      <main className="container mx-auto px-4 md:px-0 py-10 md:py-20 max-w-full flex flex-col items-center relative">
         
         <div className="relative w-full max-w-[720px] lg:ml-[120px]">
            <div className="absolute left-[23px] md:left-[29px] top-6 bottom-6 w-[2px] md:w-[3px] bg-slate-200 rounded-full z-0" />

            <div className="space-y-6 md:space-y-8">
               {mocksLoading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex gap-4 md:gap-6">
                      <Skeleton className="h-12 w-12 rounded-full shrink-0" />
                      <Skeleton className="h-40 w-full rounded-[22px]" />
                    </div>
                  ))
               ) : mocks && mocks.length > 0 ? (
                  mocks.map((mock, idx) => {
                     const isFree = mock.accessLevel === 'FREE';
                     const hasPurchasedAccess = seriesAccess.hasAccess;
                     
                     const attempt = attempts?.find((a: any) => a.mockId === mock.id);
                     const isCompleted = attempt?.status === 'COMPLETED';
                     const isStarted = attempt?.status === 'IN_PROGRESS';
                     
                     const locked = !isFree && !hasPurchasedAccess;

                     // Determine Action Button Properties
                     let buttonLabel = "Start test";
                     let buttonVariant = "bg-[#2563EB] hover:bg-blue-700";
                     let targetHref = `/mocks/instructions?id=${mock.id}`;

                     if (isCompleted) {
                        buttonLabel = "View Analysis";
                        buttonVariant = "bg-emerald-600 hover:bg-emerald-700";
                        targetHref = `/results/view?id=${mock.id}`;
                     } else if (isStarted) {
                        buttonLabel = "Continue Test";
                        buttonVariant = "bg-primary hover:bg-blue-700";
                        targetHref = `/mocks/attempt?id=${mock.id}`;
                     } else if (locked) {
                        buttonLabel = "Unlock with Pass";
                        buttonVariant = "bg-amber-500 hover:bg-amber-600";
                        targetHref = "#";
                     } else if (hasPurchasedAccess) {
                        buttonLabel = "Start Test";
                        buttonVariant = "bg-[#2563EB] hover:bg-blue-700";
                        targetHref = `/mocks/instructions?id=${mock.id}`;
                     } else if (isFree) {
                        buttonLabel = "Start Preview";
                        buttonVariant = "bg-emerald-600 hover:bg-emerald-700";
                        targetHref = `/mocks/instructions?id=${mock.id}`;
                     }

                     return (
                        <div key={mock.id} className="flex items-center gap-4 md:gap-6 relative z-10">
                           <div className="shrink-0">
                              <div className={cn(
                                "h-[48px] w-[48px] md:h-[60px] md:w-[60px] rounded-full flex items-center justify-center shadow-lg transition-all duration-300 border-[4px] border-[#F8FAFC]",
                                isCompleted ? "bg-emerald-50 text-emerald-500" : locked ? "bg-slate-200 text-slate-400" : "bg-[#0F172A] text-white"
                              )}>
                                 {isCompleted ? <Check className="h-6 w-6 stroke-[4px]" /> : locked ? <Lock className="h-5 w-5" /> : <span className="text-sm md:text-lg font-black tabular-nums">{idx + 1}</span>}
                              </div>
                           </div>

                           <Card className={cn(
                             "flex-1 border border-slate-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] rounded-[22px] bg-white group overflow-hidden transition-all duration-300",
                             isCompleted && "bg-slate-50/50",
                             locked && "opacity-80"
                           )} style={{ width: 'calc(100% - 64px)' }}>
                              <CardContent className="p-4 md:p-6 space-y-4 text-left">
                                 <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                       {isCompleted ? (
                                          <Badge className="bg-emerald-100 text-emerald-700 border-none text-[10px] font-bold px-2 py-0.5 rounded-md">Completed</Badge>
                                       ) : locked ? (
                                          <Badge className="bg-amber-50 text-amber-600 border-none text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1"><Lock className="h-2.5 w-2.5" /> Premium</Badge>
                                       ) : isFree ? (
                                          <Badge className="bg-blue-100 text-blue-700 border-none text-[10px] font-bold px-2 py-0.5 rounded-md">Free preview</Badge>
                                       ) : (
                                          <Badge className="bg-blue-100 text-blue-700 border-none text-[10px] font-bold px-2 py-0.5 rounded-md">Unlocked</Badge>
                                       )}
                                       <span className="text-slate-400 font-bold text-[11px] tracking-tight">Attempt {idx + 1}</span>
                                    </div>
                                    <button className="p-1 text-slate-300 hover:text-slate-600 transition-colors bg-transparent border-none cursor-pointer">
                                       <MoreVertical className="h-4 w-4" />
                                    </button>
                                 </div>

                                 <h3 className="text-[20px] md:text-[28px] font-[800] text-[#0F172A] leading-[1.2] tracking-tight">
                                    {mock.title}
                                 </h3>

                                 <div className="flex items-center justify-between gap-2 md:gap-4 pt-1">
                                    <ResultStat 
                                       icon={<BookOpen className="h-3.5 w-3.5" />} 
                                       label="Questions" 
                                       val={mock.totalQuestions} 
                                    />
                                    <ResultStat 
                                       icon={<Timer className="h-3.5 w-3.5" />} 
                                       label="Duration" 
                                       val={`${mock.duration} min`} 
                                    />
                                    <ResultStat 
                                       icon={<Trophy className="h-3.5 w-3.5" />} 
                                       label="Best score" 
                                       val={isCompleted ? attempt.score : "---"} 
                                       highlight={isCompleted}
                                    />
                                 </div>

                                 <div className="pt-2">
                                    <Button asChild className={cn(
                                       "w-full h-[48px] md:h-[52px] rounded-xl text-[16px] font-bold shadow-sm transition-all active:scale-[0.98] border-none text-white",
                                       buttonVariant
                                    )} onClick={() => locked && setSelectedMockForPurchase(mock)}>
                                       <Link href={targetHref}>
                                          {isStarted ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : null}
                                          {buttonLabel}
                                          <ChevronRight className="h-4 w-4 ml-2 opacity-60" />
                                       </Link>
                                    </Button>
                                 </div>
                              </CardContent>
                           </Card>
                        </div>
                     )
                  })
               ) : (
                  <div className="py-20 text-center opacity-30 italic font-black uppercase text-[10px]">No tests in series</div>
               )}
            </div>
         </div>
      </main>

      <Footer />

      {/* PREMIUM LOCK PURCHASE DIALOG - REDESIGNED FOR PWA/MOBILE */}
      <Dialog open={!!selectedMockForPurchase} onOpenChange={() => setSelectedMockForPurchase(null)}>
         <DialogContent className="sm:max-w-[480px] w-[calc(100%-24px)] max-h-[70vh] rounded-[24px] bg-white border-none shadow-5xl p-0 overflow-hidden text-left flex flex-col">
            <div className="h-1.5 w-full bg-gradient-to-r from-blue-600 to-blue-400 shrink-0" />
            
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
               <div className="flex items-center gap-4 border-b border-slate-50 pb-5">
                  <div className="h-12 w-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-500 shadow-inner">
                     <Lock className="h-6 w-6" />
                  </div>
                  <div className="min-w-0">
                     <DialogTitle className="text-xl font-[800] text-[#0F172A] tracking-tight">Premium Series</DialogTitle>
                     <DialogDescription className="text-slate-400 font-bold text-[9px] uppercase tracking-widest mt-1">Unlock all tests in this vertical</DialogDescription>
                  </div>
               </div>

               <div className="space-y-3">
                  <p className="text-[10px] font-black uppercase text-primary tracking-widest ml-1">Series Benefits</p>
                  <div className="grid grid-cols-1 gap-2">
                     <BenefitItem text="Access all professional tests" />
                     <BenefitItem text="Detailed bilingual explanations" />
                     <BenefitItem text="Real-time performance analytics" />
                     <BenefitItem text="State-wide merit rankings" />
                     <BenefitItem text="Unlimited attempt capability" />
                  </div>
               </div>

               <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-[0.03] rotate-12"><Gem className="h-20 w-20" /></div>
                  <div className="relative z-10 space-y-4">
                     <div className="flex justify-between items-start">
                        <div className="space-y-1">
                           <p className="text-[9px] font-black uppercase text-slate-400">Selected Hub</p>
                           <p className="text-lg font-black text-[#0F172A] uppercase leading-tight">Elite Pass</p>
                        </div>
                        <Badge className="bg-emerald-500 text-white border-none px-3 py-1 font-black text-[9px] uppercase">Best Value</Badge>
                     </div>
                     <div className="flex items-center justify-between pt-4 border-t border-slate-100/50">
                        <div className="space-y-0.5">
                           <p className="text-[9px] font-bold text-slate-400 uppercase">Validity</p>
                           <p className="text-sm font-bold text-[#0F172A]">365 Days Access</p>
                        </div>
                        <div className="text-right">
                           <p className="text-[9px] font-bold text-slate-400 uppercase line-through">₹1499</p>
                           <p className="text-2xl font-black text-primary tabular-nums tracking-tighter">₹999</p>
                        </div>
                     </div>
                  </div>
               </div>
            </div>

            <DialogFooter className="p-6 bg-slate-50 border-t border-slate-100 flex flex-col gap-2 shrink-0 pb-[calc(env(safe-area-inset-bottom)+24px)]">
               <Button asChild className="w-full h-[52px] bg-gradient-to-r from-blue-600 to-blue-500 hover:brightness-110 text-white font-[800] uppercase tracking-widest text-[11px] rounded-xl shadow-xl border-none active:scale-[0.98] transition-all">
                  <Link href="/pass">Buy Elite Pass Now <ArrowRight className="ml-2 h-4 w-4" /></Link>
               </Button>
               <Button variant="ghost" onClick={() => setSelectedMockForPurchase(null)} className="w-full h-10 text-slate-400 hover:text-slate-600 font-bold text-[10px] uppercase tracking-widest">
                  Cancel
               </Button>
            </DialogFooter>
         </DialogContent>
      </Dialog>
    </div>
  )
}

function BenefitItem({ text }: { text: string }) {
   return (
      <div className="flex items-center gap-3 py-1">
         <div className="h-4.5 w-4.5 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
            <Check className="h-3 w-3 text-emerald-500 stroke-[4px]" />
         </div>
         <p className="text-[12px] font-bold text-slate-600">{text}</p>
      </div>
   )
}

function ResultStat({ icon, label, val, highlight }: { icon: React.ReactNode, label: string, val: string | number, highlight?: boolean }) {
   return (
      <div className="flex flex-col items-start gap-1 flex-1 min-w-0">
         <div className="flex items-center gap-1.5 text-slate-400">
            <span className="shrink-0">{icon}</span>
            <span className="text-[12px] font-medium tracking-tight truncate">{label}</span>
         </div>
         <p className={cn(
            "text-[18px] md:text-[22px] font-black leading-none tabular-nums tracking-tighter truncate w-full",
            highlight ? "text-[#2563EB]" : "text-[#0F172A]"
         )}>{val}</p>
      </div>
   )
}
