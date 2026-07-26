'use client';

import React from 'react';
import { 
  ShieldCheck, 
  Trophy, 
  Zap, 
  Target, 
  TrendingUp, 
  Clock, 
  Award,
  CheckCircle2
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
 * @fileOverview Official Institutional Report Card v11.0 [Typography Refined].
 * FIXED: Removed global uppercase on content fields. Standardized labels to Title Case.
 * FIXED: QR Code layout padding to prevent clipping.
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
  
  const orgName = (branding?.organizationName || "Cracklix");
  const webUrlRaw = (branding?.websiteUrl || "www.cracklix.com");
  const verifyBase = branding?.verificationUrl || `${webUrlRaw}/results/view?id=`;
  const fullVerifyUrl = verifyBase + resultId;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(fullVerifyUrl)}`;

  return (
    <div id="cracklix-result-card" className="w-[794px] min-h-[1123px] bg-white border border-slate-200 shadow-2xl rounded-none overflow-hidden text-left font-body relative p-0">
      <div className="h-4 w-full bg-[#0F172A]" />
      
      <div className="p-16 space-y-12">
        {/* HEADER HUB */}
        <div className="flex justify-between items-start border-b-4 border-slate-100 pb-12">
          <div className="flex items-center gap-10">
            <div className="h-32 w-32 bg-white rounded-3xl flex items-center justify-center p-0 border-2 border-slate-50 shadow-2xl overflow-hidden shrink-0">
              {branding?.logoUrl ? (
                <img src={branding.logoUrl} alt="Logo" className="h-full w-full object-contain" crossOrigin="anonymous" />
              ) : (
                <img src="/logo/cracklix-icon.png" alt="Logo" className="h-full w-full object-contain" crossOrigin="anonymous" />
              )}
            </div>
            <div className="space-y-1">
              <h2 className="text-5xl font-black text-[#0F172A] tracking-tighter leading-none">{orgName}</h2>
              <p className="text-[14px] font-bold text-slate-400 tracking-[0.4em] uppercase">Official Merit Portal</p>
            </div>
          </div>
          <div className="text-right space-y-4">
            <Badge className="bg-[#0F172A] text-white border-none font-bold text-[12px] px-8 py-3 rounded-full tracking-widest uppercase shadow-xl">Verified Attempt</Badge>
            <p className="text-[16px] font-black text-[#0F172A] tracking-widest tabular-nums">{date}</p>
          </div>
        </div>

        {/* IDENTITY HUB */}
        <div className="grid grid-cols-12 gap-10 items-center">
           <div className="col-span-8 space-y-6">
              <div className="space-y-2">
                 <h1 className="text-5xl font-black text-[#0F172A] tracking-tight leading-none">{studentName}</h1>
                 <p className="text-primary font-bold text-2xl tracking-tight mt-1">{examTitle}</p>
              </div>
              <div className="flex items-center gap-8 pt-2">
                 <div className="flex items-center gap-3 text-slate-400 font-bold text-[12px] tracking-widest uppercase">
                    <ShieldCheck className="h-5 w-5 text-emerald-500" /> Identity Verified
                 </div>
                 <div className="flex items-center gap-3 text-slate-400 font-bold text-[12px] tracking-widest uppercase">
                    <Target className="h-5 w-5 text-primary" /> Entry ID: {resultId.slice(-8)}
                 </div>
              </div>
           </div>

           <div className="col-span-4 flex justify-end">
              <div className="h-44 w-44 bg-[#0F172A] rounded-[3rem] shadow-2xl flex flex-col items-center justify-center relative border-8 border-slate-50">
                 <span className="text-[12px] font-bold text-slate-500 tracking-widest mb-1 uppercase">Grade</span>
                 <span className="text-[100px] font-black text-white tabular-nums leading-none tracking-tighter">{grade}</span>
                 <div className="absolute -bottom-5 -right-5 h-14 w-14 bg-amber-400 rounded-2xl flex items-center justify-center text-white shadow-xl border-4 border-white">
                    <Award className="h-8 w-8" />
                 </div>
              </div>
           </div>
        </div>

        {/* ANALYTICS HUB */}
        <div className="grid grid-cols-3 gap-6">
           <AnalyticNode label="Total Score" val={score} icon={<Zap className="text-primary" />} />
           <AnalyticNode label="Punjab Rank" val={`#${rank}`} icon={<Trophy className="text-amber-500" />} highlight />
           <AnalyticNode label="Accuracy" val={`${accuracy}%`} icon={<Target className="text-emerald-500" />} />
           <AnalyticNode label="Percentile" val={`${percentile}%`} icon={<TrendingUp className="text-blue-500" />} />
           <AnalyticNode label="Time Taken" val={timeTaken} icon={<Clock className="text-slate-400" />} />
           <AnalyticNode label="Status" val={Number(accuracy) > 40 ? "Qualified" : "Learning"} icon={<CheckCircle2 className="text-emerald-600" />} />
        </div>

        {/* PERFORMANCE SUMMARY */}
        <div className="bg-[#F8FAFC] rounded-[3rem] p-12 flex items-center justify-around shadow-inner border-2 border-slate-100">
           <MetricNode label="Correct" val={correct} color="text-emerald-600" />
           <div className="w-1 h-24 bg-slate-200" />
           <MetricNode label="Mistakes" val={wrong} color="text-rose-600" />
           <div className="w-1 h-24 bg-slate-200" />
           <MetricNode label="Skipped" val={total - (correct + wrong)} color="text-slate-300" />
        </div>

        {/* SUBJECT AUDIT */}
        {subjects.length > 0 && (
          <div className="space-y-6">
            <h3 className="text-xs font-bold text-slate-400 tracking-[0.4em] ml-2 uppercase">Subject performance audit</h3>
            <div className="border-4 border-slate-100 rounded-[3rem] overflow-hidden shadow-2xl bg-white">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[#0F172A] text-white">
                    <th className="px-10 py-8 font-bold text-left tracking-widest uppercase">Subject Hub</th>
                    <th className="px-6 py-8 font-bold text-center tracking-widest uppercase">Score</th>
                    <th className="px-10 py-8 font-bold text-right tracking-widest uppercase">Mastery</th>
                  </tr>
                </thead>
                <tbody className="divide-y-4 divide-slate-50">
                  {subjects.map((s, i) => (
                    <tr key={i} className="hover:bg-slate-50 transition-colors">
                      <td className="px-10 py-8 font-bold text-[#0F172A] text-2xl tracking-tight">{s.name}</td>
                      <td className="px-6 py-8 text-center font-black text-primary tabular-nums text-4xl">{s.score.toFixed(1)}</td>
                      <td className="px-10 py-8 text-right">
                        <Badge className={cn(
                           "bg-emerald-50 text-emerald-600 border-none font-bold text-2xl px-8 py-3 rounded-2xl tabular-nums shadow-sm", 
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

        {/* FOOTER VERIFICATION */}
        <div className="pt-20 border-t-4 border-slate-100 flex items-center justify-between gap-16">
          <div className="space-y-6 flex-1">
            <div className="flex items-center gap-6">
              <ShieldCheck className="h-14 w-14 text-emerald-500" />
              <div className="text-left">
                 <p className="text-3xl font-black text-[#0F172A] tracking-tighter leading-none">Institutional Precision Verified</p>
                 <p className="text-[14px] font-bold text-slate-400 mt-2 tracking-widest uppercase">Registry ID: {resultId}</p>
              </div>
            </div>
            <p className="text-[12px] font-medium text-slate-400 tracking-tight leading-relaxed max-w-xl">
               This report is generated based on verified recruitment patterns. Authenticity can be audited via the QR node or at {webUrlRaw.toLowerCase()}.
            </p>
          </div>
          <div className="h-64 w-52 bg-white border-4 border-slate-100 p-6 rounded-[3rem] shadow-4xl shrink-0 group hover:scale-105 transition-transform duration-500 flex flex-col items-center justify-center gap-4">
            <img src={qrUrl} alt="Verify" className="h-40 w-40 object-contain" crossOrigin="anonymous" />
            <span className="text-[11px] font-bold text-primary tracking-widest uppercase">Verify Hub</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function AnalyticNode({ label, val, icon, highlight }: any) {
  return (
    <div className={cn(
       "p-8 rounded-[2.5rem] border-4 flex flex-col items-start gap-6 transition-all duration-500 group",
       highlight ? "bg-primary/5 border-primary shadow-xl" : "bg-slate-50/50 border-slate-100 hover:bg-white hover:shadow-2xl"
    )}>
      <div className="h-14 w-14 rounded-2xl bg-white shadow-lg flex items-center justify-center shrink-0 border-2 border-slate-100 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <div className="space-y-1">
        <p className="text-[11px] font-bold text-slate-400 tracking-widest uppercase leading-none mb-1">{label}</p>
        <p className="text-3xl font-black text-[#0F172A] leading-none tabular-nums tracking-tighter">{val}</p>
      </div>
    </div>
  );
}

function MetricNode({ label, val, color }: any) {
  return (
    <div className="text-center space-y-2">
       <p className="text-[14px] font-bold text-slate-400 tracking-widest leading-none uppercase">{label}</p>
       <p className={cn("text-7xl font-black tabular-nums tracking-tighter", color)}>{val}</p>
    </div>
  );
}
