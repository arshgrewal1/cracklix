
"use client"

import Navbar from "@/components/layout/Navbar";
import Hero from "@/components/home/Hero";
import PopularExams from "@/components/home/PopularExams";
import LatestMocks from "@/components/home/LatestMocks";
import Features from "@/components/home/Features";
import AppPreview from "@/components/home/AppPreview";
import Footer from "@/components/layout/Footer";
import { useCollection, useFirestore, useUser } from "@/firebase";
import { collection, query, orderBy, limit, where } from "firebase/firestore";
import { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  CalendarDays, 
  ChevronRight, 
  Trophy, 
  Zap, 
  ShieldCheck, 
  TrendingUp, 
  BrainCircuit, 
  Sparkles, 
  BookOpen, 
  ClipboardList,
  Users,
  ArrowRight,
  Bell,
  PlayCircle,
  Timer,
  CheckCircle2
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

/**
 * @fileOverview Final Dynamic Homepage Module (Phase 154).
 * Features: Personalized recommendations and "Daily Quiz" widget.
 */

export default function HomePage() {
  const db = useFirestore();
  const { user } = useUser();
  
  const caQuery = useMemo(() => (db ? query(collection(db, "current_affairs"), orderBy("date", "desc"), limit(3)) : null), [db]);
  const { data: latestCA } = useCollection<any>(caQuery);

  const noticeQuery = useMemo(() => (db ? query(collection(db, "notifications"), orderBy("createdAt", "desc"), limit(5)) : null), [db]);
  const { data: notices } = useCollection<any>(noticeQuery);

  const sessionQuery = useMemo(() => {
    if (!db || !user) return null
    return query(collection(db, "test_sessions"), where("userId", "==", user.uid), where("status", "==", "IN_PROGRESS"), orderBy("updatedAt", "desc"), limit(1))
  }, [db, user])
  const { data: activeSessions } = useCollection<any>(sessionQuery)
  const lastSession = activeSessions?.[0]

  const { data: usersCount } = useCollection<any>(useMemo(() => (db ? collection(db, "users") : null), [db]));

  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      
      {/* Personalized Welcome for Aspirants */}
      {user && (
         <div className="bg-slate-50 border-b border-slate-100 py-6">
            <div className="container mx-auto px-6 max-w-7xl flex flex-col md:flex-row items-center justify-between gap-6">
               <div className="flex items-center gap-6">
                  <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                     <Trophy className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                     <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Active Preparedness</p>
                     <h2 className="text-xl font-headline font-black text-[#0F172A]">Welcome back, Aspirant Node</h2>
                  </div>
               </div>
               
               <div className="flex items-center gap-4">
                  {lastSession && (
                     <Button asChild variant="outline" className="rounded-xl h-12 px-6 border-orange-200 bg-orange-50 text-orange-600 font-black uppercase text-[10px] tracking-widest gap-3 shadow-sm">
                        <Link href={`/mocks/${lastSession.mockId}/attempt`}>
                           <PlayCircle className="h-4 w-4" /> Resume {lastSession.mockId.split('-')[0]}
                        </Link>
                     </Button>
                  )}
                  <Button asChild className="rounded-xl bg-[#0F172A] hover:bg-black text-white font-black uppercase text-[10px] tracking-widest h-12 px-8 gap-3">
                     <Link href="/dashboard">View Full Audit <ArrowRight className="h-4 w-4" /></Link>
                  </Button>
               </div>
            </div>
         </div>
      )}

      <Hero />

      {/* Trust & Authority Bar */}
      <section className="bg-[#08152D] border-y border-white/5 py-12 relative overflow-hidden">
         <div className="absolute top-0 right-0 p-20 opacity-5 rotate-45"><ShieldCheck className="h-64 w-64 text-white" /></div>
         <div className="container mx-auto px-6 max-w-7xl relative z-10">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-12 text-center items-center">
               <TrustMetric icon={<BookOpen className="text-primary" />} label="Punjab Verified MCQs" value="10,000+" />
               <TrustMetric icon={<ClipboardList className="text-blue-400" />} label="Institutional Mocks" value="500+" />
               <TrustMetric icon={<Users className="text-emerald-400" />} label="Active Aspirant Nodes" value={`${usersCount?.length || '15,000'}+`} />
               <TrustMetric icon={<ShieldCheck className="text-amber-400" />} label="2026 Board Patterns" value="Verified" />
            </div>
         </div>
      </section>
      
      <section className="py-12 bg-[#F8FAFC] -mt-1 relative z-20">
         <div className="container mx-auto px-6 max-w-7xl">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
               
               <div className="lg:col-span-8">
                  <PopularExams />

                  {/* Daily Quiz Widget (Phase 146) */}
                  <div className="mt-12 bg-white rounded-[3.5rem] p-12 shadow-3xl shadow-slate-900/5 border border-slate-100 overflow-hidden relative group">
                     <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform"><Timer className="h-32 w-32" /></div>
                     <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
                        <div className="space-y-4 text-center md:text-left">
                           <div className="flex items-center justify-center md:justify-start gap-3">
                              <Zap className="h-5 w-5 text-emerald-500" />
                              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Engagement Node</span>
                           </div>
                           <h3 className="text-3xl font-headline font-black text-[#0F172A] uppercase leading-tight">Daily Punjab <br/> Knowledge Audit</h3>
                           <p className="text-slate-500 font-medium">10 Questions • 5 Minutes • Instant Ranking</p>
                        </div>
                        <Button className="h-16 px-12 bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase tracking-widest text-xs rounded-2xl gap-3 shadow-2xl shadow-emerald-900/20 group">
                           Start Daily Quiz <ArrowRight className="h-4 w-4 group-hover:translate-x-2 transition-transform" />
                        </Button>
                     </div>
                  </div>
               </div>

               <div className="lg:col-span-4 space-y-8 pt-16">
                  {/* Daily Mastery Challenge */}
                  <Card className="rounded-[3rem] border-none bg-[#0F172A] text-white p-12 overflow-hidden relative shadow-4xl group">
                     <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12 group-hover:scale-110 transition-transform"><Sparkles className="h-40 w-40" /></div>
                     <div className="relative z-10 space-y-8">
                        <div className="flex items-center gap-4">
                           <div className="h-14 w-14 bg-primary rounded-2xl flex items-center justify-center shadow-2xl"><BrainCircuit className="h-7 w-7 text-white" /></div>
                           <div className="space-y-0.5">
                              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Aspirant Mastery</span>
                              <h4 className="text-xl font-headline font-black leading-tight uppercase">Daily Fact Node</h4>
                           </div>
                        </div>
                        <div className="p-8 bg-white/5 rounded-[2rem] border border-white/5 shadow-inner">
                           <p className="text-slate-300 text-lg leading-relaxed font-medium italic">"Punjab became a part of the British Empire in March 1849 following the Second Anglo-Sikh War."</p>
                        </div>
                        <Button asChild className="w-full bg-white text-[#0F172A] hover:bg-slate-100 h-16 rounded-2xl font-black uppercase tracking-widest text-xs shadow-3xl">
                           <Link href="/dashboard">Attempt & Earn XP</Link>
                        </Button>
                     </div>
                  </Card>

                  {/* Official Recruitment Gazette */}
                  <Card className="rounded-[3rem] border-none shadow-2xl bg-white p-12 overflow-hidden relative">
                     <div className="absolute top-0 right-0 p-8 opacity-5"><Bell className="h-24 w-24" /></div>
                     <div className="flex items-center justify-between mb-10 relative z-10">
                        <h3 className="font-headline font-black text-2xl flex items-center gap-4 text-[#0F172A]">
                           <Bell className="h-6 w-6 text-primary" /> Official Gazette
                        </h3>
                        <div className="flex items-center gap-2">
                           <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                           <span className="text-[10px] font-black uppercase text-emerald-600 tracking-widest">Active</span>
                        </div>
                     </div>
                     <div className="space-y-8 relative z-10">
                        {notices && notices.length > 0 ? notices.map((n: any) => (
                           <Link key={n.id} href="/notifications" className="flex gap-6 group cursor-pointer border-b border-slate-50 pb-8 last:border-0 last:pb-0">
                              <div className={`h-14 w-14 rounded-2xl flex items-center justify-center shrink-0 transition-all duration-300 ${
                                n.category === 'Result' ? 'bg-emerald-50 text-emerald-500' : 
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
                             <p className="text-xs uppercase font-black tracking-widest text-[#0F172A]">Syncing official feeds...</p>
                          </div>
                        )}
                        <Button asChild variant="ghost" className="w-full pt-8 text-[11px] font-black uppercase tracking-[0.2em] text-primary hover:bg-primary/5 rounded-2xl border-2 border-dashed border-primary/10 h-20">
                           <Link href="/notifications">Full Authority Gazette <ChevronRight className="ml-2 h-4 w-4" /></Link>
                        </Button>
                     </div>
                  </Card>
               </div>
            </div>
         </div>
      </section>

      <LatestMocks />
      <Features />
      <AppPreview />
      <Footer />
    </main>
  );
}

function TrustMetric({ icon, label, value }: any) {
   return (
      <div className="space-y-3 group">
         <div className="flex justify-center transition-transform group-hover:scale-110">{icon}</div>
         <p className="text-4xl font-headline font-black text-white tracking-tight">{value}</p>
         <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">{label}</p>
      </div>
   )
}
