
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
  FileText
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
 * @fileOverview Institutional Official Scorecard v1.0.
 * Rebuilt as a professional exam report (Testbook/Adda247 style).
 * Optimized for 1080x1350 PNG Sharing.
 */
export default function ShareableResultCard({ data, rank, totalCandidates }: ShareableResultCardProps) {
  const [qrUrl, setQrUrl] = useState<string>('');

  useEffect(() => {
    if (!data?.mockId || !data?.attemptId) return;
    const url = `https://cracklix.in/results/view?id=${data.mockId}&attemptId=${data.attemptId}`;
    QRCode.toDataURL(url, { 
      margin: 1, 
      width: 200, 
      color: { dark: '#0F172A', light: '#ffffff' } 
    }).then(setQrUrl).catch(() => {});
  }, [data]);

  if (!data) return null;

  return (
    <div 
      id="cracklix-result-card-canvas"
      className="w-[1080px] h-[1350px] bg-white text-[#0F172A] flex flex-col relative overflow-hidden"
      style={{ fontFamily: 'Inter, sans-serif' }}
    >
      {/* PROFESSIONAL BACKGROUND PATTERN */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: `radial-gradient(#0B57D0 1px, transparent 1px)`, backgroundSize: '30px 30px' }} />
      <div className="absolute top-0 left-0 w-full h-3 bg-[#0B57D0]" />

      <div className="relative z-10 flex-1 flex flex-col p-16 space-y-10">
         
         {/* 1. MASTER HEADER: LOGO 3X LARGER */}
         <div className="flex justify-between items-center border-b-2 border-slate-100 pb-10">
            <div className="space-y-4">
               <div className="h-[120px] w-auto">
                  <img 
                    src="/logo/cracklix-logo-dark.png" 
                    alt="Cracklix" 
                    crossOrigin="anonymous"
                    className="h-full object-contain" 
                  />
               </div>
               <p className="text-sm font-black text-slate-400 uppercase tracking-[0.4em] ml-2">Official Score Report</p>
            </div>
            <div className="text-right space-y-3">
               <Badge className="bg-emerald-50 text-emerald-600 border border-emerald-100 px-6 py-2 rounded-full font-black text-sm uppercase tracking-widest flex items-center gap-3">
                  <ShieldCheck className="h-5 w-5" /> Verified Result
               </Badge>
               <p className="text-[11px] font-bold text-slate-300 uppercase tracking-widest">Entry: {data.attemptId?.slice(0, 16).toUpperCase()}</p>
            </div>
         </div>

         {/* 2. CANDIDATE & TEST DETAILS HUB */}
         <div className="bg-slate-50 rounded-[2rem] p-10 flex justify-between items-center border border-slate-100 shadow-inner">
            <div className="space-y-4 flex-1">
               <div className="space-y-1">
                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Candidate</p>
                  <h2 className="text-5xl font-black text-[#0F172A] tracking-tight">{data.userName || 'Aspirant'}</h2>
               </div>
               <div className="flex items-center gap-6">
                  <DetailNode icon={Zap} label="Attempt No" val={data.attemptCount || "01"} />
                  <div className="w-px h-8 bg-slate-200" />
                  <DetailNode icon={Calendar} label="Exam Date" val={new Date(data.timestamp).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })} />
               </div>
            </div>
            <div className="text-right space-y-2 max-w-[400px]">
               <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Test Title</p>
               <h3 className="text-2xl font-bold text-[#0B57D0] leading-tight line-clamp-2">{data.mockTitle}</h3>
            </div>
         </div>

         {/* 3. PRIMARY METRICS: SCORE HUB (THE CENTERPIECE) */}
         <div className="grid grid-cols-12 gap-8">
            {/* NET SCORE: THE BIGGEST ELEMENT */}
            <div className="col-span-6">
               <Card className="h-full border-none bg-[#0B57D0] text-white rounded-[3rem] p-12 shadow-2xl flex flex-col items-center justify-center text-center relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-8 opacity-5"><Zap className="h-44 w-44" /></div>
                  <p className="text-xl font-black uppercase tracking-[0.4em] mb-4 opacity-60">Net Score</p>
                  <div className="flex items-baseline gap-2">
                     <span className="text-[140px] font-black leading-none tabular-nums tracking-tighter">
                        {data.score}
                     </span>
                     <span className="text-4xl font-bold opacity-30">/ {data.totalQuestions}</span>
                  </div>
                  <div className="mt-8 px-8 py-3 bg-white/10 rounded-2xl border border-white/10">
                     <p className="text-xl font-bold">Grade: {data.grade || 'A'}</p>
                  </div>
               </Card>
            </div>

            <div className="col-span-6 grid grid-cols-1 gap-6">
               <div className="grid grid-cols-2 gap-6">
                  <SecondaryMetric label="Accuracy" val={`${data.attemptAccuracy}%`} color="text-emerald-500" bg="bg-emerald-50" />
                  <SecondaryMetric label="Percentile" val={`${Math.max(0, Math.round(((totalCandidates - Number(rank)) / (totalCandidates || 1)) * 100))}%`} color="text-purple-600" bg="bg-purple-50" />
               </div>
               {/* RANK: SMALLER SECONDARY CARD */}
               <Card className="border border-slate-100 shadow-xl rounded-[2.5rem] bg-white p-8 flex items-center justify-between group overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:rotate-12 transition-transform duration-700">
                     <Trophy className="h-24 w-24" />
                  </div>
                  <div className="text-left space-y-1">
                     <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Punjab State Rank</p>
                     <p className="text-6xl font-black text-[#0F172A] tabular-nums tracking-tighter">#{rank}</p>
                  </div>
                  <div className="text-right">
                     <p className="text-[10px] font-bold text-slate-300 uppercase tracking-tight">Out of</p>
                     <p className="text-xl font-black text-slate-500 tabular-nums">{totalCandidates.toLocaleString()}</p>
                  </div>
               </Card>
            </div>
         </div>

         {/* 4. PERFORMANCE ANALYSIS TABLE */}
         <div className="grid grid-cols-4 gap-6">
            <AuditCell label="Correct" val={data.correctCount} icon={<CheckCircle2 className="text-emerald-500" />} />
            <AuditCell label="Incorrect" val={data.wrongCount} icon={<X className="text-rose-500" />} />
            <AuditCell label="Skipped" val={data.skippedCount} icon={<Clock className="text-slate-300" />} />
            <AuditCell label="Total Items" val={data.totalQuestions} icon={<Layers className="text-primary" />} />
         </div>

         {/* 5. SUBJECT BREAKDOWN (OFFICIAL STYLE) */}
         {data.subjectAnalysis && (
            <div className="space-y-4">
               <p className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Subject Mastery Audit</p>
               <div className="bg-white border-2 border-slate-50 rounded-[2rem] overflow-hidden shadow-sm">
                  <table className="w-full border-collapse">
                     <thead className="bg-slate-50">
                        <tr className="h-14">
                           <th className="px-10 text-left font-black text-xs text-slate-400 uppercase">Subject Hub</th>
                           <th className="px-10 text-center font-black text-xs text-slate-400 uppercase">Mastery</th>
                           <th className="px-10 text-right font-black text-xs text-slate-400 uppercase">Audit Score</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-50">
                        {data.subjectAnalysis.slice(0, 4).map((s: any, i: number) => (
                           <tr key={i} className="h-16">
                              <td className="px-10 font-bold text-[#0F172A]">{s.name}</td>
                              <td className="px-10">
                                 <div className="w-40 mx-auto h-2 bg-slate-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-[#0B57D0]" style={{ width: `${s.accuracy}%` }} />
                                 </div>
                              </td>
                              <td className="px-10 text-right font-black text-[#0F172A] tabular-nums">
                                 {s.score} <span className="text-slate-300 font-bold">/ {s.total}</span>
                              </td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
               </div>
            </div>
         )}

         {/* 6. FOOTER AUDIT HUB */}
         <div className="mt-auto pt-10 border-t-2 border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-10">
               <div className="bg-white p-3 rounded-2xl shadow-xl border border-slate-100">
                  {qrUrl ? <img src={qrUrl} alt="Verify" className="h-28 w-28" /> : <div className="h-28 w-28 bg-slate-50 rounded-lg animate-pulse" />}
               </div>
               <div className="space-y-1 text-left">
                  <p className="text-2xl font-black text-[#0B57D0] uppercase tracking-tight">Verify Result</p>
                  <p className="text-sm font-bold text-slate-400 tracking-widest uppercase">www.cracklix.in</p>
               </div>
            </div>
            <div className="text-right">
               <p className="text-sm font-bold text-slate-400 tracking-tight mb-4">Official Preparation Registry Node</p>
               <div className="inline-flex items-center gap-3 text-[#0B57D0]">
                  <ShieldCheck className="h-6 w-6" />
                  <span className="text-base font-black uppercase tracking-[0.2em]">Institutional Merit Record</span>
               </div>
            </div>
         </div>

      </div>
    </div>
  );
}

function DetailNode({ icon: Icon, label, val }: any) {
   return (
      <div className="flex items-center gap-3">
         <Icon className="h-4 w-4 text-primary" />
         <div className="text-left">
            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none">{label}</p>
            <p className="text-sm font-bold text-[#0F172A] mt-1">{val}</p>
         </div>
      </div>
   )
}

function SecondaryMetric({ label, val, color, bg }: any) {
   return (
      <Card className={cn("p-8 rounded-[2rem] border-none shadow-sm flex flex-col items-center justify-center text-center space-y-2", bg)}>
         <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{label}</span>
         <span className={cn("text-4xl font-black tabular-nums tracking-tighter", color)}>{val}</span>
      </Card>
   )
}

function AuditCell({ label, val, icon }: any) {
   return (
      <div className="flex items-center gap-4 p-6 bg-slate-50 border border-slate-100 rounded-3xl shadow-inner">
         <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center shrink-0 shadow-sm">{icon}</div>
         <div className="text-left">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{label}</p>
            <p className="text-2xl font-black text-[#0F172A] tabular-nums leading-none">{val}</p>
         </div>
      </div>
   )
}
