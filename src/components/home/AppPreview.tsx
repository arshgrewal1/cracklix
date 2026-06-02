
'use client';

import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Apple, Play } from "lucide-react";
import Image from "next/image";

export default function AppPreview() {
  return (
    <section className="py-32 bg-white overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <Badge className="bg-[#1E3A8A]/10 text-[#1E3A8A] border-none px-4 py-1.5 rounded-lg font-bold">
              Learn. Practice. Succeed.
            </Badge>
            <h2 className="text-5xl md:text-7xl font-headline font-bold text-[#0F172A] leading-tight">
              Cracklix in Your <br />
              <span className="text-[#F97316]">Pocket</span>
            </h2>
            <p className="text-xl text-muted-foreground leading-relaxed max-w-lg">
              Punjab's most trusted exam preparation app. Download now and carry your complete study material and mock tests wherever you go.
            </p>
            
            <div className="flex flex-wrap gap-4 pt-4">
              <Button className="h-16 px-8 bg-[#0F172A] hover:bg-[#1E3A8A] text-white rounded-2xl flex items-center gap-4 transition-all hover:scale-105 shadow-xl">
                <Apple className="h-8 w-8" />
                <div className="text-left">
                  <p className="text-[10px] uppercase font-bold leading-none opacity-70">Download on the</p>
                  <p className="text-xl font-bold leading-none mt-1">App Store</p>
                </div>
              </Button>
              <Button className="h-16 px-8 bg-[#0F172A] hover:bg-[#1E3A8A] text-white rounded-2xl flex items-center gap-4 transition-all hover:scale-105 shadow-xl">
                <Play className="h-8 w-8" />
                <div className="text-left">
                  <p className="text-[10px] uppercase font-bold leading-none opacity-70">GET IT ON</p>
                  <p className="text-xl font-bold leading-none mt-1">Google Play</p>
                </div>
              </Button>
            </div>
          </motion.div>

          <div className="relative flex justify-center items-center gap-6 lg:gap-10">
             <PhoneMockup delay={0.1} imageUrl="https://picsum.photos/seed/mobile1/400/800" />
             <PhoneMockup delay={0.2} isCenter imageUrl="https://picsum.photos/seed/mobile2/400/800" />
             <PhoneMockup delay={0.3} imageUrl="https://picsum.photos/seed/mobile3/400/800" />
          </div>
        </div>
      </div>
    </section>
  );
}

function PhoneMockup({ delay, isCenter = false, imageUrl }: { delay: number, isCenter?: boolean, imageUrl: string }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: isCenter ? -50 : 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      viewport={{ once: true }}
      className={`relative ${isCenter ? 'h-[500px] w-[240px] rounded-[3.5rem] border-[8px]' : 'h-[450px] w-[220px] rounded-[3rem] border-[10px]'} border-black bg-white shadow-2xl overflow-hidden`}
    >
      {/* Notch / Dynamic Island */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 h-8 bg-black rounded-b-3xl w-32 z-20 flex items-center justify-center">
        <div className="h-1.5 w-1.5 rounded-full bg-white/10" />
      </div>

      <div className="relative h-full w-full bg-slate-50">
        <Image src={imageUrl} alt="App screen" fill className="object-cover" data-ai-hint="smartphone app" />
      </div>
    </motion.div>
  );
}
