
'use client';

import React from 'react';
import { ShieldCheck } from 'lucide-react';
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
}

/**
 * @fileOverview Institutional Portrait PDF Layout Hub v15.0.
 * FIXED: Absolute vertical centering for all identity and merit nodes.
 * UPDATED: Domain strictly synchronized to cracklix.in.
 */
export default function ReportPDF(props: ReportPDFProps) {
  const {
    studentName, examTitle, score, rank, totalCandidates,
    attemptAccuracy, timeTaken, correct, wrong, skipped,
    total, date, resultId, percentile, subjects = [], grade = "F",
    isQualified, duration
  } = props;

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent('https://cracklix.in/results/view?id=' + resultId)}`;

  return (
    <div 
      className="bg-white p-0 m-0 box-border text-center font-body overflow-hidden border border-slate-100 flex flex-col"
      style={{ width: '794px', height: '1123px', minHeight: '1123px', maxHeight: '1123px' }}
    >
      {/* 1. Header Hub */}
      <div className="flex items-center justify-between px-10 py-6 border-b border-slate-100 bg-slate-50/20 shrink-0">
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
            <p className="text-[8px] font-bold text-slate-400 tabular-nums">Ref ID: {resultId?.slice(0, 15)}</p>
         </div>
      </div>

      <div className="flex-1 p-8 space-y-8 flex flex-col items-center">
         
         {/* 2. Candidate & Identity - ABSOLUTE CENTERED */}
         <div className="w-full bg-white rounded-[1.5rem] p-10 border border-slate-100 flex flex-col items-center justify-center shadow-sm relative overflow-hidden text-center">
            <div className="space-y-4 w-full">
               <p className="text-[9px] font-black text-primary uppercase tracking-[0.2em]">Candidate Identity</p>
               <h1 className="text-4xl font-black text-[#0F172A] leading-tight break-words max-w-[90%] mx-auto">
                  {studentName}
               </h1>
               <p className="text-lg font-bold text-slate-500 line-clamp-1">{examTitle}</p>
            </div>
            
            <div className="pt-6 border-t border-slate-100 mt-6 w-full max-w-md mx-auto flex items-center justify-center gap-16">
               <div className="space-y-1 text-center">
                  <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">Attempt Date</p>
                  <p className="text-sm font-black text-[#0F172A] tabular-nums">{date}</p>
               </div>
               <div className="space-y-1 text-center">
                  <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">Time Taken</p>
                  <p className="text-sm font-black text-[#0F172A] tabular-nums">{timeTaken}</p>
               </div>
            </div>
         </div>

         {/* 3. Merit Standing - ABSOLUTE CENTERED */}
         <div className="w-full bg-[#0F172A] rounded-[2rem] p-10 text-white text-center flex flex-col items-center justify-center gap-4 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5 rotate-12"><Trophy className="h-48 w-48 text-primary" /></div>
            <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em] relative z-10">Your Punjab Rank</p>
            <div className="flex flex-col items-center justify-center leading-none relative z-10">
               <span className="text-8xl font-black tabular-nums tracking-tighter leading-none">#{rank}</span>
               <span className="text-[11px] font-bold text-slate-400 tabular-nums mt-4">/ {totalCandidates.toLocaleString()} Candidates</span>
            </div>
            <div className="pt-2 relative z-10">
              <Badge className="bg-emerald-500 text-white border-none font-black text-[10px] px-6 py-2 rounded-full shadow-2xl uppercase tracking-widest">
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

         {/* 5. Count PWA Hub */}
         <div className="grid grid-cols-4 gap-4 w-full">
            <CountPill label="Correct" val={correct} color="bg-emerald-50 text-emerald-600" />
            <CountPill label="Wrong" val={wrong} color="bg-rose-50 text-rose-600" />
            <CountPill label="Skipped" val={skipped} color="bg-slate-50 text-slate-400" />
            <CountPill label="Questions" val={total} color="bg-blue-50 text-blue-600" />
         </div>

         {/* 6. Subject Mastery Table */}
         {subjects.length > 0 && (
            <div className="w-full space-y-4">
               <p className="text-[10px] font-black text-[#0F172A] text-center uppercase tracking-widest">Subject Analysis</p>
               <div className="border border-slate-100 rounded-[1.5rem] overflow-hidden bg-white shadow-sm">
                  <table className="w-full text-center">
                     <thead>
                        <tr className="bg-slate-50 border-b border-slate-100 h-12">
                           <th className="px-8 font-black text-[10px] text-slate-500 uppercase tracking-widest text-left">Subject Hub</th>
                           <th className="px-4 font-black text-[10px] text-center text-slate-500 uppercase tracking-widest">Score</th>
                           <th className="px-4 font-black text-[10px] text-center text-slate-500 uppercase tracking-widest">Accuracy</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-50">
                        {subjects.slice(0, 8).map((s, i) => (
                           <tr key={i} className="h-12 hover:bg-slate-50/30 transition-colors">
                              <td className="px-8 font-bold text-[14px] text-[#0F172A] text-left">{s.name}</td>
                              <td className="px-4 text-center font-black text-primary text-base tabular-nums">{Number(s.score).toFixed(1)}</td>
                              <td className="px-4 text-center">
                                 <Badge className="bg-emerald-50 text-emerald-600 border-none font-black text-[11px] tabular-nums px-3 py-1 rounded shadow-sm">{s.accuracy}%</Badge>
                              </td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
               </div>
            </div>
         )}

         {/* 7. Footer Node - PINNED AT BOTTOM */}
         <div className="pt-10 border-t border-slate-100 flex items-center justify-between mt-auto w-full">
            <div className="flex items-center gap-6">
               <div className="h-20 w-20 bg-white border border-slate-200 p-1.5 rounded-xl shadow-lg relative overflow-hidden">
                  <img src={qrUrl} alt="Verify" className="h-full w-full object-contain" crossOrigin="anonymous" />
               </div>
               <div className="space-y-1 text-left">
                  <p className="text-primary font-black text-base flex items-center gap-2 leading-none">
                     <ShieldCheck className="h-5 w-5" /> Digitally Verified
                  </p>
                  <p className="text-slate-400 text-[10px] max-w-[280px] leading-relaxed font-medium">
                     This performance report is synchronized with the Cracklix institutional registry. Scan to verify credentials on cracklix.in.
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
         <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{label}</p>
         <p className={cn("text-3xl font-black tabular-nums tracking-tighter leading-none", color)}>{val}</p>
      </div>
   )
}

function CountPill({ label, val, color }: any) {
   return (
      <div className={cn("p-4 rounded-2xl flex flex-col items-center justify-center gap-0.5 shadow-xs h-20", color)}>
         <span className="text-2xl font-black tabular-nums leading-none">{val}</span>
         <span className="text-[9px] font-black uppercase tracking-widest opacity-70 mt-1">{label}</span>
      </div>
   )
}
