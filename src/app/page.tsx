"use client"

import React, { useState, useEffect } from "react";
import Navbar from "@/components/layout/Navbar";
import Hero from "@/components/home/Hero";
import FeaturedCategories from "@/components/home/FeaturedCategories";
import ContinueLearning from "@/components/home/ContinueLearning";
import LatestMocks from "@/components/home/LatestMocks";
import AppPreview from "@/components/home/AppPreview";
import MeetFounder from "@/components/home/MeetFounder";
import Footer from "@/components/layout/Footer";
import TrendingExams from "@/components/home/TrendingExams";
import StatsBar from "@/components/home/StatsBar";
import Features from "@/components/home/Features";

/**
 * @fileOverview Official Home Hub v110.0 (Wireframe Aligned).
 * ORDER: Hero -> Trending -> Stats -> Why Cracklix -> Anchor Zone (Continue Learning -> Categories).
 */

export default function HomePage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <main className="min-h-screen bg-white font-body pb-safe overflow-x-hidden text-left">
      <Navbar />
      
      {/* 1. HERO HUB */}
      <Hero />

      {/* 2. TRENDING EXAMS (MATCHED TO WIREFRAME) */}
      <TrendingExams />

      {/* 3. LIVE STATS */}
      <StatsBar />

      {/* 4. WHY CRACKLIX? */}
      <Features />

      <div className="container mx-auto px-4 py-12 md:py-24 max-w-7xl space-y-16 md:space-y-32">
         {/* 5. ANCHOR ZONE (NO CHANGE) */}
         <ContinueLearning />
         <FeaturedCategories />
         
         {/* 6. RECENT CONTENT */}
         <LatestMocks />
      </div>

      {/* 7. TRUST & IDENTITY NODES */}
      <AppPreview />
      <MeetFounder />
      
      <Footer />
    </main>
  );
}
