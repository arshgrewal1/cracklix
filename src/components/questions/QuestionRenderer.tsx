
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
  selectedAnswer?: number; 
  onSelect?: (index: number) => void;
  className?: string;
}

/**
 * @fileOverview Precision Mobile-First Question Hub v42.0 (High Density).
 * UPDATED: Reduced padding and font sizes for a more compact results view.
 * FIXED: High-density layouts for 320px-360px devices.
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
  } else if (sectionName.includes("PUNJABI") || subjectId.includes("PUNJABI")) {
    renderLang = "PUNJABI";
  } else if (sectionName.includes("HINDI") || subjectId.includes("HINDI")) {
    renderLang = "HINDI";
  }
  
  const showEn = renderLang.includes('ENGLISH');
  const showPa = renderLang.includes('PUNJABI');
  
  const formatTime = (seconds: number) => {
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const englishQ = q.englishQuestion || q.questionEn || q.questionText || "";
  const punjabiQ = q.punjabiQuestion || q.questionPa || "";
  
  const OPT_LABELS = ['A', 'B', 'C', 'D'];

  return (
    <div className={cn(
      "w-full text-left font-body bg-white text-[#0F172A] flex flex-col select-none",
      showSolution ? "p-0" : "p-4 md:p-10 lg:p-14 rounded-[1.5rem] md:rounded-[3rem] shadow-sm",
      className
    )}>
      
      {/* 1. METADATA STRIP */}
      {!showSolution && (
        <div className="flex items-center justify-between mb-6 border-b border-slate-50 pb-4">
           <div className="flex items-center gap-3">
              <span className="font-black text-[12px] md:text-base lg:text-lg text-white bg-[#0B1528] px-3 py-1 rounded shadow-2xl">Q {q.displayId || '1'}</span>
              <div className="flex items-center gap-2 text-slate-400 font-black text-[10px] md:text-sm tabular-nums bg-slate-50 px-3 py-1 rounded-lg">
                 <Clock className="h-4 w-4 text-primary" />
                 <span>{formatTime(timeLeft)}</span>
              </div>
           </div>
           <div className="flex items-center gap-5 text-slate-300">
              <Bookmark className="h-5 w-5 md:h-6 md:w-6 hover:text-primary cursor-pointer transition-colors" />
              <AlertTriangle className="h-5 w-5 md:h-6 md:w-6 hover:text-rose-500 cursor-pointer transition-colors" />
           </div>
        </div>
      )}

      {/* 2. STATEMENTS HUB - RESPONSIVE SCALING */}
      <div className={cn("space-y-2 mb-6 px-1", showSolution ? "mb-4" : "mb-8")}>
         {showEn && englishQ && (
           <div className={cn("font-bold text-[#0F172A] antialiased leading-snug md:leading-relaxed", showSolution ? "text-[14px] md:text-lg" : "text-[15px] sm:text-lg md:text-2xl lg:text-3xl")}>
             <MathText text={englishQ} />
           </div>
         )}
         {showPa && punjabiQ && (
           <div className={cn("font-bold text-[#0F172A] antialiased leading-snug md:leading-relaxed", showSolution ? "text-[14px] md:text-lg" : "text-[15px] sm:text-lg md:text-2xl lg:text-3xl")}>
             <MathText text={punjabiQ} />
           </div>
         )}
      </div>

      {/* 3. INTERACTIVE OPTIONS - COMPACT PADDING */}
      {!hideOptions && (
        <div className={cn("flex flex-col", showSolution ? "space-y-1.5" : "space-y-3")}>
          {OPT_LABELS.map((key, idx) => {
            const en = q[`option${key}English`];
            const pa = q[`option${key}Punjabi`];
            const isSelected = selectedAnswer === idx;
            return (
              <div 
                key={key} 
                onClick={() => !showSolution && onSelect?.(idx)} 
                className={cn(
                  "flex items-center gap-4 transition-all transition-all border",
                  showSolution 
                    ? `p-2.5 md:p-4 rounded-xl ${q.correctAnswer === key ? "bg-emerald-50 border-emerald-500 shadow-sm" : isSelected ? "bg-rose-50 border-rose-500" : "bg-white border-slate-100"}`
                    : `p-4 md:p-8 rounded-2xl cursor-pointer group/opt active:scale-[0.98] ${isSelected ? "bg-orange-50 border-primary ring-4 ring-primary/5 shadow-2xl" : "bg-white border-slate-100 hover:border-slate-300 shadow-sm"}`
                )}
              >
                <span className={cn(
                  "font-black shrink-0 w-6 md:w-8 text-center",
                  showSolution ? "text-sm md:text-lg" : "text-lg md:text-2xl lg:text-3xl",
                  isSelected ? "text-primary" : "text-slate-300 group-hover/opt:text-slate-500"
                )}>{key}</span>
                <div className="flex flex-col flex-1 min-w-0">
                  {showEn && en && <div className={cn("font-bold leading-tight", showSolution ? "text-[11px] md:text-sm" : "text-[14px] md:text-xl lg:text-2xl", isSelected ? "text-primary" : "text-slate-600")}><MathText text={en} /></div>}
                  {showPa && pa && <div className={cn("font-bold leading-tight", showSolution ? "text-[11px] md:text-sm" : "text-[14px] md:text-xl lg:text-2xl", isSelected ? "text-primary" : "text-slate-600")}><MathText text={pa} /></div>}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* 4. RATIONALIZATION HUB - REDUCED PADDING */}
      {showSolution && (
        <div className="mt-6 pt-6 border-t border-slate-100 space-y-4">
           <Badge className="bg-[#0F172A] text-white border-none font-black text-[7px] md:text-[9px] uppercase px-3 py-1 rounded-lg tracking-[0.1em]">Rationale</Badge>
           <div className="bg-slate-50 p-4 md:p-6 rounded-xl border border-slate-100 text-slate-500 leading-relaxed font-medium text-[11px] md:text-sm space-y-3 shadow-inner">
              <p className="font-black text-[9px] md:text-[10px] uppercase text-[#0B1528] pb-2 border-b border-slate-200/50 flex items-center gap-2">
                 <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" /> Answer: {q.correctAnswer}
              </p>
              {showEn && q.englishExplanation && <MathText text={q.englishExplanation} className="text-inherit" />}
              {showPa && q.punjabiExplanation && <MathText text={q.punjabiExplanation} className="text-inherit" />}
           </div>
        </div>
      )}
    </div>
  );
}

