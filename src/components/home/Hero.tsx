'use client';

import React, { useMemo, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { 
  Zap, 
  Target, 
  ChevronRight, 
  ClipboardList,
  ShieldCheck,
  Star,
  Activity,
  BarChart3
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useDoc, useFirestore } from "@/firebase";
import { doc } from "firebase/firestore";

/**
 * @fileOverview Definitive Full Background Hero v100.0.
 * FIXED: Background image set to full 1024x576 aspect ratio with zero cropping.
 * FIXED: Header clipping resolved via pr-14 buffer for italic characters.
 */

export default function Hero() {
  const db = useFirestore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const statsRef = useMemo(() => (db ? doc(db, "settings", "stats") : null), [db]);
  const { data: stats } = useDoc<any>(statsRef);

  const displayStats = useMemo(() => {
    const qCount = stats?.totalQuestions || 10000;
    const mCount = stats?.totalMocks || 500;
    const eCount = stats?.totalBoards || 8;
    const accuracy = stats?.averageAccuracy || 94;

    const format = (n: number) => n >= 1000 ? `${(n/1000).toFixed(0)},000+` : `${n}+`;

    return [
      { label: "QUESTIONS", val: format(qCount), icon: <Zap className="h-5 w-5 text-primary" /> },
      { label: "MOCK TESTS", val: format(mCount), icon: <ClipboardList className="h-5 w-5 text-orange-400" /> },
      { label: "EXAM HUBS", val: `${eCount}+`, icon: <ShieldCheck className="h-5 w-5 text-blue-400" /> },
      { label: "ACCURACY", val: `${accuracy}%`, icon: <Target className="h-5 w-5 text-emerald-500" /> }
    ];
  }, [stats]);

  if (!mounted) return null;

  return (
    <section className="relative w-full bg-[#020817] overflow-hidden flex flex-col items-center">
      {/* FULL ASPECT BACKGROUND WRAPPER - NO CLIPPING */}
      <div className="w-full relative aspect-[1024/576] min-h-[500px] md:min-h-0">
        <img 
          src="https://i.ibb.co/LXgcLVVq/Gemini-Generated-Image-n1so6on1so6on1so.png" 
          alt="Golden Temple Night" 
          className="absolute inset-0 w-full h-full object-cover md:object-fill"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#020817]/80 via-[#020817]/40 to-transparent" />
        
        {/* TEXT CONTENT LAYER */}
        <div className="absolute inset-0 z-20 flex items-center">
           <div className="container mx-auto px-4 md:px-12 max-w-7xl">
              <div className="max-w-3xl space-y-10 md:space-y-14 text-left">
                 <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-xl"
                 >
                    <Star className="h-4 w-4 text-orange-500 fill-current" />
                    <span className="text-[10px] md:text-xs font-black text-white uppercase tracking-widest">
                       Punjab's #1 Preparation Hub
                    </span>
                 </motion.div>

                 <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="space-y-6"
                 >
                    <h1 className="text-4xl md:text-8xl font-black text-white leading-[0.9] tracking-tighter uppercase">
                       <span className="block pr-14">Prepare Smarter.</span>
                       <span className="text-primary italic pr-14">GOVT EXAMS.</span>
                    </h1>
                    <p className="text-base md:text-2xl text-slate-200 font-medium max-w-2xl leading-relaxed pr-10 antialiased drop-shadow-lg">
                       Full Access to PSSSB, Police & PPSC Mock Tests. Verified Official Patterns & AI-Logic Solutions.
                    </p>
                 </motion.div>

                 <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="flex flex-col sm:flex-row gap-4 pt-4"
                 >
                    <Button asChild className="h-16 md:h-20 px-10 md:px-14 bg-primary hover:bg-orange-600 text-white font-black uppercase text-xs md:text-sm tracking-[0.2em] rounded-2xl shadow-4xl gap-4 border-none transition-all active:scale-95">
                       <Link href="/mocks">
                          Start Practice <Zap className="h-5 w-5 md:h-6 md:w-6 fill-current" />
                       </Link>
                    </Button>
                    <Button asChild variant="outline" className="h-16 md:h-20 px-10 md:px-14 border-white/20 bg-white/5 hover:bg-white/10 text-white font-black uppercase text-xs md:text-sm tracking-[0.2em] rounded-2xl transition-all backdrop-blur-md">
                       <Link href="/exams">
                          Explore Hubs
                       </Link>
                    </Button>
                 </motion.div>
              </div>
           </div>
        </div>
      </div>

      {/* STATS OVERLAY HUB (Restored below the image for stability) */}
      <div className="w-full bg-[#020817] py-12 md:py-16 border-t border-white/5">
         <div className="container mx-auto px-4 md:px-12 max-w-7xl">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-10">
               {displayStats.map((s, i) => (
                  <Card key={i} className="bg-white/5 border border-white/10 p-6 md:p-8 rounded-[2rem] text-center md:text-left space-y-4 hover:bg-white/10 transition-all group">
                     <div className="h-10 w-10 md:h-12 md:w-12 rounded-xl bg-white/5 flex items-center justify-center mx-auto md:mx-0 shadow-inner group-hover:scale-110 transition-transform">
                        {s.icon}
                     </div>
                     <div className="space-y-1">
                        <p className="text-2xl md:text-4xl font-black text-white tracking-tighter tabular-nums leading-none">{s.val}</p>
                        <p className="text-[8px] md:text-[10px] font-black uppercase text-slate-500 tracking-[0.3em]">{s.label}</p>
                     </div>
                  </Card>
               ))}
            </div>
         </div>
      </div>
    </section>
  );
}
