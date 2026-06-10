
"use client"

import React, { useMemo } from "react";
import Navbar from "@/components/layout/Navbar";
import Hero from "@/components/home/Hero";
import FeaturedCategories from "@/components/home/FeaturedCategories";
import ContinueLearning from "@/components/home/ContinueLearning";
import TrendingExams from "@/components/home/TrendingExams";
import LatestMocks from "@/components/home/LatestMocks";
import Features from "@/components/home/Features";
import AppPreview from "@/components/home/AppPreview";
import MeetFounder from "@/components/home/MeetFounder";
import Footer from "@/components/layout/Footer";
import { useDoc, useFirestore } from "@/firebase";
import { doc } from "firebase/firestore";
import { BookOpen, Zap, Users, Target } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

/**
 * @fileOverview Optimized Institutional Landing Hub v55.0.
 * UPDATED: Absolute 0-Baseline Sync. All placeholder figures removed.
 */

export default function HomePage() {
  const db = useFirestore();

  // STABILIZED DATA LISTENERS
  const statsRef = useMemo(() => (db ? doc(db, "settings", "stats") : null), [db]);
  const { data: stats, loading: statsLoading } = useDoc<any>(statsRef);

  const liveStats = useMemo(() => {
    // 1. Audit Registry Values (Absolute Reality from stats node)
    const qCount = stats?.totalQuestions || 0;
    const mCount = stats?.totalMocks || 0;
    const uCount = stats?.totalUsers || 0;
    const avgAcc = stats?.averageAccuracy || 0;

    // 2. High-Fidelity Formatting
    const formatNumber = (num: number) => {
       if (num >= 1000) return (num / 1000).toFixed(1) + 'k+';
       return num.toString();
    }

    return {
      mcqs: formatNumber(qCount),
      mocks: mCount.toLocaleString(),
      users: uCount.toLocaleString(),
      accuracy: `${avgAcc}%`
    };
  }, [stats]);

  return (
    <main className="min-h-screen bg-white font-body pb-safe overflow-x-hidden">
      <Navbar />
      <Hero />

      {/* Trust Stats Bar - Authoritative Registry Hub */}
      <section className="bg-white py-12 md:py-20 border-b border-slate-50">
         <div className="container mx-auto px-4 max-w-7xl">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-10">
               <TrustCard 
                  loading={statsLoading}
                  icon={<BookOpen className="text-[#F97316] h-5 w-5 md:h-8 md:w-8" />} 
                  label="MCQ BANK" 
                  val={liveStats.mcqs} 
               />
               <TrustCard 
                  loading={statsLoading}
                  icon={<Zap className="text-[#3B82F6] h-5 w-5 md:h-8 md:w-8" />} 
                  label="MOCKS LIVE" 
                  val={liveStats.mocks} 
               />
               <TrustCard 
                  loading={statsLoading}
                  icon={<Users className="text-[#10B981] h-5 w-5 md:h-8 md:w-8" />} 
                  label="ASPIRANTS" 
                  val={liveStats.users} 
                  highlight={liveStats.users !== "0"}
               />
               <TrustCard 
                  loading={statsLoading}
                  icon={<Target className="text-[#EAB308] h-5 w-5 md:h-8 md:w-8" />} 
                  label="AVG ACCURACY" 
                  val={liveStats.accuracy} 
               />
            </div>
         </div>
      </section>

      {/* Main Persistent Discovery Hub */}
      <div className="container mx-auto px-4 py-12 md:py-24 max-w-7xl space-y-16 md:space-y-32">
         <ContinueLearning />
         <FeaturedCategories />
         <TrendingExams />
         <LatestMocks />
      </div>

      <AppPreview />
      <Features />
      
      <MeetFounder />

      <Footer />
    </main>
  );
}

function TrustCard({ icon, label, val, loading, highlight = false }: any) {
   return (
      <div className={cn(
        "flex items-center gap-6 md:gap-8 p-8 md:p-12 rounded-[2.5rem] md:rounded-[3.5rem] transition-all duration-500 border border-slate-50 h-full bg-white shadow-sm",
        highlight 
          ? "shadow-[0_40px_80px_-20px_rgba(0,0,0,0.08)] scale-105 z-10 border-slate-100" 
          : "hover:bg-slate-50/30 hover:shadow-xl"
      )}>
         <div className="h-14 w-14 md:h-20 md:w-20 rounded-[1.5rem] md:rounded-[2rem] bg-white flex items-center justify-center shrink-0 border border-slate-100 shadow-sm">{icon}</div>
         <div className="text-left space-y-1.5">
            {loading ? (
               <Skeleton className="h-8 w-24 bg-slate-200" />
            ) : (
               <p className="text-3xl md:text-6xl font-headline font-black text-[#0F172A] leading-none tracking-tighter tabular-nums">{val}</p>
            )}
            <p className="text-[9px] md:text-[13px] font-black uppercase tracking-[0.3em] text-slate-400 truncate">{label}</p>
         </div>
      </div>
   )
}
