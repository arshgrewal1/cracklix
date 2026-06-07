'use client';

import React from 'react';
import { Question, LanguageDisplayMode } from '@/types';
import { cn } from '@/lib/utils';
import MathText from './MathText';
import { Clock, AlertTriangle, Bookmark, Star } from 'lucide-react';
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
 * @fileOverview High-Fidelity Question Engine v27.0.
 * MATCHED: Reverted to A, B, C, D labels and updated selection colors per user screenshot.
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
  
  const showEn = normalizedLang.includes('ENGLISH');
  const showPa = normalizedLang.includes('PUNJABI');

  const OPT_LABELS = ['A', 'B', 'C', 'D'];

  return (
    <div className={cn("w-full text-left font-body bg-white text-[#0F172A] p-4 md:p-8 flex flex-col select-none", className)}>
      
      {/* 1. DIAGNOSTIC INFO ROW */}
      {!showSolution && (
        <div className="flex items-center justify-between mb-8">
           <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-slate-400 flex items-center justify-center text-white font-black text-sm">
                 {q.displayId || '1'}
              </div>
              <div className="flex items-center gap-1.5 text-slate-400 font-bold text-xs">
                 <Clock className="h-4 w-4" />
                 <span className="tabular-nums">{formatTime(timeLeft)}</span>
              </div>
              <div className="flex items-center gap-2">
                 <Badge className="bg-emerald-50 text-emerald-600 border-none font-black text-[10px] px-2 py-0.5 rounded">+ 1.0</Badge>
                 <Badge className="bg-rose-50 text-rose-600 border-none font-black text-[10px] px-2 py-0.5 rounded">- 0.25</Badge>
              </div>
           </div>
           <div className="flex items-center gap-4 text-slate-300">
              <AlertTriangle className="h-5 w-5 hover:text-rose-500 cursor-pointer transition-colors" />
              <Bookmark className="h-5 w-5 hover:text-primary cursor-pointer transition-colors" />
              <Star className="h-5 w-5 hover:text-amber-500 cursor-pointer transition-colors" />
           </div>
        </div>
      )}

      {/* 2. QUESTION STATEMENTS */}
      <div className="space-y-4 mb-8">
         {showEn && englishQ && (
           <div className="font-bold text-lg md:text-xl text-[#0F172A] antialiased leading-relaxed">
             <MathText text={englishQ} />
           </div>
         )}
         {showPa && punjabiQ && (
           <div className="font-bold text-lg md:text-xl text-[#0F172A] antialiased leading-relaxed">
             <MathText text={punjabiQ} />
           </div>
         )}
      </div>

      {/* 3. OPTIONS MATRIX */}
      {!hideOptions && (
        <div className="flex flex-col space-y-3">
          {OPT_LABELS.map((key, idx) => {
            const en = q[`option${key}English`];
            const pa = q[`option${key}Punjabi`];
            
            const isSelected = selectedAnswer === idx;
            const isCorrect = q.correctAnswer === key;

            return (
              <div 
                key={key} 
                onClick={() => onSelect?.(idx)} 
                className={cn(
                  "flex items-center gap-6 p-5 rounded-2xl border-2 transition-all cursor-pointer",
                  showSolution 
                    ? isCorrect ? "bg-emerald-50 border-emerald-500" 
                      : isSelected ? "bg-rose-50 border-rose-500"
                      : "bg-white border-slate-100"
                    : isSelected ? "bg-orange-50 border-primary shadow-lg shadow-orange-500/10" 
                      : "bg-white border-slate-100 hover:border-slate-200"
                )}
              >
                <span className={cn(
                  "font-black text-lg md:text-xl shrink-0 w-6 text-left",
                  isSelected ? "text-primary" : "text-slate-400"
                )}>
                  {key}
                </span>
                <div className="flex flex-col flex-1 min-w-0 space-y-1">
                  {showEn && en && <div className={cn("font-bold text-base md:text-lg", isSelected ? "text-primary" : "text-[#0F172A]")}><MathText text={en} /></div>}
                  {showPa && pa && <div className={cn("font-bold text-base md:text-lg", isSelected ? "text-primary" : "text-[#0F172A]")}><MathText text={pa} /></div>}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* 4. SOLUTION HUB */}
      {showSolution && (
        <div className="mt-8 pt-8 border-t border-slate-100 space-y-4 animate-in fade-in slide-in-from-top-4">
           <Badge className="bg-emerald-100 text-emerald-700 border-none font-black text-xs uppercase px-4 py-1">Key: ({q.correctAnswer})</Badge>
           <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 italic text-slate-600">
              <MathText text={q.englishExplanation || "Detailed logic pending audit."} />
           </div>
        </div>
      )}
    </div>
  );
}