'use client';

import React from "react";
import { motion } from "framer-motion";
import { Star, ArrowRight, Download, BookOpen, ClipboardList, ShieldCheck, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * @fileOverview Refined Hero Hub v76.0.
 * UPDATED: Moved Golden Temple background to the left side.
 * FIXED: Balanced readability with dark overlays over the left-positioned image.
 */

export default function Hero() {
  const templeImg = "https://i.ibb.co/LXgcLVVq/Gemini-Generated-Image-n1so6on1so6on1so.png";

  return (
    <section className="relative w-full min-h-[600px] lg:min-h-[750px] bg-[#0B0F19] flex flex-col justify-start overflow-hidden font-body text-left">
      
      {/* 1. BACKGROUND LAYERS - MOVED TO LEFT */}
      <div className="absolute top-0 left-0 w-full lg:w-[45%] h-[200px] lg:h-full z-0 pointer-events-none">
        <img 
          src={templeImg} 
          alt="Golden Temple" 
          className="w-full h-full object-cover object-left-bottom opacity-70"
          referrerPolicy="no-referrer"
        />
        {/* Gradient for desktop: Right edge of image container fades into section background */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#0B0F19]/40 via-transparent to-[#0B0F19] lg:block hidden" />
        {/* Gradient for mobile: Bottom edge fades into content area */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F19] via-transparent to-transparent lg:hidden" />
      </div>

      {/* 2. MAIN CONTENT HUB */}
      <div className="container mx-auto px-6 relative z-10 max-w-7xl pt-12 md:pt-20">
        <div className="max-w-3xl space-y-5 md:space-y-6 text-left">
          
           {/* BRAND BADGE */}
           <motion.div 
             initial={{ opacity: 0, y: 10 }}
             animate={{ opacity: 1, y: 0 }}
             className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-md"
           >
              <div className="h-4 w-4 bg-[#F97316]/20 rounded-full flex items-center justify-center">
                <Star className="h-2.5 w-2.5 text-[#F97316] fill-current" />
              </div>
              <span className="text-[8px] md:text-[9px] font-black text-white uppercase tracking-widest">
                 ★ #1 PUNJAB PREP PLATFORM
              </span>
           </motion.div>

           {/* HEADLINES */}
           <motion.div 
             initial={{ opacity: 0, x: -20 }}
             animate={{ opacity: 1, x: 0 }}
             transition={{ delay: 0.1 }}
             className="space-y-0.5"
           >
              <h1 className="text-2xl md:text-4xl lg:text-5xl font-headline font-black text-white leading-tight tracking-tight uppercase">
                 PREPARE SMARTER.
              </h1>
              <h1 className="text-2xl md:text-4xl lg:text-5xl font-headline font-black text-[#F97316] leading-tight tracking-tight uppercase">
                 SCORE HIGHER.
              </h1>
           </motion.div>

           {/* SUBTEXT */}
           <motion.p 
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             transition={{ delay: 0.2 }}
             className="text-xs md:text-base lg:text-lg text-white font-medium max-w-xl leading-relaxed antialiased opacity-90"
           >
              Punjab Government Exams di Complete Preparation <br className="hidden md:block" />
              ik hi Center te, Latest Official Patterns de Naal.
           </motion.p>

           {/* ACTION HUB */}
           <motion.div 
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: 0.3 }}
             className="flex flex-wrap items-center gap-3 md:gap-4 pt-4 md:pt-8"
           >
              <Button asChild className="h-10 md:h-12 px-6 bg-[#F97316] hover:bg-orange-600 text-white font-black uppercase text-[9px] md:text-[10px] tracking-widest rounded-xl shadow-2xl transition-all active:scale-95 border-none gap-2">
                 <Link href="/mocks">
                    FREE MOCK <ArrowRight className="h-3.5 w-3.5" />
                 </Link>
              </Button>
              <Button asChild className="h-10 md:h-12 px-6 bg-white hover:bg-slate-50 text-[#0F172A] font-black uppercase text-[9px] md:text-[10px] tracking-widest rounded-xl transition-all active:scale-95 border-none gap-2 shadow-xl">
                 <Link href="/download">
                    <Download className="h-3.5 w-3.5" /> INSTALL APP
                 </Link>
              </Button>
              <Button asChild variant="outline" className="h-10 md:h-12 px-8 bg-white/5 border-white/10 text-white hover:bg-white/10 font-black uppercase text-[9px] md:text-[10px] tracking-widest rounded-xl transition-all active:scale-95">
                 <Link href="/exams">EXAMS</Link>
              </Button>
           </motion.div>

           {/* METRICS REGISTRY */}
           <motion.div 
             initial={{ opacity: 0, y: 30 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: 0.4 }}
             className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 pt-12 md:pt-16"
           >
              <MetricCard 
                icon={<BookOpen className="text-blue-400 h-4 w-4" />} 
                count="439+" 
                label="QUESTIONS" 
              />
              <MetricCard 
                icon={<ClipboardList className="text-orange-400 h-4 w-4" />} 
                count="8+" 
                label="MOCKS" 
              />
              <MetricCard 
                icon={<ShieldCheck className="text-blue-500 h-4 w-4" />} 
                count="92+" 
                label="EXAMS" 
              />
              <MetricCard 
                icon={<Users className="text-emerald-500 h-4 w-4" />} 
                count="5+" 
                label="ASPIRANTS" 
              />
           </motion.div>
        </div>
      </div>
    </section>
  );
}

function MetricCard({ icon, count, label }: { icon: React.ReactNode, count: string, label: string }) {
  return (
    <Card className="border-none bg-[#111827]/80 backdrop-blur-xl rounded-[1.5rem] md:rounded-[2rem] p-4 md:p-6 flex items-center gap-3 md:gap-4 border border-white/5 shadow-2xl group hover:bg-[#111827] transition-all">
       <div className="h-8 w-8 md:h-11 md:w-11 rounded-lg md:rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 shadow-inner group-hover:scale-110 transition-transform">
          {icon}
       </div>
       <div className="text-left space-y-0.5">
          <p className="text-lg md:text-2xl font-headline font-black text-white leading-none tracking-tight">{count}</p>
          <p className="text-[6px] md:text-[8px] font-black text-slate-500 uppercase tracking-[0.2em]">{label}</p>
       </div>
    </Card>
  )
}
