
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
 * @fileOverview Official Institutional Report Card v23.3 [PWA Scaling].
 * FIXED: Removed uppercase and tracking from sub-labels for cleaner Title Case look.
 * UPDATED: Optimized scaling for mobile responsive views.
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
      
      <div className="px-5 md:px-12 py-6 md:py-10 space-y-6 md:space-y-8">
        {/* HEADER HUB */}
        <div className="flex justify-between items-start border-b border-slate-100 pb-6 md:pb-8">
          <div className="flex items-center gap-4 md:gap-8">
            <div className="h-16 w-16 md:h-28 md:w-28 bg-white rounded-xl md:rounded-2xl flex items-center justify-center p-0 border border-slate-50 shadow-lg overflow-hidden shrink-0">
              {branding?.logoUrl ? (
                <img src={branding.logoUrl} alt="Logo" className="h-full w-full object-contain" crossOrigin="anonymous" />
              ) : (
                <img src="/logo/cracklix-icon.png" alt="Logo" className="h-full w-full object-contain" crossOrigin="anonymous" />
              )}
            </div>
            <div className="space-y-0.5 text-left min-w-0">
              <h2 className="text-lg md:text-3xl font-black text-[#0F172A] tracking-tighter leading-none">{orgName}</h2>
              <p className="text-[7px] md:text-[10px] font-bold text-slate-400 truncate">Official Merit Portal</p>
            </div>
          </div>
          <div className="text-right space-y-1.5 md:space-y-2 shrink-0">
            <Badge className="bg-[#0F172A] text-white border-none font-bold text-[7px] md:text-[9px] px-2 md:px-5 py-1 rounded-full uppercase">Verified Attempt</Badge>
            <p className="text-[9px] md:text-[12px] font-black text-[#0F172A] tabular-nums tracking-widest">{date}</p>
          </div>
        </div>

        {/* IDENTITY HUB */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-10 items-center">
           <div className="md:col-span-8 space-y-3 text-left">
              <div className="space-y-1">
                 <h1 className="text-xl md:text-4xl font-bold text-[#0F172A] tracking-tight leading-tight">{studentName}</h1>
                 <p className="text-primary font-bold text-sm md:text-xl tracking-tight">{examTitle}</p>
              </div>
              <div className="flex flex-wrap items-center justify-start gap-4 pt-1">
                 <div className="flex items-center gap-2 text-slate-400 font-bold text-[8px] md:text-[10px]">
                    <ShieldCheck className="h-3 w-3 md:h-4 md:w-4 text-emerald-500" /> Identity Verified
                 </div>
                 <div className="flex items-center gap-2 text-slate-400 font-bold text-[8px] md:text-[10px]">
                    <Target className="h-3 w-3 md:h-4 md:w-4 text-primary" /> Punjab Rank: #{rank}
                 </div>
              </div>
           </div>

           <div className="md:col-span-4 flex justify-center md:justify-end">
              <div className="h-24 w-24 md:h-32 md:w-32 bg-[#0F172A] rounded-2xl md:rounded-[2rem] shadow-xl flex flex-col items-center justify-center relative border-[3px] md:border-[5px] border-slate-50">
                 <span className="text-[7px] md:text-[9px] font-bold text-slate-500 mb-1">Grade</span>
                 <span className="text-3xl md:text-[60px] font-black text-white tabular-nums leading-none tracking-tighter">{grade}</span>
                 <div className="absolute -bottom-2 -right-2 md:-bottom-2.5 md:-right-2.5 h-7 w-7 md:h-10 md:w-10 bg-amber-400 rounded-lg flex items-center justify-center text-white shadow-lg border-2 border-white">
                    <Award className="h-3.5 w-3.5 md:h-5 md:w-5" />
                 </div>
              </div>
           </div>
        </div>

        {/* ANALYTICS HUB */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5 md:gap-5">
           <AnalyticNode label="Total Score" val={score} icon={<Zap className="text-primary h-3.5 w-3.5" />} />
           <AnalyticNode label="Punjab Rank" val={`#${rank}`} icon={<Trophy className="text-amber-500 h-3.5 w-3.5" />} highlight />
           <AnalyticNode label="Accuracy" val={`${accuracy}%`} icon={<Target className="text-emerald-500 h-3.5 w-3.5" />} />
           <AnalyticNode label="Percentile" val={`${percentile}%`} icon={<TrendingUp className="text-blue-500 h-3.5 w-3.5" />} />
           <AnalyticNode label="Time Taken" val={timeTaken} icon={<Clock className="text-slate-400 h-3.5 w-3.5" />} />
           <AnalyticNode label="Status" val={Number(accuracy) > 40 ? "Qualified" : "Learning"} icon={<CheckCircle2 className="text-emerald-600 h-3.5 w-3.5" />} />
        </div>

        {/* PERFORMANCE SUMMARY */}
        <div className="bg-[#F8FAFC] rounded-xl md:rounded-[1.5rem] p-5 md:p-8 flex items-center justify-around shadow-inner border border-slate-100">
           <MetricNode label="Correct" val={correct} color="text-emerald-600" />
           <div className="w-px h-8 md:h-12 bg-slate-200" />
           <MetricNode label="Wrong" val={wrong} color="text-rose-600" />
           <div className="w-px h-8 md:h-12 bg-slate-200" />
           <MetricNode label="Skipped" val={total - (correct + wrong)} color="text-slate-300" />
        </div>

        {/* SUBJECT AUDIT */}
        {subjects.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-[9px] font-bold text-slate-400 ml-2 text-left uppercase">Subject Performance Audit</h3>
            <div className="border border-slate-100 rounded-xl md:rounded-[2rem] overflow-hidden shadow-xl bg-white">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[#0F172A] text-white">
                    <th className="px-4 md:px-8 py-3 md:py-4 font-bold text-left tracking-widest uppercase text-[9px] md:text-xs">Subject</th>
                    <th className="px-2 md:px-4 py-3 md:py-4 font-bold text-center tracking-widest uppercase text-[9px] md:text-xs">Score</th>
                    <th className="px-4 md:px-8 py-3 md:py-4 font-bold text-right tracking-widest uppercase text-[9px] md:text-xs">Mastery</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {subjects.map((s, i) => (
                    <tr key={i} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 md:px-8 py-3 md:py-4 font-bold text-[#0F172A] text-xs md:text-base tracking-tight text-left">{s.name}</td>
                      <td className="px-2 md:px-4 py-3 md:py-4 text-center font-black text-primary tabular-nums text-sm md:text-xl">{s.score.toFixed(1)}</td>
                      <td className="px-4 md:px-8 py-3 md:py-4 text-right">
                        <Badge className={cn(
                           "bg-emerald-50 text-emerald-600 border-none font-bold text-[10px] md:text-base px-2 md:px-4 py-1 rounded-lg tabular-nums", 
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
        <div className="pt-6 md:pt-8 border-t border-slate-100 flex flex-col md:flex-row items-start justify-between gap-6 md:gap-10">
          <div className="bg-white border border-slate-100 p-2 md:p-3 rounded-xl md:rounded-[1.5rem] shadow-lg shrink-0 flex flex-col items-center justify-center gap-1.5">
            <img src={qrUrl} alt="Verify" className="h-20 w-20 md:h-28 md:w-28 object-contain" crossOrigin="anonymous" />
            <span className="text-[7px] md:text-[8px] font-black text-primary tracking-widest uppercase">Verify Hub</span>
          </div>

          <div className="pt-0 md:pt-1 space-y-3 md:space-y-5 flex-1 text-left min-w-0">
            <div className="space-y-1.5">
               <div className="flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 md:h-6 md:w-6 text-emerald-500 shrink-0" />
                  <p className="text-base md:text-xl font-black text-[#0F172A] tracking-tighter leading-none">Institutional Precision Verified</p>
               </div>
               <div className="pl-0 md:pl-7 min-w-0">
                  <p className="text-[7px] md:text-[8px] font-bold text-slate-400">Registry ID:</p>
                  <p className="text-[8px] md:text-[9px] font-mono font-black text-primary break-all leading-tight mt-0.5">{resultId}</p>
               </div>
            </div>
            <p className="text-[8px] md:text-[9px] font-medium text-slate-400 leading-relaxed max-w-lg">
               This report is generated based on verified recruitment patterns. Authenticity can be audited via the QR node or at {webUrlRaw.toLowerCase()}. All scores are final and synchronized with the state registry.
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
       "p-3 md:p-5 rounded-xl md:rounded-[1.5rem] border-2 flex flex-col items-start gap-2 md:gap-3 transition-all duration-500 group text-left",
       highlight ? "bg-primary/5 border-primary shadow-lg" : "bg-slate-50/50 border-slate-100 hover:bg-white hover:shadow-xl"
    )}>
      <div className="h-7 w-7 md:h-9 md:w-9 rounded-lg bg-white shadow-md flex items-center justify-center shrink-0 border border-slate-100 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <div className="space-y-0.5 w-full min-w-0">
        <p className="text-[7px] md:text-[9px] font-bold text-slate-400 leading-none mb-1 truncate">{label}</p>
        <p className={cn("text-sm md:text-xl font-black text-[#0F172A] tabular-nums tracking-tighter leading-none truncate")}>{val}</p>
      </div>
    </div>
  );
}

function MetricNode({ label, val, color }: any) {
  return (
    <div className="text-center space-y-1">
       <p className="text-[8px] md:text-[10px] font-bold text-slate-400 leading-none">{label}</p>
       <p className={cn("text-xl md:text-4xl font-black tabular-nums tracking-tighter", color)}>{val}</p>
    </div>
  );
}
