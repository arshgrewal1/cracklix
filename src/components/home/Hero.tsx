'use client';

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { 
  ShieldCheck, 
  Zap, 
  Target, 
  TrendingUp, 
  Award, 
  CheckCircle2, 
  Sparkles, 
  ChevronRight, 
  Gem, 
  Clock, 
  FileStack, 
  BookOpen, 
  Layers, 
  BarChart3,
  Newspaper,
  Check,
  X
} from "lucide-react";
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * @fileOverview High-Converting Institutional Hero Hub v251.0.
 * FIXED: Imported Card component to resolve ReferenceError.
 * DESIGN: Premium SaaS style for PSSSB, Punjab Police, PPSC, and Teaching Exams.
 */

export default function Hero() {
  const router = useRouter();

  return (
    <div className="flex flex-col w-full overflow-hidden bg-white">
      {/* 1. MAIN HERO SECTION */}
      <section className="relative pt-10 pb-20 md:pt-20 md:pb-32 bg-[#0B1528] overflow-hidden text-left">
        {/* BACKGROUND GRADIENTS */}
        <div className="absolute top-0 right-0 w-1/3 h-full bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-1/4 h-full bg-blue-500/5 blur-[120px] rounded-full pointer-events-none" />

        <div className="container mx-auto px-4 md:px-6 max-w-7xl relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-center">
            
            {/* LEFT HUB: MESSAGING & CTAs */}
            <div className="lg:col-span-7 space-y-8">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <Badge className="bg-primary/10 text-primary border-primary/20 px-4 py-1.5 rounded-full font-black uppercase text-[9px] md:text-[11px] tracking-[0.2em] shadow-xl">
                  🔥 Punjab's Most Trusted Mock Test Platform
                </Badge>

                <h1 className="text-4xl md:text-7xl font-headline font-black leading-[0.95] tracking-tighter text-white uppercase">
                  Crack <span className="text-primary">Punjab Government Exams</span> Before the Real Exam
                </h1>

                <p className="text-slate-400 text-sm md:text-xl font-medium max-w-2xl leading-relaxed antialiased">
                  Prepare for PSSSB, Punjab Police, PPSC, PSPCL, PSTET, CTET, ETT, Master Cadre, High Court and other Punjab Government recruitment exams with exam-level mock tests, PYQs, current affairs and detailed solutions.
                </p>

                {/* TRUST CHECKLIST */}
                <div className="flex flex-wrap gap-x-6 gap-y-3 pt-2">
                  <TrustChip text="Full-Length Mocks" />
                  <TrustChip text="PYQs" />
                  <TrustChip text="Current Affairs" />
                  <TrustChip text="Detailed Solutions" />
                  <TrustChip text="Bilingual Tests" />
                  <TrustChip text="Performance Analytics" />
                </div>
              </motion.div>

              {/* PRIMARY ACTIONS */}
              <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
                <Button 
                  onClick={() => router.push('/mocks')}
                  className="w-full sm:w-auto h-16 md:h-20 px-10 bg-primary hover:bg-orange-600 text-white font-black uppercase text-[12px] md:text-[14px] tracking-[0.2em] shadow-3xl shadow-primary/20 border-none transition-all active:scale-95 gap-3"
                >
                  🚀 Start Free Mock
                </Button>
                <Button 
                  onClick={() => router.push('/exams')}
                  className="w-full sm:w-auto h-16 md:h-20 px-10 rounded-2xl bg-white text-[#0B1528] hover:bg-slate-100 font-black uppercase text-[12px] md:text-[14px] tracking-[0.2em] transition-all active:scale-95 gap-3 border-none shadow-xl"
                >
                  📚 Explore Exams
                </Button>
              </div>

              {/* EXAM RECRUITMENT NODES */}
              <div className="pt-8 border-t border-white/5 space-y-4">
                 <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">OFFICIAL REGISTRY COVERED</p>
                 <div className="flex flex-wrap gap-2">
                    <ExamChip icon="🏛" label="PSSSB" />
                    <ExamChip icon="👮" label="Punjab Police" />
                    <ExamChip icon="⚖" label="PPSC" />
                    <ExamChip icon="⚡" label="PSPCL" />
                    <ExamChip icon="📚" label="PSTET" />
                    <ExamChip icon="📝" label="CTET" />
                    <ExamChip icon="🎓" label="ETT" />
                    <ExamChip icon="👨‍🏫" label="Master Cadre" />
                 </div>
              </div>
            </div>

            {/* RIGHT HUB: DASHBOARD PREVIEW */}
            <div className="lg:col-span-5 relative hidden md:block">
               <div className="relative aspect-[4/5] rounded-[3.5rem] overflow-hidden border-8 border-white/5 shadow-5xl group bg-[#0B1528]">
                  <Image 
                    src="https://punjabpolice.gov.in/media/images/pp10.original.jpg" 
                    fill 
                    alt="Punjab Police Preparation" 
                    className="object-cover grayscale-[0.2] group-hover:grayscale-0 transition-all duration-1000 scale-105 group-hover:scale-100"
                    priority
                  />
                  <div className="absolute inset-0 bg-[#0B1528]/40 mix-blend-multiply" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0B1528] via-transparent to-transparent opacity-80" />
                  
                  {/* FLOATING GLASS CARDS */}
                  <motion.div 
                    initial={{ x: 30, opacity: 0 }} 
                    animate={{ x: 0, opacity: 1 }} 
                    transition={{ delay: 0.5 }}
                    className="absolute top-10 -right-6"
                  >
                     <GlassMetric icon={<Target className="text-emerald-400" />} label="Accuracy" val="94%" />
                  </motion.div>

                  <motion.div 
                    initial={{ x: -30, opacity: 0 }} 
                    animate={{ x: 0, opacity: 1 }} 
                    transition={{ delay: 0.7 }}
                    className="absolute top-40 -left-6"
                  >
                     <GlassMetric icon={<Award className="text-amber-400" />} label="Punjab Rank" val="#245" />
                  </motion.div>

                  <motion.div 
                    initial={{ y: 30, opacity: 0 }} 
                    animate={{ y: 0, opacity: 1 }} 
                    transition={{ delay: 0.9 }}
                    className="absolute bottom-32 -right-4"
                  >
                     <GlassMetric icon={<ClipboardList className="text-blue-400" />} label="Tests Attempted" val="156" />
                  </motion.div>

                  <motion.div 
                    initial={{ y: 40, opacity: 0 }} 
                    animate={{ y: 0, opacity: 1 }} 
                    transition={{ delay: 1.1 }}
                    className="absolute bottom-10 left-10 right-10"
                  >
                     <div className="bg-white/10 backdrop-blur-2xl border border-white/20 p-6 rounded-3xl shadow-5xl flex items-center justify-between">
                        <div className="flex items-center gap-4">
                           <div className="h-12 w-12 rounded-xl bg-primary/20 flex items-center justify-center text-primary shadow-inner">
                              <Zap className="h-6 w-6 fill-current" />
                           </div>
                           <div className="text-left">
                              <p className="text-[10px] font-black uppercase text-white/60 tracking-widest">Selection Status</p>
                              <p className="text-xl font-black text-white uppercase">Readiness Score</p>
                           </div>
                        </div>
                        <p className="text-4xl font-headline font-black text-primary">82%</p>
                     </div>
                  </motion.div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. PLATFORM STATS STRIP */}
      <section className="py-10 bg-white border-b border-slate-100">
         <div className="container mx-auto px-4 max-w-7xl">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center md:text-left">
               <PlatformStat val="50,000+" label="Questions" icon={<Layers className="text-primary" />} />
               <PlatformStat val="500+" label="Mock Tests" icon={<Zap className="text-blue-500" />} />
               <PlatformStat val="15,000+" label="Aspirants" icon={<Users className="text-emerald-500" />} />
               <PlatformStat val="94%" label="Accuracy" icon={<Target className="text-rose-500" />} />
            </div>
         </div>
      </section>

      {/* 3. WHY CHOOSE CRACKLIX */}
      <section className="py-20 md:py-32 bg-slate-50/50">
         <div className="container mx-auto px-4 max-w-7xl text-left">
            <div className="flex flex-col md:flex-row justify-between items-center gap-8 mb-16">
               <div className="space-y-2">
                  <Badge className="bg-[#0B1528] text-white border-none px-4 py-1.5 rounded-full font-black uppercase text-[10px] tracking-widest">INSTITUTIONAL PRECISION</Badge>
                  <h2 className="text-3xl md:text-5xl font-headline font-black text-[#0B1528] uppercase tracking-tight leading-none">Why Choose <span className="text-primary">Cracklix?</span></h2>
               </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
               <FeatureCard icon={<Target />} title="Real Exam Pattern" desc="Every mock test is verified to match official PSSSB, Police and PPSC patterns." />
               <FeatureCard icon={<ShieldCheck />} title="Punjab Focused Content" desc="Dedicated content hub for Punjab GK, Gurmukhi Grammar and Sikh History." />
               <FeatureCard icon={<Newspaper />} title="Daily Current Affairs" desc="Bilingual news updates and quizzes tailored for upcoming state recruitments." />
               <FeatureCard icon={<FileStack />} title="Previous Year Papers" desc="Access authentic PYQs with detailed logic rationalizations for all major boards." />
               <FeatureCard icon={<BarChart3 />} title="Detailed Analytics" desc="Identify weak nodes instantly with our high-fidelity performance audit engine." />
               <FeatureCard icon={<Award />} title="Rank & Performance" desc="Compare your scores with 15,000+ real aspirants on the state-level merit list." />
            </div>
         </div>
      </section>

      {/* 4. FREE VS PREMIUM */}
      <section className="py-20 md:py-32 bg-white">
         <div className="container mx-auto px-4 max-w-5xl text-left">
            <div className="text-center mb-16 space-y-4">
               <h2 className="text-3xl md:text-5xl font-headline font-black text-[#0B1528] uppercase tracking-tight">Free vs <span className="text-primary">Premium</span></h2>
               <p className="text-slate-500 font-medium">Invest in your selection with our elite preparation pass.</p>
            </div>

            <Card className="border-none shadow-5xl rounded-[3rem] overflow-hidden bg-[#0B1528] text-white">
               <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-white/5">
                  {/* FREE TIER */}
                  <div className="p-10 md:p-16 space-y-10 bg-white/5 opacity-60">
                     <div className="space-y-2">
                        <h3 className="text-2xl font-black uppercase">Basic Node</h3>
                        <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">Entry Level Access</p>
                     </div>
                     <ul className="space-y-6">
                        <TierItem text="Limited Mocks" icon={<Check className="text-emerald-500" />} />
                        <TierItem text="Basic Results" icon={<Check className="text-emerald-500" />} />
                        <TierItem text="Full Mock Series" icon={<X className="text-rose-500" />} strike />
                        <TierItem text="Subject & Sectional Tests" icon={<X className="text-rose-500" />} strike />
                        <TierItem text="AI Logic Solutions" icon={<X className="text-rose-500" />} strike />
                     </ul>
                  </div>

                  {/* PREMIUM TIER */}
                  <div className="p-10 md:p-16 space-y-10 relative">
                     <div className="absolute top-10 right-10">
                        <Gem className="h-10 w-10 text-primary animate-pulse" />
                     </div>
                     <div className="space-y-2">
                        <h3 className="text-2xl font-black uppercase text-primary">Elite Pass</h3>
                        <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Institutional Access</p>
                     </div>
                     <ul className="space-y-6">
                        <TierItem text="Full Mock Series (500+)" icon={<Check className="text-primary" />} />
                        <TierItem text="Subject & Sectional Tests" icon={<Check className="text-primary" />} />
                        <TierItem text="Chapter-Wise Practice" icon={<Check className="text-primary" />} />
                        <TierItem text="Official PYQ Archive" icon={<Check className="text-primary" />} />
                        <TierItem text="Detailed Analytics & Rank" icon={<Check className="text-primary" />} />
                        <TierItem text="Daily Current Affairs" icon={<Check className="text-primary" />} />
                     </ul>
                     <Button 
                       onClick={() => router.push('/pass')}
                       className="w-full h-16 bg-primary hover:bg-orange-600 text-white font-black uppercase tracking-[0.2em] rounded-2xl shadow-xl transition-all active:scale-95 border-none"
                     >
                        🔥 Unlock Premium Pass
                     </Button>
                  </div>
               </div>
            </Card>
         </div>
      </section>
    </div>
  );
}

function TrustChip({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-2 text-white/70 font-bold uppercase text-[10px] md:text-xs tracking-tight">
       <div className="h-4 w-4 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
          <Check className="h-2.5 w-2.5 text-emerald-500 stroke-[4px]" />
       </div>
       {text}
    </div>
  );
}

function ExamChip({ icon, label }: { icon: string, label: string }) {
   return (
      <div className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-300 font-black text-[10px] tracking-widest hover:border-primary/50 transition-all cursor-default flex items-center gap-2 group hover:text-white">
         <span className="group-hover:scale-125 transition-transform">{icon}</span> {label}
      </div>
   );
}

function GlassMetric({ icon, label, val }: any) {
   return (
      <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-5 rounded-2xl shadow-2xl flex items-center gap-4 min-w-[160px]">
         <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center shadow-inner">
            {React.cloneElement(icon, { className: "h-5 w-5" })}
         </div>
         <div className="text-left">
            <p className="text-[8px] font-black uppercase text-white/50 tracking-widest leading-none mb-1">{label}</p>
            <p className="text-lg font-black text-white leading-none">{val}</p>
         </div>
      </div>
   );
}

function PlatformStat({ val, label, icon }: any) {
   return (
      <div className="flex items-center gap-4 group justify-center md:justify-start">
         <div className="h-12 w-12 rounded-xl bg-slate-50 flex items-center justify-center shrink-0 group-hover:bg-primary/5 transition-colors shadow-inner">
            {React.cloneElement(icon, { className: "h-6 w-6" })}
         </div>
         <div className="text-left">
            <p className="text-2xl font-headline font-black text-[#0B1528] tracking-tighter leading-none">{val}</p>
            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mt-1">{label}</p>
         </div>
      </div>
   );
}

function FeatureCard({ icon, title, desc }: any) {
   return (
      <Card className="border-none shadow-xl rounded-[2.5rem] p-10 bg-white group hover:translate-y-[-8px] transition-all duration-500 border border-slate-100 flex flex-col h-full text-left">
         <div className="h-16 w-16 rounded-2xl bg-slate-50 flex items-center justify-center mb-8 shadow-inner group-hover:bg-primary transition-colors duration-500">
            {React.isValidElement(icon) ? React.cloneElement(icon as React.ReactElement, { className: "h-8 w-8 text-[#0B1528] group-hover:text-white transition-colors duration-500" }) : icon}
         </div>
         <h3 className="text-xl font-black text-[#0B1528] uppercase leading-tight mb-3 group-hover:text-primary transition-colors">{title}</h3>
         <p className="text-slate-500 text-sm font-medium leading-relaxed flex-1">{desc}</p>
      </Card>
   );
}

function TierItem({ text, icon, strike = false }: { text: string, icon: React.ReactNode, strike?: boolean }) {
   return (
      <li className="flex items-center gap-4 text-sm font-bold uppercase tracking-tight">
         <span className="shrink-0">{icon}</span>
         <span className={cn(strike && "line-through text-slate-600")}>{text}</span>
      </li>
   );
}

function Users({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function ClipboardList({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
      <path d="M9 12h6" />
      <path d="M9 16h6" />
      <path d="M9 8h6" />
    </svg>
  );
}
