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
  Timer
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { Skeleton } from "@/components/ui/skeleton"
import Image from "next/image"
import { TestSeries, Subject, MockTest } from "@/types"
import { cn } from "@/lib/utils"

/**
 * @fileOverview Level 3: Test Registry Hub v1.0.
 * Displays all tests inside a specific learning series.
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

  if (!mounted || serLoading || authLoading) return <div className="h-screen w-full flex items-center justify-center bg-white"><Loader2 className="animate-spin text-primary h-12 w-12" /></div>

  if (!series) return (
     <div className="h-screen flex flex-col items-center justify-center text-center space-y-6">
        <Trophy className="h-16 w-16 text-slate-200" />
        <h2 className="text-2xl font-black">Series Hub Not Found</h2>
        <Button onClick={() => router.push(`/subjects/${subjectId}`)} variant="outline">Back to Subject</Button>
     </div>
  )

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-body text-left">
      <Navbar />
      
      <section className="bg-white border-b border-slate-100 pt-8 pb-10 md:pt-16 md:pb-24">
         <div className="container mx-auto px-4 md:px-12 max-w-7xl space-y-8 md:space-y-12">
            <button onClick={() => router.push(`/subjects/${subjectId}`)} className="h-10 w-10 rounded-xl border border-slate-100 bg-white flex items-center justify-center text-slate-400 hover:text-primary transition-all shadow-sm active:scale-90"><ArrowLeft className="h-5 w-5" /></button>
            
            <div className="flex flex-col md:flex-row items-center gap-8 md:gap-14">
               <div className="h-32 w-32 md:h-52 md:w-52 rounded-[2rem] md:rounded-[3.5rem] bg-[#0F172A] overflow-hidden relative shadow-5xl shrink-0 group">
                  {series.thumbnailUrl ? <Image src={series.thumbnailUrl} alt={series.title} fill className="object-cover group-hover:scale-110 transition-transform duration-1000 opacity-80" /> : <Zap className="h-16 w-16 m-auto text-white/5" />}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
               </div>
               
               <div className="flex-1 text-center md:text-left space-y-6">
                  <div className="space-y-4">
                     <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                        <Badge className="bg-primary/5 text-primary border-none px-3 py-1 font-black text-[9px] uppercase tracking-widest">{subject?.name} Hub</Badge>
                        <Badge variant="outline" className={cn(
                           "bg-white border-slate-200 font-bold text-[8px] md:text-[9px] px-3 py-1 rounded-full uppercase tracking-widest",
                           series.difficulty === 'Easy' ? "text-emerald-500" : series.difficulty === 'Medium' ? "text-blue-500" : "text-rose-500"
                        )}>{series.difficulty} Pattern</Badge>
                     </div>
                     <h1 className="text-2xl md:text-6xl font-[900] tracking-tighter text-[#0F172A] leading-tight uppercase antialiased">{series.title}</h1>
                  </div>
                  <p className="text-slate-500 text-sm md:text-xl font-medium max-w-2xl leading-relaxed">{series.description || "Systematically organized preparation node for competitive mastery."}</p>
               </div>
            </div>
         </div>
      </section>

      <main className="container mx-auto px-4 md:px-12 py-10 md:py-20 max-w-5xl space-y-6 md:space-y-10">
         <div className="flex items-center justify-between px-2">
            <h3 className="text-lg md:text-3xl font-black text-[#0F172A] uppercase tracking-tight flex items-center gap-4">
               <Layers className="h-6 w-6 text-primary" /> Series Registry
            </h3>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest tabular-nums">{mocks?.length || 0} Mock Nodes</span>
         </div>

         <div className="grid grid-cols-1 gap-4 md:gap-6">
            {mocksLoading ? (
               Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-32 w-full rounded-[2rem] bg-white border border-slate-50" />)
            ) : mocks && mocks.length > 0 ? (
               mocks.map((mock, idx) => {
                  const isPremium = mock.accessLevel?.toUpperCase() === 'PREMIUM';
                  const locked = isPremium && !isPassActive;
                  const result = results?.find((r: any) => r.mockId === mock.id);
                  const isCompleted = !!result;

                  return (
                    <motion.div key={mock.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.05 }}>
                       <Card className={cn(
                         "border border-slate-100 shadow-lg hover:shadow-2xl transition-all duration-500 rounded-[2rem] md:rounded-[2.5rem] bg-white group relative overflow-hidden",
                         isCompleted && "bg-emerald-50/20"
                       )}>
                          <div className="p-6 md:p-10 flex flex-col md:flex-row items-center gap-6 md:gap-10">
                             <div className="shrink-0 flex items-center justify-center">
                                <div className={cn(
                                   "h-14 w-14 md:h-18 md:w-18 rounded-2xl flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform",
                                   isCompleted ? "bg-emerald-100 text-emerald-600" : locked ? "bg-amber-50 text-amber-500" : "bg-blue-50 text-primary"
                                )}>
                                   {locked ? <Lock className="h-6 w-6" /> : isCompleted ? <CheckCircle2 className="h-6 w-6" /> : <Play className="h-6 w-6 fill-current" />}
                                </div>
                             </div>

                             <div className="flex-1 space-y-4 text-center md:text-left min-w-0">
                                <div className="space-y-1">
                                   <div className="flex items-center justify-center md:justify-start gap-3 flex-wrap">
                                      <Badge variant="ghost" className="p-0 font-black text-[#0F172A] uppercase text-[10px] md:text-sm tracking-tight antialiased">Node #{idx + 1}</Badge>
                                      {isPremium && <Badge className="bg-amber-100 text-amber-800 border-none font-bold text-[8px] uppercase tracking-widest px-2">Elite</Badge>}
                                      {isCompleted && <Badge className="bg-emerald-100 text-emerald-800 border-none font-bold text-[8px] uppercase tracking-widest px-2">Completed</Badge>}
                                   </div>
                                   <h4 className="text-base md:text-xl font-[800] text-[#0F172A] leading-tight truncate uppercase tracking-tight">{mock.title}</h4>
                                </div>

                                <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-6 gap-y-2">
                                   <StatNode icon={BookOpen} label={`${mock.totalQuestions} Items`} />
                                   <StatNode icon={Clock} label={`${mock.duration}m Time`} />
                                   {isCompleted && <StatNode icon={Trophy} label={`Score: ${result.score}`} color="text-primary" />}
                                </div>
                             </div>

                             <div className="shrink-0 w-full md:w-auto pt-4 md:pt-0">
                                <Button asChild className={cn(
                                   "w-full md:w-44 h-12 md:h-14 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] shadow-xl border-none transition-all active:scale-95 gap-3",
                                   isCompleted ? "bg-[#0F172A] hover:bg-black text-white" : locked ? "bg-amber-500 hover:bg-amber-600 text-white" : "bg-primary hover:bg-blue-700 text-white"
                                )}>
                                   <Link href={locked ? '/pass' : isCompleted ? `/results/view?id=${mock.id}` : `/mocks/instructions?id=${mock.id}`}>
                                      {isCompleted ? <BarChart3 className="h-4 w-4" /> : locked ? <Zap className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
                                      {isCompleted ? 'Analysis' : locked ? 'Unlock Pass' : 'Attempt'}
                                   </Link>
                                </Button>
                             </div>
                          </div>
                       </Card>
                    </motion.div>
                  )
               })
            ) : (
               <div className="py-32 text-center border-2 border-dashed border-slate-100 rounded-[3rem] opacity-30 flex flex-col items-center gap-6">
                  <BookOpen className="h-16 w-16 text-slate-300" />
                  <p className="font-black text-xl md:text-2xl uppercase tracking-[0.4em]">Vault Sync Standby</p>
               </div>
            )}
         </div>
      </main>

      <Footer />
    </div>
  )
}

function StatNode({ icon: Icon, label, color = "text-slate-400" }: any) {
  return (
    <div className="flex items-center gap-2">
       <Icon className="h-3.5 w-3.5 text-slate-300" />
       <span className={cn("text-[9px] md:text-[11px] font-bold uppercase tracking-tight", color)}>{label}</span>
    </div>
  )
}

function Loader2({ className }: any) { return <Zap className={cn("animate-pulse", className)} /> }
