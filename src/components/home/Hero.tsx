'use client';

import React from "react";
import { motion } from "framer-motion";
import { Star, ArrowRight, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * @fileOverview Final Screenshot-Matched Hero Hub v62.0.
 * UPDATED: Moved whole content block up (pt-16 md:pt-24).
 * UPDATED: Shrunken background image size on desktop (w-[60%]).
 * FIXED: Added the brand bubble "N" to the primary button.
 */

export default function Hero() {
  const templeImg = "https://i.ibb.co/LXgcLVVq/Gemini-Generated-Image-n1so6on1so6on1so.png";

  return (
    <section className="relative w-full min-h-[600px] lg:min-h-[750px] bg-[#0B0F19] flex flex-col justify-start overflow-hidden font-body text-left">
      
      {/* 1. BACKGROUND LAYERS - PRECISE POSITIONING */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 right-0 w-full lg:w-[60%] h-[200px] lg:h-full lg:top-0 pointer-events-none">
           <img 
              src={templeImg} 
              alt="Golden Temple" 
              className="w-full h-full object-cover object-bottom lg:object-right-top opacity-80"
              referrerPolicy="no-referrer"
           />
           {/* Cinematic Overlays */}
           <div className="absolute inset-0 bg-gradient-to-r from-[#0B0F19] via-[#0B0F19]/80 to-transparent lg:block hidden" />
           <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F19] via-transparent to-transparent lg:hidden" />
        </div>
      </div>

      {/* 2. MAIN CONTENT HUB - REDUCED PADDING TO MOVE CONTENT UP */}
      <div className="container mx-auto px-6 relative z-10 max-w-7xl pt-16 md:pt-24 pb-20">
        <div className="max-w-4xl space-y-6 md:space-y-8 text-left">
          
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
                 #1 PUNJAB PREP PLATFORM
              </span>
           </motion.div>

           {/* HEADLINES - SHRUNKEN BY HALF */}
           <motion.div 
             initial={{ opacity: 0, x: -20 }}
             animate={{ opacity: 1, x: 0 }}
             transition={{ delay: 0.1 }}
             className="space-y-1"
           >
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-headline font-black text-white leading-[0.9] tracking-tighter uppercase">
                 PREPARE SMARTER.
              </h1>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-headline font-black text-[#F97316] leading-[0.9] tracking-tighter uppercase">
                 SCORE HIGHER.
              </h1>
           </motion.div>

           {/* SUBTEXT */}
           <motion.p 
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             transition={{ delay: 0.2 }}
             className="text-sm md:text-lg lg:text-xl text-white font-medium max-w-2xl leading-relaxed antialiased opacity-90"
           >
              Punjab Government Exams di Complete Preparation <br className="hidden md:block" />
              ik hi Center te, Latest Official Patterns de Naal.
           </motion.p>

           {/* ACTIONS - SCREENSHOT MATCHED WITH BRAND BUBBLE */}
           <motion.div 
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: 0.3 }}
             className="flex flex-col sm:flex-row gap-3 pt-6 md:pt-10"
           >
              <Button asChild className="h-12 md:h-14 pl-1 pr-8 bg-[#F97316] hover:bg-orange-600 text-white font-black uppercase text-[10px] md:text-[11px] tracking-[0.2em] rounded-xl shadow-3xl transition-all active:scale-95 border-none gap-4">
                 <Link href="/mocks" className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-black/30 flex items-center justify-center shrink-0">
                       <span className="text-white text-[11px] font-black">N</span>
                    </div>
                    FREE MOCK <ArrowRight className="h-4 w-4 ml-1" />
                 </Link>
              </Button>
              <Button asChild className="h-12 md:h-14 px-8 bg-white hover:bg-slate-50 text-[#0F172A] font-black uppercase text-[10px] md:text-[11px] tracking-[0.2em] rounded-xl transition-all active:scale-95 border-none gap-3 shadow-xl">
                 <Link href="/pwa-install">
                    <Download className="h-4 w-4" /> INSTALL APP
                 </Link>
              </Button>
              <Button asChild variant="outline" className="h-12 md:h-14 px-8 border-white/20 bg-white/5 backdrop-blur-md text-white hover:bg-white/10 font-black uppercase text-[10px] md:text-[11px] tracking-[0.2em] rounded-xl transition-all active:scale-95">
                 <Link href="/exams">EXAMS</Link>
              </Button>
           </motion.div>
        </div>
      </div>
    </section>
  );
}
