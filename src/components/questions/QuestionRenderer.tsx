
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
 * @fileOverview High-Fidelity Question Engine v31.0.
 * FIXED: Language visibility logic strictly enforced for English, Punjabi, and Hindi.
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

  const normalizedLang = (language || 'ENGLISH_PUNJABI').toUpperCase();
  const q = question as any;
  
  const formatTime = (seconds: number) => {
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const englishQ = q.englishQuestion || q.questionEn || q.questionText || "";
  const punjabiQ = q.punjabiQuestion || q.questionPa || "";
  const hindiQ = q.hindiQuestion || q.questionHi || "";
  
  const showEn = normalizedLang.includes('ENGLISH');
  const showPa = normalizedLang.includes('PUNJABI');
  const showHi = normalizedLang.includes('HINDI');

  const OPT_LABELS = ['A', 'B', 'C', 'D'];

  return (
    <div className={cn("w-full text-left font-body bg-white text-[#0F172A] p-4 md:p-10 flex flex-col select-none rounded-[1.5rem] md:rounded-[2.5rem] shadow-sm", className)}>
      
      {/* 1. DIAGNOSTIC INFO ROW */}
      {!showSolution && (
        <div className="flex items-center justify-between mb-6 md:mb-10 px-1">
           <div className="flex items-center gap-2 md:gap-4">
              <div className="h-8 w-8 md:h-12 md:w-12 rounded-full bg-[#94A3B8] flex items-center justify-center text-white font-black text-xs md:text-lg shadow-inner">
                 {q.displayId || '1'}
              </div>
              <div className="flex items-center gap-1 text-[#94A3B8] font-bold text-[10px] md:text-sm">
                 <Clock className="h-3 w-3 md:h-5 md:w-5" />
                 <span className="tabular-nums tracking-widest">{formatTime(timeLeft)}</span>
              </div>
              <div className="flex items-center gap-1">
                 <Badge className="bg-[#ECFDF5] text-[#059669] border-none font-black text-[7px] md:text-[10px] px-1.5 py-0 rounded tracking-widest">+ 1.0</Badge>
                 <Badge className="bg-[#FFF1F2] text-[#E11D48] border-none font-black text-[7px] md:text-[10px] px-1.5 py-0 rounded tracking-widest">- 0.25</Badge>
              </div>
           </div>
           <div className="flex items-center gap-4 md:gap-6 text-slate-200">
              <AlertTriangle className="h-4 w-4 md:h-6 md:w-6 hover:text-rose-500 cursor-pointer transition-colors" />
              <Bookmark className="h-4 w-4 md:h-6 md:w-6 hover:text-[#F97316] cursor-pointer transition-colors" />
              <Star className="h-4 w-4 md:h-6 md:w-6 hover:text-amber-500 cursor-pointer transition-colors" />
           </div>
        </div>
      )}

      {/* 2. QUESTION STATEMENTS */}
      <div className="space-y-3 md:space-y-6 mb-6 md:mb-10 px-1">
         {showEn && englishQ && (
           <div className="font-bold text-sm md:text-xl text-[#0F172A] antialiased leading-relaxed tracking-tight">
             <MathText text={englishQ} />
           </div>
         )}
         {showPa && punjabiQ && (
           <div className="font-bold text-sm md:text-xl text-[#0F172A] antialiased leading-relaxed tracking-tight">
             <MathText text={punjabiQ} />
           </div>
         )}
         {showHi && hindiQ && (
           <div className="font-bold text-sm md:text-xl text-[#0F172A] antialiased leading-relaxed tracking-tight">
             <MathText text={hindiQ} />
           </div>
         )}
      </div>

      {/* 3. OPTIONS MATRIX */}
      {!hideOptions && (
        <div className="flex flex-col space-y-2 md:space-y-4">
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
                  "flex items-center gap-4 md:gap-6 p-4 md:p-6 rounded-2xl border-2 transition-all cursor-pointer group/opt",
                  showSolution 
                    ? q.correctAnswer === key ? "bg-[#F0FDF4] border-[#10B981]" 
                      : isSelected ? "bg-[#FEF2F2] border-[#F43F5E]"
                      : "bg-white border-[#F1F5F9]"
                    : isSelected ? "bg-[#FFF7ED] border-[#F97316] shadow-md ring-1 ring-orange-500/20" 
                      : "bg-white border-[#F1F5F9] hover:border-[#CBD5E1]"
                )}
              >
                <span className={cn(
                  "font-black text-lg md:text-2xl shrink-0 w-6 md:w-8 text-left transition-colors",
                  isSelected ? "text-[#F97316]" : "text-[#0B1528] group-hover/opt:text-[#0F172A]"
                )}>
                  {key}
                </span>
                <div className="flex flex-col flex-1 min-w-0 space-y-0.5">
                  {showEn && en && <div className={cn("font-bold text-sm md:text-lg", isSelected ? "text-[#F97316]" : "text-[#0F172A]")}><MathText text={en} /></div>}
                  {showPa && pa && <div className={cn("font-bold text-sm md:text-lg", isSelected ? "text-[#F97316]" : "text-[#0F172A]")}><MathText text={pa} /></div>}
                  {showHi && hi && <div className={cn("font-bold text-sm md:text-lg", isSelected ? "text-[#F97316]" : "text-[#0F172A]")}><MathText text={hi} /></div>}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* 4. SOLUTION HUB */}
      {showSolution && (
        <div className="mt-8 md:mt-10 pt-8 md:pt-10 border-t border-slate-100 space-y-4 md:space-y-5 animate-in fade-in slide-in-from-top-2 duration-500">
           <div className="flex items-center gap-3">
              <Badge className="bg-[#F0FDF4] text-[#047857] border-none font-black text-[10px] md:text-xs uppercase px-4 md:px-5 py-1.5 rounded-lg shadow-sm">
                <Info className="h-3 w-3 mr-2 inline" /> Institutional Solution
              </Badge>
           </div>
           <div className="bg-[#F8FAFC] p-6 md:p-8 rounded-[2rem] border border-[#F1F5F9] text-[#475569] leading-relaxed font-medium text-sm md:text-base">
              <div className="mb-4 flex items-center gap-2">
                 <span className="font-black text-[#0B1528] uppercase text-[10px] tracking-widest">Official Key:</span>
                 <span className="h-6 w-6 rounded-lg bg-[#0B1528] text-white flex items-center justify-center font-black text-xs">{q.correctAnswer}</span>
              </div>
              <MathText text={q.englishExplanation || "Institutional rationale pending audit."} />
           </div>
        </div>
      )}
    </div>
  );
}
