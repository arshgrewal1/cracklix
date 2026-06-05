
"use client"

import React, { useMemo, ReactNode } from "react";
import Navbar from "@/components/layout/Navbar";
import Hero from "@/components/home/Hero";
import PopularExams from "@/components/home/PopularExams";
import LatestMocks from "@/components/home/LatestMocks";
import Features from "@/components/home/Features";
import AppPreview from "@/components/home/AppPreview";
import Footer from "@/components/layout/Footer";
import { useCollection, useFirestore, useUser } from "@/firebase";
import { collection, query, limit, where } from "firebase/firestore";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Zap, 
  ShieldCheck, 
  Sparkles, 
  BookOpen, 
  ClipboardList,
  Users,
  ArrowRight,
  PlayCircle,
  BrainCircuit,
  ChevronRight,
  Bell,
  Layers,
  FileText,
  Newspaper,
  Map as MapIcon,
  Globe
} from "lucide-react";
import Link from "next/link";
import { PlaceHolderImages } from "@/lib/placeholder-images";

/**
 * @fileOverview Final Dynamic Homepage Hub v5.0.
 * Divided into Regional (Punjab) and National (India) coverage nodes.
 */

export default function HomePage() {
  const db = useFirestore();
  const { user } = useUser();
  
  const punjabMap = PlaceHolderImages.find(img => img.id === 'map-punjab')?.imageUrl;
  const indiaMap = PlaceHolderImages.find(img => img.id === 'map-india')?.imageUrl;

  const noticeQuery = useMemo(() => (db ? query(collection(db, "notifications"), limit(10)) : null), [db]);
  const { data: allNotices } = useCollection<any>(noticeQuery);

  const notices = useMemo(() => {
    if (!allNotices) return []
    return [...allNotices].sort((a, b) => {
      const timeA = a.createdAt?.seconds || 0
      const timeB = b.createdAt?.seconds || 0
      return timeB - timeA
    }).slice(0, 5)
  }, [allNotices])

  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      
      <Hero />

      {/* Trust Bar */}
      <section className="bg-[#08152D] py-12 relative overflow-hidden border-b border-white/5">
         <div className="container mx-auto px-6 max-w-7xl relative z-10">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12 text-center items-center">
               <TrustMetric icon={<BookOpen className="text-primary h-8 w-8" />} label="Verified MCQs" value="10k+" />
               <TrustMetric icon={<ClipboardList className="text-blue-400 h-8 w-8" />} label="Official Mocks" value="500+" />
               <TrustMetric icon={<Users className="text-emerald-400 h-8 w-8" />} label="Aspirants" value="15k+" />
               <TrustMetric icon={<ShieldCheck className="text-amber-400 h-8 w-8" />} label="2026 Ready" value="Verified" />
            </div>
         </div>
      </section>

      {/* NEW: Regional & National Coverage Section */}
      <section className="py-32 bg-white overflow-hidden">
         <div className="container mx-auto px-6 max-w-7xl">
            <div className="text-center mb-20 space-y-4">
               <Badge className="bg-primary/10 text-primary border-none uppercase text-[10px] font-black px-6 py-2 rounded-full tracking-[0.3em]">Institutional Coverage</Badge>
               <h2 className="text-4xl lg:text-7xl font-headline font-black text-[#0F172A] uppercase leading-none">Global <span className="text-primary">Registry</span></h2>
               <p className="text-slate-500 text-xl font-medium max-w-2xl mx-auto">Access preparation nodes across all Punjab state and National recruitment boards.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
               {/* Punjab Node */}
               <Link href="/exams">
                  <Card className="group border-none shadow-4xl rounded-[4rem] overflow-hidden bg-slate-50 h-[600px] relative transition-all hover:translate-y-[-10px]">
                     <img 
                        src={punjabMap!} 
                        className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-110 transition-transform duration-[2s]" 
                        referrerPolicy="no-referrer"
                     />
                     <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A] via-[#0F172A]/20 to-transparent" />
                     <CardContent className="absolute bottom-0 left-0 right-0 p-16 space-y-6">
                        <div className="h-16 w-16 bg-primary rounded-3xl flex items-center justify-center shadow-2xl">
                           <MapIcon className="h-8 w-8 text-white" />
                        </div>
                        <div className="space-y-2">
                           <h3 className="text-5xl font-headline font-black text-white uppercase tracking-tighter">Punjab Verticals</h3>
                           <p className="text-slate-400 text-lg font-medium leading-relaxed">PSSSB, PPSC, Punjab Police, and State Power sectors. 22 districts covered.</p>
                        </div>
                        <Button className="bg-white text-[#0F172A] font-black uppercase text-[10px] tracking-widest px-8 h-14 rounded-2xl group-hover:bg-primary group-hover:text-white transition-all">
                           Explore State Hub <ChevronRight className="ml-2 h-4 w-4" />
                        </Button>
                     </CardContent>
                  </Card>
               </Link>

               {/* India Node */}
               <Link href="/exams">
                  <Card className="group border-none shadow-4xl rounded-[4rem] overflow-hidden bg-slate-50 h-[600px] relative transition-all hover:translate-y-[-10px]">
                     <img 
                        src={indiaMap!} 
                        className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-110 transition-transform duration-[2s]" 
                        referrerPolicy="no-referrer"
                     />
                     <div className="absolute inset-0 bg-gradient-to-t from-[#08152D] via-[#08152D]/20 to-transparent" />
                     <CardContent className="absolute bottom-0 left-0 right-0 p-16 space-y-6">
                        <div className="h-16 w-16 bg-blue-600 rounded-3xl flex items-center justify-center shadow-2xl">
                           <Globe className="h-8 w-8 text-white" />
                        </div>
                        <div className="space-y-2">
                           <h3 className="text-5xl font-headline font-black text-white uppercase tracking-tighter">National Registry</h3>
                           <p className="text-slate-400 text-lg font-medium leading-relaxed">Indian Army, Agniveer, CTET, and Central Government nodes.</p>
                        </div>
                        <Button className="bg-white text-[#08152D] font-black uppercase text-[10px] tracking-widest px-8 h-14 rounded-2xl group-hover:bg-blue-600 group-hover:text-white transition-all">
                           Explore National Hub <ChevronRight className="ml-2 h-4 w-4" />
                        </Button>
                     </CardContent>
                  </Card>
               </Link>
            </div>
         </div>
      </section>

      <LatestMocks />
      
      <section className="py-24 bg-[#F8FAFC]">
         <div className="container mx-auto px-6 max-w-7xl">
            <div className="text-center mb-16 space-y-3">
               <Badge className="bg-primary/10 text-primary border-none uppercase text-[10px] font-black px-6 py-2 rounded-full">Preparation Mastery</Badge>
               <h2 className="text-4xl lg:text-6xl font-headline font-black text-[#0F172A] uppercase">Modular <span className="text-primary">Practice</span></h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
               <QuickCategory href="/mocks" icon={<Layers className="text-blue-500" />} label="Subject Tests" desc="Reasoning, Quant, GK" />
               <QuickCategory href="/mocks" icon={<Zap className="text-amber-500" />} label="Sectionals" desc="Topic-wise audits" />
               <QuickCategory href="/pyqs" icon={<FileText className="text-emerald-500" />} label="PYQ Archive" desc="Authentic Papers" />
               <QuickCategory href="/current-affairs" icon={<Newspaper className="text-rose-500" />} label="CA Quizzes" desc="Daily Analysis" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mt-32">
               <div className="lg:col-span-8">
                  <PopularExams />
               </div>

               <div className="lg:col-span-4 space-y-8">
                  <Card className="rounded-[3rem] border-none bg-[#0F172A] text-white p-12 overflow-hidden relative shadow-4xl group">
                     <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12 group-hover:scale-110 transition-transform"><Sparkles className="h-40 w-40" /></div>
                     <div className="relative z-10 space-y-8">
                        <div className="flex items-center gap-4">
                           <div className="h-14 w-14 bg-primary rounded-2xl flex items-center justify-center shadow-2xl"><BrainCircuit className="h-7 w-7 text-white" /></div>
                           <h4 className="text-xl font-headline font-black text-left uppercase">Aspirant Mastery</h4>
                        </div>
                        <div className="p-8 bg-white/5 rounded-[2rem] border border-white/5">
                           <p className="text-slate-300 text-lg italic text-left">"Consistency is the key to conquering PSSSB benchmarks."</p>
                        </div>
                        <Button asChild className="w-full bg-white text-[#0F172A] hover:bg-slate-100 h-16 rounded-2xl font-black uppercase text-xs">
                           <Link href="/dashboard">Access Dashboard</Link>
                        </Button>
                     </div>
                  </Card>

                  <Card className="rounded-[3rem] border-none shadow-2xl bg-white p-12 overflow-hidden relative">
                     <div className="flex items-center justify-between mb-10 relative z-10">
                        <h3 className="font-headline font-black text-2xl flex items-center gap-4 text-[#0F172A]">
                           <Bell className="h-6 w-6 text-primary" /> Exam Gazette
                        </h3>
                     </div>
                     <div className="space-y-8 relative z-10">
                        {notices && notices.length > 0 ? notices.map((n: any) => (
                           <Link key={n.id} href="/notifications" className="flex gap-6 group cursor-pointer border-b border-slate-50 pb-8 last:border-0 last:pb-0">
                              <div className={`h-14 w-14 rounded-2xl flex items-center justify-center shrink-0 bg-slate-50 text-slate-400 group-hover:bg-primary/10 group-hover:text-primary transition-all`}>
                                 <Zap className="h-7 w-7" />
                              </div>
                              <div className="space-y-1.5 text-left">
                                 <p className="text-base font-bold leading-snug group-hover:text-primary transition-colors truncate">{n.title}</p>
                                 <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{n.time}</span>
                              </div>
                           </Link>
                        )) : (
                          <p className="text-slate-400 text-center py-10 font-bold uppercase tracking-widest text-[10px]">Registry Syncing...</p>
                        )}
                        <Button asChild variant="ghost" className="w-full text-primary font-black uppercase text-[10px] tracking-widest rounded-2xl h-16 border-2 border-dashed border-primary/10">
                           <Link href="/notifications">Full Feed <ChevronRight className="ml-2 h-4 w-4" /></Link>
                        </Button>
                     </div>
                  </Card>
               </div>
            </div>
         </div>
      </section>

      <Features />
      <AppPreview />
      <Footer />
    </main>
  );
}

function TrustMetric({ icon, label, value }: { icon: ReactNode, label: string, value: string | number }) {
   return (
      <div className="space-y-2 group">
         <div className="flex justify-center transition-transform group-hover:scale-110">{icon}</div>
         <p className="text-3xl lg:text-5xl font-headline font-black text-white tracking-tighter leading-none">{value}</p>
         <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">{label}</p>
      </div>
   )
}

function QuickCategory({ icon, label, desc, href }: any) {
   return (
      <Link href={href}>
         <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-50 flex flex-col items-center gap-6 group hover:translate-y-[-8px] transition-all duration-500 h-full">
            <div className="h-16 w-16 rounded-[2rem] bg-slate-50 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
               <div className="h-8 w-8">{icon}</div>
            </div>
            <div className="text-center">
               <h4 className="font-headline font-black text-xl text-[#0F172A] uppercase">{label}</h4>
               <p className="text-xs font-bold text-slate-400 uppercase">{desc}</p>
            </div>
         </div>
      </Link>
   )
}
