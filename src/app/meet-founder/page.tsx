'use client';

import React, { useMemo } from "react";
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
  Star,
  Calendar,
  Briefcase,
  MapPin,
  ShieldAlert,
  Instagram,
  Users
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useDoc, useFirestore } from "@/firebase";
import { doc } from "firebase/firestore";

/**
 * @fileOverview Official Meet the Founder Page v6.0.
 * FIXED: Resolved layout overflow for "IN TOUCH" button.
 * UPDATED: Uses real-time database counts for institutional trust.
 */
export default function MeetFounderPage() {
  const db = useFirestore();
  const settingsRef = useMemo(() => (db ? doc(db, 'settings', 'global') : null), [db]);
  const statsRef = useMemo(() => (db ? doc(db, 'settings', 'stats') : null), [db]);

  const { data: settings } = useDoc<any>(settingsRef);
  const { data: stats } = useDoc<any>(statsRef);

  const founder = {
    name: settings?.founderName || "Arsh Grewal",
    role: settings?.founderRole || "Founder & Lead Developer",
    bio: settings?.founderBio || "Hi, I'm Arsh Grewal. As a student from Punjab, I personally experienced the struggle of finding a single, reliable platform dedicated to Punjab Government Exam preparation. Most resources were either scattered, outdated, or lacked the premium experience that modern aspirants deserve.",
    quote: settings?.founderQuote || "Empowering every aspirant in Punjab with institutional-grade preparation technology.",
    mission: settings?.founderMission || "To build Punjab's smartest, most trusted and student-first exam preparation platform where every aspirant gets access to quality mock tests and a premium preparation experience.",
    commitment: settings?.founderCommitment || "I am committed to continuously evolving this platform into Punjab's most trusted learning node. My goal is to ensure that quality preparation is accessible, affordable, and accurate for everyone—from Bathinda to Amritsar.",
    buildingSince: settings?.founderBuildingSince || "19 July 2026",
    email: settings?.founderEmail || settings?.supportEmail || "cracklixhelp@gmail.com",
    instagramUrl: settings?.instagramUrl || "https://www.instagram.com/cracklix.in/",
    showImage: settings?.showFounderImage !== false
  };

  const liveStats = {
     aspirants: (stats?.totalUsers || 1000).toLocaleString() + "+",
     mocks: (stats?.totalMocks || 450).toLocaleString() + "+",
     questions: (stats?.totalQuestions || 12000).toLocaleString() + "+"
  };

  return (
    <div className="min-h-screen bg-white font-body text-left overflow-x-hidden">
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
                <div className="relative h-64 w-64 md:h-[450px] md:w-[450px] rounded-[3rem] overflow-hidden border-8 border-white shadow-5xl bg-[#0B1528] flex items-center justify-center">
                  {founder.showImage ? (
                    <Image
                      src="/founder.png"
                      alt={founder.name}
                      fill
                      className="object-cover grayscale hover:grayscale-0 transition-all duration-1000"
                      priority
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center p-12 text-center space-y-8">
                       <div className="h-32 w-32 rounded-[2.5rem] bg-primary/10 flex items-center justify-center border border-primary/20 shadow-2xl">
                          <ShieldCheck className="h-16 w-16 text-primary animate-pulse" />
                       </div>
                       <div className="space-y-1">
                          <h3 className="text-xl font-black text-white tracking-tight">Security Node Active</h3>
                          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Founder identity protected</p>
                       </div>
                    </div>
                  )}
                </div>
                {founder.showImage && (
                  <div className="absolute -bottom-6 -right-6 h-20 w-20 bg-primary rounded-3xl border-8 border-white shadow-2xl flex items-center justify-center text-white">
                    <Check className="h-10 w-10 stroke-[3px]" />
                  </div>
                )}
              </motion.div>

              <div className="flex-1 space-y-8 text-center lg:text-left">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-[10px] md:text-xs font-bold tracking-tight text-primary">
                    <Zap className="h-3 w-3 fill-current animate-pulse" /> {founder.role}
                  </div>
                  <h1 className="text-4xl md:text-7xl font-[900] text-[#0F172A] tracking-tighter leading-[0.95]">
                    {founder.name.split(' ')[0]} <span className="text-primary">{founder.name.split(' ')[1]}.</span>
                  </h1>
                  <p className="text-lg md:text-2xl text-slate-500 font-medium leading-relaxed italic">
                    "{founder.quote}"
                  </p>
                </motion.div>
                
                <div className="flex flex-wrap justify-center lg:justify-start gap-4">
                  <div className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl shadow-sm"><Target className="h-4 w-4 text-primary" /><span className="text-[10px] md:text-xs font-bold text-[#0F172A]">Student First</span></div>
                  <div className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl shadow-sm"><ShieldCheck className="h-4 w-4 text-primary" /><span className="text-[10px] md:text-xs font-bold text-[#0F172A]">Verified Accuracy</span></div>
                  <div className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl shadow-sm"><Heart className="h-4 w-4 text-primary" /><span className="text-[10px] md:text-xs font-bold text-[#0F172A]">Built in Punjab</span></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* NARRATIVE SECTION */}
        <section className="py-20 md:py-32 bg-white">
          <div className="container mx-auto px-4 md:px-8 max-w-4xl space-y-12 md:space-y-20">
            <div className="prose prose-slate max-w-none space-y-8 text-lg md:text-xl text-slate-600 leading-relaxed font-medium">
              <div className="space-y-6">
                {founder.bio.split('\n').filter(Boolean).map((p, i) => (
                   <p key={i}>{p}</p>
                ))}
              </div>
              
              <div className="bg-[#0F172A] p-10 md:p-16 rounded-[3rem] text-white space-y-6 relative overflow-hidden not-prose shadow-2xl">
                 <div className="absolute top-0 right-0 p-8 opacity-5 rotate-12"><Star className="h-48 w-48 text-primary fill-primary" /></div>
                 <h2 className="text-3xl md:text-4xl font-black tracking-tight leading-tight">My commitment</h2>
                 <p className="text-slate-400">
                    {founder.commitment}
                 </p>
                 <div className="flex items-center gap-4 pt-4">
                    <div className="h-12 w-12 rounded-full border-2 border-primary p-1">
                       <div className="h-full w-full rounded-full bg-primary flex items-center justify-center text-white"><Check className="h-6 w-6" /></div>
                    </div>
                    <p className="font-bold text-xs tracking-widest text-primary uppercase">Verified Founder Milestone</p>
                 </div>
              </div>
              <p>
                This journey has only just begun. Every update we push and every mock test we verify brings us closer to a future where Punjab's youth is better prepared for official recruitments. Thank you for trusting Cracklix.
              </p>
            </div>

            <div className="pt-12 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-10">
               <div className="text-center md:text-left space-y-2">
                  <p className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">Connect directly</p>
                  <p className="text-lg md:text-3xl font-black text-[#0F172A] break-all">{founder.email}</p>
               </div>
               <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
                 <Button asChild variant="outline" className="h-14 w-full sm:w-auto px-8 rounded-2xl border-2 border-slate-200 text-[#0F172A] font-bold gap-3 active:scale-95 transition-all">
                    <a href={founder.instagramUrl} target="_blank" rel="noopener noreferrer">
                      <Instagram className="h-5 w-5 text-rose-500" />
                      Follow @cracklix.in
                    </a>
                 </Button>
                 <Button asChild className="h-14 w-full sm:w-auto px-8 bg-primary hover:bg-blue-700 text-white font-bold uppercase text-[10px] tracking-widest rounded-2xl shadow-xl border-none active:scale-95 transition-all">
                    <Link href="/contact" className="flex items-center justify-center gap-2">
                       Get in touch <MessageCircle className="h-5 w-5" />
                    </Link>
                 </Button>
               </div>
            </div>
          </div>
        </section>

        {/* STATS STRIP */}
        <section className="py-12 md:py-24 bg-slate-50 border-y border-slate-100">
           <div className="container mx-auto px-4 max-w-6xl">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
                 <div className="text-center space-y-3 group">
                    <div className="h-12 w-12 md:h-16 md:w-16 bg-white rounded-2xl md:rounded-3xl border border-slate-100 shadow-sm mx-auto flex items-center justify-center text-slate-300 group-hover:text-primary transition-all"><Users className="h-6 w-6" /></div>
                    <div className="space-y-1"><p className="text-2xl md:text-4xl font-black text-[#0F172A] tracking-tighter leading-none">{liveStats.aspirants}</p><p className="text-[9px] font-bold text-slate-400 tracking-widest uppercase">Aspirants</p></div>
                 </div>
                 <div className="text-center space-y-3 group">
                    <div className="h-12 w-12 md:h-16 md:w-16 bg-white rounded-2xl md:rounded-3xl border border-slate-100 shadow-sm mx-auto flex items-center justify-center text-slate-300 group-hover:text-primary transition-all"><Zap className="h-6 w-6" /></div>
                    <div className="space-y-1"><p className="text-2xl md:text-4xl font-black text-[#0F172A] tracking-tighter leading-none">{liveStats.mocks}</p><p className="text-[9px] font-bold text-slate-400 tracking-widest uppercase">Mock tests</p></div>
                 </div>
                 <div className="text-center space-y-3 group">
                    <div className="h-12 w-12 md:h-16 md:w-16 bg-white rounded-2xl md:rounded-3xl border border-slate-100 shadow-sm mx-auto flex items-center justify-center text-slate-300 group-hover:text-primary transition-all"><ShieldCheck className="h-6 w-6" /></div>
                    <div className="space-y-1"><p className="text-2xl md:text-4xl font-black text-[#0F172A] tracking-tighter leading-none">{liveStats.questions}</p><p className="text-[9px] font-bold text-slate-400 tracking-widest uppercase">Question bank</p></div>
                 </div>
                 <div className="text-center space-y-3 group">
                    <div className="h-12 w-12 md:h-16 md:w-16 bg-white rounded-2xl md:rounded-3xl border border-slate-100 shadow-sm mx-auto flex items-center justify-center text-slate-300 group-hover:text-primary transition-all"><Briefcase className="h-6 w-6" /></div>
                    <div className="space-y-1"><p className="text-2xl md:text-4xl font-black text-[#0F172A] tracking-tighter leading-none">{founder.buildingSince}</p><p className="text-[9px] font-bold text-slate-400 tracking-widest uppercase">Building since</p></div>
                 </div>
              </div>
           </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
