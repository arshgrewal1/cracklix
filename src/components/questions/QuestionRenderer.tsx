
'use client';

import React from 'react';
import { Question, LanguageDisplayMode } from '@/types';
import { cn } from '@/lib/utils';
import MathText from './MathText';

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
 * @fileOverview Production Hardened Question Engine v25.0.
 * UPDATED: Reduced spacing and internal padding for high-density mock display.
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
  
  if (!question) return (
    <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 opacity-20">
       <p className="text-[10px] font-black uppercase">Node Hydration Failed</p>
    </div>
  );

  const normalizedLang = (language || 'ENGLISH_PUNJABI').toUpperCase();
  
  const mode = normalizedLang === 'EN' ? 'ENGLISH' :
               normalizedLang === 'PA' ? 'PUNJABI' :
               normalizedLang === 'HI' ? 'HINDI' :
               normalizedLang === 'BILINGUAL' ? 'ENGLISH_PUNJABI' : normalizedLang as LanguageDisplayMode;

  const q = question as any;
  
  const englishQ = q.englishQuestion || q.questionEn || q.questionText || "";
  const punjabiQ = q.punjabiQuestion || q.questionPa || "";
  const hindiQ = q.hindiQuestion || q.questionHi || "";
  
  const englishExp = q.englishExplanation || q.explanationEn || q.rationalization || "";
  const punjabiExp = q.punjabiExplanation || q.explanationPa || "";
  const hindiExp = q.hindiExplanation || "";

  const showEn = mode === 'ENGLISH' || mode === 'ENGLISH_PUNJABI' || mode === 'ENGLISH_HINDI';
  const showPa = mode === 'PUNJABI' || mode === 'ENGLISH_PUNJABI';
  const showHi = mode === 'HINDI' || mode === 'ENGLISH_HINDI';

  return (
    <div className={cn("w-full text-left font-body bg-white text-[#0F172A] p-3 md:p-5 rounded-[1.5rem] md:rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col select-none", className)}>
      
      {/* 1. QUESTION STATEMENTS */}
      <div className="space-y-2 mb-4 md:mb-6">
         {showEn && englishQ && (
           <div className="font-[700] text-[15px] md:text-[18px] leading-snug tracking-tight text-[#0F172A] antialiased">
             <MathText text={englishQ} />
           </div>
         )}
         {showPa && punjabiQ && (
           <div className="font-[700] text-[14px] md:text-[17px] leading-snug tracking-tight text-[#0F172A] antialiased">
             <MathText text={punjabiQ} />
           </div>
         )}
         {showHi && hindiQ && (
           <div className="font-[700] text-[14px] md:text-[17px] leading-snug tracking-tight text-[#0F172A] antialiased">
             <MathText text={hindiQ} />
           </div>
         )}
      </div>

      {/* 2. OPTIONS MATRIX */}
      {!hideOptions && (
        <div className="flex flex-col space-y-2.5">
          {['A', 'B', 'C', 'D'].map((key, idx) => {
            const en = q[`option${key}English`];
            const pa = q[`option${key}Punjabi`];
            const hi = q[`option${key}Hindi`];
            
            const isSelected = selectedAnswer === idx;
            const isCorrect = q.correctAnswer === key;

            const boxClasses = cn(
              "flex items-start gap-3 p-2.5 md:p-3.5 rounded-xl md:rounded-2xl cursor-pointer transition-all border-2",
              showSolution 
                ? isCorrect ? "bg-emerald-50 border-emerald-500 shadow-sm" 
                  : isSelected ? "bg-rose-50 border-rose-500"
                  : "bg-slate-50/50 border-transparent"
                : isSelected ? "bg-orange-50 border-primary shadow-md" 
                  : "bg-slate-50/80 border-transparent active:bg-slate-100"
            );

            return (
              <div key={key} onClick={() => onSelect?.(idx)} className={boxClasses}>
                <span className={cn(
                  "font-[900] text-[14px] md:text-[16px] shrink-0 mt-0.5",
                  showSolution ? (isCorrect ? "text-emerald-600" : isSelected ? "text-rose-600" : "text-[#0F172A]")
                  : (isSelected ? "text-primary" : "text-slate-400")
                )}>
                  {key}
                </span>
                <div className="flex flex-col flex-1 min-w-0">
                  {showEn && en && (
                    <div className="font-[700] text-[14px] md:text-[16px] leading-tight text-[#0F172A]"><MathText text={en} /></div>
                  )}
                  {showPa && pa && (
                    <div className="font-[700] text-[13px] md:text-[15px] leading-tight text-[#0F172A] mt-1"><MathText text={pa} /></div>
                  )}
                  {showHi && hi && (
                    <div className="font-[700] text-[13px] md:text-[15px] leading-tight text-[#0F172A] mt-1"><MathText text={hi} /></div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* 3. SOLUTION HUB */}
      {showSolution && (
        <div className="mt-6 pt-6 border-t border-slate-100 space-y-4 animate-in fade-in slide-in-from-top-4 duration-500">
           <div className="flex items-center gap-3">
              <div className="font-[900] text-[10px] text-emerald-600 bg-emerald-100/50 px-3 py-1 rounded-lg border border-emerald-200 inline-block uppercase tracking-[0.2em] shadow-sm">
                 Key: ({q.correctAnswer || '?'})
              </div>
              <div className="h-px flex-1 bg-slate-50" />
           </div>

           <div className="space-y-4">
              {showEn && englishExp && (
                <div className="space-y-1">
                   <span className="text-primary font-[900] uppercase tracking-[0.2em] text-[9px] ml-1">English Rationale:</span>
                   <div className="font-[600] text-[13px] md:text-[14px] leading-relaxed text-slate-600 antialiased bg-slate-50/50 p-4 rounded-2xl border border-slate-100 shadow-inner">
                      <MathText text={englishExp} />
                   </div>
                </div>
              )}

              {showPa && punjabiExp && (
                <div className="space-y-1">
                   <span className="text-primary font-[900] uppercase tracking-[0.2em] text-[9px] ml-1">ਪੰਜਾਬੀ ਵਿਆਖਿਆ:</span>
                   <div className="font-[600] text-[13px] md:text-[14px] leading-relaxed text-slate-600 antialiased bg-slate-50/50 p-4 rounded-2xl border border-slate-100 shadow-inner">
                      <MathText text={punjabiExp} />
                   </div>
                </div>
              )}
           </div>
        </div>
      )}
    </div>
  );
}
