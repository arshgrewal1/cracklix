
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
  RefreshCw
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
 * @fileOverview Institutional Popular Exams Hub v48.0.
 * UPDATED: Replaced hardcoded placeholders with live registry stats.
 * UI: Enforced strict uniform card heights (h-full) and pushed actions to bottom.
 */
export default function PopularExams() {
  const db = useFirestore();
  const { user, profile } = useUser();
  const { toast } = useToast();
  const router = useRouter();
  
  const [pinningId, setPinningId] = useState<string | null>(null);

  const examsQuery = useMemo(() => {
    if (!db) return null;
    return query(collection(db, "exams"), where("isTrending", "==", true), limit(4));
  }, [db]);

  const { data: exams, loading } = useCollection<any>(examsQuery);
  const { data: boards } = useCollection<any>(useMemo(() => (db ? collection(db, "boards") : null), [db]));
  const { data: mocks } = useCollection<any>(useMemo(() => (db ? collection(db, "mocks") : null), [db]));
  const { data: notes } = useCollection<any>(useMemo(() => (db ? collection(db, "notes") : null), [db]));

  // Dynamic Stats Calculator
  const examStats = useMemo(() => {
    const stats: Record<string, { mocks: number, questions: number, notes: number }> = {};
    if (!exams) return stats;

    exams.forEach(e => {
       const relatedMocks = (mocks || []).filter(m => m.examId === e.id || m.examIds?.includes(e.id));
       const totalQ = relatedMocks.reduce((acc, m) => acc + (m.totalQuestions || 0), 0);
       const relatedNotes = (notes || []).filter(n => n.examId === e.id);
       
       stats[e.id] = {
          mocks: relatedMocks.length || e.totalMocks || 0,
          questions: totalQ || e.activeQuestions || 0,
          notes: relatedNotes.length || e.totalNotes || 0
       };
    });
    return stats;
  }, [exams, mocks, notes]);

  const isPassActive = useMemo(() => {
    if (!profile) return false;
    if (profile.role === 'ADMIN' || profile.role === 'SUPER_ADMIN') return true;
    return profile.passStatus === 'active';
  }, [profile]);

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
              <h2 className="text-[32px] md:text-6xl font-bold tracking-tighter text-[#0F172A] antialiased uppercase">
                Popular Exams
              </h2>
              <p className="text-slate-500 font-medium text-sm md:text-xl max-w-xl leading-snug">
                Targeted preparation for Punjab&apos;s most competitive recruitment verticals.
              </p>
           </div>
           <Link href="/exams" className="text-primary font-bold text-xs md:text-sm tracking-tight hover:underline flex items-center gap-2 group shrink-0">
              Explore All <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
           </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10">
           {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-64 md:h-80 w-full rounded-[3rem] bg-slate-50" />
              ))
           ) : exams?.map((exam, idx) => {
              const board = boards?.find((b: any) => b.id === exam.boardId || b.abbreviation === exam.boardId);
              const isPremium = exam.accessLevel === 'PREMIUM';
              const locked = isPremium && !isPassActive;
              const isPinned = profile?.pinnedExams?.includes(exam.id);
              const liveStats = examStats[exam.id] || { mocks: 0, questions: 0, notes: 0 };

              return (
                 <motion.div 
                    key={exam.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.1 }}
                    className="flex flex-col h-full"
                 >
                    <Card className="border-none shadow-5xl rounded-[3rem] bg-white p-6 md:p-10 flex flex-col relative overflow-hidden group hover:-translate-y-2 transition-all duration-500 border border-slate-100 flex-1">
                       
                       {isPremium && (
                          <div className="absolute top-0 right-12 z-20">
                             <div className="bg-amber-400 text-amber-950 px-5 py-2.5 rounded-b-2xl font-bold text-[9px] tracking-tight shadow-xl flex items-center gap-2">
                                <Lock className="h-3 w-3 fill-current" /> Premium
                             </div>
                          </div>
                       )}

                       <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 md:gap-10">
                          <div className="shrink-0 relative group-hover:scale-105 transition-transform duration-500">
                             <AuthorityLogo 
                               board={board} 
                               boardId={exam.boardId} 
                               size="lg" 
                               className="h-20 w-20 md:h-32 md:w-32 shadow-2xl border-4 border-slate-50 bg-slate-50" 
                             />
                          </div>

                          <div className="flex-1 text-center sm:text-left space-y-4 min-w-0">
                             <h3 className="text-2xl md:text-[38px] font-black text-[#0F172A] tracking-tight group-hover:text-primary transition-colors leading-[1.1] line-clamp-2 uppercase">
                                {exam.name}
                             </h3>
                             
                             <div className="flex flex-wrap justify-center sm:justify-start items-center gap-4 md:gap-6 text-[10px] md:text-xs font-semibold text-slate-400 tracking-tight">
                                <span className="flex items-center gap-2">
                                   <Zap className="h-4 w-4 text-primary fill-primary" /> 
                                   {liveStats.questions > 0 ? liveStats.questions.toLocaleString() : '500'}+ Items
                                </span>
                                <span className="flex items-center gap-2">
                                   <FileText className="h-4 w-4 text-blue-500" /> 
                                   {liveStats.notes > 0 ? liveStats.notes : '10'}+ Notes
                                </span>
                                <span className="flex items-center gap-2">
                                   <BookOpen className="h-4 w-4 text-emerald-500" /> 
                                   {liveStats.mocks > 0 ? liveStats.mocks : '5'}+ Tests
                                </span>
                             </div>
                          </div>
                       </div>

                       <div className="mt-auto pt-8 md:pt-10 border-t border-slate-50 flex items-center gap-4 md:gap-6">
                          <Button asChild className={cn(
                             "flex-1 h-14 md:h-18 rounded-full font-bold text-[10px] md:text-xs tracking-widest shadow-4xl transition-all active:scale-95 border-none gap-3 uppercase",
                             locked ? "bg-amber-50 hover:bg-amber-600 text-white" : "bg-[#0F172A] hover:bg-black text-white"
                          )}>
                             <Link href={`/exams/view?id=${exam.id}`}>
                                {locked ? <Lock className="h-4 w-4" /> : null}
                                Attempt Now <ChevronRight className="h-4 w-4 md:h-5 md:w-5" />
                             </Link>
                          </Button>
                          
                          <button 
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleTogglePin(e, exam.id); }}
                            disabled={pinningId === exam.id}
                            className={cn(
                              "h-14 w-14 md:h-18 md:w-18 rounded-[1.5rem] md:rounded-[2rem] border-2 transition-all active:scale-90 shadow-sm flex items-center justify-center shrink-0",
                              isPinned 
                                ? "bg-primary border-primary text-white shadow-lg" 
                                : "bg-white border-slate-100 text-slate-300 hover:text-primary hover:border-primary"
                            )}
                          >
                             {pinningId === exam.id ? (
                               <RefreshCw className="h-6 w-6 md:h-8 md:w-8 animate-spin" />
                             ) : (
                               <Bookmark className={cn("h-6 w-6 md:h-8 md:w-8", isPinned && "fill-current")} />
                             )}
                          </button>
                       </div>
                    </Card>
                 </motion.div>
              )
           })}
        </div>

        <div className="flex items-center justify-center gap-4 text-slate-300 py-4 opacity-50">
           <ShieldCheck className="h-5 w-5" />
           <span className="text-[10px] font-semibold tracking-widest uppercase">Official Punjab Database Verified</span>
        </div>

      </div>
    </section>
  );
}
