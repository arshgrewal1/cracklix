'use client';

import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShieldCheck, ArrowRight, Target, Sparkles, User } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * @fileOverview Standalone Founder Leadership Node v6.0.
 * TYPOGRAPHY: Title Case applied to heading.
 */

export default function MeetFounder() {
  const founderImg = "https://i.ibb.co/5hkxTtKS/Whats-App-Image-2026-05-28-at-10-31-36-AM.jpg";

  return (
    <section className="py-8 md:py-32 bg-slate-50/30 overflow-hidden border-t border-slate-100">
      <div className="container mx-auto px-4 md:px-6 max-w-7xl">
        <motion.div 
           initial={{ opacity: 0, y: 20 }}
           whileInView={{ opacity: 1, y: 0 }}
           viewport={{ once: true }}
           className="text-center space-y-2 md:space-y-4 mb-8 md:mb-20"
        >
           <div className="inline-flex items-center gap-3 px-3 py-1 rounded-full bg-blue-600/5 border border-blue-600/10 mb-1">
              <Sparkles className="h-3 w-3 text-blue-600 animate-pulse" />
              <span className="text-[9px] font-bold text-blue-600 tracking-tight uppercase">Platform Leadership</span>
           </div>
           <h2 className="text-2xl md:text-6xl font-extrabold text-[#0F172A] tracking-tight leading-none">
              Meet the <span className="text-blue-600">Founder</span>
           </h2>
           <p className="text-slate-500 font-medium text-[11px] md:text-lg max-w-xl mx-auto">
              Dedicated to building Punjab's smartest preparation hub.
           </p>
        </motion.div>

        <div className="max-w-5xl mx-auto px-1">
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="bg-white rounded-[2rem] md:rounded-[4rem] overflow-hidden shadow-4xl border border-slate-100 flex flex-col md:flex-row items-center p-6 md:p-20 gap-6 md:gap-16 group hover:border-blue-600/20 transition-all duration-700"
          >
            {/* IMAGE HUB - REDUCED SIZE */}
            <div className="relative shrink-0">
               <div className="absolute -inset-4 bg-gradient-to-tr from-blue-600/20 to-transparent rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition duration-1000" />
               <div className="relative h-32 w-32 sm:h-56 md:h-64 lg:h-72 rounded-full overflow-hidden border-[4px] md:border-[10px] border-slate-50 shadow-2xl bg-[#0B1528] ring-1 ring-slate-200">
                  <Image 
                    src={founderImg} 
                    alt="Arsh Grewal" 
                    fill
                    className="object-cover grayscale group-hover:grayscale-0 transition-all scale-105 group-hover:scale-100 duration-1000"
                    referrerPolicy="no-referrer"
                  />
               </div>
               <div className="absolute -bottom-1 -right-1 h-10 w-10 md:h-16 md:w-16 bg-emerald-500 rounded-xl border-[4px] border-white flex items-center justify-center text-white shadow-xl">
                  <ShieldCheck className="h-5 w-5 md:h-8 md:w-8" />
               </div>
            </div>

            {/* CONTENT HUB - TIGHTENED */}
            <div className="flex-1 space-y-4 md:space-y-8 text-center md:text-left">
               <div className="space-y-2 md:space-y-4">
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                     <Badge className="bg-[#0F172A] text-white border-none px-3 py-1 rounded-md font-bold text-[8px] md:text-[10px] tracking-tight shadow-lg uppercase">Founder</Badge>
                     <Badge className="bg-blue-600 text-white border-none px-3 py-1 rounded-md font-bold text-[8px] md:text-[10px] tracking-tight shadow-lg uppercase">Lead Dev</Badge>
                  </div>
                  <div className="space-y-0.5">
                    <h3 className="text-2xl md:text-5xl font-extrabold text-[#0F172A] tracking-tight leading-none">
                       Arsh Grewal
                    </h3>
                    <p className="text-blue-600 font-bold text-[10px] md:text-sm flex items-center justify-center md:justify-start gap-1.5 uppercase">
                       <Target className="h-3 w-3" /> Platform Architect
                    </p>
                  </div>
               </div>
               
               <div className="relative">
                  <p className="text-[12px] md:text-xl text-slate-500 font-medium leading-relaxed antialiased">
                     Building <span className="text-[#0F172A] font-bold">Cracklix</span> to eliminate preparation barriers for every student in Punjab. We focus on accuracy and bilingual support.
                  </p>
               </div>

               <div className="pt-4 md:pt-8 border-t border-slate-100">
                  <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-4">
                     <Button asChild className="w-full sm:w-auto h-12 md:h-16 px-8 bg-[#0F172A] hover:bg-black text-white font-bold text-xs tracking-tight rounded-xl md:rounded-2xl shadow-xl transition-all active:scale-95 group/btn">
                        <Link href="/about" className="flex items-center gap-2">
                           Read The Story <ArrowRight className="h-4 w-4 text-blue-600 group-hover/btn:translate-x-1 transition-transform" />
                        </Link>
                     </Button>
                  </div>
               </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
