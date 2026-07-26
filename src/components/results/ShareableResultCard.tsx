
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
  Timer,
  BookOpen,
  FileText,
  BarChart3,
  Medal,
  Users,
  Activity
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
 * @fileOverview Official Institutional Scorecard v18.0 [REBUILT FROM SCREENSHOT].
 * FIXED: All missing icons (Activity, etc.) and components (Card, Badge) imported.
 * HIERARCHY: Big Score Hub (Blue) > Accuracy Card (White) > Rank/Percentile Nodes.
 * Optimized for Social Sharing (1080x1350).
 */
const ShareableResultCard = forwardRef<HTMLDivElement, ShareableResultCardProps>(({ data, rank, totalCandidates }, ref) => {
  if (!data) return null;

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent('https://cracklix.in/results/view?id=' + data.mockId)}`;

  return (
    <div 
      ref={ref}
      id="cracklix-result-card-canvas"
      className="w-[1080px] h-[1350px] bg-white flex flex-col p-16 text-[#0F172A] font-body relative overflow-hidden"
      style={{ fontFamily: 'Poppins, sans-serif' }}
    >
      {/* BACKGROUND DECORATIVE NODES */}
      <div className="absolute top-[-100px] right-[-100px] opacity-[0.02] pointer-events-none">
         <Trophy className="w-[500px] h-[500px]" />
      </div>

      {/* 1. PROFESSIONAL HEADER */}
      <div className="flex justify-between items-start mb-14 relative z-10">
         <div className="space-y-12">
            <div className="flex flex-col gap-2">
               <img 
                 src="/logo/cracklix-logo-dark.png" 
                 alt="Cracklix" 
                 className="h-[140px] w-auto object-contain -ml-8" 
               />
            </div>
            
            <div className="flex items-center gap-3 px-8 py-3.5 bg-[#E6F9F3] text-[#10B981] rounded-full w-fit border border-[#DCFCE7] shadow-sm">
               <ShieldCheck className="h-6 w-6" />
               <span className="font-black text-lg uppercase tracking-widest">Verified Result</span>
            </div>
         </div>

         <div className="text-right space-y-6 pt-6">
            <div className="relative inline-block">
               <div className="h-32 w-32 rounded-[2rem] bg-slate-100 overflow-hidden shadow-2xl border-[6px] border-white">
                  <img src={`https://picsum.photos/seed/${data.userId}/200/200`} alt="Profile" className="h-full w-full object-cover" />
               </div>
            </div>
            <div className="space-y-2">
               <h2 className="text-[52px] font-[900] tracking-tight uppercase leading-none">{data.userName || "Aspirant"}</h2>
               <p className="text-xl font-bold text-slate-400 uppercase tracking-widest">{data.userEmail}</p>
            </div>
         </div>
      </div>

      {/* 2. TEST TITLE & CONTEXT */}
      <div className="space-y-10 mb-12 text-left">
         <h1 className="text-[72px] font-[900] tracking-tighter leading-tight uppercase text-[#0F172A] antialiased">
            {data.mockTitle}
         </h1>

         <div className="flex items-center gap-14 pt-6 border-t border-slate-50">
            <HeaderMetric icon={Zap} label="Attempt No" val={data.attemptCount || "01"} />
            <div className="w-px h-12 bg-slate-100" />
            <HeaderMetric icon={Calendar} label="Exam Date" val={new Date(data.timestamp).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })} />
            <div className="w-px h-12 bg-slate-100" />
            <HeaderMetric icon={Timer} label="Time Taken" val={data.timeTaken ? `${Math.floor(data.timeTaken/60)}m ${data.timeTaken%60}s` : "---"} />
         </div>
      </div>

      {/* 3. PRIMARY SCORE HUB - BLUE & WHITE CARD SPLIT */}
      <div className="grid grid-cols-12 gap-10 mb-12">
         {/* THE BLUE SCORE CARD */}
         <div className="col-span-8 bg-[#2563EB] rounded-[4rem] p-16 text-white shadow-2xl relative overflow-hidden flex flex-col justify-center min-h-[420px]">
            <div className="absolute top-0 right-0 p-12 opacity-10 rotate-12">
               <Medal className="h-64 w-64" />
            </div>
            <p className="text-2xl font-black uppercase tracking-[0.4em] opacity-70 mb-10">Net Result Score</p>
            <div className="flex items-baseline gap-6 relative z-10">
               <span className="text-[250px] font-[900] leading-[0.8] tracking-tighter tabular-nums">{data.score}</span>
               <span className="text-5xl font-bold opacity-30">/ {data.totalQuestions}</span>
            </div>
         </div>

         {/* THE WHITE ACCURACY CARD */}
         <div className="col-span-4 bg-white border border-slate-100 rounded-[4rem] p-12 flex flex-col items-center justify-center text-center shadow-2xl">
            <div className="h-20 w-20 bg-[#EBF2FF] rounded-3xl flex items-center justify-center text-[#2563EB] mb-8">
               <Target className="h-10 w-10" />
            </div>
            <p className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4">Accuracy</p>
            <span className="text-8xl font-[900] text-[#10B981] tabular-nums tracking-tighter">{data.attemptAccuracy}%</span>
         </div>
      </div>

      {/* 4. PUNJAB RANK & PERCENTILE ROW */}
      <div className="grid grid-cols-2 gap-10 mb-12">
         <Card className="border-none shadow-2xl rounded-[3rem] bg-white border border-slate-50 p-12 flex items-center justify-between group overflow-hidden">
            <div className="text-left space-y-2 relative z-10">
               <p className="text-sm font-black text-slate-400 uppercase tracking-widest">Punjab State Rank</p>
               <div className="flex items-baseline gap-4">
                  <span className="text-8xl font-[900] text-[#2563EB] tracking-tighter leading-none">#{rank}</span>
                  <span className="text-2xl font-bold text-slate-300">/ {totalCandidates}</span>
               </div>
            </div>
            <div className="h-20 w-20 rounded-[2rem] bg-amber-50 flex items-center justify-center text-amber-500 shadow-inner shrink-0 relative z-10">
               <Trophy className="h-12 w-12" />
            </div>
         </Card>

         <Card className="border-none shadow-2xl rounded-[3rem] bg-white border border-slate-50 p-12 flex items-center justify-between group overflow-hidden">
            <div className="text-left space-y-2 relative z-10">
               <p className="text-sm font-black text-slate-400 uppercase tracking-widest">Platform Percentile</p>
               <span className="text-8xl font-[900] text-purple-600 tracking-tighter leading-none">
                  {Math.max(0, Math.round(((totalCandidates - Number(rank)) / (totalCandidates || 1)) * 100))}%
               </span>
            </div>
            <div className="h-20 w-20 rounded-[2rem] bg-purple-50 flex items-center justify-center text-purple-600 shadow-inner shrink-0 relative z-10">
               <Activity className="h-12 w-12" />
            </div>
         </Card>
      </div>

      {/* 5. QUESTION ANALYSIS MATRIX */}
      <div className="grid grid-cols-4 gap-8 mb-12">
         <StatNode label="Correct" val={data.correctCount} color="text-emerald-500" />
         <StatNode label="Wrong" val={data.wrongCount} color="text-rose-500" />
         <StatNode label="Skipped" val={data.skippedCount} color="text-slate-400" />
         <StatNode label="Total Qs" val={data.totalQuestions} color="text-primary" />
      </div>

      {/* 6. FOOTER AUDIT HUB */}
      <div className="mt-auto border-t border-slate-100 pt-12 flex justify-between items-end">
         <div className="space-y-6 text-left">
            <p className="text-[10px] md:text-sm font-black text-slate-300 uppercase tracking-[0.5em]">Institutional Record Hub</p>
            <div className="flex items-center gap-4 text-slate-400">
               <ShieldCheck className="h-8 w-8 text-emerald-500" />
               <p className="text-xl font-bold uppercase tracking-tight">Authorized by Arsh Grewal Management Registry</p>
            </div>
         </div>
         <div className="flex items-center gap-12">
            <div className="text-right space-y-2">
               <p className="text-2xl font-black text-[#2563EB] uppercase tracking-wider">Verify Result</p>
               <p className="text-sm font-mono text-slate-300">cracklix.in/verify/{data.attemptId}</p>
            </div>
            <div className="bg-white p-4 rounded-[2rem] border-[6px] border-slate-50 shadow-2xl">
               <img src={qrUrl} alt="Verify QR" className="h-32 w-32" />
            </div>
         </div>
      </div>
    </div>
  );
});

ShareableResultCard.displayName = "ShareableResultCard";

function HeaderMetric({ icon: Icon, label, val }: any) {
  return (
    <div className="flex items-center gap-5">
       <div className="h-12 w-12 rounded-2xl bg-slate-50 flex items-center justify-center text-primary shadow-inner">
          <Icon className="h-6 w-6" />
       </div>
       <div className="text-left space-y-1">
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest">{label}</p>
          <p className="text-2xl font-black text-[#0F172A] tabular-nums">{val}</p>
       </div>
    </div>
  )
}

function StatNode({ label, val, color }: any) {
  return (
     <div className="bg-white border border-slate-100 rounded-[2.5rem] p-10 text-center shadow-xl flex flex-col justify-center gap-2">
        <span className={cn("text-6xl font-[900] tabular-nums", color)}>{val}</span>
        <span className="text-xs font-black text-slate-400 uppercase tracking-widest">{label}</span>
     </div>
  )
}

export default ShareableResultCard;
