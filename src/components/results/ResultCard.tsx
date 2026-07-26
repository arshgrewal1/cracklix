
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
 * @fileOverview Official Institutional Report Card v25.0 [Advanced Header].
 * FIXED: Rebuilt metric layout to show Score/Total, Overall Accuracy, Attempt Accuracy, and Readiness Level.
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

  const attempted = correct + wrong;
  const attemptAcc = attempted > 0 ? ((correct / attempted) * 100).toFixed(1) : "0.0";
  const attemptRate = ((attempted / total) * 100).toFixed(1);
  const percentage = ((Number(score) / total) * 100).toFixed(1);
  
  const isQualified = Number(percentage) >= 40;
  const readiness = (Number(percentage) + Number(attemptAcc) + Number(attemptRate)) / 3;
  const getReadinessLevel = (r: number) => {
    if (r >= 80) return "Excellent";
    if (r >= 60) return "Good";
    if (r >= 40) return "Average";
    if (r >= 20) return "Weak";
    return "Critical";
  };

  return (
    <div 
      id="cracklix-result-card" 
      className="w-full max-w-full print:w-[210mm] min-h-auto print:min-h-[297mm] bg-white border border-slate-200 shadow-none overflow-hidden text-left font-body relative p-0 mx-auto box-border"
    >
      <div className="h-3 w-full bg-[#0F172A]" />
      
      <div className="px-5 md:px-12 py-10 md:py-14 space-y-10 md:space-y-16">
        {/* 1. HEADER HUB */}
        <div className="flex justify-between items-start border-b border-slate-100 pb-10 md:pb-12">
          <div className="flex items-center gap-8 md:gap-10">
            <div className="h-20 w-20 md:h-32 md:w-32 bg-white rounded-2xl md:rounded-3xl flex items-center justify-center p-0 border border-slate-100 shadow-2xl overflow-hidden shrink-0">
              {branding?.logoUrl ? (
                <img src={branding.logoUrl} alt="Logo" className="h-full w-full object-contain" crossOrigin="anonymous" referrerPolicy="no-referrer" />
              ) : (
                <img src="/logo/cracklix-icon.png" alt="Logo" className="h-full w-full object-contain" crossOrigin="anonymous" referrerPolicy="no-referrer" />
              )}
            </div>
            <div className="space-y-1 text-left min-w-0">
              <h2 className="text-2xl md:text-5xl font-black text-[#0F172A] tracking-tighter leading-none">{orgName}</h2>
              <p className="text-[10px] md:text-[13px] font-black text-slate-400 uppercase tracking-[0.4em] truncate">Performance Audit Registry</p>
            </div>
          </div>
          <div className="text-right space-y-3 shrink-0">
            <Badge className={cn("border-none font-black text-[9px] md:text-[11px] px-5 py-2 rounded-full uppercase tracking-widest shadow-xl", isQualified ? "bg-emerald-600 text-white" : "bg-rose-600 text-white")}>
               {isQualified ? "Verified Qualified" : "Not Qualified"}
            </Badge>
            <p className="text-[11px] md:text-[16px] font-black text-[#0F172A] tabular-nums tracking-widest">{date}</p>
          </div>
        </div>

        {/* 2. IDENTITY & GRADE HUB */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-14 items-center">
           <div className="md:col-span-8 space-y-6 text-left">
              <div className="space-y-2">
                 <h1 className="text-3xl md:text-6xl font-black text-[#0F172A] tracking-tighter leading-tight">{studentName}</h1>
                 <p className="text-primary font-black text-lg md:text-3xl tracking-tight uppercase">{examTitle}</p>
              </div>
              <div className="flex flex-wrap items-center justify-start gap-6 pt-2">
                 <Badge variant="outline" className="border-slate-200 text-slate-500 font-black text-[9px] md:text-[11px] uppercase tracking-widest flex items-center gap-2.5 px-4 py-1.5">
                    <ShieldCheck className="h-4 w-4 text-emerald-500" /> Identity Secure
                 </Badge>
                 <Badge variant="outline" className="border-slate-200 text-slate-500 font-black text-[9px] md:text-[11px] uppercase tracking-widest flex items-center gap-2.5 px-4 py-1.5">
                    <Target className="h-4 w-4 text-primary" /> State Merit Audit
                 </Badge>
              </div>
           </div>

           <div className="md:col-span-4 flex justify-center md:justify-end">
              <div className="h-36 w-36 md:h-52 md:w-52 bg-[#0F172A] rounded-[3rem] shadow-4xl flex flex-col items-center justify-center relative border-[8px] border-white">
                 <span className="text-[10px] md:text-[12px] font-black text-slate-500 mb-2 uppercase tracking-widest">Aspirant Grade</span>
                 <span className="text-5xl md:text-[100px] font-black text-white tabular-nums leading-none tracking-tighter">{grade}</span>
                 <div className="absolute -bottom-4 -right-4 h-12 w-12 md:h-18 md:w-18 bg-amber-400 rounded-2xl flex items-center justify-center text-white shadow-2xl border-[4px] border-white">
                    <Trophy className="h-6 w-6 md:h-10 md:w-10" />
                 </div>
              </div>
           </div>
        </div>

        {/* 3. CORE ANALYTICS MATRIX */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
           <ReportNode label="Net Score" val={`${score} / ${total}`} icon={<Zap className="text-primary" />} />
           <ReportNode label="Percentage" val={`${percentage}%`} icon={<Activity className="text-emerald-500" />} />
           <ReportNode label="State Rank" val={`#${rank}`} icon={<Trophy className="text-amber-500" />} highlight />
           <ReportNode label="Percentile" val={`${percentile}%`} icon={<TrendingUp className="text-blue-500" />} />
           <ReportNode label="Overall Acc." val={`${accuracy}%`} icon={<Target className="text-indigo-500" />} />
           <ReportNode label="Attempt Acc." val={`${attemptAcc}%`} icon={<Zap className="text-orange-500" />} />
           <ReportNode label="Attempt Rate" val={`${attemptRate}%`} icon={<Timer className="text-slate-500" />} />
           <ReportNode label="Readiness" val={getReadinessLevel(readiness)} icon={<ShieldCheck className="text-emerald-600" />} highlight />
        </div>

        {/* 4. PERFORMANCE SEGMENTS */}
        <div className="bg-[#F8FAFC] rounded-[2.5rem] p-10 md:p-14 flex items-center justify-around shadow-inner border border-slate-100">
           <MetricSummary label="Correct Nodes" val={correct} color="text-emerald-600" />
           <div className="w-px h-16 md:h-24 bg-slate-200" />
           <MetricSummary label="Wrong Nodes" val={wrong} color="text-rose-600" />
           <div className="w-px h-16 md:h-24 bg-slate-200" />
           <MetricSummary label="Unattempted" val={total - attempted} color="text-slate-400" />
        </div>

        {/* 5. SUBJECT LEVEL AUDIT */}
        {subjects.length > 0 && (
          <div className="space-y-6 pt-6">
            <h3 className="text-[11px] md:text-[13px] font-black text-slate-400 ml-4 text-left uppercase tracking-[0.4em]">Subject performance audit</h3>
            <div className="border border-slate-100 rounded-[2.5rem] md:rounded-[3.5rem] overflow-hidden shadow-2xl bg-white">
              <table className="w-full">
                <thead>
                  <tr className="bg-[#0F172A] text-white">
                    <th className="px-8 md:px-14 py-6 font-black text-left tracking-[0.2em] uppercase text-[10px] md:text-sm">Vertical Hub</th>
                    <th className="px-4 md:px-8 py-6 font-black text-center tracking-[0.2em] uppercase text-[10px] md:text-sm">Score</th>
                    <th className="px-8 md:px-14 py-6 font-black text-right tracking-[0.2em] uppercase text-[10px] md:text-sm">Mastery</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {subjects.map((s, i) => (
                    <tr key={i} className="hover:bg-slate-50 transition-colors">
                      <td className="px-8 md:px-14 py-6 md:py-8 font-bold text-[#0F172A] text-base md:text-2xl tracking-tight text-left uppercase">{s.name}</td>
                      <td className="px-4 md:px-8 py-6 md:py-8 text-center font-black text-primary tabular-nums text-lg md:text-3xl">{s.score.toFixed(1)}</td>
                      <td className="px-8 md:px-14 py-6 md:py-8 text-right">
                        <Badge className={cn(
                           "border-none font-black text-[11px] md:text-xl px-5 md:px-8 py-2 rounded-2xl tabular-nums shadow-sm", 
                           s.accuracy >= 70 ? "bg-emerald-50 text-emerald-600" : s.accuracy >= 40 ? "bg-blue-50 text-blue-600" : "bg-rose-50 text-rose-600"
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

        {/* 6. VERIFICATION HUB */}
        <div className="pt-12 md:pt-20 border-t border-slate-100 flex flex-col md:flex-row items-start justify-between gap-12 md:gap-20">
          <div className="bg-white border border-slate-200 p-5 md:p-6 rounded-[2rem] md:rounded-[3rem] shadow-4xl shrink-0 flex flex-col items-center justify-center gap-3">
            <img src={qrUrl} alt="Verify" className="h-32 w-32 md:h-44 md:w-44 object-contain" crossOrigin="anonymous" referrerPolicy="no-referrer" />
            <span className="text-[10px] font-black text-primary tracking-[0.4em] uppercase">Audit Hub</span>
          </div>

          <div className="pt-2 md:pt-4 space-y-6 md:space-y-10 flex-1 text-left min-w-0">
            <div className="space-y-4">
               <div className="flex items-center gap-5">
                  <div className="h-12 w-12 md:h-16 md:w-16 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 shadow-inner shrink-0">
                     <ShieldCheck className="h-7 w-7 md:h-10 md:w-10" />
                  </div>
                  <p className="text-xl md:text-3xl font-[900] text-[#0F172A] tracking-tighter leading-none">Institutional Precision Verified</p>
               </div>
               <div className="pl-0 md:pl-20 min-w-0">
                  <p className="text-[9px] md:text-[11px] font-black text-slate-300 uppercase tracking-[0.3em]">Registry node identity:</p>
                  <p className="text-[11px] md:text-[15px] font-mono font-black text-primary break-all leading-tight mt-2">{resultId}</p>
               </div>
            </div>
            <p className="text-[10px] md:text-[14px] font-medium text-slate-400 leading-relaxed max-w-2xl">
               This high-fidelity performance report is generated based on verified government recruitment patterns. Authenticity can be audited via the binary QR node or at {webUrlRaw.toLowerCase()}. All performance markers are finalized and synchronized with the master state registry.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function ReportNode({ label, val, icon, highlight }: any) {
  return (
    <div className={cn(
       "p-5 md:p-8 rounded-[2rem] border-2 flex flex-col items-start gap-4 md:gap-6 transition-all group text-left",
       highlight ? "bg-primary/5 border-primary shadow-xl" : "bg-white border-slate-50 shadow-sm"
    )}>
      <div className="h-9 w-9 md:h-12 md:w-12 rounded-xl bg-slate-50 flex items-center justify-center shrink-0 border border-slate-100">
        {icon}
      </div>
      <div className="space-y-1 w-full min-w-0">
        <p className="text-[9px] md:text-[11px] font-black text-slate-400 uppercase tracking-widest truncate">{label}</p>
        <p className={cn("text-lg md:text-3xl font-black text-[#0F172A] tabular-nums tracking-tighter leading-none truncate")}>{val}</p>
      </div>
    </div>
  );
}

function MetricSummary({ label, val, color }: any) {
  return (
    <div className="text-center space-y-2 md:space-y-4">
       <p className="text-[10px] md:text-[14px] font-black text-slate-400 uppercase tracking-[0.3em]">{label}</p>
       <p className={cn("text-3xl md:text-[80px] font-black tabular-nums tracking-tighter leading-none", color)}>{val}</p>
    </div>
  );
}
