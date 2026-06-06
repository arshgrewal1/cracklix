
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
 * @fileOverview Institutional High-Fidelity Dark Renderer v18.0.
 * Strictly mirrored to user screenshot: Black Box (#111111), Bold White Typography (700), Slash Separated Options.
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
    <div className="w-full text-left font-body bg-[#111111] text-white p-8 md:p-12 rounded-[2.5rem] shadow-4xl min-h-[400px] flex flex-col select-none border border-white/5 transition-all">
      
      {/* 1. QUESTION HEADER (Q6. Style) */}
      <div className="space-y-6 mb-12">
         <div className="flex items-center gap-3">
            <span className="text-[14px] md:text-[16px] font-black text-slate-400 uppercase tracking-widest">
              Q{question.displayId || '1'}.
            </span>
         </div>
         
         <div className="space-y-6">
            {(isEn || isBi) && englishQ && (
              <div className="font-[700] text-[20px] md:text-[24px] leading-snug tracking-tight text-white antialiased">
                <MathText text={englishQ} />
              </div>
            )}
            {(isPa || isBi) && punjabiQ && (
              <div className="font-[700] text-[20px] md:text-[24px] leading-snug tracking-tight text-slate-100 antialiased">
                <MathText text={punjabiQ} />
              </div>
            )}
         </div>
      </div>

      {/* 2. OPTION MATRIX (Slash Separated Testbook Style) */}
      {!hideOptions && (
        <div className="flex flex-col space-y-6 mb-12">
          {['A', 'B', 'C', 'D'].map((key, idx) => {
            const en = q[`option${key}English`] || q[`option_${key.toLowerCase()}_english`];
            const pa = q[`option${key}Punjabi`] || q[`option_${key.toLowerCase()}_punjabi`];
            const isSelected = selectedAnswer === idx;

            if (!en && !pa) return null;

            return (
              <div 
                key={key} 
                onClick={() => onSelect?.(idx)}
                className="flex gap-4 items-baseline group cursor-pointer transition-all active:scale-[0.98]"
              >
                <span className={cn(
                  "font-[700] text-[17px] md:text-[21px] shrink-0 transition-colors",
                  isSelected ? "text-[#F97316]" : "text-white"
                )}>
                  ({key})
                </span>
                <p className={cn(
                  "font-[700] text-[17px] md:text-[21px] leading-tight transition-colors",
                  isSelected ? "text-white" : "text-slate-300 group-hover:text-white"
                )}>
                  {en} {pa ? ` / ${pa}` : ''}
                </p>
              </div>
            )
          })}
        </div>
      )}

      {/* 3. CORRECT ANSWER NODE (Shown Post-Submission) */}
      {showSolution && (
        <div className="mt-6 space-y-10 animate-in fade-in slide-in-from-top-4 duration-500">
           <div className="font-[900] text-[18px] md:text-[21px] text-emerald-400 bg-emerald-500/5 p-4 rounded-xl border border-emerald-500/20 inline-block">
              Correct Answer: ({q.correctAnswer || '?'}) {q[`option${q.correctAnswer}English`]} / ਸਹੀ ਉੱਤਰ: {q[`option${q.correctAnswer}Punjabi`]}
           </div>

           {/* 4. RATIONALE HUB (Testbook-Style Bulleted Logic) */}
           <div className="space-y-10 pt-10 border-t border-white/10">
              {(englishExp || isBi) && (
                <div className="flex gap-6 items-start">
                   <div className="h-2 w-2 rounded-full border-2 border-primary shrink-0 mt-3 shadow-[0_0_8px_rgba(249,115,22,0.5)]" />
                   <div className="font-[700] text-[16px] md:text-[18px] leading-[1.8] text-slate-300">
                      <span className="text-white font-[900] mr-2 uppercase tracking-wide">English Explanation:</span>
                      <MathText text={englishExp || "Registry node auditing logic..."} />
                   </div>
                </div>
              )}

              {(punjabiExp || isBi) && (
                <div className="flex gap-6 items-start">
                   <div className="h-2 w-2 rounded-full border-2 border-primary shrink-0 mt-3 shadow-[0_0_8px_rgba(249,115,22,0.5)]" />
                   <div className="font-[700] text-[16px] md:text-[18px] leading-[1.8] text-slate-300">
                      <span className="text-white font-[900] mr-2">ਪੰਜਾਬੀ ਵਿਆਖਿਆ:</span>
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
