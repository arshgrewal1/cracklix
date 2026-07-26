
'use client';

import React, { useEffect, useState } from 'react';
import { 
  ShieldCheck, 
  Target, 
  CheckCircle2, 
  X, 
  Clock, 
  Users, 
  Timer,
  BarChart3,
  Award,
  Zap,
  Globe,
  FileText,
  Calendar,
  Layers
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
 * @fileOverview Official Institutional Scorecard v2.0.
 * Rebuilt as a high-fidelity professional exam report.
 * FIXED: Added missing Calendar and Layers icon imports.
 * Optimized for 1080x1350 PNG Sharing with 2x resolution.
 */
export default function ShareableResultCard({ data, rank, totalCandidates }: ShareableResultCardProps) {
  const [qrUrl, setQrUrl] = useState<string>('');

  useEffect(() => {
    if (!data?.mockId || !data?.attemptId) return;
    const url = `https://cracklix.in/results/view?id=${data.mockId}&attemptId=${data.attemptId}`;
    QRCode.toDataURL(url, { 
      margin: 1, 
      width: 200, 
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
      {/* 1. PROFESSIONAL HEADER HUB */}
      <div className="relative z-10 px-16 pt-16 flex justify-between items-start border-b border-slate-100 pb-12">
         <div className="space-y-6">
            <div className="h-[140px] w-auto">
               <img 
                 src="/logo.png" 
                 alt="Cracklix" 
                 crossOrigin="anonymous"
                 className="h-full object-contain" 
               />
            </div>
            <div className="space-y-1">
               <h2 className="text-4xl font-black tracking-tight text-[#0F172A]">{data.userName || 'Aspirant'}</h2>
               <p className="text-sm font-bold text-slate-400 uppercase tracking-[0.4em]">Candidate Profile Verified</p>
            </div>
         </div>
         <div className="text-right space-y-4">
            <Badge className="bg-emerald-50 text-emerald-600 border border-emerald-100 px-6 py-2 rounded-full font-black text-sm uppercase tracking-widest flex items-center gap-3">
               <ShieldCheck className="h-5 w-5" /> Official Scorecard
            </Badge>
            <div className="space-y-1">
               <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Registry Date</p>
               <p className="text-xl font-bold text-[#0F172A]">{new Date(data.timestamp).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
            </div>
         </div>
      </div>

      {/* 2. TEST CONTEXT HUB */}
      <div className="px-16 pt-10">
         <div className="bg-slate-50 rounded-[2rem] p-10 flex justify-between items-center border border-slate-100 shadow-inner">
            <div className="space-y-2">
               <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Test Title</p>
               <h3 className="text-3xl font-bold text-[#0B57D0] tracking-tight">{data.mockTitle}</h3>
            </div>
            <div className="flex gap-10">
               <DetailNode icon={Zap} label="Attempt" val={data.attemptCount || "01"} />
               <DetailNode icon={Clock} label="Duration" val={`${data.timeTaken ? Math.floor(data.timeTaken / 60) : '---'}m`} />
            </div>
         </div>
      </div>

      {/* 3. PRIMARY SCORE HUB (BIGGEST ELEMENT) */}
      <div className="px-16 pt-10 grid grid-cols-12 gap-8">
         <div className="col-span-7">
            <Card className="h-full border-none bg-[#0B57D0] text-white rounded-[3rem] p-12 shadow-2xl flex flex-col items-center justify-center text-center relative overflow-hidden">
               <div className="absolute top-0 right-0 p-8 opacity-5"><Zap className="h-44 w-44" /></div>
               <p className="text-xl font-black uppercase tracking-[0.5em] mb-6 opacity-60">Net Score Audit</p>
               <div className="flex items-baseline gap-4">
                  <span className="text-[160px] font-black leading-none tabular-nums tracking-tighter">
                     {data.score}
                  </span>
                  <span className="text-5xl font-bold opacity-30">/ {data.totalQuestions}</span>
               </div>
               <div className="mt-10 px-10 py-3 bg-white/10 rounded-2xl border border-white/10">
                  <p className="text-2xl font-bold">Registry Grade: {data.grade || 'A'}</p>
               </div>
            </Card>
         </div>

         <div className="col-span-5 grid grid-cols-1 gap-6">
            <SecondaryMetric label="Accuracy" val={`${data.attemptAccuracy}%`} color="text-emerald-500" bg="bg-emerald-50" />
            <SecondaryMetric label="Percentile" val={`${Math.max(0, Math.round(((totalCandidates - Number(rank)) / (totalCandidates || 1)) * 100))}%`} color="text-blue-600" bg="bg-blue-50" />
            
            {/* RANK: SECONDARY CARD */}
            <Card className="border border-slate-100 shadow-xl rounded-[2.5rem] bg-white p-8 flex items-center justify-between group overflow-hidden">
               <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:rotate-12 transition-transform">
                  <Trophy className="h-20 w-20" />
               </div>
               <div className="text-left space-y-1">
                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Punjab State Rank</p>
                  <p className="text-5xl font-black text-[#0F172A] tabular-nums tracking-tighter">#{rank}</p>
               </div>
               <div className="text-right">
                  <p className="text-[10px] font-bold text-slate-300 uppercase tracking-tight">Active Pool</p>
                  <p className="text-lg font-black text-slate-500 tabular-nums">{totalCandidates.toLocaleString()}</p>
               </div>
            </Card>
         </div>
      </div>

      {/* 4. PERFORMANCE ANALYSIS MATRIX */}
      <div className="px-16 pt-10 grid grid-cols-4 gap-6">
         <AuditCell label="Correct" val={data.correctCount} icon={<CheckCircle2 className="text-emerald-500" />} />
         <AuditCell label="Incorrect" val={data.wrongCount} icon={<X className="text-rose-500" />} />
         <AuditCell label="Skipped" val={data.skippedCount} icon={<Clock className="text-slate-400" />} />
         <AuditCell label="Total Items" val={data.totalQuestions} icon={<Layers className="text-primary" />} />
      </div>

      {/* 5. SUBJECT MASTERY TABLE */}
      {data.subjectAnalysis && (
         <div className="px-16 pt-10 space-y-4">
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest ml-2">Subject Performance Registry</p>
            <div className="bg-white border-2 border-slate-50 rounded-[2.5rem] overflow-hidden shadow-sm">
               <table className="w-full border-collapse">
                  <thead className="bg-slate-50">
                     <tr className="h-16">
                        <th className="px-10 text-left font-black text-xs text-slate-400 uppercase">Preparation Node</th>
                        <th className="px-10 text-center font-black text-xs text-slate-400 uppercase">Mastery</th>
                        <th className="px-10 text-right font-black text-xs text-slate-400 uppercase">Net Score</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                     {data.subjectAnalysis.slice(0, 4).map((s: any, i: number) => (
                        <tr key={i} className="h-20">
                           <td className="px-10 font-bold text-lg text-[#0F172A]">{s.name}</td>
                           <td className="px-10">
                              <div className="w-48 mx-auto h-2.5 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                                 <div className="h-full bg-[#0B57D0]" style={{ width: `${s.accuracy}%` }} />
                              </div>
                           </td>
                           <td className="px-10 text-right font-black text-xl text-[#0F172A] tabular-nums">
                              {s.score} <span className="text-slate-300 font-bold">/ {s.total}</span>
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
         </div>
      )}

      {/* 6. VERIFICATION HUB FOOTER */}
      <div className="mt-auto bg-slate-50 h-[220px] px-16 flex items-center justify-between border-t border-slate-200">
         <div className="flex items-center gap-10">
            <div className="bg-white p-3 rounded-2xl shadow-2xl border border-slate-100 relative group">
               {qrUrl ? <img src={qrUrl} alt="Verify" className="h-32 w-32" /> : <div className="h-32 w-32 bg-slate-100 animate-pulse rounded-lg" />}
            </div>
            <div className="space-y-1 text-left">
               <p className="text-3xl font-black text-[#0B57D0] uppercase tracking-tight">Verify Result</p>
               <p className="text-lg font-bold text-slate-400 tracking-widest uppercase">WWW.CRACKLIX.IN</p>
            </div>
         </div>
         <div className="text-right space-y-4">
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Institutional Merit Hub</p>
            <div className="inline-flex items-center gap-4 text-[#0B57D0] bg-[#0B57D0]/5 px-8 py-3 rounded-2xl border border-[#0B57D0]/10 shadow-sm">
               <ShieldCheck className="h-7 w-7" />
               <span className="text-xl font-black uppercase tracking-[0.2em]">Master Registry Synced</span>
            </div>
         </div>
      </div>
    </div>
  );
}

function DetailNode({ icon: Icon, label, val }: any) {
   return (
      <div className="flex items-center gap-4">
         <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center text-primary shadow-sm border border-slate-100">
            <Icon className="h-5 w-5" />
         </div>
         <div className="text-left">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">{label}</p>
            <p className="text-lg font-bold text-[#0F172A] mt-1">{val}</p>
         </div>
      </div>
   )
}

function SecondaryMetric({ label, val, color, bg }: any) {
   return (
      <Card className={cn("p-6 rounded-[2.5rem] border-none shadow-xl flex flex-col items-center justify-center text-center space-y-1", bg)}>
         <span className="text-[11px] font-black uppercase text-slate-400 tracking-[0.2em]">{label}</span>
         <span className={cn("text-5xl font-black tabular-nums tracking-tighter", color)}>{val}</span>
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
