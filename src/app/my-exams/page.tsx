
"use client"

import React, { useMemo, useEffect, useState } from "react"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import { useUser, useCollection, useFirestore } from "@/firebase"
import { collection, query, where, doc, updateDoc, arrayRemove, serverTimestamp } from "firebase/firestore"
import { GraduationCap, ChevronRight, Star, Plus, X, RefreshCw, Zap } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { AuthorityLogo } from "@/lib/exam-icons"

/**
 * @fileOverview Institutional My Exams Hub v20.1.
 * UPDATED: Removed "Hub" from action buttons.
 */

export default function MyExamsPage() {
  const { user, profile, loading: userLoading } = useUser()
  const db = useFirestore()
  const router = useRouter()
  const { toast } = useToast()
  const [unpinningId, setUnpinningId] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!userLoading && !user && mounted) router.push("/login?returnUrl=/my-exams")
  }, [user, userLoading, router, mounted])

  const examsQuery = useMemo(() => (db && mounted ? collection(db, "exams") : null), [db, mounted])
  const mocksQuery = useMemo(() => (db && mounted ? collection(db, "mocks") : null), [db, mounted])
  const pyqsQuery = useMemo(() => (db && mounted ? collection(db, "pyqs") : null), [db, mounted])
  
  const { data: allExams, loading: examsLoading } = useCollection<any>(examsQuery)
  const { data: mocks } = useCollection<any>(mocksQuery)
  const { data: pyqs } = useCollection<any>(pyqsQuery)
  const { data: boards } = useCollection<any>(useMemo(() => (db ? collection(db, "boards") : null), [db]))

  // ORPHAN PIN CLEANUP
  useEffect(() => {
     if (!examsLoading && allExams && profile?.pinnedExams && db && user) {
        const validExamIds = new Set(allExams.map(e => e.id));
        const orphans = profile.pinnedExams.filter(id => !validExamIds.has(id));
        
        if (orphans.length > 0) {
           console.log(`[AUDIT] Found ${orphans.length} stale pinned exams. Cleaning node...`);
           updateDoc(doc(db, "users", user.uid), {
              pinnedExams: profile.pinnedExams.filter(id => validExamIds.has(id)),
              updatedAt: serverTimestamp()
           }).catch(e => console.error("[AUDIT_FAILURE]:", e));
        }
     }
  }, [allExams, profile, examsLoading, db, user]);

  const statsMap = useMemo(() => {
    const map: Record<string, any> = {};
    (mocks || []).forEach(m => {
       const eids = m.examIds || (m.examId ? [m.examId] : []);
       eids.forEach((eid: string) => {
          if (!map[eid]) map[eid] = { full: 0, subject: 0, sectional: 0, pyq: 0, total: 0 };
          if (m.mockType === 'FULL') map[eid].full++;
          else if (m.mockType === 'SUBJECT') map[eid].subject++;
          else if (m.mockType === 'SECTIONAL') map[eid].sectional++;
          map[eid].total++;
       });
    });
    (pyqs || []).forEach(p => {
       if (p.examId) {
          if (!map[p.examId]) map[p.examId] = { full: 0, subject: 0, sectional: 0, pyq: 0, total: 0 };
          map[p.examId].pyq++;
          map[p.examId].total++;
       }
    });
    return map;
  }, [mocks, pyqs]);

  const pinnedExams = useMemo(() => {
    if (!allExams || !profile?.pinnedExams) return []
    return (allExams as any[]).filter((e: any) => profile.pinnedExams?.includes(e.id))
  }, [allExams, profile])

  const handleUnpin = async (examId: string) => {
    if (!db || !user || unpinningId) return;
    setUnpinningId(examId);
    try {
      await updateDoc(doc(db, "users", user.uid), { pinnedExams: arrayRemove(examId), updatedAt: serverTimestamp() });
      toast({ title: "Removed from list" });
    } finally { setUnpinningId(null); }
  };

  if (userLoading || !mounted) return <div className="h-screen flex items-center justify-center bg-white"><Zap className="h-10 w-10 text-primary animate-pulse" /></div>

  return (
    <div className="flex flex-col min-h-screen bg-slate-50/50 font-body pb-safe text-left">
      <Navbar />
      <main className="container mx-auto px-4 py-8 md:py-16 max-w-7xl space-y-10 md:space-y-14">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 px-1">
           <div className="space-y-1.5 text-center md:text-left">
              <h1 className="text-3xl md:text-5xl font-black text-[#0F172A] leading-tight tracking-tight uppercase">My Exams</h1>
              <p className="text-[11px] md:text-lg text-slate-500 font-medium">Manage your personalized recruitment preparation verticals.</p>
           </div>
           <Button asChild className="w-full md:w-auto h-12 md:h-14 px-10 bg-blue-600 hover:bg-blue-700 text-white shadow-xl rounded-full gap-3 border-none font-black uppercase text-[10px] tracking-widest">
              <Link href="/exams"><Plus className="h-4 w-4" /> Add Exams</Link>
           </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10">
           {examsLoading ? Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-72 w-full rounded-[2.5rem] bg-white" />) : 
           pinnedExams.length > 0 ? pinnedExams.map((exam: any) => {
              const s = statsMap[exam.id] || { full: 0, subject: 0, sectional: 0, pyq: 0, total: 0 };
              const board = boards?.find((b: any) => b.id === exam.boardId || b.abbreviation === exam.boardId);
              
              return (
               <Card key={exam.id} onClick={() => router.push(`/exams/view?id=${exam.id}`)} className="border border-slate-100 shadow-xl hover:shadow-2xl transition-all duration-500 rounded-2rem md:rounded-[2.5rem] bg-white p-6 md:p-10 flex flex-col items-center text-center relative group cursor-pointer">
                  
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleUnpin(exam.id); }} 
                    disabled={unpinningId === exam.id} 
                    className="absolute top-6 right-6 text-slate-300 hover:text-rose-500 transition-colors p-2 active:scale-90 z-10"
                  >
                    {unpinningId === exam.id ? <RefreshCw className="h-5 w-5 animate-spin" /> : <X className="h-5 w-5" />}
                  </button>

                  <div className="mb-6 md:mb-10">
                     <div className="shrink-0 group-hover:scale-105 transition-transform">
                        <AuthorityLogo board={board} boardId={exam.boardId} size="md" className="h-16 w-16 md:h-20 md:w-20 bg-slate-50 shadow-inner" />
                     </div>
                  </div>

                  <div className="flex-1 space-y-4">
                    <h4 className="font-black text-xl md:text-2xl text-[#0F172A] leading-tight group-hover:text-primary transition-colors uppercase">{exam.name}</h4>
                    
                    <div className="space-y-2 md:space-y-3 border-t border-slate-50 pt-6">
                        <StatRow label="Full Length Mocks" val={s.full} />
                        <StatRow label="Subject Tests" val={s.subject} />
                        <StatRow label="Official Papers" val={s.pyq} />
                    </div>
                  </div>

                  <Button className="w-full mt-10 h-12 md:h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg border-none font-black uppercase text-[10px] tracking-widest gap-2">
                     Open Exam <ChevronRight className="h-4 w-4" />
                  </Button>
               </Card>
              )
           }) : (
              <div className="col-span-full py-32 text-center border-2 border-dashed border-slate-200 bg-white/50 rounded-[3rem] opacity-30 flex flex-col items-center gap-6">
                 <GraduationCap className="h-12 w-12" />
                 <p className="font-black uppercase text-sm tracking-[0.2em]">Build your exam hub to start preparing</p>
                 <Button asChild variant="outline" className="rounded-full px-8"><Link href="/exams">Browse Registry</Link></Button>
              </div>
           )}
        </div>
      </main>
      <Footer />
    </div>
  )
}

function StatRow({ label, val }: { label: string, val: number }) {
   return (
      <div className="flex justify-between items-center gap-6 text-[10px] md:text-[11px] font-bold text-slate-400 uppercase tracking-tight w-full max-w-[240px] mx-auto">
         <span>{label}</span>
         <span className={cn("font-black tabular-nums text-sm md:text-lg", val > 0 ? "text-[#0F172A]" : "text-slate-200")}>{val}</span>
      </div>
   )
}
