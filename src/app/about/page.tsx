
"use client"

import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import { motion } from "framer-motion"
import { GraduationCap, ShieldCheck, Target, Heart, ArrowRight, UserCheck, Flame, Globe } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { PlaceHolderImages } from "@/lib/placeholder-images"

/**
 * @fileOverview Final Institutional Origin Node.
 * Updated to exclusively use official PSSSB and Army assets.
 */

export default function AboutPage() {
  const psssbPromo = PlaceHolderImages.find(img => img.id === 'promo-psssb')?.imageUrl;
  const armyHero = PlaceHolderImages.find(img => img.id === 'hero-army')?.imageUrl;

  return (
    <div className="min-h-screen bg-white font-body">
      <Navbar />
      <main>
        {/* Hero Section */}
        <section className="py-24 bg-[#08152D] text-white relative overflow-hidden">
           <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/10 blur-[120px] rounded-full" />
           <div className="container mx-auto px-6 relative z-10">
              <div className="max-w-4xl mx-auto text-center space-y-8 text-left">
                 <motion.span 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="inline-block px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-primary font-black uppercase tracking-[0.2em] text-[10px]"
                 >
                    Our Origin Story
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
                    Cracklix was founded by <span className="text-white font-black">Arsh Grewal</span> with the vision of building Punjab's most trusted and high-fidelity government exam preparation platform.
                 </motion.p>
              </div>
           </div>
        </section>

        {/* Vision Grid */}
        <section className="py-32 bg-slate-50">
           <div className="container mx-auto px-6 max-w-7xl">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                 <VisionCard 
                    icon={<Target className="text-primary h-8 w-8" />} 
                    title="Precision" 
                    desc="Every mock test is designed to mirror the exact pattern of PSSSB, PPSC, and Punjab Police recruitment boards." 
                 />
                 <VisionCard 
                    icon={<ShieldCheck className="text-emerald-500 h-8 w-8" />} 
                    title="Trust" 
                    desc="We prioritize verified official answer keys and expert rationalizations to ensure zero misinformation." 
                 />
                 <VisionCard 
                    icon={<GraduationCap className="text-blue-500 h-8 w-8" />} 
                    title="Opportunity" 
                    desc="Our goal is to make high-quality institutional coaching accessible to every aspirant in Punjab's villages and cities." 
                 />
              </div>
           </div>
        </section>

        {/* Founder Context with Official Asset */}
        <section className="py-32 bg-white">
           <div className="container mx-auto px-6">
              <div className="max-w-6xl mx-auto bg-[#0B1528] rounded-[4rem] overflow-hidden shadow-4xl flex flex-col md:flex-row">
                 <div className="md:w-1/2 relative h-[500px] md:h-auto bg-slate-800 group">
                    <img 
                      src={psssbPromo!} 
                      alt="Institutional Promo" 
                      className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-primary/20 mix-blend-overlay opacity-0 group-hover:opacity-100 transition-opacity" />
                 </div>
                 <div className="md:w-1/2 p-12 md:p-24 flex flex-col justify-center space-y-10 text-left">
                    <div className="h-16 w-16 bg-primary/20 rounded-[2rem] flex items-center justify-center shadow-2xl">
                       <Heart className="text-primary fill-current h-8 w-8" />
                    </div>
                    <blockquote className="text-3xl md:text-4xl text-white font-headline font-medium leading-tight italic antialiased">
                       "I built Cracklix because I saw students struggling with outdated materials. My mission is simple: provide the fastest, cleanest, and most accurate preparation experience for my fellow Punjab aspirants."
                    </blockquote>
                    <div>
                       <p className="text-white font-black uppercase tracking-widest text-2xl">Arsh Grewal</p>
                       <p className="text-primary font-bold uppercase tracking-widest text-xs mt-1">Founder, Cracklix Platform</p>
                    </div>
                 </div>
              </div>
           </div>
        </section>

        {/* Stats */}
        <section className="py-32 bg-[#0F172A] text-white">
           <div className="container mx-auto px-6 max-w-7xl">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-16 text-center">
                 <StatNode icon={<UserCheck className="text-primary" />} val="15,000+" label="Active Aspirants" />
                 <StatNode icon={<Flame className="text-orange-500" />} val="1M+" label="MCQs Attempted" />
                 <StatNode icon={<Globe className="text-blue-400" />} val="22" label="Districts Covered" />
                 <StatNode icon={<Target className="text-emerald-500" />} val="94%" label="Accuracy Node" />
              </div>
           </div>
        </section>

        {/* CTA with Army Asset Background */}
        <section className="py-32 bg-primary text-white relative overflow-hidden group">
           <div className="absolute inset-0 opacity-10 group-hover:scale-110 transition-transform duration-1000">
              <img src={armyHero!} className="w-full h-full object-cover grayscale" referrerPolicy="no-referrer" />
           </div>
           <div className="container mx-auto px-6 text-center space-y-10 relative z-10">
              <h2 className="text-5xl md:text-8xl font-headline font-black uppercase leading-[0.85] tracking-tighter">Ready to start <br/> your journey?</h2>
              <p className="text-white/80 max-w-xl mx-auto text-xl font-medium">Join the thousands of aspirants already preparing with Cracklix's institutional grade mock series.</p>
              <div className="flex justify-center gap-4">
                 <Button asChild className="bg-white text-primary hover:bg-slate-100 font-black px-12 h-20 rounded-3xl uppercase tracking-widest text-xs shadow-4xl">
                    <Link href="/mocks">Start Free Mock <ArrowRight className="ml-2 h-5 w-5" /></Link>
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
