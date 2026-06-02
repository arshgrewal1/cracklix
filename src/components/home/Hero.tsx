'use client';

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, TrendingUp, ShieldCheck, MapPin } from "lucide-react";
import { useDoc, useFirestore } from '@/firebase';
import { doc } from 'firebase/firestore';
import { useMemo } from 'react';

/**
 * @fileOverview Final Dynamic Hero Module.
 * Integrates with Site Settings CMS for non-technical management.
 */

export default function Hero() {
  const db = useFirestore();
  const settingsRef = useMemo(() => (db ? doc(db, 'settings', 'global') : null), [db]);
  const { data: settings } = useDoc(settingsRef);

  const content = {
    line1: settings?.heroLine1 || "Prepare Smarter.",
    line2: settings?.heroLine2 || "Score Higher.",
    description: settings?.heroDescription || "Punjab's most trusted platform for Government Exam preparation. Join 15,000+ aspirants today.",
    imageUrl: settings?.heroImageUrl || "https://picsum.photos/seed/amritsar/1200/800"
  };

  return (
    <section className="relative pt-24 pb-32 bg-[#08152D] overflow-hidden border-b border-white/5">
      {/* Punjab Map Watermark */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none flex items-center justify-center">
        <svg viewBox="0 0 100 100" className="w-[80%] h-[80%] fill-white rotate-12">
          <path d="M35 25 L55 20 L75 35 L80 60 L60 85 L30 80 L20 50 Z" />
        </svg>
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-20 items-center">
          
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-10"
          >
            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 backdrop-blur-sm">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">#1 Punjab Mock Test Hub</span>
            </div>

            <h1 className="text-6xl lg:text-8xl font-black leading-[0.95] tracking-tight text-white font-headline">
              {content.line1}<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-orange-400">
                {content.line2}
              </span>
            </h1>

            <p className="text-xl text-slate-400 leading-relaxed max-w-xl">
              {content.description} Trust Cracklix for high-fidelity mocks and AI-powered performance analysis.
            </p>

            <div className="flex flex-wrap gap-5">
              <Button asChild className="h-16 px-10 bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-widest text-xs rounded-2xl gap-3 shadow-2xl shadow-primary/20">
                <Link href="/mocks">Start Free Mock <ArrowRight className="h-5 w-5" /></Link>
              </Button>
              <Button variant="outline" asChild className="h-16 px-10 border-white/10 text-white hover:bg-white/5 rounded-2xl font-black uppercase tracking-widest text-xs">
                <Link href="/exams">Explore Exams</Link>
              </Button>
            </div>

            <div className="flex items-center gap-8 pt-8 border-t border-white/5">
               <div className="flex flex-col">
                  <span className="text-2xl font-black text-white">1,200+</span>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Patwari Mocks</span>
               </div>
               <div className="flex flex-col">
                  <span className="text-2xl font-black text-white">3,500+</span>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Police MCQs</span>
               </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}
            className="relative"
          >
            <div className="relative aspect-square rounded-[4rem] overflow-hidden border border-white/10 shadow-2xl group">
              <Image 
                src={content.imageUrl} 
                alt="Golden Temple" 
                fill 
                className="object-cover transition-transform duration-1000 group-hover:scale-110"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#08152D] via-transparent to-transparent opacity-60" />
              
              {/* Floating Performance Widget */}
              <div className="absolute bottom-10 left-10 right-10 p-6 rounded-[2rem] bg-white/5 backdrop-blur-2xl border border-white/10 shadow-2xl">
                 <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                       <div className="h-12 w-12 rounded-2xl bg-primary/20 flex items-center justify-center">
                          <TrendingUp className="h-6 w-6 text-primary" />
                       </div>
                       <div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-white/40">Student Success</p>
                          <p className="text-lg font-black text-white">94.2% Avg. Accuracy</p>
                       </div>
                    </div>
                 </div>
              </div>
            </div>

            {/* Shield Badge */}
            <div className="absolute -top-6 -right-6 h-24 w-24 bg-emerald-500 rounded-3xl flex items-center justify-center shadow-2xl rotate-12 border-4 border-white/10">
               <ShieldCheck className="h-10 w-10 text-white" />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
