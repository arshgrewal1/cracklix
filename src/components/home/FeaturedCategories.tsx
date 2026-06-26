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
    <section className="py-6 md:py-24 bg-white border-t border-slate-50">
      <div className="max-w-[1440px] 2xl:max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 space-y-6 md:space-y-16">
        
        <div className="space-y-2 text-left px-1">
          <div className="flex items-center gap-2 md:gap-4">
             <div className="h-8 w-8 md:h-12 md:w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-inner shrink-0">
               <Layers className="h-4 w-4 md:h-6 md:w-6" />
             </div>
             <h2 className="text-[22px] md:text-[clamp(24px,4vw,36px)] font-bold tracking-tight text-[#0F172A]">Choose Exam</h2>
          </div>
          <p className="max-w-2xl text-[14px] md:text-[clamp(13px,1.5vw,16px)] font-medium text-slate-500">Choose an exam to start your study.</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 md:gap-8 lg:gap-10">
          {catLoading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <Skeleton 
                key={i} 
                className="h-[270px] md:h-[420px] w-full rounded-2xl md:rounded-[3rem] bg-slate-50" 
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
                    <Card className="border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-500 rounded-[24px] md:rounded-[3rem] bg-white group overflow-hidden flex flex-col p-4 md:p-10 lg:p-12 h-full min-h-[280px] md:min-h-[420px]">
                       <div className="flex-1 flex flex-col justify-start">
                          <div className="space-y-3 md:space-y-6">
                             <div className="h-11 w-11 md:h-24 md:w-24 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform overflow-hidden">
                                <AuthorityLogo category={cat} size="lg" className="bg-transparent shadow-none border-none p-0 h-full w-full" />
                             </div>
                             <div className="space-y-1.5 md:space-y-3">
                                <Badge className="bg-primary/5 text-primary border-none font-bold text-[12px] px-2.5 py-0.5 rounded-full shadow-sm w-fit tracking-tight">
                                   {boardLabel} Hub
                                </Badge>
                                <h3 className="text-[18px] md:text-[clamp(15px,1.8vw,20px)] font-semibold leading-tight text-[#0F172A] group-hover:text-primary transition-colors line-clamp-2">
                                   {cat.title}
                                </h3>
                             </div>
                          </div>
                       </div>

                       <div className="mt-auto shrink-0 pt-4 md:pt-8">
                          <Button variant="ghost" className="w-full h-12 md:h-14 lg:h-16 rounded-full bg-[#0F172A] text-white group-hover:bg-primary transition-all font-bold text-[15px] tracking-tight gap-2 shadow-md border-none active:scale-95">
                             Open
                             <ChevronRight className="h-3.5 w-3.5 md:h-4 md:w-4" />
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
