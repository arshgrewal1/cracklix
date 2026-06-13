'use client';

import React, { useMemo, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { 
  BarChart3, 
  BookOpen, 
  ArrowRight,
  ClipboardList,
  ShieldCheck,
  Star
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useDoc, useFirestore } from '@/firebase';
import { doc } from "firebase/firestore";

/**
 * @fileOverview Final High-Fidelity Hero Section v95.0.
 * MATCHED: 1:1 layout with user screenshot.
 * MANDATORY: All text is in Sentence case (only first letter capital).
 * MOBILE: 200px height with zero overlap.
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
      if (num >= 1000) return (num / 1000).toFixed(0) + ',000+';
      return num.toString() + '+';
    };

    return [
      { id: 'q', icon: <BookOpen className="text-blue-400 h-3.5 w-3.5 md:h-6 md:w-6" />, val: formatNumber(stats?.totalQuestions, "10,000+"), label: "Practice questions" },
      { id: 'm', icon: <ClipboardList className="text-orange-400 h-3.5 w-3.5 md:h-6 md:w-6" />, val: formatNumber(stats?.totalMocks, "500+"), label: "Mock tests" },
      { id: 'e', icon: <ShieldCheck className="text-blue-500 h-3.5 w-3.5 md:h-6 md:w-6" />, val: formatNumber(stats?.totalBoards, "50+"), label: "Exams covered" },
      { id: 'a', icon: <BarChart3 className="text-emerald-400 h-3.5 w-3.5 md:h-6 md:w-6" />, val: "Detailed", label: "Analytics hub" }
    ];
  }, [stats]);

  if (!mounted) return null;

  return (
    <section className="relative w-full bg-[#050B19] overflow-hidden h-[200px] md:h-[620px] flex flex-col justify-center text-left">
      
      {/* 1. BACKGROUND LAYER STACK */}
      <div className="absolute inset-0 z-0">
        <motion.img 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2 }}
          src="https://i.ibb.co/fYJttX5d/Gemini-Generated-Image-n1so6on1so6on1so.png" 
          alt="Golden Temple" 
          className="w-full h-full object-cover object-[center_35%] md:object-center"
          referrerPolicy="no-referrer"
        />
        
        {/* PUNJAB MAP WATERMARK */}
        <div className="absolute inset-0 z-10 pointer-events-none opacity-[0.06]">
           <div className="absolute top-[40%] md:top-[45%] left-[20%] md:left-[22%] -translate-x-1/2 -translate-y-1/2 w-[250px] h-[250px] md:w-[700px] md:h-[700px] bg-[url('https://upload.wikimedia.org/wikipedia/commons/e/ea/Outline_Map_of_Punjab_India.svg')] bg-contain bg-no-repeat grayscale invert" />
        </div>

        {/* BLUE CINEMATIC SHADING */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#050B19] via-[#050B19]/50 to-transparent z-[15]" />
        
        {/* BOTTOM BLENDING */}
        <div className="absolute bottom-0 left-0 right-0 h-8 md:h-32 bg-gradient-to-t from-[#050B19]/60 to-transparent z-[15]" />
      </div>

      {/* 2. PRIMARY CONTENT HUB */}
      <div className="container mx-auto px-4 md:px-12 max-w-7xl relative z-20">
         <div className="max-w-4xl space-y-1 md:space-y-4">
            
            {/* TOP PILL BADGE - MINI */}
            <motion.div
               initial={{ opacity: 0, y: 5 }}
               animate={{ opacity: 1, y: 0 }}
               className="inline-flex items-center gap-1.5 md:gap-2.5 px-2 md:px-4 py-0.5 md:py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-1 md:mb-4"
            >
               <Star className="h-2.5 w-2.5 md:h-3.5 md:w-3.5 text-[#F97316] fill-current" />
               <span className="text-[8px] md:text-[12px] font-bold text-white tracking-wide">#1 Punjab exam preparation platform</span>
            </motion.div>

            {/* HEADINGS - SENTENCE CASE (MANDATORY) */}
            <motion.div
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.1 }}
               className="space-y-0"
            >
               <h1 className="text-xl sm:text-2xl md:text-7xl font-black text-white leading-[1.1] md:leading-[1] tracking-tight antialiased">
                  Prepare smarter.<br/>
                  <span className="text-[#F97316]">Score higher.</span>
               </h1>
            </motion.div>

            {/* SUBTEXT - HIDDEN ON MOBILE TO PREVENT OVERLAP */}
            <motion.p 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               transition={{ delay: 0.2 }}
               className="hidden md:block text-sm md:text-xl text-slate-300 font-medium max-w-2xl leading-relaxed pt-2"
            >
               Punjab government exams di complete preparation ik hi platform te.
            </motion.p>

            {/* TACTICAL BUTTONS - MINI ON MOBILE */}
            <motion.div
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.3 }}
               className="flex flex-row gap-2 md:gap-5 pt-2 md:pt-6"
            >
               <Button asChild className="h-7 md:h-14 px-3 md:px-12 bg-[#F97316] hover:bg-orange-600 text-white font-black text-[7px] md:text-[12px] tracking-widest rounded-lg md:rounded-xl shadow-2xl transition-all active:scale-95 border-none">
                  <Link href="/mocks" className="flex items-center">
                     Start practice <ArrowRight className="h-2 w-2 md:h-5 md:w-5 ml-1 md:ml-2.5" />
                  </Link>
               </Button>
               <Button asChild variant="outline" className="h-7 md:h-14 px-3 md:px-12 border-white/20 bg-white/5 text-white font-black text-[7px] md:text-[12px] tracking-widest rounded-lg md:rounded-xl transition-all backdrop-blur-md hover:bg-white/10">
                  <Link href="/exams">
                     Exams
                  </Link>
               </Button>
            </motion.div>
         </div>
      </div>

      {/* 3. INTEGRATED BOTTOM STATS HUB - COMPACT GRID */}
      <div className="absolute bottom-1 md:bottom-8 left-0 right-0 z-30">
         <div className="container mx-auto px-4 md:px-12 max-w-7xl">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-1 md:gap-6">
               {liveStats.map((stat) => (
                  <HeroStatCard 
                    key={stat.id}
                    icon={stat.icon} 
                    val={stat.val} 
                    label={stat.label} 
                  />
               ))}
            </div>
         </div>
      </div>
    </section>
  );
}

function HeroStatCard({ icon, val, label }: { icon: React.ReactNode, val: string, label: string }) {
  return (
    <Card className="bg-white/5 backdrop-blur-3xl border border-white/10 p-1 md:p-6 rounded-md md:rounded-2xl text-left flex items-center gap-1.5 md:gap-5 group hover:bg-white/10 transition-all duration-300 shadow-2xl overflow-hidden">
       <div className="shrink-0 transition-transform group-hover:scale-110 scale-75 md:scale-100">
          {icon}
       </div>
       <div className="min-w-0 flex flex-col justify-center">
          <p className="text-[9px] md:text-2xl font-black text-white leading-none tracking-tight tabular-nums">{val}</p>
          <p className="text-[6px] md:text-[11px] font-bold text-slate-400 tracking-wide mt-0.5 md:mt-1 truncate">
             {label}
          </p>
       </div>
    </Card>
  )
}
