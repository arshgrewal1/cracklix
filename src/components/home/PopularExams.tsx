
'use client';

import { useMemo, useState } from "react"
import { motion } from "framer-motion";
import { ChevronRight, BookOpen, GraduationCap, ShieldCheck, Zap } from "lucide-react";
import Link from "next/link";
import { useCollection, useFirestore } from "@/firebase"
import { collection, query, limit, where } from "firebase/firestore"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils";

/**
 * @fileOverview High-Density Exam Hub Catalog v9.0.
 * UPDATED: Fully dynamic real-time mock and question registry synchronization.
 */

export default function PopularExams() {
  const db = useFirestore()
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({})
  
  const examsQuery = useMemo(() => {
    if (!db) return null
    return query(collection(db, "exams"), limit(12))
  }, [db])

  const boardsQuery = useMemo(() => (db ? collection(db, "boards") : null), [db])
  const mocksQuery = useMemo(() => (db ? query(collection(db, "mocks"), where("published", "==", true)) : null), [db])
  const questionsQuery = useMemo(() => (db ? collection(db, "questions") : null), [db])

  const { data: rawExams, loading: examsLoading } = useCollection<any>(examsQuery)
  const { data: boards } = useCollection<any>(boardsQuery)
  const { data: mocks, loading: mocksLoading } = useCollection<any>(mocksQuery)
  const { data: questions } = useCollection<any>(questionsQuery)

  const statsMap = useMemo(() => {
    if (!mocks || !questions) return { mocks: {}, qs: {} };
    const mockMap: Record<string, number> = {};
    const qMap: Record<string, number> = {};
    
    mocks.forEach(m => {
      if (m.examId) mockMap[m.examId] = (mockMap[m.examId] || 0) + 1;
    });

    questions.forEach(q => {
      if (q.examId) qMap[q.examId] = (qMap[q.examId] || 0) + 1;
    });

    return { mocks: mockMap, qs: qMap };
  }, [mocks, questions]);

  const exams = useMemo(() => {
    if (!rawExams) return [];
    return rawExams.filter((exam: any) => {
      const board = boards?.find(b => b.id === exam.boardId);
      const hasLogo = exam.iconUrl || board?.iconUrl;
      const isFailed = failedImages[exam.id];
      return hasLogo && !isFailed;
    }).slice(0, 8);
  }, [rawExams, boards, failedImages]);

  return (
    <section className="py-8 md:py-16 bg-transparent">
      <div className="container mx-auto px-0">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 md:mb-12 gap-4 text-left">
          <div className="space-y-1">
            <h2 className="text-2xl md:text-4xl font-black text-[#000000] font-headline uppercase tracking-tight">
              EXAM <span className="text-primary">CATALOG</span>
            </h2>
            <p className="text-slate-500 text-sm md:text-lg font-medium">
              Verified preparation hubs for official recruitments.
            </p>
          </div>
          <Link href="/exams" className="text-primary font-black text-[7px] md:text-[8px] uppercase tracking-[0.2em] flex items-center group gap-2 px-4 py-2 bg-white rounded-lg shadow-sm border border-slate-100 hover:shadow-lg transition-all">
            Full Catalog <ChevronRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
          {(examsLoading || mocksLoading) ? (
             Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-32 md:h-48 w-full rounded-2xl" />)
          ) : exams && exams.length > 0 ? (
            exams.map((exam, idx) => {
              const board = boards?.find(b => b.id === exam.boardId)
              const logoUrl = exam.iconUrl || board?.iconUrl;
              const isArmy = exam.boardId?.toLowerCase() === 'army' || exam.id?.toLowerCase().includes('army');
              const liveTestsCount = statsMap.mocks[exam.id] || 0;
              const liveQuestionsCount = statsMap.qs[exam.id] || 0;

              return (
                <motion.div
                  key={exam.id}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  viewport={{ once: true }}
                >
                  <Link href={`/exams/${exam.id}`}>
                    <div className="bg-white rounded-2xl md:rounded-[2.5rem] border border-slate-100 shadow-xl hover:shadow-4xl transition-all h-full flex flex-col group p-4 md:p-8 text-left overflow-hidden relative">
                      <div className="absolute top-0 right-0 p-4 opacity-[0.02] group-hover:scale-110 transition-transform"><GraduationCap className="h-20 w-20 md:h-40 md:w-40" /></div>
                      
                      <div className="flex items-center gap-4 md:gap-8 relative z-10">
                        <div className="shrink-0 h-14 w-14 md:h-20 md:w-20 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center transition-all group-hover:bg-white relative overflow-hidden">
                           {logoUrl ? (
                             <img 
                               src={logoUrl} 
                               className={cn("w-full h-full object-contain p-2 md:p-3 transition-transform duration-500 group-hover:scale-110", isArmy ? "scale-125" : "")} 
                               alt={exam.name}
                               referrerPolicy="no-referrer"
                               onError={() => setFailedImages(prev => ({ ...prev, [exam.id]: true }))}
                             />
                           ) : (
                             <GraduationCap className="h-6 w-6 md:h-9 md:w-9 text-slate-300 group-hover:text-primary transition-colors" />
                           )}
                        </div>
                        <div className="min-w-0 flex-1 space-y-1 md:space-y-2">
                          <div className="flex items-center justify-between">
                             <Badge className="bg-primary/5 text-primary border-none text-[6px] md:text-[7px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-md">
                                {board?.abbreviation || 'GOVT'}
                             </Badge>
                             <span className="text-[6px] md:text-[8px] font-bold text-slate-400 uppercase tracking-widest">{exam.category}</span>
                          </div>
                          <h3 className="text-sm md:text-2xl font-black text-[#000000] group-hover:text-primary transition-colors leading-tight uppercase truncate">
                            {exam.name}
                          </h3>
                          <div className="flex items-center gap-4 pt-1">
                             <div className="flex items-center gap-1.5">
                                <Zap className="h-2.5 w-2.5 md:h-3.5 md:w-3.5 text-primary" />
                                <span className="text-[8px] md:text-[10px] font-black text-[#0F172A] uppercase">{liveTestsCount} Live Mocks</span>
                             </div>
                             <div className="flex items-center gap-1.5">
                                <BookOpen className="h-2.5 w-2.5 md:h-3.5 md:w-3.5 text-primary" />
                                <span className="text-[8px] md:text-[10px] font-black text-[#0F172A] uppercase">{liveQuestionsCount > 0 ? liveQuestionsCount : '0'}+ Qs</span>
                             </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              )
            })
          ) : (
            <div className="col-span-full py-12 text-center opacity-20 border-2 border-dashed border-slate-100 rounded-2xl">
               <ShieldCheck className="h-10 w-10 mx-auto mb-2" />
               <p className="font-black uppercase tracking-widest text-[9px]">Syncing Registry Hub...</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
