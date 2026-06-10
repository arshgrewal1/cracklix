
'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Landmark, 
  GraduationCap, 
  Zap, 
  Wallet, 
  Globe, 
  ArrowRight,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { cn } from '@/lib/utils';

/**
 * @fileOverview Institutional Category Entry Nodes v2.0.
 * UPDATED: Strictly matched counts to user screenshot (250+, 120+, 80+, 150+, 300+).
 */

const CATEGORIES = [
  {
    id: "punjab-govt",
    title: "Punjab Government",
    desc: "Police, PSSSB, PPSC & state board recruitments.",
    icon: <img src="https://static.pseb.ac.in/psebwebsite/front_assets/sites/default/files/inline-images/emblem.png" className="h-full w-full object-contain" />,
    color: "text-primary",
    bgColor: "bg-orange-50",
    exams: "250+ EXAMS"
  },
  {
    id: "punjab-teaching",
    title: "Punjab Teaching",
    desc: "PSTET, CTET, Master Cadre & ETT verticals.",
    icon: <GraduationCap className="h-8 w-8" />,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    exams: "120+ EXAMS"
  },
  {
    id: "punjab-technical",
    title: "Punjab Technical",
    desc: "PSPCL, PSTCL, ALM & Technical Assistant posts.",
    icon: <Zap className="h-8 w-8" />,
    color: "text-amber-500",
    bgColor: "bg-amber-50",
    exams: "80+ EXAMS"
  },
  {
    id: "banking",
    title: "Banking Exams",
    desc: "IBPS, PO, SO, SBI & RBI specialized mocks.",
    icon: <Wallet className="h-8 w-8" />,
    color: "text-emerald-600",
    bgColor: "bg-emerald-50",
    exams: "150+ EXAMS"
  },
  {
    id: "central-govt",
    title: "Central Govt",
    desc: "SSC, Railways, Army & National registries.",
    icon: <Globe className="h-8 w-8" />,
    color: "text-indigo-600",
    bgColor: "bg-indigo-50",
    exams: "300+ EXAMS"
  }
];

export default function FeaturedCategories() {
  return (
    <section className="space-y-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 text-left">
        <div className="space-y-2">
           <div className="flex items-center gap-2">
              <Landmark className="h-4 w-4 text-primary" />
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">Registry Categories</span>
           </div>
           <h2 className="text-3xl md:text-5xl font-headline font-black text-[#0F172A] uppercase tracking-tight leading-none">
              STUDY BY <span className="text-primary">CATEGORY</span>
           </h2>
           <p className="text-slate-500 text-sm md:text-lg font-medium">Reorganized for scalable preparation discovery.</p>
        </div>
        <Button asChild variant="ghost" className="text-primary font-black uppercase text-[10px] tracking-widest gap-2">
           <Link href="/exams">View All Categories <ArrowRight className="h-4 w-4" /></Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        {CATEGORIES.map((cat, idx) => (
          <motion.div
            key={cat.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.1 }}
          >
             <Link href={`/exams/category/${cat.id}`}>
                <Card className="border-none shadow-xl hover:shadow-4xl transition-all duration-500 rounded-[2.5rem] bg-white group overflow-hidden h-full flex flex-col border border-slate-100 p-8 text-left relative">
                   <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">{cat.id !== 'punjab-govt' && cat.icon}</div>
                   
                   <div className={cn("h-16 w-16 rounded-2xl flex items-center justify-center mb-8 shadow-inner transition-transform group-hover:scale-110", cat.bgColor, cat.color)}>
                      {cat.icon}
                   </div>
                   
                   <div className="space-y-3 flex-1">
                      <h3 className="text-xl font-black text-[#0F172A] uppercase leading-tight group-hover:text-primary transition-colors">{cat.title}</h3>
                      <p className="text-xs font-medium text-slate-400 leading-relaxed line-clamp-2">{cat.desc}</p>
                   </div>

                   <div className="mt-8 pt-6 border-t border-slate-50 flex items-center justify-between">
                      <span className="text-[10px] font-black text-[#0F172A] uppercase tracking-widest">{cat.exams}</span>
                      <div className="h-8 w-8 rounded-lg bg-slate-50 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all">
                         <ChevronRight className="h-4 w-4" />
                      </div>
                   </div>
                </Card>
             </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
