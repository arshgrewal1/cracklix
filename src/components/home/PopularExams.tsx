'use client';

import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { 
  ChevronRight, 
  Zap, 
  ShieldCheck, 
  RefreshCw, 
  Star, 
  CheckCircle2,
  TrendingUp
} from "lucide-react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { useCollection, useFirestore, useUser } from "@/firebase";
import { collection, query, where, limit, doc, updateDoc, arrayUnion, arrayRemove, serverTimestamp } from "firebase/firestore";
import { Skeleton } from "@/components/ui/skeleton";
import { AuthorityLogo } from "@/lib/exam-icons";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

/**
 * @fileOverview Standardized Popular Exams Hub v57.0.
 * UPDATED: Integrated adaptive dark mode support.
 */
export default function PopularExams() {
  const db = useFirestore();
  const { user, profile } = useUser();
  const { toast } = useToast();
  const router = useRouter();
  
  const [pinningId, setPinningId] = useState<string | null>(null);

  const examsQuery = useMemo(() => {
    if (!db) return null;
    return query(collection(db, "exams"), where("isTrending", "==", true), limit(3));
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
    <section className="py-12 md:py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 md:px-8 space-y-10">
        
        {/* Standardized Header */}
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-4">
             <div className="h-10 w-10 md:h-12 md:w-12 rounded-xl bg-rose-50 dark:bg-rose-950/30 flex items-center justify-center text-rose-500 shadow-inner shrink-0">
               <TrendingUp className="h-5 w-5 md:h-6 md:w-6" />
             </div>
             <div className="text-left">
                <h2 className="text-xl md:text-3xl font-black text-foreground tracking-tight">Trending hubs</h2>
                <p className="text-[11px] md:text-sm font-medium text-muted-foreground">Popular recruitment verticals.</p>
             </div>
          </div>
          <Link href="/exams" className="text-primary font-bold text-xs md:text-sm flex items-center gap-1 hover:underline group">
            View all <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
           {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-64 w-full rounded-[2rem] bg-muted border border-border" />
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
                       <Card className="border border-border shadow-sm hover:shadow-4xl transition-all duration-500 rounded-[2rem] bg-card p-6 md:p-8 flex flex-col relative overflow-hidden group hover:-translate-y-2 flex-1">
                          
                          <div className="flex justify-between items-start mb-8 w-full relative z-10">
                             <AuthorityLogo 
                               board={board} 
                               boardId={exam.boardId} 
                               size="sm" 
                               className="h-12 w-12 md:h-16 md:w-16 shadow-xl border-4 border-border bg-muted" 
                             />
                             <button 
                               onClick={(e) => handleTogglePin(e, exam.id)}
                               disabled={pinningId === exam.id}
                               className={cn(
                                 "h-10 w-10 rounded-xl border flex items-center justify-center transition-all active:scale-90 shadow-sm",
                                 isPinned 
                                   ? "bg-primary border-primary text-white" 
                                   : "bg-muted border-border text-muted-foreground hover:text-primary"
                               )}
                             >
                                {pinningId === exam.id ? <RefreshCw className="h-4 w-4 animate-spin" /> : isPinned ? <CheckCircle2 className="h-4 w-4" /> : <Star className="h-4 w-4" />}
                             </button>
                          </div>

                          <div className="space-y-4 flex-1 text-left relative z-10">
                             <h3 className="text-lg md:text-xl font-bold text-foreground group-hover:text-primary transition-colors leading-tight line-clamp-2">
                                {exam.name}
                             </h3>
                             
                             <div className="flex flex-wrap items-center gap-4 text-[9px] font-bold text-muted-foreground tracking-tight">
                                <span className="flex items-center gap-1.5"><Zap className="h-3.5 w-3.5 text-primary" /> {stats.mocks} Mocks</span>
                                <span className="flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5 text-primary" /> Verified</span>
                             </div>
                          </div>

                          <div className="mt-8 pt-6 border-t border-border flex items-center justify-between group-hover:text-primary relative z-10">
                             <span className="text-[9px] font-bold text-muted-foreground group-hover:text-primary transition-colors">Start prep</span>
                             <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
                          </div>
                       </Card>
                    </Link>
                 </motion.div>
              )
           })}
        </div>

        <div className="flex items-center justify-center gap-4 text-muted-foreground py-4 opacity-50">
           <ShieldCheck className="h-5 w-5" />
           <span className="text-[10px] font-semibold tracking-tight">Institutional registry verified</span>
        </div>

      </div>
    </section>
  );
}