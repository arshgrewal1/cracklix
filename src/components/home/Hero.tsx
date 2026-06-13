
'use client';

import React, { useMemo, useState, useEffect } from "react";
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
  LayoutGrid,
  Star,
  BarChart3,
  Flame,
  Globe,
  TrendingUp,
  Smartphone,
  Lock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useDoc, useFirestore } from "@/firebase";
import { doc } from "firebase/firestore";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * @fileOverview Institutional Punjab Government Exam Hero v23.0 (Hydration Fixed).
 * UPDATED: Integrated mounted guard for live stats to prevent hydration mismatch.
 */

export default function Hero() {
  const router = useRouter();
  const db = useFirestore();
  const [mounted, setMounted] = useState(false);
  const heroImage = "https://punjabpolice.gov.in/media/images/pp10.original.jpg";

  useEffect(() => {
    setMounted(true);
  }, []);

  // LIVE STATS LISTENER
  const statsRef = useMemo(() => (db ? doc(db, "settings", "stats") : null), [db]);
  const { data: stats, loading } = useDoc<any>(statsRef);

  const displayStats = useMemo(() => {
    const format = (num: number) => {
      if (!num) return "0";
      return num >= 1000 ? `${(num / 1000).toFixed(1)}k+` : num.toString();
    };

    // Use placeholder values if not mounted or loading to ensure SSR matches initial hydration
    const s = mounted ? stats : null;

    return {
      questions: format(s?.totalQuestions || 50000),
      mocks: format(s?.totalMocks || 500),
      aspirants: format(s?.totalUsers || 15000),
      accuracy: `${s?.averageAccuracy || 94}%`
    };
  }, [stats, mounted]);

  return (
    <div className="flex flex-col w-full bg-white font-body">
      
      {/* 1. SELECTION HUB (MAIN HERO) */}
      <section className="relative min-h-[90vh] flex items-center pt-12 pb-20 md:pt-0 md:pb-0 bg-[#0B1528] overflow-hidden text-left">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-primary/10 blur-[120px] rounded-full pointer-events-none opacity-50" />
        <div className="absolute bottom-0 left-0 w-1/4 h-full bg-blue-500/10 blur-[120px] rounded-full pointer-events-none opacity-50" />
        
        <div className="container mx-auto px-4 md:px-6 max-w-7xl relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-center min-h-[80vh]">
            
            <div className="lg:col-span-7 space-y-8 md:space-y-10">
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6 md:space-y-8"
              >
                <div className="inline-flex items-center gap-3 bg-primary/10 border border-primary/20 px-5 py-2 rounded-full shadow-2xl">
                  <Flame className="h-4 w-4 text-primary animate-pulse" />
                  <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.2em] text-primary">
                    Punjab's Most Trusted Mock Test Platform
                  </span>
                </div>

                <h1 className="text-4xl md:text-7xl font-headline font-black leading-[0.95] tracking-tighter text-white uppercase">
                  Crack <span className="text-primary underline decoration-primary/30 underline-offset-8">Punjab Government Exams</span> Before The Real Exam
                </h1>

                <p className="text-slate-400 text-base md:text-xl font-medium max-w-2xl leading-relaxed antialiased border-l-4 border-primary/30 pl-6">
                  Prepare for PSSSB, Punjab Police, PPSC, PSPCL, PSTET, CTET, ETT, Master Cadre, High Court and other Punjab Government recruitment exams with exam-level mock tests, PYQs, current affairs and detailed solutions.
                </p>

                <div className="flex flex-wrap gap-x-8 gap-y-4 pt-2">
                  <TrustChip text="Full-Length Mocks" />
                  <TrustChip text="PYQs" />
                  <TrustChip text="Current Affairs" />
                  <TrustChip text="Detailed Solutions" />
                  <TrustChip text="Bilingual Tests" />
                  <TrustChip text="Performance Analytics" />
                </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex flex-col sm:flex-row items-center gap-5 pt-4"
              >
                <Button 
                  onClick={() => router.push('/mocks')}
                  className="w-full sm:w-auto h-16 md:h-18 px-12 bg-primary hover:bg-orange-600 text-white font-black uppercase text-[12px] md:text-[14px] tracking-[0.2em] shadow-3xl shadow-primary/20 border-none transition-all active:scale-95 gap-4 rounded-2xl"
                >
                  🚀 Start Free Mock
                </Button>
                <Button 
                  onClick={() => router.push('/exams')}
                  className="w-full sm:w-auto h-16 md:h-18 px-12 rounded-2xl bg-white/5 text-white hover:bg-white/10 font-black uppercase text-[12px] md:text-[14px] tracking-[0.2em] transition-all active:scale-95 gap-4 border border-white/10 backdrop-blur-xl"
                >
                  📚 Explore Exams
                </Button>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="pt-10 border-t border-white/5 space-y-5"
              >
                 <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Official Recruitment Hubs</p>
                 <div className="flex flex-wrap gap-3">
                    <ExamChip icon={<Landmark className="h-3.5 w-3.5" />} label="PSSSB" />
                    <ExamChip icon={<ShieldCheck className="h-3.5 w-3.5" />} label="Punjab Police" />
                    <ExamChip icon={<Scale className="h-3.5 w-3.5" />} label="PPSC" />
                    <ExamChip icon={<Zap className="h-3.5 w-3.5" />} label="PSPCL" />
                    <ExamChip icon={<BookOpen className="h-3.5 w-3.5" />} label="PSTET" />
                    <ExamChip icon={<FileText className="h-3.5 w-3.5" />} label="CTET" />
                    <ExamChip icon={<GraduationCap className="h-3.5 w-3.5" />} label="ETT" />
                    <ExamChip icon={<Users className="h-3.5 w-3.5" />} label="Master Cadre" />
                 </div>
              </motion.div>
            </div>

            <div className="lg:col-span-5 relative hidden lg:block h-full min-h-[600px]">
               <motion.div 
                 initial={{ opacity: 0, scale: 0.95 }}
                 animate={{ opacity: 1, scale: 1 }}
                 transition={{ duration: 1 }}
                 className="absolute inset-0 rounded-[4rem] overflow-hidden border-[12px] border-white/5 shadow-5xl bg-[#0B1528] group"
               >
                  <Image 
                    src={heroImage} 
                    fill 
                    alt="Punjab Selection Hub" 
                    className="object-cover grayscale-[0.2] group-hover:grayscale-0 transition-all duration-[2000ms] group-hover:scale-105"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0B1528] via-[#0B1528]/40 to-transparent" />
                  
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
                              <Flame className="h-7 w-7 fill-current" />
                           </div>
                           <div className="text-left">
                              <p className="text-[10px] font-black uppercase text-white/50 tracking-widest leading-none mb-1">Selection Forecast</p>
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

      {/* 2. PLATFORM STATS STRIP (LIVE) */}
      <section className="py-12 md:py-20 bg-white border-b border-slate-100 relative z-20 -mt-10 md:-mt-16 container mx-auto max-w-6xl px-4">
         <div className="bg-white shadow-5xl rounded-[3rem] p-8 md:p-14 border border-slate-50">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-10 md:gap-12 text-center">
               <PlatformStat val={displayStats.questions} label="Questions" icon={<Layers className="text-primary h-6 w-6" />} />
               <PlatformStat val={displayStats.mocks} label="Mock Tests" icon={<Zap className="text-blue-500 h-6 w-6" />} />
               <PlatformStat val={displayStats.aspirants} label="Aspirants" icon={<Users className="text-emerald-500 h-6 w-6" />} />
               <PlatformStat val={displayStats.accuracy} label="Accuracy" icon={<Target className="text-rose-500 h-6 w-6" />} />
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
      <div className="bg-white/10 backdrop-blur-2xl border border-white/20 p-6 md:p-8 rounded-[2.5rem] shadow-5xl flex items-center gap-5 min-w-[200px] hover:bg-white/15 transition-all cursor-default text-left">
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
