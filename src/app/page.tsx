
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

/**
 * @fileOverview Institutional Premium Hub v510.0.
 * UPDATED: Optimized Today's Challenge to match Continue Learning density.
 * FIXED: Removed all uppercase styling.
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

      {user && (
        <ContinueLearning />
      )}

      {/* Today's Challenge Hub - Compact (Continue Learning Style) */}
      <section className="py-4 md:py-8 bg-background">
         <div className="max-w-7xl mx-auto px-4 md:px-8">
            <motion.div 
               initial={{ opacity: 0, y: 15 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true }}
               transition={{ duration: 0.5 }}
               className="bg-gradient-to-br from-[#0F172A] to-[#1E293B] rounded-[24px] p-4 md:p-6 border border-white/10 shadow-xl relative overflow-hidden group text-left flex flex-col justify-center min-h-[140px]"
            >
               <div className="absolute top-2 right-2 opacity-[0.05] pointer-events-none group-hover:scale-110 transition-transform duration-1000">
                  <Zap className="h-24 w-24 text-primary" />
               </div>
               
               <div className="relative z-10 w-full space-y-4">
                  <div className="flex items-center justify-between gap-4">
                     <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500 shadow-inner">
                           <Flame className="h-4.5 w-4.5 fill-current animate-pulse" />
                        </div>
                        <h2 className="text-base md:text-xl font-bold tracking-tight text-white antialiased">
                           Today's challenge
                        </h2>
                     </div>
                     {activeQuiz && (
                       <div className="flex items-center gap-2 overflow-x-auto no-scrollbar hidden sm:flex">
                          <ChallengeChip icon={<Clock className="h-3 w-3" />} label={`${activeQuiz.duration}m`} />
                          <ChallengeChip icon={<Trophy className="h-3 w-3" />} label={`${activeQuiz.rewardXP} XP`} />
                       </div>
                     )}
                  </div>

                  <div className="space-y-1">
                     {!isMounted || quizLoading ? (
                        <div className="h-4 w-48 bg-white/5 animate-pulse rounded-lg" />
                     ) : (
                        <p className="text-sm md:text-lg font-medium text-slate-300 line-clamp-1 italic">
                           "{activeQuiz?.title || "Daily practice mode active"}"
                        </p>
                     )}
                  </div>

                  {!isMounted || quizLoading ? (
                    <div className="flex justify-start">
                       <Loader2 className="h-6 w-6 text-primary animate-spin" />
                    </div>
                  ) : activeQuiz ? (
                    <div className="flex flex-col sm:flex-row items-center gap-4">
                      <div className="w-full sm:w-auto flex-1">
                         <Link href={`/mocks/instructions?id=${activeQuiz.id}`} className="block">
                            <button className="relative overflow-hidden w-full h-11 md:h-12 bg-primary hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-lg transition-all duration-300 active:scale-95 border-none group/btn">
                               <div className="flex items-center justify-center gap-3 relative z-10">
                                  <Zap className="h-3.5 w-3.5 fill-white text-white" />
                                  <span>Start challenge</span>
                                  <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover/btn:translate-x-1" />
                               </div>
                            </button>
                         </Link>
                      </div>
                      <div className="flex sm:hidden items-center gap-2">
                         <ChallengeChip icon={<Clock className="h-3 w-3" />} label={`${activeQuiz.duration}m`} />
                         <ChallengeChip icon={<ShieldCheck className="h-3 w-3" />} label={`${activeQuiz.totalQuestions} Items`} />
                      </div>
                    </div>
                  ) : (
                    <div className="opacity-20">
                       <p className="text-white font-bold text-sm tracking-tight">No active challenge found</p>
                    </div>
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
      <div className="inline-flex items-center gap-1.5 h-7 px-3 bg-white/5 border border-white/10 rounded-lg shadow-sm shrink-0">
         <span className="text-primary">{icon}</span>
         <span className="text-[10px] font-bold text-slate-300">{label}</span>
      </div>
   )
}
