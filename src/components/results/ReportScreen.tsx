
'use client';

import React from 'react';
import { 
  Trophy,
  Zap,
  Target,
  BarChart3,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { AuthorityLogo } from "@/lib/exam-icons";

interface ReportScreenProps {
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
  resultId?: string;
  percentile: number;
  subjects?: any[];
  grade?: string;
  isQualified?: boolean;
  duration?: number | string;
  boardId?: string;
}

/**
 * @fileOverview Responsive Screen Layout for Browser Viewing v12.0.
 * FIXED: Replaced absolute positioning with high-density flex layouts.
 * TERMINOLOGY: Corrected 'Fix Error' to 'Wrong' for final institutional standard.
 */
export default function ReportScreen(props: ReportScreenProps) {
  const {
    studentName, examTitle, score, rank, totalCandidates, 
    attemptAccuracy, timeTaken, correct, wrong, skipped,
    total, date, resultId, percentile, subjects = [], grade = "F",
    isQualified, duration, boardId
  } = props;

  return (
    <div className="w-full max-w-full overflow-x-hidden space-y-6 animate-in fade-in duration-500 text-left">
      
      {/* 1. IDENTITY HUB */}
      <div className="bg-white rounded-[2rem] md:rounded-[3.5rem] p-8 md:p-14 border border-slate-100 shadow-sm space-y-10">
         <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
            <AuthorityLogo boardId={boardId || "GENERAL"} size="md" className="h-16 w-16 md:h-28 md:w-28 rounded-2xl shadow-xl border-4 border-slate-50 bg-slate-50" />
            <div className="space-y-3 text-center md:text-left flex-1 min-w-0">
               <p className="text-[10px] font-bold text-primary uppercase tracking-[0.3em]">Institutional report</p>
               <h1 className="text-3xl md:text-5xl font-black text-[#0F172A] leading-tight truncate">{studentName}</h1>
               <p className="text-lg md:text-2xl font-bold text-slate-500 line-clamp-2">{examTitle}</p>
            </div>
            <div className="flex flex-col items-center md:items-end gap-3 shrink-0">
               <Badge className={cn("border-none px-6 py-2 rounded-full text-[10px] md:text-xs font-black uppercase tracking-widest shadow-lg", isQualified ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600")}>
                  {isQualified ? 'Qualified' : 'Attempted'}
               </Badge>
               <p className="text-[9px] font-bold text-slate-300 uppercase tracking-tighter tabular-nums">Ref: {resultId?.slice(0, 15)}</p>
            </div>
         </div>
         
         <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-10 border-t border-slate-50">
            <DataMiniNode label="Attempt date" val={date} />
            <DataMiniNode label="Time taken" val={timeTaken} />
            <DataMiniNode label="Duration" val={duration ? `${duration}m` : 'Self'} />
            <DataMiniNode label="Total items" val={total} />
         </div>
      </div>

      {/* 2. MERIT SHIELD */}
      <div className="bg-[#0F172A] rounded-[2rem] md:rounded-[4.5rem] p-10 md:p-20 text-white text-center relative overflow-hidden shadow-2xl">
         <div className="absolute top-0 right-0 p-8 opacity-5 rotate-12"><Trophy className="h-64 md:h-[500px] text-primary" /></div>
         <div className="relative z-10 space-y-6">
            <p className="text-[12px] md:text-base font-black text-primary uppercase tracking-[0.4em]">Punjab Rank</p>
            <div className="flex items-center justify-center gap-6">
               <span className="text-8xl md:text-[140px] font-[900] tracking-tighter text-white tabular-nums leading-none">#{rank}</span>
               <span className="text-xl md:text-[40px] font-black text-slate-500 tabular-nums uppercase tracking-tight">/ {totalCandidates} Candidates</span>
            </div>
            <div className="pt-8">
               <Badge className="bg-emerald-500 text-white border-none px-10 py-3 rounded-full font-black text-[10px] md:text-sm shadow-4xl uppercase tracking-widest">
                  Verified Standing
               </Badge>
            </div>
         </div>
      </div>

      {/* 3. STATS MATRIX */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
         <MetricBox label="Net score" val={score} color="text-primary" />
         <MetricBox label="Percentile" val={`${percentile}%`} color="text-purple-600" />
         <MetricBox label="Accuracy" val={`${attemptAccuracy}%`} color="text-emerald-600" />
         <MetricBox label="Pass grade" val={grade} color="text-amber-600" />
      </div>

      {/* 4. SUBJECT ANALYSIS */}
      {subjects.length > 0 && (
         <section className="space-y-8 pt-10">
            <div className="flex items-center gap-4 px-2">
               <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                  <BarChart3 className="h-6 w-6" />
               </div>
               <h3 className="text-xl md:text-3xl font-[900] tracking-tight text-[#0F172A] uppercase">Subject Mastery</h3>
            </div>
            <div className="bg-white rounded-[3rem] border border-slate-100 shadow-2xl overflow-hidden">
               <div className="overflow-x-auto no-scrollbar">
                  <table className="w-full text-center border-collapse">
                     <thead className="bg-slate-50 border-b border-slate-100">
                        <tr className="h-16 md:h-20">
                           <th className="px-10 py-4 font-black text-[10px] md:text-xs text-slate-500 tracking-widest text-left uppercase">Subject Hub</th>
                           <th className="px-4 py-4 font-black text-[10px] md:text-xs text-center text-slate-500 tracking-widest uppercase">Score</th>
                           <th className="px-10 py-4 font-black text-[10px] md:text-xs text-right text-slate-500 tracking-widest uppercase">Accuracy</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-50">
                        {subjects.map((s, i) => (
                           <tr key={i} className="hover:bg-slate-50 transition-colors h-16 md:h-24">
                              <td className="px-10 font-black text-sm md:text-xl text-[#0F172A] text-left">{s.name}</td>
                              <td className="px-4 text-center font-[900] text-primary text-base md:text-3xl tabular-nums">{Number(s.score).toFixed(1)}</td>
                              <td className="px-10 text-right">
                                 <Badge className="bg-emerald-50 text-emerald-600 border-none font-[900] text-[9px] md:text-sm tabular-nums px-4 py-1.5 rounded-xl shadow-sm">{s.accuracy}%</Badge>
                              </td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
               </div>
            </div>
         </section>
      )}

      {/* 5. COUNT GRID */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 pt-10 pb-10">
         <CountCard label="Correct" val={correct} color="text-emerald-600 bg-emerald-50" />
         <CountCard label="Wrong" val={wrong} color="text-rose-600 bg-rose-50" />
         <CountCard label="Skipped" val={skipped} color="text-slate-400 bg-slate-50" />
         <CountCard label="Total" val={total} color="text-blue-600 bg-blue-50" />
      </div>

    </div>
  );
}

function DataMiniNode({ label, val }: { label: string, val: string }) {
   return (
      <div className="space-y-1 text-left">
         <p className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
         <p className="text-sm md:text-2xl font-[900] text-[#0F172A] tabular-nums truncate">{val}</p>
      </div>
   )
}

function MetricBox({ label, val, color }: any) {
   return (
      <Card className="border-none shadow-xl bg-white p-8 md:p-14 rounded-[2rem] md:rounded-[4rem] flex flex-col items-center justify-center gap-4 transition-all border border-slate-50 h-40 md:h-[320px] text-center hover:translate-y-[-8px]">
         <p className="text-[10px] md:text-sm font-black text-slate-400 uppercase tracking-[0.3em]">{label}</p>
         <p className={cn("text-3xl md:text-[84px] font-[900] tabular-nums tracking-tighter leading-none", color)}>{val}</p>
      </Card>
   )
}

function CountCard({ label, val, color }: any) {
   return (
      <div className={cn("p-8 md:p-16 rounded-[2rem] md:rounded-[3rem] flex flex-col items-center justify-center text-center gap-2 shadow-inner", color)}>
         <span className="text-3xl md:text-7xl font-[900] tabular-nums tracking-tighter leading-none">{val}</span>
         <span className="text-[9px] md:text-sm font-black uppercase tracking-[0.4em] opacity-60 mt-1">{label}</span>
      </div>
   )
}
