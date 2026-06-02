
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
import { Calendar, FileText, Bell, ChevronRight, Trophy, Zap, Star, GraduationCap, CheckCircle2, ShieldCheck, TrendingUp, Landmark } from "lucide-react";
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
      
      {/* 1. Official Alert Hub */}
      <section className="py-12 bg-[#F8FAFC] -mt-10 relative z-20">
         <div className="container mx-auto px-6 max-w-7xl">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
               <div className="lg:col-span-2">
                  <PopularExams />
               </div>
               <div className="pt-16">
                  <Card className="rounded-[2.5rem] border-none shadow-2xl bg-white p-8 overflow-hidden relative">
                     <div className="absolute top-0 right-0 p-4 opacity-5"><Bell className="h-20 w-20" /></div>
                     <div className="flex items-center justify-between mb-8 relative z-10">
                        <h3 className="font-headline font-black text-xl flex items-center gap-3">
                           <Bell className="h-5 w-5 text-primary" /> Official Feed
                        </h3>
                        <div className="flex items-center gap-2">
                           <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                           <span className="text-[10px] font-black uppercase text-emerald-600 tracking-widest">Live Updates</span>
                        </div>
                     </div>
                     <div className="space-y-6 relative z-10">
                        {notices && notices.length > 0 ? notices.map((n: any) => (
                           <Link key={n.id} href="/notifications" className="flex gap-4 group cursor-pointer border-b border-slate-50 pb-4 last:border-0 last:pb-0">
                              <div className={`h-11 w-11 rounded-xl flex items-center justify-center shrink-0 transition-all ${
                                n.category === 'Result' ? 'bg-emerald-50 text-emerald-500' : 
                                'bg-slate-50 text-slate-400 group-hover:bg-primary/10 group-hover:text-primary'
                              }`}>
                                 <Zap className="h-5 w-5" />
                              </div>
                              <div className="space-y-1">
                                 <p className="text-sm font-bold leading-snug group-hover:text-primary transition-colors line-clamp-1">{n.title}</p>
                                 <div className="flex items-center gap-3">
                                    <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{n.time}</span>
                                    <Badge variant="outline" className="border-slate-100 text-[8px] font-bold px-2 py-0 uppercase">{n.board}</Badge>
                                 </div>
                              </div>
                           </Link>
                        )) : (
                          <p className="text-xs text-slate-400 italic">Checking official gazette feeds...</p>
                        )}
                        <Button asChild variant="ghost" className="w-full pt-4 text-[10px] font-black uppercase tracking-[0.2em] text-primary hover:bg-primary/5 rounded-xl">
                           <Link href="/notifications">View Full Gazette <ChevronRight className="ml-2 h-3 w-3" /></Link>
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
            <div className="text-center space-y-4 mb-16">
               <Badge className="bg-primary/10 text-primary border-none px-4 py-1.5 rounded-full font-black uppercase tracking-[0.2em] text-[10px]">Alumni Spotlight</Badge>
               <h2 className="text-4xl md:text-6xl font-headline font-black text-[#0F172A] uppercase leading-tight">Elite <span className="text-primary">Rankers</span></h2>
               <p className="text-slate-500 font-medium max-w-2xl mx-auto text-lg italic">"I trusted the institutional rationalizations of Cracklix to clear my PPSC Executive exam."</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
               <RankerCard name="Amritpal Singh" exam="PSSSB Patwari" rank="Rank 04" year="2025" />
               <RankerCard name="Kiran Deep Kaur" exam="PPSC PCS" rank="Qualified" year="2024" />
               <RankerCard name="Gursewak Singh" exam="Punjab Police" rank="Dist. Cadre" year="2025" />
               <RankerCard name="Navneet Kaur" exam="Master Cadre" rank="SST Merit" year="2024" />
            </div>

            <div className="mt-20 bg-[#0B1528] rounded-[4rem] p-10 md:p-24 text-white relative overflow-hidden shadow-3xl">
               <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[150%] bg-primary/10 blur-[120px] rounded-full" />
               <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative z-10">
                  <div className="space-y-10">
                     <div className="flex gap-1.5 text-amber-500">
                        {Array.from({ length: 5 }).map((_, i) => <Star key={i} className="fill-current h-6 w-6" />)}
                     </div>
                     <blockquote className="text-3xl md:text-5xl font-headline font-medium italic leading-[1.1] tracking-tight">
                        "The Punjab GK and Punjabi qualifying sections on Cracklix are exactly like the real board exams. The accuracy of the rationalizations is institutional grade."
                     </blockquote>
                     <div className="flex items-center gap-6">
                        <div className="h-16 w-16 rounded-2xl bg-white/10 flex items-center justify-center border border-white/10">
                           <ShieldCheck className="h-8 w-8 text-primary" />
                        </div>
                        <div>
                           <p className="text-2xl font-black uppercase tracking-tight">Harmanjit Singh</p>
                           <p className="text-primary font-bold uppercase tracking-widest text-xs mt-1">Revenue Patwari, Bathinda Batch 2025</p>
                        </div>
                     </div>
                  </div>
                  <div className="hidden lg:block">
                     <div className="relative h-[550px] w-full bg-slate-800 rounded-[3.5rem] overflow-hidden border-[12px] border-white/5 shadow-2xl">
                        <Image src="https://picsum.photos/seed/patwari/800/1000" fill alt="Success Story" className="object-cover grayscale hover:grayscale-0 transition-all duration-700" />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0B1528] via-transparent to-transparent opacity-60" />
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </section>

      <LatestMocks />

      {/* 3. Daily Content Engine */}
      <section className="py-24 bg-[#0B1528] text-white overflow-hidden">
         <div className="container mx-auto px-6 max-w-7xl relative">
            <div className="absolute top-0 right-0 p-20 opacity-[0.02] -rotate-12"><Landmark className="h-96 w-96" /></div>
            
            <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-10 relative z-10">
               <div className="space-y-6">
                  <div className="flex items-center gap-3">
                     <TrendingUp className="text-primary h-6 w-6" />
                     <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Live Content Engine</span>
                  </div>
                  <h2 className="text-5xl md:text-7xl font-headline font-black tracking-tight uppercase leading-[0.9]">Punjab Daily <br/> <span className="text-primary">Analysis</span></h2>
                  <p className="text-slate-400 text-xl max-w-xl font-medium leading-relaxed">Critical insights into state governance and historical facts tailored for the official recruitment boards.</p>
               </div>
               <Button asChild className="bg-white/5 border border-white/10 h-16 px-12 rounded-[1.5rem] font-black uppercase text-xs tracking-widest hover:bg-primary hover:text-white hover:border-primary transition-all shadow-2xl flex items-center gap-4">
                  <Link href="/current-affairs">Deep Dive Newsroom <ChevronRight className="h-5 w-5" /></Link>
               </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
               {latestCA && latestCA.length > 0 ? latestCA.map((ca: any) => (
                  <Card key={ca.id} className="bg-white/5 border-white/10 rounded-[3rem] overflow-hidden hover:bg-white/[0.08] transition-all group cursor-pointer border border-transparent hover:border-primary/20 shadow-2xl">
                     <CardContent className="p-12 space-y-8">
                        <div className="flex justify-between items-center">
                           <Badge className="bg-primary text-white border-none px-4 py-1.5 font-black uppercase text-[10px] tracking-widest rounded-xl">
                              {ca.category}
                           </Badge>
                           <span className="text-[10px] font-black text-white/40 uppercase tracking-widest flex items-center gap-3">
                              <Calendar className="h-4 w-4" /> {ca.date}
                           </span>
                        </div>
                        <h4 className="text-2xl font-bold leading-tight group-hover:text-primary transition-colors">{ca.title}</h4>
                        <p className="text-base text-slate-400 line-clamp-3 leading-relaxed font-medium">{ca.summary}</p>
                        <div className="pt-6 border-t border-white/5 flex items-center justify-between text-primary font-black uppercase tracking-widest text-[10px]">
                           <span>Start Deep Analysis</span>
                           <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                        </div>
                     </CardContent>
                  </Card>
               )) : (
                 Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="h-80 rounded-[3rem] bg-white/5 animate-pulse" />
                 ))
               )}
            </div>
         </div>
      </section>

      {/* 4. Upcoming Notifications Grid */}
      <section className="py-24 bg-white">
         <div className="container mx-auto px-6 max-w-7xl">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-16">
               <h2 className="text-4xl font-headline font-black text-[#0F172A] uppercase flex items-center gap-4">
                  <GraduationCap className="h-10 w-10 text-primary" /> 2026 Recruitment Calendar
               </h2>
               <div className="px-6 py-2 rounded-full border border-slate-100 bg-slate-50 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                  Updated as per Latest Cabinet Decisions
               </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
      <Card className="border-none shadow-2xl shadow-slate-200/50 rounded-[2.5rem] bg-white overflow-hidden group">
         <div className="h-48 w-full bg-slate-100 relative overflow-hidden grayscale group-hover:grayscale-0 transition-all duration-700">
            <Image src={`https://picsum.photos/seed/${name}/400/500`} fill alt={name} className="object-cover transition-transform group-hover:scale-110" />
            <div className="absolute top-4 right-4 h-11 w-11 bg-white rounded-xl shadow-xl flex items-center justify-center">
               <Trophy className="text-amber-500 h-6 w-6" />
            </div>
         </div>
         <CardContent className="p-8 text-center space-y-2">
            <p className="text-lg font-black text-[#0F172A] uppercase tracking-tight">{name}</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{exam}</p>
            <div className="pt-4">
               <Badge className="bg-emerald-500/10 text-emerald-600 border-none text-[10px] font-black px-4 py-1 rounded-lg">{rank} • {year}</Badge>
            </div>
         </CardContent>
      </Card>
   )
}

function UpcomingExamCard({ board, name, date, vacancies }: any) {
   return (
      <div className="p-10 rounded-[2.5rem] bg-[#F8FAFC] border border-slate-100 flex items-center justify-between hover:bg-white hover:shadow-3xl hover:translate-y-[-4px] transition-all cursor-pointer group shadow-sm">
         <div className="space-y-3">
            <span className="text-[10px] font-black uppercase tracking-widest text-primary bg-primary/5 px-3 py-1 rounded-lg">{board} Official</span>
            <h4 className="text-xl font-headline font-black text-[#0F172A] group-hover:text-primary transition-colors">{name}</h4>
            <div className="flex items-center gap-5 text-[10px] font-bold text-slate-400">
               <span className="flex items-center gap-2 text-slate-500"><Calendar className="h-4 w-4" /> {date}</span>
               <span className="flex items-center gap-2 text-emerald-600"><CheckCircle2 className="h-4 w-4" /> {vacancies} Vacancies</span>
            </div>
         </div>
         <div className="h-12 w-12 rounded-2xl border border-slate-200 flex items-center justify-center group-hover:bg-primary group-hover:border-primary group-hover:shadow-xl group-hover:shadow-primary/20 transition-all">
            <ChevronRight className="h-5 w-5 text-slate-300 group-hover:text-white" />
         </div>
      </div>
   )
}
