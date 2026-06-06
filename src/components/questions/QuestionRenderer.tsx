'use client';

import React, { useMemo } from 'react';
import { Question } from '@/types';
import { cn } from '@/lib/utils';
import { CheckCircle2, Languages } from 'lucide-react';

interface QuestionRendererProps {
  question: Partial<Question> & { displayId?: string };
  language: 'en' | 'pa' | 'bilingual';
  showSolution?: boolean;
  hideOptions?: boolean;
}

/**
 * @fileOverview Institutional High-Fidelity Question Renderer v25.0.
 * Rules Enforcement:
 * 1. STRICT SEGREGATION: EN/PA show only native tongue. BI shows "Eng / Pun" on ONE LINE.
 * 2. SUBJECT LOCKING: English/Punjabi subjects stay in their native tongue only.
 * 3. NO DUAL NUMBERING: Prefixes are stripped by cleanText.
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
      .replace(/^Q\d+[\.\):\s-]*/i, '')      
      .replace(/^\d+[\.\):\s-]*/, '')         
      .replace(/^ਪ੍ਰਸ਼ਨ\s*\d+[\.\):\s-]*/, '')
      .replace(/^ਪ੍ਰਸ਼ਨ\s*\d+[\.\):\s-]*/, '')
      .replace(/^\*\*|\*\*$/g, '')           
      .replace(/\*\*/g, '')                  
      .trim();
  };

  const subjectId = (question.subjectId || "").toLowerCase();
  const isEnglishSubject = subjectId.includes('english');
  const isPunjabiSubject = subjectId.includes('punjabi');

  // Clean strings
  const qEn = cleanText(question.questionEn);
  const qPa = cleanText(question.questionPa);
  
  // Logic: In "BI" mode, we join with "/" on one line as per "ek dusri line me na ho"
  // But if it's a language subject, we strictly show only that language.

  const expEn = useMemo(() => question.explanationEn || (question as any).explanation || "", [question]);
  const expPa = useMemo(() => question.explanationPa || "", [question]);

  return (
    <div className="w-full text-left font-body space-y-6">
      {question.imageUrl && (
        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 shadow-inner overflow-hidden">
           <img src={question.imageUrl} alt="Asset" className="max-h-[160px] rounded-xl mx-auto object-contain" />
        </div>
      )}

      {/* Question Statement Hub */}
      <div className="text-[16px] md:text-[19px] font-black leading-tight text-[#0F172A] antialiased">
        {language === 'en' || isEnglishSubject ? (
          qEn
        ) : language === 'pa' || isPunjabiSubject ? (
          qPa || qEn
        ) : (
          // Bilingual Mode: Join with slash on one line
          <div className="inline">
            {qEn} {qPa && qPa !== qEn && <span className="text-primary mx-2">/</span>} {qPa !== qEn && qPa}
          </div>
        )}
      </div>

      {/* Options Hub */}
      {!hideOptions && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {['A', 'B', 'C', 'D'].map(key => {
            const en = (question as any)[`option${key}En`] || "";
            const pa = (question as any)[`option${key}Pa`] || "";
            
            if (!en && !pa) return null;

            const cEn = cleanText(en);
            const cPa = cleanText(pa);
            
            return (
                <div key={key} className="flex items-center gap-3 p-4 bg-white border border-slate-100 rounded-xl shadow-sm">
                  <div className="h-8 w-8 rounded-lg bg-slate-50 flex items-center justify-center font-black text-[11px] text-primary shrink-0 border border-slate-100">
                     {key}
                  </div>
                  <div className="text-[14px] md:text-[17px] font-bold text-slate-700 leading-snug">
                      {language === 'en' || isEnglishSubject ? (
                        cEn
                      ) : language === 'pa' || isPunjabiSubject ? (
                        cPa || cEn
                      ) : (
                        // Bilingual Options on one line
                        <div className="inline">
                          {cEn} {cPa && cPa !== cEn && <span className="text-primary/40 mx-1.5">/</span>} {cPa !== cEn && cPa}
                        </div>
                      )}
                  </div>
                </div>
            )
          })}
        </div>
      )}

      {showSolution && (
        <div className="mt-8 p-6 md:p-10 bg-emerald-50/40 rounded-[2.5rem] border border-emerald-100 space-y-8 shadow-sm relative overflow-hidden">
           <div className="absolute top-0 right-0 p-6 opacity-5"><CheckCircle2 className="h-40 w-40" /></div>
           
           <div className="flex items-center justify-between relative z-10">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-lg">
                   <CheckCircle2 className="h-7 w-7" />
                </div>
                <div className="text-left">
                   <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest leading-none mb-1.5">Verified Audit Key</p>
                   <h4 className="text-lg md:text-2xl text-[#0F172A] font-black uppercase">Option {question.correctAnswer}</h4>
                </div>
              </div>
           </div>
           
           <div className="space-y-10 pt-8 border-t border-emerald-100 relative z-10">
              {/* English Logic */}
              {(language !== 'pa' || isEnglishSubject) && expEn && (
                <div className="space-y-3">
                   <p className="text-[9px] font-black uppercase tracking-[0.2em] text-emerald-600/60 flex items-center gap-2">
                      <Languages className="h-4 w-4" /> English Logic
                   </p>
                   <p className="text-[15px] md:text-[16px] text-slate-700 font-medium leading-relaxed italic antialiased whitespace-pre-wrap">
                      {cleanText(expEn)}
                   </p>
                </div>
              )}
              
              {/* 1-Line Space and Divider for Punjabi Logic */}
              {(language === 'bilingual' || language === 'pa' || isPunjabiSubject) && expPa && expPa !== expEn && (
                <div className="space-y-3 pt-6 border-t border-emerald-100/30">
                   <p className="text-[9px] font-black uppercase tracking-[0.2em] text-emerald-600/60 flex items-center gap-2">
                      <Languages className="h-4 w-4" /> ਪੰਜਾਬੀ ਵਿਆਖਿਆ
                   </p>
                   <p className="text-[15px] md:text-[16px] text-slate-700 font-medium leading-relaxed italic antialiased whitespace-pre-wrap">
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
