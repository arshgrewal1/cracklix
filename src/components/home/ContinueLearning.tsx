'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { useUser, useCollection, useFirestore } from '@/firebase';
import { collection, query, where, limit, doc, getDoc, serverTimestamp } from 'firebase/firestore';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Zap, 
  Target, 
  ChevronRight,
  BookOpen,
  Clock,
  Trophy,
  RefreshCw,
  Play,
  BarChart3
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { AuthorityLogo } from '@/lib/exam-icons';
import { motion } from "framer-motion";

/**
 * @fileOverview High-Fidelity Real-Time Progress Hub v11.1.
 * FIXED: Title truncation resolved - allows 2 lines on mobile.
 */
export default function ContinueLearning() {
  const { user } = useUser();
  const db = useFirestore();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // 1. Fetch user attempts without orderBy to bypass index requirement
  const attemptsQuery = useMemo(() => {
    if (!db || !user || !mounted) return null;
    return query(
      collection(db, "attempts"), 
      where("userId", "==", user.uid),
      limit(50)
    );
  }, [db, user, mounted]);

  const { data: rawAttempts, loading: attemptsLoading } = useCollection<any>(attemptsQuery);

  // 2. Identify the absolute latest activity client-side
  const activeAttempt = useMemo(() => {
    if (!rawAttempts || rawAttempts.length === 0) return null;
    return [...rawAttempts].sort((a, b) => {
       const tA = a.updatedAt?.seconds || 0;
       const tB = b.updatedAt?.seconds || 0;
       return tB - tA;
    })[0];
  }, [rawAttempts]);

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
          const mRef = doc(db, "mocks", mId);
          const dRef = doc(db, "daily_quizzes", mId);
          
          const [mSnap, dSnap] = await Promise.all([getDoc(mRef), getDoc(dRef)]);
          const meta = mSnap.exists() ? mSnap.data() : dSnap.exists() ? dSnap.data() : null;
          setMockMeta(meta);

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
              <Skeleton className="h-28 w-full rounded-2xl bg-muted" />
           ) : activeAttempt && mockMeta ? (
               <motion.div
                 initial={{ opacity: 0, y: 10 }}
                 animate={{ opacity: 1, y: 0 }}
                 className="w-full"
               >
                 <Card className={cn(
                   "border border-border p-4 md:p-6 rounded-2xl shadow-lg transition-all duration-300 group relative overflow-hidden flex flex-col md:flex-row items-center gap-6",
                   isCompleted ? "bg-white" : "bg-gradient-to-br from-[#0F172A] to-[#1E293B] text-white"
                 )}>
                   <div className="flex items-center gap-6 flex-1 min-w-0 w-full">
                      <div className="relative shrink-0">
                        <AuthorityLogo boardId={mockMeta?.boardId || "GENERAL"} size="sm" className="h-12 w-12 md:h-16 md:w-16 shadow-xl border-2 border-white/10" />
                        {!isCompleted && (
                           <div className="absolute -bottom-1 -right-1 h-6 w-6 bg-primary rounded-lg flex items-center justify-center shadow-lg animate-pulse border-2 border-[#0F172A]">
                              <Clock className="h-3 w-3 text-white" />
                           </div>
                        )}
                      </div>
                      
                      <div className="flex-1 space-y-2 min-w-0 text-left">
                         <div className="flex items-center gap-2">
                            <Badge className={cn(
                              "border-none px-2 py-0.5 rounded-md font-bold text-[8px] uppercase tracking-tight",
                              isCompleted ? "bg-emerald-100 text-emerald-700" : "bg-primary text-white"
                            )}>
                               {isCompleted ? "Completed" : "In Progress"}
                            </Badge>
                            <span className={cn("text-[9px] font-bold tabular-nums uppercase", isCompleted ? "text-slate-400" : "text-slate-500")}>
                               Updated: {new Date(activeAttempt.updatedAt?.seconds * 1000 || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                         </div>
                         <h3 className={cn("text-base md:text-xl font-black tracking-tight leading-tight line-clamp-2", isCompleted ? "text-[#0F172A]" : "text-white")}>
                            {mockMeta.title}
                         </h3>
                         <div className="flex flex-wrap items-center gap-4 pt-1">
                            <div className="flex items-center gap-1.5 text-[9px] font-bold opacity-60">
                               <BookOpen className="h-3 w-3" /> {mockMeta.totalQuestions} Questions
                            </div>
                            {resultData && (
                               <div className="flex items-center gap-1.5 text-emerald-500 font-black text-[9px]">
                                  <Trophy className="h-3 w-3" /> Last Score: {resultData.score}
                               </div>
                            )}
                         </div>
                      </div>
                   </div>

                   <div className="shrink-0 w-full md:w-auto">
                      <Button asChild className={cn(
                        "w-full md:w-auto h-11 px-8 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-lg border-none transition-all active:scale-95 gap-2",
                        isCompleted ? "bg-[#0F172A] hover:bg-black text-white" : "bg-primary hover:bg-blue-700 text-white"
                      )}>
                        <Link href={isCompleted ? `/results/view?id=${activeAttempt.mockId}&attemptId=${activeAttempt.attemptId}` : `/mocks/attempt?id=${activeAttempt.mockId}`}>
                           {isCompleted ? <BarChart3 className="h-4 w-4" /> : <Play className="h-4 w-4 fill-current" />}
                           {isCompleted ? "View Analysis" : "Resume Test"}
                           <ChevronRight className="h-4 w-4 opacity-40 ml-1" />
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