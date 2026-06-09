
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
import { useCollection, useFirestore } from "@/firebase";
import { collection, query, where } from "firebase/firestore";
import { BookOpen, Zap, Users, Target } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * @fileOverview Optimized Institutional Landing Hub v41.0.
 * UPDATED: Implemented 5-Category hierarchy and Discovery Persistence Hub.
 */

export default function HomePage() {
  const db = useFirestore();

  // STABILIZED LIVE COLLECTION LISTENERS
  const { data: users, loading: usersLoading } = useCollection<any>(useMemo(() => (db ? collection(db, "users") : null), [db]));
  const { data: mocks, loading: mocksLoading } = useCollection<any>(useMemo(() => (db ? query(collection(db, "mocks"), where("published", "==", true)) : null), [db]));
  const { data: questions, loading: questionsLoading } = useCollection<any>(useMemo(() => (db ? collection(db, "questions") : null), [db]));
  const { data: results, loading: resultsLoading } = useCollection<any>(useMemo(() => (db ? collection(db, "results") : null), [db]));

  const liveStats = useMemo(() => {
    const qCount = questions?.length || 0;
    const mCount = mocks?.length || 0;
    const uCount = users?.length || 0;
    
    let avgAcc = 94; 
    if (results && results.length > 0) {
       const sum = results.reduce((acc: number, r: any) => acc + (r.accuracy || 0), 0);
       avgAcc = Math.round(sum / results.length);
    }

    return {
      mcqs: qCount > 999 ? `${(qCount / 1000).toFixed(1)}k+` : qCount.toString(),
      mocks: mCount,
      users: uCount.toLocaleString(),
      accuracy: `${avgAcc}%`
    };
  }, [questions, mocks, users, results]);

  const isGlobalLoading = usersLoading || mocksLoading || questionsLoading || resultsLoading;

  return (
    <main className="min-h-screen bg-white font-body pb-safe overflow-x-hidden">
      <Navbar />
      <Hero />

      {/* Trust Stats Bar */}
      <section className="bg-white py-4 md:py-12 border-b border-slate-50">
         <div className="container mx-auto px-4 max-w-7xl">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-10">
               <TrustCard 
                  loading={isGlobalLoading}
                  icon={<BookOpen className="text-primary h-4 w-4 md:h-6 md:w-6" />} 
                  label="MCQ Bank" 
                  val={liveStats.mcqs} 
               />
               <TrustCard 
                  loading={isGlobalLoading}
                  icon={<Zap className="text-blue-500 h-4 w-4 md:h-6 md:w-6" />} 
                  label="Mocks Live" 
                  val={liveStats.mocks} 
               />
               <TrustCard 
                  loading={isGlobalLoading}
                  icon={<Users className="text-emerald-500 h-4 w-4 md:h-6 md:w-6" />} 
                  label="Aspirants" 
                  val={liveStats.users} 
               />
               <TrustCard 
                  loading={isGlobalLoading}
                  icon={<Target className="text-amber-500 h-4 w-4 md:h-6 md:w-6" />} 
                  label="Avg Accuracy" 
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

function TrustCard({ icon, label, val, loading }: any) {
   return (
      <div className="flex items-center gap-3 p-3 md:p-6 rounded-2xl bg-slate-50/50 border border-slate-50 transition-all hover:bg-white hover:shadow-xl">
         <div className="h-8 w-8 md:h-14 md:w-14 rounded-xl bg-white flex items-center justify-center shrink-0 border border-slate-100 shadow-sm">{icon}</div>
         <div className="text-left">
            {loading ? (
               <Skeleton className="h-6 w-16 bg-slate-200" />
            ) : (
               <p className="text-sm md:text-3xl font-headline font-black text-[#0F172A] leading-none tracking-tight">{val}</p>
            )}
            <p className="text-[7px] md:text-[9px] font-black uppercase tracking-widest text-slate-400 mt-1 truncate">{label}</p>
         </div>
      </div>
   )
}
