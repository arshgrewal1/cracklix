'use client';

import React, { useMemo, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { 
  ArrowRight,
  Star,
  Zap,
  ShieldCheck,
  Users,
  ClipboardList,
  Target,
  Files,
  Landmark
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { useDoc, useFirestore } from '@/firebase';
import { doc } from 'firebase/firestore';

/**
 * @fileOverview Elite Hero Hub v85.0.
 * FIXED: Removed conflicting style prop from Image with fill property.
 */
export default function Hero() {
  const db = useFirestore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const statsRef = useMemo(() => (db ? doc(db, "settings", "stats") : null), [db]);
  const { data: stats } = useDoc<any>(statsRef);

  const heroImage = "/logo/hero-student.png";

  const features = [
    { title: "Mock Tests", sub: "Exam-focused mock tests", icon: <ClipboardList className="h-4 w-4 md:h-5 md:w-5" />, color: "text-blue-600", bgColor: "bg-blue-50" },
    { title: "Previous Papers", sub: "Previous year question papers", icon: <Files className="h-4 w-4 md:h-5 md:w-5" />, color: "text-emerald-600", bgColor: "bg-emerald-50" },
    { title: "Daily Practice", sub: "Practice daily & stay ahead", icon: <Target className="h-4 w-4 md:h-5 md:w-5" />, color: "text-purple-600", bgColor: "bg-purple-50" },
    { title: "Punjab Exams", sub: "All major Punjab exams at one place", icon: <Landmark className="h-4 w-4 md:h-5 md:w-5" />, color: "text-orange-600", bgColor: "bg-orange-50" }
  ];

  const liveStats = useMemo(() => {
    const format = (val: number, baseline: string) => {
      if (!val || val === 0) return baseline;
      if (val >= 1000) return (val / 1000).toFixed(0) + 'K+';
      return val + '+';
    };

    return [
      { val: format(stats?.totalQuestions, "50K+"), label: "Questions", desc: "High quality practice questions", color: "text-blue-600", circleBg: "bg-blue-600", icon: <Zap className="h-4 w-4 md:h-5 md:w-5 fill-current" /> },
      { val: format(stats?.totalMocks, "500+"), label: "Mock Tests", desc: "Topic wise & full length mocks", color: "text-purple-600", circleBg: "bg-purple-600", icon: <ClipboardList className="h-4 w-4 md:h-5 md:w-5" /> },
      { val: format(stats?.totalBoards, "50+"), label: "Exams", desc: "All major Punjab exams", color: "text-emerald-500", circleBg: "bg-emerald-500", icon: <ShieldCheck className="h-4 w-4 md:h-5 md:w-5" /> },
      { val: format(stats?.totalUsers, "15K+"), label: "Aspirants", desc: "Trust Cracklix for preparation", color: "text-orange-500", circleBg: "bg-orange-500", icon: <Users className="h-4 w-4 md:h-5 md:w-5" /> }
    ];
  }, [stats]);

  if (!mounted) return null;

  return (
    <section className="relative overflow-hidden bg-white pt-6 pb-12 md:pt-16 md:pb-24 text-center lg:text-left w-full border-b border-slate-100 min-h-[520px] lg:min-h-[680px]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        <div className="flex flex-col items-center lg:items-start space-y-6 md:space-y-10">
          
          <div className="space-y-4 md:space-y-6 max-w-4xl min-w-0">
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-100 shadow-sm mx-auto lg:mx-0">
              <Star className="h-3 w-3 text-amber-500 fill-current" />
              <span className="text-[8px] xs:text-[10px] md:text-xs font-black text-[#334155] tracking-widest uppercase truncate max-w-[200px] xs:max-w-none">
                {stats?.totalUsers ? stats.totalUsers.toLocaleString() : "15,000"}+ Aspirants Trust Cracklix
              </span>
            </motion.div>

            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black text-slate-900 leading-[1.05] tracking-tight antialiased break-words">
              Crack Punjab <br />
              <span className="text-blue-600">Government Exams</span> <br />
              With Confidence
            </h1>
            
            <p className="text-xs xs:text-sm md:text-lg text-slate-500 font-medium max-w-xl leading-relaxed mx-auto lg:mx-0">
              Practice bilingual mock tests and prepare for Punjab Government Exams with verified patterns.
            </p>
          </div>

          <div className="relative flex items-center justify-center w-full mt-2">
             <motion.div 
               initial={{ opacity: 0, scale: 0.95 }} 
               animate={{ opacity: 1, scale: 1 }} 
               transition={{ duration: 0.8 }} 
               className="relative z-10 w-full max-w-[220px] sm:max-w-[280px] lg:max-w-[420px] aspect-[4/3]"
             >
                <Image 
                  src={heroImage} 
                  alt="Cracklix Prep" 
                  fill
                  priority
                  className="object-contain"
                />
             </motion.div>
          </div>

          <div className="w-full max-w-5xl grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-6 pt-4">
             {features.map((f, idx) => (
                <Card key={idx} className="border-none shadow-xl shadow-slate-200/40 rounded-2xl md:rounded-[1.8rem] p-4 md:p-6 bg-white border border-slate-100 flex items-center gap-4 md:gap-6 group hover:translate-y-[-4px] transition-all duration-300 min-h-[72px] md:min-h-0">
                   <div className={cn("h-10 w-10 md:h-14 md:w-14 rounded-xl md:rounded-2xl flex items-center justify-center shrink-0 shadow-inner group-hover:scale-110 transition-transform duration-500", f.bgColor, f.color)}>
                      {f.icon}
                   </div>
                   <div className="text-left min-w-0">
                      <h3 className="text-sm md:text-lg font-black text-[#04102B] uppercase tracking-tight leading-none truncate">{f.title}</h3>
                      <p className="text-[8px] xs:text-[10px] md:text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1.5 truncate">{f.sub}</p>
                   </div>
                </Card>
             ))}
          </div>

          <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-3 w-full sm:w-auto pt-6 pb-12 md:pb-16 border-b border-slate-50">
            <Button asChild className="h-14 md:h-16 px-8 md:px-12 bg-[#2563EB] hover:bg-blue-700 text-white font-black text-[10px] xs:text-xs md:text-sm tracking-widest rounded-xl md:rounded-2xl shadow-xl shadow-blue-600/20 border-none transition-all active:scale-95">
              <Link href="/mocks" className="flex items-center justify-center gap-2 md:gap-3">
                Start Free Mock Test <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-14 md:h-16 px-8 md:px-12 border-2 border-[#2563EB] bg-white text-[#2563EB] font-black text-[10px] xs:text-xs md:text-sm tracking-widest rounded-xl md:rounded-2xl transition-all active:scale-95 hover:bg-blue-50">
              <Link href="/exams" className="flex items-center justify-center gap-2 md:gap-3">
                Browse Exams <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>

        <div className="mt-10 md:mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
           {liveStats.map((stat, idx) => (
             <motion.div key={stat.label} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }} viewport={{ once: true }}>
               <Card className="border-none shadow-sm rounded-xl md:rounded-2xl p-4 md:p-6 bg-white border border-slate-100 flex items-center gap-4 md:gap-5 group h-full text-left">
                 <div className={cn("h-10 w-10 md:h-16 md:w-16 rounded-full flex items-center justify-center shrink-0 shadow-lg text-white transition-transform group-hover:scale-110", stat.circleBg)}>
                    {stat.icon}
                 </div>
                 <div className="min-w-0 flex-1 space-y-0.5">
                   <p className={cn("text-lg md:text-2xl font-black tabular-nums leading-none tracking-tight", stat.color)}>{stat.val}</p>
                   <p className="text-[10px] md:text-sm font-bold text-slate-900 leading-none uppercase tracking-tight">{stat.label}</p>
                   <p className="text-[8px] md:text-[10px] font-medium text-slate-400 uppercase tracking-tight truncate">{stat.desc}</p>
                 </div>
               </Card>
             </motion.div>
           ))}
        </div>
      </div>
    </section>
  );
}
