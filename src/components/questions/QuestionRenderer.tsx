'use client';

import React from 'react';
import { Question, LanguageDisplayMode } from '@/types';
import { cn } from '@/lib/utils';
import MathText from './MathText';
import { Clock, AlertTriangle, Bookmark, ShieldCheck, Info } from 'lucide-react';
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
 * @fileOverview Precision Bilingual Question Hub v58.0.
 * FIXED: Unified Authority Black (#0F172A) for all scripts.
 * FIXED: Removed forced uppercase from solution headers for Title Case standard.
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
      showSolution ? "p-0" : "p-4 md:p-10 lg:p-12 rounded-[2rem] md:rounded-[3rem] shadow-sm",
      className
    )}>
      
      {!showSolution && (
        <div className="flex items-center justify-between mb-8 border-b border-slate-50 pb-5">
           <div className="flex items-center gap-3">
              <span className="font-black text-[11px] md:text-sm text-white bg-[#0F172A] px-4 py-1.5 rounded-full shadow-lg">Q {q.displayId || '1'}</span>
              <div className="flex items-center gap-2 text-[#0F172A] font-bold text-[10px] md:text-xs tabular-nums bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                 <Clock className="h-3.5 w-3.5 text-primary" />
                 <span>{formatTime(timeLeft)}</span>
              </div>
           </div>
           <div className="flex items-center gap-2">
              <button className="p-2 text-slate-300 hover:text-primary transition-all"><Bookmark className="h-5 w-5" /></button>
              <button className="p-2 text-slate-300 hover:text-rose-500 transition-all"><AlertTriangle className="h-5 w-5" /></button>
           </div>
        </div>
      )}

      {/* QUESTION STATEMENTS */}
      <div className={cn("space-y-4 px-1", showSolution ? "mb-6" : "mb-10")}>
         {showEn && englishQ && (
           <div className={cn("font-[800] text-[#0F172A] antialiased leading-snug md:leading-relaxed break-words", showSolution ? "text-base md:text-xl" : "text-[18px] md:text-3xl")}>
             <MathText text={englishQ} />
           </div>
         )}
         {(showPa && punjabiQ) ? (
           <div className={cn("font-bold text-[#0F172A] antialiased leading-snug md:leading-relaxed break-words", showSolution ? "text-sm md:text-lg" : "text-base md:text-2xl")}>
             <MathText text={punjabiQ} />
           </div>
         ) : (showHi && hindiQ) ? (
           <div className={cn("font-bold text-[#0F172A] antialiased leading-snug md:leading-relaxed break-words", showSolution ? "text-sm md:text-lg" : "text-base md:text-2xl")}>
             <MathText text={hindiQ} />
           </div>
         ) : null}
      </div>

      {/* OPTIONS MATRIX */}
      {!hideOptions && (
        <div className={cn("flex flex-col w-full", showSolution ? "space-y-3" : "space-y-3 md:space-y-5")}>
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
                  "flex items-center gap-4 md:gap-6 transition-all border w-full",
                  showSolution 
                    ? `p-4 md:p-8 rounded-[1.25rem] md:rounded-[2rem] ${q.correctAnswer === key ? "bg-emerald-50 border-emerald-500 shadow-sm" : isSelected ? "bg-rose-50 border-rose-500" : "bg-white border-slate-100"}`
                    : `p-4 md:p-8 rounded-[1.25rem] md:rounded-[2.5rem] cursor-pointer group/opt active:scale-[0.98] ${isSelected ? "bg-blue-50/50 border-primary ring-2 ring-primary/5 shadow-xl" : "bg-white border-slate-100 hover:border-slate-300 shadow-sm"}`
                )}
              >
                <span className={cn(
                  "font-black shrink-0 w-8 md:w-12 text-center transition-colors",
                  showSolution ? "text-base md:text-xl" : "text-sm md:text-3xl",
                  isSelected ? "text-primary" : "text-slate-300 group-hover/opt:text-slate-400"
                )}>{key}</span>
                
                <div className="flex flex-col flex-1 min-w-0 space-y-1">
                  {showEn && en && (
                    <div className={cn("font-bold leading-tight break-words", showSolution ? "text-sm md:text-base" : "text-[15px] md:text-2xl", isSelected ? "text-primary" : "text-[#0F172A]")}>
                      <MathText text={en} />
                    </div>
                  )}
                  {showPa && pa && (
                    <div className={cn("font-bold leading-tight break-words text-[#0F172A]", showSolution ? "text-[11px] md:text-sm" : "text-[13px] md:text-xl")}>
                      <MathText text={pa} />
                    </div>
                  )}
                  {showHi && hi && (
                    <div className={cn("font-bold leading-tight break-words text-[#0F172A]", showSolution ? "text-[11px] md:text-sm" : "text-[13px] md:text-xl")}>
                      <MathText text={hi} />
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* UNIFIED SOLUTION HUB - INDUSTRIAL STANDARD */}
      {showSolution && (
        <div className="mt-10 border border-slate-100 rounded-[2.5rem] md:rounded-[3.5rem] overflow-hidden bg-slate-50/50 shadow-2xl relative">
           <div className="absolute top-0 left-0 w-2 md:w-3 h-full bg-emerald-500" />
           
           <div className="p-8 md:p-14 space-y-10">
              {/* PART 1: CORRECT ANSWER NODE */}
              <div className="space-y-4">
                 <div className="flex items-center gap-3 font-[900] text-[11px] md:text-sm text-emerald-600 tracking-[0.1em]">
                    <ShieldCheck className="h-5 w-5" /> Verified Answer
                 </div>
                 <div className="pl-8 space-y-2">
                    <p className="text-xl md:text-3xl font-black text-[#0F172A] leading-tight">
                       Option {q.correctAnswer}: {q[`option${q.correctAnswer}English`]}
                    </p>
                    {(q[`option${q.correctAnswer}Punjabi`] || q[`option${q.correctAnswer}Hindi`]) && (
                       <p className="text-lg md:text-2xl font-bold text-[#0F172A] opacity-80">
                          {q[`option${q.correctAnswer}Punjabi`] || q[`option${q.correctAnswer}Hindi`]}
                       </p>
                    )}
                 </div>
              </div>

              <div className="h-px w-full bg-slate-200/50 ml-8" />

              {/* PART 2: RATIONALE NODE */}
              <div className="space-y-6">
                 <div className="flex items-center gap-3 font-[900] text-[11px] md:text-sm text-slate-400 tracking-[0.1em]">
                    <Info className="h-5 w-5" /> Institutional Rationale
                 </div>
                 
                 <div className="pl-8 space-y-8">
                    {showEn && q.englishExplanation && (
                       <div className="font-[800] text-[#0F172A] leading-relaxed text-sm md:text-xl">
                          <MathText text={q.englishExplanation} className="text-inherit" />
                       </div>
                    )}
                    {(showPa && q.punjabiExplanation) ? (
                       <div className="font-bold text-[#0F172A] leading-relaxed text-sm md:text-xl">
                          <MathText text={q.punjabiExplanation} className="text-inherit" />
                       </div>
                    ) : (showHi && q.hindiExplanation) ? (
                       <div className="font-bold text-[#0F172A] leading-relaxed text-sm md:text-xl">
                          <MathText text={q.hindiExplanation} className="text-inherit" />
                       </div>
                    ) : null}
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}