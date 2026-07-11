
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
 * @fileOverview Precision Mobile-First Question Hub v47.0.
 * FIXED: Removed forced uppercase from category and solution labels.
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
      showSolution ? "p-0" : "p-4 md:p-10 lg:p-12 rounded-2xl md:rounded-[3rem] shadow-sm",
      className
    )}>
      
      {!showSolution && (
        <div className="flex items-center justify-between mb-6 border-b border-slate-50 pb-4">
           <div className="flex items-center gap-3">
              <span className="font-bold text-[10px] md:text-sm text-white bg-[#0B1228] px-3 py-1 rounded-lg shadow-xl">Q {q.displayId || '1'}</span>
              <div className="flex items-center gap-2 text-slate-400 font-bold text-[9px] md:text-xs tabular-nums bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
                 <Clock className="h-3 w-3 text-primary" />
                 <span>{formatTime(timeLeft)}</span>
              </div>
           </div>
           <div className="flex items-center gap-4 text-slate-300">
              <button className="p-1.5 hover:bg-slate-50 rounded-lg transition-colors"><Bookmark className="h-4 w-4 md:h-5 md:w-5 hover:text-primary transition-colors" /></button>
              <button className="p-1.5 hover:bg-rose-50 rounded-lg transition-colors"><AlertTriangle className="h-4 w-4 md:h-5 md:w-5 hover:text-rose-500 transition-colors" /></button>
           </div>
        </div>
      )}

      <div className={cn("space-y-3 mb-6 px-1", showSolution ? "mb-4" : "mb-8")}>
         {showEn && englishQ && (
           <div className={cn("font-bold text-[#0F172A] antialiased leading-[1.35] md:leading-relaxed break-words", showSolution ? "text-sm md:text-lg" : "text-base md:text-xl lg:text-2xl")}>
             <MathText text={englishQ} />
           </div>
         )}
         {showPa && punjabiQ && (
           <div className={cn("font-bold text-[#0F172A] antialiased leading-[1.35] md:leading-relaxed break-words", showSolution ? "text-sm md:text-lg" : "text-base md:text-xl lg:text-2xl")}>
             <MathText text={punjabiQ} />
           </div>
         )}
         {showHi && hindiQ && (
           <div className={cn("font-bold text-[#0F172A] antialiased leading-[1.35] md:leading-relaxed break-words", showSolution ? "text-sm md:text-lg" : "text-base md:text-xl lg:text-2xl")}>
             <MathText text={hindiQ} />
           </div>
         )}
      </div>

      {!hideOptions && (
        <div className={cn("flex flex-col w-full", showSolution ? "space-y-2" : "space-y-2.5 md:space-y-4")}>
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
                  "flex items-center gap-3 md:gap-5 transition-all border w-full",
                  showSolution 
                    ? `p-3 md:p-6 rounded-xl ${q.correctAnswer === key ? "bg-emerald-50 border-emerald-500 shadow-sm" : isSelected ? "bg-rose-50 border-rose-500" : "bg-white border-slate-100"}`
                    : `p-3 md:p-6 lg:p-8 rounded-xl md:rounded-[2rem] cursor-pointer group/opt active:scale-[0.99] ${isSelected ? "bg-blue-50/50 border-primary ring-2 ring-primary/5 shadow-xl" : "bg-white border-slate-100 hover:border-slate-300 shadow-sm"}`
                )}
              >
                <span className={cn(
                  "font-black shrink-0 w-6 md:w-10 text-center",
                  showSolution ? "text-sm md:text-lg" : "text-sm md:text-2xl lg:text-3xl",
                  isSelected ? "text-primary" : "text-slate-300 group-hover/opt:text-slate-500"
                )}>{key}</span>
                <div className="flex flex-col flex-1 min-w-0 space-y-0.5">
                  {showEn && en && <div className={cn("font-bold leading-snug break-words", showSolution ? "text-[11px] md:text-sm" : "text-xs md:text-lg lg:text-xl", isSelected ? "text-primary" : "text-slate-600")}><MathText text={en} /></div>}
                  {showPa && pa && <div className={cn("font-bold leading-snug break-words", showSolution ? "text-[11px] md:text-sm" : "text-xs md:text-lg lg:text-xl", isSelected ? "text-primary" : "text-slate-600")}><MathText text={pa} /></div>}
                  {showHi && hi && <div className={cn("font-bold leading-snug break-words", showSolution ? "text-[11px] md:text-sm" : "text-xs md:text-lg lg:text-xl", isSelected ? "text-primary" : "text-slate-600")}><MathText text={hi} /></div>}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {showSolution && (
        <div className="mt-6 pt-6 border-t border-slate-100 space-y-4">
           <div className="flex items-center gap-3">
              <Badge className="bg-[#0B1228] text-white border-none font-bold text-[8px] md:text-[10px] px-4 py-1 rounded-xl shadow-lg">Rationale</Badge>
              <div className="h-px flex-1 bg-slate-50" />
           </div>
           <div className="bg-slate-50 p-4 md:p-8 rounded-xl md:rounded-[2.5rem] border border-slate-100 text-slate-500 leading-relaxed font-medium text-[11px] md:text-base space-y-4 shadow-inner">
              <p className="font-bold text-[9px] md:text-[11px] text-[#0B1228] pb-2 border-b border-slate-200/50 flex items-center gap-3">
                 <ShieldCheck className="h-4 w-4 text-emerald-500" /> Official Key: {q.correctAnswer}
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
