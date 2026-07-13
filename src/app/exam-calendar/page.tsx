"use client"

import { useMemo, useState, useEffect } from "react"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar as CalendarIcon, ShieldCheck, Zap, Clock, ArrowRight, Bell, Timer, Loader2, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCollection, useFirestore } from "@/firebase"
import { collection, query, orderBy, where } from "firebase/firestore"
import { Skeleton } from "@/components/ui/skeleton"
import { CalendarEvent } from "@/types"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"

/**
 * @fileOverview Official Punjab Exam Calendar Hub v3.1.
 * UPDATED: Replaced "Registry" with "List".
 */

export default function ExamCalendarPage() {
  const db = useFirestore()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])
  
  const calendarQuery = useMemo(() => (db ? query(
    collection(db, "exam_calendar"), 
    where("published", "==", true),
    orderBy("createdAt", "desc")
  ) : null), [db])

  const { data: events, loading } = useCollection<CalendarEvent>(calendarQuery as any)

  const nextExam = useMemo(() => {
     if (!events || events.length === 0) return null;
     return events.find(e => e.status.toLowerCase().includes('upcoming') || e.status.toLowerCase().includes('notification'));
  }, [events]);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-slate-50/50 font-body text-left selection:bg-primary/10">
      <Navbar />
      <main className="container mx-auto px-4 md:px-6 py-12 md:py-24 max-w-[1440px] space-y-12 md:space-y-24">
        
        {/* 1. HERO HUB */}
        <div className="text-left space-y-10 md:space-y-16 max-w-5xl">
           <div className="space-y-6 md:space-y-10">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                 <div className="flex items-center gap-4">
                    <button onClick={() => router.back()} className="h-10 w-10 rounded-xl border border-slate-200 bg-white flex items-center justify-center text-slate-400 hover:text-primary transition-all shadow-sm">
                       <ArrowLeft className="h-5 w-5" />
                    </button>
                    <div className="h-10 w-10 md:h-12 md:w-12 bg-primary/10 rounded-xl md:rounded-2xl flex items-center justify-center text-primary shadow-inner shrink-0">
                       <CalendarIcon className="h-5 w-5 md:h-6 md:w-6" />
                    </div>
                    <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.3em] text-slate-400">Official Recruitment List</span>
                 </div>

                 {nextExam && (
                    <div className="inline-flex items-center gap-4 px-6 py-3 bg-white border border-slate-100 rounded-[1.5rem] shadow-xl animate-in slide-in-from-right-4 duration-700">
                       <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                       <p className="text-[10px] font-black uppercase text-[#0F172A] tracking-widest whitespace-nowrap">
                          Next: <span className="text-primary ml-1">{nextExam.post}</span>
                       </p>
                    </div>
                 )}
              </div>

              <h1 className="text-4xl sm:text-6xl md:text-8xl lg:text-9xl font-black text-[#0F172A] tracking-tighter leading-[0.9] break-words antialiased">
                 Recruitment <br/> <span className="text-primary italic">Calendar.</span>
              </h1>
              <p className="text-slate-500 font-medium text-sm md:text-2xl max-w-2xl leading-tight tracking-tight">
                 Stay synchronized with the latest cabinet-approved recruitment schedules across all Punjab Government boards.
              </p>
           </div>
        </div>

        {/* 2. TIMELINE HUB */}
        <div className="grid grid-cols-1 gap-12 md:gap-24 relative">
          <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-px bg-slate-200 hidden md:block" />
          
          {loading ? (
             Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-48 md:h-64 w-full rounded-[2.5rem] md:rounded-[4rem] bg-white" />)
          ) : events && events.length > 0 ? (
             events.map((r, i) => (
             <div key={r.id} className={cn(
                "flex flex-col md:flex-row items-center gap-10 md:gap-20",
                i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
             )}>
                <div className="md:w-1/2 w-full">
                   <Card className="border-none shadow-4xl rounded-[2.5rem] md:rounded-[4rem] bg-white overflow-hidden group hover:translate-y-[-10px] transition-all duration-700 border border-slate-100">
                      <div className={cn("h-2 w-full", r.color || 'bg-primary')} />
                      <CardContent className="p-8 md:p-14 space-y-8">
                         <div className="flex items-center justify-between">
                            <Badge className={cn("border-none font-black text-[9px] md:text-[11px] uppercase tracking-widest px-4 py-1.5 rounded-full shadow-lg", r.color || 'bg-primary', "text-white")}>
                               {r.board}
                            </Badge>
                            <span className="text-[10px] md:text-[11px] font-black text-slate-300 uppercase tracking-widest">{r.type}</span>
                         </div>

                         <div className="space-y-4">
                            <h3 className="text-2xl md:text-4xl font-headline font-black text-[#0F172A] group-hover:text-primary transition-all uppercase leading-tight tracking-tight antialiased">
                               {r.post}
                            </h3>
                            <div className="flex items-center gap-6">
                               <div className="flex items-center gap-3 text-slate-500 font-bold text-xs md:text-xl">
                                  <CalendarIcon className="h-5 w-5 text-primary" />
                                  <span className="tabular-nums tracking-tight">{r.date}</span>
                                </div>
                            </div>
                         </div>

                         <div className="pt-8 border-t border-slate-50 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                               <div className="h-2 w-2 rounded-full bg-emerald-500" />
                               <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{r.status}</span>
                            </div>
                            <Button variant="ghost" className="text-primary font-black uppercase text-[10px] md:text-[11px] tracking-widest gap-2 p-0 hover:bg-transparent group-hover:gap-4 transition-all">
                               Track Status <Bell className="h-3.5 w-3.5 fill-current" />
                            </Button>
                         </div>
                      </CardContent>
                   </Card>
                </div>

                <div className="relative z-10 hidden md:flex h-16 w-16 rounded-[2rem] bg-white border-[6px] border-slate-50 shadow-2xl items-center justify-center font-black text-lg text-primary animate-in zoom-in duration-500" style={{ animationDelay: `${i * 100}ms` }}>
                   {i + 1}
                </div>

                <div className="md:w-1/2 hidden md:block" />
             </div>
             ))
          ) : (
             <div className="py-40 text-center opacity-10 italic font-black uppercase text-3xl md:text-6xl tracking-tighter">
                List Empty
             </div>
          )}
        </div>

        {/* 3. CTA HUB */}
        <div className="bg-[#0B1528] rounded-[3rem] md:rounded-[5rem] p-10 md:p-32 text-center space-y-10 md:space-y-16 text-white relative overflow-hidden shadow-5xl mx-1 border border-white/5">
           <div className="absolute top-0 right-0 p-16 opacity-5 rotate-12 group-hover:scale-110 transition-transform duration-1000">
              <Zap className="h-96 w-96 text-primary" />
           </div>
           
           <div className="relative z-10 space-y-6">
              <h2 className="text-3xl md:text-7xl lg:text-9xl font-black uppercase leading-[0.9] tracking-tighter antialiased">
                 Never miss <br/> <span className="text-primary">a notification.</span>
              </h2>
              <p className="text-slate-400 text-sm md:text-2xl max-w-2xl mx-auto font-medium leading-tight">
                 Synchronize your preparation with official recruitment alerts on Telegram.
              </p>
           </div>

           <div className="relative z-10 pt-4">
              <Button asChild className="h-14 md:h-24 px-12 md:px-24 bg-primary hover:bg-blue-700 text-white font-black uppercase text-[10px] md:text-sm tracking-[0.2em] rounded-2xl md:rounded-[3rem] shadow-4xl border-none transition-all active:scale-95">
                 <a href="https://t.me/cracklixapp" target="_blank" className="flex items-center justify-center gap-3">
                    Join Portal Hub <ArrowRight className="h-4 w-4 md:h-8 md:w-8" />
                 </a>
              </Button>
           </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
