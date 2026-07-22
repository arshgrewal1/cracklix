
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
  MoreVertical
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { motion } from "framer-motion"
import { Skeleton } from "@/components/ui/skeleton"
import { TestSeries, Subject, MockTest } from "@/types"
import { cn } from "@/lib/utils"
import { AuthorityLogo } from "@/lib/exam-icons"

/**
 * @fileOverview Premium Series Hub Portal v7.3.
 * FIXED: Enhanced text visibility for dark hero section (text-white / text-slate-200).
 * FIXED: Removed title truncation for long series names.
 */

export default function SeriesDetailPortal() {
  const params = useParams()
  const subjectId = params?.id as string
  const seriesId = params?.seriesId as string
  
  const db = useFirestore()
  const router = useRouter()
  const { user, profile, loading: authLoading } = useUser()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const { data: subject } = useDoc<Subject>(useMemo(() => (db && subjectId ? doc(db, "subjects", subjectId) : null), [db, subjectId]));
  const { data: series, loading: serLoading } = useDoc<TestSeries>(useMemo(() => (db && seriesId ? doc(db, "test_series", seriesId) : null), [db, seriesId]));
  
  const mocksQuery = useMemo(() => (db && seriesId ? query(collection(db, "mocks"), where("published", "==", true), where("seriesId", "==", seriesId)) : null), [db, seriesId]);
  const { data: mocks, loading: mocksLoading } = useCollection<MockTest>(mocksQuery as any);

  const resultsQuery = useMemo(() => (db && user ? query(collection(db, "results"), where("userId", "==", user.uid)) : null), [db, user]);
  const { data: results } = useCollection<any>(resultsQuery);

  const isPassActive = useMemo(() => {
     if (!profile) return false;
     if (profile.role === 'ADMIN' || profile.role === 'SUPER_ADMIN') return true;
     return profile.passStatus === 'active';
  }, [profile]);

  if (!mounted || serLoading || authLoading) return <div className="h-screen w-full flex items-center justify-center bg-white"><Zap className="animate-spin text-primary h-10 w-10" /></div>

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-body text-left pb-safe overflow-x-hidden w-full">
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
                     <p className="text-slate-200 font-medium text-xs md:text-lg max-w-xl leading-relaxed">
                        {series?.description || "High-speed mock tests for competitive mastery."}
                     </p>
                  </div>
               </div>
               <div className="shrink-0 w-full md:w-auto mt-4 lg:mt-0">
                  <div className="bg-white/5 border border-white/10 p-4 md:p-6 rounded-[20px] backdrop-blur-md space-y-3 min-w-[200px]">
                     <div className="flex justify-between items-center text-[9px] font-black uppercase text-slate-400 tracking-widest">
                        <span>Progress</span>
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
            </div>
         </div>
      </section>

      {/* 2. COMPACT TIMELINE SECTION */}
      <main className="container mx-auto px-4 md:px-0 py-8 md:py-14 max-w-full flex flex-col items-center">
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
                     const isPremium = mock.accessLevel?.toUpperCase() === 'PREMIUM';
                     const locked = isPremium && !isPassActive;
                     const result = results?.find((r: any) => r.mockId === mock.id);
                     const isCompleted = !!result;

                     return (
                        <div key={mock.id} className="flex items-center gap-4 md:gap-6 relative z-10">
                           {/* COMPACT NODE */}
                           <div className="shrink-0">
                              <div className={cn(
                                "h-[48px] w-[48px] md:h-[60px] md:w-[60px] rounded-full flex items-center justify-center shadow-lg transition-all duration-300 border-[4px] border-[#F8FAFC]",
                                isCompleted ? "bg-emerald-50 text-white" : locked ? "bg-slate-200 text-slate-400" : "bg-[#0F172A] text-white"
                              )}>
                                 {isCompleted ? <Check className="h-6 w-6 stroke-[4px]" /> : locked ? <Lock className="h-5 w-5" /> : <span className="text-sm md:text-lg font-black tabular-nums">{idx + 1}</span>}
                              </div>
                           </div>

                           {/* PREMIUM COMPACT CARD */}
                           <Card className={cn(
                             "flex-1 border border-slate-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] rounded-[22px] bg-white group overflow-hidden transition-all duration-300",
                             isCompleted && "bg-slate-50/50"
                           )} style={{ width: 'calc(100% - 64px)' }}>
                              <CardContent className="p-4 md:p-6 space-y-4">
                                 {/* TOP ROW: Badge + No + Menu */}
                                 <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                       {isCompleted ? (
                                          <Badge className="bg-emerald-100 text-emerald-700 border-none text-[10px] font-bold px-2 py-0.5 rounded-md">Completed</Badge>
                                       ) : locked ? (
                                          <Badge className="bg-slate-100 text-slate-500 border-none text-[10px] font-bold px-2 py-0.5 rounded-md">Locked</Badge>
                                       ) : (
                                          <Badge className="bg-blue-100 text-blue-700 border-none text-[10px] font-bold px-2 py-0.5 rounded-md">Unlocked</Badge>
                                       )}
                                       <span className="text-slate-400 font-bold text-[11px] tracking-tight">Test {idx + 1}</span>
                                    </div>
                                    <button className="p-1 text-slate-300 hover:text-slate-600 transition-colors">
                                       <MoreVertical className="h-4 w-4" />
                                    </button>
                                 </div>

                                 {/* SECOND ROW: Title */}
                                 <h3 className="text-[20px] md:text-[28px] font-[800] text-[#0F172A] leading-[1.2] tracking-tight">
                                    {mock.title}
                                 </h3>

                                 {/* THIRD ROW: Horizontal Stats */}
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

                                 {/* BOTTOM ROW: CTA */}
                                 <div className="pt-2">
                                    <Button asChild className={cn(
                                       "w-full h-[48px] md:h-[52px] rounded-xl text-[16px] font-bold shadow-sm transition-all active:scale-[0.98] border-none",
                                       isCompleted ? "bg-emerald-600 hover:bg-emerald-700 text-white" : 
                                       locked ? "bg-slate-100 text-slate-400 cursor-not-allowed" : 
                                       "bg-[#2563EB] hover:bg-blue-700 text-white shadow-blue-200"
                                    )}>
                                       <Link href={locked ? '/pass' : isCompleted ? `/results/view?id=${mock.id}` : `/mocks/instructions?id=${mock.id}`}>
                                          {isCompleted ? "View analysis" : locked ? "Locked" : "Start test"}
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
