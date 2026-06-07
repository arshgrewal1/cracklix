
"use client"

import { useMemo, useState, useEffect } from "react"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import { useUser, useCollection, useFirestore } from "@/firebase"
import { collection, query, where, doc, updateDoc, serverTimestamp } from "firebase/firestore"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Trophy, 
  Target, 
  ClipboardList, 
  Zap, 
  ChevronRight, 
  Bookmark, 
  History, 
  Flame,
  Clock,
  LayoutGrid,
  ShieldCheck,
  AlertTriangle,
  Activity,
  Award,
  User,
  TrendingUp,
  BarChart3,
  Calendar,
  Loader2,
  Gem
} from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { cn } from "@/lib/utils"
import StudentAvatar from "@/components/brand/StudentAvatar"
import ShareButton from "@/components/navigation/ShareButton"

/**
 * @fileOverview FINAL STUDENT DASHBOARD Hub.
 * Simplified Language: Replaced jargon like "Registry" and "Trajectory" with clear terms.
 */

export default function StudentDashboard() {
  const { user, profile, loading } = useUser()
  const db = useFirestore()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) router.push("/login")
  }, [user, loading, router])

  const resultsQuery = useMemo(() => {
    if (!db || !user) return null
    return query(collection(db, "results"), where("userId", "==", user.uid))
  }, [db, user])

  const { data: rawResults, loading: resultsLoading } = useCollection<any>(resultsQuery)

  const results = useMemo(() => {
    if (!rawResults) return []
    return [...rawResults].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
  }, [rawResults])

  const stats = useMemo(() => {
    if (!results || results.length === 0) return { total: 0, avgAccuracy: 0, streak: 0, readiness: 45, hours: "0h" }
    const total = results.length
    const avgAcc = Math.round(results.reduce((acc: number, r: any) => acc + (r.accuracy || 0), 0) / total)
    const readiness = Math.min(98, Math.max(30, avgAcc + Math.floor(total / 2)));
    return { 
      total, 
      avgAccuracy: avgAcc, 
      streak: total > 0 ? 3 : 0, 
      readiness, 
      hours: `${Math.round(total * 1.2)}h` 
    }
  }, [results])

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-white space-y-4">
       <Loader2 className="h-10 w-10 text-primary animate-spin" />
       <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-300">Loading Dashboard...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 pb-32 text-left">
      <Navbar />
      
      <main className="container mx-auto px-4 md:px-6 py-6 md:py-12 max-w-7xl space-y-8 md:space-y-12">
        
        {/* PROFILE HEADER */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12">
           
           <div className="lg:col-span-8 space-y-8">
              <section className="bg-[#0B1528] text-white p-8 md:p-16 rounded-[3rem] shadow-4xl relative overflow-hidden text-left group">
                <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[150%] bg-primary/10 blur-[100px] rounded-full group-hover:bg-primary/20 transition-all duration-1000" />
                <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
                  <div className="relative shrink-0">
                     <StudentAvatar profile={profile} className="h-24 w-24 md:h-36 md:w-32 border-4 border-white/10 rounded-[2.5rem] shadow-2xl" />
                     <div className="absolute -bottom-2 -right-2 bg-emerald-500 h-8 w-8 rounded-xl border-4 border-[#0B1528] flex items-center justify-center text-white">
                        <ShieldCheck className="h-4 w-4" />
                     </div>
                  </div>
                  <div className="flex-1 space-y-4 text-center md:text-left overflow-hidden">
                     <div className="space-y-1">
                        <h2 className="text-3xl md:text-5xl font-headline font-black tracking-tight uppercase truncate">{profile?.name}</h2>
                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                           <Badge className="bg-primary text-white border-none text-[10px] font-black uppercase px-4 py-1 rounded-lg shadow-xl">
                             {profile?.status || 'Free'} Pass
                           </Badge>
                           <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] flex items-center gap-2">
                             <Target className="h-3.5 w-3.5 text-primary" /> {profile?.targetExam || 'General Studies'}
                           </p>
                        </div>
                     </div>
                     <div className="pt-4 flex flex-wrap justify-center md:justify-start gap-4">
                        <Button asChild className="h-12 px-8 bg-white/10 hover:bg-white/20 text-white rounded-xl font-black uppercase text-[10px] tracking-widest border border-white/10 shadow-xl transition-all active:scale-95">
                           <Link href="/profile">My Details</Link>
                        </Button>
                        <Button asChild className="h-12 px-8 bg-primary hover:bg-orange-600 text-white rounded-xl font-black uppercase text-[10px] tracking-widest shadow-xl transition-all active:scale-95 border-none">
                           <Link href="/pass">Upgrade Pass</Link>
                        </Button>
                     </div>
                  </div>
                </div>
              </section>

              {/* STATS GRID */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
                 <MetricNode label="PREPARATION SCORE" val={`${stats.readiness}%`} icon={<TrendingUp className="text-primary h-4 w-4" />} />
                 <MetricNode label="AVG ACCURACY" val={`${stats.avgAccuracy}%`} icon={<Target className="text-emerald-500 h-4 w-4" />} />
                 <MetricNode label="TESTS COMPLETED" val={stats.total} icon={<ClipboardList className="text-blue-500 h-4 w-4" />} />
                 <MetricNode label="TIME SPENT" val={stats.hours} icon={<Clock className="text-amber-500 h-4 w-4" />} />
              </div>

              {/* RECENT TESTS */}
              <Card className="border-none shadow-3xl rounded-[3rem] bg-white overflow-hidden text-left border border-slate-50">
                 <CardHeader className="p-8 md:p-12 border-b border-slate-50 bg-slate-50/50 flex flex-row items-center justify-between">
                    <div className="space-y-1">
                       <h3 className="font-headline text-xl md:text-2xl font-black text-[#0F172A] uppercase">Test History</h3>
                       <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Your recent exam performance</p>
                    </div>
                    <Button asChild variant="ghost" className="h-10 text-[9px] font-black uppercase tracking-widest text-primary gap-2">
                       <Link href="/my-exams">View All <ChevronRight className="h-4 w-4" /></Link>
                    </Button>
                 </CardHeader>
                 <CardContent className="p-0">
                    <div className="divide-y divide-slate-50">
                       {resultsLoading ? (
                          Array.from({ length: 3 }).map((_, i) => <div key={i} className="p-8 w-full bg-slate-50 animate-pulse" />)
                       ) : results && results.length > 0 ? (
                          results.slice(0, 5).map((r: any) => (
                             <Link key={r.id} href={`/results/${r.mockId}`} className="p-8 md:p-10 flex items-center justify-between hover:bg-slate-50/50 transition-all group border-l-[4px] border-transparent hover:border-primary">
                                <div className="flex items-center gap-6 md:gap-10 min-w-0">
                                   <div className="h-14 w-14 rounded-2xl bg-slate-50 flex items-center justify-center shrink-0 shadow-inner group-hover:scale-105 transition-transform">
                                      <Zap className="h-6 w-6 text-primary" />
                                   </div>
                                   <div className="min-w-0 space-y-2">
                                      <p className="font-black text-[#0B1528] text-sm md:text-2xl uppercase truncate leading-none">{r.mockTitle}</p>
                                      <div className="flex items-center gap-6 text-[10px] md:text-[12px] font-bold text-slate-400 uppercase tracking-tight">
                                         <span className="flex items-center gap-2"><Calendar className="h-3.5 w-3.5 text-slate-300" /> {new Date(r.timestamp).toLocaleDateString()}</span>
                                         <Badge className="bg-emerald-50 text-emerald-600 border-none font-black px-2 py-0.5 rounded shadow-sm">{r.score}/{r.totalQuestions} Marks</Badge>
                                      </div>
                                   </div>
                                </div>
                                <ChevronRight className="h-6 w-6 text-slate-200 group-hover:text-primary transition-all group-hover:translate-x-2" />
                             </Link>
                          ))
                       ) : (
                          <div className="p-24 text-center opacity-30 italic text-[11px] uppercase font-black tracking-widest text-slate-400">No test history found.</div>
                       )}
                    </div>
                 </CardContent>
              </Card>
           </div>

           {/* SIDEBAR */}
           <div className="lg:col-span-4 space-y-8 md:space-y-12">
              
              <Card className="border-none shadow-4xl bg-gradient-to-br from-orange-500 to-primary text-white p-10 rounded-[3rem] relative overflow-hidden group">
                 <div className="absolute bottom-0 right-0 p-8 opacity-10 group-hover:scale-125 transition-transform duration-[2s]"><Flame className="h-64 w-64" /></div>
                 <div className="relative z-10 space-y-6">
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/70">Practice Streak</p>
                    <div className="flex items-baseline gap-4">
                       <p className="text-7xl md:text-9xl font-headline font-black leading-none">{stats.streak}</p>
                       <div className="space-y-1">
                          <p className="text-xl font-black uppercase">Days</p>
                          <p className="text-[9px] font-bold uppercase text-white/60">Keep it up!</p>
                       </div>
                    </div>
                    <div className="pt-4 flex gap-2">
                       {Array.from({ length: 7 }).map((_, i) => (
                          <div key={i} className={cn("h-1.5 flex-1 rounded-full", i < stats.streak ? 'bg-white' : 'bg-white/20')} />
                       ))}
                    </div>
                 </div>
              </Card>

              <div className="grid grid-cols-2 gap-4 md:gap-6">
                 <DashboardTile icon={<Bookmark className="text-primary" />} label="SAVED ITEMS" href="/revision" />
                 <DashboardTile icon={<Trophy className="text-amber-500" />} label="STATE RANKINGS" href="/leaderboard" />
                 <DashboardTile icon={<LayoutGrid className="text-blue-500" />} label="ALL EXAMS" href="/exams" />
                 <DashboardTile icon={<Activity className="text-emerald-500" />} label="MY ANALYSIS" href="/analytics" />
              </div>

              <Card className="border-none shadow-xl bg-white p-10 rounded-[3rem] text-left space-y-8 border border-slate-100">
                 <div className="flex items-center gap-6">
                    <div className="h-14 w-14 rounded-2xl bg-primary/5 flex items-center justify-center text-primary shadow-inner">
                       <Award className="h-8 w-8" />
                    </div>
                    <div className="space-y-1">
                       <h4 className="text-lg font-black uppercase text-[#0B1528]">Spread Success</h4>
                       <p className="text-[9px] font-bold uppercase text-slate-400">Share with other students</p>
                    </div>
                 </div>
                 <ShareButton 
                   variant="dark" 
                   className="w-full h-16 rounded-2xl bg-[#0B1528] hover:bg-black text-white shadow-2xl transition-all active:scale-95" 
                 />
              </Card>

              <div className="py-12 flex flex-col items-center gap-3 text-center border-t border-slate-100">
                 <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">
                    Developed by <span className="text-[#0F172A] font-black">Arsh Grewal</span>
                 </p>
                 <Badge className="bg-slate-50 text-slate-300 border-none text-[8px] font-bold uppercase px-3 py-1">Cracklix v8.2 • Stable</Badge>
              </div>
           </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

function MetricNode({ label, val, icon }: any) {
  return (
    <Card className="border-none shadow-xl bg-white p-6 md:p-8 rounded-[2.5rem] text-left group hover:translate-y-[-4px] transition-all border border-slate-50">
      <div className="h-10 w-10 md:h-12 md:w-12 rounded-2xl bg-slate-50 flex items-center justify-center mb-6 group-hover:bg-primary/5 transition-all shadow-inner border border-slate-100">
        {icon}
      </div>
      <p className="text-2xl md:text-4xl font-headline font-black text-[#0F172A] leading-none tracking-tight">{val}</p>
      <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mt-2">{label}</p>
    </Card>
  )
}

function DashboardTile({ icon, label, href }: any) {
   return (
      <Link href={href} className="block active:scale-95 transition-all">
         <Card className="border-none shadow-lg bg-white p-6 md:p-8 rounded-[2.5rem] flex flex-col items-center gap-4 group hover:shadow-2xl border border-slate-50">
            <div className="h-12 w-12 rounded-2xl bg-slate-50 flex items-center justify-center shrink-0 shadow-inner group-hover:bg-primary/5 transition-all">
               {icon}
            </div>
            <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 text-center leading-tight">{label}</span>
         </Card>
      </Link>
   )
}
