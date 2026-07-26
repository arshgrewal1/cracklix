
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
  Timer,
  X,
  FileText,
  BarChart3,
  TrendingUp,
  Check
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import QRCode from 'qrcode';

interface ShareableResultCardProps {
  data: any;
  rank: number | string;
  totalCandidates: number;
}

/**
 * @fileOverview Professional Institutional Result Certificate v1.0.
 * Designed for Social Sharing (1080x1350).
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
      id="cracklix-result-card-canvas"
      className="w-[1080px] h-[1350px] bg-white text-[#0F172A] flex flex-col relative overflow-hidden"
      style={{ fontFamily: 'Inter, sans-serif' }}
    >
      {/* INSTITUTIONAL BORDERS */}
      <div className="absolute inset-0 border-[32px] border-slate-50 pointer-events-none" />
      
      <div className="relative z-10 flex-1 flex flex-col p-24 space-y-12">
         
         {/* 1. HEADER HUB */}
         <div className="flex justify-between items-start border-b-2 border-slate-100 pb-12">
            <div className="space-y-6">
               <div className="h-[100px] w-auto flex items-start justify-start">
                  <img 
                    src="/logo/cracklix-logo-dark.png" 
                    alt="Cracklix" 
                    crossOrigin="anonymous"
                    className="h-full object-contain" 
                  />
               </div>
               <Badge className="bg-emerald-50 text-emerald-600 border border-emerald-100 px-6 py-2 rounded-full font-black text-sm uppercase tracking-widest flex items-center gap-3">
                  <ShieldCheck className="h-5 w-5" /> Verified Result
               </Badge>
            </div>
            <div className="text-right space-y-2">
               <p className="text-sm font-black text-slate-400 uppercase tracking-widest">Candidate</p>
               <p className="text-5xl font-black text-[#0B57D0] tracking-tight">{data.userName || 'Aspirant'}</p>
            </div>
         </div>

         {/* 2. TEST TITLE PILL */}
         <div className="space-y-2">
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Mock test series</p>
            <h2 className="text-4xl font-[800] text-[#0F172A] tracking-tight leading-tight">{data.mockTitle}</h2>
         </div>

         {/* 3. RANK HERO SECTION - CENTERPIECE */}
         <div className="relative py-4">
            <div className="bg-[#0B57D0] rounded-[4rem] p-1 shadow-2xl">
               <div className="bg-white rounded-[3.8rem] p-12 text-center relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-8 opacity-5 rotate-12"><Trophy className="h-64 w-64 text-[#0B57D0]" /></div>
                  <div className="space-y-2 relative z-10">
                     <p className="text-2xl font-black text-[#0B57D0] uppercase tracking-[0.5em]">Punjab state rank</p>
                     <div className="flex flex-col items-center">
                        <span className="text-[240px] font-black text-[#0F172A] leading-none tracking-tighter tabular-nums antialiased">
                           #{rank}
                        </span>
                        <div className="inline-flex items-center gap-4 bg-slate-50 px-12 py-5 rounded-full border border-slate-100 shadow-inner">
                           <Users className="h-8 w-8 text-[#0B57D0]" />
                           <span className="text-3xl font-bold text-slate-600">Out of {totalCandidates.toLocaleString()} Candidates</span>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         </div>

         {/* 4. PERFORMANCE GRID */}
         <div className="grid grid-cols-4 gap-6">
            <MetricBox label="Score" val={`${data.score}/${data.totalQuestions}`} color="text-[#0B57D0]" bg="bg-blue-50" />
            <MetricBox label="Accuracy" val={`${data.attemptAccuracy}%`} color="text-emerald-600" bg="bg-emerald-50" />
            <MetricBox label="Percentile" val={`${Math.max(0, Math.round(((totalCandidates - Number(rank)) / (totalCandidates || 1)) * 100))}%`} color="text-purple-600" bg="bg-purple-50" />
            <MetricBox label="Grade" val={data.grade || "A+"} color="text-amber-600" bg="bg-amber-50" />
         </div>

         {/* 5. ITEM STATS */}
         <div className="grid grid-cols-4 gap-6">
            <MiniPillar icon={<CheckCircle2 className="text-emerald-500" />} label="Correct" val={data.correctCount} />
            <MiniPillar icon={<X className="text-rose-500" />} label="Wrong" val={data.wrongCount} />
            <MiniPillar icon={<Clock className="text-slate-400" />} label="Skipped" val={data.skippedCount} />
            <MiniPillar icon={<BarChart3 className="text-blue-500" />} label="Total" val={data.totalQuestions} />
         </div>

         {/* 6. SUBJECT WISE SNAPSHOT */}
         {data.subjectAnalysis && (
            <div className="bg-slate-50/50 rounded-3xl p-8 border border-slate-100">
               <div className="flex items-center gap-3 mb-6">
                  <Target className="h-5 w-5 text-[#0B57D0]" />
                  <h4 className="text-sm font-black uppercase tracking-widest text-slate-500">Subject mastery snapshot</h4>
               </div>
               <div className="grid grid-cols-3 gap-10">
                  {data.subjectAnalysis.slice(0, 3).map((s: any, i: number) => (
                     <div key={i} className="space-y-2">
                        <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase">
                           <span className="truncate pr-2">{s.name}</span>
                           <span>{s.accuracy}%</span>
                        </div>
                        <div className="h-2 w-full bg-white rounded-full overflow-hidden border border-slate-100">
                           <div className="h-full bg-[#0B57D0]" style={{ width: `${s.accuracy}%` }} />
                        </div>
                     </div>
                  ))}
               </div>
            </div>
         )}

         {/* 7. FOOTER AUDIT */}
         <div className="mt-auto pt-10 border-t-2 border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-10">
               <div className="bg-white p-2 rounded-2xl shadow-xl border border-slate-100">
                  {qrUrl ? <img src={qrUrl} alt="Verify" className="h-32 w-32" /> : <div className="h-32 w-32 bg-slate-50 animate-pulse rounded-lg" />}
               </div>
               <div className="space-y-1 text-left">
                  <p className="text-3xl font-black text-[#0B57D0] uppercase tracking-tight">Verify result</p>
                  <p className="text-sm font-bold text-slate-400 tracking-widest uppercase">www.cracklix.in</p>
               </div>
            </div>
            <div className="text-right">
               <p className="text-xs font-black text-slate-200 uppercase tracking-[0.5em] mb-4">Registry entry: {data.attemptId?.slice(0, 16).toUpperCase()}</p>
               <div className="inline-flex items-center gap-3 text-[#0B57D0]">
                  <ShieldCheck className="h-6 w-6" />
                  <span className="text-sm font-black uppercase tracking-widest">Institutional merit record</span>
               </div>
            </div>
         </div>

      </div>
    </div>
  );
}

function MetricBox({ label, val, color, bg }: any) {
   return (
      <div className={cn("p-8 rounded-[2.5rem] flex flex-col items-center justify-center text-center space-y-2 shadow-sm border border-slate-50", bg)}>
         <span className="text-xs font-black uppercase text-slate-400 tracking-widest">{label}</span>
         <span className={cn("text-4xl font-[900] tabular-nums leading-none tracking-tighter", color)}>{val}</span>
      </div>
   )
}

function MiniPillar({ icon, label, val }: any) {
   return (
      <div className="flex items-center gap-5 p-6 bg-white border border-slate-100 rounded-3xl shadow-sm">
         <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center shrink-0 shadow-inner">{icon}</div>
         <div className="text-left">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{label}</p>
            <p className="text-2xl font-black text-[#0F172A] tabular-nums leading-none">{val}</p>
         </div>
      </div>
   )
}

