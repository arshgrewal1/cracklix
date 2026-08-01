'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { useUser, useCollection, useFirestore } from '@/firebase';
import { collection, query, where, limit, orderBy } from 'firebase/firestore';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Zap, 
  Target, 
  ChevronRight,
  BookOpen,
  Clock,
  ArrowRight,
  Trophy,
  RefreshCw,
  Play
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { AuthorityLogo } from '@/lib/exam-icons';
import { motion } from "framer-motion";

/**
 * @fileOverview High-Fidelity Real-Time Progress Hub v9.0.
 * FIXED: Uses onSnapshot (via useCollection) on 'attempts' to ensure instant refresh.
 * LOGIC: Always shows the single most recent activity node (Resumed or Completed).
 */
export default function ContinueLearning() {
  const { user, profile } = useUser();
  const db = useFirestore();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // 1. Listen to the latest attempt pointer (Source of Truth for "Activity")
  const attemptsQuery = useMemo(() => {
    if (!db || !user || !mounted) return null;
    return query(
      collection(db, "attempts"), 
      where("userId", "==", user.uid),
      orderBy("updatedAt", "desc"),
      limit(1)
    );
  }, [db, user, mounted]);

  const { data: latestAttempts, loading: attemptsLoading } = useCollection<any>(attemptsQuery);
  const activeAttempt = latestAttempts?.[0];

  // 2. Fetch the corresponding mock metadata and result if completed
  const [mockMeta, setMockMeta] = useState<any>(null);
  const [resultData, setResultData] = useState<any>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    if (!db || !activeAttempt) {
      setMockMeta(null);
      setResultData(null);
      return;
    }

    const syncMetadata = async () => {
       setIsSyncing(true);
       try {
          const mId = activeAttempt.mockId;
          
          // a. Get Mock Static Meta
          const mSnap = await Promise.all([
             getDoc(doc(db, "mocks", mId)),
             getDoc(doc(db, "daily_quizzes", mId))
          ]);
          const meta = mSnap[0].exists() ? mSnap[0].data() : mSnap[1].exists() ? mSnap[1].data() : null;
          setMockMeta(meta);

          // b. Get Result if completed
          if (activeAttempt.status === 'COMPLETED' && activeAttempt.attemptId) {
             const rSnap = await getDoc(doc(db, "results", activeAttempt.attemptId));
             if (rSnap.exists()) setResultData(rSnap.data());
          } else {
             setResultData(null);
          }
       } catch (e) {
          console.error("[META_SYNC_FAILURE]:", e);
       } finally {
          setIsSyncing(false);
       }
    };

    syncMetadata();
  }, [db, activeAttempt]);

  if (!mounted || !user) return null;
  if (!attemptsLoading && !activeAttempt) return null;

  const isCompleted = activeAttempt?.status === 'COMPLETED';

  return (
    <section className="py-6 md:py-10 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 text-left">
        <div className="flex items-center justify-between px-1">
           <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-inner shrink-0">
                 <Target className="h-4 w-4" />
              </div>
              <h2 className="text-lg md:text-2xl font-black text-foreground tracking-tight">Continue learning</h2>
           </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
           {(attemptsLoading || isSyncing) ? (
              <Skeleton className="h-40 w-full rounded-2xl bg-muted" />
           ) : activeAttempt && mockMeta ? (
               <motion.div
                 initial={{ opacity: 0, y: 10 }}
                 animate={{ opacity: 1, y: 0 }}
                 className="w-full"
               >
                 <Card className={cn(
                   "border border-border p-5 md:p-8 rounded-[2rem] shadow-xl transition-all duration-300 group relative overflow-hidden flex flex-col md:flex-row items-center gap-6 md:gap-10",
                   isCompleted ? "bg-white" : "bg-gradient-to-br from-[#0F172A] to-[#1E293B] text-white"
                 )}>
                   <div className="flex items-center gap-6 flex-1 min-w-0 w-full">
                      <div className="relative shrink-0">
                        <AuthorityLogo boardId={mockMeta?.boardId || "GENERAL"} size="md" className="h-14 w-14 md:h-24 md:w-24 shadow-2xl border-4 border-white/10" />
                        {!isCompleted && (
                           <div className="absolute -bottom-2 -right-2 h-8 w-8 bg-primary rounded-xl flex items-center justify-center shadow-lg animate-pulse border-2 border-[#0F172A]">
                              <Clock className="h-4 w-4 text-white" />
                           </div>
                        )}
                      </div>
                      
                      <div className="flex-1 space-y-3 min-w-0 text-left">
                         <div className="flex items-center gap-2">
                            <Badge className={cn(
                              "border-none px-3 py-1 rounded-full font-black text-[9px] uppercase tracking-widest",
                              isCompleted ? "bg-emerald-100 text-emerald-700" : "bg-primary text-white"
                            )}>
                               {isCompleted ? "Completed" : "In progress"}
                            </Badge>
                            <span className={cn("text-[10px] font-bold tabular-nums uppercase tracking-tight", isCompleted ? "text-slate-400" : "text-slate-500")}>
                               Updated: {new Date(activeAttempt.updatedAt?.seconds * 1000 || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                         </div>
                         <h3 className={cn("text-lg md:text-3xl font-black tracking-tight leading-tight line-clamp-1", isCompleted ? "text-[#0F172A]" : "text-white")}>
                            {mockMeta.title}
                         </h3>
                         <div className="flex flex-wrap items-center gap-4 pt-1">
                            <div className="flex items-center gap-2 text-[10px] md:text-xs font-bold opacity-60">
                               <BookOpen className="h-4 w-4" /> {mockMeta.totalQuestions} Questions
                            </div>
                            {resultData && (
                               <div className="flex items-center gap-2 text-emerald-500 font-black text-[10px] md:text-xs">
                                  <Trophy className="h-4 w-4" /> Last score: {resultData.score}
                               </div>
                            )}
                         </div>
                      </div>
                   </div>

                   <div className="shrink-0 w-full md:w-auto">
                      <Button asChild className={cn(
                        "w-full md:w-auto h-12 md:h-16 px-10 md:px-14 rounded-2xl font-black uppercase text-[10px] md:text-xs tracking-widest shadow-2xl border-none active:scale-95 transition-all gap-3",
                        isCompleted ? "bg-[#0F172A] hover:bg-black text-white" : "bg-primary hover:bg-blue-700 text-white"
                      )}>
                        <Link href={isCompleted ? `/results/view?id=${activeAttempt.mockId}&attemptId=${activeAttempt.attemptId}` : `/mocks/attempt?id=${activeAttempt.mockId}`}>
                           {isCompleted ? <BarChart3 className="h-4 w-4 md:h-5 md:w-5" /> : <Play className="h-4 w-4 md:h-5 md:w-5 fill-current" />}
                           {isCompleted ? "View analysis" : "Resume test"}
                           <ChevronRight className="h-4 w-4 md:h-5 md:w-5 opacity-40 ml-2" />
                        </Link>
                      </Button>
                   </div>
                 </Card>
               </motion.div>
           ) : null}
        </div>
      </div>
    </section>
  );
}

import { getDoc, doc } from 'firebase/firestore';
