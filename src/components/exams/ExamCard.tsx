
'use client';

import React, { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { 
  ChevronRight, 
  Zap, 
  Star, 
  ArrowRight, 
  ShieldCheck, 
  Bookmark, 
  CheckCircle2, 
  Lock, 
  FileStack, 
  BookOpen, 
  Layers, 
  Timer,
  BarChart3,
  RefreshCw,
  Target,
  Play,
  Loader2
} from "lucide-react";
import { AuthorityLogo } from "@/lib/exam-icons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Exam, MockTest, UserProfile } from "@/types";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { doc, updateDoc, arrayUnion, arrayRemove, serverTimestamp } from "firebase/firestore";
import { useFirestore, useUser } from "@/firebase";
import { useToast } from "@/hooks/use-toast";

interface ExamCardProps {
  exam: Exam;
  allMocks?: any[];
  userResults?: any[];
  allPyqs?: any[];
  allNotes?: any[];
}

/**
 * @fileOverview Premium Enterprise Exam Dashboard Card v10.2.
 * UPDATED: Removed all uppercase transforms from titles and labels.
 */
export default function ExamCard({ 
  exam, 
  allMocks = [], 
  userResults = [], 
  allPyqs = [], 
  allNotes = [] 
}: ExamCardProps) {
  const db = useFirestore();
  const { user, profile } = useUser();
  const { toast } = useToast();
  const [isPinning, setIsPinning] = useState(false);

  const examId = exam?.id;
  const isPinned = profile?.pinnedExams?.includes(examId);

  const stats = useMemo(() => {
    const safeMocks = Array.isArray(allMocks) ? allMocks : [];
    const safePyqs = Array.isArray(allPyqs) ? allPyqs : [];
    const safeResults = Array.isArray(userResults) ? userResults : [];

    if (!examId) return { mocks: 0, subjects: 0, sectionals: 0, pyqs: 0, notes: 0, questions: 0, totalTests: 0, completed: 0, progress: 0, avgAcc: 0, hasContent: false };

    const relatedMocks = safeMocks.filter(m => m.examId === examId || (m.examIds && m.examIds.includes(examId)));
    const relatedPyqs = safePyqs.filter(p => p.examId === examId);

    const counts = {
      mocks: relatedMocks.filter(m => m.mockType === 'FULL').length,
      subjects: relatedMocks.filter(m => m.mockType === 'SUBJECT').length,
      sectionals: relatedMocks.filter(m => m.mockType === 'SECTIONAL').length,
      pyqs: relatedPyqs.length,
      questions: relatedMocks.reduce((acc, m) => acc + (Number(m.totalQuestions) || 0), 0),
      totalTests: relatedMocks.length
    };

    const attemptIds = new Set(safeResults.filter(r => relatedMocks.some(rm => rm.id === r.mockId)).map(r => r.mockId));
    const completed = attemptIds.size;
    
    let avgAcc = 0;
    const relatedResults = safeResults.filter(r => relatedMocks.some(rm => rm.id === r.mockId));
    if (relatedResults.length > 0) {
      avgAcc = Math.round(relatedResults.reduce((acc, r) => acc + (r.accuracy || 0), 0) / relatedResults.length);
    }

    return {
      ...counts,
      completed,
      remaining: Math.max(0, counts.totalTests - completed),
      progress: counts.totalTests > 0 ? Math.round((completed / counts.totalTests) * 100) : 0,
      avgAcc,
      hasContent: counts.totalTests > 0 || counts.pyqs > 0
    };
  }, [examId, allMocks, userResults, allPyqs]);

  const handleTogglePin = async (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    if (!db || !user || isPinning || !examId) return;
    setIsPinning(true);
    const userRef = doc(db, "users", user.uid);
    try {
      if (isPinned) {
        await updateDoc(userRef, { pinnedExams: arrayRemove(examId), updatedAt: serverTimestamp() });
        toast({ title: "Removed from dashboard" });
      } else {
        await updateDoc(userRef, { pinnedExams: arrayUnion(examId), updatedAt: serverTimestamp() });
        toast({ title: "Added to dashboard" });
      }
    } finally { setIsPinning(false); }
  };

  const buttonConfig = useMemo(() => {
    if (stats.completed > 0 && stats.progress === 100) return { label: "View Analysis", icon: BarChart3, variant: "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200" };
    if (stats.completed > 0) return { label: "Continue Prep", icon: RefreshCw, variant: "bg-primary hover:bg-blue-700 shadow-blue-200" };
    return { label: "Start Preparation", icon: Play, variant: "bg-[#0F172A] hover:bg-black shadow-slate-200" };
  }, [stats]);

  if (!exam) return null;

  return (
    <motion.div 
      whileHover={{ y: -6 }} 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="h-full w-full"
    >
      <Link href={`/exams/view?id=${exam.id}`} className="block h-full">
        <Card className="h-full min-h-[540px] bg-white border border-slate-100 shadow-xl hover:shadow-5xl transition-all duration-500 rounded-[2.5rem] md:rounded-[3rem] overflow-hidden flex flex-col group relative">
          
          <div className="p-4 md:p-6 lg:p-7 flex justify-between items-center w-full relative z-10">
            <div className="flex items-center gap-2">
               <Badge className="bg-primary/10 text-primary border-none text-[9px] md:text-[10px] font-bold px-2.5 py-1 rounded-lg">
                 Official Prep
               </Badge>
               {exam.isTrending && (
                  <Badge className="bg-emerald-50 text-emerald-600 border-none text-[9px] md:text-[10px] font-bold px-2.5 py-1 rounded-lg flex items-center gap-1">
                    <ShieldCheck className="h-2.5 w-2.5" /> Verified
                  </Badge>
               )}
            </div>
            
            <button 
              onClick={handleTogglePin}
              disabled={isPinning}
              className={cn(
                "h-9 w-9 md:h-10 md:w-10 rounded-xl border flex items-center justify-center transition-all active:scale-90 shadow-sm",
                isPinned ? "bg-primary border-primary text-white" : "bg-white border-slate-100 text-slate-300 hover:text-primary"
              )}
            >
              {isPinning ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Bookmark className={cn("h-3.5 w-3.5", isPinned && "fill-current")} />}
            </button>
          </div>

          <CardContent className="px-5 md:px-8 pb-8 flex-1 flex flex-col text-center">
            
            <div className="mb-6 lg:mb-8 flex justify-center">
               <div className="w-[64px] h-[64px] lg:w-[80px] lg:h-[80px] rounded-2xl md:rounded-3xl shadow-2xl bg-white border-2 border-slate-50 flex items-center justify-center overflow-hidden shrink-0">
                  <AuthorityLogo boardId={exam.boardId} size="md" className="p-0 border-none shadow-none bg-transparent" />
               </div>
            </div>

            <div className="space-y-2 mb-6">
               <h3 className="text-[22px] md:text-[24px] lg:text-[28px] font-[800] text-[#0F172A] leading-tight group-hover:text-primary transition-colors tracking-tighter line-clamp-2 min-h-[2.3em] overflow-hidden text-center">
                 {exam.name}
               </h3>
               <p className="text-slate-400 font-medium text-[13px] md:text-[14px] lg:text-[15px] line-clamp-2 leading-snug overflow-hidden text-center">
                  {exam.description || "Official recruitment preparation with verified patterns."}
               </p>
            </div>

            <div className="grid grid-cols-2 gap-x-4 gap-y-3.5 pt-6 border-t border-slate-50 text-left">
               {stats.mocks > 0 && <StatRow label="Mocks" val={stats.mocks} icon={Zap} />}
               {stats.subjects > 0 && <StatRow label="Subjects" val={stats.subjects} icon={BookOpen} />}
               {stats.pyqs > 0 && <StatRow label="PYQs" val={stats.pyqs} icon={FileStack} />}
               {stats.questions > 0 && <StatRow label="Questions" val={stats.questions} icon={Layers} />}
               {user && stats.completed > 0 && <StatRow label="Solved" val={stats.completed} icon={CheckCircle2} color="text-emerald-600" />}
            </div>

            {user && stats.totalTests > 0 && (
               <div className="space-y-2.5 mt-8 text-left">
                  <div className="flex justify-between items-center text-[10px] font-black uppercase text-slate-400 tracking-widest">
                     <span className="flex items-center gap-1.5"><Target className="h-3 w-3 text-primary" /> Mastery</span>
                     <span className="text-primary tabular-nums">{stats.progress}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-50 rounded-full overflow-hidden shadow-inner border border-slate-100">
                     <motion.div 
                       initial={{ width: 0 }}
                       animate={{ width: `${stats.progress}%` }}
                       transition={{ duration: 1.5, ease: "easeOut" }}
                       className="h-full bg-gradient-to-r from-primary to-blue-400 shadow-xl" 
                     />
                  </div>
               </div>
            )}

            <div className="mt-auto pt-8">
               <Button className={cn(
                  "w-full h-[52px] rounded-xl text-white font-[800] tracking-tight text-[11px] md:text-[12px] transition-all active:scale-95 border-none shadow-xl flex items-center justify-between px-6",
                  buttonConfig.variant
               )}>
                  <div className="flex items-center gap-2.5">
                     <buttonConfig.icon className={cn("h-4 w-4", buttonConfig.icon === RefreshCw && "animate-spin")} />
                     <span>{buttonConfig.label}</span>
                  </div>
                  <ArrowRight className="h-4 w-4 opacity-40 group-hover:translate-x-1 transition-transform" />
               </Button>
            </div>
          </CardContent>

          <div className="px-5 py-3.5 bg-slate-50/50 border-t border-slate-50 flex items-center gap-2 overflow-x-auto no-scrollbar">
             {stats.mocks > 0 && <ContentChip label="Mocks" />}
             {stats.subjects > 0 && <ContentChip label="Subjects" />}
             {stats.pyqs > 0 && <ContentChip label="PYQs" />}
             <ContentChip label="Bilingual" />
          </div>
        </Card>
      </Link>
    </motion.div>
  );
}

function StatRow({ label, val, icon: Icon, color }: any) {
  return (
    <div className="flex items-center justify-between gap-1.5 min-w-0">
       <div className="flex items-center gap-1.5 min-w-0">
          <Icon className="h-3.5 w-3.5 text-slate-400 shrink-0" />
          <span className="text-[11px] lg:text-[12px] font-bold text-slate-500 truncate leading-none">{label}</span>
       </div>
       <span className={cn("text-[12px] lg:text-[14px] font-[900] tabular-nums tracking-tighter leading-none", color || "text-[#0F172A]")}>{val}</span>
    </div>
  );
}

function ContentChip({ label }: { label: string }) {
  return (
    <span className="text-[8px] font-black tracking-widest text-slate-400 bg-white border border-slate-100 px-2.5 py-1 rounded-md shrink-0 shadow-sm">
       {label}
    </span>
  );
}
