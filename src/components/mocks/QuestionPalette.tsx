'use client';

import React, { useMemo } from "react";
import { cn } from "@/lib/utils";
import { 
  Zap,
  CheckCircle2,
  ShieldCheck
} from "lucide-react";
import { useExamStore } from '@/store/useExamStore';
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Question } from "@/types";

interface QuestionPaletteProps {
  onSelect: (index: number) => void;
  onSubmit: () => void;
}

/**
 * @fileOverview Institutional CBT Palette Hub v42.0.
 * UPDATED: Increased legend circle size and label text.
 * UPDATED: Decreased grid box size for a balanced high-density look.
 */
export default function QuestionPalette({ onSelect, onSubmit }: QuestionPaletteProps) {
  const questions = useExamStore(s => s.questions);
  const status = useExamStore(s => s.status);
  const currentIdx = useExamStore(s => s.currentIdx);
  const visited = useExamStore(s => s.visited);

  // Status Aggregation
  const stats = useMemo(() => {
    const s = { answered: 0, marked: 0, notAnswered: 0, notVisited: 0, ansMarked: 0 };
    (questions || []).forEach((_: Question, i: number) => {
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
    
    questions.forEach((q: Question, idx: number) => {
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
        <div className="p-3 md:p-4 pt-12 md:pt-14 space-y-4 md:space-y-6 pb-32">
           
           {/* 1. STATUS LEGEND HUB - INCREASED TEXT & CIRCLES */}
           <div className="grid grid-cols-2 gap-2">
              <SummaryCard count={stats.answered} label="ANSWERED" color="bg-[#1E5EFF]" />
              <SummaryCard count={stats.notAnswered} label="NOT ANSWERED" color="bg-[#94A3B8]" />
              <SummaryCard count={stats.marked} label="MARKED" color="bg-[#F43F5E]" />
              <SummaryCard count={stats.notVisited} label="NOT VISITED" color="bg-white" textColor="text-[#94A3B8]" border="border-slate-100" />
              <SummaryCard count={stats.ansMarked} label="ANS & MARKED" color="bg-[#6366F1]" colSpan={2} />
           </div>

           <div className="h-px w-full bg-slate-100" />

           {/* 2. SECTIONAL GRIDS - COMPACT BOXES */}
           <div className="space-y-4">
              {sections.map((section, sIdx) => (
                <div key={sIdx} className="space-y-2">
                   <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">
                      {section.name}
                   </h4>
                   <div className="grid grid-cols-5 gap-1.5 md:gap-2">
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

           {/* 3. SUBMIT NODE */}
           <div className="pt-4">
              <Button 
                onClick={(e) => {
                   e.preventDefault();
                   onSubmit();
                }}
                className="w-full h-11 bg-[#10B981] hover:bg-[#059669] text-white font-black uppercase tracking-widest text-[10px] rounded-xl shadow-md border-none transition-all active:scale-95"
              >
                 FINISH TEST
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
      "flex items-center gap-2.5 p-2 rounded-xl bg-white border border-slate-50 shadow-sm",
      colSpan > 1 && "col-span-2"
    )}>
       <div className={cn("h-6 w-6 md:h-8 md:w-8 rounded-full flex items-center justify-center text-[10px] md:text-sm font-black shrink-0 border-[2px] border-white shadow-sm", color, textColor, border)}>
          {count}
       </div>
       <div className="min-w-0">
          <span className="text-[7px] md:text-[8px] font-black uppercase text-slate-500 tracking-tight block leading-none truncate">{label}</span>
       </div>
    </div>
  )
}

function QuestionNode({ index, isActive, status, isVisited, onClick }: any) {
  const isAnswered = status === 'answered';
  const isMarked = status === 'marked';
  const isAnsMarked = status === 'answered-marked';
  
  const colorClass = isActive 
    ? "bg-white text-[#F97316] border-[#F97316] border-[2px] shadow-lg z-10 scale-105" 
    : isAnswered ? "bg-[#1E5EFF] text-white border-transparent"
    : isMarked ? "bg-[#F43F5E] text-white border-transparent"
    : isAnsMarked ? "bg-[#6366F1] text-white border-transparent"
    : isVisited ? "bg-[#94A3B8] text-white border-transparent"
    : "bg-white text-slate-300 border-slate-50";

  return (
    <button
      onClick={onClick}
      className={cn(
        "relative aspect-square rounded-lg flex items-center justify-center font-black text-[9px] transition-all border shrink-0 active:scale-90 w-full cursor-pointer shadow-sm",
        colorClass
      )}
    >
      {index + 1}
    </button>
  );
}