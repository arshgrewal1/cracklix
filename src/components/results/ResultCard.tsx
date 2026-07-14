
'use client';

import React from 'react';
import { Trophy, Target, Zap, Clock, ShieldCheck, CheckCircle2, Award, Landmark, Crown, Medal } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

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
  percentile?: string | number;
  date: string;
}

/**
 * @fileOverview Institutional Performance Certificate v2.0.
 * Designed for High-Res Social Sharing (Instagram/WhatsApp 4:5).
 * Theme: Deep Navy (#071326) with Royal Blue (#1976FF) Accents.
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
  percentile,
  date
}: ResultCardProps) {
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent('https://cracklix.com/leaderboard')}`;

  return (
    <div 
      id="cracklix-result-card"
      className="w-[1080px] h-[1350px] bg-[#071326] text-white flex flex-col relative overflow-hidden"
      style={{ fontFamily: 'Inter, sans-serif' }}
    >
      {/* 1. ARCHITECTURAL DECORATION */}
      <div className="absolute top-0 right-0 w-[900px] h-[900px] bg-[#1976FF]/15 blur-[180px] rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-[700px] h-[700px] bg-emerald-500/10 blur-[150px] rounded-full translate-y-1/2 -translate-x-1/2" />
      
      {/* 2. INSTITUTIONAL HEADER */}
      <div className="relative z-10 px-20 pt-20 flex justify-between items-start">
         <div className="flex items-center gap-8">
            <div className="h-24 w-24 bg-gradient-to-br from-[#1976FF] to-blue-600 rounded-[2.5rem] flex items-center justify-center shadow-4xl border-4 border-white/10">
               <ShieldCheck className="h-14 w-14 text-white" />
            </div>
            <div className="space-y-1">
               <h1 className="text-6xl font-black tracking-tighter uppercase leading-none">Cracklix</h1>
               <div className="flex items-center gap-4">
                  <span className="text-xl font-bold text-[#1976FF] tracking-[0.5em] uppercase">Elite Portal</span>
                  <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
               </div>
            </div>
         </div>
         <div className="text-right space-y-2">
            <p className="text-slate-400 font-black uppercase tracking-[0.3em] text-sm">Official Mock Registry</p>
            <p className="text-3xl font-black tabular-nums">{date}</p>
         </div>
      </div>

      {/* 3. STUDENT IDENTITY HUB */}
      <div className="relative z-10 px-20 mt-24 flex items-center gap-10">
         <div className="h-32 w-32 bg-white/5 border-2 border-white/10 rounded-full flex items-center justify-center text-5xl font-black text-[#1976FF] shadow-2xl">
            {studentName?.[0]}
         </div>
         <div className="space-y-4">
            <p className="text-emerald-400 font-black uppercase tracking-[0.5em] text-xs flex items-center gap-3">
               <CheckCircle2 className="h-4 w-4" /> VERIFIED PERFORMANCE NODE
            </p>
            <h2 className="text-[80px] font-black tracking-tight leading-none text-white antialiased">{studentName}</h2>
         </div>
      </div>

      <div className="relative z-10 px-20 mt-12">
         <div className="inline-flex items-center gap-6 px-10 py-6 bg-white/5 border border-white/10 rounded-3xl backdrop-blur-2xl shadow-4xl">
            <Zap className="h-10 w-10 text-[#1976FF] fill-[#1976FF]" />
            <span className="text-4xl font-black tracking-tight uppercase text-slate-200">{examTitle}</span>
         </div>
      </div>

      {/* 4. PRIMARY METRIC MATRIX */}
      <div className="relative z-10 px-20 mt-16 grid grid-cols-3 gap-10">
         <MetricBox rank={1} label="State Rank" val={`#${rank}`} icon={<Trophy />} color="text-amber-400" />
         <MetricBox rank={2} label="Score Hub" val={score} icon={<Zap />} color="text-[#1976FF]" />
         <MetricBox rank={3} label="Accuracy" val={`${accuracy}%`} icon={<Target />} color="text-emerald-400" />
      </div>

      {/* 5. DATA LEDGER BAR */}
      <div className="relative z-10 px-20 mt-12">
         <div className="bg-[#101B32] border border-white/10 rounded-[3rem] p-12 flex items-center justify-between shadow-5xl backdrop-blur-xl">
            <DataNode label="Attempted" val={correct + wrong} color="text-white" />
            <div className="w-px h-16 bg-white/5" />
            <DataNode label="Correct Nodes" val={correct} color="text-emerald-400" />
            <div className="w-px h-16 bg-white/5" />
            <DataNode label="Wrong Nodes" val={wrong} color="text-rose-500" />
            <div className="w-px h-16 bg-white/5" />
            <DataNode label="Registry Time" val={timeTaken} color="text-amber-400" />
         </div>
      </div>

      {/* 6. BRANDED FOOTER HUB */}
      <div className="mt-auto bg-[#1976FF] py-14 px-20 flex items-center justify-between">
         <div className="space-y-4">
            <div className="flex items-center gap-4">
               <Crown className="h-8 w-8 text-white fill-white" />
               <p className="text-3xl font-black tracking-tight text-white uppercase antialiased">Prepare For Punjab Exams</p>
            </div>
            <p className="text-white/60 text-xl font-bold tracking-[0.2em] uppercase">Join 100,000+ Verified Aspirants</p>
         </div>
         <div className="flex items-center gap-8">
            <div className="text-right">
               <p className="text-white font-black text-2xl">WWW.CRACKLIX.COM</p>
               <p className="text-white/50 text-sm font-bold uppercase tracking-widest mt-1">Audit Protocol Verified</p>
            </div>
            <div className="bg-white p-4 rounded-3xl shadow-5xl border-4 border-white/20">
               <img src={qrUrl} alt="Registry Link" className="h-28 w-28" />
            </div>
         </div>
      </div>

      {/* Watermark Logo Corner */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.03] scale-[4]">
         <Landmark className="h-96 w-96" />
      </div>
    </div>
  );
}

function MetricBox({ label, val, icon, color }: any) {
   return (
      <div className="bg-white/5 border border-white/10 rounded-[3rem] p-12 backdrop-blur-xl shadow-4xl flex flex-col items-center justify-center text-center space-y-6">
         <div className={cn("h-20 w-20 bg-white/5 rounded-3xl flex items-center justify-center", color)}>
            {React.cloneElement(icon as React.ReactElement, { className: "h-10 w-10" })}
         </div>
         <div className="space-y-1">
            <p className="text-slate-400 font-black uppercase tracking-[0.4em] text-xs">{label}</p>
            <p className={cn("text-7xl font-black tracking-tighter tabular-nums", color)}>{val}</p>
         </div>
      </div>
   )
}

function DataNode({ label, val, color }: any) {
   return (
      <div className="text-center space-y-2">
         <p className="text-slate-500 font-black uppercase tracking-widest text-[10px]">{label}</p>
         <p className={cn("text-4xl font-black tabular-nums", color)}>{val}</p>
      </div>
   )
}
