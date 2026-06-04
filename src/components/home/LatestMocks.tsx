
'use client';

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, BookOpen, ShieldCheck, ArrowRight, Zap, Award, ChevronRight, FileText } from "lucide-react";
import Link from "next/link";
import { useCollection, useFirestore } from "@/firebase";
import { collection, query, where } from "firebase/firestore";
import { useMemo } from "react";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * @fileOverview Institutional Latest Series Registry (Exam-Centric).
 * Redesigned for Testbook Aesthetic: Compact badges, metadata strip, and absolute black typography.
 */

export default function LatestMocks() {
  const db = useFirestore();
  
  const mocksQuery = useMemo(() => {
    if (!db) return null;
    return query(
      collection(db, "mocks"), 
      where("published", "==", true)
    );
  }, [db]);

  const { data: rawMocks, loading } = useCollection<any>(mocksQuery);

  const sortedMocks = useMemo(() => {
    if (!rawMocks) return [];
    return [...rawMocks]
      .sort((a, b) => {
        const timeA = a.createdAt?.seconds || 0;
        const timeB = b.createdAt?.seconds || 0;
        return timeB - timeA;
      })
      .slice(0, 5);
  }, [rawMocks]);

  return (
    <section className="py-16 md:py-24 bg-white overflow-hidden">
      <div className="container mx-auto px-6 max-w-7xl">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 md:mb-16 gap-6 text-left">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-2"
          >
            <div className="flex items-center gap-2">
               <div className="h-1 w-6 bg-primary rounded-full" />
               <span className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-400">Institutional Feed</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-headline font-black text-[#000000] uppercase tracking-tight leading-none">
              Recent <span className="text-primary">Mastery</span>
            </h2>
            <p className="text-slate-400 text-sm md:text-lg font-medium">Newest high-fidelity series deployed for 2026 aspirants.</p>
          </motion.div>
          
          <Link 
            href="/mocks" 
            className="group flex items-center gap-3 bg-slate-50 hover:bg-[#0F172A] hover:text-white px-8 py-4 rounded-2xl transition-all duration-500 shadow-sm font-black uppercase text-[9px] tracking-widest"
          >
            Explore Exam Hubs <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 md:gap-8">
          {loading ? (
             Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-96 w-full rounded-[2.5rem]" />)
          ) : sortedMocks && sortedMocks.length > 0 ? (
            sortedMocks.map((mock, i) => (
              <motion.div
                key={mock.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="h-full"
              >
                <Card className="border-none rounded-[2.5rem] bg-white shadow-xl hover:shadow-3xl hover:-translate-y-1.5 transition-all duration-500 overflow-hidden flex flex-col h-full group border border-slate-50">
                  <CardContent className="p-0 flex-1 flex flex-col h-full">
                    <div className="p-6 md:p-8 pb-4 space-y-6 flex-1">
                       <div className="flex justify-between items-start">
                          <div className="h-14 w-14 rounded-2xl bg-white border border-slate-100 flex items-center justify-center relative overflow-hidden shadow-lg group-hover:scale-105 transition-transform duration-500 shrink-0">
                             {mock.boardId === 'psssb' ? (
                               <img src="https://sssb.punjab.gov.in/images/logo.png" className="w-full h-full object-contain p-2" alt="PSSSB" />
                             ) : (
                               <ShieldCheck className="h-7 w-7 text-primary fill-current opacity-20" />
                             )}
                          </div>
                          <div className="text-right">
                             <Badge className="bg-orange-50 text-primary border-none text-[8px] font-black uppercase tracking-[0.2em] px-2 py-0.5 rounded-md mb-1">
                                {mock.boardId || 'OFFICIAL'}
                             </Badge>
                             <p className="text-[7px] font-black text-slate-300 uppercase tracking-widest">Pattern Match</p>
                          </div>
                       </div>

                       <div className="space-y-4">
                          <h3 className="font-bold text-base md:text-lg text-[#000000] leading-tight uppercase line-clamp-2 min-h-[44px] group-hover:text-primary transition-colors">
                           {mock.title}
                          </h3>
                          
                          <div className="space-y-2.5 pt-2 border-t border-slate-50">
                             <div className="flex items-center gap-2 text-slate-400 font-bold uppercase text-[9px] tracking-tight">
                                <BookOpen className="h-3.5 w-3.5 text-primary shrink-0" /> {mock.totalQuestions} Questions
                             </div>
                             <div className="flex items-center gap-2 text-slate-400 font-bold uppercase text-[9px] tracking-tight">
                                <Clock className="h-3.5 w-3.5 text-primary shrink-0" /> {mock.duration} Minutes
                             </div>
                             <div className="flex items-center gap-2 text-slate-400 font-bold uppercase text-[9px] tracking-tight">
                                <FileText className="h-3.5 w-3.5 text-primary shrink-0" /> {mock.totalQuestions} Marks
                             </div>
                          </div>
                       </div>
                    </div>

                    <div className="p-6 pt-0">
                       <Button asChild className="w-full bg-[#0B1528] hover:bg-primary text-white font-black h-12 rounded-xl text-[9px] uppercase tracking-[0.2em] shadow-lg transition-all group">
                         <Link href={`/exams/${mock.examId}`} className="flex items-center justify-center gap-2">
                            Start Practice <ChevronRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                         </Link>
                       </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          ) : (
            <div className="col-span-full py-20 text-center opacity-10">
               <ShieldCheck className="h-16 w-16 mx-auto mb-4" />
               <p className="font-headline font-black uppercase tracking-[0.4em] text-xs">Registry Node Empty</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
