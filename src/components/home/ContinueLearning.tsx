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
 * @fileOverview High-Fidelity Real-Time Progress Hub v11.2.
 * REDESIGNED: Switched to Premium White UI with Cracklix Blue accents.
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
              <div className="h-8 w-8 rounded-xl bg-[#1677FF]/5 flex items-center justify-center text-[#1677FF] shadow-inner shrink-0">
                 <Target className="h-4 w-4" />
              </div>
              <h2 className="text-lg md:text-2xl font-[800] text-[#071B4D] tracking-tight">Continue learning</h2>
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
                 <Card className="border border-[#E5EAF2] p-6 md:p-8 rounded-[24px] shadow-sm transition-all duration-300 group relative overflow-hidden flex flex-col md:flex-row items-center gap-8 bg-white">
                   <div className="flex items-center gap-6 flex-1 min-w-0 w-full">
                      <div className="relative shrink-0">
                        <AuthorityLogo boardId={mockMeta?.boardId || "GENERAL"} size="md" className="h-14 w-14 md:h-18 md:w-18 shadow-lg border border-[#E5EAF2] bg-[#F8FAFC]" />
                        {!isCompleted && (
                           <div className="absolute -bottom-1 -right-1 h-6 w-6 bg-[#1677FF] rounded-lg flex items-center justify-center shadow-lg animate-pulse border-2 border-white">
                              <Clock className="h-3 w-3 text-white" />
                           </div>
                        )}
                      </div>
                      
                      <div className="flex-1 space-y-2 min-w-0 text-left">
                         <div className="flex items-center gap-3">
                            <Badge className={cn(
                              "border-none px-3 py-1 rounded-full font-black text-[8px] uppercase tracking-widest shadow-sm",
                              isCompleted ? "bg-[#10B981]/10 text-[#10B981]" : "bg-[#1677FF]/10 text-[#1677FF]"
                            )}>
                               {isCompleted ? "Completed" : "In Progress"}
                            </Badge>
                            <span className="text-[9px] font-bold tabular-nums uppercase text-slate-400">
                               Updated: {new Date(activeAttempt.updatedAt?.seconds * 1000 || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                         </div>
                         <h3 className="text-base md:text-2xl font-[800] tracking-tight leading-tight text-[#071B4D] line-clamp-2">
                            {mockMeta.title}
                         </h3>
                         <div className="flex flex-wrap items-center gap-4 pt-1">
                            <div className="flex items-center gap-1.5 text-[10px] md:text-xs font-bold text-slate-400">
                               <BookOpen className="h-3.5 w-3.5" /> {mockMeta.totalQuestions} Questions
                            </div>
                            {resultData && (
                               <div className="flex items-center gap-1.5 text-[#10B981] font-black text-[10px] md:text-xs">
                                  <Trophy className="h-3.5 w-3.5" /> Score: {resultData.score}
                               </div>
                            )}
                         </div>
                      </div>
                   </div>

                   <div className="shrink-0 w-full md:w-auto">
                      <Button asChild className="w-full md:w-auto h-14 md:h-16 px-10 rounded-[18px] font-black uppercase text-[11px] md:text-xs tracking-widest shadow-lg border-none transition-all active:scale-95 gap-3 bg-[#1677FF] hover:bg-[#1677FF]/90 text-white group/btn">
                        <Link href={isCompleted ? `/results/view?id=${activeAttempt.mockId}&attemptId=${activeAttempt.attemptId}` : `/mocks/attempt?id=${activeAttempt.mockId}`}>
                           {isCompleted ? <BarChart3 className="h-5 w-5" /> : <Play className="h-5 w-5 fill-current" />}
                           {isCompleted ? "Analysis" : "Resume test"}
                           <ChevronRight className="h-5 w-5 opacity-40 ml-1 group-hover/btn:translate-x-1 transition-transform" />
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
