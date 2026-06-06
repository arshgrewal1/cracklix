
'use client';

import { useExamStore } from '@/store/useExamStore';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, CheckCircle2, RotateCcw, Flag } from 'lucide-react';
import { useFirestore } from '@/firebase';

/**
 * @fileOverview Institutional Tactical Navigation Belt v6.0.
 * Re-ordered: [PREVIOUS] ... [MARK FOR REVIEW] [CLEAR RESPONSE] [SAVE & NEXT / SUBMIT]
 * Scaling: Primary action SAVE & NEXT anchored to the far right for ergonomic palette proximity.
 */
export default function TacticalFooter({ onSubmit }: { onSubmit: () => void }) {
  const { currentIdx, questions, clearAnswer, markForReview, saveAndNext, setCurrentIdx } = useExamStore();
  const db = useFirestore();

  const isLast = currentIdx === questions.length - 1;

  return (
    <footer className="h-14 bg-white border-t border-slate-200 px-3 md:px-10 flex items-center justify-between shrink-0 z-50 select-none">
      
      {/* LEFT: BACK NAVIGATION */}
      <div className="flex items-center">
        <Button 
          variant="outline" 
          onClick={() => setCurrentIdx(Math.max(0, currentIdx - 1))}
          disabled={currentIdx === 0}
          className="h-9 px-4 md:px-6 rounded-lg font-black uppercase text-[9px] tracking-widest border-slate-200 text-slate-500 hover:bg-slate-50"
        >
          <ChevronLeft className="h-3.5 w-3.5 mr-1 md:mr-2" /> Previous
        </Button>
      </div>

      {/* RIGHT: TACTICAL GROUP (Ergonomic Alignment) */}
      <div className="flex items-center gap-2 md:gap-4">
        <Button 
          variant="outline" 
          onClick={() => markForReview(currentIdx, db)}
          className="h-9 px-3 md:px-6 rounded-lg font-black uppercase text-[9px] tracking-tight border-violet-200 text-violet-600 bg-violet-50 hover:bg-violet-100 hidden sm:flex gap-2"
        >
          <Flag className="h-3.5 w-3.5" /> Mark & Next
        </Button>
        
        <Button 
          variant="outline" 
          onClick={() => clearAnswer(currentIdx, db)}
          className="h-9 px-3 md:px-6 rounded-lg font-black uppercase text-[9px] tracking-tight border-slate-200 text-slate-500 hover:bg-slate-50 gap-2"
        >
          <RotateCcw className="h-3.5 w-3.5" /> Clear Response
        </Button>

        {isLast ? (
          <Button 
            onClick={onSubmit}
            className="bg-emerald-600 hover:bg-emerald-700 text-white h-9 px-6 md:px-10 rounded-lg font-black uppercase text-[9px] tracking-widest shadow-xl gap-2"
          >
            Submit Test <CheckCircle2 className="h-3.5 w-3.5" />
          </Button>
        ) : (
          <Button 
            onClick={() => saveAndNext(db)}
            className="bg-[#F97316] hover:bg-orange-600 text-white h-9 px-6 md:px-10 rounded-lg font-black uppercase text-[9px] tracking-widest shadow-xl gap-2"
          >
            Save & Next <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>
    </footer>
  );
}
