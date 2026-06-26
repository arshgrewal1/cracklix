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

const POPULAR_LIST = [
  { name: "PCS", id: "pcs", boardId: "PPSC", hasMocks: true },
  { name: "Constable", id: "constable", boardId: "Punjab Police", hasMocks: true },
  { name: "Patwari", id: "patwari", boardId: "PSSSB", hasMocks: true },
  { name: "Clerk", id: "clerk", boardId: "PSSSB", hasMocks: true },
  { name: "PSTET", id: "pstet-paper-1", boardId: "PSTET", hasMocks: true },
  { name: "ALM", id: "alm", boardId: "PSPCL", hasMocks: true },
  { name: "Staff Nurse", id: "staff-nurse", boardId: "BFUHS", hasMocks: true },
  { name: "SSC CGL", id: "ssc-cgl", boardId: "SSC", hasMocks: true }
];

export default function PopularExams() {
  return (
    <section className="section-py bg-slate-50/50 border-t border-slate-100">
      <div className="max-w-[1440px] mx-auto container-px space-y-6 md:space-y-16">
         <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-3 text-left">
            <div className="space-y-1">
               <div className="flex items-center gap-3">
                  <div className="h-7 w-7 md:h-10 md:w-10 rounded-lg bg-blue-50 flex items-center justify-center text-primary shadow-inner shrink-0">
                    <Target className="h-4 w-4 md:h-6 md:w-6" />
                  </div>
                  <h2 className="text-[24px] md:text-5xl font-black tracking-tight">Popular Exams</h2>
               </div>
               <p className="max-w-2xl text-sm md:text-xl">Direct access to the most attempted recruitment preparation hubs.</p>
            </div>
            <Link href="/exams" className="text-primary font-bold text-xs md:text-base tracking-tight hover:underline flex items-center gap-2 group shrink-0">
               View Registry <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
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
                     <Card className="border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-500 rounded-[24px] md:rounded-[3rem] bg-white p-4 md:p-10 flex flex-col justify-between group h-[200px] md:h-[300px] relative overflow-hidden">
                        <div className="flex flex-col h-full justify-between">
                           <div className="space-y-3">
                              <div className="h-10 w-10 md:h-20 md:w-20 bg-slate-50 rounded-xl md:rounded-2xl shadow-inner flex items-center justify-center overflow-hidden p-1.5 group-hover:scale-110 transition-transform">
                                 <AuthorityLogo boardId={p.boardId} size="sm" className="h-full w-full" />
                              </div>
                              <h3 className="text-[17px] md:text-2xl font-black tracking-tight truncate text-[#0F172A] group-hover:text-primary transition-colors">{p.name}</h3>
                              <div className="flex flex-wrap gap-1.5">
                                 <MiniChip emoji="📚" label="Mocks" />
                                 <MiniChip emoji="⚡" label="Live" />
                              </div>
                           </div>

                           <div className="mt-4">
                              <Button variant="ghost" className="w-full h-11 md:h-14 rounded-full bg-[#0F172A] text-white group-hover:bg-primary transition-all font-semibold text-xs md:text-base border-none shadow-md active:scale-95">
                                 Open <ChevronRight className="h-3 w-3 ml-1" />
                              </Button>
                           </div>
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
      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-slate-50 border border-slate-100 text-[10px] font-bold text-slate-400">
         <span>{emoji}</span> {label}
      </span>
   )
}