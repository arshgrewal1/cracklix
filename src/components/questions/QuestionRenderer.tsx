
'use client';

import React from 'react';
import { Question } from '@/types';
import { cn } from '@/lib/utils';
import MathText from './MathText';
import { CheckCircle2 } from 'lucide-react';

interface QuestionRendererProps {
  question: Partial<Question> & { displayId?: string };
  language: 'en' | 'pa' | 'hi' | 'bilingual';
  showSolution?: boolean;
  hideOptions?: boolean;
}

/**
 * @fileOverview Institutional CBT Question Engine v74.0.
 * Fixed spacing: 8px bilingual gap, 16px option leading gap.
 * Container is now fully flexible (height: auto) to eliminate white empty space.
 */
export default function QuestionRenderer({ 
  question, 
  language = 'bilingual',
  showSolution = false,
  hideOptions = false 
}: QuestionRendererProps) {
  
  const isEn = language === 'en';
  const isPa = language === 'pa';
  const isHi = language === 'hi';
  const isBi = language === 'bilingual';

  // Responsive font sizes for high-density reading
  const desktopSize = "lg:text-[28px]";
  const laptopSize = "md:text-[22px]";
  const mobileSize = "text-[18px]";
  
  const typographyClass = cn(
    mobileSize, 
    laptopSize,
    desktopSize, 
    "font-[700] leading-[1.35] antialiased tracking-tight text-[#111111]"
  );

  return (
    <div className="w-full text-left font-body bg-transparent h-auto min-h-0 flex flex-col">
      
      {/* 1. CORE QUESTION STATEMENT */}
      <div className="flex flex-col gap-[8px] flex-1">
         {/* EN Mode or BI Mode */}
         {(isEn || isBi) && (
            <div className={typographyClass}>
               <MathText text={question.englishQuestion || ""} />
            </div>
         )}
         
         {/* PA Mode or BI Mode */}
         {(isPa || isBi) && (
            <div className={typographyClass}>
               <MathText text={question.punjabiQuestion || ""} />
            </div>
         )}

         {/* HI Mode */}
         {isHi && (
            <div className={typographyClass}>
               <MathText text={question.hindiQuestion || ""} />
            </div>
         )}
      </div>

      {/* Spacing before options: 16px to bring them upward */}
      <div className="h-[16px] shrink-0" />

      {/* 2. OPTION HUB (Flexible positioning) */}
      {!hideOptions && (
        <div className="flex flex-col space-y-2 mt-auto">
          {['A', 'B', 'C', 'D'].map(key => {
            const en = (question as any)[`option${key}English`];
            const pa = (question as any)[`option${key}Punjabi`];

            return (
              <div key={key} className="flex gap-4 items-center group p-3 min-h-[56px] rounded-[12px] border-2 border-slate-100 hover:border-primary/20 transition-all bg-white shadow-sm">
                <span className="shrink-0 font-black px-2 py-0.5 bg-[#0F172A] text-white rounded-md text-[10px]">({key})</span>
                <div className="flex-1 py-0.5 overflow-hidden">
                   {isEn && <p className="font-[600] text-[17px] text-[#111111] leading-tight">{en}</p>}
                   {isPa && <p className="font-[600] text-[17px] text-[#111111] leading-tight">{pa || en}</p>}
                   {isBi && (
                      <div className="flex flex-col">
                         <p className="font-[600] text-[17px] text-[#111111] leading-tight">{en}</p>
                         <p className="font-[600] text-[17px] text-[#111111] leading-tight">{pa}</p>
                      </div>
                   )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* 3. SOLUTION HUB */}
      {showSolution && (
        <div className="mt-6 space-y-4 animate-in fade-in slide-in-from-top-2 duration-500">
           <div className="bg-emerald-50 border-2 border-emerald-100 p-4 rounded-xl flex flex-col md:row items-center gap-3">
              <CheckCircle2 className="h-6 w-6 text-emerald-500" />
              <div className="text-left">
                 <p className="text-[8px] font-black uppercase text-emerald-600">Correct Answer</p>
                 <h4 className="text-lg font-black text-emerald-900 uppercase">Option {question.correctAnswer}</h4>
              </div>
           </div>
           <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
              <p className="text-[14px] text-[#111111] font-medium leading-relaxed">
                 <MathText text={isEn ? question.englishExplanation || "" : question.punjabiExplanation || ""} />
              </p>
           </div>
        </div>
      )}
    </div>
  );
}
