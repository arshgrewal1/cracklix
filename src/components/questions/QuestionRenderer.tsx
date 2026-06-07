'use client';

import React from 'react';
import { Question } from '@/types';
import { cn } from '@/lib/utils';
import MathText from './MathText';

interface QuestionRendererProps {
  question: Partial<Question> & { displayId?: string };
  language: 'en' | 'pa' | 'hi' | 'bilingual';
  showSolution?: boolean;
  hideOptions?: boolean;
  selectedAnswer?: number; 
  onSelect?: (index: number) => void;
}

export default function QuestionRenderer({ 
  question, 
  language = 'bilingual',
  showSolution = false,
  hideOptions = false,
  selectedAnswer,
  onSelect
}: QuestionRendererProps) {
  
  const isEn = language === 'en';
  const isPa = language === 'pa';
  const isBi = language === 'bilingual';

  const q = question as any;
  const englishQ = q.englishQuestion || q.questionEn || q.question_english || q.titleEn || q.questionText;
  const punjabiQ = q.punjabiQuestion || q.questionPa || q.question_punjabi || q.titlePa;
  
  const englishExp = q.englishExplanation || q.explanationEn || q.explanation_english || q.rationalization;
  const punjabiExp = q.punjabiExplanation || q.explanationPa || q.explanation_punjabi;

  return (
    <div className="w-full text-left font-body bg-white text-[#0F172A] p-3 md:p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col select-none">
      
      <div className="space-y-1.5 mb-3">
         {(isEn || isBi) && englishQ && (
           <div className="font-[700] text-[16px] leading-snug tracking-tight text-[#0F172A] antialiased">
             <MathText text={englishQ} />
           </div>
         )}
         {(isPa || isBi) && punjabiQ && (
           <div className="font-[700] text-[15px] leading-snug tracking-tight text-slate-500 antialiased">
             <MathText text={punjabiQ} />
           </div>
         )}
      </div>

      {!hideOptions && (
        <div className="flex flex-col space-y-1.5">
          {['A', 'B', 'C', 'D'].map((key, idx) => {
            const en = q[`option${key}English`] || q[`option_${key.toLowerCase()}_english`];
            const pa = q[`option${key}Punjabi`] || q[`option_${key.toLowerCase()}_punjabi`];
            const isSelected = selectedAnswer === idx;
            const isCorrect = q.correctAnswer === key;

            if (!en && !pa) return null;

            const boxClasses = cn(
              "flex items-center gap-2.5 p-2 rounded-xl cursor-pointer transition-all border-2",
              showSolution 
                ? isCorrect ? "bg-emerald-50 border-emerald-500" 
                  : isSelected ? "bg-rose-50 border-rose-500"
                  : "bg-slate-50 border-transparent"
                : isSelected ? "bg-orange-50 border-primary shadow-sm" 
                  : "bg-slate-50 border-transparent active:bg-slate-100"
            );

            return (
              <div 
                key={key} 
                onClick={() => onSelect?.(idx)}
                className={boxClasses}
              >
                <span className={cn(
                  "font-[900] text-[15px] shrink-0",
                  showSolution ? (isCorrect ? "text-emerald-600" : isSelected ? "text-rose-600" : "text-[#0F172A]")
                  : (isSelected ? "text-primary" : "text-slate-400")
                )}>
                  {key}
                </span>
                <div className={cn(
                  "font-[700] text-[15px] leading-tight flex-1",
                  showSolution ? (isCorrect ? "text-emerald-800" : isSelected ? "text-rose-800" : "text-[#0F172A]")
                  : "text-[#0F172A]"
                )}>
                  <MathText text={`${en}${pa ? ` / ${pa}` : ''}`} />
                </div>
              </div>
            )
          })}
        </div>
      )}

      {showSolution && (
        <div className="mt-3 space-y-3 animate-in fade-in slide-in-from-top-2 duration-300 pt-4 border-t border-slate-100">
           <div className="font-[900] text-[10px] text-emerald-600 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-100 inline-block uppercase tracking-wider">
              CORRECT: ({q.correctAnswer || '?'})
           </div>

           <div className="space-y-3">
              {(englishExp || isBi) && (
                <div className="flex flex-col gap-1">
                   <span className="text-[#0F172A] font-[900] uppercase tracking-widest text-[9px]">English Rationale:</span>
                   <div className="font-[600] text-[13px] leading-relaxed text-slate-600 antialiased">
                      <MathText text={englishExp || "Verification logic pending..."} />
                   </div>
                </div>
              )}

              {(punjabiExp || isBi) && (
                <div className="flex flex-col gap-1">
                   <span className="text-[#0F172A] font-[900] uppercase tracking-widest text-[9px]">ਵਿਆਖਿਆ (Punjabi):</span>
                   <div className="font-[600] text-[13px] leading-relaxed text-slate-600 antialiased">
                      <MathText text={punjabiExp || "ਵਿਆਖਿਆ ਉਪਲਬਧ ਨਹੀਂ ਹੈ।"} />
                   </div>
                </div>
              )}
           </div>
        </div>
      )}
    </div>
  );
}