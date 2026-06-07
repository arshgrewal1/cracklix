
'use client';

import React, { useMemo } from "react";
import { cn } from "@/lib/utils";
import { 
  CheckCircle2, 
  ShieldCheck,
  ChevronDown
} from "lucide-react";
import { useExamStore } from '@/store/useExamStore';
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

interface QuestionPaletteProps {
  onSelect: (index: number) => void;
  onSubmit: () => void;
}

/**
 * @fileOverview Professional CBT Question Palette Hub v12.0.
 * PERFORMANCE OPTIMIZED: Granular selectors prevent heavy grid re-renders on timer tick.
 */
export default function QuestionPalette({ onSelect, onSubmit }: QuestionPaletteProps) {
  const questions = useExamStore(s => s.questions);
  const status = useExamStore(s => s.status);
  const currentIdx = useExamStore(s => s.currentIdx);
  const visited = useExamStore(s => s.visited);

  const stats = useMemo(() => {
    const s = { answered: 0, marked: 0, notAnswered: 0, notVisited: 0, ansMarked: 0 };
    (questions || []).forEach((_, i) => {
      const st = status[i];
      if (st === 'answered') s.answered++;
      else if (st === 'marked') s.marked++;
      else if (st === 'answered-marked') s.ansMarked++;
      else if (visited.includes(i)) s.notAnswered++;
      else s.notVisited++;
    });
    return s;
  }, [questions, status, visited]);

  const sections = useMemo(() => {
    const groups: Record<string, { name: string, startIdx: number, endIdx: number, questions: number[] }> = {};
    
    (questions || []).forEach((q, idx) => {
      const sectionId = String(q.sectionId || 'General');
      if (!groups[sectionId]) {
        groups[sectionId] = {
          name: sectionId.replace(/-/g, ' ').toUpperCase(),
          startIdx: idx + 1,
          endIdx: idx + 1,
          questions: []
        };
      }
      groups[sectionId].questions.push(idx);
      groups[sectionId].endIdx = idx + 1;
    });
    
    return Object.entries(groups);
  }, [questions]);

  return (
    <div className="flex flex-col h-full bg-white text-left font-body select-none pointer-events-auto">
      <ScrollArea className="h-full">
        <div className="p-4 md:p-8 pt-8 md:pt-10 space-y-8 md:space-y-12 pb-32">
           
           {/* 1. STATUS SUMMARY HUB */}
           <div className="space-y-4">
              <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] ml-1">Evaluation Status</p>
              <div className="grid grid-cols-2 gap-3">
                 <SummaryCard count={stats.answered} label="ANSWERED" color="bg-blue-600" />
                 <SummaryCard count={stats.notAnswered} label="NOT ANSWERED" color="bg-slate-400" />
                 <SummaryCard count={stats.marked} label="MARKED" color="bg-pink-500" />
                 <SummaryCard count={stats.notVisited} label="NOT VISITED" color="bg-white" textColor="text-slate-400" border="border-slate-200" />
                 <SummaryCard count={stats.ansMarked} label="ANS & MARKED" color="bg-violet-600" colSpan={2} />
              </div>
           </div>

           {/* 2. SECTIONAL GRIDS */}
           <div className="space-y-10 pt-6 border-t border-slate-50">
              {sections.map(([secId, data]) => (
                <div key={secId} className="space-y-5">
                   <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <h4 className="text-[10px] md:text-[11px] font-black text-[#0B1528] tracking-tight uppercase flex items-center gap-2">
                        <ChevronDown className="h-3.5 w-3.5 text-primary" /> {data.name}
                      </h4>
                   </div>
                   
                   <div className="grid grid-cols-4 md:grid-cols-5 gap-3">
                      {data.questions.map((idx) => (
                         <QuestionNode 
                           key={idx} 
                           index={idx} 
                           isActive={currentIdx === idx} 
                           status={status[idx]} 
                           isVisited={visited.includes(idx)}
                           onClick={() => onSelect(idx)}
                         />
                      ))}
                   </div>
                </div>
              ))}
           </div>

           {/* 3. TACTICAL SUBMIT BUTTON */}
           <div className="pt-6">
              <Button 
                onClick={(e) => {
                   e.preventDefault();
                   onSubmit();
                }}
                className="w-full h-14 md:h-16 bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase tracking-[0.2em] text-[10px] md:text-[11px] rounded-xl shadow-xl shadow-emerald-900/10 gap-3 group transition-all active:scale-95"
              >
                 <ShieldCheck className="h-5 w-5 md:h-5 md:w-5 group-hover:scale-110 transition-transform" /> SUBMIT TEST
              </Button>
           </div>
        </div>
      </ScrollArea>
    </div>
  );
}

function SummaryCard({ count, label, color, textColor = "text-white", colSpan = 1, border = "border-transparent" }: any) {
  return (
    <div className={cn(
      "flex items-center gap-2.5 p-2 rounded-xl bg-slate-50 border border-slate-100 shadow-sm",
      colSpan > 1 && "col-span-2"
    )}>
       <div className={cn("h-7 w-7 rounded-full flex items-center justify-center text-[10px] md:text-[11px] font-black shrink-0 shadow-sm border", color, textColor, border)}>
          {count}
       </div>
       <div className="min-w-0">
          <span className="text-[8px] md:text-[10px] font-black uppercase text-slate-500 tracking-tighter block leading-tight">{label}</span>
       </div>
    </div>
  )
}

function QuestionNode({ index, isActive, status, isVisited, onClick }: any) {
  const isAnswered = status === 'answered';
  const isMarked = status === 'marked';
  const isAnsMarked = status === 'answered-marked';
  
  const colorClass = isActive 
    ? "ring-2 ring-orange-500/20 z-10 bg-white text-[#F97316] border-[#F97316] border-2" 
    : isAnswered ? "bg-blue-600 text-white border-blue-600"
    : isMarked ? "bg-pink-500 text-white border-pink-500"
    : isAnsMarked ? "bg-violet-600 text-white border-violet-600"
    : isVisited ? "bg-slate-400 text-white border-slate-400"
    : "bg-white text-slate-400 border-slate-200";

  return (
    <button
      onClick={onClick}
      className={cn(
        "relative w-full aspect-square rounded-full flex items-center justify-center font-black text-[12px] md:text-[14px] transition-all border shadow-sm shrink-0 active:scale-90 md:h-11 md:w-11 mx-auto cursor-pointer",
        colorClass
      )}
    >
      {index + 1}
      {isAnsMarked && (
        <div className="absolute -top-0.5 -right-0.5 h-3 w-3 md:h-3.5 md:w-3.5 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center shadow-md">
           <CheckCircle2 className="h-2 w-2 md:h-2 md:w-2 text-white" />
        </div>
      )}
    </button>
  );
}
