'use client';

import React from 'react';
import { 
  ShieldCheck, 
  Trophy,
  BarChart3
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
 * @fileOverview Hardened PDF Fixed-Layout Hub v3.0.
 * FIXED: High-density layout ensures Subject Mastery fits on Page 1.
 * UPDATED: Title Case strictly enforced and branding scaled.
 */
export default function ReportPDF(props: ReportPDFProps) {
  const {
    studentName, examTitle, score, rank, totalCandidates,
    attemptAccuracy, timeTaken, correct, wrong, skipped,
    total, date, resultId, percentile, subjects = [], grade = "F",
    isQualified, duration
  } = props;

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent('https://cracklix.in')}`;

  return (
    <div 
      className="bg-white p-0 m-0 box-border text-left font-body overflow-hidden"
      style={{ width: '794px', minHeight: '1123px' }}
    >
      {/* 1. Header Hub - Scaled Identity */}
      <div className="flex items-center justify-between px-10 py-6 border-b-2 border-slate-100 bg-slate-50/20">
         <div className="flex items-center gap-6">
            <div className="h-20 w-20 relative bg-white border-2 border-slate-100 rounded-2xl shadow-lg overflow-hidden p-1">
               <img src="/logo/cracklix-icon.png" alt="Logo" className="h-full w-full object-contain" crossOrigin="anonymous" />
            </div>
            <div className="space-y-0.5">
               <h2 className="text-4xl font-black text-[#0F172A] tracking-tighter leading-none">Cracklix</h2>
               <p className="text-sm font-bold text-primary tracking-tight">Smart Preparation. Better Results.</p>
            </div>
         </div>
         <div className="text-right space-y-1.5">
            <p className="text-lg font-black text-[#0F172A] tracking-tight">Performance Report</p>
            <p className="text-[10px] font-bold text-slate-400 tabular-nums bg-white px-3 py-0.5 rounded-lg border border-slate-100">ID: {resultId?.slice(0, 15) || "REF-GUEST"}</p>
         </div>
      </div>

      <div className="p-10 space-y-6">
         
         {/* 2. Candidate & Rank Node - High Density */}
         <div className="grid grid-cols-[1fr_220px] gap-8">
            <div className="bg-slate-50 rounded-[2rem] p-8 border border-slate-100 flex flex-col justify-between shadow-inner">
               <div className="space-y-1">
                  <p className="text-[9px] font-black text-primary uppercase tracking-widest">Candidate Identity</p>
                  <h1 className="text-3xl font-black text-[#0F172A] leading-tight break-words">{studentName}</h1>
                  <p className="text-lg font-bold text-slate-400 leading-tight">{examTitle}</p>
               </div>
               <div className="grid grid-cols-2 gap-x-6 gap-y-3 mt-6 pt-4 border-t border-slate-200">
                  <MetaItem label="Attempt Date" val={date} />
                  <MetaItem label="Time Taken" val={timeTaken} />
                  <MetaItem label="Test Duration" val={duration ? `${duration}m` : 'Timed'} />
                  <MetaItem label="Result Status" val={isQualified ? 'Qualified' : 'Attempted'} color={isQualified ? "text-emerald-600" : "text-rose-600"} />
               </div>
            </div>

            <div className="bg-[#0F172A] rounded-[2rem] p-8 text-white text-center flex flex-col justify-center gap-4 relative overflow-hidden shadow-2xl">
               <div className="absolute top-0 right-0 p-4 opacity-10 rotate-12"><Trophy className="h-32 w-32 text-primary" /></div>
               <div className="relative z-10 space-y-1">
                  <p className="text-[9px] font-bold text-primary tracking-tight">Your Punjab Rank</p>
                  <p className="text-6xl font-black tabular-nums tracking-tighter">#{rank}</p>
                  <p className="text-xs font-bold text-slate-500 tabular-nums">/ {totalCandidates.toLocaleString()} Candidates</p>
                  <div className="mt-4">
                    <Badge className="bg-emerald-500 text-white border-none font-bold text-[9px] px-4 py-1.5 rounded-full shadow-lg">
                       Verified Standing
                    </Badge>
                  </div>
               </div>
            </div>
         </div>

         {/* 3. KPI & Counts Hub - Compressed */}
         <div className="grid grid-cols-4 gap-4">
            <KPIBox label="Net Score" val={score} color="text-primary" />
            <KPIBox label="Percentile" val={`${percentile}%`} color="text-purple-600" />
            <KPIBox label="Accuracy" val={`${attemptAccuracy}%`} color="text-emerald-600" />
            <KPIBox label="Official Grade" val={grade} color="text-amber-600" />
         </div>

         <div className="grid grid-cols-4 gap-4">
            <CountPill label="Correct" val={correct} color="bg-emerald-50 text-emerald-600" />
            <CountPill label="Wrong" val={wrong} color="bg-rose-50 text-rose-600" />
            <CountPill label="Skipped" val={skipped} color="bg-slate-50 text-slate-400" />
            <CountPill label="Total Questions" val={total} color="bg-blue-50 text-blue-600" />
         </div>

         {/* 4. Subject Table - High Density for Single Page */}
         {subjects.length > 0 && (
            <div className="space-y-4">
               <p className="text-[10px] font-black text-[#0F172A] tracking-tight flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-primary" /> Subject Mastery Hub
               </p>
               <div className="border border-slate-100 rounded-[1.5rem] overflow-hidden bg-white shadow-xl">
                  <table className="w-full text-left">
                     <thead>
                        <tr className="bg-slate-50 border-b border-slate-100">
                           <th className="px-8 py-3 font-bold text-[10px] text-slate-500 tracking-tight">Subject Hub</th>
                           <th className="px-4 py-3 font-bold text-[10px] text-center text-slate-500 tracking-tight">Net Score</th>
                           <th className="px-4 py-3 font-bold text-[10px] text-center text-slate-500 tracking-tight">Accuracy %</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-50">
                        {subjects.map((s, i) => (
                           <tr key={i} className="hover:bg-slate-50 transition-colors">
                              <td className="px-8 py-3 font-bold text-sm text-[#0F172A]">{s.name}</td>
                              <td className="px-4 py-3 text-center font-black text-primary text-base tabular-nums">{Number(s.score).toFixed(1)}</td>
                              <td className="px-4 py-3 text-center">
                                 <Badge className="bg-emerald-50 text-emerald-600 border-none font-bold text-[10px] tabular-nums">{s.accuracy}%</Badge>
                              </td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
               </div>
            </div>
         )}

         {/* 5. Footer Verification - High Contrast */}
         <div className="pt-8 mt-auto border-t border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-8">
               <div className="h-16 w-16 bg-white border border-slate-100 p-1 rounded-xl shadow-lg">
                  <img src={qrUrl} alt="Verify" className="h-full w-full object-contain" crossOrigin="anonymous" />
               </div>
               <div className="space-y-1">
                  <p className="text-primary font-black text-sm flex items-center gap-2">
                     <ShieldCheck className="h-4 w-4" /> Digitally Verified
                  </p>
                  <p className="text-slate-400 text-[10px] max-w-[240px] leading-snug font-medium">
                     Performance synchronized with Cracklix institutional registry.
                  </p>
               </div>
            </div>
            <div className="text-right space-y-1">
               <img src="/logo/cracklix-logo-dark.png" alt="Cracklix" className="h-8 w-auto opacity-30 grayscale ml-auto" crossOrigin="anonymous" />
               <p className="text-[8px] font-black tracking-widest text-slate-300 uppercase">www.cracklix.in</p>
            </div>
         </div>
      </div>
    </div>
  );
}

function MetaItem({ label, val, color = "text-[#0F172A]" }: any) {
   return (
      <div className="space-y-0.5">
         <p className="text-[8px] font-black text-slate-400 tracking-tight">{label}</p>
         <p className={cn("text-[13px] font-black break-words", color)}>{val}</p>
      </div>
   )
}

function KPIBox({ label, val, color }: any) {
   return (
      <div className="bg-white border border-slate-100 p-6 rounded-[1.5rem] flex flex-col gap-1.5 h-28 justify-center shadow-xl border-t-4 border-t-primary text-center">
         <p className="text-[9px] font-black text-slate-400 tracking-tight">{label}</p>
         <p className={cn("text-3xl font-black tabular-nums tracking-tighter", color)}>{val}</p>
      </div>
   )
}

function CountPill({ label, val, color }: any) {
   return (
      <div className={cn("p-3 rounded-xl flex flex-col items-center justify-center gap-0.5 shadow-sm", color)}>
         <span className="text-lg font-black tabular-nums">{val}</span>
         <span className="text-[8px] font-bold tracking-tight opacity-70">{label}</span>
      </div>
   )
}
