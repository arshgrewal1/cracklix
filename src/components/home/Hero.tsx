'use client';

import React from "react";
import { motion } from "framer-motion";
import { Star, ArrowRight, BookOpen, ClipboardList, ShieldCheck, Users, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * @fileOverview Final Screenshot-Matched Hero Hub v50.0.
 * UPDATED: Exact replica of metrics (439+, 8+, 92+, 5+), headings, and buttons from the image.
 */

export default function Hero() {
  const templeImg = "https://i.ibb.co/LXgcLVVq/Gemini-Generated-Image-n1so6on1so6on1so.png";

  return (
    <section className="relative w-full min-h-[800px] lg:min-h-[900px] bg-[#0B1528] flex flex-col justify-center overflow-hidden font-body">
      
      {/* 1. BACKGROUND LAYERS */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 right-0 w-full lg:w-[75%] h-full">
           <img 
              src={templeImg} 
              alt="Golden Temple" 
              className="w-full h-full object-cover object-center lg:object-right"
              referrerPolicy="no-referrer"
           />
           <div className="absolute inset-0 bg-gradient-to-r from-[#0B1528] via-[#0B1528]/80 to-transparent lg:block hidden" />
           <div className="absolute inset-0 bg-gradient-to-t from-[#0B1528] via-transparent to-transparent lg:hidden" />
        </div>
      </div>

      {/* 2. MAIN CONTENT HUB */}
      <div className="container mx-auto px-6 relative z-10 max-w-7xl pt-32 pb-20">
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

           {/* HEADLINES */}
           <motion.div 
             initial={{ opacity: 0, x: -20 }}
             animate={{ opacity: 1, x: 0 }}
             transition={{ delay: 0.1 }}
             className="space-y-1"
           >
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-headline font-black text-white leading-[1.05] tracking-tight uppercase">
                 PREPARE SMARTER.
              </h1>
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-headline font-black text-[#F97316] leading-[1.05] tracking-tight uppercase">
                 SCORE HIGHER.
              </h1>
           </motion.div>

           {/* SUBTEXT */}
           <motion.p 
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             transition={{ delay: 0.2 }}
             className="text-base md:text-xl lg:text-2xl text-slate-300 font-medium max-w-2xl leading-relaxed"
           >
              Punjab Government Exams di Complete Preparation <br />
              ik hi Center te, Latest Official Patterns de Naal.
           </motion.p>

           {/* ACTIONS */}
           <motion.div 
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: 0.3 }}
             className="flex flex-col sm:flex-row gap-4 pt-6"
           >
              <Button asChild className="h-16 px-10 bg-[#F97316] hover:bg-orange-600 text-white font-black uppercase text-[11px] md:text-xs tracking-[0.2em] rounded-xl shadow-3xl transition-all active:scale-95 border-none gap-3">
                 <Link href="/mocks">
                    FREE MOCK <ArrowRight className="h-4 w-4" />
                 </Link>
              </Button>
              <Button asChild className="h-16 px-10 bg-white hover:bg-slate-50 text-[#0F172A] font-black uppercase text-[11px] md:text-xs tracking-[0.2em] rounded-xl transition-all active:scale-95 border-none gap-3">
                 <Link href="/pwa-install">
                    <Download className="h-4 w-4" /> INSTALL APP
                 </Link>
              </Button>
              <Button asChild variant="outline" className="h-16 px-10 border-white/20 bg-white/5 backdrop-blur-md text-white hover:bg-white/10 font-black uppercase text-[11px] md:text-xs tracking-[0.2em] rounded-xl transition-all active:scale-95">
                 <Link href="/exams">EXAMS</Link>
              </Button>
           </motion.div>

           {/* 3. METRIC GRID (EXACT COUNTS) */}
           <motion.div 
             initial={{ opacity: 0, y: 30 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: 0.4 }}
             className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 pt-16 md:pt-24"
           >
              <HeroMetric icon={<BookOpen />} value="439+" label="QUESTIONS" />
              <HeroMetric icon={<ClipboardList />} value="8+" label="MOCKS" />
              <HeroMetric icon={<ShieldCheck />} value="92+" label="EXAMS" />
              <HeroMetric icon={<Users />} value="5+" label="ASPIRANTS" />
           </motion.div>
        </div>
      </div>
    </section>
  );
}

function HeroMetric({ icon, value, label }: { icon: React.ReactNode, value: string, label: string }) {
  return (
    <div className="bg-[#111827]/80 border border-white/10 backdrop-blur-md p-6 md:p-8 rounded-[1.5rem] md:rounded-[2.5rem] flex flex-col gap-6 group hover:border-primary/30 transition-all shadow-2xl h-full">
       <div className="h-10 w-10 md:h-12 md:w-12 rounded-xl bg-white/5 flex items-center justify-center text-[#1E5EFF] border border-white/5 shadow-inner group-hover:scale-110 transition-transform">
          {React.cloneElement(icon as React.ReactElement, { className: "h-5 w-5 md:h-6 md:w-6" })}
       </div>
       <div className="space-y-1 text-left">
          <p className="text-3xl md:text-5xl font-headline font-black text-white leading-none tracking-tight">{value}</p>
          <p className="text-[8px] md:text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mt-2">{label}</p>
       </div>
    </div>
  );
}
