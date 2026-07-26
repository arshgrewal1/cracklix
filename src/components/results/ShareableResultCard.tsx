
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
  X,
  FileText,
  BarChart3,
  Calendar,
  Check
} from 'lucide-react';
import { cn } from '@/lib/utils';
import QRCode from 'qrcode';

interface ShareableResultCardProps {
  data: any;
  rank: number | string;
  totalCandidates: number;
}

/**
 * @fileOverview Institutional Merit Certificate v4.0 [Professional Redesign].
 * Requirements: White background, Blue theme (#0B57D0), Testbook style.
 */
export default function ShareableResultCard({ data, rank, totalCandidates }: ShareableResultCardProps) {
  const [qrUrl, setQrUrl] = useState<string>('');

  useEffect(() => {
    if (!data?.mockId || !data?.attemptId) return;
    const url = `https://cracklix.in/results/view?id=${data.mockId}&attemptId=${data.attemptId}`;
    QRCode.toDataURL(url, { 
      margin: 1, 
      width: 240, 
      color: { dark: '#0B57D0', light: '#ffffff' } 
    }).then(setQrUrl).catch(() => {});
  }, [data]);

  if (!data) return null;

  return (
    <div 
      id="shareable-result-certificate"
      className="w-[1080px] h-[1350px] bg-white text-[#0F172A] flex flex-col relative overflow-hidden border-[24px] border-slate-50"
      style={{ fontFamily: 'Inter, sans-serif' }}
    >
      {/* 1. INSTITUTIONAL ACCENTS */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#0B57D0]/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#0B57D0]/5 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2" />
      
      <div className="relative z-10 flex-1 flex flex-col p-20 space-y-10">
         
         {/* 2. HEADER HUB */}
         <div className="flex justify-between items-start border-b-2 border-slate-100 pb-10">
            <div className="space-y-4">
               <div className="h-[100px] w-auto flex items-start justify-start">
                  <img 
                    src="/logo/cracklix-logo-dark.png" 
                    alt="Cracklix" 
                    crossOrigin="anonymous"
                    className="h-full object-contain" 
                  />
               </div>
               <div className="flex items-center gap-3">
                  <Badge className="bg-emerald-50 text-emerald-600 border border-emerald-100 px-4 py-1.5 rounded-full font-black text-sm uppercase tracking-widest flex items-center gap-2">
                     <ShieldCheck className="h-4 w-4" /> Verified Result
                  </Badge>
               </div>
            </div>
            <div className="text-right space-y-2">
               <p className="text-sm font-black text-slate-400 uppercase tracking-widest">Candidate Node</p>
               <p className="text-4xl font-black text-[#0B57D0] tracking-tight">{data.userName}</p>
            </div>
         </div>

         {/* 3. TEST INFO PILL */}
         <div className="bg-slate-50 rounded-3xl p-8 flex items-center justify-between border border-slate-100">
            <div className="space-y-1">
               <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Mock Title</p>
               <h2 className="text-3xl font-[800] text-[#0F172A] tracking-tight">{data.mockTitle}</h2>
            </div>
            <div className="flex gap-10">
               <MetaInfo label="Attempted" val={new Date(data.timestamp).toLocaleDateString('en-GB')} />
               <MetaInfo label="Duration" val={`${data.timeTaken ? Math.floor(data.timeTaken/60) : 0} Min`} />
            </div>
         </div>

         {/* 4. RANK HUB - CENTERPIECE */}
         <div className="relative pt-4">
            <div className="bg-gradient-to-br from-[#0B57D0] to-[#0842A0] rounded-[4rem] p-1 shadow-2xl">
               <div className="bg-white rounded-[3.8rem] p-12 text-center relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-8 opacity-5 rotate-12"><Trophy className="h-64 w-64 text-[#0B57D0]" /></div>
                  <div className="space-y-2 relative z-10">
                     <p className="text-2xl font-black text-[#0B57D0] uppercase tracking-[0.4em]">Punjab State Rank</p>
                     <div className="flex flex-col items-center">
                        <span className="text-[220px] font-black text-[#0F172A] leading-none tracking-tighter tabular-nums antialiased">
                           #{rank}
                        </span>
                        <div className="inline-flex items-center gap-4 bg-slate-50 px-10 py-4 rounded-full border border-slate-100 shadow-inner">
                           <Users className="h-8 w-8 text-[#0B57D0]" />
                           <span className="text-3xl font-bold text-slate-600">Out of {totalCandidates.toLocaleString()} Candidates</span>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         </div>

         {/* 5. SCORE MATRIX GRID */}
         <div className="grid grid-cols-4 gap-6 pt-4">
            <StatCard label="Score" val={`${data.score}/${data.totalQuestions}`} color="text-[#0B57D0]" bg="bg-blue-50" />
            <StatCard label="Accuracy" val={`${data.attemptAccuracy}%`} color="text-emerald-600" bg="bg-emerald-50" />
            <StatCard label="Percentile" val={`${Math.max(0, Math.round(((totalCandidates - Number(rank)) / (totalCandidates || 1)) * 100))}%`} color="text-purple-600" bg="bg-purple-50" />
            <StatCard label="Pass Grade" val={data.grade || "A+"} color="text-amber-600" bg="bg-amber-50" />
         </div>

         {/* 6. PILLAR STATS */}
         <div className="grid grid-cols-4 gap-6">
            <Pillar icon={<CheckCircle2 className="text-emerald-500" />} label="Correct" val={data.correctCount} />
            <Pillar icon={<X className="text-rose-500" />} label="Wrong" val={data.wrongCount} />
            <Pillar icon={<Clock className="text-slate-400" />} label="Skipped" val={data.skippedCount} />
            <Pillar icon={<BarChart3 className="text-blue-500" />} label="Total" val={data.totalQuestions} />
         </div>

         {/* 7. FOOTER AUDIT */}
         <div className="mt-auto pt-10 border-t-2 border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-10">
               <div className="bg-white p-2 rounded-2xl shadow-xl border border-slate-100">
                  {qrUrl ? <img src={qrUrl} alt="Verify" className="h-28 w-24" /> : <div className="h-28 w-24 bg-slate-50 animate-pulse rounded-lg" />}
               </div>
               <div className="space-y-1 text-left">
                  <p className="text-2xl font-black text-[#0B57D0] uppercase tracking-tight">Verify Result</p>
                  <p className="text-sm font-bold text-slate-400 tracking-widest uppercase">WWW.CRACKLIX.IN</p>
               </div>
            </div>
            <div className="text-right">
               <p className="text-sm font-black text-slate-300 uppercase tracking-[0.5em] mb-4">Auth node: {data.attemptId?.slice(0, 16).toUpperCase()}</p>
               <div className="inline-flex items-center gap-2 text-[#0B57D0]">
                  <ShieldCheck className="h-5 w-5" />
                  <span className="text-xs font-black uppercase tracking-widest">Institutional Merit Node</span>
               </div>
            </div>
         </div>

      </div>
    </div>
  );
}

function MetaInfo({ label, val }: any) {
   return (
      <div className="text-right space-y-1">
         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
         <p className="text-xl font-bold text-[#0F172A] tabular-nums">{val}</p>
      </div>
   )
}

function StatCard({ label, val, color, bg }: any) {
   return (
      <div className={cn("p-6 rounded-[2.5rem] flex flex-col items-center justify-center text-center space-y-2 shadow-sm border border-slate-50", bg)}>
         <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{label}</span>
         <span className={cn("text-3xl font-[900] tabular-nums leading-none tracking-tighter", color)}>{val}</span>
      </div>
   )
}

function Pillar({ icon, label, val }: any) {
   return (
      <div className="flex items-center gap-4 p-5 bg-white border border-slate-100 rounded-2xl shadow-sm">
         <div className="h-8 w-8 rounded-lg bg-slate-50 flex items-center justify-center shrink-0 shadow-inner">{icon}</div>
         <div className="text-left">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{label}</p>
            <p className="text-xl font-black text-[#0F172A] tabular-nums leading-none">{val}</p>
         </div>
      </div>
   )
}
