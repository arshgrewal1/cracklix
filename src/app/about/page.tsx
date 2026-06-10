
"use client"

import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import { motion } from "framer-motion"
import { ShieldCheck, Target, UserCheck, Flame, Globe, ArrowRight, Code } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { PlaceHolderImages } from "@/lib/placeholder-images"
import MeetFounder from "@/components/home/MeetFounder"
import { useDoc, useFirestore } from "@/firebase"
import { doc } from "firebase/firestore"
import { useMemo } from "react"

/**
 * @fileOverview Institutional About Hub v4.0.
 * UPDATED: Zero-baseline sync. Removed placeholder fallbacks.
 */

export default function AboutPage() {
  const armyHero = PlaceHolderImages.find(img => img.id === 'hero-army')?.imageUrl;
  const db = useFirestore();

  const statsRef = useMemo(() => (db ? doc(db, "settings", "stats") : null), [db]);
  const { data: stats } = useDoc<any>(statsRef);

  const liveAspirantCount = useMemo(() => {
    const count = stats?.totalUsers || 0;
    if (count === 0) return "0";
    return count > 999 ? `${(count / 1000).toFixed(0)}k+` : count.toLocaleString();
  }, [stats]);

  const liveQCount = useMemo(() => {
    const count = stats?.totalQuestions || 0;
    if (count === 0) return "0";
    return count >= 1000 ? `${(count / 1000).toFixed(1)}k+` : count.toString();
  }, [stats]);

  return (
    <div className="min-h-screen bg-white font-body text-left">
      <Navbar />
      <main>
        {/* Hero Section */}
        <section className="py-24 bg-[#08152D] text-white relative overflow-hidden">
           <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/10 blur-[120px] rounded-full" />
           <div className="container mx-auto px-6 relative z-10">
              <div className="max-w-4xl mx-auto text-center space-y-8">
                 <motion.span 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="inline-block px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-primary font-black uppercase tracking-[0.2em] text-[10px]"
                 >
                    Our Origin
                 </motion.span>
                 <motion.h1 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-5xl md:text-8xl font-headline font-black leading-[0.9] uppercase tracking-tighter"
                 >
                    Empowering Punjab's <br/>
                    <span className="text-primary">Next Generation</span>
                 </motion.h1>
                 <motion.p 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-xl text-slate-400 leading-relaxed max-w-2xl mx-auto font-medium"
                 >
                    Cracklix is Punjab's most trusted government exam preparation platform, built for quality and student success.
                 </motion.p>
              </div>
           </div>
        </section>

        {/* Founder Profile Section */}
        <MeetFounder />

        {/* Vision Grid */}
        <section className="py-32 bg-slate-50">
           <div className="container mx-auto px-6 max-w-7xl">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                 <VisionCard 
                    icon={<Target className="text-primary h-8 w-8" />} 
                    title="Precision" 
                    desc="Every mock test is designed to mirror the exact patterns of PSSSB, PPSC, and Punjab Police boards." 
                 />
                 <VisionCard 
                    icon={<Code className="text-blue-500 h-8 w-8" />} 
                    title="Technology" 
                    desc="Our platform is engineered for zero-lag performance, ensuring your preparation is never interrupted." 
                 />
                 <VisionCard 
                    icon={<ShieldCheck className="text-emerald-500 h-8 w-8" />} 
                    title="Trust" 
                    desc="We utilize only verified official answer keys and expert solutions to ensure high quality." 
                 />
              </div>
           </div>
        </section>

        {/* Stats */}
        <section className="py-32 bg-[#0F172A] text-white">
           <div className="container mx-auto px-6 max-w-7xl">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-16 text-center">
                 <StatNode icon={<UserCheck className="text-primary" />} val={liveAspirantCount} label="Active Students" />
                 <StatNode icon={<Flame className="text-orange-500" />} val={liveQCount} label="MCQs Bank" />
                 <StatNode icon={<Globe className="text-blue-400" />} val="22" label="Districts Covered" />
                 <StatNode icon={<Target className="text-emerald-500" />} val={`${stats?.averageAccuracy || 0}%`} label="Accuracy Rate" />
              </div>
           </div>
        </section>

        {/* CTA with Army Asset Background */}
        <section className="py-32 bg-primary text-white relative overflow-hidden group">
           <div className="absolute inset-0 opacity-10 group-hover:scale-110 transition-transform duration-1000">
              <img src={armyHero!} className="w-full h-full object-cover grayscale" referrerPolicy="no-referrer" alt="CTA BG" />
           </div>
           <div className="container mx-auto px-6 text-center space-y-10 relative z-10">
              <h2 className="text-5xl md:text-8xl font-headline font-black uppercase leading-[0.85] tracking-tighter">Ready to start <br/> your journey?</h2>
              <p className="text-white/80 max-w-xl mx-auto text-xl font-medium">Join thousands of aspirants already preparing with Cracklix's verified mock series.</p>
              <div className="flex justify-center gap-4">
                 <Button asChild className="w-full md:w-auto bg-white text-primary hover:bg-slate-100 font-black px-12 h-20 rounded-3xl uppercase tracking-widest text-xs shadow-4xl border-none">
                    <Link href="/exams">Start Practice <ArrowRight className="ml-2 h-5 w-5" /></Link>
                 </Button>
              </div>
           </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}

function VisionCard({ icon, title, desc }: any) {
  return (
    <div className="bg-white p-12 rounded-[3.5rem] shadow-2xl border border-slate-100 space-y-8 text-left group hover:translate-y-[-10px] transition-all duration-500">
       <div className="h-20 w-20 bg-slate-50 rounded-[2rem] flex items-center justify-center shadow-inner group-hover:bg-primary/5 transition-colors">{icon}</div>
       <h3 className="text-3xl font-headline font-black text-[#0F172A] uppercase tracking-tight">{title}</h3>
       <p className="text-slate-500 leading-relaxed font-medium text-lg">{desc}</p>
    </div>
  )
}

function StatNode({ icon, val, label }: any) {
   return (
      <div className="space-y-6 group">
         <div className="flex justify-center transition-transform group-hover:scale-110 duration-500">{icon}</div>
         <p className="text-6xl font-headline font-black tracking-tighter leading-none">{val}</p>
         <p className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-500">{label}</p>
      </div>
   )
}
