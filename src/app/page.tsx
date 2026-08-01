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
 * @fileOverview Premium Institutional Hub v531.0.
 * FIXED: Resolved JSX syntax error (unbalanced tags) around Today's Challenge.
 * UPDATED: Today's Challenge indicators are compact squares with zero spacing.
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

      {/* Today's Challenge Hub - Square Compact Indicators */}
      <section className="py-6 md:py-10 bg-background">
         <div className="max-w-7xl mx-auto px-4 md:px-8">
            <motion.div 
               initial={{ opacity: 0, y: 20 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true }}
               className="relative bg-gradient-to-br from-[#0B1224] to-[#161F33] rounded-[24px] p-5 md:p-8 border border-white/5 shadow-2xl overflow-hidden group text-left"
            >
               {/* Premium Background Decorations */}
               <div className="absolute inset-0 pointer-events-none opacity-[0.02]" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
               
               <div className="relative z-10 space-y-6 md:space-y-8">
                  {/* Top Row: Brand & Title */}
                  <div className="flex items-center justify-between gap-4">
                     <div className="flex items-center gap-3 min-w-0">
                        <div className="h-10 w-10 md:h-12 md:w-12 rounded-xl bg-primary/20 flex items-center justify-center shadow-inner shrink-0 border border-primary/20">
                           <Flame className="h-5 w-5 md:h-6 md:w-6 text-primary fill-current animate-pulse" />
                        </div>
                        <h2 className="text-lg md:text-3xl font-[800] text-white tracking-tight antialiased truncate">
                           Today's Challenge
                        </h2>
                     </div>
                     <Badge className="bg-primary text-white border-none px-3 py-1 font-black text-[9px] uppercase tracking-widest shadow-xl shrink-0">
                        Sync Live
                     </Badge>
                  </div>

                  {/* Challenge Info Block */}
                  <div className="space-y-1">
                     <h3 className="text-base md:text-xl font-bold text-white tracking-tight leading-tight line-clamp-1">
                        {activeQuiz?.title || "GK Master Challenge"}
                     </h3>
                     <p className="text-[11px] md:text-sm text-slate-400 font-medium tracking-tight">
                        Complete today's official patterns to earn XP.
                     </p>
                  </div>

                  {/* Second Row: Square Compact Stat Indicators */}
                  <div className="flex items-center gap-1.5 md:gap-2">
                     <StatCard icon={<Clock className="text-orange-400 h-3.5 w-3.5" />} label={`${activeQuiz?.duration || 15}m`} />
                     <StatCard icon={<HelpCircle className="text-blue-400 h-3.5 w-3.5" />} label={`${activeQuiz?.totalQuestions || 20} Qs`} />
                     <StatCard icon={<Trophy className="text-amber-400 h-3.5 w-3.5" />} label={`${activeQuiz?.rewardXP || 100} XP`} />
                  </div>

                  {/* Premium CTA Button */}
                  <div className="pt-2">
                     {!isMounted || quizLoading ? (
                        <div className="h-14 w-full bg-white/5 animate-pulse rounded-2xl" />
                     ) : activeQuiz ? (
                        <Link href={`/mocks/instructions?id=${activeQuiz.id}`} className="block">
                           <Button className="w-full h-12 md:h-14 bg-primary hover:bg-blue-700 text-white font-black uppercase text-[10px] md:text-xs tracking-widest rounded-xl md:rounded-2xl shadow-xl border-none transition-all active:scale-95 group/btn">
                              <Zap className="h-4 w-4 mr-2 fill-current" />
                              Attempt now
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
      <div className="flex flex-col items-center justify-center px-4 py-2 bg-white/5 border border-white/5 rounded-xl space-y-1 hover:bg-white/10 transition-all cursor-default shrink-0 min-w-[70px] md:min-w-[90px]">
         <div className="opacity-80 scale-90">{icon}</div>
         <span className="text-[10px] md:text-xs font-black text-white/90 tracking-tight whitespace-nowrap tabular-nums">{label}</span>
      </div>
   );
}
