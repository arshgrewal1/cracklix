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
 * @fileOverview Official Home Hub v167.0.
 * PERFORMANCE: Strict server component root with high-fidelity client sub-modules.
 * UPDATED: Reordered sections - Category Hub now precedes Popular Exams.
 */

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white font-body pb-safe overflow-x-hidden text-left">
      <Navbar />
      
      <Hero />

      {/* Primary Discovery Hub */}
      <FeaturedCategories />

      {/* Authority Hubs */}
      <PopularExams />

      {/* Content Pulse */}
      <LatestMocks />

      {/* User Activity Hub (Hides if no data) */}
      <ContinueLearning />

      <AppPreview />
      <MeetFounder />
      
      <Footer />
    </main>
  );
}
