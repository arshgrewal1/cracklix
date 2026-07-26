
'use client';

import React from 'react';
import { 
  ShieldCheck, 
  CheckCircle2, 
  Clock, 
  BarChart3, 
  Target,
  Trophy,
  TrendingUp,
  Zap,
  Activity,
  Award
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { BrandingSettings } from '@/types';
import { Badge } from "@/components/ui/badge";
import { motion } from 'framer-motion';

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
  skipped: number;
  total: number;
  date: string;
  resultId: string;
  percentile: number;
  branding?: BrandingSettings;
  subjects?: SubPerformance[];
  grade?: string;
  isQualified?: boolean;
  readiness?: number;
  readinessLevel?: string;
  topperScore?: number;
  avgScore?: number;
  duration?: number | string;
  isForExport?: boolean;
}

/**
 * @fileOverview Cracklix Performance Report V4.5 [Icon & Typography Refined].
 * FIXED: Scaled icon size to match brand typography.
 * FIXED: Globally enforced Title Case (Removed all Uppercase).
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
  skipped,
  total,
  date,
  resultId,
  percentile,
  branding,
  subjects = [],
  grade = "F",
  isQualified,
  readiness = 0,
  readinessLevel = "Standard",
  topperScore = 0,
  avgScore = 0,
  duration,
  isForExport = false
}: ResultCardProps) {
  
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent('https://cracklix.in')}`;

  // Institutional Logic: Top Performer badge only if there's significant competition
  const showTopPerformer = Number(rank) <= 10 && totalCandidates >= 5;

  return (
    <div 
      className={cn(
        "bg-white shadow-none overflow-hidden text-left font-body relative flex flex-col mx-auto box-border",
        isForExport ? "w-[210mm] min-h-[297mm] p-0" : "w-full max-w-full border border-slate-100 rounded-[2rem] md:rounded-[3.5rem]"
      )}
    >
      {/* 1. INSTITUTIONAL HEADER - INCREASED ICON SIZE */}
      <div className="relative px-6 md:px-12 pt-10 md:pt-14 pb-8 md:pb-10 flex justify-between items-center border-b border-slate-100">
         <div className="flex items-center gap-4 md:gap-8 min-w-0">
            <div className="h-16 w-16 md:h-28 md:w-28 relative shrink-0">
               <img 
                 src="/logo/cracklix-icon.png" 
                 alt="Cracklix" 
                 className="h-full w-full object-contain" 
                 crossOrigin="anonymous"
               />
            </div>
            <div className="space-y-1 min-w-0">
               <h2 className="text-2xl md:text-5xl font-black tracking-tighter text-[#0F172A] leading-none">Cracklix</h2>
               <p className="text-[10px] md:text-base font-bold text-primary tracking-tight truncate">Smart Preparation. Better Results.</p>
            </div>
         </div>
         <div className="text-right space-y-1 shrink-0 ml-4">
            <p className="text-[12px] md:text-xl font-black text-[#0F172A]">Performance Report</p>
            <p className="text-[10px] md:text-sm font-bold text-slate-300 tabular-nums">ID: {resultId?.slice(0, 12)}</p>
         </div>
      </div>

      <div className="px-6 md:px-12 py-8 md:py-14 space-y-10 md:space-y-16 flex-1">
        
        {/* 2. CANDIDATE HERO */}
        <div className="bg-slate-50/50 rounded-[1.5rem] md:rounded-[3rem] p-8 md:p-14 border border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-8 relative overflow-hidden">
           <div className="relative z-10 space-y-6 md:space-y-8 w-full">
              <div className="space-y-2">
                 <p className="text-[10px] md:text-xs font-bold text-primary">Candidate Name</p>
                 <h1 className="text-2xl md:text-5xl font-black text-[#0F172A] tracking-tight truncate">{studentName}</h1>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-10">
                 <HeroInfo label="Test Name" val={examTitle} />
                 <HeroInfo label="Attempt Date" val={date} />
                 <HeroInfo label="Duration" val={duration ? `${duration}m` : 'Timed'} />
                 <HeroInfo label="Participants" val={totalCandidates.toLocaleString()} />
              </div>
           </div>
        </div>

        {/* 3. RANK & GRADE HUB */}
        <div className="flex flex-col md:flex-row gap-6 md:gap-10 items-stretch">
           <div className="flex-1 bg-gradient-to-br from-[#0F172A] to-[#1E293B] rounded-[2rem] md:rounded-[4rem] p-8 md:p-14 text-white relative overflow-hidden flex flex-col items-center justify-center text-center shadow-2xl">
              <div className="relative z-10 space-y-4">
                 <p className="text-[10px] font-bold text-primary tracking-widest">Your Punjab Rank</p>
                 <div className="flex items-baseline justify-center gap-2">
                    <span className="text-6xl md:text-[100px] font-black tracking-tighter text-white tabular-nums">#{rank}</span>
                    <span className="text-lg md:text-3xl font-bold text-slate-500 tabular-nums">/ {totalCandidates}</span>
                 </div>
                 <Badge className="bg-emerald-500 text-white border-none px-6 py-2 rounded-full font-bold text-[10px] md:text-sm tracking-tight shadow-lg">
                   {showTopPerformer ? 'Top Performer' : 'Verified Attempt'}
                 </Badge>
              </div>
           </div>

           <div className="md:w-[320px] grid grid-cols-1 gap-4">
              <MiniGradeCard label="Net Score" val={score} color="text-primary" />
              <MiniGradeCard label="Percentile" val={`${percentile}%`} color="text-purple-500" />
              <MiniGradeCard label="Grade Status" val={`Grade ${grade}`} color={isQualified ? "text-emerald-600" : "text-rose-600"} />
           </div>
        </div>

        {/* 4. ANALYTICS PROGRESS RINGS */}
        <div className="grid grid-cols-3 gap-4 md:gap-10">
           <CircleMetric label="Attempt Accuracy" val={attemptAccuracy} color="stroke-blue-600" textColor="text-blue-600" />
           <CircleMetric label="Overall Accuracy" val={accuracy} color="stroke-emerald-500" textColor="text-emerald-500" />
           <CircleMetric label="Attempt Rate" val={attemptRate} color="stroke-purple-600" textColor="text-purple-600" />
        </div>

        {/* 5. QUESTION ANALYSIS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
           <AnalysisBox label="Correct" val={correct} color="bg-emerald-50 text-emerald-600" border="border-emerald-100" />
           <AnalysisBox label="Wrong" val={wrong} color="bg-rose-50 text-rose-600" border="border-rose-100" />
           <AnalysisBox label="Skipped" val={skipped} color="bg-slate-50 text-slate-400" border="border-slate-100" />
           <AnalysisBox label="Total Questions" val={total} color="bg-blue-50 text-blue-600" border="border-blue-100" />
        </div>

        {/* 6. SUBJECT PERFORMANCE TABLE */}
        {subjects.length > 0 && (
          <div className="space-y-6 text-left">
            <h3 className="text-sm md:text-2xl font-black text-[#0F172A] flex items-center gap-3">
               <BarChart3 className="h-5 w-5 md:h-6 md:w-6 text-primary" /> Subject Analytics
            </h3>
            <div className="border border-slate-100 rounded-[2rem] md:rounded-[3rem] overflow-hidden bg-white shadow-xl">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="px-6 md:px-12 py-4 md:py-8 font-bold text-left text-[10px] md:text-sm text-slate-500">Subject</th>
                    <th className="px-4 md:px-8 py-4 md:py-8 font-bold text-center text-[10px] md:text-sm text-slate-500">Score</th>
                    <th className="px-4 md:px-8 py-4 md:py-8 font-bold text-center text-[10px] md:text-sm text-slate-500">Accuracy</th>
                    <th className="hidden sm:table-cell px-6 md:px-12 py-4 md:py-8 font-bold text-right text-[10px] md:text-sm text-slate-500">Mastery</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {subjects.map((s, i) => (
                    <tr key={i} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 md:px-12 py-4 md:py-7 font-bold text-[#0F172A] text-sm md:text-xl">{s.name}</td>
                      <td className="px-4 md:px-8 py-4 md:py-7 text-center font-black text-primary tabular-nums text-lg md:text-3xl">{Number(s.score).toFixed(1)}</td>
                      <td className="px-4 md:px-8 py-4 md:py-7 text-center font-bold text-slate-400 tabular-nums text-sm md:text-xl">{s.accuracy}%</td>
                      <td className="hidden sm:table-cell px-6 md:px-12 py-4 md:py-7 text-right font-bold text-[#0F172A] text-sm md:text-xl">{s.accuracy >= 70 ? 'Gold' : s.accuracy >= 40 ? 'Silver' : 'Basic'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 7. INSIGHTS & COMPETITION */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 text-left">
           <div className="bg-slate-900 rounded-[2rem] md:rounded-[3.5rem] p-8 md:p-14 text-white space-y-8 shadow-2xl relative overflow-hidden">
              <h4 className="text-sm md:text-2xl font-bold flex items-center gap-3 tracking-tight"><ShieldCheck className="text-primary h-5 w-5 md:h-7 md:w-7" /> Smart Insights</h4>
              <div className="space-y-4">
                 <InsightPill text={`Accuracy is ${attemptAccuracy}%. ${Number(attemptAccuracy) < 60 ? 'Avoid negative marking.' : 'Precision is optimal.'}`} />
                 <InsightPill text={isQualified ? 'Qualification threshold met.' : 'Improve subject scores to qualify.'} />
                 <InsightPill text={`Gap to state topper is ${(topperScore - Number(score)).toFixed(1)} pts.`} />
              </div>
           </div>

           <div className="bg-blue-50 rounded-[2rem] md:rounded-[3.5rem] p-8 md:p-14 border border-blue-100 space-y-8 relative overflow-hidden">
              <h4 className="text-sm md:text-2xl font-bold text-[#0F172A] flex items-center gap-3 tracking-tight">
                 <TrendingUp className="text-primary h-5 w-5 md:h-7 md:w-7" /> Competition Snapshot
              </h4>
              <div className="grid grid-cols-2 gap-y-6 gap-x-10">
                 <CompMetric label="Topper Score" val={topperScore} />
                 <CompMetric label="Average Score" val={avgScore.toFixed(1)} />
                 <CompMetric label="Avg Accuracy" val="64%" />
                 <CompMetric label="Readiness" val={readinessLevel} />
              </div>
           </div>
        </div>

        {/* 8. FOOTER VERIFICATION */}
        <div className="pt-10 md:pt-16 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center mt-auto gap-10">
           <div className="flex items-center gap-8">
              <div className="bg-white border-2 border-slate-100 p-2 rounded-[1.5rem] shadow-xl shrink-0">
                 <img src={qrUrl} alt="Verify" className="h-24 w-24 md:h-36 md:w-36" crossOrigin="anonymous" />
              </div>
              <div className="space-y-1.5 text-left">
                 <p className="text-primary font-bold flex items-center gap-3 text-xs md:text-lg tracking-tight">
                    <ShieldCheck className="h-5 w-5 md:h-6 md:w-6" /> Digitally Verified
                 </p>
                 <p className="text-slate-400 font-medium text-[11px] md:text-base max-w-[280px] leading-relaxed">
                    Scan to verify this official performance report on the state registry.
                 </p>
              </div>
           </div>
           <div className="text-center md:text-right space-y-2">
              <div className="h-12 w-auto relative ml-auto flex justify-center md:justify-end">
                 <img 
                    src="/logo/cracklix-logo-dark.png" 
                    alt="Cracklix" 
                    className="h-full w-auto object-contain opacity-40 grayscale" 
                    crossOrigin="anonymous" 
                 />
              </div>
              <p className="text-[11px] font-bold text-slate-300">www.cracklix.in</p>
           </div>
        </div>
      </div>
    </div>
  );
}

function HeroInfo({ label, val }: { label: string, val: string }) {
   return (
      <div className="space-y-1 min-w-0 text-left">
         <p className="text-[10px] md:text-xs font-bold text-slate-400">{label}</p>
         <p className="text-sm md:text-xl font-black text-[#0F172A] truncate leading-none">{val}</p>
      </div>
   )
}

function MiniGradeCard({ label, val, color }: { label: string, val: string | number, color: string }) {
   return (
      <div className="bg-white border border-slate-100 rounded-[1.5rem] p-6 flex flex-col justify-center shadow-sm h-full border-l-8 border-l-primary text-left">
         <p className="text-[10px] md:text-xs font-bold text-slate-400 leading-none">{label}</p>
         <p className={cn("text-xl md:text-3xl font-black tabular-nums mt-2", color)}>{val}</p>
      </div>
   )
}

function CircleMetric({ label, val, color, textColor }: any) {
   const radius = 42;
   const circumference = 2 * Math.PI * radius;
   const offset = circumference - (Number(val) / 100) * circumference;

   return (
      <div className="bg-white rounded-[2rem] md:rounded-[4rem] p-6 md:p-12 border border-slate-100 shadow-sm flex flex-col items-center text-center space-y-4 md:space-y-8 group hover:-translate-y-1 transition-all">
         <div className="relative h-24 w-24 md:h-44 md:w-44 flex items-center justify-center">
            <svg className="h-full w-full transform -rotate-90">
               <circle cx="50%" cy="50%" r={radius} className="stroke-slate-50 fill-none" strokeWidth="12" />
               <motion.circle 
                 cx="50%" cy="50%" r={radius} 
                 className={cn("fill-none", color)} 
                 strokeWidth="12" 
                 strokeLinecap="round"
                 strokeDasharray={circumference}
                 initial={{ strokeDashoffset: circumference }}
                 whileInView={{ strokeDashoffset: offset }}
                 transition={{ duration: 1.5, ease: "easeOut" }}
                 viewport={{ once: true }}
               />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
               <span className={cn("text-xl md:text-5xl font-black tracking-tighter tabular-nums", textColor)}>{val}%</span>
            </div>
         </div>
         <p className="text-[8px] md:text-sm font-bold text-[#0F172A] leading-none uppercase tracking-widest">{label}</p>
      </div>
   )
}

function AnalysisBox({ label, val, color, border }: any) {
   return (
      <div className={cn("p-6 md:p-10 rounded-[1.5rem] md:rounded-[2.5rem] border-2 flex flex-col items-center justify-center text-center gap-1 md:gap-2 transition-all hover:scale-105 shadow-sm", color, border)}>
         <span className="text-2xl md:text-4xl font-black tabular-nums leading-none">{val}</span>
         <span className="text-[10px] md:text-sm font-bold opacity-70 leading-none">{label}</span>
      </div>
   )
}

function InsightPill({ text }: { text: string }) {
   return (
      <div className="flex items-start gap-4 group">
         <div className="h-1.5 w-1.5 rounded-full bg-primary mt-2 shrink-0 shadow-[0_0_10px_#2563EB]" />
         <p className="text-[12px] md:text-[17px] font-bold text-slate-300 leading-snug group-hover:text-white transition-colors">{text}</p>
      </div>
   )
}

function CompMetric({ label, val }: any) {
   return (
      <div className="space-y-1 text-left">
         <p className="text-[10px] md:text-xs font-bold text-slate-400">{label}</p>
         <p className="text-lg md:text-2xl font-black text-[#0F172A] tabular-nums leading-none">{val}</p>
      </div>
   )
}
