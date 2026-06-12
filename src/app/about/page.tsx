
"use client"

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
  Landmark
} from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import React, { useMemo } from "react"
import { useFirestore, useDoc } from "@/firebase"
import { doc } from "firebase/firestore"
import { Skeleton } from "@/components/ui/skeleton"

/**
 * @fileOverview Premium Founder's Story Hub v4.0.
 * UPDATED: Integrated 3-node live status synchronization (Aspirants, MCQs, Hubs).
 */

export default function AboutPage() {
  const db = useFirestore();
  const founderImg = "https://i.ibb.co/5hkxTtKS/Whats-App-Image-2026-05-28-at-10-31-36-AM.jpg";

  // STABILIZED DATA LISTENERS
  const statsRef = useMemo(() => (db ? doc(db, "settings", "stats") : null), [db]);
  const { data: stats, loading: statsLoading } = useDoc<any>(statsRef);

  const liveStats = useMemo(() => {
    // If stats document doesn't exist yet, show standard benchmarks
    if (!stats) return { aspirants: "15k+", mcqs: "10k+", hubs: "8+" };
    
    const formatNumber = (num: number) => {
       if (!num) return "0";
       if (num >= 1000) return (num / 1000).toFixed(1) + 'k+';
       return num.toString();
    }
    
    return {
      aspirants: formatNumber(stats.totalUsers || 15000),
      mcqs: formatNumber(stats.totalQuestions || 10000),
      hubs: (stats.totalBoards || 8).toString() + "+"
    };
  }, [stats]);

  return (
    <div className="min-h-screen bg-[#020817] text-white font-body overflow-x-hidden selection:bg-primary/30 text-left">
      <Navbar />
      
      <main>
        {/* 1. VISIONARY HERO */}
        <section className="relative pt-24 pb-20 md:pt-40 md:pb-40 overflow-hidden">
           <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/10 blur-[120px] rounded-full" />
           <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full" />
           
           <div className="container mx-auto px-4 md:px-6 relative z-10">
              <div className="max-w-5xl mx-auto text-center space-y-8 md:space-y-12">
                 <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-xl mb-4"
                 >
                    <Sparkles className="h-4 w-4 text-primary animate-pulse" />
                    <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.3em] text-primary">The Visionary Origin</span>
                 </motion.div>

                 <motion.h1 
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-4xl md:text-8xl font-headline font-black leading-[0.95] tracking-tighter uppercase"
                 >
                    From a Student&apos;s Dream <br/>
                    <span className="text-primary italic">To a Nation of Learners</span>
                 </motion.h1>

                 <motion.p 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-lg md:text-2xl text-slate-400 font-medium max-w-2xl mx-auto leading-relaxed"
                 >
                    The journey of one student&apos;s vision to empower thousands of aspirants across Punjab.
                 </motion.p>
              </div>
           </div>
        </section>

        {/* 2. FOUNDER PROFILE HUB - REAL DATA INGESTION */}
        <section className="py-20 md:py-32 relative">
           <div className="container mx-auto px-4 md:px-6 max-w-7xl">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 md:gap-20 items-center">
                 
                 <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className="lg:col-span-5 relative"
                 >
                    <div className="absolute -inset-10 bg-primary/20 blur-[100px] rounded-full opacity-50" />
                    <div className="relative aspect-[4/5] rounded-[3rem] md:rounded-[4rem] overflow-hidden border border-white/10 shadow-5xl group bg-[#0B1528]">
                       <img 
                         src={founderImg} 
                         className="w-full h-full object-cover grayscale transition-all duration-1000 group-hover:grayscale-0 group-hover:scale-105" 
                         alt="Arshdeep Singh Grewal"
                         referrerPolicy="no-referrer"
                       />
                       <div className="absolute inset-0 bg-gradient-to-t from-[#020817] via-transparent to-transparent opacity-80" />
                       <div className="absolute bottom-10 left-10 right-10 space-y-2">
                          <p className="text-3xl font-headline font-black uppercase tracking-tight">Arsh Grewal</p>
                          <p className="text-primary font-black uppercase text-[10px] tracking-[0.4em]">Founder & Visionary</p>
                       </div>
                    </div>
                 </motion.div>

                 <motion.div 
                    initial={{ opacity: 0, x: 50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    className="lg:col-span-7 space-y-10 text-left"
                 >
                    <div className="space-y-6">
                       <h2 className="text-3xl md:text-5xl font-headline font-black uppercase tracking-tight leading-none">
                          The <span className="text-primary">Journey</span> Began with a Challenge.
                       </h2>
                       <div className="h-1.5 w-24 bg-primary rounded-full" />
                    </div>

                    <div className="space-y-8 text-slate-300 text-base md:text-xl font-medium leading-relaxed antialiased">
                       <p>
                          Every meaningful journey begins with a challenge, and <span className="text-white font-bold">Cracklix</span> is no exception.
                       </p>
                       <p>
                          As a student navigating the demanding world of competitive examinations, <span className="text-white font-bold italic underline decoration-primary underline-offset-8">Arshdeep Singh Grewal</span> witnessed a common struggle shared by countless aspirants — the lack of a single, reliable destination for quality educational resources.
                       </p>
                       <p>
                          Students spent hours searching across multiple platforms for previous year papers and authentic study material, often losing valuable time and motivation. Driven by a belief that every student deserves equal access, he founded Cracklix to simplify preparation.
                       </p>
                    </div>

                    {/* REAL IMPACT NODES - LIVE STATUS */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6">
                       <ImpactNode 
                          label="LIVE ASPIRANTS" 
                          val={liveStats.aspirants} 
                          icon={<Users className="text-primary" />} 
                          loading={statsLoading}
                       />
                       <ImpactNode 
                          label="VERIFIED MCQs" 
                          val={liveStats.mcqs} 
                          icon={<ShieldCheck className="text-emerald-500" />} 
                          loading={statsLoading}
                       />
                       <ImpactNode 
                          label="OFFICIAL HUBS" 
                          val={liveStats.hubs} 
                          icon={<Landmark className="text-blue-500" />} 
                          loading={statsLoading}
                       />
                    </div>
                 </motion.div>
              </div>
           </div>
        </section>

        {/* 3. INTERACTIVE TIMELINE */}
        <section className="py-24 md:py-40 bg-white/5 border-y border-white/5">
           <div className="container mx-auto px-4 max-w-6xl">
              <div className="text-center space-y-4 mb-20 md:mb-32">
                 <h2 className="text-3xl md:text-5xl font-headline font-black uppercase tracking-widest leading-none">The <span className="text-primary">Evolution</span></h2>
                 <p className="text-slate-500 font-bold uppercase text-[10px] md:text-xs tracking-[0.5em]">Timeline of Excellence</p>
              </div>

              <div className="space-y-12 md:space-y-24">
                 <TimelineItem 
                    icon={<Zap />} 
                    title="Student Struggle" 
                    desc="Witnessing the gap in reliable, high-quality exam preparation resources while navigating competitive exams." 
                 />
                 <TimelineItem 
                    icon={<Compass />} 
                    title="The Vision" 
                    desc="Envisioning a centralized hub where technology and educational precision eliminate all preparation barriers." 
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
                    desc="Building India's most trusted educational ecosystem, ensuring quality learning for all." 
                 />
              </div>
           </div>
        </section>

        {/* 4. QUOTE HUB */}
        <section className="py-32 md:py-60 relative overflow-hidden text-center">
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-5xl h-[400px] bg-primary/20 blur-[160px] rounded-full opacity-30" />
           <div className="container mx-auto px-4 relative z-10">
              <motion.div
                 initial={{ opacity: 0, scale: 0.95 }}
                 whileInView={{ opacity: 1, scale: 1 }}
                 viewport={{ once: true }}
                 className="space-y-12"
              >
                 <Quote className="h-16 w-16 md:h-24 md:w-24 text-primary opacity-20 mx-auto" />
                 <h3 className="text-3xl md:text-6xl font-headline font-black text-white italic leading-tight max-w-4xl mx-auto">
                    &quot;Great achievements begin with a single decision — the decision to keep moving forward despite every obstacle.&quot;
                 </h3>
                 <div className="space-y-2">
                    <p className="text-xl md:text-2xl font-black uppercase text-primary tracking-widest">Arshdeep Singh Grewal</p>
                    <p className="text-slate-500 font-bold uppercase text-xs tracking-[0.4em]">Founder of Cracklix</p>
                 </div>
              </motion.div>
           </div>
        </section>

        {/* 5. MISSION & VISION NODES */}
        <section className="py-20 md:pb-40">
           <div className="container mx-auto px-4 md:px-6 max-w-7xl">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16">
                 <ValueCard 
                    title="Our Mission" 
                    desc="To provide students with accessible, reliable, and innovative educational resources that enable smarter preparation and greater confidence." 
                    icon={<Zap className="h-8 w-8 text-primary" />}
                 />
                 <ValueCard 
                    title="Our Vision" 
                    desc="To build one of India's most trusted educational ecosystems, empowering learners to achieve their aspirations through technology-driven solutions." 
                    icon={<Target className="h-8 w-8 text-blue-500" />}
                 />
              </div>
           </div>
        </section>

        {/* 6. CTA */}
        <section className="pb-32 md:pb-60">
           <div className="container mx-auto px-4 text-center">
              <div className="bg-gradient-to-br from-primary to-orange-600 rounded-[3rem] md:rounded-[5rem] p-12 md:p-24 space-y-10 shadow-5xl relative overflow-hidden group">
                 <div className="absolute top-0 right-0 p-16 opacity-10 rotate-12 group-hover:scale-110 transition-transform duration-1000">
                    <Trophy className="h-64 w-64 text-white" />
                 </div>
                 <div className="relative z-10 space-y-6">
                    <h2 className="text-4xl md:text-7xl font-headline font-black uppercase text-white tracking-tight">Ready to start <br/> your journey?</h2>
                    <p className="text-white/80 text-lg md:text-xl font-medium max-w-xl mx-auto">Join the Cracklix ecosystem today and experience institutional grade preparation.</p>
                    <Button asChild className="h-16 md:h-20 px-12 md:px-16 bg-white text-[#0B1528] hover:bg-slate-100 font-black uppercase text-xs md:text-sm tracking-[0.2em] rounded-2xl md:rounded-3xl shadow-3xl gap-4 transition-all active:scale-95 border-none">
                       <Link href="/login">Join the Cracklix Journey <ChevronRight className="h-6 w-6" /></Link>
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
      <div className="bg-white/5 border border-white/10 rounded-[2rem] p-6 flex items-center gap-6 shadow-xl group hover:border-primary/30 transition-all">
         <div className="h-12 w-12 rounded-xl bg-white/5 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform shrink-0">
            {icon}
         </div>
         <div className="text-left min-w-0">
            {loading ? (
               <Skeleton className="h-8 w-16 bg-white/10" />
            ) : (
               <p className="text-xl md:text-2xl font-headline font-black text-white leading-none tabular-nums truncate">{val}</p>
            )}
            <p className="text-[9px] font-black uppercase text-slate-500 tracking-widest mt-1.5 truncate">{label}</p>
         </div>
      </div>
   )
}

function ValueCard({ icon, title, desc }: any) {
  return (
    <Card className="bg-white/5 border-white/10 backdrop-blur-xl p-10 md:p-16 rounded-[3.5rem] shadow-4xl text-left space-y-8 group hover:border-primary/20 transition-all duration-500 h-full flex flex-col relative overflow-hidden">
       <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:scale-110 transition-transform">{icon}</div>
       <div className="h-16 w-16 rounded-[1.5rem] bg-white/5 border border-white/10 flex items-center justify-center shadow-inner group-hover:bg-primary/5 transition-colors">
          {icon}
       </div>
       <div className="space-y-4 flex-1">
          <h3 className="text-3xl md:text-4xl font-headline font-black text-white uppercase tracking-tight group-hover:text-primary transition-colors">{title}</h3>
          <p className="text-lg text-slate-400 font-medium leading-relaxed">{desc}</p>
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
            "flex flex-col md:flex-row items-center gap-8 md:gap-16 text-center md:text-left",
            right && "md:flex-row-reverse md:text-right"
         )}
      >
         <div className="md:w-1/2 flex justify-center md:justify-end">
            <div className={cn(
               "h-20 w-20 md:h-24 md:w-24 rounded-[2rem] bg-white/5 border border-white/10 flex items-center justify-center text-primary shadow-2xl backdrop-blur-xl group hover:border-primary transition-all",
               right ? "md:order-last md:ml-12" : "md:order-first md:mr-12"
            )}>
               {React.cloneElement(icon, { className: "h-8 w-8 md:h-10 md:w-10 fill-current" })}
            </div>
         </div>
         <div className="md:w-1/2 space-y-3">
            <h4 className="text-2xl md:text-3xl font-headline font-black text-white uppercase tracking-tight">{title}</h4>
            <p className="text-slate-400 text-sm md:text-lg font-medium leading-relaxed max-w-sm mx-auto md:mx-0">{desc}</p>
         </div>
      </motion.div>
   )
}
