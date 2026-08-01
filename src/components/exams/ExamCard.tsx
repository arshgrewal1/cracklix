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
 * @fileOverview Compact Institutional Exam Card v13.0.
 * COMPACT: Reduced padding, radii, and font sizes for high-density layout.
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
    if (stats.completed > 0 && stats.progress === 100) return { label: "Analysis", icon: BarChart3, variant: "bg-emerald-600 hover:bg-emerald-700" };
    if (stats.completed > 0) return { label: "Continue", icon: RefreshCw, variant: "bg-primary hover:bg-blue-700" };
    return { label: "Start Prep", icon: Play, variant: "bg-[#0F172A] hover:bg-black" };
  }, [stats]);

  if (!exam) return null;

  return (
    <motion.div 
      whileHover={{ y: -4 }} 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="h-full w-full break-words"
    >
      <Link href={`/exams/view?id=${exam.id}`} className="block h-full">
        <Card className="h-full bg-card border border-border shadow-md hover:shadow-2xl transition-all duration-500 rounded-2xl overflow-hidden flex flex-col group relative">
          
          <div className="p-4 md:p-6 flex justify-between items-center w-full relative z-10">
            <div className="flex items-center gap-1.5">
               <Badge className="bg-primary/10 text-primary border-none text-[8px] font-black px-2 py-0.5 rounded uppercase">
                 Official
               </Badge>
               {exam.isTrending && (
                  <Badge className="bg-emerald-50 text-emerald-600 border-none text-[8px] font-black px-2 py-0.5 rounded flex items-center gap-1 uppercase">
                    <ShieldCheck className="h-2.5 w-2.5" /> Verified
                  </Badge>
               )}
            </div>
            
            <button 
              onClick={handleTogglePin}
              disabled={isPinning}
              className={cn(
                "h-8 w-8 rounded-lg border flex items-center justify-center transition-all active:scale-90 shadow-sm",
                isPinned ? "bg-primary border-primary text-white" : "bg-card border-border text-muted-foreground hover:text-primary"
              )}
            >
              {isPinning ? <Loader2 className="h-3 w-3 animate-spin" /> : <Bookmark className={cn("h-3.5 w-3.5", isPinned && "fill-current")} />}
            </button>
          </div>

          <CardContent className="px-5 md:px-8 pb-6 flex-1 flex flex-col text-center">
            
            <div className="mb-4 flex justify-center">
               <AuthorityLogo 
                  boardId={exam.boardId} 
                  size="sm" 
                  className="bg-card border-2 border-border shadow-lg rounded-xl h-12 w-12 md:h-14 md:w-14" 
               />
            </div>

            <div className="space-y-2 mb-6">
               <h3 className="text-base md:text-xl font-black text-foreground leading-tight group-hover:text-primary transition-colors tracking-tight line-clamp-2 min-h-[2.4em] uppercase">
                 {exam.name}
               </h3>
               <p className="text-muted-foreground font-medium text-[11px] md:text-xs line-clamp-2 leading-relaxed opacity-70">
                  {exam.description || "Master the latest official recruitment patterns."}
               </p>
            </div>

            <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 pt-5 border-t border-border text-left">
               {stats.mocks > 0 && <StatRow label="Mocks" val={stats.mocks} icon={Zap} />}
               {stats.pyqs > 0 && <StatRow label="PYQs" val={stats.pyqs} icon={FileStack} />}
               {stats.questions > 0 && <StatRow label="MCQs" val={stats.questions} icon={Layers} />}
               {stats.completed > 0 && <StatRow label="Solved" val={stats.completed} icon={CheckCircle2} color="text-emerald-600" />}
            </div>

            {user && stats.totalTests > 0 && (
               <div className="space-y-2 mt-6 text-left">
                  <div className="flex justify-between items-center text-[7px] font-black uppercase text-slate-400">
                     <span>Mastery Index</span>
                     <span className="text-primary tabular-nums">{stats.progress}%</span>
                  </div>
                  <div className="h-1 w-full bg-muted rounded-full overflow-hidden shadow-inner">
                     <motion.div 
                       initial={{ width: 0 }}
                       animate={{ width: `${stats.progress}%` }}
                       className="h-full bg-primary" 
                     />
                  </div>
               </div>
            )}

            <div className="mt-6 pt-2">
               <Button className={cn(
                  "w-full h-10 md:h-12 rounded-xl text-white font-black text-[9px] md:text-[10px] uppercase tracking-widest transition-all active:scale-95 border-none shadow-lg flex items-center justify-center gap-2",
                  buttonConfig.variant
               )}>
                  <buttonConfig.icon className={cn("h-3.5 w-3.5", buttonConfig.icon === RefreshCw && "animate-spin")} />
                  <span>{buttonConfig.label}</span>
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
    <div className="flex items-center justify-between gap-1.5 min-w-0">
       <div className="flex items-center gap-1.5 min-w-0">
          <Icon className="h-3 w-3 text-muted-foreground opacity-30 shrink-0" />
          <span className="text-[9px] font-bold text-muted-foreground truncate tracking-tight uppercase">{label}</span>
       </div>
       <span className={cn("text-[10px] font-black tabular-nums tracking-tighter leading-none", color || "text-foreground")}>{val}</span>
    </div>
  );
}
