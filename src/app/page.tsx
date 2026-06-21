import React from "react";
import Navbar from "@/components/layout/Navbar";
import Hero from "@/components/home/Hero";
import PopularExams from "@/components/home/PopularExams";
import LatestMocks from "@/components/home/LatestMocks";
import FeaturedCategories from "@/components/home/FeaturedCategories";
import ContinueLearning from "@/components/home/ContinueLearning";
import CurrentAffairsPreview from "@/components/home/CurrentAffairsPreview";
import MeritPreview from "@/components/home/MeritPreview";
import AppPreview from "@/components/home/AppPreview";
import MeetFounder from "@/components/home/MeetFounder";
import Footer from "@/components/layout/Footer";
import GlobalSearch from "@/components/home/GlobalSearch";

/**
 * @fileOverview Official Home Page v202.0.
 * UPDATED: Removed Preparation Hub to streamline discovery flow.
 */
export default function HomePage() {
  return (
    <main className="min-h-screen bg-white font-body pb-safe text-left">
      <Navbar />
      
      {/* 1. Hero Section */}
      <Hero />

      {/* 2. Global Search Hook */}
      <div className="relative z-40 py-8 md:py-12 bg-white">
        <GlobalSearch />
      </div>

      {/* 3. Choose Your Exam (Primary Discovery) */}
      <FeaturedCategories />

      {/* 4. Popular Exams */}
      <PopularExams />

      {/* 5. Latest Mock Tests */}
      <LatestMocks />

      {/* 6. Personal Progress */}
      <ContinueLearning />

      {/* 7. Study Material */}
      <CurrentAffairsPreview />

      {/* 8. Merit Rankings */}
      <MeritPreview />

      {/* 9. Mobile App */}
      <AppPreview />

      {/* 10. Founder Section */}
      <MeetFounder />
      
      <Footer />
    </main>
  );
}
