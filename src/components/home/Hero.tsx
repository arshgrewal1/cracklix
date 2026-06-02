
'use client';

import Image from "next/image";
import Link from "next/link";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Trophy, Target, TrendingUp, Sparkles, ShieldCheck } from "lucide-react";
import { useDoc, useFirestore } from '@/firebase';
import { doc } from 'firebase/firestore';
import { useMemo } from 'react';

export default function Hero() {
  const db = useFirestore();
  const settingsRef = useMemo(() => {
    if (!db) return null;
    return doc(db, 'settings', 'global');
  }, [db]);

  const { data: settings } = useDoc(settingsRef);

  const heroImage = settings?.heroImageUrl || PlaceHolderImages.find(img => img.id === 'hero-punjab')?.imageUrl || "https://picsum.photos/seed/punjab-hero/1200/800";

  const content = {
    line1: settings?.heroLine1 || "Prepare Smarter.",
    line2: settings?.heroLine2 || "Score Higher.",
    description: settings?.heroDescription || "Punjab Government Exams di Complete Preparation ik hi Platform te. Trust Cracklix for your professional success.",
    primaryBtn: settings?.heroPrimaryBtn || "Start Free Mock",
    secondaryBtn: settings?.heroSecondaryBtn || "Explore Exams"
  };

  return (
    <header className="relative pt-20 pb-20 lg:pt-32 lg:pb-40 bg-[#08152D] overflow-hidden border-b border-white/5">
      {/* Dynamic Background Elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full opacity-[0.03] pointer-events-none">
          <svg viewBox="0 0 100 100" className="w-full h-full object-contain fill-white">
             <path d="M40 35 L55 40 L60 60 L45 70 L35 55 Z" />
          </svg>
        </div>
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-primary/20 blur-[140px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-blue-600/10 blur-[140px] rounded-full" />
      </div>

      <div className="container mx-auto px-6 relative z-10 max-w-7xl">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="space-y-8"
          >
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md"
            >
              <div className="flex -space-x-2">
                {[1,2,3].map(i => (
                  <div key={i} className="h-5 w-5 rounded-full border-2 border-[#08152D] bg-slate-400 overflow-hidden relative">
                    <Image src={`https://picsum.photos/seed/user${i}/100/100`} alt="Aspirant" fill />
                  </div>
                ))}
              </div>
              <span className="text-[10px] font-black text-white/80 uppercase tracking-widest flex items-center gap-2">
                Join 15,000+ Punjab Aspirants <Sparkles className="h-3 w-3 text-primary" />
              </span>
            </motion.div>

            <div className="space-y-2">
              <h1 className="text-[3.8rem] lg:text-[6rem] font-black leading-[1] tracking-tight text-white font-headline">
                {content.line1}<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-orange-400 to-amber-500 drop-shadow-[0_0_20px_rgba(249,115,22,0.3)]">
                  {content.line2}
                </span>
              </h1>
              <p className="text-lg lg:text-xl text-[#7A8B9E] leading-relaxed max-w-xl font-body mt-6">
                {content.description}
              </p>
            </div>

            <div className="flex flex-wrap gap-5 pt-4">
              <Button asChild className="h-16 px-10 bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-widest text-xs rounded-2xl gap-3 shadow-[0_20px_50px_rgba(249,115,22,0.3)] transition-all hover:-translate-y-1 active:scale-95">
                <Link href="/mocks">
                  {content.primaryBtn} <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
              <Button variant="outline" asChild className="h-16 px-10 border-white/10 text-white hover:bg-white/5 bg-transparent backdrop-blur-sm rounded-2xl font-black uppercase tracking-widest text-xs transition-all">
                <Link href="/exams">{content.secondaryBtn}</Link>
              </Button>
            </div>

            <div className="pt-10 flex items-center gap-8 border-t border-white/5">
               <div className="flex flex-col">
                  <span className="text-2xl font-black text-white">1,200+</span>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Patwari Mocks</span>
               </div>
               <div className="h-8 w-px bg-white/10" />
               <div className="flex flex-col">
                  <span className="text-2xl font-black text-white">3,500+</span>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Police MCQs</span>
               </div>
               <div className="h-8 w-px bg-white/10" />
               <div className="flex flex-col">
                  <span className="text-2xl font-black text-white">Verified</span>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Answer Keys</span>
               </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="relative"
          >
            {/* Main Visual Container */}
            <div className="relative group">
              {/* Outer Glow */}
              <div className="absolute -inset-4 bg-primary/20 rounded-[50px] blur-3xl opacity-0 group-hover:opacity-100 transition duration-1000"></div>
              
              <div className="relative aspect-[4/5] sm:aspect-square w-full rounded-[48px] overflow-hidden border border-white/10 shadow-2xl group ring-1 ring-white/20">
                <Image
                  src={heroImage}
                  alt="Punjab Aspirant Portal"
                  fill
                  className="object-cover transition-transform duration-1000 group-hover:scale-110"
                  data-ai-hint="golden temple amritsar"
                  priority
                />
                
                {/* Glass Overlays */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#08152D] via-transparent to-transparent opacity-80" />
                
                <div className="absolute bottom-8 left-8 right-8 p-8 rounded-[2rem] bg-white/5 backdrop-blur-2xl border border-white/10 shadow-2xl overflow-hidden">
                   <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />
                   <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                         <div className="h-12 w-12 rounded-2xl bg-primary/20 flex items-center justify-center">
                            <TrendingUp className="h-6 w-6 text-primary" />
                         </div>
                         <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-white/40">Real-time Performance</p>
                            <p className="text-lg font-black text-white">Punjab GK Accuracy: 94%</p>
                         </div>
                      </div>
                      <div className="flex gap-1.5 items-end h-10">
                        {[40, 70, 45, 90, 65, 80, 55].map((h, i) => (
                          <div key={i} className="w-1.5 bg-primary/60 rounded-full animate-grow" style={{ height: `${h}%`, animationDelay: `${i * 0.1}s` }} />
                        ))}
                      </div>
                   </div>
                </div>
              </div>

              {/* Floating Badge Widgets */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-[-5%] right-[-5%] z-20"
              >
                <div className="bg-emerald-500/10 backdrop-blur-xl border border-emerald-500/30 p-5 rounded-3xl shadow-2xl">
                   <div className="flex items-center gap-4">
                      <div className="h-11 w-11 rounded-2xl bg-emerald-500/20 flex items-center justify-center border border-emerald-500/20">
                         <Trophy className="h-6 w-6 text-emerald-400" />
                      </div>
                      <div>
                         <p className="text-[9px] font-black uppercase tracking-widest text-white/40">Global Rank</p>
                         <p className="text-xl font-black text-white leading-none mt-1">#04</p>
                         <p className="text-[10px] font-bold text-emerald-400 mt-1">v/s 12k Users</p>
                      </div>
                   </div>
                </div>
              </motion.div>

              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                className="absolute bottom-[20%] left-[-10%] z-20 hidden md:block"
              >
                <div className="bg-primary/10 backdrop-blur-xl border border-primary/30 p-5 rounded-3xl shadow-2xl">
                   <div className="flex items-center gap-4">
                      <div className="h-11 w-11 rounded-2xl bg-primary/20 flex items-center justify-center border border-primary/20">
                         <ShieldCheck className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                         <p className="text-[9px] font-black uppercase tracking-widest text-white/40">Trust Factor</p>
                         <p className="text-xl font-black text-white leading-none mt-1">Verified</p>
                         <p className="text-[10px] font-bold text-primary mt-1">Official Pattern</p>
                      </div>
                   </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </header>
  );
}
