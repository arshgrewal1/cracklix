
'use client';

import { useMemo, useState } from "react"
import { cn } from "@/lib/utils"
import { ChevronLeft, ChevronRight, LayoutGrid, List, FileText, Info } from "lucide-react"
import { useExamStore } from '@/store/useExamStore';

/**
 * @fileOverview Professional CBT Palette Node v26.0.
 * Optimized Grid Visibility: grid-area assigned flex-1 to ensure all nodes are viewable.
 */
export default function QuestionPalette({ onSelect }: { onSelect: (index: number) => void }) {
  const { questions, status, currentIdx, visited } = useExamStore();
  const [viewMode, setViewViewMode] = useState<'grid' | 'list'>('grid');
  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 25;

  const summary = useMemo(() => {
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

  const totalPages = Math.ceil(questions.length / pageSize);
  const visibleQuestions = questions.slice(currentPage * pageSize, (currentPage + 1) * pageSize);

  return (
    <div className="flex flex-col h-full bg-white text-left font-body border-l border-slate-100 shadow-[-4px_0_20px_rgba(0,0,0,0.02)]">
      
      {/* 1. PALETTE HEADER TABS */}
      <div className="flex border-b border-slate-100 shrink-0">
         <button 
           onClick={() => setViewViewMode('grid')}
           className={cn(
             "flex-1 h-12 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest border-b-2 transition-all",
             viewMode === 'grid' ? "border-primary text-primary bg-primary/5" : "border-transparent text-slate-400"
           )}
         >
            <LayoutGrid className="h-3.5 w-3.5" /> Grid View
         </button>
         <button 
           onClick={() => setViewViewMode('list')}
           className={cn(
             "flex-1 h-12 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest border-b-2 transition-all",
             viewMode === 'list' ? "border-primary text-primary bg-primary/5" : "border-transparent text-slate-400"
           )}
         >
            <List className="h-3.5 w-3.5" /> List View
         </button>
      </div>

      {/* 2. TACTICAL LINKS */}
      <div className="grid grid-cols-2 divide-x divide-slate-100 border-b border-slate-100 shrink-0">
         <button className="h-10 flex items-center justify-center gap-2 text-[9px] font-black uppercase text-slate-500 hover:bg-slate-50">
            <Info className="h-3 w-3 text-primary" /> Instructions
         </button>
         <button className="h-10 flex items-center justify-center gap-2 text-[9px] font-black uppercase text-slate-500 hover:bg-slate-50">
            <FileText className="h-3 w-3 text-primary" /> Question Paper
         </button>
      </div>

      {/* 3. LEGEND / STATISTICS */}
      <div className="p-3 grid grid-cols-2 gap-1.5 bg-slate-50/50 shrink-0">
         <LegendItem count={summary.answered} label="Answered" color="bg-blue-600" />
         <LegendItem count={summary.notAnswered} label="Not Answered" color="bg-slate-400" />
         <LegendItem count={summary.marked} label="Marked" color="bg-pink-500" />
         <LegendItem count={summary.notVisited} label="Not Visited" color="bg-white border-slate-200" textColor="text-slate-400" />
         <LegendItem count={summary.ansMarked} label="Ans & Marked" color="bg-violet-600" colSpan={2} />
      </div>

      <div className="h-px w-full bg-slate-200 shrink-0" />

      {/* 4. GRID MATRIX (5-column scrollable) */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 min-h-0">
         <div className="grid grid-cols-5 gap-2.5">
            {visibleQuestions.map((_, i) => {
              const idx = currentPage * pageSize + i;
              const st = status[idx];
              const isVisited = visited.includes(idx);
              const isCurrent = currentIdx === idx;

              return (
                <button
                  key={idx}
                  onClick={() => onSelect(idx)}
                  className={cn(
                    "w-10 h-10 md:w-11 md:h-11 rounded-lg flex items-center justify-center font-black text-xs transition-all border-2",
                    isCurrent ? "border-primary bg-white text-primary scale-110 shadow-lg z-10" : "border-transparent",
                    !isCurrent && st === 'answered' ? "bg-blue-600 text-white" :
                    !isCurrent && st === 'marked' ? "bg-pink-500 text-white" :
                    !isCurrent && st === 'answered-marked' ? "bg-violet-600 text-white" :
                    !isCurrent && isVisited ? "bg-slate-400 text-white" :
                    !isCurrent && "bg-slate-50 text-slate-400 border-slate-100"
                  )}
                >
                  {idx + 1}
                </button>
              )
            })}
         </div>
      </div>

      {/* 5. PAGINATION NAV */}
      <div className="shrink-0 p-3 border-t border-slate-100 bg-white">
        <div className="flex items-center justify-between mb-4">
           <button 
             disabled={currentPage === 0}
             onClick={() => setCurrentPage(p => p - 1)}
             className="h-8 w-8 rounded-lg border border-slate-200 flex items-center justify-center disabled:opacity-30 hover:bg-slate-50"
           >
              <ChevronLeft className="h-3.5 w-3.5" />
           </button>
           <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">
              Palette {currentPage + 1} / {totalPages}
           </span>
           <button 
             disabled={currentPage === totalPages - 1}
             onClick={() => setCurrentPage(p => p + 1)}
             className="h-8 w-8 rounded-lg border border-slate-200 flex items-center justify-center disabled:opacity-30 hover:bg-slate-50"
           >
              <ChevronRight className="h-3.5 w-3.5" />
           </button>
        </div>
        <p className="text-[7px] font-black text-slate-300 uppercase tracking-[0.4em] text-center">
            CRACKLIX INSTITUTIONAL CBT
        </p>
      </div>
    </div>
  )
}

function LegendItem({ count, label, color, textColor = "text-white", colSpan = 1 }: any) {
  return (
    <div className={cn("flex items-center gap-2 p-1 rounded-lg border border-slate-100 bg-white shadow-sm", colSpan > 1 && "col-span-2")}>
       <div className={cn("h-4.5 w-4.5 rounded-md flex items-center justify-center text-[8px] font-black shrink-0 border", color, textColor)}>
          {count}
       </div>
       <span className="text-[8px] font-black uppercase text-slate-500 tracking-tight truncate">{label}</span>
    </div>
  )
}
