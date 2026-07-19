
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
  Target, 
  Layers, 
  ArrowLeft,
  Trophy,
  Star,
  RefreshCw,
  Play,
  CheckCircle2,
  Lock,
  Clock,
  BookOpen,
  BarChart3,
  Timer,
  Loader2,
  ArrowRight,
  TrendingUp,
  Activity,
  History
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { Skeleton } from "@/components/ui/skeleton"
import Image from "next/image"
import { TestSeries, Subject, MockTest } from "@/types"
import { cn } from "@/lib/utils"
import { AuthorityLogo } from "@/lib/exam-icons"

/**
 * @fileOverview Premium Series Registry v5.0.
 * Redesigned to match Testbook + Duolingo standards.
 * FIXED: High-fidelity analytics cards and tactical test nodes.
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

  // Series Specific Aggregate Analytics
  const analytics = useMemo(() => {
    if (!mocks || !results) return { bestScore: 0, avgAccuracy: 0, completion: 0, lastAttempt: '---' };
    
    const seriesResults = results.filter(r => mocks.some(m => m.id === r.mockId));
    if (seriesResults.length === 0) return { bestScore: 0, avgAccuracy: 0, completion: 0, lastAttempt: '---' };

    const bestScore = Math.max(...seriesResults.map(r => r.score || 0));
    const avgAccuracy = Math.round(seriesResults.reduce((acc, r) => acc + (r.accuracy || 0), 0) / seriesResults.length);
    const completion = Math.round((seriesResults.length / mocks.length) * 100);
    
    const lastDate = new Date(Math.max(...seriesResults.map(r => new Date(r.timestamp).getTime())));

    return {
       bestScore,
       avgAccuracy,
       completion,
       lastAttempt: lastDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })
    };
  }, [mocks, results]);

  if (!mounted || serLoading || authLoading) return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-white space-y-6">
      <Loader2 className="animate-spin text-primary h-12 w-12" />
      <p className="text-[10px] font-black uppercase text-slate-300 tracking-[0.4em]">Synchronizing Registry...</p>
    </div>
  );

  if (!series) return (
     <div className="h-screen flex flex-col items-center justify-center text-center p-8 space-y-8">
        <div className="h-24 w-24 bg-slate-50 rounded-[3rem] flex items-center justify-center text-slate-200">
           <Trophy className="h-12 w-12" />
        </div>
        <div className="space-y-2">
           <h2 className="text-2xl md:text-4xl font-black text-[#0F172A] uppercase tracking-tight">Series Hub Offline</h2>
           <p className="text-slate-400 font-medium max-w-xs mx-auto">The requested preparation node has been archived or moved by the admin.</p>
        </div>
        <Button onClick={() => router.push(`/subjects/${subjectId}`)} variant="outline" className="h-14 px-10 rounded-2xl font-bold uppercase text-[10px] tracking-widest gap-2">
           <ArrowLeft className="h-4 w-4" /> Return to Vault
        </Button>
     </div>
  )

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-body text-left pb-safe">
      <Navbar />
      
      {/* 1. REBALANCED PREMIUM HEADER */}
      <section className="bg-white border-b border-slate-100 pt-8 pb-10 md:pt-14 md:pb-16">
         <div className="container mx-auto px-4 md:px-12 max-w-7xl">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
               <div className="flex items-center gap-6">
                  <button onClick={() => router.push(`/subjects/${subjectId}`)} className="h-11 w-11 rounded-2xl border border-slate-100 bg-white flex items-center justify-center text-slate-400 hover:text-primary transition-all shadow-sm active:scale-90 shrink-0">
                     <ArrowLeft className="h-5 w-5" />
                  </button>
                  <div className="text-left space-y-1">
                     <h1 className="text-2xl md:text-5xl font-black tracking-tight text-[#0F172A] leading-none uppercase">Series Registry</h1>
                     <p className="text-slate-400 font-bold uppercase text-[10px] md:text-xs tracking-widest leading-none">Manage all your mock test series in one place.</p>
                  </div>
               </div>

               <div className="bg-slate-50 border border-slate-100 px-6 py-3 rounded-2xl flex items-center gap-5 shadow-sm group">
                  <div className="h-10 w-10 bg-white rounded-xl flex items-center justify-center text-primary shadow-sm group-hover:scale-110 transition-transform">
                     <BookOpen className="h-5 w-5" />
                  </div>
                  <div className="text-left pr-2">
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Vault Size</p>
                     <p className="text-xl font-black text-[#0F172A] tabular-nums leading-none">{mocks?.length || 0} Series</p>
                  </div>
               </div>
            </div>
         </div>
      </section>

      <main className="container mx-auto px-4 md:px-12 py-10 md:py-16 max-w-6xl space-y-12">
         
         {/* 2. MAIN TEST LIST HUB */}
         <div className="grid grid-cols-1 gap-5 md:gap-6">
            {mocksLoading ? (
               Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-64 w-full rounded-[2.5rem] bg-white border border-slate-100 shadow-sm" />)
            ) : mocks && mocks.length > 0 ? (
               mocks.map((mock, idx) => {
                  const isPremium = mock.accessLevel?.toUpperCase() === 'PREMIUM';
                  const locked = isPremium && !isPassActive;
                  const result = results?.find((r: any) => r.mockId === mock.id);
                  const isCompleted = !!result;
                  const maxMarks = (mock.totalQuestions || 25) * (mock.positiveMarks || 1);

                  return (
                    <motion.div 
                      key={mock.id} 
                      initial={{ opacity: 0, y: 15 }} 
                      animate={{ opacity: 1, y: 0 }} 
                      transition={{ delay: idx * 0.05 }}
                    >
                       <Card className={cn(
                         "border border-slate-100 shadow-lg hover:shadow-2xl transition-all duration-500 rounded-[2.5rem] md:rounded-[3rem] bg-white group relative overflow-hidden h-full flex flex-col",
                         isCompleted ? "ring-2 ring-emerald-500/10" : "hover:border-primary/20"
                       )}>
                          {/* GLOW NODES */}
                          <div className={cn(
                            "absolute top-0 right-0 w-32 h-32 blur-[60px] opacity-10 pointer-events-none transition-opacity group-hover:opacity-20",
                            isCompleted ? "bg-emerald-500" : "bg-primary"
                          )} />

                          <CardContent className="p-6 md:p-10 space-y-8 md:space-y-10 flex-1 flex flex-col">
                             {/* TOP ROW: STATUS CHIP */}
                             <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                   {isCompleted ? (
                                      <Badge className="bg-emerald-50 text-emerald-600 border border-emerald-100 font-black text-[9px] uppercase tracking-widest px-3 py-1 rounded-full shadow-sm flex items-center gap-1.5 animate-in slide-in-from-left-2">
                                         <CheckCircle2 className="h-3 w-3" /> Completed
                                      </Badge>
                                   ) : (
                                      <Badge className="bg-blue-50 text-primary border border-blue-100 font-black text-[9px] uppercase tracking-widest px-3 py-1 rounded-full shadow-sm flex items-center gap-1.5">
                                         <Activity className="h-3 w-3 animate-pulse" /> Pending
                                      </Badge>
                                   )}
                                   <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Node #{idx + 1}</span>
                                </div>
                                {isPremium && (
                                   <div className="h-8 w-8 rounded-xl bg-amber-50 flex items-center justify-center text-amber-500 shadow-inner">
                                      <Lock className="h-3.5 w-3.5" />
                                   </div>
                                )}
                             </div>

                             {/* TITLE AREA */}
                             <div className="text-left space-y-2 flex-1">
                                <h3 className="text-xl md:text-3xl font-black text-[#0F172A] group-hover:text-primary transition-colors leading-tight tracking-tight uppercase line-clamp-2">
                                   {mock.title}
                                </h3>
                                <p className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">{series.title} • Test–{String(idx + 1).padStart(2, '0')}</p>
                             </div>

                             {/* METRICS ROW */}
                             <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
                                <MetricNode icon={BookOpen} label="Questions" val={mock.totalQuestions} />
                                <MetricNode icon={Timer} label="Minutes" val={mock.duration} />
                                <MetricNode 
                                   icon={Trophy} 
                                   label="Score" 
                                   val={isCompleted ? `${result.score}/${maxMarks}` : `---`} 
                                   color={isCompleted ? "text-primary" : ""}
                                />
                                <MetricNode 
                                   icon={Star} 
                                   label="Accuracy" 
                                   val={isCompleted ? `${result.accuracy}%` : `---`} 
                                   color={isCompleted ? "text-emerald-600" : ""}
                                />
                             </div>

                             {/* PROGRESS BAR */}
                             <div className="space-y-2.5 pt-4">
                                <div className="flex justify-between items-center px-1">
                                   <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Test Progress</span>
                                   <span className="text-[10px] font-black text-primary tabular-nums">{isCompleted ? '100' : '0'}%</span>
                                </div>
                                <div className="h-2 w-full bg-slate-50 rounded-full overflow-hidden shadow-inner border border-slate-100">
                                   <motion.div 
                                      initial={{ width: 0 }}
                                      animate={{ width: isCompleted ? '100%' : '0%' }}
                                      transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
                                      className="h-full bg-gradient-to-r from-primary to-blue-400 shadow-lg shadow-primary/20" 
                                   />
                                </div>
                             </div>

                             {/* ACTION BUTTONS */}
                             <div className="pt-6">
                                <Button asChild className={cn(
                                   "w-full h-14 md:h-16 rounded-[18px] font-black uppercase tracking-[0.2em] text-[10px] md:text-xs shadow-2xl transition-all active:scale-95 border-none gap-3",
                                   isCompleted ? "bg-[#0F172A] hover:bg-black text-white" : locked ? "bg-amber-500 hover:bg-amber-600 text-white" : "bg-primary hover:bg-blue-700 text-white"
                                )}>
                                   <Link href={locked ? '/pass' : isCompleted ? `/results/view?id=${mock.id}` : `/mocks/instructions?id=${mock.id}`}>
                                      {isCompleted ? <BarChart3 className="h-4 w-4" /> : <Play className="h-4 w-4 fill-current" />}
                                      {isCompleted ? 'View Analysis' : locked ? 'Unlock Pass' : 'Attempt Test'}
                                      <ArrowRight className="h-4 w-4 ml-auto opacity-30" />
                                   </Link>
                                </Button>
                             </div>
                          </CardContent>
                       </Card>
                    </motion.div>
                  )
               })
            ) : (
               /* EMPTY STATE HUB */
               <div className="py-24 md:py-40 flex flex-col items-center justify-center text-center space-y-10 bg-white rounded-[4rem] border border-slate-100 shadow-2xl mx-1 animate-in zoom-in-95 duration-700 relative overflow-hidden">
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary/5 blur-[100px] rounded-full pointer-events-none" />
                  <div className="relative">
                     <div className="h-32 w-32 md:h-44 md:w-44 bg-slate-50 rounded-[3rem] md:rounded-[4rem] flex items-center justify-center text-slate-200 border-2 border-dashed border-slate-200 relative z-10">
                        <BookOpen className="h-12 w-12 md:h-20 md:w-20" />
                     </div>
                     <div className="absolute -bottom-2 -right-2 h-12 w-12 bg-white rounded-2xl shadow-xl flex items-center justify-center border border-slate-100 z-20">
                        <AlertCircle className="h-6 w-6 text-primary animate-pulse" />
                     </div>
                  </div>
                  <div className="space-y-4 max-w-sm px-6 relative z-10">
                     <h3 className="text-3xl md:text-5xl font-black text-[#0F172A] tracking-tight uppercase leading-none">No Tests Available</h3>
                     <p className="text-slate-400 font-bold text-sm md:text-lg tracking-tight leading-relaxed">This series is currently being populated by our audit team. Please check back later.</p>
                  </div>
                  <div className="relative z-10 pt-4">
                     <Button asChild className="h-14 px-10 bg-primary text-white rounded-full font-black uppercase text-[10px] tracking-widest shadow-xl border-none active:scale-95 transition-all">
                        <Link href="/mocks">Explore Practice Hub</Link>
                     </Button>
                  </div>
               </div>
            )}
         </div>

         {/* 3. BOTTOM ANALYTICS STRIP */}
         <section className="space-y-8 pt-10">
            <div className="flex items-center gap-3 px-2">
               <BarChart3 className="h-5 w-5 text-primary" />
               <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em]">Series Analytics</h3>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
               <AnalyticsCard label="Best Score" val={analytics.bestScore} icon={Trophy} color="text-amber-500" />
               <AnalyticsCard label="Avg Accuracy" val={`${analytics.avgAccuracy}%`} icon={Target} color="text-emerald-500" />
               <AnalyticsCard label="Completion" val={`${analytics.completion}%`} icon={CheckCircle2} color="text-primary" />
               <AnalyticsCard label="Last Attempt" val={analytics.lastAttempt} icon={History} color="text-slate-500" />
            </div>
         </section>

      </main>

      <Footer />
      {/* Mobile Nav Safety Spacer */}
      <div className="h-20 md:h-0" />
    </div>
  )
}

function MetricNode({ icon: Icon, label, val, color }: any) {
  return (
     <div className="flex items-center gap-2.5 md:gap-3 p-3 md:p-4 rounded-2xl bg-slate-50 border border-slate-100 shadow-sm transition-all group-hover:bg-white group-hover:shadow-md h-full">
        <div className="h-8 w-8 rounded-lg bg-white flex items-center justify-center shrink-0 shadow-inner">
           <Icon className="h-3.5 w-3.5 text-slate-400" />
        </div>
        <div className="min-w-0">
           <p className={cn("text-xs md:text-sm font-black text-[#0F172A] leading-none truncate", color)}>{val}</p>
           <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-1 truncate">{label}</p>
        </div>
     </div>
  )
}

function AnalyticsCard({ label, val, icon: Icon, color }: any) {
   return (
      <Card className="border border-slate-100 shadow-sm rounded-2xl md:rounded-3xl bg-white p-5 md:p-8 space-y-4 text-center group hover:translate-y-[-4px] transition-all">
         <div className={cn("h-10 w-10 md:h-12 md:w-12 rounded-xl bg-slate-50 mx-auto flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform")}>
            <Icon className={cn("h-5 w-5", color)} />
         </div>
         <div className="space-y-0.5">
            <p className="text-lg md:text-2xl font-black text-[#0F172A] tabular-nums">{val}</p>
            <p className="text-[8px] md:text-[9px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
         </div>
      </Card>
   )
}

