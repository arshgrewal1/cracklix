'use client';

import React, { useMemo } from 'react';
import { Question } from '@/types';
import { cn } from '@/lib/utils';
import { CheckCircle2, Info, Languages } from 'lucide-react';

interface QuestionRendererProps {
  question: Partial<Question> & { displayId?: string };
  language: 'en' | 'pa' | 'bilingual';
  showSolution?: boolean;
  hideOptions?: boolean;
}

/**
 * @fileOverview Institutional High-Fidelity Question Renderer v21.0.
 * Rules Enforcement:
 * 1. Neat and Clean: Professional typography with calibrated line heights.
 * 2. 1-Line Space: English and Punjabi explanations are visually separated by a clean gap.
 * 3. Sanitizer: Strips dual numbering from the UI display to prevent "Q1. Q1." errors.
 */

export default function QuestionRenderer({ 
  question, 
  language, 
  showSolution = false,
  hideOptions = false 
}: QuestionRendererProps) {
  
  const cleanText = (text: string = "") => {
    if (!text) return "";
    return text
      .replace(/^[A-D][\.\):\s-]*/i, '') 
      .replace(/^\d+[\.\):\s-]*/, '')     
      .replace(/^ਪ੍ਰਸ਼ਨ\s*\d+[\.\):\s-]*/, '')
      .replace(/^ਪ੍ਰਸ਼ਨ\s*\d+[\.\):\s-]*/, '')
      .replace(/^\*\*|\*\*$/g, '')       
      .replace(/\*\*/g, '')              
      .trim();
  };

  const renderContent = (en: string = "", pa: string = "") => {
    const cEn = cleanText(en);
    const cPa = cleanText(pa);

    if (language === 'en') return cEn;
    if (language === 'pa') return cPa || cEn;
    
    return (
      <span className="inline-flex flex-wrap items-center gap-x-2">
        <span className="text-[#0F172A]">{cEn}</span>
        {cPa && cPa !== cEn && (
          <>
            <span className="text-slate-300 font-light">/</span>
            <span className="text-[#0F172A]">{cPa}</span>
          </>
        )}
      </span>
    );
  };

  const expEn = useMemo(() => question.explanationEn || (question as any).explanation || "", [question]);
  const expPa = useMemo(() => question.explanationPa || "", [question]);

  return (
    <div className="w-full text-left font-body space-y-4 md:space-y-6">
      {question.imageUrl && (
        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 shadow-inner overflow-hidden">
           <img src={question.imageUrl} alt="Asset" className="max-h-[160px] rounded-xl mx-auto object-contain" />
        </div>
      )}

      {/* Question Statement */}
      <div className="text-[15px] md:text-[17px] font-black leading-tight text-[#0F172A] antialiased">
        {renderContent(question.questionEn, question.questionPa)}
      </div>

      {/* Options Hub */}
      {!hideOptions && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-3">
          {['A', 'B', 'C', 'D'].map(key => {
            const en = (question as any)[`option${key}En`] || "";
            const pa = (question as any)[`option${key}Pa`] || "";
            
            if (!en && !pa) return null;
            
            return (
                <div key={key} className="flex items-center gap-3 p-3 bg-white border border-slate-100 rounded-xl shadow-sm">
                  <div className="h-7 w-7 rounded-lg bg-slate-50 flex items-center justify-center font-black text-[10px] text-primary shrink-0 border border-slate-100">
                     {key}
                  </div>
                  <div className="text-[13px] md:text-[15px] font-bold text-slate-700 leading-snug">
                      {renderContent(en, pa)}
                  </div>
                </div>
            )
          })}
        </div>
      )}

      {showSolution && (
        <div className="mt-6 p-6 md:p-8 bg-emerald-50/40 rounded-[2rem] border border-emerald-100 space-y-6 shadow-sm relative overflow-hidden">
           <div className="absolute top-0 right-0 p-6 opacity-5"><CheckCircle2 className="h-32 w-32" /></div>
           
           <div className="flex items-center justify-between relative z-10">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-lg">
                   <CheckCircle2 className="h-6 w-6" />
                </div>
                <div className="text-left">
                   <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest leading-none mb-1">Verified Audit Key</p>
                   <h4 className="text-base md:text-xl text-[#0F172A] font-black uppercase">Option {question.correctAnswer}</h4>
                </div>
              </div>
           </div>
           
           <div className="space-y-8 pt-6 border-t border-emerald-100 relative z-10">
              {expEn && (
                <div className="space-y-2">
                   <p className="text-[8px] font-black uppercase tracking-[0.2em] text-emerald-600/60 flex items-center gap-2">
                      <Languages className="h-3 w-3" /> English Rationale
                   </p>
                   <p className="text-[14px] md:text-[15px] text-slate-700 font-medium leading-relaxed italic antialiased whitespace-pre-wrap">
                      {cleanText(expEn)}
                   </p>
                </div>
              )}
              {/* 1-Line Space Implemented with pt-8 and border-t */}
              {expPa && (
                <div className="space-y-2 pt-8 border-t border-emerald-100/50">
                   <p className="text-[8px] font-black uppercase tracking-[0.2em] text-emerald-600/60 flex items-center gap-2">
                      <Languages className="h-3 w-3" /> ਪੰਜਾਬੀ ਵਿਆਖਿਆ
                   </p>
                   <p className="text-[14px] md:text-[15px] text-slate-700 font-medium leading-relaxed italic antialiased whitespace-pre-wrap">
                      {cleanText(expPa)}
                   </p>
                </div>
              )}
           </div>
        </div>
      )}
    </div>
  );
}
