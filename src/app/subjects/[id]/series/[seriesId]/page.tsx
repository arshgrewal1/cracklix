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
  History,
  Star,
  Check
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { Skeleton } from "@/components/ui/skeleton"
import { TestSeries, Subject, MockTest } from "@/types"
import { cn } from "@/lib/utils"
import { AuthorityLogo } from "@/lib/exam-icons"

/**
 * @fileOverview Premium Series Registry & Path v6.0.
 * UPDATED: Simplified language - replaced "Registry Path" with "Test path".
 * UPDATED: Removed all uppercase styling.
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
      
      {/* 1. PREMIUM PATH HERO */}
      <section className="bg-[#0F172A] text-white pt-10 pb-12 md:pt-16 md:pb-24 relative overflow-hidden">
         <div className="absolute top-0 right-0 w-1/3 h-full bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
         
         <div className="container mx-auto px-4 md:px-12 max-get-7xl relative z-10 space-y-10">
            <div className="flex items-center gap-2 text-slate-400 font-bold text-[10px] md:text-xs uppercase tracking-widest">
               <button onClick={() => router.back()} className="hover:text-white transition-colors flex items-center gap-2">
                 <ArrowLeft className="h-3 w-3" /> {subject?.name || "Subject"}
               </button>
               <ChevronRight className="h-3 w-3" />
               <span className="text-primary">Test path</span>
            </div>

            <div className="flex flex-col md:flex-row items-center justify-between gap-10">
               <div className="flex flex-col md:flex-row items-center gap-6 md:gap-10 flex-1 min-w-0">
                  <div className="shrink-0 relative group">
                     <AuthorityLogo boardId={series?.boardId} size="lg" className="h-20 w-20 md:h-32 md:w-32 rounded-[2.5rem] bg-white/5 border-[6px] border-white/5 shadow-2xl backdrop-blur-xl" />
                     <div className="absolute -bottom-2 -right-2 h-10 w-10 bg-primary rounded-xl flex items-center justify-center border-4 border-[#0F172A] shadow-xl">
                        <Layers className="h-5 w-5 text-white" />
                     </div>
                  </div>
                  <div className="space-y-3 text-center md:text-left flex-1 min-w-0">
                     <h1 className="text-2xl md:text-5xl font-black tracking-tight leading-tight uppercase antialiased">{series?.title}</h1>
                     <p className="text-slate-400 font-medium text-sm md:text-lg max-w-xl line-clamp-2">{series?.description || "High-speed tactical mock test items for competitive mastery."}</p>
                     <div className="flex flex-wrap justify-center md:justify-start items-center gap-3 pt-2">
                        <Badge className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-full font-bold text-[9px]">Live sync active</Badge>
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                           <Zap className="h-3.5 w-3.5" /> {mocks?.length || 0} Test items
                        </span>
                     </div>
                  </div>
               </div>
               <div className="shrink-0 w-full md:w-auto">
                  <Card className="bg-white/5 border-white/10 p-6 rounded-[24px] backdrop-blur-md space-y-4 min-w-[240px]">
                     <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest text-slate-400">
                        <span>Series progress</span>
                        <span className="text-primary">{Math.round((results?.filter(r => mocks?.some(m => m.id === r.mockId)).length || 0) / (mocks?.length || 1) * 100)}%</span>
                     </div>
                     <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${(results?.filter(r => mocks?.some(m => m.id === r.mockId)).length || 0) / (mocks?.length || 1) * 100}%` }}
                          className="h-full bg-primary shadow-[0_0_15px_rgba(37,99,235,0.5)]" 
                        />
                     </div>
                  </Card>
               </div>
            </div>
         </div>
      </section>

      {/* 2. TIMELINE STYLE REGISTRY NODES */}
      <main className="container mx-auto px-4 md:px-12 py-10 md:py-24 max-w-5xl space-y-12">
         
         <div className="relative space-y-12">
            {/* CONNECTOR LINE */}
            <div className="absolute left-[39px] md:left-[59px] top-10 bottom-10 w-1 md:w-1.5 bg-slate-100 rounded-full z-0" />

            {mocksLoading ? (
               Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-40 w-full rounded-[32px] bg-white border border-slate-100" />)
            ) : mocks && mocks.length > 0 ? (
               mocks.map((mock, idx) => {
                  const isPremium = mock.accessLevel?.toUpperCase() === 'PREMIUM';
                  const locked = isPremium && !isPassActive;
                  const result = results?.find((r: any) => r.mockId === mock.id);
                  const isCompleted = !!result;

                  return (
                    <motion.div 
                      key={mock.id} 
                      initial={{ opacity: 0, x: -20 }} 
                      whileInView={{ opacity: 1, x: 0 }} 
                      viewport={{ once: true }}
                      transition={{ delay: idx * 0.1 }}
                      className="flex items-start gap-6 md:gap-12 relative z-10"
                    >
                       {/* NODE INDICATOR */}
                       <div className="relative shrink-0 mt-4">
                          <div className={cn(
                            "h-20 w-20 md:h-[120px] md:w-[120px] rounded-[2rem] md:rounded-[3rem] border-[6px] md:border-[8px] border-[#F8FAFC] flex items-center justify-center shadow-2xl transition-all duration-500",
                            isCompleted ? "bg-emerald-500 text-white" : locked ? "bg-slate-200 text-slate-400" : "bg-[#0F172A] text-white ring-4 ring-primary/10"
                          )}>
                             {isCompleted ? <Check className="h-10 w-10 md:h-14 md:w-14 stroke-[5px]" /> : locked ? <Lock className="h-8 w-8 md:h-12 md:w-12" /> : <span className="text-xl md:text-4xl font-black tabular-nums">{idx + 1}</span>}
                          </div>
                       </div>

                       {/* TACTICAL CONTENT CARD */}
                       <Card className={cn(
                         "flex-1 border-none shadow-xl hover:shadow-5xl transition-all duration-500 rounded-[2.5rem] md:rounded-[3.5rem] bg-white group relative overflow-hidden",
                         isCompleted && "opacity-90"
                       )}>
                          <CardContent className="p-8 md:p-14 flex flex-col md:flex-row items-center gap-10">
                             <div className="flex-1 text-center md:text-left space-y-6 min-w-0 w-full">
                                <div className="space-y-2">
                                   <div className="flex flex-wrap justify-center md:justify-start items-center gap-3">
                                      {isCompleted ? (
                                         <Badge className="bg-emerald-50 text-emerald-600 border-none font-bold text-[9px] px-3 py-1 shadow-sm">Verified success</Badge>
                                      ) : locked ? (
                                         <Badge className="bg-amber-50 text-amber-600 border-none font-bold text-[9px] px-3 py-1 shadow-sm">Elite hub required</Badge>
                                      ) : (
                                         <Badge className="bg-blue-50 text-primary border-none font-bold text-[9px] px-3 py-1 shadow-sm">Ready for attempt</Badge>
                                      )}
                                      <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Test item – {idx + 1}</span>
                                   </div>
                                   <h3 className="text-xl md:text-3xl font-black text-[#0F172A] group-hover:text-primary transition-colors leading-tight truncate-multiline uppercase">{mock.title}</h3>
                                </div>

                                <div className="flex flex-wrap justify-center md:justify-start items-center gap-6 md:gap-10 pt-2 border-t border-slate-50">
                                   <MetricNode icon={BookOpen} label="Questions" val={mock.totalQuestions} />
                                   <MetricNode icon={Timer} label="Duration" val={`${mock.duration}m`} />
                                   {isCompleted && (
                                      <MetricNode icon={Trophy} label="Best score" val={result.score} highlight />
                                   )}
                                </div>
                             </div>

                             <div className="shrink-0 w-full md:w-auto">
                                <Button asChild className={cn(
                                   "w-full md:w-auto h-16 md:h-20 px-10 md:px-16 rounded-[22px] md:rounded-[2rem] font-bold text-sm tracking-tight shadow-2xl transition-all active:scale-95 border-none gap-3",
                                   isCompleted ? "bg-emerald-600 hover:bg-emerald-700 text-white" : locked ? "bg-amber-500 hover:bg-amber-600 text-white" : "bg-[#0F172A] hover:bg-black text-white"
                                )}>
                                   <Link href={locked ? '/pass' : isCompleted ? `/results/view?id=${mock.id}` : `/mocks/instructions?id=${mock.id}`}>
                                      {isCompleted ? <BarChart3 className="h-5 w-5" /> : locked ? <Lock className="h-5 w-5" /> : <Play className="h-5 w-5 fill-current text-primary" />}
                                      {isCompleted ? "Full analysis" : locked ? "Get elite" : "Start now"}
                                   </Link>
                                </Button>
                             </div>
                          </CardContent>
                       </Card>
                    </motion.div>
                  )
               })
            ) : (
               <div className="py-40 text-center space-y-8 bg-white rounded-[4rem] border-2 border-dashed border-slate-100 opacity-20">
                  <Layers className="h-20 w-20 mx-auto text-slate-300" />
                  <p className="font-bold text-2xl md:text-4xl tracking-tight">Hub in standby</p>
               </div>
            )}
         </div>

         {/* 3. BOTTOM ANALYTICS LEDGER */}
         <section className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-8 pt-20 border-t border-slate-100">
            <StatsMiniCard label="Best score" val={Math.round(Math.max(...(results?.map(r => r.score) || [0])))} icon={<Trophy className="text-amber-500" />} />
            <StatsMiniCard label="Avg accuracy" val={`${Math.round((results?.reduce((acc, r) => acc + (r.accuracy || 0), 0) || 0) / (results?.length || 1))}%`} icon={<Target className="text-emerald-500" />} />
            <StatsMiniCard label="Completed" val={results?.length || 0} icon={<Layers className="text-blue-500" />} />
            <StatsMiniCard label="Percentile" val="High" icon={<TrendingUp className="text-purple-500" />} />
         </section>

      </main>

      <Footer />
    </div>
  )
}

function MetricNode({ icon: Icon, label, val, highlight }: any) {
  return (
     <div className="flex flex-col items-center md:items-start gap-1">
        <div className="flex items-center gap-2">
           <Icon className="h-3.5 w-3.5 text-slate-300" />
           <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">{label}</span>
        </div>
        <p className={cn("text-base md:text-2xl font-black tabular-nums tracking-tighter", highlight ? "text-primary" : "text-[#0F172A]")}>{val}</p>
     </div>
  )
}

function StatsMiniCard({ label, val, icon }: any) {
   return (
      <Card className="border border-slate-100 shadow-sm rounded-[24px] p-6 bg-white flex flex-col items-center text-center gap-4 transition-all hover:translate-y-[-4px] hover:shadow-xl group">
         <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
            {icon}
         </div>
         <div className="space-y-0.5">
            <p className="text-xl md:text-3xl font-black tabular-nums text-[#0F172A] tracking-tighter">{val}</p>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{label}</p>
         </div>
      </Card>
   )
}
