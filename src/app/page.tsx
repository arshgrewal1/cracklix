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
 * @fileOverview Official Home Hub v149.0 (Server Component Conversion).
 * STABILITY: Converted to Server Component to eliminate hydration displacement.
 */

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white font-body pb-safe overflow-x-hidden text-left">
      <Navbar />
      
      <Hero />

      <PopularExams />

      <div className="container mx-auto px-4 py-12 md:py-24 max-w-7xl space-y-16 md:space-y-32">
         {/* CONTINUITY HUB */}
         <ContinueLearning />
         
         {/* DISCOVERY HUB */}
         <FeaturedCategories />
         
         {/* RECENT CONTENT FEED */}
         <LatestMocks />
      </div>

      {/* TRUST & BRAND IDENTITY */}
      <AppPreview />
      <MeetFounder />
      
      <Footer />
    </main>
  );
}
