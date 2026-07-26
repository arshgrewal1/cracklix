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
 * @fileOverview Official Institutional Report Card v26.0 [PWA Optimized].
 * FIXED: Removed uppercase, reduced font sizes, rebalanced footer to prevent right-side cutting.
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
      <div className="h-2 w-full bg-[#0F172A]" />
      
      <div className="px-5 md:px-10 py-8 md:py-12 space-y-10 md:space-y-14">
        {/* 1. HEADER HUB */}
        <div className="flex justify-between items-start border-b border-slate-100 pb-8">
          <div className="flex items-center gap-6 md:gap-8">
            <div className="h-16 w-16 md:h-24 md:w-24 bg-white rounded-2xl flex items-center justify-center border border-slate-100 shadow-xl overflow-hidden shrink-0">
              {branding?.logoUrl ? (
                <img src={branding.logoUrl} alt="Logo" className="h-full w-full object-contain" crossOrigin="anonymous" referrerPolicy="no-referrer" />
              ) : (
                <img src="/logo/cracklix-icon.png" alt="Logo" className="h-full w-full object-contain" crossOrigin="anonymous" referrerPolicy="no-referrer" />
              )}
            </div>
            <div className="space-y-0.5 text-left min-w-0">
              <h2 className="text-xl md:text-4xl font-black text-[#0F172A] tracking-tighter leading-none">{orgName}</h2>
              <p className="text-[9px] md:text-[11px] font-bold text-slate-400 uppercase tracking-widest truncate">Audit Registry</p>
            </div>
          </div>
          <div className="text-right space-y-2 shrink-0">
            <Badge className={cn("border-none font-bold text-[8px] md:text-[10px] px-3 py-1 rounded-full uppercase tracking-tight shadow-lg", isQualified ? "bg-emerald-600 text-white" : "bg-rose-600 text-white")}>
               {isQualified ? "Qualified" : "Not Qualified"}
            </Badge>
            <p className="text-[10px] md:text-[13px] font-bold text-[#0F172A] tabular-nums">{date}</p>
          </div>
        </div>

        {/* 2. IDENTITY & GRADE HUB */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-10 items-center">
           <div className="md:col-span-8 space-y-4 text-left">
              <div className="space-y-1">
                 <h1 className="text-2xl md:text-5xl font-black text-[#0F172A] tracking-tighter leading-tight">{studentName}</h1>
                 <p className="text-primary font-bold text-base md:text-2xl tracking-tight uppercase">{examTitle}</p>
              </div>
              <div className="flex flex-wrap items-center justify-start gap-4 pt-1">
                 <Badge variant="outline" className="border-slate-100 text-slate-400 font-bold text-[8px] md:text-[9px] uppercase tracking-tight flex items-center gap-2 px-3">
                    <ShieldCheck className="h-3 w-3 text-emerald-500" /> Identity secure
                 </Badge>
                 <Badge variant="outline" className="border-slate-100 text-slate-400 font-bold text-[8px] md:text-[9px] uppercase tracking-tight flex items-center gap-2 px-3">
                    <Target className="h-3 w-3 text-primary" /> Merit audit
                 </Badge>
              </div>
           </div>

           <div className="md:col-span-4 flex justify-center md:justify-end">
              <div className="h-28 w-28 md:h-44 md:w-44 bg-[#0F172A] rounded-[2rem] shadow-4xl flex flex-col items-center justify-center relative border-[6px] border-white">
                 <span className="text-[9px] md:text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-widest">Grade</span>
                 <span className="text-4xl md:text-[80px] font-black text-white tabular-nums leading-none tracking-tighter">{grade}</span>
              </div>
           </div>
        </div>

        {/* 3. CORE ANALYTICS MATRIX */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
           <ReportNode label="Net score" val={`${score} / ${total}`} icon={<Zap className="text-primary" />} />
           <ReportNode label="Percentage" val={`${percentage}%`} icon={<Activity className="text-emerald-500" />} />
           <ReportNode label="State rank" val={`#${rank}`} icon={<Trophy className="text-amber-500" />} highlight />
           <ReportNode label="Percentile" val={`${percentile}%`} icon={<TrendingUp className="text-blue-500" />} />
           <ReportNode label="Overall acc." val={`${accuracy}%`} icon={<Target className="text-indigo-500" />} />
           <ReportNode label="Attempt acc." val={`${attemptAcc}%`} icon={<Zap className="text-orange-500" />} />
           <ReportNode label="Attempt rate" val={`${attemptRate}%`} icon={<Timer className="text-slate-500" />} />
           <ReportNode label="Readiness" val={getReadinessLevel(readiness)} icon={<ShieldCheck className="text-emerald-600" />} highlight />
        </div>

        {/* 4. PERFORMANCE SUMMARY */}
        <div className="bg-[#F8FAFC] rounded-[2rem] p-6 md:p-10 flex items-center justify-around shadow-inner border border-slate-50">
           <MetricSummary label="Correct" val={correct} color="text-emerald-600" />
           <div className="w-px h-12 md:h-20 bg-slate-200" />
           <MetricSummary label="Wrong" val={wrong} color="text-rose-600" />
           <div className="w-px h-12 md:h-20 bg-slate-200" />
           <MetricSummary label="Skipped" val={total - attempted} color="text-slate-400" />
        </div>

        {/* 5. SUBJECT LEVEL AUDIT */}
        {subjects.length > 0 && (
          <div className="space-y-4 pt-4">
            <h3 className="text-[9px] md:text-[11px] font-bold text-slate-400 ml-2 text-left uppercase tracking-widest">Subject performance</h3>
            <div className="border border-slate-100 rounded-[2rem] overflow-hidden shadow-2xl bg-white">
              <table className="w-full">
                <thead>
                  <tr className="bg-[#0F172A] text-white">
                    <th className="px-6 md:px-10 py-4 font-bold text-left tracking-tight uppercase text-[9px] md:text-xs">Subject</th>
                    <th className="px-4 md:px-6 py-4 font-bold text-center tracking-tight uppercase text-[9px] md:text-xs">Score</th>
                    <th className="px-6 md:px-10 py-4 font-bold text-right tracking-tight uppercase text-[9px] md:text-xs">Mastery</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {subjects.map((s, i) => (
                    <tr key={i} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 md:px-10 py-4 md:py-6 font-bold text-[#0F172A] text-sm md:text-xl tracking-tight text-left uppercase">{s.name}</td>
                      <td className="px-4 md:px-6 py-4 md:py-6 text-center font-black text-primary tabular-nums text-sm md:text-2xl">{s.score.toFixed(1)}</td>
                      <td className="px-6 md:px-10 py-4 md:py-6 text-right">
                        <Badge className={cn(
                           "border-none font-bold text-[10px] md:text-lg px-4 py-1 rounded-xl tabular-nums shadow-sm", 
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
        <div className="pt-8 md:pt-14 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-8 md:gap-14">
          <div className="bg-white border border-slate-100 p-4 rounded-[1.5rem] shadow-xl shrink-0 flex flex-col items-center gap-2">
            <img src={qrUrl} alt="Verify" className="h-28 w-28 md:h-36 md:w-36 object-contain" crossOrigin="anonymous" referrerPolicy="no-referrer" />
            <span className="text-[8px] font-bold text-primary tracking-widest uppercase">Verified Node</span>
          </div>

          <div className="space-y-4 md:space-y-6 flex-1 text-center md:text-left min-w-0 w-full">
            <div className="space-y-2">
               <div className="flex items-center justify-center md:justify-start gap-4">
                  <div className="h-10 w-10 md:h-12 md:w-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 shadow-inner shrink-0">
                     <ShieldCheck className="h-6 w-6" />
                  </div>
                  <p className="text-lg md:text-2xl font-bold text-[#0F172A] tracking-tight">Institutional Precision Verified</p>
               </div>
               <div className="min-w-0 px-1">
                  <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">Registry node ID:</p>
                  <p className="text-[10px] md:text-[13px] font-mono font-bold text-primary break-all leading-tight mt-1">{resultId}</p>
               </div>
            </div>
            <p className="text-[10px] md:text-[12px] font-medium text-slate-400 leading-relaxed max-w-xl">
               Generated based on verified recruitment patterns. Authenticity can be audited via the binary QR node or at {webUrlRaw.toLowerCase()}. All performance markers are finalized and synchronized.
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
       "p-4 md:p-6 rounded-[1.5rem] border flex flex-col items-start gap-2 transition-all text-left",
       highlight ? "bg-primary/5 border-primary/20 shadow-sm" : "bg-white border-slate-50 shadow-sm"
    )}>
      <div className="h-8 w-8 rounded-lg bg-slate-50 flex items-center justify-center shrink-0 border border-slate-100">
        {React.cloneElement(icon as React.ReactElement, { className: "h-4 w-4" })}
      </div>
      <div className="space-y-0 w-full min-w-0">
        <p className="text-[8px] md:text-[9px] font-bold text-slate-400 uppercase tracking-tight truncate">{label}</p>
        <p className={cn("text-sm md:text-xl font-black text-[#0F172A] tabular-nums tracking-tighter truncate")}>{val}</p>
      </div>
    </div>
  );
}

function MetricSummary({ label, val, color }: any) {
  return (
    <div className="text-center space-y-1">
       <p className="text-[8px] md:text-[12px] font-bold text-slate-400 uppercase tracking-tight">{label}</p>
       <p className={cn("text-2xl md:text-[56px] font-black tabular-nums tracking-tighter leading-none", color)}>{val}</p>
    </div>
  );
}
