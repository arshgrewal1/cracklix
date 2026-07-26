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
 * @fileOverview Official Institutional Report Card v24.0 [High-Fidelity Export Ready].
 * HARDENED: Optimized colors and alignment for binary PNG capture and A4 PDF insertion.
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
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(fullVerifyUrl)}`;

  return (
    <div 
      id="cracklix-result-card" 
      className="w-full max-w-full print:w-[210mm] min-h-auto print:min-h-[297mm] bg-white border border-slate-200 shadow-none overflow-hidden text-left font-body relative p-0 mx-auto box-border"
    >
      <div className="h-2 md:h-3 w-full bg-[#0F172A]" />
      
      <div className="px-5 md:px-12 py-6 md:py-10 space-y-6 md:space-y-10">
        {/* HEADER HUB */}
        <div className="flex justify-between items-start border-b border-slate-100 pb-6 md:pb-10">
          <div className="flex items-center gap-4 md:gap-8">
            <div className="h-16 w-16 md:h-28 md:w-28 bg-white rounded-xl md:rounded-2xl flex items-center justify-center p-0 border border-slate-100 shadow-lg overflow-hidden shrink-0">
              {branding?.logoUrl ? (
                <img src={branding.logoUrl} alt="Logo" className="h-full w-full object-contain" crossOrigin="anonymous" referrerPolicy="no-referrer" />
              ) : (
                <img src="/logo/cracklix-icon.png" alt="Logo" className="h-full w-full object-contain" crossOrigin="anonymous" referrerPolicy="no-referrer" />
              )}
            </div>
            <div className="space-y-1 text-left min-w-0">
              <h2 className="text-xl md:text-4xl font-black text-[#0F172A] tracking-tighter leading-none">{orgName}</h2>
              <p className="text-[8px] md:text-[11px] font-bold text-slate-500 uppercase tracking-widest truncate">Official Merit Portal</p>
            </div>
          </div>
          <div className="text-right space-y-2 md:space-y-3 shrink-0">
            <Badge className="bg-[#0F172A] text-white border-none font-bold text-[8px] md:text-[10px] px-3 md:px-6 py-1.5 rounded-full uppercase tracking-widest shadow-md">Verified Attempt</Badge>
            <p className="text-[10px] md:text-[14px] font-black text-[#0F172A] tabular-nums tracking-widest">{date}</p>
          </div>
        </div>

        {/* IDENTITY HUB */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-10 items-center">
           <div className="md:col-span-8 space-y-4 text-left">
              <div className="space-y-1.5">
                 <h1 className="text-2xl md:text-5xl font-black text-[#0F172A] tracking-tight leading-tight">{studentName}</h1>
                 <p className="text-primary font-black text-base md:text-2xl tracking-tight">{examTitle}</p>
              </div>
              <div className="flex flex-wrap items-center justify-start gap-5 pt-2">
                 <div className="flex items-center gap-2.5 text-slate-500 font-bold text-[9px] md:text-[11px] uppercase tracking-tight">
                    <ShieldCheck className="h-4 w-4 md:h-5 md:w-5 text-emerald-500" /> Identity Verified
                 </div>
                 <div className="flex items-center gap-2.5 text-slate-500 font-bold text-[9px] md:text-[11px] uppercase tracking-tight">
                    <Target className="h-4 w-4 md:h-5 md:w-5 text-primary" /> Punjab Rank: #{rank}
                 </div>
              </div>
           </div>

           <div className="md:col-span-4 flex justify-center md:justify-end">
              <div className="h-28 w-28 md:h-40 md:w-40 bg-[#0F172A] rounded-2xl md:rounded-[2.5rem] shadow-2xl flex flex-col items-center justify-center relative border-[4px] md:border-[6px] border-white">
                 <span className="text-[8px] md:text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-widest">Grade</span>
                 <span className="text-4xl md:text-[72px] font-black text-white tabular-nums leading-none tracking-tighter">{grade}</span>
                 <div className="absolute -bottom-2 -right-2 md:-bottom-3 md:-right-3 h-8 w-8 md:h-12 md:w-12 bg-amber-400 rounded-xl flex items-center justify-center text-white shadow-xl border-2 border-white">
                    <Award className="h-4 w-4 md:h-6 md:w-6" />
                 </div>
              </div>
           </div>
        </div>

        {/* ANALYTICS HUB */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-6">
           <AnalyticNode label="Total Score" val={score} icon={<Zap className="text-primary h-4 w-4" />} />
           <AnalyticNode label="Punjab Rank" val={`#${rank}`} icon={<Trophy className="text-amber-500 h-4 w-4" />} highlight />
           <AnalyticNode label="Accuracy" val={`${accuracy}%`} icon={<Target className="text-emerald-500 h-4 w-4" />} />
           <AnalyticNode label="Percentile" val={`${percentile}%`} icon={<TrendingUp className="text-blue-500 h-4 w-4" />} />
           <AnalyticNode label="Time Taken" val={timeTaken} icon={<Clock className="text-slate-500 h-4 w-4" />} />
           <AnalyticNode label="Status" val={Number(accuracy) > 40 ? "Qualified" : "Learning"} icon={<CheckCircle2 className="text-emerald-600 h-4 w-4" />} />
        </div>

        {/* PERFORMANCE SUMMARY */}
        <div className="bg-[#F8FAFC] rounded-2xl md:rounded-[2rem] p-6 md:p-10 flex items-center justify-around shadow-inner border border-slate-100">
           <MetricNode label="Correct" val={correct} color="text-emerald-600" />
           <div className="w-px h-10 md:h-16 bg-slate-200" />
           <MetricNode label="Wrong" val={wrong} color="text-rose-600" />
           <div className="w-px h-10 md:h-16 bg-slate-200" />
           <MetricNode label="Skipped" val={total - (correct + wrong)} color="text-slate-400" />
        </div>

        {/* SUBJECT AUDIT */}
        {subjects.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-[10px] font-black text-slate-500 ml-2 text-left uppercase tracking-[0.2em]">Subject Performance Audit</h3>
            <div className="border border-slate-100 rounded-2xl md:rounded-[2.5rem] overflow-hidden shadow-2xl bg-white">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[#0F172A] text-white">
                    <th className="px-6 md:px-10 py-4 md:py-5 font-black text-left tracking-[0.2em] uppercase text-[9px] md:text-xs">Subject Node</th>
                    <th className="px-3 md:px-6 py-4 md:py-5 font-black text-center tracking-[0.2em] uppercase text-[9px] md:text-xs">Score</th>
                    <th className="px-6 md:px-10 py-4 md:py-5 font-black text-right tracking-[0.2em] uppercase text-[9px] md:text-xs">Mastery</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {subjects.map((s, i) => (
                    <tr key={i} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 md:px-10 py-4 md:py-6 font-bold text-[#0F172A] text-sm md:text-lg tracking-tight text-left">{s.name}</td>
                      <td className="px-3 md:px-6 py-4 md:py-6 text-center font-black text-primary tabular-nums text-base md:text-2xl">{s.score.toFixed(1)}</td>
                      <td className="px-6 md:px-10 py-4 md:py-6 text-right">
                        <Badge className={cn(
                           "bg-emerald-50 text-emerald-600 border-none font-black text-[10px] md:text-lg px-3 md:px-6 py-1.5 rounded-xl tabular-nums shadow-sm", 
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
        <div className="pt-8 md:pt-12 border-t border-slate-100 flex flex-col md:flex-row items-start justify-between gap-8 md:gap-14">
          <div className="bg-white border border-slate-200 p-3 md:p-4 rounded-2xl md:rounded-[2rem] shadow-2xl shrink-0 flex flex-col items-center justify-center gap-2">
            <img src={qrUrl} alt="Verify" className="h-24 w-24 md:h-32 md:w-32 object-contain" crossOrigin="anonymous" referrerPolicy="no-referrer" />
            <span className="text-[8px] md:text-[9px] font-black text-primary tracking-[0.3em] uppercase">Verify Hub</span>
          </div>

          <div className="pt-0 md:pt-2 space-y-4 md:space-y-6 flex-1 text-left min-w-0">
            <div className="space-y-2 md:space-y-3">
               <div className="flex items-center gap-3">
                  <ShieldCheck className="h-6 w-6 md:h-8 md:w-8 text-emerald-500 shrink-0" />
                  <p className="text-lg md:text-2xl font-[900] text-[#0F172A] tracking-tighter leading-none">Institutional Precision Verified</p>
               </div>
               <div className="pl-0 md:pl-11 min-w-0">
                  <p className="text-[8px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest">Registry ID Node:</p>
                  <p className="text-[10px] md:text-[12px] font-mono font-black text-primary break-all leading-tight mt-1">{resultId}</p>
               </div>
            </div>
            <p className="text-[9px] md:text-[12px] font-medium text-slate-500 leading-relaxed max-w-xl">
               This high-fidelity report is generated based on verified recruitment patterns. Authenticity can be audited via the binary QR node or at {webUrlRaw.toLowerCase()}. All performance nodes are final and synchronized with the master state registry.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function AnalyticNode({ label, val, icon, highlight }: any) {
  return (
    <div className={cn(
       "p-4 md:p-6 rounded-2xl md:rounded-[2rem] border-2 flex flex-col items-start gap-3 md:gap-4 transition-all duration-500 group text-left",
       highlight ? "bg-primary/5 border-primary shadow-xl" : "bg-white border-slate-100 hover:border-slate-300 hover:shadow-2xl"
    )}>
      <div className="h-8 w-8 md:h-11 md:w-11 rounded-xl bg-slate-50 flex items-center justify-center shrink-0 border border-slate-100 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <div className="space-y-0.5 w-full min-w-0">
        <p className="text-[8px] md:text-[10px] font-bold text-slate-500 leading-none mb-1.5 uppercase tracking-widest truncate">{label}</p>
        <p className={cn("text-base md:text-2xl font-black text-[#0F172A] tabular-nums tracking-tighter leading-none truncate")}>{val}</p>
      </div>
    </div>
  );
}

function MetricNode({ label, val, color }: any) {
  return (
    <div className="text-center space-y-1.5">
       <p className="text-[9px] md:text-[12px] font-bold text-slate-500 leading-none uppercase tracking-[0.2em]">{label}</p>
       <p className={cn("text-2xl md:text-[54px] font-black tabular-nums tracking-tighter leading-none", color)}>{val}</p>
    </div>
  );
}
