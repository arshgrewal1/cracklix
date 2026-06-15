'use client';

import React, { useMemo, useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  ClipboardList,
  ShieldCheck,
  Users,
  Zap,
  ChevronRight,
  BookOpen,
  FileText,
  Star,
  MonitorPlay,
  CheckSquare,
  GraduationCap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { useDoc, useFirestore } from "@/firebase";
import { doc } from "firebase/firestore";
import { cn } from "@/lib/utils";
import Logo from "@/components/brand/Logo";

/**
 * @fileOverview Final Screenshot-Matched Hero Hub v8.0.
 * UPDATED: Precise mobile layout with end-to-end alignment and Cracklix branding.
 */

export default function Hero() {
  const db = useFirestore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const statsRef = useMemo(() => (db ? doc(db, "settings", "stats") : null), [db]);
  const { data: stats } = useDoc<any>(statsRef);

  const liveStats = useMemo(() => {
    const formatNumber = (num: number, fallback: string) => {
      if (!num) return fallback;
      if (num >= 1000) return (num / 1000).toFixed(0) + 'k+';
      return num + "+";
    };

    return [
      { id: "lc", icon: <MonitorPlay className="h-4 w-4 md:h-5 md:w-5 text-blue-600" />, val: "500+", label: "Live Classes" },
      { id: "pq", icon: <FileText className="h-4 w-4 md:h-5 md:w-5 text-emerald-600" />, val: formatNumber(stats?.totalQuestions, "10,000+"), label: "Practice Questions" },
      { id: "mt", icon: <ClipboardList className="h-4 w-4 md:h-5 md:w-5 text-indigo-600" />, val: formatNumber(stats?.totalMocks, "100+"), label: "Mock Tests" },
      { id: "tf", icon: <GraduationCap className="h-4 w-4 md:h-5 md:w-5 text-orange-500" />, val: "Top Faculty", label: "Expert Guidance" }
    ];
  }, [stats]);

  if (!mounted) return null;

  return (
    <section className="relative overflow-hidden bg-[#F8FAFC] pt-4 md:pt-12 pb-24 border-b border-slate-100 text-left">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* 1. TOP HEADER (LOGO + TRUST) */}
        <div className="flex items-center justify-between mb-8 md:mb-12">
           <Logo imgClassName="h-8 md:h-12" />
           <div className="bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-2">
              <Star className="h-3.5 w-3.5 text-amber-400 fill-current" />
              <div className="text-left">
                 <p className="text-[10px] font-black text-[#0F172A] leading-none">10,000+</p>
                 <p className="text-[7px] font-bold text-slate-400 uppercase tracking-tighter">Students Trust Us</p>
              </div>
           </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-10 md:gap-16 items-center">
          
          <div className="space-y-6 md:space-y-8 order-2 lg:order-1">
            <div className="space-y-3 md:space-y-4">
               <h1 className="text-3xl md:text-6xl font-black text-[#0F172A] leading-[1.1] tracking-tight uppercase">
                 Your Journey to <br />
                 <span className="text-blue-600">Government Job</span> <br />
                 Starts Here!
               </h1>
               <p className="text-sm md:text-lg text-slate-500 font-medium max-w-xl">
                 Best preparation platform for all major <br className="hidden md:block" /> Punjab Government Exams
               </p>
            </div>

            {/* BOARD PILLS */}
            <div className="flex flex-wrap items-center gap-2 md:gap-4 text-[10px] md:text-sm font-bold text-slate-400 uppercase tracking-widest bg-white/50 p-2 rounded-2xl border border-slate-100 w-fit">
               <span>PSSSB</span> <span className="text-slate-200">•</span>
               <span>PCS</span> <span className="text-slate-200">•</span>
               <span>PSPCL</span> <span className="text-slate-200">•</span>
               <span>CTET</span> <span className="text-slate-200">•</span>
               <span>PSTET</span>
            </div>

            {/* 3. ILLUSTRATION HUB - CENTERED & EXPANDED FOR MOBILE */}
            <div className="relative flex justify-center py-6 w-full">
              <div className="relative w-full max-w-[320px] sm:max-w-[420px] lg:max-w-[560px] xl:max-w-[620px]">
                 
                 {/* Floating Background Blobs */}
                 <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-blue-100/30 blur-[60px] rounded-full -z-10" />

                 <motion.img
                   initial={{ opacity: 0, scale: 0.95 }}
                   animate={{ opacity: 1, scale: 1 }}
                   transition={{ duration: 0.8 }}
                   src="/images/hero-student.png"
                   alt="Cracklix Student"
                   className="w-full h-auto object-contain relative z-10 drop-shadow-2xl"
                 />

                 {/* FLOATING FEATURE CARDS - SCREENSHOT POSITIONS */}
                 <FloatingNode icon={<MonitorPlay className="text-blue-600 h-3 w-3 md:h-4 md:w-4" />} label="Live Classes" className="top-4 -left-4 md:-left-12" />
                 <FloatingNode icon={<Zap className="text-indigo-600 h-3 w-3 md:h-4 md:w-4" />} label="Mock Tests" className="bottom-24 -left-6 md:-left-16" />
                 <FloatingNode icon={<FileText className="text-purple-600 h-3 w-3 md:h-4 md:w-4" />} label="Study Material" className="top-8 -right-4 md:-right-12" />
                 <FloatingNode icon={<ClipboardList className="text-orange-500 h-3 w-3 md:h-4 md:w-4" />} label="Previous Papers" className="bottom-28 -right-6 md:-right-16" />
              </div>
            </div>

            {/* ACTION BUTTONS */}
            <div className="flex flex-col gap-3 md:pt-4">
              <Button asChild className="w-full md:w-80 h-14 md:h-16 bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-widest text-xs md:text-sm rounded-2xl shadow-xl shadow-blue-500/20 gap-4 group border-none">
                <Link href="/mocks">
                  <div className="flex-1 flex items-center justify-center gap-3">
                     <BookOpen className="h-5 w-5" /> Start Learning
                  </div>
                  <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center group-hover:translate-x-1 transition-transform">
                     <ChevronRight className="h-5 w-5" />
                  </div>
                </Link>
              </Button>

              <Button asChild variant="outline" className="w-full md:w-80 h-14 md:h-16 rounded-2xl border-2 border-blue-600 bg-white text-blue-600 font-black uppercase tracking-widest text-xs md:text-sm hover:bg-blue-50 transition-all gap-3">
                <Link href="/mocks">
                  <CheckSquare className="h-5 w-5" /> Take Free Mock Test
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* 4. STATS GRID - WHITE CARDS */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-16 md:mt-24">
          {liveStats.map((stat) => (
            <Card key={stat.id} className="p-4 md:p-8 rounded-[1.5rem] md:rounded-[2rem] bg-white border border-slate-100 shadow-xl flex flex-col items-center text-center gap-2 md:gap-3 group hover:shadow-2xl transition-all">
              <div className="h-8 w-8 md:h-14 md:w-14 rounded-xl bg-slate-50 flex items-center justify-center shrink-0 shadow-inner group-hover:scale-110 transition-transform">
                {stat.icon}
              </div>
              <div className="space-y-0.5">
                <p className="text-lg md:text-3xl font-black text-[#0F172A] leading-none tracking-tighter uppercase">{stat.val}</p>
                <p className="text-[7px] md:text-sm font-black text-slate-400 uppercase tracking-tight">{stat.label}</p>
              </div>
            </Card>
          ))}
        </div>

        {/* 5. BOTTOM SUCCESS RIBBON */}
        <div className="mt-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-[2rem] p-4 md:p-6 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl">
           <div className="flex -space-x-3 overflow-hidden">
              {[1,2,3,4].map(i => (
                 <img key={i} src={`https://picsum.photos/seed/stud${i}/100/100`} className="h-10 w-10 md:h-12 md:w-12 rounded-full border-2 border-white object-cover" alt="Student" />
              ))}
           </div>
           <div className="text-center md:text-right text-white space-y-1">
              <p className="text-xs md:text-lg font-black uppercase tracking-tight">Join 10,000+ Successful Aspirants Today!</p>
              <p className="text-[8px] md:text-xs font-bold text-white/70 uppercase tracking-widest">Punjab's #1 Dedicated Learning Center</p>
           </div>
        </div>

      </div>
    </section>
  );
}

function FloatingNode({ icon, label, className }: { icon: React.ReactNode, label: string, className: string }) {
  return (
    <motion.div
      animate={{ y: [0, -8, 0] }}
      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      className={cn("absolute z-20 bg-white px-2 py-1.5 md:px-5 md:py-3 rounded-lg md:rounded-2xl shadow-2xl border border-slate-100 flex items-center gap-1.5 md:gap-3 active:scale-95 transition-all", className)}
    >
       <div className="h-5 w-5 md:h-8 md:w-8 rounded-lg bg-slate-50 flex items-center justify-center shrink-0">
          {icon}
       </div>
       <span className="text-[7px] md:text-xs font-black text-[#0F172A] uppercase tracking-tight whitespace-nowrap">{label}</span>
    </motion.div>
  );
}

