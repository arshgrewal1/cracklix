"use client"

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Landmark, ArrowRight, GraduationCap, Zap, Building2, HeartPulse, Scale, Globe, ShieldCheck } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useCollection, useFirestore } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';

/**
 * @fileOverview Strictly Filtered 7-Category Hub v81.0.
 * ENFORCED: Whitelist filter ensures only the 7 authorized categories are displayed.
 * FIXED: Standardized button text to "View Exams" (Title Case).
 */

const AUTHORIZED_CATEGORY_IDS = [
  "punjab-government-exams",
  "punjab-teaching-exams",
  "punjab-technical-exams",
  "banking-exams",
  "medical-health-exams",
  "judiciary-exams",
  "central-government-exams"
];

const CATEGORY_ICONS: Record<string, any> = {
  "Punjab Government Exams": <Landmark className="h-6 w-6" />,
  "Punjab Teaching Exams": <GraduationCap className="h-6 w-6" />,
  "Punjab Technical Exams": <Zap className="h-6 w-6" />,
  "Banking Exams": <Building2 className="h-6 w-6" />,
  "Medical & Health Exams": <HeartPulse className="h-6 w-6" />,
  "Judiciary Exams": <Scale className="h-6 w-6" />,
  "Central Government Exams": <Globe className="h-6 w-6" />
};

export default function FeaturedCategories() {
  const db = useFirestore();
  const catQuery = useMemo(() => (db ? query(collection(db, "categories"), orderBy("displayOrder", "asc")) : null), [db]);
  const { data: rawCategories, loading: catLoading } = useCollection<any>(catQuery);
  const { data: exams } = useCollection<any>(useMemo(() => (db ? collection(db, "exams") : null), [db]));

  const categories = useMemo(() => {
     if (!rawCategories) return [];
     // Hard-coded whitelist filter to prevent ghost/legacy categories (like PPSC/PSSSB) from appearing on home
     return rawCategories.filter(c => AUTHORIZED_CATEGORY_IDS.includes(c.id));
  }, [rawCategories]);

  return (
    <section className="py-16 bg-white border-t border-slate-50">
      <div className="container mx-auto px-4 max-w-7xl space-y-12 text-left">
        <div className="space-y-2">
           <h2 className="text-3xl md:text-5xl font-black text-[#0F172A] leading-tight tracking-tight">Choose Your Exam</h2>
           <p className="text-slate-500 font-medium text-sm md:text-lg">Select an official category to start your preparation journey.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {catLoading ? (
            Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-64 w-full rounded-[2rem] bg-slate-50" />)
          ) : categories.map((cat, idx) => {
            const categoryExamsCount = exams?.filter(e => e.categoryId === cat.id).length || 0;
            return (
              <motion.div key={cat.id} initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: idx * 0.05 }}>
                 <Link href={`/exams/category/${cat.id}`}>
                    <Card className="border border-[#E5E7EB] shadow-sm hover:shadow-xl transition-all duration-500 rounded-[2rem] bg-white group overflow-hidden flex flex-col p-6 h-full">
                       <div className="mb-6">
                          <div className="h-12 w-12 rounded-xl bg-slate-50 flex items-center justify-center shadow-inner text-primary shrink-0 transition-transform group-hover:scale-110">
                             {CATEGORY_ICONS[cat.title] || <ShieldCheck className="h-6 w-6" />}
                          </div>
                       </div>
                       
                       <div className="space-y-2 flex-1">
                          <h3 className="text-xl font-black text-[#0F172A] group-hover:text-primary transition-colors leading-tight">{cat.title}</h3>
                          <p className="text-[13px] text-slate-500 font-medium leading-relaxed line-clamp-2">{cat.description}</p>
                       </div>

                       <div className="mt-8 pt-4 border-t border-slate-50 flex items-center justify-between">
                          <div className="flex flex-col">
                             <span className="text-[10px] font-black text-[#0F172A] uppercase leading-none">{categoryExamsCount}</span>
                             <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Exams Live</span>
                          </div>
                          <Button variant="ghost" className="h-10 px-6 rounded-xl bg-[#0F172A] text-white group-hover:bg-primary transition-all font-bold text-[10px] tracking-widest uppercase border-none shadow-md">
                             View Exams <ArrowRight className="ml-2 h-3.5 w-3.5" />
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
