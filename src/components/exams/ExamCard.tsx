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
 * @fileOverview Premium Enterprise Exam Dashboard Card v12.2.
 * RESTORED: Removed 'truncate' from sub-labels to fix UI clipping.
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
      whileHover={{ y: -8 }} 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="h-full w-full"
    >
      <Link href={`/exams/view?id=${exam.id}`} className="block h-full">
        <Card className="h-full bg-white border border-slate-100 shadow-xl hover:shadow-[0_30px_70px_rgba(0,0,0,0.1)] transition-all duration-500 rounded-[2.5rem] md:rounded-[3.5rem] overflow-hidden flex flex-col group relative border-none">
          
          <div className="p-6 md:p-8 flex justify-between items-center w-full relative z-10">
            <div className="flex items-center gap-2">
               <Badge className="bg-primary/10 text-primary border-none text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-lg">
                 Official Hub
               </Badge>
               {exam.isTrending && (
                  <Badge className="bg-emerald-50 text-emerald-600 border-none text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-lg flex items-center gap-1.5 shadow-sm">
                    <ShieldCheck className="h-3 w-3" /> Verified
                  </Badge>
               )}
            </div>
            
            <button 
              onClick={handleTogglePin}
              disabled={isPinning}
              className={cn(
                "h-10 w-10 rounded-xl border flex items-center justify-center transition-all active:scale-90 shadow-sm",
                isPinned ? "bg-primary border-primary text-white" : "bg-white border-slate-100 text-slate-300 hover:text-primary"
              )}
            >
              {isPinning ? <Loader2 className="h-4 w-4 animate-spin" /> : <Bookmark className={cn("h-4 w-4", isPinned && "fill-current")} />}
            </button>
          </div>

          <CardContent className="px-6 md:px-12 pb-10 flex-1 flex flex-col text-center">
            
            <div className="mb-8 flex justify-center">
               <AuthorityLogo 
                  boardId={exam.boardId} 
                  size="md" 
                  className="bg-white border-4 border-slate-50 shadow-2xl rounded-3xl" 
               />
            </div>

            <div className="space-y-3 mb-8">
               <h3 className="text-xl md:text-3xl font-black text-[#0F172A] leading-tight group-hover:text-primary transition-colors tracking-tight line-clamp-2 min-h-[2.2em] uppercase">
                 {exam.name}
               </h3>
               <p className="text-slate-400 font-medium text-[13px] md:text-[15px] line-clamp-3 leading-relaxed">
                  {exam.description || "Master the official Punjab recruitment patterns with verified institutional practice nodes."}
               </p>
            </div>

            <div className="grid grid-cols-2 gap-x-6 gap-y-4 pt-8 border-t border-slate-50 text-left">
               {stats.mocks > 0 && <StatRow label="Full Mocks" val={stats.mocks} icon={Zap} />}
               {stats.subjects > 0 && <StatRow label="Subjects" val={stats.subjects} icon={BookOpen} />}
               {stats.pyqs > 0 && <StatRow label="Archives" val={stats.pyqs} icon={FileStack} />}
               {stats.questions > 0 && <StatRow label="MCQ Node" val={stats.questions} icon={Layers} />}
               {user && stats.completed > 0 && <StatRow label="Solved" val={stats.completed} icon={CheckCircle2} color="text-emerald-600" />}
            </div>

            {user && stats.totalTests > 0 && (
               <div className="space-y-3 mt-10 text-left">
                  <div className="flex justify-between items-center text-[9px] font-black uppercase text-slate-400 tracking-widest">
                     <span className="flex items-center gap-2"><Target className="h-3.5 w-3.5 text-primary" /> Mastery Index</span>
                     <span className="text-primary tabular-nums">{stats.progress}%</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden shadow-inner">
                     <motion.div 
                       initial={{ width: 0 }}
                       animate={{ width: `${stats.progress}%` }}
                       transition={{ duration: 1.5, ease: "easeOut" }}
                       className="h-full bg-gradient-to-r from-primary to-blue-400 shadow-xl" 
                     />
                  </div>
               </div>
            )}

            <div className="mt-10 pt-4">
               <Button className={cn(
                  "w-full h-[64px] rounded-2xl text-white font-black uppercase text-[10px] md:text-[12px] tracking-widest transition-all active:scale-95 border-none shadow-2xl flex items-center justify-between px-8",
                  buttonConfig.variant
               )}>
                  <div className="flex items-center gap-3">
                     <buttonConfig.icon className={cn("h-5 w-5", buttonConfig.icon === RefreshCw && "animate-spin")} />
                     <span>{buttonConfig.label}</span>
                  </div>
                  <ArrowRight className="h-5 w-5 opacity-40 group-hover:translate-x-1 transition-transform" />
               </Button>
            </div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
}

function StatRow({ label, val, icon: Icon, color }: any) {
  return (
    <div className="flex items-center justify-between gap-2 min-w-0">
       <div className="flex items-center gap-2 min-w-0">
          <Icon className="h-4 w-4 text-slate-300 shrink-0" />
          <span className="text-[11px] font-bold text-slate-400 truncate tracking-tight">{label}</span>
       </div>
       <span className={cn("text-[11px] font-black tabular-nums tracking-tighter leading-none", color || "text-[#0F172A]")}>{val}</span>
    </div>
  );
}