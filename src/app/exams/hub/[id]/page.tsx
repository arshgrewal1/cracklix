
"use client"

import { useMemo, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import { useDoc, useCollection, useFirestore } from "@/firebase"
import { collection, query, where, doc } from "firebase/firestore"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, GraduationCap, Zap, BookOpen, Layers, Shield } from "lucide-react"
import Link from "next/link"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

/**
 * @fileOverview Institutional Hub Explorer (Hub -> Exams).
 * FIXED: strictly derives exams from selected Board Hub.
 */

export default function HubExamsPage() {
  const params = useParams();
  const router = useRouter();
  const db = useFirestore();
  const hubId = params.id as string;

  const { data: hub, loading: hubLoading } = useDoc<any>(useMemo(() => (db ? doc(db, "boards", hubId) : null), [db, hubId]));
  
  const examsQuery = useMemo(() => {
     if (!db || !hub) return null;
     // Fetch exams belonging to this board ID or Abbreviation
     return query(collection(db, "exams"), where("boardId", "in", [hub.id, hub.abbreviation]));
  }, [db, hub]);

  const { data: exams, loading: examsLoading } = useCollection<any>(examsQuery);
  const { data: mocks } = useCollection<any>(useMemo(() => (db ? collection(db, "mocks") : null), [db]));

  const statsMap = useMemo(() => {
    if (!mocks) return {};
    const map: Record<string, any> = {};
    mocks.forEach(m => {
      const eids = m.examIds || (m.examId ? [m.examId] : []);
      eids.forEach((eid: string) => {
        if (!map[eid]) map[eid] = { count: 0, qs: 0 };
        map[eid].count++;
        map[eid].qs += (m.totalQuestions || 0);
      });
    });
    return map;
  }, [mocks]);

  if (hubLoading) return <div className="h-screen bg-white flex items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>;

  return (
    <div className="min-h-screen bg-slate-50/50 font-body">
      <Navbar />
      
      <section className="bg-white border-b border-slate-100 py-12 md:py-24 text-left relative overflow-hidden">
         <div className="absolute top-0 right-0 p-12 opacity-5"><GraduationCap className="h-64 w-64" /></div>
         <div className="container mx-auto px-4 max-w-7xl relative z-10">
            <button onClick={() => router.back()} className="h-10 w-10 rounded-full border border-slate-100 flex items-center justify-center text-slate-400 hover:text-black mb-10 transition-all">
               <ChevronLeft className="h-5 w-5" />
            </button>
            <div className="flex flex-col md:flex-row items-center gap-10">
               <div className="h-24 w-24 md:h-36 md:w-36 rounded-[2rem] md:rounded-[3rem] bg-slate-50 border-4 border-white shadow-2xl flex items-center justify-center overflow-hidden shrink-0">
                  {hub?.iconUrl ? <img src={hub.iconUrl} className="h-full w-full object-contain p-4" alt="Logo" /> : <Shield className="h-12 w-12 text-slate-200" />}
               </div>
               <div className="space-y-3 text-center md:text-left">
                  <div className="flex items-center justify-center md:justify-start gap-4">
                     <Badge className="bg-primary text-white border-none font-black px-4 py-1 rounded-xl text-[10px] tracking-widest shadow-lg">{hub?.abbreviation} HUB</Badge>
                     <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Official verticals</span>
                  </div>
                  <h1 className="text-4xl md:text-7xl font-headline font-black text-[#0F172A] uppercase tracking-tighter leading-none">{hub?.name}</h1>
               </div>
            </div>
         </div>
      </section>

      <main className="container mx-auto px-4 py-12 md:py-24 max-w-7xl">
         {examsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
               {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-80 w-full rounded-[3.5rem]" />)}
            </div>
         ) : exams && exams.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
               {exams.map((exam) => {
                  const stats = statsMap[exam.id] || { count: 0, qs: 0 };
                  return (
                    <Link key={exam.id} href={`/exams/${exam.id}`}>
                       <Card className="border-none shadow-xl hover:shadow-4xl transition-all duration-500 rounded-[3rem] bg-white group overflow-hidden h-full flex flex-col border border-slate-100 p-8 md:p-12 text-left">
                          <div className="flex justify-between items-start mb-8">
                             <div className="h-14 w-14 rounded-2xl bg-slate-50 flex items-center justify-center text-primary group-hover:scale-110 transition-transform shadow-inner">
                                <GraduationCap className="h-7 w-7" />
                             </div>
                             <Badge variant="outline" className="border-slate-100 text-slate-400 text-[8px] font-black uppercase px-2 py-0.5">{exam.category}</Badge>
                          </div>

                          <div className="space-y-4 flex-1">
                             <h3 className="text-2xl md:text-3xl font-black text-[#0F172A] uppercase tracking-tight leading-tight group-hover:text-primary transition-colors">{exam.name}</h3>
                             <p className="text-xs font-medium text-slate-400 leading-relaxed line-clamp-2">{exam.description || `Prepare for ${exam.name} with official patterns.`}</p>
                          </div>

                          <div className="mt-10 pt-8 border-t border-slate-50 grid grid-cols-2 gap-4">
                             <div className="space-y-0.5">
                                <div className="flex items-center gap-1.5"><Zap className="h-3 w-3 text-primary" /><p className="text-xs font-black text-[#0F172A]">{stats.count}</p></div>
                                <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest">MOCKS LIVE</p>
                             </div>
                             <div className="space-y-0.5">
                                <div className="flex items-center gap-1.5"><BookOpen className="h-3 w-3 text-primary" /><p className="text-xs font-black text-[#0F172A]">{stats.qs}</p></div>
                                <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest">ACTIVE MCQs</p>
                             </div>
                          </div>

                          <div className="mt-10">
                             <Button variant="ghost" className="w-full h-14 rounded-2xl bg-slate-900 text-white font-black uppercase text-[10px] tracking-widest gap-2 group-hover:bg-primary transition-all">
                                START PRACTICE <ChevronRight className="h-4 w-4" />
                             </Button>
                          </div>
                       </Card>
                    </Link>
                  )
               })}
            </div>
         ) : (
            <div className="py-40 text-center opacity-20 flex flex-col items-center">
               <Layers className="h-20 w-20 mb-6" />
               <p className="font-headline font-black text-2xl uppercase tracking-widest">No Exam Verticals Registered</p>
            </div>
         )}
      </main>
      <Footer />
    </div>
  )
}

function Loader2({ className }: { className?: string }) {
  return (
    <svg className={cn("animate-spin", className)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}
