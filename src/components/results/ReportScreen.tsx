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
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card } from "@/components/ui/card";

/**
 * @fileOverview Premium Analysis Screen v8.0 [Atomic Sync].
 * FIXED: Data derived strictly from attemptId props.
 * FIXED: Removed all hardcoded fallbacks and stale data buffers.
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

const toTitleCase = (str: string) => {
  if (!str) return "";
  return str.split(' ').map(w => w[0].toUpperCase() + w.substring(1).toLowerCase()).join(' ');
};

export default function ReportScreen(props: ReportScreenProps) {
  const {
    score, rank, totalCandidates, 
    attemptAccuracy, correctCount, wrongCount, skippedCount,
    totalQuestions, percentile, grade = "F",
    topScore = 0, avgScore = 0, avgAccuracy = 0,
    subjectAnalysis = []
  } = props;

  const insights = useMemo(() => {
    const list: { type: 'STRENGTH' | 'WEAKNESS' | 'SUGGESTION', text: string }[] = [];
    const acc = Number(attemptAccuracy);
    const scoreNum = Number(score);

    // 1. Dynamic Subject Insights (Pure Attempt Data)
    if (subjectAnalysis.length > 0) {
      const sorted = [...subjectAnalysis].sort((a, b) => b.accuracy - a.accuracy);
      const best = sorted[0];
      const worst = sorted[sorted.length - 1];

      if (best.accuracy >= 70) {
        list.push({ type: 'STRENGTH', text: `High precision in ${toTitleCase(best.name)} node.` });
      }
      
      if (worst.accuracy < 50 && worst.total > 0) {
        list.push({ type: 'WEAKNESS', text: `Immediate focus required in ${toTitleCase(worst.name)}.` });
      }
    }

    // 2. Behavioral Insights
    if (acc >= 90) list.push({ type: 'STRENGTH', text: "Elite accuracy maintained across the attempt vertical." });
    
    if (wrongCount > totalQuestions * 0.25) {
      list.push({ type: 'WEAKNESS', text: "Negative penalty audit: Excessive guesswork detected." });
    }

    if (scoreNum < avgScore) {
       list.push({ type: 'SUGGESTION', text: "Target the platform average by increasing attempt volume." });
    }
    
    return list.slice(0, 4);
  }, [attemptAccuracy, score, avgScore, wrongCount, totalQuestions, subjectAnalysis]);

  return (
    <div className="w-full space-y-8 animate-in fade-in duration-500 pb-20 px-0 md:px-1">
      
      {/* SCORE GRID - REALTIME NODES */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4">
         <Card className="col-span-1 h-32 md:h-44 rounded-[22px] md:rounded-[24px] bg-[#F0FDF4] border-[#DCFCE7] shadow-sm flex flex-col justify-center px-4 md:px-6">
            <p className="text-[9px] md:text-xs font-bold text-slate-500 mb-1">Attempt score</p>
            <div className="flex items-baseline gap-1">
               <span className="text-xl md:text-4xl font-black text-[#10B981] tabular-nums">{score}</span>
               <span className="text-[10px] md:text-xl font-bold text-slate-400">/{totalQuestions}</span>
            </div>
         </Card>

         <Card className="col-span-1 h-32 md:h-44 rounded-[22px] md:rounded-[24px] bg-blue-50 border-blue-100 shadow-sm flex flex-col justify-center px-4 md:px-6">
            <p className="text-[9px] md:text-xs font-bold text-slate-500 mb-1">Percentile</p>
            <span className="text-xl md:text-4xl font-black text-blue-600 tabular-nums">{percentile > 0 ? `${percentile}%` : "--"}</span>
            <p className="text-[8px] md:text-[10px] font-bold text-blue-400 uppercase tracking-tight mt-1">Verified index</p>
         </Card>

         <SummaryMiniCard label="Correct" val={correctCount} color="text-[#10B981]" bg="bg-[#F0FDF4]" className="hidden md:flex" />
         <SummaryMiniCard label="Wrong" val={wrongCount} color="text-[#FF3366]" bg="bg-[#FFF1F2]" className="hidden md:flex" />
         <SummaryMiniCard label="Skipped" val={skippedCount} color="text-slate-400" bg="bg-slate-50" className="hidden md:flex" />
      </div>

      {/* REGISTRY RANKING NODE */}
      <Card className="border border-[#E5EAF2] shadow-sm rounded-[24px] bg-white p-6 md:p-10 flex items-center justify-between">
         <div className="flex items-center gap-4 md:gap-8 text-left">
            <div className="h-12 w-12 md:h-16 rounded-full bg-[#1677FF] flex items-center justify-center text-white shadow-lg shrink-0">
               <Trophy className="h-6 w-6 md:h-8 md:w-8" />
            </div>
            <div className="text-left min-w-0">
               <p className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest">Punjab rank</p>
               <div className="flex items-baseline gap-2">
                  <span className="text-2xl md:text-5xl font-black text-[#1677FF] tabular-nums tracking-tighter">#{rank}</span>
                  <span className="text-[9px] md:text-sm font-bold text-slate-300 truncate">/ {totalCandidates} Registry Nodes</span>
               </div>
            </div>
         </div>
         <div className="hidden sm:flex items-center gap-3 bg-blue-50 px-6 py-3 rounded-2xl">
            <ShieldCheck className="h-5 w-5 text-[#1677FF]" />
            <div className="text-left">
               <p className="text-[10px] font-black text-[#1677FF] leading-none uppercase">Verified</p>
               <p className="text-[8px] md:text-[10px] font-bold text-slate-400 mt-1 uppercase">Attempt Lock</p>
            </div>
         </div>
      </Card>

      {/* SUBJECT ANALYTICS - ATTEMPT SPECIFIC */}
      {subjectAnalysis.length > 0 && (
         <div className="space-y-6">
            <div className="flex items-center gap-3 px-1">
               <Target className="h-5 w-5 text-[#1677FF]" />
               <h3 className="text-lg md:text-2xl font-black text-[#071B4D] uppercase tracking-tight">Subject mastery</h3>
            </div>
            <Card className="border border-[#E5EAF2] shadow-sm rounded-[24px] bg-white overflow-hidden">
               <div className="overflow-x-hidden">
                  <table className="w-full text-left border-collapse table-fixed">
                     <thead className="bg-slate-50/50">
                        <tr className="h-14">
                           <th className="px-5 md:px-8 font-bold text-[10px] md:text-xs text-slate-400 uppercase tracking-widest w-[40%]">Subject</th>
                           <th className="px-2 font-bold text-[10px] md:text-xs text-slate-400 text-center uppercase tracking-widest">Precision</th>
                           <th className="px-5 md:px-8 font-bold text-[10px] md:text-xs text-slate-400 text-right uppercase tracking-widest w-[25%]">Net Score</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-50">
                        {subjectAnalysis.map((s, i) => (
                           <tr key={i} className="h-16 md:h-20 group hover:bg-slate-50 transition-colors">
                              <td className="px-5 md:px-8">
                                 <p className="font-bold text-[13px] md:text-lg text-[#071B4D] truncate uppercase tracking-tight leading-none">{toTitleCase(s.name)}</p>
                              </td>
                              <td className="px-2">
                                 <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                                    <div className="h-full bg-[#1677FF] rounded-full transition-all duration-1000" style={{ width: `${s.accuracy}%` }} />
                                 </div>
                              </td>
                              <td className="px-5 md:px-8 text-right">
                                 <p className="font-black text-xs md:text-xl text-[#071B4D] tabular-nums leading-none">
                                    {s.score} <span className="text-slate-300 font-bold text-[10px] md:text-sm">/ {s.total}</span>
                                 </p>
                              </td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
               </div>
            </Card>
         </div>
      )}

      {/* COMPARISON HUB */}
      <div className="space-y-6">
         <div className="flex items-center gap-3 px-1">
            <TrendingUp className="h-5 w-5 text-[#1677FF]" />
            <h3 className="text-lg md:text-2xl font-black text-[#071B4D] uppercase tracking-tight">Attempt Benchmark</h3>
         </div>
         <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <ComparisonNode label="Registry Top" val={topScore?.toFixed(1)} icon={<Award className="text-amber-500 h-5 w-5" />} />
            <ComparisonNode label="Avg score" val={avgScore?.toFixed(1)} icon={<Activity className="text-blue-500 h-5 w-5" />} />
            <ComparisonNode label="Avg precision" val={`${avgAccuracy?.toFixed(1)}%`} icon={<ShieldCheck className="text-emerald-500 h-5 w-5" />} />
            <ComparisonNode label="Score gap" val={`-${Math.max(0, topScore - Number(score)).toFixed(1)}`} icon={<TrendingDown className="text-rose-500 h-5 w-5" />} />
         </div>
      </div>

      {/* INSIGHTS HUB */}
      <Card className="border border-[#E5EAF2] shadow-sm rounded-[24px] bg-white p-6 md:p-10 space-y-6">
         <div className="flex items-center gap-3 border-b border-slate-50 pb-4">
            <Lightbulb className="h-5 w-5 text-[#F59E0B]" />
            <h3 className="text-lg md:text-2xl font-black text-[#071B4D] uppercase tracking-tight">Audit Insights</h3>
         </div>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {insights.map((insight, i) => (
               <div key={i} className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 group hover:border-primary/20 transition-all">
                  <div className={cn(
                     "h-8 w-8 rounded-lg flex items-center justify-center shrink-0 shadow-inner group-hover:scale-110 transition-transform",
                     insight.type === 'STRENGTH' ? "bg-emerald-100 text-emerald-600" :
                     insight.type === 'WEAKNESS' ? "bg-rose-100 text-rose-600" : "bg-blue-100 text-blue-600"
                  )}>
                     {insight.type === 'STRENGTH' ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                  </div>
                  <p className="text-xs md:text-sm font-semibold text-slate-600 leading-tight">{insight.text}</p>
               </div>
            ))}
         </div>
      </Card>

    </div>
  );
}

function SummaryMiniCard({ label, val, color, bg, className }: any) {
   return (
      <Card className={cn("h-36 md:h-44 rounded-[24px] border-none shadow-sm flex flex-col items-center justify-center p-4", bg, className)}>
         <span className={cn("text-2xl md:text-4xl font-black tabular-nums", color)}>{val}</span>
         <span className="text-[10px] md:text-xs font-bold text-slate-400 mt-2 uppercase tracking-widest">{label}</span>
      </Card>
   )
}

function ComparisonNode({ label, val, icon }: any) {
   return (
      <div className="flex items-center gap-4 p-4 md:p-6 rounded-2xl bg-white border border-[#E5EAF2] shadow-sm text-left group hover:translate-y-[-2px] transition-all h-full">
         <div className="h-10 w-10 bg-slate-50 rounded-xl flex items-center justify-center shrink-0 shadow-inner group-hover:scale-110 transition-transform">{icon}</div>
         <div className="min-w-0">
            <p className="text-[9px] md:text-[10px] font-bold text-slate-400 truncate uppercase tracking-widest leading-none">{label}</p>
            <p className="text-sm md:text-xl font-black text-[#071B4D] tabular-nums leading-none mt-2">{val}</p>
         </div>
      </div>
   );
}