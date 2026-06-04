'use client';

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, BookOpen, ShieldCheck, ArrowRight, Zap } from "lucide-react";
import Link from "next/link";
import { useCollection, useFirestore } from "@/firebase";
import { collection, query, limit } from "firebase/firestore";
import { useMemo } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";

export default function LatestMocks() {
  const db = useFirestore();
  
  const mocksQuery = useMemo(() => {
    if (!db) return null;
    // Removed orderBy to prevent mandatory index errors during startup
    return query(collection(db, "mocks"), limit(20));
  }, [db]);

  const boardsQuery = useMemo(() => {
    if (!db) return null;
    return query(collection(db, "boards"));
  }, [db]);

  const { data: allMocks, loading } = useCollection<any>(mocksQuery);
  const { data: boards } = useCollection<any>(boardsQuery);

  const mocks = useMemo(() => {
    if (!allMocks) return [];
    // Handle sorting client-side for immediate performance
    return [...allMocks]
      .filter(m => m.published === true)
      .sort((a, b) => {
        const dateA = a.createdAt?.seconds || 0;
        const dateB = b.createdAt?.seconds || 0;
        return dateB - dateA;
      })
      .slice(0, 5);
  }, [allMocks]);

  return (
    <section className="py-32 bg-white">
      <div className="container mx-auto px-6 max-w-7xl text-center">
        <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-2 text-left"
          >
            <div className="flex items-center gap-3">
               <Zap className="h-5 w-5 text-primary" />
               <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Institutional Assets</span>
            </div>
            <h2 className="text-5xl font-headline font-black text-[#0F172A] uppercase tracking-tight">
              Verified <span className="text-primary">Mocks</span>
            </h2>
            <p className="text-slate-400 text-lg font-medium">Recently published high-fidelity practice series for 2026 exams.</p>
          </motion.div>
          
          <Link 
            href="/mocks" 
            className="group flex items-center gap-3 bg-slate-50 hover:bg-[#0F172A] hover:text-white px-8 py-4 rounded-2xl transition-all duration-300 shadow-sm"
          >
            <span className="font-black text-[10px] uppercase tracking-widest">Explore Repository</span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-2" />
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-8">
          {loading ? (
             Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-80 w-full rounded-[2.5rem]" />)
          ) : mocks && mocks.length > 0 ? (
            mocks.map((mock, i) => {
              const board = boards?.find(b => b.id === mock.boardId)
              return (
                <motion.div
                  key={mock.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  viewport={{ once: true }}
                  className="h-full"
                >
                  <Card className="border-none rounded-[3.5rem] bg-white shadow-2xl shadow-slate-200/40 hover:shadow-4xl hover:translate-y-[-10px] transition-all duration-500 overflow-hidden flex flex-col h-full group text-center">
                    <CardContent className="p-10 flex-1 flex flex-col items-center space-y-8">
                      <div className="h-20 w-20 rounded-[2rem] bg-[#0F172A] flex items-center justify-center relative overflow-hidden shadow-xl group-hover:scale-110 transition-transform">
                        {board?.iconUrl ? (
                          <Image src={board.iconUrl} fill alt={board.abbreviation} className="object-contain p-5" />
                        ) : (
                          <ShieldCheck className="h-8 w-8 text-primary group-hover:text-white" />
                        )}
                      </div>
                      
                      <div className="space-y-3">
                         <p className="text-[9px] font-black uppercase text-primary tracking-widest">{board?.abbreviation || 'PSSSB'}</p>
                         <h3 className="font-bold text-base text-[#0F172A] leading-tight min-h-[40px] group-hover:text-primary transition-colors px-2">
                          {mock.title}
                         </h3>
                      </div>
                      
                      <div className="flex items-center justify-center gap-6 text-[10px] text-slate-400 font-black uppercase tracking-widest pt-2">
                         <span className="flex items-center gap-2"><BookOpen className="h-3.5 w-3.5" /> {mock.totalQuestions}</span>
                         <span className="flex items-center gap-2"><Clock className="h-3.5 w-3.5" /> {mock.duration}m</span>
                      </div>

                      <Button asChild className="w-full bg-[#0B1528] text-white hover:bg-primary transition-all font-black h-12 rounded-[1.25rem] text-[9px] uppercase tracking-[0.2em] mt-auto shadow-xl group-hover:shadow-primary/20">
                        <Link href={`/mocks/${mock.id}`}>Attempt Now</Link>
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })
          ) : (
            <div className="col-span-full py-20 text-center opacity-20">
               <BookOpen className="h-16 w-16 mx-auto mb-4" />
               <p className="font-bold uppercase tracking-widest text-xs">Awaiting Repository Sync...</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}