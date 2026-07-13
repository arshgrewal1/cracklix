
'use client';

import React from "react";
import Navbar from "@/components/layout/Navbar";
import Hero from "@/components/home/Hero";
import QuickActions from "@/components/home/QuickActions";
import FeaturedCategories from "@/components/home/FeaturedCategories";
import PopularExams from "@/components/home/PopularExams";
import LatestMocks from "@/components/home/LatestMocks";
import ContinueLearning from "@/components/home/ContinueLearning";
import CurrentAffairsPreview from "@/components/home/CurrentAffairsPreview";
import MeritPreview from "@/components/home/MeritPreview";
import Footer from "@/components/layout/Footer";
import GlobalSearch from "@/components/home/GlobalSearch";
import LatestVacancy from "@/components/home/LatestVacancy";
import MeetFounder from "@/components/home/MeetFounder";
import { useUser } from "@/firebase";
import { Zap, Clock, Trophy, ChevronRight, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * @fileOverview Institutional Premium Hub v410.0.
 * UPDATED: High-Fidelity "Today's Challenge" section redesign.
 */
export default function HomePage() {
  const { user } = useUser();

  return (
    <main className="min-h-screen bg-white font-body pb-safe text-left overflow-x-hidden">
      <Navbar />
      
      {/* 1. COMPACT HERO */}
      <Hero />

      {/* 2. STICKY SEARCH & ACTIONS */}
      <div className="relative z-40 bg-white">
        <GlobalSearch />
        <QuickActions />
      </div>

      {/* 3. DYNAMIC PROGRESS NODES */}
      {user && <ContinueLearning />}

      {/* 4. TODAY'S CHALLENGE HUB - PREMIUM REDESIGN */}
      <section className="py-8 md:py-16 bg-white">
         <div className="max-w-7xl mx-auto px-4 md:px-8">
            <motion.div 
               initial={{ opacity: 0, y: 20 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true }}
               transition={{ duration: 0.5 }}
               className="bg-gradient-to-br from-[#0F172A] via-[#111827] to-[#1E293B] rounded-[30px] p-7 md:p-12 border border-white/10 shadow-[0_24px_60px_rgba(0,0,0,0.35)] relative overflow-hidden group hover:-translate-y-1.5 transition-all duration-500"
            >
               {/* Background Decorative Nodes */}
               <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none group-hover:scale-110 transition-transform duration-1000">
                  <Zap className="h-64 w-64 text-primary" />
               </div>
               <div className="absolute top-[-20%] left-[-10%] w-[40%] h-[60%] bg-primary/10 blur-[100px] rounded-full pointer-events-none animate-pulse" />
               <div className="absolute bottom-[-10%] right-[-5%] w-[30%] h-[40%] bg-blue-500/10 blur-[80px] rounded-full pointer-events-none" />

               <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
                  {/* Left Content Hub */}
                  <div className="space-y-6 text-center md:text-left flex-1">
                     <div className="space-y-2">
                        <div className="flex items-center justify-center md:justify-start gap-3">
                           <span className="text-2xl">🔥</span>
                           <h2 className="text-2xl md:text-[32px] font-black tracking-tight text-white antialiased">
                              Today's Challenge
                           </h2>
                        </div>
                        <p className="text-[15px] md:text-lg text-white/75 font-medium leading-relaxed max-w-md">
                           Quick 5-minute quiz to keep your streak active.
                        </p>
                     </div>

                     {/* Premium Info Chips */}
                     <div className="flex flex-wrap justify-center md:justify-start gap-3">
                        <ChallengeChip icon={<Clock className="h-3 w-3" />} label="5 Minutes" />
                        <ChallengeChip icon={<span className="text-[10px] font-black">?</span>} label="10 Questions" />
                        <ChallengeChip icon={<Trophy className="h-3 w-3" />} label="Daily Reward" />
                     </div>
                  </div>

                  {/* Right Icon Node */}
                  <div className="hidden lg:flex shrink-0">
                     <div className="relative">
                        <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full" />
                        <div className="h-[72px] w-[72px] rounded-full bg-primary/10 backdrop-blur-[18px] border border-white/10 flex items-center justify-center shadow-2xl relative transition-transform duration-500 group-hover:scale-110">
                           <Zap className="h-8 w-8 text-primary fill-primary" />
                        </div>
                     </div>
                  </div>

                  {/* Action Hub */}
                  <div className="w-full md:w-auto shrink-0 flex flex-col items-center gap-4">
                     <button className="relative overflow-hidden w-full md:w-auto min-w-[280px] h-14 md:h-[58px] bg-gradient-to-r from-[#2563EB] via-[#3B82F6] to-[#60A5FA] hover:brightness-110 text-white font-black text-lg md:text-xl tracking-tight rounded-full shadow-[0_12px_30px_rgba(37,99,235,0.35)] transition-all duration-300 active:scale-95 border-none group/btn">
                        <div className="flex items-center justify-center gap-3 px-8">
                           <span>⚡ Start Today's Quiz</span>
                           <ChevronRight className="h-5 w-5 transition-transform group-hover/btn:translate-x-1" />
                        </div>
                        
                        {/* Glossy Shine Effect */}
                        <motion.div 
                           animate={{ x: ['-100%', '300%'] }}
                           transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                           className="absolute inset-0 w-1/4 h-full bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-[-25deg] pointer-events-none"
                        />
                     </button>
                  </div>
               </div>
            </motion.div>
         </div>
      </section>

      {/* 5. VACANCY HUB */}
      <LatestVacancy />

      {/* 6. REGISTRY DISCOVERY */}
      <FeaturedCategories />
      <PopularExams />
      <LatestMocks />

      {/* 7. ASSET PREVIEWS */}
      <CurrentAffairsPreview />
      <MeritPreview />

      {/* 8. FOUNDER HUB */}
      <MeetFounder />
      
      <Footer />
    </main>
  );
}

function ChallengeChip({ icon, label }: { icon: React.ReactNode, label: string }) {
   return (
      <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 backdrop-blur-md border border-white/10 rounded-full group-hover:bg-white/10 transition-colors">
         <span className="text-primary">{icon}</span>
         <span className="text-[11px] md:text-xs font-bold text-white uppercase tracking-wider">{label}</span>
      </div>
   )
}
