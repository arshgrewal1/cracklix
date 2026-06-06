
"use client"

import React, { useMemo } from "react";
import Navbar from "@/components/layout/Navbar";
import Hero from "@/components/home/Hero";
import PopularExams from "@/components/home/PopularExams";
import LatestMocks from "@/components/home/LatestMocks";
import Features from "@/components/home/Features";
import AppPreview from "@/components/home/AppPreview";
import Footer from "@/components/layout/Footer";
import { useCollection, useFirestore } from "@/firebase";
import { collection, query, limit, where } from "firebase/firestore";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Zap, BookOpen, Users, Bell, ShieldCheck, Target } from "lucide-react";
import Link from "next/link";

/**
 * @fileOverview High-Density Mobile-First Homepage.
 * Updated: Corrected TrustNode syntax and tagline.
 */

export default function HomePage() {
  const db = useFirestore();

  // Real-time Data Ingestion
  const { data: users } = useCollection<any>(useMemo(() => (db ? collection(db, "users") : null), [db]));
  const { data: questions } = useCollection<any>(useMemo(() => (db ? collection(db, "questions") : null), [db]));
  const { data: mocks } = useCollection<any>(useMemo(() => (db ? query(collection(db, "mocks"), where("published", "==", true)) : null), [db]));
  const { data: results } = useCollection<any>(useMemo(() => (db ? collection(db, "results") : null), [db]));
  const { data: notices } = useCollection<any>(useMemo(() => (db ? query(collection(db, "notifications"), limit(3)) : null), [db]));

  // Institutional Accuracy Calculation
  const globalAccuracy = useMemo(() => {
    if (!results || results.length === 0) return 68;
    const totalCorrect = results.reduce((acc: number, r: any) => acc + (r.score || 0), 0);
    const totalQs = results.reduce((acc: number, r: any) => acc + (r.totalQuestions || 0), 0);
    return totalQs > 0 ? Math.round((totalCorrect / totalQs) * 100) : 68;
  }, [results]);

  const formattedQCount = useMemo(() => {
    const count = questions?.length || 0;
    if (count > 999) return `${(count / 1000).toFixed(1)}k+`;
    return count.toString();
  }, [questions]);

  return (
    <main className="min-h-screen bg-white font-body pb-safe overflow-x-hidden">
      <Navbar />
      <Hero />

      {/* High-Density Real-Time Trust Bar */}
      <section className="bg-white py-4 md:py-12 border-b border-slate-50">
         <div className="container mx-auto px-4 max-w-7xl">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-10">
               <TrustNode 
                 icon={<BookOpen className="text-primary h-3.5 w-3.5 md:h-6 md:w-6" />} 
                 label="MCQ Bank" 
                 val={formattedQCount} 
               />
               <TrustNode 
                 icon={<Zap className="text-blue-500 h-3.5 w-3.5 md:h-6 md:w-6" />} 
                 label="Mocks Live" 
                 val={mocks?.length || "0"} 
               />
               <TrustNode 
                 icon={<Users className="text-emerald-500 h-3.5 w-3.5 md:h-6 md:w-6" />} 
                 label="Aspirants" 
                 val={users?.length ? users.length.toLocaleString() : "0"} 
               />
               <TrustNode 
                 icon={<Target className="text-amber-500 h-3.5 w-3.5 md:h-6 md:w-6" />} 
                 label="Avg Accuracy" 
                 val={`${globalAccuracy}%`} 
               />
            </div>
         </div>
      </section>

      <div className="container mx-auto px-4 py-8 md:py-24 max-w-7xl">
         <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-12">
            <div className="lg:col-span-8 space-y-6 md:space-y-12">
               <PopularExams />
               <LatestMocks />
            </div>
            
            <div className="lg:col-span-4 space-y-6 md:space-y-10 text-left">
               <Card className="rounded-xl md:rounded-[2.5rem] bg-[#0F172A] text-white p-6 md:p-12 overflow-hidden relative shadow-2xl">
                  <div className="relative z-10 space-y-4">
                     <Badge className="bg-primary text-white border-none uppercase text-[7px] md:text-[8px] font-black px-2 py-0.5">AI Node</Badge>
                     <h4 className="text-lg md:text-2xl font-headline font-black uppercase">Mastery Index</h4>
                     <p className="text-[11px] md:text-base text-slate-400 font-medium">Personalized goals based on your audit patterns.</p>
                     <Button asChild className="w-full bg-primary hover:bg-orange-600 h-10 md:h-14 font-black uppercase text-[9px] md:text-[10px] tracking-widest rounded-lg md:rounded-2xl shadow-xl">
                        <Link href="/dashboard">Dashboard</Link>
                     </Button>
                  </div>
               </Card>

               <Card className="rounded-xl md:rounded-[2.5rem] bg-white p-6 md:p-10 border border-slate-100 shadow-xl">
                  <div className="flex items-center justify-between mb-4 md:mb-6">
                     <h3 className="font-headline font-black text-sm md:text-xl flex items-center gap-2 text-[#0F172A] uppercase"><Bell className="h-4 w-4 text-primary" /> Alerts</h3>
                     <Link href="/notifications" className="text-[7px] md:text-[9px] font-black text-primary uppercase tracking-widest">View All</Link>
                  </div>
                  <div className="space-y-3 md:space-y-6">
                     {notices?.map((n: any) => (
                        <Link key={n.id} href="/notifications" className="flex gap-3 md:gap-4 group border-b border-slate-50 pb-3 md:pb-4 last:border-0 last:pb-0">
                           <div className="h-8 w-8 md:h-12 md:w-12 rounded-lg md:rounded-xl bg-slate-50 flex items-center justify-center shrink-0 group-hover:bg-primary/10 transition-all">
                              <Zap className="h-4 w-4 md:h-6 md:w-6 text-slate-400 group-hover:text-primary" />
                           </div>
                           <div className="space-y-0.5 min-w-0 flex-1">
                              <p className="text-[11px] md:sm font-black text-[#0F172A] truncate uppercase leading-tight">{n.title}</p>
                              <span className="text-[7px] md:text-[9px] text-slate-400 font-bold uppercase">{n.time}</span>
                           </div>
                        </Link>
                     ))}
                  </div>
               </Card>
            </div>
         </div>
      </div>

      <Features />
      <AppPreview />
      <Footer />
    </main>
  );
}

function TrustNode({ icon, label, val }: any) {
   return (
      <div className="flex items-center gap-2 md:gap-5 p-2 md:p-6 rounded-lg md:rounded-2xl hover:bg-slate-50 transition-colors text-left bg-white border border-slate-50 md:border-none shadow-sm md:shadow-none">
         <div className="h-8 w-8 md:h-14 md:w-14 rounded-lg md:rounded-xl bg-slate-50 flex items-center justify-center shrink-0 border border-slate-100">
            {icon}
         </div>
         <div className="min-w-0">
            <p className="text-sm md:text-3xl font-headline font-black text-[#0F172A] leading-none tracking-tight">{val}</p>
            <p className="text-[6px] md:text-[9px] font-black uppercase tracking-widest text-slate-400 mt-1 truncate">{label}</p>
         </div>
      </div>
   )
}
