'use client';

import React from 'react';
import { Question, LanguageDisplayMode } from '@/types';
import { cn } from '@/lib/utils';
import MathText from './MathText';
import { Clock, AlertTriangle, Bookmark, ShieldCheck } from 'lucide-react';
import { useExamStore } from '@/store/useExamStore';
import { Badge } from '@/components/ui/badge';

interface QuestionRendererProps {
  question: Partial<Question> & { displayId?: string };
  language: LanguageDisplayMode | 'en' | 'pa' | 'hi' | 'bilingual' | string;
  showSolution?: boolean;
  hideOptions?: boolean;
  selectedAnswer?: number | null; 
  onSelect?: (index: number) => void;
  className?: string;
}

/**
 * @fileOverview Precision Mobile-First Question Hub v45.0 (Production Hardened).
 * FIXED: Prop alignment for selectedAnswer to strictly handle number | null, matching global store logic.
 */
export default function QuestionRenderer({ 
  question, 
  language = 'ENGLISH_PUNJABI',
  showSolution = false,
  hideOptions = false,
  selectedAnswer,
  onSelect,
  className
}: QuestionRendererProps) {
  const timeLeft = useExamStore(s => s.timeLeft);
  
  if (!question) return null;

  const q = question as any;
  const normalizedLang = (language || 'ENGLISH_PUNJABI').toUpperCase();
  
  const sectionName = (q.sectionId || "").toUpperCase();
  const subjectId = (q.subjectId || "").toUpperCase();
  
  let renderLang = normalizedLang;
  
  if (sectionName.includes("ENGLISH") || subjectId.includes("ENGLISH")) {
    renderLang = "ENGLISH";
  } else if (sectionName.includes("PUNJABI") || sectionName.includes("ਪੰਜਾਬੀ") || subjectId.includes("PUNJABI")) {
    renderLang = "PUNJABI";
  } else if (sectionName.includes("HINDI") || sectionName.includes("हिन्दी") || subjectId.includes("HINDI")) {
    renderLang = "HINDI";
  }
  
  const showEn = renderLang.includes('ENGLISH');
  const showPa = renderLang.includes('PUNJABI');
  const showHi = renderLang.includes('HINDI');
  
  const formatTime = (seconds: number) => {
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const englishQ = q.englishQuestion || q.questionEn || q.questionText || "";
  const punjabiQ = q.punjabiQuestion || q.questionPa || "";
  const hindiQ = q.hindiQuestion || q.questionHi || "";
  
  const OPT_LABELS = ['A', 'B', 'C', 'D'];

  return (
    <div className={cn(
      "w-full text-left font-body bg-white text-[#0F172A] flex flex-col select-none max-w-full",
      showSolution ? "p-0" : "p-5 md:p-12 lg:p-16 rounded-[2rem] md:rounded-[3.5rem] shadow-sm",
      className
    )}>
      
      {!showSolution && (
        <div className="flex items-center justify-between mb-8 border-b border-slate-50 pb-5">
           <div className="flex items-center gap-3">
              <span className="font-black text-[10px] md:text-base lg:text-lg text-white bg-[#0B1528] px-3.5 py-1.5 rounded-xl shadow-2xl">Q {q.displayId || '1'}</span>
              <div className="flex items-center gap-2 text-slate-400 font-black text-[9px] md:text-sm tabular-nums bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                 <Clock className="h-4 w-4 text-primary" />
                 <span>{formatTime(timeLeft)}</span>
              </div>
           </div>
           <div className="flex items-center gap-4 text-slate-300">
              <button className="p-2 hover:bg-slate-50 rounded-lg transition-colors"><Bookmark className="h-5 w-5 md:h-6 md:w-6 hover:text-primary transition-colors" /></button>
              <button className="p-2 hover:bg-rose-50 rounded-lg transition-colors"><AlertTriangle className="h-5 w-5 md:h-6 md:w-6 hover:text-rose-500 transition-colors" /></button>
           </div>
        </div>
      )}

      <div className={cn("space-y-4 mb-8 px-1", showSolution ? "mb-6" : "mb-10")}>
         {showEn && englishQ && (
           <div className={cn("font-bold text-[#0F172A] antialiased leading-[1.4] md:leading-relaxed break-words", showSolution ? "text-[14px] md:text-lg" : "text-[16px] sm:text-lg md:text-2xl lg:text-3xl")}>
             <MathText text={englishQ} />
           </div>
         )}
         {showPa && punjabiQ && (
           <div className={cn("font-bold text-[#0F172A] antialiased leading-[1.4] md:leading-relaxed break-words", showSolution ? "text-[14px] md:text-lg" : "text-[16px] sm:text-lg md:text-2xl lg:text-3xl")}>
             <MathText text={punjabiQ} />
           </div>
         )}
         {showHi && hindiQ && (
           <div className={cn("font-bold text-[#0F172A] antialiased leading-[1.4] md:leading-relaxed break-words", showSolution ? "text-[14px] md:text-lg" : "text-[16px] sm:text-lg md:text-2xl lg:text-3xl")}>
             <MathText text={hindiQ} />
           </div>
         )}
      </div>

      {!hideOptions && (
        <div className={cn("flex flex-col w-full", showSolution ? "space-y-2" : "space-y-3 md:space-y-4")}>
          {OPT_LABELS.map((key, idx) => {
            const en = q[`option${key}English`];
            const pa = q[`option${key}Punjabi`];
            const hi = q[`option${key}Hindi`];
            const isSelected = selectedAnswer === idx;
            
            return (
              <div 
                key={key} 
                onClick={() => !showSolution && onSelect?.(idx)} 
                className={cn(
                  "flex items-center gap-4 transition-all border w-full",
                  showSolution 
                    ? `p-3 md:p-6 rounded-xl ${q.correctAnswer === key ? "bg-emerald-50 border-emerald-500 shadow-sm" : isSelected ? "bg-rose-50 border-rose-500" : "bg-white border-slate-100"}`
                    : `p-4 md:p-8 rounded-[1.5rem] md:rounded-[2rem] cursor-pointer group/opt active:scale-[0.98] ${isSelected ? "bg-blue-50/50 border-primary ring-4 ring-primary/5 shadow-2xl" : "bg-white border-slate-100 hover:border-slate-300 shadow-sm"}`
                )}
              >
                <span className={cn(
                  "font-black shrink-0 w-8 md:w-12 text-center",
                  showSolution ? "text-sm md:text-xl" : "text-base md:text-3xl lg:text-4xl",
                  isSelected ? "text-primary" : "text-slate-300 group-hover/opt:text-slate-500"
                )}>{key}</span>
                <div className="flex flex-col flex-1 min-w-0 space-y-1">
                  {showEn && en && <div className={cn("font-bold leading-tight break-words", showSolution ? "text-[12px] md:text-base" : "text-[14px] md:text-xl lg:text-2xl", isSelected ? "text-primary" : "text-slate-600")}><MathText text={en} /></div>}
                  {showPa && pa && <div className={cn("font-bold leading-tight break-words", showSolution ? "text-[12px] md:text-base" : "text-[14px] md:text-xl lg:text-2xl", isSelected ? "text-primary" : "text-slate-600")}><MathText text={pa} /></div>}
                  {showHi && hi && <div className={cn("font-bold leading-tight break-words", showSolution ? "text-[12px] md:text-base" : "text-[14px] md:text-xl lg:text-2xl", isSelected ? "text-primary" : "text-slate-600")}><MathText text={hi} /></div>}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {showSolution && (
        <div className="mt-8 pt-8 border-t border-slate-100 space-y-4">
           <div className="flex items-center gap-3">
              <Badge className="bg-[#0F172A] text-white border-none font-black text-[8px] md:text-[10px] uppercase px-4 py-1 rounded-xl tracking-widest shadow-lg">RATIONALE</Badge>
              <div className="h-px flex-1 bg-slate-50" />
           </div>
           <div className="bg-slate-50 p-5 md:p-10 rounded-[1.5rem] md:rounded-[2.5rem] border border-slate-100 text-slate-500 leading-relaxed font-medium text-[12px] md:text-lg space-y-4 shadow-inner">
              <p className="font-black text-[10px] md:text-[12px] uppercase text-[#0B1528] pb-3 border-b border-slate-200/50 flex items-center gap-3">
                 <ShieldCheck className="h-4 w-4 md:h-5 md:w-5 text-emerald-500" /> OFFICIAL KEY: {q.correctAnswer}
              </p>
              <div className="space-y-4">
                {showEn && q.englishExplanation && <MathText text={q.englishExplanation} className="text-inherit" />}
                {showPa && q.punjabiExplanation && <MathText text={q.punjabiExplanation} className="text-inherit" />}
                {showHi && q.hindiExplanation && <MathText text={q.hindiExplanation} className="text-inherit" />}
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
