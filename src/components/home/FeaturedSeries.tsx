'use client';

import React, { useMemo } from 'react';
import { useCollection, useFirestore, useUser } from '@/firebase';
import { collection, query, where, limit } from 'firebase/firestore';
import { Layers, ChevronRight, Zap, ArrowRight, Star, BookOpen } from 'lucide-react';
import { Card } from '@/components/ui/card';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import { AuthorityLogo } from '@/lib/exam-icons';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

/**
 * @fileOverview High-Fidelity Featured Series Hub v1.1.
 * Displays entire series nodes (not just individual tests) on the Home Page.
 * UPDATED: Strictly limited to 3 visible items on the home screen for optimal scannability.
 */

export default function FeaturedSeries() {
  const db = useFirestore();
  const { user } = useUser();
  
  // 1. Fetch featured series nodes (Fetch up to 10 to ensure pool, but only show 3)
  const seriesQuery = useMemo(() => {
    if (!db) return null;
    return query(
      collection(db, "test_series"),
      where("isActive", "==", true),
      where("isFeatured", "==", true),
      limit(10)
    );
  }, [db]);

  // 2. Fetch all mocks to calculate series-wide stats
  const mocksQuery = useMemo(() => {
    if (!db) return null;
    return query(collection(db, "mocks"), where("published", "==", true));
  }, [db]);

  const { data: series, loading: serLoading } = useCollection<any>(seriesQuery);
  const { data: mocks } = useCollection<any>(mocksQuery);

  const processedSeries = useMemo(() => {
    if (!series || !mocks) return [];
    return series.map(ser => {
      const tests = mocks.filter(m => m.seriesId === ser.id);
      return {
        ...ser,
        testCount: tests.length,
        questionCount: tests.reduce((acc, m) => acc + (Number(m.totalQuestions) || 0), 0)
      };
    });
  }, [series, mocks]);

  if (!serLoading && processedSeries.length === 0) return null;

  return (
    <section className="py-8 md:py-14 bg-background border-t border-slate-50">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        <div className="flex items-center justify-between px-2 text-left">
          <div className="flex items-center gap-3">
             <div className="h-8 w-8 md:h-10 md:w-10 rounded-xl bg-[#1677FF]/5 flex items-center justify-center text-[#1677FF] shadow-inner shrink-0">
               <Star className="h-4 w-4 md:h-5 md:w-5 fill-current" />
             </div>
             <div className="text-left min-w-0">
                <h2 className="text-lg md:text-2xl font-[800] text-[#071B4D] tracking-tight truncate">Featured series</h2>
                <p className="text-[10px] md:text-xs font-medium text-slate-400 truncate">Hand-picked by mentors</p>
             </div>
          </div>
          <Link href="/mocks" className="text-primary font-bold text-[10px] md:text-xs flex items-center gap-1 hover:underline group shrink-0">
            View all series <ChevronRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
           {serLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-44 w-full rounded-[24px] bg-slate-50" />
              ))
           ) : processedSeries.slice(0, 3).map((ser, idx) => (
              <motion.div 
                key={ser.id}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.05 }}
              >
                 <Link href={`/subjects/${ser.subjectId}/series/${ser.id}`}>
                    <Card className="border border-[#E5EAF2] shadow-sm hover:shadow-2xl hover:translate-y-[-4px] transition-all duration-500 rounded-[24px] bg-white p-6 md:p-8 flex flex-col group h-full relative overflow-hidden text-left">
                       
                       <div className="flex justify-between items-start mb-6">
                          <AuthorityLogo 
                            boardId={ser.boardId || "GENERAL"} 
                            size="sm" 
                            className="h-10 w-10 md:h-12 md:w-12 shadow-md border-2 border-white bg-slate-50" 
                          />
                          <div className="flex flex-col items-end gap-1">
                             <Badge className="bg-primary/10 text-primary border-none text-[7px] font-black uppercase px-2 py-0.5 rounded shadow-sm">Verified Hub</Badge>
                             {ser.accessLevel === 'PREMIUM' && (
                                <Badge className="bg-amber-50 text-amber-600 border-none text-[7px] font-black uppercase px-2 py-0.5 rounded shadow-sm">Elite</Badge>
                             )}
                          </div>
                       </div>

                       <div className="flex-1 space-y-2 min-w-0">
                          <h3 className="text-base md:text-xl font-[800] text-[#071B4D] group-hover:text-primary transition-colors leading-tight line-clamp-2">
                             {ser.title}
                          </h3>
                          <p className="text-[11px] md:text-[13px] text-slate-400 font-medium line-clamp-1 opacity-80 uppercase tracking-tight">
                             Full series • {ser.difficulty} Level
                          </p>
                          
                          <div className="flex items-center gap-6 pt-4 border-t border-slate-50 mt-4">
                             <div className="flex flex-col">
                                <span className="text-lg md:text-2xl font-black text-[#071B4D] tabular-nums leading-none">{ser.testCount}</span>
                                <span className="text-[8px] font-bold text-slate-400 uppercase mt-1">Tests</span>
                             </div>
                             <div className="w-px h-8 bg-slate-100" />
                             <div className="flex flex-col">
                                <span className="text-lg md:text-2xl font-black text-[#1677FF] tabular-nums leading-none">{ser.questionCount}</span>
                                <span className="text-[8px] font-bold text-slate-400 uppercase mt-1">Questions</span>
                             </div>
                          </div>
                       </div>

                       <div className="mt-8 pt-2">
                          <Button className="w-full h-11 md:h-13 bg-[#0F172A] hover:bg-black text-white font-bold text-[11px] rounded-xl transition-all active:scale-95 border-none shadow-xl gap-2">
                             Open full series <ChevronRight className="h-4 w-4" />
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
