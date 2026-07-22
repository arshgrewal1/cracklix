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
  Layers, 
  ArrowLeft,
  Trophy,
  Play,
  Lock,
  BookOpen,
  BarChart3,
  Timer,
  Check,
  MoreVertical,
  Gem,
  ArrowRight,
  Info,
  Smartphone,
  Calendar
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
 * @fileOverview Premium Series Hub Portal v9.1 [Granular Preview Gating].
 * FIXED: Typo in max-width utility class.
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

  const resultsQuery = useMemo(() => (db && user ? query(collection(db, "results"), where("userId", "==", user.uid)) : null), [db, user]);
  const { data: results } = useCollection<any>(resultsQuery);

  const seriesAccess = useMemo(() => {
     if (!series) return { hasAccess: false, status: 'LOCKED' };
     return hasSeriesAccess(profile, series);
  }, [profile, series]);

  if (!mounted || serLoading || authLoading) return <div className="h-screen w-full flex items-center justify-center bg-white"><Zap className="animate-spin text-primary h-10 w-10" /></div>

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-body text-left pb-safe overflow-x-hidden w-full relative">
      <Navbar />
      
      {/* 1. HERO SECTION */}
      <section className="bg-[#0F172A] text-white pt-8 pb-10 md:pt-14 md:pb-20 relative overflow-hidden">
         <div className="absolute top-0 right-0 w-1/3 h-full bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
         
         <div className="container mx-auto px-4 md:px-12 max-w-7xl relative z-10 space-y-8">
            <div className="flex items-center gap-2 text-slate-400 font-bold text-[10px] md:text-xs uppercase tracking-widest">
               <button onClick={() => router.back()} className="hover:text-white transition-colors flex items-center gap-2">
                 <ArrowLeft className="h-3 w-3" /> {subject?.name || "Subject"}
               </button>
               <ChevronRight className="h-3 w-3" />
               <span className="text-primary">Test series</span>
            </div>

            <div className="flex flex-col lg:flex-row items-center lg:items-start justify-between gap-8 md:gap-14">
               <div className="flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-8 flex-1 min-w-0">
                  <div className="shrink-0 relative">
                     <AuthorityLogo boardId={series?.boardId} size="lg" className="h-16 w-16 md:h-28 md:w-28 rounded-2xl md:rounded-[2.5rem] bg-white/5 border-[4px] border-white/5 shadow-2xl backdrop-blur-xl" />
                     <div className="absolute -bottom-1 -right-1 h-8 w-8 bg-primary rounded-lg flex items-center justify-center border-2 border-[#0F172A]">
                        <Layers className="h-4 w-4 text-white" />
                     </div>
                  </div>
                  <div className="space-y-3 text-center md:text-left flex-1 min-w-0">
                     <h1 className="text-2xl md:text-5xl font-black tracking-tight leading-tight antialiased break-words text-white">
                        {series?.title}
                     </h1>
                     <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                        <Badge className={cn("border-none px-4 py-1 rounded-lg font-black text-[10px] uppercase shadow-lg", seriesAccess.hasAccess ? "bg-emerald-50 text-white" : "bg-amber-50 text-white")}>
                           {seriesAccess.hasAccess ? 'Access Authorized' : 'Premium Series'}
                        </Badge>
                        <span className="text-slate-400 font-bold text-[11px] uppercase tracking-widest">{mocks?.length || 0} Professional Mocks</span>
                     </div>
                  </div>
               </div>
               
               {seriesAccess.hasAccess && (
                  <div className="shrink-0 w-full md:w-auto mt-4 lg:mt-0">
                     <div className="bg-white/5 border border-white/10 p-4 md:p-6 rounded-[20px] backdrop-blur-md space-y-3 min-w-[200px]">
                        <div className="flex justify-between items-center text-[9px] font-black uppercase text-slate-400 tracking-widest">
                           <span>Series Mastery</span>
                           <span className="text-primary">{Math.round((results?.filter(r => mocks?.some(m => m.id === r.mockId)).length || 0) / (mocks?.length || 1) * 100)}%</span>
                        </div>
                        <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                           <motion.div 
                             initial={{ width: 0 }}
                             animate={{ width: `${(results?.filter(r => mocks?.some(m => m.id === r.mockId)).length || 0) / (mocks?.length || 1) * 100}%` }}
                             className="h-full bg-primary" 
                           />
                        </div>
                     </div>
                  </div>
               )}
            </div>
         </div>
      </section>

      {/* 2. COMPACT TIMELINE SECTION */}
      <main className="container mx-auto px-4 md:px-0 py-8 md:py-14 max-w-full flex flex-col items-center relative">
         
         <div className="relative w-full max-w-[720px] lg:ml-[120px]">
            {/* THIN TIMELINE LINE */}
            <div className="absolute left-[23px] md:left-[29px] top-6 bottom-6 w-[2px] md:w-[3px] bg-slate-200 rounded-full z-0" />

            <div className="space-y-5 md:space-y-7">
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
                     const locked = !isFree && !seriesAccess.hasAccess;
                     
                     const result = results?.find((r: any) => r.mockId === mock.id);
                     const isCompleted = !!result;

                     return (
                        <div key={mock.id} className="flex items-center gap-4 md:gap-6 relative z-10">
                           {/* COMPACT NODE */}
                           <div className="shrink-0">
                              <div className={cn(
                                "h-[48px] w-[48px] md:h-[60px] md:w-[60px] rounded-full flex items-center justify-center shadow-lg transition-all duration-300 border-[4px] border-[#F8FAFC]",
                                isCompleted ? "bg-emerald-50 text-emerald-500" : locked ? "bg-slate-200 text-slate-400" : "bg-[#0F172A] text-white"
                              )}>
                                 {isCompleted ? <Check className="h-6 w-6 stroke-[4px]" /> : locked ? <Lock className="h-5 w-5" /> : <span className="text-sm md:text-lg font-black tabular-nums">{idx + 1}</span>}
                              </div>
                           </div>

                           {/* PREMIUM COMPACT CARD */}
                           <Card className={cn(
                             "flex-1 border border-slate-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] rounded-[22px] bg-white group overflow-hidden transition-all duration-300",
                             isCompleted && "bg-slate-50/50",
                             locked && "opacity-80"
                           )} style={{ width: 'calc(100% - 64px)' }}>
                              <CardContent className="p-4 md:p-6 space-y-4">
                                 <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                       {isCompleted ? (
                                          <Badge className="bg-emerald-100 text-emerald-700 border-none text-[10px] font-bold px-2 py-0.5 rounded-md">Completed</Badge>
                                       ) : locked ? (
                                          <Badge className="bg-amber-50 text-amber-600 border-none text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1"><Lock className="h-2 w-2" /> Premium</Badge>
                                       ) : isFree ? (
                                          <Badge className="bg-blue-100 text-blue-700 border-none text-[10px] font-bold px-2 py-0.5 rounded-md">Free preview</Badge>
                                       ) : (
                                          <Badge className="bg-blue-100 text-blue-700 border-none text-[10px] font-bold px-2 py-0.5 rounded-md">Active</Badge>
                                       )}
                                       <span className="text-slate-400 font-bold text-[11px] tracking-tight">Attempt {idx + 1}</span>
                                    </div>
                                    <button className="p-1 text-slate-300 hover:text-slate-600 transition-colors">
                                       <MoreVertical className="h-4 w-4" />
                                    </button>
                                 </div>

                                 <h3 className="text-[20px] md:text-[28px] font-[800] text-[#0F172A] leading-[1.2] tracking-tight text-left">
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
                                       val={isCompleted ? result.score : "---"} 
                                       highlight={isCompleted}
                                    />
                                 </div>

                                 <div className="pt-2">
                                    <Button asChild className={cn(
                                       "w-full h-[48px] md:h-[52px] rounded-xl text-[16px] font-bold shadow-sm transition-all active:scale-[0.98] border-none",
                                       isCompleted ? "bg-emerald-600 hover:bg-emerald-700 text-white" : 
                                       locked ? "bg-amber-500 hover:bg-amber-600 text-white" : 
                                       "bg-[#2563EB] hover:bg-blue-700 text-white shadow-blue-200"
                                    )} onClick={() => locked && setSelectedMockForPurchase(mock)}>
                                       <Link href={locked ? '#' : isCompleted ? `/results/view?id=${mock.id}` : `/mocks/instructions?id=${mock.id}`}>
                                          {isCompleted ? "View performance" : locked ? "Unlock premium test" : "Start preview"}
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

      {/* 3. PREMIUM LOCK PURCHASE DIALOG */}
      <Dialog open={!!selectedMockForPurchase} onOpenChange={() => setSelectedMockForPurchase(null)}>
         <DialogContent className="sm:max-w-xl w-[95vw] rounded-[2.5rem] md:rounded-[3.5rem] bg-white border-none shadow-5xl p-0 overflow-hidden text-left flex flex-col">
            <div className="h-2 w-full bg-amber-500 shrink-0" />
            <div className="p-8 md:p-14 space-y-10 overflow-y-auto custom-scrollbar flex-1">
               <div className="flex items-center gap-8 border-b border-slate-50 pb-10">
                  <AuthorityLogo boardId={series?.boardId} size="lg" className="h-24 w-24 md:h-32 md:w-32 bg-slate-50 border-4 border-white shadow-2xl" />
                  <div className="space-y-2">
                     <Badge className="bg-amber-50 text-amber-600 border-none text-[10px] font-black uppercase tracking-widest px-4 py-1 rounded-full">Premium lock</Badge>
                     <DialogTitle className="text-2xl font-black text-[#0F172A] tracking-tighter leading-none">
                        {series?.title}
                     </DialogTitle>
                     <DialogDescription className="text-slate-400 font-bold text-[10px] uppercase">Registry authorization required</DialogDescription>
                  </div>
               </div>

               <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <PurchaseStat icon={Layers} label="Tests" val={mocks?.length || 0} />
                  <PurchaseStat icon={Smartphone} label="Android PWA" val="Active" />
                  <PurchaseStat icon={Calendar} label="Validity" val="365 Days" />
                  <PurchaseStat icon={ShieldCheck} label="Official" val="Verified" />
               </div>

               <div className="space-y-4">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Series Benefits</p>
                  <div className="grid grid-cols-1 gap-3">
                     <BenefitNode text="Unlock all tests in this specific series." />
                     <BenefitNode text="Access detailed bilingual explanations." />
                     <BenefitNode text="Real-time All Punjab Rank calculation." />
                     <BenefitNode text="Institutional grade performance analytics." />
                  </div>
               </div>

               <div className="pt-6">
                  <Button asChild className="w-full h-16 md:h-20 bg-amber-500 hover:bg-amber-600 text-white font-black uppercase tracking-[0.2em] text-xs md:text-sm rounded-2xl md:rounded-[2.5rem] shadow-4xl border-none transition-all active:scale-95 flex items-center justify-between px-10">
                     <Link href="/pass">
                        <span>Buy Elite Pass</span>
                        <span className="text-2xl font-black">₹{series?.price || 299}</span>
                     </Link>
                  </Button>
                  <p className="text-center text-[9px] font-bold text-slate-300 mt-6 uppercase tracking-widest">Secure institutional payment portal</p>
               </div>
            </div>
         </DialogContent>
      </Dialog>

      <div className="h-20 md:h-0" />
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

function PurchaseStat({ icon: Icon, label, val }: any) {
   return (
      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex flex-col items-center text-center gap-2">
         <Icon className="h-4 w-4 text-amber-500" />
         <div>
            <p className="text-sm font-black text-[#0F172A] leading-none tabular-nums">{val}</p>
            <p className="text-[7px] font-bold text-slate-400 uppercase tracking-widest mt-1">{label}</p>
         </div>
      </div>
   )
}

function BenefitNode({ text }: { text: string }) {
   return (
      <div className="flex items-center gap-4 p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100/50">
         <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
         <p className="text-[11px] md:text-sm font-bold text-emerald-900 leading-tight">{text}</p>
      </div>
   )
}
