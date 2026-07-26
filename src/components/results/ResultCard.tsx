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
  CheckCircle2,
  Activity,
  Timer,
  Users,
  FileText
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
  totalCandidates: number;
  accuracy: string | number;
  attemptAccuracy: string | number;
  attemptRate: string | number;
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
  duration?: number | string;
}

/**
 * @fileOverview Professional Institutional Report Node v3.0.
 * DESIGN: Minimalistic, High-Density, Data-First (LinkedIn/Google Style).
 */
export default function ResultCard({
  studentName,
  examTitle,
  score,
  rank,
  totalCandidates,
  accuracy,
  attemptAccuracy,
  attemptRate,
  timeTaken,
  correct,
  wrong,
  total,
  date,
  resultId,
  percentile,
  branding,
  subjects = [],
  grade = "F",
  duration
}: ResultCardProps) {
  
  const orgName = (branding?.organizationName || "Cracklix");
  const webUrlRaw = (branding?.websiteUrl || "www.cracklix.com");
  const verifyBase = branding?.verificationUrl || `${webUrlRaw}/results/view?id=`;
  const fullVerifyUrl = verifyBase + resultId;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(fullVerifyUrl)}`;

  return (
    <div 
      id="cracklix-result-card" 
      className="w-full max-w-full print:w-[210mm] bg-white border border-slate-100 shadow-none overflow-hidden text-left font-body relative p-0 mx-auto box-border"
    >
      {/* 1. INSTITUTIONAL IDENTIFIER */}
      <div className="bg-[#0F172A] px-6 md:px-10 py-3 flex items-center justify-between">
         <span className="text-[10px] font-black text-white uppercase tracking-[0.4em]">Cracklix Performance Report</span>
         <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">ID: {resultId.slice(0, 12)}</span>
      </div>
      
      <div className="px-6 md:px-12 py-10 md:py-16 space-y-12">
        
        {/* 2. CORE IDENTITY HUB */}
        <div className="flex flex-col md:flex-row justify-between items-start gap-10 border-b border-slate-50 pb-12">
           <div className="space-y-8 flex-1 min-w-0">
              <div className="space-y-1">
                 <p className="text-[10px] font-black text-primary uppercase tracking-widest">Candidate</p>
                 <h1 className="text-3xl md:text-5xl font-[900] text-[#0F172A] tracking-tighter leading-none break-words uppercase">{studentName}</h1>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                 <InfoNode label="Test Name" val={examTitle} />
                 <InfoNode label="Date" val={date} />
                 <InfoNode label="Duration" val={duration ? `${duration}m` : 'Timed'} />
                 <InfoNode label="Total Candidates" val={totalCandidates.toLocaleString()} />
              </div>
           </div>

           <div className="shrink-0 flex flex-col items-center md:items-end gap-6">
              <div className="h-16 w-16 md:h-24 md:w-24 bg-white rounded-2xl border border-slate-100 shadow-xl p-1 overflow-hidden">
                {branding?.logoUrl ? (
                  <img src={branding.logoUrl} alt="Logo" className="h-full w-full object-contain" crossOrigin="anonymous" referrerPolicy="no-referrer" />
                ) : (
                  <img src="/logo/cracklix-icon.png" alt="Logo" className="h-full w-full object-contain" crossOrigin="anonymous" referrerPolicy="no-referrer" />
                )}
              </div>
              <div className="text-center md:text-right">
                 <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Grade Achieved</p>
                 <span className="text-4xl md:text-6xl font-black text-[#0F172A] tabular-nums">{grade}</span>
              </div>
           </div>
        </div>

        {/* 3. PERFORMANCE MATRIX - ABOVE THE FOLD */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
           <MetricBox label="Net Score" val={score} sub={`/ ${total}`} icon={<Zap className="text-primary" />} />
           <MetricBox label="Punjab Rank" val={`#${rank}`} sub={`of ${totalCandidates}`} icon={<Trophy className="text-amber-500" />} />
           <MetricBox label="Percentile" val={`${percentile}%`} sub="Verified" icon={<TrendingUp className="text-blue-500" />} />
           <MetricBox label="Overall Accuracy" val={`${accuracy}%`} sub="Precision" icon={<Target className="text-emerald-500" />} />
           <MetricBox label="Attempt Rate" val={`${attemptRate}%`} sub="Volume" icon={<Activity className="text-indigo-500" />} />
        </div>

        {/* 4. SUBJECT LEVEL AUDIT */}
        {subjects.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Subject Performance Audit</h3>
            <div className="border border-slate-100 rounded-2xl overflow-hidden shadow-sm bg-white">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="px-6 md:px-10 py-4 font-bold text-left text-[9px] uppercase tracking-tight text-slate-500">Subject</th>
                    <th className="px-4 py-4 font-bold text-center text-[9px] uppercase tracking-tight text-slate-500">Score</th>
                    <th className="px-6 md:px-10 py-4 font-bold text-right text-[9px] uppercase tracking-tight text-slate-500">Mastery</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {subjects.map((s, i) => (
                    <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 md:px-10 py-5 font-bold text-[#0F172A] text-sm md:text-base uppercase">{s.name}</td>
                      <td className="px-4 py-5 text-center font-black text-primary tabular-nums text-sm md:text-xl">{s.score.toFixed(1)}</td>
                      <td className="px-6 md:px-10 py-5 text-right font-black tabular-nums text-[#0F172A]">{s.accuracy}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 5. VERIFICATION FOOTER */}
        <div className="pt-10 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-10">
          <div className="flex items-center gap-6 flex-1">
             <div className="bg-white border border-slate-100 p-2 rounded-xl shadow-lg shrink-0">
                <img src={qrUrl} alt="Verify" className="h-20 w-20 md:h-28 md:w-28 object-contain" crossOrigin="anonymous" referrerPolicy="no-referrer" />
             </div>
             <div className="space-y-2 text-left">
                <p className="text-[10px] font-black text-primary uppercase tracking-widest flex items-center gap-2">
                   <ShieldCheck className="h-4 w-4" /> Digitally Verified Report
                </p>
                <p className="text-[11px] text-slate-500 leading-relaxed max-w-md font-medium">
                   This performance report is generated by the {orgName} testing engine. 
                   Scan the QR code to verify the authenticity of these results on our official registry.
                </p>
             </div>
          </div>
          <div className="text-center md:text-right space-y-1">
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Platform Sync</p>
             <p className="text-sm font-bold text-[#0F172A]">{webUrlRaw.toLowerCase()}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoNode({ label, val }: { label: string, val: string }) {
   return (
      <div className="space-y-1">
         <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
         <p className="text-xs md:text-lg font-bold text-[#0F172A] leading-tight uppercase">{val}</p>
      </div>
   )
}

function MetricBox({ label, val, sub, icon }: any) {
  return (
    <div className="p-4 md:p-6 rounded-2xl bg-white border border-slate-100 flex flex-col items-center justify-center text-center gap-3 transition-all hover:border-primary/20">
      <div className="h-8 w-8 rounded-lg bg-slate-50 flex items-center justify-center border border-slate-100">
        {React.cloneElement(icon as React.ReactElement, { className: "h-4 w-4" })}
      </div>
      <div className="space-y-1">
        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
        <p className="text-lg md:text-2xl font-black text-[#0F172A] tabular-nums leading-none tracking-tight">{val}</p>
        <p className="text-[8px] font-bold text-slate-300 uppercase">{sub}</p>
      </div>
    </div>
  );
}

function XCircle(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="m15 9-6 6" />
      <path d="m9 9 6 6" />
    </svg>
  )
}
