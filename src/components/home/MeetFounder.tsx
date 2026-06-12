
'use client';

import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Code, ArrowRight, Target, Sparkles } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * @fileOverview Official Founder & Lead Developer Section v2.5.
 * FIXED: Normalized name typography to prevent vertical stacking and refined container scaling.
 */

export default function MeetFounder() {
  const founderImg = "https://i.ibb.co/5hkxTtKS/Whats-App-Image-2026-05-28-at-10-31-36-AM.jpg";

  return (
    <section className="py-12 md:py-24 bg-white overflow-hidden border-t border-slate-50">
      <div className="container mx-auto px-4 md:px-6 max-w-7xl text-center">
        <motion.div 
           initial={{ opacity: 0, y: 20 }}
           whileInView={{ opacity: 1, y: 0 }}
           viewport={{ once: true }}
           className="space-y-3 mb-8 md:mb-12"
        >
           <div className="flex flex-col items-center justify-center gap-2">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 md:h-5 md:w-5 text-primary animate-pulse" />
                <h2 className="text-xl sm:text-4xl md:text-5xl font-headline font-black uppercase text-[#0F172A] tracking-tight">
                   Meet the <span className="text-primary">Founder</span>
                </h2>
              </div>
           </div>
           <div className="h-1 w-12 md:h-1.5 md:w-20 bg-primary mx-auto rounded-full" />
        </motion.div>

        <div className="max-w-5xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="bg-slate-50/50 rounded-[2.5rem] md:rounded-[4rem] overflow-hidden shadow-4xl border border-slate-100 flex flex-col md:flex-row items-center p-8 md:p-16 gap-10 md:gap-16 group hover:shadow-5xl transition-all duration-700"
          >
            {/* PROFILE IMAGE HUB */}
            <div className="relative shrink-0">
               <div className="absolute -inset-4 bg-gradient-to-tr from-primary to-orange-400 rounded-full blur opacity-10 group-hover:opacity-20 transition duration-1000"></div>
               <div className="relative h-40 w-40 sm:h-56 sm:w-56 md:h-72 md:w-72 rounded-full overflow-hidden border-[4px] md:border-[8px] border-white shadow-2xl bg-[#0B1528] ring-1 ring-slate-200">
                  <img 
                    src={founderImg} 
                    alt="Arsh Grewal" 
                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all scale-105 group-hover:scale-100"
                    style={{ transitionDuration: '2000ms' }}
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                       (e.target as HTMLImageElement).src = "https://picsum.photos/seed/arsh/400/400";
                    }}
                  />
               </div>
               <div className="absolute -bottom-1 -right-1 md:-bottom-2 md:-right-2 h-10 w-10 md:h-16 md:w-16 bg-emerald-500 rounded-xl md:rounded-2xl border-4 border-white flex items-center justify-center text-white shadow-xl">
                  <ShieldCheck className="h-5 w-5 md:h-8 md:w-8" />
               </div>
            </div>

            {/* BIO HUB */}
            <div className="flex-1 space-y-4 md:space-y-6 text-center md:text-left min-w-0">
               <div className="space-y-3 md:space-y-4">
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                     <Badge className="bg-primary text-white border-none px-3 py-1 rounded-md font-black uppercase text-[8px] md:text-[10px] tracking-widest shadow-lg">Founder</Badge>
                     <Badge className="bg-[#0F172A] text-white border-none px-3 py-1 rounded-md font-black uppercase text-[8px] md:text-[10px] tracking-widest shadow-lg">Lead Developer</Badge>
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-3xl sm:text-4xl md:text-5xl font-headline font-black text-[#0F172A] uppercase leading-none tracking-tight break-normal md:whitespace-nowrap">
                       Arsh Grewal
                    </h3>
                    <p className="text-primary font-black uppercase tracking-[0.2em] md:tracking-[0.4em] text-[8px] md:text-xs flex items-center justify-center md:justify-start gap-2">
                       <Target className="h-3 w-3" /> Platform Designer
                    </p>
                  </div>
               </div>
               
               <div className="relative">
                  <div className="absolute -left-6 top-0 bottom-0 w-1 bg-primary/20 rounded-full hidden md:block" />
                  <p className="text-sm md:text-lg text-slate-500 font-medium leading-relaxed antialiased">
                     Founder and Lead Developer of <span className="text-[#0F172A] font-black">CRACKLIX</span>, dedicated to building a fast and reliable platform for exam preparation. I focus on high-quality tests, study notes, and easy learning to help students succeed.
                  </p>
               </div>

               <div className="pt-6 md:pt-8 border-t border-slate-200/60">
                  <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-4">
                     <Button asChild className="w-full sm:w-auto h-12 md:h-14 px-8 md:px-10 bg-[#0F172A] hover:bg-black text-white rounded-xl md:rounded-2xl font-black uppercase text-[10px] md:text-[11px] tracking-widest shadow-xl border-none transition-all active:scale-95 group/btn">
                        <Link href="/about">Full Story <ArrowRight className="ml-2 h-4 w-4 text-primary group-hover/btn:translate-x-1 transition-transform" /></Link>
                     </Button>
                     <div className="text-center md:text-left">
                        <p className="text-[9px] md:text-[10px] font-black uppercase text-[#0F172A] tracking-tighter leading-none">CRACKLIX HUB</p>
                        <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-1">Learn Smart. Crack Exams.</p>
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
