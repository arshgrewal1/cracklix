
"use client"

import { useMemo, useState } from "react"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import { useUser, useCollection, useFirestore } from "@/firebase"
import { collection, query, where, doc, updateDoc } from "firebase/firestore"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  GraduationCap, 
  Calendar, 
  Trophy, 
  Target, 
  ClipboardList, 
  ShieldCheck,
  ChevronRight,
  Zap,
  Clock,
  Sparkles,
  Bell,
  CreditCard
} from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"

/**
 * @fileOverview Final Aspirant Profile Node (Phase 120).
 * Features: Membership Status and Pass Management.
 */

export default function ProfilePage() {
  const { user, profile, loading } = useUser()
  const db = useFirestore()
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    }
  }, [user, loading, router])

  const resultsQuery = useMemo(() => {
    if (!db || !user) return null
    return query(
      collection(db, "results"), 
      where("userId", "==", user.uid)
    )
  }, [db, user])

  const { data: allResults, loading: resultsLoading } = useCollection<any>(resultsQuery)

  const results = useMemo(() => {
    if (!allResults) return []
    return [...allResults].sort((a, b) => {
      const timeA = a.createdAt?.seconds || 0
      const timeB = b.createdAt?.seconds || 0
      return timeB - timeA
    })
  }, [allResults])

  const stats = useMemo(() => {
    if (!results || results.length === 0) return { total: 0, avgAccuracy: 0, bestScore: 0, rank: "N/A" }
    const total = results.length
    const avgAccuracy = Math.round(results.reduce((acc: number, curr: any) => acc + (curr.accuracy || 0), 0) / total)
    const bestScore = Math.max(...results.map((r: any) => r.score || 0))
    return { total, avgAccuracy, bestScore, rank: "Top 12%" }
  }, [results])

  const handleToggleSub = async (boardId: string) => {
    if (!db || !user || !profile) return
    const currentSubs = profile.subscriptions || []
    const nextSubs = currentSubs.includes(boardId) 
      ? currentSubs.filter(s => s !== boardId) 
      : [...currentSubs, boardId]
    
    await updateDoc(doc(db, "users", user.uid), { subscriptions: nextSubs })
    toast({ title: "Alert Settings Synced", description: `${boardId} alerts updated.` })
  }

  if (loading) {
    return <div className="min-h-screen bg-white flex items-center justify-center"><Sparkles className="h-12 w-12 text-primary animate-pulse" /></div>
  }

  if (!profile) return null

  return (
    <div className="min-h-screen bg-slate-50/50 font-body">
      <Navbar />
      
      <main className="container mx-auto px-6 py-16 max-w-6xl">
        <section className="relative mb-16">
          <div className="h-64 w-full bg-[#08152D] rounded-[3.5rem] overflow-hidden relative shadow-3xl">
            <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[150%] bg-primary/20 blur-[120px] rounded-full" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[40%] h-[120%] bg-blue-600/10 blur-[100px] rounded-full" />
            <div className="absolute bottom-10 right-12 flex items-center gap-3 px-6 py-3 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md">
              <ShieldCheck className="h-5 w-5 text-primary" />
              <span className="text-[10px] font-black text-white uppercase tracking-[0.3em]">Verified Aspirant</span>
            </div>
          </div>

          <div className="px-16 -mt-20 relative z-10 flex flex-col md:flex-row items-end gap-10">
            <div className="relative group">
              <Avatar className="h-44 w-44 border-[10px] border-white shadow-3xl rounded-[3rem] transition-transform duration-500 group-hover:scale-105">
                <AvatarImage src={user?.photoURL || `https://i.pravatar.cc/150?u=${user?.uid}`} />
                <AvatarFallback className="bg-slate-100 text-slate-400 text-4xl font-black">
                  {profile.name?.split(' ').map(n => n[0]).join('') || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="absolute bottom-4 right-4 h-10 w-10 bg-emerald-500 rounded-2xl border-4 border-white flex items-center justify-center shadow-2xl">
                <div className="h-2.5 w-2.5 bg-white rounded-full animate-ping" />
              </div>
            </div>

            <div className="flex-1 pb-6 space-y-3 text-left">
              <div className="flex flex-wrap items-center gap-4">
                <h1 className="text-5xl font-headline font-black text-[#0F172A] tracking-tight">{profile.name}</h1>
                <Badge className={profile.status === 'Free' ? "bg-slate-200 text-slate-500 border-none px-6 py-2 rounded-2xl font-black uppercase text-[10px] tracking-widest" : "bg-amber-100 text-amber-600 border-none px-6 py-2 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl"}>
                  {profile.status} Pass Active
                </Badge>
              </div>
              <div className="flex flex-wrap items-center gap-8 text-slate-500 font-bold uppercase tracking-widest text-[10px]">
                <span className="flex items-center gap-3"><Mail className="h-4 w-4 text-primary" /> {profile.email}</span>
                <span className="flex items-center gap-3"><GraduationCap className="h-4 w-4 text-primary" /> Targeting {profile.targetExam || "Punjab Exams"}</span>
              </div>
            </div>

            <div className="pb-8">
               <Button asChild className="bg-primary hover:bg-orange-600 text-white font-black uppercase text-[10px] tracking-widest rounded-2xl h-16 px-12 shadow-3xl gap-3">
                 <Link href="/pass"><CreditCard className="h-4 w-4" /> Manage Pass</Link>
               </Button>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 text-left">
          <div className="lg:col-span-8 space-y-12">
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
              <MetricCard icon={<ClipboardList className="text-blue-500" />} label="Series Attempted" value={stats.total} footer="Lifetime Analytics" />
              <MetricCard icon={<Target className="text-primary" />} label="Accuracy Level" value={`${stats.avgAccuracy}%`} footer="Institutional Avg: 64%" />
              <MetricCard icon={<Trophy className="text-emerald-500" />} label="Punjab Ranking" value={stats.rank} footer="Monthly Benchmark" />
            </div>

            <Card className="border-none shadow-3xl shadow-slate-900/5 rounded-[3.5rem] bg-white overflow-hidden">
               <CardHeader className="p-12 border-b border-slate-50 text-left">
                  <div className="flex items-center gap-4">
                     <Bell className="h-6 w-6 text-primary" />
                     <CardTitle className="font-headline text-2xl font-black text-[#0F172A] uppercase">Exam Alert Hub</CardTitle>
                  </div>
                  <CardDescription className="text-slate-400 font-medium">Receive high-priority recruitment notifications for specific boards.</CardDescription>
               </CardHeader>
               <CardContent className="p-12 grid grid-cols-1 md:grid-cols-2 gap-8">
                  {['PSSSB', 'PPSC', 'Punjab Police', 'Education', 'High Court'].map(board => (
                     <div key={board} className="flex items-center justify-between p-6 bg-slate-50 rounded-[2rem] border border-slate-100 group hover:border-primary/20 transition-all">
                        <div className="space-y-1">
                           <p className="font-black text-xs uppercase tracking-widest text-[#0F172A]">{board} Vertical</p>
                           <p className="text-[10px] text-slate-400 uppercase font-bold">Official Alerts & Results</p>
                        </div>
                        <Switch 
                           checked={(profile.subscriptions || []).includes(board)} 
                           onCheckedChange={() => handleToggleSub(board)} 
                        />
                     </div>
                  ))}
               </CardContent>
            </Card>

            <Card className="border-none shadow-3xl shadow-slate-900/5 rounded-[3.5rem] overflow-hidden bg-white">
               <CardHeader className="p-12 border-b border-slate-50 text-left">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <CardTitle className="font-headline text-2xl font-black text-[#0F172A] uppercase">Preparation History</CardTitle>
                      <CardDescription className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Deep audit of your high-fidelity results</CardDescription>
                    </div>
                  </div>
               </CardHeader>
               <CardContent className="p-0">
                  <div className="divide-y divide-slate-50">
                    {resultsLoading ? (
                      Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28 w-full" />)
                    ) : results && results.length > 0 ? (
                      results.slice(0, 5).map((r: any) => (
                        <div key={r.id} className="p-10 flex items-center justify-between hover:bg-slate-50/50 transition-colors group cursor-pointer">
                           <div className="flex items-center gap-8">
                              <div className="h-16 w-16 rounded-[1.5rem] bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                                 <Zap className="h-7 w-7 text-slate-300 group-hover:text-primary transition-colors" />
                              </div>
                              <div className="space-y-1">
                                 <p className="font-black text-slate-800 text-lg uppercase tracking-tight leading-tight">{r.mockTitle}</p>
                                 <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] flex items-center gap-3">
                                   <Calendar className="h-4 w-4" /> {new Date(r.timestamp).toLocaleDateString('en-GB')} • {r.totalQuestions} MCQs
                                 </p>
                              </div>
                           </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-24 text-center text-slate-300 space-y-6">
                        <ClipboardList className="h-20 w-20 mx-auto opacity-10" />
                        <p className="font-black font-headline uppercase text-xl text-slate-400">No Attempts Recorded</p>
                      </div>
                    )}
                  </div>
               </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-4 space-y-12">
            <Card className="border-none shadow-3xl shadow-slate-900/5 rounded-[3.5rem] p-10 space-y-10 bg-white">
               <div className="space-y-8">
                 <h3 className="font-headline font-black text-xs uppercase tracking-[0.3em] text-slate-400">Account Credentials</h3>
                 
                 <AccountInfo icon={<Phone className="h-5 w-5" />} label="Contact String" value={profile.phone} />
                 <AccountInfo icon={<MapPin className="h-5 w-5" />} label="Geographic Node" value={profile.state} />
                 <AccountInfo icon={<Calendar className="h-5 w-5" />} label="Platform Registry" value={new Date(profile.createdAt).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })} />
                 <AccountInfo icon={<ShieldCheck className="h-5 w-5" />} label="Security Group" value={`${profile.status} Access`} />
               </div>
            </Card>

            <Card className="border-none bg-[#0F172A] text-white shadow-3xl rounded-[3.5rem] p-12 overflow-hidden relative group cursor-pointer">
               <div className="absolute top-0 right-0 p-10 opacity-20 group-hover:scale-110 transition-transform">
                  <Sparkles className="h-32 w-32 text-primary" />
               </div>
               <div className="relative z-10 space-y-6 text-left">
                  <Badge className="bg-primary text-white border-none uppercase text-[10px] font-black px-6 py-2 rounded-2xl shadow-xl">Audit Active</Badge>
                  <h4 className="text-3xl font-headline font-black leading-tight uppercase">Elite Access <br/>Enabled</h4>
                  <p className="text-slate-400 text-base leading-relaxed font-medium">Your account is fully synchronized with Arsh Grewal's management repository.</p>
                  <Button asChild className="w-full bg-white text-[#0F172A] hover:bg-slate-200 font-black uppercase text-[10px] tracking-[0.2em] h-16 rounded-[1.5rem] mt-6 shadow-2xl">
                    <Link href="/mocks">Explore All Series</Link>
                  </Button>
               </div>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

function MetricCard({ icon, label, value, footer }: any) {
  return (
    <Card className="border-none shadow-3xl shadow-slate-900/5 rounded-[2.5rem] p-10 hover:translate-y-[-8px] transition-all duration-500 group bg-white">
       <div className="flex items-center gap-5 mb-6">
          <div className="h-14 w-14 rounded-2xl bg-slate-50 flex items-center justify-center group-hover:bg-primary/10 group-hover:scale-110 transition-all">
             {icon}
          </div>
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">{label}</span>
       </div>
       <p className="text-5xl font-headline font-black text-[#0F172A] tracking-tighter mb-2">{value}</p>
       <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{footer}</p>
    </Card>
  )
}

function AccountInfo({ icon, label, value }: any) {
  return (
    <div className="flex items-center gap-6 group">
      <div className="h-12 w-12 rounded-2xl bg-slate-50 flex items-center justify-center shrink-0 border border-slate-100 text-slate-300 group-hover:bg-primary/5 group-hover:text-primary transition-all">
        {icon}
      </div>
      <div className="text-left">
        <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400 mb-1">{label}</p>
        <p className="text-base font-bold text-slate-800">{value}</p>
      </div>
    </div>
  )
}
