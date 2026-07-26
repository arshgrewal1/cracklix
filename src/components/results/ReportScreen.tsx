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
 * @fileOverview Responsive Screen Layout for Browser Viewing v9.1.
 * FIXED: Removed all remaining uppercase text.
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
      
      {/* 1. Header Node */}
      <div className="bg-white rounded-2xl md:rounded-[2.5rem] p-6 md:p-10 border border-slate-100 shadow-sm space-y-8">
         <div className="flex flex-col md:flex-row justify-between items-start gap-6">
            <div className="flex items-center gap-5 md:gap-8 min-w-0 flex-1">
               <AuthorityLogo boardId={boardId || "GENERAL"} size="md" className="h-14 w-14 md:h-20 md:w-20 rounded-2xl shadow-xl border-4 border-slate-50 bg-slate-50" />
               <div className="space-y-1 min-w-0 flex-1">
                  <p className="text-[10px] md:text-xs font-bold text-primary">Performance Report</p>
                  <h1 className="text-xl md:text-3xl font-black text-[#0F172A] leading-tight break-words">{studentName}</h1>
                  <p className="text-sm md:text-lg font-bold text-slate-500 line-clamp-1">{examTitle}</p>
               </div>
            </div>
            <div className="text-left md:text-right shrink-0">
               <Badge className={cn("border-none px-4 py-1.5 rounded-full text-[10px] md:text-xs font-bold", isQualified ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600")}>
                  {isQualified ? 'Qualified' : 'Attempted'}
               </Badge>
               <p className="text-[10px] font-bold text-slate-300 mt-2 truncate max-w-[120px]">ID: {resultId?.slice(0, 15)}</p>
            </div>
         </div>
         
         <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-6 border-t border-slate-50">
            <DataMiniNode label="Attempt Date" val={date} />
            <DataMiniNode label="Time Taken" val={timeTaken} />
            <DataMiniNode label="Duration" val={duration ? `${duration}m` : 'Self'} />
            <DataMiniNode label="Total Pool" val={totalCandidates.toLocaleString()} />
         </div>
      </div>

      {/* 2. Merit Shield */}
      <div className="bg-[#0F172A] rounded-[2rem] md:rounded-[3rem] p-10 md:p-16 text-white text-center relative overflow-hidden shadow-2xl">
         <div className="absolute top-0 right-0 p-8 opacity-5 rotate-12"><Trophy className="h-48 md:h-72 w-48 md:w-72 text-primary" /></div>
         <div className="relative z-10 space-y-4">
            <p className="text-[11px] md:text-sm font-bold text-primary">Your Punjab Rank</p>
            <div className="flex flex-col items-center justify-center">
               <span className="text-6xl md:text-9xl font-black tracking-tighter text-white tabular-nums leading-none">#{rank}</span>
               <span className="text-lg md:text-3xl font-bold text-slate-500 tabular-nums mt-4">/ {totalCandidates} Candidates</span>
            </div>
            <div className="pt-6">
               <Badge className="bg-emerald-500 text-white border-none px-6 py-2 rounded-full font-bold text-[10px] md:text-sm shadow-2xl">
                  Verified Result Standing
               </Badge>
            </div>
         </div>
      </div>

      {/* 3. Stats Matrix */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
         <MetricBox label="Net Score" val={score} color="text-primary" bg="bg-blue-50" />
         <MetricBox label="Percentile" val={`${percentile}%`} color="text-purple-600" bg="bg-purple-50" />
         <MetricBox label="Accuracy" val={`${attemptAccuracy}%`} color="text-emerald-600" bg="bg-emerald-50" />
         <MetricBox label="Grade" val={grade} color="text-amber-600" bg="bg-amber-50" />
      </div>

      {/* 4. Subject Analytics */}
      {subjects.length > 0 && (
         <section className="space-y-6">
            <div className="flex items-center gap-3 px-2">
               <BarChart3 className="h-6 w-6 text-primary" />
               <h3 className="text-lg md:text-2xl font-black text-[#0F172A] tracking-tight">Subject Mastery</h3>
            </div>
            <div className="bg-white rounded-[2rem] border border-slate-100 shadow-xl overflow-hidden">
               <div className="overflow-x-auto no-scrollbar">
                  <table className="w-full text-left border-collapse">
                     <thead className="bg-slate-50 border-b border-slate-100">
                        <tr>
                           <th className="px-8 py-5 font-bold text-[10px] md:text-[11px] text-slate-500 tracking-tight">Subject Hub</th>
                           <th className="px-4 py-5 font-bold text-[10px] md:text-[11px] text-center text-slate-500 tracking-tight">Score</th>
                           <th className="px-4 py-5 font-bold text-[10px] md:text-[11px] text-center text-slate-500 tracking-tight">Accuracy</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-50">
                        {subjects.map((s, i) => (
                           <tr key={i} className="hover:bg-slate-50 transition-colors h-16">
                              <td className="px-8 font-bold text-[14px] md:text-lg text-[#0F172A]">{s.name}</td>
                              <td className="px-4 text-center font-black text-primary text-base md:text-xl tabular-nums">{Number(s.score).toFixed(1)}</td>
                              <td className="px-4 text-center">
                                 <Badge className="bg-emerald-50 text-emerald-600 border-none font-bold text-[10px] md:text-sm tabular-nums px-3 py-1 rounded-lg shadow-sm">{s.accuracy}%</Badge>
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
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
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
         <p className="text-[8px] md:text-[10px] font-bold text-slate-400">{label}</p>
         <p className="text-[12px] md:text-lg font-black text-[#0F172A] tabular-nums truncate leading-none">{val}</p>
      </div>
   )
}

function MetricBox({ label, val, color, bg }: any) {
   return (
      <Card className="border-none shadow-xl bg-white p-6 md:p-10 rounded-2xl md:rounded-[2.5rem] flex flex-col items-center justify-center gap-3 transition-all border border-slate-50 h-32 md:h-44 text-center">
         <p className="text-[9px] md:text-xs font-bold text-slate-400">{label}</p>
         <p className={cn("text-2xl md:text-5xl font-black tabular-nums tracking-tighter leading-none", color)}>{val}</p>
      </Card>
   )
}

function CountCard({ label, val, color }: any) {
   return (
      <div className={cn("p-6 md:p-8 rounded-2xl md:rounded-[2.5rem] flex flex-col items-center justify-center text-center gap-1 shadow-sm", color)}>
         <span className="text-2xl md:text-4xl font-black tabular-nums tracking-tighter leading-none">{val}</span>
         <span className="text-[9px] font-bold opacity-60 mt-2">{label}</span>
      </div>
   )
}
