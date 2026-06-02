
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
      
      {/* 1. Official Alert Hub & Daily Challenge */}
      <section className="py-12 bg-[#F8FAFC] -mt-10 relative z-20">
         <div className="container mx-auto px-6 max-w-7xl">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
               
               <div className="lg:col-span-8">
                  <PopularExams />
               </div>

               <div className="lg:col-span-4 space-y-8 pt-16">
                  {/* Daily Question Engagement */}
                  <Card className="rounded-[2.5rem] border-none bg-[#0F172A] text-white p-10 overflow-hidden relative shadow-3xl">
                     <div className="absolute top-0 right-0 p-6 opacity-10 rotate-12"><Sparkles className="h-32 w-32" /></div>
                     <div className="relative z-10 space-y-6">
                        <div className="flex items-center gap-3">
                           <div className="h-10 w-10 bg-primary rounded-xl flex items-center justify-center shadow-lg"><BrainCircuit className="h-5 w-5 text-white" /></div>
                           <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Daily Mastery</span>
                        </div>
                        <h4 className="text-2xl font-headline font-black leading-tight">Question of the Day</h4>
                        <p className="text-slate-400 text-sm leading-relaxed font-medium">Which historical event marked the beginning of modern education in Punjab?</p>
                        <Button asChild className="w-full bg-white text-[#0F172A] hover:bg-slate-100 h-14 rounded-2xl font-black uppercase tracking-widest text-[10px]">
                           <Link href="/dashboard">Submit & Earn XP</Link>
                        </Button>
                     </div>
                  </Card>

                  {/* Official Notification Registry */}
                  <Card className="rounded-[2.5rem] border-none shadow-2xl bg-white p-10 overflow-hidden relative">
                     <div className="absolute top-0 right-0 p-6 opacity-5"><Bell className="h-20 w-20" /></div>
                     <div className="flex items-center justify-between mb-8 relative z-10">
                        <h3 className="font-headline font-black text-xl flex items-center gap-3">
                           <Bell className="h-5 w-5 text-primary" /> Official Feed
                        </h3>
                        <div className="flex items-center gap-2">
                           <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
                           <span className="text-[10px] font-black uppercase text-emerald-600 tracking-widest">Live Updates</span>
                        </div>
                     </div>
                     <div className="space-y-6 relative z-10">
                        {notices && notices.length > 0 ? notices.map((n: any) => (
                           <Link key={n.id} href="/notifications" className="flex gap-5 group cursor-pointer border-b border-slate-50 pb-6 last:border-0 last:pb-0">
                              <div className={`h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 transition-all duration-300 ${
                                n.category === 'Result' ? 'bg-emerald-50 text-emerald-500' : 
                                'bg-slate-50 text-slate-400 group-hover:bg-primary/10 group-hover:text-primary shadow-sm'
                              }`}>
                                 <Zap className="h-6 w-6" />
                              </div>
                              <div className="space-y-1">
                                 <p className="text-sm font-bold leading-snug group-hover:text-primary transition-colors line-clamp-1 text-[#0F172A]">{n.title}</p>
                                 <div className="flex items-center gap-4">
                                    <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{n.time}</span>
                                    <Badge variant="outline" className="border-slate-100 text-[9px] font-black px-2 py-0 uppercase text-slate-400">{n.board}</Badge>
                                 </div>
                              </div>
                           </Link>
                        )) : (
                          <p className="text-xs text-slate-400 italic">Syncing with official board gazettes...</p>
                        )}
                        <Button asChild variant="ghost" className="w-full pt-6 text-[10px] font-black uppercase tracking-[0.2em] text-primary hover:bg-primary/5 rounded-2xl border-2 border-dashed border-primary/10 h-16">
                           <Link href="/notifications">View Full Gazette <ChevronRight className="ml-2 h-4 w-4" /></Link>
                        </Button>
                     </div>
                  </Card>
               </div>
            </div>
         </div>
      </section>

      {/* 2. Success Hall of Fame */}
      <section className="py-24 bg-white">
         <div className="container mx-auto px-6 max-w-7xl">
            <div className="text-center space-y-4 mb-20">
               <Badge className="bg-primary/10 text-primary border-none px-6 py-2 rounded-full font-black uppercase tracking-[0.3em] text-[10px]">Alumni Spotlight</Badge>
               <h2 className="text-5xl md:text-7xl font-headline font-black text-[#0F172A] uppercase leading-[0.9] tracking-tight">Elite <br/><span className="text-primary">Rankers</span></h2>
               <p className="text-slate-500 font-medium max-w-2xl mx-auto text-lg italic mt-6">"I trusted the institutional rationalizations of Cracklix to clear my PPSC Executive exam."</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
               <RankerCard name="Amritpal Singh" exam="PSSSB Patwari" rank="Rank 04" year="2025" />
               <RankerCard name="Kiran Deep Kaur" exam="PPSC PCS" rank="Qualified" year="2024" />
               <RankerCard name="Gursewak Singh" exam="Punjab Police" rank="Dist. Cadre" year="2025" />
               <RankerCard name="Navneet Kaur" exam="Master Cadre" rank="SST Merit" year="2024" />
            </div>

            <div className="mt-24 bg-[#0B1528] rounded-[4rem] p-10 md:p-24 text-white relative overflow-hidden shadow-3xl">
               <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[150%] bg-primary/10 blur-[120px] rounded-full" />
               <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center relative z-10">
                  <div className="space-y-12">
                     <div className="flex gap-2 text-amber-500">
                        {Array.from({ length: 5 }).map((_, i) => <Star key={i} className="fill-current h-8 w-8" />)}
                     </div>
                     <blockquote className="text-4xl md:text-6xl font-headline font-medium italic leading-[1] tracking-tight">
                        "The Punjab GK and Punjabi qualifying sections on Cracklix are exactly like the real board exams."
                     </blockquote>
                     <div className="flex items-center gap-8">
                        <div className="h-20 w-20 rounded-[2rem] bg-white/10 flex items-center justify-center border border-white/10 shadow-2xl">
                           <ShieldCheck className="h-10 w-10 text-primary" />
                        </div>
                        <div>
                           <p className="text-3xl font-black uppercase tracking-tight leading-none">Harmanjit Singh</p>
                           <p className="text-primary font-bold uppercase tracking-widest text-xs mt-3">Revenue Patwari, Bathinda Batch 2025</p>
                        </div>
                     </div>
                  </div>
                  <div className="hidden lg:block">
                     <div className="relative h-[600px] w-full bg-slate-800 rounded-[4rem] overflow-hidden border-[16px] border-white/5 shadow-3xl">
                        <Image src="https://picsum.photos/seed/patwari/800/1000" fill alt="Success Story" className="object-cover grayscale hover:grayscale-0 transition-all duration-1000" />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0B1528] via-transparent to-transparent opacity-60" />
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </section>

      <LatestMocks />

      {/* 3. Daily Content Engine */}
      <section className="py-32 bg-[#0B1528] text-white overflow-hidden border-y border-white/5">
         <div className="container mx-auto px-6 max-w-7xl relative">
            <div className="absolute top-0 right-0 p-20 opacity-[0.02] -rotate-12 pointer-events-none"><Landmark className="h-96 w-96" /></div>
            
            <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-10 relative z-10">
               <div className="space-y-6">
                  <div className="flex items-center gap-3">
                     <TrendingUp className="text-primary h-6 w-6" />
                     <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Deep Analysis Hub</span>
                  </div>
                  <h2 className="text-6xl md:text-8xl font-headline font-black tracking-tight uppercase leading-[0.9]">Strategic <br/> <span className="text-primary">Insights</span></h2>
                  <p className="text-slate-400 text-xl max-w-xl font-medium leading-relaxed mt-4">Critical insights into state governance and historical facts tailored for official recruitment boards.</p>
               </div>
               <Button asChild className="bg-white/5 border border-white/10 h-20 px-16 rounded-[2rem] font-black uppercase text-xs tracking-widest hover:bg-primary hover:text-white hover:border-primary transition-all shadow-3xl flex items-center gap-4 group">
                  <Link href="/current-affairs">Deep Dive Newsroom <ChevronRight className="h-5 w-5 group-hover:translate-x-2 transition-transform" /></Link>
               </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-10 relative z-10">
               {latestCA && latestCA.length > 0 ? latestCA.map((ca: any) => (
                  <Card key={ca.id} className="bg-white/5 border-white/10 rounded-[3.5rem] overflow-hidden hover:bg-white/[0.08] transition-all duration-500 group cursor-pointer border border-transparent hover:border-primary/30 shadow-2xl">
                     <CardContent className="p-12 space-y-8">
                        <div className="flex justify-between items-center">
                           <Badge className="bg-primary text-white border-none px-5 py-2 font-black uppercase text-[10px] tracking-widest rounded-xl">
                              {ca.category}
                           </Badge>
                           <span className="text-[10px] font-black text-white/40 uppercase tracking-widest flex items-center gap-3">
                              <Calendar className="h-4 w-4" /> {ca.date}
                           </span>
                        </div>
                        <h4 className="text-2xl font-bold leading-tight group-hover:text-primary transition-colors line-clamp-2">{ca.title}</h4>
                        <p className="text-base text-slate-400 line-clamp-3 leading-relaxed font-medium">{ca.summary}</p>
                        <div className="pt-8 border-t border-white/5 flex items-center justify-between text-primary font-black uppercase tracking-widest text-[10px]">
                           <span>Start Analysis</span>
                           <ChevronRight className="h-5 w-5 group-hover:translate-x-2 transition-transform" />
                        </div>
                     </CardContent>
                  </Card>
               )) : (
                 Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="h-96 rounded-[3.5rem] bg-white/5 animate-pulse" />
                 ))
               )}
            </div>
         </div>
      </section>

      {/* 4. Upcoming Notifications Grid */}
      <section className="py-32 bg-white">
         <div className="container mx-auto px-6 max-w-7xl">
            <div className="flex flex-col md:flex-row items-center justify-between gap-10 mb-20">
               <h2 className="text-5xl font-headline font-black text-[#0F172A] uppercase flex items-center gap-6 leading-none">
                  <div className="h-16 w-16 bg-primary/10 rounded-[1.5rem] flex items-center justify-center"><GraduationCap className="h-8 w-8 text-primary" /></div>
                  2026 Recruitment Calendar
               </h2>
               <div className="px-8 py-3 rounded-full border border-slate-100 bg-slate-50 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 shadow-sm">
                  Verified as per Official Cabinet Notifications
               </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
               <UpcomingExamCard board="PSSSB" name="Senior Assistant (CBT)" date="March 2026" vacancies="120+" />
               <UpcomingExamCard board="Police" name="Sub-Inspector 2026" date="April 2026" vacancies="500+" />
               <UpcomingExamCard board="PPSC" name="ADO Recruitment" date="Feb 2026" vacancies="200+" />
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
      <Card className="border-none shadow-2xl shadow-slate-200/50 rounded-[3rem] bg-white overflow-hidden group hover:translate-y-[-8px] transition-all duration-500">
         <div className="h-56 w-full bg-slate-100 relative overflow-hidden grayscale group-hover:grayscale-0 transition-all duration-1000">
            <Image src={`https://picsum.photos/seed/${name}/400/500`} fill alt={name} className="object-cover transition-transform duration-1000 group-hover:scale-110" />
            <div className="absolute top-6 right-6 h-12 w-12 bg-white rounded-2xl shadow-2xl flex items-center justify-center border border-slate-100">
               <Trophy className="text-amber-500 h-6 w-6" />
            </div>
         </div>
         <CardContent className="p-10 text-center space-y-3">
            <p className="text-xl font-black text-[#0F172A] uppercase tracking-tight">{name}</p>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em]">{exam}</p>
            <div className="pt-6">
               <Badge className="bg-emerald-500/10 text-emerald-600 border-none text-[11px] font-black px-5 py-1.5 rounded-xl">{rank} • {year}</Badge>
            </div>
         </CardContent>
      </Card>
   )
}

function UpcomingExamCard({ board, name, date, vacancies }: any) {
   return (
      <div className="p-12 rounded-[3.5rem] bg-[#F8FAFC] border border-slate-100 flex items-center justify-between hover:bg-white hover:shadow-3xl hover:translate-y-[-6px] transition-all cursor-pointer group shadow-sm duration-500">
         <div className="space-y-4">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary bg-primary/10 px-4 py-1.5 rounded-xl">{board} Official</span>
            <h4 className="text-2xl font-headline font-black text-[#0F172A] group-hover:text-primary transition-colors leading-tight">{name}</h4>
            <div className="flex items-center gap-6 text-[10px] font-bold text-slate-400">
               <span className="flex items-center gap-2 text-slate-500"><Calendar className="h-4 w-4" /> {date}</span>
               <span className="flex items-center gap-2 text-emerald-600"><CheckCircle2 className="h-4 w-4" /> {vacancies} Vacancies</span>
            </div>
         </div>
         <div className="h-14 w-14 rounded-[1.5rem] border border-slate-200 flex items-center justify-center group-hover:bg-primary group-hover:border-primary group-hover:shadow-2xl group-hover:shadow-primary/30 transition-all duration-300">
            <ChevronRight className="h-6 w-6 text-slate-300 group-hover:text-white" />
         </div>
      </div>
   )
}
