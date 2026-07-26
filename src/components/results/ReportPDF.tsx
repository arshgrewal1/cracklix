'use client';

import React from 'react';
import { 
  ShieldCheck, 
  CheckCircle2, 
  Trophy,
  Zap,
  TrendingUp,
  Target,
  Award,
  BarChart3,
  Clock
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from "@/components/ui/badge";

interface ReportPDFProps {
  studentName: string;
  examTitle: string;
  score: string | number;
  rank: string | number;
  totalCandidates: number;
  accuracy: string | number;
  attemptAccuracy: string | number;
  attemptRate: string | number;
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
  readinessLevel?: string;
  topperScore?: number;
  avgScore?: number;
  duration?: number | string;
}

/**
 * @fileOverview Hardened PDF Fixed-Layout Hub v1.2.
 * UPDATED: Fixed resultId.slice and increased logo size for brand prominence.
 */
export default function ReportPDF(props: ReportPDFProps) {
  const {
    studentName, examTitle, score, rank, totalCandidates, accuracy,
    attemptAccuracy, attemptRate, timeTaken, correct, wrong, skipped,
    total, date, resultId, percentile, subjects = [], grade = "F",
    isQualified, readinessLevel = "Standard", topperScore = 0, avgScore = 0,
    duration
  } = props;

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent('https://cracklix.in')}`;

  return (
    <div 
      className="bg-white p-0 m-0 box-border text-left font-body overflow-hidden"
      style={{ width: '794px', minHeight: '1123px' }}
    >
      {/* 1. Header (2-Column Grid) */}
      <div className="flex items-center justify-between px-10 py-12 border-b-2 border-slate-100 bg-slate-50/20">
         <div className="flex items-center gap-8">
            <div className="h-28 w-28 relative bg-white border-2 border-slate-100 rounded-3xl shadow-xl overflow-hidden p-2">
               <img src="/logo/cracklix-icon.png" alt="Logo" className="h-full w-full object-contain" crossOrigin="anonymous" />
            </div>
            <div className="space-y-1">
               <h2 className="text-5xl font-black text-[#0F172A] tracking-tighter leading-none">Cracklix</h2>
               <p className="text-base font-bold text-primary tracking-[0.2em] uppercase">Smart Preparation. Better Results.</p>
            </div>
         </div>
         <div className="text-right space-y-2">
            <p className="text-2xl font-black text-[#0F172A] uppercase tracking-tight">Performance Report</p>
            <p className="text-sm font-bold text-slate-400 tabular-nums bg-white px-3 py-1 rounded-lg border border-slate-100">ID: {resultId?.slice(0, 15) || "REF-GUEST"}</p>
         </div>
      </div>

      <div className="p-10 space-y-10">
         
         {/* 2. Candidate & Rank Node (2-Column Grid) */}
         <div className="grid grid-cols-[1fr_260px] gap-10">
            <div className="bg-slate-50 rounded-[2.5rem] p-10 border border-slate-100 flex flex-col justify-between shadow-inner">
               <div className="space-y-2">
                  <p className="text-[10px] font-bold text-primary uppercase tracking-[0.3em]">Candidate Identity</p>
                  <h1 className="text-4xl font-black text-[#0F172A] leading-tight break-words">{studentName}</h1>
                  <p className="text-xl font-bold text-slate-400 leading-tight">{examTitle}</p>
               </div>
               <div className="grid grid-cols-2 gap-8 mt-10 pt-8 border-t border-slate-200">
                  <MetaItem label="Attempt Date" val={date} />
                  <MetaItem label="Time Taken" val={timeTaken} />
                  <MetaItem label="Test Duration" val={duration ? `${duration}m` : 'Timed'} />
                  <MetaItem label="Result Status" val={isQualified ? 'Qualified' : 'Attempted'} color={isQualified ? "text-emerald-600" : "text-rose-600"} />
               </div>
            </div>

            <div className="bg-[#0F172A] rounded-[2.5rem] p-10 text-white text-center flex flex-col justify-center gap-6 relative overflow-hidden shadow-2xl">
               <div className="absolute top-0 right-0 p-6 opacity-10 rotate-12"><Trophy className="h-40 w-40 text-primary" /></div>
               <div className="relative z-10 space-y-2">
                  <p className="text-[10px] font-bold text-primary uppercase tracking-[0.3em]">Punjab Rank</p>
                  <p className="text-7xl font-black tabular-nums tracking-tighter">#{rank}</p>
                  <p className="text-sm font-bold text-slate-500 tabular-nums">/ {totalCandidates.toLocaleString()} Candidates</p>
                  <div className="mt-8">
                    <Badge className="bg-emerald-500 text-white border-none font-bold text-[10px] uppercase px-5 py-2 rounded-full shadow-lg">Verified Standing</Badge>
                  </div>
               </div>
            </div>
         </div>

         {/* 3. KPI Matrix (4 Columns) */}
         <div className="grid grid-cols-4 gap-6">
            <KPIBox label="Net Score" val={score} color="text-primary" />
            <KPIBox label="Percentile" val={`${percentile}%`} color="text-purple-600" />
            <KPIBox label="Accuracy" val={`${attemptAccuracy}%`} color="text-emerald-600" />
            <KPIBox label="Official Grade" val={grade} color="text-amber-600" />
         </div>

         {/* 4. Question Audit Ledger (4 Columns) */}
         <div className="grid grid-cols-4 gap-6">
            <CountPill label="Correct" val={correct} color="bg-emerald-50 text-emerald-600" />
            <CountPill label="Wrong" val={wrong} color="bg-rose-50 text-rose-600" />
            <CountPill label="Skipped" val={skipped} color="bg-slate-50 text-slate-400" />
            <CountPill label="Total Questions" val={total} color="bg-blue-50 text-blue-600" />
         </div>

         {/* 5. Subject Table */}
         {subjects.length > 0 && (
            <div className="space-y-6">
               <p className="text-[11px] font-black uppercase text-[#0F172A] tracking-[0.3em] flex items-center gap-3">
                  <BarChart3 className="h-5 w-5 text-primary" /> Subject Mastery Analytics
               </p>
               <div className="border border-slate-100 rounded-[2rem] overflow-hidden bg-white shadow-xl">
                  <table className="w-full text-left">
                     <thead>
                        <tr className="bg-slate-50 border-b border-slate-100">
                           <th className="px-10 py-5 font-bold text-[11px] text-slate-500 uppercase tracking-widest">Subject Hub</th>
                           <th className="px-6 py-5 font-bold text-[11px] text-center text-slate-500 uppercase tracking-widest">Net Score</th>
                           <th className="px-6 py-5 font-bold text-[11px] text-center text-slate-500 uppercase tracking-widest">Accuracy %</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-50">
                        {subjects.map((s, i) => (
                           <tr key={i} className="hover:bg-slate-50 transition-colors">
                              <td className="px-10 py-6 font-bold text-base text-[#0F172A]">{s.name}</td>
                              <td className="px-6 py-6 text-center font-black text-primary text-lg tabular-nums">{Number(s.score).toFixed(1)}</td>
                              <td className="px-6 py-6 text-center">
                                 <Badge className="bg-emerald-50 text-emerald-600 border-none font-bold text-[11px] tabular-nums">{s.accuracy}%</Badge>
                              </td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
               </div>
            </div>
         )}

         {/* 6. Footer Verification */}
         <div className="pt-20 mt-auto border-t border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-10">
               <div className="h-28 w-28 bg-white border border-slate-100 p-2 rounded-[1.5rem] shadow-xl">
                  <img src={qrUrl} alt="Verify" className="h-full w-full object-contain" crossOrigin="anonymous" />
               </div>
               <div className="space-y-2">
                  <p className="text-primary font-black text-base flex items-center gap-3">
                     <ShieldCheck className="h-6 w-6" /> Digitally Verified Report
                  </p>
                  <p className="text-slate-400 text-sm max-w-[320px] leading-snug font-medium">
                     This performance report is synchronized with the official Cracklix preparation registry.
                  </p>
               </div>
            </div>
            <div className="text-right space-y-2">
               <img src="/logo/cracklix-logo-dark.png" alt="Cracklix" className="h-12 w-auto opacity-30 grayscale ml-auto" crossOrigin="anonymous" />
               <p className="text-[11px] font-black tracking-[0.4em] text-slate-300 uppercase">www.cracklix.in</p>
            </div>
         </div>
      </div>
    </div>
  );
}

function MetaItem({ label, val, color = "text-[#0F172A]" }: any) {
   return (
      <div className="space-y-1">
         <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
         <p className={cn("text-base font-black truncate", color)}>{val}</p>
      </div>
   )
}

function KPIBox({ label, val, color }: any) {
   return (
      <div className="bg-white border border-slate-100 p-8 rounded-[2rem] flex flex-col gap-3 h-40 justify-center shadow-xl border-t-4 border-t-primary">
         <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">{label}</p>
         <p className={cn("text-4xl font-black tabular-nums tracking-tighter", color)}>{val}</p>
      </div>
   )
}

function CountPill({ label, val, color }: any) {
   return (
      <div className={cn("p-6 rounded-[1.5rem] flex flex-col items-center justify-center gap-1 shadow-sm", color)}>
         <span className="text-2xl font-black tabular-nums">{val}</span>
         <span className="text-[9px] font-bold uppercase tracking-widest opacity-70">{label}</span>
      </div>
   )
}
