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
 * @fileOverview Institutional Neat & Clean Renderer v17.0.
 * Rules Enforcement:
 * 1. HIGH VERTICAL SPACING: Generous margins between all logic steps.
 * 2. HEADER GAPS: Fixed spacing between badges and content (mt-10).
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
    <div className="w-full text-left font-body space-y-0 text-[#0F172A] bg-transparent">
      {/* 1. English Question Statement */}
      <div className="text-[18px] md:text-[22px] font-black leading-[1.8] antialiased text-[#0F172A]">
         <MathText text={question.questionEn || ""} />
      </div>

      <div className="h-6" />

      {/* 2. Punjabi Question Statement */}
      {question.questionPa && (
        <div className="text-[18px] md:text-[22px] font-black leading-[1.8] antialiased text-[#0F172A]">
           <MathText text={question.questionPa} />
        </div>
      )}

      <div className="h-10" />

      {/* 3. Options List - STRICT VERTICAL FLOW */}
      {!hideOptions && (
        <div className="flex flex-col space-y-8">
          {['A', 'B', 'C', 'D'].map(key => {
            const content = (question as any)[`option${key}En`];
            if (!content) return null;

            return (
              <div key={key} className="text-[18px] md:text-[22px] font-bold text-[#0F172A] flex gap-4 leading-snug items-start group">
                <span className="shrink-0 font-black px-3 py-1 bg-slate-50 rounded-lg border border-slate-100 group-hover:border-primary/20 transition-colors">({key})</span>
                <div className="flex-1 pt-1">
                   <MathText text={content} />
                </div>
              </div>
            )
          })}
        </div>
      )}

      <div className="h-12" />

      {/* 4. Correct Answer Indicator - Institutional Multi-line */}
      <div className="text-[18px] md:text-[22px] font-black text-[#0F172A] border-y-2 border-slate-100 py-10 mb-12 bg-slate-50/30 px-8 rounded-[2rem] shadow-inner">
         <div className="space-y-6">
            <p className="flex items-start gap-4">
               <span className="text-emerald-600 uppercase tracking-tighter shrink-0 border-b-2 border-emerald-100">Correct Answer:</span>
               <span className="text-[#0F172A]">({question.correctAnswer}) {ansEn}</span>
            </p>
            {ansPa && (
               <p className="flex items-start gap-4 text-slate-700">
                  <span className="text-emerald-600 uppercase tracking-tighter shrink-0 border-b-2 border-emerald-100">ਸਹੀ ਉੱਤਰ:</span>
                  <span className="text-[#0F172A]">{ansPa}</span>
               </p>
            )}
         </div>
      </div>

      {/* 5. Solution Hub - AUTO-EXPANDING HEIGHT & NEAT SPACING */}
      {showSolution && (
        <div className="bg-[#121212] rounded-[3rem] p-8 md:p-14 text-white shadow-4xl border border-white/10 h-auto min-h-0 overflow-visible relative">
           <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
              <CheckCircle2 className="h-40 w-40" />
           </div>

           <div className="relative z-10 flex flex-col">
              
              {/* English Explanation Block */}
              {(question.explanationEn || (question as any).englishExplanation) && (
                <div className="flex flex-col">
                   <div className="flex items-center mb-10">
                      <span className="text-[12px] md:text-[14px] font-black uppercase tracking-[0.3em] text-primary bg-primary/10 px-6 py-2 rounded-full border border-primary/20 shadow-xl">
                        • English Explanation
                      </span>
                   </div>
                   <div className="text-[18px] md:text-[21px] text-slate-100 leading-[2.4] antialiased whitespace-pre-wrap break-words px-2">
                      <MathText text={question.explanationEn || (question as any).englishExplanation || ""} />
                   </div>
                </div>
              )}

              {/* Punjabi Explanation Block */}
              {(question.explanationPa || (question as any).punjabiExplanation) && (
                <div className="flex flex-col mt-20 pt-16 border-t border-white/5">
                   <div className="flex items-center mb-10">
                      <span className="text-[12px] md:text-[14px] font-black uppercase tracking-[0.3em] text-emerald-500 bg-emerald-500/10 px-6 py-2 rounded-full border border-emerald-500/20 shadow-xl">
                        • ਪੰਜਾਬੀ ਵਿਆਖਿਆ
                      </span>
                   </div>
                   <div className="text-[18px] md:text-[21px] text-slate-100 leading-[2.4] antialiased whitespace-pre-wrap break-words px-2">
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
