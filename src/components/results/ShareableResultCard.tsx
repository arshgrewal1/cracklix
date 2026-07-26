
'use client';

import React, { useEffect, useState } from 'react';
import { 
  Trophy, 
  Target, 
  Zap, 
  Award, 
  CheckCircle2, 
  ShieldCheck, 
  Clock, 
  Users, 
  Star,
  Timer,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import QRCode from 'qrcode';

interface ShareableResultCardProps {
  data: any;
  rank: number | string;
  totalCandidates: number;
}

/**
 * @fileOverview High-Fidelity Social Share Certificate v3.1 [Production Registry].
 * FIXED: Explicitly imported all lucide-react nodes to prevent background capture crashes.
 * FIXED: Uses official /logo.png with anonymous crossOrigin for reliable capture.
 */
export default function ShareableResultCard({ data, rank, totalCandidates }: ShareableResultCardProps) {
  const [qrUrl, setQrUrl] = useState<string>('');

  useEffect(() => {
    if (!data?.mockId || !data?.attemptId) return;
    const url = `https://cracklix.in/results/view?id=${data.mockId}&attemptId=${data.attemptId}`;
    QRCode.toDataURL(url, { 
      margin: 1, 
      width: 200, 
      color: { dark: '#071B4D', light: '#ffffff' } 
    }).then(setQrUrl).catch(() => {});
  }, [data]);

  if (!data) return null;

  return (
    <div 
      id="shareable-result-certificate"
      className="w-[1080px] h-[1350px] bg-gradient-to-br from-[#0B5FFF] via-[#4F46E5] to-[#7C3AED] flex flex-col relative overflow-hidden"
      style={{ fontFamily: 'Inter, sans-serif' }}
    >
      {/* 1. AMBIENT GLOW NODES */}
      <div className="absolute top-[-100px] left-[-100px] w-[500px] h-[500px] bg-white/10 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-100px] right-[-100px] w-[600px] h-[600px] bg-primary/20 blur-[150px] rounded-full" />
      
      <div className="relative z-10 flex-1 flex flex-col p-16 space-y-12">
         
         {/* 2. HEADER HUB */}
         <div className="flex flex-col items-center text-center space-y-6">
            <div className="h-[140px] w-auto flex items-center justify-center">
               <img 
                 src="/logo.png" 
                 alt="Cracklix" 
                 crossOrigin="anonymous"
                 className="h-full object-contain filter drop-shadow-2xl" 
               />
            </div>
            <div className="space-y-1">
               <div className="flex items-center justify-center gap-3">
                  <span className="text-xl font-bold text-white/70 uppercase tracking-[0.3em]">Punjab Smart Exam Platform</span>
                  <ShieldCheck className="h-6 w-6 text-emerald-400 fill-emerald-400/20" />
               </div>
            </div>
         </div>

         {/* 3. RANK HUB */}
         <div className="relative">
            <div className="bg-gradient-to-br from-amber-400 via-yellow-300 to-amber-600 p-1.5 rounded-[4rem] shadow-5xl">
               <div className="bg-[#071B4D] rounded-[3.8rem] p-12 text-center relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12"><Trophy className="h-64 w-64" /></div>
                  <div className="space-y-4 relative z-10">
                     <p className="text-2xl font-black text-amber-400 uppercase tracking-[0.4em]">Punjab State Rank</p>
                     <div className="flex flex-col items-center">
                        <span className="text-[180px] font-black text-white leading-none tracking-tighter tabular-nums drop-shadow-2xl">
                           #{rank}
                        </span>
                        <div className="inline-flex items-center gap-4 bg-white/10 px-8 py-3 rounded-full border border-white/20 backdrop-blur-md">
                           <Users className="h-6 w-6 text-amber-400" />
                           <span className="text-2xl font-bold text-white">Out of {totalCandidates.toLocaleString()} Candidates</span>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
            <div className="absolute -bottom-6 -right-6 h-40 w-40 bg-white/10 backdrop-blur-xl border border-white/20 rounded-[3rem] flex flex-col items-center justify-center shadow-4xl">
               <Star className="h-10 w-10 text-amber-400 fill-current mb-2" />
               <span className="text-[10px] font-black text-white uppercase tracking-widest text-center leading-tight">Verified<br/>Attempt</span>
            </div>
         </div>

         {/* 4. CANDIDATE HUB */}
         <div className="bg-white/5 border border-white/10 rounded-[3rem] p-10 flex items-center justify-between backdrop-blur-md">
            <div className="space-y-2">
               <p className="text-sm font-black text-primary uppercase tracking-[0.3em]">Candidate Name</p>
               <p className="text-4xl font-black text-white">{data.userName}</p>
            </div>
            <div className="text-right space-y-2">
               <p className="text-sm font-black text-slate-400 uppercase tracking-[0.3em]">Test Series</p>
               <p className="text-2xl font-bold text-white max-w-[400px] line-clamp-1">{data.mockTitle}</p>
            </div>
         </div>

         {/* 5. METRIC GRID */}
         <div className="grid grid-cols-4 gap-6">
            <div className="p-6 rounded-[2.5rem] flex flex-col items-center justify-center text-center space-y-2 shadow-2xl bg-emerald-500">
               <span className="text-[10px] font-black uppercase text-white/70 tracking-widest">Score</span>
               <span className="text-3xl font-[900] text-white tabular-nums leading-none">{data.score}/{data.totalQuestions}</span>
            </div>
            <div className="p-6 rounded-[2.5rem] flex flex-col items-center justify-center text-center space-y-2 shadow-2xl bg-indigo-500">
               <span className="text-[10px] font-black uppercase text-white/70 tracking-widest">Accuracy</span>
               <span className="text-3xl font-[900] text-white tabular-nums leading-none">{data.attemptAccuracy}%</span>
            </div>
            <div className="p-6 rounded-[2.5rem] flex flex-col items-center justify-center text-center space-y-2 shadow-2xl bg-orange-500">
               <span className="text-[10px] font-black uppercase text-white/70 tracking-widest">Percentile</span>
               <span className="text-3xl font-[900] text-white tabular-nums leading-none">{Math.max(0, Math.round(((totalCandidates - Number(rank)) / (totalCandidates || 1)) * 100))}%</span>
            </div>
            <div className="p-6 rounded-[2.5rem] flex flex-col items-center justify-center text-center space-y-2 shadow-2xl bg-blue-500">
               <span className="text-[10px] font-black uppercase text-white/70 tracking-widest">Grade</span>
               <span className="text-3xl font-[900] text-white tabular-nums leading-none">{data.grade || "A+"}</span>
            </div>
         </div>

         {/* 6. STATS LINE */}
         <div className="grid grid-cols-3 gap-6 pt-4">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-4">
               <div className="h-8 w-8 rounded-lg bg-white/5 flex items-center justify-center shadow-inner"><CheckCircle2 className="h-5 w-5 text-emerald-400" /></div>
               <div className="text-left">
                  <p className="text-[8px] font-black text-white/40 uppercase tracking-widest leading-none mb-1">Correct</p>
                  <p className="text-xl font-black text-white tabular-nums leading-none">{data.correctCount}</p>
               </div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-4">
               <div className="h-8 w-8 rounded-lg bg-white/5 flex items-center justify-center shadow-inner"><X className="h-5 w-5 text-rose-400" /></div>
               <div className="text-left">
                  <p className="text-[8px] font-black text-white/40 uppercase tracking-widest leading-none mb-1">Wrong</p>
                  <p className="text-xl font-black text-white tabular-nums leading-none">{data.wrongCount}</p>
               </div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-4">
               <div className="h-8 w-8 rounded-lg bg-white/5 flex items-center justify-center shadow-inner"><Zap className="h-5 w-5 text-slate-400" /></div>
               <div className="text-left">
                  <p className="text-[8px] font-black text-white/40 uppercase tracking-widest leading-none mb-1">Skipped</p>
                  <p className="text-xl font-black text-white tabular-nums leading-none">{data.skippedCount}</p>
               </div>
            </div>
         </div>

         {/* 7. FOOTER AUDIT */}
         <div className="mt-auto pt-10 border-t border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-8">
               <div className="bg-white p-3 rounded-2xl shadow-2xl">
                  {qrUrl ? <img src={qrUrl} alt="Verify" className="h-24 w-24" /> : <div className="h-24 w-24 bg-slate-100 animate-pulse rounded-lg" />}
               </div>
               <div className="space-y-1 text-left">
                  <p className="text-xl font-black text-white uppercase tracking-tight">Verify Result</p>
                  <p className="text-sm font-bold text-white/50 tracking-widest uppercase">WWW.CRACKLIX.IN</p>
               </div>
            </div>
            <div className="text-right">
               <p className="text-sm font-black text-white/30 uppercase tracking-[0.5em]">Auth ID: {data.attemptId?.slice(0, 16).toUpperCase()}</p>
            </div>
         </div>

      </div>
    </div>
  );
}
