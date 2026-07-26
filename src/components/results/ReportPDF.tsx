'use client';

import React from 'react';
import { Trophy, ShieldCheck, Target, Zap, Clock, BookOpen, Award } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from "@/components/ui/badge";

interface ReportPDFProps {
  studentName: string;
  examTitle: string;
  score: string | number;
  rank: string | number;
  totalCandidates: number;
  attemptAccuracy: string | number;
  timeTaken: string;
  correct: number;
  wrong: number;
  skipped: number;
  total: number;
  date: string;
  resultId: string;
  percentile: number;
  subjects?: any[];
  grade?: string;
  isQualified?: boolean;
}

/**
 * @fileOverview Hardened Portrait PDF Hub v40.0.
 * FIXED: Strictly defined width of 794px for A4 scaling.
 * FIXED: Removed position absolute and implemented explicit vertical buffers to prevent overlap.
 */
export default function ReportPDF(props: ReportPDFProps) {
  const {
    studentName, examTitle, score, rank, totalCandidates,
    attemptAccuracy, timeTaken, correct, wrong, skipped,
    total, date, resultId, percentile, subjects = [], grade = "F"
  } = props;

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent('https://cracklix.in/results/view?id=' + resultId)}`;

  return (
    <div 
      className="bg-white p-0 m-0 box-border text-center font-body flex flex-col items-center"
      style={{ width: '794px', height: '1123px', minHeight: '1123px', maxHeight: '1123px' }}
    >
      {/* 1. CORPORATE HEADER */}
      <div className="w-full flex items-center justify-between px-16 py-10 bg-slate-50/40 border-b border-slate-100 shrink-0">
         <div className="flex items-center gap-8">
            <img src="/logo/cracklix-logo-dark.png" alt="Logo" className="h-16 w-auto object-contain" />
            <div className="h-px w-8 bg-slate-200 rotate-90" />
            <div className="text-left space-y-1">
               <h2 className="text-2xl font-[900] text-[#071B4D] tracking-tighter leading-none">Cracklix</h2>
               <p className="text-[10px] font-bold text-primary uppercase tracking-[0.3em]">Performance Report</p>
            </div>
         </div>
         <div className="text-right">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Assessment Node</p>
            <p className="text-xs font-black text-[#071B4D] tabular-nums mt-1">{resultId?.slice(0, 18)}</p>
         </div>
      </div>

      <div className="w-full flex-1 p-16 flex flex-col items-center">
         
         {/* 2. IDENTITY CENTER */}
         <div className="space-y-6 w-full text-center mb-12">
            <div className="space-y-3">
               <p className="text-xs font-bold text-primary uppercase tracking-[0.5em]">Verified Candidate</p>
               <h1 className="text-[56px] font-[900] text-[#071B4D] tracking-tight leading-none antialiased">
                  {studentName}
               </h1>
            </div>
            <p className="text-2xl font-bold text-slate-500 uppercase tracking-tight">{examTitle}</p>
            
            <div className="flex justify-center gap-12 pt-8">
               <PDFMeta label="Attempt date" val={date} />
               <div className="w-px h-10 bg-slate-100" />
               <PDFMeta label="Time taken" val={timeTaken} />
               <div className="w-px h-10 bg-slate-100" />
               <PDFMeta label="Pass grade" val={grade} color="text-amber-500" />
            </div>
         </div>

         {/* 3. MERIT SECTION */}
         <div className="w-full bg-[#071B4D] rounded-[48px] p-16 text-white text-center shadow-2xl relative overflow-hidden flex flex-col items-center justify-center min-h-[360px] mb-12">
            <div className="absolute top-0 right-0 p-8 opacity-5 rotate-12"><Trophy className="h-64 w-64" /></div>
            
            <div className="relative z-10">
               <p className="text-[14px] font-bold text-primary uppercase tracking-[0.6em] mb-10">Punjab Merit Rank</p>
               <div className="flex flex-col items-center">
                  <span className="text-[160px] font-[900] tabular-nums tracking-tighter leading-none block drop-shadow-2xl">
                     #{rank}
                  </span>
                  <div className="mt-8">
                    <p className="text-2xl font-black text-slate-500 tabular-nums uppercase tracking-widest">
                       / {totalCandidates.toLocaleString()} Total Candidates
                    </p>
                  </div>
               </div>
               <div className="pt-10 flex justify-center">
                  <Badge className="bg-emerald-500 text-white border-none font-bold text-[12px] px-12 py-3 rounded-full shadow-2xl uppercase tracking-widest">
                     Verified Standing
                  </Badge>
               </div>
            </div>
         </div>

         {/* 4. KPIS 2x2 */}
         <div className="grid grid-cols-2 gap-8 w-full mb-12">
            <KPIBox label="Net score" val={score} color="text-[#071B4D]" />
            <KPIBox label="Accuracy index" val={`${attemptAccuracy}%`} color="text-emerald-600" />
            <KPIBox label="Percentile" val={`${percentile}%`} color="text-[#0A84FF]" />
            <KPIBox label="Status" val={Number(score) >= (total/2) ? 'Qualified' : 'Attempted'} color="text-[#071B4D]" />
         </div>

         {/* 5. SUMMARY ROW */}
         <div className="grid grid-cols-4 gap-6 w-full mb-12">
            <CountPill label="Correct" val={correct} color="bg-emerald-50 text-emerald-600" />
            <CountPill label="Wrong" val={wrong} color="bg-rose-50 text-rose-600" />
            <CountPill label="Skipped" val={skipped} color="bg-slate-50 text-slate-400" />
            <CountPill label="Items" val={total} color="bg-blue-50 text-blue-600" />
         </div>

         {/* 6. SUBJECT BREAKDOWN */}
         {subjects.length > 0 && (
            <div className="w-full space-y-6">
               <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.4em]">Subject performance breakdown</p>
               <div className="border border-slate-100 rounded-[32px] overflow-hidden bg-white shadow-sm">
                  <table className="w-full">
                     <thead>
                        <tr className="bg-slate-50 border-b border-slate-100 h-14">
                           <th className="px-12 font-bold text-xs text-slate-500 uppercase tracking-widest text-left">Subject</th>
                           <th className="px-4 font-bold text-xs text-center text-slate-500 uppercase tracking-widest">Score</th>
                           <th className="px-12 font-bold text-xs text-right text-slate-500 uppercase tracking-widest">Accuracy</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-50">
                        {subjects.slice(0, 5).map((s, i) => (
                           <tr key={i} className="h-14">
                              <td className="px-12 font-bold text-lg text-[#071B4D] text-left">{s.name}</td>
                              <td className="px-4 text-center font-black text-primary text-xl tabular-nums">{Number(s.score).toFixed(1)}</td>
                              <td className="px-12 text-right">
                                 <Badge className="bg-emerald-50 text-emerald-600 border-none font-bold text-xs tabular-nums px-4 py-1.5 rounded-xl">{s.accuracy}%</Badge>
                              </td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
               </div>
            </div>
         )}

         {/* 7. FOOTER */}
         <div className="pt-16 border-t border-slate-100 flex items-center justify-between w-full mt-auto mb-10 shrink-0">
            <div className="flex items-center gap-10">
               <div className="h-28 w-28 bg-white border-2 border-slate-100 p-2 rounded-[24px] shadow-xl relative overflow-hidden flex items-center justify-center">
                  <img src={qrUrl} alt="Verify" className="h-full w-full object-contain" />
               </div>
               <div className="space-y-2 text-left">
                  <p className="text-[#071B4D] font-[900] text-lg flex items-center gap-3 leading-none uppercase">
                     <ShieldCheck className="h-6 w-6 text-emerald-500" /> Digitally verified report
                  </p>
                  <p className="text-slate-400 text-sm font-medium leading-relaxed max-w-[400px]">
                     Generated by Cracklix Assessment Engine. Authenticate this node at cracklix.in. Institutional sync: v1.05.
                  </p>
               </div>
            </div>
            <div className="text-right space-y-3">
               <img src="/logo/cracklix-logo-dark.png" alt="Cracklix" className="h-10 w-auto opacity-20 grayscale ml-auto" />
               <p className="text-[12px] font-black tracking-[0.6em] text-slate-300 uppercase">www.cracklix.in</p>
            </div>
         </div>
      </div>
    </div>
  );
}

function PDFMeta({ label, val, color = "text-[#071B4D]" }: any) {
   return (
      <div className="text-center space-y-1">
         <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</p>
         <p className={cn("text-xl font-black tabular-nums tracking-tight", color)}>{val}</p>
      </div>
   )
}

function KPIBox({ label, val, color }: any) {
   return (
      <div className="bg-white border border-slate-100 p-8 rounded-[40px] flex flex-col items-center justify-center gap-3 shadow-sm h-36 flex-1">
         <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{label}</p>
         <p className={cn("text-[44px] font-[900] tabular-nums tracking-tighter leading-none", color)}>{val}</p>
      </div>
   )
}

function CountPill({ label, val, color }: any) {
   return (
      <div className={cn("p-6 rounded-[28px] flex flex-col items-center justify-center gap-1.5 h-24 flex-1 shadow-sm", color)}>
         <span className="text-3xl font-[900] tabular-nums leading-none">{val}</span>
         <span className="text-[11px] font-bold uppercase tracking-widest opacity-60 mt-1">{label}</span>
      </div>
   )
}

