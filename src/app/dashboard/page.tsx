"use client"

import React, { useMemo, useState, useEffect, isValidElement, cloneElement, ReactElement } from "react"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import { useUser, useCollection, useFirestore } from "@/firebase"
import { collection, query, where, limit, doc, onSnapshot } from "firebase/firestore"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Trophy, 
  Target, 
  Zap, 
  ChevronRight, 
  Clock, 
  Calendar,
  Activity,
  Gem,
  Search,
  BookOpen,
  Newspaper,
  FileStack,
  ShieldAlert,
  BarChart,
  AreaChart,
  Loader2
} from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { cn } from "@/lib/utils"
import StudentAvatar from "@/components/brand/StudentAvatar"
import { Skeleton } from "@/components/ui/skeleton"
import { useStudySessions } from "@/hooks/useStudyAnalytics"

/**
 * @fileOverview Student Progress Portal v63.0.
 * Rebuilt using the session-based Study Analytics Engine for absolute accuracy.
 */

const formatStudyTime = (seconds: number) => {
  if (isNaN(seconds) || seconds <= 0) return "0m";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

export default function StudentDashboard() {
  const { user, profile, loading: authLoading } = useUser();
  const db = useFirestore();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  
  const { stats, loading: statsLoading } = useStudySessions();

  useEffect(() => {
    setMounted(true);
  }, []);

  const resultsQuery = useMemo(() => {
    if (!db || !user || !mounted) return null
    return query(collection(db, "results"), where("userId", "==", user.uid), limit(8))
  }, [db, user, mounted])

  const { data: recentResults, loading: resultsLoading } = useCollection<any>(resultsQuery)

  if (!mounted || authLoading) return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-white space-y-4">
      <Loader2 className="h-8 w-8 text-primary animate-spin" />
    </div>
  );

  const isActivePass = profile?.passStatus === 'active';
  const isAdmin = profile?.role === 'ADMIN' || profile?.role === 'SUPER_ADMIN';

  const yearlyGoalPercent = Math.min(100, Math.round((stats.year / (365 * 3600)) * 100));

  return (
    <div className="min-h-[100dvh] bg-slate-50/50 font-body pb-safe text-left">
      <Navbar />
      <main className="container mx-auto px-4 py-5 md:py-8 max-w-7xl space-y-5 md:space-y-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
          <div className="lg:col-span-8 space-y-5 md:space-y-8">
              <section className="bg-[#0B1528] text-white p-5 md:p-8 rounded-2xl md:rounded-[2.5rem] shadow-xl relative overflow-hidden group">
                <div className="relative z-10 flex flex-row items-center gap-4 md:gap-8">
                  <Link href="/profile" className="shrink-0 active:scale-95 transition-all">
                    <StudentAvatar profile={profile} className="h-14 w-14 md:h-24 md:w-24 border-[3px] border-white/10 rounded-xl md:rounded-2xl bg-[#0F172A]" />
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link href="/profile" className="block group/name">
                        <h1 className="text-xl md:text-4xl font-bold tracking-tight text-white/90 truncate">
                          {profile?.name || "Student"}
                        </h1>
                        <div className="flex flex-wrap items-center gap-2 mt-1.5">
                          <div className={cn("flex items-center gap-1.5 px-3 py-1 rounded-full font-bold text-[11px] shadow-lg", isActivePass ? "bg-blue-500 text-white" : "bg-white/10 text-slate-300")}>
                             <Gem className="h-3 w-3" /> {isActivePass ? (profile?.pass?.plan || 'Elite Pass') : 'Free Pass'}
                          </div>
                        </div>
                    </Link>
                  </div>
                </div>
              </section>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-5">
                 <MetricItem label="Today's study" val={formatStudyTime(stats.today)} icon={<Clock />} loading={statsLoading} />
                 <MetricItem label="This week" val={formatStudyTime(stats.week)} icon={<Calendar />} loading={statsLoading} />
                 <MetricItem label="This month" val={formatStudyTime(stats.month)} icon={<BarChart />} loading={statsLoading} />
                 <MetricItem label="Yearly goal" val={`${yearlyGoalPercent}%`} icon={<Target />} loading={statsLoading} />
              </div>

              <Card className="border-none shadow-lg rounded-2xl md:rounded-[2rem] bg-white overflow-hidden border border-slate-50">
                <CardHeader className="p-5 md:p-6 border-b border-slate-50 bg-slate-50/30">
                    <h2 className="font-bold text-lg text-[#0F172A]">Recent Tests</h2>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="divide-y divide-slate-50">
                      {resultsLoading ? Array.from({ length: 3 }).map((_, i) => <div key={i} className="p-5 md:p-6 flex gap-4 items-center"><Skeleton className="h-10 w-10 rounded-lg bg-slate-50" /><div className="flex-1 space-y-1.5"><Skeleton className="h-3 w-1/3 bg-slate-50" /><Skeleton className="h-2 w-1/4 bg-slate-50" /></div></div>) : 
                      recentResults && recentResults.length > 0 ? recentResults.map((r: any) => (
                        <div key={r.id} onClick={() => router.push(`/results/view?id=${r.mockId}`)} className="p-5 md:p-6 flex items-center justify-between hover:bg-slate-50/50 transition-all group cursor-pointer">
                            <div className="flex items-center gap-4 min-w-0 flex-1">
                              <div className="h-10 w-10 md:h-11 md:w-11 rounded-xl bg-slate-50 flex items-center justify-center shrink-0 shadow-inner"><Zap className="h-4 w-4 text-primary" /></div>
                              <div className="min-w-0 space-y-0.5 flex-1">
                                  <p className="font-bold text-[#0B1228] text-sm md:text-base line-clamp-1 leading-snug">{r.mockTitle}</p>
                                  <div className="flex items-center gap-3 text-[11px] font-bold text-slate-400 tracking-tight">
                                    <span>Score: {r.score}</span>
                                    <Badge className="bg-emerald-50 text-emerald-600 border-none font-bold px-1.5 py-0 rounded text-[9px]">{r.accuracy}%</Badge>
                                  </div>
                              </div>
                            </div>
                            <ChevronRight className="h-4 w-4 text-slate-200 group-hover:text-primary transition-all group-hover:translate-x-1 shrink-0 ml-4" />
                        </div>
                      )) : <div className="p-10 text-center opacity-30 text-sm font-bold text-slate-400">No tests taken yet.</div>}
                    </div>
                </CardContent>
              </Card>
          </div>

          <div className="lg:col-span-4 space-y-5">
               <Card className="border-none shadow-xl bg-blue-600 text-white p-6 md:p-10 rounded-2xl md:rounded-[2.5rem] relative overflow-hidden group">
                <div className="absolute bottom-0 right-0 p-4 opacity-10 rotate-12 group-hover:scale-110 transition-transform"><Activity className="h-20 w-20 md:h-24 md:w-24" /></div>
                <div className="relative z-10 text-left space-y-6">
                    <div>
                      <p className="text-[10px] font-bold text-white/70 uppercase tracking-widest flex items-center gap-2">
                        🔥 Lifetime Study
                      </p>
                      <div className="text-3xl md:text-4xl lg:text-5xl font-black leading-none mt-2 tracking-tighter tabular-nums">
                        {Math.floor(stats.lifetime / 3600)}h {Math.floor((stats.lifetime % 3600) / 60)}m
                      </div>
                    </div>

                    <div className="flex gap-6 border-t border-white/10 pt-6">
                      <div className="flex-1">
                        <p className="text-[9px] font-bold text-white/50 uppercase tracking-widest">Current Streak</p>
                        <p className="text-base font-black tabular-nums">{stats.currentStreak} Days</p>
                      </div>
                      <div className="w-px h-8 bg-white/10" />
                      <div className="flex-1">
                        <p className="text-[9px] font-bold text-white/50 uppercase tracking-widest">Best Streak</p>
                        <p className="text-base font-black tabular-nums">{stats.longestStreak} Days</p>
                      </div>
                    </div>
                </div>
              </Card>

              <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-md space-y-5">
                 <h4 className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">Quick Portal Tools</h4>
                 <div className="grid grid-cols-1 gap-2">
                    <QuickToolLink href="/search" label="Search Bank" icon={Search} />
                    <QuickToolLink href="/current-affairs" label="Current Affairs" icon={Newspaper} />
                    <QuickToolLink href="/notes" label="Study Material" icon={BookOpen} />
                    <QuickToolLink href="/pyqs" label="Old Papers" icon={FileStack} />
                    {isAdmin && <QuickToolLink href="/admin" label="Admin Panel" icon={ShieldAlert} highlight />}
                 </div>
              </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

function MetricItem({ label, val, icon, loading }: { label: string, val: string | number, icon: React.ReactNode, loading?: boolean }) {
  return (
    <Card className="border-none shadow-md bg-white p-4 md:p-5 rounded-2xl text-left group border border-slate-50 min-w-0">
      <div className={cn(
        "h-9 w-9 rounded-xl flex items-center justify-center mb-3 shadow-inner shrink-0 transition-all",
        "bg-slate-50 text-primary"
      )}>
        {isValidElement(icon) ? cloneElement(icon as ReactElement<{ className?: string }>, { className: "h-4 w-4" }) : icon}
      </div>
      {loading ? (
        <Skeleton className="h-6 w-16 bg-slate-50 rounded" />
      ) : (
        <div className="text-lg md:text-xl font-black text-[#0F172A] leading-none truncate tabular-nums">{val}</div>
      )}
      <p className="text-[10px] font-bold tracking-tight text-slate-400 mt-1.5">{label}</p>
    </Card>
  )
}

function QuickToolLink({ href, label, icon: Icon, highlight }: any) {
   return (
      <Link href={href} className={cn("flex items-center justify-between p-3 rounded-xl border transition-all active:scale-[0.98] group", highlight ? "border-primary/10 bg-primary/5" : "border-slate-50 bg-slate-50/50 hover:bg-slate-100")}>
         <div className="flex items-center gap-3">
            <Icon className={cn("h-4 w-4", highlight ? "text-primary" : "text-slate-500 group-hover:text-primary")} />
            <span className={cn("text-sm font-bold", highlight ? "text-primary" : "text-[#0F172A]")}>{label}</span>
         </div>
         <ChevronRight className="h-3.5 w-3.5 text-slate-300 group-hover:text-primary transition-all" />
      </Link>
   )
}
