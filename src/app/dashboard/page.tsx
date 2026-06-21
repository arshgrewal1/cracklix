"use client"

import React, { useMemo, useState, useEffect, isValidElement, cloneElement, ReactElement } from "react"
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
  Flame,
  Clock,
  LayoutGrid,
  ShieldCheck,
  TrendingUp,
  Calendar,
  Activity,
  Gem,
  Layers,
  AlertCircle
} from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { cn } from "@/lib/utils"
import StudentAvatar from "@/components/brand/StudentAvatar"
import { Skeleton } from "@/components/ui/skeleton"

/**
 * @fileOverview Student Dashboard v39.0 (Setup Blocker Removed).
 */
export default function StudentDashboard() {
  const { user, profile, loading: authLoading } = useUser();
  const db = useFirestore()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [passCountdown, setPassCountdown] = useState("");

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted && !authLoading) {
      if (!user) {
        router.push("/login");
      }
    }
  }, [user, authLoading, router, mounted])

  useEffect(() => {
    const expiryStr = profile?.passExpiresAt;
    if (!expiryStr) {
       setPassCountdown("");
       return;
    }
    
    const expiryDate = new Date(expiryStr);
    if (isNaN(expiryDate.getTime())) return;

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const diff = expiryDate.getTime() - now;

      if (diff <= 0) {
        setPassCountdown("Expired");
        clearInterval(interval);
        return;
      }

      const d = Math.floor(diff / (1000 * 60 * 60 * 24));
      const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      
      if (d > 0) setPassCountdown(`${d}d left`);
      else if (h > 0) setPassCountdown(`${h}h left`);
      else setPassCountdown(`${m}m left`);
    }, 1000);

    return () => clearInterval(interval);
  }, [profile?.passExpiresAt]);

  const resultsQuery = useMemo(() => {
    if (!db || !user || !mounted) return null
    return query(collection(db, "results"), where("userId", "==", user.uid), limit(50))
  }, [db, user, mounted])

  const { data: rawResults, loading: resultsLoading } = useCollection<any>(resultsQuery)

  const stats = useMemo(() => {
    if (!rawResults || rawResults.length === 0) return { total: 0, avgAccuracy: 0, streak: 0, readiness: 0, hours: "0h", list: [] }
    
    const sorted = [...rawResults].sort((a, b) => {
       const timeA = new Date(a.timestamp || 0).getTime();
       const timeB = new Date(b.timestamp || 0).getTime();
       return timeB - timeA;
    });

    const total = sorted.length
    const correct = sorted.reduce((acc: number, r: any) => acc + (r.correctCount || r.score || 0), 0)
    const attempted = sorted.reduce((acc: number, r: any) => acc + (Object.keys(r.answers || {}).length), 0)
    const avgAcc = attempted > 0 ? Math.round((correct / attempted) * 100) : 0
    
    const totalSeconds = sorted.reduce((acc: number, r: any) => acc + (r.timeTaken || 0), 0)
    let timeFormatted = totalSeconds >= 3600 ? `${(totalSeconds / 3600).toFixed(1)}h` : 
                       totalSeconds >= 60 ? `${Math.floor(totalSeconds / 60)}m` : `${totalSeconds}s`;
    
    const uniqueDays = new Set(sorted.filter((r: any) => r.timestamp).map((r: any) => new Date(r.timestamp).toDateString()))
    const readiness = Math.min(100, Math.round((avgAcc * 0.7) + (Math.min(total, 30) * 1)))

    return { total, avgAccuracy: avgAcc, streak: uniqueDays.size, readiness, hours: timeFormatted, list: sorted.slice(0, 8) }
  }, [rawResults])

  if (!mounted || authLoading || (user && !profile)) return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-white space-y-4">
       <Zap className="h-8 w-8 text-primary animate-pulse" />
       <p className="text-[10px] font-black uppercase text-slate-300">Syncing Progress Hub...</p>
    </div>
  );

  if (!user) return null;

  const isActive = profile?.passStatus === 'active';
  const isProfileIncomplete = !profile?.phone || !profile?.targetExam;

  return (
    <div className="min-h-[100dvh] bg-slate-50/50 font-body pb-safe text-left">
      <Navbar />
      
      <main className="container mx-auto px-3 md:px-8 py-4 md:py-10 max-w-7xl space-y-4 md:space-y-8">
        
        {/* OPTIONAL PROFILE REMINDER */}
        {isProfileIncomplete && (
           <Card className="border-none bg-blue-600 text-white p-4 md:p-6 rounded-2xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-4 animate-in slide-in-from-top-2">
              <div className="flex items-center gap-4 text-center md:text-left">
                 <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                    <UserIcon className="h-5 w-5" />
                 </div>
                 <p className="text-xs md:text-sm font-bold uppercase tracking-tight">Complete your profile for state merit rankings and better recommendations.</p>
              </div>
              <div className="flex gap-2 w-full md:w-auto">
                 <Button asChild size="sm" className="bg-white text-blue-600 hover:bg-slate-100 flex-1 md:flex-none h-9 px-6 rounded-lg text-[9px]">
                    <Link href="/profile-setup">Setup Now</Link>
                 </Button>
              </div>
           </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-8">
          
          <div className="lg:col-span-8 space-y-4 md:space-y-8">
              <section className="bg-[#0B1528] text-white p-4 md:p-10 rounded-2xl md:rounded-[2.5rem] shadow-2xl relative overflow-hidden group border border-white/5">
                <div className="absolute top-0 right-0 w-1/3 h-full bg-primary/5 blur-[80px] rounded-full pointer-events-none" />
                <div className="relative z-10 flex flex-row items-center gap-4 md:gap-10">
                  <div className="relative shrink-0">
                    <div className="relative">
                      <StudentAvatar profile={profile} className="h-14 w-14 md:h-28 md:w-28 border-[2px] md:border-[3px] border-white/10 rounded-xl md:rounded-3xl shadow-5xl bg-[#0F172A]" />
                      <div className="absolute -bottom-1 -right-1 bg-emerald-500 h-4 w-4 md:h-8 md:w-8 rounded-lg border border-[#0B1528] flex items-center justify-center text-white shadow-xl">
                          <ShieldCheck className="h-2 w-2 md:h-4 md:w-4" />
                      </div>
                    </div>
                  </div>
                  <div className="flex-1 space-y-1.5 min-w-0 text-left">
                    <div className="space-y-0.5">
                        <h2 className="text-lg md:text-3xl font-black tracking-tight truncate">
                          {profile?.name || user?.displayName || "Aspirant"}
                        </h2>
                        <div className="flex flex-wrap items-center justify-start gap-2">
                          <div className={cn(
                            "flex items-center gap-1 px-2 py-0.5 rounded-full font-bold text-[8px] md:text-[10px] transition-all",
                            isActive ? "bg-primary text-white" : "bg-white/10 text-slate-400"
                          )}>
                             <Gem className="h-2.5 w-2.5" />
                             {isActive ? (passCountdown || 'Active') : 'Free Pass'}
                          </div>
                          <div className="text-slate-400 font-bold text-[8px] md:text-[10px] flex items-center gap-1">
                            <Target className="h-2.5 w-2.5 text-primary" /> {profile?.targetExam || 'Punjab Exams'}
                          </div>
                        </div>
                    </div>
                  </div>
                </div>
              </section>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-5">
                <MetricItem label="Progress" val={resultsLoading ? "..." : `${stats.readiness}%`} icon={<TrendingUp className="text-primary" />} />
                <MetricItem label="Accuracy" val={resultsLoading ? "..." : `${stats.avgAccuracy}%`} icon={<Target className="text-emerald-500" />} />
                <MetricItem label="Test Count" val={resultsLoading ? "..." : stats.total} icon={<ClipboardList className="text-blue-500" />} />
                <MetricItem label="Study Hours" val={resultsLoading ? "..." : stats.hours} icon={<Clock className="text-amber-500" />} />
              </div>

              <Card className="border-none shadow-xl rounded-xl md:rounded-[2rem] bg-white overflow-hidden text-left border border-slate-100">
                <CardHeader className="p-4 md:p-8 border-b border-slate-50 bg-slate-50/30">
                    <div className="space-y-0.5">
                      <h3 className="font-black text-sm md:text-xl text-[#0F172A]">Recent Attempts</h3>
                      <p className="text-[8px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest">Test History</p>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="divide-y divide-slate-50">
                      {resultsLoading ? (
                          Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="p-4 md:p-8 flex gap-4 items-center"><Skeleton className="h-10 w-10 rounded-lg bg-slate-50" /><div className="flex-1 space-y-1.5"><Skeleton className="h-3 w-1/3 bg-slate-50" /><Skeleton className="h-2 w-1/4 bg-slate-50" /></div></div>
                          ))
                      ) : stats.list.length > 0 ? (
                          stats.list.map((r: any) => (
                            <Link key={r.id} href={`/results/${r.mockId}`} className="p-4 md:p-8 flex items-center justify-between hover:bg-slate-50/50 transition-all group">
                                <div className="flex items-center gap-3 md:gap-6 min-w-0 flex-1">
                                  <div className="h-10 w-10 md:h-12 md:w-12 rounded-lg bg-slate-50 flex items-center justify-center shrink-0 shadow-inner">
                                      <Zap className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                                  </div>
                                  <div className="min-w-0 space-y-1">
                                      <p className="font-bold text-[#0B1528] text-sm md:text-lg truncate leading-none">
                                         {r.mockTitle}
                                      </p>
                                      <div className="flex items-center gap-2 text-[8px] md:text-[10px] font-bold text-slate-400">
                                        <span className="flex items-center gap-1"><Calendar className="h-2.5 w-2.5 text-slate-300" /> {r.timestamp ? new Date(r.timestamp).toLocaleDateString() : 'N/A'}</span>
                                        <Badge className="bg-emerald-50 text-emerald-600 border-none font-black px-1.5 py-0 rounded text-[7px]">{r.accuracy}%</Badge>
                                      </div>
                                  </div>
                                </div>
                                <ChevronRight className="h-4 w-4 text-slate-200 group-hover:text-primary transition-all group-hover:translate-x-1" />
                            </Link>
                          ))
                      ) : (
                          <div className="p-12 text-center opacity-30 italic text-sm font-bold text-slate-400">No tests taken yet.</div>
                      )}
                    </div>
                </CardContent>
              </Card>
          </div>

          <div className="lg:col-span-4 space-y-4 md:space-y-6">
              <Card className="border-none shadow-4xl bg-gradient-to-br from-blue-600 to-primary text-white p-6 md:p-10 rounded-2xl md:rounded-[2rem] relative overflow-hidden group">
                <div className="absolute bottom-0 right-0 p-4 opacity-10 rotate-12 group-hover:scale-110 transition-transform duration-1000"><Flame className="h-24 w-24 md:h-32 w-32" /></div>
                <div className="relative z-10 space-y-2 md:space-y-4 text-left">
                    <p className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] text-white/70">STUDY STREAK</p>
                    <div className="flex items-baseline gap-2">
                      <div className="text-4xl md:text-7xl font-black leading-none">{resultsLoading ? "..." : stats.streak}</div>
                      <div className="space-y-0.5">
                          <p className="text-sm md:text-lg font-black uppercase">Days</p>
                          <p className="text-[7px] font-bold uppercase text-white/60">Practice Activity</p>
                      </div>
                    </div>
                </div>
              </Card>

              {profile?.queuedPasses && profile.queuedPasses.length > 0 && (
                <Card className="border-none shadow-xl bg-white p-6 rounded-2xl border border-slate-100 overflow-hidden relative">
                   <div className="absolute top-0 right-0 p-4 opacity-10"><Layers className="h-12 w-12" /></div>
                   <div className="relative z-10 space-y-3">
                      <p className="text-[9px] font-black uppercase tracking-widest text-primary">Scheduled Extensions</p>
                      <h4 className="text-sm font-bold text-slate-900">{profile.queuedPasses.length} Pass nodes waiting</h4>
                      <Link href="/pass" className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-primary transition-colors flex items-center gap-1">Manage Queue <ChevronRight className="h-3 w-3" /></Link>
                   </div>
                </Card>
              )}

              <div className="bg-white p-4 md:p-6 rounded-2xl border border-slate-100 shadow-xl space-y-4 md:space-y-6">
                 <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Quick Tools</h4>
                 <div className="grid grid-cols-1 gap-2 md:gap-3">
                    <QuickToolLink href="/my-exams" label="My Exams" icon={Target} />
                    <QuickToolLink href="/analytics" label="Full Analytics" icon={TrendingUp} />
                    <QuickToolLink href="/bookmarks" label="Saved Questions" icon={Bookmark} />
                 </div>
              </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

function MetricItem({ label, val, icon }: { label: string, val: string | number, icon: React.ReactNode }) {
  return (
    <Card className="border-none shadow-lg bg-white p-4 md:p-6 rounded-2xl text-left group hover:translate-y-[-2px] transition-all border border-slate-100 min-w-0">
      <div className="h-8 w-8 md:h-10 md:w-10 rounded-xl bg-slate-50 flex items-center justify-center mb-3 md:mb-4 group-hover:bg-primary/5 transition-all shadow-inner shrink-0">
        {isValidElement(icon) && cloneElement(icon as ReactElement<any>, { 
          className: cn("h-4 w-4 md:h-5 md:w-5") 
        })}
      </div>
      <div className="flex flex-col">
        <div className="text-lg md:text-2xl font-black text-[#0F172A] leading-none tabular-nums truncate">{val}</div>
        <p className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-slate-400 mt-2">{label}</p>
      </div>
    </Card>
  )
}

function QuickToolLink({ href, label, icon: Icon }: any) {
   return (
      <Link href={href} className="flex items-center justify-between p-3 md:p-4 rounded-xl border border-slate-50 bg-slate-50/50 hover:bg-slate-100 transition-all active:scale-[0.98] group">
         <div className="flex items-center gap-3">
            <Icon className="h-4 w-4 text-primary" />
            <span className="text-xs md:text-sm font-bold text-[#0F172A]">{label}</span>
         </div>
         <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-primary transition-all" />
      </Link>
   )
}
