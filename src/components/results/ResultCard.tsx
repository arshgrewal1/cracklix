
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
 * @fileOverview Official Institutional Report Card v14.0 [Alignment Fixed].
 * FIXED: Reduced text sizes and normalized casing to prevent footer overlap.
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
    <div id="cracklix-result-card" className="w-[794px] min-h-[1123px] bg-white border border-slate-200 shadow-2xl rounded-none overflow-hidden text-left font-body relative p-0 mx-auto">
      <div className="h-4 w-full bg-[#0F172A]" />
      
      <div className="px-12 py-12 space-y-10">
        {/* HEADER HUB */}
        <div className="flex justify-between items-start border-b-2 border-slate-100 pb-10">
          <div className="flex items-center gap-8">
            <div className="h-24 w-24 bg-white rounded-2xl flex items-center justify-center p-0.5 border-2 border-slate-50 shadow-xl overflow-hidden shrink-0">
              {branding?.logoUrl ? (
                <img src={branding.logoUrl} alt="Logo" className="h-full w-full object-contain" crossOrigin="anonymous" />
              ) : (
                <img src="/logo/cracklix-icon.png" alt="Logo" className="h-full w-full object-contain" crossOrigin="anonymous" />
              )}
            </div>
            <div className="space-y-1 text-left">
              <h2 className="text-4xl font-black text-[#0F172A] tracking-tighter leading-none">{orgName}</h2>
              <p className="text-[11px] font-bold text-slate-400 tracking-[0.3em] uppercase">Official Merit Portal</p>
            </div>
          </div>
          <div className="text-right space-y-3">
            <Badge className="bg-[#0F172A] text-white border-none font-bold text-[10px] px-6 py-2 rounded-full tracking-widest uppercase">Verified Attempt</Badge>
            <p className="text-[14px] font-black text-[#0F172A] tabular-nums tracking-widest">{date}</p>
          </div>
        </div>

        {/* IDENTITY HUB */}
        <div className="grid grid-cols-12 gap-10 items-center">
           <div className="col-span-8 space-y-4">
              <div className="space-y-1 text-left">
                 <h1 className="text-4xl font-[800] text-[#0F172A] tracking-tight leading-none">{studentName}</h1>
                 <p className="text-primary font-bold text-xl tracking-tight mt-1">{examTitle}</p>
              </div>
              <div className="flex items-center gap-8 pt-2">
                 <div className="flex items-center gap-2 text-slate-400 font-bold text-[11px] tracking-widest uppercase">
                    <ShieldCheck className="h-4 w-4 text-emerald-500" /> Identity Verified
                 </div>
                 <div className="flex items-center gap-2 text-slate-400 font-bold text-[11px] tracking-widest uppercase">
                    <Target className="h-4 w-4 text-primary" /> Punjab Rank: #{rank}
                 </div>
              </div>
           </div>

           <div className="col-span-4 flex justify-end">
              <div className="h-36 w-36 bg-[#0F172A] rounded-[2.5rem] shadow-xl flex flex-col items-center justify-center relative border-[6px] border-slate-50">
                 <span className="text-[10px] font-bold text-slate-500 tracking-widest mb-1 uppercase">Grade</span>
                 <span className="text-[80px] font-black text-white tabular-nums leading-none tracking-tighter">{grade}</span>
                 <div className="absolute -bottom-3 -right-3 h-11 w-11 bg-amber-400 rounded-xl flex items-center justify-center text-white shadow-lg border-2 border-white">
                    <Award className="h-6 w-6" />
                 </div>
              </div>
           </div>
        </div>

        {/* ANALYTICS HUB */}
        <div className="grid grid-cols-3 gap-5">
           <AnalyticNode label="Total Score" val={score} icon={<Zap className="text-primary h-5 w-5" />} />
           <AnalyticNode label="Punjab Rank" val={`#${rank}`} icon={<Trophy className="text-amber-500 h-5 w-5" />} highlight />
           <AnalyticNode label="Accuracy" val={`${accuracy}%`} icon={<Target className="text-emerald-500 h-5 w-5" />} />
           <AnalyticNode label="Percentile" val={`${percentile}%`} icon={<TrendingUp className="text-blue-500 h-5 w-5" />} />
           <AnalyticNode label="Time Taken" val={timeTaken} icon={<Clock className="text-slate-400 h-5 w-5" />} />
           <AnalyticNode label="Status" val={Number(accuracy) > 40 ? "Qualified" : "Learning"} icon={<CheckCircle2 className="text-emerald-600 h-5 w-5" />} />
        </div>

        {/* PERFORMANCE SUMMARY */}
        <div className="bg-[#F8FAFC] rounded-[2rem] p-10 flex items-center justify-around shadow-inner border border-slate-100">
           <MetricNode label="Correct" val={correct} color="text-emerald-600" />
           <div className="w-px h-16 bg-slate-200" />
           <MetricNode label="Wrong" val={wrong} color="text-rose-600" />
           <div className="w-px h-16 bg-slate-200" />
           <MetricNode label="Skipped" val={total - (correct + wrong)} color="text-slate-300" />
        </div>

        {/* SUBJECT AUDIT */}
        {subjects.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-[10px] font-bold text-slate-400 tracking-[0.4em] ml-2 uppercase text-left">Subject Performance Audit</h3>
            <div className="border border-slate-100 rounded-[2rem] overflow-hidden shadow-xl bg-white">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[#0F172A] text-white">
                    <th className="px-8 py-5 font-bold text-left tracking-widest uppercase">Subject Hub</th>
                    <th className="px-4 py-5 font-bold text-center tracking-widest uppercase">Score</th>
                    <th className="px-8 py-5 font-bold text-right tracking-widest uppercase">Mastery</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {subjects.map((s, i) => (
                    <tr key={i} className="hover:bg-slate-50 transition-colors">
                      <td className="px-8 py-5 font-bold text-[#0F172A] text-lg tracking-tight text-left">{s.name}</td>
                      <td className="px-4 py-5 text-center font-black text-primary tabular-nums text-2xl">{s.score.toFixed(1)}</td>
                      <td className="px-8 py-5 text-right">
                        <Badge className={cn(
                           "bg-emerald-50 text-emerald-600 border-none font-bold text-lg px-6 py-2 rounded-xl tabular-nums", 
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
        <div className="pt-10 border-t-2 border-slate-100 flex flex-row items-start justify-between gap-10">
          <div className="bg-white border-2 border-slate-100 p-4 rounded-[2rem] shadow-lg shrink-0 flex flex-col items-center justify-center gap-3">
            <img src={qrUrl} alt="Verify" className="h-32 w-32 object-contain" crossOrigin="anonymous" />
            <span className="text-[9px] font-black text-primary tracking-widest uppercase">Verify Hub</span>
          </div>

          <div className="pt-2 space-y-6 flex-1 text-left">
            <div className="space-y-1.5">
               <div className="flex items-center gap-3">
                  <ShieldCheck className="h-8 w-8 text-emerald-500" />
                  <p className="text-2xl font-black text-[#0F172A] tracking-tighter leading-none uppercase">Institutional Precision Verified</p>
               </div>
               <div className="pl-11">
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Registry ID:</p>
                  <p className="text-xs font-mono font-black text-primary break-all max-w-md">{resultId}</p>
               </div>
            </div>
            <p className="text-[10px] font-bold text-slate-300 tracking-tight leading-relaxed max-w-lg uppercase">
               This report is generated based on verified recruitment patterns. Authenticity can be audited via the QR node or at {webUrlRaw.toLowerCase()}.
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
       "p-6 rounded-[2rem] border-2 flex flex-col items-start gap-4 transition-all duration-500 group text-left",
       highlight ? "bg-primary/5 border-primary shadow-lg" : "bg-slate-50/50 border-slate-100 hover:bg-white hover:shadow-xl"
    )}>
      <div className="h-10 w-10 rounded-xl bg-white shadow-md flex items-center justify-center shrink-0 border border-slate-100 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <div className="space-y-0.5">
        <p className="text-[9px] font-bold text-slate-400 tracking-widest uppercase leading-none mb-1">{label}</p>
        <p className="text-xl md:text-2xl font-black text-[#0F172A] leading-none tabular-nums tracking-tighter">{val}</p>
      </div>
    </div>
  );
}

function MetricNode({ label, val, color }: any) {
  return (
    <div className="text-center space-y-1">
       <p className="text-[11px] font-bold text-slate-400 tracking-widest leading-none uppercase">{label}</p>
       <p className={cn("text-5xl font-black tabular-nums tracking-tighter", color)}>{val}</p>
    </div>
  );
}
