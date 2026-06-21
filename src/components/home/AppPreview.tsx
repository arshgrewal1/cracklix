'use client';

import React from "react";
import { motion } from "framer-motion";
import { 
  Smartphone, 
  CheckCircle2, 
  Zap, 
  LayoutGrid, 
  Activity, 
  Gem, 
  ChevronRight 
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * @fileOverview High-Density Study Anywhere Hub v28.2.
 * ALIGNMENT: Standardized side margins to match Hero section.
 */

export default function AppPreview() {
  return (
    <section className="py-8 md:py-24 bg-white overflow-hidden border-t border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-left">
        <div className="space-y-6 md:space-y-12">
           <div className="space-y-1 px-1">
              <div className="flex items-center gap-3">
                 <Smartphone className="h-5 w-5 text-primary" />
                 <h2 className="text-xl md:text-4xl font-black text-[#0F172A] tracking-tight">Study Anywhere</h2>
              </div>
              <p className="text-slate-500 font-medium text-[11px] md:text-lg">Experience Punjab's smartest app on your mobile</p>
           </div>

           <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
              <FeatureCard icon={Smartphone} label="Mobile Friendly" desc="Optimized for PWA" color="text-blue-500" />
              <FeatureCard icon={Zap} label="PWA Support" desc="Rapid Node Loading" color="text-orange-500" />
              <FeatureCard icon={LayoutGrid} label="Offline Access" desc="Sync Data Online" color="text-indigo-500" />
              <FeatureCard icon={Activity} label="Tracking" desc="Analytics Insight" color="text-emerald-500" />
           </div>

           <div className="bg-[#0B1528] rounded-[2.5rem] p-6 md:p-12 text-white relative overflow-hidden shadow-4xl group border border-white/5">
              <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12 group-hover:scale-110 transition-transform">
                <Gem className="h-32 w-32" />
              </div>
              <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                 <div className="text-center md:text-left space-y-2">
                    <h3 className="text-xl md:text-3xl font-black uppercase">Elite Membership</h3>
                    <div className="flex flex-wrap justify-center md:justify-start gap-x-4 gap-y-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                       <span className="flex items-center gap-1.5"><CheckCircle2 className="h-3 w-3 text-primary" /> All Mock Tests</span>
                       <span className="flex items-center gap-1.5"><CheckCircle2 className="h-3 w-3 text-primary" /> Premium Notes</span>
                       <span className="flex items-center gap-1.5"><CheckCircle2 className="h-3 w-3 text-primary" /> Rank Prediction</span>
                    </div>
                 </div>
                 <Button asChild className="w-full md:w-auto h-12 px-10 bg-primary hover:bg-blue-700 text-white font-black uppercase tracking-widest text-[10px] shadow-2xl transition-all border-none active:scale-95">
                    <Link href="/pass" className="flex items-center gap-2">
                      Get Pass <ChevronRight className="h-4 w-4" />
                    </Link>
                 </Button>
              </div>
           </div>
        </div>
      </div>
    </section>
  );
}

function FeatureCard({ icon: Icon, label, desc, color }: any) {
   return (
      <Card className="border border-slate-100 shadow-xl rounded-[1.5rem] p-4 text-center space-y-2 hover:translate-y-[-4px] transition-all group cursor-default">
         <div className={cn("h-10 w-10 md:h-12 md:w-12 rounded-xl bg-slate-50 flex items-center justify-center mx-auto shadow-inner group-hover:scale-110 transition-transform", color)}>
            <Icon className="h-5 w-5 md:h-6 md:w-6" />
         </div>
         <h4 className="text-[11px] md:text-sm font-black text-[#0F172A] uppercase leading-none">{label}</h4>
         <p className="text-[8px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest">{desc}</p>
      </Card>
   )
}