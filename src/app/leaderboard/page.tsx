"use client"

import React, { useMemo, useState, useEffect, Suspense } from "react"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import { useCollection, useFirestore, useUser, useDoc } from "@/firebase"
import { collection, query, orderBy, limit, doc, getDocs } from "firebase/firestore"
import { Trophy, ShieldCheck, Search, Activity, Zap, Star, Medal, Target, ChevronRight, X, Filter, BarChart3, Users, Layout, Timer, Loader2 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
import StudentAvatar from "@/components/brand/StudentAvatar"
import { cn } from "@/lib/utils"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"

/**
 * @fileOverview Official Merit Registry Hub v11.1.
 * UPDATED: Integrated adaptive dark mode support for podium and list entries.
 */

export default function LeaderboardPage() {
  return (
    <Suspense fallback={<div className="h-screen w-full flex flex-col items-center justify-center bg-background"><Loader2 className="animate-spin text-primary" /></div>}>
      <LeaderboardContent />
    </Suspense>
  )
}

function LeaderboardContent() {
  const db = useFirestore()
  const { user } = useUser()
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [searchTerm, setSearchTerm] = useState("")
  const [mounted, setMounted] = useState(false)
  const [manualList, setManualList] = useState<any[]>([])
  const [loadingList, setLoadingList] = useState(true)
  
  useEffect(() => { setMounted(true) }, []);

  const mockId = searchParams.get('id');

  useEffect(() => {
     if (!db || !mounted) return;
     async function fetchAndSort() {
        setLoadingList(true);
        try {
           const baseRef = mockId ? collection(db, "leaderboards", mockId, "entries") : collection(db, "leaderboard"); 
           const q = query(baseRef, orderBy("highestScore", "desc"), limit(200));
           const snap = await getDocs(q);
           const entries = snap.docs.map(d => ({ ...d.data(), id: d.id }));
           const sorted = entries.sort((a: any, b: any) => {
              if (b.highestScore !== a.highestScore) return b.highestScore - a.highestScore;
              if (b.accuracy !== a.accuracy) return b.accuracy - a.accuracy;
              if (a.timeTaken !== b.timeTaken) return a.timeTaken - b.timeTaken;
              return (a.submittedAt?.seconds || 0) - (b.submittedAt?.seconds || 0);
           });
           setManualList(sorted);
        } catch (e) { console.error(e); } finally { setLoadingList(false); }
     }
     fetchAndSort();
  }, [db, mounted, mockId]);

  const { data: mockData } = useDoc<any>(useMemo(() => (db && mockId ? doc(db, "mocks", mockId) : null), [db, mockId]));

  const filteredList = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    return manualList.filter((r: any) => {
        const name = (r.userName || r.displayName || "Aspirant").toLowerCase();
        return !term || name.includes(term);
    });
  }, [manualList, searchTerm]);

  const podium = useMemo(() => filteredList.slice(0, 3), [filteredList]);
  const listItems = useMemo(() => filteredList.slice(3), [filteredList]);

  const formatTime = (secs: number) => {
     const m = Math.floor(secs / 60); const s = secs % 60;
     return `${m}m ${s}s`;
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-background font-body text-left selection:bg-primary/10 flex flex-col overflow-x-hidden">
      <Navbar />
      <main className="flex-1 w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-16 space-y-8 md:space-y-12 pb-32">
         <section className="space-y-4 px-1 text-center md:text-left">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
               <div className="space-y-2">
                  <div className="flex items-center justify-center md:justify-start gap-3">
                     <Trophy className="h-6 w-6 text-amber-500" />
                     <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Official merit registry</span>
                  </div>
                  <h1 className="text-3xl md:text-6xl font-black text-foreground tracking-tighter">
                    {mockData?.title || "Merit Registry"}
                  </h1>
                  <p className="text-muted-foreground font-medium text-sm md:text-xl">Rankings based on the verified best attempts of candidates.</p>
               </div>
               <div className="flex items-center gap-4 bg-card border border-border p-4 rounded-2xl shadow-xl shrink-0 mx-auto md:mx-0">
                  <Users className="h-6 w-6 text-primary" />
                  <div className="text-left">
                     <p className="text-[9px] font-bold text-muted-foreground uppercase leading-none">Total candidates</p>
                     <p className="text-2xl font-black text-foreground tabular-nums leading-none mt-1">{manualList.length}</p>
                  </div>
               </div>
            </div>
         </section>

         <div className="bg-background -mx-4 px-4 py-6 border-b border-border">
            <div className="max-w-4xl mx-auto flex flex-col md:flex-row gap-4 items-center">
               <div className="relative group flex-1 w-full">
                  <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                  <Input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Search candidate by name..." className="h-14 md:h-16 pl-14 pr-12 rounded-2xl bg-card border-border shadow-xl text-base md:text-lg font-bold placeholder:text-muted-foreground focus-visible:ring-4 focus-visible:ring-primary/5 transition-all" />
                  {searchTerm && (
                    <button onClick={() => setSearchTerm('')} className="absolute right-4 top-1/2 -translate-y-1/2 p-2 hover:bg-muted rounded-full transition-all border-none bg-transparent cursor-pointer"><X className="h-4 w-4 text-muted-foreground" /></button>
                  )}
               </div>
               <Link href="/mocks" className="w-full md:w-auto">
                  <Button variant="outline" className="w-full md:w-auto h-14 md:h-16 rounded-2xl px-8 font-bold text-[10px] uppercase tracking-widest border-2">All tests</Button>
               </Link>
            </div>
         </div>

         {!searchTerm && filteredList.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-10 pt-8">
               <PodiumCard rank={1} data={podium[0]} order="order-1 md:order-2" isMain formatTime={formatTime} currentUser={user?.uid} />
               <PodiumCard rank={2} data={podium[1]} order="order-2 md:order-1" formatTime={formatTime} currentUser={user?.uid} />
               <PodiumCard rank={3} data={podium[2]} order="order-3 md:order-3" formatTime={formatTime} currentUser={user?.uid} />
            </div>
         ) : null}

         <div className="max-w-5xl mx-auto space-y-3">
            <AnimatePresence mode="popLayout">
               {loadingList ? (
                  Array.from({ length: 8 }).map((_, i) => (
                     <div key={i} className="h-20 w-full bg-muted rounded-2xl border border-border animate-pulse" />
                  ))
               ) : filteredList.length > 0 ? (
                  (searchTerm ? filteredList : listItems).map((entry, idx) => {
                     const isCurrent = user?.uid === entry.userId || user?.uid === entry.uid;
                     return (
                        <motion.div key={entry.userId || entry.uid} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ delay: idx * 0.02 }}>
                           <Card className={cn("border border-border shadow-sm hover:shadow-4xl transition-all duration-300 rounded-2xl bg-card group overflow-hidden", isCurrent && "ring-2 ring-primary bg-primary/[0.02] dark:bg-primary/[0.05] shadow-xl")}>
                              <CardContent className="p-0 flex items-center h-[72px] md:h-[90px]">
                                 <div className="w-12 md:w-20 flex items-center justify-center shrink-0">
                                    <span className="text-lg md:text-3xl font-black text-muted-foreground opacity-30 group-hover:text-primary transition-colors tabular-nums">#{searchTerm ? idx + 1 : idx + 4}</span>
                                 </div>
                                 <div className="flex-1 flex items-center gap-4 min-w-0 pr-4">
                                    <StudentAvatar profile={{ name: entry.userName || entry.displayName, photoURL: entry.photoURL, gender: entry.gender }} className="h-10 w-10 md:h-14 md:w-14 rounded-xl shrink-0 shadow-inner bg-muted" />
                                    <div className="min-w-0 flex-1 text-left">
                                       <h4 className="font-bold text-sm md:text-xl text-foreground truncate leading-tight group-hover:text-primary transition-colors uppercase tracking-tight">{entry.userName || entry.displayName}</h4>
                                       {isCurrent && <Badge className="bg-primary text-white border-none text-[8px] font-bold px-2 h-4 mt-1">YOU</Badge>}
                                    </div>
                                 </div>
                                 <div className="flex items-center gap-6 md:gap-12 px-6 md:px-12 shrink-0">
                                    <Metric label="Score" val={(entry.highestScore || 0).toFixed(1)} color="text-foreground" />
                                    <Metric label="Accuracy" val={`${entry.accuracy || 0}%`} color="text-emerald-500" className="hidden sm:block" />
                                    <Metric label="Time" val={formatTime(entry.timeTaken || 0)} color="text-muted-foreground" className="hidden lg:block" />
                                    <ChevronRight className="h-5 w-5 text-muted-foreground opacity-20 group-hover:text-primary group-hover:translate-x-1 transition-all shrink-0" />
                                 </div>
                              </CardContent>
                           </Card>
                        </motion.div>
                     )
                  })
               ) : (
                  <div className="py-40 text-center opacity-30 italic font-black uppercase text-xl md:text-3xl flex flex-col items-center gap-10">
                     <Layout className="h-20 w-20 text-muted-foreground" />
                     <p>Leaderboard empty</p>
                  </div>
               )}
            </AnimatePresence>
         </div>
      </main>
      <Footer />
    </div>
  )
}

function Metric({ label, val, color, className }: any) {
   return (
      <div className={cn("text-right min-w-[60px] md:min-w-[80px]", className)}>
         <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest">{label}</p>
         <p className={cn("text-sm md:text-2xl font-black tabular-nums tracking-tighter leading-none mt-1", color)}>{val}</p>
      </div>
   )
}

function PodiumCard({ rank, data, order, isMain, formatTime, currentUser }: any) {
   if (!data) return <div className={cn("bg-card border border-dashed border-border rounded-[3rem] p-4 h-64 flex items-center justify-center opacity-40", order)}><Trophy className="h-10 w-10 text-muted-foreground" /></div>;
   const isCurrent = currentUser === (data.userId || data.uid);
   return (
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: rank * 0.1 }} className={cn("flex", order)}>
         <Card className={cn("border-none shadow-xl transition-all duration-500 rounded-[2rem] p-5 md:p-8 flex flex-col items-center text-center group hover:-translate-y-1 relative overflow-hidden w-full", isMain ? "bg-[#0F172A] dark:bg-primary text-white ring-8 ring-primary/10 scale-[1.02] z-10" : "bg-card text-foreground", isCurrent && !isMain && "ring-4 ring-primary/20")}>
            <div className={cn("absolute top-4 left-4 h-7 w-7 rounded-lg flex items-center justify-center text-white font-black text-[10px] shadow-2xl", rank === 1 ? "bg-amber-400" : rank === 2 ? "bg-slate-300" : "bg-orange-400")}>#{rank}</div>
            <div className="absolute top-0 right-0 p-4 opacity-5 rotate-12 group-hover:scale-110 transition-transform">{rank === 1 ? <Medal className="h-16 w-16" /> : <Trophy className="h-16 w-16" />}</div>
            <div className="space-y-4 relative z-10 w-full flex flex-col items-center text-center">
               <div className="relative inline-block">
                  <StudentAvatar profile={{ name: data.userName || data.displayName, photoURL: data.photoURL, gender: data.gender }} className={cn("rounded-[1.5rem] border-[3px] shadow-xl transition-all group-hover:scale-105", isMain ? "h-20 w-20 md:h-24 md:w-24 border-white/20" : "h-16 w-16 md:h-20 md:w-20 border-border")} />
                  {rank === 1 && <div className="absolute -top-2 -right-2 bg-amber-400 text-white h-7 w-7 rounded-full flex items-center justify-center shadow-xl animate-bounce"><Star className="h-4 w-4 fill-current" /></div>}
               </div>
               <div className="space-y-1.5 flex flex-col items-center text-center">
                  <h3 className="text-base md:text-xl font-bold truncate max-w-[180px] leading-tight tracking-tight uppercase">{data.userName || data.displayName}</h3>
                  {isCurrent && <Badge className="bg-primary text-white border-none text-[7px] font-bold px-2 shadow-lg">YOU</Badge>}
               </div>
               <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border w-full">
                  <div className="text-center space-y-1">
                     <p className="text-[7px] font-bold text-muted-foreground uppercase tracking-widest">Score</p>
                     <p className={cn("text-base md:text-2xl font-black tabular-nums tracking-tighter", isMain ? "text-white" : "text-primary")}>{(data.highestScore || 0).toFixed(1)}</p>
                  </div>
                  <div className="text-center space-y-1">
                     <p className="text-[7px] font-bold text-muted-foreground uppercase tracking-widest">Accuracy</p>
                     <p className={cn("text-base md:text-2xl font-black tabular-nums tracking-tighter", isMain ? "text-emerald-400" : "text-foreground")}>{data.accuracy || 0}%</p>
                  </div>
               </div>
               <div className="pt-1"><p className="text-[8px] font-bold text-muted-foreground flex items-center justify-center gap-2 uppercase tracking-widest"><Timer className="h-2.5 w-2.5" /> {formatTime(data.timeTaken || 0)}</p></div>
            </div>
         </Card>
      </motion.div>
   )
}