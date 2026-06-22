"use client"

import { useMemo, useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import { useCollection, useFirestore, useUser } from "@/firebase"
import { collection, query, where, doc, updateDoc, arrayUnion, arrayRemove, serverTimestamp } from "firebase/firestore"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Star, CheckCircle2, RefreshCw, Zap } from "lucide-react"
import { AuthorityLogo } from "@/lib/exam-icons"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"

interface CategoryHubClientProps {
  catId: string;
}

export default function CategoryHubClient({ catId }: CategoryHubClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const db = useFirestore();
  const { user, profile, loading: authLoading } = useUser();
  const { toast } = useToast();
  const [pinningId, setPinningId] = useState<string | null>(null);

  const { data: categories } = useCollection<any>(useMemo(() => (db ? collection(db, "categories") : null), [db]));
  const category = categories?.find(c => c.id === catId);

  const boardsQuery = useMemo(() => (db && user ? query(collection(db, "boards"), where("categoryId", "==", catId)) : null), [db, catId, user]);
  const examsQuery = useMemo(() => (db && user ? query(collection(db, "exams"), where("categoryId", "==", catId)) : null), [db, catId, user]);

  const { data: boards } = useCollection<any>(boardsQuery);
  const { data: rawExams } = useCollection<any>(examsQuery);
  
  const { data: mocks } = useCollection<any>(useMemo(() => (db && user ? collection(db, "mocks") : null), [db, user]));
  const { data: pyqs } = useCollection<any>(useMemo(() => (db && user ? collection(db, "pyqs") : null), [db, user]));

  const statsMap = useMemo(() => {
    const map: Record<string, any> = {};
    (mocks || []).forEach(m => {
      const eids = m.examIds || (m.examId ? [m.examId] : []);
      eids.forEach((eid: string) => {
        if (!map[eid]) map[eid] = { total: 0 };
        map[eid].total++;
      });
    });
    (pyqs || []).forEach(p => {
       if (p.examId) {
          if (!map[p.examId]) map[p.examId] = { total: 0 };
          map[p.examId].total++;
       }
    });
    return map;
  }, [mocks, pyqs]);

  const activeExams = useMemo(() => {
     if (!rawExams) return [];
     return rawExams.filter(e => (statsMap[e.id]?.total || 0) > 0);
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
      toast({ title: isPinned ? "Removed from hub" : "Added to your hub" });
    } finally { setPinningId(null); }
  };

  if (authLoading || !user) return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-white space-y-4">
       <Zap className="h-10 w-10 text-primary animate-pulse" />
       <p className="text-[10px] font-black uppercase text-slate-300">Authorizing Access...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50/50 font-body text-left">
      <Navbar />
      
      <section className="bg-white border-b border-slate-100 py-6 md:py-20 relative overflow-hidden">
         <div className="container mx-auto px-4 max-w-7xl relative z-10">
            <button onClick={() => router.back()} className="h-8 w-8 md:h-10 md:w-10 rounded-lg md:rounded-xl border border-slate-100 flex items-center justify-center text-slate-400 hover:text-black mb-4 md:mb-8 transition-all">
               <ChevronLeft className="h-4 w-4 md:h-5 md:w-5" />
            </button>
            <div className="flex items-center gap-4 md:gap-8">
               <AuthorityLogo category={category} size="lg" className="md:w-28 md:h-28 rounded-xl md:rounded-[2.5rem] bg-slate-50" />
               <div className="space-y-0.5">
                  <h1 className="text-xl md:text-5xl font-black text-[#0F172A] leading-tight tracking-tight">
                     {category?.title || "Exam Selection"}
                  </h1>
                  <p className="text-[11px] md:text-xl font-bold text-slate-400 tracking-tight max-w-3xl">
                     {category?.description || "Select a board or authority to view specific exams."}
                  </p>
               </div>
            </div>
         </div>
      </section>

      <main className="container mx-auto px-4 py-8 md:py-16 max-w-7xl">
         {boards && boards.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
               {boards.map((board) => (
                  <Card key={board.id} onClick={() => router.push(`/exams/hub/${board.id}`)} className="border border-[#E5E7EB] shadow-sm hover:shadow-xl transition-all duration-500 rounded-2xl md:rounded-[2.5rem] bg-white group overflow-hidden flex flex-col p-6 md:p-10 text-left cursor-pointer h-full">
                     <AuthorityLogo board={board} category={category} size="md" className="md:w-20 md:h-20 bg-slate-50 rounded-xl mb-4 md:mb-8 group-hover:scale-105 transition-transform" />
                     <h3 className="text-lg md:text-2xl font-black text-[#0F172A] group-hover:text-primary transition-colors leading-tight mb-2 md:mb-4">{board.abbreviation}</h3>
                     <p className="text-[11px] md:sm text-slate-500 font-medium mb-6 md:mb-10 flex-1 leading-relaxed">{board.name}</p>
                     <div className="mt-auto pt-4 md:pt-8 border-t border-slate-50 flex items-center justify-between">
                        <span className="text-[9px] md:text-[10px] font-black text-primary uppercase tracking-widest">Authority Hub</span>
                        <Button variant="ghost" className="h-9 md:h-11 px-6 md:px-8 rounded-full bg-[#0F172A] text-white group-hover:bg-primary transition-all font-bold text-[9px] md:text-[11px] tracking-widest uppercase border-none shadow-md gap-2">
                           View <ChevronRight className="h-3 w-3" />
                        </Button>
                     </div>
                  </Card>
               ))}
            </div>
         ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
               {activeExams.map((exam) => {
                  const isPinned = profile?.pinnedExams?.includes(exam.id);
                  return (
                    <Card key={exam.id} onClick={() => router.push(`/exams/${exam.id}`)} className="border border-[#E5E7EB] shadow-sm hover:shadow-xl transition-all duration-500 rounded-2xl md:rounded-[2.5rem] bg-white group overflow-hidden h-full flex flex-col p-6 md:p-10 text-left cursor-pointer">
                       <div className="flex justify-between items-start mb-4 md:mb-8">
                          <AuthorityLogo category={category} size="md" className="md:w-20 md:h-20 bg-slate-50 rounded-xl" />
                          <button onClick={(e) => handleTogglePin(e, exam.id)} disabled={pinningId === exam.id} className={cn("h-10 w-10 md:h-12 md:w-12 rounded-xl border flex items-center justify-center transition-all shadow-sm", isPinned ? "bg-primary border-primary text-white" : "bg-white border-slate-100 text-slate-300 hover:text-primary")}>
                             {pinningId === exam.id ? <RefreshCw className="h-4 w-4 animate-spin" /> : isPinned ? <CheckCircle2 className="h-4 w-4" /> : <Star className="h-4 w-4" />}
                          </button>
                       </div>
                       <h3 className="text-lg md:text-2xl font-black text-[#0F172A] group-hover:text-primary transition-colors leading-tight mb-4 md:mb-6">{exam.name}</h3>
                       <div className="mt-auto">
                          <Button className="w-full h-11 md:h-12 rounded-full bg-[#0F172A] text-white group-hover:bg-primary transition-all font-bold text-[10px] md:text-[11px] tracking-widest uppercase border-none shadow-md gap-2">
                             Open Exam <ChevronRight className="h-3 w-3" />
                          </Button>
                       </div>
                    </Card>
                  )
               })}
            </div>
         )}
      </main>
      <Footer />
    </div>
  )
}