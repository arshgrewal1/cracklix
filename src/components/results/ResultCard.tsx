
'use client';

import React from 'react';
import { 
  ShieldCheck, 
  Trophy, 
  Zap, 
  Target, 
  TrendingUp, 
  Clock, 
  BarChart3, 
  Award,
  CheckCircle2,
  Check,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { BrandingSettings } from '@/types';

interface SubPerformance {
  name: string;
  total: number;
  correct: number;
  wrong: number;
  accuracy: number;
  score: number;
}

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
  date: string;
  resultId: string;
  percentile: number;
  branding?: BrandingSettings;
  subjects?: SubPerformance[];
  grade?: string;
}

/**
 * @fileOverview Official Institutional Result Card v8.1 [Premium Branding].
 * UPDATED: Increased logo container for maximum visual focus and scannability.
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
  date,
  resultId,
  percentile,
  branding,
  subjects = [],
  grade = "F"
}: ResultCardProps) {
  
  const orgName = branding?.organizationName || "Cracklix";
  const webUrlRaw = branding?.websiteUrl || "https://cracklix.vercel.app";
  const verifyBase = branding?.verificationUrl || `${webUrlRaw}/results/view?id=`;
  const fullVerifyUrl = verifyBase + resultId;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(fullVerifyUrl)}`;

  return (
    <div className="w-[800px] bg-white border border-slate-200 shadow-2xl rounded-[3rem] overflow-hidden text-left font-body relative">
      <div className="h-3 w-full bg-primary" />
      
      <div className="p-16 space-y-12">
        {/* Institutional Header - Large Focal Logo [RESIZED] */}
        <div className="flex justify-between items-start border-b border-slate-100 pb-12">
          <div className="flex items-center gap-10">
            <div className="h-40 w-40 bg-white rounded-[2.5rem] flex items-center justify-center p-1 border border-slate-100 shadow-2xl overflow-hidden shrink-0">
              {branding?.logoUrl ? (
                <img src={branding.logoUrl} alt="Logo" className="h-full w-full object-contain" crossOrigin="anonymous" />
              ) : (
                <img src="/logo/cracklix-icon.png" alt="Logo" className="h-full w-full object-contain" crossOrigin="anonymous" />
              )}
            </div>
            <div className="space-y-1">
              <h2 className="text-4xl font-black text-[#0F172A] tracking-tighter leading-none">{orgName}</h2>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.4em]">Official Performance Snapshot</p>
            </div>
          </div>
          <div className="text-right space-y-3">
            <Badge className="bg-emerald-50 text-emerald-600 border-none font-bold text-[11px] px-5 py-2 rounded-full uppercase tracking-widest shadow-sm">Verified Attempt</Badge>
            <p className="text-[13px] font-bold text-[#0F172A] uppercase tracking-widest tabular-nums">{date}</p>
          </div>
        </div>

        {/* Identity Node */}
        <div className="grid grid-cols-12 gap-10 items-center">
           <div className="col-span-8 space-y-6">
              <div className="space-y-1">
                 <h1 className="text-5xl font-black text-[#0F172A] tracking-tighter uppercase leading-none">{studentName}</h1>
                 <p className="text-primary font-black text-sm uppercase tracking-[0.3em]">{examTitle}</p>
              </div>
              <div className="flex items-center gap-6">
                 <div className="flex items-center gap-2 text-slate-400 font-bold text-[10px] uppercase tracking-widest">
                    <ShieldCheck className="h-5 w-5 text-emerald-500" /> Authorized Identity Registry
                 </div>
                 <div className="flex items-center gap-2 text-slate-400 font-bold text-[10px] uppercase tracking-widest">
                    <Target className="h-5 w-5 text-primary" /> Attempt ID: {resultId.slice(-8).toUpperCase()}
                 </div>
              </div>
           </div>

           <div className="col-span-4 flex justify-end">
              <div className="h-32 w-32 bg-[#0F172A] rounded-[2.5rem] shadow-2xl flex flex-col items-center justify-center relative group">
                 <div className="absolute top-0 left-0 w-full h-full bg-primary opacity-5 animate-pulse" />
                 <span className="text-[10px] font-black text-primary uppercase tracking-widest mb-1">Grade</span>
                 <span className="text-6xl font-black text-white tabular-nums leading-none">{grade}</span>
                 <div className="absolute -bottom-3 -right-3 h-10 w-10 bg-amber-400 rounded-xl flex items-center justify-center text-white shadow-xl border-4 border-white">
                    <Award className="h-5 w-5" />
                 </div>
              </div>
           </div>
        </div>

        {/* Analytics Matrix */}
        <div className="grid grid-cols-3 gap-6">
           <AnalyticNode label="Total Score" val={score} icon={<Zap className="text-primary" />} />
           <AnalyticNode label="All Punjab Rank" val={`#${rank}`} icon={<Trophy className="text-amber-500" />} />
           <AnalyticNode label="Accuracy" val={`${accuracy}%`} icon={<Target className="text-emerald-500" />} />
           <AnalyticNode label="Percentile" val={`${percentile}%`} icon={<TrendingUp className="text-blue-500" />} />
           <AnalyticNode label="Time Taken" val={timeTaken} icon={<Clock className="text-slate-400" />} />
           <AnalyticNode label="Status" val={Number(accuracy) > 40 ? "QUALIFIED" : "LEARNING"} icon={<CheckCircle2 className="text-emerald-600" />} />
        </div>

        {/* Quant Matrix */}
        <div className="bg-[#F8FAFC] rounded-[2.5rem] p-12 flex items-center justify-around shadow-inner border border-slate-100">
           <MetricNode label="Correct" val={correct} color="text-emerald-600" />
           <div className="w-px h-16 bg-slate-200" />
           <MetricNode label="Incorrect" val={wrong} color="text-rose-600" />
           <div className="w-px h-16 bg-slate-200" />
           <MetricNode label="Skipped" val={total - (correct + wrong)} color="text-slate-300" />
        </div>

        {/* Vertical Audit Table */}
        {subjects.length > 0 && (
          <div className="space-y-6">
            <h3 className="text-sm font-black uppercase text-slate-400 tracking-[0.4em] ml-2">Vertical Performance Audit</h3>
            <div className="border border-slate-100 rounded-[2rem] overflow-hidden shadow-xl bg-white">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 border-b border-slate-100">
                    <th className="px-10 py-6 font-black text-left uppercase text-[10px] tracking-widest">Subject Hub</th>
                    <th className="px-6 py-6 font-black text-center uppercase text-[10px] tracking-widest">Score</th>
                    <th className="px-10 py-6 font-black text-right uppercase text-[10px] tracking-widest">Accuracy</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {subjects.map((s, i) => (
                    <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-10 py-8 font-bold text-[#0F172A] text-lg uppercase tracking-tight">{s.name}</td>
                      <td className="px-6 py-8 text-center font-black text-primary tabular-nums text-2xl">{s.score.toFixed(1)}</td>
                      <td className="px-10 py-8 text-right">
                        <Badge className={cn(
                           "bg-emerald-50 text-emerald-600 border-none font-black text-sm px-5 py-1.5 rounded-xl tabular-nums shadow-sm", 
                           s.accuracy < 50 && "bg-rose-50 text-rose-600"
                        )}>
                          {s.accuracy}%
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Footer Signature Node */}
        <div className="pt-16 border-t border-slate-100 flex items-center justify-between gap-12">
          <div className="space-y-6 flex-1">
            <div className="flex items-center gap-4">
              <ShieldCheck className="h-10 w-10 text-emerald-500" />
              <div className="text-left">
                 <p className="text-lg font-black text-[#0F172A] uppercase tracking-tight">Institutional Accuracy Verified</p>
                 <p className="text-[11px] font-bold text-slate-400 mt-1 uppercase tracking-widest">Registry ID: {resultId}</p>
              </div>
            </div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed max-w-md">
               This performance report is derived from official recruitment patterns. Authenticity can be verified via the QR node or by accessing the master registry at {webUrlRaw}.
            </p>
          </div>
          <div className="h-44 w-36 bg-white border-2 border-slate-50 p-2 rounded-[2rem] shadow-2xl shrink-0 group hover:scale-105 transition-transform duration-500 flex flex-col items-center justify-center gap-3">
            <img src={qrUrl} alt="Verification QR" className="h-32 w-32 object-contain" crossOrigin="anonymous" />
            <span className="text-[8px] font-black uppercase text-primary">Verify Registry</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function AnalyticNode({ label, val, icon }: any) {
  return (
    <div className="p-8 bg-slate-50/50 rounded-[2rem] border border-slate-100 flex flex-col items-start gap-5 hover:bg-white hover:shadow-2xl transition-all duration-500 group">
      <div className="h-12 w-12 rounded-xl bg-white shadow-sm flex items-center justify-center shrink-0 border border-slate-50 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <div className="space-y-1">
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] leading-none mb-1 truncate">{label}</p>
        <p className="text-2xl font-black text-[#0F172A] leading-none tabular-nums tracking-tighter truncate">{val}</p>
      </div>
    </div>
  );
}

function MetricNode({ label, val, color }: any) {
  return (
    <div className="text-center space-y-2">
       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">{label}</p>
       <p className={cn("text-5xl font-black tabular-nums tracking-tighter", color)}>{val}</p>
    </div>
  );
}
