
'use client';

import React from 'react';
import { 
  ShieldCheck, 
  Trophy
} from 'lucide-react';
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
 * @fileOverview Institutional PDF Layout Hub v6.0.
 * FIXED: Condensed vertical padding for single-page high-density output.
 */
export default function ReportPDF(props: ReportPDFProps) {
  const {
    studentName, examTitle, score, rank, totalCandidates,
    attemptAccuracy, timeTaken, correct, wrong, skipped,
    total, date, resultId, percentile, subjects = [], grade = "F",
    isQualified, duration
  } = props;

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent('https://cracklix.com')}`;

  return (
    <div 
      className="bg-white p-0 m-0 box-border text-left font-body overflow-hidden"
      style={{ width: '794px', minHeight: '1123px', maxHeight: '1123px' }}
    >
      {/* 1. Header Hub */}
      <div className="flex items-center justify-between px-10 py-5 border-b border-slate-100 bg-slate-50/10">
         <div className="flex items-center gap-6">
            <div className="h-16 w-16 relative bg-white border border-slate-100 rounded-xl shadow-md overflow-hidden p-1">
               <img src="/logo/cracklix-icon.png" alt="Logo" className="h-full w-full object-contain" crossOrigin="anonymous" />
            </div>
            <div className="space-y-0.5">
               <h2 className="text-3xl font-black text-[#0F172A] tracking-tighter leading-none">Cracklix</h2>
               <p className="text-[11px] font-bold text-primary tracking-tight">Smart Preparation Portal</p>
            </div>
         </div>
         <div className="text-right space-y-1">
            <p className="text-base font-black text-[#0F172A] tracking-tight">Performance Report</p>
            <p className="text-[9px] font-bold text-slate-400 tabular-nums">Ref: {resultId?.slice(0, 15) || "Registry"}</p>
         </div>
      </div>

      <div className="p-8 space-y-5">
         
         {/* 2. Top Summary Node */}
         <div className="grid grid-cols-[1fr_220px] gap-6">
            <div className="bg-white rounded-[1.5rem] p-5 border border-slate-100 flex flex-col justify-between shadow-sm relative overflow-hidden">
               <div className="absolute top-0 left-0 w-1.5 h-full bg-primary" />
               <div className="space-y-4">
                  <div className="space-y-1">
                    <p className="text-[9px] font-bold text-primary uppercase tracking-widest">Candidate Identity</p>
                    <h1 className="text-xl font-black text-[#0F172A] leading-tight break-words">{studentName}</h1>
                    <p className="text-sm font-bold text-slate-400 leading-tight">{examTitle}</p>
                  </div>
                  
                  <div className="pt-3 border-t border-slate-50">
                     <table className="w-full">
                        <tbody>
                           <tr>
                              <td className="py-1 w-1/2">
                                 <p className="text-[8px] font-bold text-slate-300 uppercase tracking-tight">Attempt Date</p>
                                 <p className="text-[11px] font-black text-[#0F172A]">{date}</p>
                              </td>
                              <td className="py-1 w-1/2">
                                 <p className="text-[8px] font-bold text-slate-300 uppercase tracking-tight">Time Taken</p>
                                 <p className="text-[11px] font-black text-[#0F172A]">{timeTaken}</p>
                              </td>
                           </tr>
                           <tr>
                              <td className="py-1 w-1/2">
                                 <p className="text-[8px] font-bold text-slate-300 uppercase tracking-tight">Test Duration</p>
                                 <p className="text-[11px] font-black text-[#0F172A]">{duration ? `${duration}m` : 'Timed'}</p>
                              </td>
                              <td className="py-1 w-1/2">
                                 <p className="text-[8px] font-bold text-slate-300 uppercase tracking-tight">Result Status</p>
                                 <p className={cn("text-[11px] font-black", isQualified ? "text-emerald-600" : "text-rose-600")}>
                                    {isQualified ? 'Qualified' : 'Attempted'}
                                 </p>
                              </td>
                           </tr>
                        </tbody>
                     </table>
                  </div>
               </div>
            </div>

            <div className="bg-[#0F172A] rounded-[1.5rem] p-5 text-white text-center flex flex-col justify-center gap-2 shadow-xl">
               <p className="text-[9px] font-bold text-primary uppercase tracking-widest">Your Punjab Rank</p>
               <div className="py-0.5">
                  <p className="text-5xl font-black tabular-nums tracking-tighter">#{rank}</p>
                  <p className="text-[10px] font-bold text-slate-500 tabular-nums">/ {totalCandidates.toLocaleString()}</p>
               </div>
               <div className="pt-1">
                 <Badge className="bg-emerald-500 text-white border-none font-bold text-[8px] px-3 py-1 rounded-full uppercase tracking-tight">
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
            <KPIBox label="Grade" val={grade} color="text-amber-600" />
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
            <div className="space-y-2">
               <p className="text-[10px] font-black text-[#0F172A] tracking-widest uppercase">Subject Analysis</p>
               <div className="border border-slate-100 rounded-xl overflow-hidden bg-white shadow-sm">
                  <table className="w-full text-left">
                     <thead>
                        <tr className="bg-slate-50 border-b border-slate-100">
                           <th className="px-6 py-2 font-bold text-[9px] text-slate-500 uppercase tracking-tight">Subject Hub</th>
                           <th className="px-4 py-2 font-bold text-[9px] text-center text-slate-500 uppercase tracking-tight">Score</th>
                           <th className="px-4 py-2 font-bold text-[9px] text-center text-slate-500 uppercase tracking-tight">Accuracy</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-50">
                        {subjects.slice(0, 8).map((s, i) => (
                           <tr key={i} className="h-10">
                              <td className="px-6 py-1 font-bold text-[12px] text-[#0F172A]">{s.name}</td>
                              <td className="px-4 py-1 text-center font-black text-primary text-sm tabular-nums">{Number(s.score).toFixed(1)}</td>
                              <td className="px-4 py-1 text-center">
                                 <Badge className="bg-emerald-50 text-emerald-600 border-none font-bold text-[9px] tabular-nums px-3 py-0.5">{s.accuracy}%</Badge>
                              </td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
               </div>
            </div>
         )}

         {/* 6. Footer Verification */}
         <div className="pt-6 border-t border-slate-100 flex items-center justify-between mt-auto">
            <div className="flex items-center gap-6">
               <div className="h-16 w-16 bg-white border border-slate-100 p-1 rounded-xl shadow-md">
                  <img src={qrUrl} alt="Verify" className="h-full w-full object-contain" crossOrigin="anonymous" />
               </div>
               <div className="space-y-0.5">
                  <p className="text-primary font-black text-sm flex items-center gap-2 leading-none">
                     <ShieldCheck className="h-4 w-4" /> Digitally Verified
                  </p>
                  <p className="text-slate-400 text-[10px] max-w-[220px] leading-tight font-medium">
                     Performance report synchronized with Cracklix institutional registry.
                  </p>
               </div>
            </div>
            <div className="text-right space-y-1">
               <img src="/logo/cracklix-logo-dark.png" alt="Cracklix" className="h-7 w-auto opacity-20 grayscale ml-auto" crossOrigin="anonymous" />
               <p className="text-[8px] font-black tracking-[0.3em] text-slate-300 uppercase">www.cracklix.com</p>
            </div>
         </div>
      </div>
    </div>
  );
}

function KPIBox({ label, val, color }: any) {
   return (
      <div className="bg-white border border-slate-100 p-4 rounded-2xl flex flex-col items-center justify-center gap-1 shadow-sm text-center h-24">
         <p className="text-[8px] font-bold text-slate-400 uppercase tracking-tight">{label}</p>
         <p className={cn("text-2xl font-[900] tabular-nums tracking-tighter", color)}>{val}</p>
      </div>
   )
}

function CountPill({ label, val, color }: any) {
   return (
      <div className={cn("p-2 rounded-2xl flex flex-col items-center justify-center gap-0.5 shadow-xs h-16", color)}>
         <span className="text-xl font-[900] tabular-nums">{val}</span>
         <span className="text-[7px] font-bold tracking-tight opacity-70 uppercase">{label}</span>
      </div>
   )
}
