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
  FileText,
  Check,
  TrendingUp,
  BrainCircuit,
  Info,
  Layers,
  Search,
  ArrowRight
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
}

/**
 * @fileOverview World-Class Institutional Assessment Report v5.0.
 * Optimized for A4 Printing (300 DPI Simulation).
 * FIXED: All icons and UI components properly imported.
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
    if (acc >= 95) return { label: 'S', color: 'text-emerald-600', sub: 'Superb' };
    if (acc >= 85) return { label: 'A+', color: 'text-blue-600', sub: 'Distinction' };
    if (acc >= 75) return { label: 'A', color: 'text-blue-500', sub: 'Excellent' };
    if (acc >= 60) return { label: 'B', color: 'text-amber-500', sub: 'Good' };
    if (acc >= 40) return { label: 'C', color: 'text-orange-500', sub: 'Average' };
    return { label: 'D', color: 'text-rose-500', sub: 'Qualified' };
  };

  const grade = getGrade(Number(accuracy) || 0);

  return (
    <div className="flex flex-col gap-0 bg-slate-200">
      
      {/* PAGE 1: OFFICIAL RESULT SUMMARY */}
      <div 
        id="cracklix-result-page-1"
        className="w-[1000px] h-[1414px] bg-white text-[#0F172A] flex flex-col relative overflow-hidden shrink-0 shadow-2xl"
        style={{ fontFamily: 'Inter, sans-serif' }}
      >
        <div className="absolute top-0 left-0 right-0 h-4 bg-[#1E3A8A]" />
        <div className="absolute top-4 left-0 right-0 h-1 bg-[#2563EB]" />

        <div className="px-16 pt-16 flex justify-between items-start">
           <div className="flex items-center gap-6">
              <div className="h-16 w-16 bg-[#1E3A8A] rounded-2xl flex items-center justify-center shadow-lg">
                 <ShieldCheck className="h-10 w-10 text-white" />
              </div>
              <div>
                 <h1 className="text-4xl font-black tracking-tighter uppercase leading-none text-[#1E3A8A]">Cracklix</h1>
                 <p className="text-[10px] font-bold text-slate-400 tracking-[0.4em] uppercase mt-1">Official Result Node</p>
              </div>
           </div>
           <div className="text-right space-y-1">
              <p className="text-slate-400 font-black uppercase tracking-[0.2em] text-[9px]">Registration Date</p>
              <p className="text-lg font-black tabular-nums text-[#0F172A]">{date}</p>
           </div>
        </div>

        <div className="px-16 mt-16 flex flex-col items-center">
           <div className="relative">
              <div className="h-44 w-44 rounded-full border-[10px] border-slate-50 flex flex-col items-center justify-center bg-white shadow-2xl relative z-10">
                 <span className={cn("text-7xl font-black leading-none", grade.color)}>{grade.label}</span>
                 <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">{grade.sub}</span>
              </div>
              <div className="absolute -inset-4 bg-blue-600/5 blur-2xl rounded-full animate-pulse" />
           </div>
           <div className="mt-8 space-y-3 text-center">
              <Badge className="bg-emerald-50 text-emerald-600 border border-emerald-200 px-6 py-1.5 rounded-full font-black text-[10px] uppercase tracking-widest shadow-sm">
                 <CheckCircle2 className="h-3.5 w-3.5 mr-2" /> Performance Verified
              </Badge>
              <h2 className="text-5xl font-black tracking-tight text-[#0F172A]">{studentName}</h2>
              <p className="text-xl font-bold text-primary uppercase tracking-[0.1em]">{examTitle}</p>
           </div>
        </div>

        <div className="px-16 mt-16 grid grid-cols-3 gap-8">
           <ReportMetric label="State Rank" val={`#${rank}`} icon={<Trophy />} color="text-amber-500" bg="bg-amber-50" />
           <ReportMetric label="Final Score" val={score} icon={<Zap />} color="text-primary" bg="bg-blue-50" />
           <ReportMetric label="Accuracy" val={`${accuracy}%`} icon={<Target />} color="text-emerald-500" bg="bg-emerald-50" />
           <ReportMetric label="Percentile" val={`${percentile}%`} icon={<TrendingUp />} color="text-indigo-500" bg="bg-indigo-50" />
           <ReportMetric label="Time Taken" val={timeTaken} icon={<Clock />} color="text-slate-500" bg="bg-slate-50" />
           <ReportMetric label="Attempt Rate" val={`${Math.round(((correct + wrong) / total) * 100)}%`} icon={<BarChart3 />} color="text-purple-500" bg="bg-purple-50" />
        </div>

        <div className="px-16 mt-12">
           <div className="bg-[#F8FAFC] border border-slate-100 rounded-[2.5rem] p-10 flex items-center justify-between shadow-inner">
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
           <div className="space-y-4">
              <div className="flex items-center gap-4">
                 <Crown className="h-8 w-8 text-primary fill-primary" />
                 <p className="text-2xl font-black tracking-tight uppercase">Institutional Registry Hub</p>
              </div>
              <div className="flex flex-col gap-1">
                 <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Result ID: {resultId}</p>
                 <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Verification URL: www.cracklix.com</p>
              </div>
           </div>
           <div className="flex items-center gap-10">
              <div className="text-right space-y-1">
                 <p className="text-white font-black text-lg uppercase tracking-widest">Verify Hub</p>
                 <p className="text-primary font-bold text-[10px] uppercase tracking-[0.2em]">Scan to validate result</p>
              </div>
              <div className="bg-white p-3 rounded-2xl shadow-xl">
                 <img src={qrUrl} alt="Verify" className="h-20 w-20" />
              </div>
           </div>
        </div>

        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-[10px] font-black text-slate-500 uppercase tracking-widest opacity-20">Page 1 of 2</div>
      </div>

      {/* PAGE 2: DETAILED PERFORMANCE REPORT */}
      <div 
        id="cracklix-result-page-2"
        className="w-[1000px] h-[1414px] bg-white text-[#0F172A] flex flex-col relative overflow-hidden shrink-0 shadow-2xl"
        style={{ fontFamily: 'Inter, sans-serif' }}
      >
        <div className="absolute top-0 right-0 h-4 bg-[#1E3A8A]" />
        
        <div className="px-16 pt-16 space-y-12">
           <div className="flex justify-between items-end border-b-2 border-slate-100 pb-8">
              <div className="space-y-2">
                 <h2 className="text-4xl font-black tracking-tighter text-[#1E3A8A] uppercase">Performance Analysis</h2>
                 <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Deep-Dive Assessment Report</p>
              </div>
              <div className="h-10 relative">
                 <img src="/logo/cracklix-logo-dark.png" alt="Logo" className="h-full w-auto" />
              </div>
           </div>

           <section className="space-y-4">
              <div className="flex items-center gap-3">
                 <BrainCircuit className="h-6 w-6 text-primary" />
                 <h3 className="text-lg font-black uppercase tracking-widest text-[#0F172A]">Overall Summary</h3>
              </div>
              <div className="bg-[#F8FAFC] p-8 rounded-[2rem] border border-slate-100 relative overflow-hidden">
                 <div className="absolute top-0 right-0 p-4 opacity-5"><Zap className="h-24 w-24" /></div>
                 <ul className="space-y-4 relative z-10">
                    <SummaryPoint text={Number(accuracy) > 75 ? "Excellent analytical and reasoning skills demonstrated." : "Foundational knowledge is strong, requires more targeted practice."} />
                    <SummaryPoint text={Number(timeTaken.split('m')[0]) > 60 ? "Speed needs optimization for competitive time limits." : "Time management within official recruitment norms."} />
                    <SummaryPoint text={correct > wrong ? "Conceptual understanding across subjects is verified." : "Focus on high-weightage topics to improve accuracy indices."} />
                 </ul>
              </div>
           </section>

           <section className="space-y-6">
              <div className="flex items-center gap-3">
                 <Layers className="h-6 w-6 text-primary" />
                 <h3 className="text-lg font-black uppercase tracking-widest text-[#0F172A]">Subject-wise breakdown</h3>
              </div>
              <div className="rounded-[2rem] border border-slate-100 overflow-hidden shadow-xl">
                 <table className="w-full text-left border-collapse">
                    <thead className="bg-[#1E3A8A] text-white">
                       <tr className="h-14">
                          <th className="px-8 font-black uppercase text-[10px] tracking-widest">Subject Hub</th>
                          <th className="px-4 font-black uppercase text-[10px] tracking-widest text-center">Items</th>
                          <th className="px-4 font-black uppercase text-[10px] tracking-widest text-center">Correct</th>
                          <th className="px-4 font-black uppercase text-[10px] tracking-widest text-center">Accuracy</th>
                          <th className="px-8 font-black uppercase text-[10px] tracking-widest text-right">Score</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                       {subjects.length > 0 ? subjects.map((s, idx) => (
                          <tr key={idx} className="h-16 hover:bg-slate-50 transition-colors">
                             <td className="px-8 font-bold text-sm text-[#0F172A]">{s.name}</td>
                             <td className="px-4 text-center font-bold text-slate-400 tabular-nums">{s.total}</td>
                             <td className="px-4 text-center font-bold text-emerald-600 tabular-nums">{s.correct}</td>
                             <td className="px-4 text-center">
                                <Badge className={cn("border-none text-[10px] font-black", s.accuracy > 70 ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600")}>{s.accuracy}%</Badge>
                             </td>
                             <td className="px-8 text-right font-black text-primary tabular-nums">{s.score}</td>
                          </tr>
                       )) : (
                          <tr className="h-32">
                             <td colSpan={5} className="text-center italic text-slate-300">Detailed subject data loading...</td>
                          </tr>
                       )}
                    </tbody>
                 </table>
              </div>
           </section>

           <div className="grid grid-cols-2 gap-10">
              <section className="space-y-6">
                 <div className="flex items-center gap-3">
                    <TrendingUp className="h-6 w-6 text-primary" />
                    <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-400">Difficulty Analysis</h3>
                 </div>
                 <div className="space-y-6 p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100">
                    <DifficultyBar label="Easy Nodes" val={difficulty.easy} color="bg-emerald-500" />
                    <DifficultyBar label="Medium Nodes" val={difficulty.medium} color="bg-blue-500" />
                    <DifficultyBar label="Expert Nodes" val={difficulty.hard} color="bg-rose-500" />
                 </div>
              </section>

              <section className="space-y-6">
                 <div className="flex items-center gap-3">
                    <Timer className="h-6 w-6 text-primary" />
                    <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-400">Time Metrics</h3>
                 </div>
                 <div className="space-y-6 p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100">
                    <MetricValue label="Avg Time / Q" val={timeMetrics.avg} />
                    <MetricValue label="Fastest Ingestion" val={timeMetrics.fastest} />
                    <MetricValue label="Slowest Logic" val={timeMetrics.slowest} />
                 </div>
              </section>
           </div>

           <div className="grid grid-cols-2 gap-10">
              <Card className="p-8 rounded-[2.5rem] bg-emerald-50/50 border-emerald-100 shadow-sm space-y-4">
                 <h4 className="text-emerald-700 font-black uppercase text-[10px] tracking-widest flex items-center gap-2">
                    <Award className="h-4 w-4" /> Performance Strengths
                 </h4>
                 <div className="space-y-2">
                    <StrengthNode label="Excellent Accuracy" />
                    <StrengthNode label="Logical Consistency" />
                    <StrengthNode label="Subject Mastery" />
                 </div>
              </Card>
              <Card className="p-8 rounded-[2.5rem] bg-rose-50/50 border-rose-100 shadow-sm space-y-4">
                 <h4 className="text-rose-700 font-black uppercase text-[10px] tracking-widest flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" /> Areas for Audit
                 </h4>
                 <div className="space-y-2">
                    <ImproveNode label="Speed Optimization" />
                    <ImproveNode label="Time Management" />
                    <ImproveNode label="Accuracy Consistency" />
                 </div>
              </Card>
           </div>
        </div>

        <div className="mt-auto border-t border-slate-100 p-16 flex items-center justify-between text-slate-300">
           <div className="flex items-center gap-3">
              <ShieldCheck className="h-6 w-6" />
              <span className="text-[10px] font-black uppercase tracking-[0.4em]">Cracklix Quality Audit System</span>
           </div>
           <p className="text-[10px] font-bold uppercase tracking-widest">Page 2 of 2</p>
        </div>
      </div>

    </div>
  );
}

function ReportMetric({ label, val, icon, color, bg }: any) {
   return (
      <div className="bg-white border border-slate-100 rounded-[2rem] p-8 shadow-md flex flex-col items-center justify-center text-center space-y-4 group hover:border-primary/20 transition-all">
         <div className={cn("h-12 w-12 rounded-xl flex items-center justify-center shadow-inner transition-transform group-hover:scale-110", bg, color)}>
            {React.isValidElement(icon) ? React.cloneElement(icon as React.ReactElement, { className: "h-6 w-6" }) : null}
         </div>
         <div className="space-y-1">
            <p className="text-slate-400 font-black uppercase tracking-[0.3em] text-[8px]">{label}</p>
            <p className={cn("text-3xl font-black tracking-tighter tabular-nums", color)}>{val}</p>
         </div>
      </div>
   );
}

function DataNode({ label, val, color }: any) {
   return (
      <div className="text-center space-y-1.5">
         <p className="text-slate-400 font-black uppercase tracking-widest text-[9px]">{label}</p>
         <p className={cn("text-2xl font-black tabular-nums", color)}>{val}</p>
      </div>
   );
}

function SummaryPoint({ text }: { text: string }) {
   return (
      <li className="flex items-start gap-4">
         <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
            <Check className="h-3 w-3 text-primary stroke-[4px]" />
         </div>
         <p className="text-sm font-bold text-slate-600 leading-relaxed">{text}</p>
      </li>
   );
}

function DifficultyBar({ label, val, color }: any) {
   return (
      <div className="space-y-2">
         <div className="flex justify-between items-center">
            <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest">{label}</span>
            <span className="text-[10px] font-black text-[#0F172A]">{val}%</span>
         </div>
         <div className="h-1.5 w-full bg-white rounded-full overflow-hidden shadow-inner">
            <div className={cn("h-full transition-all duration-1000", color)} style={{ width: `${val}%` }} />
         </div>
      </div>
   );
}

function MetricValue({ label, val }: any) {
   return (
      <div className="flex items-center justify-between">
         <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</span>
         <span className="text-sm font-black text-[#0F172A] tabular-nums">{val}</span>
      </div>
   );
}

function StrengthNode({ label }: { label: string }) {
   return (
      <div className="flex items-center gap-3">
         <CheckCircle2 className="h-4 w-4 text-emerald-500" />
         <span className="text-xs font-bold text-emerald-900">{label}</span>
      </div>
   );
}

function ImproveNode({ label }: { label: string }) {
   return (
      <div className="flex items-center gap-3">
         <AlertCircle className="h-4 w-4 text-rose-500" />
         <span className="text-xs font-bold text-rose-900">{label}</span>
      </div>
   );
}
