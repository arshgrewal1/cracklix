
'use client';

import React, { useMemo } from 'react';
import { useCollection, useFirestore } from '@/firebase';
import { collection, query, limit, where } from 'firebase/firestore';
import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, GraduationCap, ChevronRight, Zap } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';

/**
 * @fileOverview High-Fidelity Trending Grid v2.0.
 * UPDATED: Strictly matched data and UI to user screenshot.
 */

const FALLBACK_TRENDING = [
  { id: 'trending-1', name: 'PUNJAB ANGANWADI / NTT' },
  { id: 'trending-2', name: 'ARMY GD (GENERAL DUTY)' },
  { id: 'trending-3', name: 'ASSISTANT PROFESSOR' },
  { id: 'trending-4', name: 'CADB MANAGER' }
];

export default function TrendingExams() {
  const db = useFirestore();
  const examsQuery = useMemo(() => (db ? query(collection(db, "exams"), where("isTrending", "==", true), limit(4)) : null), [db]);
  const { data: rawExams, loading } = useCollection<any>(examsQuery);

  const exams = useMemo(() => {
    if (!rawExams || rawExams.length === 0) return FALLBACK_TRENDING;
    return rawExams;
  }, [rawExams]);

  return (
    <section className="space-y-10 text-left">
      <div className="flex items-center justify-between">
         <div className="flex items-center gap-3">
            <TrendingUp className="h-5 w-5 text-rose-500" />
            <h2 className="text-2xl md:text-3xl font-headline font-black text-[#0F172A] uppercase tracking-widest">TRENDING HUBS</h2>
         </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
         {exams.map((exam, idx) => (
            <motion.div 
               key={exam.id}
               initial={{ opacity: 0, y: 20 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true }}
               transition={{ delay: idx * 0.1 }}
            >
               <Link href={exam.id.startsWith('trending') ? '/exams' : `/exams/${exam.id}`}>
                  <Card className="border-none shadow-xl hover:shadow-4xl rounded-[2.5rem] bg-white p-8 md:p-10 flex flex-col items-center text-center transition-all hover:translate-y-[-8px] group border border-slate-100">
                     <div className="h-16 w-16 md:h-20 md:w-20 rounded-full bg-slate-50 flex items-center justify-center mb-6 shadow-inner group-hover:scale-110 transition-transform">
                        <GraduationCap className="h-8 md:h-10 text-slate-300" />
                     </div>
                     
                     <div className="space-y-4 flex-1">
                        <Badge className="bg-rose-50 text-rose-500 border-none text-[8px] font-black uppercase px-2 py-0.5 animate-pulse">TRENDING</Badge>
                        <h3 className="text-lg md:text-xl font-black text-[#0F172A] uppercase leading-tight">{exam.name}</h3>
                     </div>

                     <div className="mt-8 flex items-center gap-2 text-[9px] font-black uppercase text-primary tracking-widest">
                        <Zap className="h-3.5 w-3.5 fill-current" /> GO TO HUB
                     </div>
                  </Card>
               </Link>
            </motion.div>
         ))}
      </div>
    </section>
  );
}
