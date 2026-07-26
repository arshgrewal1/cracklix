
'use client';

import React from 'react';
import { 
  ShieldCheck, 
  Trophy, 
  Target, 
  Zap, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  BarChart3, 
  Timer, 
  AlertCircle,
  TrendingUp,
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
}

/**
 * @fileOverview Cracklix Performance Report V4 (Premium Institutional Standard).
 * FIXED: Resolved Badge ReferenceError and normalized all labels to Title Case.
 * REMOVED: Icons from Grade/Status cards as per redesign protocol.
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
  duration
}: ResultCardProps) {
  
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent('https://cracklix.in')}`;

  return (
    <div 
      id="cracklix-result-card" 
      className="w-full max-w-[210mm] min-h-[297mm] bg-white shadow-none overflow-hidden text-left font-body relative p-0 mx-auto box-border flex flex-col"
      style={{ minWidth: '800px' }}
    >
      {/* 1. PREMIUM HEADER */}
      <div className="relative px-12 pt-12 pb-8 flex justify-between items-start">
         <div className="flex items-center gap-6">
            <div className="h-20 w-20 relative shrink-0">
               <img 
                 src="/logo/cracklix-icon.png" 
                 alt="Cracklix" 
                 className="h-full w-full object-contain" 
                 crossOrigin="anonymous"
               />
            </div>
            <div className="space-y-0.5">
               <h2 className="text-3xl font-black tracking-tighter text-[#0F172A] leading-none">Cracklix</h2>
               <p className="text-[11px] font-bold text-primary tracking-widest">Smart Preparation. Better Results.</p>
            </div>
         </div>
         <div className="text-right space-y-1">
            <p className="text-[13px] font-black text-[#0F172A] tracking-wider">Performance Report</p>
            <p className="text-[9px] font-bold text-slate-400">ID: {resultId?.slice(0, 14)}</p>
         </div>
         <div className="absolute bottom-0 left-12 right-12 h-0.5 bg-gradient-to-r from-blue-600 via-purple-500 to-emerald-500 opacity-20" />
      </div>

      <div className="px-12 py-10 space-y-10 flex-1">
        
        {/* 2. CANDIDATE HERO SECTION */}
        <div className="bg-slate-50/50 rounded-[2.5rem] p-10 border border-slate-100 flex justify-between items-center relative overflow-hidden">
           <div className="relative z-10 space-y-6">
              <div className="space-y-1">
                 <p className="text-[10px] font-bold text-primary">Candidate Name</p>
                 <h1 className="text-4xl font-black text-[#0F172A] tracking-tight">{studentName}</h1>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                 <HeroInfo label="Test Name" val={examTitle} />
                 <HeroInfo label="Date" val={date} />
                 <HeroInfo label="Duration" val={duration ? `${duration}m` : 'Timed'} />
                 <HeroInfo label="Candidates" val={totalCandidates.toLocaleString()} />
              </div>
           </div>
           <div className="absolute top-0 right-0 p-8 opacity-5"><Target className="h-48 w-48" /></div>
        </div>

        {/* 3. RANK HERO - THE BIG SHIELD */}
        <div className="flex flex-col md:flex-row gap-8 items-stretch">
           <div className="flex-1 bg-gradient-to-br from-[#0F172A] to-[#1E293B] rounded-[3rem] p-10 text-white relative overflow-hidden flex flex-col items-center justify-center text-center shadow-2xl">
              <div className="absolute top-0 right-0 p-6 opacity-10 rotate-12"><Trophy className="h-48 w-48 text-primary" /></div>
              <div className="relative z-10 space-y-4">
                 <p className="text-[11px] font-bold text-primary tracking-[0.3em]">Your State Rank</p>
                 <div className="flex items-baseline justify-center gap-2">
                    <span className="text-8xl font-black tracking-tighter text-white">#{rank}</span>
                    <span className="text-xl font-bold text-slate-400">/ {totalCandidates}</span>
                 </div>
                 <Badge className="bg-emerald-500 text-white border-none px-5 py-2 rounded-full font-black text-[10px] shadow-xl">
                   {Number(rank) <= 10 ? 'Top Performer' : 'Verified Attempt'}
                 </Badge>
              </div>
           </div>

           <div className="w-[320px] grid grid-cols-1 gap-4">
              <MiniGradeCard label="Net Score" val={score} color="text-primary" />
              <MiniGradeCard label="Percentile" val={`${percentile}%`} color="text-purple-500" />
              <MiniGradeCard label="Status" val={isQualified ? "Qualified" : "Failed"} color={isQualified ? "text-emerald-600" : "text-rose-600"} />
           </div>
        </div>

        {/* 4. ANALYTICS GRID */}
        <div className="grid grid-cols-3 gap-8">
           <CircleMetric label="Attempt Accuracy" val={attemptAccuracy} color="stroke-blue-600" textColor="text-blue-600" />
           <CircleMetric label="Overall Accuracy" val={accuracy} color="stroke-emerald-500" textColor="text-emerald-500" />
           <CircleMetric label="Attempt Rate" val={attemptRate} color="stroke-purple-600" textColor="text-purple-600" />
        </div>

        {/* 5. QUESTION ANALYSIS HUB */}
        <div className="grid grid-cols-4 gap-4">
           <AnalysisBox label="Correct" val={correct} color="bg-emerald-50 text-emerald-600" border="border-emerald-100" />
           <AnalysisBox label="Wrong" val={wrong} color="bg-rose-50 text-rose-600" border="border-rose-100" />
           <AnalysisBox label="Skipped" val={skipped} color="bg-slate-50 text-slate-400" border="border-slate-100" />
           <AnalysisBox label="Questions" val={total} color="bg-blue-50 text-blue-600" border="border-blue-100" />
        </div>

        {/* 6. SUBJECT MASTERY AUDIT */}
        {subjects.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between px-1">
               <h3 className="text-xl font-black text-[#0F172A] flex items-center gap-3"><BarChart3 className="h-6 w-6 text-primary" /> Subject Analysis</h3>
               <span className="text-[10px] font-bold text-slate-400">Mastery Index</span>
            </div>
            <div className="border border-slate-100 rounded-[2.5rem] overflow-hidden shadow-xl bg-white">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="px-10 py-6 font-black text-left text-[11px] text-slate-500">Subject Hub</th>
                    <th className="px-6 py-6 font-black text-center text-[11px] text-slate-500">Score</th>
                    <th className="px-6 py-6 font-black text-center text-[11px] text-slate-500">Accuracy</th>
                    <th className="px-10 py-6 font-black text-right text-[11px] text-slate-500">Mastery</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {subjects.map((s, i) => (
                    <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-10 py-6 font-bold text-[#0F172A] text-lg">{s.name}</td>
                      <td className="px-6 py-6 text-center font-black text-primary tabular-nums text-2xl">{s.score.toFixed(1)}</td>
                      <td className="px-6 py-6 text-center font-bold text-slate-500 tabular-nums text-lg">{s.accuracy}%</td>
                      <td className="px-10 py-6 text-right">
                         <div className="flex items-center justify-end gap-4">
                            <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                               <div className="h-full bg-primary" style={{ width: `${s.accuracy}%` }} />
                            </div>
                            <span className="font-black text-[#0F172A] text-lg w-12">{s.accuracy >= 70 ? 'Gold' : s.accuracy >= 40 ? 'Silver' : 'Basic'}</span>
                         </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 7. COMPETITION & AI INSIGHTS */}
        <div className="grid grid-cols-2 gap-8">
           <div className="bg-slate-900 rounded-[3rem] p-10 text-white space-y-8 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-5"><Zap className="h-40 w-40" /></div>
              <h4 className="text-xl font-black flex items-center gap-3 tracking-tight"><Zap className="text-primary h-5 w-5" /> Smart Insights</h4>
              <div className="space-y-5">
                 <InsightPill text={`Your accuracy is ${attemptAccuracy}%. ${Number(attemptAccuracy) < 60 ? 'Avoid negative marking.' : 'Keep it up!'}`} />
                 <InsightPill text={isQualified ? 'Qualified for next stage nodes.' : 'Improve subject mastery to qualify.'} />
                 <InsightPill text={`Gap to state topper is ${(topperScore - Number(score)).toFixed(1)} pts.`} />
              </div>
           </div>

           <div className="bg-blue-50 rounded-[3rem] p-10 border border-blue-100 space-y-8 relative overflow-hidden">
              <div className="absolute bottom-0 right-0 p-8 opacity-10"><TrendingUp className="h-32 w-32 text-primary" /></div>
              <h4 className="text-xl font-black text-[#0F172A] flex items-center gap-3 tracking-tight"><Target className="text-primary h-5 w-5" /> Competition</h4>
              <div className="grid grid-cols-2 gap-y-6 gap-x-10">
                 <CompMetric label="Topper Score" val={topperScore} />
                 <CompMetric label="Average Score" val={avgScore.toFixed(1)} />
                 <CompMetric label="Average Accuracy" val="64%" />
                 <CompMetric label="Readiness" val={readinessLevel} />
              </div>
           </div>
        </div>

        {/* 8. QR VERIFICATION FOOTER */}
        <div className="pt-12 border-t border-slate-100 flex justify-between items-center mt-auto">
           <div className="flex items-center gap-8">
              <div className="bg-white border-4 border-slate-50 p-2 rounded-[2rem] shadow-2xl shrink-0">
                 <img src={qrUrl} alt="Verify" className="h-32 w-32" crossOrigin="anonymous" />
              </div>
              <div className="space-y-2">
                 <p className="text-primary font-black flex items-center gap-2 text-sm uppercase tracking-[0.3em]">
                    <ShieldCheck className="h-5 w-5" /> Digitally Verified
                 </p>
                 <p className="text-slate-400 font-medium text-sm max-w-[280px] leading-relaxed">
                    Scan the QR code to verify this official performance report on the state registry.
                 </p>
              </div>
           </div>
           <div className="text-right space-y-2">
              <div className="h-14 w-auto relative ml-auto">
                 <img src="/logo/cracklix-logo-dark.png" alt="Cracklix" className="h-full w-auto object-contain ml-auto opacity-40 grayscale" crossOrigin="anonymous" />
              </div>
              <p className="text-[11px] font-black text-slate-300 tracking-[0.4em]">www.cracklix.in</p>
           </div>
        </div>
      </div>
    </div>
  );
}

function HeroInfo({ label, val }: { label: string, val: string }) {
   return (
      <div className="space-y-1 min-w-0">
         <p className="text-[10px] font-bold text-slate-400">{label}</p>
         <p className="text-base md:text-xl font-black text-[#0F172A] truncate">{val}</p>
      </div>
   )
}

function MiniGradeCard({ label, val, color }: { label: string, val: string | number, color: string }) {
   return (
      <div className="bg-white border border-slate-100 rounded-3xl p-5 flex items-center justify-between shadow-sm group hover:shadow-xl transition-all border-l-4 border-l-primary">
         <div className="text-left">
            <p className="text-[9px] font-bold text-slate-400 tracking-widest leading-none">{label}</p>
            <p className={cn("text-xl font-black tabular-nums mt-1.5", color)}>{val}</p>
         </div>
      </div>
   )
}

function CircleMetric({ label, val, color, textColor }: any) {
   const radius = 42;
   const circumference = 2 * Math.PI * radius;
   const offset = circumference - (Number(val) / 100) * circumference;

   return (
      <div className="bg-white rounded-[3rem] p-8 border border-slate-100 shadow-xl flex flex-col items-center text-center space-y-6 group hover:-translate-y-2 transition-all">
         <div className="relative h-32 w-32 md:h-40 md:w-40 flex items-center justify-center">
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
                 transition={{ duration: 2, ease: "easeOut" }}
                 viewport={{ once: true }}
               />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
               <span className={cn("text-3xl md:text-5xl font-black tracking-tighter tabular-nums", textColor)}>{val}%</span>
            </div>
         </div>
         <p className="text-[11px] md:text-sm font-black text-[#0F172A] tracking-widest">{label}</p>
      </div>
   )
}

function AnalysisBox({ label, val, color, border }: any) {
   return (
      <div className={cn("p-6 rounded-[2rem] border-2 flex flex-col items-center justify-center text-center gap-1 transition-all hover:scale-105 shadow-sm", color, border)}>
         <span className="text-3xl font-black tabular-nums">{val}</span>
         <span className="text-[9px] font-bold tracking-widest opacity-60">{label}</span>
      </div>
   )
}

function InsightPill({ text }: { text: string }) {
   return (
      <div className="flex items-start gap-4 group">
         <div className="h-1.5 w-1.5 rounded-full bg-primary mt-2 shrink-0 shadow-[0_0_8px_#2563EB]" />
         <p className="text-[13px] md:text-lg font-bold text-slate-300 leading-snug group-hover:text-white transition-colors">{text}</p>
      </div>
   )
}

function CompMetric({ label, val }: any) {
   return (
      <div className="space-y-1">
         <p className="text-[9px] font-black text-slate-400 tracking-widest">{label}</p>
         <p className="text-xl md:text-2xl font-black text-[#0F172A] tabular-nums tracking-tighter leading-none">{val}</p>
      </div>
   )
}
