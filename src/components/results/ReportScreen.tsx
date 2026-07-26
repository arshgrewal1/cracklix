'use client';

import React, { useMemo } from 'react';
import { 
  Trophy,
  Zap,
  Target,
  BarChart3,
  ShieldCheck,
  CheckCircle2,
  TrendingUp,
  AlertCircle,
  Lightbulb,
  ArrowRight,
  TrendingDown,
  Award,
  Activity
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

interface ReportScreenProps {
  studentName: string;
  examTitle: string;
  score: string | number;
  rank: string | number;
  totalCandidates: number;
  accuracy: string | number;
  attemptAccuracy: string | number;
  timeTaken: string;
  correct: number;
  wrong: number;
  skipped: number;
  total: number;
  date: string;
  percentile: number;
  subjects?: any[];
  grade?: string;
  isQualified?: boolean;
  topScore?: number;
  avgScore?: number;
  avgAccuracy?: number;
}

/**
 * @fileOverview Premium Responsive Result Interface v6.1.
 * FIXED: Added missing Award and Activity icon imports.
 */
export default function ReportScreen(props: ReportScreenProps) {
  const {
    score, rank, totalCandidates, 
    attemptAccuracy, correct, wrong, skipped,
    total, percentile, subjects = [], grade = "F",
    topScore = 0, avgScore = 0, avgAccuracy = 0
  } = props;

  const insights = useMemo(() => {
    const list = [];
    const accNum = Number(attemptAccuracy);
    const scoreNum = Number(score);
    const totalQ = Number(total);

    if (accNum >= 90) list.push("Outstanding accuracy level achieved.");
    else if (accNum >= 75) list.push("Strong accuracy node in core subjects.");
    else list.push("Accuracy needs immediate auditing.");

    if (scoreNum > avgScore) list.push("Performing above the candidate average.");
    if (wrong > totalQ * 0.2) list.push("High penalty detected. Reduce guesswork.");
    if (skipped > totalQ * 0.3) list.push("Topic familiarity audit recommended.");
    
    return list.slice(0, 4);
  }, [attemptAccuracy, score, avgScore, wrong, skipped, total]);

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-500">
      
      {/* 1. HERO RANK CARD */}
      <Card className="border-none shadow-2xl rounded-[32px] p-8 text-white relative overflow-hidden text-center bg-gradient-to-br from-[#071B4D] to-[#0A2C7A]">
         <div className="absolute top-0 right-0 p-8 opacity-5 rotate-12"><Trophy className="h-48 w-48" /></div>
         
         <div className="relative z-10 space-y-4">
            <p className="text-[11px] font-bold text-primary tracking-[0.4em] uppercase opacity-80">Punjab Rank</p>
            <div className="space-y-1">
               <span className="text-[80px] md:text-[100px] font-[900] tracking-tighter leading-none block drop-shadow-2xl">#{rank}</span>
               <p className="text-sm font-bold text-slate-300 opacity-60">Out of {totalCandidates.toLocaleString()} candidates</p>
            </div>
            <div className="pt-6 flex justify-center gap-3">
               <Badge className="bg-emerald-500 text-white border-none font-bold text-[10px] px-6 py-2 rounded-full shadow-lg">Verified Standing</Badge>
               {percentile >= 90 && <Badge className="bg-[#0A84FF] text-white border-none font-bold text-[10px] px-6 py-2 rounded-full shadow-lg">Top 1%</Badge>}
            </div>
         </div>
      </Card>

      {/* 2. STATS 2x2 GRID */}
      <div className="grid grid-cols-2 gap-4">
         <StatsPill label="Net Score" val={score} color="text-[#071B4D]" />
         <StatsPill label="Percentile" val={`${percentile}%`} color="text-[#0A84FF]" />
         <StatsPill label="Accuracy" val={`${attemptAccuracy}%`} color="text-emerald-500" />
         <StatsPill label="Pass Grade" val={grade} color="text-amber-500" />
      </div>

      {/* 3. QUESTION SUMMARY */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
         <CountCard label="Correct" val={correct} color="bg-emerald-50 text-emerald-600" />
         <CountCard label="Wrong" val={wrong} color="bg-rose-50 text-rose-600" />
         <CountCard label="Skipped" val={skipped} color="bg-slate-100 text-slate-500" />
         <CountCard label="Total" val={total} color="bg-blue-50 text-blue-600" />
      </div>

      {/* 4. SMART INSIGHTS */}
      <Card className="border-none shadow-sm rounded-[32px] bg-white p-6 space-y-6">
         <div className="flex items-center gap-3 border-b border-slate-50 pb-4">
            <Lightbulb className="h-5 w-5 text-amber-500" />
            <h3 className="text-lg font-[800] text-[#071B4D]">Smart Insights</h3>
         </div>
         <div className="space-y-3">
            {insights.map((msg, i) => (
               <div key={i} className="flex items-start gap-4 p-3 bg-slate-50 rounded-2xl">
                  <div className="h-2 w-2 rounded-full bg-primary mt-2 shrink-0" />
                  <p className="text-sm font-semibold text-slate-600 leading-tight">{msg}</p>
               </div>
            ))}
         </div>
      </Card>

      {/* 5. SUBJECT ANALYTICS */}
      {subjects.length > 0 && (
         <Card className="border-none shadow-sm rounded-[32px] bg-white overflow-hidden">
            <div className="p-6 border-b border-slate-50 bg-slate-50/30">
               <h3 className="text-lg font-[800] text-[#071B4D]">Subject Mastery</h3>
            </div>
            <div className="overflow-x-auto">
               <table className="w-full text-left">
                  <thead className="bg-slate-50 border-b border-slate-100">
                     <tr className="h-12">
                        <th className="px-6 font-bold text-[10px] text-slate-400 uppercase tracking-widest">Subject</th>
                        <th className="px-4 font-bold text-[10px] text-slate-400 uppercase tracking-widest text-center">Score</th>
                        <th className="px-6 font-bold text-[10px] text-slate-400 uppercase tracking-widest text-right">Accuracy</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                     {subjects.map((s, i) => (
                        <tr key={i} className="h-16">
                           <td className="px-6 font-bold text-sm text-[#071B4D]">{s.name}</td>
                           <td className="px-4 text-center font-black text-primary tabular-nums">{Number(s.score).toFixed(1)}</td>
                           <td className="px-6 text-right">
                              <Badge className="bg-emerald-50 text-emerald-600 border-none font-bold text-[10px] px-3">{s.accuracy}%</Badge>
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
         </Card>
      )}

      {/* 6. COMPETITION SNAPSHOT */}
      <Card className="border-none shadow-sm rounded-[32px] bg-white p-6 space-y-6">
         <div className="flex items-center gap-3 border-b border-slate-50 pb-4">
            <TrendingUp className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-[800] text-[#071B4D]">Competition Snapshot</h3>
         </div>
         <div className="grid grid-cols-2 gap-6">
            <ComparisonNode label="Top Score" val={topScore.toFixed(1)} icon={<Award className="text-amber-500" />} />
            <ComparisonNode label="Avg. Score" val={avgScore.toFixed(1)} icon={<Activity className="text-blue-500" />} />
            <ComparisonNode label="Avg. Accuracy" val={`${avgAccuracy.toFixed(1)}%`} icon={<ShieldCheck className="text-emerald-500" />} />
            <ComparisonNode label="Score Gap" val={`-${Math.max(0, topScore - Number(score)).toFixed(1)}`} icon={<TrendingDown className="text-rose-500" />} />
         </div>
      </Card>

    </div>
  );
}

function StatsPill({ label, val, color }: any) {
   return (
      <Card className="border-none shadow-sm rounded-[24px] bg-white p-6 text-center space-y-3">
         <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</p>
         <p className={cn("text-3xl font-[900] tabular-nums tracking-tighter leading-none", color)}>{val}</p>
      </Card>
   )
}

function CountCard({ label, val, color }: any) {
   return (
      <div className={cn("p-5 rounded-[22px] flex flex-col items-center justify-center text-center gap-1.5 shadow-sm", color)}>
         <span className="text-2xl font-[900] tabular-nums leading-none">{val}</span>
         <span className="text-[9px] font-bold opacity-60 uppercase tracking-wider">{label}</span>
      </div>
   )
}

function ComparisonNode({ label, val, icon }: any) {
   return (
      <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
         <div className="h-10 w-10 bg-white rounded-xl flex items-center justify-center shadow-sm shrink-0">{icon}</div>
         <div className="min-w-0">
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">{label}</p>
            <p className="text-base font-black text-[#071B4D] tabular-nums leading-none mt-1">{val}</p>
         </div>
      </div>
   )
}
