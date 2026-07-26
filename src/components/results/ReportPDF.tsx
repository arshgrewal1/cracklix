'use client';

import React from 'react';
import { ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ReportPDFProps {
  studentName: string;
  examTitle: string;
  score: string | number;
  rank: string | number;
  totalCandidates: number;
  attemptAccuracy: string | number;
  timeTaken: string;
  correctCount: number;
  wrongCount: number;
  skippedCount: number;
  totalQuestions: number;
  date: string;
  resultId: string;
  percentile: number;
  grade?: string;
}

/**
 * Hardened PDF Report Template v6.1.
 * FIXED: Removed all absolute positioning and implemented rigid vertical buffers to prevent text overlap.
 * FIXED: Standardized Title Case.
 */
export default function ReportPDF(props: ReportPDFProps) {
  const {
    studentName, examTitle, score, rank, totalCandidates,
    attemptAccuracy, timeTaken, totalQuestions, date, resultId, percentile, grade = "F"
  } = props;

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent('https://cracklix.in/results/view?id=' + resultId)}`;

  return (
    <div 
      className="bg-[#F8FAFC] p-0 m-0 box-border text-center font-body flex flex-col items-center"
      style={{ width: '794px', height: '1123px', position: 'relative' }}
    >
      {/* HEADER NODES */}
      <div className="w-full flex items-center justify-between px-16 py-12 bg-white border-b border-slate-100 shrink-0">
         <div className="flex items-center gap-8">
            <img src="/logo/cracklix-logo-dark.png" alt="Logo" className="h-16 w-auto" />
            <div className="h-12 w-px bg-slate-200" />
            <div className="text-left">
               <h2 className="text-2xl font-black text-[#071B4D] tracking-tight">Cracklix</h2>
               <p className="text-[10px] font-black text-[#1677FF] uppercase tracking-[0.3em]">Performance Registry</p>
            </div>
         </div>
         <div className="text-right space-y-1">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Assessment ID</p>
            <p className="text-xs font-bold text-[#071B4D] tabular-nums">{resultId?.slice(0, 20)}</p>
         </div>
      </div>

      <div className="w-full flex-1 p-16 flex flex-col items-center space-y-12">
         
         {/* CANDIDATE IDENTITY HUB */}
         <div className="w-full p-10 bg-white rounded-[40px] border border-slate-100 shadow-sm text-center space-y-8">
            <div className="space-y-2">
               <p className="text-xs font-black text-[#1677FF] uppercase tracking-[0.5em]">Official Result</p>
               <h1 className="text-5xl font-black text-[#071B4D] tracking-tight">{studentName}</h1>
               <p className="text-xl font-bold text-slate-400 uppercase tracking-tighter">{examTitle}</p>
            </div>
            
            {/* BOXED IDENTITY GRID */}
            <div className="flex justify-center gap-12 pt-4">
               <PDFMeta label="Attempt Date" val={date} />
               <PDFMeta label="Time Taken" val={timeTaken} />
               <PDFMeta label="Final Grade" val={grade} color="text-amber-500" />
            </div>
         </div>

         {/* PUNJAB RANK HUB - RIGID VERTICAL BUFFER */}
         <div className="w-full bg-[#1677FF] rounded-[48px] p-16 text-white text-center shadow-2xl relative overflow-hidden flex flex-col items-center justify-center">
            <p className="text-[14px] font-black uppercase tracking-[0.6em] mb-12 opacity-80">Punjab Merit Standing</p>
            
            <div className="flex flex-col items-center space-y-10">
               <span className="text-[120px] font-black tabular-nums tracking-tighter leading-none">#{rank}</span>
               <div className="h-[60px]" aria-hidden="true" /> {/* RIGID SPACER Node */}
               <p className="text-2xl font-bold text-white/60 tabular-nums uppercase tracking-widest">
                  Out of {totalCandidates.toLocaleString()} Candidates
               </p>
            </div>
         </div>

         {/* STATS KPI GRID */}
         <div className="grid grid-cols-2 gap-8 w-full">
            <PDFKPIBox label="Net Score" val={score} sub={`/ ${totalQuestions}`} color="text-[#1677FF]" />
            <PDFKPIBox label="Accuracy" val={`${attemptAccuracy}%`} sub="Candidate Index" color="text-emerald-500" />
            <PDFKPIBox label="Percentile" val={`${percentile}%`} sub="Verified" color="text-blue-600" />
            <PDFKPIBox label="Status" val={Number(score) >= (totalQuestions/2) ? 'Qualified' : 'Attempted'} sub="Assessment" color="text-[#071B4D]" />
         </div>

         {/* VERIFICATION HUB FOOTER */}
         <div className="w-full pt-12 border-t border-slate-100 flex items-center justify-between mt-auto">
            <div className="flex items-center gap-10">
               <div className="h-28 w-28 bg-white border border-slate-100 p-2 rounded-[20px] shadow-lg flex items-center justify-center">
                  <img src={qrUrl} alt="Verify" className="h-full w-full object-contain" />
               </div>
               <div className="text-left space-y-2">
                  <p className="text-[#071B4D] font-black text-lg flex items-center gap-3">
                     <ShieldCheck className="h-6 w-6 text-emerald-500" /> Digitally Verified Report
                  </p>
                  <p className="text-slate-400 text-sm font-medium leading-relaxed max-w-[400px]">
                     This assessment node is synchronized with the Cracklix master registry. Authenticate at cracklix.in.
                  </p>
               </div>
            </div>
            <div className="text-right">
               <img src="/logo/cracklix-logo-dark.png" alt="Cracklix" className="h-8 w-auto opacity-10 grayscale mb-3" />
               <p className="text-[12px] font-black tracking-[0.4em] text-slate-300 uppercase">www.cracklix.in</p>
            </div>
         </div>
      </div>
    </div>
  );
}

function PDFMeta({ label, val, color = "text-[#071B4D]" }: any) {
   return (
      <div className="text-center">
         <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{label}</p>
         <p className={cn("text-xl font-black tabular-nums", color)}>{val}</p>
      </div>
   )
}

function PDFKPIBox({ label, val, sub, color }: any) {
   return (
      <div className="bg-white border border-slate-100 p-10 rounded-[32px] flex flex-col items-center justify-center gap-2 shadow-sm h-40">
         <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{label}</p>
         <p className={cn("text-4xl font-black tabular-nums tracking-tighter", color)}>{val}</p>
         <p className="text-[10px] font-bold text-slate-300 uppercase">{sub}</p>
      </div>
   )
}
