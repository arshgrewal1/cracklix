'use client';

import React, { useMemo, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { 
  ShieldCheck, 
  Zap, 
  Target, 
  Award, 
  Check,
  ClipboardList,
  Users,
  Landmark,
  Scale,
  FileText,
  GraduationCap,
  Flame,
  Star,
  BarChart3,
  Layers,
  ChevronRight,
  BookOpen
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { useDoc, useFirestore } from "@/firebase";
import { doc } from "firebase/firestore";

/**
 * @fileOverview Official CRACKLIX Punjab Government Exam Hero v31.0.
 * FIXED: Added missing 'BookOpen' icon import.
 * STABILITY: Maintain a rigid structural tree to prevent hydration displacement.
 */

export default function Hero() {
  const router = useRouter();
  const db = useFirestore();
  const [mounted, setMounted] = useState(false);
  
  const heroImage = "https://punjabpolice.gov.in/media/images/pp10.original.jpg";

  useEffect(() => {
    setMounted(true);
  }, []);

  const statsRef = useMemo(() => (db ? doc(db, "settings", "stats") : null), [db]);
  const { data: stats } = useDoc<any>(statsRef);

  // Fallbacks for live stats
  const liveStats = useMemo(() => {
    return [
      { label: "Questions", val: stats?.totalQuestions ? (stats.totalQuestions / 1000).toFixed(0) + "k+" : "50,000+", icon: <Zap className="text-primary" /> },
      { label: "Mock Tests", val: stats?.totalMocks || "500+", icon: <BarChart3 className="text-blue-400" /> },
      { label: "Aspirants", val: stats?.totalUsers ? (stats.totalUsers / 1000).toFixed(0) + "k+" : "15,000+", icon: <Users className="text-emerald-400" /> },
      { label: "Accuracy", val: stats?.averageAccuracy ? stats.averageAccuracy + "%" : "94%", icon: <Target className="text-rose-400" /> }
    ];
  }, [stats]);

  return (
    <section className="relative w-full bg-[#0B1528] overflow-hidden border-none text-left">
      
      {/* 1. SELECTION HUB (MAIN HERO) */}
      <div className="relative min-h-[90vh] lg:min-h-screen flex flex-col justify-center">
        {/* Ambient Background */}
        <div className="absolute top-0 right-0 w-1/3 h-full bg-primary/5 blur-[120px] rounded-full pointer-events-none opacity-50" />
        <div className="absolute bottom-0 left-0 w-1/4 h-1/2 bg-blue-600/5 blur-[120px] rounded-full pointer-events-none opacity-30" />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl relative z-20 py-12 md:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* CONTENT BLOCK */}
            <div className="lg:col-span-7 space-y-8">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <Badge className="bg-primary/10 text-primary border-primary/20 px-4 py-1.5 rounded-full font-black uppercase text-[10px] tracking-widest shadow-xl flex items-center gap-2 w-fit">
                   <Flame className="h-3 w-3 fill-current" /> Punjab's Most Trusted Mock Test Platform
                </Badge>

                <h1 className="text-4xl sm:text-5xl md:text-7xl font-headline font-black leading-[0.95] tracking-tighter text-white uppercase">
                   Crack Punjab <br/>
                   <span className="text-primary">Govt Exams</span> <br/>
                   Before The Real Exam
                </h1>

                <p className="text-slate-400 text-base md:text-xl font-medium max-w-2xl leading-relaxed border-l-4 border-primary/30 pl-6">
                   Prepare for PSSSB, Punjab Police, PPSC, PSPCL, PSTET, CTET, ETT, Master Cadre, High Court and other Punjab Government Exams through real exam-level mock tests, PYQs, current affairs and detailed solutions.
                </p>

                <div className="flex flex-wrap gap-3 pt-4">
                  <ExamChip label="PSSSB" icon={<Landmark />} />
                  <ExamChip label="Punjab Police" icon={<ShieldCheck />} />
                  <ExamChip label="PPSC" icon={<Scale />} />
                  <ExamChip label="PSPCL" icon={<Zap />} />
                  <ExamChip label="PSTET" icon={<BookOpen />} />
                  <ExamChip label="CTET" icon={<FileText />} />
                  <ExamChip label="ETT" icon={<GraduationCap />} />
                  <ExamChip label="Master Cadre" icon={<Users />} />
                </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="flex flex-col sm:flex-row items-center gap-4 pt-4"
              >
                <Button 
                  onClick={() => router.push('/mocks')}
                  className="w-full sm:w-auto h-16 md:h-20 px-12 bg-primary hover:bg-orange-600 text-white font-black uppercase tracking-widest text-[11px] md:text-sm rounded-2xl shadow-3xl shadow-primary/20 transition-all active:scale-95 border-none"
                >
                  Start Free Mock <Zap className="ml-2 h-5 w-5 fill-current" />
                </Button>
                <Button 
                  onClick={() => router.push('/exams')}
                  className="w-full sm:w-auto h-16 md:h-20 px-12 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-2xl font-black uppercase tracking-widest text-[11px] md:text-sm transition-all active:scale-95"
                >
                  Explore Exams
                </Button>
              </motion.div>
            </div>

            {/* VISUAL BLOCK */}
            <div className="lg:col-span-5 relative hidden lg:block h-[650px]">
               <motion.div 
                 initial={{ opacity: 0, scale: 0.95 }}
                 animate={{ opacity: 1, scale: 1 }}
                 transition={{ duration: 0.8 }}
                 className="relative h-full w-full rounded-[4rem] overflow-hidden border-8 border-white/5 shadow-5xl bg-[#0B1528]"
               >
                  <Image src={heroImage} fill className="object-cover object-top opacity-80" alt="Punjab Police" priority />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0B1528] via-transparent to-transparent" />
                  
                  {/* Floating Dashboard Nodes */}
                  <div className="absolute inset-0 p-8 flex flex-col justify-between">
                     <div className="flex justify-between items-start">
                        <FloatingCard icon={<Target className="text-emerald-400" />} label="Accuracy" val="94%" />
                        <FloatingCard icon={<Award className="text-amber-400" />} label="Punjab Rank" val="#245" />
                     </div>
                     <div className="flex justify-between items-end">
                        <FloatingCard icon={<ClipboardList className="text-blue-400" />} label="Tests Done" val="156" />
                        <FloatingCard icon={<ShieldCheck className="text-primary" />} label="Readiness" val="82%" />
                     </div>
                  </div>
               </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. PLATFORM STATS STRIP (Integrated) */}
      <div className="bg-white/5 border-y border-white/5 py-10 md:py-16">
         <div className="container mx-auto px-4 max-w-7xl">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-10">
               {liveStats.map((s, i) => (
                  <div key={i} className="flex flex-col items-center md:items-start text-center md:text-left space-y-2 group">
                     <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform shadow-inner">
                        {React.cloneElement(s.icon as React.ReactElement, { className: "h-5 w-5" })}
                     </div>
                     <p className="text-2xl md:text-5xl font-headline font-black text-white tracking-tighter tabular-nums">{mounted ? s.val : "---"}</p>
                     <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{s.label}</p>
                  </div>
               ))}
            </div>
         </div>
      </div>
    </section>
  );
}

function ExamChip({ label, icon }: { label: string, icon: React.ReactNode }) {
   return (
      <div className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-slate-300 font-bold text-[10px] uppercase tracking-widest hover:border-primary/40 hover:bg-white/10 transition-all flex items-center gap-2.5">
         <span className="text-primary">{React.cloneElement(icon as React.ReactElement, { className: "h-3.5 w-3.5" })}</span>
         {label}
      </div>
   );
}

function FloatingCard({ icon, label, val }: any) {
   return (
      <motion.div 
         animate={{ y: [0, -10, 0] }}
         transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
         className="bg-[#0F172A]/80 backdrop-blur-xl border border-white/10 p-4 rounded-2xl shadow-2xl flex items-center gap-4 min-w-[160px]"
      >
         <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/5 shadow-inner">
            {icon}
         </div>
         <div className="text-left">
            <p className="text-[8px] font-black uppercase text-slate-500 tracking-widest leading-none mb-1">{label}</p>
            <p className="text-lg font-black text-white uppercase tracking-tight leading-none">{val}</p>
         </div>
      </motion.div>
   )
}
