'use client';

import React from "react";
import { motion } from "framer-motion";
import { Star, ArrowRight, BookOpen, ClipboardList, ShieldCheck, Users, Download, LayoutGrid } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * @fileOverview Final Screenshot-Matched Hero Hub v53.0.
 * UPDATED: Precise metrics (439+, 8+, 92+, 5+) and increased typography size.
 * UPDATED: Mobile background shrunken to 200px.
 */

export default function Hero() {
  const templeImg = "https://i.ibb.co/LXgcLVVq/Gemini-Generated-Image-n1so6on1so6on1so.png";

  return (
    <section className="relative w-full min-h-[850px] lg:min-h-[950px] bg-[#0B0F19] flex flex-col justify-center overflow-hidden font-body text-left">
      
      {/* 1. BACKGROUND LAYERS */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 right-0 w-full lg:w-[75%] h-[200px] lg:h-full">
           <img 
              src={templeImg} 
              alt="Golden Temple" 
              className="w-full h-full object-cover object-center lg:object-right"
              referrerPolicy="no-referrer"
           />
           {/* Cinematic Overlays */}
           <div className="absolute inset-0 bg-gradient-to-r from-[#0B0F19] via-[#0B0F19]/80 to-transparent lg:block hidden" />
           <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F19] via-transparent to-transparent lg:hidden" />
        </div>
      </div>

      {/* 2. MAIN CONTENT HUB */}
      <div className="container mx-auto px-6 relative z-10 max-w-7xl pt-40 pb-20">
        <div className="max-w-4xl space-y-10 text-left">
          
           {/* BRAND BADGE */}
           <motion.div 
             initial={{ opacity: 0, y: 10 }}
             animate={{ opacity: 1, y: 0 }}
             className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md"
           >
              <Star className="h-3.5 w-3.5 text-[#F97316] fill-current" />
              <span className="text-[10px] md:text-[11px] font-black text-white uppercase tracking-widest">
                 #1 PUNJAB PREP PLATFORM
              </span>
           </motion.div>

           {/* HEADLINES - FULL SIZE */}
           <motion.div 
             initial={{ opacity: 0, x: -20 }}
             animate={{ opacity: 1, x: 0 }}
             transition={{ delay: 0.1 }}
             className="space-y-2"
           >
              <h1 className="text-5xl md:text-8xl lg:text-[110px] font-headline font-black text-white leading-[0.95] tracking-tighter uppercase">
                 PREPARE SMARTER.
              </h1>
              <h1 className="text-5xl md:text-8xl lg:text-[110px] font-headline font-black text-[#F97316] leading-[0.95] tracking-tighter uppercase">
                 SCORE HIGHER.
              </h1>
           </motion.div>

           {/* SUBTEXT */}
           <motion.p 
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             transition={{ delay: 0.2 }}
             className="text-base md:text-xl lg:text-2xl text-slate-300 font-medium max-w-3xl leading-relaxed antialiased"
           >
              Punjab Government Exams di Complete Preparation <br className="hidden md:block" />
              ik hi Center te, Latest Official Patterns de Naal.
           </motion.p>

           {/* ACTIONS */}
           <motion.div 
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: 0.3 }}
             className="flex flex-col sm:flex-row gap-4 pt-8"
           >
              <Button asChild className="h-16 px-10 bg-[#F97316] hover:bg-orange-600 text-white font-black uppercase text-[11px] md:text-xs tracking-[0.2em] rounded-2xl shadow-3xl transition-all active:scale-95 border-none gap-3">
                 <Link href="/mocks">
                    FREE MOCK <ArrowRight className="h-4 w-4" />
                 </Link>
              </Button>
              <Button asChild className="h-16 px-10 bg-white hover:bg-slate-50 text-[#0F172A] font-black uppercase text-[11px] md:text-xs tracking-[0.2em] rounded-2xl transition-all active:scale-95 border-none gap-3 shadow-xl">
                 <Link href="/pwa-install">
                    <Download className="h-4 w-4" /> INSTALL APP
                 </Link>
              </Button>
              <Button asChild variant="outline" className="h-16 px-10 border-white/20 bg-white/5 backdrop-blur-md text-white hover:bg-white/10 font-black uppercase text-[11px] md:text-xs tracking-[0.2em] rounded-2xl transition-all active:scale-95">
                 <Link href="/exams">EXAMS</Link>
              </Button>
           </motion.div>

           {/* 3. METRIC GRID - MATCHED TO SCREENSHOT */}
           <motion.div 
             initial={{ opacity: 0, y: 30 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: 0.4 }}
             className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 pt-24"
           >
              <HeroMetric icon={<BookOpen />} value="439+" label="QUESTIONS" color="text-blue-400" />
              <HeroMetric icon={<ClipboardList />} value="8+" label="MOCKS" color="text-orange-400" />
              <HeroMetric icon={<ShieldCheck />} value="92+" label="EXAMS" color="text-blue-500" />
              <HeroMetric icon={<Users />} value="5+" label="ASPIRANTS" color="text-emerald-500" />
           </motion.div>
        </div>
      </div>
    </section>
  );
}

function HeroMetric({ icon, value, label, color }: { icon: React.ReactNode, value: string, label: string, color: string }) {
  return (
    <div className="bg-[#111827]/80 border border-white/10 backdrop-blur-xl p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] flex flex-col gap-6 group hover:border-primary/30 transition-all shadow-5xl h-full">
       <div className={cn("h-10 w-10 md:h-12 md:w-12 rounded-xl bg-white/5 flex items-center justify-center border border-white/5 shadow-inner group-hover:scale-110 transition-transform", color)}>
          {React.cloneElement(icon as React.ReactElement, { className: "h-5 w-5 md:h-6 md:w-6" })}
       </div>
       <div className="space-y-1 text-left">
          <p className="text-3xl md:text-5xl font-headline font-black text-white leading-none tracking-tight">{value}</p>
          <p className="text-[8px] md:text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mt-2">{label}</p>
       </div>
    </div>
  );
}
