
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
import { Zap, Clock, Trophy, ChevronRight, Flame, ShieldCheck, Loader2, HelpCircle, ArrowRight, Star } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { collection, query, where, limit } from "firebase/firestore";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

/**
 * @fileOverview Premium Institutional Hub v525.0.
 * FIXED: Resolved syntax error with PopularExams tag.
 * FIXED: Reduced "Today's Challenge" font size to prevent PWA wrapping.
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

      {/* Today's Challenge Hub - Premium Glassmorphism Redesign */}
      <section className="py-6 md:py-10 bg-background">
         <div className="max-w-7xl mx-auto px-4 md:px-8">
            <motion.div 
               initial={{ opacity: 0, y: 20 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true }}
               className="relative bg-gradient-to-br from-[#111827] to-[#1F2937] rounded-[24px] p-5 md:p-8 border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.3)] overflow-hidden group text-left"
            >
               {/* Premium Background Decorations */}
               <div className="absolute inset-0 pointer-events-none opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
               <motion.div 
                 animate={{ scale: [1, 1.2, 1], opacity: [0.03, 0.06, 0.03] }}
                 transition={{ duration: 8, repeat: Infinity }}
                 className="absolute -top-20 -right-20 w-80 h-80 bg-primary rounded-full blur-[100px]" 
               />

               <div className="relative z-10 space-y-5 md:space-y-8">
                  {/* Top Row: Brand & Title */}
                  <div className="flex items-center justify-between gap-2">
                     <div className="flex items-center gap-2 md:gap-3 min-w-0">
                        <div className="h-8 w-8 md:h-12 md:w-12 rounded-full bg-gradient-to-br from-orange-400 to-yellow-400 flex items-center justify-center shadow-[0_0_20px_rgba(251,146,60,0.4)] shrink-0">
                           <Flame className="h-4 w-4 md:h-6 md:w-6 text-white fill-current animate-pulse" />
                        </div>
                        <h2 className="text-base md:text-[32px] font-bold text-white tracking-tight antialiased truncate">
                           Today's Challenge
                        </h2>
                     </div>
                     <Badge className="bg-gradient-to-r from-primary to-blue-500 text-white border-none px-2 py-0.5 md:px-3 md:py-1 font-black text-[8px] md:text-[9px] uppercase tracking-widest shadow-xl shrink-0">
                        Daily
                     </Badge>
                  </div>

                  {/* Second Row: Premium Stat Cards */}
                  <div className="grid grid-cols-3 gap-2 md:gap-4">
                     <StatCard icon={<Clock className="text-orange-400 h-3.5 w-3.5 md:h-4 md:w-4" />} label={`${activeQuiz?.duration || 15} Min`} />
                     <StatCard icon={<HelpCircle className="text-blue-400 h-3.5 w-3.5 md:h-4 md:w-4" />} label={`${activeQuiz?.totalQuestions || 20} Questions`} />
                     <StatCard icon={<Trophy className="text-amber-400 h-3.5 w-3.5 md:h-4 md:w-4" />} label={`${activeQuiz?.rewardXP || 100} XP`} />
                  </div>

                  {/* Challenge Content Block */}
                  <div className="space-y-1">
                     <h3 className="text-base md:text-[22px] font-semibold text-white tracking-tight leading-tight line-clamp-1">
                        {activeQuiz?.title || "GK Master Challenge"}
                     </h3>
                     <p className="text-[11px] md:text-sm text-slate-400 font-medium tracking-tight">
                        Practice daily to improve speed and accuracy.
                     </p>
                  </div>

                  {/* Premium CTA Button */}
                  <div className="pt-1">
                     {!isMounted || quizLoading ? (
                        <div className="h-14 w-full bg-white/5 animate-pulse rounded-2xl" />
                     ) : activeQuiz ? (
                        <Link href={`/mocks/instructions?id=${activeQuiz.id}`} className="block">
                           <Button className="w-full h-12 md:h-14 bg-gradient-to-r from-[#3B82F6] to-[#2563EB] hover:brightness-110 text-white font-black uppercase text-[10px] md:text-xs tracking-widest rounded-2xl shadow-[0_10px_30px_-10px_rgba(37,99,235,0.5)] border-none transition-all active:scale-[0.98] group/btn">
                              <Zap className="h-4 w-4 mr-2 fill-current" />
                              Start Challenge
                              <ArrowRight className="h-4 w-4 ml-auto opacity-40 group-hover/btn:translate-x-1 transition-transform" />
                           </Button>
                        </Link>
                     ) : (
                        <div className="p-4 bg-white/5 rounded-xl text-center">
                           <p className="text-slate-500 font-bold text-xs uppercase tracking-widest">Awaiting database sync</p>
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
      <div className="flex flex-col items-center justify-center p-2 md:p-4 bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl space-y-1.5 hover:bg-white/10 transition-all cursor-default h-full">
         <div className="opacity-80 scale-90 md:scale-100">{icon}</div>
         <span className="text-[8px] md:text-sm font-semibold text-white/90 tracking-tight whitespace-nowrap">{label}</span>
      </div>
   );
}
