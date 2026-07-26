
'use client';

import React, { useEffect, useState } from 'react';
import { 
  ShieldCheck, 
  Target, 
  CheckCircle2, 
  X, 
  Clock, 
  Zap, 
  Award,
  Calendar,
  Layers,
  Trophy,
  Users,
  Timer,
  Star,
  BookOpen
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import QRCode from 'qrcode';

interface ShareableResultCardProps {
  data: any;
  rank: number | string;
  totalCandidates: number;
}

/**
 * @fileOverview Official Institutional Scorecard v6.0 [Hierarchy Hardened].
 * 1. Score (Massive - 180px)
 * 2. Accuracy (Secondary)
 * 3. Percentile (Tertiary)
 * 4. Punjab State Rank (Professional Secondary Card)
 * 5. Institutional Branding (Enlarged Logo: 180px height)
 */
export default function ShareableResultCard({ data, rank, totalCandidates }: ShareableResultCardProps) {
  const [qrUrl, setQrUrl] = useState<string>('');

  useEffect(() => {
    if (!data?.mockId || !data?.attemptId) return;
    const url = `https://cracklix.in/results/view?id=${data.mockId}&attemptId=${data.attemptId}`;
    QRCode.toDataURL(url, { 
      margin: 1, 
      width: 180, 
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
      {/* 1. PROFESSIONAL HEADER HUB - ENLARGED LOGO */}
      <div className="relative z-10 px-16 pt-16 flex justify-between items-start border-b border-slate-100 pb-12 bg-white">
         <div className="space-y-6">
            <div className="h-[180px] w-auto">
               <img 
                 src="/logo/cracklix-logo-dark.png" 
                 alt="Cracklix" 
                 className="h-full object-contain" 
               />
            </div>
            <div className="space-y-1">
               <h2 className="text-4xl font-black tracking-tight text-[#0F172A]">{data.userName || 'Verified Aspirant'}</h2>
               <p className="text-sm font-bold text-slate-400 uppercase tracking-[0.4em]">Official Preparation Registry Profile</p>
            </div>
         </div>
         <div className="text-right space-y-4">
            <Badge className="bg-emerald-50 text-emerald-600 border border-emerald-100 px-6 py-2 rounded-full font-black text-sm uppercase tracking-widest flex items-center gap-3">
               <ShieldCheck className="h-5 w-5" /> Verified Result
            </Badge>
            <div className="space-y-1">
               <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Registry Sync Date</p>
               <p className="text-xl font-bold text-[#0F172A]">{new Date(data.timestamp).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
            </div>
         </div>
      </div>

      {/* 2. TEST CONTEXT BAR */}
      <div className="px-16 pt-10">
         <div className="bg-slate-50 rounded-[2rem] p-10 flex justify-between items-center border border-slate-100 shadow-inner">
            <div className="space-y-2">
               <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Examination Module</p>
               <h3 className="text-3xl font-[800] text-[#0B57D0] tracking-tight uppercase">{data.mockTitle}</h3>
            </div>
            <div className="flex gap-10">
               <DetailNode icon={<Zap />} label="Attempt No" val={data.attemptCount || "01"} />
               <DetailNode icon={<Calendar />} label="Cycle" val="Feb 2026" />
            </div>
         </div>
      </div>

      {/* 3. PRIMARY SCORE HUB (FOCAL POINT) */}
      <div className="px-16 pt-10 grid grid-cols-12 gap-8">
         <div className="col-span-7">
            <Card className="h-full border-none bg-[#0B57D0] text-white rounded-[3rem] p-12 shadow-2xl flex flex-col items-center justify-center text-center relative overflow-hidden">
               <div className="absolute top-0 right-0 p-8 opacity-5"><Zap className="h-44 w-44" /></div>
               <p className="text-xl font-black uppercase tracking-[0.5em] mb-6 opacity-60">Net Score</p>
               <div className="flex items-baseline gap-4">
                  <span className="text-[180px] font-black leading-none tabular-nums tracking-tighter">
                     {data.score}
                  </span>
                  <span className="text-6xl font-bold opacity-30">/ {data.totalQuestions}</span>
               </div>
               <div className="mt-10 px-10 py-4 bg-white/10 rounded-2xl border border-white/10 backdrop-blur-md">
                  <p className="text-2xl font-black uppercase tracking-widest">Result Grade: {data.grade || 'A'}</p>
               </div>
            </Card>
         </div>

         <div className="col-span-5 grid grid-cols-1 gap-6">
            <SecondaryMetric label="Accuracy" val={`${data.attemptAccuracy}%`} color="text-emerald-500" bg="bg-emerald-50" icon={<CheckCircle2 className="h-10 w-10" />} />
            <SecondaryMetric label="Percentile" val={`${Math.max(0, Math.round(((totalCandidates - Number(rank)) / (totalCandidates || 1)) * 100))}%`} color="text-blue-600" bg="bg-blue-50" icon={<Target className="h-10 w-10" />} />
            
            <Card className="border border-slate-100 shadow-xl rounded-[2.5rem] bg-white p-8 flex items-center justify-between group overflow-hidden relative">
               <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:rotate-12 transition-transform">
                  <Trophy className="h-24 w-24" />
               </div>
               <div className="text-left space-y-1 relative z-10">
                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Punjab State Rank</p>
                  <p className="text-6xl font-black text-[#0F172A] tabular-nums tracking-tighter">#{rank}</p>
               </div>
               <div className="text-right relative z-10">
                  <p className="text-[10px] font-bold text-slate-300 uppercase tracking-tight">Total Candidates</p>
                  <p className="text-xl font-black text-slate-500 tabular-nums">{totalCandidates.toLocaleString()}</p>
               </div>
            </Card>
         </div>
      </div>

      {/* 4. PERFORMANCE MATRIX */}
      <div className="px-16 pt-10 grid grid-cols-4 gap-6">
         <AuditCell label="Correct" val={data.correctCount} icon={<CheckCircle2 className="text-emerald-500" />} />
         <AuditCell label="Incorrect" val={data.wrongCount} icon={<X className="text-rose-500" />} />
         <AuditCell label="Skipped" val={data.skippedCount} icon={<Clock className="text-slate-400" />} />
         <AuditCell label="Question Node" val={data.totalQuestions} icon={<Layers className="text-primary" />} />
      </div>

      {/* 5. VERIFICATION FOOTER HUB */}
      <div className="mt-auto bg-slate-50 h-[240px] px-16 flex items-center justify-between border-t border-slate-200">
         <div className="flex items-center gap-10">
            <div className="bg-white p-3 rounded-2xl shadow-2xl border border-slate-100 relative group">
               {qrUrl ? <img src={qrUrl} alt="Verify" className="h-32 w-32" /> : <div className="h-32 w-32 bg-slate-100 animate-pulse rounded-lg" />}
            </div>
            <div className="space-y-1 text-left">
               <p className="text-3xl font-black text-[#0B57D0] uppercase tracking-tight">Audit Verification</p>
               <p className="text-lg font-bold text-slate-400 tracking-widest uppercase">WWW.CRACKLIX.IN</p>
            </div>
         </div>
         <div className="text-right space-y-5">
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Verified Institutional Result</p>
            <div className="inline-flex items-center gap-4 text-[#0B57D0] bg-[#0B57D0]/5 px-10 py-4 rounded-2xl border border-[#0B57D0]/10 shadow-sm">
               <ShieldCheck className="h-8 w-8" />
               <span className="text-2xl font-black uppercase tracking-[0.2em]">Registry Synced</span>
            </div>
         </div>
      </div>
    </div>
  );
}

function DetailNode({ icon, label, val }: any) {
   return (
      <div className="flex items-center gap-4">
         <div className="h-12 w-12 rounded-xl bg-white flex items-center justify-center text-primary shadow-sm border border-slate-100 shrink-0">
            {React.isValidElement(icon) ? React.cloneElement(icon as React.ReactElement, { className: "h-6 w-6" }) : icon}
         </div>
         <div className="text-left min-w-0">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">{label}</p>
            <p className="text-lg font-bold text-[#0F172A] mt-1 whitespace-nowrap">{val}</p>
         </div>
      </div>
   )
}

function SecondaryMetric({ label, val, color, bg, icon }: any) {
   return (
      <Card className={cn("p-8 rounded-[2.5rem] border-none shadow-xl flex items-center justify-between group", bg)}>
         <div className="text-left space-y-1">
            <span className="text-[11px] font-black uppercase text-slate-400 tracking-[0.2em]">{label}</span>
            <span className={cn("text-5xl font-black tabular-nums tracking-tighter block", color)}>{val}</span>
         </div>
         <div className="h-16 w-16 bg-white/50 rounded-2xl flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
            {icon}
         </div>
      </Card>
   )
}

function AuditCell({ label, val, icon }: any) {
   return (
      <div className="flex items-center gap-5 p-6 bg-white border border-slate-100 rounded-[2rem] shadow-lg group hover:translate-y-[-2px] transition-all">
         <div className="h-12 w-12 rounded-2xl bg-slate-50 flex items-center justify-center shrink-0 shadow-inner group-hover:bg-primary group-hover:text-white transition-all">{icon}</div>
         <div className="text-left">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{label}</p>
            <p className="text-3xl font-black text-[#0F172A] tabular-nums leading-none tracking-tight">{val}</p>
         </div>
      </div>
   )
}
