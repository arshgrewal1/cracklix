'use client';

import { useExamStore } from '@/store/useExamStore';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, ShieldCheck } from 'lucide-react';

/**
 * @fileOverview Testbook-style Fixed Tactical Navigation Belt.
 * Standard Layout: [Previous] on Left | [Mark for Review, Clear Response, Save & Next] on Right.
 */
export default function TacticalFooter({ onSubmit }: { onSubmit: () => void }) {
  const { currentIdx, questions, clearAnswer, markForReview, saveAndNext, setCurrentIdx } = useExamStore();

  const isLast = currentIdx === questions.length - 1;

  return (
    <footer className="h-14 bg-white border-t border-slate-200 px-4 md:px-6 flex items-center justify-between shrink-0 sticky bottom-0 z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.03)]">
      
      {/* LEFT: SECONDARY ACTION */}
      <div className="flex items-center">
        <Button 
          variant="outline" 
          onClick={() => setCurrentIdx(Math.max(0, currentIdx - 1))}
          disabled={currentIdx === 0}
          className="h-9 md:h-10 px-3 md:px-4 rounded-lg font-black uppercase text-[10px] tracking-widest border-slate-200 text-slate-500 hover:bg-slate-50 transition-all shadow-sm"
        >
          <ChevronLeft className="h-3.5 w-3.5 mr-1" /> PREVIOUS
        </Button>
      </div>

      {/* RIGHT: TACTICAL GROUP */}
      <div className="flex items-center gap-2 md:gap-3">
        <Button 
          variant="outline" 
          onClick={() => markForReview(currentIdx)}
          className="h-9 md:h-10 px-3 md:px-5 rounded-lg font-black uppercase text-[9px] md:text-[10px] tracking-tight border-pink-200 text-pink-600 bg-pink-50 hover:bg-pink-100 shadow-sm transition-all"
        >
          MARK FOR REVIEW & NEXT
        </Button>
        
        <Button 
          variant="outline" 
          onClick={() => clearAnswer(currentIdx)}
          className="h-9 md:h-10 px-3 md:px-5 rounded-lg font-black uppercase text-[9px] md:text-[10px] tracking-tight border-slate-200 text-slate-500 hover:bg-slate-50 shadow-sm transition-all"
        >
          CLEAR RESPONSE
        </Button>
        
        {isLast ? (
          <Button 
            onClick={onSubmit}
            className="bg-emerald-600 hover:bg-emerald-700 text-white h-9 md:h-10 px-6 md:px-10 rounded-lg font-black uppercase text-[9px] md:text-[10px] tracking-[0.2em] shadow-xl border-none transition-all active:scale-95"
          >
            SUBMIT TEST <ShieldCheck className="ml-1.5 h-3.5 w-3.5" />
          </Button>
        ) : (
          <Button 
            onClick={saveAndNext}
            className="bg-[#F97316] hover:bg-orange-600 text-white h-9 md:h-10 px-6 md:px-10 rounded-lg font-black uppercase text-[9px] md:text-[10px] tracking-[0.2em] shadow-xl border-none transition-all active:scale-95"
          >
            SAVE & NEXT <ChevronRight className="h-3.5 w-3.5 ml-1" />
          </Button>
        )}
      </div>
    </footer>
  );
}