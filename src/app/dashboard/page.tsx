"use client"

import { useMemo } from "react"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import { useUser, useCollection, useFirestore } from "@/firebase"
import { collection, query, where, orderBy, limit } from "firebase/firestore"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { 
  Trophy, 
  Target, 
  ClipboardList, 
  Zap, 
  Clock, 
  BookOpen, 
  ChevronRight, 
  Star,
  Bookmark,
  Bell,
  TrendingUp
} from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import Link from "next/link"

export default function StudentDashboard() {
  const { user, profile, loading } = useUser()
  const db = useFirestore()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) router.push("/login")
  }, [user, loading, router])

  const resultsQuery = useMemo(() => {
    if (!db || !user) return null
    return query(collection(db, "results"), where("userId", "==", user.uid), orderBy("timestamp", "desc"), limit(10))
  }, [db, user])

  const { data: results, loading: resultsLoading } = useCollection<any>(resultsQuery)

  const stats = useMemo(() => {
    if (!results || results.length === 0) return { total: 0, avgAccuracy: 0, rank: "N/A" }
    const avgAcc = Math.round(results.reduce((acc: number, r: any) => acc + (r.accuracy || 0), 0) / results.length)
    return { total: results.length, avgAccuracy: avgAcc, rank: "Top 5%" }
  }, [results])

  if (loading) return <div className="h-screen flex items-center justify-center"><Zap className="h-10 w-10 text-primary animate-pulse" /></div>

  return (
    <div className="min-h-screen bg-slate-50/50">
      <Navbar />
      <main className="container mx-auto px-6 py-10 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left: Quick Profile & Stats */}
          <div className="lg:col-span-4 space-y-8">
            <Card className="border-none shadow-2xl shadow-slate-200/50 rounded-[2.5rem] bg-white overflow-hidden">
               <div className="h-24 w-full bg-[#08152D] relative">
                  <div className="absolute -bottom-10 left-8">
                     <Avatar className="h-24 w-24 border-4 border-white rounded-[2rem] shadow-xl">
                        <AvatarImage src={user?.photoURL || ""} />
                        <AvatarFallback className="bg-primary text-white font-black text-2xl">{profile?.name?.[0]}</AvatarFallback>
                     </Avatar>
                  </div>
               </div>
               <CardContent className="pt-14 pb-8 px-8 space-y-4">
                  <div>
                    <h2 className="text-2xl font-headline font-black text-[#0F172A]">{profile?.name}</h2>
                    <p className="text-sm font-medium text-slate-500">{profile?.email}</p>
                  </div>
                  <div className="flex gap-2">
                    <Badge className="bg-primary text-white border-none px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest">{profile?.status} Access</Badge>
                    <Badge variant="outline" className="border-slate-100 text-slate-400 text-[10px] font-black uppercase tracking-widest">{profile?.targetExam || "All Boards"}</Badge>
                  </div>
               </CardContent>
            </Card>

            <div className="grid grid-cols-2 gap-4">
               <DashboardStatCard icon={<ClipboardList className="text-blue-500" />} label="Attempted" value={stats.total} />
               <DashboardStatCard icon={<Target className="text-orange-500" />} label="Accuracy" value={`${stats.avgAccuracy}%`} />
               <DashboardStatCard icon={<TrendingUp className="text-emerald-500" />} label="Rank" value={stats.rank} />
               <DashboardStatCard icon={<Star className="text-amber-500" />} label="Coins" value="450" />
            </div>

            <Card className="border-none shadow-xl shadow-slate-200/50 rounded-[2rem] bg-white p-6">
               <h3 className="font-headline font-black text-xs uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
                  <Bookmark className="h-4 w-4" /> Bookmarked MCQs
               </h3>
               <div className="space-y-4 opacity-50 text-center py-4">
                  <p className="text-xs font-bold text-slate-400 italic">No bookmarks yet.</p>
                  <Button variant="link" className="text-primary text-xs font-black">Browse Bank</Button>
               </div>
            </Card>
          </div>

          {/* Right: Main Content */}
          <div className="lg:col-span-8 space-y-8">
            <div className="flex items-center justify-between">
               <h1 className="text-3xl font-headline font-black text-[#0F172A] tracking-tight">Student Dashboard</h1>
               <Button asChild variant="outline" className="rounded-xl border-slate-200 font-bold text-xs h-10 px-6 gap-2">
                  <Link href="/notifications"><Bell className="h-4 w-4" /> Notifications</Link>
               </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <Card className="border-none bg-primary/5 border border-primary/10 rounded-[2rem] p-8 group cursor-pointer hover:bg-primary/10 transition-colors">
                  <div className="h-12 w-12 bg-white rounded-2xl flex items-center justify-center shadow-lg mb-6 group-hover:scale-110 transition-transform">
                     <BookOpen className="text-primary h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-headline font-black text-[#0F172A] mb-2">Practice Mocks</h3>
                  <p className="text-sm text-slate-500 leading-relaxed font-medium">Attempt high-fidelity mocks based on the latest Punjab official patterns.</p>
                  <Button asChild className="mt-6 bg-primary text-white rounded-xl h-11 px-8 font-black uppercase text-[10px] tracking-widest">
                     <Link href="/mocks">Explore All</Link>
                  </Button>
               </Card>
               <Card className="border-none bg-[#0B1528] rounded-[2rem] p-8 text-white group cursor-pointer">
                  <div className="h-12 w-12 bg-white/10 rounded-2xl flex items-center justify-center shadow-lg mb-6 group-hover:scale-110 transition-transform">
                     <Zap className="text-primary h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-headline font-black mb-2 text-white">Daily Analysis</h3>
                  <p className="text-sm text-slate-400 leading-relaxed font-medium">Stay updated with Punjab Cabinet decisions and daily Current Affairs.</p>
                  <Button asChild className="mt-6 bg-white text-[#0B1528] hover:bg-slate-100 rounded-xl h-11 px-8 font-black uppercase text-[10px] tracking-widest">
                     <Link href="/current-affairs">Read News</Link>
                  </Button>
               </Card>
            </div>

            <Card className="border-none shadow-xl shadow-slate-200/50 rounded-[2.5rem] overflow-hidden bg-white">
               <CardHeader className="p-8 border-b border-slate-50 flex flex-row items-center justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-xl font-headline font-black text-[#0F172A]">Preparation History</CardTitle>
                    <CardDescription>Review your past mock attempts and solutions.</CardDescription>
                  </div>
               </CardHeader>
               <CardContent className="p-0">
                  {resultsLoading ? (
                    Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24 w-full" />)
                  ) : results && results.length > 0 ? (
                    <div className="divide-y divide-slate-50">
                       {results.map((r: any) => (
                          <div key={r.id} className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors">
                             <div className="flex items-center gap-5">
                                <div className="h-12 w-12 rounded-2xl bg-blue-50 flex items-center justify-center shrink-0">
                                   <Trophy className="h-5 w-5 text-blue-500" />
                                </div>
                                <div>
                                   <p className="font-bold text-[#0F172A]">{r.mockTitle}</p>
                                   <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1 flex items-center gap-2">
                                      <Clock className="h-3 w-3" /> {new Date(r.timestamp).toLocaleDateString()}
                                   </p>
                                </div>
                             </div>
                             <div className="flex items-center gap-8">
                                <div className="text-right hidden sm:block">
                                   <p className="text-lg font-black text-[#0F172A]">{r.score}/{r.totalQuestions}</p>
                                   <p className={`text-[10px] font-black uppercase tracking-widest ${r.accuracy > 70 ? 'text-emerald-500' : 'text-orange-500'}`}>{r.accuracy}% Accuracy</p>
                                </div>
                                <Button asChild variant="ghost" size="icon" className="rounded-xl h-10 w-10 hover:bg-slate-100 text-slate-400 hover:text-primary">
                                   <Link href={`/results/${r.mockId}`}><ChevronRight className="h-5 w-5" /></Link>
                                </Button>
                             </div>
                          </div>
                       ))}
                    </div>
                  ) : (
                    <div className="p-20 text-center text-slate-400 space-y-4">
                       <ClipboardList className="h-16 w-16 mx-auto opacity-10" />
                       <p className="font-bold">No activity recorded yet.</p>
                       <Button asChild className="bg-primary text-white font-bold rounded-xl h-12 px-8">
                          <Link href="/mocks">Start Your First Mock</Link>
                       </Button>
                    </div>
                  )}
               </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

function DashboardStatCard({ icon, label, value }: any) {
  return (
    <Card className="border-none shadow-xl shadow-slate-200/40 rounded-[2rem] p-6 bg-white hover:scale-[1.02] transition-transform">
       <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center mb-4">
          {icon}
       </div>
       <p className="text-2xl font-headline font-black text-[#0F172A]">{value}</p>
       <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 mt-1">{label}</p>
    </Card>
  )
}
