
import React from "react";
import Navbar from "@/components/layout/Navbar";
import Hero from "@/components/home/Hero";
import ContinueLearning from "@/components/home/ContinueLearning";
import LatestMocks from "@/components/home/LatestMocks";
import AppPreview from "@/components/home/AppPreview";
import MeetFounder from "@/components/home/MeetFounder";
import Footer from "@/components/layout/Footer";

/**
 * @fileOverview Official Home Hub v172.0.
 * UPDATED: Removed FeaturedCategories section and prioritized LatestMocks below student context.
 */

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#0A0E1A] font-body pb-safe overflow-x-hidden text-left selection:bg-orange-500/30">
      <Navbar />
      
      {/* PHASE 1: HERO & PORTALS */}
      <Hero />

      {/* PHASE 2: STUDENT CONTEXT */}
      <ContinueLearning />

      {/* PHASE 3: DISCOVERY LAYERS */}
      <div className="bg-white rounded-t-[3rem] md:rounded-t-[5rem] -mt-10 relative z-20 overflow-hidden">
        <LatestMocks />
        <AppPreview />
        <MeetFounder />
        <Footer />
      </div>
    </main>
  );
}
