
'use client';

import React, { useMemo } from 'react';
import { useCollection, useFirestore } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { Layers, ChevronRight, BookOpen, Zap } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import { AuthorityLogo } from '@/lib/exam-icons';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

/**
 * @fileOverview Filtered Institutional Categories Hub v40.0.
 */

const TARGET_IDS = [
  "punjab-government-exams",
  "punjab-teaching-exams",
  "punjab-police-exams",
  "banking-exams"
];

export default function FeaturedCategories() {
  const db = useFirestore();
  
  const { data: rawCategories, loading } = useCollection<any>(
    useMemo(() => (db ? query(collection(db, "categories"), orderBy("displayOrder", "asc")) : null), [db])
  );

  const categories = useMemo(() => {
    if (!rawCategories) return [];
    // Show target IDs first, then sort by display order
    return rawCategories.filter(c => TARGET_IDS.includes(c.id)).slice(0, 4);
  }, [rawCategories]);

  return (
    <section className="py-10 md:py-16 bg-slate-50/50 border-t border-slate-100">
      <div className="max-w-[1440px] 2xl:max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-4">
             <div className="h-10 w-10 md:h-12 md:w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-inner shrink-0">
               <Layers className="h-5 w-5 md:h-6 md:w-6" />
             </div>
             <div className="text-left">
                <h2 className="text-xl md:text-3xl font-black text-[#0F172A] tracking-tight">Quick Categories</h2>
                <p className="text-[11px] md:text-sm font-medium text-slate-500">Find tests by your target recruitment vertical.</p>
             </div>
          </div>
          <Link href="/exams" className="text-primary font-bold text-xs md:text-sm flex items-center gap-1 hover:underline">
            View All <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
          {loading ? (
             Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-48 w-full rounded-[2rem] bg-white border border-slate-100" />)
          ) : categories.map((cat, idx) => (
             <motion.div 
               key={cat.id}
               initial={{ opacity: 0, y: 15 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true }}
               transition={{ delay: idx * 0.05 }}
             >
                <Link href={`/exams/category/${cat.id}`}>
                  <Card className="border border-slate-100 shadow-sm hover:shadow-2xl transition-all duration-500 rounded-[2rem] bg-white p-6 md:p-10 flex flex-col group h-full relative overflow-hidden">
                     <div className="flex justify-between items-start mb-8">
                        <AuthorityLogo category={cat} size="md" className="shadow-inner bg-slate-50" />
                        <div className="h-10 w-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-primary group-hover:text-white transition-all">
                           <ChevronRight className="h-5 w-5" />
                        </div>
                     </div>

                     <div className="flex-1 space-y-4">
                        <h3 className="text-lg md:text-2xl font-black text-[#0F172A] group-hover:text-primary transition-colors leading-tight">
                           {cat.title}
                        </h3>
                        
                        <div className="flex flex-wrap gap-2">
                           <MiniBadge icon={Zap} label="Tests" color="text-blue-600 bg-blue-50" />
                           <MiniBadge icon={BookOpen} label="Notes" color="text-indigo-600 bg-indigo-50" />
                        </div>
                     </div>
                  </Card>
                </Link>
             </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function MiniBadge({ icon: Icon, label, color }: any) {
   return (
      <div className={cn("px-2.5 py-1 rounded-lg flex items-center gap-1.5 font-bold text-[9px] uppercase tracking-tight", color)}>
         <Icon className="h-3 w-3" />
         {label}
      </div>
   )
}
