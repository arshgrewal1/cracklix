'use client';

import React from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { 
  ShieldCheck, 
  Zap, 
  Target, 
  Award, 
  CheckCircle2, 
  Sparkles, 
  ChevronRight, 
  Clock, 
  BookOpen, 
  Layers, 
  Check,
  ClipboardList,
  Users,
  Landmark,
  Scale,
  FileText,
  GraduationCap,
  X,
  Newspaper,
  LayoutGrid
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import { cn } from "@/lib/utils";
import Link from "next/link";

/**
 * @fileOverview Official CRACKLIX Punjab Government Exam Hero v15.0.
 * Replaces entire content with a premium, selection-driven Command Center.
 * Theme: Navy Blue (#0B1528) + Cracklix Orange (Primary).
 */

export default function Hero() {
  const router = useRouter();
  const heroImage = "https://punjabpolice.gov.in/media/images/pp10.original.jpg";

  return (
    <div className="flex flex-col w-full bg-white font-body">
      
      {/* 1. SELECTION HUB (MAIN HERO) */}
      <section className="relative min-h-screen flex items-center pt-10 pb-20 md:pt-0 md:pb-0 bg-[#0B1528] overflow-hidden text-left">
        {/* Background Visual Nodes */}
        <div className="absolute top-0 right-0 w-1/3 h-full bg-primary/10 blur-[120px] rounded-full pointer-events-none opacity-50" />
        <div className="absolute bottom-0 left-0 w-1/4 h-full bg-blue-500/10 blur-[120px] rounded-full pointer-events-none opacity-50" />
        
        <div className="container mx-auto px-4 md:px-6 max-w-7xl relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-center min-h-[85vh]">
            
            {/* LEFT COLUMN: BRANDING & CTAs */}
            <div className="lg:col-span-7 space-y-8 md:space-y-10">
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="space-y-6 md:space-y-8"
              >
                <div className="inline-flex items-center gap-3 bg-primary/10 border border-primary/20 px-5 py-2 rounded-full shadow-2xl">
                  <Sparkles className="h-4 w-4 text-primary animate-pulse" />
                  <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.2em] text-primary">
                    🔥 Punjab's Most Trusted Mock Test Platform
                  </span>
                </div>

                <h1 className="text-4xl md:text-8xl font-headline font-black leading-[0.9] tracking-tighter text-white uppercase">
                  Crack <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-orange-400">Punjab Government Exams</span> Before The Real Exam
                </h1>

                <p className="text-slate-400 text-base md:text-2xl font-medium max-w-2xl leading-relaxed antialiased border-l-4 border-primary/30 pl-6">
                  Prepare for PSSSB, Punjab Police, PPSC, PSPCL, PSTET, CTET, ETT, Master Cadre, High Court and other Punjab Government recruitment exams through real exam-level mock tests, PYQs, current affairs and detailed solutions.
                </p>

                {/* TRUST CHIPS */}
                <div className="flex flex-wrap gap-x-8 gap-y-4 pt-2">
                  <TrustChip text="Full-Length Mocks" />
                  <TrustChip text="PYQs" />
                  <TrustChip text="Current Affairs" />
                  <TrustChip text="Detailed Solutions" />
                  <TrustChip text="Bilingual Tests" />
                  <TrustChip text="Performance Analytics" />
                </div>
              </motion.div>

              {/* ACTION BUTTONS */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.8 }}
                className="flex flex-col sm:flex-row items-center gap-5 pt-4"
              >
                <Button 
                  onClick={() => router.push('/mocks')}
                  className="w-full sm:w-auto h-16 md:h-20 px-12 bg-primary hover:bg-orange-600 text-white font-black uppercase text-[12px] md:text-[15px] tracking-[0.2em] shadow-3xl shadow-primary/20 border-none transition-all active:scale-95 gap-4 rounded-2xl"
                >
                  🚀 Start Free Mock
                </Button>
                <Button 
                  onClick={() => router.push('/exams')}
                  className="w-full sm:w-auto h-16 md:h-20 px-12 rounded-2xl bg-white/5 text-white hover:bg-white/10 font-black uppercase text-[12px] md:text-[15px] tracking-[0.2em] transition-all active:scale-95 gap-4 border border-white/10 backdrop-blur-xl"
                >
                  📚 Explore Exams
                </Button>
              </motion.div>

              {/* EXAM REGISTRY CHIPS */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="pt-10 border-t border-white/5 space-y-5"
              >
                 <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Official Recruitment Registry</p>
                 <div className="flex flex-wrap gap-3">
                    <ExamChip icon={<Landmark className="h-4 w-4" />} label="PSSSB" />
                    <ExamChip icon={<ShieldCheck className="h-4 w-4" />} label="Punjab Police" />
                    <ExamChip icon={<Scale className="h-4 w-4" />} label="PPSC" />
                    <ExamChip icon={<Zap className="h-4 w-4" />} label="PSPCL" />
                    <ExamChip icon={<BookOpen className="h-4 w-4" />} label="PSTET" />
                    <ExamChip icon={<FileText className="h-4 w-4" />} label="CTET" />
                    <ExamChip icon={<GraduationCap className="h-4 w-4" />} label="ETT" />
                    <ExamChip icon={<Users className="h-4 w-4" />} label="Master Cadre" />
                 </div>
              </motion.div>
            </div>

            {/* RIGHT COLUMN: VISUAL DASHBOARD */}
            <div className="lg:col-span-5 relative hidden lg:block h-full">
               <motion.div 
                 initial={{ opacity: 0, scale: 0.9 }}
                 animate={{ opacity: 1, scale: 1 }}
                 transition={{ duration: 1 }}
                 className="relative h-[80%] rounded-[4rem] overflow-hidden border-[12px] border-white/5 shadow-5xl bg-[#0B1528] group top-1/2 -translate-y-1/2"
               >
                  <Image 
                    src={heroImage} 
                    fill 
                    alt="Punjab Selection Hub" 
                    className="object-cover grayscale-[0.2] group-hover:grayscale-0 transition-all duration-[2000ms] group-hover:scale-105"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0B1528] via-[#0B1528]/40 to-transparent" />
                  
                  {/* FLOATING PERFORMANCE CARDS */}
                  <motion.div 
                    animate={{ y: [0, -15, 0] }} 
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-10 -right-8 z-20"
                  >
                     <GlassMetric icon={<Target className="text-emerald-400" />} label="Accuracy" val="94%" />
                  </motion.div>

                  <motion.div 
                    animate={{ y: [0, 15, 0] }} 
                    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                    className="absolute top-48 -left-10 z-20"
                  >
                     <GlassMetric icon={<Award className="text-amber-400" />} label="Punjab Rank" val="#245" />
                  </motion.div>

                  <motion.div 
                    animate={{ x: [0, 10, 0] }} 
                    transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                    className="absolute bottom-32 -right-6 z-20"
                  >
                     <GlassMetric icon={<ClipboardList className="text-blue-400" />} label="Tests Attempted" val="156" />
                  </motion.div>

                  <motion.div 
                    initial={{ y: 50, opacity: 0 }} 
                    animate={{ y: 0, opacity: 1 }} 
                    transition={{ delay: 1.2, duration: 1 }}
                    className="absolute bottom-10 left-10 right-10 z-20"
                  >
                     <div className="bg-white/10 backdrop-blur-3xl border border-white/20 p-8 rounded-[2.5rem] shadow-5xl flex items-center justify-between group/readiness overflow-hidden">
                        <div className="absolute inset-0 bg-primary/5 -translate-x-full group-hover/readiness:translate-x-0 transition-transform duration-700" />
                        <div className="flex items-center gap-5 relative z-10">
                           <div className="h-14 w-14 rounded-2xl bg-primary flex items-center justify-center text-white shadow-xl">
                              <Zap className="h-7 w-7 fill-current" />
                           </div>
                           <div className="text-left">
                              <p className="text-[10px] font-black uppercase text-white/50 tracking-widest">Selection Forecast</p>
                              <p className="text-2xl font-black text-white uppercase tracking-tight">Readiness Score</p>
                           </div>
                        </div>
                        <p className="text-5xl font-headline font-black text-primary relative z-10">82%</p>
                     </div>
                  </motion.div>
               </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. PLATFORM STATS STRIP */}
      <section className="py-12 md:py-20 bg-white border-b border-slate-100 relative z-20 -mt-10 md:-mt-16 container mx-auto max-w-6xl px-4">
         <div className="bg-white shadow-5xl rounded-[3rem] p-8 md:p-14 border border-slate-50">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-10 md:gap-12 text-center">
               <PlatformStat val="50,000+" label="Questions" icon={<Layers className="text-primary h-6 w-6" />} />
               <PlatformStat val="500+" label="Mock Tests" icon={<Zap className="text-blue-500 h-6 w-6" />} />
               <PlatformStat val="15,000+" label="Aspirants" icon={<Users className="text-emerald-500 h-6 w-6" />} />
               <PlatformStat val="94%" label="Accuracy" icon={<Target className="text-rose-500 h-6 w-6" />} />
            </div>
         </div>
      </section>

      {/* 3. WHY CHOOSE CRACKLIX */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4 max-w-7xl text-left">
           <div className="flex items-center gap-4 mb-16">
              <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary shadow-inner">
                 <Sparkles className="h-5 w-5" />
              </div>
              <h2 className="text-xl md:text-3xl font-headline font-black text-[#0F172A] uppercase tracking-tight">Why Choose Cracklix?</h2>
           </div>
           
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              <FeatureCard icon={<Target className="text-orange-500" />} title="Real Exam Pattern" desc="Mocks designed exactly as per the latest cabinet notifications." bgColor="bg-orange-50" />
              <FeatureCard icon={<Landmark className="text-blue-500" />} title="Punjab Focused Content" desc="Dedicated coverage for state GK, history and Gurmukhi nodes." bgColor="bg-blue-50" />
              <FeatureCard icon={<Newspaper className="text-emerald-500" />} title="Daily Current Affairs" desc="Verified bilingual updates matching official exam relevancy." bgColor="bg-emerald-50" />
              <FeatureCard icon={<FileText className="text-amber-500" />} title="Previous Year Papers" desc="Direct access to authentic recruitment papers from PSSSB & PPSC." bgColor="bg-amber-50" />
              <FeatureCard icon={<BarChart3 className="text-rose-500" />} title="Detailed Analytics" desc="Pinpoint your weak nodes with step-by-step logic solutions." bgColor="bg-rose-50" />
              <FeatureCard icon={<Award className="text-indigo-500" />} title="Rank & Performance" desc="See your state-level merit rank among thousands of aspirants." bgColor="bg-indigo-50" />
           </div>
        </div>
      </section>

      {/* 4. FREE VS PREMIUM COMPARISON */}
      <section className="py-24 md:py-32 bg-slate-50/50">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl md:text-5xl font-headline font-black text-[#0F172A] uppercase">Choose Your Prep Path</h2>
            <p className="text-slate-500 font-medium">Free basic access vs institutional grade preparation.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* FREE PATH */}
            <Card className="border-none shadow-xl rounded-[3rem] bg-white p-8 md:p-12 border border-slate-100 flex flex-col">
              <div className="space-y-6 flex-1">
                <div className="flex justify-between items-center">
                  <h3 className="text-2xl font-black text-[#0F172A] uppercase">FREE</h3>
                  <Badge variant="outline" className="border-slate-200 text-slate-400 font-black uppercase text-[10px]">Basic Access</Badge>
                </div>
                <ul className="space-y-4">
                  <ComparisonItem text="Limited Practice Mocks" active={true} />
                  <ComparisonItem text="Basic Performance Results" active={true} />
                  <ComparisonItem text="Subject-Wise Mastery" active={false} />
                  <ComparisonItem text="Complete PYQ Hub" active={false} />
                  <ComparisonItem text="AI Rationale Tutors" active={false} />
                </ul>
              </div>
              <Button asChild variant="outline" className="w-full mt-10 h-16 rounded-2xl font-black uppercase text-[10px] tracking-widest border-slate-200">
                <Link href="/mocks">Try Free Now</Link>
              </Button>
            </Card>

            {/* PREMIUM PATH */}
            <Card className="border-none shadow-4xl rounded-[3rem] bg-[#0F172A] text-white p-8 md:p-12 relative overflow-hidden flex flex-col scale-105 z-10 border-4 border-primary/20">
              <div className="absolute top-0 right-0 p-8 opacity-5"><Zap className="h-40 w-40" /></div>
              <div className="space-y-6 flex-1 relative z-10">
                <div className="flex justify-between items-center">
                  <h3 className="text-2xl font-black text-primary uppercase">PREMIUM</h3>
                  <Badge className="bg-primary text-white border-none font-black uppercase text-[10px]">Elite Hub</Badge>
                </div>
                <ul className="space-y-4">
                  <ComparisonItem text="Full Mock Test Series" active={true} premium />
                  <ComparisonItem text="All Subject-Wise Tests" active={true} premium />
                  <ComparisonItem text="All Sectional & Chapter Tests" active={true} premium />
                  <ComparisonItem text="Official PYQ Repository" active={true} premium />
                  <ComparisonItem text="Daily Current Affairs Hub" active={true} premium />
                  <ComparisonItem text="AI Step-by-Step Solutions" active={true} premium />
                  <ComparisonItem text="All Punjab Rank Tracking" active={true} premium />
                </ul>
              </div>
              <Button asChild className="w-full mt-10 h-16 bg-primary hover:bg-orange-600 text-white font-black uppercase text-[10px] tracking-widest rounded-2xl shadow-3xl shadow-primary/20 border-none transition-all active:scale-95">
                <Link href="/pass">Unlock Premium Pass</Link>
              </Button>
            </Card>
          </div>
        </div>
      </section>

    </div>
  );
}

function TrustChip({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-3 text-white/70 font-bold uppercase text-[10px] md:text-xs tracking-tight">
       <div className="h-5 w-5 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0 border border-emerald-500/20">
          <Check className="h-3 w-3 text-emerald-500 stroke-[4px]" />
       </div>
       {text}
    </div>
  );
}

function ExamChip({ icon, label }: { icon: React.ReactNode, label: string }) {
   return (
      <div className="px-5 py-3 rounded-xl bg-white/5 border border-white/10 text-slate-300 font-black text-[10px] md:text-[11px] tracking-widest hover:border-primary/50 hover:bg-white/10 transition-all cursor-default flex items-center gap-3 group active:scale-95 shadow-sm">
         <span className="text-primary group-hover:scale-125 transition-transform duration-300">{icon}</span> {label}
      </div>
   );
}

function GlassMetric({ icon, label, val }: any) {
   return (
      <div className="bg-white/10 backdrop-blur-2xl border border-white/20 p-6 md:p-8 rounded-[2.5rem] shadow-5xl flex items-center gap-5 min-w-[200px] hover:bg-white/15 transition-all cursor-default">
         <div className="h-12 w-12 md:h-14 md:w-14 rounded-2xl bg-white/10 flex items-center justify-center shadow-inner border border-white/10">
            {React.cloneElement(icon, { className: "h-6 w-6 md:h-7 md:w-7" })}
         </div>
         <div className="text-left">
            <p className="text-[9px] md:text-[11px] font-black uppercase text-white/50 tracking-widest leading-none mb-1">{label}</p>
            <p className="text-xl md:text-3xl font-black text-white leading-none tracking-tight">{val}</p>
         </div>
      </div>
   );
}

function PlatformStat({ val, label, icon }: any) {
   return (
      <div className="flex flex-col items-center gap-4 group">
         <div className="h-14 w-14 rounded-2xl bg-slate-50 flex items-center justify-center shrink-0 group-hover:bg-primary/5 group-hover:shadow-xl transition-all duration-500 shadow-inner">
            {icon}
         </div>
         <div className="space-y-1">
            <p className="text-2xl md:text-4xl font-headline font-black text-[#0B1528] tracking-tighter leading-none">{val}</p>
            <p className="text-[10px] md:text-[12px] font-black uppercase tracking-[0.2em] text-slate-400">{label}</p>
         </div>
      </div>
   );
}

function FeatureCard({ icon, title, desc, bgColor }: any) {
   return (
      <Card className="border-none shadow-xl rounded-[2.5rem] p-8 md:p-10 group hover:translate-y-[-4px] transition-all bg-slate-50/50 border border-slate-100">
         <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-inner group-hover:scale-110 transition-transform", bgColor)}>
           {React.cloneElement(icon, { className: "h-7 w-7" })}
         </div>
         <h3 className="text-xl font-black mb-2 uppercase text-[#0F172A] group-hover:text-primary transition-colors">
           {title}
         </h3>
         <p className="text-slate-500 text-sm font-medium leading-relaxed">
           {desc}
         </p>
      </Card>
   );
}

function ComparisonItem({ text, active, premium }: { text: string, active: boolean, premium?: boolean }) {
  return (
    <li className={cn(
      "flex items-center gap-4 text-xs font-bold uppercase tracking-tight",
      active ? (premium ? "text-slate-300" : "text-slate-600") : "text-slate-500 line-through opacity-40"
    )}>
       <div className={cn(
         "h-5 w-5 rounded-full flex items-center justify-center shrink-0",
         active ? (premium ? "bg-primary text-white" : "bg-emerald-50 text-emerald-500") : "bg-slate-100 text-slate-300"
       )}>
          {active ? <Check className="h-3 w-3 stroke-[3px]" /> : <X className="h-3 w-3" />}
       </div>
       {text}
    </li>
  );
}

import { BarChart3 } from "lucide-react";
