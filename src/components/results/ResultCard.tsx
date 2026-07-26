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
  isForPdf?: boolean;
}

/**
 * @fileOverview Official Institutional Result Card v6.0.
 * Rebuild: Integrated Grade Hub and attempt-isolated metrics.
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
  const displayUrl = webUrlRaw.replace(/^https?:\/\//, '');
  const verifyBase = branding?.verificationUrl || `${webUrlRaw}/results/view?id=`;
  const fullVerifyUrl = verifyBase + resultId;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(fullVerifyUrl)}`;

  return (
    <div className="w-full max-w-[800px] mx-auto bg-white border border-slate-200 shadow-2xl rounded-[2.5rem] md:rounded-[3.5rem] overflow-hidden text-left font-body relative">
      <div className="h-3 w-full bg-primary" />
      
      <div className="p-10 md:p-16 space-y-12">
        {/* Header Hub */}
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-6">
            <div className="h-20 w-20 bg-slate-50 rounded-2xl flex items-center justify-center p-3 border border-slate-100 shadow-inner">
              {branding?.logoUrl ? (
                <img src={branding.logoUrl} alt="Logo" className="h-full w-full object-contain" crossOrigin="anonymous" />
              ) : (
                <img src="/logo/cracklix-icon.png" alt="Logo" className="h-full w-full object-contain" crossOrigin="anonymous" />
              )}
            </div>
            <div className="space-y-1">
              <h2 className="text-3xl font-black text-[#0F172A] tracking-tighter">{orgName}</h2>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Official score report</p>
            </div>
          </div>
          <div className="text-right space-y-3">
            <Badge className="bg-emerald-50 text-emerald-600 border-none font-black text-[10px] px-4 py-1.5 rounded-full uppercase tracking-widest shadow-sm">Verified Node</Badge>
            <p className="text-[11px] font-bold text-slate-300 uppercase tracking-widest tabular-nums">{date}</p>
          </div>
        </div>

        {/* Grade & Identity Hub */}
        <div className="relative p-10 bg-slate-50/80 rounded-[3rem] border border-slate-100 flex items-center justify-between overflow-hidden group">
           <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:rotate-12 transition-transform duration-1000"><Trophy className="h-48 w-48 text-[#0F172A]" /></div>
           
           <div className="space-y-4 relative z-10">
              <div className="space-y-1">
                 <h1 className="text-3xl md:text-5xl font-black text-[#0F172A] uppercase tracking-tighter">{studentName}</h1>
                 <p className="text-primary font-black text-[11px] md:text-sm uppercase tracking-[0.3em]">{examTitle}</p>
              </div>
              <div className="flex items-center gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                 <ShieldCheck className="h-4 w-4 text-emerald-500" /> Authorized registry attempt
              </div>
           </div>

           <div className="relative z-10 shrink-0 text-center space-y-2">
              <div className="h-24 w-24 md:h-32 md:w-32 bg-white rounded-[2rem] shadow-2xl border-4 border-white flex items-center justify-center relative">
                 <span className="text-4xl md:text-6xl font-black text-primary tabular-nums">{grade}</span>
                 <div className="absolute -top-3 -right-3 h-10 w-10 bg-amber-400 rounded-xl flex items-center justify-center text-white shadow-xl border-4 border-white">
                    <Award className="h-5 w-5" />
                 </div>
              </div>
              <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Performance Grade</p>
           </div>
        </div>

        {/* Matrix Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
           <ReportNode label="Mastery Index" val={`${accuracy}%`} icon={<Target className="text-emerald-500" />} />
           <ReportNode label="Total Score" val={score} icon={<Zap className="text-primary" />} />
           <ReportNode label="State Rank" val={`#${rank}`} icon={<Trophy className="text-amber-500" />} />
           <ReportNode label="Percentile" val={`${percentile}%`} icon={<TrendingUp className="text-indigo-500" />} />
           <ReportNode label="Time Taken" val={timeTaken} icon={<Clock className="text-slate-400" />} />
           <ReportNode label="Attempts" val={correct + wrong} icon={<BarChart3 className="text-blue-500" />} />
        </div>

        {/* Breakdown Hub */}
        <div className="bg-[#F8FAFC] rounded-[2rem] p-8 md:p-12 flex items-center justify-around shadow-inner border border-slate-100">
           <LegacyMetric label="Correct" val={correct} color="text-emerald-600" />
           <div className="w-px h-12 bg-slate-200" />
           <LegacyMetric label="Incorrect" val={wrong} color="text-rose-600" />
           <div className="w-px h-12 bg-slate-200" />
           <LegacyMetric label="Skipped" val={total - (correct + wrong)} color="text-slate-300" />
        </div>

        {/* Subject Audit Table */}
        {subjects.length > 0 && (
          <div className="space-y-6">
            <h3 className="text-xs font-black uppercase text-slate-400 tracking-[0.4em] ml-2">Subject Performance Hub</h3>
            <div className="border border-slate-100 rounded-[2rem] overflow-hidden shadow-xl bg-white">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50/80 text-slate-500 border-b border-slate-100">
                    <th className="px-8 py-5 font-black text-left uppercase text-[9px] tracking-widest">Subject Vertical</th>
                    <th className="px-6 py-5 font-black text-center uppercase text-[9px] tracking-widest">Score</th>
                    <th className="px-8 py-5 font-black text-right uppercase text-[9px] tracking-widest">Accuracy</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {subjects.map((s, i) => (
                    <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-8 py-6 font-bold text-[#0F172A] text-base">{s.name}</td>
                      <td className="px-6 py-6 text-center font-black text-primary tabular-nums text-lg">{s.score}</td>
                      <td className="px-8 py-6 text-right">
                        <Badge className={cn("bg-emerald-50 text-emerald-600 border-none font-black text-[10px] px-3 py-1 rounded-lg tabular-nums shadow-sm", s.accuracy < 50 && "bg-amber-50 text-amber-600")}>
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

        {/* Verification Node */}
        <div className="pt-12 border-t border-slate-100 flex items-center justify-between gap-12">
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <ShieldCheck className="h-8 w-8 text-emerald-500" />
              <div className="text-left">
                 <p className="text-sm font-black text-[#0F172A] uppercase tracking-tight">Institutional Registry verified</p>
                 <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">Master Audit ID: {resultId}</p>
              </div>
            </div>
            <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest leading-relaxed max-w-sm">
               This report is generated by the Cracklix preparation engine. Authenticity can be verified using the unique registry ID or QR node.
            </p>
          </div>
          <div className="h-32 w-32 bg-white border-2 border-slate-50 p-2 rounded-2xl shadow-2xl shrink-0 group hover:scale-110 transition-transform duration-500">
            <img src={qrUrl} alt="QR Verification" className="h-full w-full object-contain" crossOrigin="anonymous" />
          </div>
        </div>
      </div>
    </div>
  );
}

function ReportNode({ label, val, icon }: any) {
  return (
    <div className="p-6 bg-slate-50/50 rounded-[1.5rem] md:rounded-[2rem] border border-slate-100 flex items-center gap-4 group hover:bg-white hover:shadow-xl transition-all duration-500">
      <div className="h-10 w-10 md:h-12 md:w-12 rounded-xl bg-white shadow-sm flex items-center justify-center shrink-0 border border-slate-100 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[8px] md:text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1.5 truncate">{label}</p>
        <p className="text-lg md:text-3xl font-black text-[#0F172A] leading-none tabular-nums tracking-tighter truncate">{val}</p>
      </div>
    </div>
  );
}

function LegacyMetric({ label, val, color }: any) {
  return (
    <div className="text-center space-y-1">
       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">{label}</p>
       <p className={cn("text-2xl md:text-5xl font-black tabular-nums tracking-tighter", color)}>{val}</p>
    </div>
  );
}