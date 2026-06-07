
'use client';

import { useExamStore } from '@/store/useExamStore';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, CheckCircle2, RotateCcw, Flag } from 'lucide-react';
import { useFirestore } from '@/firebase';
import { cn } from '@/lib/utils';

/**
 * @fileOverview Professional Tactical Action Bar.
 * PERFORMANCE OPTIMIZED: Granular selectors and pointer-event hardening.
 */
export default function TacticalFooter({ onSubmit }: { onSubmit: () => void }) {
  const currentIdx = useExamStore(s => s.currentIdx);
  const questions = useExamStore(s => s.questions);
  const clearAnswer = useExamStore(s => s.clearAnswer);
  const markForReview = useExamStore(s => s.markForReview);
  const saveAndNext = useExamStore(s => s.saveAndNext);
  const setCurrentIdx = useExamStore(s => s.setCurrentIdx);
  
  const db = useFirestore();
  const isLast = currentIdx === questions.length - 1;

  return (
    <div className="w-full flex flex-col gap-2.5 pt-2 pb-8 select-none pointer-events-auto">
      <div className="flex items-center gap-2 w-full">
        <Button 
          variant="outline" 
          onClick={() => clearAnswer(currentIdx, db)}
          className="flex-1 h-12 rounded-xl font-black uppercase text-[10px] tracking-widest border-slate-200 text-slate-500 bg-white active:scale-95"
        >
          <RotateCcw className="h-4 w-4 mr-2" /> Clear
        </Button>
        <Button 
          variant="outline" 
          onClick={() => markForReview(currentIdx, db)}
          className="flex-1 h-12 rounded-xl font-black uppercase text-[10px] tracking-widest border-violet-100 text-violet-600 bg-violet-50 active:scale-95"
        >
          <Flag className="h-4 w-4 mr-2" /> Mark
        </Button>
      </div>

      <div className="flex items-center gap-2 w-full">
        <Button 
          variant="outline" 
          onClick={() => setCurrentIdx(Math.max(0, currentIdx - 1))}
          disabled={currentIdx === 0}
          className="h-14 px-5 rounded-xl border-slate-200 bg-white text-slate-500 active:scale-95"
        >
          <ChevronLeft className="h-6 w-6" />
        </Button>

        {isLast ? (
          <Button 
            onClick={onSubmit}
            className="flex-1 h-14 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black uppercase text-[11px] tracking-widest shadow-lg gap-2 active:scale-95"
          >
            Finish Test <CheckCircle2 className="h-4 w-4" />
          </Button>
        ) : (
          <Button 
            onClick={() => saveAndNext(db)}
            className="flex-1 h-14 bg-primary hover:bg-orange-600 text-white rounded-xl font-black uppercase text-[11px] tracking-widest shadow-lg gap-2 active:scale-95"
          >
            Save & Next <ChevronRight className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
