
'use client';

import React, { useMemo } from "react";
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
import { useUser, useCollection, useFirestore } from "@/firebase";
import { Zap, Clock, Trophy, ChevronRight, Flame, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { collection, query, where, limit } from "firebase/firestore";

/**
 * @fileOverview Institutional Premium Hub v501.8.
 * UPDATED: Removed all remaining uppercase styling for unified Title Case design.
 */
export default function HomePage() {
  const { user } = useUser();
  const db = useFirestore();

  const quizQuery = useMemo(() => (db ? query(collection(db, "daily_quizzes"), where("status", "==", "PUBLISHED"), where("isTodayQuiz", "==", true), limit(1)) : null), [db]);
  const { data: quizzes } = useCollection<any>(quizQuery);
  const activeQuiz = quizzes?.[0];

  return (
    <main className="min-h-screen bg-white font-body pb-safe text-left overflow-x-hidden">
      <Navbar />
      
      <Hero />
      <GlobalSearch />
      
      <QuickActions />

      {user && <ContinueLearning />}

      {/* Today's challenge */}
      <section className="py-6 md:py-16 bg-white">
         <div className="max-w-7xl mx-auto px-4 md:px-8">
            <motion.div 
               initial={{ opacity: 0, y: 20 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true }}
               transition={{ duration: 0.5 }}
               className="bg-gradient-to-br from-[#0F172A] via-[#111827] to-[#1E293B] rounded-[24px] p-[20px] border border-white/10 shadow-[0_24px_60px_rgba(0,0,0,0.35)] relative overflow-hidden group transition-all duration-500 text-center min-h-[340px] flex flex-col justify-center"
            >
               <div className="absolute top-4 right-4 p-0 opacity-[0.04] pointer-events-none group-hover:scale-110 transition-transform duration-1000">
                  <Zap className="h-40 w-40 text-primary" />
               </div>
               
               <div className="relative z-10 w-full pt-[16px]">
                  <div className="space-y-0">
                     <div className="flex items-center justify-center gap-2">
                        <Flame className="h-6 w-6 text-orange-500 fill-current animate-pulse" />
                        <h2 className="text-[26px] md:text-4xl font-bold tracking-tight text-white antialiased leading-tight">
                           Today's Challenge
                        </h2>
                     </div>
                     <p className="text-[16px] text-slate-300 font-medium mt-[6px] max-w-lg mx-auto">
                        {activeQuiz?.title || "Practice Mode"}
                     </p>
                  </div>

                  {activeQuiz ? (
                    <>
                      <div className="mt-[18px] flex flex-row flex-wrap items-center justify-center gap-[10px]">
                         <ChallengeChip icon={<Clock className="h-3.5 w-3.5" />} label={`${activeQuiz.duration} min`} />
                         <ChallengeChip icon={<ShieldCheck className="h-3.5 w-3.5" />} label={`${activeQuiz.totalQuestions} questions`} />
                         <ChallengeChip icon={<Trophy className="h-3.5 w-3.5" />} label={`${activeQuiz.rewardXP} XP`} />
                      </div>

                      <div className="mt-[20px] pb-[18px]">
                         <Link href={`/mocks/instructions?id=${activeQuiz.id}`} className="inline-block w-full max-w-[320px] mx-auto">
                            <button className="relative overflow-hidden w-full h-[52px] bg-gradient-to-r from-blue-600 to-blue-400 hover:brightness-110 text-white font-bold text-base tracking-tight rounded-[18px] shadow-[0_12px_24px_rgba(37,99,235,0.3)] transition-all duration-300 active:scale-95 border-none group/btn cursor-pointer">
                               <div className="flex items-center justify-center gap-2 relative z-10">
                                  <Zap className="h-4 w-4 fill-white text-white" />
                                  <span>Start Challenge</span>
                                  <ChevronRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                               </div>
                               <motion.div 
                                  animate={{ x: ['-100%', '300%'] }}
                                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                  className="absolute inset-0 w-1/3 h-full bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-[-25deg] pointer-events-none"
                               />
                            </button>
                         </Link>
                      </div>
                    </>
                  ) : (
                    <div className="py-10 opacity-20"><p className="text-white font-bold">Loading latest tests...</p></div>
                  )}
               </div>
            </motion.div>
         </div>
      </section>

      <LatestVacancy />
      <FeaturedCategories />
      <PopularExams />
      <LatestMocks />
      <CurrentAffairsPreview />
      <MeritPreview />
      <MeetFounder />
      <Footer />
    </main>
  );
}

function ChallengeChip({ icon, label }: { icon: React.ReactNode, label: string }) {
   return (
      <div className="inline-flex items-center gap-2 h-[36px] px-[14px] bg-white/5 backdrop-blur-md border border-white/10 rounded-full hover:bg-white/10 transition-all duration-300 shadow-sm group/chip">
         <span className="shrink-0 text-primary">{icon}</span>
         <span className="text-[11px] font-bold text-white tracking-tight">{label}</span>
      </div>
   )
}
