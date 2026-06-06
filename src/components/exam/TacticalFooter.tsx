
'use client';

import { useExamStore } from '@/store/useExamStore';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, CheckCircle2, RotateCcw } from 'lucide-react';
import { useFirestore } from '@/firebase';

export default function TacticalFooter({ onSubmit }: { onSubmit: () => void }) {
  const { currentIdx, questions, clearAnswer, markForReview, saveAndNext, setCurrentIdx } = useExamStore();
  const db = useFirestore();

  const isLast = currentIdx === questions.length - 1;

  return (
    <footer className="h-16 bg-white border-t border-slate-200 px-4 md:px-10 flex items-center justify-between shrink-0 z-50">
      
      {/* LEFT: NAVIGATION */}
      <div className="flex items-center">
        <Button 
          variant="outline" 
          onClick={() => setCurrentIdx(Math.max(0, currentIdx - 1))}
          disabled={currentIdx === 0}
          className="h-11 px-5 rounded-xl font-black uppercase text-[10px] tracking-[0.2em] border-slate-200 text-slate-500"
        >
          <ChevronLeft className="h-4 w-4 mr-1.5" /> PREVIOUS
        </Button>
      </div>

      {/* RIGHT: TACTICAL ACTIONS */}
      <div className="flex items-center gap-3">
        <Button 
          variant="outline" 
          onClick={() => markForReview(currentIdx, db!)}
          className="h-11 px-6 rounded-xl font-black uppercase text-[10px] tracking-tight border-purple-200 text-purple-600 bg-purple-50 hover:bg-purple-100"
        >
          MARK FOR REVIEW & NEXT
        </Button>
        
        <Button 
          variant="outline" 
          onClick={() => clearAnswer(currentIdx, db!)}
          className="h-11 px-6 rounded-xl font-black uppercase text-[10px] tracking-tight border-slate-200 text-slate-500 hover:bg-slate-50"
        >
          <RotateCcw className="h-3.5 w-3.5 mr-2" /> CLEAR
        </Button>
        
        {isLast ? (
          <Button 
            onClick={onSubmit}
            className="bg-emerald-600 hover:bg-emerald-700 text-white h-11 px-10 rounded-xl font-black uppercase text-[10px] tracking-[0.2em] shadow-xl"
          >
            SUBMIT TEST <CheckCircle2 className="ml-2 h-4 w-4" />
          </Button>
        ) : (
          <Button 
            onClick={() => saveAndNext(db!)}
            className="bg-[#F97316] hover:bg-orange-600 text-white h-11 px-10 rounded-xl font-black uppercase text-[10px] tracking-[0.2em] shadow-xl"
          >
            SAVE & NEXT <ChevronRight className="h-4 w-4 ml-1.5" />
          </Button>
        )}
      </div>
    </footer>
  );
}
