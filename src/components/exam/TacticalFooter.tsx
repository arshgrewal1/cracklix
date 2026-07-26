'use client';

import { useExamStore } from '@/store/useExamStore';
import { Button } from '@/components/ui/button';
import { useFirestore } from '@/firebase';
import { cn } from '@/lib/utils';
import { useCallback } from 'react';

/**
 * @fileOverview Test Action Bar v43.0 [Alignment Hardened].
 * FIXED: Rebuilt layout to ensure 100% horizontal and vertical text centering.
 * FIXED: Save & Next logic strictly gates the submission modal to the last question.
 */
export default function TacticalFooter({ onSubmit }: { onSubmit: () => void }) {
  const currentIdx = useExamStore(s => s.currentIdx);
  const questions = useExamStore(s => s.questions);
  const clearAnswer = useExamStore(s => s.clearAnswer);
  const markForReview = useExamStore(s => s.markForReview);
  const saveAndNext = useExamStore(s => s.saveAndNext);
  
  const db = useFirestore();
  const isLastQuestion = currentIdx === (questions?.length || 0) - 1;

  const handleReviewLater = useCallback(() => {
    markForReview(currentIdx, db);
    saveAndNext(db);
  }, [currentIdx, db, markForReview, saveAndNext]);

  const handleClear = useCallback(() => {
    clearAnswer(currentIdx, db);
  }, [currentIdx, db, clearAnswer]);

  const handlePrimaryAction = () => {
    if (isLastQuestion) {
      onSubmit();
    } else {
      saveAndNext(db);
    }
  };
  
  return (
    <div className="w-full bg-white border-t border-slate-100 p-3 md:p-6 md:bg-transparent md:border-none z-50">
      <div className="max-w-4xl mx-auto grid grid-cols-3 gap-2 md:gap-6">
        <Button 
          variant="outline" 
          onClick={handleReviewLater}
          className="h-12 md:h-16 rounded-xl md:rounded-2xl font-black text-[9px] md:text-[11px] border-slate-200 text-[#334155] bg-white active:scale-95 shadow-sm flex items-center justify-center text-center uppercase tracking-tight px-1 leading-none"
        >
          Review Later
        </Button>

        <Button 
          variant="outline" 
          onClick={handleClear}
          className="h-12 md:h-16 rounded-xl md:rounded-2xl font-black text-[9px] md:text-[11px] border-slate-200 text-[#334155] bg-white active:scale-95 shadow-sm flex items-center justify-center text-center uppercase tracking-tight px-1 leading-none"
        >
          Clear
        </Button>

        <Button 
          onClick={handlePrimaryAction}
          className={cn(
            "h-12 md:h-16 text-white rounded-xl md:rounded-2xl font-black text-[9px] md:text-[11px] shadow-xl border-none active:scale-95 flex items-center justify-center text-center transition-all uppercase tracking-tight px-1 leading-none",
            isLastQuestion ? "bg-emerald-600 hover:bg-emerald-700" : "bg-primary hover:bg-blue-700"
          )}
        >
          {isLastQuestion ? "Submit Test" : "Save & Next"}
        </Button>
      </div>
    </div>
  );
}
