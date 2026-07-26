
'use client';

import React from 'react';
import { 
  Shield, 
  Trophy, 
  ShieldCheck, 
  BarChart3, 
  Target, 
  Clock, 
  Calendar, 
  Download, 
  RefreshCw, 
  ChevronDown 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';

interface ShareableResultCardProps {
  data: any;
  rank: number | string;
  totalCandidates: number;
}

/**
 * @fileOverview Institutional Scorecard Node v8.0.
 * Visually 100% identical to the Cracklix Analysis Page.
 * Dimensions: 1080x1350 for HD Social Sharing.
 */
export default function ShareableResultCard({ data, rank, totalCandidates }: ShareableResultCardProps) {
  if (!data) return null;

  return (
    <div 
      id="cracklix-result-card-canvas"
      className="w-[1080px] h-[1350px] bg-[#F8FAFC] flex flex-col p-12 text-[#0F172A] font-body"
      style={{ fontFamily: 'Poppins, sans-serif' }}
    >
      {/* 1. APP NAV REPLICA */}
      <div className="flex items-center justify-between mb-8 px-4">
        <div className="flex items-center">
           <img 
             src="/logo/cracklix-logo-dark.png" 
             alt="Cracklix" 
             className="h-24 w-auto object-contain" 
           />
        </div>
        <div className="flex gap-4">
           <div className="h-12 w-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400">
             <Image src="https://picsum.photos/seed/search/48/48" width={24} height={24} alt="search" className="opacity-40" />
           </div>
           <div className="h-12 w-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 overflow-hidden">
             <img src={`https://picsum.photos/seed/${data.userId}/48/48`} alt="user" />
           </div>
        </div>
      </div>

      {/* 2. TEST HEADER CARD */}
      <div className="bg-white rounded-[32px] p-10 shadow-sm border border-slate-100 flex flex-col md:flex-row items-center justify-between gap-8 mb-8">
         <div className="flex items-center gap-8 flex-1">
            <div className="h-24 w-24 rounded-full bg-blue-50 flex items-center justify-center text-primary shrink-0">
               <Shield className="h-12 w-12" />
            </div>
            <div className="space-y-4">
               <h1 className="text-4xl font-bold tracking-tight">{data.mockTitle}</h1>
               <div className="flex items-center gap-4">
                  <Badge className="bg-[#E6F9F3] text-[#10B981] border-none font-bold uppercase tracking-widest px-4 py-1.5 rounded-lg">Verified Hub</Badge>
                  <Badge className="bg-[#EBF2FF] text-[#2563EB] border-none font-bold uppercase tracking-widest px-4 py-1.5 rounded-lg">Attempt #6</Badge>
               </div>
               <div className="flex items-center gap-6 text-slate-400 font-semibold text-lg">
                  <span className="flex items-center gap-2"><Calendar className="h-5 w-5" /> {new Date(data.timestamp).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}</span>
                  <div className="h-1.5 w-1.5 rounded-full bg-slate-300" />
                  <span className="flex items-center gap-2"><Clock className="h-5 w-5" /> Duration: 25:00</span>
               </div>
            </div>
         </div>
         <div className="flex flex-col gap-4 shrink-0">
            <div className="flex items-center gap-3 px-8 h-14 bg-white border-2 border-slate-100 rounded-2xl font-bold text-slate-600">
               <Download className="h-5 w-5" /> Download PDF
            </div>
            <div className="flex items-center gap-3 px-8 h-14 bg-white border-2 border-slate-100 rounded-2xl font-bold text-slate-600">
               <RefreshCw className="h-5 w-5" /> Retake Test
            </div>
         </div>
      </div>

      {/* 3. SCORE SECTION */}
      <div className="grid grid-cols-5 gap-6 mb-8">
         <div className="col-span-2 bg-white border border-[#E6F9F3] rounded-[32px] p-8 shadow-sm flex flex-col justify-center">
            <p className="text-lg font-semibold text-slate-500 mb-2">Your Score</p>
            <div className="flex items-baseline gap-2">
               <span className="text-8xl font-bold text-[#10B981] leading-none">{data.score}</span>
               <span className="text-4xl font-bold text-slate-300">/ {data.totalQuestions}</span>
            </div>
            <p className="text-xl font-bold text-[#10B981] mt-4">{data.attemptAccuracy}%</p>
         </div>
         <MiniStat label="Correct" val={data.correctCount} color="text-[#10B981]" bg="bg-[#E6F9F3]" border="border-[#E6F9F3]" />
         <MiniStat label="Wrong" val={data.wrongCount} color="text-[#F43F5E]" bg="bg-[#FFF1F2]" border="border-[#FFF1F2]" />
         <MiniStat label="Skipped" val={data.skippedCount} color="text-slate-500" bg="bg-slate-50" border="border-slate-100" />
         <MiniStat label="Total" val={data.totalQuestions} color="text-[#2563EB]" bg="bg-[#EBF2FF]" border="border-[#EBF2FF]" />
      </div>

      {/* 4. RANK SECTION */}
      <div className="bg-white border border-slate-100 rounded-[32px] p-10 shadow-sm flex items-center justify-between mb-8">
         <div className="flex items-center gap-8">
            <div className="h-20 w-20 rounded-full bg-[#2563EB] flex items-center justify-center text-white shadow-xl">
               <Trophy className="h-10 w-10" />
            </div>
            <div className="space-y-1">
               <p className="text-xl font-bold text-slate-500 uppercase tracking-widest">Your Punjab Rank</p>
               <div className="flex items-baseline gap-3">
                  <span className="text-7xl font-bold text-[#2563EB]">#{rank}</span>
                  <span className="text-2xl font-bold text-slate-300">/ {totalCandidates} Candidates</span>
               </div>
            </div>
         </div>
         <div className="flex items-center gap-6 pl-10 border-l border-slate-100">
            <div className="h-14 w-14 rounded-full bg-blue-50 flex items-center justify-center text-primary">
               <ShieldCheck className="h-8 w-8" />
            </div>
            <div className="space-y-1">
               <p className="text-xl font-bold text-[#2563EB] leading-none">Verified Standing</p>
               <p className="text-lg font-medium text-slate-400">You are ranked among top candidates</p>
            </div>
         </div>
      </div>

      {/* 5. PERFORMANCE OVERVIEW */}
      <div className="space-y-8 mb-8">
         <div className="flex items-center gap-4 px-2">
            <div className="h-12 w-12 rounded-xl bg-blue-50 flex items-center justify-center text-primary">
               <BarChart3 className="h-7 w-7" />
            </div>
            <h2 className="text-3xl font-bold text-[#0F172A]">Performance Overview</h2>
         </div>
         <div className="grid grid-cols-4 gap-6">
            <OverviewCard label="Accuracy" val={`${data.attemptAccuracy}%`} sub="(0/0)" />
            <OverviewCard label="Pass Grade" val={data.grade || "F"} sub="(Min. 40%)" color="text-orange-500" />
            <OverviewCard label="Net Score" val={data.score.toFixed(1)} sub="(Out of 25)" />
            <OverviewCard label="Percentile" val="--" sub="Not enough data" />
         </div>
      </div>

      {/* 6. SUBJECT MASTERY */}
      <div className="space-y-8">
         <div className="flex items-center gap-4 px-2">
            <div className="h-12 w-12 rounded-xl bg-blue-50 flex items-center justify-center text-primary">
               <Target className="h-7 w-7" />
            </div>
            <h2 className="text-3xl font-bold text-[#0F172A]">Subject Mastery</h2>
         </div>
         <div className="bg-white border border-slate-100 rounded-[32px] overflow-hidden shadow-sm">
            <div className="p-6 bg-slate-50/50 border-b border-slate-100 flex justify-between px-10">
               <span className="font-bold text-slate-500 uppercase tracking-widest">Subject</span>
               <span className="font-bold text-slate-500 uppercase tracking-widest">Score</span>
            </div>
            <div className="p-10 flex items-center justify-between group px-10">
               <div className="flex items-center gap-12 flex-1">
                  <span className="text-2xl font-bold text-[#0F172A] w-32">English</span>
                  <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
                     <div className="h-full bg-[#2563EB] w-0" />
                  </div>
               </div>
               <div className="flex items-center gap-6 ml-12">
                  <span className="text-2xl font-bold text-[#2563EB]">0.0 / 25</span>
                  <ChevronDown className="h-6 w-6 text-slate-300" />
               </div>
            </div>
         </div>
      </div>

      {/* 7. FOOTER */}
      <div className="mt-auto flex justify-between items-end border-t border-slate-100 pt-10 px-4">
         <div className="space-y-2">
            <p className="text-lg font-bold text-slate-400">Generated by Cracklix</p>
            <p className="text-sm font-semibold text-slate-300 uppercase tracking-[0.4em]">Official Preparation Registry Hub</p>
         </div>
         <div className="flex items-center gap-6">
            <div className="text-right">
               <p className="text-lg font-bold text-[#2563EB]">Verify Result</p>
               <p className="text-sm font-mono text-slate-300">cracklix.in/verify/{data.attemptId}</p>
            </div>
            <div className="h-24 w-24 bg-white p-2 rounded-xl border border-slate-100 shadow-sm">
               <Image src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://cracklix.in/results/view?id=${data.mockId}`} width={80} height={80} alt="verify" unoptimized />
            </div>
         </div>
      </div>
    </div>
  );
}

function MiniStat({ label, val, color, bg, border }: any) {
  return (
    <div className={cn("bg-white border rounded-[32px] p-6 shadow-sm flex flex-col items-center justify-center text-center", border)}>
       <span className={cn("text-5xl font-bold tabular-nums leading-none mb-4", color)}>{val}</span>
       <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">{label}</span>
    </div>
  )
}

function OverviewCard({ label, val, sub, color = "text-[#10B981]" }: any) {
  return (
    <div className="bg-white border border-slate-100 rounded-[32px] p-8 shadow-sm text-center space-y-3">
       <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">{label}</p>
       <p className={cn("text-5xl font-bold leading-none", color)}>{val}</p>
       <p className="text-sm font-bold text-slate-300">{sub}</p>
    </div>
  )
}
