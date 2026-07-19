'use client';

import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { 
  ChevronRight, 
  Zap, 
  Users,
  FileText,
  BookOpen,
  Bookmark,
  Lock,
  ShieldCheck,
  RefreshCw,
  Landmark
} from "lucide-react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useCollection, useFirestore, useUser } from "@/firebase";
import { collection, query, where, limit, doc, updateDoc, arrayUnion, arrayRemove, serverTimestamp } from "firebase/firestore";
import { Skeleton } from "@/components/ui/skeleton";
import { AuthorityLogo } from "@/lib/exam-icons";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

/**
 * @fileOverview Institutional Popular Exams Hub v51.5.
 * UPDATED: Removed uppercase from recruitment titles and labels.
 */
export default function PopularExams() {
  const db = useFirestore();
  const { user, profile } = useUser();
  const { toast } = useToast();
  const router = useRouter();
  
  const [pinningId, setPinningId] = useState<string | null>(null);

  const examsQuery = useMemo(() => {
    if (!db) return null;
    return query(collection(db, "exams"), where("isTrending", "==", true), limit(8));
  }, [db]);

  const boardsQuery = useMemo(() => (db ? collection(db, "boards") : null), [db]);
  const mocksQuery = useMemo(() => (db ? query(collection(db, "mocks"), where("published", "==", true)) : null), [db]);

  const { data: exams, loading } = useCollection<any>(examsQuery);
  const { data: boards } = useCollection<any>(boardsQuery);
  const { data: mocks } = useCollection<any>(mocksQuery);

  const examStats = useMemo(() => {
    const stats: Record<string, { mocks: number, questions: number }> = {};
    if (!exams) return stats;

    exams.forEach(e => {
       const relatedMocks = (mocks || []).filter((m: any) => m.examId === e.id || m.examIds?.includes(e.id));
       const totalQ = relatedMocks.reduce((acc, m) => acc + (m.totalQuestions || 0), 0);
       
       stats[e.id] = {
          mocks: relatedMocks.length || 0,
          questions: totalQ || 0,
       };
    });
    return stats;
  }, [exams, mocks]);

  const handleTogglePin = async (e: React.MouseEvent, examId: string) => {
    e.preventDefault(); 
    e.stopPropagation();
    
    if (!user) {
      router.push('/login');
      return;
    }

    if (!db || pinningId) return;
    
    setPinningId(examId);
    const isPinned = profile?.pinnedExams?.includes(examId);
    const userRef = doc(db, "users", user.uid);
    
    try {
      if (isPinned) {
        await updateDoc(userRef, { 
          pinnedExams: arrayRemove(examId), 
          updatedAt: serverTimestamp() 
        });
        toast({ title: "Removed from list" });
      } else {
        await updateDoc(userRef, { 
          pinnedExams: arrayUnion(examId), 
          updatedAt: serverTimestamp() 
        });
        toast({ title: "Added to list" });
      }
    } catch (err) {
      toast({ variant: "destructive", title: "Sync failed" });
    } finally {
      setPinningId(null);
    }
  };

  return (
    <section className="py-12 md:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 md:px-8 space-y-12 text-left">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 px-1">
           <div className="space-y-2 text-left">
              <h2 className="text-2xl md:text-4xl font-bold tracking-tighter text-[#0F172A] antialiased">
                Trending hubs
              </h2>
              <p className="text-slate-500 font-medium text-sm md:text-xl max-w-xl leading-snug">
                Popular recruitment verticals selected by the audit team.
              </p>
           </div>
           <Link href="/exams" className="text-primary font-bold text-xs md:text-sm tracking-tight hover:underline flex items-center gap-2 group shrink-0">
              View all <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
           </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
           {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-64 w-full rounded-[2.5rem] bg-slate-50" />
              ))
           ) : exams?.map((exam: any, idx: number) => {
              const board = boards?.find((b: any) => b.id === exam.boardId || b.abbreviation === exam.boardId);
              const isPinned = profile?.pinnedExams?.includes(exam.id);
              const stats = examStats[exam.id] || { mocks: 0, questions: 0 };

              return (
                 <motion.div 
                    key={exam.id}
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.05 }}
                    className="flex flex-col h-full"
                 >
                    <Link href={`/exams/view?id=${exam.id}`} className="flex-1 flex flex-col h-full">
                       <Card className="border border-slate-100 shadow-sm hover:shadow-4xl transition-all duration-500 rounded-[2rem] bg-white p-6 md:p-8 flex flex-col relative overflow-hidden group hover:-translate-y-2 flex-1">
                          
                          <div className="flex justify-between items-start mb-8 w-full relative z-10">
                             <AuthorityLogo 
                               board={board} 
                               boardId={exam.boardId} 
                               size="sm" 
                               className="h-12 w-12 md:h-16 md:w-16 shadow-xl border-4 border-white bg-slate-50" 
                             />
                             <button 
                               onClick={(e) => handleTogglePin(e, exam.id)}
                               disabled={pinningId === exam.id}
                               className={cn(
                                 "h-10 w-10 rounded-xl border flex items-center justify-center transition-all active:scale-90 shadow-sm",
                                 isPinned 
                                   ? "bg-primary border-primary text-white" 
                                   : "bg-white border-slate-100 text-slate-300 hover:text-primary"
                               )}
                             >
                                {pinningId === exam.id ? <RefreshCw className="h-4 w-4 animate-spin" /> : isPinned ? <CheckCircle2 className="h-4 w-4" /> : <Star className="h-4 w-4" />}
                             </button>
                          </div>

                          <div className="space-y-4 flex-1 text-left relative z-10">
                             <h3 className="text-lg md:text-xl font-bold text-[#0F172A] group-hover:text-primary transition-colors leading-tight line-clamp-2">
                                {exam.name}
                             </h3>
                             
                             <div className="flex flex-wrap items-center gap-4 text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                                <span className="flex items-center gap-1.5"><Zap className="h-3.5 w-3.5 text-primary" /> {stats.mocks} Mocks</span>
                                <span className="flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5 text-primary" /> Verified</span>
                             </div>
                          </div>

                          <div className="mt-8 pt-6 border-t border-slate-50 flex items-center justify-between group-hover:text-primary relative z-10">
                             <span className="text-[9px] font-bold uppercase text-slate-400 tracking-widest group-hover:text-primary transition-colors">Start prep</span>
                             <ChevronRight className="h-4 w-4 text-slate-300 transition-transform group-hover:translate-x-1" />
                          </div>
                       </Card>
                    </Link>
                 </motion.div>
              )
           })}
        </div>

        <div className="flex items-center justify-center gap-4 text-slate-300 py-4 opacity-50">
           <ShieldCheck className="h-5 w-5" />
           <span className="text-[10px] font-semibold tracking-widest uppercase">Institutional registry verified</span>
        </div>

      </div>
    </section>
  );
}
