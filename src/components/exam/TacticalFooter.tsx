'use client';

import { useExamStore } from '@/store/useExamStore';
import { Button } from '@/components/ui/button';
import { useFirestore } from '@/firebase';

/**
 * @file Overview Test Action Bar - Spacing Optimized for Mobile.
 * FIXED: Reduced mobile font size to prevent button text overflow.
 */
export default function TacticalFooter({ onSubmit }: { onSubmit: () => void }) {
  const currentIdx = useExamStore(s => s.currentIdx);
  const clearAnswer = useExamStore(s => s.clearAnswer);
  const markForReview = useExamStore(s => s.markForReview);
  const saveAndNext = useExamStore(s => s.saveAndNext);
  
  const db = useFirestore();
  
  return (
    <div className="w-full bg-white md:bg-transparent border-t border-slate-100 md:border-t-0 p-3 md:p-0 fixed bottom-0 left-0 right-0 md:static z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] md:shadow-none">
      <div className="max-w-4xl mx-auto grid grid-cols-3 gap-2 md:gap-4">
        <Button 
          variant="outline" 
          onClick={() => markForReview(currentIdx, db)}
          className="h-14 md:h-16 rounded-2xl font-black text-[9px] md:text-[11px] tracking-tighter md:tracking-tight border-slate-200 text-[#334155] bg-white active:scale-95 shadow-sm px-1 leading-[1.1]"
        >
          Review Later
        </Button>

        <Button 
          variant="outline" 
          onClick={() => clearAnswer(currentIdx, db)}
          className="h-14 md:h-16 rounded-2xl font-black text-[9px] md:text-[11px] tracking-widest border-slate-200 text-[#334155] bg-white active:scale-95 shadow-sm px-1"
        >
          Clear
        </Button>

        <Button 
          onClick={() => saveAndNext(db)}
          className="h-14 md:h-16 bg-primary hover:bg-blue-700 text-white rounded-2xl font-black text-[9px] md:text-[11px] tracking-widest shadow-xl border-none active:scale-95 px-1"
        >
          Save & Next
        </Button>
      </div>
    </div>
  );
}
