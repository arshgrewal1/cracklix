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
  attemptNumber?: number;
}

/**
 * @fileOverview Responsive Screen Layout for Browser Viewing v13.0.
 * FIXED: Absolute vertical centering for all main reporting nodes.
 * TERMINOLOGY: Strictly using "Wrong" for errors.
 */
export default function ReportScreen(props: ReportScreenProps) {
  const {
    studentName, examTitle, score, rank, totalCandidates, 
    attemptAccuracy, timeTaken, correct, wrong, skipped,
    total, date, resultId, percentile, subjects = [], grade = "F",
    isQualified, duration, boardId, attemptNumber = 1
  } = props;

  return (
    <div className="w-full max-w-full overflow-x-hidden space-y-6 animate-in fade-in duration-500 text-center px-4 md:px-0">
      
      {/* 1. IDENTITY HUB - CENTERED */}
      <div className="bg-white rounded-[2rem] md:rounded-[3.5rem] p-8 md:p-16 border border-slate-100 shadow-sm space-y-12 flex flex-col items-center">
         <div className="flex flex-col items-center gap-10 w-full">
            <AuthorityLogo boardId={boardId || "GENERAL"} size="md" className="h-16 w-16 md:h-28 md:w-28 rounded-2xl shadow-xl border-4 border-slate-50 bg-slate-50" />
            <div className="space-y-4 w-full">
               <p className="text-[11px] font-bold text-primary uppercase tracking-[0.3em]">Performance report</p>
               <h1 className="text-3xl md:text-6xl font-black text-[#0F172A] leading-tight break-words">{studentName}</h1>
               <p className="text-lg md:text-2xl font-bold text-slate-500 line-clamp-2 max-w-4xl mx-auto">{examTitle}</p>
            </div>
            <div className="flex flex-col items-center gap-4">
               <Badge className={cn("border-none px-12 py-4 rounded-full text-xs md:text-sm font-black uppercase tracking-widest shadow-lg", isQualified ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600")}>
                  {isQualified ? 'Qualified' : 'Attempted'}
               </Badge>
               <p className="text-[11px] font-bold text-slate-300 mt-1 uppercase tracking-tighter tabular-nums">Reference: {resultId?.slice(0, 15)}</p>
            </div>
         </div>
         
         <div className="grid grid-cols-2 md:grid-cols-4 gap-10 pt-12 border-t border-slate-50 w-full max-w-5xl mx-auto">
            <DataMiniNode label="Attempt date" val={date} />
            <div className="hidden md:block w-px h-12 bg-slate-100 mx-auto" />
            <DataMiniNode label="Time taken" val={timeTaken} />
            <div className="hidden md:block w-px h-12 bg-slate-100 mx-auto" />
            <DataMiniNode label="Duration" val={duration ? `${duration}m` : 'Self'} />
            <div className="hidden md:block w-px h-12 bg-slate-100 mx-auto" />
            <DataMiniNode label="Attempt #" val={`#${attemptNumber}`} />
         </div>
      </div>

      {/* 2. MERIT SHIELD - CENTERED */}
      <div className="bg-[#0F172A] rounded-[2rem] md:rounded-[4rem] p-12 md:p-32 text-white text-center relative overflow-hidden shadow-2xl">
         <div className="absolute top-0 right-0 p-8 opacity-5 rotate-12"><Trophy className="h-64 md:h-[600px] text-primary" /></div>
         <div className="relative z-10 space-y-8">
            <p className="text-[12px] md:text-base font-black text-primary uppercase tracking-[0.4em]">Your Punjab Rank</p>
            <div className="flex flex-col items-center justify-center gap-4">
               <span className="text-8xl md:text-[160px] font-[900] tracking-tighter text-white tabular-nums leading-none block">#{rank}</span>
               <span className="text-xl md:text-[48px] font-black text-slate-500 tabular-nums uppercase tracking-tight">/ {totalCandidates} Candidates</span>
            </div>
            <div className="pt-12">
               <Badge className="bg-emerald-500 text-white border-none px-16 py-5 rounded-full font-black text-xs md:text-lg shadow-4xl uppercase tracking-widest">
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
         <section className="space-y-10 pt-12">
            <div className="flex flex-col items-center justify-center gap-4">
               <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                  <BarChart3 className="h-8 w-8" />
               </div>
               <h3 className="text-xl md:text-4xl font-[900] tracking-tight text-[#0F172A] uppercase">Subject Mastery</h3>
            </div>
            <div className="bg-white rounded-[3rem] border border-slate-100 shadow-2xl overflow-hidden">
               <div className="overflow-x-auto no-scrollbar">
                  <table className="w-full text-center border-collapse">
                     <thead className="bg-slate-50 border-b border-slate-100">
                        <tr className="h-16 md:h-24">
                           <th className="px-12 py-5 font-black text-[11px] md:text-base text-slate-500 tracking-widest text-left uppercase">Subject Hub</th>
                           <th className="px-6 py-5 font-black text-[11px] md:text-base text-center text-slate-500 tracking-widest uppercase">Score</th>
                           <th className="px-12 py-5 font-black text-[11px] md:text-base text-right text-slate-500 tracking-widest uppercase">Accuracy</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-50">
                        {subjects.map((s, i) => (
                           <tr key={i} className="hover:bg-slate-50 transition-colors h-16 md:h-28">
                              <td className="px-12 font-black text-lg md:text-3xl text-[#0F172A] text-left">{s.name}</td>
                              <td className="px-6 text-center font-[900] text-primary text-xl md:text-4xl tabular-nums">{Number(s.score).toFixed(1)}</td>
                              <td className="px-12 text-right">
                                 <Badge className="bg-emerald-50 text-emerald-600 border-none font-[900] text-[10px] md:text-xl tabular-nums px-6 py-2 rounded-2xl shadow-sm">{s.accuracy}%</Badge>
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
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 pt-12 pb-12">
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
      <div className="space-y-3 text-center flex flex-col items-center justify-center">
         <p className="text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-widest leading-none">{label}</p>
         <p className="text-lg md:text-3xl font-[900] text-[#0F172A] tabular-nums truncate leading-none">{val}</p>
      </div>
   )
}

function MetricBox({ label, val, color }: any) {
   return (
      <Card className="border-none shadow-xl bg-white p-8 md:p-16 rounded-[2rem] md:rounded-[4rem] flex flex-col items-center justify-center gap-6 transition-all border border-slate-50 h-48 md:h-[360px] text-center hover:translate-y-[-8px]">
         <p className="text-[10px] md:text-lg font-black text-slate-400 uppercase tracking-[0.3em]">{label}</p>
         <p className={cn("text-4xl md:text-[100px] font-[900] tabular-nums tracking-tighter leading-none", color)}>{val}</p>
      </Card>
   )
}

function CountCard({ label, val, color }: any) {
   return (
      <div className={cn("p-8 md:p-20 rounded-[2rem] md:rounded-[4rem] flex flex-col items-center justify-center text-center gap-3 shadow-inner", color)}>
         <span className="text-4xl md:text-8xl font-[900] tabular-nums tracking-tighter leading-none">{val}</span>
         <span className="text-[10px] md:text-base font-black uppercase tracking-[0.4em] opacity-60 mt-2">{label}</span>
      </div>
   )
}
