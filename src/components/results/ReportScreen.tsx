'use client';

import React from 'react';
import { 
  ShieldCheck, 
  Clock, 
  BarChart3, 
  Target,
  Trophy,
  TrendingUp,
  Zap,
  Activity,
  Award,
  CheckCircle2,
  BookOpen,
  Timer
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { motion } from 'framer-motion';

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
 * @fileOverview Responsive Screen Layout for Browser Viewing.
 * FIXED: Added missing Card import and handled undefined resultId.
 */
export default function ReportScreen(props: ReportScreenProps) {
  const {
    studentName, examTitle, score, rank, totalCandidates, accuracy,
    attemptAccuracy, attemptRate, timeTaken, correct, wrong, skipped,
    total, date, resultId, percentile, subjects = [], grade = "F",
    isQualified, readinessLevel = "Standard", topperScore = 0, avgScore = 0,
    duration
  } = props;

  return (
    <div className="w-full space-y-6 md:space-y-10 animate-in fade-in duration-500 text-left">
      
      {/* Header Info */}
      <div className="bg-white rounded-[2rem] p-6 md:p-10 border border-slate-100 shadow-sm space-y-6">
         <div className="flex flex-col md:flex-row justify-between items-start gap-4">
            <div className="space-y-1">
               <p className="text-[10px] font-bold text-primary tracking-tight">Performance Report</p>
               <h1 className="text-xl md:text-4xl font-black text-[#0F172A] leading-tight">{studentName}</h1>
               <p className="text-sm md:text-xl font-bold text-slate-500">{examTitle}</p>
            </div>
            <div className="text-left md:text-right">
               <Badge className={cn("border-none px-4 py-1 rounded-full text-[10px] font-black", isQualified ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600")}>
                  {isQualified ? 'Qualified' : 'Attempted'}
               </Badge>
               <p className="text-[10px] font-bold text-slate-300 mt-2">ID: {resultId?.slice(0, 12) || 'Registry'}</p>
            </div>
         </div>
         
         <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-slate-50">
            <div className="space-y-1">
               <p className="text-[9px] font-bold text-slate-400">Attempt Date</p>
               <p className="text-sm font-bold text-[#0F172A]">{date}</p>
            </div>
            <div className="space-y-1">
               <p className="text-[9px] font-bold text-slate-400">Time Taken</p>
               <p className="text-sm font-bold text-[#0F172A] tabular-nums">{timeTaken}</p>
            </div>
            <div className="space-y-1">
               <p className="text-[9px] font-bold text-slate-400">Duration</p>
               <p className="text-sm font-bold text-[#0F172A]">{duration ? `${duration}m` : 'Timed'}</p>
            </div>
            <div className="space-y-1">
               <p className="text-[9px] font-bold text-slate-400">Candidates</p>
               <p className="text-sm font-bold text-[#0F172A] tabular-nums">{totalCandidates.toLocaleString()}</p>
            </div>
         </div>
      </div>

      {/* Rank Shield */}
      <div className="bg-[#0F172A] rounded-[2rem] md:rounded-[3rem] p-8 md:p-14 text-white text-center relative overflow-hidden shadow-2xl border border-white/5">
         <div className="absolute top-0 right-0 p-8 opacity-5 rotate-12"><Trophy className="h-64 w-64 text-primary" /></div>
         <div className="relative z-10 space-y-4">
            <p className="text-[10px] md:text-sm font-bold text-primary tracking-tight">Your Punjab Rank</p>
            <div className="flex items-baseline justify-center gap-3">
               <span className="text-6xl md:text-[120px] font-black tracking-tighter text-white tabular-nums">#{rank}</span>
               <span className="text-lg md:text-4xl font-bold text-slate-500 tabular-nums">/ {totalCandidates}</span>
            </div>
            <Badge className="bg-emerald-500 text-white border-none px-6 py-2 rounded-full font-black text-[10px] md:text-sm shadow-xl">
               {Number(rank) <= 10 && totalCandidates >= 5 ? 'Top Performer' : 'Verified Attempt'}
            </Badge>
         </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
         <MetricBox label="Net Score" val={score} sub="Actual points" icon={<Zap />} color="text-primary" bg="bg-blue-50" />
         <MetricBox label="Percentile" val={`${percentile}%`} sub="Verified standing" icon={<TrendingUp />} color="text-purple-600" bg="bg-purple-50" />
         <MetricBox label="Accuracy" val={`${attemptAccuracy}%`} sub="Precision index" icon={<Target />} color="text-emerald-600" bg="bg-emerald-50" />
         <MetricBox label="Status" val={`Grade ${grade}`} sub="Audit level" icon={<Award />} color="text-amber-600" bg="bg-amber-50" />
      </div>

      {/* Subject Analysis */}
      {subjects.length > 0 && (
         <section className="space-y-6">
            <h3 className="text-lg md:text-2xl font-black text-[#0F172A] flex items-center gap-3">
               <BarChart3 className="h-5 w-5 text-primary" /> Subject Analytics
            </h3>
            <div className="bg-white rounded-[2rem] border border-slate-100 shadow-xl overflow-hidden">
               <div className="overflow-x-auto">
                  <table className="w-full text-left">
                     <thead className="bg-slate-50 border-b border-slate-100">
                        <tr>
                           <th className="px-6 py-4 font-bold text-[10px] text-slate-500 tracking-tight">Subject</th>
                           <th className="px-4 py-4 font-bold text-[10px] text-center text-slate-500 tracking-tight">Score</th>
                           <th className="px-4 py-4 font-bold text-[10px] text-center text-slate-500 tracking-tight">Accuracy</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-50">
                        {subjects.map((s, i) => (
                           <tr key={i} className="hover:bg-slate-50 transition-colors">
                              <td className="px-6 py-5 font-bold text-sm text-[#0F172A]">{s.name}</td>
                              <td className="px-4 py-5 text-center font-black text-primary tabular-nums">{Number(s.score).toFixed(1)}</td>
                              <td className="px-4 py-5 text-center font-bold text-slate-400 tabular-nums">{s.accuracy}%</td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
               </div>
            </div>
         </section>
      )}

      {/* Questions Analysis */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
         <CountNode label="Correct" val={correct} color="text-emerald-600 bg-emerald-50" />
         <CountNode label="Wrong" val={wrong} color="text-rose-600 bg-rose-50" />
         <CountNode label="Skipped" val={skipped} color="text-slate-400 bg-slate-50" />
         <CountNode label="Total Questions" val={total} color="text-blue-600 bg-blue-50" />
      </div>

    </div>
  );
}

function MetricBox({ label, val, icon, color, bg }: any) {
   return (
      <Card className="border-none shadow-lg bg-white p-5 md:p-8 rounded-[1.5rem] md:rounded-[2rem] flex flex-col items-start gap-4 hover:translate-y-[-2px] transition-all border border-slate-50">
         <div className={cn("h-10 w-10 md:h-12 md:w-12 rounded-xl flex items-center justify-center shadow-inner", bg, color)}>
            {React.isValidElement(icon) ? React.cloneElement(icon as React.ReactElement, { className: "h-5 w-5 md:h-6 md:w-6" }) : icon}
         </div>
         <div>
            <p className="text-[10px] md:text-xl font-black text-[#0F172A] tabular-nums leading-none tracking-tight">{val}</p>
            <p className="text-[8px] md:text-[10px] font-bold text-slate-400 tracking-tight mt-1">{label}</p>
         </div>
      </Card>
   )
}

function CountNode({ label, val, color }: any) {
   return (
      <div className={cn("p-6 rounded-2xl flex flex-col items-center justify-center text-center gap-1", color)}>
         <span className="text-xl md:text-3xl font-black tabular-nums">{val}</span>
         <span className="text-[8px] md:text-[10px] font-bold tracking-tight opacity-60">{label}</span>
      </div>
   )
}
