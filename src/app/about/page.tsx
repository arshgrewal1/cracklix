"use client"

import React, { useMemo, useState, useEffect } from "react"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import { motion } from "framer-motion"
import { 
  ShieldCheck,  
  ChevronRight, 
  Sparkles,  
  Users,
  Trophy,
  Landmark,
  LucideIcon,
  Zap
} from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useFirestore, useDoc } from "@/firebase"
import { doc, DocumentReference } from "firebase/firestore"
import { Skeleton } from "@/components/ui/skeleton"
import Image from "next/image"

/**
 * @fileOverview Institutional About Center v29.0 [Live Sync].
 * FIXED: Pulls real stats from institutional database nodes.
 */

interface Stats {
  totalUsers: number;
  totalQuestions: number;
  totalCategories: number;
}

export default function AboutPage() {
  const db = useFirestore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const statsRef = useMemo(() => (db ? doc(db, "settings", "stats") as DocumentReference<Stats> : null), [db]);
  const settingsRef = useMemo(() => (db ? doc(db, "settings", "global") : null), [db]);
  
  const { data: stats } = useDoc<Stats>(statsRef);
  const { data: settings } = useDoc<any>(settingsRef);

  const liveStats = useMemo(() => {
    const totalUsers = stats?.totalUsers || 0;
    const totalQuestions = stats?.totalQuestions || 0;
    const totalExams = stats?.totalCategories || 0;
    
    const formatNumber = (num: number) => {
       if (!num || num === 0) return "0";
       if (num >= 1000) return (num / 1000).toFixed(1) + 'K+';
       return num.toString();
    }
    
    return {
      students: formatNumber(totalUsers),
      questions: formatNumber(totalQuestions),
      hubs: totalExams.toString() + "+"
    };
  }, [stats]);

  const showImage = settings?.showFounderImage !== false;

  return (
    <div className="min-h-screen bg-[#020817] text-white font-body overflow-x-hidden selection:bg-primary/30 text-left">
      <Navbar />
      
      <main>
        <section className="relative pt-8 pb-8 md:pt-32 md:pb-32 overflow-hidden">
           <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/10 blur-[120px] rounded-full" />
           
           <div className="container mx-auto px-4 md:px-6 relative z-10">
              <div className="max-w-5xl mx-auto text-center space-y-4 md:space-y-10">
                 <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="inline-flex items-center gap-3 px-3 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-xl mb-1"
                 >
                    <Sparkles className="h-3 w-3 text-primary animate-pulse" />
                    <span className="text-[8px] md:text-[10px] font-bold uppercase tracking-widest text-primary">The Visionary Origin</span>
                 </motion.div>

                 <motion.h1 
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-2xl sm:text-5xl md:text-7xl font-black leading-[1] tracking-tight"
                 >
                    A student's dream <br/>
                    <span className="text-primary italic">to a nation of learners</span>
                 </motion.h1>

                 <motion.p 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-[11px] md:text-2xl text-slate-400 font-medium max-w-xl mx-auto leading-tight"
                 >
                    Empowering thousands of aspirants across Punjab.
                 </motion.p>
              </div>
           </div>
        </section>

        <section className="py-10 md:py-24 relative border-y border-white/5 bg-white/[0.02]">
           <div className="container mx-auto px-4 md:px-6 max-w-6xl">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-20 items-center">
                 
                 <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className="lg:col-span-5 relative"
                 >
                    <div className="relative aspect-[4/5] rounded-[2rem] md:rounded-[3.5rem] overflow-hidden border border-white/10 shadow-5xl group bg-[#0B1528] max-w-[280px] md:max-w-none mx-auto flex items-center justify-center">
                      {showImage ? (
                        <>
                          <Image
                            src="/founder.png"
                            alt="Arsh Grewal"
                            fill
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 400px"
                            className="object-cover grayscale group-hover:grayscale-0 transition-all duration-1000"
                            priority
                          />
                           <div className="absolute inset-0 bg-gradient-to-t from-[#020817] via-transparent to-transparent opacity-80" />
                        </>
                      ) : (
                        <div className="flex flex-col items-center justify-center p-12 text-center space-y-6">
                           <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20 shadow-inner">
                              <ShieldCheck className="h-12 w-12 text-primary animate-pulse" />
                           </div>
                           <div className="space-y-1">
                              <p className="text-[10px] font-bold text-primary tracking-widest">Identity Secured</p>
                              <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest leading-tight">Institutional protection active</p>
                           </div>
                        </div>
                      )}
                       <div className="absolute bottom-6 left-6 right-6 z-10">
                          <p className="text-lg md:text-2xl font-black tracking-tight">Arsh Grewal</p>
                          <p className="text-primary font-bold text-[7px] md:text-[8px] tracking-widest uppercase">Founder</p>
                       </div>
                    </div>
                 </motion.div>

                 <motion.div 
                    initial={{ opacity: 0, x: 50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    className="lg:col-span-7 space-y-6 md:space-y-8 text-left"
                 >
                    <div className="space-y-2">
                       <h2 className="text-xl md:text-4xl font-headline font-black tracking-tight leading-none">
                          The <span className="text-primary">Journey</span>
                       </h2>
                       <div className="h-1 w-12 bg-primary rounded-full" />
                    </div>

                    <div className="space-y-4 text-slate-300 text-[12px] md:text-base font-medium leading-relaxed">
                       <p>Founded by <span className="text-white font-bold">Arshdeep Singh Grewal</span>, Cracklix was born from a student's struggle to find quality resources.</p>
                       <p>Driven by the belief that every student deserves equal access, he simplified the path to government careers across Punjab.</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4">
                       <ImpactNode label="Aspirants" val={mounted ? liveStats.students : "---"} icon={Users} />
                       <ImpactNode label="Questions" val={mounted ? liveStats.questions : "---"} icon={Zap} />
                       <ImpactNode label="Official Hubs" val={mounted ? liveStats.hubs : "---"} icon={Landmark} />
                    </div>
                 </motion.div>
              </div>
           </div>
        </section>

        <section className="py-12 md:py-32">
           <div className="container mx-auto px-4 text-center">
              <div className="bg-gradient-to-br from-primary to-blue-600 rounded-[2rem] md:rounded-[4rem] p-8 md:p-20 space-y-6 md:space-y-8 shadow-5xl relative overflow-hidden group">
                 <div className="absolute top-0 right-0 p-8 opacity-5 rotate-12 group-hover:scale-110 transition-transform duration-1000">
                    <Trophy className="h-32 w-32 text-white" />
                 </div>
                 <div className="relative z-10 space-y-4 md:space-y-6">
                    <h2 className="text-2xl md:text-5xl font-headline font-black text-white tracking-tight leading-none">Ready to start <br/> your journey?</h2>
                    <Button asChild className="h-12 md:h-16 px-8 md:px-14 bg-white text-[#0B1528] hover:bg-slate-100 font-bold uppercase text-[9px] md:text-[11px] tracking-widest rounded-xl md:rounded-2xl shadow-3xl gap-2 border-none">
                       <Link href="/login">Join the Cracklix Hub <ChevronRight className="h-4 w-4" /></Link>
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

function ImpactNode({ label, val, icon: Icon }: { label: string, val: string, icon: LucideIcon }) {
   return (
      <div className="bg-white/5 border border-white/10 rounded-2xl p-3 flex items-center gap-3 group transition-all">
         <div className="h-8 w-8 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
            <Icon className="h-3.5 w-3.5 text-primary" />
         </div>
         <div className="text-left min-w-0">
            <p className="text-sm md:text-xl font-headline font-black text-white leading-none truncate">{val}</p>
            <p className="text-[7px] font-bold text-slate-500 tracking-widest mt-1 truncate uppercase">{label}</p>
         </div>
      </div>
   )
}
