
'use client';

import React, { useMemo } from 'react';
import { useUser, useCollection, useFirestore } from '@/firebase';
import { collection, query, where, limit, orderBy } from 'firebase/firestore';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Zap, Play, History, Trophy, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { Progress } from '@/components/ui/progress';

/**
 * @fileOverview persistence hub for active aspirants.
 * Shows recent mock attempts with a resume CTA.
 */

export default function ContinueLearning() {
  const { user, profile } = useUser();
  const db = useFirestore();

  const resultsQuery = useMemo(() => {
    if (!db || !user) return null;
    return query(collection(db, "results"), where("userId", "==", user.uid), limit(2));
  }, [db, user]);

  const { data: recentAttempts, loading } = useCollection<any>(resultsQuery);

  if (!user || loading || !recentAttempts || recentAttempts.length === 0) return null;

  return (
    <section className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <div className="flex items-center gap-3">
         <History className="h-5 w-5 text-primary" />
         <h2 className="text-xl font-headline font-black text-[#0F172A] uppercase tracking-widest">CONTINUE LEARNING</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         {recentAttempts.map((res: any) => (
            <Card key={res.id} className="border-none shadow-2xl rounded-[2.5rem] bg-[#0B1528] text-white p-8 overflow-hidden relative group">
               <div className="absolute top-0 right-0 p-8 opacity-5 rotate-12 group-hover:scale-110 transition-transform"><Trophy className="h-40 w-40" /></div>
               <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                  <div className="h-16 w-16 md:h-20 md:w-20 rounded-[1.5rem] bg-primary/20 flex items-center justify-center shrink-0 border border-primary/20 shadow-2xl">
                     <Zap className="h-8 md:h-10 text-primary fill-current" />
                  </div>
                  <div className="flex-1 space-y-4 text-center md:text-left min-w-0">
                     <div className="space-y-1">
                        <p className="text-[10px] font-black text-primary uppercase tracking-[0.4em]">RESUME REVISION</p>
                        <h3 className="text-xl md:text-2xl font-black uppercase truncate">{res.mockTitle}</h3>
                     </div>
                     <div className="space-y-2">
                        <div className="flex justify-between items-end text-[10px] font-black uppercase text-slate-400">
                           <span>Mastery Index</span>
                           <span className="text-primary">{res.accuracy}%</span>
                        </div>
                        <Progress value={res.accuracy} className="h-1 bg-white/5" />
                     </div>
                  </div>
                  <Button asChild className="h-14 px-8 bg-primary hover:bg-orange-600 text-white rounded-xl font-black uppercase text-[10px] tracking-widest gap-2 shadow-xl border-none">
                     <Link href={`/results/${res.mockId}`}>REVIEW RESULT <ArrowRight className="h-4 w-4" /></Link>
                  </Button>
               </div>
            </Card>
         ))}
      </div>
    </section>
  );
}
