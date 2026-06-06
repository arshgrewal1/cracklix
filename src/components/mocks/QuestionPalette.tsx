
'use client';

import React, { useMemo } from "react";
import { cn } from "@/lib/utils";
import { 
  CheckCircle2, 
  ShieldCheck
} from "lucide-react";
import { useExamStore } from '@/store/useExamStore';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

/**
 * @fileOverview Professional CBT Question Palette Hub v3.0.
 * Strictly mirrors the provided screenshot for status summary and colors.
 */
export default function QuestionPalette({ onSelect }: { onSelect: (index: number) => void }) {
  const { questions, status, currentIdx, visited } = useExamStore();

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
    const map: Record<string, { name: string, questions: number[] }> = {};
    
    (questions || []).forEach((q, idx) => {
      const sectionId = String(q.sectionId || 'General');
      if (!map[sectionId]) {
        map[sectionId] = {
          name: sectionId.replace(/-/g, ' ').toUpperCase(),
          questions: []
        };
      }
      map[sectionId].questions.push(idx);
    });
    
    return Object.entries(map);
  }, [questions]);

  return (
    <div className="flex flex-col h-full bg-white border-l border-slate-200 text-left font-body select-none">
      
      {/* 1. STATUS SUMMARY HUB (Mirroring Screenshot) */}
      <div className="p-5 bg-white shrink-0 border-b border-slate-100 shadow-sm">
         <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] mb-5 ml-1">Question Status</p>
         <div className="grid grid-cols-2 gap-3">
            <SummaryItem count={stats.answered} label="ANSWERED" color="bg-blue-600" />
            <SummaryItem count={stats.notAnswered} label="NOT ANSWERED" color="bg-slate-400" />
            <SummaryItem count={stats.marked} label="MARKED" color="bg-pink-500" />
            <SummaryItem count={stats.notVisited} label="NOT VISITED" color="bg-slate-100" textColor="text-slate-400" />
            <SummaryItem count={stats.ansMarked} label="ANS & MARKED" color="bg-violet-600" colSpan={2} />
         </div>
      </div>

      {/* 2. SECTION-WISE SCROLLABLE GRID */}
      <ScrollArea className="flex-1 bg-slate-50/20">
        <div className="p-5 space-y-8">
           {sections.map(([secId, data]) => (
             <div key={secId} className="space-y-5">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                   <h4 className="text-[11px] font-black text-[#0B1528] tracking-widest uppercase">{data.name}</h4>
                   <Badge variant="secondary" className="text-[9px] font-bold uppercase bg-white border border-slate-100 text-slate-400 px-2">{data.questions.length} Qs</Badge>
                </div>
                
                <div className="grid grid-cols-5 gap-3">
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
      </ScrollArea>

      {/* 3. SUBMIT HUB (Emerald Green) */}
      <div className="p-5 border-t border-slate-100 bg-white shrink-0 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
         <Button className="w-full h-14 bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase tracking-[0.2em] text-[10px] rounded-xl shadow-xl shadow-emerald-900/10 gap-3 group transition-all">
            <ShieldCheck className="h-4 w-4 group-hover:scale-110 transition-transform" /> SUBMIT FINAL ASSESSMENT
         </Button>
      </div>
    </div>
  );
}

function SummaryItem({ count, label, color, textColor = "text-white", colSpan = 1 }: any) {
  return (
    <div className={cn("flex items-center gap-3 p-3 rounded-2xl bg-white border border-slate-100 shadow-sm", colSpan > 1 && "col-span-2")}>
       <div className={cn("h-7 w-7 rounded-full flex items-center justify-center text-[11px] font-black shrink-0 shadow-md", color, textColor)}>
          {count}
       </div>
       <span className="text-[9px] font-black uppercase text-slate-500 tracking-tighter truncate">{label}</span>
    </div>
  )
}

function QuestionNode({ index, isActive, status, isVisited, onClick }: any) {
  const isAnswered = status === 'answered';
  const isMarked = status === 'marked';
  const isAnsMarked = status === 'answered-marked';
  
  const colorClass = isActive 
    ? "ring-4 ring-orange-500/20 z-10 bg-white text-orange-500 border-orange-500 border-2" 
    : isAnswered ? "bg-blue-600 text-white border-blue-600"
    : isMarked ? "bg-pink-500 text-white border-pink-500"
    : isAnsMarked ? "bg-violet-600 text-white border-violet-600"
    : isVisited ? "bg-slate-400 text-white border-slate-400"
    : "bg-white text-slate-300 border-slate-200";

  return (
    <button
      onClick={onClick}
      className={cn(
        "relative w-full aspect-square rounded-full flex items-center justify-center font-black text-[13px] transition-all border shadow-sm shrink-0 active:scale-90 hover:opacity-90",
        colorClass
      )}
    >
      {index + 1}
      {isAnsMarked && (
        <div className="absolute -top-1 -right-1 h-4 w-4 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center shadow-md">
           <CheckCircle2 className="h-2.5 w-2.5 text-white" />
        </div>
      )}
    </button>
  );
}
