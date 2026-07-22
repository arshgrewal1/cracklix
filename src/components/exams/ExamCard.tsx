'use client';

import React, { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { 
  ChevronRight, 
  Zap, 
  Users, 
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
  Play
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
 * @fileOverview Premium Enterprise Exam Dashboard Card v6.1.
 * FIXED: Added safety guards for null/undefined array props to prevent filter crashes.
 * UI: High-fidelity layout with conditional visibility for all metrics.
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

  const examId = exam.id;
  const isPinned = profile?.pinnedExams?.includes(examId);

  // 1. DYNAMIC CONTENT AUDIT
  const stats = useMemo(() => {
    // Normalization safety check
    const safeMocks = Array.isArray(allMocks) ? allMocks : [];
    const safePyqs = Array.isArray(allPyqs) ? allPyqs : [];
    const safeNotes = Array.isArray(allNotes) ? allNotes : [];
    const safeResults = Array.isArray(userResults) ? userResults : [];

    const relatedMocks = safeMocks.filter(m => m.examId === examId || m.examIds?.includes(examId));
    const relatedPyqs = safePyqs.filter(p => p.examId === examId);
    const relatedNotes = safeNotes.filter(n => n.examId === examId);

    const counts = {
      mocks: relatedMocks.filter(m => m.mockType === 'FULL').length,
      subjects: relatedMocks.filter(m => m.mockType === 'SUBJECT').length,
      sectionals: relatedMocks.filter(m => m.mockType === 'SECTIONAL').length,
      pyqs: relatedPyqs.length,
      notes: relatedNotes.length,
      questions: relatedMocks.reduce((acc, m) => acc + (Number(m.totalQuestions) || 0), 0),
      totalTests: relatedMocks.length
    };

    // Attempt Analysis
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
      hasContent: counts.totalTests > 0 || counts.pyqs > 0 || counts.notes > 0
    };
  }, [examId, allMocks, userResults, allPyqs, allNotes]);

  const handleTogglePin = async (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    if (!db || !user || isPinning) return;
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

  // Determine State-Aware Button
  const buttonConfig = useMemo(() => {
    if (stats.completed > 0 && stats.progress === 100) return { label: "View Analysis", icon: BarChart3, variant: "bg-emerald-600 hover:bg-emerald-700" };
    if (stats.completed > 0) return { label: "Continue Prep", icon: RefreshCw, variant: "bg-primary hover:bg-blue-700" };
    return { label: "Start Preparation", icon: Play, variant: "bg-[#0F172A] hover:bg-black" };
  }, [stats]);

  return (
    <motion.div 
      whileHover={{ y: -8 }} 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="h-full"
    >
      <Link href={`/exams/view?id=${exam.id}`} className="block h-full">
        <Card className="bg-white border border-slate-100 shadow-xl hover:shadow-5xl transition-all duration-500 rounded-[2.5rem] md:rounded-[3rem] overflow-hidden group flex flex-col h-full relative">
          
          {/* HEADER HUB */}
          <div className="p-6 md:p-10 pb-4 flex justify-between items-start w-full relative z-10">
            <div className="flex items-center gap-4 md:gap-6">
               <AuthorityLogo boardId={exam.boardId} size="md" className="shadow-2xl border-4 border-white bg-slate-50 shrink-0" />
               <div className="text-left space-y-1">
                  <Badge className="bg-primary/10 text-primary border-none text-[8px] font-black uppercase px-2 py-0.5 rounded shadow-sm w-fit">
                    {exam.boardId} Registry
                  </Badge>
                  <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest leading-none">Official Prep</p>
               </div>
            </div>
            
            <div className="flex items-center gap-2">
               {exam.isTrending && (
                  <div className="h-8 w-8 rounded-full bg-amber-50 flex items-center justify-center text-amber-500 shadow-sm border border-amber-100/50">
                    <Star className="h-4 w-4 fill-current" />
                  </div>
               )}
               <button 
                  onClick={handleTogglePin}
                  disabled={isPinning}
                  className={cn(
                    "h-10 w-10 md:h-12 md:w-12 rounded-xl border flex items-center justify-center transition-all active:scale-90 shadow-sm",
                    isPinned ? "bg-primary border-primary text-white" : "bg-white border-slate-100 text-slate-300 hover:text-primary"
                  )}
               >
                  {isPinning ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Bookmark className={cn("h-4 w-4 md:h-5 md:w-5", isPinned && "fill-current")} />}
               </button>
            </div>
          </div>

          {/* MAIN IDENTITY */}
          <CardContent className="px-6 md:px-10 pb-6 flex-1 flex flex-col text-left space-y-6 md:space-y-8">
            <div className="space-y-2">
               <h3 className="text-xl md:text-3xl font-[800] text-[#0F172A] leading-[1.1] tracking-tight group-hover:text-primary transition-colors line-clamp-2 break-words">
                 {exam.name}
               </h3>
               <p className="text-slate-400 font-medium text-xs md:text-sm line-clamp-1">
                  {exam.description || "Punjab Government Recruitment Preparation"}
               </p>
            </div>

            {/* DYNAMIC STATS GRID */}
            <div className="grid grid-cols-2 gap-x-6 gap-y-4 pt-6 border-t border-slate-50">
               {stats.mocks > 0 && <StatRow label="Mock Tests" val={stats.mocks} icon={Zap} />}
               {stats.subjects > 0 && <StatRow label="Subject Tests" val={stats.subjects} icon={BookOpen} />}
               {stats.pyqs > 0 && <StatRow label="PYQ Archives" val={stats.pyqs} icon={FileStack} />}
               {stats.sectionals > 0 && <StatRow label="Sectionals" val={stats.sectionals} icon={Layers} />}
               {stats.questions > 0 && <StatRow label="Questions" val={stats.questions} icon={Target} color="text-primary" />}
            </div>

            {/* PROGRESS HUB (If User Logged In) */}
            {user && stats.totalTests > 0 && (
               <div className="space-y-4 pt-6 border-t border-slate-50">
                  <div className="flex justify-between items-center text-[9px] font-black uppercase text-slate-400 tracking-widest">
                     <span className="flex items-center gap-2"><CheckCircle2 className="h-3 w-3 text-emerald-500" /> Mastery {stats.progress}%</span>
                     <span className="text-primary tabular-nums">{stats.completed}/{stats.totalTests} Solved</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-50 rounded-full overflow-hidden shadow-inner border border-slate-100">
                     <motion.div 
                       initial={{ width: 0 }}
                       animate={{ width: `${stats.progress}%` }}
                       transition={{ duration: 1.5, ease: "easeOut" }}
                       className="h-full bg-primary shadow-lg shadow-primary/20" 
                     />
                  </div>
               </div>
            )}

            {/* ACTION TRIGGER */}
            <div className="pt-4 mt-auto">
               <Button className={cn(
                  "w-full h-14 md:h-16 rounded-[18px] md:rounded-[22px] text-white font-bold text-sm tracking-tight transition-all active:scale-95 border-none shadow-3xl flex items-center justify-between px-8",
                  buttonConfig.variant
               )}>
                  <div className="flex items-center gap-3">
                     <buttonConfig.icon className={cn("h-4 w-4", buttonConfig.icon === RefreshCw && "animate-spin-slow")} />
                     <span>{buttonConfig.label}</span>
                  </div>
                  <ArrowRight className="h-4 w-4 opacity-40 group-hover:translate-x-2 transition-transform" />
               </Button>
            </div>
          </CardContent>

          {/* DYNAMIC BOTTOM CHIPS STRIP */}
          <div className="px-6 md:px-10 py-4 bg-slate-50/50 border-t border-slate-50 flex items-center gap-2 overflow-x-auto no-scrollbar">
             {stats.mocks > 0 && <ContentChip label="Mocks" />}
             {stats.subjects > 0 && <ContentChip label="Topic Tests" />}
             {stats.pyqs > 0 && <ContentChip label="Old Papers" />}
             {stats.notes > 0 && <ContentChip label="PDF Notes" />}
          </div>
        </Card>
      </Link>
    </motion.div>
  );
}

function StatRow({ label, val, icon: Icon, color }: any) {
  return (
    <div className="flex items-center justify-between gap-3 group/stat">
       <div className="flex items-center gap-2 min-w-0">
          <Icon className="h-3.5 w-3.5 text-slate-300 shrink-0" />
          <span className="text-[10px] font-bold text-slate-400 truncate uppercase tracking-tight">{label}</span>
       </div>
       <span className={cn("text-xs md:text-sm font-black tabular-nums tracking-tight", color || "text-[#0F172A]")}>{val}</span>
    </div>
  );
}

function ContentChip({ label }: { label: string }) {
  return (
    <span className="text-[8px] font-black uppercase tracking-widest text-slate-400 bg-white border border-slate-100 px-2.5 py-1 rounded-md shrink-0 shadow-sm">
       {label}
    </span>
  );
}

function ContentStat({ label, val, icon: Icon }: any) {
   return (
      <div className="flex flex-col items-start gap-1">
         <div className="flex items-center gap-1.5 text-slate-400">
            <Icon className="h-3.5 w-3.5" />
            <span className="text-[8px] font-bold uppercase tracking-widest">{label}</span>
         </div>
         <p className="text-sm font-black text-[#0F172A] tabular-nums">{val}</p>
      </div>
   )
}
