"use client"

import Navbar from "@/components/layout/Navbar";
import Hero from "@/components/home/Hero";
import PopularExams from "@/components/home/PopularExams";
import LatestMocks from "@/components/home/LatestMocks";
import Features from "@/components/home/Features";
import AppPreview from "@/components/home/AppPreview";
import Footer from "@/components/layout/Footer";
import { useCollection, useFirestore } from "@/firebase";
import { collection, query, orderBy, limit } from "firebase/firestore";
import { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, FileText, Bell, ChevronRight, Trophy, Zap, Star, GraduationCap, CheckCircle2, ShieldCheck, TrendingUp, Landmark, BrainCircuit, Sparkles } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

/**
 * @fileOverview Final Homepage Module.
 * Features: Official Alert Hub, Daily Challenge, Alumni Success, and Strategic Insights.
 */

export default function HomePage() {
  const db = useFirestore();
  
  const caQuery = useMemo(() => (db ? query(collection(db, "current_affairs"), orderBy("date", "desc"), limit(3)) : null), [db]);
  const { data: latestCA } = useCollection<any>(caQuery);

  const noticeQuery = useMemo(() => (db ? query(collection(db, "notifications"), orderBy("createdAt", "desc"), limit(5)) : null), [db]);
  const { data: notices } = useCollection<any>(noticeQuery);

  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      <Hero />
      
      {/* 1. Official Alert Hub & Daily Mastery (Phase 62) */}
      <section className="py-12 bg-[#F8FAFC] -mt-10 relative z-20">
         <div className="container mx-auto px-6 max-w-7xl">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
               
               {/* Left: Popular Exam Vertical HQs */}
               <div className="lg:col-span-8">
                  <PopularExams />
               </div>

               {/* Right: Real-time Institutional Engagement */}
               <div className="lg:col-span-4 space-y-8 pt-16">
                  {/* Phase 62: Daily Mastery Challenge */}
                  <Card className="rounded-[3rem] border-none bg-[#0F172A] text-white p-12 overflow-hidden relative shadow-4xl group">
                     <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12 group-hover:scale-110 transition-transform"><Sparkles className="h-40 w-40" /></div>
                     <div className="relative z-10 space-y-8">
                        <div className="flex items-center gap-4">
                           <div className="h-14 w-14 bg-primary rounded-2xl flex items-center justify-center shadow-2xl"><BrainCircuit className="h-7 w-7 text-white" /></div>
                           <div className="space-y-0.5">
                              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Aspirant Mastery</span>
                              <h4 className="text-xl font-headline font-black leading-tight uppercase">Daily Challenge</h4>
                           </div>
                        </div>
                        <div className="p-8 bg-white/5 rounded-[2rem] border border-white/5 shadow-inner">
                           <p className="text-slate-300 text-lg leading-relaxed font-medium italic">"Which constitutional amendment act is known as the 'Mini Constitution' of India?"</p>
                        </div>
                        <Button asChild className="w-full bg-white text-[#0F172A] hover:bg-slate-100 h-16 rounded-2xl font-black uppercase tracking-widest text-xs shadow-3xl">
                           <Link href="/dashboard">Attempt & Earn XP</Link>
                        </Button>
                        <div className="flex items-center justify-center gap-4 text-[9px] font-black text-slate-500 uppercase tracking-widest">
                           <Zap className="h-3.5 w-3.5 text-primary" /> 1,450 Aspirants Active Now
                        </div>
                     </div>
                  </Card>

                  {/* Official Recruitment Gazette Registry */}
                  <Card className="rounded-[3rem] border-none shadow-2xl bg-white p-12 overflow-hidden relative">
                     <div className="absolute top-0 right-0 p-8 opacity-5"><Bell className="h-24 w-24" /></div>
                     <div className="flex items-center justify-between mb-10 relative z-10">
                        <h3 className="font-headline font-black text-2xl flex items-center gap-4">
                           <Bell className="h-6 w-6 text-primary" /> Official Feed
                        </h3>
                        <div className="flex items-center gap-2">
                           <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
                           <span className="text-[10px] font-black uppercase text-emerald-600 tracking-widest">Live Updates</span>
                        </div>
                     </div>
                     <div className="space-y-8 relative z-10">
                        {notices && notices.length > 0 ? notices.map((n: any) => (
                           <Link key={n.id} href="/notifications" className="flex gap-6 group cursor-pointer border-b border-slate-50 pb-8 last:border-0 last:pb-0">
                              <div className={`h-14 w-14 rounded-2xl flex items-center justify-center shrink-0 transition-all duration-300 ${
                                n.category === 'Result' ? 'bg-emerald-50 text-emerald-500 shadow-emerald-100' : 
                                'bg-slate-50 text-slate-400 group-hover:bg-primary/10 group-hover:text-primary shadow-sm'
                              }`}>
                                 <Zap className="h-7 w-7" />
                              </div>
                              <div className="space-y-1.5 flex-1 min-w-0">
                                 <p className="text-base font-bold leading-snug group-hover:text-primary transition-colors truncate text-[#0F172A]">{n.title}</p>
                                 <div className="flex items-center gap-4">
                                    <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{n.time}</span>
                                    <Badge variant="outline" className="border-slate-100 text-[9px] font-black px-2.5 py-0.5 uppercase text-slate-500 rounded-lg">{n.board}</Badge>
                                 </div>
                              </div>
                           </Link>
                        )) : (
                          <div className="py-10 text-center space-y-4 opacity-30 italic">
                             <Bell className="h-10 w-10 mx-auto" />
                             <p className="text-xs uppercase font-black tracking-widest">Syncing with official board gazettes...</p>
                          </div>
                        )}
                        <Button asChild variant="ghost" className="w-full pt-8 text-[11px] font-black uppercase tracking-[0.2em] text-primary hover:bg-primary/5 rounded-2xl border-2 border-dashed border-primary/10 h-20">
                           <Link href="/notifications">Explore Full Gazette <ChevronRight className="ml-2 h-4 w-4" /></Link>
                        </Button>
                     </div>
                  </Card>
               </div>
            </div>
         </div>
      </section>

      {/* 2. Institutional Hall of Fame */}
      <section className="py-32 bg-white">
         <div className="container mx-auto px-6 max-w-7xl">
            <div className="text-center space-y-6 mb-24">
               <Badge className="bg-primary/10 text-primary border-none px-8 py-2.5 rounded-full font-black uppercase tracking-[0.3em] text-[11px]">Institutional Alumni</Badge>
               <h2 className="text-6xl md:text-8xl font-headline font-black text-[#0F172A] uppercase leading-[0.9] tracking-tight">Hall Of <br/><span className="text-primary">Rankers</span></h2>
               <p className="text-slate-500 font-medium max-w-2xl mx-auto text-xl italic mt-8 leading-relaxed">
                  "The high-fidelity mocks and AI-powered rationalizations of Cracklix were pivotal in my PPSC Executive success."
               </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
               <RankerCard name="Amritpal Singh" exam="PSSSB Patwari" rank="Rank 04" year="2025" />
               <RankerCard name="Kiran Deep Kaur" exam="PPSC PCS" rank="Qualified" year="2024" />
               <RankerCard name="Gursewak Singh" exam="Punjab Police" rank="Dist. Cadre" year="2025" />
               <RankerCard name="Navneet Kaur" exam="Master Cadre" rank="SST Merit" year="2024" />
            </div>

            <div className="mt-32 bg-[#0B1528] rounded-[5rem] p-12 md:p-32 text-white relative overflow-hidden shadow-4xl group">
               <div className="absolute top-[-30%] right-[-10%] w-[60%] h-[160%] bg-primary/10 blur-[140px] rounded-full" />
               <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center relative z-10">
                  <div className="space-y-16">
                     <div className="flex gap-2.5 text-amber-500">
                        {Array.from({ length: 5 }).map((_, i) => <Star key={i} className="fill-current h-10 w-10" />)}
                     </div>
                     <blockquote className="text-5xl md:text-7xl font-headline font-medium italic leading-[1] tracking-tighter antialiased">
                        "The Punjab GK and Punjabi qualifying modules on Cracklix are indistinguishable from real board patterns."
                     </blockquote>
                     <div className="flex items-center gap-10">
                        <div className="h-24 w-24 rounded-[2.5rem] bg-white/10 flex items-center justify-center border border-white/10 shadow-3xl">
                           <ShieldCheck className="h-12 w-12 text-primary" />
                        </div>
                        <div>
                           <p className="text-4xl font-black uppercase tracking-tight leading-none">Harmanjit Singh</p>
                           <p className="text-primary font-bold uppercase tracking-widest text-[11px] mt-4">Revenue Patwari, Bathinda Batch 2025</p>
                        </div>
                     </div>
                  </div>
                  <div className="hidden lg:block">
                     <div className="relative h-[700px] w-full bg-slate-800 rounded-[5rem] overflow-hidden border-[20px] border-white/5 shadow-4xl">
                        <Image src="https://picsum.photos/seed/patwari/800/1000" fill alt="Success Story" className="object-cover grayscale group-hover:grayscale-0 transition-all duration-1000 group-hover:scale-105" />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0B1528] via-transparent to-transparent opacity-70" />
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </section>

      <LatestMocks />

      {/* 3. Deep Analysis Hub */}
      <section className="py-40 bg-[#0B1528] text-white overflow-hidden border-y border-white/5">
         <div className="container mx-auto px-6 max-w-7xl relative">
            <div className="absolute top-0 right-0 p-24 opacity-[0.03] -rotate-12 pointer-events-none"><Landmark className="h-[500px] w-[500px]" /></div>
            
            <div className="flex flex-col md:flex-row justify-between items-end mb-24 gap-12 relative z-10">
               <div className="space-y-8">
                  <div className="flex items-center gap-4">
                     <TrendingUp className="text-primary h-7 w-7" />
                     <span className="text-[11px] font-black uppercase tracking-[0.5em] text-primary">Strategic Insights Hub</span>
                  </div>
                  <h2 className="text-7xl md:text-9xl font-headline font-black tracking-tighter uppercase leading-[0.85]">Punjab <br/> <span className="text-primary">Analysis</span></h2>
                  <p className="text-slate-400 text-2xl max-w-xl font-medium leading-relaxed mt-6">Expert highlights of state governance and historical nodes tailored for 2026 recruitment boards.</p>
               </div>
               <Button asChild className="bg-white/5 border border-white/10 h-24 px-20 rounded-[2.5rem] font-black uppercase text-sm tracking-widest hover:bg-primary hover:text-white hover:border-primary transition-all shadow-4xl flex items-center gap-6 group">
                  <Link href="/current-affairs">Open Analysis Feed <ChevronRight className="h-6 w-6 group-hover:translate-x-2 transition-transform" /></Link>
               </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative z-10">
               {latestCA && latestCA.length > 0 ? latestCA.map((ca: any) => (
                  <Card key={ca.id} className="bg-white/5 border-white/10 rounded-[4rem] overflow-hidden hover:bg-white/[0.08] transition-all duration-500 group cursor-pointer border border-transparent hover:border-primary/30 shadow-3xl">
                     <CardContent className="p-14 space-y-10">
                        <div className="flex justify-between items-center">
                           <Badge className="bg-primary text-white border-none px-6 py-2.5 font-black uppercase text-[11px] tracking-widest rounded-xl">
                              {ca.category}
                           </Badge>
                           <span className="text-[11px] font-black text-white/40 uppercase tracking-widest flex items-center gap-4">
                              <Calendar className="h-5 w-5" /> {ca.date}
                           </span>
                        </div>
                        <h4 className="text-3xl font-bold leading-tight group-hover:text-primary transition-colors line-clamp-2 uppercase tracking-tight">{ca.title}</h4>
                        <p className="text-lg text-slate-400 line-clamp-3 leading-relaxed font-medium">{ca.summary}</p>
                        <div className="pt-10 border-t border-white/5 flex items-center justify-between text-primary font-black uppercase tracking-widest text-[11px]">
                           <span>Start Audit Analysis</span>
                           <ChevronRight className="h-6 w-6 group-hover:translate-x-2 transition-transform" />
                        </div>
                     </CardContent>
                  </Card>
               )) : (
                 Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="h-[450px] rounded-[4rem] bg-white/5 animate-pulse" />
                 ))
               )}
            </div>
         </div>
      </section>

      <Features />
      <AppPreview />
      <Footer />
    </main>
  );
}

function RankerCard({ name, exam, rank, year }: any) {
   return (
      <Card className="border-none shadow-3xl shadow-slate-900/5 rounded-[3.5rem] bg-white overflow-hidden group hover:translate-y-[-10px] transition-all duration-500">
         <div className="h-72 w-full bg-slate-100 relative overflow-hidden grayscale group-hover:grayscale-0 transition-all duration-1000">
            <Image src={`https://picsum.photos/seed/${name}/400/500`} fill alt={name} className="object-cover transition-transform duration-1000 group-hover:scale-110" />
            <div className="absolute top-8 right-8 h-14 w-14 bg-white rounded-2xl shadow-3xl flex items-center justify-center border border-slate-50">
               <Trophy className="text-amber-500 h-7 w-7" />
            </div>
         </div>
         <CardContent className="p-12 text-center space-y-4">
            <p className="text-2xl font-black text-[#0F172A] uppercase tracking-tight">{name}</p>
            <p className="text-[12px] font-bold text-slate-400 uppercase tracking-[0.2em]">{exam}</p>
            <div className="pt-8">
               <Badge className="bg-emerald-500/10 text-emerald-600 border-none text-[11px] font-black px-6 py-2 rounded-xl">{rank} • {year}</Badge>
            </div>
         </CardContent>
      </Card>
   )
}
