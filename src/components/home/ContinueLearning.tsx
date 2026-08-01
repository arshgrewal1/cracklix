'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { useUser, useCollection, useFirestore } from '@/firebase';
import { collection, query, where, limit } from 'firebase/firestore';
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
  Trophy
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { AuthorityLogo } from '@/lib/exam-icons';
import { motion } from "framer-motion";

/**
 * @fileOverview Compact Progress Tracker v8.0.
 * COMPACT: Drastically reduced card size and padding to match platform standards.
 */
export default function ContinueLearning() {
  const { user, profile } = useUser();
  const db = useFirestore();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const resultsQuery = useMemo(() => {
    if (!db || !user || !mounted) return null;
    return query(collection(db, "results"), where("userId", "==", user.uid), limit(20));
  }, [db, user, mounted]);

  const mocksQuery = useMemo(() => (db && mounted ? collection(db, "mocks") : null), [db, mounted]);
  const quizQuery = useMemo(() => (db && mounted ? collection(db, "daily_quizzes") : null), [db, mounted]);

  const { data: rawResults, loading: resultsLoading } = useCollection<any>(resultsQuery);
  const { data: validMocks, loading: mocksLoading } = useCollection<any>(mocksQuery);
  const { data: validQuizzes, loading: quizLoading } = useCollection<any>(quizQuery);

  const combinedMocks = useMemo(() => {
    return [...(validMocks || []), ...(validQuizzes || [])];
  }, [validMocks, validQuizzes]);

  const recentAttempts = useMemo(() => {
    if (!rawResults || rawResults.length === 0 || combinedMocks.length === 0) return []
    const validMockIds = new Set(combinedMocks.map(m => m.id));
    
    return [...rawResults]
      .filter(r => validMockIds.has(r.mockId))
      .sort((a, b) => {
        const timeA = new Date(a.timestamp || 0).getTime();
        const timeB = new Date(b.timestamp || 0).getTime();
        return timeB - timeA;
      }).slice(0, 2);
  }, [rawResults, combinedMocks]);

  const handleReviewAction = (mockId: string, attemptId?: string) => {
     router.push(`/results/view?id=${mockId}${attemptId ? `&attemptId=${attemptId}` : ''}`);
  };

  if (!mounted || !user) return null;
  if (!resultsLoading && recentAttempts.length === 0) return null;

  return (
    <section className="py-6 md:py-10 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 text-left">
        <div className="flex items-center justify-between px-1">
           <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-xl bg-blue-50 dark:bg-blue-950/30 flex items-center justify-center text-primary shadow-inner shrink-0">
                 <Target className="h-4 w-4" />
              </div>
              <h2 className="text-lg md:text-2xl font-black text-foreground tracking-tight">Continue learning</h2>
           </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
           {resultsLoading ? (
              Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-32 w-full rounded-2xl bg-muted" />)
           ) : recentAttempts.map((res: any, idx: number) => {
              const mockMeta = combinedMocks?.find((m: any) => m.id === res.mockId);
              return (
               <motion.div
                 key={res.id}
                 initial={{ opacity: 0, y: 10 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ delay: idx * 0.1 }}
                 className="h-full"
               >
                 <Card className="border border-border bg-gradient-to-br from-[#0F172A] to-[#1E293B] p-4 md:p-6 rounded-2xl shadow-xl transition-all duration-300 group relative overflow-hidden flex flex-col h-full text-left">
                   <div className="flex items-start justify-between gap-4 mb-4">
                      <AuthorityLogo boardId={mockMeta?.boardId || "GENERAL"} size="sm" className="h-10 w-10 md:h-12 md:w-12 shadow-md border-2 border-white/10" />
                      <Badge className="bg-primary/20 text-[#60A5FA] border-none px-2.5 py-0.5 rounded-full font-bold text-[8px] md:text-[9px]">
                         Score: {res.score}
                      </Badge>
                   </div>
                   
                   <div className="flex-1 space-y-3 min-w-0">
                      <h3 className="text-sm md:text-lg font-bold text-white leading-tight line-clamp-1 truncate">
                         {res.mockTitle}
                      </h3>
                      <div className="flex flex-wrap gap-2">
                         <Badge variant="outline" className="text-[7px] md:text-[8px] border-white/10 text-slate-400 font-medium px-2 py-0">
                            {res.totalQuestions} items
                         </Badge>
                         <Badge variant="outline" className="text-[7px] md:text-[8px] border-white/10 text-slate-400 font-medium px-2 py-0">
                            {mockMeta?.duration || 120} min
                         </Badge>
                      </div>
                   </div>

                   <div className="pt-4">
                      <Button 
                        onClick={() => handleReviewAction(res.mockId, res.attemptId)} 
                        className="w-full h-9 md:h-10 bg-primary hover:bg-blue-700 text-white font-black text-[9px] md:text-[10px] uppercase tracking-widest rounded-xl shadow-lg border-none flex items-center justify-center gap-2"
                      >
                        View analysis
                        <ArrowRight className="h-3 w-3" />
                      </Button>
                   </div>
                 </Card>
               </motion.div>
              )
           })}
        </div>
      </div>
    </section>
  );
}