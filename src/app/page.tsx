import React from "react";
import Navbar from "@/components/layout/Navbar";
import Hero from "@/components/home/Hero";
import FeaturedCategories from "@/components/home/FeaturedCategories";
import PopularExams from "@/components/home/PopularExams";
import LatestMocks from "@/components/home/LatestMocks";
import ContinueLearning from "@/components/home/ContinueLearning";
import CurrentAffairsPreview from "@/components/home/CurrentAffairsPreview";
import MeritPreview from "@/components/home/MeritPreview";
import AppPreview from "@/components/home/AppPreview";
import MeetFounder from "@/components/home/MeetFounder";
import Footer from "@/components/layout/Footer";
import GlobalSearch from "@/components/home/GlobalSearch";
import StatsBar from "@/components/home/StatsBar";

/**
 * @fileOverview Official Home Page v205.1.
 * RESPONSIVE: Optimized for ultra-widescreen while maintaining mobile integrity.
 */
export default function HomePage() {
  return (
    <main className="min-h-screen bg-white font-body pb-safe text-left overflow-x-hidden">
      <Navbar />
      
      {/* 1. Hero Section */}
      <div className="w-full">
        <Hero />
      </div>

      {/* 2. Live Metrics Hub */}
      <div className="w-full">
        <StatsBar />
      </div>

      {/* 3. Global Search Hook */}
      <div className="relative z-40 py-10 md:py-24 bg-white">
        <GlobalSearch />
      </div>

      {/* 4. Choose Your Exam */}
      <FeaturedCategories />

      {/* 5. Popular Exams */}
      <PopularExams />

      {/* 6. Latest Mock Tests */}
      <LatestMocks />

      {/* 7. Personal Progress */}
      <ContinueLearning />

      {/* 8. Study Material */}
      <CurrentAffairsPreview />

      {/* 9. Merit Rankings */}
      <MeritPreview />

      {/* 10. Mobile App */}
      <AppPreview />

      {/* 11. Founder Section */}
      <MeetFounder />
      
      <Footer />
    </main>
  );
}
