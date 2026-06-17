'use client';

import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShieldCheck, ArrowRight, Target, Sparkles, User } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * @fileOverview Standalone Founder Leadership Node v4.2.
 * FIXED: Updated duration class to prevent ambiguous utility warnings.
 */

export default function MeetFounder() {
  const founderImg = "https://i.ibb.co/5hkxTtKS/Whats-App-Image-2026-05-28-at-10-31-36-AM.jpg";

  return (
    <section className="py-16 md:py-32 bg-slate-50/30 overflow-hidden border-t border-slate-100">
      <div className="container mx-auto px-4 md:px-6 max-w-7xl">
        <motion.div 
           initial={{ opacity: 0, y: 20 }}
           whileInView={{ opacity: 1, y: 0 }}
           viewport={{ once: true }}
           className="text-center space-y-4 mb-12 md:mb-20"
        >
           <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-blue-600/5 border border-blue-600/10 mb-2">
              <Sparkles className="h-4 w-4 text-blue-600 animate-pulse" />
              <span className="text-[10px] font-bold text-blue-600 tracking-tight">Platform Leadership</span>
           </div>
           <h2 className="text-3xl md:text-6xl font-extrabold text-[#0F172A] tracking-tight leading-none">
              Meet the <span className="text-blue-600">Founder</span>
           </h2>
           <p className="text-slate-500 font-medium text-sm md:text-lg max-w-2xl mx-auto">
              Dedicated to building Punjab's smartest and most reliable preparation hub.
           </p>
        </motion.div>

        <div className="max-w-5xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="bg-white rounded-[3rem] md:rounded-[4rem] overflow-hidden shadow-5xl border border-slate-100 flex flex-col md:flex-row items-center p-8 md:p-14 lg:p-20 gap-10 md:gap-16 group hover:border-blue-600/20 transition-all duration-700"
          >
            {/* IMAGE HUB */}
            <div className="relative shrink-0">
               <div className="absolute -inset-6 bg-gradient-to-tr from-blue-600/20 to-transparent rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition duration-1000" />
               <div className="relative h-44 w-44 sm:h-56 sm:w-56 md:h-64 md:w-64 lg:h-72 lg:w-72 rounded-full overflow-hidden border-[6px] md:border-[10px] border-slate-50 shadow-3xl bg-[#0B1528] ring-1 ring-slate-200">
                  <Image 
                    src={founderImg} 
                    alt="Arsh Grewal" 
                    fill
                    className="object-cover grayscale group-hover:grayscale-0 transition-all scale-105 group-hover:scale-100 duration-1000"
                    referrerPolicy="no-referrer"
                  />
               </div>
               <div className="absolute -bottom-2 -right-2 h-12 w-12 md:h-16 md:w-16 bg-emerald-500 rounded-2xl border-4 border-white flex items-center justify-center text-white shadow-2xl">
                  <ShieldCheck className="h-6 w-6 md:h-8 md:w-8" />
               </div>
            </div>

            {/* CONTENT HUB */}
            <div className="flex-1 space-y-6 md:space-y-8 text-center md:text-left">
               <div className="space-y-4">
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                     <Badge className="bg-[#0F172A] text-white border-none px-4 py-1.5 rounded-lg font-bold text-[9px] md:text-[10px] tracking-tight shadow-xl">Founder</Badge>
                     <Badge className="bg-blue-600 text-white border-none px-4 py-1.5 rounded-lg font-bold text-[9px] md:text-[10px] tracking-tight shadow-xl">Lead Developer</Badge>
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-3xl md:text-5xl font-extrabold text-[#0F172A] tracking-tight leading-none">
                       Arsh Grewal
                    </h3>
                    <p className="text-blue-600 font-bold text-[11px] md:text-sm flex items-center justify-center md:justify-start gap-2">
                       <Target className="h-3 w-3" /> Platform Architect
                    </p>
                  </div>
               </div>
               
               <div className="relative">
                  <p className="text-sm md:text-xl text-slate-500 font-medium leading-relaxed antialiased">
                     Building <span className="text-[#0F172A] font-bold">Cracklix</span> with a vision to eliminate preparation barriers for every student in Punjab. We focus on institutional accuracy, bilingual support, and AI-driven insights to ensure your success.
                  </p>
               </div>

               <div className="pt-8 border-t border-slate-100">
                  <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-6">
                     <Button asChild className="w-full sm:w-auto h-14 md:h-16 px-10 bg-[#0F172A] hover:bg-black text-white font-bold text-sm tracking-tight rounded-2xl shadow-3xl border-none transition-all active:scale-95 group/btn">
                        <Link href="/about" className="flex items-center gap-3">
                           The Full Story <ArrowRight className="h-4 w-4 text-blue-600 group-hover/btn:translate-x-1 transition-transform" />
                        </Link>
                     </Button>
                     <div className="text-left hidden sm:block">
                        <p className="text-[10px] font-bold text-[#0F172A] leading-none">CRACKLIX HQ</p>
                        <p className="text-[9px] font-semibold text-slate-400 mt-1">Institutional Integrity First</p>
                     </div>
                  </div>
               </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}