"use client"

import { useMemo, useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import { useDoc, useCollection, useFirestore, useUser } from "@/firebase"
import { collection, query, where, doc, updateDoc, arrayUnion, arrayRemove, serverTimestamp } from "firebase/firestore"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Star, CheckCircle2, RefreshCw, BookOpen, Clock, Zap, Landmark, ArrowRight, FileStack, ShieldCheck } from "lucide-react"
import { AuthorityLogo } from "@/lib/exam-icons"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { motion } from "framer-motion"
import ExamCard from "@/components/exams/ExamCard"

interface BoardHubClientProps {
  hubId: string;
}

/**
 * @fileOverview Premium Enterprise Board Hub v6.0.
 * UPDATED: Replaced individual card logic with unified ExamCard system.
 */

export default function BoardHubClient({ hubId }: BoardHubClientProps) {
  const router = useRouter();
  const db = useFirestore();
  const { user, profile, loading: authLoading } = useUser();
  const { toast } = useToast();

  const { data: hub, loading: hubLoading } = useDoc<any>(useMemo(() => (db && hubId ? doc(db, "boards", hubId) : null), [db, hubId]));
  
  const examsQuery = useMemo(() => {
     if (!db || !hubId) return null;
     return query(collection(db, "exams"), where("boardId", "==", hubId));
  }, [db, hubId]);

  const { data: rawExams, loading: examsLoading } = useCollection<any>(examsQuery);
  const { data: mocks } = useCollection<any>(useMemo(() => (db ? query(collection(db, "mocks"), where("published", "==", true)) : null), [db]));
  const { data: pyqs } = useCollection<any>(useMemo(() => (db ? collection(db, "pyqs") : null), [db]));
  const { data: notes } = useCollection<any>(useMemo(() => (db ? collection(db, "notes") : null), [db]));
  const { data: results } = useCollection<any>(useMemo(() => (db && user ? query(collection(db, "results"), where("userId", "==", user.uid)) : null), [db, user]));

  const exams = useMemo(() => {
    if (!rawExams) return [];
    return [...rawExams].sort((a: any, b: any) => (a.displayOrder || 0) - (b.displayOrder || 0));
  }, [rawExams]);

  if (authLoading) return <div className="h-screen w-full flex items-center justify-center bg-white"><Zap className="h-10 w-10 text-primary animate-pulse" /></div>;

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-body text-left selection:bg-primary/10 flex flex-col overflow-x-hidden w-full">
      <Navbar />
      
      <section className="bg-white border-b border-slate-100 pt-10 pb-12 md:pt-16 md:pb-24 relative overflow-hidden">
         <div className="absolute top-0 right-0 w-1/3 h-full bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
         
         <div className="container mx-auto px-4 md:px-12 max-w-7xl relative z-10 space-y-10">
            <div className="flex items-center gap-4">
               <button onClick={() => router.back()} className="h-10 w-10 md:h-12 md:w-12 rounded-xl md:rounded-2xl border border-slate-100 bg-white flex items-center justify-center text-slate-400 hover:text-primary transition-all shadow-sm active:scale-90 shrink-0">
                  <ChevronLeft className="h-5 w-5" />
               </button>
               <Badge className="bg-primary/10 text-primary border-none px-4 py-1.5 rounded-full font-bold text-[9px] md:text-[11px] tracking-tight shadow-sm">Official board hub</Badge>
            </div>

            <div className="flex flex-col md:flex-row items-center gap-8 md:gap-14">
               <AuthorityLogo board={hub} boardId={hubId} size="lg" className="h-24 w-24 md:h-44 md:w-44 rounded-[2rem] md:rounded-[4rem] bg-slate-50 border-[8px] border-slate-100 shadow-5xl group-hover:scale-105 transition-transform" />
               <div className="space-y-4 text-center md:text-left flex-1 min-w-0">
                  <h1 className="text-2xl sm:text-4xl md:text-7xl font-[900] text-[#0F172A] tracking-tighter leading-none antialiased">
                     {hub?.abbreviation || "Board hub"}
                  </h1>
                  <p className="text-sm md:text-xl text-slate-500 font-bold leading-tight tracking-tight max-w-3xl">
                     {hub?.name || "Official recruitment board portal."}
                  </p>
                  <div className="flex flex-wrap justify-center md:justify-start items-center gap-4 pt-4">
                     <div className="flex items-center gap-2 text-emerald-600 font-black text-[10px] md:text-sm uppercase tracking-widest bg-emerald-50 px-5 py-2 rounded-full border border-emerald-100 shadow-sm">
                        <ShieldCheck className="h-4 w-4" /> Official patterns
                     </div>
                     <span className="text-[10px] md:text-sm font-bold text-slate-400 uppercase tracking-widest">{exams?.length || 0} Verticals active</span>
                  </div>
               </div>
            </div>
         </div>
      </section>

      <main className="container mx-auto px-4 md:px-12 py-10 md:py-24 max-w-7xl flex-1">
         {examsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10">
               {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-[500px] w-full rounded-[3rem] bg-white" />) }
            </div>
         ) : exams && exams.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-10">
               {exams.map((exam) => (
                  <ExamCard 
                    key={exam.id} 
                    exam={exam} 
                    allMocks={mocks} 
                    userResults={results} 
                    allPyqs={pyqs} 
                    allNotes={notes} 
                  />
               ))}
            </div>
         ) : (
            <div className="py-40 text-center opacity-30 flex flex-col items-center gap-10">
               <div className="h-24 w-24 bg-slate-100 rounded-[3rem] flex items-center justify-center text-slate-300"><Layers className="h-12 w-12" /></div>
               <p className="font-black text-2xl md:text-5xl tracking-tight uppercase">Registry standby</p>
            </div>
         )}
      </main>
      <Footer />
    </div>
  )
}
