"use client"

import { useMemo, useState } from "react"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import { useCollection, useFirestore } from "@/firebase"
import { collection, query, orderBy, limit, where } from "firebase/firestore"
import { Card, CardContent } from "@/components/ui/card"
import { Trophy, ShieldCheck, Search, Zap, Target } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export default function LeaderboardPage() {
  const db = useFirestore()
  const [boardFilter, setBoardFilter] = useState("Overall")
  const [searchTerm, setSearchTerm] = useState("")
  
  const leaderboardQuery = useMemo(() => {
    if (!db) return null
    let q = query(collection(db, "users"), orderBy("createdAt", "desc"), limit(50))
    if (boardFilter !== "Overall") {
       q = query(collection(db, "users"), where("targetExam", "==", boardFilter), limit(50))
    }
    return q
  }, [db, boardFilter])

  const { data: users, loading } = useCollection<any>(leaderboardQuery)

  const filteredUsers = useMemo(() => {
    if (!users) return []
    return users.filter(u => u.name?.toLowerCase().includes(searchTerm.toLowerCase()))
  }, [users, searchTerm])

  return (
    <div className="min-h-screen bg-slate-50/30">
      <Navbar />
      <main className="container mx-auto px-6 py-16 max-w-5xl">
        <div className="space-y-12">
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                 <ShieldCheck className="h-5 w-5 text-amber-500" />
                 <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Global Aspirant Rankings</span>
              </div>
              <h1 className="text-5xl md:text-7xl font-headline font-black text-[#0F172A] tracking-tight uppercase leading-[0.9]">
                Hall of <br/> <span className="text-primary">Rankers</span>
              </h1>
              <p className="text-slate-500 font-medium text-lg max-w-xl">
                Compete with 15,000+ aspirants from Punjab and track your progress institutional grade.
              </p>
            </div>
            <div className="relative w-full md:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input 
                className="pl-12 h-14 rounded-2xl bg-white border-none shadow-xl shadow-slate-200/50" 
                placeholder="Search aspirant..." 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="flex gap-3 overflow-x-auto pb-4 custom-scrollbar">
             {["Overall", "PSSSB", "PPSC", "Punjab Police", "Education", "High Court"].map(board => (
               <Button 
                key={board} 
                onClick={() => setBoardFilter(board)}
                variant={boardFilter === board ? "default" : "outline"}
                className={`rounded-xl px-6 h-10 font-bold border-none transition-all ${boardFilter === board ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-white text-slate-500 shadow-sm'}`}
               >
                 {board}
               </Button>
             ))}
          </div>

          {/* Podium */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-end pt-12">
             <PodiumCard rank={2} name="Amritpal Singh" score="2450" accuracy="92%" />
             <PodiumCard rank={1} name="Harmanjit Kaur" score="2890" accuracy="96%" isMain />
             <PodiumCard rank={3} name="Gursewak Singh" score="2120" accuracy="89%" />
          </div>

          {/* Full List */}
          <Card className="border-none shadow-2xl shadow-slate-200/50 rounded-[3rem] bg-white overflow-hidden">
             <CardContent className="p-0">
                <div className="p-8 border-b border-slate-50 grid grid-cols-12 text-[10px] font-black uppercase tracking-widest text-slate-400">
                   <div className="col-span-1">Rank</div>
                   <div className="col-span-7">Aspirant</div>
                   <div className="col-span-2 text-center">Score</div>
                   <div className="col-span-2 text-right">Accuracy</div>
                </div>
                <div className="divide-y divide-slate-50">
                   {loading ? (
                     Array.from({ length: 10 }).map((_, i) => (
                        <div key={i} className="p-8 grid grid-cols-12 gap-4">
                           <Skeleton className="h-6 w-full rounded-md col-span-1" />
                           <Skeleton className="h-10 w-full rounded-md col-span-7" />
                           <Skeleton className="h-6 w-full rounded-md col-span-2" />
                           <Skeleton className="h-6 w-full rounded-md col-span-2" />
                        </div>
                     ))
                   ) : filteredUsers?.map((user, idx) => (
                      <div key={user.id} className="p-8 grid grid-cols-12 items-center hover:bg-slate-50 transition-colors group cursor-pointer">
                         <div className="col-span-1 font-headline font-black text-slate-300 group-hover:text-primary transition-colors">#{idx + 4}</div>
                         <div className="col-span-7 flex items-center gap-4">
                            <Avatar className="h-12 w-12 border-2 border-slate-100 rounded-xl shadow-sm">
                               <AvatarFallback className="bg-slate-50 text-[#0F172A] font-black text-xs">{user.name?.[0]}</AvatarFallback>
                            </Avatar>
                            <div>
                               <p className="font-bold text-[#0F172A]">{user.name}</p>
                               <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{user.targetExam || 'General'}</p>
                            </div>
                         </div>
                         <div className="col-span-2 text-center font-headline font-black text-[#0F172A] flex items-center justify-center gap-2">
                            <Zap className="h-4 w-4 text-primary" /> {Math.floor(Math.random() * 2000) + 1000}
                         </div>
                         <div className="col-span-2 text-right font-black text-emerald-500">
                            {Math.floor(Math.random() * 20) + 70}%
                         </div>
                      </div>
                   ))}
                </div>
             </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  )
}

function PodiumCard({ rank, name, score, accuracy, isMain }: any) {
   return (
      <div className={`flex flex-col items-center space-y-6 ${isMain ? 'mb-8' : ''}`}>
         <div className="relative group">
            <Avatar className={`${isMain ? 'h-32 w-32' : 'h-24 w-24'} border-4 border-white shadow-2xl rounded-[2.5rem] transition-transform group-hover:scale-110 duration-500`}>
               <AvatarImage src={`https://i.pravatar.cc/150?u=${name}`} />
               <AvatarFallback className="bg-slate-100 text-[#0F172A] font-black">{name[0]}</AvatarFallback>
            </Avatar>
            <div className={`absolute -bottom-4 left-1/2 -translate-x-1/2 h-10 w-10 rounded-xl flex items-center justify-center shadow-2xl border-4 border-white ${rank === 1 ? 'bg-amber-400' : rank === 2 ? 'bg-slate-300' : 'bg-orange-400'}`}>
               <Trophy className="h-4 w-4 text-white fill-current" />
            </div>
         </div>
         <div className="text-center space-y-1">
            <p className={`font-headline font-black text-[#0F172A] ${isMain ? 'text-2xl' : 'text-lg'}`}>{name}</p>
            <div className="flex items-center justify-center gap-4">
               <span className="text-[10px] font-black uppercase text-primary flex items-center gap-1.5">
                  <Zap className="h-3 w-3" /> {score} pts
               </span>
               <span className="text-[10px] font-black uppercase text-emerald-500 flex items-center gap-1.5">
                  <Target className="h-3 w-3" /> {accuracy}
               </span>
            </div>
         </div>
      </div>
   )
}
