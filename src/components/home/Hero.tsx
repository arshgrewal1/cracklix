'use client';

import React, { useMemo, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { 
  Zap, 
  ArrowRight,
  ClipboardList,
  ShieldCheck,
  Star,
  Users,
  LayoutGrid,
  FileText,
  MousePointer2,
  CheckCircle2,
  Newspaper,
  BookOpen
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useDoc, useFirestore } from '@/firebase';
import { doc } from "firebase/firestore";

/**
 * @fileOverview Premium SaaS Hero Redesign v1.0.
 * UPDATED: Removed dark navy and orange. Implemented Blue/Indigo branding.
 * FEATURES: Floating interactive cards and high-fidelity stats bar.
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
      return num.toString() + '+';
    };

    return [
      { id: 'q', icon: <Zap className="text-blue-600 h-5 w-5" />, val: formatNumber(stats?.totalQuestions, "50k+"), label: "Questions", sub: "High quality practice" },
      { id: 'm', icon: <ClipboardList className="text-indigo-600 h-5 w-5" />, val: formatNumber(stats?.totalMocks, "500+"), label: "Mock Tests", sub: "Topic wise & full length" },
      { id: 'e', icon: <ShieldCheck className="text-emerald-600 h-5 w-5" />, val: formatNumber(stats?.totalBoards, "50+"), label: "Exams", sub: "All major Punjab exams" },
      { id: 'u', icon: <Users className="text-orange-600 h-5 w-5" />, val: formatNumber(stats?.totalUsers, "15k+"), label: "Aspirants", sub: "Trust Cracklix for prep" }
    ];
  }, [stats]);

  if (!mounted) return null;

  return (
    <section className="relative w-full bg-[#F8FAFC] overflow-hidden pt-12 pb-24 md:py-24">
      {/* Background Decorative Nodes */}
      <div className="absolute top-0 right-0 w-1/3 h-1/2 bg-blue-500/5 blur-[120px] rounded-full" />
      <div className="absolute bottom-0 left-0 w-1/3 h-1/2 bg-indigo-500/5 blur-[120px] rounded-full" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl relative z-10">
        <div className="grid lg:grid-cols-12 gap-12 md:gap-16 items-center">
          
          {/* LEFT: TEXT CONTENT */}
          <div className="lg:col-span-6 space-y-8 text-left">
            <motion.div
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 shadow-sm"
            >
               <Star className="h-4 w-4 text-blue-600 fill-current" />
               <span className="text-[10px] md:text-xs font-black text-blue-700 tracking-widest uppercase">10,000+ Aspirants Trust Cracklix</span>
            </motion.div>

            <motion.div
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.1 }}
               className="space-y-4"
            >
               <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-[#0F172A] leading-[1.1] tracking-tighter uppercase">
                  Crack Punjab <br/>
                  <span className="text-primary">Government Exams</span> <br/>
                  With Confidence
               </h1>
               <p className="text-base md:text-xl text-slate-500 font-medium max-w-2xl leading-relaxed">
                  Practice bilingual mock tests and prepare for Punjab Government Exams with confidence. Access exam-focused practice, previous papers and performance tracking in one place.
               </p>
            </motion.div>

            {/* CATEGORY PILLS */}
            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               transition={{ delay: 0.2 }}
               className="flex flex-wrap gap-2 md:gap-3"
            >
               {['PSSSB', 'Punjab Police', 'PSTET', 'PSPCL', 'PPSC'].map((p) => (
                  <div key={p} className="px-4 py-2 bg-white border border-slate-100 rounded-full text-[10px] md:text-xs font-black text-slate-500 shadow-sm uppercase tracking-widest">
                     {p}
                  </div>
               ))}
            </motion.div>

            <motion.div
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.3 }}
               className="flex flex-col sm:flex-row gap-4 pt-4"
            >
               <Button asChild className="h-14 md:h-16 px-10 md:px-12 bg-primary hover:bg-blue-700 text-white font-black text-[11px] md:text-xs tracking-[0.2em] rounded-2xl shadow-4xl transition-all border-none uppercase active:scale-95 group">
                  <Link href="/mocks" className="flex items-center gap-3">
                     Start Free Mock Test <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
               </Button>
               <Button asChild variant="outline" className="h-14 md:h-16 px-10 border-slate-200 bg-white text-[#0F172A] hover:bg-slate-50 font-black text-[11px] md:text-xs tracking-[0.2em] rounded-2xl transition-all uppercase active:scale-95 shadow-sm">
                  <Link href="/exams">
                     Browse Exams
                  </Link>
               </Button>
            </motion.div>
          </div>

          {/* RIGHT: HERO ILLUSTRATION & FLOATING CARDS */}
          <div className="lg:col-span-6 relative flex justify-center items-center mt-12 lg:mt-0">
             <div className="relative w-full max-w-[320px] md:max-w-[520px] lg:max-w-[620px]">
                <motion.img 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.8 }}
                  src="/images/hero-student.png" 
                  alt="Cracklix Student" 
                  className="w-full h-auto relative z-10"
                  onError={(e) => {
                     (e.target as HTMLImageElement).src = "https://i.ibb.co/fYJttX5d/Gemini-Generated-Image-n1so6on1so6on1so.png";
                  }}
                />

                {/* Desktop Floating Cards */}
                <div className="hidden md:block">
                   <FloatingCard 
                      href="/mocks" 
                      icon={<Newspaper className="text-blue-600 h-4 w-4" />} 
                      label="📝 Mock Tests" 
                      className="top-10 left-1/2 -translate-x-1/2" 
                   />
                   <FloatingCard 
                      href="/exams" 
                      icon={<Landmark className="text-orange-600 h-4 w-4" />} 
                      label="🏛 Punjab Exams" 
                      className="left-0 top-1/2 -translate-y-1/2" 
                   />
                   <FloatingCard 
                      href="/previous-papers" 
                      icon={<FileText className="text-emerald-600 h-4 w-4" />} 
                      label="📄 Previous Papers" 
                      className="right-0 top-1/2 -translate-y-1/2" 
                   />
                   <FloatingCard 
                      href="/practice" 
                      icon={<Zap className="text-primary h-4 w-4" />} 
                      label="⚡ Free Practice" 
                      className="bottom-5 left-1/2 -translate-x-1/2" 
                   />
                </div>
             </div>
          </div>
        </div>

        {/* Mobile Grid for Cards */}
        <div className="grid grid-cols-2 gap-4 mt-16 md:hidden">
           <MobileActionCard href="/mocks" label="Mock Tests" icon="📝" />
           <MobileActionCard href="/exams" label="Punjab Exams" icon="🏛" />
           <MobileActionCard href="/previous-papers" label="Previous Papers" icon="📄" />
           <MobileActionCard href="/practice" label="Free Practice" icon="⚡" />
        </div>

        {/* STATS SECTION */}
        <div className="mt-16 md:mt-32">
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {liveStats.map((stat, idx) => (
                 <motion.div
                    key={stat.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.1 }}
                 >
                    <Card className="bg-white border border-slate-100 p-8 rounded-3xl text-left flex items-center gap-6 group hover:shadow-4xl transition-all duration-500 overflow-hidden relative shadow-sm">
                       <div className="shrink-0 h-14 w-14 rounded-2xl bg-slate-50 flex items-center justify-center transition-transform group-hover:scale-110 shadow-inner">
                          {stat.icon}
                       </div>
                       <div className="min-w-0">
                          <p className="text-3xl md:text-4xl font-black text-[#0F172A] tabular-nums leading-none mb-2">{stat.val}</p>
                          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{stat.label}</p>
                          <p className="text-[9px] text-slate-400 font-medium mt-1 truncate">{stat.sub}</p>
                       </div>
                    </Card>
                 </motion.div>
              ))}
           </div>
        </div>
      </div>
    </section>
  );
}

function FloatingCard({ href, label, className, icon }: { href: string, label: string, className: string, icon: React.ReactNode }) {
  return (
    <Link href={href}>
      <motion.div 
         whileHover={{ y: -5, scale: 1.05 }}
         className={cn("absolute z-20 bg-white rounded-2xl shadow-xl px-5 py-4 cursor-pointer border border-slate-100 flex items-center gap-3 whitespace-nowrap", className)}
      >
         <span className="font-black text-xs uppercase text-[#0F172A] tracking-widest">{label}</span>
      </motion.div>
    </Link>
  )
}

function MobileActionCard({ href, label, icon }: { href: string, label: string, icon: string }) {
   return (
      <Link href={href}>
         <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center gap-3 active:scale-95 transition-all text-center">
            <span className="text-3xl">{icon}</span>
            <span className="font-black text-[10px] uppercase text-[#0F172A] tracking-widest">{label}</span>
         </div>
      </Link>
   )
}

function Landmark(props: any) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="3" y1="22" x2="21" y2="22" />
      <line x1="6" y1="18" x2="6" y2="11" />
      <line x1="10" y1="18" x2="10" y2="11" />
      <line x1="14" y1="18" x2="14" y2="11" />
      <line x1="18" y1="18" x2="18" y2="11" />
      <polygon points="12 2 3 7 21 7 12 2" />
    </svg>
  );
}
