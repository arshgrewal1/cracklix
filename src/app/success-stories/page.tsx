"use client"

import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trophy, Quote, Star, GraduationCap, ShieldCheck, ChevronRight, Zap } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useDoc, useFirestore, useCollection } from "@/firebase"
import { doc, collection, query, orderBy } from "firebase/firestore"
import { useMemo, useState, useEffect } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { SuccessStory } from "@/types"

/**
 * @fileOverview Official Hall of Rankers v9.0 - Replaced external picsum assets.
 */

export default function SuccessStoriesPage() {
  const db = useFirestore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const statsRef = useMemo(() => (db ? doc(db, "settings", "stats") : null), [db]);
  const storiesQuery = useMemo(() => (db ? query(collection(db, "success_stories"), orderBy("createdAt", "desc")) : null), [db]);

  const { data: stats, loading: statsLoading } = useDoc<any>(statsRef);
  const { data: stories, loading: storiesLoading } = useCollection<SuccessStory>(storiesQuery as any);

  const liveAspirantCount = useMemo(() => {
    if (!stats) return "0";
    const count = stats.totalUsers || 0;
    return count.toLocaleString();
  }, [stats]);

  return (
    <div className="min-h-screen bg-slate-50/50 text-left font-body">
      <Navbar />
      <main className="container mx-auto px-4 md:px-6 py-10 md:py-24 max-w-6xl space-y-12 md:space-y-24">
        
        <div className="text-center space-y-4 md:space-y-10">
           <div className="h-12 w-12 md:h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto text-primary shadow-xl">
              <Trophy className="h-6 w-6 md:h-8" />
           </div>
           <h1 className="text-2xl md:text-7xl font-black text-[#0F172A] tracking-tighter leading-none uppercase">
              Hall of <span className="text-primary">Rankers</span>
           </h1>
           <p className="text-slate-500 font-medium text-[11px] md:text-2xl max-w-2xl mx-auto leading-tight italic">
              "Success stories from fellow Punjab aspirants using the Cracklix platform."
           </p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:gap-20">
          {storiesLoading ? (
             Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-64 w-full rounded-[2.5rem] bg-white" />)
          ) : stories && stories.length > 0 ? (
             stories.map((story, idx) => (
                <div key={story.id} className={`flex flex-col md:flex-row items-center gap-6 md:gap-16 ${idx % 2 !== 0 ? 'md:flex-row-reverse' : ''}`}>
                   <div className="w-full md:w-2/5">
                      <div className="relative aspect-[4/5] rounded-[2rem] md:rounded-[4rem] overflow-hidden shadow-2xl group border border-slate-100 bg-[#0F172A] max-w-[240px] md:max-w-none mx-auto">
                         <Image 
                            src={story.imageUrl || "/images/topper-placeholder.png"} 
                            fill 
                            alt={story.name} 
                            className="object-cover grayscale group-hover:grayscale-0 transition-all duration-1000" 
                         />
                         <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A] via-transparent to-transparent opacity-60" />
                         <div className="absolute bottom-4 left-4 right-4">
                            <Badge className="bg-emerald-50 text-emerald-600 border-none px-3 py-0.5 rounded-lg font-black text-[8px] shadow-lg">{story.rank}</Badge>
                         </div>
                      </div>
                   </div>
                   <div className="w-full md:w-3/5 space-y-4 md:space-y-10 text-center md:text-left px-2">
                      <div className="flex justify-center md:justify-start gap-1 text-amber-400">
                         {Array.from({ length: 5 }).map((_, i) => <Star key={i} className="fill-current h-4 w-4 md:h-8" />)}
                      </div>
                      <div className="space-y-2">
                         <Quote className="h-6 w-6 md:h-12 text-primary opacity-20 mx-auto md:mx-0" />
                         <blockquote className="text-base md:text-5xl font-headline font-medium italic text-[#0F172A] leading-tight tracking-tight">
                            "{story.quote}"
                         </blockquote>
                      </div>
                      <div className="space-y-1">
                         <p className="text-xl md:text-4xl font-black text-[#0F172A] uppercase tracking-tight">{story.name}</p>
                         <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 text-slate-400 font-bold uppercase tracking-widest text-[8px] md:text-[11px]">
                            <span className="flex items-center gap-1.5"><GraduationCap className="h-3 w-3 text-primary" /> {story.exam}</span>
                            <span className="flex items-center gap-1.5"><ShieldCheck className="h-3 w-3 text-emerald-500" /> Batch {story.year}</span>
                         </div>
                      </div>
                   </div>
                </div>
             ))
          ) : (
             <div className="py-20 text-center opacity-20 flex flex-col items-center gap-4">
                <Zap className="h-10 w-10 text-slate-300" />
                <p className="font-headline font-black text-lg uppercase tracking-widest">Awaiting Merit Nodes</p>
             </div>
          )}
        </div>

        <div className="bg-[#0F172A] rounded-[2.5rem] md:rounded-[5rem] p-8 md:p-20 text-center space-y-6 md:space-y-10 text-white relative overflow-hidden shadow-4xl mx-2">
           <h2 className="text-2xl md:text-7xl font-headline font-black uppercase leading-tight relative z-10 antialiased tracking-tight">Your Success <br/> <span className="text-primary">Is Next.</span></h2>
           <p className="text-slate-400 text-[11px] md:text-xl max-w-xl mx-auto font-medium relative z-10 leading-snug">
              Join {statsLoading ? "..." : liveAspirantCount} aspirants already preparing with Cracklix.
           </p>
           <Button asChild className="h-12 md:h-20 px-8 md:px-20 bg-white text-black hover:bg-slate-100 font-black uppercase text-[9px] md:text-sm tracking-widest rounded-xl md:rounded-3xl shadow-4xl relative z-10 border-none transition-all active:scale-95">
              <Link href="/login">Initialize My Account <ChevronRight className="h-4 w-4 ml-2" /></Link>
           </Button>
        </div>
      </main>
      <Footer />
    </div>
  )
}