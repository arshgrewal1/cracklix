
'use client';

import Image from "next/image";
import Link from "next/link";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, ShieldCheck, Search, Zap, GraduationCap, Trophy, Globe, Target } from "lucide-react";
import { Input } from "@/components/ui/input";

/**
 * @fileOverview Professional Mock Platform Hero v2.0.
 * Redesigned for Adda247 high-density discovery experience.
 */

export default function Hero() {
  const policeImage = "https://punjabpolice.gov.in/media/images/pp10.original.jpg";

  return (
    <section className="relative pt-10 pb-20 lg:pt-24 lg:pb-36 bg-[#08152D] overflow-hidden">
      {/* Dynamic Background Grid */}
      <div className="absolute inset-0 opacity-[0.05] pointer-events-none">
         <div className="h-full w-full bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:40px_40px]" />
      </div>

      <div className="container mx-auto px-6 relative z-10 max-w-7xl">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-10 lg:space-y-12 text-left"
          >
            <div className="space-y-6">
               <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-primary/10 border border-primary/20 backdrop-blur-md">
                  <Sparkles className="h-4 w-4 text-primary animate-pulse" />
                  <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">Punjab's No. 1 Prep Node 2026</span>
               </div>
               <h1 className="text-5xl lg:text-8xl font-headline font-black leading-[0.85] tracking-tighter text-white uppercase">
                  CRACK EVERY <br/> <span className="text-primary text-glow">RECRUITMENT.</span>
               </h1>
               <p className="text-xl lg:text-2xl text-slate-400 font-medium max-w-2xl antialiased leading-relaxed">
                  High-fidelity practice series for PSSSB, PPSC, Police, Army, and National Central registries.
               </p>
            </div>

            {/* Platform Discovery Hub */}
            <div className="relative group max-w-2xl">
               <div className="absolute -inset-1.5 bg-gradient-to-r from-primary via-orange-500 to-amber-500 rounded-[2.5rem] blur opacity-20 group-hover:opacity-50 transition duration-1000"></div>
               <div className="relative flex items-center bg-white rounded-[2rem] p-2 shadow-4xl border border-white/10">
                  <Search className="absolute left-8 h-6 w-6 text-slate-400" />
                  <Input 
                    placeholder="Search for Patwari, SI, Agniveer, SSC..." 
                    className="h-16 md:h-20 pl-16 pr-6 border-none text-xl font-medium text-[#0F172A] bg-transparent focus-visible:ring-0 w-full"
                  />
                  <Button className="hidden md:flex h-16 px-10 bg-[#0F172A] hover:bg-black text-white font-black uppercase text-[11px] tracking-widest rounded-2xl ml-2 gap-4 shadow-2xl transition-all active:scale-95">
                    <Target className="h-5 w-5 text-primary" /> Start Audit
                  </Button>
               </div>
            </div>

            {/* Vertical Routing Nodes */}
            <div className="flex flex-wrap gap-4 pt-4">
               <CategoryPill icon={<Zap />} label="PSSSB" href="/exams?region=Punjab" />
               <CategoryPill icon={<ShieldCheck />} label="POLICE" href="/exams?region=Punjab" />
               <CategoryPill icon={<Trophy />} label="ARMY" href="/exams?region=National" />
               <CategoryPill icon={<Globe />} label="SSC/CTET" href="/exams?region=National" />
               <CategoryPill icon={<GraduationCap />} label="TEACHING" href="/exams" />
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2 }}
            className="relative hidden lg:block"
          >
            {/* Tactical Perspective Asset */}
            <div className="relative aspect-[4/3] w-full max-w-[750px] ml-auto">
               <div className="absolute -inset-16 bg-primary/10 blur-[140px] rounded-full opacity-60" />
               <div className="relative h-full w-full rounded-[5rem] overflow-hidden border-[15px] border-white/5 shadow-5xl group bg-slate-800">
                  <img 
                    src={policeImage} 
                    alt="Institutional Hub" 
                    className="w-full h-full object-cover transition-transform duration-[4s] group-hover:scale-105"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#08152D] via-transparent to-transparent opacity-50" />
               </div>
               
               {/* Institutional Confidence Badge */}
               <div className="absolute -bottom-10 -left-10 bg-white p-8 rounded-[2.5rem] shadow-4xl flex items-center gap-8 border border-slate-100 animate-in fade-in slide-in-from-left duration-1000">
                  <div className="h-16 w-16 rounded-[1.5rem] bg-emerald-500 flex items-center justify-center shadow-2xl shadow-emerald-500/30">
                     <ShieldCheck className="h-9 w-9 text-white" />
                  </div>
                  <div className="text-left pr-6">
                     <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] leading-none mb-1.5">Official Registry</p>
                     <p className="text-2xl font-headline font-black text-[#0F172A] leading-none uppercase">Verified 2026</p>
                  </div>
               </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function CategoryPill({ icon, label, href }: any) {
   return (
      <Link href={href}>
         <div className="flex items-center gap-3 px-6 py-3 bg-white/5 border border-white/10 rounded-2xl text-slate-300 hover:bg-primary hover:text-white hover:border-primary transition-all duration-500 cursor-pointer group shadow-xl">
            <span className="text-primary group-hover:text-white transition-colors">{icon}</span>
            <span className="text-[11px] font-black uppercase tracking-widest">{label}</span>
         </div>
      </Link>
   )
}
