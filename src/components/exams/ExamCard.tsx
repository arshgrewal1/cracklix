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
 * @fileOverview Compact Institutional Exam Card v14.0.
 * COMPACT: Significant size reduction and added colorful CTA buttons.
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
        toast({ title: "Removed from list" });
      } else {
        await updateDoc(userRef, { pinnedExams: arrayUnion(examId), updatedAt: serverTimestamp() });
        toast({ title: "Added to list" });
      }
    } finally { setIsPinning(false); }
  };

  const buttonConfig = useMemo(() => {
    if (stats.completed > 0 && stats.progress === 100) return { label: "Analysis", icon: BarChart3, variant: "bg-emerald-600 hover:bg-emerald-700" };
    if (stats.completed > 0) return { label: "Resume", icon: RefreshCw, variant: "bg-primary hover:bg-blue-700" };
    return { label: "Start Now", icon: Play, variant: "bg-[#0F172A] hover:bg-black" };
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
        <Card className="h-full bg-card border border-border shadow-sm hover:shadow-xl transition-all duration-500 rounded-xl md:rounded-2xl overflow-hidden flex flex-col group relative border-none min-h-[220px] md:min-h-[300px]">
          
          <div className="p-3 md:p-5 flex justify-between items-center w-full relative z-10">
            <div className="flex items-center gap-1.5">
               <Badge className="bg-primary/10 text-primary border-none text-[7px] md:text-[8px] font-black px-1.5 py-0.5 rounded-md uppercase">
                 Official
               </Badge>
            </div>
            
            <button 
              onClick={handleTogglePin}
              disabled={isPinning}
              className={cn(
                "h-7 w-7 rounded-lg border flex items-center justify-center transition-all active:scale-90 shadow-sm",
                isPinned ? "bg-primary border-primary text-white" : "bg-card border-border text-muted-foreground hover:text-primary"
              )}
            >
              {isPinning ? <Loader2 className="h-3 w-3 animate-spin" /> : <Bookmark className={cn("h-3 w-3", isPinned && "fill-current")} />}
            </button>
          </div>

          <CardContent className="px-3 md:px-6 pb-4 md:pb-6 flex-1 flex flex-col text-left">
            
            <div className="mb-3">
               <AuthorityLogo 
                  boardId={exam.boardId} 
                  size="sm" 
                  className="bg-card border border-border shadow-md rounded-lg h-9 w-9 md:h-11 md:w-11" 
               />
            </div>

            <div className="space-y-1 mb-4 flex-1">
               <h3 className="text-xs md:text-base font-black text-foreground leading-tight group-hover:text-primary transition-colors tracking-tight line-clamp-2 min-h-[2.4em]">
                 {exam.name}
               </h3>
               <p className="text-muted-foreground font-medium text-[10px] md:text-xs line-clamp-2 leading-relaxed opacity-60">
                  {exam.boardId} Authority Registry Node
               </p>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-3 border-t border-border">
               <StatRow label="Mocks" val={stats.mocks} />
               <StatRow label="Solved" val={stats.completed} color="text-emerald-600" />
            </div>

            <div className="mt-4 pt-2">
               <Button className={cn(
                  "w-full h-8 md:h-10 rounded-lg text-white font-black text-[9px] md:text-[10px] uppercase tracking-widest transition-all active:scale-95 border-none shadow-md flex items-center justify-center gap-2",
                  buttonConfig.variant
               )}>
                  <buttonConfig.icon className={cn("h-3 w-3", buttonConfig.icon === RefreshCw && "animate-spin")} />
                  <span>{buttonConfig.label}</span>
               </Button>
            </div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
}

function StatRow({ label, val, color }: any) {
  return (
    <div className="flex items-center justify-between gap-1 min-w-0">
       <span className="text-[7px] md:text-[8px] font-bold text-muted-foreground truncate tracking-tight uppercase">{label}</span>
       <span className={cn("text-[9px] md:text-[10px] font-black tabular-nums tracking-tighter leading-none", color || "text-foreground")}>{val}</span>
    </div>
  );
}
