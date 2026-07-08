"use client"

import { useMemo, useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import { useDoc, useCollection, useFirestore, useUser } from "@/firebase"
import { collection, query, where, doc, updateDoc, arrayUnion, arrayRemove, serverTimestamp } from "firebase/firestore"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Star, CheckCircle2, RefreshCw, BookOpen, Clock, Zap, Landmark } from "lucide-react"
import { AuthorityLogo } from "@/lib/exam-icons"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"

interface BoardHubClientProps {
  hubId: string;
}

export default function BoardHubClient({ hubId }: BoardHubClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const db = useFirestore();
  const { user, profile, loading: authLoading } = useUser();
  const { toast } = useToast();
  const [pinningId, setPinningId] = useState<string | null>(null);

  const { data: hub, loading: hubLoading } = useDoc<any>(useMemo(() => (db && user ? doc(db, "boards", hubId) : null), [db, hubId, user]));
  
  const examsQuery = useMemo(() => {
     if (!db || !hub || !user) return null;
     return query(collection(db, "exams"), where("boardId", "==", hub.id));
  }, [db, hub, user]);

  const { data: rawExams } = useCollection<any>(examsQuery);
  const { data: mocks } = useCollection<any>(useMemo(() => (db && user ? collection(db, "mocks") : null), [db, user]));
  const { data: pyqs } = useCollection<any>(useMemo(() => (db && user ? collection(db, "pyqs") : null), [db, user]));

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

  const exams = useMemo(() => {
    if (!rawExams) return [];
    return rawExams.sort((a: any, b: any) => (b.displayOrder || 0) - (a.displayOrder || 0));
  }, [rawExams]);

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

  if (authLoading || !user) return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-white space-y-4">
       <Zap className="h-10 w-10 text-primary animate-pulse" />
       <p className="text-[10px] font-black uppercase text-slate-300">Synchronizing Vault...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50/50 font-body text-left">
      <Navbar />
      <section className="bg-white border-b border-slate-100 py-6 md:py-20">
         <div className="container mx-auto px-4 max-w-7xl">
            <button onClick={() => router.back()} className="h-8 w-8 md:h-10 md:w-10 rounded-lg md:rounded-xl border border-slate-100 flex items-center justify-center text-slate-400 hover:text-black mb-6 md:mb-10 transition-all"><ChevronLeft className="h-4 w-4" /></button>
            <div className="space-y-2 md:space-y-4">
               <Badge className="bg-primary/5 text-primary border-none px-3 py-1 rounded-lg text-[8px] md:text-[10px] font-black uppercase tracking-widest">{hub?.abbreviation} Hub</Badge>
               <div className="flex items-center gap-4 md:gap-8">
                  <AuthorityLogo board={hub} boardId={hubId} size="lg" className="md:w-28 md:h-28 rounded-xl md:rounded-[2.5rem] bg-slate-50" />
                  <div className="space-y-0.5">
                    <h1 className="text-xl md:text-5xl font-black text-[#0F172A] leading-tight tracking-tight">{hub?.abbreviation} Selection</h1>
                    <p className="text-[11px] md:text-xl font-bold text-slate-400 leading-tight max-w-2xl">{hub?.name}</p>
                  </div>
               </div>
            </div>
         </div>
      </section>

      <main className="container mx-auto px-4 py-8 md:py-16 max-w-7xl">
         {exams.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10">
               {exams.map((exam) => {
                  const s = statsMap[exam.id] || { full: 0, subject: 0, sectional: 0, pyq: 0, total: 0 };
                  const isPinned = profile?.pinnedExams?.includes(exam.id);
                  const hasContent = s.total > 0;

                  return (
                    <Card key={exam.id} onClick={() => router.push(`/exams/${exam.id}`)} className={cn("border border-[#E5E7EB] shadow-sm hover:shadow-xl transition-all duration-500 rounded-2xl md:rounded-[3rem] bg-white group overflow-hidden h-full flex flex-col p-6 md:p-12 text-left cursor-pointer", !hasContent && "opacity-80 grayscale-[0.3]")}>
                       <div className="flex justify-between items-start mb-6 md:mb-10">
                          <AuthorityLogo board={hub} boardId={hubId} size="md" className="md:w-20 md:h-20 bg-slate-50 rounded-xl group-hover:scale-105 transition-transform" />
                          <button onClick={(e) => { e.stopPropagation(); handleTogglePin(e, exam.id); }} disabled={pinningId === exam.id} className={cn("h-10 w-10 md:h-12 md:w-12 rounded-xl border flex items-center justify-center transition-all shadow-sm", isPinned ? "bg-primary border-primary text-white" : "bg-white border-slate-100 text-slate-300 hover:text-primary")}>
                             {pinningId === exam.id ? <RefreshCw className="h-4 w-4 animate-spin" /> : isPinned ? <CheckCircle2 className="h-4 w-4" /> : <Star className="h-4 w-4" />}
                          </button>
                       </div>
                       
                       <div className="space-y-3 md:space-y-6 flex-1">
                          <h3 className="text-lg md:text-3xl font-black text-[#0F172A] leading-tight group-hover:text-primary transition-colors">{exam.name}</h3>
                          
                          <div className="flex flex-wrap gap-1.5 md:gap-3">
                             {s.full > 0 && <AvailabilityBadge label="Full Tests" emoji="📚" />}
                             {s.pyq > 0 && <AvailabilityBadge label="Papers" emoji="📝" />}
                             <AvailabilityBadge label="Live Updates" emoji="⚡" />
                          </div>
                       </div>
                       
                       <div className="mt-8 md:mt-12">
                          <Button className="w-full h-12 md:h-16 rounded-full bg-[#0F172A] hover:bg-primary text-white font-black uppercase text-[10px] md:text-[13px] tracking-widest gap-3 shadow-xl border-none transition-all active:scale-95">
                             Open Exam <ChevronRight className="h-4 w-4" />
                          </Button>
                       </div>
                    </Card>
                  )
               })}
            </div>
         ) : (
            <div className="py-24 text-center opacity-20 flex flex-col items-center gap-6">
               <Landmark className="h-16 w-16" />
               <p className="font-headline font-black text-xl uppercase tracking-widest">Awaiting Verification</p>
            </div>
         )}
      </main>
      <Footer />
    </div>
  )
}

function AvailabilityBadge({ label, emoji }: { label: string, emoji: string }) {
   return (
      <Badge variant="outline" className="bg-slate-50 border-slate-100 text-[#0F172A] text-[8px] md:text-[10px] font-black uppercase px-2 py-1 rounded-lg whitespace-nowrap flex items-center gap-1.5">
         <span>{emoji}</span>
         {label}
      </Badge>
   )
}
