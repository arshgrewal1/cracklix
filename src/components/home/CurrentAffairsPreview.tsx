'use client';

import React, { useMemo } from 'react';
import { useCollection, useFirestore } from '@/firebase';
import { collection, query, where, limit, orderBy } from 'firebase/firestore';
import { Newspaper, Calendar, ChevronRight, Zap } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

/**
 * @fileOverview High-Density Study Preview v1.8.
 * ALIGNMENT: Standardized side margins to match Hero section.
 */
export default function CurrentAffairsPreview() {
  const db = useFirestore();
  
  const hubQuery = useMemo(() => {
    if (!db) return null;
    return query(
      collection(db, "current_affairs_hub"), 
      where("status", "==", "PUBLISHED"),
      limit(3)
    );
  }, [db]);

  const { data: items, loading } = useCollection<any>(hubQuery);

  return (
    <section className="py-8 md:py-24 bg-slate-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 md:space-y-12 text-left">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-1 px-1">
           <div className="space-y-1">
              <div className="flex items-center gap-2">
                 <div className="h-8 w-8 bg-blue-600/10 rounded-lg flex items-center justify-center text-blue-600">
                    <Newspaper className="h-4 w-4" />
                 </div>
                 <span className="text-[9px] font-bold text-slate-400 tracking-tight uppercase">Study Material</span>
              </div>
              <h2 className="text-2xl md:text-5xl font-extrabold text-[#0F172A] tracking-tight">Current Affairs</h2>
              <p className="text-slate-500 font-medium text-[11px] md:text-lg">Daily bilingual updates for state exams.</p>
           </div>
           <Link href="/current-affairs" className="text-blue-600 font-black uppercase text-[9px] md:text-xs tracking-widest hover:underline flex items-center gap-2 group">
              View All <ChevronRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
           </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8">
           {loading ? (
              Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-32 w-full rounded-2xl bg-white" />)
           ) : items?.map((item) => (
              <Link key={item.id} href="/current-affairs">
                 <Card className="border border-[#E5E7EB] shadow-sm hover:shadow-xl transition-all duration-500 rounded-[1.5rem] md:rounded-[2.5rem] bg-white group overflow-hidden h-full flex flex-col p-4 md:p-10">
                    <div className="flex justify-between items-start mb-4 md:mb-6">
                       <Badge variant="outline" className="bg-slate-50 border-slate-100 text-slate-400 text-[7px] font-bold px-1.5 py-0.5 rounded uppercase">CA Hub</Badge>
                       <span className="text-[8px] md:text-[9px] font-bold text-slate-300 tracking-tight flex items-center gap-1.5">
                          <Calendar className="h-3 w-3 text-blue-600/50" /> {item.month} {item.year}
                       </span>
                    </div>
                    <h3 className="text-sm md:text-xl font-bold text-[#0F172A] leading-tight group-hover:text-blue-600 transition-colors flex-1 mb-4">
                       {item.title}
                    </h3>
                    <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                       <span className="text-[8px] md:text-[10px] font-black text-[#0F172A] tracking-widest flex items-center gap-1.5 uppercase">
                          <Zap className="h-3 w-3 text-blue-600 fill-current" /> Read Now
                       </span>
                       <ChevronRight className="h-3 w-3 text-slate-200 group-hover:text-blue-600 transition-all" />
                    </div>
                 </Card>
              </Link>
           ))}
        </div>
      </div>
    </section>
  );
}