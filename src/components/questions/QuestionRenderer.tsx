
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
 * @fileOverview Institutional Uniform Typography Question Engine v65.0.
 * Scale: Desktop 28px, Laptop 24px, Tablet 20px, Mobile 18px.
 * Rule: Identical typography (#111111, 700 weight) across all modes.
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

  // Uniform Typography Standard
  const desktopSize = "xl:text-[28px] lg:text-[24px]";
  const mobileSize = "text-[20px] md:text-[22px]";
  const typographyClass = cn(mobileSize, desktopSize, "font-[700] leading-[1.6] antialiased tracking-tight text-[#111111]");

  return (
    <div className="w-full text-left font-body bg-transparent h-auto min-h-0">
      
      {/* 1. CORE QUESTION STATEMENT */}
      <div className="flex flex-col gap-[12px]">
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
      </div>

      {/* Spacing before options */}
      <div className="h-[16px]" />

      {/* 2. OPTION HUB */}
      {!hideOptions && (
        <div className="flex flex-col space-y-3">
          {['A', 'B', 'C', 'D'].map(key => {
            const en = (question as any)[`option${key}English`];
            const pa = (question as any)[`option${key}Punjabi`];

            return (
              <div key={key} className="flex gap-4 items-center group p-4 h-auto min-h-[68px] md:min-h-[72px] rounded-[16px] border-2 border-slate-100 hover:border-primary/20 transition-all bg-white shadow-sm">
                <span className="shrink-0 font-black px-3 py-1 bg-[#0F172A] text-white rounded-lg text-xs md:text-sm">({key})</span>
                <div className="flex-1 py-1 overflow-hidden">
                   {isEn && <p className="font-[600] text-[16px] md:text-[20px] text-[#111111] leading-tight">{en}</p>}
                   {isPa && <p className="font-[600] text-[16px] md:text-[20px] text-[#111111] leading-tight">{pa || en}</p>}
                   {isBi && (
                      <div className="flex flex-col gap-1">
                         <p className="font-[600] text-[16px] md:text-[20px] text-[#111111] leading-tight">{en}</p>
                         <p className="font-[600] text-[16px] md:text-[20px] text-[#111111] leading-tight">{pa}</p>
                      </div>
                   )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* 3. SUBMIT-GATED SOLUTION HUB */}
      {showSolution && (
        <div className="mt-10 space-y-8 animate-in fade-in slide-in-from-top-2 duration-500">
           
           <div className="bg-emerald-50 border-2 border-emerald-100 p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
              <div className="flex items-center gap-4">
                 <div className="h-12 w-12 bg-emerald-500 rounded-xl flex items-center justify-center text-white shadow-lg">
                    <CheckCircle2 className="h-6 w-6" />
                 </div>
                 <div className="text-left">
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-emerald-600">Verified Answer</p>
                    <h4 className="text-xl font-headline font-black text-emerald-900 uppercase">Option {question.correctAnswer}</h4>
                 </div>
              </div>
           </div>

           <div className="bg-slate-50 rounded-2xl p-8 border border-slate-200 shadow-sm">
              {(isEn || isBi) && (
                <div className="mb-8">
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-4">English Rationale</p>
                  <div className="text-[16px] md:text-[20px] text-[#111111] leading-[2] font-medium">
                    <MathText text={question.englishExplanation || ""} />
                  </div>
                </div>
              )}
              {(isPa || isBi) && (
                <div className={cn(isBi && "pt-8 border-t border-slate-200")}>
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-4">ਪੰਜਾਬੀ ਵਿਆਖਿਆ</p>
                  <div className="text-[16px] md:text-[20px] text-[#111111] leading-[2] font-medium">
                    <MathText text={question.punjabiExplanation || ""} />
                  </div>
                </div>
              )}
           </div>
        </div>
      )}
    </div>
  );
}
