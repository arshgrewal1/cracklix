import React from "react";
import Navbar from "@/components/layout/Navbar";
import Hero from "@/components/home/Hero";
import GlobalSearch from "@/components/home/GlobalSearch";
import FeaturedCategories from "@/components/home/FeaturedCategories";
import PopularExams from "@/components/home/PopularExams";
import LatestMocks from "@/components/home/LatestMocks";
import ContinueLearning from "@/components/home/ContinueLearning";
import CurrentAffairsPreview from "@/components/home/CurrentAffairsPreview";
import MeritPreview from "@/components/home/MeritPreview";
import AppPreview from "@/components/home/AppPreview";
import MeetFounder from "@/components/home/MeetFounder";
import Footer from "@/components/layout/Footer";

/**
 * @fileOverview Official Home Hub v176.0 (Optimized Layout).
 * FIXED: Removed redundant negative margin causing search/hero overlap.
 */

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white font-body pb-safe text-left">
      <Navbar />
      
      {/* 1. Hero Section & Real-time Stats */}
      <Hero />

      {/* 1.5 Global Search Engine */}
      <div className="relative z-40 py-8 md:py-12 bg-white">
        <GlobalSearch />
      </div>

      {/* 2. Exam Categories (Broad Discovery) */}
      <FeaturedCategories />

      {/* 3. Popular Exams (Commission Nodes) */}
      <PopularExams />

      {/* 4. Latest Mock Tests (Direct Practice) */}
      <LatestMocks />

      {/* 5. Personal Prep (Logged-in context) */}
      <ContinueLearning />

      {/* 6. Knowledge Hub (Current Affairs) */}
      <CurrentAffairsPreview />

      {/* 7. Competitive Index (Merit List) */}
      <MeritPreview />

      {/* 8. Hardware Hub (Mobile App) */}
      <AppPreview />

      {/* 9. Leadership Node (Founder) */}
      <MeetFounder />
      
      <Footer />
    </main>
  );
}
