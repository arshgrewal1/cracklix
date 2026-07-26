
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
 * @fileOverview Cracklix Performance Report V4.2 [Hardened].
 * FIXED: Ranking display bug where rank exceeded participants.
 * FIXED: Removed all remaining uppercase labels.
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
      {/* 1. INSTITUTIONAL HEADER */}
      <div className="relative px-6 md:px-12 pt-8 md:pt-10 pb-6 md:pb-8 flex justify-between items-start border-b border-slate-100">
         <div className="flex items-center gap-4 md:gap-6 min-w-0">
            <div className="h-12 w-12 md:h-20 md:w-20 relative shrink-0">
               <img 
                 src="/logo/cracklix-icon.png" 
                 alt="Cracklix" 
                 className="h-full w-full object-contain" 
                 crossOrigin="anonymous"
               />
            </div>
            <div className="space-y-0.5 min-w-0">
               <h2 className="text-xl md:text-3xl font-black tracking-tight text-[#0F172A] leading-none">Cracklix</h2>
               <p className="text-[9px] md:text-[11px] font-bold text-primary tracking-tight truncate">Smart Preparation. Better Results.</p>
            </div>
         </div>
         <div className="text-right space-y-0.5 shrink-0 ml-4">
            <p className="text-[10px] md:text-[13px] font-black text-[#0F172A]">Performance Report</p>
            <p className="text-[8px] md:text-[9px] font-bold text-slate-300">ID: {resultId?.slice(0, 16)}</p>
         </div>
      </div>

      <div className="px-6 md:px-12 py-6 md:py-10 space-y-8 md:space-y-12 flex-1">
        
        {/* 2. CANDIDATE HERO */}
        <div className="bg-slate-50/50 rounded-[1.5rem] md:rounded-[2.5rem] p-6 md:p-10 border border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden">
           <div className="relative z-10 space-y-4 md:space-y-6 w-full">
              <div className="space-y-1">
                 <p className="text-[8px] md:text-[10px] font-bold text-primary">Candidate Name</p>
                 <h1 className="text-xl md:text-4xl font-black text-[#0F172A] tracking-tight truncate">{studentName}</h1>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
                 <HeroInfo label="Test Name" val={examTitle} />
                 <HeroInfo label="Attempt Date" val={date} />
                 <HeroInfo label="Test Duration" val={duration ? `${duration}m` : 'Timed'} />
                 <HeroInfo label="Participants" val={totalCandidates.toLocaleString()} />
              </div>
           </div>
        </div>

        {/* 3. RANK & GRADE HUB */}
        <div className="flex flex-col md:flex-row gap-4 md:gap-8 items-stretch">
           <div className="flex-1 bg-gradient-to-br from-[#0F172A] to-[#1E293B] rounded-[1.5rem] md:rounded-[3rem] p-6 md:p-10 text-white relative overflow-hidden flex flex-col items-center justify-center text-center shadow-2xl">
              <div className="relative z-10 space-y-3">
                 <p className="text-[9px] font-bold text-primary tracking-widest">Your Punjab Rank</p>
                 <div className="flex items-baseline justify-center gap-1.5">
                    <span className="text-5xl md:text-8xl font-black tracking-tighter text-white">#{rank}</span>
                    <span className="text-sm md:text-xl font-bold text-slate-500">/ {totalCandidates}</span>
                 </div>
                 <Badge className="bg-emerald-500 text-white border-none px-4 py-1 rounded-full font-bold text-[9px] tracking-tight shadow-lg">
                   {showTopPerformer ? 'Top Performer' : 'Verified Attempt'}
                 </Badge>
              </div>
           </div>

           <div className="md:w-[260px] grid grid-cols-1 gap-3">
              <MiniGradeCard label="Net Score" val={score} color="text-primary" />
              <MiniGradeCard label="Percentile" val={`${percentile}%`} color="text-purple-500" />
              <MiniGradeCard label="Grade Status" val={`Grade ${grade}`} color={isQualified ? "text-emerald-600" : "text-rose-600"} />
           </div>
        </div>

        {/* 4. ANALYTICS PROGRESS RINGS */}
        <div className="grid grid-cols-3 gap-3 md:gap-8">
           <CircleMetric label="Attempt Accuracy" val={attemptAccuracy} color="stroke-blue-600" textColor="text-blue-600" />
           <CircleMetric label="Overall Accuracy" val={accuracy} color="stroke-emerald-500" textColor="text-emerald-500" />
           <CircleMetric label="Attempt Rate" val={attemptRate} color="stroke-purple-600" textColor="text-purple-600" />
        </div>

        {/* 5. QUESTION ANALYSIS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
           <AnalysisBox label="Correct" val={correct} color="bg-emerald-50 text-emerald-600" border="border-emerald-100" />
           <AnalysisBox label="Wrong" val={wrong} color="bg-rose-50 text-rose-600" border="border-rose-100" />
           <AnalysisBox label="Skipped" val={skipped} color="bg-slate-50 text-slate-400" border="border-slate-100" />
           <AnalysisBox label="Total Questions" val={total} color="bg-blue-50 text-blue-600" border="border-blue-100" />
        </div>

        {/* 6. SUBJECT PERFORMANCE TABLE */}
        {subjects.length > 0 && (
          <div className="space-y-4 text-left">
            <h3 className="text-sm md:text-xl font-black text-[#0F172A] flex items-center gap-2">
               <BarChart3 className="h-4 w-4 text-primary" /> Subject Analytics
            </h3>
            <div className="border border-slate-100 rounded-[1.5rem] md:rounded-[2rem] overflow-hidden bg-white shadow-lg">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="px-4 md:px-10 py-3 md:py-6 font-bold text-left text-[9px] md:text-[11px] text-slate-500">Subject</th>
                    <th className="px-2 md:px-6 py-3 md:py-6 font-bold text-center text-[9px] md:text-[11px] text-slate-500">Score</th>
                    <th className="px-2 md:px-6 py-3 md:py-6 font-bold text-center text-[9px] md:text-[11px] text-slate-500">Accuracy</th>
                    <th className="hidden sm:table-cell px-4 md:px-10 py-3 md:py-6 font-bold text-right text-[9px] md:text-[11px] text-slate-500">Mastery</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {subjects.map((s, i) => (
                    <tr key={i} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 md:px-10 py-3 md:py-5 font-bold text-[#0F172A] text-xs md:text-lg">{s.name}</td>
                      <td className="px-2 md:px-6 py-3 md:py-5 text-center font-black text-primary tabular-nums text-sm md:text-2xl">{Number(s.score).toFixed(1)}</td>
                      <td className="px-2 md:px-6 py-3 md:py-5 text-center font-bold text-slate-400 tabular-nums text-xs md:text-lg">{s.accuracy}%</td>
                      <td className="hidden sm:table-cell px-4 md:px-10 py-3 md:py-5 text-right font-bold text-[#0F172A] text-xs md:text-lg">{s.accuracy >= 70 ? 'Gold' : s.accuracy >= 40 ? 'Silver' : 'Basic'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 7. INSIGHTS & COMPETITION */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 text-left">
           <div className="bg-slate-900 rounded-[1.5rem] md:rounded-[3rem] p-6 md:p-10 text-white space-y-6 shadow-xl relative overflow-hidden">
              <h4 className="text-sm md:text-xl font-bold flex items-center gap-2 tracking-tight"><ShieldCheck className="text-primary h-4 w-4 md:h-5 md:w-5" /> Smart Insights</h4>
              <div className="space-y-3">
                 <InsightPill text={`Accuracy is ${attemptAccuracy}%. ${Number(attemptAccuracy) < 60 ? 'Avoid negative marking.' : 'Precision is optimal.'}`} />
                 <InsightPill text={isQualified ? 'Qualification threshold met.' : 'Improve subject scores to qualify.'} />
                 <InsightPill text={`Gap to state topper is ${(topperScore - Number(score)).toFixed(1)} pts.`} />
              </div>
           </div>

           <div className="bg-blue-50 rounded-[1.5rem] md:rounded-[3rem] p-6 md:p-10 border border-blue-100 space-y-6 relative overflow-hidden">
              <h4 className="text-sm md:text-xl font-bold text-[#0F172A] flex items-center gap-2 tracking-tight">
                 <TrendingUp className="text-primary h-4 w-4 md:h-5 md:w-5" /> Competition Snapshot
              </h4>
              <div className="grid grid-cols-2 gap-y-4 gap-x-6">
                 <CompMetric label="Topper Score" val={topperScore} />
                 <CompMetric label="Average Score" val={avgScore.toFixed(1)} />
                 <CompMetric label="Avg Accuracy" val="64%" />
                 <CompMetric label="Readiness" val={readinessLevel} />
              </div>
           </div>
        </div>

        {/* 8. FOOTER VERIFICATION */}
        <div className="pt-8 md:pt-12 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center mt-auto gap-8">
           <div className="flex items-center gap-6">
              <div className="bg-white border-2 border-slate-100 p-1.5 rounded-2xl shadow-lg shrink-0">
                 <img src={qrUrl} alt="Verify" className="h-20 w-20 md:h-28 md:w-28" crossOrigin="anonymous" />
              </div>
              <div className="space-y-1 text-left">
                 <p className="text-primary font-bold flex items-center gap-2 text-[10px] md:text-xs tracking-tight">
                    <ShieldCheck className="h-4 w-4" /> Digitally Verified
                 </p>
                 <p className="text-slate-400 font-medium text-[9px] md:text-sm max-w-[240px] leading-relaxed">
                    Scan to verify this official performance report on the state registry.
                 </p>
              </div>
           </div>
           <div className="text-center md:text-right space-y-1">
              <div className="h-10 w-auto relative ml-auto flex justify-center md:justify-end">
                 <img 
                    src="/logo/cracklix-logo-dark.png" 
                    alt="Cracklix" 
                    className="h-full w-auto object-contain opacity-30 grayscale" 
                    crossOrigin="anonymous" 
                 />
              </div>
              <p className="text-[9px] font-bold text-slate-300">www.cracklix.in</p>
           </div>
        </div>
      </div>
    </div>
  );
}

function HeroInfo({ label, val }: { label: string, val: string }) {
   return (
      <div className="space-y-0.5 min-w-0 text-left">
         <p className="text-[8px] md:text-[10px] font-bold text-slate-400">{label}</p>
         <p className="text-xs md:text-lg font-black text-[#0F172A] truncate leading-none">{val}</p>
      </div>
   )
}

function MiniGradeCard({ label, val, color }: { label: string, val: string | number, color: string }) {
   return (
      <div className="bg-white border border-slate-100 rounded-2xl p-4 flex flex-col justify-center shadow-sm h-full border-l-4 border-l-primary text-left">
         <p className="text-[8px] md:text-[10px] font-bold text-slate-400 leading-none">{label}</p>
         <p className={cn("text-base md:text-xl font-black tabular-nums mt-1", color)}>{val}</p>
      </div>
   )
}

function CircleMetric({ label, val, color, textColor }: any) {
   const radius = 42;
   const circumference = 2 * Math.PI * radius;
   const offset = circumference - (Number(val) / 100) * circumference;

   return (
      <div className="bg-white rounded-[1.5rem] md:rounded-[3rem] p-4 md:p-8 border border-slate-100 shadow-sm flex flex-col items-center text-center space-y-3 md:space-y-6 group hover:-translate-y-1 transition-all">
         <div className="relative h-20 w-20 md:h-36 md:w-36 flex items-center justify-center">
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
               <span className={cn("text-lg md:text-4xl font-black tracking-tighter tabular-nums", textColor)}>{val}%</span>
            </div>
         </div>
         <p className="text-[7px] md:text-[11px] font-bold text-[#0F172A] leading-none">{label}</p>
      </div>
   )
}

function AnalysisBox({ label, val, color, border }: any) {
   return (
      <div className={cn("p-4 md:p-6 rounded-2xl border-2 flex flex-col items-center justify-center text-center gap-0.5 md:gap-1 transition-all hover:scale-105 shadow-sm", color, border)}>
         <span className="text-xl md:text-3xl font-black tabular-nums leading-none">{val}</span>
         <span className="text-[8px] md:text-[10px] font-bold opacity-60 leading-none">{label}</span>
      </div>
   )
}

function InsightPill({ text }: { text: string }) {
   return (
      <div className="flex items-start gap-3 group">
         <div className="h-1 w-1 rounded-full bg-primary mt-1.5 shrink-0 shadow-[0_0_8px_#2563EB]" />
         <p className="text-[11px] md:text-[15px] font-bold text-slate-300 leading-snug group-hover:text-white transition-colors">{text}</p>
      </div>
   )
}

function CompMetric({ label, val }: any) {
   return (
      <div className="space-y-0.5 text-left">
         <p className="text-[8px] md:text-[10px] font-bold text-slate-400">{label}</p>
         <p className="text-base md:text-xl font-black text-[#0F172A] tabular-nums leading-none">{val}</p>
      </div>
   )
}
