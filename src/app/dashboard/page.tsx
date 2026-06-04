
"use client"

import { useMemo, useState, useEffect } from "react"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import { useUser, useCollection, useFirestore } from "@/firebase"
import { collection, query, where, orderBy, limit } from "firebase/firestore"
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
  PlayCircle, 
  Sparkles, 
  History, 
  FileText,
  Flame,
  Clock,
  Layout,
  TrendingUp,
  Award,
  ArrowUpRight
} from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { cn } from "@/lib/utils"
import StudentAvatar from "@/components/brand/StudentAvatar"
import { Progress } from "@/components/ui/progress"

/**
 * @fileOverview Final Institutional Success Hub.
 * Optimized for Testbook-style high-density information architecture.
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
    return query(collection(db, "results"), where("userId", "==", user.uid), orderBy("timestamp", "desc"))
  }, [db, user])

  const { data: results, loading: resultsLoading } = useCollection<any>(resultsQuery)

  const stats = useMemo(() => {
    if (!results || results.length === 0) return { 
      total: 0, 
      avgAccuracy: 0, 
      streak: 0, 
      readiness: 45,
      hours: "0h",
      stateRank: "N/A"
    }
    
    const total = results.length
    const avgAcc = Math.round(results.reduce((acc: number, r: any) => acc + (r.accuracy || 0), 0) / total)
    
    // Mock calculations for production feel
    return { 
      total, 
      avgAccuracy: avgAcc, 
      streak: total > 5 ? 7 : 0, 
      readiness: Math.min(96, Math.max(30, avgAcc + 5)),
      hours: `${Math.round(total * 1.5)}h`,
      stateRank: avgAcc > 85 ? "#42" : avgAcc > 70 ? "#156" : "#2.4k"
    }
  }, [results])

  if (loading) return <div className="h-screen flex items-center justify-center bg-white"><Sparkles className="h-10 w-10 text-primary animate-pulse" /></div>

  return (
    <div className="min-h-screen bg-slate-50/50 pb-32">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8 max-w-6xl space-y-10">
        
        {/* Profile Success Header */}
        <section className="bg-[#0B1528] text-white p-8 md:p-12 rounded-[3.5rem] shadow-4xl relative overflow-hidden">
          <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[150%] bg-primary/20 blur-[120px] rounded-full" />
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
            <div className="relative group">
              <StudentAvatar profile={profile} className="h-32 w-32 md:h-44 md:w-44 border-[8px] border-white/5 rounded-[3rem] shadow-2xl" />
              <div className="absolute -bottom-2 -right-2 h-10 w-10 bg-emerald-500 rounded-2xl border-4 border-[#0B1528] flex items-center justify-center shadow-xl">
                 <div className="h-2.5 w-2.5 bg-white rounded-full animate-ping" />
              </div>
            </div>
            <div className="flex-1 text-center md:text-left space-y-4">
              <div className="space-y-1">
                 <h2 className="text-3xl md:text-5xl font-headline font-black tracking-tight leading-none">{profile?.name}</h2>
                 <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">{profile?.email}</p>
              </div>
              <div className="flex flex-wrap justify-center md:justify-start gap-4">
                 <Badge className="bg-primary text-white border-none px-4 py-1.5 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-xl">
                   {profile?.status || 'Free'} Pass Active
                 </Badge>
                 <Badge variant="outline" className="border-white/10 text-slate-300 px-4 py-1.5 rounded-xl font-black uppercase text-[10px] tracking-widest">
                   {profile?.targetExam || 'General Aspirant'}
                 </Badge>
              </div>
            </div>
            <div className="hidden lg:block h-24 w-px bg-white/5" />
            <div className="hidden lg:flex flex-col items-center gap-2">
               <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Member Since</span>
               <p className="text-xl font-headline font-black">JAN 2026</p>
            </div>
          </div>
        </section>

        {/* Quick Stats Matrix */}
        <section className="grid grid-cols-2 lg:grid-cols-6 gap-4 md:gap-6">
          <StatCard label="Streak" value={stats.streak} sub="Days" icon={<Flame className="text-orange-500" />} />
          <StatCard label="Accuracy" value={`${stats.avgAccuracy}%`} sub="Precision" icon={<Target className="text-primary" />} />
          <StatCard label="Attempts" value={stats.total} sub="Tests" icon={<ClipboardList className="text-blue-500" />} />
          <StatCard label="Study Time" value={stats.hours} sub="Total" icon={<Clock className="text-emerald-500" />} />
          <StatCard label="Rank" value={stats.stateRank} sub="State-wide" icon={<Trophy className="text-amber-500" />} />
          <StatCard label="Readiness" value={`${stats.readiness}%`} sub="Target" icon={<Zap className="text-primary" />} isPremium />
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Main Content Area */}
          <div className="lg:col-span-8 space-y-10">
            
            {/* Readiness Engine */}
            <Card className="border-none shadow-3xl rounded-[3rem] bg-white overflow-hidden">
               <CardHeader className="p-10 border-b border-slate-50 text-left flex flex-row items-center justify-between">
                  <div className="space-y-1">
                    <CardTitle className="font-headline text-2xl font-black text-[#0F172A] uppercase">Exam Readiness Score</CardTitle>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Institutional pattern-based audit</p>
                  </div>
                  <Button variant="ghost" asChild className="text-primary font-black uppercase text-[10px] tracking-widest gap-2">
                    <Link href="/analytics">Full Analysis <ArrowUpRight className="h-4 w-4" /></Link>
                  </Button>
               </CardHeader>
               <CardContent className="p-10 space-y-10">
                  <div className="flex flex-col md:flex-row items-center gap-12">
                     <div className="relative h-48 w-44 flex items-center justify-center shrink-0">
                        <svg className="w-full h-full rotate-[-90deg]">
                           <circle cx="88" cy="88" r="70" stroke="currentColor" strokeWidth="16" fill="transparent" className="text-slate-100" />
                           <circle cx="88" cy="88" r="70" stroke="currentColor" strokeWidth="16" fill="transparent" 
                                   strokeDasharray={440} strokeDashoffset={440 - (440 * stats.readiness) / 100}
                                   strokeLinecap="round" className="text-primary transition-all duration-1000" />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                           <span className="text-5xl font-headline font-black text-[#0F172A]">{stats.readiness}%</span>
                           <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Global Readiness</span>
                        </div>
                     </div>
                     <div className="flex-1 w-full space-y-6">
                        <SubjectReadyNode label="Mental Ability" val={82} color="bg-blue-500" />
                        <SubjectReadyNode label="Quant Aptitude" val={68} color="bg-primary" />
                        <SubjectReadyNode label="Punjab GK" val={92} color="bg-emerald-500" />
                        <SubjectReadyNode label="Language" val={75} color="bg-amber-500" />
                     </div>
                  </div>
               </CardContent>
            </Card>

            {/* Test History */}
            <Card className="border-none shadow-3xl rounded-[3rem] bg-white overflow-hidden">
               <CardHeader className="p-10 border-b border-slate-50 text-left">
                  <CardTitle className="font-headline text-2xl font-black text-[#0F172A] uppercase">Recent Preparation Audit</CardTitle>
               </CardHeader>
               <CardContent className="p-0">
                  <div className="divide-y divide-slate-50">
                     {resultsLoading ? (
                        Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-24 w-full bg-slate-50 animate-pulse" />)
                     ) : results && results.length > 0 ? (
                        results.slice(0, 5).map((r: any) => (
                           <div key={r.id} className="p-8 md:p-10 flex items-center justify-between hover:bg-slate-50 transition-all group cursor-pointer" onClick={() => router.push(`/results/${r.mockId}`)}>
                              <div className="flex items-center gap-6">
                                 <div className="h-14 w-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                                    <Zap className="h-6 w-6 text-primary" />
                                 </div>
                                 <div className="text-left space-y-1">
                                    <p className="font-black text-[#0B1528] text-lg leading-tight uppercase">{r.mockTitle}</p>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Score: {r.score}/{r.totalQuestions} • {new Date(r.timestamp).toLocaleDateString()}</p>
                                 </div>
                              </div>
                              <div className="text-right flex items-center gap-6">
                                 <div className="hidden md:block">
                                    <p className="text-xl font-headline font-black text-emerald-600">{r.accuracy}%</p>
                                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest text-right">Precision</p>
                                 </div>
                                 <Button variant="ghost" size="icon" className="rounded-xl h-10 w-10 bg-slate-50"><ChevronRight className="h-4 w-4" /></Button>
                              </div>
                           </div>
                        ))
                     ) : (
                        <div className="p-20 text-center text-slate-300 italic">No tests attempted in this audit cycle.</div>
                     )}
                  </div>
                  <Button asChild variant="ghost" className="w-full h-16 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-primary rounded-none border-t border-slate-50">
                     <Link href="/analytics">View Full Performance Trail</Link>
                  </Button>
               </CardContent>
            </Card>
          </div>

          {/* Right Sidebar Nodes */}
          <div className="lg:col-span-4 space-y-10 text-left">
             <Card className="border-none bg-[#0F172A] text-white rounded-[3.5rem] p-12 overflow-hidden relative shadow-4xl group cursor-pointer">
                <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:scale-110 transition-transform"><Sparkles className="h-40 w-40" /></div>
                <div className="relative z-10 space-y-8">
                   <div className="h-16 w-16 bg-primary/20 rounded-[2rem] flex items-center justify-center text-primary shadow-2xl">
                      <Award className="h-8 w-8" />
                   </div>
                   <div className="space-y-2">
                      <h4 className="text-3xl font-headline font-black uppercase leading-tight">Mastery <br/> Achievements</h4>
                      <p className="text-slate-400 text-sm font-medium">Unlock institutional badges through consistent audit precision.</p>
                   </div>
                   <div className="grid grid-cols-4 gap-4">
                      <AchievementIcon active icon="🏅" title="First Node" />
                      <AchievementIcon active icon="🔥" title="3 Day Streak" />
                      <AchievementIcon icon="🎯" title="90% Club" />
                      <AchievementIcon icon="📚" title="Century" />
                   </div>
                </div>
             </Card>

             <Card className="border-none shadow-3xl rounded-[3.5rem] bg-white p-12 space-y-10 text-left">
                <h3 className="font-headline font-black text-xs uppercase tracking-[0.3em] text-slate-400">Quick Access Hub</h3>
                <div className="grid grid-cols-2 gap-6">
                   <ActionLink icon={<Bookmark className="text-primary" />} label="Saved MCQs" href="/revision" />
                   <ActionLink icon={<TrendingUp className="text-blue-500" />} label="Leaderboard" href="/leaderboard" />
                   <ActionLink icon={<FileText className="text-emerald-500" />} label="Download PYQs" href="/pyqs" />
                   <ActionLink icon={<Layout className="text-orange-500" />} label="Exam Hubs" href="/exams" />
                </div>
             </Card>

             <Card className="border-primary/20 bg-primary/5 rounded-[3.5rem] p-12 space-y-6 border shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-6 opacity-[0.03] rotate-12"><ClipboardList className="h-40 w-40" /></div>
                <h4 className="font-headline font-black text-2xl text-[#0F172A] uppercase leading-tight">Elite Pass Mode</h4>
                <p className="text-slate-600 text-sm font-medium leading-relaxed">Upgrade to unlock AI Rationalization Tutors and all 500+ Official Pattern Mocks.</p>
                <Button asChild className="w-full h-16 bg-primary hover:bg-orange-600 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-2xl">
                   <Link href="/pass">Activate Elite Pass</Link>
                </Button>
             </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

function StatCard({ label, value, sub, icon, isPremium }: any) {
  return (
    <Card className={cn(
       "border-none shadow-xl bg-white p-6 rounded-[2rem] transition-all hover:translate-y-[-4px] group text-left",
       isPremium ? "border-2 border-primary/20 bg-primary/5" : ""
    )}>
      <div className="flex items-center justify-between mb-4">
        <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">{icon}</div>
        {isPremium && <Badge className="bg-primary text-white border-none text-[8px] font-black uppercase">PRO</Badge>}
      </div>
      <p className="text-2xl font-headline font-black text-[#0F172A] tracking-tighter">{value}</p>
      <div className="flex items-center gap-1.5 mt-1">
         <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">{label}</span>
      </div>
    </Card>
  )
}

function SubjectReadyNode({ label, val, color }: any) {
   return (
      <div className="space-y-2">
         <div className="flex justify-between items-end">
            <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">{label}</span>
            <span className="text-[11px] font-black text-[#0F172A]">{val}%</span>
         </div>
         <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden shadow-inner">
            <div className={cn("h-full transition-all duration-1000", color)} style={{ width: `${val}%` }} />
         </div>
      </div>
   )
}

function AchievementIcon({ icon, active, title }: any) {
   return (
      <div className={cn(
         "h-12 w-12 rounded-xl flex items-center justify-center text-xl transition-all shadow-lg",
         active ? "bg-white/10 grayscale-0" : "bg-white/5 grayscale opacity-20"
      )} title={title}>
         {icon}
      </div>
   )
}

function ActionLink({ icon, label, href }: any) {
   return (
      <Link href={href} className="flex flex-col items-center gap-3 p-6 bg-slate-50 rounded-3xl border border-slate-100 hover:border-primary/20 hover:bg-white transition-all shadow-sm">
         <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center shadow-sm">{icon}</div>
         <span className="text-[9px] font-black uppercase tracking-tight text-slate-500 text-center">{label}</span>
      </Link>
   )
}
