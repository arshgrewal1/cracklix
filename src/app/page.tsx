'use client';

import React, { useMemo, useState, useEffect } from "react";
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
import { Zap, Clock, Trophy, ChevronRight, Flame, ShieldCheck, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { collection, query, where, limit } from "firebase/firestore";
import StatsBar from "@/components/home/StatsBar";

/**
 * @fileOverview Institutional Premium Hub v504.0 [UI Restored].
 * FIXED: Removed aggressive height-restricted containers that caused overlapping.
 */
export default function HomePage() {
  const { user } = useUser();
  const db = useFirestore();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const quizQuery = useMemo(() => (db ? query(collection(db, "daily_quizzes"), where("status", "==", "PUBLISHED"), where("isTodayQuiz", "==", true), limit(1)) : null), [db]);
  const { data: quizzes, loading: quizLoading } = useCollection<any>(quizQuery);
  const activeQuiz = quizzes?.[0];

  return (
    <main className="min-h-screen bg-background font-body pb-safe text-left overflow-x-hidden">
      <Navbar />
      
      <Hero />
      <GlobalSearch />
      <QuickActions />
      <StatsBar />

      {user && (
        <ContinueLearning />
      )}

      {/* TODAY'S CHALLENGE HUB */}
      <section className="py-12 md:py-24 bg-background">
         <div className="max-w-7xl mx-auto px-4 md:px-8">
            <motion.div 
               initial={{ opacity: 0, y: 20 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true }}
               transition={{ duration: 0.5 }}
               className="bg-gradient-to-br from-[#0F172A] via-[#111827] to-[#1E293B] rounded-[32px] p-8 md:p-16 border border-white/10 shadow-5xl relative overflow-hidden group transition-all duration-500 text-center flex flex-col justify-center"
            >
               <div className="absolute top-4 right-4 p-0 opacity-[0.04] pointer-events-none group-hover:scale-110 transition-transform duration-1000">
                  <Zap className="h-64 w-64 text-primary" />
               </div>
               
               <div className="relative z-10 w-full">
                  <div className="space-y-4">
                     <div className="flex items-center justify-center gap-3">
                        <Flame className="h-8 w-8 text-orange-500 fill-current animate-pulse" />
                        <h2 className="text-3xl md:text-5xl font-black tracking-tight text-white antialiased leading-tight uppercase">
                           Today's Challenge
                        </h2>
                     </div>
                     {!isMounted || quizLoading ? (
                        <div className="h-8 w-64 mx-auto bg-white/5 animate-pulse rounded-lg mt-2" />
                     ) : (
                        <p className="text-lg md:text-2xl text-slate-300 font-medium max-w-2xl mx-auto italic">
                           "{activeQuiz?.title || "Daily Practice Mode"}"
                        </p>
                     )}
                  </div>

                  {!isMounted || quizLoading ? (
                    <div className="mt-12 flex justify-center">
                       <Loader2 className="h-10 w-10 text-primary animate-spin" />
                    </div>
                  ) : activeQuiz ? (
                    <div className="space-y-10 mt-10">
                      <div className="flex flex-row flex-wrap items-center justify-center gap-4">
                         <ChallengeChip icon={<Clock className="h-4 w-4" />} label={`${activeQuiz.duration} min`} />
                         <ChallengeChip icon={<ShieldCheck className="h-4 w-4" />} label={`${activeQuiz.totalQuestions} questions`} />
                         <ChallengeChip icon={<Trophy className="h-4 w-4" />} label={`${activeQuiz.rewardXP} XP`} />
                      </div>

                      <div className="pt-4 flex justify-center">
                         <Link href={`/mocks/instructions?id=${activeQuiz.id}`} className="w-full max-w-md">
                            <button className="relative overflow-hidden w-full h-16 md:h-20 bg-gradient-to-r from-blue-600 to-blue-400 hover:brightness-110 text-white font-black uppercase tracking-widest text-xs md:text-sm rounded-2xl md:rounded-[3rem] shadow-4xl transition-all duration-300 active:scale-95 border-none group/btn cursor-pointer text-center">
                               <div className="flex items-center justify-center gap-3 relative z-10">
                                  <Zap className="h-5 w-5 fill-white text-white" />
                                  <span>Start Challenge</span>
                                  <ChevronRight className="h-5 w-5 transition-transform group-hover/btn:translate-x-2" />
                               </div>
                               <motion.div 
                                  animate={{ x: ['-100%', '300%'] }}
                                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                  className="absolute inset-0 w-1/3 h-full bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-[-25deg] pointer-events-none"
                               />
                            </button>
                         </Link>
                      </div>
                    </div>
                  ) : (
                    <div className="py-20 opacity-20"><p className="text-white font-bold text-xl uppercase tracking-widest">No active challenge node found</p></div>
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
      <div className="inline-flex items-center gap-3 h-10 md:h-12 px-6 bg-white/5 backdrop-blur-md border border-white/10 rounded-full hover:bg-white/10 transition-all duration-300 shadow-sm group/chip">
         <span className="shrink-0 text-primary">{icon}</span>
         <span className="text-[10px] md:text-xs font-black uppercase text-white tracking-widest">{label}</span>
      </div>
   )
}