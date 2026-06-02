
'use client';

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, BookOpen, ShieldCheck, ArrowRight, Zap } from "lucide-react";
import Link from "next/link";
import { useCollection, useFirestore } from "@/firebase";
import { collection, query, orderBy, limit, where } from "firebase/firestore";
import { useMemo } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function LatestMocks() {
  const db = useFirestore();
  
  const mocksQuery = useMemo(() => {
    if (!db) return null;
    return query(
      collection(db, "mocks"), 
      where("published", "==", true),
      orderBy("createdAt", "desc"), 
      limit(5)
    );
  }, [db]);

  const { data: mocks, loading } = useCollection<any>(mocksQuery);

  return (
    <section className="py-32 bg-white">
      <div className="container mx-auto px-6 max-w-7xl">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-2"
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
            className="group flex items-center gap-3 bg-slate-50 hover:bg-primary hover:text-white px-8 py-4 rounded-2xl transition-all duration-300 shadow-sm"
          >
            <span className="font-black text-[10px] uppercase tracking-widest">Explore Repository</span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-2" />
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-8">
          {loading ? (
             Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-80 w-full rounded-[2.5rem]" />)
          ) : mocks && mocks.length > 0 ? (
            mocks.map((mock, i) => (
              <motion.div
                key={mock.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="h-full"
              >
                <Card className="border-none rounded-[3rem] bg-white shadow-2xl shadow-slate-200/40 hover:shadow-3xl hover:translate-y-[-6px] transition-all duration-500 overflow-hidden flex flex-col h-full group">
                  <CardContent className="p-10 flex-1 flex flex-col">
                    <div className="flex justify-center mb-8">
                      <div className="h-16 w-16 rounded-[1.5rem] bg-slate-50 flex items-center justify-center group-hover:bg-[#0F172A] transition-colors duration-500 shadow-inner">
                        <ShieldCheck className="h-8 w-8 text-slate-200 group-hover:text-primary" />
                      </div>
                    </div>
                    
                    <div className="text-center mb-8 space-y-1">
                       <p className="text-[9px] font-black uppercase text-primary tracking-widest">{mock.boardId}</p>
                       <h3 className="font-bold text-lg text-[#0F172A] leading-tight min-h-[48px] group-hover:text-primary transition-colors">
                        {mock.title}
                       </h3>
                    </div>
                    
                    <div className="space-y-6 mb-10">
                      <div className="flex items-center justify-between text-[10px] text-slate-400 uppercase font-black tracking-widest px-1">
                         <span className="flex items-center gap-2"><BookOpen className="h-4 w-4" /> {mock.totalQuestions}</span>
                         <span className="flex items-center gap-2"><Clock className="h-4 w-4" /> {mock.duration}m</span>
                      </div>
                      <div className="flex justify-center">
                         <Badge variant="outline" className="text-[10px] uppercase font-black px-5 py-1 rounded-xl border-slate-100 text-slate-300 group-hover:text-primary group-hover:border-primary/20 transition-colors">
                           {mock.difficulty || 'Medium'}
                         </Badge>
                      </div>
                    </div>

                    <Button asChild className="w-full bg-[#0B1528] text-white hover:bg-primary transition-all font-black h-14 rounded-2xl text-[10px] uppercase tracking-[0.2em] mt-auto shadow-2xl shadow-slate-200 group-hover:shadow-primary/20">
                      <Link href={`/mocks/${mock.id}`}>Attempt Now</Link>
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))
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
