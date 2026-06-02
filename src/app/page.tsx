
'use client';

import Navbar from "@/components/layout/Navbar";
import Hero from "@/components/home/Hero";
import PopularExams from "@/components/home/PopularExams";
import LatestMocks from "@/components/home/LatestMocks";
import Features from "@/components/home/Features";
import AppPreview from "@/components/home/AppPreview";
import Footer from "@/components/layout/Footer";

/**
 * @fileOverview The primary entry point for the Cracklix platform.
 * Renders the full homepage with institutional authority styling.
 */
export default function HomePage() {
  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      <Hero />
      <div className="mt-20 lg:mt-32">
        <PopularExams />
      </div>
      <LatestMocks />
      <Features />
      <AppPreview />
      <Footer />
    </main>
  );
}
