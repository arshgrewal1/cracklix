'use client';

import React, { useMemo } from 'react';
import { useCollection, useFirestore } from '@/firebase';
import { collection, query, where, limit } from 'firebase/firestore';
import { Calendar, ChevronRight, Newspaper, ArrowRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import { AuthorityLogo } from '@/lib/exam-icons';
import { motion } from 'framer-motion';

/**
 * @fileOverview High-Density Current Affairs Preview v26.0.
 * COMPACT: Limited to 2 items on Home Page. Reduced padding and radii.
 */
export default function CurrentAffairsPreview() {
  const db = useFirestore();
  
  const hubQuery = useMemo(() => {
    if (!db) return null;
    return query(
      collection(db, "current_affairs_hub"), 
      where("status", "==", "PUBLISHED"),
      limit(2)
    );
  }, [db]);

  const { data: items, loading } = useCollection<any>(hubQuery);

  return (
    <section className="py-10 md:py-16 bg-slate-50/50 border-t border-border">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-3">
             <div className="h-8 w-8 md:h-10 md:w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-inner shrink-0">
               <Newspaper className="h-4 w-4 md:h-5 md:w-5" />
             </div>
             <div className="text-left">
                <h2 className="text-lg md:text-2xl font-black text-foreground tracking-tight">Current affairs</h2>
                <p className="text-[10px] md:text-xs font-medium text-muted-foreground">Daily verified news nodes</p>
             </div>
          </div>
          <Link href="/current-affairs" className="text-primary font-bold text-[10px] md:text-xs flex items-center gap-1 hover:underline group">
            View all <ChevronRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-8">
           {loading ? (
              Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-40 w-full rounded-2xl bg-muted" />)
           ) : items && items.length > 0 ? items.map((item, idx) => (
              <motion.div 
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.05 }}
                className="h-full"
              >
                 <Link href="/current-affairs" className="block h-full">
                    <Card className="border border-border shadow-sm hover:shadow-xl transition-all duration-500 rounded-2xl bg-card p-4 md:p-6 flex flex-col group h-full relative overflow-hidden text-left">
                       <div className="flex justify-between items-start mb-6">
                          <AuthorityLogo boardId="current-affairs" size="sm" className="h-10 w-10 md:h-12 md:w-12 shadow-lg border-2 border-background bg-muted" />
                          <Badge variant="outline" className="bg-blue-50 dark:bg-blue-900/20 text-primary border-none text-[7px] font-black uppercase px-2 py-0.5 rounded shadow-sm">Verified Node</Badge>
                       </div>

                       <div className="flex-1 space-y-1.5 min-w-0">
                          <h3 className="text-sm md:text-lg font-bold text-foreground group-hover:text-primary transition-colors leading-tight line-clamp-1 truncate">
                             {item.title}
                          </h3>
                          <div className="flex items-center gap-3 pt-2">
                             <div className="flex items-center gap-1.5 text-[8px] md:text-[9px] font-bold text-slate-400">
                                <Calendar className="h-3 w-3 text-primary/40" /> {item.month} {item.year}
                             </div>
                          </div>
                       </div>

                       <div className="mt-6 pt-2">
                          <Button className="w-full h-10 bg-[#0F172A] hover:bg-primary text-white font-black uppercase text-[9px] tracking-widest rounded-xl transition-all active:scale-95 border-none shadow-md">
                             Attempt <ArrowRight className="h-3.5 w-3.5 ml-2" />
                          </Button>
                       </div>
                    </Card>
                 </Link>
              </motion.div>
           )) : (
              <div className="col-span-full py-12 text-center opacity-30 italic font-bold text-sm border-2 border-dashed border-border rounded-2xl">
                 Awaiting news push
              </div>
           )}
        </div>
      </div>
    </section>
  );
}