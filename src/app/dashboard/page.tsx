
"use client"

import React, { useMemo, useState, useEffect, isValidElement, cloneElement, ReactElement } from "react"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import { useUser, useCollection, useFirestore } from "@/firebase"
import { collection, query, where, limit, doc, deleteDoc, serverTimestamp } from "firebase/firestore"
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
  AlertCircle,
  User as UserIcon,
  Search,
  BookOpen,
  Newspaper,
  FileStack,
  ShieldAlert
} from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { cn } from "@/lib/utils"
import StudentAvatar from "@/components/brand/StudentAvatar"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"

/**
 * @fileOverview Student Home - Typography Standardized v48.0.
 */
export default function StudentDashboard() {
  const { user, profile, loading: authLoading } = useUser();
  const db = useFirestore()
  const router = useRouter()
  const { toast } = useToast()
  const [mounted, setMounted] = useState(false)
  const [passCountdown, setPassCountdown] = useState("");

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted && !authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router, mounted])

  useEffect(() => {
    const expiryStr = profile?.passExpiresAt;
    if (!expiryStr) return;
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
    return query(collection(db, "results"), where("userId", "==", user.uid))
  }, [db, user, mounted])

  const mocksQuery = useMemo(() => (db && mounted ? collection(db, "mocks") : null), [db, mounted]);

  const { data: rawResults, loading: resultsLoading } = useCollection<any>(resultsQuery)
  const { data: validMocks, loading: mocksLoading } = useCollection<any>(mocksQuery)

  const stats = useMemo(() => {
    if (!rawResults || rawResults.length === 0 || !validMocks) return { total: 0, avgAccuracy: 0, streak: 0, readiness: 0, hours: "0h", list: [] }
    const validMockIds = new Set(validMocks.map(m => m.id));
    const filtered = rawResults.filter(r => validMockIds.has(r.mockId));
    const sorted = [...filtered].sort((a, b) => new Date(b.timestamp || 0).getTime() - new Date(a.timestamp || 0).getTime());
    const total = sorted.length
    const correct = sorted.reduce((acc: number, r: any) => acc + (r.correctCount || 0), 0)
    const attempted = sorted.reduce((acc: number, r: any) => acc + (Object.keys(r.answers || {}).length), 0)
    const avgAcc = attempted > 0 ? Math.round((correct / attempted) * 100) : 0
    const totalSeconds = sorted.reduce((acc: number, r: any) => acc + (Number(r.timeTaken) || 0), 0)
    const timeFormattedValue = totalSeconds >= 3600 ? `${(totalSeconds / 3600).toFixed(1)}h` : totalSeconds >= 60 ? `${Math.floor(totalSeconds / 60)}m` : "0h";
    const uniqueDays = new Set(sorted.map((r: any) => new Date(r.timestamp).toDateString()))
    return { total, avgAccuracy: avgAcc, streak: uniqueDays.size, readiness: Math.min(100, Math.round((avgAcc * 0.7) + (Math.min(total, 30) * 1))), hours: timeFormattedValue, list: sorted.slice(0, 8) }
  }, [rawResults, validMocks])

  if (!mounted || authLoading) return <div className="h-screen w-full flex flex-col items-center justify-center bg-white space-y-4"><Zap className="h-8 w-8 text-primary animate-pulse" /></div>;

  const isActive = profile?.passStatus === 'active';
  const isAdmin = profile?.role === 'ADMIN' || profile?.role === 'SUPER_ADMIN';

  return (
    <div className="min-h-[100dvh] bg-slate-50/50 font-body pb-safe text-left">
      <Navbar />
      <main className="container mx-auto px-4 py-6 md:py-10 max-w-7xl space-y-6 md:space-y-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
          <div className="lg:col-span-8 space-y-6 md:space-y-8">
              <section className="bg-[#0B1528] text-white p-6 md:p-10 rounded-2xl md:rounded-[3rem] shadow-2xl relative overflow-hidden group">
                <div className="relative z-10 flex flex-row items-center gap-4 md:gap-10">
                  <Link href="/profile" className="shrink-0 active:scale-95 transition-all">
                    <StudentAvatar profile={profile} className="h-14 w-14 md:h-28 md:w-28 border-[3px] border-white/10 rounded-xl md:rounded-3xl bg-[#0F172A]" />
                  </Link>
                  <div className="flex-1 space-y-1 min-w-0">
                    <Link href="/profile" className="block group/name">
                        <h1 className="text-[24px] md:text-3xl font-black tracking-tight truncate group-hover/name:text-primary transition-colors">
                          {profile?.name || "Student"}
                        </h1>
                        <div className="flex flex-wrap items-center gap-2">
                          <div className={cn("flex items-center gap-1 px-2 py-0.5 rounded-full font-bold text-[11px]", isActive ? "bg-primary text-white" : "bg-white/10 text-slate-400")}>
                             <Gem className="h-3 w-3" /> {isActive ? (passCountdown || 'Active') : 'Free Pass'}
                          </div>
                        </div>
                    </Link>
                  </div>
                </div>
              </section>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 md:gap-5">
                <MetricItem label="Progress" val={`${stats.readiness}%`} icon={<TrendingUp className="text-primary" />} />
                <MetricItem label="Accuracy" val={`${stats.avgAccuracy}%`} icon={<Target className="text-emerald-500" />} />
                <MetricItem label="Tests" val={stats.total} icon={<ClipboardList className="text-blue-500" />} />
                <MetricItem label="Study Time" val={stats.hours} icon={<Clock className="text-amber-500" />} />
              </div>

              <Card className="border-none shadow-xl rounded-2xl md:rounded-[2rem] bg-white overflow-hidden border border-slate-100">
                <CardHeader className="p-6 md:p-8 border-b border-slate-50 bg-slate-50/30">
                    <h2 className="font-bold text-[20px] text-[#0F172A]">Recent Tests</h2>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="divide-y divide-slate-50">
                      {resultsLoading ? Array.from({ length: 3 }).map((_, i) => <div key={i} className="p-6 md:p-8 flex gap-4 items-center"><Skeleton className="h-10 w-10 rounded-lg bg-slate-50" /><div className="flex-1 space-y-1.5"><Skeleton className="h-3 w-1/3 bg-slate-50" /><Skeleton className="h-2 w-1/4 bg-slate-50" /></div></div>) : 
                      stats.list.length > 0 ? stats.list.map((r: any) => (
                        <div key={r.id} onClick={() => router.push(`/results/view?id=${r.mockId}`)} className="p-6 md:p-8 flex items-center justify-between hover:bg-slate-50/50 transition-all group cursor-pointer">
                            <div className="flex items-center gap-4 md:gap-6 min-w-0 flex-1">
                              <div className="h-10 w-10 md:h-12 md:w-12 rounded-xl bg-slate-50 flex items-center justify-center shrink-0 shadow-inner"><Zap className="h-5 w-5 text-primary" /></div>
                              <div className="min-w-0 space-y-1 flex-1">
                                  <p className="font-semibold text-[#0B1528] text-[15px] md:text-[16px] line-clamp-2 leading-snug">{r.mockTitle}</p>
                                  <div className="flex items-center gap-3 text-[12px] font-bold text-slate-400 uppercase tracking-tight">
                                    <span>Score: {r.score}</span>
                                    <Badge className="bg-emerald-50 text-emerald-600 border-none font-black px-2 py-0.5 rounded text-[9px]">{r.accuracy}%</Badge>
                                  </div>
                              </div>
                            </div>
                            <ChevronRight className="h-4 w-4 text-slate-200 group-hover:text-primary transition-all group-hover:translate-x-1 shrink-0 ml-4" />
                        </div>
                      )) : <div className="p-12 text-center opacity-30 text-sm font-bold text-slate-400">No tests taken yet.</div>}
                    </div>
                </CardContent>
              </Card>
          </div>

          <div className="lg:col-span-4 space-y-6">
              <Card className="border-none shadow-4xl bg-blue-600 text-white p-6 md:p-10 rounded-2xl md:rounded-[2rem] relative overflow-hidden group">
                <div className="absolute bottom-0 right-0 p-4 opacity-10 rotate-12 group-hover:scale-110 transition-transform"><Flame className="h-24 w-24 md:h-32 w-32" /></div>
                <div className="relative z-10 text-left">
                    <p className="text-[11px] font-bold text-white/70 uppercase tracking-widest">Daily streak</p>
                    <div className="flex items-baseline gap-2">
                      <div className="text-[48px] md:text-7xl font-black leading-none">{stats.streak}</div>
                      <p className="text-[16px] font-bold">Days</p>
                    </div>
                </div>
              </Card>

              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xl space-y-6">
                 <h4 className="text-[11px] font-black text-slate-400 tracking-widest uppercase">Quick Tools</h4>
                 <div className="grid grid-cols-1 gap-2 md:gap-3">
                    <QuickToolLink href="/search" label="Search Bank" icon={Search} />
                    <QuickToolLink href="/current-affairs" label="Current Affairs" icon={Newspaper} />
                    <QuickToolLink href="/notes" label="Study Material" icon={BookOpen} />
                    <QuickToolLink href="/pyqs" label="Old Papers" icon={FileStack} />
                    <QuickToolLink href="/leaderboard" label="Hall of Rankers" icon={Trophy} />
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

function MetricItem({ label, val, icon }: { label: string, val: string | number, icon: React.ReactNode }) {
  return (
    <Card className="border-none shadow-lg bg-white p-4 md:p-6 rounded-2xl text-left group border border-slate-100 min-w-0">
      <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center mb-4 group-hover:bg-primary/5 shadow-inner shrink-0">
        {isValidElement(icon) && cloneElement(icon as ReactElement<any>, { className: "h-5 w-5" })}
      </div>
      <div className="text-[18px] md:text-2xl font-black text-[#0F172A] leading-none truncate tabular-nums">{val}</div>
      <p className="text-[11px] font-bold tracking-tight text-slate-400 mt-2">{label}</p>
    </Card>
  )
}

function QuickToolLink({ href, label, icon: Icon, highlight }: any) {
   return (
      <Link href={href} className={cn("flex items-center justify-between p-3.5 rounded-xl border transition-all active:scale-[0.98] group", highlight ? "border-primary/20 bg-primary/5 hover:bg-primary/10" : "border-slate-50 bg-slate-50/50 hover:bg-slate-100")}>
         <div className="flex items-center gap-3">
            <Icon className={cn("h-4.5 w-4.5", highlight ? "text-primary" : "text-slate-500 group-hover:text-primary")} />
            <span className={cn("text-[13px] font-bold", highlight ? "text-primary" : "text-[#0F172A]")}>{label}</span>
         </div>
         <ChevronRight className="h-3.5 w-3.5 text-slate-300 group-hover:text-primary transition-all" />
      </Link>
   )
}
