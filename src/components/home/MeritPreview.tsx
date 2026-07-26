
'use client';

import React, { useMemo } from 'react';
import { useCollection, useFirestore, useDoc } from '@/firebase';
import { collection, query, limit, doc, orderBy } from 'firebase/firestore';
import { Trophy, ChevronRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import StudentAvatar from '@/components/brand/StudentAvatar';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { motion } from 'framer-motion';

/**
 * @fileOverview Standardized Institutional Merit Preview v3.2 [Registry Hardened].
 * UPDATED: Consuming dedicated 'leaderboard' collection for highest-score fidelity.
 */

export default function MeritPreview() {
  const db = useFirestore();
  
  const statsRef = useMemo(() => (db ? doc(db, "settings", "stats") : null), [db]);
  const { data: stats } = useDoc<any>(statsRef);

  const meritQuery = useMemo(() => {
    if (!db) return null;
    return query(
      collection(db, "leaderboard"), 
      orderBy("highestScore", "desc"), 
      limit(8)
    );
  }, [db]);

  const { data: meritList, loading } = useCollection<any>(meritQuery);

  return (
    <section className="py-12 md:py-20 bg-slate-50/50 border-t border-slate-100 overflow-hidden">
      <div className="max-w-[1440px] 2xl:max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 text-left space-y-10">
        
        {/* Standardized Header */}
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-4">
             <div className="h-10 w-10 md:h-12 md:w-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-500 shadow-inner shrink-0">
               <Trophy className="h-5 w-5 md:h-6 md:w-6 fill-current" />
             </div>
             <div className="text-left">
                <h2 className="text-xl md:text-3xl font-black text-[#0F172A] tracking-tight">Top Rankers</h2>
                <p className="text-[11px] md:text-sm font-medium text-slate-500">Live merit list of peak performing aspirants.</p>
             </div>
          </div>
          <Link href="/leaderboard" className="text-primary font-bold text-xs md:text-sm flex items-center gap-1 hover:underline group">
            View all <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8 lg:gap-10">
           {loading ? (
              Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-48 md:h-80 w-full rounded-[2rem] bg-white border border-slate-100" />)
           ) : meritList?.map((res, i) => (
              <motion.div 
                key={res.uid}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                className="flex flex-col h-full"
              >
                 <Link href="/leaderboard" className="h-full block">
                    <Card className="border border-slate-100 shadow-sm hover:shadow-4xl transition-all duration-500 group overflow-hidden bg-white p-4 md:p-8 flex flex-col justify-center rounded-[2rem] md:rounded-[3rem] h-full text-center">
                       <div className="flex flex-col items-center space-y-4 md:space-y-6">
                          <div className="relative shrink-0">
                             <StudentAvatar profile={{ name: res.displayName, photoURL: res.photoURL, gender: res.gender }} className="h-16 w-16 md:h-24 md:w-24 rounded-2xl md:rounded-[2rem] border border-slate-50 shadow-inner group-hover:scale-105 transition-transform" />
                             <div className={cn(
                                "absolute -bottom-2 -right-2 h-7 w-7 md:h-10 md:w-10 rounded-xl flex items-center justify-center text-white text-[11px] md:text-sm font-black shadow-xl border-4 border-white transition-all",
                                i === 0 ? "bg-amber-400" : i === 1 ? "bg-slate-300" : "bg-orange-400"
                             )}>
                                #{i + 1}
                             </div>
                          </div>
                          <div className="min-w-0 w-full space-y-1">
                             <p className="font-bold text-sm md:text-lg text-[#0F172A] leading-tight tracking-tight truncate px-2">{res.displayName}</p>
                             <p className="text-[10px] md:text-xs font-bold text-primary tabular-nums tracking-tighter uppercase">Peak: {(Number(res.highestScore) || 0).toFixed(1)}</p>
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
