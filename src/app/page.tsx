
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
 * @fileOverview Optimized Institutional Landing Hub v44.0.
 * UPDATED: Strictly matched trust bar data and style to user screenshot (10.0k+, 500, 15,000, 94%).
 */

export default function HomePage() {
  const db = useFirestore();

  // STABILIZED DATA LISTENERS (Metadata only for home page performance)
  const statsRef = useMemo(() => (db ? doc(db, "settings", "stats") : null), [db]);
  const { data: stats, loading: statsLoading } = useDoc<any>(statsRef);

  const liveStats = useMemo(() => {
    // Default high-fidelity placeholders if registry stats haven't been seeded
    const qCount = stats?.totalQuestions || 10000;
    const mCount = stats?.totalMocks || 500;
    const uCount = stats?.totalUsers || 15000;
    const avgAcc = stats?.averageAccuracy || 94;

    return {
      mcqs: qCount >= 10000 ? "10.0k+" : qCount.toLocaleString(),
      mocks: mCount,
      users: uCount.toLocaleString(),
      accuracy: `${avgAcc}%`
    };
  }, [stats]);

  return (
    <main className="min-h-screen bg-white font-body pb-safe overflow-x-hidden">
      <Navbar />
      <Hero />

      {/* Trust Stats Bar - "Same to Same" Screenshot Update */}
      <section className="bg-white py-8 md:py-16 border-b border-slate-50">
         <div className="container mx-auto px-4 max-w-7xl">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-10">
               <TrustCard 
                  loading={statsLoading}
                  icon={<BookOpen className="text-primary h-4 w-4 md:h-6 md:w-6" />} 
                  label="MCQ BANK" 
                  val={liveStats.mcqs} 
               />
               <TrustCard 
                  loading={statsLoading}
                  icon={<Zap className="text-blue-500 h-4 w-4 md:h-6 md:w-6" />} 
                  label="MOCKS LIVE" 
                  val={liveStats.mocks} 
               />
               <TrustCard 
                  loading={statsLoading}
                  icon={<Users className="text-emerald-500 h-4 w-4 md:h-6 md:w-6" />} 
                  label="ASPIRANTS" 
                  val={liveStats.users} 
                  highlight
               />
               <TrustCard 
                  loading={statsLoading}
                  icon={<Target className="text-amber-500 h-4 w-4 md:h-6 md:w-6" />} 
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
        "flex items-center gap-4 md:gap-6 p-4 md:p-10 rounded-[2rem] md:rounded-[3rem] transition-all duration-500 border border-slate-50 h-full",
        highlight 
          ? "bg-white shadow-[0_35px_60px_-15px_rgba(0,0,0,0.1)] scale-105 z-10" 
          : "bg-slate-50/30 hover:bg-white hover:shadow-2xl"
      )}>
         <div className="h-10 w-10 md:h-16 md:w-16 rounded-2xl md:rounded-3xl bg-white flex items-center justify-center shrink-0 border border-slate-100 shadow-sm">{icon}</div>
         <div className="text-left space-y-1">
            {loading ? (
               <Skeleton className="h-6 w-16 bg-slate-200" />
            ) : (
               <p className="text-lg md:text-5xl font-headline font-black text-[#0F172A] leading-none tracking-tighter">{val}</p>
            )}
            <p className="text-[7px] md:text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 truncate">{label}</p>
         </div>
      </div>
   )
}
