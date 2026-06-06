
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
 * @fileOverview Institutional Zero-Inference Renderer v31.0.
 * Rules Enforcement:
 * 1. STRICT EXPLICIT FIELDS: Calls englishQuestion and punjabiQuestion directly.
 * 2. BILINGUAL OPTIONS: Renders (A) {EN} / {PA} pattern.
 * 3. NO DETECTION: System does not infer or guess language.
 */
export default function QuestionRenderer({ 
  question, 
  language = 'bilingual',
  showSolution = false,
  hideOptions = false 
}: QuestionRendererProps) {
  
  return (
    <div className="w-full text-left font-body space-y-0 text-black bg-transparent">
      {/* 1. English Statement */}
      <div className="text-[18px] md:text-[22px] font-black leading-[1.8] antialiased text-[#000000] tracking-wide">
         <MathText text={question.englishQuestion || ""} />
      </div>

      <div className="h-6" />

      {/* 2. Punjabi Statement */}
      <div className="text-[18px] md:text-[22px] font-black leading-[1.8] antialiased text-[#000000] tracking-wide">
         <MathText text={question.punjabiQuestion || ""} />
      </div>

      <div className="h-12" />

      {/* 3. Options List - Vertical Bilingual Format */}
      {!hideOptions && (
        <div className="flex flex-col space-y-6">
          {['A', 'B', 'C', 'D'].map(key => {
            const en = (question as any)[`option${key}English`];
            const pa = (question as any)[`option${key}Punjabi`];
            if (!en && !pa) return null;

            return (
              <div key={key} className="text-[18px] md:text-[22px] font-black text-[#000000] flex gap-5 leading-relaxed items-start group tracking-wide">
                <span className="shrink-0 font-black px-3 py-1 bg-slate-50 rounded-lg border border-slate-200 group-hover:border-primary/40 transition-colors">({key})</span>
                <div className="flex-1 pt-1">
                   <div className="flex flex-wrap items-baseline gap-2">
                      <MathText text={en || ""} className="inline" />
                      {(en && pa) && <span className="text-primary/30 mx-1">/</span>}
                      <MathText text={pa || ""} className="inline" />
                   </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <div className="h-16" />

      {/* 4. Correct Answer - Explicit Bilingual Hub */}
      <div className="text-[18px] md:text-[22px] font-black text-[#000000] border-y-2 border-slate-100 py-12 mb-16 bg-slate-50/50 px-10 rounded-[2.5rem] shadow-inner tracking-wide">
         <div className="space-y-8">
            <div className="space-y-2">
               <p className="text-emerald-600 uppercase tracking-tighter text-[14px]">Correct Answer:</p>
               <p className="text-[#000000]">({question.correctAnswer}) {(question as any)[`option${question.correctAnswer}English`]}</p>
            </div>
            <div className="space-y-2 pt-4 border-t border-slate-100/50">
               <p className="text-emerald-600 uppercase tracking-tighter text-[14px]">ਸਹੀ ਉੱਤਰ:</p>
               <p className="text-[#000000]">{(question as any)[`option${question.correctAnswer}Punjabi`]}</p>
            </div>
         </div>
      </div>

      {/* 5. Solution Hub - Explicit Field Mapping */}
      {showSolution && (
        <div className="bg-[#121212] rounded-[3.5rem] p-10 md:p-16 text-white shadow-4xl border border-white/10 h-auto min-h-0 overflow-visible relative">
           <div className="absolute top-0 right-0 p-10 opacity-[0.03] pointer-events-none">
              <CheckCircle2 className="h-48 w-48" />
           </div>

           <div className="relative z-10 flex flex-col text-white">
              <div className="flex flex-col">
                 <div className="flex items-center mb-10">
                    <span className="text-[12px] md:text-[14px] font-black uppercase tracking-[0.3em] text-primary bg-primary/10 px-8 py-2.5 rounded-full border border-primary/20 shadow-2xl">
                      • English Explanation:
                    </span>
                 </div>
                 <div className="text-[18px] md:text-[22px] text-slate-100 leading-[2.2] antialiased whitespace-pre-wrap break-words px-2 tracking-wide">
                    <MathText text={question.englishExplanation || ""} />
                 </div>
              </div>

              <div className="flex flex-col mt-20 pt-16 border-t border-white/5">
                 <div className="flex items-center mb-10">
                    <span className="text-[12px] md:text-[14px] font-black uppercase tracking-[0.3em] text-emerald-500 bg-emerald-500/10 px-8 py-2.5 rounded-full border border-emerald-500/20 shadow-2xl">
                      • ਪੰਜਾਬੀ ਵਿਆਖਿਆ:
                    </span>
                 </div>
                 <div className="text-[18px] md:text-[22px] text-slate-100 leading-[2.2] antialiased whitespace-pre-wrap break-words px-2 tracking-wide">
                    <MathText text={question.punjabiExplanation || ""} />
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
