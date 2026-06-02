'use client';

import Image from "next/image";
import Link from "next/link";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Trophy, Target, TrendingUp } from "lucide-react";
import { useDoc, useFirestore } from '@/firebase';
import { doc } from 'firebase/firestore';
import { useMemo } from 'react';

export default function Hero() {
  const db = useFirestore();
  const settingsRef = useMemo(() => {
    if (!db) return null;
    return doc(db, 'settings', 'global');
  }, [db]);

  const { data: settings, loading } = useDoc(settingsRef);

  const heroImage = settings?.heroImageUrl || PlaceHolderImages.find(img => img.id === 'hero-punjab')?.imageUrl || "https://picsum.photos/seed/punjab-hero/1200/800";

  const content = {
    line1: settings?.heroLine1 || "Prepare Smarter.",
    line2: settings?.heroLine2 || "Score Higher.",
    description: settings?.heroDescription || "Punjab Government Exams di Complete Preparation ik hi Platform te. Trust Cracklix for your professional success.",
    primaryBtn: settings?.heroPrimaryBtn || "Start Free Mock",
    secondaryBtn: settings?.heroSecondaryBtn || "Explore Exams"
  };

  return (
    <header className="relative pt-20 pb-20 lg:pt-28 lg:pb-32 bg-[#08152D] overflow-hidden border-b border-white/5">
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full opacity-[0.03] pointer-events-none">
          <svg viewBox="0 0 100 100" className="w-full h-full object-contain fill-white">
             <path d="M40 35 L55 40 L60 60 L45 70 L35 55 Z" />
          </svg>
        </div>
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
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
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md"
            >
              <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
              <span className="text-[10px] font-black text-white/80 uppercase tracking-widest">
                #1 Punjab Exam Preparation Platform
              </span>
            </motion.div>

            <div className="space-y-2">
              <h1 className="text-[3.5rem] lg:text-[5.5rem] font-extrabold leading-[1.05] tracking-tight text-white font-headline">
                {content.line1}<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-orange-400 to-amber-500">
                  {content.line2}
                </span>
              </h1>
              <p className="text-lg lg:text-xl text-[#7A8B9E] leading-relaxed max-w-xl font-body">
                {content.description}
              </p>
            </div>

            <div className="flex flex-wrap gap-4 pt-2">
              <Button asChild className="h-14 px-8 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl gap-2 shadow-2xl shadow-primary/20 transition-all hover:-translate-y-1 active:scale-95">
                <Link href="/mocks">
                  {content.primaryBtn} <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" asChild className="h-14 px-8 border-white/10 text-white hover:bg-white/5 bg-transparent backdrop-blur-sm rounded-xl font-bold transition-all">
                <Link href="/exams">{content.secondaryBtn}</Link>
              </Button>
            </div>

            <div className="pt-6 border-t border-white/5 inline-block">
               <p className="text-xs lg:text-sm font-black text-white/40 uppercase tracking-[0.1em] flex items-center gap-3">
                 <span>10,000+ Questions</span>
                 <span className="h-1.5 w-1.5 rounded-full bg-white/10" />
                 <span>500+ Mocks</span>
                 <span className="h-1.5 w-1.5 rounded-full bg-white/10" />
                 <span>50+ Exams</span>
               </p>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="relative lg:block"
          >
            <div className="relative aspect-[4/5] sm:aspect-square w-full rounded-[40px] overflow-hidden border border-white/10 shadow-2xl group">
              <Image
                src={heroImage}
                alt="Golden Temple at Night"
                fill
                className="object-cover transition-transform duration-1000 group-hover:scale-105"
                data-ai-hint="golden temple amritsar"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#08152D] via-transparent to-transparent opacity-60" />
              
              <div className="absolute bottom-6 left-6 right-6 p-6 rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl">
                 <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                       <div className="h-10 w-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                          <TrendingUp className="h-5 w-5 text-blue-400" />
                       </div>
                       <div>
                          <p className="text-[9px] font-black uppercase tracking-widest text-white/40">Mastery Level</p>
                          <p className="text-sm font-bold text-white">Punjab GK: 92%</p>
                       </div>
                    </div>
                    <div className="flex gap-1 items-end h-6">
                      {[40, 70, 45, 90, 65, 80].map((h, i) => (
                        <div key={i} className="w-1 bg-primary/60 rounded-full" style={{ height: `${h}%` }} />
                      ))}
                    </div>
                 </div>
              </div>
            </div>

            <FloatingCard 
              delay={0.6} 
              className="top-[-5%] right-[-5%] bg-emerald-500/10 border-emerald-500/20"
              icon={<Trophy className="h-5 w-5 text-emerald-400" />}
              label="Global Rank"
              value="AIR #04"
              subValue="+12 Up This Week"
            />

            <FloatingCard 
              delay={0.8} 
              className="top-[40%] left-[-10%] bg-primary/10 border-primary/20"
              icon={<Target className="h-5 w-5 text-primary" />}
              label="Accuracy"
              value="94%"
              subValue="Sectional Pro"
            />
          </motion.div>
        </div>
      </div>
    </header>
  );
}

function FloatingCard({ className, icon, label, value, subValue, delay }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.8 }}
      whileHover={{ y: -5, scale: 1.05 }}
      className={`absolute p-4 rounded-2xl backdrop-blur-2xl border shadow-2xl z-20 hidden lg:block ${className}`}
    >
      <div className="flex items-center gap-4">
        <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/5">
          {icon}
        </div>
        <div>
          <p className="text-[9px] font-black uppercase tracking-widest text-white/40">{label}</p>
          <p className="text-base font-black text-white leading-none mt-1">{value}</p>
          <p className="text-[9px] font-bold text-emerald-400 mt-1">{subValue}</p>
        </div>
      </div>
    </motion.div>
  );
}
