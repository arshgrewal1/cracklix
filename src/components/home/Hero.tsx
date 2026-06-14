'use client';

import React, { useMemo, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { 
  Star
} from "lucide-react";
import { useDoc, useFirestore } from '@/firebase';
import { doc } from "firebase/firestore";

/**
 * @fileOverview High-Fidelity Unified Hero v700.0 (Screenshot Perfect).
 * MATCHED: 200px mobile height, specific typography scaling, and unified map watermark.
 */

export default function Hero() {
  const db = useFirestore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <section className="relative w-full bg-[#050B19] overflow-hidden flex flex-col text-left">
      
      {/* 1. BACKGROUND HUB - 200PX MOBILE HEIGHT */}
      <div className="relative w-full h-[200px] md:h-[400px] overflow-hidden">
         {/* GOLDEN TEMPLE IMAGE */}
         <div className="absolute inset-0 z-0">
            <img 
              src="https://i.ibb.co/LXgcLVVq/Gemini-Generated-Image-n1so6on1so6on1so.png" 
              alt="Golden Temple" 
              className="w-full h-full object-cover object-center"
              referrerPolicy="no-referrer"
            />
            {/* GRADIENT OVERLAY FOR TEXT BLENDING */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#050B19] via-[#050B19]/20 to-transparent" />
         </div>

         {/* PUNJAB MAP WATERMARK - CONTINUOUS OVERLAY */}
         <div className="absolute inset-0 z-10 pointer-events-none opacity-[0.06] mix-blend-overlay">
            <img 
              src="https://www.mapsofindia.com/maps/punjab/punjab-map.jpg" 
              className="w-full h-full object-cover grayscale invert" 
              alt="Punjab Map Texture"
            />
         </div>

         {/* TOP BADGE - INSIDE IMAGE HUB */}
         <div className="absolute bottom-6 left-4 md:left-12 z-20">
            <motion.div
               initial={{ opacity: 0, x: -20 }}
               animate={{ opacity: 1, x: 0 }}
               className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md"
            >
               <div className="h-4 w-4 md:h-5 md:w-5 rounded-full bg-primary/20 flex items-center justify-center">
                 <Star className="h-2.5 w-2.5 md:h-3 md:w-3 text-primary fill-current" />
               </div>
               <span className="text-[8px] md:text-xs font-black text-white uppercase tracking-widest">#1 Punjab Exam Preparation Platform</span>
            </motion.div>
         </div>
      </div>

      {/* 2. TYPOGRAPHY HUB - ON SOLID DARK BACK */}
      <div className="bg-[#050B19] relative z-20 pb-16 md:pb-32">
         {/* MAP WATERMARK CONTINUATION */}
         <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.03] mix-blend-overlay">
            <img 
              src="https://www.mapsofindia.com/maps/punjab/punjab-map.jpg" 
              className="w-full h-full object-cover grayscale invert" 
              alt="Punjab Map Texture"
            />
         </div>

         <div className="container mx-auto px-4 md:px-12 lg:px-16 max-w-[1440px] relative z-10">
            <div className="pt-6 md:pt-12 space-y-2 md:space-y-4">
               <motion.h1 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-[40px] sm:text-6xl md:text-8xl lg:text-[100px] font-headline font-black text-white leading-[0.95] tracking-tighter uppercase"
               >
                  Prepare Smarter.
               </motion.h1>
               <motion.h1 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="text-[40px] sm:text-6xl md:text-8xl lg:text-[100px] font-headline font-black text-primary leading-[0.95] tracking-tighter uppercase"
               >
                  Score Higher.
               </motion.h1>
            </div>

            <motion.p 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               transition={{ delay: 0.3 }}
               className="text-slate-400 font-bold uppercase text-[10px] md:text-lg tracking-[0.2em] mt-8 max-w-xl"
            >
               Punjab's most advanced CBT engine. <br/>
               Verified by Arsh Grewal Management.
            </motion.p>
         </div>
      </div>
    </section>
  );
}
