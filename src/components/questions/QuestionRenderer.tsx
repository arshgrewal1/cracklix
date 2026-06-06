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
 * @fileOverview Institutional High-Fidelity High-Density Dark Renderer v29.0.
 * Optimized: Strictly mirrors the "Testbook" rationale style with uppercase labels and orange bullets.
 * Style: Deep black workspace with high-contrast white option boxes.
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
    <div className="w-full text-left font-body bg-[#111111] text-white p-4 md:p-6 rounded-[1.5rem] md:rounded-[2rem] shadow-4xl min-h-0 flex flex-col select-none border border-white/5 transition-all">
      
      {/* 1. QUESTION HEADER (High Density) */}
      <div className="space-y-1 mb-3 md:mb-4">
         <span className="text-[10px] md:text-[11px] font-black text-slate-500 uppercase tracking-widest block">
           Question {question.displayId || '1'}
         </span>
         
         <div className="space-y-1 md:space-y-1.5">
            {(isEn || isBi) && englishQ && (
              <div className="font-[700] text-[15px] md:text-[17px] leading-snug tracking-tight text-white antialiased">
                <MathText text={englishQ} />
              </div>
            )}
            {(isPa || isBi) && punjabiQ && (
              <div className="font-[700] text-[15px] md:text-[17px] leading-snug tracking-tight text-slate-200 antialiased">
                <MathText text={punjabiQ} />
              </div>
            )}
         </div>
      </div>

      {/* 2. OPTION MATRIX (Tighter White Boxes) */}
      {!hideOptions && (
        <div className="flex flex-col space-y-2 md:space-y-2.5 mb-2">
          {['A', 'B', 'C', 'D'].map((key, idx) => {
            const en = q[`option${key}English`] || q[`option_${key.toLowerCase()}_english`];
            const pa = q[`option${key}Punjabi`] || q[`option_${key.toLowerCase()}_punjabi`];
            const isSelected = selectedAnswer === idx;
            const isCorrect = q.correctAnswer === key;

            if (!en && !pa) return null;

            const boxClasses = cn(
              "flex items-center gap-3 p-2 md:p-2.5 rounded-xl cursor-pointer transition-all border-2",
              showSolution 
                ? isCorrect ? "bg-emerald-50 border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.1)]" 
                  : isSelected ? "bg-rose-50 border-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.1)]"
                  : "bg-white border-transparent"
                : isSelected ? "bg-white border-[#F97316] shadow-[0_0_12px_rgba(249,115,22,0.15)]" 
                  : "bg-white border-transparent hover:bg-slate-50"
            );

            return (
              <div 
                key={key} 
                onClick={() => onSelect?.(idx)}
                className={boxClasses}
              >
                <span className={cn(
                  "font-[900] text-[13px] md:text-[15px] shrink-0",
                  showSolution ? (isCorrect ? "text-emerald-600" : isSelected ? "text-rose-600" : "text-[#0F172A]")
                  : (isSelected ? "text-[#F97316]" : "text-[#0F172A]")
                )}>
                  ({key})
                </span>
                <div className={cn(
                  "font-[700] text-[13px] md:text-[14px] leading-tight",
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

      {/* 3. CORRECT ANSWER & RATIONALE (Institutional Style) */}
      {showSolution && (
        <div className="mt-4 space-y-5 animate-in fade-in slide-in-from-top-2 duration-300 pt-6 border-t border-white/10">
           <div className="font-[900] text-[10px] md:text-[11px] text-emerald-400 bg-emerald-900/20 px-4 py-2 rounded-full border border-emerald-500/30 inline-block uppercase tracking-wider shadow-lg">
              VERIFIED KEY: ({q.correctAnswer || '?'}) {q[`option${q.correctAnswer}English`]?.toUpperCase()}
           </div>

           <div className="space-y-5">
              {(englishExp || isBi) && (
                <div className="flex gap-4 items-start text-left group">
                   <div className="h-2.5 w-2.5 rounded-full border-2 border-primary shrink-0 mt-1 shadow-[0_0_8px_rgba(249,115,22,0.4)] group-hover:bg-primary transition-colors" />
                   <div className="flex flex-col gap-1 flex-1">
                      <span className="text-white font-[900] uppercase tracking-[0.1em] text-[10px] md:text-[11px]">RATIONALE (EN):</span>
                      <div className="font-[700] text-[13px] md:text-[14px] leading-relaxed text-slate-300 antialiased">
                         <MathText text={englishExp || "Registry node audit logic..."} />
                      </div>
                   </div>
                </div>
              )}

              {(punjabiExp || isBi) && (
                <div className="flex gap-4 items-start text-left group">
                   <div className="h-2.5 w-2.5 rounded-full border-2 border-primary shrink-0 mt-1 shadow-[0_0_8px_rgba(249,115,22,0.4)] group-hover:bg-primary transition-colors" />
                   <div className="flex flex-col gap-1 flex-1">
                      <span className="text-white font-[900] uppercase tracking-wide text-[10px] md:text-[11px]">ਤੱਰਕ (PA):</span>
                      <div className="font-[700] text-[13px] md:text-[14px] leading-relaxed text-slate-300 antialiased">
                         <MathText text={punjabiExp || "ਵਿਆਖਿਆ ਉਪਲਬਧ ਨਹੀਂ ਹੈ।"} />
                      </div>
                   </div>
                </div>
              )}
           </div>
        </div>
      )}
    </div>
  );
}
