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
 * @fileOverview Institutional Portrait PDF Layout Hub v9.0.
 * FIXED: Updated domain to cracklix.in.
 * TYPOGRAPHY: Removed all uppercase.
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
      className="bg-white p-0 m-0 box-border text-left font-body overflow-hidden border border-slate-100 shadow-2xl"
      style={{ width: '794px', height: '1123px', minHeight: '1123px', maxHeight: '1123px' }}
    >
      {/* 1. Brand Header */}
      <div className="flex items-center justify-between px-10 py-6 border-b border-slate-100 bg-slate-50/20">
         <div className="flex items-center gap-6">
            <div className="h-16 w-16 md:h-20 md:w-20 relative bg-white border border-slate-100 rounded-2xl shadow-md overflow-hidden p-1.5">
               <img src="/logo/cracklix-icon.png" alt="Logo" className="h-full w-full object-contain" crossOrigin="anonymous" />
            </div>
            <div className="space-y-0.5">
               <h2 className="text-3xl font-black text-[#0F172A] tracking-tighter leading-none">Cracklix</h2>
               <p className="text-[11px] font-bold text-primary">Smart Preparation Portal</p>
            </div>
         </div>
         <div className="text-right space-y-1">
            <p className="text-base font-black text-[#0F172A]">Performance Report</p>
            <p className="text-[9px] font-bold text-slate-400 tabular-nums">Ref ID: {resultId?.slice(0, 15) || "Registry"}</p>
         </div>
      </div>

      <div className="p-10 space-y-6">
         
         {/* 2. Portrait Summary Node */}
         <div className="grid grid-cols-[1fr_240px] gap-8">
            <div className="bg-white rounded-[1.5rem] p-6 border border-slate-100 flex flex-col justify-between shadow-sm relative overflow-hidden h-40">
               <div className="absolute top-0 left-0 w-1.5 h-full bg-primary" />
               <div className="space-y-4">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-primary">Candidate Identity</p>
                    <h1 className="text-2xl font-black text-[#0F172A] leading-tight break-words pr-2 line-clamp-1">{studentName}</h1>
                    <p className="text-base font-bold text-slate-500 leading-tight line-clamp-1">{examTitle}</p>
                  </div>
                  
                  <div className="pt-4 border-t border-slate-100">
                     <table className="w-full">
                        <tbody>
                           <tr>
                              <td className="py-1 w-1/2">
                                 <p className="text-[8px] font-bold text-slate-300">Attempt Date</p>
                                 <p className="text-[11px] font-black text-[#0F172A]">{date}</p>
                              </td>
                              <td className="py-1 w-1/2">
                                 <p className="text-[8px] font-bold text-slate-300">Time Taken</p>
                                 <p className="text-[11px] font-black text-[#0F172A]">{timeTaken}</p>
                              </td>
                           </tr>
                        </tbody>
                     </table>
                  </div>
               </div>
            </div>

            <div className="bg-[#0F172A] rounded-[1.5rem] p-6 text-white text-center flex flex-col justify-center gap-2 shadow-xl h-40">
               <p className="text-[10px] font-bold text-primary">Your Punjab Rank</p>
               <div className="py-1">
                  <p className="text-6xl font-black tabular-nums tracking-tighter">#{rank}</p>
                  <p className="text-[11px] font-bold text-slate-500 tabular-nums">/ {totalCandidates.toLocaleString()} Candidates</p>
               </div>
               <div className="pt-1">
                 <Badge className="bg-emerald-50 text-emerald-600 border-none font-bold text-[9px] px-4 py-1 rounded-full shadow-sm">
                    Verified Standing
                 </Badge>
               </div>
            </div>
         </div>

         {/* 3. KPI Matrix */}
         <div className="grid grid-cols-4 gap-4">
            <KPIBox label="Net Score" val={score} color="text-primary" />
            <KPIBox label="Percentile" val={`${percentile}%`} color="text-purple-600" />
            <KPIBox label="Accuracy" val={`${attemptAccuracy}%`} color="text-emerald-600" />
            <KPIBox label="Grade Hub" val={grade} color="text-amber-600" />
         </div>

         {/* 4. Question Audit Counts */}
         <div className="grid grid-cols-4 gap-4">
            <CountPill label="Correct" val={correct} color="bg-emerald-50 text-emerald-600" />
            <CountPill label="Wrong" val={wrong} color="bg-rose-50 text-rose-600" />
            <CountPill label="Skipped" val={skipped} color="bg-slate-50 text-slate-400" />
            <CountPill label="Total Questions" val={total} color="bg-blue-50 text-blue-600" />
         </div>

         {/* 5. Subject Mastery Hub */}
         {subjects.length > 0 && (
            <div className="space-y-3">
               <p className="text-[11px] font-black text-[#0F172A] ml-1">Subject Analysis</p>
               <div className="border border-slate-100 rounded-[1.5rem] overflow-hidden bg-white shadow-sm">
                  <table className="w-full text-left">
                     <thead>
                        <tr className="bg-slate-50 border-b border-slate-100 h-12">
                           <th className="px-8 font-bold text-[10px] text-slate-500">Subject Hub</th>
                           <th className="px-6 font-bold text-[10px] text-center text-slate-500">Score</th>
                           <th className="px-6 font-bold text-[10px] text-center text-slate-500">Accuracy</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-50">
                        {subjects.slice(0, 10).map((s, i) => (
                           <tr key={i} className="h-12 hover:bg-slate-50/30 transition-colors">
                              <td className="px-8 font-bold text-[14px] text-[#0F172A]">{s.name}</td>
                              <td className="px-6 text-center font-black text-primary text-base tabular-nums">{Number(s.score).toFixed(1)}</td>
                              <td className="px-6 text-center">
                                 <Badge className="bg-emerald-50 text-emerald-600 border-none font-bold text-[11px] tabular-nums px-3 py-1 rounded-lg shadow-sm">{s.accuracy}%</Badge>
                              </td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
               </div>
            </div>
         )}

         {/* 6. Legal Footer & Verification */}
         <div className="pt-10 border-t border-slate-100 flex items-center justify-between mt-auto bg-white">
            <div className="flex items-center gap-8">
               <div className="h-20 w-20 bg-white border border-slate-200 p-1.5 rounded-2xl shadow-lg relative overflow-hidden">
                  <img src={qrUrl} alt="Verify" className="h-full w-full object-contain" crossOrigin="anonymous" />
               </div>
               <div className="space-y-1">
                  <p className="text-primary font-black text-base flex items-center gap-2 leading-none">
                     <ShieldCheck className="h-5 w-5" /> Digitally Verified
                  </p>
                  <p className="text-slate-400 text-[10px] max-w-[260px] leading-relaxed font-medium">
                     This performance report is synchronized with the Cracklix institutional registry. Scan to verify credentials.
                  </p>
               </div>
            </div>
            <div className="text-right space-y-2">
               <img src="/logo/cracklix-logo-dark.png" alt="Cracklix" className="h-8 w-auto opacity-30 grayscale ml-auto" crossOrigin="anonymous" />
               <p className="text-[9px] font-black tracking-[0.4em] text-slate-300 uppercase">www.cracklix.in</p>
            </div>
         </div>
      </div>
    </div>
  );
}

function KPIBox({ label, val, color }: any) {
   return (
      <div className="bg-white border border-slate-100 p-5 rounded-[1.5rem] flex flex-col items-center justify-center gap-1.5 shadow-sm text-center h-28">
         <p className="text-[9px] font-bold text-slate-400">{label}</p>
         <p className={cn("text-3xl font-black tabular-nums tracking-tighter", color)}>{val}</p>
      </div>
   )
}

function CountPill({ label, val, color }: any) {
   return (
      <div className={cn("p-3 rounded-2xl flex flex-col items-center justify-center gap-1 shadow-xs h-20", color)}>
         <span className="text-2xl font-black tabular-nums">{val}</span>
         <span className="text-[8px] font-black opacity-70">{label}</span>
      </div>
   )
}
