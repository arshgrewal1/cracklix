'use client';

import React from 'react';
import { Question } from '@/types';
import { cn } from '@/lib/utils';
import MathText from './MathText';
import { Bookmark, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface QuestionRendererProps {
  question: Partial<Question> & { displayId?: string };
  language: 'en' | 'pa' | 'hi' | 'bi';
  showSolution?: boolean;
  hideOptions?: boolean;
}

/**
 * @fileOverview Institutional Uniform Typography Question Engine v76.0.
 * Rule: Identical typography (#111111, 700 weight) across all modes.
 * Spacing: 12px gap between bilingual statements.
 */
export default function QuestionRenderer({ 
  question, 
  language = 'bi',
  showSolution = false,
  hideOptions = false 
}: QuestionRendererProps) {
  
  const isEn = language === 'en';
  const isPa = language === 'pa';
  const isBi = language === 'bi';

  // Responsive font sizes for high-density reading
  const typographyClass = "font-[700] leading-[1.4] antialiased tracking-normal text-[#111111] text-[18px] md:text-[22px] lg:text-[26px]";

  return (
    <div className="w-full text-left font-body bg-transparent h-auto min-h-0 flex flex-col">
      
      {/* 1. TOP METADATA ROW */}
      <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-2">
         <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-[#0F172A] text-white flex items-center justify-center font-black text-xs">
               {question.displayId || '1'}
            </div>
            <div className="flex items-center gap-1.5">
               <Badge className="bg-emerald-50 text-emerald-600 border-emerald-100 font-black text-[9px] uppercase px-2 py-0">+1.0</Badge>
               <Badge className="bg-rose-50 text-rose-600 border-rose-100 font-black text-[9px] uppercase px-2 py-0">-0.25</Badge>
            </div>
         </div>
         <div className="flex gap-4">
            <button className="text-slate-400 hover:text-primary transition-colors"><Bookmark className="h-5 w-5" /></button>
            <button className="text-slate-400 hover:text-rose-500 transition-colors"><AlertTriangle className="h-5 w-5" /></button>
         </div>
      </div>

      {/* 2. CORE QUESTION STATEMENT */}
      <div className="flex flex-col gap-[8px] flex-1">
         {(isEn || isBi) && (
            <div className={typographyClass}>
               <MathText text={question.englishQuestion || "Question content loading..."} />
            </div>
         )}
         
         {(isPa || isBi) && (
            <div className={typographyClass}>
               <MathText text={question.punjabiQuestion || ""} />
            </div>
         )}
      </div>

      {/* Vertical leading before options */}
      <div className="h-[16px] shrink-0" />

      {/* 3. OPTION HUB */}
      {!hideOptions && (
        <div className="flex flex-col space-y-2 mt-auto">
          {['A', 'B', 'C', 'D'].map(key => {
            const en = (question as any)[`option${key}English`];
            const pa = (question as any)[`option${key}Punjabi`];

            return (
              <div key={key} className="flex gap-4 items-center group p-3 rounded-[10px] border-2 border-slate-100 hover:border-primary/20 transition-all bg-white shadow-sm cursor-pointer">
                <span className="shrink-0 font-black px-2 py-0.5 bg-[#0F172A] text-white rounded-md text-[10px]">({key})</span>
                <div className="flex-1 overflow-hidden">
                   <div className="flex flex-col gap-[2px]">
                      {(isEn || isBi) && <p className="font-[600] text-[18px] text-[#111111] leading-tight">{en}</p>}
                      {(isPa || isBi) && <p className="font-[600] text-[18px] text-[#111111] leading-tight">{pa || en}</p>}
                   </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* 4. SOLUTION HUB */}
      {showSolution && (
        <div className="mt-6 space-y-3 animate-in fade-in slide-in-from-top-1 duration-500">
           <div className="bg-emerald-50 border-2 border-emerald-100 p-4 rounded-xl flex items-center gap-4">
              <div className="text-left">
                 <p className="text-[9px] font-black uppercase text-emerald-600 tracking-widest">Correct Answer</p>
                 <h4 className="text-lg font-black text-emerald-900 uppercase">Option {question.correctAnswer}</h4>
              </div>
           </div>
           <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
              <div className="font-[500] text-[16px] text-[#111111] leading-relaxed">
                 {(isEn || isBi) && <MathText text={question.englishExplanation || ""} />}
                 {(isPa || isBi) && <MathText text={question.punjabiExplanation || ""} />}
              </div>
           </div>
        </div>
      )}
    </div>
  );
}