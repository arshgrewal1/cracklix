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
 * @fileOverview Premium Enterprise Exam Dashboard Card v8.0.
 * FIXED: Equal height enforcement, title clamping, and dynamic stat mapping.
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

    const relatedMocks = safeMocks.filter(m => m.examId === examId || m.examIds?.includes(examId));
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
    const isPremium = profile?.passStatus === 'active';
    // Logic: View Analysis if 100%, Continue if > 0, Start if 0. 
    // This is a simplified check for the series/vertical as a whole.
    if (stats.completed > 0 && stats.progress === 100) return { label: "View Analysis", icon: BarChart3, variant: "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200" };
    if (stats.completed > 0) return { label: "Continue Prep", icon: RefreshCw, variant: "bg-primary hover:bg-blue-700 shadow-blue-200" };
    
    // If premium is required but not active (Example logic)
    // if (exam.isPremium && !isPremium) return { label: "Unlock Series", icon: Lock, variant: "bg-amber-500 hover:bg-amber-600 shadow-amber-200" };
    
    return { label: "Start Preparation", icon: Play, variant: "bg-[#0F172A] hover:bg-black shadow-slate-200" };
  }, [stats, profile]);

  if (!exam) return null;

  return (
    <motion.div 
      whileHover={{ y: -8 }} 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="h-full w-full"
    >
      <Link href={`/exams/view?id=${exam.id}`} className="block h-full">
        <Card className="h-full min-h-[520px] bg-white border border-slate-100 shadow-xl hover:shadow-5xl transition-all duration-500 rounded-[2.5rem] md:rounded-[3rem] overflow-hidden flex flex-col group relative">
          
          {/* HEADER SECTION: PADDING 32/24/20 */}
          <div className="p-5 md:p-6 lg:p-8 flex justify-between items-center w-full relative z-10">
            <div className="flex items-center gap-3">
               <Badge className="bg-primary/10 text-primary border-none text-[10px] font-bold px-3 py-1 rounded-lg">
                 Official Prep
               </Badge>
               {exam.isTrending && (
                  <Badge className="bg-emerald-50 text-emerald-600 border-none text-[10px] font-bold px-3 py-1 rounded-lg flex items-center gap-1">
                    <ShieldCheck className="h-3 w-3" /> Verified
                  </Badge>
               )}
            </div>
            
            <button 
              onClick={handleTogglePin}
              disabled={isPinning}
              className={cn(
                "h-10 w-10 md:h-11 md:w-11 rounded-xl border flex items-center justify-center transition-all active:scale-90 shadow-sm",
                isPinned ? "bg-primary border-primary text-white" : "bg-white border-slate-100 text-slate-300 hover:text-primary"
              )}
            >
              {isPinning ? <Loader2 className="h-4 w-4 animate-spin" /> : <Bookmark className={cn("h-4 w-4", isPinned && "fill-current")} />}
            </button>
          </div>

          <CardContent className="px-5 md:px-6 lg:px-8 pb-8 flex-1 flex flex-col text-left">
            
            {/* LOGO: 80x80 Desktop, 70x70 Mobile */}
            <div className="mb-6 lg:mb-8 flex justify-center">
               <div className="w-[70px] h-[70px] lg:w-[80px] lg:h-[80px] rounded-2xl md:rounded-3xl shadow-2xl bg-white border-2 border-slate-50 flex items-center justify-center overflow-hidden shrink-0">
                  <AuthorityLogo boardId={exam.boardId} size="md" className="p-0 border-none shadow-none" />
               </div>
            </div>

            {/* TITLE: Clamped 2 Lines, Fixed sizes */}
            <div className="space-y-2 mb-6">
               <h3 className="text-[24px] md:text-[28px] lg:text-[34px] font-[800] text-[#0F172A] leading-[1.15] group-hover:text-primary transition-colors tracking-tighter line-clamp-2 min-h-[2.3em] overflow-hidden">
                 {exam.name}
               </h3>
               <p className="text-slate-400 font-medium text-[14px] md:text-[15px] lg:text-[18px] line-clamp-2 leading-tight overflow-hidden">
                  {exam.description || "Official recruitment preparation with verified patterns."}
               </p>
            </div>

            {/* STATISTICS: Compact Responsive Grid */}
            <div className="grid grid-cols-2 gap-x-6 gap-y-4 pt-6 border-t border-slate-100">
               {stats.mocks > 0 && <StatRow label="Mock Tests" val={stats.mocks} icon={Zap} />}
               {stats.subjects > 0 && <StatRow label="Subject Tests" val={stats.subjects} icon={BookOpen} />}
               {stats.pyqs > 0 && <StatRow label="PYQs" val={stats.pyqs} icon={FileStack} />}
               {stats.questions > 0 && <StatRow label="Questions" val={stats.questions} icon={Layers} />}
               {user && <StatRow label="Solved" val={stats.completed} icon={CheckCircle2} color="text-emerald-600" />}
            </div>

            {/* PROGRESS: 6-8px high */}
            {user && stats.totalTests > 0 && (
               <div className="space-y-3 mt-8">
                  <div className="flex justify-between items-center text-[11px] lg:text-[13px] font-bold text-slate-500 uppercase tracking-widest">
                     <span className="flex items-center gap-2"><Target className="h-4 w-4 text-primary" /> Mastery</span>
                     <span className="text-primary tabular-nums">{stats.progress}%</span>
                  </div>
                  <div className="h-1.5 lg:h-2 w-full bg-slate-100 rounded-full overflow-hidden shadow-inner border border-slate-50">
                     <motion.div 
                       initial={{ width: 0 }}
                       animate={{ width: `${stats.progress}%` }}
                       transition={{ duration: 1.5, ease: "easeOut" }}
                       className="h-full bg-gradient-to-r from-primary to-blue-400" 
                     />
                  </div>
               </div>
            )}

            {/* BUTTON: Fixed at Bottom, 56px, 18px Radius */}
            <div className="mt-auto pt-8">
               <Button className={cn(
                  "w-full h-[56px] rounded-[18px] text-white font-[800] uppercase tracking-widest text-[13px] lg:text-[15px] transition-all active:scale-95 border-none shadow-xl flex items-center justify-between px-8",
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

          {/* BOTTOM STRIP: Dynamic Chips */}
          <div className="px-5 md:px-6 lg:px-8 py-4 bg-slate-50/80 border-t border-slate-100 flex items-center gap-2 overflow-x-auto no-scrollbar">
             {stats.mocks > 0 && <ContentChip label="Mocks" />}
             {stats.subjects > 0 && <ContentChip label="Subjects" />}
             {stats.pyqs > 0 && <ContentChip label="PYQs" />}
             {stats.sectionals > 0 && <ContentChip label="Sectional" />}
             <ContentChip label="Bilingual" />
          </div>
        </Card>
      </Link>
    </motion.div>
  );
}

function StatRow({ label, val, icon: Icon, color }: any) {
  return (
    <div className="flex items-center justify-between gap-2 min-w-0">
       <div className="flex items-center gap-2 min-w-0">
          <Icon className="h-4 w-4 text-slate-400 shrink-0" />
          <span className="text-[13px] lg:text-[15px] font-bold text-slate-500 truncate leading-none">{label}</span>
       </div>
       <span className={cn("text-[14px] lg:text-[16px] font-[900] tabular-nums tracking-tighter leading-none", color || "text-[#0F172A]")}>{val}</span>
    </div>
  );
}

function ContentChip({ label }: { label: string }) {
  return (
    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 bg-white border border-slate-200 px-3 py-1 rounded-lg shrink-0 shadow-sm">
       {label}
    </span>
  );
}
