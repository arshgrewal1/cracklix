
'use client';

import React from 'react';
import { Trophy, ShieldCheck, Target, Zap, Clock, BookOpen, Award } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from "@/components/ui/badge";

interface ReportPDFProps {
  studentName: string;
  examTitle: string;
  score: string | number;
  rank: string | number;
  totalCandidates: number;
  attemptAccuracy: string | number;
  timeTaken: string;
  correct: number;
  wrong: number;
  skipped: number;
  total: number;
  date: string;
  resultId: string;
  percentile: number;
  subjects?: any[];
  grade?: string;
  isQualified?: boolean;
  duration?: number | string;
  attemptNumber?: number;
}

/**
 * @fileOverview Institutional Portrait PDF Layout Hub v20.0.
 * FIXED: Extreme Overlap resolved by implementing boxed stat nodes with explicit flex-spacing.
 * UPDATED: Domain strictly synchronized to cracklix.in.
 * TYPOGRAPHY: Strict Title Case across all nodes.
 */
export default function ReportPDF(props: ReportPDFProps) {
  const {
    studentName, examTitle, score, rank, totalCandidates,
    attemptAccuracy, timeTaken, correct, wrong, skipped,
    total, date, resultId, percentile, subjects = [], grade = "F",
    isQualified, duration, attemptNumber = 1
  } = props;

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent('https://cracklix.in/results/view?id=' + resultId)}`;

  return (
    <div 
      className="bg-white p-0 m-0 box-border text-center font-body overflow-hidden flex flex-col items-center"
      style={{ width: '794px', height: '1123px', minHeight: '1123px', maxHeight: '1123px' }}
    >
      {/* 1. Header Hub */}
      <div className="w-full flex items-center justify-between px-10 py-6 border-b border-slate-100 bg-slate-50/20 shrink-0">
         <div className="flex items-center gap-6">
            <div className="h-16 w-16 relative bg-white border border-slate-100 rounded-2xl shadow-md overflow-hidden p-1.5 flex items-center justify-center">
               <img src="/logo/cracklix-icon.png" alt="Logo" className="h-full w-full object-contain" crossOrigin="anonymous" />
            </div>
            <div className="space-y-0.5 text-left">
               <h2 className="text-2xl font-black text-[#0F172A] tracking-tighter leading-none">Cracklix</h2>
               <p className="text-[10px] font-bold text-primary">Smart preparation portal</p>
            </div>
         </div>
         <div className="text-right space-y-1">
            <p className="text-sm font-black text-[#0F172A]">Performance report</p>
            <p className="text-[8px] font-bold text-slate-400 tabular-nums">Ref Id: {resultId?.slice(0, 15)}</p>
         </div>
      </div>

      <div className="w-full flex-1 p-8 space-y-8 flex flex-col items-center overflow-hidden">
         
         {/* 2. Candidate Identity Box - FIXED OVERLAP */}
         <div className="w-full bg-white rounded-[2.5rem] p-10 border border-slate-100 flex flex-col items-center justify-center shadow-sm relative overflow-hidden text-center min-h-[200px]">
            <div className="space-y-4 w-full">
               <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Candidate identity</p>
               <h1 className="text-4xl font-black text-[#0F172A] leading-tight">
                  {studentName}
               </h1>
               <p className="text-xl font-bold text-slate-500 line-clamp-1">{examTitle}</p>
            </div>
            
            {/* Boxed Stat Node */}
            <div className="pt-8 border-t border-slate-100 mt-8 w-full max-w-2xl mx-auto grid grid-cols-3 gap-10">
               <div className="flex flex-col items-center gap-2">
                  <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">Attempt date</p>
                  <p className="text-base font-black text-[#0F172A] tabular-nums leading-none">{date}</p>
               </div>
               <div className="flex flex-col items-center gap-2 border-x border-slate-50 px-4">
                  <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">Time taken</p>
                  <p className="text-base font-black text-[#0F172A] tabular-nums leading-none">{timeTaken}</p>
               </div>
               <div className="flex flex-col items-center gap-2">
                  <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">Attempt #</p>
                  <p className="text-base font-black text-primary tabular-nums leading-none">{attemptNumber}</p>
               </div>
            </div>
         </div>

         {/* 3. Merit Standing - HARDENED VERTICAL SPACING */}
         <div className="w-full bg-[#0F172A] rounded-[2.5rem] p-14 text-white text-center flex flex-col items-center justify-center shadow-2xl relative overflow-hidden min-h-[380px]">
            <div className="absolute top-0 right-0 p-8 opacity-5 rotate-12 group-hover:scale-110 transition-transform duration-1000"><Trophy className="h-64 w-64 text-primary" /></div>
            
            <div className="relative z-10 space-y-12 flex flex-col items-center w-full">
               <div className="space-y-4">
                  <p className="text-[11px] font-black text-primary uppercase tracking-[0.3em]">Your Punjab rank</p>
                  <span className="text-[140px] font-[900] tabular-nums tracking-tighter leading-none block drop-shadow-[0_20px_40px_rgba(37,99,235,0.4)]">
                     #{rank}
                  </span>
               </div>
               
               {/* Fixed Height Buffer for candidate count */}
               <div className="h-20 flex flex-col items-center justify-center gap-4">
                  <span className="text-[22px] font-bold text-slate-400 tabular-nums uppercase tracking-[0.1em]">
                     / {totalCandidates.toLocaleString()} Candidates
                  </span>
                  <Badge className="bg-emerald-500 text-white border-none font-black text-[10px] px-10 py-3 rounded-full shadow-2xl uppercase tracking-widest">
                     Verified Result Standing
                  </Badge>
               </div>
            </div>
         </div>

         {/* 4. KPI Matrix */}
         <div className="grid grid-cols-4 gap-4 w-full">
            <KPIBox label="Net score" val={score} color="text-primary" />
            <KPIBox label="Percentile" val={`${percentile}%`} color="text-purple-600" />
            <KPIBox label="Accuracy" val={`${attemptAccuracy}%`} color="text-emerald-600" />
            <KPIBox label="Grade hub" val={grade} color="text-amber-600" />
         </div>

         {/* 5. Count Summary */}
         <div className="grid grid-cols-4 gap-4 w-full">
            <CountPill label="Correct" val={correct} color="bg-emerald-50 text-emerald-600" />
            <CountPill label="Wrong" val={wrong} color="bg-rose-50 text-rose-600" />
            <CountPill label="Skipped" val={skipped} color="bg-slate-50 text-slate-400" />
            <CountPill label="Total items" val={total} color="bg-blue-50 text-blue-600" />
         </div>

         {/* 6. Subject Analysis */}
         {subjects.length > 0 && (
            <div className="w-full space-y-4">
               <p className="text-[10px] font-black text-slate-400 text-center uppercase tracking-widest">Subject analysis</p>
               <div className="border border-slate-100 rounded-[2rem] overflow-hidden bg-white shadow-sm">
                  <table className="w-full text-center">
                     <thead>
                        <tr className="bg-slate-50 border-b border-slate-100 h-12">
                           <th className="px-10 font-black text-[11px] text-slate-500 uppercase tracking-widest text-left">Subject hub</th>
                           <th className="px-4 font-black text-[11px] text-center text-slate-500 uppercase tracking-widest">Score</th>
                           <th className="px-4 font-black text-[11px] text-center text-slate-500 uppercase tracking-widest">Accuracy</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-50">
                        {subjects.slice(0, 4).map((s, i) => (
                           <tr key={i} className="h-12 hover:bg-slate-50/30 transition-colors">
                              <td className="px-10 font-bold text-[14px] text-[#0F172A] text-left">{s.name}</td>
                              <td className="px-4 text-center font-black text-primary text-base tabular-nums">{Number(s.score).toFixed(1)}</td>
                              <td className="px-4 text-center">
                                 <Badge className="bg-emerald-50 text-emerald-600 border-none font-black text-[11px] tabular-nums px-3 py-1 rounded-lg shadow-sm">{s.accuracy}%</Badge>
                              </td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
               </div>
            </div>
         )}

         {/* 7. Footer Node */}
         <div className="pt-8 border-t border-slate-100 flex items-center justify-between mt-auto w-full">
            <div className="flex items-center gap-6">
               <div className="h-20 w-20 bg-white border border-slate-200 p-1.5 rounded-xl shadow-lg relative overflow-hidden">
                  <img src={qrUrl} alt="Verify" className="h-full w-full object-contain" crossOrigin="anonymous" />
               </div>
               <div className="space-y-1 text-left">
                  <p className="text-primary font-black text-sm flex items-center gap-2 leading-none">
                     <ShieldCheck className="h-4 w-4" /> Digitally verified
                  </p>
                  <p className="text-slate-400 text-[10px] max-w-[320px] leading-relaxed font-medium">
                     Performance synchronized with Cracklix institutional registry. Scan to verify credentials on cracklix.in.
                  </p>
               </div>
            </div>
            <div className="text-right space-y-2">
               <img src="/logo/cracklix-logo-dark.png" alt="Cracklix" className="h-8 w-auto opacity-30 grayscale ml-auto" crossOrigin="anonymous" />
               <p className="text-[10px] font-black tracking-[0.4em] text-slate-300 uppercase">www.cracklix.in</p>
            </div>
         </div>
      </div>
    </div>
  );
}

function KPIBox({ label, val, color }: any) {
   return (
      <div className="bg-white border border-slate-100 p-5 rounded-[1.5rem] flex flex-col items-center justify-center gap-1 shadow-sm text-center h-28">
         <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</p>
         <p className={cn("text-3xl font-black tabular-nums tracking-tighter leading-none", color)}>{val}</p>
      </div>
   )
}

function CountPill({ label, val, color }: any) {
   return (
      <div className={cn("p-5 rounded-[1.5rem] flex flex-col items-center justify-center gap-1 h-20", color)}>
         <span className="text-2xl font-black tabular-nums leading-none">{val}</span>
         <span className="text-[9px] font-black uppercase tracking-widest opacity-70 mt-1">{label}</span>
      </div>
   )
}
