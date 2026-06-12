"use client"

import React, { useMemo, useState, useEffect } from "react";
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
import { ShieldCheck, Zap, Trophy, Target, Activity } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

/**
 * @fileOverview Optimized Institutional Landing Hub v63.1.
 * FIXED: Hydration error with live stats via isMounted guard and text synchronization.
 */

export default function HomePage() {
  const db = useFirestore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // STABILIZED DATA LISTENERS
  const statsRef = useMemo(() => (db ? doc(db, "settings", "stats") : null), [db]);
  const { data: stats, loading: statsLoading } = useDoc<any>(statsRef);

  const liveStats = useMemo(() => {
    if (!stats) return { hubs: "0", solutions: "0", rankers: "0", accuracy: "94%" };
    const hubs = stats.totalBoards || 0;
    const qCount = stats.totalQuestions || 0;
    const uCount = stats.totalUsers || 0;
    const avgAcc = stats.averageAccuracy || 94;
    
    const formatNumber = (num: number) => {
       if (!num) return "0";
       if (num >= 1000) return (num / 1000).toFixed(1) + 'k+';
       return num.toString();
    }
    
    return {
      hubs: hubs.toString(),
      solutions: formatNumber(qCount),
      rankers: formatNumber(uCount),
      accuracy: `${avgAcc}%`
    };
  }, [stats]);

  return (
    <main className="min-h-screen bg-white font-body pb-safe overflow-x-hidden text-left">
      <Navbar />
      <Hero />

      {/* Trust Stats Bar - Ultra Compact Horizontal Strip */}
      <section className="bg-white py-6 md:py-10 border-b border-slate-50 relative overflow-hidden">
         <div className="container mx-auto px-3 md:px-6 max-w-7xl">
            <div className="flex flex-wrap lg:flex-nowrap gap-3 md:gap-6 justify-center">
               <TrustCard loading={statsLoading || !mounted} icon={<ShieldCheck className="text-emerald-500 h-4 w-4 md:h-5 md:w-5" />} label="VERIFIED HUBS" val={mounted ? liveStats.hubs : "---"} />
               <TrustCard loading={statsLoading || !mounted} icon={<Zap className="text-primary h-4 w-4 md:h-5 md:w-5" />} label="LOGIC SOLUTIONS" val={mounted ? liveStats.solutions : "---"} />
               <TrustCard loading={statsLoading || !mounted} icon={<Trophy className="text-amber-500 h-4 w-4 md:h-5 md:w-5" />} label="STATE RANKING" val={mounted ? liveStats.rankers : "---"} isLive />
               <TrustCard loading={statsLoading || !mounted} icon={<Target className="text-blue-500 h-4 w-4 md:h-5 md:w-5" />} label="AVG ACCURACY" val={mounted ? liveStats.accuracy : "---"} />
            </div>
         </div>
      </section>

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

function TrustCard({ icon, label, val, loading, isLive }: any) {
   return (
      <div className="bg-white p-3 md:p-6 rounded-xl md:rounded-[2rem] border border-slate-100 shadow-md hover:shadow-xl transition-all group relative flex items-center gap-3 md:gap-5 flex-1 min-w-[140px] max-w-full lg:max-w-none">
         <div className="h-8 w-8 md:h-12 md:w-12 rounded-lg md:rounded-xl bg-slate-50 flex items-center justify-center shrink-0 shadow-inner group-hover:scale-105 transition-transform">
            {icon}
         </div>
         <div className="space-y-0.5 min-w-0">
            {loading ? (
               <Skeleton className="h-4 w-12 bg-slate-100" />
            ) : (
               <p className="text-sm md:text-2xl font-headline font-black text-[#0F172A] leading-none tabular-nums truncate">{val}</p>
            )}
            <p className="text-[6px] md:text-[9px] font-black uppercase tracking-widest text-slate-400 md:mt-1 truncate">{label}</p>
         </div>
         {isLive && (
            <div className="absolute top-2 right-2 flex items-center gap-1.5">
               <span className="text-[6px] font-black text-emerald-500 hidden md:inline uppercase tracking-tighter">LIVE</span>
               <div className="h-1 w-1 rounded-full bg-emerald-500 animate-pulse" />
            </div>
         )}
      </div>
   )
}