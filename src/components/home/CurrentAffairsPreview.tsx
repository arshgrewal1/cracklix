'use client';

import React, { useMemo } from 'react';
import { useCollection, useFirestore } from '@/firebase';
import { collection, query, where, limit } from 'firebase/firestore';
import { Calendar, ChevronRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import { AuthorityLogo } from '@/lib/exam-icons';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

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
    <section className="py-10 md:py-24 bg-slate-50/50 border-t border-slate-100">
      <div className="max-w-[1440px] 2xl:max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 space-y-6 md:space-y-16">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-3 text-left px-1">
           <div className="space-y-2">
              <div className="flex items-center gap-3 md:gap-4">
                 <div className="h-8 w-8 md:h-12 md:w-12 rounded-xl bg-blue-50 flex items-center justify-center text-primary shadow-inner shrink-0">
                    <AuthorityLogo boardId="current-affairs" size="sm" className="bg-transparent shadow-none p-0" />
                 </div>
                 <h2 className="text-[clamp(24px,4vw,40px)] font-black tracking-tight leading-none text-[#0F172A]">Current Affairs</h2>
              </div>
              <p className="max-w-2xl text-[clamp(13px,1.5vw,18px)] font-medium text-slate-500">Daily verified updates curated for all Punjab recruitment boards.</p>
           </div>
           <Link href="/current-affairs" className="text-primary font-bold text-[13px] md:text-base tracking-tight hover:underline flex items-center gap-2 group shrink-0">
              View All Updates <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
           </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-8 lg:gap-10">
           {loading ? (
              Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-[220px] md:h-[420px] w-full rounded-2xl md:rounded-[3rem] bg-white border border-slate-50" />)
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
                    <Card className="border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-500 rounded-2xl md:rounded-[3rem] bg-white p-4 md:p-10 lg:p-12 h-full flex flex-col group min-h-[220px] md:min-h-[420px] relative overflow-hidden">
                       
                       <div className="flex justify-center mb-4 md:mb-12 shrink-0">
                          <div className="h-10 w-10 md:h-24 md:w-24 bg-slate-50 rounded-xl md:rounded-3xl shadow-inner group-hover:scale-110 transition-transform overflow-hidden flex items-center justify-center p-1.5 md:p-4">
                              <AuthorityLogo boardId="current-affairs" size="sm" className="h-full w-full opacity-80" />
                          </div>
                       </div>

                       <div className="flex-1 flex flex-col justify-start text-center min-w-0">
                          <h3 className="text-[clamp(14px,1.7vw,24px)] font-black leading-tight tracking-tight line-clamp-2 text-[#0F172A] group-hover:text-primary transition-colors mb-3 md:mb-8">
                             {item.title}
                          </h3>
                          
                          <div className="mt-auto md:mt-0 space-y-3 md:space-y-5">
                             <div className="flex flex-wrap items-center justify-center gap-3 md:gap-8 text-[clamp(8px,1vw,12px)] font-bold text-slate-400 tracking-tight">
                                <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5 md:h-5 md:w-5 text-primary" /> {item.month}</span>
                                <span className="flex items-center gap-1.5">Bilingual</span>
                             </div>
                          </div>
                       </div>

                       <div className="mt-auto pt-5 md:pt-10 shrink-0">
                          <Button variant="ghost" className="w-full h-11 md:h-16 lg:h-18 rounded-full bg-[#0F172A] text-white group-hover:bg-primary transition-all font-bold text-[clamp(10px,1.1vw,14px)] tracking-tight shadow-lg border-none active:scale-95 gap-2 md:gap-3">
                             Start Test
                             <ChevronRight className="h-4 w-4 md:h-5 md:w-5" />
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
