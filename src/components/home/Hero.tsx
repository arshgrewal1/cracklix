
'use client';

import React from "react";
import { motion } from "framer-motion";
import { Star, ArrowRight, BookOpen, ClipboardList, ShieldCheck, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * @fileOverview Official High-Fidelity Hero Center v43.0.
 * RESTORED: Metric boxes at the bottom to match the premium institutional layout.
 * FEATURES: Multi-layer background (Temple + Map), Precision typography, Glass-morphism cards.
 */

export default function Hero() {
  const templeImg = "https://i.ibb.co/LXgcLVVq/Gemini-Generated-Image-n1so6on1so6on1so.png";
  const punjabMap = "https://www.mapsofindia.com/maps/punjab/punjab-map.jpg";

  return (
    <section className="relative w-full min-h-[700px] lg:min-h-[850px] bg-[#0B1528] flex flex-col justify-center overflow-hidden font-body">
      
      {/* 1. BACKGROUND LAYERS */}
      <div className="absolute inset-0 z-0">
        {/* RIGHT SIDE: GOLDEN TEMPLE */}
        <div className="absolute top-0 right-0 w-full lg:w-[70%] h-full">
           <img 
              src={templeImg} 
              alt="Golden Temple" 
              className="w-full h-full object-cover object-center lg:object-right"
              referrerPolicy="no-referrer"
           />
           {/* FADE OVERLAY FOR BLENDING */}
           <div className="absolute inset-0 bg-gradient-to-r from-[#0B1528] via-[#0B1528]/85 to-transparent lg:block hidden" />
           <div className="absolute inset-0 bg-gradient-to-t from-[#0B1528] via-transparent to-transparent lg:hidden" />
        </div>

        {/* LEFT SIDE: PUNJAB MAP WATERMARK */}
        <div className="absolute left-[5%] top-1/2 -translate-y-1/2 w-full lg:w-1/2 h-full opacity-[0.04] pointer-events-none mix-blend-lighten">
           <img 
              src={punjabMap} 
              className="w-full h-full object-contain object-left scale-110" 
              alt="Punjab Map Watermark"
           />
        </div>
      </div>

      {/* 2. MAIN CONTENT HUB */}
      <div className="container mx-auto px-6 relative z-10 max-w-7xl pt-24 pb-20">
        <div className="max-w-4xl space-y-8 text-left">
          
           {/* BRAND BADGE */}
           <motion.div 
             initial={{ opacity: 0, y: 10 }}
             animate={{ opacity: 1, y: 0 }}
             className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 backdrop-blur-sm"
           >
              <Star className="h-3.5 w-3.5 text-[#F97316] fill-current" />
              <span className="text-[10px] md:text-[11px] font-black text-slate-300 uppercase tracking-widest">
                 #1 Punjab Exam Preparation Platform
              </span>
           </motion.div>

           {/* HEADLINES */}
           <motion.div 
             initial={{ opacity: 0, x: -20 }}
             animate={{ opacity: 1, x: 0 }}
             transition={{ delay: 0.1 }}
             className="space-y-0.5 md:space-y-1"
           >
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-headline font-black text-white leading-[1.05] tracking-tight uppercase">
                 Prepare Smarter.
              </h1>
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-headline font-black text-[#F97316] leading-[1.05] tracking-tight uppercase">
                 Score Higher.
              </h1>
           </motion.div>

           {/* SUBTEXT */}
           <motion.p 
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             transition={{ delay: 0.2 }}
             className="text-base md:text-xl lg:text-2xl text-slate-300 font-medium max-w-2xl leading-relaxed"
           >
              Punjab Government Exams di Complete Preparation <br className="hidden md:block" />
              ik hi Platform te.
           </motion.p>

           {/* ACTIONS */}
           <motion.div 
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: 0.3 }}
             className="flex flex-col sm:flex-row gap-4 pt-6"
           >
              <Button asChild className="h-14 md:h-16 px-10 bg-[#F97316] hover:bg-orange-600 text-white font-black uppercase text-[11px] md:text-xs tracking-[0.2em] rounded-xl shadow-3xl transition-all active:scale-95 border-none gap-3">
                 <Link href="/mocks">
                    Start Free Mock <ArrowRight className="h-4 w-4" />
                 </Link>
              </Button>
              <Button asChild variant="outline" className="h-14 md:h-16 px-10 border-white/30 bg-white/5 backdrop-blur-md text-white hover:bg-white/10 font-black uppercase text-[11px] md:text-xs tracking-[0.2em] rounded-xl transition-all active:scale-95">
                 <Link href="/exams">Explore Exams</Link>
              </Button>
           </motion.div>

           {/* 3. RESTORED METRIC GRID (Same as screenshot) */}
           <motion.div 
             initial={{ opacity: 0, y: 30 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: 0.4 }}
             className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8 pt-12 md:pt-20"
           >
              <HeroMetric icon={<BookOpen />} value="10,000+" label="QUESTIONS" />
              <HeroMetric icon={<ClipboardList />} value="500+" label="MOCK TESTS" />
              <HeroMetric icon={<ShieldCheck />} value="50+" label="STATE EXAMS" />
              <HeroMetric icon={<BarChart3 />} value="DETAILED" label="ANALYTICS" />
           </motion.div>
        </div>
      </div>
    </section>
  );
}

function HeroMetric({ icon, value, label }: { icon: React.ReactNode, value: string, label: string }) {
  return (
    <div className="bg-white/5 border border-white/10 backdrop-blur-md p-4 md:p-6 rounded-2xl md:rounded-3xl flex items-center gap-4 group hover:bg-white/10 transition-all shadow-xl">
       <div className="h-10 w-10 md:h-12 md:w-12 rounded-xl bg-[#F97316]/20 flex items-center justify-center text-[#F97316] shadow-inner group-hover:scale-110 transition-transform">
          {React.cloneElement(icon as React.ReactElement, { className: "h-5 w-5 md:h-6 md:w-6" })}
       </div>
       <div className="text-left">
          <p className="text-lg md:text-2xl font-headline font-black text-white leading-none tracking-tight">{value}</p>
          <p className="text-[7px] md:text-[9px] font-black text-slate-500 uppercase tracking-widest mt-1.5">{label}</p>
       </div>
    </div>
  );
}
