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
import FeaturedSeries from "@/components/home/FeaturedSeries";
import { useUser, useCollection, useFirestore } from "@/firebase";
import { Zap, Clock, Trophy, ChevronRight, Flame, ShieldCheck, Loader2, HelpCircle, ArrowRight, Star, Layers, Bookmark } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { collection, query, where, limit } from "firebase/firestore";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

/**
 * @fileOverview Premium Institutional Hub v534.0 [Full Series Hub Added].
 * FIXED: Replaced individual featured test placeholder with the robust FeaturedSeries component.
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

      {user && <ContinueLearning />}

      {/* Primary Featured Series (Admin Curated) */}
      <FeaturedSeries />

      {/* Today's Challenge Hub */}
      <section className="py-6 md:py-10 bg-background">
         <div className="max-w-7xl mx-auto px-4 md:px-8">
            <motion.div 
               initial={{ opacity: 0, y: 20 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true }}
               className="relative bg-white rounded-[24px] p-5 md:p-10 border border-[#E5EAF2] shadow-sm overflow-hidden group text-left"
            >
               <div className="relative z-10 space-y-6 md:space-y-8">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                     <div className="flex items-center gap-3 min-w-0">
                        <div className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-[#1677FF]/5 flex items-center justify-center shadow-inner shrink-0 border border-[#1677FF]/10">
                           <Flame className="h-5 w-5 md:h-6 md:w-6 text-[#1677FF] fill-current animate-pulse" />
                        </div>
                        <h2 className="text-lg md:text-3xl font-[800] text-[#071B4D] tracking-tight antialiased">
                           Today's Challenge
                        </h2>
                     </div>
                     <Badge className="bg-[#1677FF] text-white border-none px-4 py-1.5 rounded-full font-black text-[9px] uppercase tracking-widest shadow-lg shrink-0">
                        Sync Live
                     </Badge>
                  </div>

                  <div className="space-y-2">
                     <h3 className="text-base md:text-2xl font-black text-[#071B4D] tracking-tight leading-tight">
                        {activeQuiz?.title || "GK Master Challenge"}
                     </h3>
                     <p className="text-[12px] md:text-base text-slate-500 font-medium tracking-tight">
                        Complete today's official patterns to earn XP.
                     </p>
                  </div>

                  <div className="flex items-center gap-2 md:gap-4 overflow-x-auto no-scrollbar py-1">
                     <StatCard icon={<Clock className="text-orange-500 h-4 w-4" />} label={`${activeQuiz?.duration || 15}m`} />
                     <StatCard icon={<HelpCircle className="text-[#1677FF] h-4 w-4" />} label={`${activeQuiz?.totalQuestions || 20} Qs`} />
                     <StatCard icon={<Trophy className="text-amber-500 h-4 w-4" />} label={`${activeQuiz?.rewardXP || 100} XP`} />
                  </div>

                  <div className="pt-2">
                     {!isMounted || quizLoading ? (
                        <div className="h-14 w-full bg-slate-50 animate-pulse rounded-2xl" />
                     ) : activeQuiz ? (
                        <Link href={`/mocks/instructions?id=${activeQuiz.id}`} className="block">
                           <Button className="w-full h-14 md:h-16 bg-[#1677FF] hover:bg-[#1677FF]/90 text-white font-black uppercase text-[11px] md:text-sm tracking-widest rounded-2xl shadow-lg border-none transition-all active:scale-95 group/btn">
                              <Zap className="h-5 w-5 mr-3 fill-current" />
                              Attempt now
                              <ArrowRight className="h-5 w-5 ml-auto opacity-40 group-hover/btn:translate-x-2 transition-transform" />
                           </Button>
                        </Link>
                     ) : (
                        <div className="p-6 bg-[#F8FAFC] rounded-2xl text-center border border-[#E5EAF2]">
                           <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Awaiting database sync</p>
                        </div>
                     )}
                  </div>
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

function StatCard({ icon, label }: { icon: React.ReactNode, label: string }) {
   return (
      <div className="flex flex-col items-center justify-center px-6 py-4 bg-[#F8FAFC] border border-[#E5EAF2] rounded-[16px] space-y-2 hover:bg-white hover:shadow-md transition-all cursor-default shrink-0 min-w-[90px] md:min-w-[120px]">
         <div className="scale-110">{icon}</div>
         <span className="text-[11px] md:text-sm font-black text-[#071B4D] tracking-tighter whitespace-nowrap tabular-nums">{label}</span>
      </div>
   );
}
