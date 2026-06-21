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

/**
 * @fileOverview Popular Punjab Exams Hub v73.0 (Auto-Inheritance).
 * AUTO-RESOLUTION: Board logos are resolved automatically from the Board Registry.
 */

const POPULAR_LIST = [
  { name: "PCS", id: "pcs", boardId: "ppsc" },
  { name: "Punjab Police Constable", id: "constable", boardId: "punjab-police" },
  { name: "Patwari", id: "patwari", boardId: "psssb" },
  { name: "Clerk", id: "clerk", boardId: "psssb" },
  { name: "PSTET", id: "pstet-paper-1", boardId: "pstet" },
  { name: "ALM", id: "alm", boardId: "pspcl" },
  { name: "Staff Nurse", id: "staff-nurse", boardId: "bfuhs" },
  { name: "SSC CGL", id: "ssc-cgl", boardId: "ssc" }
];

export default function PopularExams() {
  return (
    <section className="py-16 bg-slate-50/50">
      <div className="container mx-auto px-4 max-w-7xl text-left">
         <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-4">
            <div className="space-y-1">
               <h2 className="text-3xl md:text-5xl font-black text-[#04102B] tracking-tight leading-none">Popular Exams</h2>
               <p className="text-[#94A3B8] font-bold text-xs tracking-tight uppercase">Most Targeted Preparation Hubs</p>
            </div>
            <Link href="/exams" className="text-primary font-bold text-sm hover:underline flex items-center gap-2 group">
               View All Exams <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
         </div>

         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {POPULAR_LIST.map((p, idx) => (
               <motion.div key={p.id} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }} viewport={{ once: true }}>
                  <Link href={`/exams/${p.id}`}>
                     <Card className="border border-[#E5E7EB] shadow-sm hover:shadow-xl transition-all duration-500 rounded-[2rem] bg-white p-6 md:p-8 text-left h-full group">
                        <div className="mb-6 flex justify-start">
                           <AuthorityLogo boardId={p.boardId} size="md" className="bg-slate-50 rounded-xl group-hover:scale-105 transition-transform" />
                        </div>
                        <h3 className="text-lg font-black text-[#04102B] leading-tight group-hover:text-primary transition-colors mb-6">
                           {p.name}
                        </h3>
                        <div className="mt-auto pt-4 border-t border-slate-50 flex items-center justify-between">
                           <span className="text-primary font-black text-[10px] uppercase tracking-widest flex items-center gap-2">
                              Open Exam <ArrowRight className="h-3.5 w-3.5" />
                           </span>
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
