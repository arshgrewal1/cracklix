'use client';

import React from "react"
import { motion } from "framer-motion"
import { 
  ChevronRight, 
  ArrowRight
} from "lucide-react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { AuthorityLogo } from "@/lib/exam-icons";
import { Button } from "@/components/ui/button";

/**
 * @fileOverview High-Density Popular Exams Grid v78.1.
 * ALIGNMENT: Standardized side margins to match Hero section.
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
    <section className="py-6 md:py-24 bg-slate-50/50 border-t border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-left">
         <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-4 md:mb-16 gap-1 px-1">
            <div className="space-y-0.5">
               <h2 className="text-xl md:text-5xl font-black text-[#04102B] tracking-tight leading-none">Popular Exams</h2>
               <p className="text-[#94A3B8] font-bold text-[10px] md:text-sm tracking-tight uppercase">Top Target Hubs</p>
            </div>
            <Link href="/exams" className="text-primary font-black uppercase text-[9px] md:text-xs tracking-widest hover:underline flex items-center gap-2 group">
               View All <ChevronRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
            </Link>
         </div>

         <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-8">
            {POPULAR_LIST.map((p, idx) => (
               <motion.div key={p.id} initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }} viewport={{ once: true }}>
                  <Link href={`/exams/${p.id}`}>
                     <Card className="border border-[#E5E7EB] shadow-sm hover:shadow-xl transition-all duration-500 rounded-xl md:rounded-[2.5rem] bg-white p-3 md:p-10 text-left h-full group flex flex-col">
                        <div className="mb-3 md:mb-8 flex justify-start md:justify-center">
                           <AuthorityLogo boardId={p.boardId} size="sm" className="md:w-16 md:h-16 bg-slate-50 rounded-lg md:rounded-2xl shadow-inner group-hover:scale-105 transition-transform" />
                        </div>
                        
                        <div className="flex-1 space-y-1 md:space-y-5">
                           <h3 className="text-[12px] md:text-2xl font-black text-[#04102B] leading-tight group-hover:text-primary transition-colors">
                              {p.name}
                           </h3>
                           
                           <div className="flex flex-wrap gap-1">
                              <MiniChip emoji="📚" label="Mocks" />
                              <MiniChip emoji="⚡" label="Live" />
                           </div>
                        </div>

                        <div className="mt-4 md:mt-10 pt-3 border-t border-slate-50">
                           <Button variant="ghost" className="w-full h-8 md:h-12 rounded-lg md:rounded-xl bg-[#0F172A] text-white group-hover:bg-primary transition-all font-black text-[8px] md:text-[10px] tracking-widest border-none shadow-sm gap-2">
                              Open <ArrowRight className="h-3 w-3" />
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
      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-slate-50 border border-slate-100 text-[7px] md:text-[9px] font-black uppercase text-slate-400">
         <span>{emoji}</span> {label}
      </span>
   )
}