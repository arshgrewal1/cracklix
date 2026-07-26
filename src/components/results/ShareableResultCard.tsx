
'use client';

import React, { forwardRef, useMemo } from 'react';
import { 
  ShieldCheck, 
  Trophy, 
  Target, 
  Clock, 
  Calendar, 
  Zap, 
  CheckCircle2, 
  Award,
  Timer,
  BookOpen,
  FileText,
  BarChart3,
  Users,
  Activity,
  AlertCircle,
  TrendingUp,
  XCircle,
  LayoutGrid
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

interface ShareableResultCardProps {
  data: any;
  rank: number | string;
  totalCandidates: number;
  topScore?: number;
  avgScore?: number;
  avgAccuracy?: number;
  duration?: number;
}

/**
 * @fileOverview Official Institutional Result Report v2.0.
 * FIXED: Actual duration and real-time competition stats.
 * FIXED: Bottom clipping by re-balancing vertical height.
 */
const ShareableResultCard = forwardRef<HTMLDivElement, ShareableResultCardProps>(({ 
  data, rank, totalCandidates, topScore = 0, avgScore = 0, avgAccuracy = 0, duration = 120 
}, ref) => {
  if (!data) return null;

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent('https://cracklix.in/results/view?id=' + data.mockId)}`;

  const readinessStatus = useMemo(() => {
    const p = data.percentage || 0;
    if (p >= 85) return { label: "Excellent", color: "text-emerald-600", bg: "bg-emerald-50" };
    if (p >= 70) return { label: "Good", color: "text-blue-600", bg: "bg-blue-50" };
    if (p >= 50) return { label: "Average", color: "text-amber-600", bg: "bg-amber-50" };
    return { label: "Needs Improvement", color: "text-rose-600", bg: "bg-rose-50" };
  }, [data.percentage]);

  return (
    <div 
      ref={ref}
      id="cracklix-official-report"
      className="w-[1080px] h-[1350px] bg-white flex flex-col p-12 text-[#0F172A] font-body relative overflow-hidden"
      style={{ fontFamily: 'Poppins, sans-serif' }}
    >
      {/* 1. OFFICIAL HEADER */}
      <div className="flex justify-between items-start mb-6 border-b-2 border-slate-100 pb-6">
         <div className="space-y-4">
            <img 
              src="/logo/cracklix-logo-dark.png" 
              alt="Cracklix" 
              className="h-[100px] w-auto object-contain -ml-4" 
            />
            <div className="space-y-1">
               <h2 className="text-[28px] font-[700] text-[#0F172A] tracking-tight">{data.userName || "Aspirant"}</h2>
               <p className="text-xs font-bold text-slate-400">Candidate Id: {data.userId?.slice(-12).toUpperCase()}</p>
            </div>
         </div>

         <div className="text-right space-y-3">
            <div className="inline-flex items-center gap-2 px-6 py-2 bg-[#E6F9F3] text-[#10B981] rounded-full border border-[#DCFCE7] shadow-sm">
               <ShieldCheck className="h-4 w-4" />
               <span className="font-bold text-xs">Verified result</span>
            </div>
            <div className="space-y-0.5 pt-1">
               <p className="text-[9px] font-bold text-slate-300">Attempt date</p>
               <p className="text-base font-bold text-slate-600">{new Date(data.timestamp).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
            </div>
         </div>
      </div>

      {/* 2. TEST CONTEXT HUB */}
      <div className="grid grid-cols-12 gap-6 mb-6">
         <div className="col-span-8 space-y-0.5">
            <p className="text-[9px] font-bold text-primary">Test series hub</p>
            <h1 className="text-[24px] font-[700] text-[#0F172A] leading-tight tracking-tight">
               {data.mockTitle}
            </h1>
         </div>
         <div className="col-span-4 grid grid-cols-2 gap-3">
            <HeaderNode label="Duration" val={`${duration}m`} icon={Timer} />
            <HeaderNode label="Attempt" val={`#${data.attemptCount || '1'}`} icon={Zap} />
         </div>
      </div>

      {/* 3. MAIN SCORE HUB */}
      <Card className="border-none shadow-xl rounded-[20px] bg-[#F0F7FF] p-8 mb-6 flex justify-between items-center relative overflow-hidden">
         <div className="absolute top-0 right-0 p-6 opacity-[0.03]">
            <Trophy className="h-40 w-40 text-primary" />
         </div>
         
         <div className="flex-1 border-r border-blue-200/50 space-y-4">
            <p className="text-[10px] font-bold text-blue-400">Sectional score</p>
            <div className="flex items-baseline gap-3">
               <span className="text-[80px] font-[800] text-[#2563EB] leading-none tabular-nums tracking-tighter">{data.score}</span>
               <span className="text-2xl font-bold text-blue-300">/ {data.totalQuestions}</span>
            </div>
            <div className="flex items-center gap-2">
               <Badge className="bg-[#2563EB] text-white border-none px-3 py-0.5 font-bold text-base">{data.percentage}%</Badge>
               <span className="text-[11px] font-bold text-blue-400">Aggregate percentage</span>
            </div>
         </div>

         <div className="px-12 space-y-6 text-right">
            <div className="space-y-0.5">
               <p className="text-[10px] font-bold text-blue-400">Punjab rank</p>
               <div className="flex items-baseline justify-end gap-1.5">
                  <span className="text-6xl font-[800] text-[#0F172A] tabular-nums tracking-tighter">#{rank}</span>
                  <span className="text-base font-bold text-slate-400">/ {totalCandidates}</span>
               </div>
            </div>
            <div className="space-y-0.5">
               <p className="text-[10px] font-bold text-blue-400">Percentile</p>
               <span className="text-3xl font-[800] text-[#10B981] tabular-nums tracking-tighter">
                  {Math.max(0, Math.round(((totalCandidates - Number(rank)) / (totalCandidates || 1)) * 100))}%
               </span>
            </div>
         </div>
      </Card>

      {/* 4. PERFORMANCE MATRIX */}
      <div className="grid grid-cols-4 gap-4 mb-6">
         <StatBox label="Correct" val={data.correctCount} color="text-[#10B981]" bg="bg-[#E6F9F3]" icon={CheckCircle2} />
         <StatBox label="Wrong" val={data.wrongCount} color="text-[#F43F5E]" bg="bg-[#FEF2F2]" icon={XCircle} />
         <StatBox label="Skipped" val={data.skippedCount} color="text-slate-400" bg="bg-slate-50" icon={AlertCircle} />
         <StatBox label="Accuracy" val={`${data.attemptAccuracy}%`} color="text-primary" bg="bg-blue-50" icon={Target} />
      </div>

      {/* 5. SUBJECT MASTERY TABLE */}
      <div className="space-y-4 mb-6">
         <h3 className="text-[11px] font-bold text-slate-400 ml-1">Subject performance</h3>
         <Card className="border border-[#E5EAF2] shadow-sm rounded-[16px] bg-white overflow-hidden">
            <table className="w-full text-left border-collapse">
               <thead className="bg-slate-50">
                  <tr className="h-10">
                     <th className="px-8 font-bold text-[9px] text-slate-400">Subject hub</th>
                     <th className="px-4 font-bold text-[9px] text-slate-400 text-center">Correct</th>
                     <th className="px-4 font-bold text-[9px] text-slate-400 text-center">Wrong</th>
                     <th className="px-8 font-bold text-[9px] text-slate-400 text-right">Net score</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-100">
                  {(data.subjectAnalysis || []).map((s: any, i: number) => (
                     <tr key={i} className="h-12">
                        <td className="px-8">
                           <div className="space-y-1">
                              <p className="font-bold text-xs text-[#0F172A] tracking-tight">{s.name}</p>
                              <div className="h-1 w-24 bg-slate-100 rounded-full overflow-hidden">
                                 <div className="h-full bg-primary" style={{ width: `${s.accuracy}%` }} />
                              </div>
                           </div>
                        </td>
                        <td className="px-4 text-center font-bold text-emerald-600 text-sm tabular-nums">{s.correct}</td>
                        <td className="px-4 text-center font-bold text-rose-500 text-sm tabular-nums">{s.wrong}</td>
                        <td className="px-8 text-right font-black text-sm text-[#0F172A] tabular-nums">{s.score} <span className="text-slate-300 font-bold text-[10px]">/ {s.total}</span></td>
                     </tr>
                  ))}
               </tbody>
            </table>
         </Card>
      </div>

      {/* 6. COMPETITION SNAPSHOT */}
      <div className="grid grid-cols-2 gap-6 mb-8">
         <div className="space-y-4">
            <h3 className="text-[11px] font-bold text-slate-400 ml-1">Competition hub</h3>
            <Card className="border border-[#E5EAF2] p-6 rounded-[16px] grid grid-cols-2 gap-4 bg-white shadow-sm">
               <CompNode label="Top score" val={topScore.toFixed(1)} />
               <CompNode label="Avg score" val={avgScore.toFixed(1)} />
               <div className="col-span-2 pt-3 border-t border-slate-50 flex items-center justify-between">
                  <span className="text-[9px] font-bold text-slate-400">Readiness status</span>
                  <Badge className={cn("border-none px-3 py-0.5 rounded-lg font-bold text-[9px]", readinessStatus.bg, readinessStatus.color)}>
                     {readinessStatus.label}
                  </Badge>
               </div>
            </Card>
         </div>
         <div className="space-y-4">
            <h3 className="text-[11px] font-bold text-slate-400 ml-1">Smart insights</h3>
            <div className="grid grid-cols-1 gap-2">
               <InsightNode label="Strength" val="High accuracy in Punjab Gk" color="text-emerald-600" bg="bg-emerald-50" />
               <InsightNode label="Weakness" val="Needs speed in Reasoning" color="text-rose-600" bg="bg-rose-50" />
            </div>
         </div>
      </div>

      {/* 7. VERIFICATION FOOTER - MOVED UP TO PREVENT CLIPPING */}
      <div className="mt-auto pt-6 border-t-2 border-slate-100 flex justify-between items-end bg-white relative z-20">
         <div className="space-y-4 text-left">
            <div className="flex items-center gap-3 text-slate-400">
               <ShieldCheck className="h-6 w-6 text-emerald-500" />
               <div className="space-y-0.5">
                  <p className="text-base font-bold tracking-tight text-[#0F172A]">Official report hub</p>
                  <p className="text-[10px] font-medium text-slate-400">Digitally verified by Arsh Grewal Management Registry</p>
               </div>
            </div>
            <div className="space-y-0.5 pt-1">
               <p className="text-[8px] font-bold text-slate-300">Report Id</p>
               <code className="text-[11px] font-mono font-bold text-primary">{data.attemptId || "NODE_01_VERIFIED"}</code>
            </div>
         </div>
         <div className="flex items-center gap-8">
            <div className="text-right space-y-0.5">
               <p className="text-base font-bold text-[#0F172A]">Verify registry</p>
               <p className="text-[9px] font-bold text-slate-400">Scan to validate node</p>
            </div>
            <div className="bg-white p-2 rounded-[14px] border border-slate-100 shadow-xl">
               <img src={qrUrl} alt="QR Node" className="h-20 w-24" />
            </div>
         </div>
      </div>
    </div>
  );
});

ShareableResultCard.displayName = "ShareableResultCard";

function HeaderNode({ label, val, icon: Icon }: any) {
   return (
      <div className="p-2 bg-slate-50 rounded-lg flex flex-col items-center justify-center text-center gap-0.5 border border-slate-100">
         <Icon className="h-3 w-3 text-primary opacity-40" />
         <p className="text-[7px] font-bold text-slate-400">{label}</p>
         <p className="text-[10px] font-bold text-[#0F172A]">{val}</p>
      </div>
   )
}

function StatBox({ label, val, color, bg, icon: Icon }: any) {
   return (
      <div className={cn("p-4 rounded-[16px] flex flex-col items-center justify-center text-center gap-1 border border-slate-100 shadow-sm transition-all", bg)}>
         <Icon className={cn("h-4 w-4 mb-0.5", color)} />
         <span className={cn("text-2xl font-[800] tabular-nums tracking-tighter", color)}>{val}</span>
         <span className="text-[8px] font-bold text-slate-400">{label}</span>
      </div>
   )
}

function CompNode({ label, val }: any) {
   return (
      <div className="text-left space-y-0.5">
         <p className="text-[8px] font-bold text-slate-400">{label}</p>
         <p className="text-base font-bold text-[#0F172A] tabular-nums">{val}</p>
      </div>
   )
}

function InsightNode({ label, val, color, bg }: any) {
   return (
      <div className={cn("px-4 py-2 rounded-lg flex items-center gap-3 border border-transparent shadow-sm", bg)}>
         <div className={cn("h-1 w-1 rounded-full shrink-0", color.replace('text', 'bg'))} />
         <div className="min-w-0">
            <span className={cn("text-[7px] font-bold block", color)}>{label}</span>
            <p className="text-[11px] font-bold text-slate-700 truncate">{val}</p>
         </div>
      </div>
   )
}

export default ShareableResultCard;
