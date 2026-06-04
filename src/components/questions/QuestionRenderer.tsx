'use client';

import React from 'react';
import { Question } from '@/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card } from '@/components/ui/card';
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
  Line 
} from 'recharts';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface QuestionRendererProps {
  question: Partial<Question>;
  language: 'en' | 'pa' | 'bilingual';
}

const COLORS = ['#F97316', '#3B82F6', '#10B981', '#EF4444', '#8B5CF6'];

export default function QuestionRenderer({ question, language }: QuestionRendererProps) {
  const showEn = language === 'en' || language === 'bilingual';
  const showPa = language === 'pa' || language === 'bilingual';
  
  const questionEn = question.questionEn || "";
  const questionPa = question.questionPa || "";
  
  const instructionEn = question.instructionEn || "";
  const instructionPa = question.instructionPa || "";
  
  const passageEn = question.passageEn || "";
  const passagePa = question.passagePa || "";

  return (
    <div className="space-y-8 w-full text-left font-body">
      {/* 1. Instruction Node */}
      {(instructionEn || instructionPa) && (
        <div className="bg-blue-50/50 border-l-4 border-blue-500 p-6 rounded-r-2xl">
          <p className="text-[10px] font-black uppercase tracking-widest text-blue-600 mb-2">Institutional Instruction</p>
          <div className="space-y-1">
             {showEn && <p className="text-sm font-bold text-blue-900 leading-tight">{instructionEn}</p>}
             {showPa && <p className={cn("text-sm font-medium text-blue-800 leading-tight", language === 'bilingual' ? "italic opacity-70 mt-1" : "")}>{instructionPa}</p>}
          </div>
        </div>
      )}

      {/* 2. Passage Node (Reading Comprehension / Caselet) */}
      {(passageEn || passagePa) && (
        <div className="bg-slate-50 border border-slate-100 p-8 rounded-[2.5rem] shadow-inner">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-6">Case Context:</p>
          <div className="space-y-6">
             {showEn && <div className="text-lg leading-relaxed text-slate-700 whitespace-pre-wrap font-medium">{passageEn}</div>}
             {showPa && <div className={cn("text-lg leading-relaxed text-slate-600 whitespace-pre-wrap font-medium", language === 'bilingual' ? "italic border-t border-slate-200 pt-6 mt-6" : "")}>{passagePa}</div>}
          </div>
        </div>
      )}

      {/* 3. Diagram / Visual Node (High-Fidelity DI Support) */}
      {question.diagramType && question.diagramType !== 'none' && (
        <div className="w-full py-4">
          {question.diagramType === 'table' && question.tableData && (
            <Card className="border-slate-200 overflow-hidden rounded-2xl shadow-xl">
              <Table>
                <TableHeader className="bg-slate-50">
                  <TableRow>
                    {question.tableData.headers.map((h, i) => (
                      <TableHead key={i} className="font-black uppercase text-[10px] tracking-widest text-slate-500">{h}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {question.tableData.rows.map((row, i) => (
                    <TableRow key={i}>
                      {row.map((cell, j) => (
                        <TableCell key={j} className="font-bold text-slate-700">{cell}</TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          )}

          {(question.diagramType === 'barGraph' || question.diagramType === 'pieChart' || question.diagramType === 'lineGraph') && question.chartConfig && (
            <div className="h-[350px] w-full bg-white p-8 rounded-3xl border border-slate-100 shadow-lg">
              <ResponsiveContainer width="100%" height="100%">
                {question.diagramType === 'barGraph' ? (
                  <BarChart data={question.chartConfig.labels.map((l, i) => ({ name: l, value: question.chartConfig!.values[i] }))}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 11, fontWeight: 700}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 11, fontWeight: 700}} />
                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }} />
                    <Bar dataKey="value" fill="#F97316" radius={[6, 6, 0, 0]} />
                  </BarChart>
                ) : question.diagramType === 'pieChart' ? (
                  <PieChart>
                    <Pie
                      data={question.chartConfig.labels.map((l, i) => ({ name: l, value: question.chartConfig!.values[i] }))}
                      cx="50%" cy="50%" innerRadius={70} outerRadius={100} paddingAngle={5} dataKey="value"
                    >
                      {question.chartConfig.labels.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                ) : (
                  <LineChart data={question.chartConfig.labels.map((l, i) => ({ name: l, value: question.chartConfig!.values[i] }))}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 11, fontWeight: 700}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 11, fontWeight: 700}} />
                    <Tooltip />
                    <Line type="monotone" dataKey="value" stroke="#F97316" strokeWidth={5} dot={{r: 7, fill: '#F97316'}} />
                  </LineChart>
                )}
              </ResponsiveContainer>
            </div>
          )}

          {question.diagramType === 'image' && question.imageUrl && (
            <div className="relative w-full aspect-video rounded-[3rem] overflow-hidden border-2 border-slate-100 shadow-2xl">
              <Image src={question.imageUrl} fill alt={question.imageAlt || "Question Diagram"} className="object-contain bg-white" />
            </div>
          )}
        </div>
      )}

      {/* 4. Question Statement Node (Strict Language Separation) */}
      <div className="space-y-5">
        <div className="flex items-center gap-3">
           <div className="h-6 w-1 bg-primary rounded-full" />
           <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Question Node</span>
        </div>
        <div className="space-y-4">
           {showEn && <p className="text-2xl font-black leading-snug text-[#0B1528] tracking-tight">{questionEn}</p>}
           {showPa && <p className={cn("text-2xl font-bold leading-snug text-slate-500 tracking-tight", language === 'bilingual' ? "italic opacity-70" : "")}>{questionPa}</p>}
        </div>
      </div>
    </div>
  );
}
