'use client';

import React from 'react';
import { Question } from '@/types';
import { cn } from '@/lib/utils';
import MathText from './MathText';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2 } from 'lucide-react';

interface QuestionRendererProps {
  question: Partial<Question> & { displayId?: string };
  language: 'en' | 'pa' | 'bilingual';
  showSolution?: boolean;
  hideOptions?: boolean;
}

/**
 * @fileOverview Institutional Neat & Clean Renderer v18.0.
 * Rules Enforcement:
 * 1. MAXIMUM VISIBILITY: Forced black color for questions to prevent "invisible" text.
 * 2. MAXIMUM SPACING: High vertical margins and line heights.
 * 3. PREMIUM THEME: High-contrast Solution Hub with #121212 background.
 */
export default function QuestionRenderer({ 
  question, 
  showSolution = false,
  hideOptions = false 
}: QuestionRendererProps) {
  
  // Extract Answer Parts for Bilingual Display
  const fullAnsValue = (question as any)[`option${question.correctAnswer}En`] || "";
  const [ansEn, ansPa] = fullAnsValue.split('/').map((s: string) => s.trim());

  return (
    <div className="w-full text-left font-body space-y-0 text-black bg-transparent">
      {/* 1. English Question Statement - FORCED BLACK */}
      <div className="text-[18px] md:text-[22px] font-black leading-[1.8] antialiased text-[#000000] tracking-wide">
         <MathText text={question.questionEn || ""} />
      </div>

      <div className="h-10" />

      {/* 2. Punjabi Question Statement - FORCED BLACK */}
      {question.questionPa && (
        <div className="text-[18px] md:text-[22px] font-black leading-[1.8] antialiased text-[#000000] tracking-wide">
           <MathText text={question.questionPa} />
        </div>
      )}

      <div className="h-12" />

      {/* 3. Options List - STRICT VERTICAL FLOW */}
      {!hideOptions && (
        <div className="flex flex-col space-y-10">
          {['A', 'B', 'C', 'D'].map(key => {
            const content = (question as any)[`option${key}En`];
            if (!content) return null;

            return (
              <div key={key} className="text-[18px] md:text-[22px] font-black text-[#000000] flex gap-5 leading-relaxed items-start group tracking-wide">
                <span className="shrink-0 font-black px-3 py-1 bg-slate-100 rounded-lg border border-slate-200 group-hover:border-primary/40 transition-colors">({key})</span>
                <div className="flex-1 pt-1">
                   <MathText text={content} />
                </div>
              </div>
            )
          })}
        </div>
      )}

      <div className="h-16" />

      {/* 4. Correct Answer Indicator - Institutional Multi-line */}
      <div className="text-[18px] md:text-[22px] font-black text-[#000000] border-y-2 border-slate-100 py-12 mb-16 bg-slate-50/50 px-10 rounded-[2.5rem] shadow-inner tracking-wide">
         <div className="space-y-8">
            <p className="flex items-start gap-5">
               <span className="text-emerald-600 uppercase tracking-tighter shrink-0 border-b-2 border-emerald-100">Correct Answer:</span>
               <span className="text-[#000000]">({question.correctAnswer}) {ansEn}</span>
            </p>
            {ansPa && (
               <p className="flex items-start gap-5">
                  <span className="text-emerald-600 uppercase tracking-tighter shrink-0 border-b-2 border-emerald-100">ਸਹੀ ਉੱਤਰ:</span>
                  <span className="text-[#000000]">{ansPa}</span>
               </p>
            )}
         </div>
      </div>

      {/* 5. Solution Hub - AUTO-EXPANDING HEIGHT & NEAT SPACING */}
      {showSolution && (
        <div className="bg-[#121212] rounded-[3.5rem] p-10 md:p-16 text-white shadow-4xl border border-white/10 h-auto min-h-0 overflow-visible relative">
           <div className="absolute top-0 right-0 p-10 opacity-[0.03] pointer-events-none">
              <CheckCircle2 className="h-48 w-48" />
           </div>

           <div className="relative z-10 flex flex-col text-white">
              
              {/* English Explanation Block */}
              {(question.explanationEn || (question as any).englishExplanation) && (
                <div className="flex flex-col">
                   <div className="flex items-center mb-12">
                      <span className="text-[12px] md:text-[14px] font-black uppercase tracking-[0.3em] text-primary bg-primary/10 px-8 py-2.5 rounded-full border border-primary/20 shadow-2xl">
                        • English Explanation
                      </span>
                   </div>
                   <div className="text-[18px] md:text-[22px] text-slate-100 leading-[2.2] antialiased whitespace-pre-wrap break-words px-2 tracking-wide">
                      <MathText text={question.explanationEn || (question as any).englishExplanation || ""} />
                   </div>
                </div>
              )}

              {/* Punjabi Explanation Block */}
              {(question.explanationPa || (question as any).punjabiExplanation) && (
                <div className="flex flex-col mt-24 pt-20 border-t border-white/5">
                   <div className="flex items-center mb-12">
                      <span className="text-[12px] md:text-[14px] font-black uppercase tracking-[0.3em] text-emerald-500 bg-emerald-500/10 px-8 py-2.5 rounded-full border border-emerald-500/20 shadow-2xl">
                        • ਪੰਜਾਬੀ ਵਿਆਖਿਆ
                      </span>
                   </div>
                   <div className="text-[18px] md:text-[22px] text-slate-100 leading-[2.2] antialiased whitespace-pre-wrap break-words px-2 tracking-wide">
                      <MathText text={question.explanationPa || (question as any).punjabiExplanation || ""} />
                   </div>
                </div>
              )}
           </div>
        </div>
      )}
    </div>
  );
}
