'use client';

import React, { useMemo } from 'react';
import { useCollection, useFirestore } from '@/firebase';
import { collection, query, where, limit } from 'firebase/firestore';
import { Calendar, ChevronRight, Newspaper } from 'lucide-react';
import { Card } from '@/components/ui/card';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import { AuthorityLogo } from '@/lib/exam-icons';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

/**
 * @fileOverview Standardized Current Affairs Preview v24.0 [Uppercase Removed].
 */
export default function CurrentAffairsPreview() {
  const db = useFirestore();
  
  const hubQuery = useMemo(() => {
    if (!db) return null;
    return query(
      collection(db, "current_affairs_hub"), 
      where("status", "==", "PUBLISHED"),
      limit(4)
    );
  }, [db]);

  const { data: items, loading } = useCollection<any>(hubQuery);

  return (
    <section className="py-12 md:py-20 bg-slate-50/50 border-t border-slate-100">
      <div className="max-w-[1440px] 2xl:max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Standardized Header */}
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-4">
             <div className="h-10 w-10 md:h-12 md:w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-inner shrink-0">
               <Newspaper className="h-5 w-5 md:h-6 md:w-6" />
             </div>
             <div className="text-left">
                <h2 className="text-xl md:text-3xl font-black text-[#0F172A] tracking-tight">Current affairs</h2>
                <p className="text-[11px] md:text-sm font-medium text-slate-500">Stay updated with daily verified news.</p>
             </div>
          </div>
          <Link href="/current-affairs" className="text-primary font-bold text-xs md:text-sm flex items-center gap-1 hover:underline group">
            View all <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8 lg:gap-10">
           {loading ? (
              Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-[230px] md:h-[400px] w-full rounded-[24px] md:rounded-[3rem] bg-white border border-slate-100" />)
           ) : items?.map((item, idx) => (
              <motion.div 
                key={item.id}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.05 }}
                className="flex flex-col h-full"
              >
                 <Link href="/current-affairs" className="h-full block">
                    <Card className="border border-slate-100 shadow-sm hover:shadow-4xl transition-all duration-500 rounded-[24px] md:rounded-[3rem] bg-white p-4 md:p-8 flex flex-col group h-full relative overflow-hidden flex-1">
                       
                       <div className="flex justify-center mb-4 md:mb-10 shrink-0">
                          <AuthorityLogo boardId="current-affairs" size="md" className="p-0 shadow-lg" />
                       </div>

                       <div className="flex-1 flex flex-col justify-start text-center min-w-0">
                          <h3 className="text-[15px] md:text-lg font-bold leading-tight tracking-tight line-clamp-2 text-[#0F172A] group-hover:text-primary transition-colors mb-2 md:mb-6">
                             {item.title}
                          </h3>
                          
                          <div className="mt-auto md:mt-0 space-y-2 md:space-y-4">
                             <div className="flex items-center justify-center gap-2 md:gap-4 text-[11px] md:text-[13px] font-bold text-slate-400 tracking-tight">
                                <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5 md:h-4 md:w-4 text-primary" /> {item.month}</span>
                                <span className="h-1 w-1 rounded-full bg-slate-200" />
                                <span>Bilingual</span>
                             </div>
                          </div>
                       </div>

                       <div className="mt-auto pt-4 md:pt-8 shrink-0">
                          <Button variant="ghost" className="w-full h-11 md:h-12 rounded-full bg-[#0F172A] text-white group-hover:bg-primary transition-all font-bold text-[12px] md:text-[13px] tracking-tight shadow-lg border-none active:scale-95 gap-2">
                             Start test
                             <ChevronRight className="h-4 w-4" />
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
