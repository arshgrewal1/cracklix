'use client';

import React, { useMemo } from 'react';
import { 
  Trophy, 
  Target, 
  ShieldCheck, 
  CheckCircle2, 
  BarChart3, 
  TrendingUp, 
  Award,
  Activity,
  AlertCircle,
  Lightbulb,
  TrendingDown,
  LayoutGrid
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card } from "@/components/ui/card";

/**
 * @fileOverview Premium Analysis Screen v4.0.
 * FIXED: Globally Transitioned to professional Title Case (removed all forced uppercase).
 * FIXED: Refined alignment to unified boxed architecture.
 */

interface ReportScreenProps {
  score: string | number;
  rank: string | number;
  totalCandidates: number;
  attemptAccuracy: string | number;
  correctCount: number;
  wrongCount: number;
  skippedCount: number;
  totalQuestions: number;
  percentile: number;
  grade?: string;
  isQualified?: boolean;
  topScore?: number;
  avgScore?: number;
  avgAccuracy?: number;
  subjectAnalysis?: any[];
}

export default function ReportScreen(props: ReportScreenProps) {
  const {
    score, rank, totalCandidates, 
    attemptAccuracy, correctCount, wrongCount, skippedCount,
    totalQuestions, percentile, grade = "F",
    topScore = 0, avgScore = 0, avgAccuracy = 0,
    subjectAnalysis = []
  } = props;

  const insights = useMemo(() => {
    const list = [];
    const acc = Number(attemptAccuracy);
    const scoreNum = Number(score);

    if (acc >= 90) list.push({ type: 'STRENGTH', text: "Outstanding accuracy level in core subjects." });
    else if (acc >= 75) list.push({ type: 'STRENGTH', text: "Strong understanding of attempted questions." });
    else list.push({ type: 'WEAKNESS', text: "Low accuracy detected. Focus on conceptual clarity." });

    if (scoreNum < avgScore) list.push({ type: 'SUGGESTION', text: "Attempt more mock tests to beat the platform average." });
    if (wrongCount > totalQuestions * 0.2) list.push({ type: 'WEAKNESS', text: "High negative penalty. Reduce guesswork in difficult items." });
    
    return list.slice(0, 4);
  }, [attemptAccuracy, score, avgScore, wrongCount, totalQuestions]);

  return (
    <div className="w-full space-y-8 animate-in fade-in duration-500 pb-20">
      
      {/* SCORE SUMMARY ROW */}
      <div className="flex overflow-x-auto no-scrollbar -mx-4 px-4 gap-4 snap-x">
         <Card className="min-w-[160px] md:flex-1 h-36 md:h-44 rounded-[24px] bg-[#F0FDF4] border-[#DCFCE7] shadow-sm flex flex-col justify-center px-6 snap-start shrink-0">
            <p className="text-[10px] md:text-xs font-bold text-slate-500 mb-2">Your score</p>
            <div className="flex items-baseline gap-1">
               <span className="text-2xl md:text-4xl font-black text-[#10B981] tabular-nums">{score}</span>
               <span className="text-sm md:text-xl font-bold text-slate-400">/{totalQuestions}</span>
            </div>
            <p className="text-[10px] md:text-xs font-bold text-[#10B981] mt-1">{((Number(score)/totalQuestions)*100).toFixed(1)}%</p>
         </Card>

         <SummaryMiniCard label="Correct" val={correctCount} color="text-[#10B981]" bg="bg-[#F0FDF4]" />
         <SummaryMiniCard label="Wrong" val={wrongCount} color="text-[#FF3366]" bg="bg-[#FFF1F2]" />
         <SummaryMiniCard label="Skipped" val={skippedCount} color="text-slate-400" bg="bg-slate-50" />
         <SummaryMiniCard label="Total" val={totalQuestions} color="text-[#1677FF]" bg="bg-blue-50" />
      </div>

      {/* RANKING CARD */}
      <Card className="border border-[#E5EAF2] shadow-sm rounded-[24px] bg-white p-6 md:p-10 flex items-center justify-between">
         <div className="flex items-center gap-4 md:gap-8">
            <div className="h-12 w-12 md:h-16 md:w-16 rounded-full bg-[#1677FF] flex items-center justify-center text-white shadow-lg">
               <Trophy className="h-6 w-6 md:h-8 md:w-8" />
            </div>
            <div className="text-left">
               <p className="text-[10px] md:text-xs font-bold text-slate-400">Your Punjab rank</p>
               <div className="flex items-baseline gap-2">
                  <span className="text-3xl md:text-5xl font-black text-[#1677FF] tabular-nums">#{rank}</span>
                  <span className="text-[10px] md:text-sm font-bold text-slate-300">/ {totalCandidates} Candidates</span>
               </div>
            </div>
         </div>
         <div className="hidden sm:flex items-center gap-3 bg-blue-50 px-6 py-3 rounded-2xl">
            <ShieldCheck className="h-5 w-5 text-[#1677FF]" />
            <div className="text-left">
               <p className="text-[10px] md:text-xs font-black text-[#1677FF] leading-none">Verified standing</p>
               <p className="text-[8px] md:text-[10px] font-bold text-slate-400 mt-1">Top ranked hub</p>
            </div>
         </div>
      </Card>

      {/* PERFORMANCE OVERVIEW */}
      <div className="space-y-6">
         <div className="flex items-center gap-3 px-1">
            <BarChart3 className="h-5 w-5 text-[#1677FF]" />
            <h3 className="text-lg font-black text-[#071B4D]">Performance overview</h3>
         </div>
         <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatsBox label="Accuracy" val={`${attemptAccuracy}%`} sub={`(${correctCount}/${correctCount + wrongCount})`} />
            <StatsBox label="Pass grade" val={grade} sub="(Min. 40%)" color={grade === 'F' ? 'text-[#FF3366]' : 'text-[#10B981]'} />
            <StatsBox label="Net score" val={score} sub={`(Out of ${totalQuestions})`} />
            <StatsBox label="Percentile" val={percentile > 0 ? `${percentile}%` : "--"} sub="Not enough data" />
         </div>
      </div>

      {/* SUBJECT MASTERY */}
      {subjectAnalysis.length > 0 && (
         <div className="space-y-6">
            <div className="flex items-center gap-3 px-1">
               <Target className="h-5 w-5 text-[#1677FF]" />
               <h3 className="text-lg font-black text-[#071B4D]">Subject mastery</h3>
            </div>
            <Card className="border border-[#E5EAF2] shadow-sm rounded-[24px] bg-white overflow-hidden">
               <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                     <thead className="bg-slate-50/50">
                        <tr className="h-14">
                           <th className="px-8 font-bold text-xs text-slate-400">Subject</th>
                           <th className="px-4 font-bold text-xs text-slate-400">Progress</th>
                           <th className="px-8 font-bold text-xs text-slate-400 text-right">Score</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-50">
                        {subjectAnalysis.map((s, i) => (
                           <tr key={i} className="h-20 group hover:bg-slate-50 transition-colors">
                              <td className="px-8 font-bold text-[#071B4D]">{s.name}</td>
                              <td className="px-4 min-w-[140px] md:min-w-[200px]">
                                 <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-[#1677FF] rounded-full" style={{ width: `${s.accuracy}%` }} />
                                 </div>
                              </td>
                              <td className="px-8 text-right font-black text-[#071B4D] tabular-nums">
                                 {s.score} <span className="text-slate-300 font-bold">/ {s.total}</span>
                              </td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
               </div>
            </Card>
         </div>
      )}

      {/* COMPETITION SNAPSHOT */}
      <div className="space-y-6">
         <div className="flex items-center gap-3 px-1">
            <TrendingUp className="h-5 w-5 text-[#1677FF]" />
            <h3 className="text-lg font-black text-[#071B4D]">Competition snapshot</h3>
         </div>
         <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <ComparisonNode label="Top score" val={topScore.toFixed(1)} icon={<Award className="text-amber-500" />} />
            <ComparisonNode label="Avg. score" val={avgScore.toFixed(1)} icon={<Activity className="text-blue-500" />} />
            <ComparisonNode label="Avg. accuracy" val={`${avgAccuracy.toFixed(1)}%`} icon={<ShieldCheck className="text-emerald-500" />} />
            <ComparisonNode label="Score gap" val={`-${Math.max(0, topScore - Number(score)).toFixed(1)}`} icon={<TrendingDown className="text-rose-500" />} />
         </div>
      </div>

      {/* SMART INSIGHTS */}
      <Card className="border border-[#E5EAF2] shadow-sm rounded-[24px] bg-white p-6 md:p-10 space-y-6">
         <div className="flex items-center gap-3 border-b border-slate-50 pb-4">
            <Lightbulb className="h-5 w-5 text-[#F59E0B]" />
            <h3 className="text-lg font-black text-[#071B4D]">Smart insights</h3>
         </div>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {insights.map((insight, i) => (
               <div key={i} className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <div className={cn(
                     "h-8 w-8 rounded-lg flex items-center justify-center shrink-0 shadow-sm",
                     insight.type === 'STRENGTH' ? "bg-emerald-100 text-emerald-600" :
                     insight.type === 'WEAKNESS' ? "bg-rose-100 text-rose-600" : "bg-blue-100 text-blue-600"
                  )}>
                     {insight.type === 'STRENGTH' ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                  </div>
                  <p className="text-sm font-semibold text-slate-600 leading-tight">{insight.text}</p>
               </div>
            ))}
         </div>
      </Card>

    </div>
  );
}

function SummaryMiniCard({ label, val, color, bg }: any) {
   return (
      <Card className={cn("min-w-[110px] md:flex-1 h-36 md:h-44 rounded-[24px] border-none shadow-sm flex flex-col items-center justify-center p-4 snap-start shrink-0", bg)}>
         <span className={cn("text-2xl md:text-4xl font-black tabular-nums", color)}>{val}</span>
         <span className="text-[10px] md:text-xs font-bold text-slate-400 mt-2">{label}</span>
      </Card>
   )
}

function StatsBox({ label, val, sub, color }: any) {
   return (
      <Card className="border border-[#E5EAF2] shadow-sm rounded-[24px] bg-white p-6 md:p-10 text-center space-y-3">
         <p className="text-[10px] md:text-xs font-bold text-slate-400 leading-none">{label}</p>
         <p className={cn("text-2xl md:text-4xl font-black tabular-nums tracking-tighter leading-none", color || "text-[#071B4D]")}>{val}</p>
         <p className="text-[10px] font-bold text-slate-300 leading-none">{sub}</p>
      </Card>
   )
}

function ComparisonNode({ label, val, icon }: any) {
   return (
      <div className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-[#E5EAF2] shadow-sm">
         <div className="h-10 w-10 bg-slate-50 rounded-xl flex items-center justify-center shrink-0">{icon}</div>
         <div className="min-w-0">
            <p className="text-[9px] font-bold text-slate-400 truncate">{label}</p>
            <p className="text-base md:text-lg font-black text-[#071B4D] tabular-nums leading-none mt-1">{val}</p>
         </div>
      </div>
   )
}