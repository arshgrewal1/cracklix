"use client"

import { useMemo, useState, useEffect } from "react"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import { useUser, useCollection, useFirestore } from "@/firebase"
import { collection, query, where, limit } from "firebase/firestore"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
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
  TrendingUp,
  Calendar,
  Loader2,
  Award,
  Activity
} from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { cn } from "@/lib/utils"
import StudentAvatar from "@/components/brand/StudentAvatar"
import ShareButton from "@/components/navigation/ShareButton"

/**
 * @fileOverview Hardened Student Dashboard v23.0 (Fluid Responsive).
 * UPDATED: Replaced all fixed metrics with responsive Tailwind chains.
 */
export default function StudentDashboard() {
  const { user, profile, loading } = useUser()
  const db = useFirestore()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    if (!loading && !user) router.push("/login")
  }, [user, loading, router])

  const resultsQuery = useMemo(() => {
    if (!db || !user) return null
    return query(collection(db, "results"), where("userId", "==", user.uid), limit(20))
  }, [db, user])

  const { data: rawResults, loading: resultsLoading } = useCollection<any>(resultsQuery)

  const results = useMemo(() => {
    if (!rawResults) return []
    return [...rawResults].sort((a, b) => {
      const tA = a.timestamp ? new Date(a.timestamp).getTime() : 0;
      const tB = b.timestamp ? new Date(b.timestamp).getTime() : 0;
      return tB - tA;
    });
  }, [rawResults])

  const stats = useMemo(() => {
    if (!results || results.length === 0) return { total: 0, avgAccuracy: 0, streak: 0, readiness: 0, hours: "0h", correct: 0 }
    
    const total = results.length
    const correct = results.reduce((acc: number, r: any) => acc + (r.correctCount || r.score || 0), 0)
    const attempted = results.reduce((acc: number, r: any) => acc + (r.attemptedCount || r.totalQuestions || 0), 0)
    const avgAcc = attempted > 0 ? Math.round((correct / attempted) * 100) : 0
    
    const totalSeconds = results.reduce((acc: number, r: any) => acc + (r.timeTaken || 0), 0)
    let timeFormatted = "0s";
    if (totalSeconds >= 3600) {
      timeFormatted = `${(totalSeconds / 3600).toFixed(1)}h`;
    } else if (totalSeconds >= 60) {
      timeFormatted = `${Math.floor(totalSeconds / 60)}m`;
    } else {
      timeFormatted = `${totalSeconds}s`;
    }
    
    const uniqueDays = new Set(results.filter(r => r.timestamp).map(r => new Date(r.timestamp).toDateString()))
    const streak = uniqueDays.size
    const readiness = Math.min(100, Math.round((avgAcc * 0.7) + (Math.min(total, 30) * 1)))

    return { total, avgAccuracy: avgAcc, streak, readiness, hours: timeFormatted, correct }
  }, [results])

  if (!mounted || loading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-white space-y-6">
       <Loader2 className="h-10 w-10 text-primary animate-spin" />
       <p className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-300">Synchronizing Prep Node...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 pb-32 text-left">
      <Navbar />
      
      <main className="container mx-auto px-4 md:px-6 lg:px-8 py-6 md:py-16 max-w-7xl space-y-8 md:space-y-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-12">
           
           {/* IDENTITY & MAIN METRICS */}
           <div className="lg:col-span-8 space-y-8 md:space-y-12">
              <section className="bg-[#0B1528] text-white p-8 md:p-16 lg:p-20 rounded-[2.5rem] md:rounded-[4rem] shadow-2xl relative overflow-hidden group text-left">
                <div className="absolute top-0 right-0 w-1/2 h-full bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
                <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 md:gap-12">
                  <div className="relative shrink-0">
                     <StudentAvatar profile={profile} className="h-28 w-28 md:h-44 md:w-40 border-[4px] border-white/10 rounded-[2.5rem] md:rounded-[3.5rem] shadow-5xl bg-[#0F172A]" />
                     <div className="absolute -bottom-2 -right-2 bg-emerald-500 h-8 w-8 md:h-11 md:w-11 rounded-xl border-[4px] border-[#0B1528] flex items-center justify-center text-white shadow-xl">
                        <ShieldCheck className="h-5 w-5 md:h-6 md:w-6" />
                     </div>
                  </div>
                  <div className="flex-1 space-y-4 md:space-y-6 text-center md:text-left min-w-0">
                     <div className="space-y-2">
                        <h2 className="text-3xl md:text-5xl lg:text-7xl font-headline font-black tracking-tight uppercase truncate">{profile?.name || "Aspirant"}</h2>
                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 md:gap-6">
                           <Badge className="bg-primary text-white border-none text-[10px] md:text-xs font-black uppercase px-5 py-1.5 rounded-full shadow-2xl">
                             {(profile?.status || 'Free').toUpperCase()} PASS
                           </Badge>
                           <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] md:text-sm flex items-center gap-2.5">
                             <Target className="h-4 w-4 md:h-5 md:w-5 text-primary" /> {profile?.targetExam || 'Punjab General'}
                           </p>
                        </div>
                     </div>
                     <div className="pt-4 flex flex-wrap justify-center md:justify-start gap-4">
                        <Button asChild className="h-12 md:h-14 px-8 md:px-12 bg-white/10 hover:bg-white/20 text-white rounded-2xl font-black uppercase text-[11px] tracking-widest border border-white/10 shadow-xl transition-all active:scale-95">
                           <Link href="/profile">My Profile</Link>
                        </Button>
                        <Button asChild className="h-12 md:h-14 px-8 md:px-12 bg-primary hover:bg-orange-600 text-white rounded-2xl font-black uppercase text-[11px] tracking-widest shadow-xl transition-all active:scale-95 border-none">
                           <Link href="/pass">Upgrade Hub</Link>
                        </Button>
                     </div>
                  </div>
                </div>
              </section>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
                 <MetricItem label="PREP SCORE" val={`${stats.readiness}%`} icon={<TrendingUp className="text-primary h-5 w-5" />} />
                 <MetricItem label="ACCURACY" val={`${stats.avgAccuracy}%`} icon={<Target className="text-emerald-500 h-5 w-5" />} />
                 <MetricItem label="TESTS DONE" val={stats.total} icon={<ClipboardList className="text-blue-500 h-5 w-5" />} />
                 <MetricItem label="TIME SPENT" val={stats.hours} icon={<Clock className="text-amber-500 h-5 w-5" />} />
              </div>

              <Card className="border-none shadow-3xl rounded-[2.5rem] md:rounded-[4rem] bg-white overflow-hidden text-left border border-slate-100">
                 <CardHeader className="p-8 md:p-14 border-b border-slate-50 bg-slate-50/30 flex flex-row items-center justify-between">
                    <div className="space-y-1">
                       <h3 className="font-headline text-xl md:text-3xl font-black text-[#0F172A] uppercase">Test Archives</h3>
                       <p className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-slate-400">Review your recent attempts</p>
                    </div>
                    <Button asChild variant="ghost" className="h-10 text-[10px] md:text-xs font-black uppercase tracking-widest text-primary gap-2">
                       <Link href="/my-exams">View All <ChevronRight className="h-4 w-4" /></Link>
                    </Button>
                 </CardHeader>
                 <CardContent className="p-0">
                    <div className="divide-y divide-slate-50">
                       {resultsLoading ? (
                          Array.from({ length: 3 }).map((_, i) => <div key={i} className="p-10 w-full bg-slate-50 animate-pulse" />)
                       ) : results && results.length > 0 ? (
                          results.slice(0, 5).map((r: any) => (
                             <Link key={r.id} href={`/results/${r.id || r.mockId}`} className="p-8 md:p-12 flex items-center justify-between hover:bg-slate-50/50 transition-all group border-l-[4px] border-transparent hover:border-primary">
                                <div className="flex items-center gap-6 md:gap-10 min-w-0 flex-1">
                                   <div className="h-12 w-12 md:h-18 md:w-18 rounded-2xl bg-slate-50 flex items-center justify-center shrink-0 shadow-inner group-hover:scale-105 transition-transform">
                                      <Zap className="h-6 w-6 md:h-8 md:w-8 text-primary" />
                                   </div>
                                   <div className="min-w-0 space-y-2">
                                      <p className="font-black text-[#0B1528] text-sm md:text-2xl lg:text-3xl uppercase truncate leading-none">{r.mockTitle}</p>
                                      <div className="flex items-center gap-5 text-[10px] md:text-sm font-bold text-slate-400 uppercase tracking-tight">
                                         <span className="flex items-center gap-2">
                                           <Calendar className="h-3.5 w-3.5 text-slate-300" /> 
                                           {r.timestamp ? new Date(r.timestamp).toLocaleDateString() : 'N/A'}
                                         </span>
                                         <Badge className="bg-emerald-50 text-emerald-600 border-none font-black px-3 py-1 rounded-lg text-[9px] md:text-xs">ACC: {r.accuracy}%</Badge>
                                      </div>
                                   </div>
                                </div>
                                <ChevronRight className="h-6 w-6 text-slate-200 group-hover:text-primary transition-all group-hover:translate-x-2" />
                             </Link>
                          ))
                       ) : (
                          <div className="p-24 text-center opacity-30 italic text-sm md:text-lg uppercase font-black tracking-widest text-slate-400">No official results documented.</div>
                       )}
                    </div>
                 </CardContent>
              </Card>
           </div>

           {/* SIDEBAR: STREAK & QUICK LAUNCH */}
           <div className="lg:col-span-4 space-y-8 md:space-y-12">
              <Card className="border-none shadow-4xl bg-gradient-to-br from-orange-500 to-primary text-white p-10 md:p-14 rounded-[3rem] md:rounded-[4rem] relative overflow-hidden group">
                 <div className="absolute bottom-0 right-0 p-8 opacity-10 rotate-12 group-hover:scale-125 transition-transform duration-1000"><Flame className="h-64 w-64 lg:h-80 lg:w-80" /></div>
                 <div className="relative z-10 space-y-6 md:space-y-8">
                    <p className="text-[10px] md:text-xs font-black uppercase tracking-[0.4em] text-white/70">STUDY STREAK</p>
                    <div className="flex items-baseline gap-4 md:gap-6">
                       <p className="text-7xl md:text-9xl lg:text-[160px] font-headline font-black leading-none">{stats.streak}</p>
                       <div className="space-y-1">
                          <p className="text-xl md:text-3xl font-black uppercase">Days</p>
                          <p className="text-[9px] md:text-xs font-bold uppercase text-white/60">Preparation Node Active</p>
                       </div>
                    </div>
                    <div className="pt-4 md:pt-8 flex gap-2">
                       {Array.from({ length: 7 }).map((_, i) => (
                          <div key={i} className={cn("h-1.5 flex-1 rounded-full", i < stats.streak ? 'bg-white' : 'bg-white/20')} />
                       ))}
                    </div>
                 </div>
              </Card>

              <div className="grid grid-cols-2 gap-4 md:gap-8">
                 <DashboardTile icon={<Bookmark className="text-primary h-5 w-5" />} label="REVISION" href="/revision" />
                 <DashboardTile icon={<Trophy className="text-amber-500 h-5 w-5" />} label="RANKINGS" href="/leaderboard" />
                 <DashboardTile icon={<LayoutGrid className="text-blue-500 h-5 w-5" />} label="EXAM HUBS" href="/exams" />
                 <DashboardTile icon={<Activity className="text-emerald-500 h-5 w-5" />} label="ANALYSIS" href="/analytics" />
              </div>

              <Card className="border-none shadow-2xl bg-white p-10 md:p-14 rounded-[3rem] md:rounded-[4rem] text-left space-y-8 md:space-y-10 border border-slate-100">
                 <div className="flex items-center gap-6">
                    <div className="h-14 w-14 rounded-2xl bg-primary/5 flex items-center justify-center text-primary shadow-inner">
                       <Award className="h-8 w-8 md:h-10 md:w-10" />
                    </div>
                    <div className="space-y-1">
                       <h4 className="text-xl md:text-2xl font-black uppercase text-[#0B1528]">Elite Network</h4>
                       <p className="text-[10px] md:text-xs font-bold uppercase text-slate-400">Invite fellow aspirants</p>
                    </div>
                 </div>
                 <ShareButton 
                   variant="dark" 
                   className="w-full h-16 md:h-20 rounded-2xl md:rounded-[2.5rem] bg-[#0B1528] hover:bg-black text-white shadow-3xl transition-all active:scale-95 border-none text-[11px] md:text-xs" 
                 />
              </Card>
           </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

function MetricItem({ label, val, icon }: any) {
  return (
    <Card className="border-none shadow-xl bg-white p-6 md:p-10 lg:p-12 rounded-[2rem] md:rounded-[3rem] text-left group hover:translate-y-[-8px] transition-all border border-slate-50">
      <div className="h-10 w-10 md:h-14 md:w-14 rounded-xl md:rounded-2xl bg-slate-50 flex items-center justify-center mb-6 md:mb-10 group-hover:bg-primary/5 transition-all shadow-inner border border-slate-100">
        {icon}
      </div>
      <p className="text-2xl md:text-5xl lg:text-6xl font-headline font-black text-[#0F172A] leading-none tracking-tighter">{val}</p>
      <p className="text-[9px] md:text-[11px] lg:text-[13px] font-black uppercase tracking-widest text-slate-400 mt-3 md:mt-5">{label}</p>
    </Card>
  )
}

function DashboardTile({ icon, label, href }: any) {
   return (
      <Link href={href} className="block active:scale-95 transition-all">
         <Card className="border-none shadow-lg bg-white p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] flex flex-col items-center gap-4 md:gap-6 group hover:shadow-2xl border border-slate-100">
            <div className="h-12 w-12 md:h-16 md:w-16 rounded-xl md:rounded-2xl bg-slate-50 flex items-center justify-center shrink-0 shadow-inner group-hover:bg-primary/5 transition-all">
               {icon}
            </div>
            <span className="text-[10px] md:text-xs font-black uppercase tracking-widest text-slate-500 text-center leading-tight">{label}</span>
         </Card>
      </Link>
   )
}
