'use client';

import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShieldCheck, ArrowRight, Target, Sparkles, User } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * @fileOverview Redesigned Founder Node v7.0 (High Density).
 */

export default function MeetFounder() {
  const founderImg = "https://i.ibb.co/5hkxTtKS/Whats-App-Image-2026-05-28-at-10-31-36-AM.jpg";

  return (
    <section className="py-8 md:py-24 bg-slate-50/30 overflow-hidden border-t border-slate-100">
      <div className="container mx-auto px-4 md:px-6 max-w-7xl">
        <motion.div 
           initial={{ opacity: 0, y: 20 }}
           whileInView={{ opacity: 1, y: 0 }}
           viewport={{ once: true }}
           className="text-center space-y-1.5 md:space-y-4 mb-6 md:mb-16"
        >
           <div className="inline-flex items-center gap-2.5 px-3 py-1 rounded-full bg-blue-600/5 border border-blue-600/10 mb-1">
              <Sparkles className="h-3 w-3 text-blue-600 animate-pulse" />
              <span className="text-[9px] font-bold text-blue-600 tracking-tight uppercase">Platform Leadership</span>
           </div>
           <h2 className="text-2xl md:text-5xl font-extrabold text-[#0F172A] tracking-tight leading-none">
              Meet the Founder
           </h2>
           <p className="text-slate-500 font-medium text-[11px] md:text-lg max-w-xl mx-auto">
              Building Punjab's smartest preparation hub.
           </p>
        </motion.div>

        <div className="max-w-4xl mx-auto px-1">
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="bg-white rounded-[2rem] md:rounded-[3rem] overflow-hidden shadow-4xl border border-slate-100 flex flex-col md:flex-row items-center p-6 md:p-14 gap-8 md:gap-14 group hover:border-blue-600/20 transition-all duration-700"
          >
            <div className="relative shrink-0">
               <div className="relative h-28 w-28 md:h-52 md:w-52 rounded-full overflow-hidden border-[4px] md:border-[8px] border-slate-50 shadow-2xl bg-[#0B1528] ring-1 ring-slate-200">
                  <Image 
                    src={founderImg} 
                    alt="Arsh Grewal" 
                    fill
                    className="object-cover grayscale group-hover:grayscale-0 transition-all scale-105 group-hover:scale-100 duration-1000"
                    referrerPolicy="no-referrer"
                  />
               </div>
               <div className="absolute -bottom-1 -right-1 h-9 w-9 md:h-14 md:w-14 bg-emerald-500 rounded-xl border-[3px] border-white flex items-center justify-center text-white shadow-xl">
                  <ShieldCheck className="h-4 w-4 md:h-7 md:w-7" />
               </div>
            </div>

            <div className="flex-1 space-y-4 md:space-y-6 text-center md:text-left">
               <div className="space-y-2">
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                     <Badge className="bg-[#0F172A] text-white border-none px-2.5 py-0.5 rounded-md font-bold text-[8px] md:text-[9px] uppercase tracking-tight">Founder</Badge>
                  </div>
                  <h3 className="text-xl md:text-4xl font-extrabold text-[#0F172A] tracking-tight leading-none">
                     Arsh Grewal
                  </h3>
               </div>
               
               <p className="text-[11px] md:text-lg text-slate-500 font-medium leading-relaxed antialiased">
                  Eliminating preparation barriers for every student in Punjab through high-fidelity bilingual resources.
               </p>

               <div className="pt-2 md:pt-4 border-t border-slate-100">
                  <Button asChild className="w-full sm:w-auto h-11 md:h-14 px-8 bg-[#0F172A] hover:bg-black text-white font-bold text-[10px] md:text-xs tracking-tight rounded-xl shadow-xl transition-all active:scale-95">
                     <Link href="/about" className="flex items-center gap-2">
                        Read Story <ArrowRight className="h-4 w-4" />
                     </Link>
                  </Button>
               </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
