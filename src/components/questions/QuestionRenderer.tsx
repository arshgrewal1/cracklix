
'use client';

import React from 'react';
import { Question } from '@/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { CheckCircle2, AlertTriangle, Info } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface QuestionRendererProps {
  question: Partial<Question>;
  language: 'en' | 'pa' | 'bilingual';
  showSolution?: boolean;
}

/**
 * @fileOverview High-Density Question Renderer.
 * Optimized for small mobile viewports with absolute black text (#000000).
 */

export default function QuestionRenderer({ question, language, showSolution = false }: QuestionRendererProps) {
  const showEn = language === 'en' || language === 'bilingual';
  const showPa = language === 'pa' || language === 'bilingual';
  
  const isMissingPa = !question.questionPa || question.questionPa === question.questionEn;

  return (
    <div className="w-full text-left font-body animate-in fade-in duration-300">
      
      {/* Reference Context Node (DI/Passage) */}
      {(question.passageEn || question.passagePa || question.imageUrl || question.tableData) && (
        <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 md:p-6 mb-4 space-y-4 shadow-sm">
           <div className="flex items-center gap-2 mb-1">
              <Info className="h-3 w-3 text-primary" />
              <span className="text-[7px] md:text-[9px] font-black uppercase text-slate-400">Context Node</span>
           </div>

           {question.imageUrl && (
             <div className="w-full rounded-lg overflow-hidden border border-slate-200 bg-white flex items-center justify-center min-h-[150px]">
                <img 
                  src={question.imageUrl} 
                  alt="Audit Asset" 
                  className="max-w-full max-h-[400px] object-contain"
                  loading="lazy"
                />
             </div>
           )}

           {question.tableData && (
             <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white no-scrollbar">
                <Table>
                  <TableHeader className="bg-slate-50">
                    <TableRow className="h-8">
                      {question.tableData.headers?.map((header: string, i: number) => (
                        <TableHead key={i} className="text-center font-black uppercase text-[9px] text-[#000000] px-2">{header}</TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {question.tableData.rows?.map((row: any[], i: number) => (
                      <TableRow key={i} className="h-8">
                        {row.map((cell, j) => (
                          <TableCell key={j} className="text-center font-bold text-[#000000] border-r last:border-0 py-1 text-[11px]">{cell}</TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
             </div>
           )}

           {(question.passageEn || question.passagePa) && (
             <div className="space-y-3">
                {showEn && question.passageEn && (
                  <div className="text-[13px] md:text-[15px] leading-relaxed text-[#000000] font-medium whitespace-pre-wrap">
                    {question.passageEn}
                  </div>
                )}
                {showPa && question.passagePa && (
                  <div className="text-[13px] md:text-[15px] leading-relaxed text-[#000000] font-medium whitespace-pre-wrap border-t border-slate-100 pt-3">
                    {question.passagePa}
                  </div>
                )}
             </div>
           )}
        </div>
      )}

      {/* Primary Question Statement */}
      <div className="space-y-3 mb-6">
        {showEn && question.questionEn && (
           <div className="text-[15px] md:text-[18px] font-black leading-snug text-[#000000] tracking-tight whitespace-pre-wrap">
              {question.questionEn}
           </div>
        )}
        
        {showPa && question.questionPa && (
           <div className={cn(
             "text-[15px] md:text-[18px] font-black leading-snug text-[#000000] tracking-tight whitespace-pre-wrap",
             language === 'bilingual' ? "pt-1 border-t border-slate-50" : ""
           )}>
              {question.questionPa}
           </div>
        )}

        {language === 'pa' && isMissingPa && (
          <Badge variant="destructive" className="bg-rose-50 text-rose-600 border-none text-[7px] font-black uppercase">
            <AlertTriangle className="h-2.5 w-2.5 mr-1" /> Translation Pending
          </Badge>
        )}
      </div>

      {/* Solution Review Hub */}
      {showSolution && (
        <div className="mt-6 p-4 bg-emerald-50 rounded-xl border border-emerald-100 space-y-2 animate-in slide-in-from-bottom-2">
           <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <h4 className="text-[12px] text-[#000000] font-black uppercase">Audit Key: {question.correctAnswer}</h4>
           </div>
           <div className="pt-2 border-t border-emerald-100/60 space-y-3">
              {showEn && question.explanationEn && (
                <div className="text-[12px] text-slate-700 leading-relaxed font-bold whitespace-pre-wrap">
                  {question.explanationEn}
                </div>
              )}
              {showPa && question.explanationPa && (
                <div className="text-[12px] text-slate-700 leading-relaxed font-bold whitespace-pre-wrap border-t border-emerald-100/30 pt-2">
                  {question.explanationPa}
                </div>
              )}
           </div>
        </div>
      )}
    </div>
  );
}
