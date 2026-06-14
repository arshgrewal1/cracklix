'use client';

import React from "react";
import { motion } from "framer-motion";
import { Star, BookOpen, ClipboardList, ShieldCheck, BarChart3, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * @fileOverview Official High-Fidelity Hero Center v40.0.
 * UPDATED: Precise replica of the user-provided screenshot.
 * FEATURES: Multi-layer background (Temple + Map), High-density metrics, and exact typography.
 */

export default function Hero() {
  const templeImg = "https://i.ibb.co/LXgcLVVq/Gemini-Generated-Image-n1so6on1so6on1so.png";
  const punjabMap = "https://www.mapsofindia.com/maps/punjab/punjab-map.jpg";

  return (
    <section className="relative w-full min-h-[600px] lg:min-h-[750px] bg-[#0B1528] flex flex-col justify-center overflow-hidden font-body">
      
      {/* 1. BACKGROUND LAYERS */}
      <div className="absolute inset-0 z-0">
        {/* RIGHT SIDE: GOLDEN TEMPLE */}
        <div className="absolute top-0 right-0 w-full lg:w-[65%] h-full opacity-60 lg:opacity-100">
           <img 
              src={templeImg} 
              alt="Golden Temple" 
              className="w-full h-full object-cover object-center lg:object-right"
              referrerPolicy="no-referrer"
           />
           {/* FADE OVERLAY FOR BLENDING */}
           <div className="absolute inset-0 bg-gradient-to-r from-[#0B1528] via-[#0B1528]/80 to-transparent lg:block hidden" />
           <div className="absolute inset-0 bg-gradient-to-t from-[#0B1528] via-transparent to-transparent lg:hidden" />
        </div>

        {/* LEFT SIDE: PUNJAB MAP WATERMARK */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full lg:w-1/2 h-4/5 opacity-[0.04] pointer-events-none mix-blend-lighten">
           <img 
              src={punjabMap} 
              className="w-full h-full object-contain object-left" 
              alt="Punjab Map Watermark"
           />
        </div>
      </div>

      {/* 2. MAIN CONTENT HUB */}
      <div className="container mx-auto px-6 relative z-10 max-w-7xl pt-20 pb-12 lg:py-0">
        <div className="max-w-3xl space-y-6 md:space-y-8 text-left">
          
           {/* BRAND BADGE */}
           <motion.div 
             initial={{ opacity: 0, y: 10 }}
             animate={{ opacity: 1, y: 0 }}
             className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 backdrop-blur-sm"
           >
              <Star className="h-3.5 w-3.5 text-[#F97316] fill-current" />
              <span className="text-[10px] md:text-xs font-black text-slate-300 uppercase tracking-widest">
                 #1 Punjab Exam Preparation Platform
              </span>
           </motion.div>

           {/* HEADLINES */}
           <motion.div 
             initial={{ opacity: 0, x: -20 }}
             animate={{ opacity: 1, x: 0 }}
             transition={{ delay: 0.1 }}
             className="space-y-1 md:space-y-2"
           >
              <h1 className="text-4xl md:text-7xl lg:text-8xl font-headline font-black text-white leading-tight tracking-tight uppercase">
                 Prepare Smarter.
              </h1>
              <h1 className="text-4xl md:text-7xl lg:text-8xl font-headline font-black text-[#F97316] leading-tight tracking-tight uppercase">
                 Score Higher.
              </h1>
           </motion.div>

           {/* SUBTEXT (PUNJABI) */}
           <motion.p 
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             transition={{ delay: 0.2 }}
             className="text-lg md:text-2xl text-slate-300 font-medium max-w-xl leading-relaxed"
           >
              Punjab Government Exams di Complete Preparation <br className="hidden md:block" />
              ik hi Platform te.
           </motion.p>

           {/* ACTIONS */}
           <motion.div 
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: 0.3 }}
             className="flex flex-col sm:flex-row gap-4 pt-4"
           >
              <Button asChild className="h-14 md:h-16 px-8 md:px-10 bg-[#F97316] hover:bg-orange-600 text-white font-black uppercase text-[11px] md:text-xs tracking-[0.2em] rounded-xl shadow-2xl transition-all active:scale-95 border-none gap-3">
                 <Link href="/mocks">
                    Start Free Mock <ArrowRight className="h-4 w-4" />
                 </Link>
              </Button>
              <Button asChild variant="outline" className="h-14 md:h-16 px-8 md:px-10 border-white/20 bg-white/5 backdrop-blur-md text-white hover:bg-white/10 font-black uppercase text-[11px] md:text-xs tracking-[0.2em] rounded-xl transition-all active:scale-95">
                 <Link href="/exams">Explore Exams</Link>
              </Button>
           </motion.div>
        </div>

        {/* 3. METRIC CARDS GRID (BOTTOM) */}
        <div className="mt-20 md:mt-32 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
           <MetricCard 
             icon={<BookOpen className="text-blue-400" />} 
             value="10,000+" 
             label="Practice Questions" 
           />
           <MetricCard 
             icon={<ClipboardList className="text-[#F97316]" />} 
             value="500+" 
             label="Mock Tests" 
           />
           <MetricCard 
             icon={<ShieldCheck className="text-emerald-400" />} 
             value="50+" 
             label="Exams Covered" 
           />
           <MetricCard 
             icon={<BarChart3 className="text-indigo-400" />} 
             value="Detailed" 
             label="Analytics" 
           />
        </div>
      </div>
    </section>
  );
}

function MetricCard({ icon, value, label }: { icon: React.ReactNode, value: string, label: string }) {
  return (
    <motion.div 
       whileHover={{ y: -5 }}
       className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 md:p-6 flex items-center gap-5 shadow-2xl group transition-all hover:bg-white/10"
    >
       <div className="h-12 w-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 shadow-inner transition-transform group-hover:scale-110">
          {React.cloneElement(icon as React.ReactElement, { className: "h-6 w-6" })}
       </div>
       <div className="text-left space-y-0.5">
          <p className="text-xl md:text-2xl font-headline font-black text-white leading-none">{value}</p>
          <p className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</p>
       </div>
    </motion.div>
  );
}

