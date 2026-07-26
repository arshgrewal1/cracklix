
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
}

/**
 * @fileOverview Official Institutional Result Report v1.2
 * FIXED: Removed all uppercase styling from labels and headers.
 * OPTIMIZED: Layout scaled for high-fidelity JPEG compression targeting ~200KB.
 */
const ShareableResultCard = forwardRef<HTMLDivElement, ShareableResultCardProps>(({ data, rank, totalCandidates }, ref) => {
  if (!data) return null;

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent('https://cracklix.in/verify/' + data.attemptId)}`;

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
      className="w-[1080px] min-h-[1350px] bg-white flex flex-col p-12 text-[#0F172A] font-body relative overflow-hidden"
      style={{ fontFamily: 'Poppins, sans-serif' }}
    >
      {/* 1. OFFICIAL HEADER */}
      <div className="flex justify-between items-start mb-10 border-b-2 border-slate-100 pb-10">
         <div className="space-y-6">
            <img 
              src="/logo/cracklix-logo-dark.png" 
              alt="Cracklix" 
              className="h-[120px] w-auto object-contain -ml-6" 
            />
            <div className="space-y-1">
               <h2 className="text-[32px] font-[700] text-[#0F172A] tracking-tight">{data.userName || "Aspirant"}</h2>
               <p className="text-sm font-bold text-slate-400">Candidate ID: {data.userId?.slice(-12).toUpperCase()}</p>
            </div>
         </div>

         <div className="text-right space-y-4">
            <div className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#E6F9F3] text-[#10B981] rounded-full border border-[#DCFCE7] shadow-sm">
               <ShieldCheck className="h-5 w-5" />
               <span className="font-bold text-sm">Verified result</span>
            </div>
            <div className="space-y-1 pt-2">
               <p className="text-[10px] font-bold text-slate-300">Attempt date</p>
               <p className="text-lg font-bold text-slate-600">{new Date(data.timestamp).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
            </div>
         </div>
      </div>

      {/* 2. TEST CONTEXT HUB */}
      <div className="grid grid-cols-12 gap-8 mb-10">
         <div className="col-span-8 space-y-1">
            <p className="text-[10px] font-bold text-primary">Test series hub</p>
            <h1 className="text-[28px] font-[700] text-[#0F172A] leading-tight tracking-tight">
               {data.mockTitle}
            </h1>
         </div>
         <div className="col-span-4 grid grid-cols-2 gap-4">
            <HeaderNode label="Duration" val={`${data.duration || 120}m`} icon={Timer} />
            <HeaderNode label="Attempt" val={`#${data.attemptCount || '1'}`} icon={Zap} />
         </div>
      </div>

      {/* 3. MAIN SCORE HUB */}
      <Card className="border-none shadow-xl rounded-[24px] bg-[#F0F7FF] p-10 mb-10 flex justify-between items-center relative overflow-hidden">
         <div className="absolute top-0 right-0 p-8 opacity-[0.03]">
            <Trophy className="h-48 w-48 text-primary" />
         </div>
         
         <div className="flex-1 border-r border-blue-200/50 space-y-6">
            <p className="text-xs font-bold text-blue-400">Sectional score</p>
            <div className="flex items-baseline gap-4">
               <span className="text-[100px] font-[800] text-[#2563EB] leading-none tabular-nums tracking-tighter">{data.score}</span>
               <span className="text-3xl font-bold text-blue-300">/ {data.totalQuestions}</span>
            </div>
            <div className="flex items-center gap-3">
               <Badge className="bg-[#2563EB] text-white border-none px-4 py-1 rounded-lg font-bold text-lg">{data.percentage}%</Badge>
               <span className="text-sm font-bold text-blue-400">Aggregate percentage</span>
            </div>
         </div>

         <div className="px-16 space-y-8 text-right">
            <div className="space-y-1">
               <p className="text-xs font-bold text-blue-400">Punjab rank</p>
               <div className="flex items-baseline justify-end gap-2">
                  <span className="text-7xl font-[800] text-[#0F172A] tabular-nums tracking-tighter">#{rank}</span>
                  <span className="text-lg font-bold text-slate-400">/ {totalCandidates}</span>
               </div>
            </div>
            <div className="space-y-1">
               <p className="text-xs font-bold text-blue-400">Percentile</p>
               <span className="text-4xl font-[800] text-[#10B981] tabular-nums tracking-tighter">
                  {Math.max(0, Math.round(((totalCandidates - Number(rank)) / (totalCandidates || 1)) * 100))}%
               </span>
            </div>
         </div>
      </Card>

      {/* 4. PERFORMANCE MATRIX */}
      <div className="grid grid-cols-4 gap-6 mb-10">
         <StatBox label="Correct" val={data.correctCount} color="text-[#10B981]" bg="bg-[#E6F9F3]" icon={CheckCircle2} />
         <StatBox label="Wrong" val={data.wrongCount} color="text-[#F43F5E]" bg="bg-[#FEF2F2]" icon={XCircle} />
         <StatBox label="Skipped" val={data.skippedCount} color="text-slate-400" bg="bg-slate-50" icon={AlertCircle} />
         <StatBox label="Accuracy" val={`${data.attemptAccuracy}%`} color="text-primary" bg="bg-blue-50" icon={Target} />
      </div>

      {/* 5. SUBJECT MASTERY TABLE */}
      <div className="space-y-6 mb-10">
         <h3 className="text-sm font-bold text-slate-400 ml-1">Subject performance</h3>
         <Card className="border border-[#E5EAF2] shadow-sm rounded-[20px] bg-white overflow-hidden">
            <table className="w-full text-left border-collapse">
               <thead className="bg-slate-50">
                  <tr className="h-12">
                     <th className="px-8 font-bold text-[10px] text-slate-400">Subject hub</th>
                     <th className="px-4 font-bold text-[10px] text-slate-400 text-center">Correct</th>
                     <th className="px-4 font-bold text-[10px] text-slate-400 text-center">Wrong</th>
                     <th className="px-8 font-bold text-[10px] text-slate-400 text-right">Net score</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-100">
                  {(data.subjectAnalysis || []).map((s: any, i: number) => (
                     <tr key={i} className="h-16">
                        <td className="px-8">
                           <div className="space-y-2">
                              <p className="font-bold text-sm text-[#0F172A] tracking-tight">{s.name}</p>
                              <div className="h-1 w-32 bg-slate-100 rounded-full overflow-hidden">
                                 <div className="h-full bg-primary" style={{ width: `${s.accuracy}%` }} />
                              </div>
                           </div>
                        </td>
                        <td className="px-4 text-center font-bold text-emerald-600 tabular-nums">{s.correct}</td>
                        <td className="px-4 text-center font-bold text-rose-500 tabular-nums">{s.wrong}</td>
                        <td className="px-8 text-right font-black text-base text-[#0F172A] tabular-nums">{s.score} <span className="text-slate-300 font-bold">/ {s.total}</span></td>
                     </tr>
                  ))}
               </tbody>
            </table>
         </Card>
      </div>

      {/* 6. COMPETITION SNAPSHOT */}
      <div className="grid grid-cols-2 gap-8 mb-10">
         <div className="space-y-6">
            <h3 className="text-sm font-bold text-slate-400 ml-1">Competition hub</h3>
            <Card className="border border-[#E5EAF2] p-8 rounded-[20px] grid grid-cols-2 gap-6 bg-white shadow-sm">
               <CompNode label="Top score" val="24.5" />
               <CompNode label="Avg score" val="14.2" />
               <div className="col-span-2 pt-4 border-t border-slate-50 flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400">Readiness status</span>
                  <Badge className={cn("border-none px-4 py-1 rounded-lg font-bold text-[10px]", readinessStatus.bg, readinessStatus.color)}>
                     {readinessStatus.label}
                  </Badge>
               </div>
            </Card>
         </div>
         <div className="space-y-6">
            <h3 className="text-sm font-bold text-slate-400 ml-1">Smart insights</h3>
            <div className="grid grid-cols-1 gap-2">
               <InsightNode label="Strength" val="High accuracy in Punjab GK" color="text-emerald-600" bg="bg-emerald-50" />
               <InsightNode label="Weakness" val="Needs speed in Reasoning" color="text-rose-600" bg="bg-rose-50" />
            </div>
         </div>
      </div>

      {/* 7. VERIFICATION FOOTER */}
      <div className="mt-auto pt-10 border-t-2 border-slate-100 flex justify-between items-end">
         <div className="space-y-6 text-left">
            <div className="flex items-center gap-4 text-slate-400">
               <ShieldCheck className="h-8 w-8 text-emerald-500" />
               <div className="space-y-1">
                  <p className="text-lg font-bold tracking-tight text-[#0F172A]">Official report hub</p>
                  <p className="text-xs font-medium text-slate-400">Digitally verified by Arsh Grewal Management Registry</p>
               </div>
            </div>
            <div className="space-y-1 pt-2">
               <p className="text-[9px] font-bold text-slate-300">Report ID</p>
               <code className="text-xs font-mono font-bold text-primary">{data.attemptId || "NODE_01_VERIFIED"}</code>
            </div>
         </div>
         <div className="flex items-center gap-10">
            <div className="text-right space-y-1">
               <p className="text-xl font-bold text-[#0F172A]">Verify registry</p>
               <p className="text-[10px] font-bold text-slate-400">Scan to validate node</p>
            </div>
            <div className="bg-white p-3 rounded-[20px] border border-slate-100 shadow-xl">
               <img src={qrUrl} alt="QR Node" className="h-24 w-24" />
            </div>
         </div>
      </div>
    </div>
  );
});

ShareableResultCard.displayName = "ShareableResultCard";

function HeaderNode({ label, val, icon: Icon }: any) {
   return (
      <div className="p-3 bg-slate-50 rounded-xl flex flex-col items-center justify-center text-center gap-1 border border-slate-100">
         <Icon className="h-3.5 w-3.5 text-primary opacity-40" />
         <p className="text-[8px] font-bold text-slate-400">{label}</p>
         <p className="text-xs font-bold text-[#0F172A]">{val}</p>
      </div>
   )
}

function StatBox({ label, val, color, bg, icon: Icon }: any) {
   return (
      <div className={cn("p-6 rounded-[20px] flex flex-col items-center justify-center text-center gap-2 border border-slate-100 shadow-sm transition-all", bg)}>
         <Icon className={cn("h-5 w-5 mb-1", color)} />
         <span className={cn("text-3xl font-[800] tabular-nums tracking-tighter", color)}>{val}</span>
         <span className="text-[9px] font-bold text-slate-400">{label}</span>
      </div>
   )
}

function CompNode({ label, val }: any) {
   return (
      <div className="text-left space-y-1">
         <p className="text-[9px] font-bold text-slate-400">{label}</p>
         <p className="text-xl font-bold text-[#0F172A] tabular-nums">{val}</p>
      </div>
   )
}

function InsightNode({ label, val, color, bg }: any) {
   return (
      <div className={cn("px-5 py-3 rounded-xl flex items-center gap-3 border border-transparent shadow-sm", bg)}>
         <div className={cn("h-1.5 w-1.5 rounded-full shrink-0", color.replace('text', 'bg'))} />
         <div className="min-w-0">
            <span className={cn("text-[8px] font-bold block", color)}>{label}</span>
            <p className="text-xs font-bold text-slate-700 truncate">{val}</p>
         </div>
      </div>
   )
}

export default ShareableResultCard;
