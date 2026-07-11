'use client';

import { useExamStore } from '@/store/useExamStore';
import { Button } from '@/components/ui/button';
import { useFirestore } from '@/firebase';
import { cn } from '@/lib/utils';
import { useCallback } from 'react';

/**
 * @fileOverview Test Action Bar v40.0.
 * FIXED: Implemented "Review & Next" logic and last-question "Submit" transformation.
 */
export default function TacticalFooter({ onSubmit }: { onSubmit: () => void }) {
  const currentIdx = useExamStore(s => s.currentIdx);
  const questions = useExamStore(s => s.questions);
  const clearAnswer = useExamStore(s => s.clearAnswer);
  const markForReview = useExamStore(s => s.markForReview);
  const setCurrentIdx = useExamStore(s => s.setCurrentIdx);
  
  const db = useFirestore();
  
  const isLastQuestion = currentIdx === questions.length - 1;

  const handleReviewLater = useCallback(() => {
    markForReview(currentIdx, db);
    if (!isLastQuestion) {
      setCurrentIdx(currentIdx + 1);
    }
  }, [currentIdx, db, isLastQuestion, markForReview, setCurrentIdx]);

  const handleClear = useCallback(() => {
    clearAnswer(currentIdx, db);
  }, [currentIdx, db, clearAnswer]);
  
  return (
    <div className="w-full bg-white md:bg-transparent border-t border-slate-100 md:border-t-0 p-3 md:p-0 fixed bottom-0 left-0 right-0 md:static z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] md:shadow-none">
      <div className="max-w-4xl mx-auto grid grid-cols-3 gap-2 md:gap-4">
        <Button 
          variant="outline" 
          onClick={handleReviewLater}
          className="h-14 md:h-16 rounded-2xl font-black text-[9px] md:text-[11px] border-slate-200 text-[#334155] bg-white active:scale-95 shadow-sm px-1 leading-[1.1]"
        >
          Review Later
        </Button>

        <Button 
          variant="outline" 
          onClick={handleClear}
          className="h-14 md:h-16 rounded-2xl font-black text-[9px] md:text-[11px] border-slate-200 text-[#334155] bg-white active:scale-95 shadow-sm px-1"
        >
          Clear
        </Button>

        <Button 
          onClick={onSubmit}
          className={cn(
            "h-14 md:h-16 text-white rounded-2xl font-black text-[9px] md:text-[11px] shadow-xl border-none active:scale-95 px-1 transition-all",
            isLastQuestion ? "bg-emerald-600 hover:bg-emerald-700" : "bg-primary hover:bg-blue-700"
          )}
        >
          {isLastQuestion ? "Submit Test" : "Save & Next"}
        </Button>
      </div>
    </div>
  );
}
