
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
}

/**
 * @fileOverview Institutional Portrait PDF Layout Hub v30.0 [Hardened].
 * FIXED: Replaced absolute positioning with static boxed flex nodes to ensure zero overlap.
 * FIXED: Removed all transform scaling to prevent blurry exports.
 * FIXED: Finalized verification seal for cracklix.in.
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
      className="bg-white p-0 m-0 box-border text-center font-body overflow-hidden flex flex-col items-center relative"
      style={{ width: '794px', height: '1123px', minHeight: '1123px', maxHeight: '1123px' }}
    >
      {/* 1. HEADER HUB */}
      <div className="w-full flex items-center justify-between px-12 py-8 border-b border-slate-100 bg-slate-50/20 shrink-0">
         <div className="flex items-center gap-6">
            <div className="h-14 w-14 relative bg-white border border-slate-100 rounded-2xl shadow-md overflow-hidden p-1.5 flex items-center justify-center">
               <img src="/logo/cracklix-icon.png" alt="Logo" className="h-full w-full object-contain" crossOrigin="anonymous" />
            </div>
            <div className="space-y-0.5 text-left">
               <h2 className="text-xl font-black text-[#0F172A] tracking-tighter leading-none">Cracklix</h2>
               <p className="text-[9px] font-bold text-primary uppercase tracking-widest">Smart Preparation Portal</p>
            </div>
         </div>
         <div className="text-right space-y-1">
            <p className="text-xs font-black text-[#0F172A] uppercase">Performance report</p>
            <p className="text-[8px] font-bold text-slate-400 tabular-nums uppercase">Ref: {resultId?.slice(0, 15)}</p>
         </div>
      </div>

      <div className="w-full flex-1 p-10 space-y-10 flex flex-col items-center overflow-hidden">
         
         {/* 2. CANDIDATE IDENTITY */}
         <div className="space-y-3 w-full text-center">
            <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">Assessment Center</p>
            <h1 className="text-4xl font-black text-[#0F172A] leading-tight antialiased">
               {studentName}
            </h1>
            <p className="text-xl font-bold text-slate-500 line-clamp-1">{examTitle}</p>
            
            <div className="pt-6 flex justify-center gap-10 items-center">
               <div className="flex flex-col items-center gap-1">
                  <p className="text-[8px] font-bold text-slate-300 uppercase tracking-widest">Attempt Date</p>
                  <p className="text-xs font-black text-[#0F172A] tabular-nums leading-none">{date}</p>
               </div>
               <div className="w-px h-6 bg-slate-100" />
               <div className="flex flex-col items-center gap-1">
                  <p className="text-[8px] font-bold text-slate-300 uppercase tracking-widest">Time Taken</p>
                  <p className="text-xs font-black text-[#0F172A] tabular-nums leading-none">{timeTaken}</p>
               </div>
               <div className="w-px h-6 bg-slate-100" />
               <div className="flex flex-col items-center gap-1">
                  <p className="text-[8px] font-bold text-slate-300 uppercase tracking-widest">Test Version</p>
                  <p className="text-xs font-black text-primary tabular-nums leading-none">v1.05</p>
               </div>
            </div>
         </div>

         {/* 3. MERIT STANDING */}
         <div className="w-full bg-[#0F172A] rounded-[3rem] p-12 text-white text-center flex flex-col items-center justify-center shadow-2xl relative overflow-hidden min-h-[320px]">
            <div className="absolute top-0 right-0 p-8 opacity-5 rotate-12"><Trophy className="h-64 w-64 text-primary" /></div>
            
            <div className="relative z-10 space-y-4">
               <p className="text-[12px] font-black text-primary uppercase tracking-[0.4em]">Punjab Rank</p>
               <div className="flex flex-col items-center gap-2">
                  <span className="text-[140px] font-[900] tabular-nums tracking-tighter leading-none block drop-shadow-[0_15px_30px_rgba(37,99,235,0.4)]">
                     #{rank}
                  </span>
                  <span className="text-2xl font-black text-slate-500 tabular-nums uppercase tracking-widest mt-2">
                     / {totalCandidates.toLocaleString()} Total Candidates
                  </span>
               </div>
               <div className="pt-8">
                  <Badge className="bg-emerald-500 text-white border-none font-black text-[11px] px-10 py-3 rounded-full shadow-4xl uppercase tracking-widest">
                     Verified Standing
                  </Badge>
               </div>
            </div>
         </div>

         {/* 4. KPI MATRIX */}
         <div className="grid grid-cols-4 gap-4 w-full">
            <KPIBox label="Net Score" val={score} color="text-primary" />
            <KPIBox label="Percentile" val={`${percentile}%`} color="text-purple-600" />
            <KPIBox label="Accuracy" val={`${attemptAccuracy}%`} color="text-emerald-600" />
            <KPIBox label="Pass Grade" val={grade} color="text-amber-600" />
         </div>

         {/* 5. COUNT SUMMARY */}
         <div className="grid grid-cols-4 gap-4 w-full">
            <CountPill label="Correct" val={correct} color="bg-emerald-50 text-emerald-600" />
            <CountPill label="Wrong" val={wrong} color="bg-rose-50 text-rose-600" />
            <CountPill label="Skipped" val={skipped} color="bg-slate-50 text-slate-400" />
            <CountPill label="Total Items" val={total} color="bg-blue-50 text-blue-600" />
         </div>

         {/* 6. SUBJECT ANALYSIS */}
         {subjects.length > 0 && (
            <div className="w-full space-y-4">
               <p className="text-[10px] font-black text-slate-400 text-center uppercase tracking-widest">Subject Mastery Breakdown</p>
               <div className="border border-slate-100 rounded-[2rem] overflow-hidden bg-white shadow-sm">
                  <table className="w-full text-center">
                     <thead>
                        <tr className="bg-slate-50 border-b border-slate-100 h-12">
                           <th className="px-10 font-black text-[10px] text-slate-500 uppercase tracking-widest text-left">Subject Hub</th>
                           <th className="px-4 font-black text-[10px] text-center text-slate-500 uppercase tracking-widest">Score</th>
                           <th className="px-10 font-black text-[10px] text-right text-slate-500 uppercase tracking-widest">Accuracy</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-50">
                        {subjects.slice(0, 4).map((s, i) => (
                           <tr key={i} className="h-12">
                              <td className="px-10 font-bold text-sm text-[#0F172A] text-left">{s.name}</td>
                              <td className="px-4 text-center font-black text-primary text-base tabular-nums">{Number(s.score).toFixed(1)}</td>
                              <td className="px-10 text-right">
                                 <Badge className="bg-emerald-50 text-emerald-600 border-none font-black text-[9px] tabular-nums px-3 py-1 rounded-lg shadow-sm">{s.accuracy}%</Badge>
                              </td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
               </div>
            </div>
         )}

         {/* 7. FOOTER HUB */}
         <div className="pt-10 border-t border-slate-100 flex items-center justify-between w-full mt-auto pb-10">
            <div className="flex items-center gap-6">
               <div className="h-24 w-24 bg-white border-2 border-slate-100 p-2 rounded-2xl shadow-lg relative overflow-hidden">
                  <img src={qrUrl} alt="Verify" className="h-full w-full object-contain" crossOrigin="anonymous" />
               </div>
               <div className="space-y-1 text-left">
                  <p className="text-primary font-black text-base flex items-center gap-2 leading-none uppercase">
                     <ShieldCheck className="h-5 w-5" /> Digitally Verified Report
                  </p>
                  <p className="text-slate-400 text-[10px] max-w-[340px] leading-relaxed font-medium">
                     Verified on cracklix.in. This certificate is synchronized with the official Punjab Government recruitment pattern registry.
                  </p>
               </div>
            </div>
            <div className="text-right space-y-2">
               <img src="/logo/cracklix-logo-dark.png" alt="Cracklix" className="h-8 w-auto opacity-30 grayscale ml-auto" crossOrigin="anonymous" />
               <p className="text-[11px] font-black tracking-[0.5em] text-slate-300 uppercase">www.cracklix.in</p>
            </div>
         </div>
      </div>
    </div>
  );
}

function KPIBox({ label, val, color }: any) {
   return (
      <div className="bg-white border border-slate-100 p-5 rounded-3xl flex flex-col items-center justify-center gap-3 shadow-sm text-center h-28 flex-1">
         <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</p>
         <p className={cn("text-3xl font-black tabular-nums tracking-tighter leading-none", color)}>{val}</p>
      </div>
   )
}

function CountPill({ label, val, color }: any) {
   return (
      <div className={cn("p-4 rounded-2xl flex flex-col items-center justify-center gap-1 h-20 flex-1 shadow-sm", color)}>
         <span className="text-2xl font-black tabular-nums leading-none">{val}</span>
         <span className="text-[10px] font-black uppercase tracking-widest opacity-70 mt-1">{label}</span>
      </div>
   )
}
