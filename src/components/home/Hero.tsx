
'use client';

import Image from "next/image";
import Link from "next/link";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, ShieldCheck } from "lucide-react";
import { useDoc, useFirestore } from '@/firebase';
import { doc } from 'firebase/firestore';
import { useMemo } from 'react';

/**
 * @fileOverview Final Institutional Hero Module.
 * Synchronized with Official Army Promotional Asset.
 */

export default function Hero() {
  const db = useFirestore();
  const settingsRef = useMemo(() => (db ? doc(db, 'settings', 'global') : null), [db]);
  const { data: settings } = useDoc<any>(settingsRef);

  const heroImage = PlaceHolderImages.find(img => img.id === 'hero-punjab')?.imageUrl || "https://www.indianarmy.nic.in/writereaddata/images/slider/270526_Hindi_1.jpeg";

  const content = {
    line1: settings?.heroLine1 || "Punjab's No. 1",
    line2: settings?.heroLine2 || "Dedicated Authority.",
    description: settings?.heroDescription || "Specialize exclusively for Punjab Govt preparation. Join 15,000+ aspirants.",
    imageUrl: heroImage
  };

  return (
    <section className="relative pt-12 pb-16 lg:pt-24 lg:pb-32 bg-[#08152D] overflow-hidden border-b border-white/5">
      {/* Punjab Map Watermark */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none flex items-center justify-center">
        <svg viewBox="0 0 100 100" className="w-[80%] h-[80%] fill-white rotate-12">
          <path d="M35 25 L55 20 L75 35 L80 60 L60 85 L30 80 L20 50 Z" />
        </svg>
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-20 items-center">
          
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-6 lg:space-y-10"
          >
            <div className="inline-flex items-center gap-3 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 backdrop-blur-sm">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              <span className="text-[9px] font-black text-primary uppercase tracking-[0.2em]">Verified Patterns</span>
            </div>

            <h1 className="text-4xl lg:text-8xl font-black leading-[0.95] tracking-tight text-white font-headline text-left uppercase">
              {content.line1}<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-orange-400">
                {content.line2}
              </span>
            </h1>

            <p className="text-lg lg:text-xl text-slate-400 leading-relaxed max-w-xl text-left font-medium">
              {content.description}
            </p>

            <div className="flex flex-wrap gap-4">
              <Button asChild className="h-14 lg:h-16 px-8 lg:px-10 bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-widest text-[10px] rounded-2xl gap-3 shadow-2xl border-none">
                <Link href="/mocks">Start Practice <ArrowRight className="h-4 w-4" /></Link>
              </Button>
              <Button variant="ghost" asChild className="h-14 lg:h-16 px-8 lg:px-10 border border-white/20 text-white hover:bg-white/10 rounded-2xl font-black uppercase tracking-widest text-[10px] bg-transparent">
                <Link href="/exams">Explore Hubs</Link>
              </Button>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}
            className="relative hidden lg:block"
          >
            <div className="relative aspect-square rounded-[4rem] overflow-hidden border border-white/10 shadow-2xl group">
              <Image 
                src={content.imageUrl} 
                alt="Institutional Hero" 
                fill 
                className="object-cover transition-transform duration-1000 group-hover:scale-110"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#08152D] via-transparent to-transparent opacity-60" />
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
