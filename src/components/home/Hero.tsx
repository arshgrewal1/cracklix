'use client';

import React, { useMemo, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { 
  Zap, 
  ArrowRight,
  ClipboardList,
  ShieldCheck,
  CheckCircle2,
  Star,
  Users,
  FileText,
  Target,
  Trophy,
  FileStack,
  ChevronRight,
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useDoc, useFirestore } from '@/firebase';
import { doc } from "firebase/firestore";
import { Badge } from "@/components/ui/badge";

/**
 * @fileOverview Majestic High-Fidelity Hero Hub v8.0.
 * FIXED: Hook order consistency to prevent "Rendered more hooks" error.
 * RECREATED: Exact match to image_0.png with floating cards and curvy dotted paths.
 */

export default function Hero() {
  const db = useFirestore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const statsRef = useMemo(() => (db ? doc(db, "settings", "stats") : null), [db]);
  const { data: stats } = useDoc<any>(statsRef);

  const liveStats = useMemo(() => {
    const formatNumber = (num: number, fallback: string) => {
      if (!num) return fallback;
      if (num >= 1000) return (num / 1000).toFixed(0) + 'K+';
      return num.toString() + '+';
    };

    return [
      { id: 'q', icon: <Zap className="text-white h-6 w-6" />, val: formatNumber(stats?.totalQuestions, "50K+"), label: "Questions", sub: "Verified Patterns", color: "bg-blue-600" },
      { id: 'm', icon: <ClipboardList className="text-white h-6 w-6" />, val: formatNumber(stats?.totalMocks, "500+"), label: "Mock Tests", sub: "Bilingual Hub", color: "bg-purple-600" },
      { id: 'e', icon: <CheckCircle2 className="text-white h-6 w-6" />, val: formatNumber(stats?.totalBoards, "50+"), label: "Exams", sub: "Punjab Verticals", color: "bg-green-600" },
      { id: 'u', icon: <Users className="text-white h-6 w-6" />, val: formatNumber(stats?.totalUsers, "15K+"), label: "Aspirants", sub: "Trusted Network", color: "bg-orange-600" }
    ];
  }, [stats]);

  // Safety Return after all hooks are initialized
  if (!mounted) return <div className="min-h-[700px] bg-[#F8FAFC]" />;

  return (
    <section className="relative w-full bg-[#F8FAFC] overflow-hidden pt-12 pb-16 md:py-24 border-b border-slate-100">
      
      {/* BACKGROUND DECORATION */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-40">
         <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[60%] bg-blue-100/50 blur-[100px] rounded-full" />
         <div className="absolute bottom-[10%] right-[-5%] w-[30%] h-[50%] bg-indigo-50/50 blur-[100px] rounded-full" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          
          {/* LEFT COLUMN: BRANDING & CTA */}
          <div className="space-y-8 text-left">
            
            <motion.div
               initial={{ opacity: 0, x: -20 }}
               animate={{ opacity: 1, x: 0 }}
               className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-200 shadow-sm"
            >
               <div className="bg-blue-600 rounded-full p-1 shadow-md">
                 <Star className="h-3.5 w-3.5 text-white fill-current" />
               </div>
               <span className="text-[10px] md:text-xs font-black text-slate-800 tracking-tight uppercase">⭐ 10,000+ Aspirants Trust Cracklix</span>
            </motion.div>

            <motion.div
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.1 }}
               className="space-y-4"
            >
               <h1 className="text-4xl md:text-[68px] font-black text-[#0F172A] leading-[1.05] tracking-tighter uppercase">
                  Crack Punjab <br/>
                  <span className="text-blue-600">Government Exams</span> <br/>
                  With Confidence
               </h1>
               <p className="text-base md:text-xl text-slate-500 font-medium max-w-2xl leading-relaxed">
                  Practice bilingual mock tests and prepare for Punjab Government Exams with confidence. Access exam-focused practice, previous papers and performance tracking in one place.
               </p>
            </motion.div>

            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               transition={{ delay: 0.2 }}
               className="flex flex-wrap gap-2 md:gap-3"
            >
               {['PSSSB', 'Punjab Police', 'PSTET', 'PSPCL', 'PPSC'].map((p) => (
                  <button key={p} className="px-6 py-2.5 bg-white border border-slate-200 rounded-full text-[10px] md:text-xs font-black text-slate-600 shadow-sm uppercase tracking-widest hover:border-blue-600 hover:text-blue-600 transition-all active:scale-95">
                     {p}
                  </button>
               ))}
            </motion.div>

            <motion.div
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.3 }}
               className="flex flex-col sm:flex-row gap-4 pt-4"
            >
               <Button asChild className="h-14 md:h-16 px-10 bg-blue-600 hover:bg-blue-700 text-white font-black text-[12px] md:text-sm tracking-widest rounded-2xl shadow-4xl border-none uppercase group">
                  <Link href="/mocks" className="flex items-center justify-center w-full gap-4">
                     <span>Start Free Mock Test</span>
                     <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
               </Button>
               <Button asChild variant="outline" className="h-14 md:h-16 px-10 border-2 border-slate-200 text-slate-600 hover:border-blue-600 hover:text-blue-600 font-black text-[12px] md:text-sm tracking-widest rounded-2xl uppercase group transition-all bg-white shadow-sm">
                  <Link href="/exams" className="flex items-center justify-center w-full gap-4">
                     <span>Browse Exams</span>
                     <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
               </Button>
            </motion.div>
          </div>

          {/* RIGHT COLUMN: RECREATED ILLUSTRATION HUB */}
          <div className="relative flex justify-center items-center mt-12 lg:mt-0 min-h-[500px]">
             
             {/* DOTTED PATH SVG (BACKDROP) */}
             <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-30" viewBox="0 0 600 600" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M120 150C180 80 420 80 480 150" stroke="#2563EB" strokeWidth="2" strokeDasharray="6 6" />
                <path d="M100 350C150 420 450 420 500 350" stroke="#2563EB" strokeWidth="2" strokeDasharray="6 6" />
                <path d="M150 150C100 200 100 300 150 350" stroke="#2563EB" strokeWidth="2" strokeDasharray="6 6" />
                <path d="M450 150C500 200 500 300 450 350" stroke="#2563EB" strokeWidth="2" strokeDasharray="6 6" />
             </svg>

             <div className="relative w-full">
                {/* GLOW EFFECT */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] h-[90%] bg-blue-500/5 blur-[80px] rounded-full" />
                
                {/* STUDENT IMAGE */}
                <motion.img
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8 }}
                  src="/images/hero-student.png"
                  alt="Cracklix Student"
                  className="w-full max-w-[320px] sm:max-w-[420px] lg:max-w-[520px] xl:max-w-[620px] mx-auto object-contain relative z-10 drop-shadow-2xl"
                  onError={(e) => {
                     (e.target as HTMLImageElement).src = "https://picsum.photos/seed/student/800/800";
                  }}
                />

                {/* FLOATING ACTION CARDS */}
                <FloatingCard 
                   icon={<ClipboardList className="text-blue-600 h-5 w-5" />} 
                   label="Mock Tests" 
                   className="top-[10%] left-[0%] md:left-[-5%]" 
                   delay={0.5} 
                   href="/mocks"
                   iconColor="bg-blue-50"
                />
                
                <FloatingCard 
                   icon={<Target className="text-purple-600 h-5 w-5" />} 
                   label="Daily Practice" 
                   className="bottom-[35%] left-[-5%] md:left-[-10%]" 
                   delay={0.7} 
                   href="/current-affairs"
                   iconColor="bg-purple-50"
                />
                
                <FloatingCard 
                   icon={<FileStack className="text-green-600 h-5 w-5" />} 
                   label="Previous Papers" 
                   className="top-[15%] right-[0%] md:right-[-5%]" 
                   delay={0.6} 
                   href="/pyqs"
                   iconColor="bg-green-50"
                />
                
                <FloatingCard 
                   icon={<Trophy className="text-orange-600 h-5 w-5" />} 
                   label="Punjab Exams" 
                   className="bottom-[30%] right-[-5%] md:right-[-10%]" 
                   delay={0.8} 
                   href="/exams"
                   iconColor="bg-orange-50"
                />
             </div>
          </div>
        </div>

        {/* BOTTOM STATS REGISTRY */}
        <div className="mt-16 md:mt-24">
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {liveStats.map((stat, idx) => (
                 <motion.div
                    key={stat.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.1 }}
                 >
                    <Card className="bg-white border border-slate-100 p-8 rounded-[2.5rem] text-left flex items-center gap-6 group hover:shadow-2xl transition-all duration-500 shadow-xl shadow-slate-200/40">
                       <div className={cn("shrink-0 h-16 w-16 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 shadow-lg shadow-slate-200/50", stat.color)}>
                          {stat.icon}
                       </div>
                       <div className="min-w-0">
                          <p className="text-3xl md:text-4xl font-black text-[#0F172A] tabular-nums leading-none mb-1">{stat.val}</p>
                          <p className="text-[11px] font-black text-slate-800 uppercase tracking-tight">{stat.label}</p>
                          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1 truncate">{stat.sub}</p>
                       </div>
                    </Card>
                 </motion.div>
              ))}
           </div>
        </div>
      </div>
    </section>
  );
}

function FloatingCard({ icon, label, className, delay, href, iconColor }: { icon: React.ReactNode, label: string, className: string, delay: number, href: string, iconColor: string }) {
   return (
      <motion.div 
         initial={{ opacity: 0, scale: 0.8 }}
         animate={{ 
            opacity: 1, 
            scale: 1,
            y: [0, -10, 0] 
         }}
         transition={{ 
            opacity: { delay, duration: 0.5 },
            scale: { delay, duration: 0.5 },
            y: { duration: 4, repeat: Infinity, ease: "easeInOut" }
         }}
         className={cn("absolute z-[20] hidden sm:block", className)}
      >
         <Link href={href}>
            <div className="bg-white rounded-2xl shadow-[0_10px_40px_-5px_rgba(0,0,0,0.1)] p-3 md:p-4 flex flex-col items-center gap-2 border border-white/50 backdrop-blur-sm group active:scale-95 transition-transform min-w-[120px] md:min-w-[140px]">
               <div className={cn("h-10 w-10 md:h-12 md:w-12 rounded-xl flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform", iconColor)}>
                  {icon}
               </div>
               <span className="font-black text-[9px] md:text-[10px] uppercase text-[#0F172A] tracking-[0.1em] text-center">{label}</span>
            </div>
         </Link>
      </motion.div>
   )
}
