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
  TrendingUp,
  ArrowRight
} from "lucide-react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
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
 * @fileOverview Compact Trending Hubs v58.2.
 * FIXED: Standardized button to Cracklix Blue.
 */
export default function PopularExams() {
  const db = useFirestore();
  const { user, profile } = useUser();
  const { toast } = useToast();
  const router = useRouter();
  
  const [pinningId, setPinningId] = useState<string | null>(null);

  const examsQuery = useMemo(() => {
    if (!db) return null;
    return query(collection(db, "exams"), where("isTrending", "==", true), limit(2));
  }, [db]);

  const boardsQuery = useMemo(() => (db ? collection(db, "boards") : null), [db]);

  const { data: exams, loading } = useCollection<any>(examsQuery);
  const { data: boards } = useCollection<any>(boardsQuery);

  const handleTogglePin = async (e: React.MouseEvent, examId: string) => {
    e.preventDefault(); 
    e.stopPropagation();
    if (!user) { router.push('/login'); return; }
    if (!db || pinningId) return;
    
    setPinningId(examId);
    const isPinned = profile?.pinnedExams?.includes(examId);
    const userRef = doc(db, "users", user.uid);
    
    try {
      if (isPinned) {
        await updateDoc(userRef, { pinnedExams: arrayRemove(examId), updatedAt: serverTimestamp() });
        toast({ title: "Removed from list" });
      } else {
        await updateDoc(userRef, { pinnedExams: arrayUnion(examId), updatedAt: serverTimestamp() });
        toast({ title: "Added to list" });
      }
    } catch (err) {
      toast({ variant: "destructive", title: "Sync failed" });
    } finally {
      setPinningId(null);
    }
  };

  return (
    <section className="py-10 md:py-16 bg-background">
      <div className="max-w-[1440px] mx-auto px-4 md:px-8 space-y-8">
        
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-3">
             <div className="h-8 w-8 md:h-10 md:w-10 rounded-xl bg-rose-50 dark:bg-rose-950/30 flex items-center justify-center text-rose-500 shadow-inner shrink-0">
               <TrendingUp className="h-4 w-4 md:h-5 md:w-5" />
             </div>
             <div className="text-left">
                <h2 className="text-lg md:text-2xl font-black text-foreground tracking-tight">Trending hubs</h2>
                <p className="text-[10px] md:text-xs font-medium text-muted-foreground">Popular recruitment verticals</p>
             </div>
          </div>
          <Link href="/exams" className="text-primary font-bold text-[10px] md:text-xs flex items-center gap-1 hover:underline group">
            View all <ChevronRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-8">
           {loading ? (
              Array.from({ length: 2 }).map((_, i) => (
                <Skeleton key={i} className="h-48 w-full rounded-2xl bg-muted" />
              ))
           ) : exams?.map((exam: any, idx: number) => {
              const board = boards?.find((b: any) => b.id === exam.boardId || b.abbreviation === exam.boardId);
              const isPinned = profile?.pinnedExams?.includes(exam.id);

              return (
                 <motion.div 
                    key={exam.id}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.05 }}
                    className="h-full"
                 >
                    <Link href={`/exams/view?id=${exam.id}`} className="block h-full">
                       <Card className="border border-border shadow-sm hover:shadow-xl transition-all duration-300 rounded-2xl bg-card p-4 md:p-6 flex flex-col group h-full relative overflow-hidden">
                          <div className="flex justify-between items-start mb-4">
                             <AuthorityLogo board={board} boardId={exam.boardId} size="sm" className="h-10 w-10 md:h-12 md:w-12 shadow-lg border-2 border-background bg-muted" />
                             <button 
                               onClick={(e) => handleTogglePin(e, exam.id)}
                               disabled={pinningId === exam.id}
                               className={cn(
                                 "h-9 w-9 rounded-xl border flex items-center justify-center transition-all active:scale-90 shadow-sm",
                                 isPinned ? "bg-primary border-primary text-white" : "bg-muted border-border text-muted-foreground hover:text-primary"
                               )}
                             >
                                {pinningId === exam.id ? <RefreshCw className="h-3 w-3 animate-spin" /> : isPinned ? <CheckCircle2 className="h-3 w-3" /> : <Star className="h-3 w-3" />}
                             </button>
                          </div>

                          <div className="space-y-2 flex-1 text-left">
                             <h3 className="text-sm md:text-lg font-bold text-foreground group-hover:text-primary transition-colors leading-tight line-clamp-2">
                                {exam.name}
                             </h3>
                             <div className="flex items-center gap-2 text-[8px] md:text-[10px] font-bold text-muted-foreground tracking-tight">
                                <ShieldCheck className="h-3 w-3 text-primary" /> Official registry hub
                             </div>
                          </div>

                          <div className="mt-6 pt-4 border-t border-border">
                             <Button className="w-full h-10 md:h-11 bg-primary hover:bg-blue-700 text-white font-black uppercase text-[9px] tracking-widest rounded-xl transition-all border-none">
                                Open Hub <ArrowRight className="ml-2 h-3.5 w-3.5" />
                             </Button>
                          </div>
                       </Card>
                    </Link>
                 </motion.div>
              )
           })}
        </div>
      </div>
    </section>
  );
}
