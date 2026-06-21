"use client"

import { useMemo, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import { useDoc, useCollection, useFirestore, useUser } from "@/firebase"
import { collection, query, where, doc, updateDoc, arrayUnion, arrayRemove, serverTimestamp } from "firebase/firestore"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, GraduationCap, Star, CheckCircle2, RefreshCw, Info, Loader2, BookOpen, Clock, Zap } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"

/**
 * @fileOverview Hierarchical Board vertical v61.0.
 * FLOW: Board -> Exam Selection. Terminology: "Open Exam".
 */

export default function HubExamsPage() {
  const params = useParams();
  const router = useRouter();
  const db = useFirestore();
  const { user, profile } = useUser();
  const { toast } = useToast();
  const hubId = params.id as string;
  const [pinningId, setPinningId] = useState<string | null>(null);

  const { data: hub, loading: hubLoading } = useDoc<any>(useMemo(() => (db ? doc(db, "boards", hubId) : null), [db, hubId]));
  
  const examsQuery = useMemo(() => {
     if (!db || !hub) return null;
     return query(collection(db, "exams"), where("boardId", "==", hub.id));
  }, [db, hub]);

  const { data: rawExams, loading: examsLoading } = useCollection<any>(examsQuery);
  const { data: mocks } = useCollection<any>(useMemo(() => (db ? collection(db, "mocks") : null), [db]));
  const { data: pyqs } = useCollection<any>(useMemo(() => (db ? collection(db, "pyqs") : null), [db]));

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

  // CONTENT GUARD: Hide exams with 0 content
  const exams = useMemo(() => {
    if (!rawExams) return [];
    return rawExams.filter((e: any) => (statsMap[e.id]?.total || 0) > 0);
  }, [rawExams, statsMap]);

  const handleTogglePin = async (e: React.MouseEvent, examId: string) => {
    e.preventDefault(); e.stopPropagation();
    if (!db || !user || pinningId) return;
    setPinningId(examId);
    const isPinned = profile?.pinnedExams?.includes(examId);
    const userRef = doc(db, "users", user.uid);
    try {
      if (isPinned) await updateDoc(userRef, { pinnedExams: arrayRemove(examId), updatedAt: serverTimestamp() });
      else await updateDoc(userRef, { pinnedExams: arrayUnion(examId), updatedAt: serverTimestamp() });
      toast({ title: isPinned ? "Removed from list" : "Added to list" });
    } finally { setPinningId(null); }
  };

  if (hubLoading) return <div className="h-screen bg-white flex flex-col items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>;

  return (
    <div className="min-h-screen bg-slate-50/50 font-body text-left">
      <Navbar />
      <section className="bg-white border-b border-slate-100 py-12 md:py-20">
         <div className="container mx-auto px-4 max-w-7xl">
            <button onClick={() => router.back()} className="h-10 w-10 rounded-xl border border-slate-100 flex items-center justify-center text-slate-400 hover:text-black mb-10 transition-all"><ChevronLeft className="h-5 w-5" /></button>
            <div className="space-y-4">
               <Badge className="bg-primary/5 text-primary border-none px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest">{hub?.abbreviation} Hub</Badge>
               <h1 className="text-3xl md:text-5xl font-black text-[#0F172A] leading-tight tracking-tight">{hub?.abbreviation} Selection</h1>
               <p className="text-base md:text-xl font-bold text-slate-400 leading-tight max-w-2xl">{hub?.name}</p>
            </div>
         </div>
      </section>

      <main className="container mx-auto px-4 py-16 max-w-7xl">
         {examsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-80 w-full rounded-[2.5rem] bg-white" />)}</div>
         ) : exams.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
               {exams.map((exam) => {
                  const s = statsMap[exam.id] || { full: 0, subject: 0, sectional: 0, pyq: 0, total: 0 };
                  const isPinned = profile?.pinnedExams?.includes(exam.id);
                  return (
                    <Card key={exam.id} onClick={() => router.push(`/exams/${exam.id}`)} className="border border-[#E5E7EB] shadow-sm hover:shadow-xl transition-all duration-500 rounded-[2.5rem] bg-white group overflow-hidden h-full flex flex-col p-10 text-left cursor-pointer">
                       <div className="flex justify-between items-start mb-8">
                          <div className="h-14 w-14 rounded-2xl bg-slate-50 flex items-center justify-center shrink-0 shadow-inner group-hover:scale-105 transition-transform">
                             <GraduationCap className="h-7 w-7 text-primary" />
                          </div>
                          <button onClick={(e) => handleTogglePin(e, exam.id)} disabled={pinningId === exam.id} className={cn("h-10 w-10 rounded-xl border flex items-center justify-center transition-all", isPinned ? "bg-primary border-primary text-white" : "bg-white border-slate-100 text-slate-300 shadow-sm")}>
                             {pinningId === exam.id ? <RefreshCw className="h-4 w-4 animate-spin" /> : isPinned ? <CheckCircle2 className="h-4 w-4" /> : <Star className="h-4 w-4" />}
                          </button>
                       </div>
                       <h3 className="text-xl md:text-2xl font-black text-[#0F172A] leading-tight group-hover:text-primary transition-colors mb-6">{exam.name}</h3>
                       
                       <div className="mt-auto space-y-8">
                          <div className="flex flex-wrap gap-x-4 gap-y-2 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                             {s.full > 0 && <span className="flex items-center gap-1.5"><Zap className="h-3 w-3" /> {s.full} Mocks</span>}
                             {s.subject > 0 && <span className="flex items-center gap-1.5"><BookOpen className="h-3 w-3" /> {s.subject} Subject</span>}
                             {s.pyq > 0 && <span className="flex items-center gap-1.5"><Clock className="h-3 w-3" /> {s.pyq} PYQs</span>}
                          </div>
                          <Button className="w-full h-12 rounded-xl bg-[#0F172A] hover:bg-primary text-white font-black uppercase text-[11px] tracking-[0.2em] gap-3 shadow-md border-none transition-all active:scale-95">
                             Open Exam <ChevronRight className="h-4 w-4" />
                          </Button>
                       </div>
                    </Card>
                  )
               })}
            </div>
         ) : (
            <div className="py-40 text-center opacity-20 flex flex-col items-center gap-6">
               <Info className="h-16 w-16" />
               <p className="font-headline font-black text-3xl uppercase tracking-widest">Awaiting Verification</p>
            </div>
         )}
      </main>
      <Footer />
    </div>
  )
}
