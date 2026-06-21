"use client"

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Zap, BookOpen, Layers } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useCollection, useFirestore } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { AuthorityLogo } from '@/lib/exam-icons';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

/**
 * @fileOverview Institutional Category Discovery v115.0 (Mobile Compressed).
 */

const STRICT_WHITELIST = [
  "punjab-government-exams",
  "punjab-teaching-exams",
  "punjab-technical-exams",
  "banking-exams",
  "punjab-health-exams",
  "judiciary-exams",
  "high-court-exams"
];

export default function FeaturedCategories() {
  const db = useFirestore();
  
  const { data: rawCategories, loading: catLoading } = useCollection<any>(useMemo(() => (db ? query(collection(db, "categories"), orderBy("displayOrder", "asc")) : null), [db]));
  const { data: exams } = useCollection<any>(useMemo(() => (db ? collection(db, "exams") : null), [db]));
  const { data: mocks } = useCollection<any>(useMemo(() => (db ? collection(db, "mocks") : null), [db]));
  const { data: pyqs } = useCollection<any>(useMemo(() => (db ? collection(db, "pyqs") : null), [db]));

  const categories = useMemo(() => {
     if (!rawCategories) return [];
     return rawCategories.filter(c => STRICT_WHITELIST.includes(c.id));
  }, [rawCategories]);

  return (
    <section className="py-6 md:py-16 bg-white border-t border-slate-50">
      <div className="container mx-auto px-4 max-w-7xl space-y-4 md:space-y-12 text-left">
        <div className="space-y-0.5 px-1">
           <h2 className="text-xl md:text-5xl font-black text-[#0F172A] leading-tight tracking-tight">Choose Category</h2>
           <p className="text-slate-500 font-medium text-[10px] md:text-lg">Select a recruitment vertical to begin.</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-8">
          {catLoading ? (
            Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-40 md:h-96 w-full rounded-xl md:rounded-[2.5rem] bg-slate-50" />)
          ) : categories.map((cat, idx) => {
            const catExams = exams?.filter(e => e.categoryId === cat.id) || [];
            const catExamIds = catExams.map(e => e.id);
            
            const catMocksCount = mocks?.filter(m => 
              catExamIds.includes(m.examId) || 
              (m.examIds && m.examIds.some(id => catExamIds.includes(id)))
            ).length || 0;
            
            const catPyqsCount = pyqs?.filter(p => catExamIds.includes(p.examId)).length || 0;

            return (
              <motion.div key={cat.id} initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: idx * 0.05 }}>
                 <Link href={`/exams/category/${cat.id}`}>
                    <Card className="border border-[#E5E7EB] shadow-sm hover:shadow-xl transition-all duration-500 rounded-xl md:rounded-[2.5rem] bg-white group overflow-hidden flex flex-col p-3 md:p-10 h-full relative">
                       
                       <div className="mb-3 md:mb-8 flex justify-start">
                          <AuthorityLogo category={cat} size="sm" className="md:w-16 md:h-16 bg-slate-50 rounded-lg md:rounded-2xl shadow-inner group-hover:scale-105 transition-transform" />
                       </div>
                       
                       <div className="space-y-1 md:space-y-4 flex-1">
                          <h3 className="text-[12px] md:text-[24px] font-black text-[#0F172A] group-hover:text-primary transition-colors leading-tight line-clamp-2">{cat.title}</h3>
                          
                          <div className="flex flex-col gap-1 md:gap-3 pt-1 md:pt-2">
                             <StatChip label="Exams" val={catExams.length} icon={BookOpen} />
                             {catMocksCount > 0 && <StatChip label="Tests" val={catMocksCount} icon={Zap} />}
                          </div>
                       </div>

                       <div className="mt-4 md:mt-10 pt-3 border-t border-slate-50">
                          <Button variant="ghost" className="w-full h-8 md:h-14 rounded-lg md:rounded-2xl bg-[#0F172A] text-white group-hover:bg-primary transition-all font-black text-[8px] md:text-xs tracking-widest uppercase border-none shadow-md gap-2 active:scale-95">
                             Open <ArrowRight className="h-2.5 w-2.5 md:h-4 md:w-4" />
                          </Button>
                       </div>
                    </Card>
                 </Link>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  );
}

function StatChip({ label, val, icon: Icon, className }: any) {
   return (
      <div className={cn("flex items-center gap-1 text-[#0F172A] font-bold", className)}>
         <Icon className="h-2.5 w-2.5 md:h-3.5 md:w-3.5 text-primary" />
         <div className="flex items-baseline gap-1">
            <span className="text-[10px] md:text-sm font-black tabular-nums">{val}</span>
            <span className="text-[7px] md:text-[9px] font-bold text-slate-400 uppercase truncate">{label}</span>
         </div>
      </div>
   )
}
