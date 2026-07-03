'use client';

import React from "react";
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
import { motion } from "framer-motion";

/**
 * @fileOverview Study Anywhere v1.1.
 * UPDATED: Replaced "node" with "Hub" and normalized typography.
 */
export default function AppPreview() {
  const features = [
    { icon: Smartphone, label: "Mobile Hub", desc: "Optimized for Android 14", color: "text-blue-500", bgColor: "bg-blue-50" },
    { icon: Zap, label: "Fast Engine", desc: "Instant test Hub", color: "text-orange-500", bgColor: "bg-orange-50" },
    { icon: LayoutGrid, label: "Offline Mode", desc: "Study without data", color: "text-indigo-500", bgColor: "bg-indigo-50" },
    { icon: Activity, label: "Live Ranks", desc: "Real-time state merit list", color: "text-emerald-500", bgColor: "bg-emerald-50" }
  ];

  return (
    <section className="py-10 md:py-24 bg-white overflow-hidden border-t border-slate-100">
      <div className="max-w-[1440px] 2xl:max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 space-y-6 md:space-y-16">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-3 text-left">
           <div className="space-y-2">
              <div className="flex items-center gap-3 md:gap-4">
                 <div className="h-8 w-8 md:h-12 md:w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-inner shrink-0">
                    <Smartphone className="h-4 w-4 md:h-6 md:w-6" />
                 </div>
                 <h2 className="text-[22px] md:text-[clamp(24px,4vw,36px)] font-bold tracking-tight text-[#0F172A]">Study Anywhere</h2>
              </div>
              <p className="max-w-2xl text-[14px] md:text-[clamp(13px,1.5vw,18px)] font-medium text-slate-500">Experience Punjab&apos;s smartest platform on all mobile devices.</p>
           </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8 lg:gap-10">
           {features.map((f, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              className="flex flex-col h-full"
            >
              <Card className="border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-500 rounded-2xl md:rounded-[3rem] bg-white p-4 md:p-10 lg:p-12 flex flex-col h-full min-h-[220px] md:min-h-[400px] relative overflow-hidden group">
                 
                 <div className="flex justify-center mb-4 md:mb-12 shrink-0">
                    <div className={cn("h-11 w-11 md:h-24 md:w-24 rounded-xl md:rounded-3xl flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform", f.bgColor, f.color)}>
                       <f.icon className="h-5 w-5 md:h-10 md:w-10" />
                    </div>
                 </div>

                 <div className="flex-1 flex flex-col justify-start text-center space-y-2 md:space-y-6">
                    <h3 className="text-[15px] md:text-[clamp(14px,1.8vw,26px)] font-bold tracking-tight text-[#0F172A]">
                       {f.label}
                    </h3>
                    <p className="text-[12px] md:text-[clamp(11px,1.2vw,16px)] font-medium text-slate-400 leading-snug line-clamp-3 tracking-tight">
                       {f.desc}
                    </p>
                 </div>

                 <div className="mt-auto shrink-0 pt-6 md:pt-10">
                    <Button asChild variant="ghost" className="w-full h-11 md:h-14 lg:h-16 rounded-full bg-slate-50 text-[#0F172A] hover:bg-primary hover:text-white transition-all font-bold text-[14px] md:text-[15px] tracking-tight border-none shadow-sm active:scale-95">
                       <Link href="/install">Get App</Link>
                    </Button>
                 </div>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="w-full pt-6 md:pt-12">
           <motion.div
             initial={{ opacity: 0, scale: 0.98 }}
             whileInView={{ opacity: 1, scale: 1 }}
             viewport={{ once: true }}
             transition={{ duration: 0.6 }}
           >
              <Card className="bg-[#0B1528] rounded-[2rem] md:rounded-[4rem] p-8 md:p-24 text-white relative overflow-hidden shadow-5xl group border border-white/5 mx-1">
                 <div className="absolute top-0 right-0 p-16 opacity-10 rotate-12 group-hover:scale-125 transition-transform duration-1000">
                   <Gem className="h-64 w-64 md:h-[500px] md:w-[500px] text-primary" />
                 </div>
                 <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-10 md:gap-16">
                    <div className="text-center lg:text-left space-y-6 md:space-y-12 flex-1">
                       <h3 className="text-[clamp(28px,6vw,72px)] font-black tracking-tighter leading-[0.9] text-white">Elite Hub</h3>
                       <div className="flex flex-wrap justify-center lg:justify-start gap-x-6 gap-y-4 text-[clamp(10px,1.5vw,20px)] font-bold text-slate-400 tracking-tight">
                          <span className="flex items-center gap-2 md:gap-4"><CheckCircle2 className="h-4 w-4 md:h-7 md:w-7 text-primary" /> Full Series</span>
                          <span className="flex items-center gap-2 md:gap-4"><CheckCircle2 className="h-4 w-4 md:h-7 md:w-7 text-primary" /> Premium Hub</span>
                          <span className="flex items-center gap-2 md:gap-4"><CheckCircle2 className="h-4 w-4 md:h-7 md:w-7 text-primary" /> State Ranks</span>
                       </div>
                    </div>
                    <Button asChild className="w-full lg:w-auto h-16 md:h-24 px-12 md:px-24 bg-primary hover:bg-blue-700 text-white font-bold text-[14px] md:text-[15px] shadow-4xl transition-all border-none active:scale-95 shrink-0 rounded-full">
                       <Link href="/pass" className="flex items-center justify-center gap-3">
                         Join Elite Now <ChevronRight className="h-4 w-4 md:h-8 md:w-8" />
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
