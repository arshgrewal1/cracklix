
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
import Link from "next/link";

/**
 * @fileOverview Institutional Premium Hub v411.0.
 * UPDATED: High-Fidelity "Today's Challenge" section redesign following user image reference.
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

      {/* 4. TODAY'S CHALLENGE HUB - PREMIUM REDESIGN (IMAGE MATCHED) */}
      <section className="py-8 md:py-16 bg-white">
         <div className="max-w-7xl mx-auto px-4 md:px-8">
            <motion.div 
               initial={{ opacity: 0, y: 20 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true }}
               transition={{ duration: 0.5 }}
               className="bg-gradient-to-br from-[#0F172A] via-[#111827] to-[#1E293B] rounded-[30px] p-8 md:p-12 border border-white/10 shadow-[0_24px_60px_rgba(0,0,0,0.35)] relative overflow-hidden group hover:-translate-y-1.5 transition-all duration-500 text-center"
            >
               {/* Background Effects */}
               <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none group-hover:scale-110 transition-transform duration-1000">
                  <Zap className="h-64 w-64 text-primary" />
               </div>
               <div className="absolute top-[-20%] left-[-10%] w-[40%] h-[60%] bg-primary/5 blur-[100px] rounded-full pointer-events-none" />

               <div className="relative z-10 space-y-10">
                  {/* Header */}
                  <div className="space-y-4">
                     <div className="flex items-center justify-center gap-3">
                        <span className="text-3xl md:text-4xl animate-bounce" role="img" aria-label="fire">🔥</span>
                        <h2 className="text-2xl md:text-[32px] font-black tracking-tight text-white antialiased uppercase">
                           Today's Challenge
                        </h2>
                     </div>
                     <p className="text-[15px] md:text-xl text-white/75 font-medium leading-relaxed max-w-lg mx-auto">
                        Quick 5-minute quiz to keep your streak active.
                     </p>
                  </div>

                  {/* Glass Info Chips */}
                  <div className="flex flex-wrap justify-center gap-3 md:gap-5">
                     <ChallengeChip icon={<Clock className="h-4 w-4" />} label="5 MINUTES" color="text-blue-400" />
                     <ChallengeChip icon={<span className="text-xs font-black">?</span>} label="10 QUESTIONS" color="text-blue-400" />
                     <ChallengeChip icon={<Trophy className="h-4 w-4" />} label="DAILY REWARD" color="text-blue-400" />
                  </div>

                  {/* Primary Action Button - GLOSSY ANIMATED */}
                  <div className="pt-4">
                     <Link href="/mocks" className="inline-block w-full md:w-auto">
                        <button className="relative overflow-hidden w-full md:w-auto min-w-[320px] h-16 md:h-[68px] bg-gradient-to-r from-[#2563EB] via-[#3B82F6] to-[#60A5FA] hover:brightness-110 text-white font-black text-lg md:text-2xl tracking-tight rounded-full shadow-[0_12px_35px_rgba(37,99,235,0.4)] transition-all duration-300 active:scale-95 border-none group/btn cursor-pointer">
                           <div className="flex items-center justify-center gap-4 px-10 relative z-10">
                              <Zap className="h-6 w-6 fill-white text-white" />
                              <span>Start Today's Quiz</span>
                              <ChevronRight className="h-6 w-6 transition-transform group-hover/btn:translate-x-1.5" />
                           </div>
                           
                           {/* Premium Glossy Shine Overlay */}
                           <motion.div 
                              animate={{ x: ['-100%', '300%'] }}
                              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                              className="absolute inset-0 w-1/3 h-full bg-gradient-to-r from-transparent via-white/25 to-transparent skew-x-[-25deg] pointer-events-none"
                           />
                        </button>
                     </Link>
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

function ChallengeChip({ icon, label, color }: { icon: React.ReactNode, label: string, color: string }) {
   return (
      <div className="inline-flex items-center gap-3 px-6 py-3 bg-white/5 backdrop-blur-xl border border-white/10 rounded-full hover:bg-white/10 transition-all duration-300 shadow-xl group/chip">
         <span className={cn("shrink-0", color)}>{icon}</span>
         <span className="text-[10px] md:text-xs font-black text-white uppercase tracking-[0.2em]">{label}</span>
      </div>
   )
}
