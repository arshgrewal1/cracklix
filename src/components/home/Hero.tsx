
'use client';

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Star } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function Hero() {
  return (
    <header className="relative pt-20 pb-40 lg:pt-32 lg:pb-56 overflow-hidden bg-gradient-to-br from-[#08152D] via-[#0F172A] to-[#08152D] text-white">
      {/* Punjab Map Watermark */}
      <div className="absolute inset-0 opacity-5 pointer-events-none flex items-center justify-center">
        <svg viewBox="0 0 100 100" className="w-[1000px] h-[1000px] text-white fill-current">
          <path d="M40 35 L55 40 L60 60 L45 70 L35 55 Z" />
        </svg>
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-4xl mx-auto text-center lg:text-left">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            <div className="inline-flex items-center gap-2 bg-[#F97316]/20 text-[#F97316] px-4 py-1.5 rounded-full text-[11px] font-black uppercase tracking-widest border border-[#F97316]/30">
              <Star className="h-4 w-4 fill-current" />
              #1 Punjab Exam Preparation Platform
            </div>
            
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-headline font-bold leading-[1.1]">
              Prepare Smarter.<br />
              <span className="text-[#F97316]">Score Higher.</span>
            </h1>
            
            <p className="text-xl text-white/70 max-w-xl mx-auto lg:mx-0 leading-relaxed font-medium">
              Punjab Government Exams di Complete Preparation ik hi Platform te.
            </p>
            
            <div className="flex flex-wrap justify-center lg:justify-start gap-4 pt-4">
              <Button asChild size="lg" className="h-14 px-10 bg-[#F97316] hover:bg-[#EA580C] text-white font-bold rounded-xl gap-2 shadow-2xl shadow-[#F97316]/20 transition-all hover:scale-105 active:scale-95">
                <Link href="/mocks">Start Free Mock <ArrowRight className="h-5 w-5" /></Link>
              </Button>
              <Button variant="outline" asChild size="lg" className="h-14 px-10 border-white/20 text-white hover:bg-white/10 rounded-xl font-bold bg-white/5 backdrop-blur-sm transition-all active:scale-95">
                <Link href="/exams">Explore Exams</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </header>
  );
}
