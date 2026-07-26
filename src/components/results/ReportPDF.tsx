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
 * @fileOverview Institutional Portrait PDF Layout Hub v17.0.
 * FIXED: Standardized text alignment and synchronized domain to cracklix.in.
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
            <div className="h-16 w-16 relative bg-white border border-slate-100 rounded-2xl shadow-md overflow-hidden p-1.5">
               <img src="/logo/cracklix-icon.png" alt="Logo" className="h-full w-full object-contain" crossOrigin="anonymous" />
            </div>
            <div className="space-y-0.5 text-left">
               <h2 className="text-2xl font-black text-[#0F172A] tracking-tighter leading-none">Cracklix</h2>
               <p className="text-[10px] font-bold text-primary">Smart Preparation Portal</p>
            </div>
         </div>
         <div className="text-right space-y-1">
            <p className="text-sm font-black text-[#0F172A]">Performance Report</p>
            <p className="text-[8px] font-bold text-slate-400 tabular-nums">Ref Id: {resultId?.slice(0, 15)}</p>
         </div>
      </div>

      <div className="w-full flex-1 p-8 space-y-6 flex flex-col items-center overflow-hidden">
         
         {/* 2. Candidate Identity */}
         <div className="w-full bg-white rounded-[2rem] p-10 border border-slate-100 flex flex-col items-center justify-center shadow-sm relative overflow-hidden text-center">
            <div className="space-y-3 w-full">
               <p className="text-[9px] font-black text-primary uppercase tracking-[0.2em]">Candidate Identity</p>
               <h1 className="text-3xl font-black text-[#0F172A] leading-tight break-words max-w-[90%] mx-auto">
                  {studentName}
               </h1>
               <p className="text-lg font-bold text-slate-500 line-clamp-1">{examTitle}</p>
            </div>
            
            <div className="pt-6 border-t border-slate-100 mt-6 w-full max-w-lg mx-auto grid grid-cols-3 gap-8">
               <div className="space-y-1 text-center">
                  <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">Attempt Date</p>
                  <p className="text-sm font-black text-[#0F172A] tabular-nums">{date}</p>
               </div>
               <div className="space-y-1 text-center">
                  <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">Time Taken</p>
                  <p className="text-sm font-black text-[#0F172A] tabular-nums">{timeTaken}</p>
               </div>
               <div className="space-y-1 text-center">
                  <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">Attempt #</p>
                  <p className="text-sm font-black text-primary tabular-nums">{attemptNumber}</p>
               </div>
            </div>
         </div>

         {/* 3. Merit Standing */}
         <div className="w-full bg-[#0F172A] rounded-[2.5rem] p-10 text-white text-center flex flex-col items-center justify-center gap-4 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5 rotate-12"><Trophy className="h-48 w-48 text-primary" /></div>
            
            <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em] relative z-10">Your Punjab Rank</p>
            
            <div className="flex flex-col items-center justify-center relative z-10 w-full py-2">
               <span className="text-8xl font-black tabular-nums tracking-tighter leading-tight">#{rank}</span>
               <span className="text-[14px] font-bold text-slate-400 tabular-nums mt-4">/ {totalCandidates.toLocaleString()} Candidates</span>
            </div>

            <div className="pt-4 relative z-10">
              <Badge className="bg-emerald-500 text-white border-none font-black text-[10px] px-8 py-2.5 rounded-full shadow-2xl uppercase tracking-widest">
                 Verified Standing
              </Badge>
            </div>
         </div>

         {/* 4. KPI Matrix */}
         <div className="grid grid-cols-4 gap-4 w-full">
            <KPIBox label="Net Score" val={score} color="text-primary" />
            <KPIBox label="Percentile" val={`${percentile}%`} color="text-purple-600" />
            <KPIBox label="Accuracy" val={`${attemptAccuracy}%`} color="text-emerald-600" />
            <KPIBox label="Grade Hub" val={grade} color="text-amber-600" />
         </div>

         {/* 5. Count Summary */}
         <div className="grid grid-cols-4 gap-4 w-full">
            <CountPill label="Correct" val={correct} color="bg-emerald-50 text-emerald-600" />
            <CountPill label="Wrong" val={wrong} color="bg-rose-50 text-rose-600" />
            <CountPill label="Skipped" val={skipped} color="bg-slate-50 text-slate-400" />
            <CountPill label="Total Items" val={total} color="bg-blue-50 text-blue-600" />
         </div>

         {/* 6. Subject Analysis */}
         {subjects.length > 0 && (
            <div className="w-full space-y-3">
               <p className="text-[10px] font-black text-slate-400 text-center uppercase tracking-widest">Subject Analysis</p>
               <div className="border border-slate-100 rounded-[1.5rem] overflow-hidden bg-white shadow-sm">
                  <table className="w-full text-center">
                     <thead>
                        <tr className="bg-slate-50 border-b border-slate-100 h-10">
                           <th className="px-8 font-black text-[10px] text-slate-500 uppercase tracking-widest text-left">Subject hub</th>
                           <th className="px-4 font-black text-[10px] text-center text-slate-500 uppercase tracking-widest">Score</th>
                           <th className="px-4 font-black text-[10px] text-center text-slate-500 uppercase tracking-widest">Accuracy</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-50">
                        {subjects.slice(0, 6).map((s, i) => (
                           <tr key={i} className="h-10 hover:bg-slate-50/30 transition-colors">
                              <td className="px-8 font-bold text-[13px] text-[#0F172A] text-left">{s.name}</td>
                              <td className="px-4 text-center font-black text-primary text-sm tabular-nums">{Number(s.score).toFixed(1)}</td>
                              <td className="px-4 text-center">
                                 <Badge className="bg-emerald-50 text-emerald-600 border-none font-black text-[10px] tabular-nums px-2.5 py-0.5 rounded shadow-sm">{s.accuracy}%</Badge>
                              </td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
               </div>
            </div>
         )}

         {/* 7. Footer Node */}
         <div className="pt-6 border-t border-slate-100 flex items-center justify-between mt-auto w-full">
            <div className="flex items-center gap-6">
               <div className="h-20 w-20 bg-white border border-slate-200 p-1.5 rounded-xl shadow-lg relative overflow-hidden">
                  <img src={qrUrl} alt="Verify" className="h-full w-full object-contain" crossOrigin="anonymous" />
               </div>
               <div className="space-y-1 text-left">
                  <p className="text-primary font-black text-sm flex items-center gap-2 leading-none">
                     <ShieldCheck className="h-4 w-4" /> Digitally Verified
                  </p>
                  <p className="text-slate-400 text-[9px] max-w-[280px] leading-relaxed font-medium">
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
      <div className="bg-white border border-slate-100 p-4 rounded-[1.5rem] flex flex-col items-center justify-center gap-1 shadow-sm text-center h-24">
         <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{label}</p>
         <p className={cn("text-2xl font-black tabular-nums tracking-tighter leading-none", color)}>{val}</p>
      </div>
   )
}

function CountPill({ label, val, color }: any) {
   return (
      <div className={cn("p-4 rounded-2xl flex flex-col items-center justify-center gap-0.5 h-16", color)}>
         <span className="text-xl font-black tabular-nums leading-none">{val}</span>
         <span className="text-[8px] font-black uppercase tracking-widest opacity-70 mt-1">{label}</span>
      </div>
   )
}
