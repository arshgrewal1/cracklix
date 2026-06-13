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
 * @fileOverview Institutional Popular Exams Hub v25.0.
 * HARDENED: Defined helpers before main component to resolve 'call' TypeErrors.
 */

function PrepNode({ label, icon, href }: { label: string, icon: React.ReactNode, href: string }) {
   return (
      <Link href={href} className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-lg hover:bg-primary/5 transition-all group/node">
         <span className="text-slate-300 group-hover/node:text-primary shrink-0">
            {React.isValidElement(icon) ? React.cloneElement(icon as React.ReactElement, { className: "h-3 w-3" }) : icon}
         </span>
         <span className="text-[8px] font-black text-slate-500 uppercase tracking-tighter truncate group-hover/node:text-[#0F172A]">{label}</span>
      </Link>
   )
}

function getBoardIcon(id: string, abbrev: string) {
  const key = (abbrev || id || "").toLowerCase();
  
  if (key.includes('psssb')) return <Landmark className="h-full w-full p-4" />;
  if (key.includes('police')) return <Shield className="h-full w-full p-4" />;
  if (key.includes('ppsc')) return <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSR8W5eTBPdzztA7cziqnMmtWk9InL1yflUD_xb4vAsLw&s=10" className="h-full w-full object-contain p-4" />;
  if (key.includes('pstet') || key.includes('ctet')) return <BookOpen className="h-full w-full p-4" />;
  if (key.includes('pspcl') || key.includes('pstcl')) return <Zap className="h-full w-full p-4" />;
  if (key.includes('court')) return <Scale className="h-full w-full p-4" />;
  if (key.includes('army') || key.includes('cadre') || key.includes('ett')) return <GraduationCap className="h-full w-full p-4" />;
  
  return <Landmark className="h-full w-full p-4" />;
}

export default function PopularExams() {
  const db = useFirestore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const boardsQuery = useMemo(() => (db ? query(collection(db, "boards"), orderBy("displayOrder", "asc")) : null), [db]);
  const { data: boards, loading } = useCollection<any>(boardsQuery);

  const filteredBoards = useMemo(() => {
    if (!boards || !mounted) return [];
    const targetAbbrevs = ['PSSSB', 'POLICE', 'PPSC', 'PSPCL', 'PSTET', 'CTET', 'ETT', 'MASTER CADRE'];
    return boards.filter((b: any) => targetAbbrevs.includes(b.abbreviation?.toUpperCase()));
  }, [boards, mounted]);

  return (
    <section className="py-12 md:py-24 bg-slate-50/50">
      <div className="container mx-auto px-4 max-w-7xl">
         <div className="text-left mb-12 md:mb-16 space-y-4">
            <div className="flex items-center gap-4">
               <div className="h-10 w-10 bg-orange-50 rounded-xl flex items-center justify-center text-primary shadow-inner">
                  <Star className="h-5 w-5 fill-current" />
               </div>
               <h2 className="text-2xl md:text-5xl font-headline font-black text-[#0F172A] uppercase tracking-tight leading-none">
                  Popular Hubs
               </h2>
            </div>
            <p className="text-slate-500 font-medium text-sm md:text-lg max-w-2xl">
               Browse official recruitment hubs and select your target vertical to start high-fidelity mock practice.
            </p>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {!mounted || loading ? (
               Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-80 w-full rounded-[2.5rem]" />)
            ) : filteredBoards.map((board, idx) => (
              <motion.div 
                 key={board.id}
                 initial={{ opacity: 0, y: 20 }}
                 whileInView={{ opacity: 1, y: 0 }}
                 transition={{ delay: idx * 0.05 }}
                 viewport={{ once: true }}
              >
                 <Card className="border-none shadow-xl hover:shadow-4xl transition-all duration-500 rounded-[2.5rem] bg-white group overflow-hidden h-full flex flex-col border border-slate-100 p-8 text-left">
                    <div className="flex justify-between items-start mb-8">
                       <div className="h-16 w-16 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-300 group-hover:text-primary transition-all duration-500 shrink-0 shadow-inner relative overflow-hidden">
                          {board.iconUrl ? (
                             <img src={board.iconUrl} className="h-full w-full object-contain p-4" alt="Hub Logo" referrerPolicy="no-referrer" />
                          ) : getBoardIcon(board.id, board.abbreviation)}
                       </div>
                       <Badge variant="outline" className="text-[8px] font-black uppercase tracking-widest border-slate-100 text-slate-400">OFFICIAL HUB</Badge>
                    </div>
                    
                    <div className="space-y-2 flex-1">
                       <h3 className="text-2xl font-black text-[#0F172A] uppercase tracking-tight leading-none group-hover:text-primary transition-colors">{board.abbreviation} Hub</h3>
                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate">{board.name}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 mt-8">
                       <PrepNode label="Full Mocks" icon={<Zap />} href={`/exams/hub/${board.id}`} />
                       <PrepNode label="Subject" icon={<BookOpen />} href={`/exams/hub/${board.id}`} />
                       <PrepNode label="PYQs" icon={<FileText />} href={`/exams/hub/${board.id}`} />
                       <PrepNode label="Updates" icon={<Newspaper />} href={`/current-affairs`} />
                    </div>

                    <div className="mt-8 pt-6 border-t border-slate-50">
                       <Button asChild className="w-full h-12 rounded-xl bg-slate-900 text-white hover:bg-primary transition-all font-black uppercase text-[9px] tracking-widest gap-2 border-none">
                          <Link href={`/exams/hub/${board.id}`}>
                             Explore Hub <ChevronRight className="h-3 w-3" />
                          </Link>
                       </Button>
                    </div>
                 </Card>
              </motion.div>
            ))}
         </div>
      </div>
    </section>
  );
}
