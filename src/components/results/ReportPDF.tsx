
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
 * @fileOverview Hardened PDF Fixed-Layout Hub v1.0.
 * Width is strictly locked to 794px (A4 at 96DPI).
 * Uses static Flex/Grid blocks to avoid overlapping issues in html2canvas.
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
      <div className="flex items-center justify-between px-10 py-10 border-b-2 border-slate-100">
         <div className="flex items-center gap-6">
            <div className="h-24 w-24 relative bg-white border border-slate-50 rounded-2xl shadow-sm">
               <img src="/logo/cracklix-icon.png" alt="Logo" className="h-full w-full object-contain" crossOrigin="anonymous" />
            </div>
            <div>
               <h2 className="text-4xl font-black text-[#0F172A] tracking-tighter leading-none">Cracklix</h2>
               <p className="text-sm font-bold text-primary tracking-widest mt-2 uppercase">Smart Preparation. Better Results.</p>
            </div>
         </div>
         <div className="text-right space-y-1">
            <p className="text-xl font-black text-[#0F172A] uppercase tracking-tight">Performance Report</p>
            <p className="text-sm font-bold text-slate-300 tabular-nums">ID: {resultId.slice(0, 15)}</p>
         </div>
      </div>

      <div className="p-10 space-y-10">
         
         {/* 2. Candidate & Rank Node (2-Column Grid) */}
         <div className="grid grid-cols-[1fr_240px] gap-8">
            <div className="bg-slate-50 rounded-[2rem] p-8 border border-slate-100 flex flex-col justify-between">
               <div className="space-y-2">
                  <p className="text-[10px] font-bold text-primary uppercase">Candidate Name</p>
                  <h1 className="text-4xl font-black text-[#0F172A] leading-tight break-words">{studentName}</h1>
               </div>
               <div className="grid grid-cols-2 gap-6 mt-6">
                  <div>
                    <p className="text-[9px] font-bold text-slate-400 uppercase">Test Title</p>
                    <p className="text-sm font-bold text-[#0F172A]">{examTitle}</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-bold text-slate-400 uppercase">Attempt Date</p>
                    <p className="text-sm font-bold text-[#0F172A]">{date}</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-bold text-slate-400 uppercase">Time Taken</p>
                    <p className="text-sm font-bold text-[#0F172A] tabular-nums">{timeTaken}</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-bold text-slate-400 uppercase">Qualification</p>
                    <p className={cn("text-sm font-black", isQualified ? "text-emerald-600" : "text-rose-600")}>{isQualified ? 'Qualified' : 'Attempted'}</p>
                  </div>
               </div>
            </div>

            <div className="bg-[#0F172A] rounded-[2rem] p-8 text-white text-center flex flex-col justify-center gap-4 relative overflow-hidden">
               <div className="relative z-10 space-y-2">
                  <p className="text-[9px] font-bold text-primary uppercase tracking-widest">Punjab Rank</p>
                  <p className="text-6xl font-black tabular-nums tracking-tighter">#{rank}</p>
                  <p className="text-sm font-bold text-slate-500 tabular-nums">/ {totalCandidates}</p>
                  <Badge className="bg-emerald-500 text-white border-none font-bold text-[9px] uppercase px-3 py-1 rounded-full mt-4">Verified</Badge>
               </div>
            </div>
         </div>

         {/* 3. KPI Matrix (4 Columns) */}
         <div className="grid grid-cols-4 gap-4">
            <KPIBox label="Net Score" val={score} color="text-primary" />
            <KPIBox label="Percentile" val={`${percentile}%`} color="text-purple-600" />
            <KPIBox label="Accuracy" val={`${attemptAccuracy}%`} color="text-emerald-600" />
            <KPIBox label="Audit Status" val={`Grade ${grade}`} color="text-amber-600" />
         </div>

         {/* 4. Question Audit Ledger (4 Columns) */}
         <div className="grid grid-cols-4 gap-4">
            <CountPill label="Correct" val={correct} color="bg-emerald-50 text-emerald-600" />
            <CountPill label="Wrong" val={wrong} color="bg-rose-50 text-rose-600" />
            <CountPill label="Skipped" val={skipped} color="bg-slate-50 text-slate-400" />
            <CountPill label="Total Questions" val={total} color="bg-blue-50 text-blue-600" />
         </div>

         {/* 5. Subject Table */}
         {subjects.length > 0 && (
            <div className="space-y-4">
               <p className="text-[10px] font-black uppercase text-[#0F172A] tracking-widest flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" /> Subject Analytics
               </p>
               <div className="border border-slate-100 rounded-[1.5rem] overflow-hidden bg-white shadow-sm">
                  <table className="w-full text-left">
                     <thead>
                        <tr className="bg-slate-50 border-b border-slate-100">
                           <th className="px-8 py-4 font-bold text-[10px] text-slate-500">Subject Hub</th>
                           <th className="px-4 py-4 font-bold text-[10px] text-center text-slate-500">Score</th>
                           <th className="px-4 py-4 font-bold text-[10px] text-center text-slate-500">Accuracy</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-50">
                        {subjects.map((s, i) => (
                           <tr key={i}>
                              <td className="px-8 py-4 font-bold text-sm text-[#0F172A]">{s.name}</td>
                              <td className="px-4 py-4 text-center font-black text-primary tabular-nums">{Number(s.score).toFixed(1)}</td>
                              <td className="px-4 py-5 text-center font-bold text-slate-400 tabular-nums">{s.accuracy}%</td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
               </div>
            </div>
         )}

         {/* 6. Footer Verification */}
         <div className="pt-20 border-t border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-6">
               <div className="h-24 w-24 bg-white border border-slate-100 p-2 rounded-xl">
                  <img src={qrUrl} alt="Verify" className="h-full w-full object-contain" crossOrigin="anonymous" />
               </div>
               <div className="space-y-1">
                  <p className="text-primary font-bold text-sm flex items-center gap-2">
                     <ShieldCheck className="h-5 w-5" /> Digitally Verified
                  </p>
                  <p className="text-slate-400 text-xs max-w-[200px] leading-tight">
                     Scan QR to verify this official performance report on cracklix.in
                  </p>
               </div>
            </div>
            <div className="text-right space-y-1">
               <img src="/logo/cracklix-logo-dark.png" alt="Cracklix" className="h-10 w-auto opacity-30 grayscale ml-auto" crossOrigin="anonymous" />
               <p className="text-[10px] font-bold text-slate-300">www.cracklix.in</p>
            </div>
         </div>
      </div>
    </div>
  );
}

function KPIBox({ label, val, color }: any) {
   return (
      <div className="bg-white border border-slate-100 p-6 rounded-[1.5rem] flex flex-col gap-2 h-32 justify-center shadow-sm">
         <p className="text-[8px] font-black uppercase text-slate-400 tracking-widest">{label}</p>
         <p className={cn("text-2xl font-black tabular-nums", color)}>{val}</p>
      </div>
   )
}

function CountPill({ label, val, color }: any) {
   return (
      <div className={cn("p-4 rounded-xl flex flex-col items-center justify-center gap-0.5", color)}>
         <span className="text-xl font-black tabular-nums">{val}</span>
         <span className="text-[7px] font-bold uppercase tracking-widest opacity-70">{label}</span>
      </div>
   )
}
