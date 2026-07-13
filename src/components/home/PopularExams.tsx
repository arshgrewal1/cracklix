
'use client';

import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { 
  ChevronRight, 
  Target, 
  BookOpen, 
  Zap, 
  Bookmark, 
  Lock,
  Star
} from "lucide-react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { AuthorityLogo } from "@/lib/exam-icons";
import { Button } from "@/components/ui/button";
import { useCollection, useFirestore, useUser } from "@/firebase";
import { collection, query, where, limit } from "firebase/firestore";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

/**
 * @fileOverview Popular Exams Registry Hub v40.0.
 */

export default function PopularExams() {
  const db = useFirestore();
  const { profile } = useUser();
  
  const examsQuery = useMemo(() => {
    if (!db) return null;
    return query(collection(db, "exams"), where("isTrending", "==", true), limit(4));
  }, [db]);

  const { data: exams, loading } = useCollection<any>(examsQuery);
  const { data: mocks } = useCollection<any>(useMemo(() => (db ? collection(db, "mocks") : null), [db]));

  return (
    <section className="py-10 md:py-20 bg-white">
      <div className="max-w-[1440px] 2xl:max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
         
         <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-4">
               <div className="h-10 w-10 md:h-12 md:w-12 rounded-xl bg-blue-50 flex items-center justify-center text-primary shadow-inner shrink-0">
                 <Target className="h-5 w-5 md:h-6 md:w-6" />
               </div>
               <div className="text-left">
                  <h2 className="text-xl md:text-3xl font-black text-[#0F172A] tracking-tight">Popular Exams</h2>
                  <p className="text-[11px] md:text-sm font-medium text-slate-500">Official preparation hubs for the most competitive recruitments.</p>
               </div>
            </div>
            <Link href="/exams" className="text-primary font-bold text-xs md:text-sm flex items-center gap-1 hover:underline">
              View All <ChevronRight className="h-4 w-4" />
            </Link>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {loading ? (
               Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-64 w-full rounded-[2rem] bg-slate-50" />)
            ) : exams?.map((exam, idx) => {
               const examMocks = mocks?.filter((m: any) => (m.examIds || []).includes(exam.id)) || [];
               return (
                  <motion.div 
                    key={exam.id} 
                    initial={{ opacity: 0, y: 15 }} 
                    whileInView={{ opacity: 1, y: 0 }} 
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.05 }}
                  >
                     <Card className="border border-slate-100 shadow-lg hover:shadow-2xl transition-all duration-500 rounded-[2.5rem] bg-white p-6 md:p-10 flex flex-col group h-full relative overflow-hidden">
                        <div className="flex justify-between items-start mb-8">
                           <AuthorityLogo boardId={exam.boardId} size="md" className="shadow-md bg-slate-50" />
                           <button className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-300 hover:text-primary transition-all">
                              <Bookmark className="h-5 w-5" />
                           </button>
                        </div>

                        <div className="flex-1 space-y-4 text-left">
                           <h3 className="text-lg md:text-2xl font-black text-[#0F172A] group-hover:text-primary transition-colors leading-tight">
                              {exam.name}
                           </h3>
                           
                           <div className="flex flex-wrap gap-4 text-[11px] font-bold text-slate-400 uppercase tracking-tight">
                              <span className="flex items-center gap-1.5"><Zap className="h-3.5 w-3.5 text-primary" /> {examMocks.length} Tests</span>
                              <span className="flex items-center gap-1.5"><BookOpen className="h-3.5 w-3.5 text-primary" /> Notes</span>
                           </div>
                        </div>

                        <div className="mt-10">
                           <Button asChild className="w-full h-12 md:h-14 rounded-xl md:rounded-2xl bg-[#0F172A] hover:bg-primary text-white font-bold text-[11px] tracking-widest uppercase border-none active:scale-95 gap-2">
                              <Link href={`/exams/view?id=${exam.id}`}>
                                 Attempt Hub <ChevronRight className="h-4 w-4" />
                              </Link>
                           </Button>
                        </div>
                     </Card>
                  </motion.div>
               )
            })}
         </div>
      </div>
    </section>
  );
}
