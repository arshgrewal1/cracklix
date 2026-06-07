'use client';

import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Code, ArrowRight, Target, Sparkles } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * @fileOverview Official Founder & Lead Developer Section.
 * Features: High-fidelity circular profile image with Arsh Grewal's official bio and image.
 */

export default function MeetFounder() {
  const founderImg = "https://i.ibb.co/5hkxTtKS/Whats-App-Image-2026-05-28-at-10-31-36-AM.jpg";

  return (
    <section className="py-24 md:py-32 bg-white overflow-hidden border-t border-slate-50">
      <div className="container mx-auto px-6 max-w-7xl text-center">
        <motion.div 
           initial={{ opacity: 0, y: 20 }}
           whileInView={{ opacity: 1, y: 0 }}
           viewport={{ once: true }}
           className="space-y-4 mb-16"
        >
           <div className="flex items-center justify-center gap-3 mb-2">
              <Sparkles className="h-5 w-5 text-primary animate-pulse" />
              <h2 className="text-4xl md:text-6xl font-headline font-black uppercase text-[#0F172A] tracking-tight">
                 Meet the <span className="text-primary">Founder</span>
              </h2>
           </div>
           <div className="h-1.5 w-24 bg-primary mx-auto rounded-full" />
        </motion.div>

        <div className="max-w-5xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="bg-slate-50/50 rounded-[3.5rem] md:rounded-[5rem] overflow-hidden shadow-4xl border border-slate-100 flex flex-col md:flex-row items-center p-8 md:p-20 gap-12 md:gap-24 group hover:shadow-5xl transition-all duration-700"
          >
            {/* CIRCULAR PROFILE IMAGE NODE */}
            <div className="relative shrink-0">
               <div className="absolute -inset-4 bg-gradient-to-tr from-primary to-orange-400 rounded-full blur opacity-10 group-hover:opacity-20 transition duration-1000"></div>
               <div className="relative h-56 w-56 md:h-80 md:w-80 rounded-full overflow-hidden border-[10px] border-white shadow-2xl bg-[#0B1528] ring-1 ring-slate-200">
                  <img 
                    src={founderImg} 
                    alt="Arsh Grewal" 
                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000 scale-105 group-hover:scale-100"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                       (e.target as HTMLImageElement).src = "https://picsum.photos/seed/arsh/400/400";
                    }}
                  />
               </div>
               <div className="absolute -bottom-2 -right-2 h-14 w-14 md:h-18 md:w-18 bg-emerald-500 rounded-3xl border-4 border-white flex items-center justify-center text-white shadow-xl animate-bounce">
                  <ShieldCheck className="h-8 w-8 md:h-9 md:w-9" />
               </div>
            </div>

            {/* INSTITUTIONAL BIO HUB */}
            <div className="flex-1 space-y-8 text-center md:text-left">
               <div className="space-y-4">
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                     <Badge className="bg-primary text-white border-none px-4 py-1.5 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-xl">Founder</Badge>
                     <Badge className="bg-[#0F172A] text-white border-none px-4 py-1.5 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-xl">Lead Developer</Badge>
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-4xl md:text-6xl font-headline font-black text-[#0F172A] uppercase leading-tight tracking-tight">Arsh Grewal</h3>
                    <p className="text-primary font-black uppercase tracking-[0.4em] text-[10px] md:text-xs flex items-center justify-center md:justify-start gap-2">
                       <Target className="h-3 w-3" /> Platform Architect
                    </p>
                  </div>
               </div>
               
               <div className="relative">
                  <div className="absolute -left-6 top-0 bottom-0 w-1 bg-primary/20 rounded-full hidden md:block" />
                  <p className="text-lg md:text-xl text-slate-500 font-medium leading-relaxed antialiased">
                     Founder and Lead Developer of <span className="text-[#0F172A] font-black">CRACKLIX</span>, dedicated to building a modern, fast, and reliable platform for competitive exam preparation. Focused on delivering high-quality mock tests, PYQs, current affairs, analytics, and multilingual learning experiences to help students succeed.
                  </p>
               </div>

               <div className="pt-8 border-t border-slate-200/60 flex flex-col gap-8">
                  <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-6">
                     <Button asChild className="h-16 px-12 bg-[#0F172A] hover:bg-black text-white rounded-2xl font-black uppercase text-[11px] tracking-widest shadow-xl border-none transition-all active:scale-95 group/btn">
                        <Link href="/about">Full Mission Profile <ArrowRight className="ml-3 h-4 w-4 text-primary group-hover/btn:translate-x-1 transition-transform" /></Link>
                     </Button>
                     <div className="text-center md:text-left">
                        <p className="text-[11px] font-black uppercase text-[#0F172A] tracking-tighter leading-none">CRACKLIX Hub</p>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1.5">Learn Smart. Crack Exams.</p>
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
