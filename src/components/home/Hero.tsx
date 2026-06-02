
'use client';

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, BookOpen, ClipboardList, Shield, BarChart3 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";

const stats = [
  { icon: <BookOpen className="h-6 w-6 text-blue-400" />, value: "10,000+", label: "Practice Questions" },
  { icon: <ClipboardList className="h-6 w-6 text-orange-400" />, value: "500+", label: "Mock Tests" },
  { icon: <Shield className="h-6 w-6 text-blue-500" />, value: "50+", label: "Exams Covered" },
  { icon: <BarChart3 className="h-6 w-6 text-blue-400" />, value: "Detailed", label: "Analytics" },
];

export default function Hero() {
  const heroImage = PlaceHolderImages.find(img => img.id === 'hero-punjab')?.imageUrl || "https://picsum.photos/seed/punjab-hero/1200/800";

  return (
    <header className="relative min-h-[700px] flex items-center pt-20 pb-32 lg:pb-40 bg-[#0c1527] overflow-visible">
      {/* Background Image (Right Aligned) */}
      <div className="absolute right-0 top-0 w-full lg:w-[60%] h-full z-0 overflow-hidden">
        <Image 
          src={heroImage} 
          alt="Golden Temple at Night" 
          fill 
          className="object-cover"
          priority
          data-ai-hint="golden temple amritsar"
        />
        {/* Gradients to blend image with navy background */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#0c1527] via-[#0c1527]/40 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#0c1527] via-transparent to-transparent"></div>
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center">
          
          {/* Hero Content Area */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="w-full lg:w-[55%] text-left"
          >
            {/* Tagline */}
            <div className="inline-flex items-center gap-2 bg-white/10 px-4 py-1.5 rounded-full mb-8 text-sm font-medium border border-white/10 backdrop-blur-md">
              <span className="text-white/90">#1 Punjab Exam Preparation Platform</span>
            </div>
            
            <h1 className="text-[56px] lg:text-[72px] font-bold leading-[1.1] text-white tracking-tight">
              Prepare Smarter.<br />
              <span className="text-[#ff7a00]">Score Higher.</span>
            </h1>
            
            <p className="text-[20px] text-gray-300 mt-6 mb-12 max-w-lg font-medium leading-relaxed">
              Complete your Punjab Government Exam preparation on a single platform. Trust Cracklix for your professional success.
            </p>
            
            <div className="flex flex-wrap gap-4 relative z-20">
              <Button asChild size="lg" className="h-[56px] px-10 bg-[#ff7a00] hover:bg-[#ff7a00]/90 text-white font-bold rounded-xl gap-2 shadow-lg shadow-orange-500/30">
                <Link href="/mocks">Start Free Mock <ArrowRight className="h-5 w-5" /></Link>
              </Button>
              <Button variant="outline" asChild size="lg" className="h-[56px] px-10 border-white/30 text-white hover:bg-white/10 rounded-xl font-bold bg-white/5 backdrop-blur-sm">
                <Link href="/exams">Explore Exams</Link>
              </Button>
            </div>
          </motion.div>
        </div>

        {/* Floating Stats Bar - Positioned to bridge the hero and next section */}
        <div className="absolute bottom-[-60px] lg:bottom-[-80px] left-0 w-full hidden md:block">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto px-6">
            {stats.map((stat, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + idx * 0.1 }}
                className="bg-[#111e38]/95 backdrop-blur-xl border border-white/10 p-6 rounded-[24px] flex items-center gap-4 shadow-2xl overflow-hidden"
              >
                <div className="shrink-0 p-4 rounded-2xl bg-white/5 border border-white/5">
                  {stat.icon}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-white text-xl lg:text-2xl font-black leading-none mb-1 truncate">{stat.value}</h3>
                  <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest leading-tight truncate">
                    {stat.label}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}
