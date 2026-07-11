'use client';

import React from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { motion } from "framer-motion";
import { 
  ShieldCheck, 
  Target, 
  Award, 
  MessageCircle, 
  Check, 
  ArrowRight,
  Heart,
  Zap,
  Star
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

/**
 * @fileOverview Official Meet the Founder Page.
 * Detailed narrative and mission for Arsh Grewal.
 */
export default function MeetFounderPage() {
  return (
    <div className="min-h-screen bg-white font-body text-left">
      <Navbar />
      
      <main>
        {/* HERO SECTION */}
        <section className="relative pt-12 pb-20 md:pt-24 md:pb-32 overflow-hidden bg-slate-50/50">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-primary/5 blur-[120px] rounded-full" />
          <div className="container mx-auto px-4 md:px-8 max-w-6xl relative z-10">
            <div className="flex flex-col lg:flex-row items-center gap-12 md:gap-20">
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8 }}
                className="relative shrink-0"
              >
                <div className="relative h-64 w-64 md:h-[450px] md:w-[450px] rounded-[3rem] overflow-hidden border-8 border-white shadow-5xl bg-[#0B1528]">
                  <Image
                    src="/founder.png"
                    alt="Arsh Grewal"
                    fill
                    className="object-cover grayscale hover:grayscale-0 transition-all duration-1000"
                    priority
                  />
                </div>
                <div className="absolute -bottom-6 -right-6 h-20 w-20 bg-primary rounded-3xl border-8 border-white shadow-2xl flex items-center justify-center text-white">
                  <Check className="h-10 w-10 stroke-[3px]" />
                </div>
              </motion.div>

              <div className="flex-1 space-y-8 text-center lg:text-left">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  <Badge label="Founder & Developer" />
                  <h1 className="text-4xl md:text-7xl font-[900] text-[#0F172A] tracking-tighter leading-[0.95]">
                    Arsh <span className="text-primary">Grewal.</span>
                  </h1>
                  <p className="text-lg md:text-2xl text-slate-500 font-medium leading-relaxed italic">
                    "Empowering every aspirant in Punjab with institutional-grade technology."
                  </p>
                </motion.div>
                
                <div className="flex flex-wrap justify-center lg:justify-start gap-4">
                  <FeatureChip icon={Target} label="Student First" />
                  <FeatureChip icon={ShieldCheck} label="Verified Accuracy" />
                  <FeatureChip icon={Heart} label="Built in Punjab" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* NARRATIVE SECTION */}
        <section className="py-20 md:py-32 bg-white">
          <div className="container mx-auto px-4 md:px-8 max-w-4xl space-y-12 md:space-y-20">
            <div className="prose prose-slate max-w-none space-y-8 text-lg md:text-xl text-slate-600 leading-relaxed font-medium">
              <p>
                Hi, I&apos;m <span className="text-[#0F172A] font-black">Arsh Grewal</span>. As a student from Punjab, I personally experienced the struggle of finding a single, reliable platform dedicated to Punjab Government Exam preparation. Most resources were either scattered, outdated, or lacked the premium experience that modern aspirants deserve.
              </p>
              <p>
                Instead of waiting for a solution, I decided to build it. <span className="text-primary font-black">Cracklix</span> was born out of a mission to simplify the preparation journey for every student in our state. Every feature, from the high-fidelity CBT engine to the daily current affairs, is developed with precision and a student-first philosophy.
              </p>
              <div className="bg-[#0F172A] p-10 md:p-16 rounded-[3rem] text-white space-y-6 relative overflow-hidden not-prose">
                 <div className="absolute top-0 right-0 p-8 opacity-5 rotate-12"><Star className="h-48 w-48 text-primary fill-primary" /></div>
                 <h2 className="text-3xl md:text-4xl font-black tracking-tight leading-tight">My Commitment</h2>
                 <p className="text-slate-400">
                    I am committed to continuously evolving this platform into Punjab&apos;s most trusted learning node. My goal is to ensure that quality preparation is accessible, affordable, and accurate for everyone—from Bathinda to Amritsar.
                 </p>
                 <div className="flex items-center gap-4 pt-4">
                    <div className="h-12 w-12 rounded-full border-2 border-primary p-1">
                       <div className="h-full w-full rounded-full bg-primary flex items-center justify-center text-white"><Check className="h-6 w-6" /></div>
                    </div>
                    <p className="font-black uppercase text-xs tracking-widest text-primary">Verified Founder Milestone</p>
                 </div>
              </div>
              <p>
                This journey has only just begun. Every update we push and every mock test we verify brings us closer to a future where Punjab&apos;s youth is better prepared for official recruitments. Thank you for trusting Cracklix.
              </p>
            </div>

            <div className="pt-12 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-8">
               <div className="text-center md:text-left space-y-1">
                  <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.4em]">Connect Directly</p>
                  <p className="text-xl font-bold text-[#0F172A]">management@cracklix.com</p>
               </div>
               <Button asChild className="h-16 px-10 bg-primary hover:bg-blue-700 text-white font-black uppercase text-[11px] tracking-widest rounded-2xl shadow-xl border-none">
                  <Link href="/contact">Get in Touch <MessageCircle className="ml-2 h-4 w-4" /></Link>
               </Button>
            </div>
          </div>
        </section>

        {/* STATS STRIP */}
        <section className="py-12 bg-slate-50 border-y border-slate-100">
           <div className="container mx-auto px-4 max-w-6xl grid grid-cols-2 md:grid-cols-4 gap-8">
              <MinimalStat value="10K+" label="Aspirants" />
              <MinimalStat value="450+" label="Mock Series" />
              <MinimalStat value="12K+" label="MCQ Bank" />
              <MinimalStat value="100%" label="Verified" />
           </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

function Badge({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-[10px] md:text-xs font-black uppercase tracking-widest text-primary">
       <Zap className="h-3 w-3 fill-current" /> {label}
    </span>
  );
}

function FeatureChip({ icon: Icon, label }: { icon: any, label: string }) {
  return (
    <div className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl shadow-sm">
       <Icon className="h-4 w-4 text-primary" />
       <span className="text-[10px] md:text-xs font-bold text-[#0F172A] uppercase tracking-tight">{label}</span>
    </div>
  );
}

function MinimalStat({ value, label }: { value: string, label: string }) {
  return (
    <div className="text-center space-y-1">
       <p className="text-2xl md:text-4xl font-black text-[#0F172A] tracking-tighter">{value}</p>
       <p className="text-[9px] md:text-[10px] font-black uppercase text-slate-400 tracking-widest">{label}</p>
    </div>
  );
}
