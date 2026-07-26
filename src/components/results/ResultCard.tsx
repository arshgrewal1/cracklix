'use client';

import React from 'react';
import { 
  ShieldCheck, 
  CheckCircle2, 
  Trophy, 
  Zap, 
  Target, 
  TrendingUp, 
  Clock, 
  BarChart3, 
  Award,
  Check
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
}

/**
 * @fileOverview Official Institutional Result Card v5.2.
 * RESTORED: Single-page card structure without watermarks or multi-page complexity.
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
  subjects = []
}: ResultCardProps) {
  
  const orgName = branding?.organizationName || "Cracklix";
  const webUrlRaw = branding?.websiteUrl || "https://cracklix.vercel.app";
  const displayUrl = webUrlRaw.replace(/^https?:\/\//, '');
  const verifyBase = branding?.verificationUrl || `${webUrlRaw}/results/view?id=`;
  const fullVerifyUrl = verifyBase + resultId;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(fullVerifyUrl)}`;

  return (
    <div className="w-full max-w-[800px] mx-auto bg-white border border-slate-200 shadow-2xl rounded-[2rem] overflow-hidden text-left font-body">
      <div className="h-2 w-full bg-primary" />
      
      <div className="p-8 md:p-12 space-y-10">
        {/* Header Hub */}
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 bg-slate-50 rounded-2xl flex items-center justify-center p-2 border border-slate-100">
              {branding?.logoUrl ? (
                <img src={branding.logoUrl} alt="Logo" className="h-full w-full object-contain" crossOrigin="anonymous" />
              ) : (
                <img src="/logo/cracklix-icon.png" alt="Logo" className="h-full w-full object-contain" crossOrigin="anonymous" />
              )}
            </div>
            <div>
              <h2 className="text-2xl font-black text-[#0F172A]">{orgName}</h2>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Official Score Report</p>
            </div>
          </div>
          <div className="text-right">
            <Badge className="bg-emerald-50 text-emerald-600 border-none font-bold text-[10px] px-3 py-1">Verified Result</Badge>
            <p className="text-[10px] font-bold text-slate-400 uppercase mt-2 tabular-nums">{date}</p>
          </div>
        </div>

        {/* Student Identity Hub */}
        <div className="text-center space-y-4 py-6 bg-slate-50/50 rounded-[2rem] border border-slate-50">
          <div className="h-20 w-20 bg-white rounded-full mx-auto flex items-center justify-center shadow-xl border-4 border-white text-primary">
            <Award className="h-10 w-10" />
          </div>
          <div className="space-y-1">
            <h1 className="text-3xl font-black text-[#0F172A] uppercase tracking-tight">{studentName}</h1>
            <p className="text-slate-500 font-bold text-sm uppercase">{examTitle}</p>
          </div>
        </div>

        {/* Performance Metrics Matrix */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
           <StatNode label="State Rank" val={`#${rank}`} icon={<Trophy className="h-4 w-4 text-amber-500" />} />
           <StatNode label="Total Score" val={score} icon={<Zap className="h-4 w-4 text-primary" />} />
           <StatNode label="Accuracy" val={`${accuracy}%`} icon={<Target className="h-4 w-4 text-emerald-500" />} />
           <StatNode label="Percentile" val={`${percentile}%`} icon={<TrendingUp className="h-4 w-4 text-indigo-500" />} />
           <StatNode label="Time Taken" val={timeTaken} icon={<Clock className="h-4 w-4 text-slate-400" />} />
           <StatNode label="Total Items" val={total} icon={<BarChart3 className="h-4 w-4 text-blue-500" />} />
        </div>

        {/* Registry Snapshot Summary */}
        <div className="bg-[#F8FAFC] rounded-2xl p-6 flex items-center justify-around shadow-inner">
           <ReportDataPoint label="Correct" val={correct} color="text-emerald-600" />
           <div className="w-px h-8 bg-slate-200" />
           <ReportDataPoint label="Incorrect" val={wrong} color="text-rose-600" />
           <div className="w-px h-8 bg-slate-200" />
           <ReportDataPoint label="Skipped" val={total - (correct + wrong)} color="text-slate-300" />
        </div>

        {/* Subject-Wise Performance Audit */}
        {subjects.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-xs font-black uppercase text-slate-400 tracking-widest ml-1">Subject Mastery breakdown</h3>
            <div className="border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-slate-500">
                  <tr>
                    <th className="px-6 py-3 font-bold text-left uppercase text-[10px]">Subject Hub</th>
                    <th className="px-4 py-3 font-bold text-center uppercase text-[10px]">Points</th>
                    <th className="px-6 py-3 font-bold text-right uppercase text-[10px]">Accuracy</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {subjects.map((s, i) => (
                    <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 font-bold text-[#0F172A]">{s.name}</td>
                      <td className="px-4 py-4 text-center font-black text-primary tabular-nums">{s.score}</td>
                      <td className="px-6 py-4 text-right">
                        <Badge className={cn("bg-emerald-50 text-emerald-600 border-none font-bold tabular-nums", s.accuracy < 50 && "bg-amber-50 text-amber-600")}>
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

        {/* Verification Hub */}
        <div className="pt-10 border-t border-slate-100 flex items-center justify-between gap-10">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-6 w-6 text-emerald-500" />
              <p className="text-sm font-bold text-[#0F172A]">Institutional Verification Registry</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Registry ID: {resultId}</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Verify Hub: {displayUrl}</p>
            </div>
          </div>
          <div className="h-24 w-24 border-2 border-slate-50 p-1 rounded-xl shadow-lg bg-white shrink-0">
            <img src={qrUrl} alt="QR Code" className="h-full w-full object-contain" crossOrigin="anonymous" />
          </div>
        </div>
      </div>
    </div>
  );
}

function StatNode({ label, val, icon }: any) {
  return (
    <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-50 flex items-center gap-3">
      <div className="h-8 w-8 rounded-lg bg-white shadow-sm flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div>
        <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">{label}</p>
        <p className="text-base font-black text-[#0F172A] leading-none tabular-nums tracking-tighter">{val}</p>
      </div>
    </div>
  );
}

function ReportDataPoint({ label, val, color }: any) {
  return (
    <div className="text-center">
       <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">{label}</p>
       <p className={cn("text-xl font-black tabular-nums tracking-tighter", color)}>{val}</p>
    </div>
  );
}
