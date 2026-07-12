"use client"

import React, { useMemo, useState, useEffect } from "react"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trophy, Quote, Star, GraduationCap, ShieldCheck, ChevronRight, Zap, ArrowLeft } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useDoc, useFirestore, useCollection } from "@/firebase"
import { doc, collection, query, orderBy } from "firebase/firestore"
import { Skeleton } from "@/components/ui/skeleton"
import { SuccessStory } from "@/types"
import { useRouter } from "next/navigation"

/**
 * @fileOverview Official Hall of Rankers v10.0 (High-Fidelity Update).
 * FIXED: Applied global responsive scaling headers with leading-[0.9].
 * FIXED: Optimized layout for premium student experience.
 */

export default function SuccessStoriesPage() {
  const db = useFirestore();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const statsRef = useMemo(() => (db ? doc(db, "settings", "stats") : null), [db]);
  const storiesQuery = useMemo(() => (db ? query(collection(db, "success_stories"), orderBy("createdAt", "desc")) : null), [db]);

  const { data: stats, loading: statsLoading } = useDoc<any>(statsRef);
  const { data: stories, loading: storiesLoading } = useCollection<SuccessStory>(storiesQuery as any);

  const liveAspirantCount = useMemo(() => {
    if (!stats) return "10,000+";
    const count = stats.totalUsers || 0;
    return count.toLocaleString() + "+";
  }, [stats]);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-slate-50/50 font-body text-left selection:bg-primary/10">
      <Navbar />
      <main className="container mx-auto px-4 md:px-6 py-12 md:py-24 max-w-[1440px] space-y-12 md:space-y-24">
        
        {/* 1. HERO HUB */}
        <div className="text-left space-y-10 md:space-y-16 max-w-5xl">
           <div className="space-y-6 md:space-y-10">
              <div className="flex items-center gap-4">
                 <button onClick={() => router.back()} className="h-10 w-10 rounded-xl border border-slate-200 bg-white flex items-center justify-center text-slate-400 hover:text-primary transition-all shadow-sm">
                    <ArrowLeft className="h-5 w-5" />
                 </button>
                 <div className="h-10 w-10 md:h-12 md:w-12 bg-primary/10 rounded-xl md:rounded-2xl flex items-center justify-center text-primary shadow-inner shrink-0">
                    <Trophy className="h-5 w-5 md:h-6 md:w-6" />
                 </div>
                 <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.3em] text-slate-400">Official Hall of Rankers</span>
              </div>
              <h1 className="text-4xl sm:text-6xl md:text-8xl lg:text-9xl font-black text-[#0F172A] tracking-tighter leading-[0.9] break-words antialiased">
                 Punjab&apos;s <span className="text-primary italic">Pride.</span>
              </h1>
              <p className="text-slate-500 font-medium text-sm md:text-2xl max-w-2xl leading-tight tracking-tight">
                 Verified success stories from aspirants who cracked official recruitments using the Cracklix preparation node.
              </p>
           </div>
        </div>

        {/* 2. SUCCESS STORIES GRID */}
        <div className="grid grid-cols-1 gap-12 md:gap-24">
          {storiesLoading ? (
             Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-80 w-full rounded-[3rem] bg-white border border-slate-100" />)
          ) : stories && stories.length > 0 ? (
             stories.map((story, idx) => (
                <div key={story.id} className={cn(
                   "flex flex-col md:flex-row items-center gap-10 md:gap-24 transition-all duration-700",
                   idx % 2 !== 0 ? 'md:flex-row-reverse' : ''
                )}>
                   {/* TOPPER ASSET */}
                   <div className="w-full md:w-2/5">
                      <div className="relative aspect-[4/5] rounded-[2.5rem] md:rounded-[4.5rem] overflow-hidden shadow-5xl group border border-slate-100 bg-[#0B1528] max-w-[320px] md:max-w-none mx-auto">
                         <Image 
                            src={story.imageUrl || `https://picsum.photos/seed/${story.id}/400/500`} 
                            fill 
                            alt={story.name} 
                            sizes="(max-width: 768px) 100vw, 40vw"
                            className="object-cover grayscale group-hover:grayscale-0 transition-all duration-1000 group-hover:scale-105" 
                         />
                         <div className="absolute inset-0 bg-gradient-to-t from-[#0B1528] via-transparent to-transparent opacity-60" />
                         <div className="absolute bottom-6 left-6 right-6">
                            <Badge className="bg-emerald-500 text-white border-none px-4 py-1.5 rounded-full font-black text-[10px] md:text-xs tracking-widest shadow-2xl uppercase">
                               {story.rank}
                            </Badge>
                         </div>
                      </div>
                   </div>

                   {/* TOPPER NARRATIVE */}
                   <div className="w-full md:w-3/5 space-y-6 md:space-y-12 text-center md:text-left px-2">
                      <div className="flex justify-center md:justify-start gap-1.5 text-amber-400">
                         {Array.from({ length: 5 }).map((_, i) => <Star key={i} className="fill-current h-4 w-4 md:h-10 md:w-10" />)}
                      </div>
                      <div className="space-y-4 md:space-y-8">
                         <Quote className="h-8 w-8 md:h-16 md:w-16 text-primary opacity-10 mx-auto md:mx-0" />
                         <blockquote className="text-xl md:text-5xl font-headline font-black italic text-[#0F172A] leading-[1.1] tracking-tight antialiased">
                            &quot;{story.quote}&quot;
                         </blockquote>
                      </div>
                      <div className="space-y-2">
                         <h3 className="text-2xl md:text-5xl font-black text-[#0F172A] uppercase tracking-tight">{story.name}</h3>
                         <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 md:gap-8 text-slate-400 font-bold uppercase tracking-widest text-[10px] md:text-[13px]">
                            <span className="flex items-center gap-2.5"><GraduationCap className="h-4 w-4 md:h-6 md:w-6 text-primary" /> {story.exam}</span>
                            <div className="h-1.5 w-1.5 rounded-full bg-slate-200 hidden md:block" />
                            <span className="flex items-center gap-2.5"><ShieldCheck className="h-4 w-4 md:h-6 md:w-6 text-emerald-500" /> Batch {story.year}</span>
                         </div>
                      </div>
                   </div>
                </div>
             ))
          ) : (
             <div className="py-40 text-center opacity-20 flex flex-col items-center gap-8">
                <Zap className="h-16 w-16 text-slate-300" />
                <p className="font-headline font-black text-2xl md:text-4xl uppercase tracking-[0.4em]">Awaiting Merit Sync</p>
             </div>
          )}
        </div>

        {/* 3. CONVERSION HUB */}
        <div className="bg-[#0B1528] rounded-[3rem] md:rounded-[5rem] p-10 md:p-32 text-center space-y-10 md:space-y-16 text-white relative overflow-hidden shadow-5xl mx-1 border border-white/5">
           <div className="absolute top-0 right-0 p-16 opacity-5 rotate-12 group-hover:scale-110 transition-transform duration-1000">
              <Trophy className="h-96 w-96 text-primary" />
           </div>
           
           <div className="relative z-10 space-y-6">
              <h2 className="text-3xl md:text-7xl lg:text-9xl font-black uppercase leading-[0.9] tracking-tighter antialiased">
                 Your Name <br/> <span className="text-primary">is next.</span>
              </h2>
              <p className="text-slate-400 text-sm md:text-2xl max-w-2xl mx-auto font-medium leading-tight">
                 Join {liveAspirantCount} aspirants already preparing with the state&apos;s most advanced registry.
              </p>
           </div>

           <div className="relative z-10 pt-4">
              <Button asChild className="h-14 md:h-24 px-12 md:px-24 bg-white text-[#0B1528] hover:bg-slate-100 font-black uppercase text-[10px] md:text-sm tracking-[0.2em] rounded-2xl md:rounded-[3rem] shadow-4xl border-none transition-all active:scale-95">
                 <Link href="/login">Initialize My Account <ChevronRight className="ml-3 h-4 w-4 md:h-6 md:w-6" /></Link>
              </Button>
           </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
