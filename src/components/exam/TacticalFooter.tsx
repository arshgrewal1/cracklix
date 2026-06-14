'use client';

import { useExamStore } from '@/store/useExamStore';
import { Button } from '@/components/ui/button';
import { useFirestore } from '@/firebase';

/**
 * @file Overview High-Fidelity Tactical Action Bar (Absolute Minimum).
 * UPDATED: Slimmer height and font sizes for maximum mobile real estate.
 */
export default function TacticalFooter({ onSubmit }: { onSubmit: () => void }) {
  const currentIdx = useExamStore(s => s.currentIdx);
  const questions = useExamStore(s => s.questions);
  const clearAnswer = useExamStore(s => s.clearAnswer);
  const markForReview = useExamStore(s => s.markForReview);
  const saveAndNext = useExamStore(s => s.saveAndNext);
  
  const db = useFirestore();
  
  return (
    <div className="w-full grid grid-cols-3 gap-1.5 md:gap-4 pt-3 pb-5 bg-white/80 backdrop-blur-sm sticky bottom-0 z-40">
      <Button 
        variant="outline" 
        onClick={() => markForReview(currentIdx, db)}
        className="h-10 md:h-12 rounded-md font-black uppercase text-[7px] md:text-[9px] tracking-tighter border-slate-200 text-[#334155] bg-white active:scale-95"
      >
        Mark Node
      </Button>

      <Button 
        variant="outline" 
        onClick={() => clearAnswer(currentIdx, db)}
        className="h-10 md:h-12 rounded-md font-black uppercase text-[7px] md:text-[9px] tracking-tighter border-slate-200 text-[#334155] bg-white active:scale-95"
      >
        Clear
      </Button>

      <Button 
        onClick={() => saveAndNext(db)}
        className="h-10 md:h-12 bg-[#F97316] hover:bg-orange-600 text-white rounded-md font-black uppercase text-[7px] md:text-[9px] tracking-tighter shadow-md border-none active:scale-95"
      >
        Save & Next
      </Button>
    </div>
  );
}
