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
 * @fileOverview High-Density Category Explorer v124.0 (Performance Optimized).
 * OPTIMIZATION: Removed heavy collection fetches for mocks/exams/pyqs to resolve memory pressure.
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
      <div className="container mx-auto px-4 max-get-7xl space-y-6 md:space-y-12 text-left">
        <div className="space-y-1 px-1">
           <h2 className="text-xl md:text-4xl font-black text-[#0F172A] tracking-tight leading-none">Choose Category</h2>
           <p className="text-slate-500 font-medium text-[11px] md:text-lg">Select your recruitment category to see exams</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-8">
          {catLoading ? (
            Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-48 md:h-64 w-full rounded-2xl bg-slate-50" />)
          ) : categories.map((cat, idx) => {
            const catBoards = boards?.filter(b => b.categoryId === cat.id) || [];
            const boardLabel = catBoards.length > 0 ? catBoards[0].abbreviation : "Official";
            
            return (
              <motion.div 
                key={cat.id} 
                initial={{ opacity: 0, y: 15 }} 
                whileInView={{ opacity: 1, y: 0 }} 
                whileHover={{ y: -4 }}
                whileTap={{ scale: 0.97 }}
                viewport={{ once: true }} 
                transition={{ duration: 0.3 }}
              >
                 <Link href={`/exams/category/${cat.id}`}>
                    <Card className="border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-500 rounded-[1.5rem] bg-white group overflow-hidden flex flex-col p-3 md:p-8 h-full min-h-[220px] relative">
                       
                       <div className="space-y-2 mb-3">
                          <div className="h-10 w-10 md:h-16 md:w-16 bg-slate-50 rounded-xl flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform overflow-hidden">
                             <AuthorityLogo category={cat} size="md" className="scale-125" />
                          </div>
                          <Badge className="bg-primary/5 text-primary border-none font-black text-[7px] md:text-[9px] uppercase px-2 py-0.5 rounded shadow-sm w-fit">
                             {boardLabel} HUB
                          </Badge>
                       </div>
                       
                       <div className="space-y-1 flex-1">
                          <h3 className="text-sm md:text-2xl font-black text-[#0F172A] leading-tight line-clamp-2">{cat.title}</h3>
                          <p className="text-[10px] md:text-sm text-slate-400 line-clamp-2 leading-snug font-medium mt-1">
                            {cat.description || "Official government recruitment hub."}
                          </p>
                       </div>

                       <div className="mt-6 md:mt-10 pt-4 border-t border-slate-50">
                          <Button variant="ghost" className="w-full h-8 md:h-12 rounded-lg md:rounded-xl bg-[#0F172A] text-white group-hover:bg-primary transition-all font-black text-[8px] md:text-[10px] tracking-widest uppercase border-none gap-2 shadow-md">
                             Open Hub <ArrowRight className="h-3 w-3" />
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