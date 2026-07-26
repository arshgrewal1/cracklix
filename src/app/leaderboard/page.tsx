"use client"

import React, { useMemo, useState, useEffect, Suspense } from "react"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import { useCollection, useFirestore, useUser, useDoc } from "@/firebase"
import { collection, query, orderBy, limit, doc } from "firebase/firestore"
import { Trophy, ShieldCheck, Search, Activity, Zap, Star, Medal, Target, ChevronRight, X, Filter, BarChart3, Users, Layout } from "lucide-react"
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
 * @fileOverview Official Punjab Merit Registry v4.0 [Test Specific Rebuilt].
 */

export default function LeaderboardPage() {
  return (
    <Suspense fallback={<div className="h-screen w-full flex items-center justify-center bg-white"><Loader2 className="animate-spin text-primary" /></div>}>
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
  
  useEffect(() => {
    setMounted(true)
  }, []);

  const mockId = searchParams.get('id');

  // Registry Node: Mock Specific Leaderboard
  const lbQuery = useMemo(() => {
    if (!db || !mounted) return null;
    
    const baseRef = mockId 
      ? collection(db, "leaderboards", mockId, "entries")
      : collection(db, "global_leaderboard"); // Fallback for global if id is missing

    return query(
      baseRef,
      orderBy("highestScore", "desc"),
      orderBy("accuracy", "desc"),
      orderBy("timeTaken", "asc"),
      orderBy("submittedAt", "asc"),
      limit(100)
    );
  }, [db, mounted, mockId]);

  const { data: meritList, loading } = useCollection<any>(lbQuery);
  const { data: mockData } = useDoc<any>(useMemo(() => (db && mockId ? doc(db, "mocks", mockId) : null), [db, mockId]));

  const filteredList = useMemo(() => {
    if (!meritList) return []
    const term = searchTerm.toLowerCase().trim();
    
    return meritList.filter((r: any) => {
        const name = (r.userName || "Aspirant").toLowerCase();
        return !term || name.includes(term);
    });
  }, [meritList, searchTerm]);

  const podium = useMemo(() => filteredList.slice(0, 3), [filteredList]);
  const listItems = useMemo(() => filteredList.slice(3), [filteredList]);

  const formatTime = (secs: number) => {
     const m = Math.floor(secs / 60);
     const s = secs % 60;
     return `${m}m ${s}s`;
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-body text-left selection:bg-primary/10 flex flex-col overflow-x-hidden">
      <Navbar />
      
      <main className="flex-1 w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-16 space-y-8 md:space-y-12 pb-32">
         
         <section className="space-y-4 px-1">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
               <div className="space-y-2">
                  <div className="flex items-center gap-3">
                     <Trophy className="h-6 w-6 text-amber-500" />
                     <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Official Merit Registry</span>
                  </div>
                  <h1 className="text-3xl md:text-6xl font-black text-[#0F172A] tracking-tighter antialiased">
                    {mockData?.title || "Test Standings"}
                  </h1>
                  <p className="text-slate-500 font-medium text-sm md:text-xl">Rankings based on the verified best attempts of candidates.</p>
               </div>
               
               <div className="flex items-center gap-4 bg-white border border-slate-100 p-4 rounded-2xl shadow-xl shrink-0">
                  <Users className="h-6 w-6 text-primary" />
                  <div className="text-left">
                     <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Total Candidates</p>
                     <p className="text-2xl font-black text-[#0F172A] tabular-nums leading-none mt-1">{meritList?.length || 0}</p>
                  </div>
               </div>
            </div>
         </section>

         <div className="sticky top-[84px] md:top-[116px] z-[45] bg-[#F8FAFC]/95 backdrop-blur-xl -mx-4 px-4 py-6 border-b border-slate-100">
            <div className="max-w-4xl mx-auto flex gap-4 items-center">
               <div className="relative group flex-1">
                  <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 group-focus-within:text-primary transition-colors" />
                  <Input 
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    placeholder="Search candidate by name..." 
                    className="h-14 md:h-16 pl-14 pr-12 rounded-2xl bg-white border-slate-200 shadow-xl text-base md:text-lg font-bold placeholder:text-slate-200 focus-visible:ring-4 focus-visible:ring-primary/5 transition-all"
                  />
                  {searchTerm && (
                    <button onClick={() => setSearchTerm('')} className="absolute right-4 top-1/2 -translate-y-1/2 p-2 hover:bg-slate-50 rounded-full transition-all">
                       <X className="h-4 w-4 text-slate-300" />
                    </button>
                  )}
               </div>
               <Link href="/mocks">
                  <Button variant="outline" className="h-14 md:h-16 rounded-2xl px-8 font-black uppercase text-[10px] tracking-widest border-2">
                     All Tests
                  </Button>
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
               {loading ? (
                  Array.from({ length: 8 }).map((_, i) => (
                     <div key={i} className="h-20 w-full bg-white rounded-2xl border border-slate-50 animate-pulse" />
                  ))
               ) : filteredList.length > 0 ? (
                  (searchTerm ? filteredList : listItems).map((entry, idx) => {
                     const isCurrent = user?.uid === entry.userId;
                     return (
                        <motion.div 
                           key={entry.userId}
                           layout
                           initial={{ opacity: 0, y: 10 }}
                           animate={{ opacity: 1, y: 0 }}
                           exit={{ opacity: 0, scale: 0.95 }}
                           transition={{ delay: idx * 0.02 }}
                        >
                           <Card className={cn(
                              "border border-slate-100 shadow-sm hover:shadow-4xl transition-all duration-300 rounded-2xl bg-white group overflow-hidden",
                              isCurrent && "ring-2 ring-primary bg-primary/[0.02] shadow-xl"
                           )}>
                              <CardContent className="p-0 flex items-center h-[72px] md:h-[90px]">
                                 <div className="w-12 md:w-20 flex items-center justify-center shrink-0">
                                    <span className="text-lg md:text-3xl font-black text-slate-200 group-hover:text-primary transition-colors tabular-nums">
                                       #{searchTerm ? idx + 1 : idx + 4}
                                    </span>
                                 </div>

                                 <div className="flex-1 flex items-center gap-4 min-w-0 pr-4">
                                    <StudentAvatar 
                                       profile={{ name: entry.userName, photoURL: entry.photoURL, gender: entry.gender }} 
                                       className="h-10 w-10 md:h-14 md:w-14 rounded-xl shrink-0 shadow-inner bg-slate-50" 
                                    />
                                    <div className="min-w-0 flex-1 text-left">
                                       <h4 className="font-bold text-sm md:text-xl text-[#0F172A] truncate leading-tight group-hover:text-primary transition-colors">
                                          {entry.userName}
                                       </h4>
                                       {isCurrent && <Badge className="bg-primary text-white border-none text-[8px] font-black uppercase px-2 py-0 h-4 mt-1">You</Badge>}
                                    </div>
                                 </div>

                                 <div className="flex items-center gap-6 md:gap-12 px-6 md:px-12 shrink-0">
                                    <Metric label="Score" val={entry.highestScore.toFixed(1)} color="text-[#0F172A]" />
                                    <Metric label="Accuracy" val={`${entry.accuracy}%`} color="text-emerald-600" className="hidden sm:block" />
                                    <Metric label="Time" val={formatTime(entry.timeTaken)} color="text-slate-400" className="hidden lg:block" />
                                    <ChevronRight className="h-5 w-5 text-slate-200 group-hover:text-primary group-hover:translate-x-1 transition-all shrink-0" />
                                 </div>
                              </CardContent>
                           </Card>
                        </motion.div>
                     )
                  })
               ) : (
                  <div className="py-40 text-center opacity-30 italic font-black uppercase text-xl md:text-3xl tracking-tighter flex flex-col items-center gap-10">
                     <Layout className="h-20 w-20 text-slate-200" />
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
         <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest">{label}</p>
         <p className={cn("text-sm md:text-2xl font-black tabular-nums tracking-tighter leading-none mt-1", color)}>{val}</p>
      </div>
   )
}

function PodiumCard({ rank, data, order, isMain, formatTime, currentUser }: any) {
   if (!data) return (
      <div className={cn("bg-white border border-dashed border-slate-200 rounded-[3rem] p-10 h-80 flex items-center justify-center opacity-40", order)}>
         <Trophy className="h-10 w-10 text-slate-200" />
      </div>
   );

   const isCurrent = currentUser === data.userId;

   return (
      <motion.div 
         initial={{ opacity: 0, y: 30 }}
         animate={{ opacity: 1, y: 0 }}
         transition={{ delay: rank * 0.1 }}
         className={cn("flex", order)}
      >
         <Card className={cn(
            "border-none shadow-xl transition-all duration-500 rounded-[3rem] p-8 md:p-12 flex flex-col items-center text-center group hover:-translate-y-2 relative overflow-hidden w-full",
            isMain ? "bg-[#0F172A] text-white ring-8 ring-primary/10 scale-[1.08] z-10" : "bg-white text-[#0F172A]",
            isCurrent && !isMain && "ring-4 ring-primary/20"
         )}>
            <div className={cn(
               "absolute top-8 left-8 h-10 w-10 rounded-2xl flex items-center justify-center text-white font-black text-sm md:text-lg shadow-2xl transition-transform group-hover:rotate-12",
               rank === 1 ? "bg-amber-400" : rank === 2 ? "bg-slate-300" : "bg-orange-400"
            )}>
               #{rank}
            </div>

            <div className="absolute top-0 right-0 p-8 opacity-5 rotate-12 group-hover:scale-110 transition-transform">
               {rank === 1 ? <Medal className="h-32 w-32" /> : <Trophy className="h-32 w-32" />}
            </div>

            <div className="space-y-8 relative z-10 w-full">
               <div className="relative inline-block">
                  <StudentAvatar 
                    profile={{ name: data.userName, photoURL: data.photoURL, gender: data.gender }} 
                    className={cn(
                      "rounded-[2.5rem] border-[6px] shadow-2xl transition-all group-hover:scale-105", 
                      isMain ? "h-32 w-32 md:h-44 md:w-44 border-primary/20" : "h-24 w-24 md:h-32 md:w-32 border-white"
                    )} 
                  />
                  {rank === 1 && (
                     <div className="absolute -top-4 -right-4 bg-amber-400 text-white h-12 w-12 rounded-full flex items-center justify-center shadow-2xl animate-bounce">
                        <Star className="h-6 w-6 fill-current" />
                     </div>
                  )}
               </div>

               <div className="space-y-2">
                  <h3 className="text-xl md:text-3xl font-black truncate max-w-[200px] leading-tight tracking-tight">{data.userName}</h3>
                  {isCurrent && <Badge className="bg-primary text-white border-none text-[8px] font-black uppercase px-3 shadow-lg">Candidate Account</Badge>}
               </div>

               <div className="grid grid-cols-2 gap-8 pt-4 border-t border-slate-500/10 w-full">
                  <div className="text-center space-y-1">
                     <p className={cn("text-[8px] font-bold uppercase tracking-[0.2em]", isMain ? "text-slate-400" : "text-slate-400")}>Best Score</p>
                     <p className={cn("text-xl md:text-4xl font-black tabular-nums tracking-tighter", isMain ? "text-white" : "text-primary")}>
                        {data.highestScore.toFixed(1)}
                     </p>
                  </div>
                  <div className="text-center space-y-1">
                     <p className={cn("text-[8px] font-bold uppercase tracking-[0.2em]", isMain ? "text-slate-400" : "text-slate-400")}>Accuracy</p>
                     <p className={cn("text-xl md:text-4xl font-black tabular-nums tracking-tighter", isMain ? "text-emerald-400" : "text-[#0F172A]")}>
                        {data.accuracy}%
                     </p>
                  </div>
               </div>

               <div className="pt-2">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center justify-center gap-2">
                     <Timer className="h-3 w-3" /> {formatTime(data.timeTaken)}
                  </p>
               </div>
            </div>
         </Card>
      </motion.div>
   )
}

function Loader2({ className }: any) {
  return <Zap className={cn("animate-pulse", className)} />
}
