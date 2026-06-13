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
 * @fileOverview Precision Mobile-First Question Hub v41.0.
 * UPDATED: Responsive typography for statements and fluid option spacing.
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
    <div className={cn("w-full text-left font-body bg-white text-[#0F172A] p-4 md:p-10 lg:p-14 flex flex-col select-none rounded-[1.5rem] md:rounded-[3rem] shadow-sm", className)}>
      
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
      <div className="space-y-4 mb-8 px-1">
         {showEn && englishQ && (
           <div className="font-bold text-[15px] sm:text-lg md:text-2xl lg:text-3xl text-[#0F172A] antialiased leading-snug md:leading-relaxed">
             <MathText text={englishQ} />
           </div>
         )}
         {showPa && punjabiQ && (
           <div className="font-bold text-[15px] sm:text-lg md:text-2xl lg:text-3xl text-[#0F172A] antialiased leading-snug md:leading-relaxed">
             <MathText text={punjabiQ} />
           </div>
         )}
      </div>

      {/* 3. INTERACTIVE OPTIONS - FLUID PADDING */}
      {!hideOptions && (
        <div className="flex flex-col space-y-3">
          {OPT_LABELS.map((key, idx) => {
            const en = q[`option${key}English`];
            const pa = q[`option${key}Punjabi`];
            const isSelected = selectedAnswer === idx;
            return (
              <div 
                key={key} 
                onClick={() => onSelect?.(idx)} 
                className={cn(
                  "flex items-center gap-4 md:gap-8 p-4 md:p-8 rounded-2xl border transition-all cursor-pointer group/opt active:scale-[0.98]",
                  showSolution 
                    ? q.correctAnswer === key ? "bg-emerald-50 border-emerald-500 shadow-xl" 
                      : isSelected ? "bg-rose-50 border-rose-500 shadow-xl"
                      : "bg-white border-slate-100"
                    : isSelected ? "bg-orange-50 border-primary ring-4 ring-primary/5 shadow-2xl" 
                      : "bg-white border-slate-100 hover:border-slate-300 shadow-sm"
                )}
              >
                <span className={cn(
                  "font-black text-lg md:text-2xl lg:text-3xl shrink-0 w-6 md:w-8 text-center",
                  isSelected ? "text-primary" : "text-slate-300 group-hover/opt:text-slate-500"
                )}>{key}</span>
                <div className="flex flex-col flex-1 min-w-0">
                  {showEn && en && <div className={cn("font-bold text-[14px] md:text-xl lg:text-2xl", isSelected ? "text-primary" : "text-slate-600")}><MathText text={en} /></div>}
                  {showPa && pa && <div className={cn("font-bold text-[14px] md:text-xl lg:text-2xl", isSelected ? "text-primary" : "text-slate-600")}><MathText text={pa} /></div>}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* 4. RATIONALIZATION HUB */}
      {showSolution && (
        <div className="mt-10 pt-10 border-t border-slate-100 space-y-6">
           <Badge className="bg-[#0F172A] text-white border-none font-black text-[10px] md:text-xs uppercase px-6 py-2 rounded-xl shadow-2xl tracking-[0.2em]">Institutional Rationalization</Badge>
           <div className="bg-slate-50 p-6 md:p-12 rounded-[2rem] md:rounded-[3.5rem] border border-slate-100 text-slate-600 leading-relaxed font-medium text-[13px] md:text-lg lg:text-xl space-y-6 shadow-inner">
              <p className="font-black text-[11px] md:text-sm uppercase text-[#0B1528] pb-4 border-b border-slate-200/50 flex items-center gap-3">
                 <ShieldCheck className="h-5 w-5 text-emerald-500" /> Correct Key: {q.correctAnswer}
              </p>
              {showEn && q.englishExplanation && <MathText text={q.englishExplanation} className="text-inherit" />}
              {showPa && q.punjabiExplanation && <MathText text={q.punjabiExplanation} className="text-inherit" />}
           </div>
        </div>
      )}
    </div>
  );
}
