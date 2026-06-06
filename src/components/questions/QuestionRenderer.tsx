
'use client';

import React from 'react';
import { Question } from '@/types';
import { cn } from '@/lib/utils';
import MathText from './MathText';
import { Bookmark, Flag, Info, Circle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface QuestionRendererProps {
  question: Partial<Question> & { displayId?: string };
  language: 'en' | 'pa' | 'hi' | 'bilingual';
  showSolution?: boolean;
  hideOptions?: boolean;
}

/**
 * @fileOverview Institutional High-Fidelity Dark Renderer v16.0.
 * Matches user-provided screenshot: Black background, White text, Slash-separated options.
 * Fixed: Standardized language keys to ensure bilingual statements render correctly.
 */
export default function QuestionRenderer({ 
  question, 
  language = 'bilingual',
  showSolution = false,
  hideOptions = false 
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
    <div className="w-full text-left font-body bg-[#111111] text-white p-6 md:p-10 rounded-[2rem] shadow-4xl min-h-[400px] flex flex-col select-none border border-white/5">
      
      {/* 1. QUESTION HEADER */}
      <div className="space-y-4 mb-10">
         <div className="flex items-center gap-3 mb-2">
            <span className="text-[12px] md:text-[14px] font-black text-slate-400 uppercase tracking-widest">
              Q{question.displayId || '1'}.
            </span>
         </div>
         
         <div className="space-y-4">
            {(isEn || isBi) && (
              <div className="font-[700] text-[18px] md:text-[22px] leading-snug">
                <MathText text={englishQ || "Restoring registry node..."} />
              </div>
            )}
            {(isPa || isBi) && (
              <div className="font-[700] text-[18px] md:text-[22px] leading-snug text-slate-100">
                <MathText text={punjabiQ || ""} />
              </div>
            )}
         </div>
      </div>

      {/* 2. OPTION MATRIX (Slash Separated Style) */}
      {!hideOptions && (
        <div className="flex flex-col space-y-4 mb-10">
          {['A', 'B', 'C', 'D'].map(key => {
            const en = q[`option${key}English`] || q[`option_${key.toLowerCase()}_english`];
            const pa = q[`option${key}Punjabi`] || q[`option_${key.toLowerCase()}_punjabi`];

            if (!en && !pa) return null;

            return (
              <div key={key} className="flex gap-4 items-baseline group cursor-pointer hover:text-primary transition-colors">
                <span className="font-[700] text-[16px] md:text-[19px] shrink-0">({key})</span>
                <p className="font-[700] text-[16px] md:text-[19px] leading-tight">
                  {en} {pa ? ` / ${pa}` : ''}
                </p>
              </div>
            )
          })}
        </div>
      )}

      {/* 3. CORRECT ANSWER NODE */}
      {showSolution && (
        <div className="mt-4 space-y-8 animate-in fade-in slide-in-from-top-2">
           <div className="font-[900] text-[16px] md:text-[19px] text-white">
              Correct Answer: ({q.correctAnswer || '?'}) {q[`option${q.correctAnswer}English`]} / ਸਹੀ ਉੱਤਰ: {q[`option${q.correctAnswer}Punjabi`]}
           </div>

           {/* 4. RATIONALE HUB (Bulleted) */}
           <div className="space-y-8 pt-8 border-t border-white/10">
              {(englishExp || isBi) && (
                <div className="flex gap-6 items-start">
                   <div className="h-2 w-2 rounded-full border border-white shrink-0 mt-3" />
                   <div className="font-[700] text-[15px] md:text-[17px] leading-[1.8] text-slate-300">
                      <span className="text-white font-[900] mr-2">English Explanation:</span>
                      <MathText text={englishExp || "Logic audit pending."} />
                   </div>
                </div>
              )}

              {(punjabiExp || isBi) && (
                <div className="flex gap-6 items-start">
                   <div className="h-2 w-2 rounded-full border border-white shrink-0 mt-3" />
                   <div className="font-[700] text-[15px] md:text-[17px] leading-[1.8] text-slate-300">
                      <span className="text-white font-[900] mr-2">ਪੰਜਾਬੀ ਵਿਆਖਿਆ:</span>
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
