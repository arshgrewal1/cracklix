"use client"

import { useMemo, useState, useEffect } from "react"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import { useCollection, useFirestore, useUser } from "@/firebase"
import { collection, query, limit, orderBy } from "firebase/firestore"
import { Trophy, ShieldCheck, Search, Activity, Zap, Star, Medal, Target } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
import StudentAvatar from "@/components/brand/StudentAvatar"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"

/**
 * @fileOverview Official Top Rankers Center v20.1.
 * FIXED: Repaired uniqueRankers reference mismatch causing runtime crash.
 * NORMALIZED: Removed forced uppercase from general headers and student names.
 */

export default function LeaderboardPage() {
  const db = useFirestore()
  const { user, loading: authLoading } = useUser()
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    setMounted(true)
    if (!authLoading && !user) {
      router.push(`/login?returnUrl=${encodeURIComponent('/leaderboard')}`);
    }
  }, [user, authLoading, router]);

  const meritQuery = useMemo(() => (db && mounted ? query(collection(db, "results"), limit(500)) : null), [db, mounted])
  const usersQuery = useMemo(() => (db && mounted ? query(collection(db, "users"), limit(500)) : null), [db, mounted])

  const { data: results, loading: resultsLoading } = useCollection<any>(meritQuery)
  const { data: users, loading: usersLoading } = useCollection<any>(usersQuery)

  const finalSortedList = useMemo(() => {
    if (!results || !mounted) return []
    const lowerSearch = searchTerm.toLowerCase();
    
    const uniqueRankers = new Map<string, any>();
    
    // Deduplicate by User and keep their BEST score globally
    [...results].forEach((r: any) => {
      const existing = uniqueRankers.get(r.userId);
      if (!existing || existing.score < r.score) {
        const userProfile = users?.find((u: any) => u.id === r.userId);
        const rawName = userProfile?.name || 
                     (r.userName && r.userName !== 'Aspirant' && r.userName !== 'Student' && !r.userName.includes('@') ? r.userName : null) || 
                     userProfile?.email || 
                     r.userEmail || 
                     "Aspirant";
        
        const name = rawName;
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
            timestamp: r.timestamp,
            gender: r.gender || userProfile?.gender
          });
        }
      }
    });

    return Array.from(uniqueRankers.values()).sort((a, b) => b.score - a.score);
  }, [results, users, searchTerm, mounted]);

  const podium = useMemo(() => finalSortedList.slice(0, 3), [finalSortedList]);

  if (!mounted) return <div className="min-h-screen bg-white" />;

  return (
    <div className="min-h-screen bg-slate-50/50 font-body text-left overflow-x-hidden">
      <Navbar />
      
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-24 max-w-[1440px] space-y-12 md:space-y-24">
         <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-10">
            <div className="space-y-6 text-left">
               <div className="flex items-center gap-4">
                  <div className="h-10 w-10 md:h-14 md:w-14 bg-primary/10 rounded-2xl md:rounded-3xl flex items-center justify-center text-primary shadow-2xl">
                     <ShieldCheck className="h-6 w-6 md:h-8 md:w-8" />
                  </div>
                  <span className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest">Official Rank List</span>
               </div>
               <h1 className="text-4xl md:text-7xl lg:text-8xl font-black text-[#0F172A] tracking-tighter leading-[0.9] break-words antialiased">Top Rankers</h1>
               <p className="text-slate-500 font-medium text-sm md:text-2xl max-w-2xl leading-tight tracking-tight italic">Registry of all-time highest scores across Punjab recruitment verticals.</p>
            </div>
            <div className="relative w-full md:w-[500px] group">
               <div className="absolute -inset-1 bg-gradient-to-r from-primary/10 to-blue-400/10 rounded-2xl blur opacity-20 transition duration-1000"></div>
               <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-6 w-6 text-slate-300 group-focus:text-primary transition-colors" />
               <Input className="h-16 md:h-20 pl-16 rounded-2xl md:rounded-[2rem] bg-white border-none shadow-2xl text-lg md:text-xl font-bold text-[#0F172A]" placeholder="Search student..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
            </div>
         </div>

         {finalSortedList.length >= 1 && !searchTerm && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-end pt-12 md:pt-32 pb-12">
               <PodiumCard rank={2} data={podium[1]} color="bg-slate-300" />
               <PodiumCard rank={1} data={podium[0]} color="bg-amber-400" isMain />
               <PodiumCard rank={3} data={podium[2]} color="bg-orange-400" />
            </div>
         )}

         <Card className="border-none shadow-4xl rounded-[3rem] md:rounded-[4.5rem] bg-white overflow-hidden">
            <CardContent className="p-0">
               <div className="p-8 md:p-14 border-b border-slate-50 bg-slate-50/30 grid grid-cols-12 text-[10px] md:text-[13px] font-bold text-slate-400 uppercase tracking-widest">
                 <div className="col-span-2 md:col-span-1">Rank</div>
                 <div className="col-span-6 md:col-span-7">Student Identity</div>
                 <div className="col-span-2 text-center">Best Score</div>
                 <div className="col-span-2 text-right">Accuracy</div>
               </div>
               <div className="divide-y divide-slate-50">
                  {resultsLoading || usersLoading ? Array.from({ length: 5 }).map((_, i) => (<div key={i} className="p-8 grid grid-cols-12 gap-6 items-center"><Skeleton className="h-8 w-12 rounded-md col-span-1" /><div className="col-span-7 flex items-center gap-6"><Skeleton className="h-14 w-14 rounded-2xl" /><div className="space-y-3"><Skeleton className="h-5 w-48" /><Skeleton className="h-3 w-24" /></div></div><Skeleton className="h-10 w-full rounded-xl col-span-2" /><Skeleton className="h-10 w-full rounded-xl col-span-2" /></div>)) : 
                  finalSortedList.length > 0 ? finalSortedList.map((entry: any, idx: number) => {
                       const isCurrentUser = entry.id === user?.uid;
                       return (
                        <div key={entry.id} className={cn("p-8 md:p-14 grid grid-cols-12 items-center hover:bg-slate-50/80 transition-all duration-500 group border-l-[6px] border-transparent", isCurrentUser ? "bg-primary/5 border-primary" : "hover:border-slate-100")}>
                           <div className="col-span-2 md:col-span-1 font-headline font-black text-xl md:text-5xl text-slate-200 group-hover:text-primary transition-colors tabular-nums tracking-tighter">#{idx + 1}</div>
                           <div className="col-span-6 md:col-span-7 flex items-center gap-6 md:gap-12">
                              <StudentAvatar profile={entry.profile || entry} className="h-12 w-12 md:h-24 md:w-24 rounded-2xl md:rounded-[2.5rem] border-2 md:border-4 border-white shadow-xl bg-slate-50" />
                              <div className="min-w-0">
                                 <p className={cn("font-bold text-base md:text-3xl truncate leading-none tracking-tight", isCurrentUser ? "text-primary" : "text-[#0F172A]")}>{entry.name} {isCurrentUser && "(You)"}</p>
                                 <div className="flex items-center gap-3 md:gap-6 mt-2 md:mt-4">
                                     <Badge className="bg-primary/5 text-primary border-none text-[8px] md:text-[11px] font-bold uppercase tracking-widest px-3 py-1">{entry.profile?.targetExam || 'Elite Portal'}</Badge>
                                     <span className="hidden sm:inline-flex items-center gap-2 text-[10px] md:text-[12px] font-bold text-slate-300 uppercase tracking-widest truncate"><Activity className="h-4 w-4" /> Best: {entry.mockTitle}</span>
                                 </div>
                              </div>
                           </div>
                           <div className="col-span-2 text-center">
                              <div className="inline-flex flex-col items-center">
                                 <span className="font-headline font-black text-xl md:text-5xl text-[#0F172A] tracking-tighter leading-none">{(entry.score || 0).toFixed(1)}</span>
                                 <span className="text-[8px] md:text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-2">Pts</span>
                              </div>
                           </div>
                           <div className="col-span-2 text-right">
                              <Badge className={cn("border-none text-[10px] md:text-xl font-black px-4 md:px-8 py-2 md:py-4 rounded-xl md:rounded-[2rem] shadow-xl tabular-nums", entry.accuracy > 85 ? "bg-emerald-50 text-emerald-600" : entry.accuracy > 60 ? "bg-amber-50 text-amber-600" : "bg-slate-50 text-slate-400")}>{entry.accuracy}%</Badge>
                           </div>
                        </div>
                       )
                     }) : (<div className="py-48 flex flex-col items-center justify-center text-slate-300 opacity-20 text-center space-y-8"><Zap className="h-32 w-32" /><p className="font-headline font-black text-3xl uppercase tracking-widest">Merit List Empty</p></div>)}
               </div>
            </CardContent>
         </Card>
      </main>
      <Footer />
    </div>
  )
}

function PodiumCard({ rank, data, color, isMain }: any) {
   if (!data) return null;
   return (
      <div className={cn("flex flex-col items-center space-y-8 group relative", isMain ? "mb-12 md:mb-24 z-20" : "mb-6 z-10")}>
         <div className="relative">
            <StudentAvatar profile={data?.profile || data} className={cn("border-[6px] border-white shadow-5xl rounded-[3rem] md:rounded-[5rem] transition-all duration-700 group-hover:scale-105", isMain ? "h-40 w-40 md:h-72 md:w-72" : "h-32 w-32 md:h-56 md:w-56")} />
            <div className={cn("absolute -bottom-6 left-1/2 -translate-x-1/2 h-12 w-12 md:h-20 md:w-20 rounded-[1.5rem] md:rounded-[2.5rem] flex items-center justify-center shadow-2xl border-4 md:border-[6px] border-white transition-transform group-hover:rotate-12", color)}>
               {rank === 1 ? <Trophy className="h-6 w-6 md:h-10 md:w-10 text-white fill-current" /> : rank === 2 ? <Medal className="h-6 w-6 md:h-10 md:w-10 text-white fill-current" /> : <Target className="h-6 w-6 md:h-10 md:w-10 text-white" />}
            </div>
            {isMain && (<div className="absolute -top-12 left-1/2 -translate-x-1/2 animate-bounce"><Badge className="bg-primary text-white border-none font-bold text-[10px] md:text-[13px] px-6 py-2 rounded-full shadow-5xl uppercase tracking-[0.2em]">Merit #1</Badge></div>)}
         </div>
         <div className="text-center space-y-4 w-full">
            <h3 className={cn("font-black text-[#0F172A] tracking-tight leading-tight", isMain ? "text-2xl md:text-5xl" : "text-xl md:text-3xl")}>{data?.name || 'Aspirant'}</h3>
            <div className="flex items-center justify-center gap-8 md:gap-14">
               <div className="text-center"><p className="text-[9px] md:text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-1">Score</p><p className="text-xl md:text-4xl font-black text-primary tabular-nums tracking-tighter">{(data?.score || 0).toFixed(1)}</p></div>
               <div className="h-10 md:h-14 w-px bg-slate-100" />
               <div className="text-center"><p className="text-[9px] md:text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-1">Accuracy</p><p className="text-xl md:text-4xl font-black text-emerald-600 tabular-nums tracking-tighter">{data?.accuracy || '0'}%</p></div>
            </div>
         </div>
      </div>
   )
}
