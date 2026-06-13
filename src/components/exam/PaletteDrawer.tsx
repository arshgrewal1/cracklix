'use client';

import { useExamStore } from '@/store/useExamStore';
import { cn } from '@/lib/utils';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useMemo } from 'react';

/**
 * @fileOverview Refined CBT Palette Drawer v1.1.
 * ACCESSIBILITY: Added SheetDescription for ARIA compliance.
 */
export default function PaletteDrawer({ open, onOpenChange }: { open: boolean, onOpenChange: (open: boolean) => void }) {
  const { questions, status, currentIdx, setCurrentIdx, visited } = useExamStore();

  const stats = useMemo(() => {
    const s = { answered: 0, marked: 0, notAnswered: 0, notVisited: 0, ansMarked: 0 };
    questions.forEach((_, i) => {
      const st = status[i];
      if (st === 'answered') s.answered++;
      else if (st === 'marked') s.marked++;
      else if (st === 'answered-marked') s.ansMarked++;
      else if (visited.includes(i)) s.notAnswered++;
      else s.notVisited++;
    });
    return s;
  }, [questions, status, visited]);

  return (
    <div className="pointer-events-auto">
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="right" className="w-[320px] md:w-[400px] p-0 border-none">
          <SheetHeader className="p-6 border-b">
            <SheetTitle className="text-sm font-black uppercase tracking-[0.2em]">Question Palette</SheetTitle>
            <SheetDescription className="sr-only">Visual map of all questions in the test series with their current status.</SheetDescription>
          </SheetHeader>
          
          <ScrollArea className="h-[calc(100vh-80px)] p-6">
            <div className="grid grid-cols-2 gap-3 mb-8">
              <LegendItem label="Answered" count={stats.answered} color="bg-emerald-500" />
              <LegendItem label="Not Answered" count={stats.notAnswered} color="bg-rose-500" />
              <LegendItem label="Marked" count={stats.marked} color="bg-purple-600" />
              <LegendItem label="Not Visited" count={stats.notVisited} color="bg-slate-100" textColor="text-slate-400" />
              <LegendItem label="Ans & Marked" count={stats.ansMarked} color="bg-indigo-600" colSpan={2} />
            </div>

            <div className="space-y-8">
               <div className="grid grid-cols-5 gap-3">
                 {questions.map((_, i) => {
                   const st = status[i];
                   const isVisited = visited.includes(i);
                   const isCurrent = currentIdx === i;

                   return (
                     <button
                       key={i}
                       onClick={() => { setCurrentIdx(i); onOpenChange(false); }}
                       className={cn(
                         "h-10 w-10 rounded-lg flex items-center justify-center font-black text-xs transition-all border-2",
                         isCurrent ? "border-primary bg-white text-primary scale-110 shadow-lg z-10" : "border-transparent",
                         !isCurrent && st === 'answered' ? "bg-emerald-500 text-white" :
                         !isCurrent && st === 'marked' ? "bg-purple-600 text-white" :
                         !isCurrent && st === 'answered-marked' ? "bg-indigo-600 text-white" :
                         !isCurrent && isVisited ? "bg-rose-500 text-white" :
                         !isCurrent && "bg-slate-50 text-slate-400"
                       )}
                     >
                       {i + 1}
                     </button>
                   );
                 })}
               </div>
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>
    </div>
  );
}

function LegendItem({ label, count, color, textColor = "text-white", colSpan = 1 }: any) {
  return (
    <div className={cn("p-2 rounded-xl bg-white border border-slate-100 flex items-center gap-3", colSpan > 1 && "col-span-2")}>
       <div className={cn("h-6 w-6 rounded-md flex items-center justify-center text-[10px] font-black", color, textColor)}>
          {count}
       </div>
       <span className="text-[10px] font-black uppercase text-slate-500 tracking-tighter truncate">{label}</span>
    </div>
  )
}
