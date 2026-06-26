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
    <section className="py-10 md:py-24 bg-slate-50/50 border-t border-slate-100">
      <div className="max-w-[1440px] 2xl:max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 space-y-6 md:space-y-16">
         
         <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-3 text-left">
            <div className="space-y-2">
               <div className="flex items-center gap-3 md:gap-4">
                  <div className="h-8 w-8 md:h-12 md:w-12 rounded-xl bg-blue-50 flex items-center justify-center text-primary shadow-inner shrink-0">
                    <Target className="h-4 w-4 md:h-6 md:w-6" />
                  </div>
                  <h2 className="text-[clamp(24px,4vw,40px)] font-black tracking-tight text-[#0F172A]">Popular Exams</h2>
               </div>
               <p className="max-w-2xl text-[clamp(13px,1.5vw,18px)] font-medium text-slate-500">Accelerate your prep with our most attempted recruitment hubs.</p>
            </div>
            <Link href="/exams" className="text-primary font-bold text-[13px] md:text-base tracking-tight hover:underline flex items-center gap-2 group shrink-0">
               View All Verticals <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
         </div>

         <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 md:gap-8 lg:gap-10">
            {POPULAR_LIST.map((p, idx) => (
               <motion.div 
                 key={p.id} 
                 initial={{ opacity: 0, scale: 0.98 }} 
                 whileInView={{ opacity: 1, scale: 1 }} 
                 viewport={{ once: true }} 
                 transition={{ duration: 0.4, delay: idx * 0.05 }} 
                 className="flex flex-col h-full"
               >
                  <Link href={`/exams/view?id=${p.id}`} className="h-full block">
                     <Card className="border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-500 rounded-2xl md:rounded-[3rem] bg-white p-4 md:p-8 lg:p-10 flex flex-col h-full min-h-[210px] md:min-h-[340px] relative overflow-hidden group">
                        <div className="flex-1 flex flex-col justify-start">
                           <div className="space-y-3 md:space-y-6">
                              <div className="h-10 w-10 md:h-20 md:w-20 bg-slate-50 rounded-xl md:rounded-3xl shadow-inner flex items-center justify-center overflow-hidden p-1.5 md:p-3 group-hover:scale-110 transition-transform">
                                 <AuthorityLogo boardId={p.boardId} size="sm" className="h-full w-full" />
                              </div>
                              <div className="space-y-1.5">
                                <h3 className="text-[clamp(13px,1.6vw,22px)] font-black tracking-tight text-[#0F172A] group-hover:text-primary transition-colors leading-tight line-clamp-2">
                                   {p.name}
                                </h3>
                                <div className="flex flex-wrap gap-1.5">
                                   <MiniChip emoji="📚" label="Series" />
                                </div>
                              </div>
                           </div>
                        </div>

                        <div className="mt-auto shrink-0 pt-4 md:pt-8">
                           <Button variant="ghost" className="w-full h-11 md:h-14 rounded-full bg-[#0F172A] text-white group-hover:bg-primary transition-all font-bold text-[clamp(10px,1vw,13px)] tracking-tight border-none shadow-md active:scale-95 gap-2">
                              Explore <ChevronRight className="h-3.5 w-3.5 md:h-4 md:w-4" />
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
      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-slate-50 border border-slate-100 text-[clamp(7px,0.8vw,10px)] font-bold text-slate-400 tracking-tight">
         <span>{emoji}</span> {label}
      </span>
   )
}
