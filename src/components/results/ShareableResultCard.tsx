
'use client';

import React from 'react';
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
  Users
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';

interface ShareableResultCardProps {
  data: any;
  rank: number | string;
  totalCandidates: number;
}

/**
 * @fileOverview Institutional Scorecard Node v9.0.
 * Strictly follows the "Official Exam Report" design language.
 * Dimensions: 1080x1350 for Ultra-HD Social Sharing.
 */
export default function ShareableResultCard({ data, rank, totalCandidates }: ShareableResultCardProps) {
  if (!data) return null;

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent('https://cracklix.in/results/view?id=' + data.mockId)}`;

  return (
    <div 
      id="cracklix-result-card-canvas"
      className="w-[1080px] h-[1350px] bg-white flex flex-col p-16 text-[#0F172A] font-body relative overflow-hidden"
      style={{ fontFamily: 'Inter, sans-serif' }}
    >
      {/* 1. INSTITUTIONAL HEADER */}
      <div className="flex justify-between items-start mb-16 relative z-10">
         <div className="space-y-8">
            <img 
              src="/logo/cracklix-logo-dark.png" 
              alt="Cracklix" 
              className="h-[140px] w-auto object-contain -ml-4" 
            />
            <div className="flex items-center gap-4">
               <Badge className="bg-emerald-50 text-emerald-600 border border-emerald-100 px-6 py-2 rounded-full font-black text-sm uppercase tracking-widest flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4" /> Verified Result
               </Badge>
            </div>
         </div>
         <div className="text-right space-y-3">
            <div className="h-28 w-28 bg-slate-50 rounded-[2rem] border-4 border-white shadow-xl flex items-center justify-center mx-auto mb-4 overflow-hidden">
               <img src={`https://picsum.photos/seed/${data.userId}/112/112`} alt="user" />
            </div>
            <p className="text-3xl font-black tracking-tight">{data.userName}</p>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">{data.userEmail}</p>
         </div>
      </div>

      {/* 2. TEST IDENTITY NODE */}
      <div className="bg-slate-50/50 rounded-[2.5rem] p-10 border border-slate-100 mb-12 flex justify-between items-center relative overflow-hidden">
         <div className="absolute top-0 right-0 p-8 opacity-5"><Zap className="h-32 w-32" /></div>
         <div className="space-y-4 relative z-10">
            <h2 className="text-4xl font-black tracking-tight leading-tight uppercase text-[#0F172A]">{data.mockTitle}</h2>
            <div className="flex items-center gap-8">
               <DetailNode icon={Zap} label="Attempt No" val="01" />
               <div className="w-px h-8 bg-slate-200" />
               <DetailNode icon={Calendar} label="Date" val={new Date(data.timestamp).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })} />
               <div className="w-px h-8 bg-slate-200" />
               <DetailNode icon={Clock} label="Time Taken" val="25:40" />
            </div>
         </div>
      </div>

      {/* 3. PRIMARY METRIC MATRIX (THE SCORE HUB) */}
      <div className="grid grid-cols-12 gap-8 mb-12">
         {/* MAIN SCORE HUB - LARGEST ELEMENT */}
         <div className="col-span-8 bg-[#2563EB] rounded-[3rem] p-12 text-white shadow-2xl flex flex-col justify-center relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10"><Award className="h-40 w-40" /></div>
            <p className="text-xl font-bold uppercase tracking-widest opacity-80 mb-4">Net Result Score</p>
            <div className="flex items-baseline gap-4">
               <span className="text-[160px] font-[900] leading-none tracking-tighter tabular-nums">{data.score}</span>
               <span className="text-4xl font-bold opacity-40">/ {data.totalQuestions}</span>
            </div>
            <div className="mt-8 flex items-center gap-4">
               <Badge className="bg-white/20 text-white border-none px-5 py-2 rounded-full font-black text-lg">Grade {data.grade || "A+"}</Badge>
               <span className="text-xl font-bold uppercase tracking-widest text-white/60">Verified performance</span>
            </div>
         </div>

         {/* SECONDARY METRICS COLUMN */}
         <div className="col-span-4 flex flex-col gap-8">
            <MetricCard label="Accuracy" val={`${data.attemptAccuracy}%`} icon={Target} color="text-emerald-500" />
            <MetricCard label="Percentile" val="--" icon={Activity} color="text-blue-500" />
         </div>
      </div>

      {/* 4. PUNJAB RANK NODE - PROFESSIONAL SECONDARY CARD */}
      <div className="grid grid-cols-2 gap-8 mb-12">
         <Card className="border border-slate-100 shadow-xl rounded-[2.5rem] bg-white p-8 flex items-center justify-between group overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:rotate-12 transition-transform">
               <Trophy className="h-20 w-20" />
            </div>
            <div className="text-left space-y-1">
               <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Punjab State Rank</p>
               <div className="flex items-baseline gap-2">
                  <span className="text-6xl font-black text-[#2563EB]">#{rank}</span>
                  <span className="text-lg font-bold text-slate-300">/ {totalCandidates} Candidates</span>
               </div>
            </div>
            <div className="h-14 w-14 rounded-2xl bg-blue-50 flex items-center justify-center text-primary shadow-inner shrink-0">
               <Trophy className="h-8 w-8" />
            </div>
         </Card>
         <Card className="border border-slate-100 shadow-xl rounded-[2.5rem] bg-white p-8 flex items-center justify-between group">
            <div className="text-left space-y-2">
               <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Success Probability</p>
               <p className="text-3xl font-black text-emerald-600 uppercase tracking-tight">Highly Likely</p>
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <ShieldCheck className="h-3 w-3 text-emerald-500" /> Pattern Match 100%
               </p>
            </div>
            <div className="h-14 w-14 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 shadow-inner">
               <CheckCircle2 className="h-8 w-8" />
            </div>
         </Card>
      </div>

      {/* 5. QUESTION AUDIT ROW */}
      <div className="grid grid-cols-4 gap-6 mb-12">
         <AuditPill label="Correct" val={data.correctCount} color="text-emerald-500" />
         <AuditPill label="Wrong" val={data.wrongCount} color="text-rose-500" />
         <AuditPill label="Skipped" val={data.skippedCount} color="text-slate-400" />
         <AuditPill label="Accuracy" val={`${data.attemptAccuracy}%`} color="text-primary" />
      </div>

      {/* 6. FOOTER VERIFICATION */}
      <div className="mt-auto flex justify-between items-end border-t border-slate-100 pt-10">
         <div className="space-y-3">
            <p className="text-2xl font-black text-slate-300 uppercase tracking-[0.4em]">Official Scorecard</p>
            <div className="flex items-center gap-4 text-slate-400">
               <ShieldCheck className="h-6 w-6 text-emerald-500" />
               <p className="text-xl font-bold tracking-tight">Verified by Arsh Grewal Management Registry</p>
            </div>
         </div>
         <div className="flex items-center gap-8">
            <div className="text-right space-y-1">
               <p className="text-lg font-black text-primary uppercase">Verify Result</p>
               <p className="text-sm font-mono text-slate-300">cracklix.in/verify/{data.attemptId}</p>
            </div>
            <div className="bg-white p-2 rounded-2xl border-4 border-slate-50 shadow-xl">
               <img src={qrUrl} alt="Verification" className="h-24 w-24" />
            </div>
         </div>
      </div>
    </div>
  );
}

function DetailNode({ icon: Icon, label, val }: any) {
  return (
    <div className="flex flex-col gap-0.5">
       <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{label}</span>
       <p className="text-xl font-bold text-[#0F172A] flex items-center gap-2">
          <Icon className="h-4 w-4 text-primary" /> {val}
       </p>
    </div>
  )
}

function MetricCard({ label, val, icon: Icon, color }: any) {
  return (
     <div className="bg-white border border-slate-100 rounded-[2rem] p-8 shadow-sm flex flex-col items-center justify-center text-center flex-1">
        <Icon className={cn("h-8 w-8 mb-4 opacity-40", color)} />
        <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
        <span className={cn("text-4xl font-[900] tabular-nums tracking-tighter leading-none", color)}>{val}</span>
     </div>
  )
}

function AuditPill({ label, val, color }: any) {
   return (
      <div className="bg-white border border-slate-100 rounded-2xl p-6 text-center shadow-sm">
         <span className={cn("text-3xl font-black tabular-nums block mb-1", color)}>{val}</span>
         <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</span>
      </div>
   )
}
