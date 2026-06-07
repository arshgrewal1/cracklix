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
} from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { cn } from "@/lib/utils"
import StudentAvatar from "@/components/brand/StudentAvatar"
import ShareButton from "@/components/navigation/ShareButton"

export default function StudentDashboard() {
  const { user, profile, loading } = useUser()
  const db = useFirestore()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) router.push("/login")
  }, [user, loading, router])

  useEffect(() => {
    if (profile?.passExpiryDate && db && user && profile.status !== 'Free') {
       const expiry = new Date(profile.passExpiryDate);
       const now = new Date();
       if (now > expiry) {
          updateDoc(doc(db, "users", user.uid), { status: 'Free', updatedAt: serverTimestamp() }).catch(() => {});
       }
    }
  }, [profile?.status, profile?.passExpiryDate, db, user]);

  const resultsQuery = useMemo(() => {
    if (!db || !user) return null
    return query(collection(db, "results"), where("userId", "==", user.uid))
  }, [db, user])

  const { data: rawResults, loading: resultsLoading } = useCollection<any>(resultsQuery)

  const results = useMemo(() => {
    if (!rawResults) return []
    return [...rawResults].sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
  }, [rawResults])

  const stats = useMemo(() => {
    if (!results || results.length === 0) return { total: 0, avgAccuracy: 0, streak: 0, readiness: 45, hours: "0h", stateRank: "N/A" }
    const total = results.length
    const avgAcc = Math.round(results.reduce((acc: number, r: any) => acc + (r.accuracy || 0), 0) / total)
    return { total, avgAccuracy: avgAcc, streak: total > 2 ? 7 : 0, readiness: Math.min(96, Math.max(30, avgAcc + 5)), hours: `${Math.round(total * 1.5)}h`, stateRank: avgAcc > 85 ? "#42" : "#2.4k" }
  }, [results])

  if (loading) return null;

  return (
    <div className="min-h-screen bg-slate-50 pb-32">
      <Navbar />
      
      <main className="mobile-app-shell py-4 px-2 space-y-4">
        
        {profile?.status !== 'Free' && profile?.passExpiryDate && (
           <div className="bg-amber-50 border border-amber-100 p-3 rounded-xl flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-2">
                 <AlertTriangle className="h-4 w-4 text-amber-600" />
                 <p className="text-[10px] font-bold text-amber-800 uppercase tracking-tight">Pass active until {new Date(profile.passExpiryDate).toLocaleDateString()}</p>
              </div>
              <Button asChild variant="ghost" size="sm" className="text-amber-600 font-black uppercase text-[8px] h-6"><Link href="/pass">Renew</Link></Button>
           </div>
        )}

        <section className="bg-[#0B1528] text-white p-6 rounded-[2rem] shadow-xl relative overflow-hidden text-left">
          <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[150%] bg-primary/10 blur-[100px] rounded-full" />
          <div className="relative z-10 flex items-center gap-5">
            <StudentAvatar profile={profile} className="h-16 w-16 border-4 border-white/5 rounded-2xl shadow-xl" />
            <div className="flex-1 space-y-1 overflow-hidden">
               <h2 className="text-lg font-headline font-black tracking-tight uppercase truncate">{profile?.name}</h2>
               <div className="flex items-center gap-2">
                  <Badge className="bg-primary text-white border-none text-[8px] font-black uppercase px-2 py-0.5 rounded-md">
                    {profile?.status || 'Free'} PASS
                  </Badge>
                  <p className="text-slate-400 font-bold uppercase tracking-widest text-[8px] truncate">{profile?.targetExam || 'General'}</p>
               </div>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-3 gap-2">
          <CompactStat label="Accuracy" val={`${stats.avgAccuracy}%`} icon={<Target className="text-primary h-3.5 w-3.5" />} />
          <CompactStat label="Attempts" val={stats.total} icon={<ClipboardList className="text-blue-500 h-3.5 w-3.5" />} />
          <CompactStat label="Readiness" val={`${stats.readiness}%`} icon={<Zap className="text-primary h-3.5 w-3.5" />} />
        </section>

        <div className="space-y-4">
            <Card className="border-none shadow-sm rounded-[2rem] bg-white overflow-hidden text-left">
               <CardHeader className="p-5 border-b border-slate-50 flex flex-row items-center justify-between">
                  <h3 className="font-headline text-sm font-black text-[#0F172A] uppercase">Test History</h3>
                  <History className="h-4 w-4 text-slate-300" />
               </CardHeader>
               <CardContent className="p-0">
                  <div className="divide-y divide-slate-50">
                     {resultsLoading ? (
                        Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-16 w-full bg-slate-50 animate-pulse" />)
                     ) : results && results.length > 0 ? (
                        results.slice(0, 5).map((r: any) => (
                           <Link key={r.id} href={`/results/${r.mockId}`} className="p-4 flex items-center justify-between active:bg-slate-50 transition-colors">
                              <div className="flex items-center gap-3 min-w-0">
                                 <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center shrink-0">
                                    <Zap className="h-4 w-4 text-primary" />
                                 </div>
                                 <div className="min-w-0">
                                    <p className="font-black text-[#0B1528] text-xs uppercase truncate">{r.mockTitle}</p>
                                    <p className="text-[8px] text-slate-400 font-bold uppercase">{r.score}/{r.totalQuestions} Marks • {new Date(r.timestamp).toLocaleDateString()}</p>
                                 </div>
                              </div>
                              <ChevronRight className="h-4 w-4 text-slate-200" />
                           </Link>
                        ))
                     ) : (
                        <div className="p-12 text-center opacity-30 italic text-[10px] uppercase font-black tracking-widest text-slate-300">No nodes recorded.</div>
                     )}
                  </div>
               </CardContent>
            </Card>

            <Card className="border-none shadow-sm rounded-[2.5rem] bg-white p-6 space-y-4 text-left">
               <h3 className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400">Tactical Access</h3>
               <div className="grid grid-cols-2 gap-3">
                  <ActionTile icon={<Bookmark className="text-primary h-5 w-5" />} label="REVISION" href="/revision" />
                  <ActionTile icon={<Trophy className="text-amber-500 h-5 w-5" />} label="RANKS" href="/leaderboard" />
                  <ActionTile icon={<LayoutGrid className="text-orange-500 h-5 w-5" />} label="HUBS" href="/exams" />
                  <div className="flex flex-col items-center justify-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
                     <ShareButton showLabel={false} variant="ghost" className="p-0 h-10 w-10 text-slate-400" />
                     <span className="text-[8px] font-black uppercase text-slate-500">SHARE</span>
                  </div>
               </div>
            </Card>
        </div>
      </main>
    </div>
  )
}

function CompactStat({ label, val, icon }: any) {
  return (
    <Card className="border-none shadow-sm bg-white p-3 rounded-2xl text-left">
      <div className="flex items-center justify-between mb-2">
        <div className="h-6 w-6 rounded-lg bg-slate-50 flex items-center justify-center">{icon}</div>
      </div>
      <p className="text-lg font-headline font-black text-[#0F172A] leading-none">{val}</p>
      <p className="text-[7px] font-black uppercase tracking-widest text-slate-400 mt-1">{label}</p>
    </Card>
  )
}

function ActionTile({ icon, label, href }: any) {
   return (
      <Link href={href} className="flex flex-col items-center gap-2 p-4 bg-white rounded-2xl border border-slate-100 active:bg-slate-50 shadow-sm">
         <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center shrink-0">{icon}</div>
         <span className="text-[8px] font-black uppercase tracking-tight text-slate-500">{label}</span>
      </Link>
   )
}