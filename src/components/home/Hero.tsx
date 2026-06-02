'use client';

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Star } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import Stats from "./Stats";
import { PlaceHolderImages } from "@/lib/placeholder-images";

export default function Hero() {
  const heroImage = PlaceHolderImages.find(img => img.id === 'hero-punjab')?.imageUrl || "https://picsum.photos/seed/punjab-hero/1200/800";

  return (
    <header className="relative pt-[100px] pb-[160px] text-center text-white overflow-hidden hero-section">
      {/* Background with Gradient Overlay */}
      <div className="absolute inset-0 z-0">
        <Image 
          src={heroImage} 
          alt="Golden Temple at Night" 
          fill 
          className="object-cover"
          priority
          data-ai-hint="golden temple"
        />
        <div className="absolute inset-0 hero-gradient"></div>
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto"
        >
          <span className="inline-block bg-white/10 px-4 py-1.5 rounded-full mb-6 text-sm font-semibold text-[#ff7a00] border border-white/10 backdrop-blur-sm">
            <Star className="inline-block h-4 w-4 fill-current mr-2" />
            #1 Punjab Exam Preparation Platform
          </span>
          
          <h1 className="text-[52px] font-bold leading-[1.2] mt-5">
            Prepare Smarter.<br />
            <span className="text-[#ff7a00]">Score Higher.</span>
          </h1>
          
          <p className="text-[18px] text-[#94a3b8] mt-5 mb-5 max-w-2xl mx-auto">
            Punjab Government Exams di Complete Preparation ik hi Platform te.
          </p>
          
          <div className="flex flex-wrap justify-center gap-[15px] pt-4">
            <Button asChild size="lg" className="h-[48px] px-8 bg-[#ff7a00] hover:bg-[#ff7a00]/90 text-white font-semibold rounded-md gap-2 border-none cursor-pointer">
              <Link href="/mocks">Start Free Mock <ArrowRight className="h-5 w-5" /></Link>
            </Button>
            <Button variant="outline" asChild size="lg" className="h-[48px] px-8 border-white text-white hover:bg-white/10 rounded-md font-semibold bg-transparent transition-all active:scale-95 cursor-pointer">
              <Link href="/exams">Explore Exams</Link>
            </Button>
          </div>
        </motion.div>
      </div>

      {/* Stats Bar Integrated as Floating Child */}
      <Stats />
    </header>
  );
}
