'use client';

import React from "react"
import { motion } from "framer-motion"
import { 
  ChevronRight, 
  Target,
  Zap
} from "lucide-react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { AuthorityLogo } from "@/lib/exam-icons";
import { Button } from "@/components/ui/button";

/**
 * @fileOverview Popular Exam Verticals v11.0 - Alignment Hardened.
 * FIXED: Used mt-auto to ensure all action buttons sit on the same horizontal line.
 */

const POPULAR_LIST = [
  { name: "PCS Hub", id: "pcs", boardId: "PPSC", hasMocks: true },
  { name: "Constable", id: "constable", boardId: "Punjab Police", hasMocks: true },
  { name: "Patwari Hub", id: "patwari", boardId: "PSSSB", hasMocks: true },
  { name: "Clerk Hub", id: "clerk", boardId: "PSSSB", hasMocks: true },
  { name: "PSTET Paper 1", id: "pstet-paper-1", boardId: "PSTET", hasMocks: true },
  { name: "ALM Tech", id: "alm", boardId: "PSPCL", hasMocks: true },
  { name: "Staff Nurse", id: "staff-nurse", boardId: "BFUHS", hasMocks: true },
  { name: "SSC CGL", id: "ssc-cgl", boardId: "SSC", hasMocks: true }
];

export default function PopularExams() {
  return (
    <section className="section-py bg-slate-50/50 border-t border-slate-100">
      <div className="max-w-[1440px] mx-auto container-px space-y-6 md:space-y-16">
         <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-2 text-left px-1">
            <div className="space-y-1">
               <div className="flex items-center gap-2">
                  <div className="h-6 w-6 md:h-12 md:w-12 rounded-lg bg-blue-50 flex items-center justify-center text-primary shadow-inner shrink-0">
                    <Target className="h-3.5 w-3.5 md:h-7 md:w-7" />
                  </div>
                  <h2 className="text-[24px] md:text-5xl font-black tracking-tight text-[#0F172A]">Popular Exams</h2>
               </div>
               <p className="max-w-2xl text-[13px] md:text-xl font-medium text-slate-500">Instant access to the most attempted preparation hubs.</p>
            </div>
            <Link href="/exams" className="text-primary font-bold text-[12px] md:text-base tracking-tight hover:underline flex items-center gap-2 group shrink-0">
               View All <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
            </Link>
         </div>

         <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 md:gap-8 lg:gap-10">
            {POPULAR_LIST.map((p, idx) => (
               <motion.div 
                 key={p.id} 
                 initial={{ opacity: 0, scale: 0.98 }} 
                 whileInView={{ opacity: 1, scale: 1 }} 
                 viewport={{ once: true }} 
                 transition={{ duration: 0.4, delay: idx * 0.05 }} 
                 className="flex flex-col"
               >
                  <Link href={`/exams/view?id=${p.id}`} className="h-full block">
                     <Card className="border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-500 rounded-2xl md:rounded-[3rem] bg-white p-4 md:p-10 flex flex-col h-[200px] md:h-[340px] relative overflow-hidden group">
                        <div className="flex-1 flex flex-col justify-start">
                           <div className="space-y-2 md:space-y-4">
                              <div className="h-9 w-9 md:h-20 md:w-20 bg-slate-50 rounded-lg md:rounded-[2rem] shadow-inner flex items-center justify-center overflow-hidden p-1.5 group-hover:scale-110 transition-transform">
                                 <AuthorityLogo boardId={p.boardId} size="sm" className="h-full w-full" />
                              </div>
                              <div className="space-y-1">
                                <h3 className="text-[14px] md:text-2xl font-black tracking-tight text-[#0F172A] group-hover:text-primary transition-colors uppercase leading-tight">{p.name}</h3>
                                <div className="flex flex-wrap gap-1.5 md:gap-2">
                                   <MiniChip emoji="📚" label="Mocks" />
                                </div>
                              </div>
                           </div>
                        </div>

                        <div className="mt-auto shrink-0 pt-2">
                           <Button variant="ghost" className="w-full h-10 md:h-14 rounded-full bg-[#0F172A] text-white group-hover:bg-primary transition-all font-black text-[11px] md:text-xs tracking-widest uppercase border-none shadow-md active:scale-95 gap-2">
                              Open <ChevronRight className="h-3 w-3" />
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
      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-slate-50 border border-slate-100 text-[8px] font-black text-slate-400 uppercase tracking-tight">
         <span>{emoji}</span> {label}
      </span>
   )
}
