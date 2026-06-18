"use client"

import { useMemo, useState, useEffect } from "react"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import { useCollection, useFirestore, useUser } from "@/firebase"
import { collection, query, limit } from "firebase/firestore"
import { Trophy, ShieldCheck, Search, Activity, ChevronRight, Zap, Loader2 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
import StudentAvatar from "@/components/brand/StudentAvatar"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"

/**
 * @fileOverview Official Punjab Merit Hub v15.3 (Strictly Typed).
 */

export default function LeaderboardPage() {
  const db = useFirestore()
  const { user, loading: authLoading } = useUser()
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  
  useEffect(() => {
    if (!authLoading && !user) {
      router.push(`/login?returnUrl=${encodeURIComponent('/leaderboard')}`);
    }
  }, [user, authLoading, router]);

  const meritQuery = useMemo(() => (db ? query(collection(db, "results"), limit(500)) : null), [db])
  const usersQuery = useMemo(() => (db ? query(collection(db, "users"), limit(500)) : null), [db])

  const { data: results, loading: resultsLoading } = useCollection<any>(meritQuery)
  const { data: users, loading: usersLoading } = useCollection<any>(usersQuery)

  const meritList = useMemo(() => {
    if (!results) return []
    const lowerSearch = searchTerm.toLowerCase();
    const sortedResults = [...results].sort((a: any, b: any) => (b.score || 0) - (a.score || 0));
    const uniqueRankers = new Map();
    
    sortedResults.forEach((r: any) => {
      if (!uniqueRankers.has(r.userId)) {
        const userProfile = users?.find((u: any) => u.id === r.userId);
        const name = userProfile?.name || 
                     (r.userName && r.userName !== 'Aspirant' && r.userName !== 'Student' && !r.userName.includes('@') ? r.userName : null) || 
                     userProfile?.email || 
                     r.userEmail || 
                     "Student";
        const email = userProfile?.email || r.userEmail || "---";

        if (!searchTerm || (name.toLowerCase().includes(lowerSearch) || email.toLowerCase().includes(lowerSearch))) {
          uniqueRankers.set(r.userId, {
            id: r.userId,
            name,
            email,
            profile: userProfile,
            score: r.score,
            accuracy: r.accuracy,
            mockTitle: r.mockTitle,
            timestamp: r.timestamp
          });
        }
      }
    });
    return Array.from(uniqueRankers.values());
  }, [results, users, searchTerm]);

  const podium = useMemo(() => meritList.slice(0, 3), [meritList]);

  return (
    <div className="min-h-screen bg-slate-50/30 font-body text-left">
      <Navbar />
      
      {authLoading ? (
         <div className="flex-1 flex flex-col items-center justify-center space-y-6 py-20">
            <Zap className="h-10 w-10 text-primary animate-pulse" />
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Syncing Merit List...</p>
         </div>
      ) : (
         <main className="container mx-auto px-4 md:px-6 py-12 md:py-20 max-w-6xl space-y-12 md:space-y-16">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-10">
               <div className="space-y-6 text-left">
                  <div className="flex items-center gap-4"><div className="h-12 w-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary shadow-inner"><ShieldCheck className="h-7 w-7" /></div><span className="text-[10px] md:text-xs font-black uppercase tracking-[0.3em] text-slate-500">Live Punjab Merit Hub</span></div>
                  <h1 className="text-5xl md:text-8xl font-headline font-black text-[#0F172A] tracking-tighter uppercase leading-[0.9]">HALL OF <br/> <span className="text-primary">RANKERS</span></h1>
                  <p className="text-slate-500 font-medium text-lg md:text-xl max-w-xl leading-relaxed">Real-time rankings based on official mock results. View the performance of top students across Punjab.</p>
               </div>
               <div className="relative w-full md:w-96 group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-primary to-orange-400 rounded-2xl blur opacity-10 group-hover:opacity-20 transition duration-1000"></div>
                  <div className="relative"><Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus:text-primary transition-colors" /><Input className="h-16 pl-14 rounded-2xl bg-white border-none shadow-xl text-lg font-bold" placeholder="Search student name or email..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} /></div>
               </div>
            </div>

            {meritList.length >= 1 && !searchTerm && (
               <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-end pt-16 md:pt-24 pb-8">
                  <PodiumCard rank={2} data={podium[1]} color="bg-slate-300" />
                  <PodiumCard rank={1} data={podium[0]} color="bg-amber-400" isMain />
                  <PodiumCard rank={3} data={podium[2]} color="bg-orange-400" />
               </div>
            )}

            <Card className="border-none shadow-3xl rounded-[3rem] bg-white overflow-hidden">
               <CardContent className="p-0">
                  <div className="p-8 md:p-10 border-b border-slate-50 bg-slate-50/30 grid grid-cols-12 text-[10px] md:text-xs font-black uppercase tracking-widest text-slate-500"><div className="col-span-2 md:col-span-1">RANK</div><div className="col-span-6 md:col-span-7">STUDENT IDENTITY</div><div className="col-span-2 text-center">SCORE</div><div className="col-span-2 text-right">ACCURACY</div></div>
                  <div className="divide-y divide-slate-50">
                     {resultsLoading || usersLoading ? Array.from({ length: 5 }).map((_, i) => (<div key={i} className="p-8 grid grid-cols-12 gap-6 items-center"><Skeleton className="h-6 w-8 rounded-md col-span-1" /><div className="col-span-7 flex items-center gap-4"><Skeleton className="h-12 w-12 rounded-xl" /><div className="space-y-2"><Skeleton className="h-4 w-32" /><Skeleton className="h-3 w-20" /></div></div><Skeleton className="h-8 w-full rounded-md col-span-2" /><Skeleton className="h-8 w-full rounded-md col-span-2" /></div>)) : 
                     meritList.length > 0 ? meritList.map((entry: any, idx: number) => (
                          <div key={entry.id} className="p-8 md:p-10 grid grid-cols-12 items-center hover:bg-slate-50/50 transition-all group cursor-pointer border-l-[4px] border-transparent hover:border-primary">
                             <div className="col-span-2 md:col-span-1 font-headline font-black text-xl md:text-3xl text-slate-300 group-hover:text-primary transition-colors">#{idx + 1}</div>
                             <div className="col-span-6 md:col-span-7 flex items-center gap-4 md:gap-8"><StudentAvatar profile={entry.profile} className="h-12 w-12 md:h-16 md:w-16 rounded-xl md:rounded-2xl border-2 border-slate-100 shadow-sm" /><div className="min-w-0"><p className="font-black text-[#0F172A] text-base md:text-2xl uppercase tracking-tight truncate leading-none">{entry.name}</p><div className="flex items-center gap-3 mt-1.5 md:mt-3"><Badge className="bg-primary/10 text-primary border-none text-[7px] md:text-[9px] font-black uppercase px-2 py-0.5">{entry.profile?.targetExam || 'Punjab Hub'}</Badge><span className="hidden md:inline-flex items-center gap-2 text-[9px] font-bold text-slate-400 uppercase tracking-widest truncate"><Activity className="h-3 w-3" /> {entry.mockTitle}</span></div></div></div>
                             <div className="col-span-2 text-center"><div className="inline-flex flex-col items-center"><span className="font-headline font-black text-xl md:text-4xl text-[#0F172A] tracking-tighter leading-none">{entry.score}</span><span className="text-[7px] md:text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">PTS</span></div></div>
                             <div className="col-span-2 text-right"><Badge className={cn("border-none text-[10px] md:text-[13px] font-black px-3 md:px-5 py-1.5 md:py-2 rounded-xl shadow-lg", entry.accuracy > 85 ? "bg-emerald-50 text-emerald-600" : entry.accuracy > 60 ? "bg-amber-50 text-amber-600" : "bg-slate-100 text-slate-400")}>{entry.accuracy}%</Badge></div>
                          </div>
                        )) : (<div className="py-32 flex flex-col items-center justify-center text-slate-300 opacity-20 text-center space-y-6"><Activity className="h-24 w-24" /><p className="font-headline font-black text-3xl uppercase tracking-widest">No Rankings Detected</p></div>)}
                  </div>
               </CardContent>
            </Card>
         </main>
      )}

      {!authLoading && <Footer />}
    </div>
  )
}

function PodiumCard({ rank, data, color, isMain }: any) {
   if (!data) return null;
   return (
      <div className={cn("flex flex-col items-center space-y-8 group relative", isMain ? "mb-12 md:mb-16 z-20" : "mb-6 z-10")}>
         <div className="relative"><StudentAvatar profile={data?.profile} className={cn("border-4 border-white shadow-5xl rounded-[3rem] transition-all duration-700 group-hover:scale-110", isMain ? "h-36 w-36 md:h-48 md:w-48" : "h-28 w-28 md:h-36 md:w-36")} /><div className={cn("absolute -bottom-5 left-1/2 -translate-x-1/2 h-12 w-12 md:h-14 md:w-14 rounded-2xl flex items-center justify-center shadow-2xl border-4 border-white transition-transform group-hover:rotate-12", color)}><Trophy className="h-6 w-6 md:h-7 md:w-7 text-white fill-current" /></div>{isMain && (<div className="absolute -top-10 left-1/2 -translate-x-1/2 animate-bounce"><Badge className="bg-primary text-white border-none font-black text-[10px] px-4 py-1.5 rounded-full shadow-2xl uppercase tracking-widest">State Topper</Badge></div>)}</div>
         <div className="text-center space-y-3"><h3 className={cn("font-headline font-black text-[#0F172A] uppercase tracking-tight truncate max-w-[220px]", isMain ? "text-3xl md:text-4xl" : "text-xl md:text-2xl")}>{data?.name || '---'}</h3><div className="flex items-center justify-center gap-6"><div className="text-center"><p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">SCORE</p><p className="text-xl font-bold text-primary leading-none">{data?.score || '0'}</p></div><div className="h-6 w-px bg-slate-200" /><div className="text-center"><p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">ACCURACY</p><p className="text-xl font-bold text-emerald-600 leading-none">{data?.accuracy || '0'}%</p></div></div></div>
      </div>
   )
}
