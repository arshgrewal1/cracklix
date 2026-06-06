
'use client';

import React from 'react';
import { Question } from '@/types';
import { cn } from '@/lib/utils';
import MathText from './MathText';

interface QuestionRendererProps {
  question: Partial<Question> & { displayId?: string, correctAnswerRaw?: string };
  language: 'en' | 'pa' | 'bilingual';
  showSolution?: boolean;
  hideOptions?: boolean;
}

/**
 * @fileOverview Institutional Solution Page Renderer (Adda247/PSSSB Style).
 * - Exact spacing rules: blank lines between segments.
 * - Single-column reading layout.
 * - Bilingual options (A) EN / PA.
 * - Dark theme solution hub.
 */
export default function QuestionRenderer({ 
  question, 
  showSolution = false,
  hideOptions = false 
}: QuestionRendererProps) {
  
  return (
    <div className="w-full text-left font-body space-y-0 text-[#0F172A]">
      {/* 1. English Question */}
      <div className="text-[17px] md:text-[20px] font-bold leading-relaxed antialiased">
         {question.displayId && <span className="mr-2 text-primary">Q{question.displayId}.</span>}
         <MathText text={question.questionEn || ""} className="inline" />
      </div>

      {/* Spacing: Question -> Punjabi */}
      <div className="h-4" />

      {/* 2. Punjabi Question */}
      {question.questionPa && (
        <div className="text-[17px] md:text-[20px] font-bold leading-relaxed antialiased">
           <MathText text={question.questionPa} />
        </div>
      )}

      {/* Spacing: Punjabi -> Options */}
      <div className="h-6" />

      {/* 3. Options List (Combined Bilingual) */}
      {!hideOptions && (
        <div className="space-y-2">
          {['A', 'B', 'C', 'D'].map(key => {
            const content = (question as any)[`option${key}En`];
            if (!content) return null;

            return (
              <div key={key} className="text-[16px] md:text-[18px] font-bold text-slate-800">
                ({key}) <MathText text={content} className="inline" />
              </div>
            )
          })}
        </div>
      )}

      {/* Spacing: Options -> Correct Answer */}
      <div className="h-6" />

      {/* 4. Correct Answer Line */}
      <div className="text-[16px] md:text-[18px] font-black text-[#0F172A] border-y border-slate-100 py-3">
         {question.correctAnswerRaw ? (
           <MathText text={question.correctAnswerRaw} />
         ) : (
           <p>Correct Answer: ({question.correctAnswer}) {(question as any)[`option${question.correctAnswer}En`]}</p>
         )}
      </div>

      {/* Spacing: Correct Answer -> Solutions */}
      {showSolution && <div className="h-6" />}

      {/* 5. Solution Hub (Institutional Dark Flow) */}
      {showSolution && (
        <div className="bg-[#121212] rounded-2xl md:rounded-[2.5rem] p-8 md:p-12 text-white shadow-2xl relative overflow-hidden">
           <div className="space-y-0 relative z-10">
              
              {/* English Explanation Segment */}
              {question.explanationEn && (
                <>
                   <div className="flex items-center gap-3 mb-6">
                      <span className="text-[14px] font-black uppercase tracking-[0.2em] text-primary">
                        • English Explanation:
                      </span>
                   </div>
                   <div className="text-[16px] md:text-[18px] text-slate-200 font-medium leading-relaxed antialiased space-y-4">
                      <MathText text={question.explanationEn} />
                   </div>
                </>
              )}

              {/* Spacing: English -> Punjabi Explanation */}
              <div className="h-10" />

              {/* Punjabi Explanation Segment */}
              {question.explanationPa && (
                <>
                   <div className="flex items-center gap-3 mb-6">
                      <span className="text-[14px] font-black uppercase tracking-[0.2em] text-emerald-500">
                        • ਪੰਜਾਬੀ ਵਿਆਖਿਆ:
                      </span>
                   </div>
                   <div className="text-[16px] md:text-[18px] text-slate-200 font-medium leading-relaxed antialiased space-y-4">
                      <MathText text={question.explanationPa} />
                   </div>
                </>
              )}
           </div>
        </div>
      )}
    </div>
  );
}
