
'use client';

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import Stats from "./Stats";
import { PlaceHolderImages } from "@/lib/placeholder-images";

export default function Hero() {
  const heroImage = PlaceHolderImages.find(img => img.id === 'hero-punjab')?.imageUrl || "https://picsum.photos/seed/punjab-hero/1200/800";

  return (
    <header className="relative pt-[100px] pb-[160px] text-white overflow-hidden bg-[#0c1527]">
      {/* Punjab Map Watermark - Restored */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <svg viewBox="0 0 100 100" className="w-full h-full object-contain text-white/20 fill-current p-20">
          <path d="M40 35 L55 40 L60 60 L45 70 L35 55 Z" />
        </svg>
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-16">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="flex-1 text-left"
          >
            {/* Star Tagline removed as requested */}
            
            <h1 className="text-[52px] font-bold leading-[1.2] mt-5">
              Prepare Smarter.<br />
              <span className="text-[#ff7a00]">Score Higher.</span>
            </h1>
            
            <p className="text-[18px] text-[#94a3b8] mt-5 mb-10 max-w-xl font-body">
              Punjab Government Exams di Complete Preparation ik hi Platform te.
            </p>
            
            <div className="flex flex-wrap gap-[15px]">
              <Button asChild size="lg" className="h-[52px] px-8 bg-[#ff7a00] hover:bg-[#ff7a00]/90 text-white font-bold rounded-xl gap-2 shadow-lg shadow-orange-500/20">
                <Link href="/mocks">Start Free Mock <ArrowRight className="h-5 w-5" /></Link>
              </Button>
              <Button variant="outline" asChild size="lg" className="h-[52px] px-8 border-white text-white hover:bg-white/10 rounded-xl font-bold bg-transparent">
                <Link href="/exams">Explore Exams</Link>
              </Button>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="flex-1 w-full max-w-[600px]"
          >
            <div className="relative aspect-[4/3] rounded-[32px] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.35)] border border-white/10">
              <Image 
                src={heroImage} 
                alt="Golden Temple at Night" 
                fill 
                className="object-cover"
                priority
                data-ai-hint="golden temple"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0c1527]/60 to-transparent"></div>
            </div>
          </motion.div>
        </div>
      </div>

      <Stats />
    </header>
  );
}
