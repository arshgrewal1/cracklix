"use client"

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Layers, ChevronRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useCollection, useFirestore } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { AuthorityLogo } from '@/lib/exam-icons';
import { Badge } from '@/components/ui/badge';

/**
 * @fileOverview Featured Categories Hub v33.0.
 * UPDATED: Icons standardized to high-fidelity circular nodes.
 */

const STRICT_WHITELIST = [
  "punjab-government-exams",
  "punjab-teaching-exams",
  "punjab-technical-exams",
  "banking-exams",
  "judiciary-exams",
  "central-government-exams"
];

export default function FeaturedCategories() {
  const db = useFirestore();
  
  const { data: rawCategories, loading: catLoading } = useCollection<any>(useMemo(() => (db ? query(collection(db, "categories"), orderBy("displayOrder", "asc")) : null), [db]));
  const { data: boards } = useCollection<any>(useMemo(() => (db ? collection(db, "boards") : null), [db]));

  const categories = useMemo(() => {
     if (!rawCategories) return [];
     return rawCategories.filter(c => STRICT_WHITELIST.includes(c.id));
  }, [rawCategories]);

  return (
    <section className="py-8 md:py-16 bg-white border-t border-slate-50">
      <div className="max-w-[1440px] 2xl:max-w-[1800px] mx-auto space-y-8 md:space-y-12">
        
        <div className="space-y-2 text-left px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 md:gap-4">
             <div className="h-8 w-8 md:h-10 md:w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-inner shrink-0">
               <Layers className="h-4 w-4 md:h-5 md:w-5" />
             </div>
             <h2 className="text-[22px] md:text-3xl font-bold tracking-tight text-[#0F172A]">Choose Exam</h2>
          </div>
          <p className="max-w-2xl text-[14px] md:text-base font-medium text-slate-500">Choose an exam to start your study.</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-6 px-0 sm:px-6 lg:px-8">
          {catLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <Skeleton 
                key={i} 
                className="h-[200px] md:h-[320px] w-full mx-auto rounded-[1.5rem] md:rounded-[3rem] bg-slate-50" 
              />
            ))
          ) : categories.map((cat, idx) => {
            const catBoards = boards?.filter(b => b.categoryId === cat.id) || [];
            const boardLabel = catBoards.length > 0 ? catBoards[0].abbreviation : "Official";
            
            return (
              <motion.div 
                key={cat.id} 
                initial={{ opacity: 0, y: 15 }} 
                whileInView={{ opacity: 1, y: 0 }} 
                viewport={{ once: true }} 
                transition={{ duration: 0.4, delay: idx * 0.05 }}
                className="flex flex-col h-full"
              >
                 <Link href={`/exams/category/${cat.id}`} className="h-full block">
                    <Card className="w-full mx-auto border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-500 rounded-[1.5rem] md:rounded-[3rem] bg-white group overflow-hidden flex flex-col p-4 pt-6 pb-4 md:p-10 h-full text-center">
                       
                       <div className="flex justify-center mb-4 md:mb-10 shrink-0">
                          <AuthorityLogo category={cat} size="md" className="shadow-lg" />
                       </div>

                       <div className="flex-1 flex flex-col justify-start min-w-0">
                          <div className="space-y-2 md:space-y-4">
                             <div className="flex justify-center h-4 md:h-6">
                                <Badge className="bg-primary/5 text-primary border-none font-bold text-[10px] px-2 py-0.5 rounded-full shadow-sm w-fit tracking-tight">
                                   {boardLabel} Hub
                                </Badge>
                             </div>
                             <h3 className="text-[15px] md:text-lg lg:text-xl font-bold leading-tight text-[#0F172A] group-hover:text-primary transition-colors line-clamp-2">
                                {cat.title}
                             </h3>
                          </div>
                       </div>

                       <div className="mt-auto shrink-0 pt-4 md:pt-10">
                          <Button variant="ghost" className="w-full h-10 md:h-12 rounded-full bg-[#0F172A] text-white group-hover:bg-primary transition-all font-black text-[10px] md:text-xs tracking-widest uppercase border-none active:scale-95 gap-2">
                             Open
                             <ChevronRight className="h-4 w-4" />
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
