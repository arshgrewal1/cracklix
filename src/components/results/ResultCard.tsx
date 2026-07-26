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
 * @fileOverview World-Class Institutional Report Hub v2.0.
 * DESIGN: Minimum footprint, professional Title Case, zero horizontal cutting.
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

  return (
    <div 
      id="cracklix-result-card" 
      className="w-full max-w-full print:w-[210mm] min-h-auto print:min-h-[297mm] bg-white border border-slate-200 shadow-none overflow-hidden text-left font-body relative p-0 mx-auto box-border"
    >
      <div className="h-2 w-full bg-[#0F172A]" />
      
      <div className="px-5 md:px-10 py-8 md:py-12 space-y-10 md:space-y-14">
        {/* SECTION 1: HEADER HUB */}
        <div className="flex justify-between items-start border-b border-slate-100 pb-8">
          <div className="flex items-center gap-4 md:gap-8 min-w-0 flex-1">
            <div className="h-14 w-14 md:h-20 md:w-20 bg-white rounded-2xl flex items-center justify-center border border-slate-100 shadow-xl overflow-hidden shrink-0">
              {branding?.logoUrl ? (
                <img src={branding.logoUrl} alt="Logo" className="h-full w-full object-contain" crossOrigin="anonymous" referrerPolicy="no-referrer" />
              ) : (
                <img src="/logo/cracklix-icon.png" alt="Logo" className="h-full w-full object-contain" crossOrigin="anonymous" referrerPolicy="no-referrer" />
              )}
            </div>
            <div className="space-y-0.5 text-left min-w-0">
              <h2 className="text-xl md:text-3xl font-black text-[#0F172A] tracking-tighter leading-none truncate">{orgName}</h2>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Audit registry</p>
            </div>
          </div>
          <div className="text-right space-y-2 shrink-0 ml-4">
            <Badge className={cn("border-none font-bold text-[8px] md:text-[10px] px-3 py-1 rounded-full shadow-lg", isQualified ? "bg-emerald-600 text-white" : "bg-rose-600 text-white")}>
               {isQualified ? "Qualified" : "Not Qualified"}
            </Badge>
            <p className="text-[10px] font-bold text-[#0F172A] tabular-nums">{date}</p>
          </div>
        </div>

        {/* SECTION 2: CANDIDATE HUB */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-10 items-center">
           <div className="md:col-span-8 space-y-4 text-left">
              <div className="space-y-1">
                 <h1 className="text-2xl md:text-5xl font-black text-[#0F172A] tracking-tighter leading-tight break-words">{studentName}</h1>
                 <p className="text-primary font-bold text-base md:text-xl tracking-tight">{examTitle}</p>
              </div>
              <div className="flex flex-wrap items-center justify-start gap-4 pt-1">
                 <Badge variant="outline" className="border-slate-100 text-slate-400 font-bold text-[8px] md:text-[9px] flex items-center gap-2 px-3">
                    <ShieldCheck className="h-3 w-3 text-emerald-500" /> Identity secure
                 </Badge>
                 <Badge variant="outline" className="border-slate-100 text-slate-400 font-bold text-[8px] md:text-[9px] flex items-center gap-2 px-3">
                    <Target className="h-3 w-3 text-primary" /> Merit audit
                 </Badge>
              </div>
           </div>

           <div className="md:col-span-4 flex justify-center md:justify-end">
              <div className="h-28 w-28 md:h-40 md:w-40 bg-[#0F172A] rounded-[2rem] shadow-4xl flex flex-col items-center justify-center relative border-[6px] border-white shrink-0">
                 <span className="text-[9px] md:text-[10px] font-bold text-slate-500 mb-1">Grade</span>
                 <span className="text-4xl md:text-[64px] font-black text-white tabular-nums leading-none tracking-tighter">{grade}</span>
              </div>
           </div>
        </div>

        {/* SECTION 3: CORE METRIC MATRIX */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
           <ReportNode label="Net score" val={`${score} / ${total}`} icon={<Zap className="text-primary" />} />
           <ReportNode label="Punjab rank" val={`#${rank}`} icon={<Trophy className="text-amber-500" />} highlight />
           <ReportNode label="Percentile" val={`${percentile}%`} icon={<TrendingUp className="text-blue-500" />} />
           <ReportNode label="Overall accuracy" val={`${accuracy}%`} icon={<Target className="text-indigo-500" />} />
           <ReportNode label="Attempt accuracy" val={`${attemptAcc}%`} icon={<ShieldCheck className="text-emerald-600" />} />
           <ReportNode label="Attempt rate" val={`${attemptRate}%`} icon={<Timer className="text-slate-500" />} />
           <ReportNode label="Correct" val={correct} icon={<CheckCircle2 className="text-emerald-500" />} />
           <ReportNode label="Wrong" val={wrong} icon={<XCircle className="text-rose-500" />} />
        </div>

        {/* SECTION 4: SUBJECT ANALYTICS */}
        {subjects.length > 0 && (
          <div className="space-y-4 pt-4">
            <h3 className="text-[9px] md:text-[11px] font-bold text-slate-400 ml-2 text-left uppercase tracking-widest">Subject analytics</h3>
            <div className="border border-slate-100 rounded-[2rem] overflow-hidden shadow-2xl bg-white">
              <table className="w-full">
                <thead>
                  <tr className="bg-[#0F172A] text-white">
                    <th className="px-6 md:px-10 py-4 font-bold text-left tracking-tight text-[9px] md:text-xs">Subject hub</th>
                    <th className="px-4 md:px-6 py-4 font-bold text-center tracking-tight text-[9px] md:text-xs">Net score</th>
                    <th className="px-6 md:px-10 py-4 font-bold text-right tracking-tight text-[9px] md:text-xs">Mastery</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {subjects.map((s, i) => (
                    <tr key={i} className="hover:bg-slate-50 transition-colors h-14 md:h-18">
                      <td className="px-6 md:px-10 py-4 font-bold text-[#0F172A] text-sm md:text-lg tracking-tight text-left truncate max-w-[120px] md:max-w-none">{s.name}</td>
                      <td className="px-4 md:px-6 py-4 text-center font-black text-primary tabular-nums text-sm md:text-xl">{s.score.toFixed(1)}</td>
                      <td className="px-6 md:px-10 py-4 text-right">
                        <Badge className={cn(
                           "border-none font-bold text-[10px] md:text-sm px-3 py-0.5 rounded-lg tabular-nums shadow-sm", 
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

        {/* SECTION 5: VERIFICATION HUB */}
        <div className="pt-8 md:pt-14 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-8 md:gap-14">
          <div className="bg-white border border-slate-100 p-3 rounded-[1.5rem] shadow-xl shrink-0 flex flex-col items-center gap-2">
            <img src={qrUrl} alt="Verify" className="h-24 w-24 md:h-32 md:w-32 object-contain" crossOrigin="anonymous" referrerPolicy="no-referrer" />
            <span className="text-[8px] font-bold text-primary tracking-widest uppercase">Verified node</span>
          </div>

          <div className="space-y-4 flex-1 text-center md:text-left min-w-0 w-full">
            <div className="space-y-1">
               <div className="flex items-center justify-center md:justify-start gap-4">
                  <ShieldCheck className="h-5 w-5 text-emerald-600" />
                  <p className="text-base md:text-xl font-black text-[#0F172A] tracking-tight">Institutional registry verified</p>
               </div>
               <div className="min-w-0 px-1">
                  <p className="text-[8px] font-bold text-slate-300 uppercase tracking-widest">Question ID:</p>
                  <p className="text-[9px] md:text-[11px] font-mono font-bold text-primary break-all leading-tight mt-1">{resultId}</p>
               </div>
            </div>
            <p className="text-[9px] md:text-[11px] font-medium text-slate-400 leading-relaxed max-w-xl">
               Analysis node generated based on verified recruitment patterns. Authenticity can be audited via the binary QR question or at {webUrlRaw.toLowerCase()}. All performance markers are finalized and synchronized.
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
       "p-3 md:p-5 rounded-2xl border flex flex-col items-start gap-2 transition-all text-left",
       highlight ? "bg-primary/5 border-primary/20 shadow-sm" : "bg-white border-slate-50 shadow-sm"
    )}>
      <div className="h-7 w-7 rounded-lg bg-slate-50 flex items-center justify-center shrink-0 border border-slate-100">
        {React.cloneElement(icon as React.ReactElement, { className: "h-3.5 w-3.5" })}
      </div>
      <div className="space-y-0 w-full min-w-0">
        <p className="text-[8px] md:text-[9px] font-bold text-slate-400 truncate uppercase tracking-tight">{label}</p>
        <p className={cn("text-xs md:text-lg font-black text-[#0F172A] tabular-nums tracking-tighter truncate")}>{val}</p>
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
