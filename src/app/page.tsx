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

/**
 * @fileOverview Official Home Hub v106.0 (Streamlined Restoration).
 * RESTORED: Direct sequential flow perfectly matched to the provided UI reference.
 */

export default function HomePage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <main className="min-h-screen bg-white font-body pb-safe overflow-x-hidden text-left">
      <Navbar />
      
      {/* 1. SCREENSHOT MATCHED HERO HUB */}
      <Hero />

      <div className="container mx-auto px-4 py-12 md:py-24 max-w-7xl space-y-16 md:space-y-32">
         {/* 2. USER ANCHORS */}
         <ContinueLearning />
         <FeaturedCategories />
         
         {/* 3. RECENT CONTENT */}
         <LatestMocks />
      </div>

      {/* 4. TRUST & IDENTITY NODES */}
      <AppPreview />
      <MeetFounder />
      
      <Footer />
    </main>
  );
}
