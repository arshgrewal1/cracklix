
'use client';

import Image from "next/image";
import Link from "next/link";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, ShieldCheck, MapPin } from "lucide-react";
import { useDoc, useFirestore } from '@/firebase';
import { doc } from 'firebase/firestore';
import { useMemo } from 'react';

/**
 * @fileOverview Redesigned Hero Module - Police Edition.
 * Features: Absolute visibility, Map backgrounds, and Police tactical imagery.
 */

export default function Hero() {
  const db = useFirestore();
  const settingsRef = useMemo(() => (db ? doc(db, 'settings', 'global') : null), [db]);
  const { data: settings } = useDoc<any>(settingsRef);

  const policeImage = PlaceHolderImages.find(img => img.id === 'hero-police')?.imageUrl || "https://punjabpolice.gov.in/media/images/pp10.original.jpg";

  return (
    <section className="relative pt-16 pb-24 lg:pt-32 lg:pb-40 bg-[#08152D] overflow-hidden">
      {/* Background Punjab Map Watermark */}
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none flex items-center justify-center">
         <img 
            src="https://www.mapsofindia.com/maps/punjab/punjab-map.jpg" 
            className="w-full h-full object-cover scale-150 grayscale invert"
            alt="Watermark"
         />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-24 items-center">
          
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8 lg:space-y-12 text-left"
          >
            <div className="flex flex-col space-y-4">
               <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 backdrop-blur-md w-fit">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">Official Punjab Hub 2026</span>
               </div>
               <h1 className="text-5xl lg:text-8xl font-black leading-[0.85] tracking-tighter text-white font-headline uppercase">
                  PREPARE <br/> <span className="text-primary">SMARTER.</span> <br/>
                  <span className="text-white/20">SCORE HIGHER.</span>
               </h1>
            </div>

            <p className="text-xl lg:text-2xl text-slate-400 leading-relaxed max-w-xl font-medium antialiased">
               The absolute common base and post-specific preparation matrix for Punjab Government Hubs.
            </p>

            <div className="flex flex-wrap gap-6 pt-4">
              <Button asChild className="h-16 lg:h-20 px-10 lg:px-16 bg-primary hover:bg-orange-600 text-white font-black uppercase tracking-widest text-[11px] rounded-3xl gap-4 shadow-4xl border-none transition-all active:scale-95">
                <Link href="/mocks">Start Free Mock <ArrowRight className="h-5 w-5" /></Link>
              </Button>
              <Button variant="ghost" asChild className="h-16 lg:h-20 px-10 border-2 border-white/10 text-white hover:bg-white/5 rounded-3xl font-black uppercase tracking-widest text-[11px] bg-transparent">
                <Link href="/exams"><MapPin className="h-5 w-5 mr-2 text-primary" /> Explore Hubs</Link>
              </Button>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="relative"
          >
            {/* Glossy Container */}
            <div className="relative aspect-square lg:aspect-square w-full max-w-[650px] mx-auto">
               <div className="absolute -inset-4 bg-gradient-to-tr from-primary/20 to-transparent rounded-[4rem] blur-2xl" />
               <div className="relative h-full w-full rounded-[4rem] overflow-hidden border border-white/5 shadow-4xl group">
                  <img 
                    src={policeImage} 
                    alt="Punjab Police Strategic" 
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#08152D] via-transparent to-transparent opacity-40" />
               </div>
               
               {/* Institutional Floating Badge */}
               <div className="absolute -top-8 -right-8 h-24 w-24 bg-emerald-500 rounded-[2rem] flex items-center justify-center shadow-3xl rotate-12 border-[6px] border-[#08152D] z-20">
                  <ShieldCheck className="h-10 w-10 text-white" />
               </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
