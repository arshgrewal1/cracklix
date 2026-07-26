'use client';

import React from 'react';
import { 
  ShieldCheck, 
  BarChart3, 
  Target,
  Trophy,
  TrendingUp,
  Zap,
  Clock
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
 * @fileOverview Responsive Screen Layout for Browser Viewing v3.0.
 * FIXED: Null-safety for resultId and Title Case enforcement.
 * FIXED: Missing Card reference error.
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
      
      {/* 1. Header Info - Optimized for PWA full-width */}
      <div className="bg-white rounded-2xl md:rounded-[2.5rem] p-5 md:p-10 border border-slate-100 shadow-sm space-y-6">
         <div className="flex flex-col md:flex-row justify-between items-start gap-4">
            <div className="flex items-center gap-4 md:gap-6 min-w-0 flex-1">
               <AuthorityLogo boardId={boardId || "GENERAL"} size="md" className="h-14 w-14 md:h-20 md:w-20 rounded-xl" />
               <div className="space-y-1 min-w-0 flex-1">
                  <p className="text-[10px] font-bold text-primary tracking-tight">Performance Report</p>
                  <h1 className="text-xl md:text-3xl font-[900] text-[#0F172A] leading-tight break-words">{studentName}</h1>
                  <p className="text-sm md:text-xl font-bold text-slate-500 line-clamp-1">{examTitle}</p>
               </div>
            </div>
            <div className="text-left md:text-right shrink-0">
               <Badge className={cn("border-none px-4 py-1 rounded-full text-[10px] font-black", isQualified ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600")}>
                  {isQualified ? 'Qualified' : 'Attempted'}
               </Badge>
               <p className="text-[9px] font-bold text-slate-300 mt-2">ID: {resultId?.slice(0, 12) || "Registry"}</p>
            </div>
         </div>
         
         <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 pt-4 border-t border-slate-50">
            <DataMiniNode label="Attempt Date" val={date} />
            <DataMiniNode label="Time Taken" val={timeTaken} />
            <DataMiniNode label="Test Duration" val={duration ? `${duration}m` : 'Timed'} />
            <DataMiniNode label="Total Candidates" val={totalCandidates.toLocaleString()} />
         </div>
      </div>

      {/* 2. Rank Hero */}
      <div className="bg-[#0F172A] rounded-2xl md:rounded-[3rem] p-6 md:p-14 text-white text-center relative overflow-hidden shadow-2xl border border-white/5">
         <div className="absolute top-0 right-0 p-8 opacity-5 rotate-12"><Trophy className="h-44 md:h-64 w-44 md:w-64 text-primary" /></div>
         <div className="relative z-10 space-y-4">
            <p className="text-[10px] md:text-sm font-bold text-primary tracking-tight">Your Punjab Rank</p>
            <div className="flex items-baseline justify-center gap-2 md:gap-3">
               <span className="text-5xl md:text-[100px] font-black tracking-tighter text-white tabular-nums">#{rank}</span>
               <span className="text-base md:text-4xl font-bold text-slate-500 tabular-nums">/ {totalCandidates}</span>
            </div>
            <Badge className="bg-emerald-500 text-white border-none px-5 py-1.5 rounded-full font-black text-[9px] md:text-sm shadow-xl">
               {Number(rank) <= 10 && totalCandidates >= 5 ? 'Top Performer' : 'Verified Attempt'}
            </Badge>
         </div>
      </div>

      {/* 3. Main Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
         <MetricBox label="Net Score" val={score} sub="Actual points" icon={<Zap />} color="text-primary" bg="bg-blue-50" />
         <MetricBox label="Percentile" val={`${percentile}%`} sub="Standing" icon={<TrendingUp />} color="text-purple-600" bg="bg-purple-50" />
         <MetricBox label="Accuracy" val={`${attemptAccuracy}%`} sub="Precision" icon={<Target />} color="text-emerald-600" bg="bg-emerald-50" />
         <MetricBox label="Grade Hub" val={grade} sub="Audit level" color="text-amber-600" bg="bg-amber-50" />
      </div>

      {/* 4. Subject Mastery Hub */}
      {subjects.length > 0 && (
         <section className="space-y-4">
            <div className="flex items-center gap-3 px-1">
               <BarChart3 className="h-5 w-5 text-primary" />
               <h3 className="text-lg md:text-2xl font-black text-[#0F172A] tracking-tight">Subject Mastery</h3>
            </div>
            <div className="bg-white rounded-2xl md:rounded-[2rem] border border-slate-100 shadow-xl overflow-hidden">
               <div className="overflow-x-auto no-scrollbar">
                  <table className="w-full text-left">
                     <thead className="bg-slate-50 border-b border-slate-100">
                        <tr>
                           <th className="px-6 py-4 font-bold text-[9px] md:text-[10px] text-slate-500 tracking-widest uppercase">Subject Hub</th>
                           <th className="px-4 py-4 font-bold text-[9px] md:text-[10px] text-center text-slate-500 tracking-widest uppercase">Score</th>
                           <th className="px-4 py-4 font-bold text-[9px] md:text-[10px] text-center text-slate-500 tracking-widest uppercase">Accuracy</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-50">
                        {subjects.map((s, i) => (
                           <tr key={i} className="hover:bg-slate-50 transition-colors h-14 md:h-16">
                              <td className="px-6 py-4 font-bold text-xs md:text-base text-[#0F172A] truncate max-w-[120px] md:max-w-none">{s.name}</td>
                              <td className="px-4 py-4 text-center font-black text-primary text-sm md:text-lg tabular-nums">{Number(s.score).toFixed(1)}</td>
                              <td className="px-4 py-4 text-center font-bold text-slate-400 text-xs md:text-sm tabular-nums">{s.accuracy}%</td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
               </div>
            </div>
         </section>
      )}

      {/* 5. Question Analysis Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
         <CountNode label="Correct" val={correct} color="text-emerald-600 bg-emerald-50" />
         <CountNode label="Wrong" val={wrong} color="text-rose-600 bg-rose-50" />
         <CountNode label="Skipped" val={skipped} color="text-slate-400 bg-slate-50" />
         <CountNode label="Total Questions" val={total} color="text-blue-600 bg-blue-50" />
      </div>

    </div>
  );
}

function DataMiniNode({ label, val }: { label: string, val: string }) {
   return (
      <div className="space-y-0.5">
         <p className="text-[8px] md:text-[9px] font-bold text-slate-400 uppercase tracking-widest">{label}</p>
         <p className="text-xs md:text-sm font-bold text-[#0F172A] tabular-nums truncate">{val}</p>
      </div>
   )
}

function MetricBox({ label, val, icon, color, bg }: any) {
   return (
      <Card className="border-none shadow-md bg-white p-4 md:p-8 rounded-2xl flex flex-col items-start gap-3 hover:translate-y-[-2px] transition-all border border-slate-50">
         {icon && (
            <div className={cn("h-8 w-8 md:h-12 md:w-12 rounded-xl flex items-center justify-center shadow-inner", bg, color)}>
               {React.isValidElement(icon) ? React.cloneElement(icon as React.ReactElement, { className: "h-4 w-4 md:h-6 md:w-6" }) : icon}
            </div>
         )}
         <div className="min-w-0 w-full">
            <p className={cn("text-base md:text-xl font-black text-[#0F172A] tabular-nums leading-none tracking-tight truncate")}>{val}</p>
            <p className="text-[7px] md:text-[9px] font-bold text-slate-400 tracking-tight mt-1 truncate">{label}</p>
         </div>
      </Card>
   )
}

function CountNode({ label, val, color }: any) {
   return (
      <div className={cn("p-4 md:p-6 rounded-xl md:rounded-2xl flex flex-col items-center justify-center text-center gap-0.5 md:gap-1", color)}>
         <span className="text-lg md:text-3xl font-black tabular-nums">{val}</span>
         <span className="text-[7px] md:text-[10px] font-bold tracking-tight opacity-60 uppercase">{label}</span>
      </div>
   )
}
