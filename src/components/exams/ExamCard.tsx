'use client';

import React, { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { 
  ChevronRight, 
  Bookmark, 
  Loader2,
  Crown
} from "lucide-react";
import { AuthorityLogo } from "@/lib/exam-icons";
import { doc, updateDoc, arrayUnion, arrayRemove, serverTimestamp } from "firebase/firestore";
import { useFirestore, useUser } from "@/firebase";
import { useToast } from "@/hooks/use-toast";
import { Exam } from "@/types";
import { cn } from "@/lib/utils";

interface ExamCardProps {
  exam: Exam;
  allMocks?: any[];
  userResults?: any[];
  allPyqs?: any[];
  allNotes?: any[];
}

/**
 * @fileOverview Premium Compact Exam Vertical Node v15.0.
 * DESIGN: Horizontal list-item style inspired by top-tier exam platforms.
 * FOCUS: Logo + Exam Name + Authority Hub.
 */
export default function ExamCard({ 
  exam, 
  allMocks = [], 
  userResults = []
}: ExamCardProps) {
  const db = useFirestore();
  const { user, profile } = useUser();
  const { toast } = useToast();
  const [isPinning, setIsPinning] = useState(false);

  const examId = exam?.id;
  const isPinned = profile?.pinnedExams?.includes(examId);

  const handleTogglePin = async (e: React.MouseEvent) => {
    e.preventDefault(); 
    e.stopPropagation();
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
    } catch (err) {
      toast({ variant: "destructive", title: "Sync failed" });
    } finally { 
      setIsPinning(false); 
    }
  };

  if (!exam) return null;

  return (
    <Link href={`/exams/view?id=${exam.id}`} className="block w-full">
      <Card className="bg-white border border-[#E5EAF2] shadow-sm hover:shadow-md transition-all duration-300 rounded-[18px] group overflow-hidden relative h-[90px] md:h-[100px] flex items-center p-3 md:p-4 gap-4">
        
        {/* LOGO NODE */}
        <div className="shrink-0">
           <AuthorityLogo 
              boardId={exam.boardId} 
              size="sm" 
              className="h-12 w-12 md:h-14 md:w-14 bg-[#F8FAFC] border border-[#E5EAF2] shadow-inner rounded-xl group-hover:scale-105 transition-transform" 
           />
        </div>

        {/* IDENTITY HUB */}
        <div className="flex-1 min-w-0 text-left">
           <div className="flex items-center gap-2 mb-0.5">
              <h3 className="text-[15px] md:text-[19px] font-[800] text-[#071B4D] leading-none truncate tracking-tight">
                 {exam.name}
              </h3>
              {exam.boardId === 'current-affairs' && <Crown className="h-3 w-3 text-amber-500 fill-current shrink-0" />}
           </div>
           <p className="text-[11px] md:text-[13px] font-bold text-slate-400 uppercase tracking-tight">
              {exam.boardId} Authority
           </p>
        </div>

        {/* ACTION HUB */}
        <div className="flex items-center gap-2 md:gap-3 shrink-0 ml-1">
           <button 
             onClick={handleTogglePin}
             disabled={isPinning}
             className={cn(
               "h-9 w-9 rounded-xl border flex items-center justify-center transition-all active:scale-90",
               isPinned ? "bg-primary/10 border-primary text-primary" : "bg-white border-slate-100 text-slate-300 hover:text-primary hover:border-primary/20"
             )}
           >
              {isPinning ? <Loader2 className="h-4 w-4 animate-spin" /> : <Bookmark className={cn("h-4 w-4", isPinned && "fill-current")} />}
           </button>
           
           <div className="h-9 w-9 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-100 text-slate-300 group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-all">
              <ChevronRight className="h-5 w-5" />
           </div>
        </div>

      </Card>
    </Link>
  );
}