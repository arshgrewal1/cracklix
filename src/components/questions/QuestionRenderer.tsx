'use client';

import React from 'react';
import { Question } from '@/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { CheckCircle2, LayoutGrid } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';

interface QuestionRendererProps {
  question: Partial<Question>;
  language: 'en' | 'pa' | 'bilingual';
  showSolution?: boolean;
}

const COLORS = ['#F97316', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'];

export default function QuestionRenderer({ question, language, showSolution = false }: QuestionRendererProps) {
  // Logic: Only show one language at a time even in BI mode to save space, 
  // BI mode will default to English if available, else Punjabi.
  const showEn = language === 'en' || (language === 'bilingual' && !!question.questionEn);
  const showPa = language === 'pa' || (language === 'bilingual' && !question.questionEn);
  
  const questionType = question.questionType || 'MCQ';
  const diagramType = question.diagramType || 'none';

  const hasContext = !!(question.instructionEn || question.instructionPa || question.passageEn || question.passagePa);

  return (
    <div className="space-y-3 md:space-y-6 w-full text-left font-body animate-in fade-in duration-500">
      {/* 1. Context Container (Compact) */}
      {hasContext && (
        <div className="bg-slate-50 border border-slate-100 p-3 md:p-5 rounded-xl md:rounded-2xl shadow-inner space-y-2 relative overflow-hidden">
           <div className="flex items-center gap-1.5 relative z-10">
              <LayoutGrid className="h-3 w-3 text-primary" />
              <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">Reference</span>
           </div>
           
           {(question.instructionEn || question.instructionPa) && (
             <div className="space-y-1 relative z-10">
                {showEn && question.instructionEn && <p className="text-[13px] md:text-sm font-bold text-black leading-tight">{question.instructionEn}</p>}
                {showPa && question.instructionPa && <p className="text-[13px] md:text-sm font-bold text-black leading-tight">{question.instructionPa}</p>}
             </div>
           )}

           {(question.passageEn || question.passagePa) && (
             <div className="space-y-3 border-t border-slate-200 pt-3 relative z-10">
                {showEn && question.passageEn && <div className="text-sm md:text-base leading-snug text-black font-medium whitespace-pre-wrap">{question.passageEn}</div>}
                {showPa && question.passagePa && <div className="text-sm md:text-base leading-snug text-black font-medium whitespace-pre-wrap">{question.passagePa}</div>}
             </div>
           )}
        </div>
      )}

      {/* 2. Visual Node */}
      {(question.imageUrl || question.tableData || question.chartConfig) && (
        <div className="space-y-3">
           {question.imageUrl && (
             <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-slate-100 shadow-sm bg-white">
               <Image 
                 src={question.imageUrl} 
                 fill 
                 alt="Diagram" 
                 className="object-contain p-2" 
                 unoptimized 
               />
             </div>
           )}

           {question.tableData && (
             <div className="overflow-hidden rounded-xl border border-slate-200 shadow-sm bg-white scale-[0.9] md:scale-100 origin-top">
               <Table>
                 <TableHeader className="bg-slate-50">
                   <TableRow>
                     {question.tableData.headers?.map((header: string, i: number) => (
                       <TableHead key={i} className="text-center font-black uppercase text-[8px] md:text-[10px] text-black h-8 md:h-10">{header}</TableHead>
                     ))}
                   </TableRow>
                 </TableHeader>
                 <TableBody>
                   {question.tableData.rows?.map((row: any[], i: number) => (
                     <TableRow key={i}>
                       {row.map((cell, j) => (
                         <TableCell key={j} className="text-center font-bold text-black border-r border-slate-50 last:border-0 py-1.5 md:py-2 text-[10px] md:text-xs">{cell}</TableCell>
                       ))}
                     </TableRow>
                   ))}
                 </TableBody>
               </Table>
             </div>
           )}

           {question.chartConfig && (
              <div className="h-[150px] md:h-[250px] w-full bg-white p-2 md:p-4 rounded-xl border border-slate-100">
                 <ResponsiveContainer width="100%" height="100%">
                    {diagramType === 'barGraph' ? (
                       <BarChart data={question.chartConfig.data}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#000', fontSize: 8}} />
                          <YAxis axisLine={false} tickLine={false} tick={{fill: '#000', fontSize: 8}} />
                          <Tooltip />
                          <Bar dataKey="value" fill="#000" radius={[2, 2, 0, 0]} />
                       </BarChart>
                    ) : (
                       <LineChart data={question.chartConfig.data}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                          <XAxis dataKey="name" tick={{ fontSize: 8, fill: '#000' }} />
                          <YAxis tick={{ fontSize: 8, fill: '#000' }} />
                          <Tooltip />
                          <Line type="monotone" dataKey="value" stroke="#000" strokeWidth={2} />
                       </LineChart>
                    )}
                 </ResponsiveContainer>
              </div>
           )}
        </div>
      )}

      {/* 3. Question Statement Hub (Compact & Black) */}
      <div className="space-y-1.5 md:space-y-3">
        <div className="flex items-center gap-1.5">
           <div className={cn("h-4 w-1 rounded-full", questionType === 'ASSERTION_REASON' ? "bg-rose-500" : "bg-black")} />
           <span className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-400">Statement</span>
        </div>
        
        <div className="space-y-2">
           {showEn && question.questionEn && (
              <div className="text-base md:text-xl font-bold leading-snug text-black tracking-tight whitespace-pre-wrap">
                 {question.questionEn}
              </div>
           )}
           {showPa && question.questionPa && (
              <div className="text-base md:text-xl font-bold leading-snug text-black tracking-tight whitespace-pre-wrap">
                 {question.questionPa}
              </div>
           )}
        </div>
      </div>

      {/* 4. Solution Review Hub (Black text) */}
      {showSolution && (
        <div className="mt-4 md:mt-10 p-4 md:p-8 bg-emerald-50 rounded-xl md:rounded-2xl border border-emerald-100 space-y-3 shadow-inner">
           <div className="flex items-center gap-3">
              <div className="h-8 w-8 md:h-12 md:w-12 bg-black rounded-lg flex items-center justify-center text-white">
                 <CheckCircle2 className="h-4 w-4 md:h-6 md:w-6" />
              </div>
              <div className="text-left">
                 <p className="text-[8px] font-black uppercase tracking-[0.3em] text-emerald-700">Solution</p>
                 <h4 className="text-sm md:text-lg text-black font-bold uppercase">Correct Option: {question.correctAnswer}</h4>
              </div>
           </div>
           <div className="pt-3 border-t border-emerald-100/60">
              {showEn && question.explanationEn && (
                <div className="text-xs md:text-base text-black leading-relaxed font-medium whitespace-pre-wrap">
                  {question.explanationEn}
                </div>
              )}
              {showPa && question.explanationPa && (
                <div className="text-xs md:text-base text-black leading-relaxed font-medium whitespace-pre-wrap">
                  {question.explanationPa}
                </div>
              )}
           </div>
        </div>
      )}
    </div>
  );
}
