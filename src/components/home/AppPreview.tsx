
'use client';

import { motion } from "framer-motion";
import { Apple, Play, Smartphone, CheckCircle2 } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { PlaceHolderImages } from "@/lib/placeholder-images";

/**
 * @fileOverview Final App Preview Hub.
 * Updated to use official Army and Police nodes from registry.
 */

export default function AppPreview() {
  const mockPolice = PlaceHolderImages.find(img => img.id === 'mock-police')?.imageUrl;
  const armyHero = PlaceHolderImages.find(img => img.id === 'hero-army')?.imageUrl;
  const armyStrategic = PlaceHolderImages.find(img => img.id === 'army-strategic')?.imageUrl;

  return (
    <section className="py-32 bg-white overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-20 items-center">
          
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center">
               <Smartphone className="h-6 w-6 text-primary" />
            </div>
            <h2 className="text-5xl lg:text-7xl font-headline font-black text-[#0F172A] leading-tight tracking-tight uppercase">
              Cracklix in <br/>
              <span className="text-primary">Your Pocket</span>
            </h2>
            <p className="text-xl text-slate-500 font-medium leading-relaxed max-w-lg">
              Download the official Cracklix app to access daily current affairs, attempt mock tests, and get real-time exam alerts on the go.
            </p>

            <ul className="space-y-4 pt-4">
               <FeatureItem text="Bilingual Test Interface (Punjabi/English)" />
               <FeatureItem text="Offline Mode for Study Materials" />
               <FeatureItem text="Instant Result & All Punjab Rank" />
            </ul>

            <div className="flex flex-wrap gap-4 pt-8">
              <Button className="h-16 px-8 bg-[#0F172A] hover:bg-[#1E3A8A] text-white rounded-2xl flex items-center gap-4 shadow-xl">
                <Apple className="h-8 w-8" />
                <div className="text-left">
                  <p className="text-[10px] uppercase font-bold opacity-70 leading-none">Download on the</p>
                  <p className="text-xl font-bold mt-1">App Store</p>
                </div>
              </Button>
              <Button className="h-16 px-8 bg-[#0F172A] hover:bg-[#1E3A8A] text-white rounded-2xl flex items-center gap-4 shadow-xl">
                <Play className="h-8 w-8" />
                <div className="text-left">
                  <p className="text-[10px] uppercase font-bold opacity-70 leading-none">GET IT ON</p>
                  <p className="text-xl font-bold mt-1">Google Play</p>
                </div>
              </Button>
            </div>
          </motion.div>

          <div className="flex justify-center items-center gap-6 lg:gap-10">
             <div className="relative w-52 h-[450px] bg-slate-900 rounded-[2.5rem] border-[8px] border-slate-900 shadow-2xl overflow-hidden mt-20 group">
                <img src={mockPolice!} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" referrerPolicy="no-referrer" />
                <div className="absolute inset-0 bg-primary/20 mix-blend-overlay" />
             </div>
             <div className="relative w-60 h-[520px] bg-slate-900 rounded-[3rem] border-[10px] border-slate-900 shadow-2xl overflow-hidden z-10 group">
                <img src={armyHero!} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" referrerPolicy="no-referrer" />
                <div className="absolute inset-0 bg-[#0F172A]/40" />
             </div>
             <div className="relative w-52 h-[450px] bg-slate-900 rounded-[2.5rem] border-[8px] border-slate-900 shadow-2xl overflow-hidden mt-20 group">
                <img src={armyStrategic!} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" referrerPolicy="no-referrer" />
                <div className="absolute inset-0 bg-primary/20 mix-blend-overlay" />
             </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function FeatureItem({ text }: { text: string }) {
  return (
    <li className="flex items-center gap-3 text-slate-700 font-bold uppercase text-xs tracking-tight">
       <CheckCircle2 className="h-5 w-5 text-emerald-500" />
       {text}
    </li>
  );
}
