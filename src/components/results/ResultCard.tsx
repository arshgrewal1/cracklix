
'use client';

import React from 'react';
import { Trophy, Target, Zap, Clock, ShieldCheck, CheckCircle2, XCircle } from 'lucide-react';
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
 * @fileOverview Official Shareable Result Card v1.0.
 * Designed for 1080x1350 (4:5) export.
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
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent('https://cracklix.com')}`;

  return (
    <div 
      id="cracklix-result-card"
      className="w-[1080px] h-[1350px] bg-[#020617] text-white flex flex-col relative overflow-hidden"
      style={{ fontFamily: 'Inter, sans-serif' }}
    >
      {/* Decorative Background */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/10 blur-[150px] rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-600/5 blur-[120px] rounded-full translate-y-1/2 -translate-x-1/2" />
      
      {/* 1. Header Bar */}
      <div className="relative z-10 px-16 pt-16 flex justify-between items-start">
         <div className="flex items-center gap-6">
            <div className="h-20 w-20 bg-primary rounded-3xl flex items-center justify-center shadow-2xl">
               <ShieldCheck className="h-12 w-12 text-white" />
            </div>
            <div>
               <h1 className="text-5xl font-black tracking-tighter uppercase leading-none">Cracklix</h1>
               <p className="text-xl font-bold text-primary tracking-[0.4em] uppercase mt-2">Elite Portal</p>
            </div>
         </div>
         <div className="text-right">
            <p className="text-slate-400 font-bold text-sm uppercase tracking-widest">Mock Test Result</p>
            <p className="text-2xl font-black mt-1 tabular-nums">{date}</p>
         </div>
      </div>

      {/* 2. Identity Hub */}
      <div className="relative z-10 px-16 mt-20 space-y-6">
         <div className="space-y-2">
            <p className="text-primary font-black uppercase tracking-[0.5em] text-xs">ASPIRANT IDENTITY</p>
            <h2 className="text-7xl font-black tracking-tight leading-none">{studentName}</h2>
         </div>
         <div className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-2xl px-6 py-4 w-fit backdrop-blur-md">
            <Zap className="h-6 w-6 text-primary fill-primary" />
            <span className="text-2xl font-bold tracking-tight uppercase">{examTitle}</span>
         </div>
      </div>

      {/* 3. Primary Stats Matrix */}
      <div className="relative z-10 px-16 mt-16 grid grid-cols-2 gap-8">
         <div className="bg-white/5 border border-white/10 rounded-[3rem] p-12 backdrop-blur-xl shadow-2xl flex flex-col items-center justify-center text-center space-y-4">
            <div className="h-16 w-16 bg-primary/20 rounded-2xl flex items-center justify-center text-primary mb-2">
               <Trophy className="h-10 w-10" />
            </div>
            <p className="text-slate-400 font-black uppercase tracking-[0.3em] text-sm">State Rank</p>
            <p className="text-8xl font-black tracking-tighter text-white tabular-nums">#{rank}</p>
         </div>
         <div className="bg-white/5 border border-white/10 rounded-[3rem] p-12 backdrop-blur-xl shadow-2xl flex flex-col items-center justify-center text-center space-y-4">
            <div className="h-16 w-16 bg-emerald-500/20 rounded-2xl flex items-center justify-center text-emerald-400 mb-2">
               <Target className="h-10 w-10" />
            </div>
            <p className="text-slate-400 font-black uppercase tracking-[0.3em] text-sm">Accuracy</p>
            <p className="text-8xl font-black tracking-tighter text-emerald-400 tabular-nums">{accuracy}%</p>
         </div>
      </div>

      {/* 4. Detailed Ledger */}
      <div className="relative z-10 px-16 mt-10 grid grid-cols-3 gap-6">
         <MiniStat icon={<Zap className="text-primary" />} label="Score" val={score} />
         <MiniStat icon={<Clock className="text-amber-400" />} label="Time" val={timeTaken} />
         <MiniStat icon={<CheckCircle2 className="text-emerald-400" />} label="Correct" val={correct} />
      </div>

      {/* 5. Breakdown Pill */}
      <div className="relative z-10 px-16 mt-8">
         <div className="bg-white/5 border border-white/10 rounded-full h-24 flex items-center px-12 justify-between backdrop-blur-xl">
            <div className="flex items-center gap-4">
               <span className="text-slate-400 font-bold uppercase text-xs tracking-widest">Wrong Nodes</span>
               <span className="text-3xl font-black text-rose-500 tabular-nums">{wrong}</span>
            </div>
            <div className="h-8 w-px bg-white/10" />
            <div className="flex items-center gap-4">
               <span className="text-slate-400 font-bold uppercase text-xs tracking-widest">Total Questions</span>
               <span className="text-3xl font-black text-white tabular-nums">{total}</span>
            </div>
            {percentile && (
               <>
                  <div className="h-8 w-px bg-white/10" />
                  <div className="flex items-center gap-4">
                     <span className="text-slate-400 font-bold uppercase text-xs tracking-widest">Percentile</span>
                     <span className="text-3xl font-black text-primary tabular-nums">{percentile}%</span>
                  </div>
               </>
            )}
         </div>
      </div>

      {/* 6. Footer Hub */}
      <div className="mt-auto bg-primary py-12 px-16 flex items-center justify-between">
         <div className="space-y-2">
            <p className="text-2xl font-black tracking-tight text-white uppercase antialiased">Practice Punjab Government Exams</p>
            <p className="text-white/70 font-bold text-lg tracking-widest">WWW.CRACKLIX.COM</p>
         </div>
         <div className="bg-white p-3 rounded-2xl shadow-2xl">
            <img src={qrUrl} alt="QR Code" className="h-24 w-24" />
         </div>
      </div>
    </div>
  );
}

function MiniStat({ icon, label, val }: any) {
   return (
      <div className="bg-white/5 border border-white/10 rounded-3xl p-8 flex flex-col items-center text-center space-y-2">
         <div className="h-10 w-10 mb-1">{icon}</div>
         <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{label}</p>
         <p className="text-3xl font-black tabular-nums">{val}</p>
      </div>
   )
}
