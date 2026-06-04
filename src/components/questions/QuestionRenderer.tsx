'use client';

import React from 'react';
import { Question } from '@/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card } from '@/components/ui/card';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { CheckCircle2, Info, LayoutGrid, ImageIcon, Map as MapIcon, BarChart3 } from 'lucide-react';
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

/**
 * @fileOverview Universal Question Renderer Hub.
 * Features: High-fidelity image rendering, interactive DI charts, and bilingual gating.
 */
export default function QuestionRenderer({ question, language, showSolution = false }: QuestionRendererProps) {
  const showEn = language === 'en' || language === 'bilingual';
  const showPa = language === 'pa' || language === 'bilingual';
  
  const questionEn = question.questionEn || "";
  const questionPa = question.questionPa || "";
  
  const instructionEn = question.instructionEn || "";
  const instructionPa = question.instructionPa || "";
  
  const passageEn = question.passageEn || "";
  const passagePa = question.passagePa || "";

  const explanationEn = question.explanationEn || "";
  const explanationPa = question.explanationPa || "";

  // Absolute Logic: If language is 'pa', only show Punjabi.
  // If 'en', only show English. If 'bilingual', show both.
  
  return (
    <div className="space-y-10 w-full text-left font-body">
      {/* 1. Instruction Node - For shared context sets */}
      {(instructionEn || instructionPa) && (
        <div className="bg-blue-50/80 border-l-4 border-blue-500 p-6 rounded-r-2xl flex gap-4 shadow-sm">
          <Info className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
             <p className="text-[10px] font-black uppercase tracking-widest text-blue-600 mb-1">Audit Instruction</p>
             {showEn && instructionEn && <p className="text-sm font-bold text-blue-900 leading-tight">{instructionEn}</p>}
             {showPa && instructionPa && <p className={cn("text-sm font-medium text-blue-800 leading-tight", language === 'bilingual' ? "italic opacity-70 mt-1" : "")}>{instructionPa}</p>}
          </div>
        </div>
      )}

      {/* 2. Visual Content Node (Image / Diagram / Chart / Table) */}
      <div className="space-y-8">
        
        {/* A. Official Diagrams / Maps / Images */}
        {question.imageUrl && (
          <div className="w-full space-y-3">
            <div className="flex items-center gap-2 px-2">
               <ImageIcon className="h-3.5 w-3.5 text-slate-400" />
               <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Reference Diagram</span>
            </div>
            <div className="relative w-full aspect-video rounded-[2.5rem] overflow-hidden border-2 border-slate-100 shadow-3xl bg-white group">
              <Image 
                src={question.imageUrl} 
                fill 
                alt="Question Diagram" 
                className="object-contain p-6 transition-transform duration-700 group-hover:scale-105" 
                unoptimized 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent pointer-events-none" />
            </div>
          </div>
        )}

        {/* B. Reading Comprehension / Seating Arrangement Text */}
        {(passageEn || passagePa) && (
          <div className="bg-slate-50 border border-slate-100 p-8 rounded-[2.5rem] shadow-inner max-h-[400px] overflow-y-auto custom-scrollbar">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-6 flex items-center gap-2">
              <LayoutGrid className="h-3 w-3" /> Shared Context Hub:
            </p>
            <div className="space-y-6">
               {showEn && passageEn && <div className="text-base md:text-lg leading-relaxed text-slate-700 whitespace-pre-wrap font-medium">{passageEn}</div>}
               {showPa && passagePa && <div className={cn("text-base md:text-lg leading-relaxed text-slate-600 whitespace-pre-wrap font-medium", language === 'bilingual' ? "italic border-t border-slate-200 pt-6 mt-6" : "")}>{passagePa}</div>}
            </div>
          </div>
        )}

        {/* C. DI Table Component */}
        {question.diagramType === 'table' && question.tableData && (
          <div className="overflow-hidden rounded-[2.5rem] border border-slate-200 shadow-2xl bg-white">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  {question.tableData.headers?.map((header: string, i: number) => (
                    <TableHead key={i} className="text-center font-black uppercase text-[10px] tracking-widest text-[#0B1528] h-14">{header}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {question.tableData.rows?.map((row: any[], i: number) => (
                  <TableRow key={i} className="hover:bg-slate-50/50">
                    {row.map((cell, j) => (
                      <TableCell key={j} className="text-center font-bold text-slate-600 border-r border-slate-50 last:border-0 py-4">{cell}</TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {/* D. DI Live Graphs (Recharts) */}
        {['barGraph', 'pieChart', 'lineGraph'].includes(question.diagramType || '') && question.chartConfig && (
          <Card className="p-10 rounded-[3rem] border-none shadow-3xl bg-white">
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                {question.diagramType === 'barGraph' ? (
                  <BarChart data={question.chartConfig.data}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 11, fontWeight: 700}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 11, fontWeight: 700}} />
                    <Tooltip cursor={{fill: '#F8FAFC'}} contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 20px 40px rgba(0,0,0,0.1)'}} />
                    <Bar dataKey="value" fill="#F97316" radius={[6, 6, 0, 0]} />
                  </BarChart>
                ) : question.diagramType === 'pieChart' ? (
                  <PieChart>
                    <Pie
                      data={question.chartConfig.data}
                      cx="50%" cy="50%"
                      innerRadius={70}
                      outerRadius={110}
                      paddingAngle={8}
                      dataKey="value"
                    >
                      {question.chartConfig.data?.map((_: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                ) : (
                  <LineChart data={question.chartConfig.data}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 11, fontWeight: 700}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 11, fontWeight: 700}} />
                    <Tooltip />
                    <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={5} dot={{r: 8, fill: '#3b82f6', strokeWidth: 3, stroke: '#fff'}} />
                  </LineChart>
                )}
              </ResponsiveContainer>
            </div>
            {question.chartConfig.caption && (
               <p className="text-center text-[11px] font-black uppercase text-slate-400 mt-8 tracking-[0.2em]">{question.chartConfig.caption}</p>
            )}
          </Card>
        )}
      </div>

      {/* 3. Question Statement Node */}
      <div className="space-y-6">
        <div className="flex items-center gap-3">
           <div className="h-6 w-1 bg-primary rounded-full shadow-[0_0_12px_rgba(249,115,22,0.5)]" />
           <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Statement Node</span>
        </div>
        <div className="space-y-6">
           {showEn && questionEn && <p className="text-2xl md:text-3xl font-black leading-tight text-[#0B1528] tracking-tight antialiased">{questionEn}</p>}
           {showPa && questionPa && <p className={cn("text-2xl md:text-3xl font-bold leading-tight text-slate-700 tracking-tight", language === 'bilingual' ? "italic opacity-70 border-t border-slate-100 pt-6 mt-6" : "")}>{questionPa}</p>}
        </div>
      </div>

      {/* 4. Detailed Solution Review Node */}
      {showSolution && (
        <div className="mt-20 p-12 bg-emerald-50 rounded-[4rem] border border-emerald-100 space-y-10 shadow-inner">
           <div className="flex items-center gap-6">
              <div className="h-16 w-16 bg-emerald-600 rounded-2xl flex items-center justify-center text-white shadow-2xl shadow-emerald-900/30">
                 <CheckCircle2 className="h-10 w-10" />
              </div>
              <div className="text-left">
                 <p className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-600 mb-1">Institutional Audit Hub</p>
                 <h4 className="font-headline font-black text-3xl text-emerald-900 uppercase">Correct Answer: Option {question.correctAnswer}</h4>
              </div>
           </div>
           <div className="space-y-8 pt-10 border-t border-emerald-100/60">
              <div className="flex items-center gap-3">
                 <BarChart3 className="h-4 w-4 text-emerald-600" />
                 <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Audit Rationale:</span>
              </div>
              {showEn && explanationEn && <div className="text-lg text-emerald-800 leading-relaxed font-medium whitespace-pre-wrap">{explanationEn}</div>}
              {showPa && explanationPa && <div className={cn("text-lg text-emerald-700 leading-relaxed font-medium whitespace-pre-wrap", language === 'bilingual' ? "italic pt-8 mt-8 border-t border-emerald-100/40" : "")}>{explanationPa}</div>}
           </div>
        </div>
      )}
    </div>
  );
}
