
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
 * @fileOverview Professional CBT Question Palette Hub v13.0.
 * UPDATED: Order swapped - Sections now appear above Status Legend.
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
        <div className="p-3 md:p-6 pt-6 md:pt-8 space-y-6 md:space-y-8 pb-32">
           
           {/* 1. SECTIONAL GRIDS (MOVED TO TOP) */}
           <div className="space-y-6">
              {sections.map(([secId, data]) => (
                <div key={secId} className="space-y-3">
                   <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                      <h4 className="text-[9px] md:text-[10px] font-black text-[#0B1528] tracking-tight uppercase flex items-center gap-2">
                        <ChevronDown className="h-3 w-3 text-primary" /> {data.name}
                      </h4>
                   </div>
                   
                   <div className="grid grid-cols-4 md:grid-cols-5 gap-2">
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

           {/* 2. STATUS SUMMARY HUB (MOVED BELOW) */}
           <div className="space-y-3 pt-4 border-t border-slate-50">
              <p className="text-[9px] font-black uppercase text-slate-400 tracking-[0.2em] ml-1">Legend</p>
              <div className="grid grid-cols-2 gap-2">
                 <SummaryCard count={stats.answered} label="ANSWERED" color="bg-blue-600" />
                 <SummaryCard count={stats.notAnswered} label="NOT ANSWERED" color="bg-slate-400" />
                 <SummaryCard count={stats.marked} label="MARKED" color="bg-pink-500" />
                 <SummaryCard count={stats.notVisited} label="NOT VISITED" color="bg-white" textColor="text-slate-400" border="border-slate-200" />
                 <SummaryCard count={stats.ansMarked} label="ANS & MARKED" color="bg-violet-600" colSpan={2} />
              </div>
           </div>

           {/* 3. TACTICAL SUBMIT BUTTON */}
           <div className="pt-4">
              <Button 
                onClick={(e) => {
                   e.preventDefault();
                   onSubmit();
                }}
                className="w-full h-12 md:h-14 bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase tracking-[0.2em] text-[9px] md:text-[10px] rounded-xl shadow-xl shadow-emerald-900/10 gap-3 group transition-all active:scale-95"
              >
                 <ShieldCheck className="h-4 w-4 group-hover:scale-110 transition-transform" /> SUBMIT TEST
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
      "flex items-center gap-2 p-1.5 rounded-xl bg-slate-50 border border-slate-100 shadow-sm",
      colSpan > 1 && "col-span-2"
    )}>
       <div className={cn("h-6 w-6 rounded-full flex items-center justify-center text-[9px] font-black shrink-0 shadow-sm border", color, textColor, border)}>
          {count}
       </div>
       <div className="min-w-0">
          <span className="text-[8px] md:text-[9px] font-black uppercase text-slate-500 tracking-tighter block leading-tight">{label}</span>
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
        "relative w-full aspect-square rounded-full flex items-center justify-center font-black text-[11px] md:text-[13px] transition-all border shadow-sm shrink-0 active:scale-90 md:h-10 md:w-10 mx-auto cursor-pointer",
        colorClass
      )}
    >
      {index + 1}
      {isAnsMarked && (
        <div className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 md:h-3 md:w-3 bg-emerald-500 rounded-full border border-white flex items-center justify-center shadow-md">
           <CheckCircle2 className="h-1.5 w-1.5 text-white" />
        </div>
      )}
    </button>
  );
}
