'use client';

import React from "react"
import { motion } from "framer-motion"
import { 
  ChevronRight, 
  Target
} from "lucide-react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { AuthorityLogo } from "@/lib/exam-icons";
import { Button } from "@/components/ui/button";

/**
 * @fileOverview Popular Exams Hub v27.2 (Typography Refined).
 * UPDATED: Removed uppercase from titles and buttons.
 */

const POPULAR_LIST = [
  { name: "PCS Hub", id: "pcs", boardId: "PPSC", hasMocks: true },
  { name: "Constable", id: "constable", boardId: "Punjab Police", hasMocks: true },
  { name: "Patwari Hub", id: "patwari", boardId: "PSSSB", hasMocks: true },
  { name: "Clerk Hub", id: "clerk", boardId: "PSSSB", hasMocks: true },
  { name: "PSTET Paper 1", id: "pstet-paper-1", boardId: "PSTET", hasMocks: true },
  { name: "ALM Tech", id: "alm", boardId: "PSPCL", hasMocks: true }
];

export default function PopularExams() {
  return (
    <section className="py-8 md:py-12 bg-slate-50/50 border-t border-slate-100 px-1">
      <div className="max-w-[1440px] 2xl:max-w-[1800px] mx-auto space-y-8 md:space-y-12">
         
         <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-3 text-left px-4 sm:px-6 lg:px-8">
            <div className="space-y-2">
               <div className="flex items-center gap-3 md:gap-4">
                  <div className="h-8 w-8 md:h-10 md:w-10 rounded-xl bg-blue-50 flex items-center justify-center text-primary shadow-inner shrink-0">
                    <Target className="h-4 w-4 md:h-5 md:w-5" />
                  </div>
                  <h2 className="text-[clamp(24px,3vw,30px)] font-bold tracking-tight text-[#0F172A]">Popular Exams</h2>
               </div>
               <p className="max-w-2xl text-[clamp(13px,1.2vw,16px)] font-medium text-slate-500">Start your study with our most popular exam groups.</p>
            </div>
            <Link href="/exams" className="text-primary font-bold text-[13px] md:text-base tracking-tight hover:underline flex items-center gap-2 group shrink-0">
               View All <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
         </div>

         <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-6 px-0 sm:px-6 lg:px-8">
            {POPULAR_LIST.slice(0, 4).map((p, idx) => (
               <motion.div 
                 key={p.id} 
                 initial={{ opacity: 0, scale: 0.98 }} 
                 whileInView={{ opacity: 1, scale: 1 }} 
                 viewport={{ once: true }} 
                 transition={{ duration: 0.4, delay: idx * 0.05 }} 
                 className="flex flex-col h-full"
               >
                  <Link href={`/exams/view?id=${p.id}`} className="h-full block">
                     <Card className="w-full mx-auto border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-500 rounded-[1.5rem] md:rounded-[3rem] bg-white p-4 pt-6 pb-4 md:p-10 h-full text-center flex flex-col group">
                        
                        <div className="flex justify-center mb-4 md:mb-10 shrink-0">
                          <AuthorityLogo boardId={p.boardId} size="md" className="shadow-lg group-hover:scale-110 transition-transform" />
                        </div>

                        <div className="flex-1 flex flex-col justify-center min-w-0">
                           <div className="space-y-2 md:space-y-4">
                              <h3 className="text-[14px] md:text-lg lg:text-xl font-bold leading-tight text-[#0F172A] group-hover:text-primary transition-colors line-clamp-2">
                                 {p.name}
                              </h3>
                              <div className="flex justify-center">
                                 <MiniChip emoji="📚" label="Tests" />
                              </div>
                           </div>
                        </div>

                        <div className="mt-auto shrink-0 pt-4 md:pt-10">
                           <Button variant="ghost" className="w-full h-10 md:h-12 rounded-full bg-[#0F172A] text-white group-hover:bg-primary transition-all font-black text-[10px] md:text-xs tracking-widest border-none active:scale-95 gap-2">
                              Open <ChevronRight className="h-3.5 w-3.5 md:h-4 md:w-4" />
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
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-50 border border-slate-100 text-[9px] font-bold text-slate-400 tracking-tight uppercase">
         <span>{emoji}</span> {label}
      </span>
   )
}
