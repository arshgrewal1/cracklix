
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
 * @fileOverview Institutional High-Fidelity Dark Renderer v26.0.
 * Updated: High-density scaling pass to minimize scrolling.
 * Style: Deep black workspace with high-contrast white option boxes.
 * Result Mode: Highlights correct/incorrect choices when showSolution is true.
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
    <div className="w-full text-left font-body bg-[#111111] text-white p-4 md:p-6 rounded-[1.5rem] md:rounded-[2.5rem] shadow-4xl min-h-0 flex flex-col select-none border border-white/5 transition-all">
      
      {/* 1. QUESTION HEADER (Compact) */}
      <div className="space-y-1.5 md:space-y-2 mb-4 md:mb-5">
         <div className="flex items-center gap-2">
            <span className="text-[10px] md:text-[11px] font-black text-slate-500 uppercase tracking-widest">
              Q{question.displayId || '1'}.
            </span>
         </div>
         
         <div className="space-y-1.5 md:space-y-2">
            {(isEn || isBi) && englishQ && (
              <div className="font-[700] text-[14px] md:text-[17px] leading-snug tracking-tight text-white antialiased">
                <MathText text={englishQ} />
              </div>
            )}
            {(isPa || isBi) && punjabiQ && (
              <div className="font-[700] text-[14px] md:text-[17px] leading-snug tracking-tight text-slate-200 antialiased">
                <MathText text={punjabiQ} />
              </div>
            )}
         </div>
      </div>

      {/* 2. OPTION MATRIX (High-Density White Boxes) */}
      {!hideOptions && (
        <div className="flex flex-col space-y-2 md:space-y-2.5 mb-4 md:mb-5">
          {['A', 'B', 'C', 'D'].map((key, idx) => {
            const en = q[`option${key}English`] || q[`option_${key.toLowerCase()}_english`];
            const pa = q[`option${key}Punjabi`] || q[`option_${key.toLowerCase()}_punjabi`];
            const isSelected = selectedAnswer === idx;
            const isCorrect = q.correctAnswer === key;

            if (!en && !pa) return null;

            // Strategic Result Styling
            const boxClasses = cn(
              "flex items-center gap-3 p-2 md:p-2.5 rounded-xl cursor-pointer transition-all border-2",
              showSolution 
                ? isCorrect ? "bg-emerald-50 border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.1)]" 
                  : isSelected ? "bg-rose-50 border-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.1)]"
                  : "bg-white border-transparent"
                : isSelected ? "bg-white border-[#F97316] shadow-[0_0_12px_rgba(249,115,22,0.15)]" 
                  : "bg-white border-transparent hover:bg-slate-50"
            );

            const prefixClasses = cn(
              "font-[900] text-[13px] md:text-[16px] shrink-0 transition-colors",
              showSolution
                ? isCorrect ? "text-emerald-600"
                  : isSelected ? "text-rose-600"
                  : "text-[#0F172A]"
                : isSelected ? "text-[#F97316]" : "text-[#0F172A]"
            );

            const textClasses = cn(
              "font-[700] text-[12px] md:text-[14px] leading-tight transition-colors",
              showSolution
                ? isCorrect ? "text-emerald-800"
                  : isSelected ? "text-rose-800"
                  : "text-[#0F172A]"
                : "text-[#0F172A]"
            );

            return (
              <div 
                key={key} 
                onClick={() => onSelect?.(idx)}
                className={boxClasses}
              >
                <span className={prefixClasses}>
                  ({key})
                </span>
                <div className={textClasses}>
                  <MathText text={`${en}${pa ? ` / ${pa}` : ''}`} />
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* 3. CORRECT ANSWER NODE */}
      {showSolution && (
        <div className="mt-2 space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
           <div className="font-[900] text-[12px] md:text-[14px] text-emerald-400 bg-emerald-500/5 px-3 py-2 rounded-lg border border-emerald-500/20 inline-block uppercase tracking-wide">
              Correct: ({q.correctAnswer || '?'}) {q[`option${q.correctAnswer}English`]}
           </div>

           {/* 4. RATIONALE HUB (Bulleted) */}
           <div className="space-y-3 pt-4 border-t border-white/10">
              {(englishExp || isBi) && (
                <div className="flex gap-3 md:gap-4 items-start text-left">
                   <div className="h-1.5 w-1.5 rounded-full border-2 border-primary shrink-0 mt-1.5 shadow-[0_0_6px_rgba(249,115,22,0.4)]" />
                   <div className="font-[700] text-[11px] md:text-[13px] leading-relaxed text-slate-300 flex-1">
                      <span className="text-white font-[900] mr-2 uppercase tracking-wide text-[9px] md:text-[10px]">English:</span>
                      <MathText text={englishExp || "Registry node audit logic..."} />
                   </div>
                </div>
              )}

              {(punjabiExp || isBi) && (
                <div className="flex gap-3 md:gap-4 items-start text-left">
                   <div className="h-1.5 w-1.5 rounded-full border-2 border-primary shrink-0 mt-1.5 shadow-[0_0_6px_rgba(249,115,22,0.4)]" />
                   <div className="font-[700] text-[11px] md:text-[13px] leading-relaxed text-slate-300 flex-1">
                      <span className="text-white font-[900] mr-2 text-[9px] md:text-[10px]">ਪੰਜਾਬੀ:</span>
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
