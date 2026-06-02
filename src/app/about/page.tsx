
"use client"

import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import { motion } from "framer-motion"
import { GraduationCap, ShieldCheck, Target, Heart, ArrowRight } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
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
                    Our Origin Story
                 </motion.span>
                 <motion.h1 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-5xl md:text-7xl font-headline font-black leading-tight"
                 >
                    Empowering Punjab's <br/>
                    <span className="text-primary">Next Generation</span>
                 </motion.h1>
                 <motion.p 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-xl text-slate-400 leading-relaxed max-w-2xl mx-auto"
                 >
                    Cracklix was founded by <span className="text-white font-bold">Arsh Grewal</span> with the vision of building Punjab's most trusted and high-fidelity government exam preparation platform.
                 </motion.p>
              </div>
           </div>
        </section>

        {/* Vision Grid */}
        <section className="py-24 bg-slate-50">
           <div className="container mx-auto px-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                 <VisionCard 
                    icon={<Target className="text-primary" />} 
                    title="Precision" 
                    desc="Every mock test is designed to mirror the exact pattern of PSSSB, PPSC, and Punjab Police recruitment boards." 
                 />
                 <VisionCard 
                    icon={<ShieldCheck className="text-emerald-500" />} 
                    title="Trust" 
                    desc="We prioritize verified official answer keys and expert rationalizations to ensure zero misinformation." 
                 />
                 <VisionCard 
                    icon={<GraduationCap className="text-blue-500" />} 
                    title="Opportunity" 
                    desc="Our goal is to make high-quality institutional coaching accessible to every aspirant in Punjab's villages and cities." 
                 />
              </div>
           </div>
        </section>

        {/* Founder Quote */}
        <section className="py-24 bg-white">
           <div className="container mx-auto px-6">
              <div className="max-w-5xl mx-auto bg-[#0B1528] rounded-[3rem] overflow-hidden shadow-2xl flex flex-col md:flex-row">
                 <div className="md:w-2/5 relative h-80 md:h-auto bg-slate-800">
                    <Image 
                      src="https://picsum.photos/seed/founder/800/1000" 
                      alt="Arsh Grewal" 
                      fill 
                      className="object-cover grayscale hover:grayscale-0 transition-all duration-500"
                    />
                 </div>
                 <div className="md:w-3/5 p-12 md:p-20 flex flex-col justify-center space-y-8">
                    <div className="h-12 w-12 bg-primary/20 rounded-2xl flex items-center justify-center">
                       <Heart className="text-primary fill-current h-6 w-6" />
                    </div>
                    <blockquote className="text-2xl md:text-3xl text-white font-headline font-medium leading-relaxed italic">
                       "I built Cracklix because I saw students struggling with outdated materials and complex portals. My mission is simple: provide the fastest, cleanest, and most accurate preparation experience for my fellow Punjab aspirants."
                    </blockquote>
                    <div>
                       <p className="text-white font-black uppercase tracking-widest text-lg">Arsh Grewal</p>
                       <p className="text-primary font-bold uppercase tracking-widest text-xs mt-1">Founder, Cracklix Platform</p>
                    </div>
                 </div>
              </div>
           </div>
        </section>

        {/* CTA */}
        <section className="py-24 bg-primary text-white">
           <div className="container mx-auto px-6 text-center space-y-8">
              <h2 className="text-4xl md:text-5xl font-headline font-black">Ready to start your journey?</h2>
              <p className="text-white/80 max-w-xl mx-auto text-lg">Join 15,000+ aspirants already preparing with Cracklix's institutional grade mock series.</p>
              <div className="flex justify-center gap-4">
                 <Button asChild className="bg-white text-primary hover:bg-slate-100 font-black px-10 h-14 rounded-2xl">
                    <Link href="/mocks">Start Free Mock <ArrowRight className="ml-2 h-4 w-4" /></Link>
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
    <div className="bg-white p-10 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 space-y-6">
       <div className="h-16 w-16 bg-slate-50 rounded-2xl flex items-center justify-center">{icon}</div>
       <h3 className="text-2xl font-headline font-black text-[#0F172A]">{title}</h3>
       <p className="text-slate-500 leading-relaxed font-medium">{desc}</p>
    </div>
  )
}
