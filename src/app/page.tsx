import React from "react";
import Navbar from "@/components/layout/Navbar";
import Hero from "@/components/home/Hero";
import Features from "@/components/home/Features";
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
 * @fileOverview Official Home Page v183.0.
 * RESTORED: Core Features hub (Mock Tests, Study Material, etc.) to original position.
 */

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white font-body pb-safe text-left">
      <Navbar />
      
      {/* 1. Hero Section */}
      <Hero />

      {/* 2. Core Features (Mock Tests, Study Material, PYQs, Analytics) */}
      <Features />

      {/* 3. Global Search */}
      <div className="relative z-40 py-8 md:py-12 bg-white">
        <GlobalSearch />
      </div>

      {/* 4. Exam Categories */}
      <FeaturedCategories />

      {/* 5. Popular Exams */}
      <PopularExams />

      {/* 6. Latest Mock Tests */}
      <LatestMocks />

      {/* 7. Personal Progress */}
      <ContinueLearning />

      {/* 8. Knowledge Hub */}
      <CurrentAffairsPreview />

      {/* 9. Merit Rankings */}
      <MeritPreview />

      {/* 10. Mobile App */}
      <AppPreview />

      {/* 11. Leadership Section */}
      <MeetFounder />
      
      <Footer />
    </main>
  );
}
