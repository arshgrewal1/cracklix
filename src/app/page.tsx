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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, FileText, Bell, ChevronRight, Trophy, Zap, MapPin, Star, GraduationCap, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function HomePage() {
  const db = useFirestore();
  
  const caQuery = useMemo(() => (db ? query(collection(db, "current_affairs"), orderBy("date", "desc"), limit(3)) : null), [db]);
  const { data: latestCA } = useCollection<any>(caQuery);

  const noticeQuery = useMemo(() => (db ? query(collection(db, "notifications"), orderBy("time", "desc"), limit(5)) : null), [db]);
  const { data: notices } = useCollection<any>(noticeQuery);

  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      <Hero />
      
      {/* 1. Upcoming Exams & Alerts Bar */}
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
                           <Bell className="h-5 w-5 text-primary" /> Exam Alerts
                        </h3>
                        <Badge variant="outline" className="border-slate-100 text-[10px] font-black uppercase text-slate-400">Live</Badge>
                     </div>
                     <div className="space-y-6 relative z-10">
                        {notices?.map((n: any) => (
                           <div key={n.id} className="flex gap-4 group cursor-pointer">
                              <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center shrink-0 group-hover:bg-primary/10 transition-colors">
                                 <FileText className="h-5 w-5 text-slate-400 group-hover:text-primary" />
                              </div>
                              <div className="space-y-1">
                                 <p className="text-sm font-bold leading-snug group-hover:text-primary transition-colors">{n.title}</p>
                                 <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{n.time}</p>
                              </div>
                           </div>
                        ))}
                        <Link href="/notifications" className="block pt-4 text-center text-xs font-black uppercase tracking-widest text-primary hover:underline">
                           View All Recruitment Notices
                        </Link>
                     </div>
                  </Card>
               </div>
            </div>
         </div>
      </section>

      {/* 2. Top Rankers & Success Stories Section (Beat Testbook) */}
      <section className="py-24 bg-white">
         <div className="container mx-auto px-6 max-w-7xl">
            <div className="text-center space-y-4 mb-16">
               <span className="text-primary font-black uppercase tracking-[0.2em] text-[10px] bg-primary/10 px-4 py-1.5 rounded-full">Hall of Fame</span>
               <h2 className="text-4xl md:text-6xl font-headline font-black text-[#0F172A] uppercase">Cracklix Rankers</h2>
               <p className="text-slate-500 font-medium max-w-2xl mx-auto text-lg">Meet the aspirants who successfully joined Punjab Government services using our mock series.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
               <RankerCard name="Amritpal Singh" exam="PSSSB Patwari" rank="Rank 04" year="2025" />
               <RankerCard name="Kiran Deep Kaur" exam="PPSC PCS" rank="Qualified" year="2024" />
               <RankerCard name="Gursewak Singh" exam="Punjab Police" rank="Dist. Cadre" year="2025" />
               <RankerCard name="Navneet Kaur" exam="Master Cadre" rank="SST Merit" year="2024" />
            </div>

            <div className="mt-20 bg-[#0B1528] rounded-[3rem] p-10 md:p-20 text-white relative overflow-hidden">
               <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[150%] bg-primary/10 blur-[120px] rounded-full" />
               <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative z-10">
                  <div className="space-y-8">
                     <div className="flex gap-1 text-amber-500">
                        <Star className="fill-current h-5 w-5" /> <Star className="fill-current h-5 w-5" /> <Star className="fill-current h-5 w-5" /> <Star className="fill-current h-5 w-5" /> <Star className="fill-current h-5 w-5" />
                     </div>
                     <blockquote className="text-3xl md:text-4xl font-headline font-medium italic leading-relaxed">
                        "The Punjab GK and Punjabi qualifying sections on Cracklix are exactly like the real board exams. I attempted 40+ mocks here before my Patwari exam and it made all the difference."
                     </blockquote>
                     <div>
                        <p className="text-xl font-black uppercase">Harmanjit Singh</p>
                        <p className="text-primary font-bold uppercase tracking-widest text-xs mt-1">Revenue Patwari, Bathinda Batch 2025</p>
                     </div>
                  </div>
                  <div className="hidden lg:block">
                     <div className="relative h-[450px] w-full bg-slate-800 rounded-[2.5rem] overflow-hidden border-8 border-white/5 shadow-2xl">
                        <Image src="https://picsum.photos/seed/patwari/600/800" fill alt="Success Story" className="object-cover" />
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </section>

      <LatestMocks />

      {/* 3. Current Affairs & Daily Analysis Highlights */}
      <section className="py-24 bg-[#0B1528] text-white">
         <div className="container mx-auto px-6 max-w-7xl">
            <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
               <div>
                  <div className="flex items-center gap-3 mb-4">
                     <Zap className="text-primary h-5 w-5" />
                     <span className="text-[10px] font-black uppercase tracking-widest text-primary">Live Content Engine</span>
                  </div>
                  <h2 className="text-4xl md:text-6xl font-headline font-black tracking-tight uppercase leading-[0.95]">Punjab Daily <br/> <span className="text-primary">Analysis</span></h2>
                  <p className="text-slate-400 mt-6 text-lg max-w-xl font-medium">Critical insights into state governance, economy, and historical facts tailored for Punjab aspirants.</p>
               </div>
               <Button asChild className="bg-white/5 border border-white/10 h-14 px-10 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-white/10 transition-all flex items-center gap-3">
                  <Link href="/current-affairs">Deep Dive Newsroom <ChevronRight className="h-4 w-4" /></Link>
               </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
               {latestCA?.map((ca: any) => (
                  <Card key={ca.id} className="bg-white/5 border-white/10 rounded-[2.5rem] overflow-hidden hover:bg-white/[0.08] transition-all group cursor-pointer border border-transparent hover:border-primary/20">
                     <CardContent className="p-10 space-y-6">
                        <div className="flex justify-between items-center">
                           <Badge className="bg-primary text-white border-none px-3 py-1 font-black uppercase text-[9px] tracking-widest">
                              {ca.category}
                           </Badge>
                           <span className="text-[10px] font-black text-white/40 uppercase tracking-widest flex items-center gap-2">
                              <Calendar className="h-3 w-3" /> {ca.date}
                           </span>
                        </div>
                        <h4 className="text-xl font-bold leading-tight group-hover:text-primary transition-colors">{ca.title}</h4>
                        <p className="text-sm text-slate-400 line-clamp-3 leading-relaxed font-medium">{ca.summary}</p>
                        <div className="pt-4 border-t border-white/5 flex items-center gap-2 text-primary font-black uppercase tracking-widest text-[10px]">
                           Start Analysis <ChevronRight className="h-3.5 w-3.5" />
                        </div>
                     </CardContent>
                  </Card>
               ))}
            </div>
         </div>
      </section>

      {/* 4. Upcoming Exams High Fidelity Grid */}
      <section className="py-24 bg-white">
         <div className="container mx-auto px-6 max-w-7xl">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-16">
               <h2 className="text-3xl font-headline font-black text-[#0F172A] uppercase flex items-center gap-3">
                  <GraduationCap className="h-7 w-7 text-primary" /> Upcoming 2026 Notifications
               </h2>
               <p className="text-sm font-bold text-slate-400 italic">Stay ahead of the competition.</p>
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
      <Card className="border-none shadow-xl shadow-slate-200/50 rounded-[2rem] bg-white overflow-hidden group">
         <div className="h-40 w-full bg-slate-100 relative grayscale group-hover:grayscale-0 transition-all duration-500">
            <Image src={`https://picsum.photos/seed/${name}/400/500`} fill alt={name} className="object-cover" />
            <div className="absolute top-4 right-4 h-10 w-10 bg-white rounded-xl shadow-lg flex items-center justify-center">
               <Trophy className="text-amber-500 h-5 w-5" />
            </div>
         </div>
         <CardContent className="p-6 text-center space-y-1">
            <p className="text-sm font-black text-[#0F172A] uppercase">{name}</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{exam}</p>
            <div className="pt-2">
               <Badge className="bg-emerald-500/10 text-emerald-600 border-none text-[9px] font-black">{rank} • {year}</Badge>
            </div>
         </CardContent>
      </Card>
   )
}

function UpcomingExamCard({ board, name, date, vacancies }: any) {
   return (
      <div className="p-8 rounded-[2rem] bg-[#F8FAFC] border border-slate-100 flex items-center justify-between hover:bg-white hover:shadow-2xl transition-all cursor-pointer group">
         <div className="space-y-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-primary">{board} Official</span>
            <h4 className="text-lg font-headline font-black text-[#0F172A] group-hover:text-primary transition-colors">{name}</h4>
            <div className="flex items-center gap-4 text-[10px] font-bold text-slate-400">
               <span className="flex items-center gap-1.5"><Calendar className="h-3 w-3" /> {date}</span>
               <span className="flex items-center gap-1.5"><CheckCircle2 className="h-3 w-3 text-emerald-500" /> {vacancies} Vacancies</span>
            </div>
         </div>
         <div className="h-10 w-10 rounded-full border border-slate-200 flex items-center justify-center group-hover:bg-primary group-hover:border-primary transition-all">
            <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-white" />
         </div>
      </div>
   )
}
