
'use client';

import React, { useMemo } from 'react';
import { useCollection, useFirestore } from '@/firebase';
import { collection, query, orderBy, limit } from 'firebase/firestore';
import { Layers, ChevronRight, Zap, ArrowRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import { AuthorityLogo } from '@/lib/exam-icons';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

/**
 * @fileOverview High-Density Categories Hub v51.2.
 * FIXED: Restored missing Badge import.
 * UPDATED: Removed uppercase.
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
    useMemo(() => (db ? query(collection(db, "categories"), orderBy("displayOrder", "asc"), limit(10)) : null), [db])
  );

  const categories = useMemo(() => {
    if (!rawCategories) return [];
    return rawCategories.filter(c => TARGET_IDS.includes(c.id)).slice(0, 2);
  }, [rawCategories]);

  return (
    <section className="py-8 md:py-12 bg-background border-t border-border">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        <div className="flex items-center justify-between px-1 text-left">
          <div className="flex items-center gap-3">
             <div className="h-8 w-8 md:h-10 md:w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-inner shrink-0">
               <Layers className="h-4 w-4 md:h-5 md:w-5" />
             </div>
             <div className="text-left">
                <h2 className="text-lg md:text-2xl font-black text-foreground tracking-tight">Quick categories</h2>
                <p className="text-[10px] md:text-xs font-medium text-muted-foreground">Browse exam hubs</p>
             </div>
          </div>
          <Link href="/exams" className="text-primary font-bold text-[10px] md:text-xs flex items-center gap-1 hover:underline group">
            View all <ChevronRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-8">
          {loading ? (
             Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-36 w-full rounded-2xl bg-muted" />)
          ) : categories.length > 0 ? categories.map((cat, idx) => (
             <motion.div 
               key={cat.id}
               initial={{ opacity: 0, y: 10 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true }}
               transition={{ delay: idx * 0.05 }}
               className="h-full"
             >
                <Link href={`/exams/category/${cat.id}`} className="block h-full">
                  <Card className="border border-border shadow-sm hover:shadow-xl transition-all duration-500 rounded-2xl bg-card p-4 md:p-6 flex flex-col group h-full relative overflow-hidden text-left min-h-[140px] md:min-h-[180px]">
                     <div className="flex justify-between items-start mb-4">
                        <AuthorityLogo category={cat} size="sm" className="h-10 w-10 md:h-12 md:w-12 rounded-lg shadow-sm border-2 border-background" />
                        <Badge variant="outline" className="bg-slate-50 dark:bg-slate-900 border-border text-muted-foreground text-[7px] font-bold px-2 h-5">Official hub</Badge>
                     </div>

                     <div className="flex-1 space-y-1.5 min-w-0">
                        <h3 className="text-sm md:text-lg font-bold text-foreground group-hover:text-primary transition-colors leading-tight line-clamp-1 truncate">
                           {cat.title}
                        </h3>
                        <p className="text-[10px] md:text-xs text-muted-foreground font-medium line-clamp-1 truncate opacity-60">Verified preparation vertical</p>
                     </div>

                     <div className="mt-6 pt-2">
                        <Button className="w-full h-10 bg-[#0F172A] hover:bg-primary text-white font-bold text-[10px] rounded-xl transition-all active:scale-95 border-none shadow-md">
                           Enter hub <ArrowRight className="h-3 w-3" />
                        </Button>
                     </div>
                  </Card>
                </Link>
             </motion.div>
          )) : (
            <div className="col-span-full py-8 text-center opacity-30 italic font-bold text-[11px] border-2 border-dashed border-border rounded-2xl">
               Registry standby
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
