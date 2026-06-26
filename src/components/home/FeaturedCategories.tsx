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
 * @fileOverview High-Density Category Explorer v125.2.
 * RESPONSIVE: Increased container width to max-w-[1440px] and gap density.
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
    <section className="py-10 md:py-24 bg-white border-t border-slate-50 overflow-x-hidden">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 space-y-8 md:space-y-16 text-left">
        <div className="space-y-2 px-1">
           <div className="flex items-center gap-3">
              <div className="h-8 w-8 bg-primary/10 rounded-lg flex items-center justify-center text-primary shadow-inner"><Layers className="h-5 w-5" /></div>
              <h2 className="text-xl md:text-5xl font-black text-[#0F172A] tracking-tight leading-none uppercase">Choose Category</h2>
           </div>
           <p className="text-slate-500 font-medium text-sm md:text-2xl max-w-2xl">Select your recruitment category to explore verified exams and preparation hubs.</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-10">
          {catLoading ? (
            Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-64 md:h-96 w-full rounded-[2rem] bg-slate-50" />)
          ) : categories.map((cat, idx) => {
            const catBoards = boards?.filter(b => b.categoryId === cat.id) || [];
            const boardLabel = catBoards.length > 0 ? catBoards[0].abbreviation : "Official";
            
            return (
              <motion.div 
                key={cat.id} 
                initial={{ opacity: 0, y: 20 }} 
                whileInView={{ opacity: 1, y: 0 }} 
                whileHover={{ y: -6 }}
                whileTap={{ scale: 0.98 }}
                viewport={{ once: true }} 
                transition={{ duration: 0.4, delay: idx * 0.05 }}
                className="h-full"
              >
                 <Link href={`/exams/category/${cat.id}`} className="h-full block">
                    <Card className="border border-slate-100 shadow-sm hover:shadow-3xl transition-all duration-700 rounded-[2rem] md:rounded-[3.5rem] bg-white group overflow-hidden flex flex-col p-5 md:p-14 h-full relative">
                       
                       <div className="space-y-4 mb-6 md:mb-10">
                          <div className="h-14 w-14 md:h-24 md:w-24 bg-slate-50 rounded-2xl md:rounded-[2.5rem] flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform duration-700 overflow-hidden">
                             <AuthorityLogo category={cat} size="lg" className="h-full w-full p-2" />
                          </div>
                          <Badge className="bg-primary/5 text-primary border-none font-black text-[8px] md:text-[11px] px-4 py-1.5 rounded-full shadow-sm w-fit uppercase tracking-widest">
                             {boardLabel} HUB
                          </Badge>
                       </div>
                       
                       <div className="space-y-2 md:space-y-4 flex-1">
                          <h3 className="text-lg md:text-3xl font-black text-[#0F172A] leading-tight line-clamp-2 uppercase tracking-tight">{cat.title}</h3>
                          <p className="text-xs md:text-lg text-slate-400 line-clamp-2 leading-relaxed font-medium">
                            {cat.description || "Browse official government recruitment and preparation series."}
                          </p>
                       </div>

                       <div className="mt-10 md:mt-20 pt-6 border-t border-slate-50">
                          <Button variant="ghost" className="w-full h-11 md:h-16 rounded-xl md:rounded-2xl bg-[#0F172A] text-white group-hover:bg-primary transition-all font-black text-[9px] md:text-[12px] tracking-[0.2em] gap-3 shadow-xl uppercase border-none">
                             Enter Hub <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
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
