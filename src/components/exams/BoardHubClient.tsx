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

interface BoardHubClientProps {
  hubId: string;
}

/**
 * @fileOverview Premium Board Hub Portal v5.6.
 * FIXED: Reduced card title font size to prevent text cutoff on long titles.
 */

export default function BoardHubClient({ hubId }: BoardHubClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const db = useFirestore();
  const { user, profile, loading: authLoading } = useUser();
  const { toast } = useToast();
  const [pinningId, setPinningId] = useState<string | null>(null);

  const { data: hub, loading: hubLoading } = useDoc<any>(useMemo(() => (db && hubId ? doc(db, "boards", hubId) : null), [db, hubId]));
  
  const examsQuery = useMemo(() => {
     if (!db || !hubId) return null;
     return query(collection(db, "exams"), where("boardId", "==", hubId));
  }, [db, hubId]);

  const { data: rawExams, loading: examsLoading } = useCollection<any>(examsQuery);
  const { data: mocks } = useCollection<any>(useMemo(() => (db ? collection(db, "mocks") : null), [db]));

  const statsMap = useMemo(() => {
    const map: Record<string, any> = {};
    (mocks || []).forEach(m => {
      const eids = m.examIds || (m.examId ? [m.examId] : []);
      eids.forEach((eid: string) => {
        if (!map[eid]) map[eid] = { mocks: 0, subject: 0, sectional: 0, total: 0 };
        if (m.mockType === 'FULL') map[eid].mocks++;
        map[eid].total++;
      });
    });
    return map;
  }, [mocks]);

  const exams = useMemo(() => {
    if (!rawExams) return [];
    return [...rawExams].sort((a: any, b: any) => (a.displayOrder || 0) - (b.displayOrder || 0));
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
      toast({ title: isPinned ? "Removed from dashboard" : "Added to dashboard" });
    } finally { setPinningId(null); }
  };

  if (authLoading) return <div className="h-screen w-full flex items-center justify-center bg-white"><Zap className="h-10 w-10 text-primary animate-pulse" /></div>;

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-body text-left selection:bg-primary/10 flex flex-col overflow-x-hidden w-full">
      <Navbar />
      
      {/* 1. PREMIUM RECRUITMENT HERO */}
      <section className="bg-white border-b border-slate-100 pt-10 pb-12 md:pt-16 md:pb-24 relative overflow-hidden">
         <div className="absolute top-0 right-0 w-1/3 h-full bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
         
         <div className="container mx-auto px-4 md:px-12 max-get-7xl relative z-10 space-y-10">
            <div className="flex items-center gap-4">
               <button onClick={() => router.back()} className="h-10 w-10 rounded-xl md:rounded-2xl border border-slate-100 bg-white flex items-center justify-center text-slate-400 hover:text-primary transition-all shadow-sm active:scale-90 shrink-0">
                  <ChevronLeft className="h-5 w-5 md:h-6 md:w-6" />
               </button>
               <Badge className="bg-primary/10 text-primary border-none px-4 py-1.5 rounded-full font-bold text-[9px] md:text-[11px] tracking-tight shadow-sm">Official board hub</Badge>
            </div>

            <div className="flex flex-col md:flex-row items-center gap-8 md:gap-14">
               <AuthorityLogo board={hub} boardId={hubId} size="lg" className="h-24 w-24 md:h-44 md:w-44 rounded-[2rem] md:rounded-[4rem] bg-slate-50 border-[8px] border-slate-100 shadow-5xl group-hover:scale-105 transition-transform" />
               <div className="space-y-3 text-center md:text-left flex-1 min-w-0">
                  <h1 className="text-2xl sm:text-4xl md:text-6xl font-[800] text-[#0F172A] tracking-tight leading-none antialiased">
                     {hub?.abbreviation || "Board hub"}
                  </h1>
                  <p className="text-sm md:text-xl text-slate-500 font-bold leading-tight tracking-tight max-w-3xl">
                     {hub?.name || "Official recruitment board portal."}
                  </p>
                  <div className="flex flex-wrap justify-center md:justify-start items-center gap-4 pt-4">
                     <div className="flex items-center gap-2 text-emerald-600 font-black text-[10px] md:text-sm uppercase tracking-widest bg-emerald-50 px-4 py-1.5 rounded-full border border-emerald-100 shadow-sm">
                        <ShieldCheck className="h-4 w-4" /> Official patterns
                     </div>
                     <span className="text-[10px] md:text-sm font-bold text-slate-400 uppercase tracking-widest">{exams?.length || 0} Exam verticals active</span>
                  </div>
               </div>
            </div>
         </div>
      </section>

      <main className="container mx-auto px-4 md:px-12 py-10 md:py-24 max-w-7xl flex-1">
         {examsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10">
               {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-80 w-full rounded-[3rem] bg-white" />) }
            </div>
         ) : exams && exams.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10">
               {exams.map((exam, idx) => {
                  const s = statsMap[exam.id] || { mocks: 0, total: 0 };
                  const isPinned = profile?.pinnedExams?.includes(exam.id);

                  return (
                    <motion.div 
                      key={exam.id} 
                      initial={{ opacity: 0, y: 15 }} 
                      animate={{ opacity: 1, y: 0 }} 
                      transition={{ delay: idx * 0.05 }}
                    >
                       <Link href={`/exams/view?id=${exam.id}`}>
                          <Card className="border border-[#E5E7EB] shadow-xl hover:shadow-5xl transition-all duration-500 rounded-[2.5rem] md:rounded-[3.5rem] bg-white group overflow-hidden h-full flex flex-col p-8 md:p-12 text-left relative">
                             <div className="flex justify-between items-start mb-10 w-full relative z-10">
                                <AuthorityLogo boardId={hubId} size="md" className="h-16 w-16 md:h-24 md:w-24 bg-slate-50 rounded-2xl group-hover:scale-105 transition-transform shadow-2xl border-4 border-white" />
                                {user && (
                                  <button onClick={(e) => handleTogglePin(e, exam.id)} disabled={pinningId === exam.id} className={cn("h-10 w-10 md:h-12 md:w-12 rounded-xl border flex items-center justify-center transition-all active:scale-90 shadow-sm", isPinned ? "bg-primary border-primary text-white" : "bg-white border-slate-100 text-slate-300 hover:text-primary")}>
                                     {pinningId === exam.id ? <RefreshCw className="h-4 w-4 animate-spin" /> : isPinned ? <CheckCircle2 className="h-4 w-4" /> : <Star className="h-4 w-4" />}
                                  </button>
                                )}
                             </div>
                             
                             <div className="space-y-6 flex-1 text-left relative z-10">
                                <h3 className="text-xl md:text-2xl font-black text-[#0F172A] leading-tight group-hover:text-primary transition-colors tracking-tight line-clamp-2 break-words uppercase">{exam.name}</h3>
                                
                                <div className="grid grid-cols-2 gap-4 pt-6 border-t border-slate-50">
                                   <MetricPlate icon={Zap} label="Mocks" val={s.mocks || "New"} />
                                   <MetricPlate icon={FileStack} label="Archives" val="Active" />
                                </div>
                             </div>
                             
                             <div className="mt-12 pt-4 relative z-10">
                                <Button className="w-full h-14 md:h-18 rounded-[20px] bg-[#0F172A] hover:bg-black text-white group-hover:bg-primary transition-all font-bold text-sm tracking-tight border-none shadow-3xl gap-3">
                                   View tests <ChevronRight className="h-4 w-4 ml-auto opacity-30" />
                                </Button>
                             </div>
                             <div className="absolute top-0 right-0 p-8 opacity-[0.02] pointer-events-none group-hover:scale-125 transition-transform duration-1000"><Landmark className="h-48 w-48" /></div>
                          </Card>
                       </Link>
                    </motion.div>
                  )
               })}
            </div>
         ) : (
            <div className="py-40 text-center opacity-30 flex flex-col items-center gap-10">
               <div className="h-24 w-24 bg-slate-100 rounded-[3rem] flex items-center justify-center text-slate-300"><Layers className="h-10 w-10" /></div>
               <p className="font-black text-2xl md:text-5xl tracking-tight">Hub standby</p>
            </div>
         )}
      </main>
      <Footer />
    </div>
  )
}

function MetricPlate({ icon: Icon, label, val }: any) {
   return (
      <div className="flex flex-col gap-1.5">
         <div className="flex items-center gap-2 text-slate-400">
            <Icon className="h-4 w-4" />
            <span className="text-[9px] font-bold tracking-tight">{label}</span>
         </div>
         <p className="text-lg md:text-2xl font-black text-[#0F172A] tabular-nums tracking-tighter">{val}</p>
      </div>
   )
}
