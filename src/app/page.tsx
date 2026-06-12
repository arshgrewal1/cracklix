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
import PopularExams from "@/components/home/PopularExams";
import TrendingExams from "@/components/home/TrendingExams";

/**
 * @fileOverview Official Home Hub v146.0 (Strict Design Reference Match).
 * FLOW: Hero (Integrated Stats & Readiness) -> Popular Exams Card Hub -> Categories -> Content.
 */

export default function HomePage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <main className="min-h-screen bg-white font-body pb-safe overflow-x-hidden text-left">
      <Navbar />
      
      {/* 1. INSTITUTIONAL HERO HUB (Matched to ibb.co/F4D0JLHP) */}
      <Hero />

      {/* 2. POPULAR EXAMS HUB (Refined White Card with Institutional Checklist) */}
      <PopularExams />

      <div className="container mx-auto px-4 py-8 md:py-16 max-w-7xl space-y-16 md:space-y-32">
         {/* 3. CONTINUITY HUB (Only visible for logged-in students) */}
         <ContinueLearning />
         
         {/* 4. DISCOVERY HUB (Category Grids) */}
         <FeaturedCategories />
         
         {/* 5. RECENT CONTENT FEED (Latest Practice Mocks) */}
         <LatestMocks />
      </div>

      {/* 6. TRUST & BRAND IDENTITY (App Installation & Founder Bio) */}
      <AppPreview />
      <MeetFounder />
      
      <Footer />
    </main>
  );
}
