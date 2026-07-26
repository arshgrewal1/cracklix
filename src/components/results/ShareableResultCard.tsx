
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
 * @fileOverview Official Institutional Scorecard v16.0 [FIXED Activity Reference].
 * HIERARCHY: Score Card (Blue) > Accuracy Card (White) > Rank Hub.
 * Size: 1080x1350 optimized for Social Sharing.
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
      <div className="absolute top-[-100px] right-[-100px] opacity-[0.03] pointer-events-none">
         <Trophy className="w-[400px] h-[400px]" />
      </div>

      {/* 1. PROFESSIONAL HEADER */}
      <div className="flex justify-between items-start mb-10 relative z-10">
         <div className="space-y-12">
            <div className="flex flex-col gap-2">
               <img 
                 src="/logo/cracklix-logo-dark.png" 
                 alt="Cracklix" 
                 className="h-[120px] w-auto object-contain -ml-6" 
               />
            </div>
            
            <div className="flex items-center gap-3 px-6 py-2.5 bg-[#E6F9F3] text-[#10B981] rounded-full w-fit border border-[#DCFCE7] shadow-sm">
               <ShieldCheck className="h-5 w-5" />
               <span className="font-black text-sm uppercase tracking-widest">Verified Result</span>
            </div>
         </div>

         <div className="text-right space-y-4 pt-4">
            <div className="relative inline-block">
               <div className="h-28 w-28 rounded-[1.5rem] bg-slate-100 overflow-hidden shadow-2xl border-4 border-white">
                  <img src={`https://picsum.photos/seed/${data.userId}/200/200`} alt="Profile" className="h-full w-full object-cover" />
               </div>
            </div>
            <div className="space-y-1">
               <h2 className="text-[44px] font-[900] tracking-tight uppercase leading-none">{data.userName || "Aspirant"}</h2>
               <p className="text-lg font-bold text-slate-400 uppercase tracking-widest">{data.userEmail}</p>
            </div>
         </div>
      </div>

      {/* 2. TEST TITLE & CONTEXT */}
      <div className="space-y-8 mb-10 text-left">
         <h1 className="text-[64px] font-[900] tracking-tighter leading-tight uppercase text-[#0F172A] antialiased">
            {data.mockTitle}
         </h1>

         <div className="flex items-center gap-12 pt-4 border-t border-slate-50">
            <HeaderMetric icon={Zap} label="Attempt No" val={data.attemptCount || "01"} />
            <div className="w-px h-10 bg-slate-100" />
            <HeaderMetric icon={Calendar} label="Exam Date" val={new Date(data.timestamp).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })} />
            <div className="w-px h-10 bg-slate-100" />
            <HeaderMetric icon={Timer} label="Time Taken" val={data.timeTaken ? `${Math.floor(data.timeTaken/60)}m ${data.timeTaken%60}s` : "---"} />
         </div>
      </div>

      {/* 3. PRIMARY SCORE HUB - BLUE & WHITE CARD SPLIT */}
      <div className="grid grid-cols-12 gap-8 mb-10">
         {/* THE BLUE SCORE CARD */}
         <div className="col-span-8 bg-[#2563EB] rounded-[3rem] p-12 text-white shadow-2xl relative overflow-hidden flex flex-col justify-center min-h-[360px]">
            <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12">
               <Medal className="h-48 w-48" />
            </div>
            <p className="text-xl font-black uppercase tracking-[0.4em] opacity-70 mb-6">Net Result Score</p>
            <div className="flex items-baseline gap-4 relative z-10">
               <span className="text-[200px] font-[900] leading-[0.8] tracking-tighter tabular-nums">{data.score}</span>
               <span className="text-4xl font-bold opacity-30">/ {data.totalQuestions}</span>
            </div>
         </div>

         {/* THE WHITE ACCURACY CARD */}
         <div className="col-span-4 bg-white border border-slate-100 rounded-[3rem] p-10 flex flex-col items-center justify-center text-center shadow-xl">
            <div className="h-16 w-16 bg-[#EBF2FF] rounded-2xl flex items-center justify-center text-[#2563EB] mb-6">
               <Target className="h-8 w-8" />
            </div>
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Accuracy</p>
            <span className="text-6xl font-[900] text-[#10B981] tabular-nums tracking-tighter">{data.attemptAccuracy}%</span>
         </div>
      </div>

      {/* 4. PUNJAB RANK & PERCENTILE ROW */}
      <div className="grid grid-cols-2 gap-8 mb-10">
         <Card className="border-none shadow-xl rounded-[2.5rem] bg-white border border-slate-50 p-10 flex items-center justify-between group overflow-hidden">
            <div className="text-left space-y-1 relative z-10">
               <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Punjab State Rank</p>
               <div className="flex items-baseline gap-3">
                  <span className="text-7xl font-[900] text-[#2563EB] tracking-tighter leading-none">#{rank}</span>
                  <span className="text-xl font-bold text-slate-300">/ {totalCandidates}</span>
               </div>
            </div>
            <div className="h-16 w-16 rounded-[1.5rem] bg-amber-50 flex items-center justify-center text-amber-500 shadow-inner shrink-0 relative z-10">
               <Trophy className="h-10 w-10" />
            </div>
         </Card>

         <Card className="border-none shadow-xl rounded-[2.5rem] bg-white border border-slate-50 p-10 flex items-center justify-between group overflow-hidden">
            <div className="text-left space-y-1 relative z-10">
               <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Platform Percentile</p>
               <span className="text-7xl font-[900] text-purple-600 tracking-tighter leading-none">
                  {Math.max(0, Math.round(((totalCandidates - Number(rank)) / (totalCandidates || 1)) * 100))}%
               </span>
            </div>
            <div className="h-16 w-16 rounded-[1.5rem] bg-purple-50 flex items-center justify-center text-purple-600 shadow-inner shrink-0 relative z-10">
               <Activity className="h-10 w-10" />
            </div>
         </Card>
      </div>

      {/* 5. QUESTION ANALYSIS MATRIX */}
      <div className="grid grid-cols-4 gap-6 mb-10">
         <StatNode label="Correct" val={data.correctCount} color="text-emerald-500" />
         <StatNode label="Wrong" val={data.wrongCount} color="text-rose-500" />
         <StatNode label="Skipped" val={data.skippedCount} color="text-slate-400" />
         <StatNode label="Total Qs" val={data.totalQuestions} color="text-primary" />
      </div>

      {/* 6. FOOTER AUDIT HUB */}
      <div className="mt-auto border-t border-slate-100 pt-10 flex justify-between items-end">
         <div className="space-y-4 text-left">
            <p className="text-4xl font-black text-slate-200 uppercase tracking-[0.4em]">Official Record</p>
            <div className="flex items-center gap-4 text-slate-400">
               <ShieldCheck className="h-6 w-6 text-emerald-500" />
               <p className="text-lg font-bold uppercase tracking-tight">Authorized by Arsh Grewal Management Registry</p>
            </div>
         </div>
         <div className="flex items-center gap-10">
            <div className="text-right space-y-1">
               <p className="text-xl font-black text-[#2563EB] uppercase tracking-wider">Verify Result</p>
               <p className="text-xs font-mono text-slate-300">cracklix.in/verify/{data.attemptId}</p>
            </div>
            <div className="bg-white p-3 rounded-[1.5rem] border-4 border-slate-50 shadow-xl">
               <img src={qrUrl} alt="Verify QR" className="h-28 w-28" />
            </div>
         </div>
      </div>
    </div>
  );
});

ShareableResultCard.displayName = "ShareableResultCard";

function HeaderMetric({ icon: Icon, label, val }: any) {
  return (
    <div className="flex items-center gap-4">
       <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center text-primary shadow-inner">
          <Icon className="h-5 w-5" />
       </div>
       <div className="text-left space-y-0.5">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
          <p className="text-xl font-black text-[#0F172A] tabular-nums">{val}</p>
       </div>
    </div>
  )
}

function StatNode({ label, val, color }: any) {
  return (
     <div className="bg-white border border-slate-100 rounded-[1.5rem] p-8 text-center shadow-md flex flex-col justify-center gap-1">
        <span className={cn("text-5xl font-[900] tabular-nums", color)}>{val}</span>
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</span>
     </div>
  )
}

export default ShareableResultCard;
