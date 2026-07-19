'use client';

import React from 'react';
import { 
  Trophy, 
  Target, 
  Zap, 
  Clock, 
  ShieldCheck, 
  CheckCircle2, 
  Award, 
  Crown, 
  Medal,
  BarChart3,
  Timer,
  AlertCircle,
  Check,
  TrendingUp,
  BrainCircuit,
  Layers,
  Search,
  ArrowRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

interface SubPerformance {
  name: string;
  total: number;
  correct: number;
  wrong: number;
  accuracy: number;
  score: number;
}

interface TopicPerformance {
  name: string;
  attempted: number;
  correct: number;
  accuracy: number;
  status: 'Strong' | 'Average' | 'Weak';
}

interface ResultCardProps {
  studentName: string;
  examTitle: string;
  score: string | number;
  rank: string | number;
  accuracy: string | number;
  timeTaken: string;
  correct: number;
  wrong: number;
  total: number;
  date: string;
  resultId: string;
  percentile: number;
  subjects?: SubPerformance[];
  topics?: TopicPerformance[];
  difficulty?: { easy: number; medium: number; hard: number };
  timeMetrics?: { avg: string; fastest: string; slowest: string };
}

/**
 * @fileOverview World-Class Institutional Result Card v2.2.
 * FIXED: Reduced vertical margins to prevent content clipping on the 1414px canvas.
 */
export default function ResultCard({
  studentName,
  examTitle,
  score,
  rank,
  accuracy,
  timeTaken,
  correct,
  wrong,
  total,
  date,
  resultId,
  percentile,
  subjects = [],
  topics = [],
  difficulty = { easy: 0, medium: 0, hard: 0 },
  timeMetrics = { avg: "0s", fastest: "0s", slowest: "0s" }
}: ResultCardProps) {
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent('https://cracklix.com/results/view?id=' + resultId)}`;
  
  const getGrade = (acc: number) => {
    if (acc >= 95) return { label: 'S', color: 'text-emerald-600', sub: 'Outstanding' };
    if (acc >= 85) return { label: 'A+', color: 'text-blue-600', sub: 'Excellent' };
    if (acc >= 70) return { label: 'A', color: 'text-blue-500', sub: 'Very Good' };
    if (acc >= 60) return { label: 'B', color: 'text-amber-500', sub: 'Good' };
    if (acc >= 40) return { label: 'C', color: 'text-orange-500', sub: 'Average' };
    return { label: 'D', color: 'text-rose-500', sub: 'Qualified' };
  };

  const grade = getGrade(Number(accuracy) || 0);

  return (
    <div className="flex flex-col gap-0 bg-slate-100">
      
      {/* PAGE 1: OFFICIAL RESULT SUMMARY */}
      <div 
        id="cracklix-result-page-1"
        className="w-[1000px] h-[1414px] bg-white text-[#0F172A] flex flex-col relative overflow-hidden shrink-0 shadow-2xl"
        style={{ fontFamily: 'Inter, sans-serif' }}
      >
        <div className="absolute top-0 left-0 right-0 h-4 bg-[#0F172A]" />
        <div className="absolute top-4 left-0 right-0 h-1 bg-[#2563EB]" />

        <div className="px-20 pt-16 flex justify-between items-start">
           <div className="flex items-center gap-8">
              <div className="h-20 w-20 bg-[#0F172A] rounded-[1.5rem] flex items-center justify-center shadow-2xl">
                 <ShieldCheck className="h-12 w-12 text-white" />
              </div>
              <div>
                 <h1 className="text-5xl font-black tracking-tighter uppercase leading-none text-[#0F172A]">Cracklix</h1>
                 <p className="text-[11px] font-black text-slate-400 tracking-[0.4em] uppercase mt-1">Official Result Hub</p>
              </div>
           </div>
           <div className="text-right space-y-1">
              <p className="text-slate-400 font-black uppercase tracking-[0.3em] text-[10px]">Attempt Synchronized</p>
              <p className="text-2xl font-black tabular-nums text-[#0F172A]">{date}</p>
           </div>
        </div>

        <div className="px-20 mt-12 flex flex-col items-center">
           <div className="relative">
              <div className="h-56 w-56 rounded-full border-[12px] border-slate-50 flex flex-col items-center justify-center bg-white shadow-2xl relative z-10">
                 <span className={cn("text-[90px] font-black leading-none", grade.color)}>{grade.label}</span>
                 <span className="text-[12px] font-black uppercase tracking-widest text-slate-400 mt-2">{grade.sub}</span>
              </div>
              <div className="absolute -inset-6 bg-blue-600/5 blur-3xl rounded-full animate-pulse" />
           </div>
           <div className="mt-8 space-y-4 text-center">
              <Badge className="bg-emerald-50 text-emerald-600 border border-emerald-200 px-8 py-2 rounded-full font-black text-[12px] uppercase tracking-[0.2em] shadow-sm">
                 <CheckCircle2 className="h-4 w-4 mr-2" /> Performance Verified
              </Badge>
              <h2 className="text-7xl font-black tracking-tighter text-[#0F172A] uppercase">{studentName}</h2>
              <p className="text-2xl font-bold text-primary uppercase tracking-[0.1em]">{examTitle}</p>
           </div>
        </div>

        <div className="px-20 mt-14 grid grid-cols-3 gap-8">
           <Metric label="State Rank" val={`#${rank}`} icon={<Trophy />} color="text-amber-500" bg="bg-amber-50" />
           <Metric label="Final Score" val={score} icon={<Zap />} color="text-[#2563EB]" bg="bg-blue-50" />
           <Metric label="Accuracy" val={`${accuracy}%`} icon={<Target />} color="text-emerald-500" bg="bg-emerald-50" />
           <Metric label="Percentile" val={`${percentile}%`} icon={<TrendingUp />} color="text-indigo-500" bg="bg-indigo-50" />
           <Metric label="Time Taken" val={timeTaken} icon={<Clock />} color="text-slate-500" bg="bg-slate-50" />
           <Metric label="Attempt Rate" val={`${Math.round(((correct + wrong) / (total || 1)) * 100)}%`} icon={<BarChart3 />} color="text-purple-500" bg="bg-purple-50" />
        </div>

        <div className="px-20 mt-12">
           <div className="bg-[#F8FAFC] border border-slate-100 rounded-[3rem] p-10 flex items-center justify-between shadow-inner">
              <DataNode label="Attempted" val={correct + wrong} color="text-slate-600" />
              <div className="w-px h-12 bg-slate-200" />
              <DataNode label="Correct" val={correct} color="text-emerald-600" />
              <div className="w-px h-12 bg-slate-200" />
              <DataNode label="Incorrect" val={wrong} color="text-rose-600" />
              <div className="w-px h-12 bg-slate-200" />
              <DataNode label="Skipped" val={total - (correct + wrong)} color="text-slate-400" />
           </div>
        </div>

        <div className="mt-auto bg-[#0F172A] p-16 flex items-center justify-between text-white">
           <div className="space-y-6">
              <div className="flex items-center gap-4">
                 <Crown className="h-10 w-10 text-primary fill-primary" />
                 <p className="text-3xl font-black tracking-tight uppercase">Cracklix Authority</p>
              </div>
              <div className="flex flex-col gap-2">
                 <p className="text-slate-500 text-sm font-bold uppercase tracking-widest">Registry ID: {resultId}</p>
                 <p className="text-slate-500 text-sm font-bold uppercase tracking-widest">Verification Node: WWW.CRACKLIX.COM</p>
              </div>
           </div>
           <div className="flex items-center gap-12">
              <div className="text-right space-y-1">
                 <p className="text-white font-black text-2xl uppercase tracking-widest">Digital Stamp</p>
                 <p className="text-primary font-bold text-[11px] uppercase tracking-[0.3em]">Verified assessment cycle</p>
              </div>
              <div className="bg-white p-4 rounded-[1.5rem] shadow-5xl border-[6px] border-white/10">
                 <img src={qrUrl} alt="Verify" className="h-24 w-24" />
              </div>
           </div>
        </div>

        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-[11px] font-black text-slate-500 uppercase tracking-widest opacity-20">Page 1 of 2</div>
      </div>

      {/* PAGE 2: DETAILED ANALYTICS REPORT */}
      <div 
        id="cracklix-result-page-2"
        className="w-[1000px] h-[1414px] bg-white text-[#0F172A] flex flex-col relative overflow-hidden shrink-0 shadow-2xl"
        style={{ fontFamily: 'Inter, sans-serif' }}
      >
        <div className="absolute top-0 left-0 right-0 h-4 bg-[#0F172A]" />
        
        <div className="px-20 pt-16 space-y-12">
           <div className="flex justify-between items-end border-b-4 border-slate-100 pb-10">
              <div className="space-y-3">
                 <h2 className="text-5xl font-black tracking-tighter text-[#0F172A] uppercase">Performance Audit</h2>
                 <p className="text-lg font-bold text-slate-400 uppercase tracking-widest">Deep-Dive Registry Analysis</p>
              </div>
              <div className="h-10 relative grayscale opacity-20">
                 <img src="/logo/cracklix-logo-dark.png" alt="Logo" className="h-full w-auto" />
              </div>
           </div>

           <section className="space-y-6">
              <div className="flex items-center gap-4">
                 <BrainCircuit className="h-8 w-8 text-primary" />
                 <h3 className="text-2xl font-black uppercase tracking-widest text-[#0F172A]">Consolidated Rationale</h3>
              </div>
              <div className="bg-[#F8FAFC] p-10 rounded-[3rem] border border-slate-100 relative overflow-hidden">
                 <div className="absolute top-0 right-0 p-10 opacity-[0.03]"><Zap className="h-32 w-32" /></div>
                 <ul className="space-y-6 relative z-10">
                    <Point text={Number(accuracy) > 80 ? "Superior conceptual clarity across all official exam patterns." : "Foundational knowledge verified; requires targeted practice nodes."} />
                    <Point text={Number(timeTaken.split('m')[0]) > 60 ? "Ingestion speed requires optimization for competitive thresholds." : "Temporal efficiency matches institutional state-topper benchmarks."} />
                    <Point text={correct > total * 0.7 ? "High mastery index detected in primary subject hubs." : "Focus on high-weightage topics to increase overall ranking index."} />
                 </ul>
              </div>
           </section>

           <section className="space-y-6">
              <div className="flex items-center gap-4">
                 <Layers className="h-8 w-8 text-primary" />
                 <h3 className="text-2xl font-black uppercase tracking-widest text-[#0F172A]">Subject Mastery Matrix</h3>
              </div>
              <div className="rounded-[3rem] border-2 border-slate-100 overflow-hidden shadow-2xl">
                 <table className="w-full text-left border-collapse">
                    <thead className="bg-[#0F172A] text-white">
                       <tr className="h-16">
                          <th className="px-10 font-black uppercase text-[12px] tracking-widest">Registry Hub</th>
                          <th className="px-6 font-black uppercase text-[12px] tracking-widest text-center">Items</th>
                          <th className="px-6 font-black uppercase text-[12px] tracking-widest text-center">Correct</th>
                          <th className="px-6 font-black uppercase text-[12px] tracking-widest text-center">Accuracy</th>
                          <th className="px-10 font-black uppercase text-[12px] tracking-widest text-right">Score</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y-2 divide-slate-100">
                       {subjects.length > 0 ? subjects.map((s, idx) => (
                          <tr key={idx} className="h-16 hover:bg-slate-50 transition-colors">
                             <td className="px-10 font-black text-lg text-[#0F172A] uppercase">{s.name}</td>
                             <td className="px-6 text-center font-bold text-slate-400 tabular-nums text-lg">{s.total}</td>
                             <td className="px-6 text-center font-black text-emerald-600 tabular-nums text-xl">{s.correct}</td>
                             <td className="px-6 text-center">
                                <Badge className={cn("border-none text-[12px] font-black px-4 py-1 rounded-lg", s.accuracy > 70 ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600")}>{s.accuracy}%</Badge>
                             </td>
                             <td className="px-10 text-right font-black text-[#2563EB] tabular-nums text-2xl">{s.score}</td>
                          </tr>
                       )) : (
                          <tr className="h-40">
                             <td colSpan={5} className="text-center italic text-slate-300">Synchronizing subject data...</td>
                          </tr>
                       )}
                    </tbody>
                 </table>
              </div>
           </section>

           <div className="grid grid-cols-2 gap-12 pt-4">
              <section className="space-y-6">
                 <div className="flex items-center gap-4">
                    <TrendingUp className="h-8 w-8 text-primary" />
                    <h3 className="text-xl font-black uppercase tracking-widest text-slate-400">Difficulty Distribution</h3>
                 </div>
                 <div className="space-y-6 p-10 bg-slate-50 rounded-[3rem] border border-slate-100">
                    <Diff label="Easy Nodes" val={difficulty.easy} color="bg-emerald-500" />
                    <Diff label="Medium Nodes" val={difficulty.medium} color="bg-blue-500" />
                    <Diff label="Expert Nodes" val={difficulty.hard} color="bg-rose-500" />
                 </div>
              </section>

              <section className="space-y-6">
                 <div className="flex items-center gap-4">
                    <Timer className="h-8 w-8 text-primary" />
                    <h3 className="text-xl font-black uppercase tracking-widest text-slate-400">Temporal Audit</h3>
                 </div>
                 <div className="space-y-6 p-10 bg-slate-50 rounded-[3rem] border border-slate-100">
                    <MetricValue label="Avg Ingestion / Q" val={timeMetrics.avg} />
                    <MetricValue label="Fastest Decision" val={timeMetrics.fastest} />
                    <MetricValue label="Slowest Logic Node" val={timeMetrics.slowest} />
                 </div>
              </section>
           </div>
        </div>

        <div className="mt-auto border-t-2 border-slate-100 p-16 flex items-center justify-between text-slate-300">
           <div className="flex items-center gap-4">
              <ShieldCheck className="h-8 w-8" />
              <span className="text-[12px] font-black uppercase tracking-[0.5em]">Institutional Merit Registry Verified</span>
           </div>
           <p className="text-[12px] font-black uppercase tracking-[0.2em]">Page 2 of 2</p>
        </div>
      </div>

    </div>
  );
}

function Metric({ label, val, icon, color, bg }: any) {
   return (
      <div className="bg-white border-2 border-slate-50 rounded-[2.5rem] p-8 shadow-lg flex flex-col items-center justify-center text-center space-y-4 group hover:border-primary/20 transition-all">
         <div className={cn("h-14 w-14 rounded-2xl flex items-center justify-center shadow-inner transition-transform group-hover:scale-110", bg, color)}>
            {React.isValidElement(icon) ? React.cloneElement(icon as React.ReactElement, { className: "h-7 w-7" }) : null}
         </div>
         <div className="space-y-1">
            <p className="text-slate-400 font-black uppercase tracking-[0.3em] text-[9px]">{label}</p>
            <p className={cn("text-3xl font-black tracking-tighter tabular-nums", color)}>{val}</p>
         </div>
      </div>
   );
}

function DataNode({ label, val, color }: any) {
   return (
      <div className="text-center space-y-1">
         <p className="text-slate-400 font-black uppercase tracking-widest text-[10px]">{label}</p>
         <p className={cn("text-3xl font-black tabular-nums leading-none", color)}>{val}</p>
      </div>
   );
}

function Point({ text }: { text: string }) {
   return (
      <li className="flex items-start gap-6">
         <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-1 shadow-inner border border-primary/20">
            <Check className="h-4 w-4 text-primary stroke-[5px]" />
         </div>
         <p className="text-xl font-bold text-slate-700 leading-snug tracking-tight">{text}</p>
      </li>
   );
}

function Diff({ label, val, color }: any) {
   return (
      <div className="space-y-2">
         <div className="flex justify-between items-center px-1">
            <span className="text-[11px] font-black uppercase text-slate-400 tracking-widest">{label}</span>
            <span className="text-sm font-black text-[#0F172A] tabular-nums">{val}%</span>
         </div>
         <div className="h-1.5 w-full bg-white rounded-full overflow-hidden shadow-inner border border-slate-100">
            <div className={cn("h-full transition-all duration-1000", color)} style={{ width: `${val}%` }} />
         </div>
      </div>
   );
}

function MetricValue({ label, val }: any) {
   return (
      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
         <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{label}</span>
         <span className="text-lg font-black text-[#0F172A] tabular-nums tracking-tighter">{val}</span>
      </div>
   );
}
