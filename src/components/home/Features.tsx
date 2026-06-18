'use client';

import React from "react";
import { motion } from "framer-motion";
import { Zap, BookOpen, FileStack, Activity, Sparkles, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * @fileOverview Institutional Core Features Hub v2.0.
 * Restored: Mock Tests, Study Material, Previous Papers, and Performance Analytics.
 */

const features = [
  { 
    icon: <Zap className="h-6 w-6" />, 
    title: "Mock Tests", 
    desc: "Complete patterns for major Punjab recruitments.",
    href: "/mocks",
    color: "text-blue-600",
    bgColor: "bg-blue-50"
  },
  { 
    icon: <BookOpen className="h-6 w-6" />, 
    title: "Study Material", 
    desc: "Targeted notes, PDFs, and official preparation guides.",
    href: "/study-material",
    color: "text-emerald-600",
    bgColor: "bg-emerald-50"
  },
  { 
    icon: <FileStack className="h-6 w-6" />, 
    title: "Previous Papers", 
    desc: "Verified archives of official government exams.",
    href: "/previous-papers",
    color: "text-amber-500",
    bgColor: "bg-amber-50"
  },
  { 
    icon: <Activity className="h-6 w-6" />, 
    title: "Performance Analytics", 
    desc: "Detailed scoring and state merit index analysis.",
    href: "/analytics",
    color: "text-indigo-500",
    bgColor: "bg-indigo-50"
  },
];

export default function Features() {
  return (
    <section className="bg-white py-12 md:py-24 border-t border-slate-50">
      <div className="container mx-auto px-4 max-w-7xl text-left">
        <div className="flex items-center justify-between mb-12 md:mb-16 px-1">
           <div className="flex items-center gap-4">
              <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary shadow-inner">
                 <Sparkles className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                 <h2 className="text-xl md:text-3xl font-headline font-black text-[#0F172A] uppercase tracking-tight">Core Features</h2>
                 <p className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest">Institutional Preparation Nodes</p>
              </div>
           </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {features.map((feature, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.05 }}
            >
               <Link href={feature.href} className="block group h-full">
                  <Card className="border-none shadow-xl rounded-[2.5rem] p-8 md:p-10 group hover:translate-y-[-6px] transition-all duration-500 bg-white border border-slate-100 h-full flex flex-col">
                     <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center mb-8 shadow-inner group-hover:scale-110 transition-transform", feature.bgColor, feature.color)}>
                       {feature.icon}
                     </div>
                     <div className="space-y-3 flex-1">
                        <h3 className="text-xl font-black uppercase text-[#0F172A] group-hover:text-primary transition-colors">
                          {feature.title}
                        </h3>
                        <p className="text-slate-500 text-sm font-medium leading-relaxed">
                          {feature.desc}
                        </p>
                     </div>
                     <div className="mt-8 pt-6 border-t border-slate-50 flex items-center justify-between text-primary font-black text-[10px] uppercase tracking-widest">
                        <span>Open Hub</span>
                        <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                     </div>
                  </Card>
               </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
