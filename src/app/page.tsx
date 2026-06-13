import React from "react";
import Navbar from "@/components/layout/Navbar";
import Hero from "@/components/home/Hero";
import FeaturedCategories from "@/components/home/FeaturedCategories";
import ContinueLearning from "@/components/home/ContinueLearning";
import LatestMocks from "@/components/home/LatestMocks";
import AppPreview from "@/components/home/AppPreview";
import MeetFounder from "@/components/home/MeetFounder";
import Footer from "@/components/layout/Footer";
import PopularExams from "@/components/home/PopularExams";

/**
 * @fileOverview Official Home Hub v170.0.
 * PERFORMANCE: Strict server component root with high-fidelity client sub-modules.
 * UPDATED: Promoted 'MY EXAMS' (ContinueLearning) to position 3 for maximum student visibility.
 */

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white font-body pb-safe overflow-x-hidden text-left">
      <Navbar />
      
      <Hero />

      {/* 1. Primary Discovery Hub */}
      <FeaturedCategories />

      {/* 2. Personalized Student Hub (MY EXAMS) */}
      <ContinueLearning />

      {/* 3. Authority Hubs (EXAM LIST) */}
      <PopularExams />

      {/* 4. Content Pulse (Global Latest) */}
      <LatestMocks />

      <AppPreview />
      <MeetFounder />
      
      <Footer />
    </main>
  );
}
