'use client';

import React from 'react';
import { 
  ShieldCheck, 
  CheckCircle2, 
  Trophy, 
  Zap, 
  Target, 
  TrendingUp, 
  Clock, 
  BarChart3, 
  BrainCircuit, 
  Layers, 
  Timer,
  Award
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

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
  isForPdf?: boolean;
}

/**
 * @fileOverview Premium Institutional Score Report v4.0.
 * Designed for A4 Print Precision and 100% Export Reliability.
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
  timeMetrics = { avg: "0s", fastest: "0s", slowest: "0s" },
  isForPdf = false
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

  // A4-Optimized Container Styles
  const containerStyle = isForPdf ? {
    width: '1000px',
    minHeight: '1414px',
    margin: '0 auto',
    backgroundColor: '#ffffff'
  } : {
    width: '100%',
    maxWidth: '1000px',
    margin: '0 auto'
  };

  return (
    <div className={cn("flex flex-col gap-8 bg-slate-50 p-4 md:p-8 print:p-0", isForPdf ? "scale-[1] origin-top" : "")}>
      
      {/* PAGE 1: OFFICIAL SCORE SUMMARY */}
      <div 
        id="cracklix-result-page-1"
        className="bg-white text-[#0F172A] flex flex-col relative overflow-hidden shrink-0 shadow-2xl border border-slate-100"
        style={containerStyle}
      >
        {/* Accent Bars */}
        <div className="absolute top-0 left-0 right-0 h-4 bg-[#0F172A]" />
        <div className="absolute top-4 left-0 right-0 h-1 bg-[#2563EB]" />

        {/* Header Node */}
        <div className="px-16 pt-16 flex justify-between items-start">
           <div className="flex items-center gap-6">
              <div className="h-16 w-16 bg-[#0F172A] rounded-2xl flex items-center justify-center shadow-xl overflow-hidden">
                 <img src="/logo/cracklix-icon.png" alt="Logo" className="h-10 w-10 object-contain" crossOrigin="anonymous" />
              </div>
              <div className="text-left">
                 <h1 className="text-4xl font-black tracking-tighter leading-none text-[#0F172A]">Cracklix</h1>
                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.4em] mt-1">Institutional merit hub</p>
              </div>
           </div>
           <div className="text-right space-y-1">
              <p className="text-slate-400 font-bold tracking-[0.3em] text-[9px] uppercase">Report generated</p>
              <p className="text-xl font-black tabular-nums text-[#0F172A]">{date}</p>
           </div>
        </div>

        {/* Identity & Grade Hub */}
        <div className="px-16 mt-12 flex flex-col items-center">
           <div className="relative">
              <div className="h-48 w-48 rounded-full border-[10px] border-slate-50 flex flex-col items-center justify-center bg-white shadow-2xl relative z-10">
                 <span className={cn("text-[80px] font-black leading-none", grade.color)}>{grade.label}</span>
                 <span className="text-[11px] font-black tracking-widest text-slate-400 uppercase mt-1">{grade.sub}</span>
              </div>
              <div className="absolute -inset-4 bg-blue-600/5 blur-3xl rounded-full" />
           </div>
           
           <div className="mt-8 space-y-3 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                 <Badge className="bg-emerald-50 text-emerald-600 border border-emerald-100 px-6 py-1.5 rounded-full font-bold text-[12px] tracking-tight shadow-sm">
                    <CheckCircle2 className="h-3.5 w-3.5 mr-2" /> Identity verified
                 </Badge>
              </div>
              <h2 className="text-5xl font-black tracking-tighter text-[#0F172A]">{studentName}</h2>
              <p className="text-xl font-bold text-slate-500 tracking-tight">{examTitle}</p>
           </div>
        </div>

        {/* Primary Metrics Grid */}
        <div className="px-16 mt-14 grid grid-cols-3 gap-6">
           <ReportMetric label="State rank" val={`#${rank}`} icon={<Trophy />} color="text-amber-500" bg="bg-amber-50" />
           <ReportMetric label="Score achieved" val={score} icon={<Zap />} color="text-[#2563EB]" bg="bg-blue-50" />
           <ReportMetric label="Subject accuracy" val={`${accuracy}%`} icon={<Target />} color="text-emerald-500" bg="bg-emerald-50" />
           <ReportMetric label="State percentile" val={`${percentile}%`} icon={<TrendingUp />} color="text-indigo-500" bg="bg-indigo-50" />
           <ReportMetric label="Attempt duration" val={timeTaken} icon={<Clock />} color="text-slate-500" bg="bg-slate-50" />
           <ReportMetric label="Engagement rate" val={`${Math.round(((correct + wrong) / (total || 1)) * 100)}%`} icon={<BarChart3 />} color="text-purple-500" bg="bg-purple-50" />
        </div>

        {/* Quant Nodes */}
        <div className="px-16 mt-10">
           <div className="bg-[#F8FAFC] border border-slate-100 rounded-[2.5rem] p-10 flex items-center justify-around shadow-inner">
              <ReportDataPoint label="Total items" val={total} color="text-slate-400" />
              <div className="w-px h-10 bg-slate-200" />
              <ReportDataPoint label="Correct" val={correct} color="text-emerald-600" />
              <div className="w-px h-10 bg-slate-200" />
              <ReportDataPoint label="Incorrect" val={wrong} color="text-rose-600" />
              <div className="w-px h-10 bg-slate-200" />
              <ReportDataPoint label="Skipped" val={total - (correct + wrong)} color="text-slate-300" />
           </div>
        </div>

        {/* Page 1 Footer Hub */}
        <div className="mt-auto bg-[#0F172A] p-12 flex items-center justify-between text-white">
           <div className="text-left space-y-6">
              <div className="flex items-center gap-4">
                 <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
                    <Award className="h-5 w-5 text-white" />
                 </div>
                 <p className="text-2xl font-black tracking-tight">Cracklix Assessment</p>
              </div>
              <div className="flex flex-col gap-1">
                 <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Registry Id: {resultId}</p>
                 <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Verification: WWW.CRACKLIX.COM</p>
              </div>
           </div>
           <div className="flex items-center gap-8">
              <div className="text-right space-y-0.5">
                 <p className="text-white font-black text-xl uppercase tracking-widest">Digital stamp</p>
                 <p className="text-primary font-bold text-[10px] uppercase tracking-[0.2em]">Institutional verified</p>
              </div>
              <div className="bg-white p-3 rounded-2xl shadow-5xl border-4 border-white/10">
                 <img src={qrUrl} alt="Verify" className="h-16 w-16" crossOrigin="anonymous" />
              </div>
           </div>
        </div>

        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-[10px] font-bold text-slate-300 tracking-widest">Page 1 of 2</div>
      </div>

      {/* PAGE 2: PERFORMANCE ANALYTICS */}
      <div 
        id="cracklix-result-page-2"
        className="bg-white text-[#0F172A] flex flex-col relative overflow-hidden shrink-0 shadow-2xl border border-slate-100"
        style={containerStyle}
      >
        <div className="absolute top-0 left-0 right-0 h-4 bg-[#0F172A]" />
        
        <div className="px-16 pt-16 space-y-10 flex-1 flex flex-col">
           <div className="flex justify-between items-end border-b-2 border-slate-100 pb-8">
              <div className="text-left space-y-2">
                 <h2 className="text-4xl font-black tracking-tighter text-[#0F172A]">Detailed analytics</h2>
                 <p className="text-sm font-bold text-slate-400 uppercase tracking-[0.2em]">Temporal and subject audit report</p>
              </div>
              <div className="h-8 relative opacity-20">
                 <img src="/logo/cracklix-logo-dark.png" alt="Logo" className="h-full w-auto" crossOrigin="anonymous" />
              </div>
           </div>

           {/* Subject Breakdown Node */}
           <section className="space-y-6 text-left">
              <div className="flex items-center gap-3">
                 <Layers className="h-6 w-6 text-primary" />
                 <h3 className="text-xl font-black tracking-widest text-[#0F172A] uppercase">Subject mastery matrix</h3>
              </div>
              <div className="rounded-[2rem] border-2 border-slate-100 overflow-hidden shadow-sm bg-white">
                 <table className="w-full text-left border-collapse">
                    <thead className="bg-[#0F172A] text-white">
                       <tr className="h-14">
                          <th className="px-8 font-black text-[11px] uppercase tracking-widest">Learning hub</th>
                          <th className="px-4 font-black text-[11px] uppercase tracking-widest text-center">Items</th>
                          <th className="px-4 font-black text-[11px] uppercase tracking-widest text-center">Correct</th>
                          <th className="px-4 font-black text-[11px] uppercase tracking-widest text-center">Accuracy</th>
                          <th className="px-8 font-black text-[11px] uppercase tracking-widest text-right">Points</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                       {subjects.length > 0 ? subjects.map((s, idx) => (
                          <tr key={idx} className="h-16 hover:bg-slate-50/50 transition-colors">
                             <td className="px-8 font-bold text-lg text-[#0F172A]">{s.name}</td>
                             <td className="px-4 text-center font-bold text-slate-400 tabular-nums">{s.total}</td>
                             <td className="px-4 text-center font-black text-emerald-600 tabular-nums">{s.correct}</td>
                             <td className="px-4 text-center">
                                <Badge className={cn("border-none text-[11px] font-bold px-3 py-1 rounded-lg", s.accuracy > 70 ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600")}>{s.accuracy}%</Badge>
                             </td>
                             <td className="px-8 text-right font-black text-[#2563EB] tabular-nums text-xl">{s.score}</td>
                          </tr>
                       )) : (
                          <tr className="h-32">
                             <td colSpan={5} className="text-center italic text-slate-300">Synchronizing registry nodes...</td>
                          </tr>
                       )}
                    </tbody>
                 </table>
              </div>
           </section>

           {/* Analytical Observations Hub */}
           <section className="space-y-6 text-left">
              <div className="flex items-center gap-3">
                 <BrainCircuit className="h-6 w-6 text-primary" />
                 <h3 className="text-xl font-black tracking-widest text-[#0F172A] uppercase">Consolidated insights</h3>
              </div>
              <div className="bg-[#F8FAFC] p-10 rounded-[2.5rem] border border-slate-100 relative overflow-hidden">
                 <div className="absolute top-0 right-0 p-8 opacity-[0.02]"><ShieldCheck className="h-32 w-32" /></div>
                 <div className="grid grid-cols-1 gap-6 relative z-10">
                    <InsightItem text={Number(accuracy) > 80 ? "Superior conceptual clarity observed across core exam verticals." : "Foundational knowledge verified; targeted review of missed items recommended."} />
                    <InsightItem text={Number(timeTaken.split('h')[0]) < 1 ? "Temporal efficiency exceeds state-topper benchmarks." : "Pacing optimization required to manage competitive exam thresholds."} />
                    <InsightItem text="Subject mastery index indicates strong preparation in primary hubs." />
                 </div>
              </div>
           </section>

           {/* Multi-Dimensional Audit Grid */}
           <div className="grid grid-cols-2 gap-10 mt-4">
              <section className="space-y-6 text-left">
                 <div className="flex items-center gap-3">
                    <TrendingUp className="h-6 w-6 text-primary" />
                    <h3 className="text-lg font-black tracking-widest text-[#0F172A] uppercase">Complexity audit</h3>
                 </div>
                 <div className="space-y-6 p-8 bg-slate-50 rounded-[2rem] border border-slate-100">
                    <ComplexityRow label="Easy items" val={difficulty.easy} color="bg-emerald-500" />
                    <ComplexityRow label="Medium items" val={difficulty.medium} color="bg-blue-500" />
                    <ComplexityRow label="Expert items" val={difficulty.hard} color="bg-rose-500" />
                 </div>
              </section>

              <section className="space-y-6 text-left">
                 <div className="flex items-center gap-3">
                    <Timer className="h-6 w-6 text-primary" />
                    <h3 className="text-lg font-black tracking-widest text-[#0F172A] uppercase">Temporal analytics</h3>
                 </div>
                 <div className="space-y-6 p-8 bg-slate-50 rounded-[2rem] border border-slate-100">
                    <MetricPill label="Avg ingestion speed" val={timeMetrics.avg} />
                    <MetricPill label="Fastest decision node" val={timeMetrics.fastest} />
                    <MetricPill label="Complex reasoning time" val={timeMetrics.slowest} />
                 </div>
              </section>
           </div>
        </div>

        {/* Global Footer */}
        <div className="mt-auto border-t-2 border-slate-100 p-12 flex items-center justify-between text-slate-300 shrink-0">
           <div className="flex items-center gap-4">
              <ShieldCheck className="h-6 w-6" />
              <span className="text-[11px] font-black tracking-[0.5em] uppercase">Institutional merit registry verified</span>
           </div>
           <div className="flex items-center gap-8">
              <p className="text-[11px] font-black tracking-[0.2em] uppercase">Page 2 of 2</p>
           </div>
        </div>
      </div>

    </div>
  );
}

function ReportMetric({ label, val, icon, color, bg }: any) {
   return (
      <div className="bg-white border-2 border-slate-50 rounded-[2rem] p-6 shadow-md flex flex-col items-center justify-center text-center space-y-4">
         <div className={cn("h-12 w-12 rounded-xl flex items-center justify-center shadow-inner", bg, color)}>
            {React.isValidElement(icon) ? React.cloneElement(icon as React.ReactElement, { className: "h-6 w-6" }) : null}
         </div>
         <div className="space-y-0.5">
            <p className="text-slate-400 font-bold tracking-[0.2em] text-[9px] uppercase leading-none">{label}</p>
            <p className={cn("text-2xl font-black tracking-tighter tabular-nums", color)}>{val}</p>
         </div>
      </div>
   );
}

function ReportDataPoint({ label, val, color }: any) {
   return (
      <div className="text-center space-y-1">
         <p className="text-slate-400 font-bold tracking-widest text-[9px] uppercase">{label}</p>
         <p className={cn("text-2xl font-black tabular-nums leading-none", color)}>{val}</p>
      </div>
   );
}

function InsightItem({ text }: { text: string }) {
   return (
      <div className="flex items-start gap-4">
         <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5 border border-primary/20">
            <Check className="h-3 w-3 text-primary stroke-[4px]" />
         </div>
         <p className="text-base font-bold text-slate-700 leading-snug tracking-tight text-left">{text}</p>
      </div>
   );
}

function ComplexityRow({ label, val, color }: any) {
   return (
      <div className="space-y-1.5">
         <div className="flex justify-between items-center px-1">
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{label}</span>
            <span className="text-xs font-black text-[#0F172A] tabular-nums">{val}%</span>
         </div>
         <div className="h-1.5 w-full bg-white rounded-full overflow-hidden shadow-inner border border-slate-100">
            <div className={cn("h-full transition-all duration-1000", color)} style={{ width: `${val}%` }} />
         </div>
      </div>
   );
}

function MetricPill({ label, val }: any) {
   return (
      <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
         <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</span>
         <span className="text-base font-black text-[#0F172A] tabular-nums tracking-tighter">{val}</span>
      </div>
   );
}
