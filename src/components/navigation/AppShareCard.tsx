
'use client';

import React from 'react';
import { 
  ShieldCheck, 
  Zap, 
  Trophy, 
  Target, 
  BarChart3, 
  BookOpen, 
  FileStack,
  Star,
  CheckCircle2,
  Smartphone
} from 'lucide-react';
import Image from 'next/image';

/**
 * @fileOverview World-Class Institutional Share Card v1.0.
 * Resolution: 1080 x 1350 (Instagram/WhatsApp Optimized).
 * This component is hidden in the DOM and used purely for image export.
 */
export default function AppShareCard() {
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent('https://cracklix.vercel.app/install')}`;

  return (
    <div 
      id="cracklix-app-share-card"
      className="w-[1080px] h-[1350px] bg-[#0F172A] text-white flex flex-col relative overflow-hidden"
      style={{ fontFamily: 'Inter, sans-serif' }}
    >
      {/* 1. PREMIUM BACKGROUND NODES */}
      <div className="absolute top-0 right-0 w-[900px] h-[900px] bg-[#2563EB]/20 blur-[150px] rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-[700px] h-[700px] bg-[#60A5FA]/10 blur-[120px] rounded-full translate-y-1/2 -translate-x-1/2" />
      
      {/* 2. HEADER HUB */}
      <div className="relative z-10 px-20 pt-20 flex justify-between items-start">
         <div className="space-y-6">
            <div className="flex items-center gap-6">
               <div className="h-24 w-24 bg-[#2563EB] rounded-[2.5rem] flex items-center justify-center shadow-2xl border-4 border-white/10">
                  <ShieldCheck className="h-14 w-14 text-white" />
               </div>
               <div>
                  <h1 className="text-6xl font-black tracking-tighter uppercase leading-none">Cracklix</h1>
                  <div className="flex items-center gap-3 mt-3">
                     <span className="text-xl font-bold text-[#60A5FA] tracking-[0.4em] uppercase">Elite Portal</span>
                     <div className="h-6 w-6 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg"><CheckCircle2 className="h-4 w-4 text-white" /></div>
                  </div>
               </div>
            </div>
            <div className="inline-flex items-center gap-4 px-6 py-3 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-xl">
               <span className="text-2xl">🇮🇳</span>
               <p className="text-xl font-black uppercase tracking-[0.2em] text-[#60A5FA]">Punjab Government Exam Prep</p>
            </div>
         </div>
      </div>

      {/* 3. MAIN CONTENT: MOCKUP & FEATURES */}
      <div className="relative z-10 px-20 mt-16 flex gap-12 items-start">
         
         {/* MOBILE MOCKUP HUB */}
         <div className="w-[420px] shrink-0">
            <div className="relative w-full h-[740px] bg-slate-800 rounded-[4rem] border-[12px] border-slate-900 shadow-5xl overflow-hidden">
               {/* Internal UI simulation */}
               <div className="absolute inset-0 bg-[#F8FAFC] flex flex-col">
                  <div className="h-20 bg-[#2563EB] w-full" />
                  <div className="p-8 space-y-6">
                     <div className="h-32 w-full bg-white rounded-3xl shadow-sm p-4 flex flex-col gap-2">
                        <div className="h-4 w-1/2 bg-slate-100 rounded" />
                        <div className="h-10 w-full bg-slate-50 rounded-xl" />
                     </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div className="h-24 bg-white rounded-3xl shadow-sm" />
                        <div className="h-24 bg-white rounded-3xl shadow-sm" />
                     </div>
                     <div className="h-40 w-full bg-white rounded-[2rem] shadow-sm flex items-center justify-center">
                        <BarChart3 className="h-12 w-12 text-[#2563EB]/20" />
                     </div>
                  </div>
               </div>
               {/* Reflective shine */}
               <div className="absolute inset-0 bg-gradient-to-tr from-white/10 via-transparent to-transparent pointer-events-none" />
            </div>
         </div>

         {/* FEATURES GRID */}
         <div className="flex-1 space-y-12">
            <div className="space-y-4">
               <h2 className="text-7xl font-black tracking-tight leading-[0.9] text-white">
                  Crack Punjab <br/> Exams Anywhere. 🚀
               </h2>
               <p className="text-2xl text-slate-400 font-medium leading-relaxed">
                  The smartest way to prepare for PPSC, PSSSB & Punjab Police.
               </p>
            </div>

            <div className="grid grid-cols-1 gap-4">
               <FeatureRow icon={<BookOpen className="text-blue-400" />} label="Unlimited Mock Tests" />
               <FeatureRow icon={<FileStack className="text-emerald-400" />} label="Previous Year Papers" />
               <FeatureRow icon={<Zap className="text-orange-400" />} label="Daily Quiz & Updates" />
               <FeatureRow icon={<Target className="text-rose-400" />} label="Punjab GK Mastery" />
               <FeatureRow icon={<Trophy className="text-amber-400" />} label="State Ranking Hub" />
            </div>

            <div className="p-10 bg-white/5 border border-white/10 rounded-[2.5rem] backdrop-blur-xl space-y-6">
               <div className="flex items-center gap-2 text-amber-400">
                  {Array.from({length: 5}).map((_, i) => <Star key={i} className="h-8 w-8 fill-current" />)}
               </div>
               <p className="text-3xl font-black text-white leading-tight">Trusted by 10,000+ <br/> Punjab Aspirants</p>
            </div>
         </div>
      </div>

      {/* 4. FOOTER CTA HUB */}
      <div className="mt-auto bg-[#2563EB] h-[240px] px-20 flex items-center justify-between">
         <div className="space-y-4">
            <div className="flex items-center gap-4">
               <div className="h-16 w-16 bg-white rounded-2xl flex items-center justify-center text-[#2563EB] shadow-2xl">
                  <Smartphone className="h-10 w-10" />
               </div>
               <div>
                  <h3 className="text-4xl font-black text-white uppercase tracking-tight">Install Official App</h3>
                  <p className="text-white/70 text-xl font-bold tracking-widest">WWW.CRACKLIX.COM</p>
               </div>
            </div>
         </div>
         <div className="bg-white p-4 rounded-3xl shadow-4xl">
            <img src={qrUrl} alt="QR Code" className="h-32 w-32" />
         </div>
      </div>
    </div>
  );
}

function FeatureRow({ icon, label }: any) {
   return (
      <div className="flex items-center gap-6 p-5 bg-white/5 border border-white/10 rounded-2xl group">
         <div className="h-10 w-10 shrink-0">{icon}</div>
         <span className="text-2xl font-bold uppercase tracking-tight text-slate-200">{label}</span>
      </div>
   );
}
