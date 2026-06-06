'use client';

import React, { useMemo } from 'react';
import { Question } from '@/types';
import { cn } from '@/lib/utils';
import { CheckCircle2 } from 'lucide-react';

interface QuestionRendererProps {
  question: Partial<Question> & { displayId?: string };
  language: 'en' | 'pa' | 'bilingual';
  showSolution?: boolean;
  hideOptions?: boolean;
}

/**
 * @fileOverview Institutional High-Fidelity Question Renderer v27.0.
 * Rules Enforcement:
 * 1. STRICT SEGREGATION: "PA" mode renders ONLY Punjabi. "EN" mode renders ONLY English.
 * 2. BI MODE: Joined with "/" on ONE LINE.
 * 3. NO SCROLLING: Optimized font sizing for high-density mobile viewports.
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

  const qEn = cleanText(question.questionEn);
  const qPa = cleanText(question.questionPa);
  
  const expEn = useMemo(() => question.explanationEn || (question as any).explanation || "", [question]);
  const expPa = useMemo(() => question.explanationPa || "", [question]);

  // CONTENT SELECTOR LOGIC
  const renderQuestion = () => {
    if (isEnglishSubject) return qEn;
    if (isPunjabiSubject) return qPa || qEn;

    if (language === 'en') return qEn;
    if (language === 'pa') return qPa || qEn;
    
    // Bilingual Mode
    return (
      <div className="inline">
        {qEn} {qPa && qPa !== qEn && <span className="text-primary mx-2">/</span>} {qPa !== qEn && qPa}
      </div>
    );
  };

  return (
    <div className="w-full text-left font-body space-y-4 md:space-y-6">
      {question.imageUrl && (
        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3 shadow-inner overflow-hidden max-w-md">
           <img src={question.imageUrl} alt="Asset" className="max-h-[120px] rounded-xl mx-auto object-contain" />
        </div>
      )}

      {/* Question Statement Hub */}
      <div className="text-[15px] md:text-[18px] font-black leading-snug text-[#0F172A] antialiased">
        {renderQuestion()}
      </div>

      {/* Options Hub */}
      {!hideOptions && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 md:gap-4">
          {['A', 'B', 'C', 'D'].map(key => {
            const en = (question as any)[`option${key}En`] || "";
            const pa = (question as any)[`option${key}Pa`] || "";
            
            if (!en && !pa) return null;

            const cEn = cleanText(en);
            const cPa = cleanText(pa);
            
            return (
                <div key={key} className="flex items-center gap-3 p-3 md:p-4 bg-white border border-slate-100 rounded-xl shadow-sm">
                  <div className="h-7 w-7 rounded-lg bg-slate-50 flex items-center justify-center font-black text-[10px] text-primary shrink-0 border border-slate-100">
                     {key}
                  </div>
                  <div className="text-[14px] md:text-[16px] font-bold text-slate-700 leading-snug">
                      {isEnglishSubject ? cEn : 
                       isPunjabiSubject ? (cPa || cEn) : 
                       language === 'en' ? cEn : 
                       language === 'pa' ? (cPa || cEn) : 
                       (
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
        <div className="mt-6 p-6 md:p-8 bg-emerald-50/40 rounded-[2rem] border border-emerald-100 space-y-6 shadow-sm relative overflow-hidden">
           <div className="absolute top-0 right-0 p-6 opacity-5"><CheckCircle2 className="h-24 w-24" /></div>
           
           <div className="flex items-center gap-4 relative z-10">
              <div className="h-10 w-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-lg">
                 <CheckCircle2 className="h-6 w-6" />
              </div>
              <div className="text-left">
                 <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest leading-none mb-1">Answer Key</p>
                 <h4 className="text-lg md:text-xl text-[#0F172A] font-black uppercase">Option {question.correctAnswer}</h4>
              </div>
           </div>
           
           <div className="space-y-6 pt-6 border-t border-emerald-100 relative z-10">
              {(isEnglishSubject || (language !== 'pa' && expEn)) && (
                <div className="space-y-2">
                   <p className="text-[8px] font-black uppercase tracking-[0.2em] text-emerald-600/60">English Logic</p>
                   <p className="text-[14px] text-slate-700 font-medium leading-relaxed italic whitespace-pre-wrap">
                      {cleanText(expEn)}
                   </p>
                </div>
              )}
              
              {(isPunjabiSubject || (language !== 'en' && expPa && expPa !== expEn)) && (
                <div className="space-y-2 pt-4 border-t border-emerald-100/30">
                   <p className="text-[8px] font-black uppercase tracking-[0.2em] text-emerald-600/60">ਪੰਜਾਬੀ ਵਿਆਖਿਆ</p>
                   <p className="text-[14px] text-slate-700 font-medium leading-relaxed italic whitespace-pre-wrap">
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
