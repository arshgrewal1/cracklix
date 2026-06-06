
'use client';

import { useExamStore } from '@/store/useExamStore';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, RotateCcw, ShieldCheck } from 'lucide-react';

/**
 * @fileOverview Testbook-style Fixed Footer Node.
 * Buttons: MARK & NEXT, CLEAR RESPONSE, SAVE & NEXT.
 */
export default function TacticalFooter({ onSubmit }: { onSubmit: () => void }) {
  const { currentIdx, questions, clearAnswer, markForReview, saveAndNext, setCurrentIdx } = useExamStore();

  const isLast = currentIdx === questions.length - 1;

  return (
    <footer className="h-16 md:h-20 bg-white border-t border-slate-200 px-4 md:px-8 flex items-center justify-between shrink-0 sticky bottom-0 z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.03)]">
      
      {/* LEFT: SECONDARY ACTION (Previous) */}
      <div className="flex items-center">
        <Button 
          variant="outline" 
          onClick={() => setCurrentIdx(Math.max(0, currentIdx - 1))}
          disabled={currentIdx === 0}
          className="h-10 md:h-12 px-4 md:px-6 rounded-xl font-black uppercase text-[10px] tracking-widest border-slate-200 text-slate-500 hover:bg-slate-50"
        >
          <ChevronLeft className="h-4 w-4 mr-1" /> Prev
        </Button>
      </div>

      {/* RIGHT: PRIMARY TACTICAL GROUP */}
      <div className="flex items-center gap-2 md:gap-3">
        <Button 
          variant="outline" 
          onClick={() => markForReview(currentIdx)}
          className="h-10 md:h-12 px-4 md:px-8 rounded-xl font-black uppercase text-[9px] md:text-[10px] tracking-widest border-purple-200 text-purple-600 bg-purple-50 hover:bg-purple-100 hidden sm:flex"
        >
          Mark For Review & Next
        </Button>
        
        <Button 
          variant="outline" 
          onClick={() => clearAnswer(currentIdx)}
          className="h-10 md:h-12 px-4 md:px-8 rounded-xl font-black uppercase text-[9px] md:text-[10px] tracking-widest border-slate-200 text-slate-500 hover:bg-slate-50"
        >
          <RotateCcw className="h-3.5 w-3.5 mr-2" /> Clear Response
        </Button>
        
        {isLast ? (
          <Button 
            onClick={onSubmit}
            className="bg-emerald-600 hover:bg-emerald-700 text-white h-10 md:h-12 px-6 md:px-14 rounded-xl font-black uppercase text-[9px] md:text-[10px] tracking-[0.2em] shadow-xl border-none"
          >
            Submit <ShieldCheck className="ml-2 h-4 w-4" />
          </Button>
        ) : (
          <Button 
            onClick={saveAndNext}
            className="bg-[#0B1528] hover:bg-black text-white h-10 md:h-12 px-6 md:px-14 rounded-xl font-black uppercase text-[9px] md:text-[10px] tracking-[0.2em] shadow-xl border-none"
          >
            Save & Next <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        )}
      </div>
    </footer>
  );
}
