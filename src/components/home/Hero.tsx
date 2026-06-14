'use client';

import React from "react";
import { motion } from "framer-motion";
import { Star, ArrowRight, Download, BookOpen, ClipboardList, ShieldCheck, Users, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * @fileOverview Hardened Screenshot-Matched Hero Hub v93.0.
 * UPDATED: Slightly reduced top padding to move text upward for better framing.
 */

export default function Hero() {
  const templeImg = "https://i.ibb.co/LXgcLVVq/Gemini-Generated-Image-n1so6on1so6on1so.png";

  return (
    <section className="relative w-full min-h-[600px] lg:min-h-[850px] bg-[#0B0F19] flex flex-col justify-start overflow-hidden font-body text-left">
      
      {/* 1. BACKGROUND LAYERS - EXPANDED RIGHT SIDE, ALIGNED TO TOP */}
      <div className="absolute top-0 right-0 w-full lg:w-[65%] h-[350px] lg:h-full z-0 pointer-events-none">
        <img 
          src={templeImg} 
          alt="Golden Temple" 
          className="w-full h-full object-contain lg:object-right-top object-center"
          referrerPolicy="no-referrer"
        />
        {/* Cinematic Gradient: Fades from solid navy on the left to transparent on the right */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#0B0F19] via-[#0B0F19]/20 to-transparent lg:block hidden" />
        {/* Mobile Gradient: Fades bottom to top */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F19] via-transparent to-transparent lg:hidden" />
      </div>

      {/* 2. MAIN CONTENT HUB - LEFT ANCHORED, REPOSITIONED SLIGHTLY UP */}
      <div className="container mx-auto px-6 relative z-10 max-w-7xl pt-14 md:pt-24 lg:pt-28">
        <div className="max-w-3xl space-y-6 md:space-y-8 text-left">
          
           {/* BRAND BADGE */}
           <motion.div 
             initial={{ opacity: 0, y: 10 }}
             animate={{ opacity: 1, y: 0 }}
             className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md"
           >
              <div className="h-4 w-4 bg-[#F97316]/20 rounded-full flex items-center justify-center">
                <Star className="h-2.5 w-2.5 text-[#F97316] fill-current" />
              </div>
              <span className="text-[9px] md:text-[10px] font-black text-white uppercase tracking-widest">
                 ★ #1 PUNJAB PREP PLATFORM
              </span>
           </motion.div>

           {/* HEADLINES */}
           <motion.div 
             initial={{ opacity: 0, x: -20 }}
             animate={{ opacity: 1, x: 0 }}
             transition={{ delay: 0.1 }}
             className="space-y-1"
           >
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-headline font-black text-white leading-[0.9] tracking-tighter uppercase">
                 PREPARE SMARTER.
              </h1>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-headline font-black text-[#F97316] leading-[0.9] tracking-tighter uppercase">
                 SCORE HIGHER.
              </h1>
           </motion.div>

           {/* SUBTEXT */}
           <motion.p 
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             transition={{ delay: 0.2 }}
             className="text-sm md:text-lg lg:text-xl text-slate-300 font-medium max-w-xl leading-relaxed antialiased"
           >
              Punjab Government Exams di Complete Preparation ik hi Center te, Latest Official Patterns de Naal.
           </motion.p>

           {/* ACTION HUB - SCREENSHOT MATCHED SEQUENCE */}
           <motion.div 
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: 0.3 }}
             className="flex flex-wrap items-center gap-4 pt-4 md:pt-6"
           >
              {/* BUTTON 1: ORANGE FREE MOCK WITH 'N' BUBBLE */}
              <Button asChild className="h-12 md:h-14 px-8 bg-[#F97316] hover:bg-orange-600 text-white font-black uppercase text-[10px] md:text-[11px] tracking-widest rounded-2xl shadow-3xl transition-all active:scale-95 border-none gap-1">
                 <Link href="/mocks" className="flex items-center">
                    <div className="h-5 w-5 rounded-full bg-[#0B1528]/40 flex items-center justify-center shrink-0 mr-2 border border-white/10">
                       <span className="text-[8px] font-black text-white">N</span>
                    </div>
                    FREE MOCK <ArrowRight className="h-4 w-4 ml-1" />
                 </Link>
              </Button>

              {/* BUTTON 2: WHITE INSTALL APP */}
              <Button asChild className="h-12 md:h-14 px-8 bg-white hover:bg-slate-50 text-[#0F172A] font-black uppercase text-[10px] md:text-[11px] tracking-widest rounded-2xl transition-all active:scale-95 border-none gap-2 shadow-2xl">
                 <Link href="/download">
                    <Download className="h-4 w-4" /> INSTALL APP
                 </Link>
              </Button>

              {/* BUTTON 3: DARK EXAMS */}
              <Button asChild variant="outline" className="h-12 md:h-14 px-10 bg-white/5 border-white/10 text-white hover:bg-white/10 font-black uppercase text-[10px] md:text-[11px] tracking-widest rounded-2xl transition-all active:scale-95">
                 <Link href="/exams">EXAMS</Link>
              </Button>
           </motion.div>
        </div>

        {/* METRICS REGISTRY - ADJUSTED GAPS AND END ALIGNMENT */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 lg:gap-10 mt-16 md:mt-20 md:translate-x-20 lg:translate-x-40 max-w-6xl"
        >
           <MetricCard 
             icon={<BookOpen className="text-blue-500 h-5 w-5" />} 
             count="439+" 
             label="QUESTIONS" 
           />
           <MetricCard 
             icon={<ClipboardList className="text-orange-500 h-5 w-5" />} 
             count="8+" 
             label="MOCKS" 
           />
           <MetricCard 
             icon={<ShieldCheck className="text-blue-500 h-5 w-5" />} 
             count="92+" 
             label="EXAMS" 
           />
           <MetricCard 
             icon={<Users className="text-emerald-500 h-5 w-5" />} 
             count="5+" 
             label="ASPIRANTS" 
           />
        </motion.div>
      </div>
    </section>
  );
}

function MetricCard({ icon, count, label }: { icon: React.ReactNode, count: string, label: string }) {
  return (
    <Card className="border-none bg-[#0B1528]/80 backdrop-blur-2xl rounded-[1.5rem] md:rounded-[2rem] p-4 md:p-6 flex items-center gap-4 md:gap-5 border border-white/5 shadow-2xl group hover:bg-[#0B1528] transition-all text-left">
       <div className="h-10 w-10 md:h-12 md:w-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 shadow-inner group-hover:scale-110 transition-transform">
          {icon}
       </div>
       <div className="min-w-0">
          <p className="text-lg md:text-2xl font-headline font-black text-white leading-none tracking-tight truncate">{count}</p>
          <p className="text-[7px] md:text-[8px] font-black text-slate-500 uppercase tracking-[0.2em] mt-1.5">{label}</p>
       </div>
    </Card>
  )
}
