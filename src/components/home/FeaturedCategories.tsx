'use client';

import React, { useMemo } from 'react';
import { useCollection, useFirestore } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { Layers, ChevronRight, BookOpen, Zap, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import { AuthorityLogo } from '@/lib/exam-icons';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

/**
 * @fileOverview Compact Institutional Categories Hub v47.0.
 * UPDATED: Reduced card sizes significantly and added primary CTA buttons.
 */

const TARGET_IDS = [
  "punjab-government-exams",
  "punjab-teaching-exams",
  "punjab-technical-exams",
  "banking-exams"
];

export default function FeaturedCategories() {
  const db = useFirestore();
  
  const { data: rawCategories, loading } = useCollection<any>(
    useMemo(() => (db ? query(collection(db, "categories"), orderBy("displayOrder", "asc")) : null), [db])
  );

  const categories = useMemo(() => {
    if (!rawCategories) return [];
    return rawCategories.filter(c => TARGET_IDS.includes(c.id)).slice(0, 5);
  }, [rawCategories]);

  return (
    <section className="py-10 md:py-16 bg-background border-t border-border">
      <div className="max-w-[1440px] 2xl:max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-3">
             <div className="h-8 w-8 md:h-10 md:w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-inner shrink-0">
               <Layers className="h-4 w-4 md:h-5 md:w-5" />
             </div>
             <div className="text-left">
                <h2 className="text-lg md:text-2xl font-black text-foreground tracking-tight">Quick categories</h2>
                <p className="text-[10px] md:text-xs font-medium text-muted-foreground">Target your vertical</p>
             </div>
          </div>
          <Link href="/exams" className="text-primary font-bold text-[10px] md:text-xs flex items-center gap-1 hover:underline group">
            View all <ChevronRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-6">
          {loading ? (
             Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-36 w-full rounded-2xl bg-muted" />)
          ) : categories.map((cat, idx) => (
             <motion.div 
               key={cat.id}
               initial={{ opacity: 0, y: 10 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true }}
               transition={{ delay: idx * 0.05 }}
               className="flex flex-col h-full"
             >
                <Link href={`/exams/category/${cat.id}`} className="h-full block group">
                  <Card className="border border-border shadow-sm group-hover:shadow-xl transition-all duration-500 rounded-xl bg-card p-3 md:p-5 flex flex-col group h-full relative overflow-hidden text-left border-none min-h-[160px] md:min-h-[220px]">
                     <div className="flex justify-between items-start mb-4 md:mb-6">
                        <AuthorityLogo category={cat} size="sm" className="h-9 w-9 md:h-12 md:w-12 rounded-lg" />
                     </div>

                     <div className="flex-1 space-y-2 text-left min-w-0">
                        <h3 className="text-xs md:text-base font-bold text-foreground group-hover:text-primary transition-colors leading-tight line-clamp-2">
                           {cat.title}
                        </h3>
                        
                        <div className="flex flex-wrap gap-1">
                           <MiniBadge icon={Zap} label="Tests" color="text-blue-600 bg-blue-50 dark:bg-blue-900/20" />
                        </div>
                     </div>

                     <div className="pt-4 mt-2">
                        <Button className="w-full h-8 md:h-10 bg-[#0F172A] hover:bg-primary text-white text-[9px] md:text-[10px] font-bold rounded-lg gap-2 active:scale-95 border-none transition-all">
                           Open <ArrowRight className="h-3 w-3" />
                        </Button>
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
      <div className={cn("px-1.5 py-0.5 rounded flex items-center gap-1 font-semibold text-[7px] md:text-[8px] tracking-tight", color)}>
         <Icon className="h-2 w-2" />
         {label}
      </div>
   )
}
