
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

/**
 * @fileOverview Official Home Hub v147.0 (Hydration Hardened).
 * FIXED: Removed redundant dynamic containers to resolve structural mismatch during hydration.
 */

export default function HomePage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <main className="min-h-screen bg-white font-body pb-safe overflow-x-hidden text-left">
      <Navbar />
      
      <Hero />

      <PopularExams />

      <div className="container mx-auto px-4 py-12 md:py-24 max-w-7xl space-y-16 md:space-y-32">
         {/* CONTINUITY HUB (Only visible for logged-in students) */}
         <ContinueLearning />
         
         {/* DISCOVERY HUB (Category Grids) */}
         <FeaturedCategories />
         
         {/* RECENT CONTENT FEED (Latest Practice Mocks) */}
         <LatestMocks />
      </div>

      {/* TRUST & BRAND IDENTITY (App Installation & Founder Bio) */}
      <AppPreview />
      <MeetFounder />
      
      <Footer />
    </main>
  );
}
