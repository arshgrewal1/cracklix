
'use client';

import React, { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { 
  LayoutGrid, 
  List, 
  ChevronDown, 
  CheckCircle2, 
  Clock, 
  HelpCircle, 
  Bookmark, 
  AlertCircle,
  ChevronRight,
  ShieldCheck,
  Info,
  BookOpen
} from "lucide-react";
import { useExamStore } from '@/store/useExamStore';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

/**
 * @fileOverview Professional CBT Question Palette Hub.
 * Grouped by actual Section Names instead of Parts.
 */
export default function QuestionPalette({ onSelect }: { onSelect: (index: number) => void }) {
  const { questions, status, currentIdx, visited, mockTitle } = useExamStore();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

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

  // Group by Section Name
  const sections = useMemo(() => {
    const map: Record<string, { name: string, questions: { q: any, idx: number }[] }> = {};
    
    questions.forEach((q, idx) => {
      const sectionId = q.sectionId || 'General';
      if (!map[sectionId]) {
        map[sectionId] = {
          name: sectionId.replace(/-/g, ' ').toUpperCase(),
          questions: []
        };
      }
      map[sectionId].questions.push({ q, idx });
    });
    
    return map;
  }, [questions]);

  return (
    <div className="flex flex-col h-full bg-white border-l border-slate-200 text-left font-body select-none">
      
      {/* TABS HUB */}
      <div className="flex border-b border-slate-100 shrink-0 bg-slate-50/50">
         <button 
           onClick={() => setViewMode('grid')} 
           className={cn(
             "flex-1 h-14 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest border-b-2 transition-all", 
             viewMode === 'grid' ? "border-[#F97316] text-[#F97316] bg-white shadow-sm" : "border-transparent text-slate-400 hover:text-slate-600"
           )}
         >
            <LayoutGrid className="h-4 w-4" /> GRID VIEW
         </button>
         <button 
           onClick={() => setViewMode('list')} 
           className={cn(
             "flex-1 h-14 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest border-b-2 transition-all", 
             viewMode === 'list' ? "border-[#F97316] text-[#F97316] bg-white shadow-sm" : "border-transparent text-slate-400 hover:text-slate-600"
           )}
         >
            <List className="h-4 w-4" /> LIST VIEW
         </button>
      </div>

      {/* DYNAMIC LEGEND HUB */}
      <div className="p-4 grid grid-cols-2 gap-2 bg-white shrink-0 border-b border-slate-100 shadow-sm">
         <LegendItem count={stats.answered} label="Answered" color="bg-blue-600" />
         <LegendItem count={stats.notAnswered} label="Not Answered" color="bg-slate-400" />
         <LegendItem count={stats.marked} label="Marked" color="bg-pink-500" />
         <LegendItem count={stats.notVisited} label="Not Visited" color="bg-white border-slate-200" textColor="text-slate-300" />
         <LegendItem count={stats.ansMarked} label="Ans & Marked" color="bg-violet-600" colSpan={2} />
      </div>

      {/* SECTIONAL CONTENT */}
      <ScrollArea className="flex-1 bg-slate-50/30">
        <div className="p-4 space-y-4">
           <Accordion type="multiple" defaultValue={Object.keys(sections)} className="space-y-3">
              {Object.entries(sections).map(([secId, data]) => (
                <AccordionItem key={secId} value={secId} className="border-none bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                  <AccordionTrigger className="px-5 py-4 hover:no-underline group">
                     <div className="flex items-center justify-between w-full pr-4 text-left">
                        <span className="text-[10px] font-black text-[#0B1528] tracking-tight uppercase">{data.name}</span>
                        <Badge variant="secondary" className="text-[9px] font-bold uppercase bg-slate-100 text-slate-400 px-2">{data.questions.length} Qs</Badge>
                     </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-5 pb-5 pt-2">
                    {viewMode === 'grid' ? (
                      <div className="grid grid-cols-5 gap-2.5">
                        {data.questions.map(({ idx }) => (
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
                    ) : (
                      <div className="space-y-2">
                         {data.questions.map(({ q, idx }) => (
                           <QuestionCard 
                             key={idx}
                             q={q}
                             idx={idx}
                             isActive={currentIdx === idx}
                             status={status[idx]}
                             onClick={() => onSelect(idx)}
                           />
                         ))}
                      </div>
                    )}
                  </AccordionContent>
                </AccordionItem>
              ))}
           </Accordion>
        </div>
      </ScrollArea>

      <div className="p-4 border-t border-slate-100 bg-white shrink-0">
         <div className="flex items-center justify-between mb-4 px-2">
            <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Section Complete</span>
            <span className="text-[10px] font-black text-[#0F172A]">0%</span>
         </div>
         <Button className="w-full h-14 bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase tracking-[0.2em] text-[11px] rounded-xl shadow-xl shadow-emerald-900/10 gap-3">
            <ShieldCheck className="h-5 w-5" /> SUBMIT FINAL ASSESSMENT
         </Button>
      </div>
    </div>
  );
}

/**
 * @section Sub-Components
 */

function LegendItem({ count, label, color, textColor = "text-white", colSpan = 1 }: any) {
  return (
    <div className={cn("flex items-center gap-3 p-2 rounded-xl bg-slate-50 border border-slate-100", colSpan > 1 && "col-span-2")}>
       <div className={cn("h-6 w-6 rounded-md flex items-center justify-center text-[10px] font-black shrink-0 shadow-sm", color, textColor)}>
          {count}
       </div>
       <span className="text-[9px] font-black uppercase text-slate-500 tracking-tighter truncate">{label}</span>
    </div>
  )
}

function QuestionNode({ index, isActive, status, isVisited, onClick }: any) {
  const colorClass = isActive 
    ? "ring-2 ring-offset-2 ring-[#F97316] z-10 bg-white text-[#F97316]" 
    : status === 'answered' ? "bg-blue-600 text-white border-blue-600"
    : status === 'marked' ? "bg-pink-500 text-white border-pink-500"
    : status === 'answered-marked' ? "bg-violet-600 text-white border-violet-600"
    : isVisited ? "bg-slate-400 text-white border-slate-400"
    : "bg-white text-slate-300 border-slate-200";

  return (
    <button
      onClick={onClick}
      className={cn(
        "relative w-full aspect-square rounded-full flex items-center justify-center font-black text-[11px] transition-all border shrink-0",
        colorClass
      )}
    >
      {index + 1}
      {status === 'answered-marked' && (
        <div className="absolute -top-1 -right-1 h-3.5 w-3.5 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center">
           <CheckCircle2 className="h-2 w-2 text-white" />
        </div>
      )}
    </button>
  );
}

function QuestionCard({ q, idx, isActive, status, onClick }: any) {
  const snippet = q.englishQuestion ? q.englishQuestion.substring(0, 80) + '...' : 'Logic Node';
  
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full p-4 rounded-xl border text-left transition-all group flex items-start gap-4",
        isActive ? "bg-orange-50 border-[#F97316] shadow-md" : "bg-slate-50 border-slate-100 hover:border-slate-300"
      )}
    >
      <span className={cn(
        "h-8 w-8 rounded-lg flex items-center justify-center text-[10px] font-black shrink-0 shadow-sm",
        isActive ? "bg-[#F97316] text-white" : "bg-white text-slate-400"
      )}>
        {idx + 1}
      </span>
      <div className="flex-1 min-w-0 space-y-2">
         <p className={cn("text-[11px] font-bold leading-snug truncate", isActive ? "text-[#0B1528]" : "text-slate-500")}>
            {snippet}
         </p>
         <div className="flex items-center justify-between">
            <span className={cn(
              "text-[8px] font-black uppercase tracking-widest",
              status === 'answered' ? "text-blue-600" :
              status === 'marked' ? "text-pink-500" :
              status === 'answered-marked' ? "text-violet-600" :
              "text-slate-400"
            )}>
              {status?.replace('-', ' ') || 'Not Visited'}
            </span>
            <ChevronRight className="h-3 w-3 text-slate-300 group-hover:translate-x-1 transition-transform" />
         </div>
      </div>
    </button>
  );
}
