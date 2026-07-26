
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
 * @fileOverview Responsive Screen Layout for Browser Viewing v12.0.
 * FIXED: Absolute centering and Title Case synchronization.
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
      
      {/* 1. Header Node - Centered Box */}
      <div className="bg-white rounded-[2rem] md:rounded-[3rem] p-8 md:p-14 border border-slate-100 shadow-sm space-y-10 flex flex-col items-center">
         <div className="flex flex-col items-center gap-8 w-full">
            <AuthorityLogo boardId={boardId || "GENERAL"} size="md" className="h-16 w-16 md:h-24 md:w-24 rounded-2xl shadow-xl border-4 border-slate-50 bg-slate-50" />
            <div className="space-y-4 w-full">
               <p className="text-[11px] font-bold text-primary uppercase tracking-widest">Performance report</p>
               <h1 className="text-3xl md:text-5xl font-black text-[#0F172A] leading-tight break-words">{studentName}</h1>
               <p className="text-base md:text-xl font-bold text-slate-500 line-clamp-1">{examTitle}</p>
            </div>
            <div className="flex flex-col items-center gap-3">
               <Badge className={cn("border-none px-10 py-3 rounded-full text-xs md:text-sm font-black uppercase tracking-widest shadow-sm", isQualified ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600")}>
                  {isQualified ? 'Qualified' : 'Attempted'}
               </Badge>
               <p className="text-[10px] font-bold text-slate-300 mt-1 uppercase tracking-tighter">Reference ID: {resultId?.slice(0, 15)}</p>
            </div>
         </div>
         
         {/* Internal Stat Grid */}
         <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-10 border-t border-slate-50 w-full max-w-4xl mx-auto">
            <DataMiniNode label="Attempt date" val={date} />
            <div className="hidden md:block w-px h-10 bg-slate-100 mx-auto" />
            <DataMiniNode label="Time taken" val={timeTaken} />
            <div className="hidden md:block w-px h-10 bg-slate-100 mx-auto" />
            <DataMiniNode label="Duration" val={duration ? `${duration}m` : 'Self'} />
            <div className="hidden md:block w-px h-10 bg-slate-100 mx-auto" />
            <DataMiniNode label="Attempt #" val={String(attemptNumber)} />
         </div>
      </div>

      {/* 2. Merit Shield */}
      <div className="bg-[#0F172A] rounded-[2rem] md:rounded-[3.5rem] p-12 md:p-24 text-white text-center relative overflow-hidden shadow-2xl">
         <div className="absolute top-0 right-0 p-8 opacity-5 rotate-12"><Trophy className="h-64 md:h-[400px] text-primary" /></div>
         <div className="relative z-10 space-y-6">
            <p className="text-[12px] md:text-base font-black text-primary uppercase tracking-[0.3em]">Your Punjab Rank</p>
            <div className="flex flex-col items-center justify-center">
               <span className="text-7xl md:text-[140px] font-[900] tracking-tighter text-white tabular-nums leading-none">#{rank}</span>
               <span className="text-xl md:text-[40px] font-black text-slate-500 tabular-nums mt-6 uppercase tracking-tight">/ {totalCandidates} Candidates</span>
            </div>
            <div className="pt-10">
               <Badge className="bg-emerald-500 text-white border-none px-12 py-4 rounded-full font-black text-xs md:text-sm shadow-4xl uppercase tracking-widest">
                  Verified Result Standing
               </Badge>
            </div>
         </div>
      </div>

      {/* 3. Stats Matrix */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
         <MetricBox label="Net score" val={score} color="text-primary" />
         <MetricBox label="Percentile" val={`${percentile}%`} color="text-purple-600" />
         <MetricBox label="Accuracy" val={`${attemptAccuracy}%`} color="text-emerald-600" />
         <MetricBox label="Grade hub" val={grade} color="text-amber-600" />
      </div>

      {/* 4. Subject Analytics */}
      {subjects.length > 0 && (
         <section className="space-y-8 pt-10">
            <div className="flex items-center justify-center gap-4 px-2">
               <BarChart3 className="h-8 w-8 text-primary" />
               <h3 className="text-xl md:text-4xl font-black text-[#0F172A] tracking-tighter uppercase">Subject Mastery</h3>
            </div>
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl overflow-hidden">
               <div className="overflow-x-auto no-scrollbar">
                  <table className="w-full text-center border-collapse">
                     <thead className="bg-slate-50 border-b border-slate-100">
                        <tr className="h-16 md:h-20">
                           <th className="px-12 py-5 font-black text-[11px] md:text-sm text-slate-500 tracking-widest text-left uppercase">Subject hub</th>
                           <th className="px-6 py-5 font-black text-[11px] md:text-sm text-center text-slate-500 tracking-widest uppercase">Score</th>
                           <th className="px-6 py-5 font-black text-[11px] md:text-sm text-center text-slate-500 tracking-widest uppercase">Accuracy</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-50">
                        {subjects.map((s, i) => (
                           <tr key={i} className="hover:bg-slate-50 transition-colors h-16 md:h-24">
                              <td className="px-12 font-black text-[15px] md:text-2xl text-[#0F172A] text-left">{s.name}</td>
                              <td className="px-6 text-center font-black text-primary text-lg md:text-3xl tabular-nums">{Number(s.score).toFixed(1)}</td>
                              <td className="px-6 text-center">
                                 <Badge className="bg-emerald-50 text-emerald-600 border-none font-black text-[10px] md:text-lg tabular-nums px-5 py-2 rounded-xl shadow-sm">{s.accuracy}%</Badge>
                              </td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
               </div>
            </div>
         </section>
      )}

      {/* 5. Count Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 pt-10">
         <CountCard label="Correct" val={correct} color="text-emerald-600 bg-emerald-50" />
         <CountCard label="Wrong" val={wrong} color="text-rose-600 bg-rose-50" />
         <CountCard label="Skipped" val={skipped} color="text-slate-400 bg-slate-50" />
         <CountCard label="Total items" val={total} color="text-blue-600 bg-blue-50" />
      </div>

    </div>
  );
}

function DataMiniNode({ label, val }: { label: string, val: string }) {
   return (
      <div className="space-y-2 text-center flex flex-col items-center justify-center">
         <p className="text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-widest leading-none">{label}</p>
         <p className="text-base md:text-2xl font-[900] text-[#0F172A] tabular-nums truncate leading-none mt-1">{val}</p>
      </div>
   )
}

function MetricBox({ label, val, color }: any) {
   return (
      <Card className="border-none shadow-xl bg-white p-8 md:p-12 rounded-[2rem] md:rounded-[3rem] flex flex-col items-center justify-center gap-4 transition-all border border-slate-50 h-40 md:h-[280px] text-center hover:translate-y-[-4px]">
         <p className="text-[10px] md:text-sm font-black text-slate-400 uppercase tracking-[0.2em]">{label}</p>
         <p className={cn("text-3xl md:text-7xl font-black tabular-nums tracking-tighter leading-none", color)}>{val}</p>
      </Card>
   )
}

function CountCard({ label, val, color }: any) {
   return (
      <div className={cn("p-8 md:p-14 rounded-[2rem] md:rounded-[3rem] flex flex-col items-center justify-center text-center gap-2 shadow-inner", color)}>
         <span className="text-3xl md:text-6xl font-[900] tabular-nums tracking-tighter leading-none">{val}</span>
         <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.3em] opacity-60 mt-2">{label}</span>
      </div>
   )
}
