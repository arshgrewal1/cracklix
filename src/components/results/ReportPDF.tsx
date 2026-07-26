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
 * @fileOverview Hardened PDF Fixed-Layout Hub v4.0.
 * FIXED: Replaced grid-gap with fixed table logic for candidate metadata to prevent overlaps.
 * FIXED: Reduced font sizes and compressed Subject Mastery for Single-Page compliance.
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
      <div className="flex items-center justify-between px-10 py-6 border-b border-slate-100 bg-slate-50/10">
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

      <div className="p-8 space-y-6">
         
         {/* 2. Top Summary Node */}
         <div className="grid grid-cols-[1fr_200px] gap-6">
            {/* Candidate Details Card */}
            <div className="bg-white rounded-[1.5rem] p-6 border border-slate-100 flex flex-col justify-between shadow-sm relative overflow-hidden">
               <div className="absolute top-0 left-0 w-1.5 h-full bg-primary" />
               <div className="space-y-4">
                  <div className="space-y-0.5">
                    <p className="text-[8px] font-black text-primary uppercase tracking-widest">Candidate Identity</p>
                    <h1 className="text-2xl font-black text-[#0F172A] leading-tight break-words">{studentName}</h1>
                    <p className="text-base font-bold text-slate-400 leading-tight">{examTitle}</p>
                  </div>
                  
                  {/* Stable Metadata Table - Eliminates html2canvas overlap */}
                  <div className="pt-4 border-t border-slate-50">
                     <table className="w-full">
                        <tbody>
                           <tr>
                              <td className="py-1 w-1/2">
                                 <p className="text-[7px] font-black text-slate-300 uppercase">Attempt Date</p>
                                 <p className="text-[11px] font-black text-[#0F172A]">{date}</p>
                              </td>
                              <td className="py-1 w-1/2">
                                 <p className="text-[7px] font-black text-slate-300 uppercase">Time Taken</p>
                                 <p className="text-[11px] font-black text-[#0F172A]">{timeTaken}</p>
                              </td>
                           </tr>
                           <tr>
                              <td className="py-1 w-1/2">
                                 <p className="text-[7px] font-black text-slate-300 uppercase">Test Duration</p>
                                 <p className="text-[11px] font-black text-[#0F172A]">{duration ? `${duration}m` : 'Timed'}</p>
                              </td>
                              <td className="py-1 w-1/2">
                                 <p className="text-[7px] font-black text-slate-300 uppercase">Result Status</p>
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

            {/* Rank Card - Fixed Dimensions */}
            <div className="bg-[#0F172A] rounded-[1.5rem] p-6 text-white text-center flex flex-col justify-center gap-2 shadow-xl border border-white/5">
               <p className="text-[8px] font-bold text-primary uppercase tracking-widest">Your Punjab Rank</p>
               <div className="py-1">
                  <p className="text-5xl font-black tabular-nums tracking-tighter">#{rank}</p>
                  <p className="text-[10px] font-bold text-slate-500 tabular-nums">/ {totalCandidates.toLocaleString()} Candidates</p>
               </div>
               <div className="pt-2">
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
            <KPIBox label="Official Grade" val={grade} color="text-amber-600" />
         </div>

         {/* 4. Question Audit Counts */}
         <div className="grid grid-cols-4 gap-4">
            <CountPill label="Correct" val={correct} color="bg-emerald-50 text-emerald-600" />
            <CountPill label="Wrong" val={wrong} color="bg-rose-50 text-rose-600" />
            <CountPill label="Skipped" val={skipped} color="bg-slate-50 text-slate-400" />
            <CountPill label="Total Questions" val={total} color="bg-blue-50 text-blue-600" />
         </div>

         {/* 5. Subject Mastery Table - High Density for One Page */}
         {subjects.length > 0 && (
            <div className="space-y-3">
               <p className="text-[10px] font-black text-[#0F172A] tracking-widest uppercase flex items-center gap-2">
                  Subject Analysis Hub
               </p>
               <div className="border border-slate-100 rounded-xl overflow-hidden bg-white shadow-sm">
                  <table className="w-full text-left">
                     <thead>
                        <tr className="bg-slate-50 border-b border-slate-100">
                           <th className="px-6 py-2.5 font-bold text-[9px] text-slate-500 uppercase">Subject</th>
                           <th className="px-4 py-2.5 font-bold text-[9px] text-center text-slate-500 uppercase">Net Score</th>
                           <th className="px-4 py-2.5 font-bold text-[9px] text-center text-slate-500 uppercase">Accuracy</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-50">
                        {subjects.map((s, i) => (
                           <tr key={i}>
                              <td className="px-6 py-2 font-bold text-xs text-[#0F172A]">{s.name}</td>
                              <td className="px-4 py-2 text-center font-black text-primary text-sm tabular-nums">{Number(s.score).toFixed(1)}</td>
                              <td className="px-4 py-2 text-center">
                                 <Badge className="bg-emerald-50 text-emerald-600 border-none font-bold text-[9px] tabular-nums px-2 py-0.5">{s.accuracy}%</Badge>
                              </td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
               </div>
            </div>
         )}

         {/* 6. Footer Verification */}
         <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-6">
               <div className="h-14 w-14 bg-white border border-slate-100 p-1 rounded-lg shadow-md">
                  <img src={qrUrl} alt="Verify" className="h-full w-full object-contain" crossOrigin="anonymous" />
               </div>
               <div className="space-y-0.5">
                  <p className="text-primary font-black text-[13px] flex items-center gap-2 leading-none">
                     <ShieldCheck className="h-4 w-4" /> Digitally Verified
                  </p>
                  <p className="text-slate-400 text-[9px] max-w-[200px] leading-tight font-medium">
                     Report synchronized with Cracklix institutional registry node.
                  </p>
               </div>
            </div>
            <div className="text-right space-y-1">
               <img src="/logo/cracklix-logo-dark.png" alt="Cracklix" className="h-6 w-auto opacity-20 grayscale ml-auto" crossOrigin="anonymous" />
               <p className="text-[7px] font-black tracking-widest text-slate-300 uppercase">www.cracklix.in</p>
            </div>
         </div>
      </div>
    </div>
  );
}

function KPIBox({ label, val, color }: any) {
   return (
      <div className="bg-white border border-slate-100 p-4 rounded-2xl flex flex-col items-center justify-center gap-0.5 shadow-sm text-center">
         <p className="text-[8px] font-black text-slate-400 uppercase tracking-tight">{label}</p>
         <p className={cn("text-2xl font-black tabular-nums tracking-tighter", color)}>{val}</p>
      </div>
   )
}

function CountPill({ label, val, color }: any) {
   return (
      <div className={cn("p-2.5 rounded-xl flex flex-col items-center justify-center gap-0 shadow-xs", color)}>
         <span className="text-base font-black tabular-nums">{val}</span>
         <span className="text-[7px] font-bold tracking-tight opacity-70 uppercase">{label}</span>
      </div>
   )
}
