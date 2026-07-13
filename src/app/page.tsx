
'use client';

import React from "react";
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
import { FAQContent } from "@/app/faq/page";
import { useUser } from "@/firebase";
import { Zap, HelpCircle } from "lucide-react";

/**
 * @fileOverview Institutional Premium Hub v406.0.
 * FIXED: Replaced FAQPage with FAQContent to resolve double Navbar/Footer issue.
 */
export default function HomePage() {
  const { user } = useUser();

  return (
    <main className="min-h-screen bg-white font-body pb-safe text-left overflow-x-hidden">
      <Navbar />
      
      {/* 1. COMPACT HERO */}
      <Hero />

      {/* 2. STICKY SEARCH & ACTIONS */}
      <div className="relative z-40 bg-white">
        <GlobalSearch />
        <QuickActions />
      </div>

      {/* 3. DYNAMIC PROGRESS NODES */}
      {user && <ContinueLearning />}

      {/* 4. TODAY'S CHALLENGE HUB */}
      <section className="py-6 md:py-10 bg-white">
         <div className="max-w-7xl mx-auto px-4 md:px-8">
            <div className="bg-[#0B1528] rounded-[2rem] md:rounded-[3rem] p-8 flex flex-col md:flex-row items-center justify-between gap-8 text-white relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-8 opacity-5 rotate-12 group-hover:scale-110 transition-transform duration-1000">
                  <Zap className="h-48 w-48 text-primary" />
               </div>
               <div className="relative z-10 space-y-2 text-left">
                  <h2 className="text-xl md:text-3xl font-black tracking-tight">Today's Challenge</h2>
                  <p className="text-slate-400 font-medium text-sm md:text-lg">Quick 5-minute quiz to keep your streak active.</p>
               </div>
               <button className="relative z-10 h-14 px-10 bg-primary hover:bg-blue-700 text-white font-bold rounded-xl shadow-xl transition-all active:scale-95 border-none">
                  Start Quiz
               </button>
            </div>
         </div>
      </section>

      {/* 5. VACANCY HUB */}
      <LatestVacancy />

      {/* 6. REGISTRY DISCOVERY */}
      <FeaturedCategories />
      <PopularExams />
      <LatestMocks />

      {/* 7. ASSET PREVIEWS */}
      <CurrentAffairsPreview />
      <MeritPreview />

      {/* 8. FAQ CONTENT Hub */}
      <section className="bg-slate-50/50 py-12 md:py-24 border-y border-slate-100">
        <div className="container mx-auto px-4 md:px-8 max-w-7xl space-y-12">
           <div className="text-left space-y-4">
              <div className="flex items-center gap-3">
                 <HelpCircle className="h-5 w-5 text-primary" />
                 <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Institutional FAQ</span>
              </div>
              <h2 className="text-3xl md:text-5xl font-black text-[#0F172A] tracking-tight uppercase leading-[0.9]">Common <span className="text-primary italic">Questions</span></h2>
           </div>
           <FAQContent />
        </div>
      </section>
      
      <Footer />
    </main>
  );
}
