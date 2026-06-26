'use client';

import React from "react"
import { motion } from "framer-motion"
import { 
  ChevronRight, 
  ArrowRight,
  Target
} from "lucide-react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { AuthorityLogo } from "@/lib/exam-icons";
import { Button } from "@/components/ui/button";

/**
 * @fileOverview High-Density Popular Exams Grid v81.2.
 * RESPONSIVE: Increased container width and optimized grid for PC.
 */

const POPULAR_LIST = [
  { name: "PCS", id: "pcs", boardId: "ppsc", hasMocks: true },
  { name: "Constable", id: "constable", boardId: "punjab-police", hasMocks: true },
  { name: "Patwari", id: "patwari", boardId: "psssb", hasMocks: true },
  { name: "Clerk", id: "clerk", boardId: "psssb", hasMocks: true },
  { name: "PSTET", id: "pstet-paper-1", boardId: "pstet", hasMocks: true },
  { name: "ALM", id: "alm", boardId: "pspcl", hasMocks: true },
  { name: "Staff Nurse", id: "staff-nurse", boardId: "bfuhs", hasMocks: true },
  { name: "SSC CGL", id: "ssc-cgl", boardId: "ssc", hasMocks: true }
];

export default function PopularExams() {
  return (
    <section className="py-10 md:py-24 bg-slate-50/50 border-t border-slate-100 overflow-x-hidden">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 text-left space-y-8 md:space-y-16">
         <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 px-1">
            <div className="space-y-2">
               <div className="flex items-center gap-3">
                  <div className="h-8 w-8 bg-blue-50 rounded-lg flex items-center justify-center text-primary shadow-inner"><Target className="h-5 w-5" /></div>
                  <h2 className="text-xl md:text-5xl font-black text-[#04102B] tracking-tight leading-none uppercase">Popular Exams</h2>
               </div>
               <p className="text-slate-500 font-medium text-sm md:text-2xl max-w-2xl">Direct links to the most attempted recruitment preparation hubs.</p>
            </div>
            <Link href="/exams" className="text-primary font-black uppercase text-[10px] md:text-[13px] tracking-[0.2em] hover:underline flex items-center gap-3 group shrink-0">
               View Registry <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
         </div>

         <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-10">
            {POPULAR_LIST.map((p, idx) => (
               <motion.div key={p.id} initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} transition={{ delay: idx * 0.05 }} viewport={{ once: true }}>
                  <Link href={`/exams/view?id=${p.id}`}>
                     <Card className="border border-[#E5E7EB] shadow-sm hover:shadow-3xl transition-all duration-700 rounded-[2rem] md:rounded-[3rem] bg-white p-5 md:p-12 text-left h-full group flex flex-col relative overflow-hidden">
                        <div className="mb-6 md:mb-12 flex justify-start">
                           <div className="h-14 w-14 md:h-24 md:w-24 bg-slate-50 rounded-2xl md:rounded-[2.5rem] shadow-inner group-hover:scale-110 transition-transform duration-700 overflow-hidden flex items-center justify-center p-2">
                              <AuthorityLogo boardId={p.boardId} size="lg" className="h-full w-full" />
                           </div>
                        </div>
                        
                        <div className="flex-1 space-y-2 md:space-y-6">
                           <h3 className="text-[15px] md:text-3xl font-black text-[#04102B] leading-tight group-hover:text-primary transition-colors uppercase tracking-tight truncate">
                              {p.name}
                           </h3>
                           
                           <div className="flex flex-wrap gap-2">
                              <MiniChip emoji="📚" label="MOCKS" />
                              <MiniChip emoji="⚡" label="LIVE" />
                           </div>
                        </div>

                        <div className="mt-10 md:mt-16 pt-6 border-t border-slate-50">
                           <Button variant="ghost" className="w-full h-10 md:h-14 rounded-xl md:rounded-2xl bg-[#0F172A] text-white group-hover:bg-primary transition-all font-black text-[9px] md:text-[11px] tracking-[0.2em] border-none shadow-md uppercase">
                              Launch <ChevronRight className="h-4 w-4 ml-1" />
                           </Button>
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

function MiniChip({ emoji, label }: { emoji: string, label: string }) {
   return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-50 border border-slate-100 text-[8px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest">
         <span className="text-xs">{emoji}</span> {label}
      </span>
   )
}
