'use client';

import React from 'react';
import { Question } from '@/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { CheckCircle2, LayoutGrid, FileText } from 'lucide-react';
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
  const showEn = language === 'en' || language === 'bilingual';
  const showPa = language === 'pa' || language === 'bilingual';
  
  const questionType = question.questionType || 'MCQ';
  const diagramType = question.diagramType || 'none';

  const hasContext = !!(question.instructionEn || question.instructionPa || question.passageEn || question.passagePa);

  return (
    <div className="space-y-4 md:space-y-10 w-full text-left font-body animate-in fade-in duration-500">
      {/* 1. Context Container */}
      {hasContext && (
        <div className="bg-slate-50 border border-slate-100 p-4 md:p-8 rounded-2xl md:rounded-[2.5rem] shadow-inner space-y-3 md:space-y-6 relative overflow-hidden">
           <div className="flex items-center gap-2 relative z-10">
              <LayoutGrid className="h-3 w-3 text-primary" />
              <span className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-slate-400">Reference Node</span>
           </div>
           
           {(question.instructionEn || question.instructionPa) && (
             <div className="space-y-1 md:space-y-2 relative z-10">
                {showEn && question.instructionEn && <p className="text-xs md:text-sm font-bold text-slate-800 leading-relaxed">{question.instructionEn}</p>}
                {showPa && question.instructionPa && <p className="text-xs md:text-sm font-medium text-slate-600 leading-relaxed">{question.instructionPa}</p>}
             </div>
           )}

           {(question.passageEn || question.passagePa) && (
             <div className="space-y-4 md:space-y-6 border-t border-slate-200 pt-4 md:pt-6 relative z-10">
                {showEn && question.passageEn && <div className="text-sm md:text-base leading-relaxed text-slate-700 whitespace-pre-wrap font-medium">{question.passageEn}</div>}
                {showPa && question.passagePa && <div className={cn("text-sm md:text-base leading-relaxed text-slate-600 whitespace-pre-wrap font-medium", showEn ? "border-t border-slate-100 pt-4 mt-4" : "")}>{question.passagePa}</div>}
             </div>
           )}
        </div>
      )}

      {/* 2. Visual Node */}
      {(question.imageUrl || question.tableData || question.chartConfig) && (
        <div className="space-y-4 md:space-y-8">
           {question.imageUrl && (
             <div className="relative w-full aspect-video rounded-xl md:rounded-[2.5rem] overflow-hidden border border-slate-100 shadow-xl bg-white group">
               <Image 
                 src={question.imageUrl} 
                 fill 
                 alt="Diagram" 
                 className="object-contain p-2 md:p-6 transition-transform duration-700 group-hover:scale-105" 
                 unoptimized 
               />
             </div>
           )}

           {question.tableData && (
             <div className="overflow-hidden rounded-xl md:rounded-[2.5rem] border border-slate-200 shadow-xl bg-white scale-[0.9] md:scale-100 origin-top">
               <Table>
                 <TableHeader className="bg-slate-50">
                   <TableRow>
                     {question.tableData.headers?.map((header: string, i: number) => (
                       <TableHead key={i} className="text-center font-black uppercase text-[8px] md:text-[10px] tracking-widest text-[#0B1528] h-10 md:h-14">{header}</TableHead>
                     ))}
                   </TableRow>
                 </TableHeader>
                 <TableBody>
                   {question.tableData.rows?.map((row: any[], i: number) => (
                     <TableRow key={i} className="hover:bg-slate-50 transition-colors">
                       {row.map((cell, j) => (
                         <TableCell key={j} className="text-center font-bold text-slate-600 border-r border-slate-50 last:border-0 py-2 md:py-4 text-[10px] md:text-sm">{cell}</TableCell>
                       ))}
                     </TableRow>
                   ))}
                 </TableBody>
               </Table>
             </div>
           )}

           {question.chartConfig && (
              <div className="h-[200px] md:h-[300px] w-full bg-white p-4 md:p-8 rounded-xl md:rounded-[2.5rem] border border-slate-100 shadow-lg">
                 <ResponsiveContainer width="100%" height="100%">
                    {diagramType === 'barGraph' ? (
                       <BarChart data={question.chartConfig.data}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748B', fontSize: 8}} />
                          <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748B', fontSize: 8}} />
                          <Tooltip cursor={{fill: '#F8FAFC'}} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 20px 40px rgba(0,0,0,0.1)', fontSize: '10px' }} />
                          <Bar dataKey="value" fill="#F97316" radius={[2, 2, 0, 0]} />
                       </BarChart>
                    ) : diagramType === 'pieChart' ? (
                       <PieChart>
                          <Pie data={question.chartConfig.data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={60} label={{ fontSize: 8 }}>
                             {question.chartConfig.data.map((_: any, index: number) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                             ))}
                          </Pie>
                          <Tooltip />
                       </PieChart>
                    ) : (
                       <LineChart data={question.chartConfig.data}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 8 }} />
                          <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 8 }} />
                          <Tooltip />
                          <Line type="monotone" dataKey="value" stroke="#F97316" strokeWidth={2} dot={{ r: 3, fill: '#F97316' }} />
                       </LineChart>
                    )}
                 </ResponsiveContainer>
              </div>
           )}
        </div>
      )}

      {/* 3. Question Statement Hub */}
      <div className="space-y-3 md:space-y-6">
        <div className="flex items-center gap-2">
           <div className={cn(
             "h-4 md:h-6 w-1 rounded-full", 
             questionType === 'ASSERTION_REASON' ? "bg-rose-500" : 
             questionType === 'MATCHING' ? "bg-blue-500" : "bg-primary"
           )} />
           <span className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Statement</span>
        </div>
        
        <div className="space-y-4 md:space-y-6">
           {showEn && question.questionEn && (
              <div className="text-xl md:text-3xl font-black leading-tight text-[#0B1528] tracking-tight whitespace-pre-wrap">
                 {question.questionEn}
              </div>
           )}
           {showPa && question.questionPa && (
              <div className={cn(
                "text-xl md:text-3xl font-black leading-tight text-[#0B1528] tracking-tight whitespace-pre-wrap", 
                showEn ? "border-t border-slate-100 pt-4 md:pt-6" : ""
              )}>
                 {question.questionPa}
              </div>
           )}
        </div>
      </div>

      {/* 4. Solution Review Hub */}
      {showSolution && (
        <div className="mt-8 md:mt-20 p-6 md:p-12 bg-emerald-50 rounded-2xl md:rounded-[4rem] border border-emerald-100 space-y-6 md:space-y-10 shadow-inner">
           <div className="flex items-center gap-4 md:gap-6">
              <div className="h-10 w-10 md:h-16 md:w-16 bg-emerald-600 rounded-xl md:rounded-2xl flex items-center justify-center text-white shadow-xl">
                 <CheckCircle2 className="h-6 w-6 md:h-10 md:w-10" />
              </div>
              <div className="text-left">
                 <p className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.3em] text-emerald-600 mb-0.5 md:mb-1">Audit Rationale</p>
                 <h4 className="font-headline font-black text-lg md:text-3xl text-emerald-900 uppercase">Correct Audit: Option {question.correctAnswer}</h4>
              </div>
           </div>
           <div className="space-y-4 md:space-y-8 pt-6 md:pt-10 border-t border-emerald-100/60">
              {showEn && question.explanationEn && (
                <div className="text-sm md:text-lg text-emerald-800 leading-relaxed font-medium whitespace-pre-wrap">
                  {question.explanationEn}
                </div>
              )}
              {showPa && question.explanationPa && (
                <div className={cn(
                  "text-sm md:text-lg text-emerald-700 leading-relaxed font-medium whitespace-pre-wrap", 
                  showEn ? "pt-4 md:pt-8 mt-4 md:mt-8 border-t border-emerald-100/40" : ""
                )}>
                  {question.explanationPa}
                </div>
              )}
           </div>
        </div>
      )}
    </div>
  );
}
