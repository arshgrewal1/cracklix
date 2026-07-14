'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { useUser, useCollection, useFirestore } from '@/firebase';
import { collection, query, where, limit, orderBy } from 'firebase/firestore';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Zap, 
  Trophy, 
  Target, 
  Star, 
  GraduationCap, 
  ChevronRight,
  BookOpen,
  Clock,
  Award,
  ArrowRight
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { AuthorityLogo } from '@/lib/exam-icons';
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

/**
 * @fileOverview Institutional Performance Hub v6.3.
 * UPDATED: Normalized casing for headings.
 */

// Formatting Utilities
const formatTime = (seconds: number) => {
  if (!seconds || seconds <= 0 || isNaN(seconds)) return "--";
  
  if (seconds < 60) return `${Math.round(seconds)}s`;
  
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.round(seconds % 60);
  
  if (h > 0) return `${h}h ${m}m`;
  return s > 0 ? `${m}m ${s}s` : `${m}m`;
};

export default function ContinueLearning() {
  const { user, profile } = useUser();
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const resultsQuery = useMemo(() => {
    if (!db || !user || !mounted) return null;
    return query(collection(db, "results"), where("userId", "==", user.uid), limit(20));
  }, [db, user, mounted]);

  const examsQuery = useMemo(() => {
    if (!db || !mounted) return null;
    return collection(db, "exams");
  }, [db, mounted]);

  const mocksQuery = useMemo(() => (db && mounted ? collection(db, "mocks") : null), [db, mounted]);
  const quizQuery = useMemo(() => (db && mounted ? collection(db, "daily_quizzes") : null), [db, mounted]);
  const boardsQuery = useMemo(() => (db ? collection(db, "boards") : null), [db]);

  const { data: rawResults, loading: resultsLoading } = useCollection<any>(resultsQuery);
  const { data: allExams, loading: examsLoading } = useCollection<any>(examsQuery);
  const { data: validMocks, loading: mocksLoading } = useCollection<any>(mocksQuery);
  const { data: validQuizzes, loading: quizLoading } = useCollection<any>(quizQuery);
  const { data: boards } = useCollection<any>(boardsQuery);

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

  const pinnedExams = useMemo(() => {
    if (!allExams || !profile?.pinnedExams) return [];
    return (allExams as any[]).filter((e: any) => profile.pinnedExams?.includes(e.id)).slice(0, 3);
  }, [allExams, profile]);

  const handleReviewAction = (mockId: string) => {
     const isValid = combinedMocks?.some(m => m.id === mockId);
     if (!isValid) {
        toast({ variant: "destructive", title: "Record Audit", description: "Node archived silently." });
        return;
     }
     router.push(`/results/view?id=${mockId}`);
  };

  if (!mounted || !user) return null;

  const hasData = (recentAttempts && recentAttempts.length > 0) || (pinnedExams && pinnedExams.length > 0);
  if (!hasData && !resultsLoading && !examsLoading) return null;

  return (
    <section className="py-8 md:py-16 bg-white">
      <div className="max-w-7xl auto px-4 sm:px-6 lg:px-8 space-y-8 md:space-y-12 text-left">
        <div className="flex items-center justify-between px-1">
           <div className="flex items-center gap-3">
              <div className="h-8 w-8 md:h-10 md:w-10 rounded-full bg-blue-50 flex items-center justify-center text-primary shadow-sm shrink-0">
                 <Target className="h-4 w-4 md:h-5 md:w-5" />
              </div>
              <h2 className="text-xl md:text-4xl font-black text-[#0F172A] tracking-tight leading-none">My Progress</h2>
           </div>
           <Button asChild variant="ghost" className="text-primary font-black text-[9px] md:text-xs tracking-widest gap-2">
              <Link href="/my-exams">View All <ChevronRight className="h-4 w-4" /></Link>
           </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
           <div className="lg:col-span-7 space-y-6">
              <div className="flex items-center gap-2 px-1">
                 <Zap className="h-3.5 w-3.5 text-primary" />
                 <p className="text-[10px] md:text-xs font-black tracking-widest text-slate-400">Continue Learning</p>
              </div>
              <div className="grid grid-cols-1 gap-4 md:gap-6">
                 {resultsLoading || mocksLoading || quizLoading ? (
                    Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-40 w-full rounded-[2.5rem] bg-slate-50" />)
                 ) : recentAttempts.length > 0 ? (
                    recentAttempts.map((res: any, idx: number) => {
                       const mockMeta = combinedMocks?.find((m: any) => m.id === res.mockId);
                       return (
                        <motion.div
                          key={res.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.4, delay: idx * 0.1 }}
                        >
                          <Card className="border-none bg-gradient-to-br from-[#0F172A] via-[#111827] to-[#1E293B] p-6 md:p-8 rounded-[28px] shadow-[0_20px_50px_rgba(0,0,0,0.28)] hover:shadow-[0_30px_60px_rgba(0,0,0,0.35)] transition-all duration-300 group relative overflow-hidden text-left hover:-translate-y-1.5 hover:scale-[1.01]">
                            {/* Decorative Background Elements */}
                            <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none group-hover:scale-110 transition-transform duration-1000">
                                <Trophy className="h-24 w-24 text-white" />
                            </div>
                            <div className="absolute -top-10 -left-10 w-40 h-40 bg-primary/10 rounded-full blur-[80px] pointer-events-none" />
                            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-blue-500/10 rounded-full blur-[80px] pointer-events-none" />

                            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-6 md:gap-8">
                                {/* Left Icon Node - Now Dynamic Board Logo */}
                                <div className="relative shrink-0">
                                    <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
                                    <AuthorityLogo 
                                      boardId={mockMeta?.boardId || "GENERAL"} 
                                      size="md" 
                                      className="h-16 w-16 md:h-[72px] md:w-[72px] relative transition-transform duration-500 group-hover:scale-105" 
                                    />
                                </div>

                                <div className="flex-1 space-y-4 md:space-y-5 min-w-0">
                                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
                                       <h3 className="text-xl md:text-2xl font-bold text-white tracking-tight leading-tight line-clamp-2 pr-12">
                                          {res.mockTitle}
                                       </h3>
                                       {/* Score Pill */}
                                       <div className="absolute top-0 right-0 md:static flex shrink-0">
                                          <Badge className="bg-primary/15 text-[#60A5FA] border-none px-4 py-1.5 rounded-full font-black text-[10px] md:text-xs shadow-sm">
                                             ⭐ Score: {res.score}
                                          </Badge>
                                       </div>
                                    </div>

                                    {/* Info Chips */}
                                    <div className="flex flex-wrap gap-2 md:gap-3">
                                       <InfoChip icon={<BookOpen className="h-3 w-3" />} label={`${res.totalQuestions} Questions`} />
                                       <InfoChip icon={<Clock className="h-3 w-3" />} label={`${mockMeta?.duration || 120}m Duration`} />
                                       <InfoChip icon={<Award className="h-3 w-3" />} label={`${res.totalQuestions} Marks`} />
                                    </div>

                                    {/* Action Hub */}
                                    <div className="pt-4 md:pt-6">
                                       <Button 
                                         onClick={() => handleReviewAction(res.mockId)} 
                                         className="h-12 px-7 md:px-8 bg-gradient-to-r from-[#2563EB] to-[#3B82F6] hover:brightness-110 text-white font-black text-[11px] md:text-xs tracking-widest rounded-full shadow-[0_10px_24px_rgba(37,99,235,0.30)] transition-all hover:scale-[1.04] active:scale-[0.98] border-none flex items-center gap-2 group/btn"
                                       >
                                         Review Test
                                         <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover/btn:translate-x-1" />
                                       </Button>
                                    </div>
                                </div>
                            </div>
                          </Card>
                        </motion.div>
                       )
                    })
                 ) : (
                    <div className="p-12 text-center bg-slate-50 rounded-[2.5rem] border border-dashed border-slate-200">
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No tests taken yet</p>
                    </div>
                 )}
              </div>
           </div>

           <div className="lg:col-span-5 space-y-6">
              <div className="flex items-center gap-2 px-1">
                 <Star className="h-3.5 w-3.5 text-amber-500 fill-current" />
                 <p className="text-[10px] md:text-xs font-black tracking-widest text-slate-400">Pinned Exams</p>
              </div>
              <div className="grid grid-cols-1 gap-4">
                 {examsLoading ? (
                    Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-20 w-full rounded-2xl bg-slate-50" />)
                 ) : pinnedExams.length > 0 ? (
                    pinnedExams.map((exam: any) => {
                       const board = boards?.find((b: any) => b.id === exam.boardId || b.abbreviation === exam.boardId);
                       
                       return (
                          <Link key={exam.id} href={`/exams/view?id=${exam.id}`}>
                             <div className="flex items-center justify-between p-4 bg-white rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl hover:translate-x-1 transition-all group">
                                <div className="flex items-center gap-4 min-w-0">
                                   <div className="shrink-0 group-hover:scale-105 transition-transform">
                                      <AuthorityLogo board={board} boardId={exam.boardId} size="sm" className="h-11 w-11 rounded-xl bg-slate-50" />
                                   </div>
                                   <div className="min-w-0">
                                      <h4 className="text-sm font-bold text-[#0F172A] truncate">{exam.name}</h4>
                                      <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-0.5">{board?.abbreviation || 'Official'} Hub</p>
                                   </div>
                                </div>
                                <ChevronRight className="h-4 w-4 text-slate-200 group-hover:text-primary transition-all" />
                             </div>
                          </Link>
                       )
                    })
                 ) : (
                    <div className="p-8 text-center bg-slate-50 rounded-[2.5rem] border border-dashed border-slate-200">
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Save an exam to see it here</p>
                    </div>
                 )}
              </div>
           </div>
        </div>
      </div>
    </section>
  );
}

function InfoChip({ icon, label }: { icon: React.ReactNode, label: string }) {
   return (
      <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/5 backdrop-blur-md border border-white/10 rounded-xl">
         <span className="text-primary">{icon}</span>
         <span className="text-[9px] md:text-[10px] font-bold text-slate-300 uppercase tracking-tight">{label}</span>
      </div>
   )
}
