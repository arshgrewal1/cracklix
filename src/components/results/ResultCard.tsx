
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
 * @fileOverview Official Institutional Result Card v9.0 [A4 Optimized & ALL CAPS].
 * FIXED: Optimized container width for exact A4 (794px) scaling.
 * UPDATED: Enforced Uppercase institutional branding.
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
  
  const orgName = (branding?.organizationName || "CRACKLIX").toUpperCase();
  const webUrlRaw = branding?.websiteUrl || "WWW.CRACKLIX.COM";
  const verifyBase = branding?.verificationUrl || `${webUrlRaw}/RESULTS/VIEW?ID=`;
  const fullVerifyUrl = verifyBase + resultId;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(fullVerifyUrl)}`;

  return (
    <div className="w-[794px] min-h-[1123px] bg-white border border-slate-200 shadow-2xl rounded-none overflow-hidden text-left font-body relative uppercase p-0">
      <div className="h-3 w-full bg-[#0F172A]" />
      
      <div className="p-16 space-y-12">
        {/* Institutional Header - Maximized Logo Zoom */}
        <div className="flex justify-between items-start border-b-2 border-slate-100 pb-12">
          <div className="flex items-center gap-10">
            <div className="h-56 w-56 bg-white rounded-3xl flex items-center justify-center p-0 border-2 border-slate-50 shadow-2xl overflow-hidden shrink-0">
              {branding?.logoUrl ? (
                <img src={branding.logoUrl} alt="CRACKLIX" className="h-full w-full object-contain" crossOrigin="anonymous" />
              ) : (
                <img src="/logo/cracklix-icon.png" alt="CRACKLIX" className="h-full w-full object-contain" crossOrigin="anonymous" />
              )}
            </div>
            <div className="space-y-1">
              <h2 className="text-5xl font-black text-[#0F172A] tracking-tighter leading-none">{orgName}</h2>
              <p className="text-[12px] font-black text-slate-400 tracking-[0.5em] mt-2">OFFICIAL MERIT PORTAL</p>
            </div>
          </div>
          <div className="text-right space-y-4">
            <Badge className="bg-[#0F172A] text-white border-none font-black text-[10px] px-6 py-2 rounded-full tracking-widest shadow-xl">VERIFIED ATTEMPT</Badge>
            <p className="text-[14px] font-black text-[#0F172A] tracking-widest tabular-nums">{date}</p>
          </div>
        </div>

        {/* Identity Node */}
        <div className="grid grid-cols-12 gap-10 items-center">
           <div className="col-span-8 space-y-6">
              <div className="space-y-1">
                 <h1 className="text-5xl font-black text-[#0F172A] tracking-tighter leading-none">{studentName}</h1>
                 <p className="text-primary font-black text-lg tracking-[0.2em] mt-2">{examTitle}</p>
              </div>
              <div className="flex items-center gap-8 pt-2">
                 <div className="flex items-center gap-3 text-slate-400 font-black text-[10px] tracking-widest">
                    <ShieldCheck className="h-6 w-6 text-emerald-500" /> IDENTITY VERIFIED
                 </div>
                 <div className="flex items-center gap-3 text-slate-400 font-black text-[10px] tracking-widest">
                    <Target className="h-6 w-6 text-primary" /> NODE ID: {resultId.slice(-12).toUpperCase()}
                 </div>
              </div>
           </div>

           <div className="col-span-4 flex justify-end">
              <div className="h-40 w-40 bg-[#0F172A] rounded-[2.5rem] shadow-2xl flex flex-col items-center justify-center relative group border-4 border-primary/20">
                 <div className="absolute top-0 left-0 w-full h-full bg-primary opacity-5 animate-pulse" />
                 <span className="text-[10px] font-black text-primary tracking-widest mb-1">GRADE</span>
                 <span className="text-7xl font-black text-white tabular-nums leading-none">{grade}</span>
                 <div className="absolute -bottom-4 -right-4 h-12 w-12 bg-amber-400 rounded-2xl flex items-center justify-center text-white shadow-xl border-4 border-white">
                    <Award className="h-6 w-6" />
                 </div>
              </div>
           </div>
        </div>

        {/* Analytics Matrix */}
        <div className="grid grid-cols-3 gap-6">
           <AnalyticNode label="TOTAL SCORE" val={score} icon={<Zap className="text-primary" />} />
           <AnalyticNode label="ALL PUNJAB RANK" val={`#${rank}`} icon={<Trophy className="text-amber-500" />} highlight />
           <AnalyticNode label="ACCURACY" val={`${accuracy}%`} icon={<Target className="text-emerald-500" />} />
           <AnalyticNode label="PERCENTILE" val={`${percentile}%`} icon={<TrendingUp className="text-blue-500" />} />
           <AnalyticNode label="TIME TAKEN" val={timeTaken} icon={<Clock className="text-slate-400" />} />
           <AnalyticNode label="STATUS" val={Number(accuracy) > 40 ? "QUALIFIED" : "LEARNING"} icon={<CheckCircle2 className="text-emerald-600" />} />
        </div>

        {/* Performance Hub */}
        <div className="bg-[#F8FAFC] rounded-[3rem] p-12 flex items-center justify-around shadow-inner border-2 border-slate-100">
           <MetricNode label="CORRECT" val={correct} color="text-emerald-600" />
           <div className="w-0.5 h-20 bg-slate-200" />
           <MetricNode label="MISTAKES" val={wrong} color="text-rose-600" />
           <div className="w-0.5 h-20 bg-slate-200" />
           <MetricNode label="SKIPPED" val={total - (correct + wrong)} color="text-slate-300" />
        </div>

        {/* Vertical Performance Audit */}
        {subjects.length > 0 && (
          <div className="space-y-8">
            <h3 className="text-sm font-black text-slate-400 tracking-[0.5em] ml-2">SUBJECT PERFORMANCE HUB</h3>
            <div className="border-2 border-slate-100 rounded-[2.5rem] overflow-hidden shadow-2xl bg-white">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[#0F172A] text-white">
                    <th className="px-10 py-6 font-black text-left tracking-[0.2em] uppercase">SUBJECT HUB</th>
                    <th className="px-6 py-6 font-black text-center tracking-[0.2em] uppercase">SCORE</th>
                    <th className="px-10 py-6 font-black text-right tracking-[0.2em] uppercase">MASTERY</th>
                  </tr>
                </thead>
                <tbody className="divide-y-2 divide-slate-50">
                  {subjects.map((s, i) => (
                    <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-10 py-8 font-black text-[#0F172A] text-xl tracking-tight">{s.name}</td>
                      <td className="px-6 py-8 text-center font-black text-primary tabular-nums text-3xl">{s.score.toFixed(1)}</td>
                      <td className="px-10 py-8 text-right">
                        <Badge className={cn(
                           "bg-emerald-50 text-emerald-600 border-none font-black text-lg px-6 py-2 rounded-xl tabular-nums shadow-sm", 
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
        <div className="pt-20 border-t-2 border-slate-100 flex items-center justify-between gap-16">
          <div className="space-y-8 flex-1">
            <div className="flex items-center gap-5">
              <ShieldCheck className="h-12 w-12 text-emerald-500" />
              <div className="text-left">
                 <p className="text-2xl font-black text-[#0F172A] tracking-tighter">INSTITUTIONAL PRECISION VERIFIED</p>
                 <p className="text-xs font-black text-slate-400 mt-1 tracking-widest">REGISTRY NODE: {resultId}</p>
              </div>
            </div>
            <p className="text-[11px] font-black text-slate-400 tracking-[0.2em] leading-relaxed max-w-lg">
               THIS PERFORMANCE REPORT IS GENERATED BASED ON OFFICIAL RECRUITMENT PATTERNS. AUTHENTICITY CAN BE VERIFIED VIA THE QR NODE OR BY ACCESSING THE MASTER REGISTRY AT {webUrlRaw}.
            </p>
          </div>
          <div className="h-56 w-44 bg-white border-2 border-slate-100 p-3 rounded-[2.5rem] shadow-4xl shrink-0 group hover:scale-105 transition-transform duration-500 flex flex-col items-center justify-center gap-4">
            <img src={qrUrl} alt="VERIFY" className="h-40 w-40 object-contain" crossOrigin="anonymous" />
            <span className="text-[10px] font-black text-primary tracking-widest">VERIFY HUB</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function AnalyticNode({ label, val, icon, highlight }: any) {
  return (
    <div className={cn(
       "p-8 rounded-[2.5rem] border-2 flex flex-col items-start gap-6 transition-all duration-500 group",
       highlight ? "bg-primary/5 border-primary shadow-xl" : "bg-slate-50/50 border-slate-100 hover:bg-white hover:shadow-2xl"
    )}>
      <div className="h-14 w-14 rounded-2xl bg-white shadow-lg flex items-center justify-center shrink-0 border border-slate-100 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <div className="space-y-1">
        <p className="text-[10px] font-black text-slate-400 tracking-[0.2em] leading-none mb-1">{label}</p>
        <p className="text-3xl font-black text-[#0F172A] leading-none tabular-nums tracking-tighter">{val}</p>
      </div>
    </div>
  );
}

function MetricNode({ label, val, color }: any) {
  return (
    <div className="text-center space-y-2">
       <p className="text-[12px] font-black text-slate-400 tracking-[0.3em] leading-none">{label}</p>
       <p className={cn("text-7xl font-black tabular-nums tracking-tighter", color)}>{val}</p>
    </div>
  );
}
