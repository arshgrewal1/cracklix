
'use client';

import React, { forwardRef } from 'react';
import { 
  ShieldCheck, 
  Trophy, 
  Target, 
  Clock, 
  Calendar, 
  Zap, 
  CheckCircle2, 
  Award,
  Activity,
  BarChart3,
  Users,
  Timer,
  Layers,
  FileText,
  AlertCircle
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
 * @fileOverview Official Institutional Scorecard v12.0.
 * HIERARCHY: Score (Massive) > Accuracy > Percentile > Rank (Secondary).
 * Size: 1080x1350 PNG optimized.
 */
const ShareableResultCard = forwardRef<HTMLDivElement, ShareableResultCardProps>(({ data, rank, totalCandidates }, ref) => {
  if (!data) return null;

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent('https://cracklix.in/results/view?id=' + data.mockId)}`;

  return (
    <div 
      ref={ref}
      id="cracklix-result-card-canvas"
      className="w-[1080px] h-[1350px] bg-white flex flex-col p-16 text-[#0F172A] font-body relative overflow-hidden"
      style={{ fontFamily: 'Inter, sans-serif' }}
    >
      {/* 1. PROFESSIONAL HEADER */}
      <div className="flex justify-between items-start mb-14 relative z-10">
         <div className="space-y-6">
            <img 
              src="/logo/cracklix-logo-dark.png" 
              alt="Cracklix" 
              className="h-[180px] w-auto object-contain -ml-4" 
            />
            <div className="flex items-center gap-4">
               <Badge className="bg-[#E6F9F3] text-[#10B981] border border-[#DCFCE7] px-6 py-2 rounded-full font-black text-sm uppercase tracking-widest flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5" /> Verified Result
               </Badge>
               <Badge className="bg-[#EBF2FF] text-[#2563EB] border border-[#DBEAFE] px-6 py-2 rounded-full font-black text-sm uppercase tracking-widest">
                  Attempt #{data.attemptCount || "1"}
               </Badge>
            </div>
         </div>
         <div className="text-right space-y-3">
            <div className="h-28 w-28 bg-slate-50 rounded-[2rem] border-4 border-white shadow-xl flex items-center justify-center mx-auto mb-4 overflow-hidden">
               <img src={`https://picsum.photos/seed/${data.userId}/112/112`} alt="candidate" />
            </div>
            <p className="text-3xl font-black tracking-tight uppercase">{data.userName}</p>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">{data.userEmail}</p>
         </div>
      </div>

      {/* 2. TEST CONTEXT HUB */}
      <div className="bg-[#F8FAFC] rounded-[2.5rem] p-10 border border-slate-100 mb-10 flex justify-between items-center relative overflow-hidden">
         <div className="absolute top-0 right-0 p-8 opacity-[0.03]"><Zap className="h-32 w-32" /></div>
         <div className="space-y-4 relative z-10">
            <h2 className="text-4xl font-black tracking-tight leading-tight uppercase text-[#0F172A]">{data.mockTitle}</h2>
            <div className="flex items-center gap-8">
               <div className="flex items-center gap-3 text-slate-500">
                  <Calendar className="h-6 w-6 text-[#2563EB]" />
                  <span className="text-xl font-bold uppercase">{new Date(data.timestamp).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
               </div>
               <div className="w-px h-8 bg-slate-200" />
               <div className="flex items-center gap-3 text-slate-500">
                  <Timer className="h-6 w-6 text-[#2563EB]" />
                  <span className="text-xl font-bold uppercase">{data.timeTaken ? `${Math.floor(data.timeTaken/60)}m ${data.timeTaken%60}s` : "---"}</span>
               </div>
            </div>
         </div>
      </div>

      {/* 3. PRIMARY PERFORMANCE MATRIX */}
      <div className="grid grid-cols-12 gap-8 mb-10">
         {/* HUGE SCORE HUB */}
         <div className="col-span-8 bg-[#10B981] rounded-[3rem] p-12 text-white shadow-2xl flex flex-col justify-center relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10"><Award className="h-40 w-40" /></div>
            <p className="text-xl font-black uppercase tracking-widest opacity-80 mb-4">Total Marks Scored</p>
            <div className="flex items-baseline gap-4">
               <span className="text-[180px] font-[900] leading-none tracking-tighter tabular-nums">{data.score}</span>
               <span className="text-4xl font-bold opacity-40">/ {data.totalQuestions}</span>
            </div>
            <div className="mt-8 flex items-center gap-4">
               <Badge className="bg-white/20 text-white border-none px-6 py-2 rounded-full font-black text-xl uppercase">Grade {data.grade || "A+"}</Badge>
               <span className="text-xl font-bold uppercase tracking-widest text-white/60">Institutional Verified</span>
            </div>
         </div>

         {/* SECONDARY HIGH-IMPACT NODES */}
         <div className="col-span-4 flex flex-col gap-8">
            <MetricBox label="Accuracy" val={`${data.attemptAccuracy}%`} icon={Target} color="text-[#2563EB]" bg="bg-[#EBF2FF]" />
            <MetricBox label="Percentile" val={`${Math.max(0, Math.round(((totalCandidates - Number(rank)) / (totalCandidates || 1)) * 100))}%`} icon={Activity} color="text-purple-600" bg="bg-purple-50" />
         </div>
      </div>

      {/* 4. PUNJAB RANK HUB - PROFESSIONAL SECONDARY NODE */}
      <div className="grid grid-cols-2 gap-8 mb-10">
         <Card className="border border-slate-100 shadow-xl rounded-[2.5rem] bg-white p-10 flex items-center justify-between group overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:rotate-12 transition-transform">
               <Trophy className="h-24 w-24" />
            </div>
            <div className="text-left space-y-2">
               <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Punjab State Rank</p>
               <div className="flex items-baseline gap-3">
                  <span className="text-7xl font-[900] text-[#2563EB] tracking-tighter leading-none">#{rank}</span>
                  <span className="text-xl font-bold text-slate-300">/ {totalCandidates} Candidates</span>
               </div>
            </div>
            <div className="h-16 w-16 rounded-[1.5rem] bg-blue-50 flex items-center justify-center text-[#2563EB] shadow-inner shrink-0">
               <Trophy className="h-10 w-10" />
            </div>
         </Card>
         <Card className="border border-slate-100 shadow-xl rounded-[2.5rem] bg-white p-10 flex items-center justify-between group">
            <div className="text-left space-y-3">
               <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Fidelity Status</p>
               <p className="text-4xl font-black text-emerald-600 uppercase tracking-tight leading-none">Qualified</p>
               <p className="text-[12px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-[#10B981]" /> Official Selection Norms
               </p>
            </div>
            <div className="h-16 w-16 rounded-[1.5rem] bg-emerald-50 flex items-center justify-center text-[#10B981] shadow-inner">
               <CheckCircle2 className="h-10 w-10" />
            </div>
         </Card>
      </div>

      {/* 5. QUESTION AUDIT LEDGER */}
      <div className="grid grid-cols-4 gap-6 mb-10">
         <AuditNode label="Correct" val={data.correctCount} color="text-emerald-500" />
         <AuditNode label="Wrong" val={data.wrongCount} color="text-rose-500" />
         <AuditNode label="Skipped" val={data.skippedCount} color="text-slate-400" />
         <AuditNode label="Accuracy" val={`${data.attemptAccuracy}%`} color="text-[#2563EB]" />
      </div>

      {/* 6. SUBJECT WISE PERFORMANCE HUB */}
      {data.subjectAnalysis?.length > 0 && (
        <div className="bg-slate-50/50 rounded-[2.5rem] p-10 border border-slate-100 mb-10">
           <div className="flex items-center gap-4 mb-8">
              <BarChart3 className="h-7 w-7 text-[#2563EB]" />
              <h3 className="text-2xl font-black uppercase text-[#0F172A] tracking-tight">Subject Mastery</h3>
           </div>
           <div className="grid grid-cols-2 gap-8">
              {data.subjectAnalysis.slice(0, 4).map((s: any, idx: number) => (
                 <div key={idx} className="flex justify-between items-center p-4 bg-white rounded-2xl shadow-sm border border-slate-50">
                    <span className="font-bold text-lg text-slate-600 uppercase truncate pr-4">{s.name}</span>
                    <span className="font-black text-xl text-[#0F172A] tabular-nums">{s.accuracy}%</span>
                 </div>
              ))}
           </div>
        </div>
      )}

      {/* 7. FOOTER AUDIT NODE */}
      <div className="mt-auto flex justify-between items-end border-t border-slate-100 pt-10">
         <div className="space-y-4 text-left">
            <p className="text-3xl font-black text-slate-300 uppercase tracking-[0.5em]">Official Record</p>
            <div className="flex items-center gap-4 text-slate-400">
               <ShieldCheck className="h-7 w-7 text-emerald-500" />
               <p className="text-xl font-bold tracking-tight uppercase">Authorized by Arsh Grewal Management Registry</p>
            </div>
         </div>
         <div className="flex items-center gap-10">
            <div className="text-right space-y-2">
               <p className="text-xl font-black text-[#2563EB] uppercase tracking-wider">Verify Result</p>
               <p className="text-sm font-mono text-slate-300">cracklix.in/verify/{data.attemptId}</p>
            </div>
            <div className="bg-white p-3 rounded-2xl border-4 border-slate-50 shadow-xl">
               <img src={qrUrl} alt="Verify" className="h-28 w-28" />
            </div>
         </div>
      </div>
    </div>
  );
});

ShareableResultCard.displayName = "ShareableResultCard";

function MetricBox({ label, val, icon: Icon, color, bg }: any) {
  return (
     <div className={cn("rounded-[2rem] p-10 shadow-lg flex flex-col items-center justify-center text-center flex-1 border border-slate-100", bg)}>
        <Icon className={cn("h-10 w-10 mb-5 opacity-40", color)} />
        <p className="text-sm font-black text-slate-400 uppercase tracking-widest mb-2">{label}</p>
        <span className={cn("text-[56px] font-[900] tabular-nums tracking-tighter leading-none", color)}>{val}</span>
     </div>
  )
}

function AuditNode({ label, val, color }: any) {
   return (
      <div className="bg-white border border-slate-100 rounded-3xl p-8 text-center shadow-md">
         <span className={cn("text-4xl font-[900] tabular-nums block mb-2", color)}>{val}</span>
         <span className="text-xs font-black text-slate-400 uppercase tracking-widest">{label}</span>
      </div>
   )
}

export default ShareableResultCard;
