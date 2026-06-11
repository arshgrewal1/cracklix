
'use client';

import { useExamStore } from '@/store/useExamStore';
import { Button } from '@/components/ui/button';
import { useFirestore } from '@/firebase';

/**
 * @file Overview High-Fidelity Tactical Action Bar (Compact).
 * UPDATED: Slimmer buttons for a more professional Testbook-style feel.
 */
export default function TacticalFooter({ onSubmit }: { onSubmit: () => void }) {
  const currentIdx = useExamStore(s => s.currentIdx);
  const questions = useExamStore(s => s.questions);
  const clearAnswer = useExamStore(s => s.clearAnswer);
  const markForReview = useExamStore(s => s.markForReview);
  const saveAndNext = useExamStore(s => s.saveAndNext);
  
  const db = useFirestore();
  
  return (
    <div className="w-full grid grid-cols-3 gap-2 md:gap-4 pt-4 pb-6 bg-white/80 backdrop-blur-sm sticky bottom-0 z-40">
      <Button 
        variant="outline" 
        onClick={() => markForReview(currentIdx, db)}
        className="h-12 md:h-14 rounded-lg font-black uppercase text-[9px] md:text-[10px] tracking-tight border-slate-200 text-[#334155] bg-white active:scale-95"
      >
        Mark & Next
      </Button>

      <Button 
        variant="outline" 
        onClick={() => clearAnswer(currentIdx, db)}
        className="h-12 md:h-14 rounded-lg font-black uppercase text-[9px] md:text-[10px] tracking-tight border-slate-200 text-[#334155] bg-white active:scale-95"
      >
        Clear Response
      </Button>

      <Button 
        onClick={() => saveAndNext(db)}
        className="h-12 md:h-14 bg-[#F97316] hover:bg-orange-600 text-white rounded-lg font-black uppercase text-[9px] md:text-[10px] tracking-tight shadow-lg shadow-orange-500/10 active:scale-95 border-none"
      >
        Save & Next
      </Button>
    </div>
  );
}
