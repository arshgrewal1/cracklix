'use client';

import React, { useMemo } from "react";
import { cn } from "@/lib/utils";
import { 
  CheckCircle2, 
  ShieldCheck,
  LayoutGrid
} from "lucide-react";
import { useExamStore } from '@/store/useExamStore';
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

interface QuestionPaletteProps {
  onSelect: (index: number) => void;
  onSubmit: () => void;
}

/**
 * @fileOverview Institutional CBT Palette Hub v28.0 (Absolute Minimum).
 * UPDATED: Ultra-shrunk components for maximum mobile density.
 */
export default function QuestionPalette({ onSelect, onSubmit }: QuestionPaletteProps) {
  const questions = useExamStore(s => s.questions);
  const status = useExamStore(s => s.status);
  const currentIdx = useExamStore(s => s.currentIdx);
  const visited = useExamStore(s => s.visited);

  // Status Aggregation
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

  // Group Questions by Section
  const sections = useMemo(() => {
    const groups: Record<string, { name: string, questions: any[] }> = {};
    
    questions.forEach((q, idx) => {
      const sid = q.sectionId || 'General';
      if (!groups[sid]) {
        groups[sid] = { name: sid.toUpperCase(), questions: [] };
      }
      groups[sid].questions.push({ ...q, globalIdx: idx });
    });
    
    return Object.values(groups);
  }, [questions]);

  return (
    <div className="flex flex-col h-full bg-white text-left font-body select-none pointer-events-auto overflow-hidden">
      <ScrollArea className="h-full">
        <div className="p-2 md:p-6 pt-12 md:pt-16 space-y-3 md:space-y-6 pb-32">
           
           {/* 1. STATUS LEGEND HUB - ABSOLUTE MINIMUM */}
           <div className="grid grid-cols-2 gap-1 md:gap-3">
              <SummaryCard count={stats.answered} label="ANSWERED" color="bg-[#1E5EFF]" />
              <SummaryCard count={stats.notAnswered} label="NOT ANS" color="bg-[#94A3B8]" />
              <SummaryCard count={stats.marked} label="MARKED" color="bg-[#F43F5E]" />
              <SummaryCard count={stats.notVisited} label="NOT VISIT" color="bg-white" textColor="text-[#94A3B8]" border="border-slate-100" />
              <SummaryCard count={stats.ansMarked} label="ANS & MARKED" color="bg-[#6366F1]" colSpan={2} />
           </div>

           <div className="h-px w-full bg-slate-50" />

           {/* 2. SECTIONAL GRIDS */}
           <div className="space-y-4 md:space-y-8">
              {sections.map((section, sIdx) => (
                <div key={sIdx} className="space-y-2 md:space-y-4">
                   <h4 className="text-[7px] md:text-xs font-[900] uppercase text-slate-400 tracking-wider truncate pl-1">
                      {section.name}
                   </h4>
                   <div className="grid grid-cols-5 gap-1 md:gap-2">
                      {section.questions.map((q) => (
                         <QuestionNode 
                           key={q.globalIdx} 
                           index={q.globalIdx} 
                           isActive={currentIdx === q.globalIdx} 
                           status={status[q.globalIdx]} 
                           isVisited={visited.includes(q.globalIdx)}
                           onClick={() => onSelect(q.globalIdx)}
                         />
                      ))}
                   </div>
                </div>
              ))}
           </div>

           {/* 3. SUBMIT NODE - COMPACT */}
           <div className="pt-2">
              <Button 
                onClick={(e) => {
                   e.preventDefault();
                   onSubmit();
                }}
                className="w-full h-9 md:h-12 bg-[#10B981] hover:bg-[#059669] text-white font-black uppercase tracking-tight text-[8px] md:text-[10px] rounded-lg shadow-md border-none transition-all active:scale-95"
              >
                 SUBMIT TEST
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
      "flex items-center gap-1 p-1 md:p-3 rounded-md md:rounded-lg bg-white border border-slate-50 shadow-sm",
      colSpan > 1 && "col-span-2"
    )}>
       <div className={cn("h-5 w-5 md:h-8 md:w-8 rounded-full flex items-center justify-center text-[8px] md:text-sm font-black shrink-0 border-[1px] border-white shadow-sm", color, textColor, border)}>
          {count}
       </div>
       <div className="min-w-0">
          <span className="text-[5px] md:text-[8px] font-black uppercase text-slate-400 tracking-tighter block leading-none truncate">{label}</span>
       </div>
    </div>
  )
}

function QuestionNode({ index, isActive, status, isVisited, onClick }: any) {
  const isAnswered = status === 'answered';
  const isMarked = status === 'marked';
  const isAnsMarked = status === 'answered-marked';
  
  const colorClass = isActive 
    ? "bg-white text-[#F97316] border-[#F97316] border-[1px] md:border-[2px] shadow-sm z-10" 
    : isAnswered ? "bg-[#1E5EFF] text-white border-transparent"
    : isMarked ? "bg-[#F43F5E] text-white border-transparent"
    : isAnsMarked ? "bg-[#6366F1] text-white border-transparent"
    : isVisited ? "bg-[#94A3B8] text-white border-transparent"
    : "bg-white text-slate-300 border-slate-50";

  return (
    <button
      onClick={onClick}
      className={cn(
        "relative aspect-square rounded-sm md:rounded-md flex items-center justify-center font-black text-[9px] md:text-base transition-all border shrink-0 active:scale-90 w-full cursor-pointer",
        colorClass
      )}
    >
      {index + 1}
    </button>
  );
}
