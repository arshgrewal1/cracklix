'use client';

import React from "react";
import { 
  Smartphone, 
  CheckCircle2, 
  Zap, 
  LayoutGrid, 
  Activity, 
  Gem, 
  ChevronRight,
  Download
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

/**
 * @fileOverview Study Anywhere Hub v31.0 - Alignment Hardened.
 * FIXED: Standardized mt-auto on action buttons to sit on the same horizontal line as Mock Hub.
 */

export default function AppPreview() {
  const features = [
    { icon: Smartphone, label: "Mobile Hub", desc: "Optimized for Android 14", color: "text-blue-500", bgColor: "bg-blue-50" },
    { icon: Zap, label: "Fast Engine", desc: "Instant test rendering node", color: "text-orange-500", bgColor: "bg-orange-50" },
    { icon: LayoutGrid, label: "Offline First", desc: "Study without data nodes", color: "text-indigo-500", bgColor: "bg-indigo-50" },
    { icon: Activity, label: "Live Ranks", desc: "Real-time state merit index", color: "text-emerald-500", bgColor: "bg-emerald-50" }
  ];

  return (
    <section className="section-py bg-white overflow-hidden border-t border-slate-100">
      <div className="max-w-[1440px] mx-auto container-px space-y-6 md:space-y-16">
        
        {/* SECTION HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-3 text-left">
           <div className="space-y-1">
              <div className="flex items-center gap-3">
                 <Smartphone className="h-5 w-5 md:h-8 md:w-8 text-primary shrink-0" />
                 <h2 className="text-[24px] md:text-5xl font-black tracking-tight leading-none text-[#0F172A]">Study Anywhere</h2>
              </div>
              <p className="max-w-2xl text-[13px] md:text-xl font-medium text-slate-500">Experience Punjab's smartest preparation app directly on your mobile device.</p>
           </div>
        </div>

        {/* FEATURE GRID */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-8 lg:gap-10">
           {features.map((f, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              className="flex flex-col"
            >
              <Card className="border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-500 rounded-2xl md:rounded-[3rem] bg-white p-4 md:p-10 flex flex-col h-[230px] md:h-[380px] relative overflow-hidden group">
                 
                 <div className="flex justify-center mb-3 md:mb-8 shrink-0">
                    <div className={cn("h-10 w-10 md:h-20 md:w-20 rounded-xl md:rounded-3xl flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform", f.bgColor, f.color)}>
                       <f.icon className="h-5 w-5 md:h-10 md:w-10" />
                    </div>
                 </div>

                 <div className="flex-1 flex flex-col justify-start text-center space-y-2 md:space-y-4">
                    <h3 className="text-[14px] md:text-2xl font-black tracking-tight leading-tight text-[#0F172A]">
                       {f.label}
                    </h3>
                    <p className="text-[11px] md:text-base font-medium text-slate-400 leading-snug line-clamp-2">
                       {f.desc}
                    </p>
                 </div>

                 <div className="mt-auto shrink-0 pt-2">
                    <Button asChild variant="ghost" className="w-full h-10 md:h-14 rounded-full bg-slate-50 text-[#0F172A] hover:bg-primary hover:text-white transition-all font-bold text-[11px] md:text-sm tracking-tight border-none shadow-sm active:scale-95">
                       <Link href="/install">Learn More</Link>
                    </Button>
                 </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* ELITE MEMBERSHIP HUB */}
        <div className="w-full pt-4 md:pt-10">
           <motion.div
             initial={{ opacity: 0, scale: 0.98 }}
             whileInView={{ opacity: 1, scale: 1 }}
             viewport={{ once: true }}
             transition={{ duration: 0.6 }}
           >
              <Card className="bg-[#0B1528] rounded-[2rem] md:rounded-[4rem] p-6 md:p-20 text-white relative overflow-hidden shadow-5xl group border border-white/5">
                 <div className="absolute top-0 right-0 p-12 opacity-10 rotate-12 group-hover:scale-110 transition-transform duration-1000">
                   <Gem className="h-40 w-40 md:h-80 md:w-80 text-primary" />
                 </div>
                 <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8 md:gap-12">
                    <div className="text-center lg:text-left space-y-4 md:space-y-10 flex-1">
                       <h3 className="text-[26px] md:text-6xl font-black tracking-tighter leading-[1] text-white">Elite Membership</h3>
                       <div className="flex flex-wrap justify-center lg:justify-start gap-x-6 gap-y-3 text-[11px] md:text-xl font-medium text-slate-400">
                          <span className="flex items-center gap-2 md:gap-3"><CheckCircle2 className="h-3.5 w-3.5 md:h-6 md:w-6 text-primary" /> Full Mock Series</span>
                          <span className="flex items-center gap-2 md:gap-3"><CheckCircle2 className="h-3.5 w-3.5 md:h-6 md:w-6 text-primary" /> Premium Hub</span>
                          <span className="flex items-center gap-2 md:gap-3"><CheckCircle2 className="h-3.5 w-3.5 md:h-6 md:w-6 text-primary" /> State Rankings</span>
                       </div>
                    </div>
                    <Button asChild className="w-full lg:w-auto h-12 md:h-20 px-10 md:px-20 bg-primary hover:bg-blue-700 text-white font-black text-sm md:text-lg shadow-4xl transition-all border-none active:scale-95 shrink-0 rounded-full">
                       <Link href="/pass" className="flex items-center justify-center gap-2 md:gap-3">
                         Join Elite Now <ChevronRight className="h-4 w-4 md:h-6 md:w-6" />
                       </Link>
                    </Button>
                 </div>
              </Card>
           </motion.div>
        </div>

      </div>
    </section>
  );
}
