"use client"

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useCollection, useFirestore } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { AuthorityLogo } from '@/lib/exam-icons';

/**
 * @fileOverview Strictly Whitelisted 7-Category Hub v110.0.
 * BRANDING: Updated to the new canonical 7-category list.
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
  const catQuery = useMemo(() => (db ? query(collection(db, "categories"), orderBy("displayOrder", "asc")) : null), [db]);
  const { data: rawCategories, loading: catLoading } = useCollection<any>(catQuery);
  const { data: exams } = useCollection<any>(useMemo(() => (db ? collection(db, "exams") : null), [db]));

  const categories = useMemo(() => {
     if (!rawCategories) return [];
     return rawCategories.filter(c => STRICT_WHITELIST.includes(c.id));
  }, [rawCategories]);

  return (
    <section className="py-16 bg-white border-t border-slate-50">
      <div className="container mx-auto px-4 max-w-7xl space-y-12 text-left">
        <div className="space-y-2">
           <h2 className="text-3xl md:text-5xl font-black text-[#0F172A] leading-tight tracking-tight">Choose Your Exam</h2>
           <p className="text-slate-500 font-medium text-sm md:text-lg">Select a category to view relevant exams and boards.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {catLoading ? (
            Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-64 w-full rounded-[2rem] bg-slate-50" />)
          ) : categories.map((cat, idx) => {
            const examsCount = exams?.filter(e => e.categoryId === cat.id).length || 0;
            return (
              <motion.div key={cat.id} initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: idx * 0.05 }}>
                 <Link href={`/exams/category/${cat.id}`}>
                    <Card className="border border-[#E5E7EB] shadow-sm hover:shadow-xl transition-all duration-500 rounded-[2rem] bg-white group overflow-hidden flex flex-col p-8 h-full">
                       <div className="mb-6">
                          <AuthorityLogo category={cat} size="lg" className="shadow-inner rounded-xl bg-slate-50 p-2" />
                       </div>
                       
                       <div className="space-y-3 flex-1">
                          <h3 className="text-2xl font-black text-[#0F172A] group-hover:text-primary transition-colors leading-tight">{cat.title}</h3>
                          <p className="text-sm text-slate-500 font-medium leading-relaxed line-clamp-2">{cat.description}</p>
                       </div>

                       <div className="mt-8 pt-6 border-t border-slate-50 flex items-center justify-between">
                          <div className="flex flex-col">
                             <span className="text-sm font-black text-[#0F172A]">{examsCount}</span>
                             <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Available Exams</span>
                          </div>
                          <Button variant="ghost" className="h-11 px-8 rounded-xl bg-[#0F172A] text-white group-hover:bg-primary transition-all font-bold text-[11px] tracking-widest uppercase border-none shadow-md gap-2">
                             View Exams <ArrowRight className="h-4 w-4" />
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
