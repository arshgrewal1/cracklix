
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
  selectedAnswer?: number; // 0, 1, 2, 3
  onSelect?: (index: number) => void;
}

/**
 * @fileOverview Institutional High-Fidelity Dark Renderer v22.0.
 * Updated: Scaled down font sizes and paddings to minimize scrolling.
 * Options implemented as white boxes with black text as per user request.
 */
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
    <div className="w-full text-left font-body bg-[#111111] text-white p-5 md:p-8 rounded-[2rem] shadow-4xl min-h-[300px] flex flex-col select-none border border-white/5 transition-all">
      
      {/* 1. QUESTION HEADER */}
      <div className="space-y-3 md:space-y-4 mb-6 md:mb-8">
         <div className="flex items-center gap-3">
            <span className="text-[12px] md:text-[14px] font-black text-slate-400 uppercase tracking-widest">
              Q{question.displayId || '1'}.
            </span>
         </div>
         
         <div className="space-y-3 md:space-y-4">
            {(isEn || isBi) && englishQ && (
              <div className="font-[700] text-[16px] md:text-[19px] leading-snug tracking-tight text-white antialiased">
                <MathText text={englishQ} />
              </div>
            )}
            {(isPa || isBi) && punjabiQ && (
              <div className="font-[700] text-[16px] md:text-[19px] leading-snug tracking-tight text-slate-100 antialiased">
                <MathText text={punjabiQ} />
              </div>
            )}
         </div>
      </div>

      {/* 2. OPTION MATRIX (White Boxes / Black Text) */}
      {!hideOptions && (
        <div className="flex flex-col space-y-3 md:space-y-4 mb-6 md:mb-8">
          {['A', 'B', 'C', 'D'].map((key, idx) => {
            const en = q[`option${key}English`] || q[`option_${key.toLowerCase()}_english`];
            const pa = q[`option${key}Punjabi`] || q[`option_${key.toLowerCase()}_punjabi`];
            const isSelected = selectedAnswer === idx;

            if (!en && !pa) return null;

            return (
              <div 
                key={key} 
                onClick={() => onSelect?.(idx)}
                className={cn(
                  "flex items-center gap-4 p-3 md:p-4 rounded-xl cursor-pointer transition-all active:scale-[0.99] border-2",
                  isSelected 
                    ? "bg-white border-[#F97316] shadow-[0_0_15px_rgba(249,115,22,0.1)]" 
                    : "bg-white border-transparent hover:bg-slate-50"
                )}
              >
                <span className={cn(
                  "font-[900] text-[15px] md:text-[18px] shrink-0 transition-colors",
                  isSelected ? "text-[#F97316]" : "text-[#0F172A]"
                )}>
                  ({key})
                </span>
                <div className={cn(
                  "font-[700] text-[14px] md:text-[16px] leading-tight transition-colors text-[#0F172A]"
                )}>
                  <MathText text={`${en}${pa ? ` / ${pa}` : ''}`} />
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* 3. CORRECT ANSWER NODE */}
      {showSolution && (
        <div className="mt-4 space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
           <div className="font-[900] text-[14px] md:text-[17px] text-emerald-400 bg-emerald-500/5 p-3 rounded-lg border border-emerald-500/20 inline-block">
              Correct Answer: ({q.correctAnswer || '?'}) {q[`option${q.correctAnswer}English`]} / ਸਹੀ ਉੱਤਰ: {q[`option${q.correctAnswer}Punjabi`]}
           </div>

           {/* 4. RATIONALE HUB */}
           <div className="space-y-6 pt-6 border-t border-white/10">
              {(englishExp || isBi) && (
                <div className="flex gap-3 md:gap-4 items-start text-left">
                   <div className="h-1.5 w-1.5 rounded-full border-2 border-primary shrink-0 mt-2 md:mt-2.5 shadow-[0_0_8px_rgba(249,115,22,0.5)]" />
                   <div className="font-[700] text-[13px] md:text-[15px] leading-[1.6] md:leading-[1.7] text-slate-300 flex-1">
                      <span className="text-white font-[900] mr-2 uppercase tracking-wide text-[11px] md:text-[12px]">English Explanation:</span>
                      <MathText text={englishExp || "Registry node auditing logic..."} />
                   </div>
                </div>
              )}

              {(punjabiExp || isBi) && (
                <div className="flex gap-3 md:gap-4 items-start text-left">
                   <div className="h-1.5 w-1.5 rounded-full border-2 border-primary shrink-0 mt-2 md:mt-2.5 shadow-[0_0_8px_rgba(249,115,22,0.5)]" />
                   <div className="font-[700] text-[13px] md:text-[15px] leading-[1.6] md:leading-[1.7] text-slate-300 flex-1">
                      <span className="text-white font-[900] mr-2 text-[11px] md:text-[12px]">ਪੰਜਾਬੀ ਵਿਆਖਿਆ:</span>
                      <MathText text={punjabiExp || "ਵਿਆਖਿਆ ਦੀ ਉਡੀਕ ਕੀਤੀ ਜਾ ਰਹੀ ਹੈ।"} />
                   </div>
                </div>
              )}
           </div>
        </div>
      )}
    </div>
  );
}
