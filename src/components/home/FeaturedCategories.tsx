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
 * @fileOverview Institutional Category Hub v31.0 - Alignment Hardened.
 * FIXED: Standardized mt-auto on action buttons for perfect horizontal rhythm.
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
    <section className="py-8 md:py-24 bg-white border-t border-slate-50">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 space-y-5 md:space-y-16">
        
        <div className="space-y-1 md:space-y-2">
          <div className="flex items-center gap-2">
             <div className="h-6 w-6 md:h-10 md:w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary shadow-inner shrink-0">
               <Layers className="h-3.5 w-3.5 md:h-6 md:w-6" />
             </div>
             <h2 className="text-[24px] md:text-5xl font-black tracking-tight leading-none text-[#0F172A]">Choose Category</h2>
          </div>
          <p className="max-w-2xl text-[13px] md:text-xl text-slate-500 font-medium">Select your recruitment category to explore verified preparation hubs.</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-8 lg:gap-10">
          {catLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <Skeleton 
                key={i} 
                className="h-[260px] md:h-[400px] w-full rounded-xl md:rounded-[3rem] bg-slate-50" 
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
                className="flex flex-col"
              >
                 <Link href={`/exams/category/${cat.id}`} className="h-full block">
                    <Card className="border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-500 rounded-2xl md:rounded-[3rem] bg-white group overflow-hidden flex flex-col p-4 md:p-10 h-[260px] md:h-[400px]">
                       <div className="flex-1 flex flex-col justify-start">
                          <div className="space-y-2 md:space-y-3">
                             <div className="h-10 w-10 md:h-24 md:w-24 bg-slate-50 rounded-xl md:rounded-3xl flex items-center justify-center shadow-inner overflow-hidden shrink-0">
                                <AuthorityLogo category={cat} size="sm" className="h-full w-full p-1 md:p-4" />
                             </div>
                             <Badge className="bg-primary/5 text-primary border-none font-bold text-[9px] md:text-[13px] px-2 py-0.5 rounded-full shadow-sm w-fit tracking-tight">
                                {boardLabel} Hub
                             </Badge>
                             <h3 className="text-[14px] md:text-2xl font-black leading-tight text-[#0F172A] group-hover:text-primary transition-colors">
                                {cat.title}
                             </h3>
                          </div>
                       </div>

                       <div className="mt-auto shrink-0 pt-2 md:pt-4">
                          <Button variant="ghost" className="w-full h-10 md:h-14 rounded-full bg-[#0F172A] text-white group-hover:bg-primary transition-all font-semibold text-[12px] md:text-base gap-2 shadow-md border-none active:scale-95">
                             Open Hub
                             <ChevronRight className="h-3 w-3" />
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
