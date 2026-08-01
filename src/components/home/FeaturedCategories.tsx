'use client';

import React, { useMemo } from 'react';
import { useCollection, useFirestore } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { Layers, ChevronRight, BookOpen, Zap } from 'lucide-react';
import { Card } from '@/components/ui/card';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import { AuthorityLogo } from '@/lib/exam-icons';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

/**
 * @fileOverview Compact Institutional Categories Hub v45.0.
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
    return rawCategories.filter(c => TARGET_IDS.includes(c.id)).slice(0, 4);
  }, [rawCategories]);

  return (
    <section className="py-10 md:py-16 bg-background border-t border-border">
      <div className="max-w-[1440px] 2xl:max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-3">
             <div className="h-9 w-9 md:h-11 md:w-11 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-inner shrink-0">
               <Layers className="h-4 w-4 md:h-5 md:w-5" />
             </div>
             <div className="text-left">
                <h2 className="text-xl md:text-2xl font-black text-foreground tracking-tight uppercase">Quick categories</h2>
                <p className="text-[10px] md:text-xs font-medium text-muted-foreground uppercase">Target your vertical</p>
             </div>
          </div>
          <Link href="/exams" className="text-primary font-bold text-[10px] md:text-xs flex items-center gap-1 hover:underline group">
            View all <ChevronRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {loading ? (
             Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-40 w-full rounded-2xl bg-muted border border-border" />)
          ) : categories.map((cat, idx) => (
             <motion.div 
               key={cat.id}
               initial={{ opacity: 0, y: 10 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true }}
               transition={{ delay: idx * 0.05 }}
             >
                <Link href={`/exams/category/${cat.id}`}>
                  <Card className="border border-border shadow-sm hover:shadow-2xl transition-all duration-500 rounded-2xl bg-card p-5 md:p-6 flex flex-col group h-full relative overflow-hidden text-left border-none">
                     <div className="flex justify-between items-start mb-6">
                        <AuthorityLogo category={cat} size="sm" className="h-10 w-10 md:h-12 md:w-12 rounded-xl" />
                        <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center text-muted-foreground group-hover:bg-primary group-hover:text-white transition-all shadow-sm">
                           <ChevronRight className="h-4 w-4" />
                        </div>
                     </div>

                     <div className="flex-1 space-y-3 text-left">
                        <h3 className="text-base md:text-lg font-bold text-foreground group-hover:text-primary transition-colors leading-tight line-clamp-2 uppercase">
                           {cat.title}
                        </h3>
                        
                        <div className="flex flex-wrap gap-1.5">
                           <MiniBadge icon={Zap} label="Tests" color="text-blue-600 bg-blue-50 dark:bg-blue-900/20" />
                           <MiniBadge icon={BookOpen} label="Notes" color="text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20" />
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
      <div className={cn("px-2 py-0.5 rounded-lg flex items-center gap-1 font-semibold text-[8px] tracking-tight uppercase", color)}>
         <Icon className="h-2.5 w-2.5" />
         {label}
      </div>
   )
}
