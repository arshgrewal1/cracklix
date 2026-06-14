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
 * @fileOverview Institutional CBT Palette Hub v27.0 (Ultra-Minimized).
 * UPDATED: Fully minimized typography, box sizes, and padding for optimal mobile friendliness.
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
      const sid = q.sectionId || 'General Knowledge';
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
        {/* Minimized padding for compact mobile view */}
        <div className="p-3 md:p-8 pt-14 md:pt-20 space-y-4 md:space-y-8 pb-32">
           
           {/* 1. STATUS LEGEND HUB - MINIMIZED BOXES */}
           <div className="grid grid-cols-2 gap-1.5 md:gap-4">
              <SummaryCard count={stats.answered} label="ANSWERED" color="bg-[#1E5EFF]" />
              <SummaryCard count={stats.notAnswered} label="NOT ANS" color="bg-[#94A3B8]" />
              <SummaryCard count={stats.marked} label="MARKED" color="bg-[#F43F5E]" />
              <SummaryCard count={stats.notVisited} label="NOT VISIT" color="bg-white" textColor="text-[#94A3B8]" border="border-slate-100" />
              <SummaryCard count={stats.ansMarked} label="ANS & MARKED" color="bg-[#6366F1]" colSpan={2} />
           </div>

           <div className="h-px w-full bg-slate-100" />

           {/* 2. SECTIONAL GRIDS - MINIMIZED TYPOGRAPHY */}
           <div className="space-y-6 md:space-y-10">
              {sections.map((section, sIdx) => (
                <div key={sIdx} className="space-y-3 md:space-y-6">
                   <div className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 md:h-2 md:w-2 rounded-full bg-[#F97316] shrink-0" />
                      <h4 className="text-[8px] md:text-xs font-[900] uppercase text-[#0F172A] tracking-wider truncate">
                         {section.name}
                      </h4>
                   </div>
                   <div className="grid grid-cols-5 gap-1 md:gap-3">
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
           <div className="pt-4">
              <Button 
                onClick={(e) => {
                   e.preventDefault();
                   onSubmit();
                }}
                className="w-full h-11 md:h-16 bg-[#10B981] hover:bg-[#059669] text-white font-black uppercase tracking-[0.1em] text-[9px] md:text-[11px] rounded-xl md:rounded-2xl shadow-lg border-none transition-all active:scale-95"
              >
                 <ShieldCheck className="h-3.5 w-3.5 md:h-5 md:w-5 mr-1.5" /> SUBMIT TEST
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
      "flex items-center gap-1.5 p-1.5 md:p-4 rounded-lg md:rounded-xl bg-white border border-slate-50 shadow-sm",
      colSpan > 1 && "col-span-2"
    )}>
       <div className={cn("h-5 w-5 md:h-11 md:w-11 rounded-full flex items-center justify-center text-[9px] md:text-lg font-black shrink-0 border-[1px] md:border-[2px] border-white shadow-sm", color, textColor, border)}>
          {count}
       </div>
       <div className="min-w-0">
          <span className="text-[6px] md:text-[10px] font-[900] uppercase text-slate-500 tracking-tighter block leading-none truncate">{label}</span>
       </div>
    </div>
  )
}

function QuestionNode({ index, isActive, status, isVisited, onClick }: any) {
  const isAnswered = status === 'answered';
  const isMarked = status === 'marked';
  const isAnsMarked = status === 'answered-marked';
  
  const colorClass = isActive 
    ? "bg-white text-[#F97316] border-[#F97316] border-[1.5px] md:border-[3px] shadow-md scale-105 z-10" 
    : isAnswered ? "bg-[#1E5EFF] text-white border-transparent"
    : isMarked ? "bg-[#F43F5E] text-white border-transparent"
    : isAnsMarked ? "bg-[#6366F1] text-white border-transparent"
    : isVisited ? "bg-[#94A3B8] text-white border-transparent"
    : "bg-white text-[#94A3B8] border-slate-50";

  return (
    <button
      onClick={onClick}
      className={cn(
        "relative aspect-square rounded-md md:rounded-xl flex items-center justify-center font-black text-[11px] md:text-[18px] transition-all border shrink-0 active:scale-90 w-full cursor-pointer",
        colorClass
      )}
    >
      {index + 1}
      {isAnsMarked && (
        <div className="absolute -top-0.5 -right-0.5 h-2 w-2 md:h-4 md:w-4 bg-emerald-500 rounded-full border border-white flex items-center justify-center">
           <CheckCircle2 className="h-1 w-1 md:h-2.5 md:w-2.5 text-white" />
        </div>
      )}
    </button>
  );
}
