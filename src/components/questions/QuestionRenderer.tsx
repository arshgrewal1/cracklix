'use client';

import React, { useMemo } from 'react';
import { Question } from '@/types';
import { cn } from '@/lib/utils';
import { CheckCircle2 } from 'lucide-react';

interface QuestionRendererProps {
  question: Partial<Question> & { displayId?: string };
  language: 'en' | 'pa' | 'bilingual';
  showSolution?: boolean;
}

/**
 * @fileOverview High-Fidelity Question Renderer v12.0.
 * Permanent Fix: Strict language isolation and automatic artifact sanitization.
 * Combines English and Punjabi on a single line with '/' in bilingual mode.
 */

export default function QuestionRenderer({ question, language, showSolution = false }: QuestionRendererProps) {
  // Utility to clean text artifacts (A., 1., **, etc)
  const cleanText = (text: string = "") => {
    return text
      .replace(/^[A-D][\.\):\s-]*/i, '') // Remove A., B) etc
      .replace(/^\d+[\.\):\s-]*/, '')    // Remove leading numbers
      .replace(/^\*\*|\*\*$/g, '')       // Remove bold markers
      .replace(/\*\*/g, '')              // Remove all stars
      .trim();
  };

  const renderContent = (en: string = "", pa: string = "") => {
    const cEn = cleanText(en);
    const cPa = cleanText(pa);

    if (language === 'en') return cEn;
    if (language === 'pa') return cPa || cEn; // Fallback to EN if PA is missing
    return `${cEn}${cPa ? ` / ${cPa}` : ''}`;
  };

  const expEn = useMemo(() => question.explanationEn || (question as any).explanation || "", [question]);
  const expPa = useMemo(() => question.explanationPa || "", [question]);

  return (
    <div className="w-full text-left font-body">
      {question.imageUrl && (
        <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 mb-4 shadow-inner overflow-hidden">
           <img src={question.imageUrl} alt="Audit Asset" className="max-h-[300px] rounded-lg mx-auto object-contain" />
        </div>
      )}

      {/* Question Statement */}
      <div className="text-[17px] md:text-[19px] font-black leading-snug text-black whitespace-pre-wrap antialiased mb-6">
        {renderContent(question.questionEn, question.questionPa)}
      </div>

      {/* Options Hub */}
      <div className="space-y-3 mb-6">
        {['A', 'B', 'C', 'D'].map(key => {
           const en = (question as any)[`option${key}En` ] || "";
           const pa = (question as any)[`option${key}Pa`] || "";
           const optionText = renderContent(en, pa);
           
           if (!optionText) return null;
           
           return (
              <div key={key} className="flex items-start gap-3">
                 <span className="font-black text-sm text-primary min-w-[24px]">{key})</span>
                 <p className="text-sm md:text-base font-bold text-slate-800 leading-tight">
                    {optionText}
                 </p>
              </div>
           )
        })}
      </div>

      {showSolution && (
        <div className="mt-6 p-6 bg-emerald-50 rounded-2xl border border-emerald-100 space-y-4 shadow-lg">
           <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-emerald-600 flex items-center justify-center text-white shadow-lg"><CheckCircle2 className="h-4 w-4" /></div>
              <h4 className="text-sm text-[#0F172A] font-black uppercase tracking-tight">Verified Key: {question.correctAnswer}</h4>
           </div>
           
           <div className="space-y-4 pt-4 border-t border-emerald-200/30">
              <div className="space-y-1">
                 <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">Logic / ਵਿਆਖਿਆ</p>
                 <div className="text-sm text-slate-800 leading-relaxed font-bold bg-white/60 p-4 rounded-xl whitespace-pre-wrap border border-emerald-100/50">
                    {renderContent(expEn, expPa)}
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
