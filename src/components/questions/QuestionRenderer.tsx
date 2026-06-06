
'use client';

import React from 'react';
import { Question } from '@/types';
import { cn } from '@/lib/utils';
import MathText from './MathText';
import { CheckCircle2 } from 'lucide-react';

interface QuestionRendererProps {
  question: Partial<Question> & { displayId?: string };
  language: 'en' | 'pa' | 'bilingual';
  showSolution?: boolean;
  hideOptions?: boolean;
}

/**
 * @fileOverview Institutional CBT Renderer v40.0.
 * Redesign: Responsive font sizes, zero-bleed logic, high-fidelity spacing.
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

  return (
    <div className="w-full text-left font-body text-black bg-transparent">
      {/* 1. Question Statement - Responsive Font */}
      <div className="space-y-4">
         {(isEn || isBi) && (
            <div className="text-[17px] sm:text-[19px] md:text-[23px] font-black leading-[1.6] antialiased text-[#000000] tracking-wide">
               <MathText text={question.englishQuestion || ""} />
            </div>
         )}
         {(isPa || isBi) && (
            <div className={cn(
               "text-[17px] sm:text-[19px] md:text-[23px] font-black leading-[1.6] antialiased text-[#000000] tracking-wide",
               isBi && "pt-4 border-t border-slate-100 mt-4"
            )}>
               <MathText text={question.punjabiQuestion || ""} />
            </div>
         )}
      </div>

      <div className="h-6 md:h-8" />

      {/* 2. Options Hub - Rendered outside for 'hideOptions' support in Attempt Page */}
      {!hideOptions && (
        <div className="flex flex-col space-y-3">
          {['A', 'B', 'C', 'D'].map(key => {
            const en = (question as any)[`option${key}English`];
            const pa = (question as any)[`option${key}Punjabi`];

            return (
              <div key={key} className="text-[15px] sm:text-[17px] md:text-[20px] font-black text-[#000000] flex gap-3 md:gap-4 leading-normal items-start group tracking-wide p-2 rounded-xl hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100">
                <span className="shrink-0 font-black px-2 py-0.5 bg-slate-100 rounded border border-slate-200 group-hover:bg-[#0B1528] group-hover:text-white group-hover:border-[#0B1528] transition-all">({key})</span>
                <div className="flex-1 pt-0.5">
                   {isEn && <MathText text={en || ""} />}
                   {isPa && <MathText text={pa || ""} />}
                   {isBi && (
                      <div className="flex flex-wrap items-baseline gap-2">
                         <MathText text={en || ""} className="inline" />
                         <span className="text-primary/30 mx-1">/</span>
                         <MathText text={pa || ""} className="inline" />
                      </div>
                   )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* 3. Solution Hub - Only shown post-submission */}
      {showSolution && (
        <div className="mt-8 md:mt-12 space-y-6 md:space-y-10">
           <div className="bg-emerald-50/50 border-2 border-emerald-100 p-6 md:p-8 rounded-2xl md:rounded-3xl text-left">
              <div className="space-y-4">
                 {(isEn || isBi) && (
                    <div className="space-y-1">
                       <p className="text-emerald-600 uppercase tracking-widest text-[9px] md:text-[11px] font-black">Correct Answer:</p>
                       <p className="text-[#000000] font-black text-lg md:text-xl">({question.correctAnswer}) {(question as any)[`option${question.correctAnswer}English`]}</p>
                    </div>
                 )}
                 {(isPa || isBi) && (
                    <div className={cn("space-y-1", isBi && "pt-4 border-t border-emerald-100/50")}>
                       <p className="text-emerald-600 uppercase tracking-widest text-[9px] md:text-[11px] font-black">ਸਹੀ ਉੱਤਰ:</p>
                       <p className="text-[#000000] font-black text-lg md:text-xl">{(question as any)[`option${question.correctAnswer}Punjabi`]}</p>
                    </div>
                 )}
              </div>
           </div>

           <div className="bg-[#121212] rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-12 text-white shadow-2xl relative overflow-hidden h-auto min-h-0">
              <div className="absolute top-0 right-0 p-10 opacity-[0.02] pointer-events-none">
                 <CheckCircle2 className="h-40 w-40" />
              </div>

              <div className="relative z-10 space-y-10 md:space-y-12 h-auto">
                 {(isEn || isBi) && (
                    <div className="space-y-4 md:space-y-6 h-auto">
                       <span className="inline-block text-[8px] md:text-[10px] font-black uppercase tracking-[0.3em] text-primary bg-primary/10 px-4 md:px-6 py-1.5 rounded-full border border-primary/20">
                          • English Explanation
                       </span>
                       <div className="text-[15px] sm:text-[17px] md:text-[21px] text-slate-100 leading-[1.8] md:leading-[2.2] font-medium h-auto overflow-visible">
                          <MathText text={question.englishExplanation || ""} />
                       </div>
                    </div>
                 )}

                 {(isPa || isBi) && (
                    <div className={cn("space-y-4 md:space-y-6 h-auto", isBi && "pt-10 md:pt-12 border-t border-white/5")}>
                       <span className="inline-block text-[8px] md:text-[10px] font-black uppercase tracking-[0.3em] text-emerald-500 bg-emerald-500/10 px-4 md:px-6 py-1.5 rounded-full border border-emerald-500/20">
                          • ਪੰਜਾਬੀ ਵਿਆਖਿਆ
                       </span>
                       <div className="text-[15px] sm:text-[17px] md:text-[21px] text-slate-100 leading-[1.8] md:leading-[2.2] font-medium h-auto overflow-visible">
                          <MathText text={question.punjabiExplanation || ""} />
                       </div>
                    </div>
                 )}
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
