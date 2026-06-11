
'use client';

import React from 'react';
import { Question, LanguageDisplayMode } from '@/types';
import { cn } from '@/lib/utils';
import MathText from './MathText';
import { Clock, AlertTriangle, Bookmark, Star, Info } from 'lucide-react';
import { useExamStore } from '@/store/useExamStore';
import { Badge } from '@/components/ui/badge';

interface QuestionRendererProps {
  question: Partial<Question> & { displayId?: string };
  language: LanguageDisplayMode | 'en' | 'pa' | 'hi' | 'bilingual' | string;
  showSolution?: boolean;
  hideOptions?: boolean;
  selectedAnswer?: number; 
  onSelect?: (index: number) => void;
  className?: string;
}

/**
 * @fileOverview High-Fidelity Question Engine v36.0 (Compact Optimized).
 * UPDATED: Reduced padding and font sizes for "Testbook-style" high-density layout.
 */
export default function QuestionRenderer({ 
  question, 
  language = 'ENGLISH_PUNJABI',
  showSolution = false,
  hideOptions = false,
  selectedAnswer,
  onSelect,
  className
}: QuestionRendererProps) {
  const timeLeft = useExamStore(s => s.timeLeft);
  
  if (!question) return null;

  const q = question as any;
  const normalizedLang = (language || 'ENGLISH_PUNJABI').toUpperCase();
  
  const sectionName = (q.sectionId || "").toUpperCase();
  const subjectId = (q.subjectId || "").toUpperCase();
  
  let renderLang = normalizedLang;
  
  if (sectionName.includes("ENGLISH") || subjectId.includes("ENGLISH")) {
    renderLang = "ENGLISH";
  } else if (sectionName.includes("PUNJABI") || subjectId.includes("PUNJABI")) {
    renderLang = "PUNJABI";
  } else if (sectionName.includes("HINDI") || subjectId.includes("HINDI")) {
    renderLang = "HINDI";
  }
  
  const showEn = renderLang.includes('ENGLISH');
  const showPa = renderLang.includes('PUNJABI');
  const showHi = renderLang.includes('HINDI');

  const formatTime = (seconds: number) => {
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const englishQ = q.englishQuestion || q.questionEn || q.questionText || "";
  const punjabiQ = q.punjabiQuestion || q.questionPa || "";
  const hindiQ = q.hindiQuestion || q.questionHi || "";
  
  const OPT_LABELS = ['A', 'B', 'C', 'D'];

  return (
    <div className={cn("w-full text-left font-body bg-white text-[#0F172A] p-3 md:p-8 flex flex-col select-none rounded-xl md:rounded-3xl shadow-sm", className)}>
      
      {/* 1. QUESTION INFO ROW */}
      {!showSolution && (
        <div className="flex items-center justify-between mb-4 md:mb-6 px-1">
           <div className="flex items-center gap-3 md:gap-4">
              <div className="h-7 w-7 md:h-10 md:w-10 rounded-full bg-[#334155] flex items-center justify-center text-white font-black text-[10px] md:text-base shadow-inner">
                 {q.displayId || '1'}
              </div>
              <div className="flex items-center gap-1 text-slate-400 font-bold text-[9px] md:text-xs">
                 <Clock className="h-3 w-3 md:h-4 md:w-4" />
                 <span className="tabular-nums tracking-widest">{formatTime(timeLeft)}</span>
              </div>
              <div className="flex items-center gap-1">
                 <Badge className="bg-[#ECFDF5] text-[#059669] border-none font-black text-[6px] md:text-[9px] px-1.5 py-0 rounded tracking-widest">+ 1.0</Badge>
                 <Badge className="bg-[#FFF1F2] text-[#E11D48] border-none font-black text-[6px] md:text-[9px] px-1.5 py-0 rounded tracking-widest">- 0.25</Badge>
              </div>
           </div>
           <div className="flex items-center gap-3 md:gap-5 text-slate-200">
              <AlertTriangle className="h-4 w-4 md:h-5 md:w-5 hover:text-rose-500 cursor-pointer transition-colors" />
              <Bookmark className="h-4 w-4 md:h-5 md:w-5 hover:text-[#F97316] cursor-pointer transition-colors" />
              <Star className="h-4 w-4 md:h-5 md:w-5 hover:text-amber-500 cursor-pointer transition-colors" />
           </div>
        </div>
      )}

      {/* 2. QUESTION STATEMENTS */}
      <div className="space-y-2 md:space-y-4 mb-5 md:mb-8 px-1">
         {showEn && englishQ && (
           <div className="font-bold text-[14px] md:text-lg text-[#0F172A] antialiased leading-relaxed tracking-tight">
             <MathText text={englishQ} />
           </div>
         )}
         {showPa && punjabiQ && (
           <div className="font-bold text-[14px] md:text-lg text-[#0F172A] antialiased leading-relaxed tracking-tight">
             <MathText text={punjabiQ} />
           </div>
         )}
         {showHi && hindiQ && (
           <div className="font-bold text-[14px] md:text-lg text-[#0F172A] antialiased leading-relaxed tracking-tight">
             <MathText text={hindiQ} />
           </div>
         )}
      </div>

      {/* 3. OPTIONS MATRIX */}
      {!hideOptions && (
        <div className="flex flex-col space-y-2 md:space-y-3">
          {OPT_LABELS.map((key, idx) => {
            const en = q[`option${key}English`];
            const pa = q[`option${key}Punjabi`];
            const hi = q[`option${key}Hindi`];
            
            const isSelected = selectedAnswer === idx;

            return (
              <div 
                key={key} 
                onClick={() => onSelect?.(idx)} 
                className={cn(
                  "flex items-center gap-3 md:gap-5 p-3 md:p-4 rounded-xl border transition-all cursor-pointer group/opt",
                  showSolution 
                    ? q.correctAnswer === key ? "bg-[#F0FDF4] border-[#10B981]" 
                      : isSelected ? "bg-[#FEF2F2] border-[#F43F5E]"
                      : "bg-white border-[#F1F5F9]"
                    : isSelected ? "bg-[#FFF7ED] border-[#F97316] ring-1 ring-orange-500/20" 
                      : "bg-white border-[#F1F5F9] hover:border-[#CBD5E1]"
                )}
              >
                <span className={cn(
                  "font-black text-base md:text-xl shrink-0 w-5 md:w-7 text-left transition-colors",
                  isSelected ? "text-[#F97316]" : "text-[#334155] group-hover/opt:text-[#0F172A]"
                )}>
                  {key}
                </span>
                <div className="flex flex-col flex-1 min-w-0 space-y-0.5">
                  {showEn && en && <div className={cn("font-bold text-[13px] md:text-base", isSelected ? "text-[#F97316]" : "text-[#334155]")}><MathText text={en} /></div>}
                  {showPa && pa && <div className={cn("font-bold text-[13px] md:text-base", isSelected ? "text-[#F97316]" : "text-[#334155]")}><MathText text={pa} /></div>}
                  {showHi && hi && <div className={cn("font-bold text-[13px] md:text-base", isSelected ? "text-[#F97316]" : "text-[#334155]")}><MathText text={hi} /></div>}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* 4. SOLUTION HUB */}
      {showSolution && (
        <div className="mt-6 md:mt-10 pt-6 md:pt-10 border-t border-slate-100 space-y-4 md:space-y-6 animate-in fade-in slide-in-from-top-1 duration-500">
           <div className="flex items-center gap-3">
              <Badge className="bg-[#F0FDF4] text-[#047857] border-none font-black text-[9px] md:text-xs uppercase px-3 md:px-4 py-1 rounded shadow-sm">
                <Info className="h-3 w-3 mr-2 inline" /> Solution Logic
              </Badge>
           </div>
           
           <div className="bg-[#F8FAFC] p-5 md:p-8 rounded-xl md:rounded-3xl border border-[#F1F5F9] text-slate-600 leading-relaxed font-medium text-xs md:text-base space-y-5">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-200/50">
                 <span className="font-black text-[#0B1528] uppercase text-[9px] tracking-widest">Correct Answer:</span>
                 <span className="h-6 w-6 rounded-md bg-[#0B1528] text-white flex items-center justify-center font-black text-xs">{q.correctAnswer}</span>
              </div>
              
              <div className="space-y-5">
                 {showEn && q.englishExplanation && (
                    <div className="space-y-1.5">
                       <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">English Explanation</p>
                       <MathText text={q.englishExplanation} className="text-inherit" />
                    </div>
                 )}
                 {showPa && q.punjabiExplanation && (
                    <div className="space-y-1.5">
                       <p className="text-[9px] font-black text-blue-600 uppercase tracking-widest">ਪੰਜਾਬੀ ਵਿਆਖਿਆ</p>
                       <MathText text={q.punjabiExplanation} className="text-inherit" />
                    </div>
                 )}
                 {showHi && q.hindiExplanation && (
                    <div className="space-y-1.5">
                       <p className="text-[9px] font-black text-orange-600 uppercase tracking-widest">हिन्दी व्याख्या</p>
                       <MathText text={q.hindiExplanation} className="text-inherit" />
                    </div>
                 )}
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
