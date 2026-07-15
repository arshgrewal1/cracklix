'use client';

import React from 'react';
import { Trophy, Target, Zap, Clock, ShieldCheck, CheckCircle2, Award, Landmark, Crown, Medal } from 'lucide-react';
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
 * @fileOverview Institutional Performance Certificate v3.0.
 * REDESIGNED: Premium White Hub style inspired by Testbook.
 * Theme: Pure White (#FFFFFF) with Royal Blue (#2563EB) Accents.
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
  date
}: ResultCardProps) {
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent('https://cracklix.com/leaderboard')}`;

  return (
    <div 
      id="cracklix-result-card"
      className="w-[1080px] h-[1350px] bg-white text-[#0F172A] flex flex-col relative overflow-hidden"
      style={{ fontFamily: 'Inter, sans-serif' }}
    >
      {/* 1. ARCHITECTURAL DECORATION */}
      <div className="absolute top-0 right-0 w-[900px] h-[900px] bg-[#2563EB]/5 blur-[150px] rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-[700px] h-[700px] bg-emerald-500/5 blur-[120px] rounded-full translate-y-1/2 -translate-x-1/2" />
      
      {/* 2. INSTITUTIONAL HEADER */}
      <div className="relative z-10 px-20 pt-20 flex justify-between items-center">
         <div className="flex items-center gap-8">
            <div className="h-20 w-20 bg-[#2563EB] rounded-2xl flex items-center justify-center shadow-xl">
               <ShieldCheck className="h-12 w-14 text-white" />
            </div>
            <div className="space-y-1">
               <h1 className="text-5xl font-black tracking-tighter uppercase leading-none text-[#0F172A]">Cracklix</h1>
               <p className="text-sm font-bold text-primary tracking-[0.4em] uppercase">Official Result Node</p>
            </div>
         </div>
         <div className="text-right space-y-1">
            <p className="text-slate-400 font-black uppercase tracking-[0.2em] text-xs">Registry Date</p>
            <p className="text-2xl font-black tabular-nums text-[#0F172A]">{date}</p>
         </div>
      </div>

      {/* 3. STUDENT IDENTITY HUB */}
      <div className="relative z-10 px-20 mt-20 flex flex-col items-center text-center space-y-6">
         <div className="h-40 w-40 bg-slate-50 border-4 border-white shadow-2xl rounded-full flex items-center justify-center text-6xl font-black text-primary">
            {studentName?.[0]}
         </div>
         <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-6 py-2 bg-emerald-50 text-emerald-600 rounded-full font-black text-xs uppercase tracking-widest border border-emerald-100">
               <CheckCircle2 className="h-4 w-4" /> Performance Verified
            </div>
            <h2 className="text-[72px] font-black tracking-tight text-[#0F172A] leading-none">{studentName}</h2>
         </div>
      </div>

      {/* 4. EXAM TITLE HUB */}
      <div className="relative z-10 px-20 mt-12 flex justify-center">
         <div className="inline-flex items-center gap-6 px-12 py-6 bg-slate-50 border border-slate-100 rounded-[2rem] shadow-sm">
            <Zap className="h-8 w-8 text-primary fill-primary" />
            <span className="text-3xl font-black uppercase tracking-tight text-[#0F172A]">{examTitle}</span>
         </div>
      </div>

      {/* 5. METRIC MATRIX */}
      <div className="relative z-10 px-20 mt-16 grid grid-cols-3 gap-10">
         <MetricBox label="State Rank" val={`#${rank}`} icon={<Trophy />} color="text-amber-500" bg="bg-amber-50" />
         <MetricBox label="Final Score" val={score} icon={<Zap />} color="text-primary" bg="bg-blue-50" />
         <MetricBox label="Accuracy" val={`${accuracy}%`} icon={<Target />} color="text-emerald-500" bg="bg-emerald-50" />
      </div>

      {/* 6. DATA LEDGER */}
      <div className="relative z-10 px-20 mt-12">
         <div className="bg-white border-2 border-slate-50 rounded-[3rem] p-12 flex items-center justify-between shadow-xl">
            <DataNode label="Attempted" val={correct + wrong} color="text-[#0F172A]" />
            <div className="w-px h-16 bg-slate-100" />
            <DataNode label="Correct" val={correct} color="text-emerald-500" />
            <div className="w-px h-16 bg-slate-100" />
            <DataNode label="Incorrect" val={wrong} color="text-rose-500" />
            <div className="w-px h-16 bg-slate-100" />
            <DataNode label="Registry Time" val={timeTaken} color="text-slate-400" />
         </div>
      </div>

      {/* 7. BRANDED FOOTER HUB */}
      <div className="mt-auto bg-[#0F172A] py-14 px-20 flex items-center justify-between">
         <div className="space-y-4 text-left">
            <div className="flex items-center gap-4">
               <Crown className="h-8 w-8 text-primary fill-primary" />
               <p className="text-3xl font-black tracking-tight text-white uppercase">Crack Punjab Government Exams</p>
            </div>
            <p className="text-slate-500 text-xl font-bold tracking-[0.1em] uppercase">Join 100,000+ Verified Aspirants Daily</p>
         </div>
         <div className="flex items-center gap-10">
            <div className="text-right space-y-1">
               <p className="text-white font-black text-2xl uppercase">WWW.CRACKLIX.COM</p>
               <p className="text-primary font-bold text-sm uppercase tracking-widest">Audit Protocol Level 4.0</p>
            </div>
            <div className="bg-white p-4 rounded-3xl shadow-5xl border-4 border-white/10">
               <img src={qrUrl} alt="Portal Registry" className="h-24 w-24" />
            </div>
         </div>
      </div>

      {/* Subtle Background Watermark */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.02] scale-[5] pointer-events-none">
         <Landmark className="h-96 w-96" />
      </div>
    </div>
  );
}

function MetricBox({ label, val, icon, color, bg }: any) {
   return (
      <div className="bg-white border-2 border-slate-50 rounded-[3rem] p-12 shadow-lg flex flex-col items-center justify-center text-center space-y-6">
         <div className={cn("h-20 w-20 rounded-3xl flex items-center justify-center shadow-inner", bg, color)}>
            {React.cloneElement(icon as React.ReactElement, { className: "h-10 w-10" })}
         </div>
         <div className="space-y-1">
            <p className="text-slate-400 font-black uppercase tracking-[0.4em] text-[10px]">{label}</p>
            <p className={cn("text-7xl font-black tracking-tighter tabular-nums", color)}>{val}</p>
         </div>
      </div>
   )
}

function DataNode({ label, val, color }: any) {
   return (
      <div className="text-center space-y-2">
         <p className="text-slate-400 font-black uppercase tracking-widest text-xs">{label}</p>
         <p className={cn("text-4xl font-black tabular-nums", color)}>{val}</p>
      </div>
   )
}
