
'use client';

import React, { useMemo, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Zap, Play, ChevronRight, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useDoc, useFirestore } from "@/firebase";
import { doc } from "firebase/firestore";

/**
 * @fileOverview Compact Institutional Hero v40.0.
 */
export default function Hero() {
  const db = useFirestore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <section className="relative overflow-hidden bg-white pt-6 pb-8 md:pt-10 md:pb-12 border-b border-slate-50">
      <div className="max-w-[1440px] 2xl:max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center text-center space-y-6 md:space-y-8">
          
          <motion.div 
             initial={{ opacity: 0, y: -10 }}
             animate={{ opacity: 1, y: 0 }}
             className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-100/50"
          >
            <Star className="h-3.5 w-3.5 text-primary fill-primary animate-pulse" />
            <span className="text-[11px] md:text-xs font-bold tracking-tight text-primary uppercase">
              Punjab's Smartest Platform
            </span>
          </motion.div>

          <div className="space-y-4 max-w-4xl">
            <h1 className="text-[34px] md:text-6xl lg:text-[72px] font-black tracking-tighter text-[#0F172A] leading-[1.05] antialiased">
              Crack Punjab Exams <br/>
              <span className="text-primary italic">With Confidence</span>
            </h1>

            <p className="text-[14px] md:text-xl text-slate-500 font-medium leading-relaxed tracking-tight px-4">
              Mock Tests • Notes • PYQs • Current Affairs • Daily Practice
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 w-full max-w-lg">
             <Button asChild className="flex-1 h-14 md:h-16 px-10 bg-primary hover:bg-blue-700 text-white font-bold text-sm md:text-lg rounded-2xl shadow-xl active:scale-95 transition-all border-none">
                <Link href="/mocks" className="flex items-center justify-center gap-3">
                  <Play className="h-4 w-4 md:h-5 md:w-5 fill-current" /> Start Preparation
                </Link>
             </Button>
             <Button asChild variant="outline" className="flex-1 h-14 md:h-16 rounded-2xl border-2 border-slate-100 bg-white text-[#0F172A] font-bold text-sm md:text-lg shadow-sm active:scale-95">
                <Link href="/exams" className="flex items-center justify-center gap-3">
                   Browse Registry <ChevronRight className="h-4 w-4 md:h-5 md:w-5" />
                </Link>
             </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
