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
 * @fileOverview Featured Categories Hub v33.1.
 * UPDATED: Reduced padding and normalized typography.
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
    <section className="py-6 md:py-10 bg-white border-t border-slate-50">
      <div className="max-w-[1440px] 2xl:max-w-[1800px] mx-auto space-y-6 md:space-y-10">
        
        <div className="space-y-1 text-left px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 md:gap-4">
             <div className="h-8 w-8 md:h-10 md:w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-inner shrink-0">
               <Layers className="h-4 w-4 md:h-5 md:w-5" />
             </div>
             <h2 className="text-[22px] md:text-[28px] font-bold tracking-tight text-[#0F172A]">Choose exam</h2>
          </div>
          <p className="max-w-2xl text-sm md:text-base font-medium text-slate-500">Select an exam category to start your journey.</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-6 px-1.5 sm:px-6 lg:px-8">
          {catLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <Skeleton 
                key={i} 
                className="h-[180px] md:h-[280px] w-full mx-auto rounded-[1.25rem] md:rounded-[2.5rem] bg-slate-50" 
              />
            ))
          ) : categories.map((cat, idx) => {
            const catBoards = boards?.filter(b => b.categoryId === cat.id) || [];
            const boardLabel = catBoards.length > 0 ? catBoards[0].abbreviation : "Official";
            
            return (
              <motion.div 
                key={cat.id} 
                initial={{ opacity: 0, y: 10 }} 
                whileInView={{ opacity: 1, y: 0 }} 
                viewport={{ once: true }} 
                transition={{ duration: 0.3, delay: idx * 0.05 }}
                className="flex flex-col h-full"
              >
                 <Link href={`/exams/category/${cat.id}`} className="h-full block">
                    <Card className="w-full mx-auto border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-500 rounded-[1.5rem] md:rounded-[2.5rem] bg-white group overflow-hidden flex flex-col p-4 md:p-8 h-full text-center">
                       
                       <div className="flex justify-center mb-4 md:mb-8 shrink-0">
                          <AuthorityLogo category={cat} size="md" className="shadow-md" />
                       </div>

                       <div className="flex-1 flex flex-col justify-center min-w-0">
                          <div className="space-y-1.5 md:space-y-3">
                             <div className="flex justify-center h-4 md:h-5">
                                <Badge className="bg-primary/5 text-primary border-none font-bold text-[9px] md:text-[10px] px-2 py-0.5 rounded-full shadow-sm w-fit tracking-tight">
                                   {boardLabel} hub
                                </Badge>
                             </div>
                             <h3 className="text-sm md:text-xl font-bold leading-tight text-[#0F172A] group-hover:text-primary transition-colors line-clamp-2">
                                {cat.title}
                             </h3>
                          </div>
                       </div>

                       <div className="mt-auto shrink-0 pt-3 md:pt-8">
                          <Button variant="ghost" className="w-full h-10 md:h-12 rounded-full bg-[#0F172A] text-white group-hover:bg-primary transition-all font-bold text-[11px] md:text-xs tracking-wide border-none active:scale-95 gap-2">
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