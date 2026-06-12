'use client';

import React from "react"
import { motion } from "framer-motion";
import { 
  ChevronRight, 
  Landmark, 
  BookOpen, 
  Zap, 
  Shield, 
  CheckCircle2, 
  Star, 
  ShieldCheck, 
  GraduationCap, 
  Globe, 
  TrendingUp,
  Smartphone,
  Scale
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

/**
 * @fileOverview Final Institutional Popular Exams Card v18.5 (Locked).
 * MATCHED: Perfectly aligned with the reference (ibb.co/F4D0JLHP bottom card).
 * Features: High-fidelity authority grid and institutional trust checklist.
 */

const BOARDS = [
  { id: 'psssb', name: 'PSSSB Hub', icon: <Landmark className="h-6 w-6" /> },
  { id: 'punjab-police', name: 'Punjab Police', icon: <Shield className="h-6 w-6" /> },
  { id: 'ppsc', name: 'PPSC Official', icon: <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSR8W5eTBPdzztA7cziqnMmtWk9InL1yflUD_xb4vAsLw&s=10" className="h-6 w-6 object-contain" /> },
  { id: 'pstet', name: 'PSTET Prep', icon: <BookOpen className="h-6 w-6" /> },
  { id: 'pspcl', name: 'PSPCL / PSTCL', icon: <Zap className="h-6 w-6" /> },
  { id: 'high-court', name: 'P&H High Court', icon: <Scale className="h-6 w-6" /> }
];

const TRUST_POINTS = [
  { title: "Punjab Focused Content", icon: <ShieldCheck className="h-5 w-5" /> },
  { title: "Bilingual (English + Punjabi)", icon: <Globe className="h-5 w-5" /> },
  { title: "Real Exam Pattern Mocks", icon: <GraduationCap className="h-5 w-5" /> },
  { title: "Detailed Analytics Hub", icon: <TrendingUp className="h-5 w-5" /> },
  { title: "On-the-Go App Learning", icon: <Smartphone className="h-5 w-5" /> }
];

export default function PopularExams() {
  return (
    <section className="py-12 md:py-24 bg-slate-50/50">
      <div className="container mx-auto px-4 max-w-7xl">
         <motion.div 
           initial={{ opacity: 0, y: 30 }}
           whileInView={{ opacity: 1, y: 0 }}
           viewport={{ once: true }}
           className="bg-white shadow-4xl rounded-[3rem] md:rounded-[4rem] overflow-hidden border border-slate-100 flex flex-col lg:grid lg:grid-cols-12"
         >
            
            {/* LEFT: AUTHORITY LOGO GRID (Col-7) */}
            <div className="lg:col-span-7 p-8 md:p-16 space-y-12 text-left">
               <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                     <div className="h-10 w-10 bg-orange-50 rounded-xl flex items-center justify-center text-primary shadow-inner">
                        <Star className="h-5 w-5 fill-current" />
                     </div>
                     <h2 className="text-2xl md:text-4xl font-headline font-black text-[#0F172A] uppercase tracking-tight leading-none">
                        Popular Exams
                     </h2>
                  </div>
                  <Link href="/exams" className="text-primary font-black uppercase text-[10px] md:text-[12px] tracking-[0.2em] flex items-center gap-2 hover:underline group">
                     View All Hubs <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
               </div>

               <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-8">
                  {BOARDS.map((board, idx) => (
                     <motion.div 
                       key={board.id}
                       initial={{ opacity: 0, scale: 0.95 }}
                       whileInView={{ opacity: 1, scale: 1 }}
                       transition={{ delay: idx * 0.05 }}
                       viewport={{ once: true }}
                     >
                        <Link href="/exams" className="group block h-full">
                           <div className="bg-white border border-slate-100 rounded-3xl p-6 md:p-8 flex flex-col items-center text-center gap-5 transition-all hover:shadow-2xl hover:border-primary/30 h-full">
                              <div className="h-14 w-14 md:h-20 md:w-20 rounded-[1.5rem] bg-slate-50 flex items-center justify-center text-slate-300 group-hover:text-primary transition-all duration-500 shrink-0 shadow-inner relative overflow-hidden">
                                 {board.icon}
                              </div>
                              <span className="text-[11px] md:text-sm font-black text-[#0F172A] uppercase leading-tight tracking-tight group-hover:text-primary transition-colors">{board.name}</span>
                           </div>
                        </Link>
                     </motion.div>
                  ))}
               </div>
            </div>

            {/* RIGHT: INSTITUTIONAL TRUST CHECKLIST (Col-5) */}
            <div className="lg:col-span-5 bg-slate-50 border-l border-slate-100 p-10 md:p-16 flex flex-col justify-center text-left relative overflow-hidden">
               <div className="absolute top-0 right-0 p-8 opacity-[0.03] rotate-12"><ShieldCheck className="h-64 w-64" /></div>
               
               <div className="relative z-10 space-y-10">
                  <div className="space-y-2">
                     <p className="text-[10px] font-black text-primary uppercase tracking-[0.4em]">WHY CHOOSE CRACKLIX?</p>
                     <h3 className="text-2xl font-headline font-black text-[#0F172A] uppercase leading-none">Trust The Registry</h3>
                  </div>

                  <ul className="space-y-8">
                     {TRUST_POINTS.map((point, i) => (
                        <motion.li 
                          key={i}
                          initial={{ opacity: 0, x: 20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.2 + (i * 0.1) }}
                          viewport={{ once: true }}
                          className="flex items-center gap-5 group"
                        >
                           <div className="h-10 w-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 group-hover:text-primary group-hover:border-primary/20 transition-all shadow-sm">
                              {point.icon}
                           </div>
                           <span className="text-xs md:text-base font-bold text-slate-600 group-hover:text-[#0F172A] transition-colors uppercase tracking-tight antialiased">
                              {point.title}
                           </span>
                        </motion.li>
                     ))}
                  </ul>

                  <div className="pt-10 border-t border-slate-200/50">
                     <Button asChild className="w-full h-16 bg-[#0F172A] hover:bg-black text-white rounded-2xl font-black uppercase text-[10px] tracking-widest gap-3 shadow-xl border-none">
                        <Link href="/about">Meet the Management <ChevronRight className="h-4 w-4" /></Link>
                     </Button>
                  </div>
               </div>
            </div>

         </motion.div>
      </div>
    </section>
  );
}
