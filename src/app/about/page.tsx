"use client"

import React, { useMemo, useState, useEffect } from "react"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import { motion } from "framer-motion"
import { 
  ShieldCheck, 
  Target, 
  Zap, 
  ChevronRight, 
  Sparkles, 
  Quote, 
  ArrowRight,
  BookOpen,
  Users,
  Compass,
  Trophy,
  History,
  Landmark,
  Loader2
} from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { useFirestore, useDoc } from "@/firebase"
import { doc } from "firebase/firestore"
import { Skeleton } from "@/components/ui/skeleton"

/**
 * @fileOverview Refined Founder's Story Hub v14.0.
 * FIXED: Consolidated React imports and resolved cloneElement context.
 */

export default function AboutPage() {
  const db = useFirestore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const founderImg = "https://i.ibb.co/5hkxTtKS/Whats-App-Image-2026-05-28-at-10-31-36-AM.jpg";

  // STABILIZED DATA LISTENERS
  const statsRef = useMemo(() => (db ? doc(db, "settings", "stats") : null), [db]);
  const { data: stats, loading: statsLoading } = useDoc<any>(statsRef);

  const liveStats = useMemo(() => {
    if (!mounted || !stats) return { students: "0", mcqs: "0", hubs: "0" };
    
    const formatNumber = (num: number) => {
       if (!num) return "0";
       if (num >= 1000) return (num / 1000).toFixed(1) + 'k+';
       return num.toString();
    }
    
    return {
      students: formatNumber(stats.totalUsers || 0),
      mcqs: formatNumber(stats.totalQuestions || 0),
      hubs: (stats.totalBoards || 0).toString() + "+"
    };
  }, [stats, mounted]);

  return (
    <div className="min-h-screen bg-[#020817] text-white font-body overflow-x-hidden selection:bg-primary/30 text-left">
      <Navbar />
      
      <main>
        {/* 1. VISIONARY HERO */}
        <section className="relative pt-20 pb-16 md:pt-32 md:pb-32 overflow-hidden">
           <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/10 blur-[120px] rounded-full" />
           <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full" />
           
           <div className="container mx-auto px-4 md:px-6 relative z-10">
              <div className="max-w-5xl mx-auto text-center space-y-6 md:space-y-10">
                 <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="inline-flex items-center gap-3 px-5 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-xl mb-2"
                 >
                    <Sparkles className="h-3 w-3 text-primary animate-pulse" />
                    <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em] text-primary">The Visionary Origin</span>
                 </motion.div>

                 <motion.h1 
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-3xl md:text-6xl font-headline font-black leading-[1.1] tracking-tighter uppercase"
                 >
                    From a Student&apos;s Dream <br/>
                    <span className="text-primary italic">To a Nation of Learners</span>
                 </motion.h1>

                 <motion.p 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-sm md:text-lg text-slate-400 font-medium max-w-2xl mx-auto leading-relaxed"
                 >
                    The journey of one student&apos;s vision to empower thousands of students across Punjab.
                 </motion.p>
              </div>
           </div>
        </section>

        {/* 2. FOUNDER PROFILE AREA */}
        <section className="py-16 md:py-24 relative border-y border-white/5 bg-white/[0.02]">
           <div className="container mx-auto px-4 md:px-6 max-w-6xl">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 md:gap-20 items-center">
                 
                 <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className="lg:col-span-5 relative"
                 >
                    <div className="absolute -inset-10 bg-primary/20 blur-[100px] rounded-full opacity-50" />
                    <div className="relative aspect-[4/5] rounded-[2.5rem] md:rounded-[3.5rem] overflow-hidden border border-white/10 shadow-5xl group bg-[#0B1528]">
                       <img 
                         src={founderImg} 
                         className="w-full h-full object-cover grayscale transition-all duration-1000 group-hover:grayscale-0 group-hover:scale-105" 
                         alt="Arshdeep Singh Grewal"
                         referrerPolicy="no-referrer"
                       />
                       <div className="absolute inset-0 bg-gradient-to-t from-[#020817] via-transparent to-transparent opacity-80" />
                       <div className="absolute bottom-8 left-8 right-8 space-y-1">
                          <p className="text-2xl font-headline font-black uppercase tracking-tight">Arsh Grewal</p>
                          <p className="text-primary font-black uppercase text-[8px] tracking-[0.4em]">Founder & Visionary</p>
                       </div>
                    </div>
                 </motion.div>

                 <motion.div 
                    initial={{ opacity: 0, x: 50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    className="lg:col-span-7 space-y-8 text-left"
                 >
                    <div className="space-y-4">
                       <h2 className="text-2xl md:text-3xl font-headline font-black uppercase tracking-tight leading-none">
                          The <span className="text-primary">Journey</span> Began with a Challenge.
                       </h2>
                       <div className="h-1 w-16 bg-primary rounded-full" />
                    </div>

                    <div className="space-y-6 text-slate-300 text-[13px] md:text-base font-medium leading-relaxed antialiased">
                       <p>
                          Every meaningful journey begins with a challenge, and <span className="text-white font-bold">Cracklix</span> is no exception.
                       </p>
                       <p>
                          As a student navigating the demanding world of competitive examinations, <span className="text-white font-bold italic underline decoration-primary underline-offset-8">Arshdeep Singh Grewal</span> witnessed a common struggle shared by countless students — the lack of a single, reliable destination for quality educational resources.
                       </p>
                       <p>
                          Students spent hours searching across multiple platforms for previous year papers and authentic study material, often losing valuable time and motivation. Driven by a belief that every student deserves equal access, he founded Cracklix to simplify preparation.
                       </p>
                    </div>

                    {/* LIVE IMPACT AREA */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6">
                       <ImpactNode 
                          label="LIVE STUDENTS" 
                          val={mounted ? liveStats.students : "---"} 
                          icon={<Users className="text-primary h-4 w-4" />} 
                          loading={statsLoading || !mounted}
                       />
                       <ImpactNode 
                          label="VERIFIED MCQs" 
                          val={mounted ? liveStats.mcqs : "---"} 
                          icon={<ShieldCheck className="text-emerald-500 h-4 w-4" />} 
                          loading={statsLoading || !mounted}
                       />
                       <ImpactNode 
                          label="OFFICIAL HUBS" 
                          val={mounted ? liveStats.hubs : "---"} 
                          icon={<Landmark className="text-blue-500 h-4 w-4" />} 
                          loading={statsLoading || !mounted}
                       />
                    </div>
                 </motion.div>
              </div>
           </div>
        </section>

        {/* 3. INTERACTIVE HISTORY (RECONSTRUCTED PATTERN) */}
        <section className="py-20 md:py-32 bg-white/[0.01]">
           <div className="container mx-auto px-4 max-w-5xl">
              <div className="text-center space-y-3 mb-16 md:mb-32">
                 <h2 className="text-2xl md:text-3xl font-headline font-black uppercase tracking-[0.2em] leading-none">The <span className="text-primary">Evolution</span></h2>
                 <p className="text-slate-500 font-bold uppercase text-[9px] md:text-[10px] tracking-[0.5em]">Timeline of Excellence</p>
              </div>

              <div className="space-y-16 md:space-y-32">
                 <TimelineItem 
                    icon={<Zap />} 
                    title="Student Struggle" 
                    desc="Witnessing the gap in reliable, high-quality exam preparation resources while navigating competitive exams." 
                 />
                 <TimelineItem 
                    icon={<Compass />} 
                    title="The Vision" 
                    desc="Envisioning a centralized area where technology and educational precision eliminate all preparation barriers." 
                    right 
                 />
                 <TimelineItem 
                    icon={<Sparkles />} 
                    title="Creation of Cracklix" 
                    desc="Launched as a student-centric commitment to confidence, clarity, and convenience." 
                 />
                 <TimelineItem 
                    icon={<Target />} 
                    title="Student Impact" 
                    desc="Empowering thousands of learners across Punjab to unlock their potential and achieve their dream careers." 
                    right 
                 />
                 <TimelineItem 
                    icon={<History />} 
                    title="Future Growth" 
                    desc="Building India's most trusted educational area, ensuring quality learning for all." 
                 />
              </div>
           </div>
        </section>

        {/* 4. QUOTE AREA */}
        <section className="py-24 md:py-40 relative overflow-hidden text-center bg-[#020817]">
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-5xl h-[300px] bg-primary/10 blur-[160px] rounded-full opacity-30" />
           <div className="container mx-auto px-4 relative z-10">
              <motion.div
                 initial={{ opacity: 0, scale: 0.95 }}
                 whileInView={{ opacity: 1, scale: 1 }}
                 viewport={{ once: true }}
                 className="space-y-10"
              >
                 <Quote className="h-10 w-10 md:h-16 md:w-16 text-primary opacity-20 mx-auto" />
                 <h3 className="text-xl md:text-4xl font-headline font-black text-white italic leading-tight max-w-4xl mx-auto tracking-tight">
                    &quot;Great achievements begin with a single decision — the decision to keep moving forward despite every obstacle.&quot;
                 </h3>
                 <div className="space-y-1">
                    <p className="text-base md:text-lg font-black uppercase text-primary tracking-widest">Arshdeep Singh Grewal</p>
                    <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.4em]">Founder of Cracklix</p>
                 </div>
              </motion.div>
           </div>
        </section>

        {/* 5. MISSION & VISION AREAS */}
        <section className="py-20 md:pb-32">
           <div className="container mx-auto px-4 md:px-6 max-w-6xl">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
                 <ValueCard 
                    title="Our Mission" 
                    desc="To provide students with accessible, reliable, and innovative educational resources that enable smarter preparation and greater confidence." 
                    icon={<Zap className="h-5 w-5 text-primary" />}
                 />
                 <ValueCard 
                    title="Our Vision" 
                    desc="To build one of India's most trusted educational areas, empowering learners to achieve their goals through technology solutions." 
                    icon={<Target className="h-5 w-5 text-blue-500" />}
                 />
              </div>
           </div>
        </section>

        {/* 6. CTA */}
        <section className="pb-32 md:pb-48">
           <div className="container mx-auto px-4 text-center">
              <div className="bg-gradient-to-br from-primary to-orange-600 rounded-[2.5rem] md:rounded-[4rem] p-10 md:p-20 space-y-8 shadow-5xl relative overflow-hidden group">
                 <div className="absolute top-0 right-0 p-12 opacity-10 rotate-12 group-hover:scale-110 transition-transform duration-1000">
                    <Trophy className="h-48 w-48 text-white" />
                 </div>
                 <div className="relative z-10 space-y-6">
                    <h2 className="text-3xl md:text-5xl font-headline font-black uppercase text-white tracking-tight leading-none">Ready to start <br/> your journey?</h2>
                    <p className="text-white/80 text-sm md:text-base font-medium max-w-lg mx-auto leading-relaxed">Join the Cracklix hub today and experience high-quality preparation.</p>
                    <Button asChild className="h-14 md:h-16 px-10 md:px-14 bg-white text-[#0B1528] hover:bg-slate-100 font-black uppercase text-[10px] md:text-[11px] tracking-[0.2em] rounded-xl md:rounded-2xl shadow-3xl gap-3 transition-all active:scale-95 border-none">
                       <Link href="/login">Join the Cracklix Journey <ChevronRight className="h-5 w-5" /></Link>
                    </Button>
                 </div>
              </div>
           </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

function ImpactNode({ label, val, icon, loading }: any) {
   return (
      <div className="bg-white/5 border border-white/10 rounded-[1.5rem] p-4 flex items-center gap-4 shadow-xl group hover:border-primary/30 transition-all">
         <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform shrink-0">
            {icon}
         </div>
         <div className="text-left min-w-0">
            {loading ? (
               <Skeleton className="h-6 w-12 bg-white/10" />
            ) : (
               <p className="text-base md:text-xl font-headline font-black text-white leading-none tabular-nums truncate">{val}</p>
            )}
            <p className="text-[8px] font-black uppercase text-slate-500 tracking-widest mt-1.5 truncate">{label}</p>
         </div>
      </div>
   )
}

function ValueCard({ icon, title, desc }: any) {
  return (
    <Card className="bg-white/5 border-white/10 backdrop-blur-xl p-8 md:p-12 rounded-[2.5rem] shadow-4xl text-left space-y-6 group hover:border-primary/20 transition-all duration-500 h-full flex flex-col relative overflow-hidden">
       <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform">{icon}</div>
       <div className="h-10 w-10 rounded-[1rem] bg-white/5 border border-white/10 flex items-center justify-center shadow-inner group-hover:bg-primary/5 transition-colors">
          {icon}
       </div>
       <div className="space-y-3 flex-1">
          <h3 className="text-xl md:text-2xl font-headline font-black text-white uppercase tracking-tight group-hover:text-primary transition-colors">{title}</h3>
          <p className="text-[13px] md:text-base text-slate-400 font-medium leading-relaxed">{desc}</p>
       </div>
    </Card>
  )
}

function TimelineItem({ icon, title, desc, right = false }: any) {
   return (
      <motion.div 
         initial={{ opacity: 0, x: right ? 30 : -30 }}
         whileInView={{ opacity: 1, x: 0 }}
         viewport={{ once: true }}
         className={cn(
            "flex flex-col md:flex-row items-center gap-8 md:gap-0 relative",
            right && "md:flex-row-reverse"
         )}
      >
         {/* 1. CONTENT BLOCK */}
         <div className={cn(
            "md:w-1/2 space-y-2",
            right ? "md:pl-16 md:text-left" : "md:pr-16 md:text-right"
         )}>
            <h4 className="text-lg md:text-2xl font-headline font-black text-white uppercase tracking-tight leading-tight">{title}</h4>
            <p className="text-slate-400 text-[11px] md:text-sm font-medium leading-relaxed max-w-sm mx-auto md:mx-0 lg:max-w-md">
               {desc}
            </p>
         </div>

         {/* 2. CENTER ICON NODE */}
         <div className="flex justify-center relative md:w-0 items-center">
            <div className={cn(
               "h-14 w-14 md:h-20 md:w-20 rounded-[1.5rem] bg-white/5 border border-white/10 flex items-center justify-center text-primary shadow-2xl backdrop-blur-xl z-10 shrink-0 group hover:border-primary transition-all",
               right ? "md:-translate-x-1/2" : "md:translate-x-1/2"
            )}>
               {React.cloneElement(icon, { className: "h-6 w-6 md:h-8 md:w-8 fill-current" })}
            </div>
            {/* Visual connector line for continuity */}
            <div className="absolute top-full w-px h-16 md:h-32 bg-gradient-to-b from-white/20 to-transparent -z-0 hidden md:block" />
         </div>

         {/* 3. BALANCE HALF (EMPTY) */}
         <div className="md:w-1/2 hidden md:block" />
      </motion.div>
   )
}
