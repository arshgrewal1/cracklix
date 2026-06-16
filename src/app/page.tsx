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
import Footer from "@/components/layout/Footer";

/**
 * @fileOverview Official Home Hub v173.0 (Search Integrated).
 * PERFORMANCE: Implements the 9-point hierarchical order with Global Search.
 */

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white font-body pb-safe overflow-x-hidden text-left">
      <Navbar />
      
      {/* 1. Hero Section */}
      <Hero />

      {/* 1.5 Global Search Bar */}
      <div className="md:-mt-10 relative z-40 pb-8 md:pb-0">
        <GlobalSearch />
      </div>

      {/* 2. Exam Categories */}
      <FeaturedCategories />

      {/* 3. Popular Exams (Exam Hub) */}
      <PopularExams />

      {/* 4. Latest Mock Tests */}
      <LatestMocks />

      {/* 5. Continue Learning (Logged-in User context) */}
      <ContinueLearning />

      {/* 6. Current Affairs / Study Updates */}
      <CurrentAffairsPreview />

      {/* 7. Punjab Merit / Top Rankers */}
      <MeritPreview />

      {/* 8. App Download / Mobile Hub */}
      <AppPreview />
      
      <Footer />
    </main>
  );
}
