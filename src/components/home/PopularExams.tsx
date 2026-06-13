'use client';

import React, { useMemo, useState, useEffect } from "react"
import { motion } from "framer-motion";
import { 
  ChevronRight, 
  Landmark, 
  BookOpen, 
  Zap, 
  Shield, 
  ShieldCheck, 
  GraduationCap, 
  Scale,
  Star,
  FileText,
  Newspaper,
  Info,
  Stethoscope,
  ArrowRight
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useCollection, useFirestore } from "@/firebase";
import { collection, query, orderBy } from "firebase/firestore";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

/**
 * @fileOverview Screenshot Matched Popular Hubs v41.0.
 * FIXED: Verified all component and icon imports.
 */

function getBoardIcon(id: string, abbrev: string) {
  const key = (abbrev || id || "").toLowerCase();
  if (key.includes('psssb')) return <img src="https://sssb.punjab.gov.in/wp-content/themes/ssbtheme/images/punjab-gov.svg" className="h-full w-full object-contain" />;
  if (key.includes('police')) return <img src="https://www.punjabpolice.gov.in/media/images/Logo_of_Punjab_Police_India.original.png" className="h-full w-full object-contain" />;
  if (key.includes('ppsc')) return <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSR8W5eTBPdzztA7cziqnMmtWk9InL1yflUD_xb4vAsLw&s=10" className="h-full w-full object-contain" />;
  if (key.includes('teaching')) return <GraduationCap className="h-full w-full text-orange-500" />;
  if (key.includes('court')) return <Scale className="h-full w-full text-slate-600" />;
  if (key.includes('pspcl')) return <Zap className="h-full w-full text-blue-500" />;
  if (key.includes('bfuhs')) return <Stethoscope className="h-full w-full text-emerald-600" />;
  if (key.includes('banking')) return <Landmark className="h-full w-full text-[#0B1F3A]" />;
  return <Landmark className="h-full w-full text-slate-300" />;
}

export default function PopularExams() {
  const db = useFirestore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const boardsQuery = useMemo(() => (db ? query(collection(db, "boards"), orderBy("displayOrder", "asc")) : null), [db]);
  const { data: boards, loading } = useCollection<any>(boardsQuery);
  const { data: allExams } = useCollection<any>(useMemo(() => (db ? collection(db, "exams") : null), [db]));
  const { data: mocks } = useCollection<any>(useMemo(() => (db ? collection(db, "mocks") : null), [db]));

  const filteredBoards = useMemo(() => {
    if (!boards || !mounted) return [];
    return boards.slice(0, 8);
  }, [boards, mounted]);

  if (!mounted) return null;

  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="container mx-auto px-4 max-w-7xl">
         
         <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6 text-left">
            <div className="space-y-2">
               <h2 className="text-3xl md:text-5xl font-headline font-black text-[#0F172A] uppercase tracking-tight leading-none">Popular Exams</h2>
               <p className="text-slate-500 font-medium text-sm md:text-lg">Complete preparation for all major Punjab government exams.</p>
            </div>
            <Link href="/exams" className="flex items-center gap-2 text-primary font-black uppercase text-[10px] md:text-sm hover:underline tracking-widest">
               View All Exams <ChevronRight className="h-4 w-4" />
            </Link>
         </div>

         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {loading ? (
               Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-44 w-full rounded-[2.5rem]" />)
            ) : filteredBoards.map((board) => {
               const examCount = allExams?.filter(e => e.boardId === board.id || e.boardId === board.abbreviation).length || 0;
               const mockCount = mocks?.filter(m => (m.boardIds && m.boardIds.includes(board.id)) || m.boardId === board.id).length || 0;
               
               return (
                  <Link key={board.id} href={`/exams/hub/${board.id}`}>
                     <Card className="border border-slate-100 shadow-sm hover:shadow-4xl transition-all duration-500 rounded-[2.5rem] bg-white group p-8 text-left h-full flex flex-col">
                        <div className="flex items-center gap-6">
                           <div className="h-16 w-16 md:h-20 md:w-20 rounded-[1.5rem] bg-slate-50 flex items-center justify-center p-4 shrink-0 shadow-inner group-hover:scale-105 transition-transform">
                              {getBoardIcon(board.id, board.abbreviation)}
                           </div>
                           <div className="min-w-0">
                              <h3 className="text-xl md:text-2xl font-black text-[#0F172A] uppercase leading-none group-hover:text-primary transition-colors">{board.abbreviation}</h3>
                              <p className="text-[10px] font-bold text-slate-400 mt-2 truncate uppercase tracking-widest">{board.name}</p>
                           </div>
                        </div>

                        <div className="mt-10 pt-6 border-t border-slate-50 grid grid-cols-2 gap-4">
                           <div className="flex items-center gap-2.5">
                              <BookOpen className="h-4 w-4 text-blue-500" />
                              <span className="text-[10px] font-black text-slate-600 uppercase tracking-tight">{examCount} Hubs</span>
                           </div>
                           <div className="flex items-center gap-2.5">
                              <Zap className="h-4 w-4 text-orange-500" />
                              <span className="text-[10px] font-black text-slate-600 uppercase tracking-tight">{mockCount} Tests</span>
                           </div>
                        </div>
                     </Card>
                  </Link>
               )
            })}
         </div>
      </div>
    </section>
  );
}
