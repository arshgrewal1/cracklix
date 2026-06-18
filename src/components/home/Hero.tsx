'use client';

import React, { useMemo, useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  ClipboardList,
  ShieldCheck,
  Users,
  Zap,
  ChevronRight,
  Star,
  Play
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import Image from "next/image";
import { useDoc, useFirestore } from "@/firebase";
import { doc } from "firebase/firestore";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { PlaceHolderImages } from "@/lib/placeholder-images";

/**
 * @fileOverview High-Fidelity Hero Hub v82.0 (Hardened).
 * FIXED: Standardized stat grid logic to prevent overlap on high-density displays.
 * FIXED: Refactored Skeleton wrappers to use div nodes for hydration compliance.
 */

export default function Hero() {
  const db = useFirestore();
  const [mounted, setMounted] = useState(false);
  const heroImage = PlaceHolderImages.find(img => img.id === 'hero-student');

  useEffect(() => {
    setMounted(true);
  }, []);

  const statsRef = useMemo(
    () => (db ? doc(db, "settings", "stats") : null),
    [db]
  );

  const { data: stats, loading } = useDoc<any>(statsRef);

  const liveStats = useMemo(() => {
    const formatNumber = (num: number) => {
      if (!num) return "0";
      if (num >= 1000) return (num / 1000).toFixed(1) + "k+";
      return num.toString() + "+";
    };

    return [
      {
        id: "q",
        icon: <Zap className="h-4 w-4 md:h-5 md:w-5 text-blue-600" />,
        val: stats ? formatNumber(stats.totalQuestions) : null,
        label: "Questions"
      },
      {
        id: "m",
        icon: <ClipboardList className="h-4 w-4 md:h-5 md:w-5 text-indigo-600" />,
        val: stats ? formatNumber(stats.totalMocks) : null,
        label: "Mock Tests"
      },
      {
        id: "e",
        icon: <ShieldCheck className="h-4 w-4 md:h-5 md:w-5 text-emerald-600" />,
        val: stats ? formatNumber(stats.totalBoards) : null,
        label: "Exams"
      },
      {
        id: "u",
        icon: <Users className="h-4 w-4 md:h-5 md:w-5 text-orange-500" />,
        val: stats ? formatNumber(stats.totalUsers) : null,
        label: "Aspirants"
      }
    ];
  }, [stats]);

  if (!mounted) return null;

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-white to-blue-50 py-10 md:py-20 lg:py-28">
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/5 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          
          <div className="text-left space-y-8 md:space-y-10 relative z-10">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-blue-600/5 border border-blue-600/10 shadow-sm"
            >
              <Star className="h-3.5 w-3.5 text-yellow-500 fill-yellow-500 animate-pulse" />
              <div className="text-[10px] md:text-[12px] font-black uppercase tracking-[0.2em] text-blue-600">
                {loading ? <Skeleton className="h-4 w-24 bg-blue-600/10" /> : <span>{stats?.totalUsers?.toLocaleString() || "0"} Registered Aspirants</span>}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="space-y-4"
            >
              <h1 className="text-4xl sm:text-5xl md:text-7xl font-black text-[#0F172A] leading-[1.05] tracking-tight uppercase">
                Crack Punjab <br />
                <span className="text-blue-600">State Exams</span> <br />
                With Precision.
              </h1>
              <p className="text-base md:text-xl text-slate-500 font-medium max-w-xl leading-relaxed">
                Punjab's smarter preparation node. Access bilingual mock tests, official previous papers, and AI rationalizations verified by Arsh Grewal Management.
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex flex-wrap gap-4 pt-4"
            >
              <Button
                asChild
                className="h-14 md:h-18 px-8 md:px-12 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-widest text-[10px] md:text-[11px] shadow-3xl shadow-blue-600/20 transition-all active:scale-95 border-none"
              >
                <Link href="/mocks">
                  Start Free Mock <ChevronRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>

              <Button
                asChild
                variant="outline"
                className="h-14 md:h-18 px-8 md:px-12 rounded-2xl border-2 border-slate-100 bg-white text-slate-600 font-black uppercase tracking-widest text-[10px] md:text-[11px] transition-all active:scale-95 hover:bg-slate-50 shadow-sm"
              >
                <Link href="/exams">
                  Browse Verticals
                </Link>
              </Button>
            </motion.div>
          </div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="hidden lg:block relative"
          >
             <div className="absolute inset-0 bg-blue-600/10 blur-[100px] rounded-full scale-75" />
             <div className="relative aspect-[4/3] rounded-[3.5rem] overflow-hidden shadow-5xl border border-white/20 bg-white">
                <Image 
                  src={heroImage?.imageUrl || "https://picsum.photos/seed/hero/800/600"} 
                  alt={heroImage?.description || "Cracklix Hero"}
                  fill
                  priority
                  sizes="(max-width: 768px) 100vw, 600px"
                  data-ai-hint={heroImage?.imageHint || "student studying"}
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-blue-900/10 to-transparent" />
                
                <div className="absolute bottom-10 left-10 right-10">
                   <div className="bg-white/80 backdrop-blur-xl p-6 rounded-[2rem] border border-white/50 shadow-2xl flex items-center justify-between">
                      <div className="flex items-center gap-4">
                         <div className="h-12 w-12 bg-primary rounded-xl flex items-center justify-center text-white shadow-xl">
                            <Play className="h-6 w-6 fill-current" />
                         </div>
                         <div className="text-left">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Experience Hub</p>
                            <p className="text-sm font-black text-[#0F172A] uppercase">Virtual CBT Demo</p>
                         </div>
                      </div>
                      <Badge className="bg-emerald-50 text-emerald-600 border-none font-black text-[9px] uppercase">LIVE NOW</Badge>
                   </div>
                </div>
             </div>
          </motion.div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 mt-16 md:mt-24 lg:mt-32">
          {liveStats.map((stat, idx) => (
            <motion.div
              key={stat.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + (idx * 0.1) }}
            >
              <Card
                className="p-5 md:p-10 rounded-[1.8rem] md:rounded-[3rem] bg-white border border-slate-100 shadow-xl shadow-slate-200/40 text-left group hover:translate-y-[-4px] transition-all overflow-hidden"
              >
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 md:gap-6 min-w-0">
                  <div className="h-10 w-10 md:h-16 md:w-16 rounded-xl md:rounded-[1.5rem] bg-slate-50 flex items-center justify-center shrink-0 shadow-inner group-hover:scale-110 transition-transform duration-500">
                    {stat.icon}
                  </div>
                  <div className="text-center sm:text-left min-w-0 flex-1">
                    <div className="text-xl md:text-4xl lg:text-5xl font-headline font-black text-[#0F172A] tabular-nums leading-none tracking-tighter truncate">
                      {loading ? <Skeleton className="h-6 w-12 md:h-10 md:w-24 bg-slate-100" /> : stat.val || "0"}
                    </div>
                    <div className="text-[7px] md:text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 mt-2 md:mt-3 truncate">
                      {stat.label}
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
