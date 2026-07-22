
"use client"

import { useMemo, useState, useEffect } from "react"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import { useCollection, useFirestore, useUser } from "@/firebase"
import { collection, query, limit, orderBy } from "firebase/firestore"
import { Trophy, ShieldCheck, Search, Activity, Zap, Star, Medal, Target, ChevronRight, X, Filter } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
import StudentAvatar from "@/components/brand/StudentAvatar"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"

/**
 * @fileOverview Official Top Rankers Center v3.3 [Fidelity Fix].
 * FIXED: Preserving decimal scores for accuracy and Title Case names.
 */

const CATEGORY_CHIPS = [
  { id: "all", label: "All Hubs" },
  { id: "PSSSB", label: "PSSSB" },
  { id: "PPSC", label: "PPSC" },
  { id: "Punjab Police", label: "Police" },
  { id: "Teaching", label: "Teaching" },
  { id: "Banking", label: "Banking" },
  { id: "Judiciary", label: "Judiciary" },
  { id: "Central", label: "Central" },
];

export default function LeaderboardPage() {
  const db = useFirestore()
  const { user } = useUser()
  const router = useRouter()
  
  const [searchTerm, setSearchTerm] = useState("")
  const [activeBoard, setActiveBoard] = useState("all")
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    setMounted(true)
  }, []);

  const meritQuery = useMemo(() => (db && mounted ? query(collection(db, "results"), limit(500)) : null), [db, mounted])
  const usersQuery = useMemo(() => (db && mounted ? query(collection(db, "users"), limit(500)) : null), [db, mounted])

  const { data: results, loading: resultsLoading } = useCollection<any>(meritQuery)
  const { data: users, loading: usersLoading } = useCollection<any>(usersQuery)

  const finalSortedList = useMemo(() => {
    if (!results || !mounted) return []
    const term = searchTerm.toLowerCase().trim();
    
    const uniqueRankers = new Map<string, any>();
    
    [...results].forEach((r: any) => {
      const existing = uniqueRankers.get(r.userId);
      if (!existing || existing.score < r.score) {
        const userProfile = users?.find((u: any) => u.id === r.userId);
        
        const rawName = userProfile?.name || 
                     (r.userName && r.userName !== 'Aspirant' && r.userName !== 'Student' && !r.userName.includes('@') ? r.userName : null) || 
                     userProfile?.email || 
                     r.userEmail || 
                     "Aspirant";
        
        const name = rawName.split(' ').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');

        const matchesSearch = !term || 
          name.toLowerCase().includes(term) || 
          (r.mockTitle || "").toLowerCase().includes(term);

        const matchesBoard = activeBoard === 'all' || 
          (r.mockTitle || "").toLowerCase().includes(activeBoard.toLowerCase());

        if (matchesSearch && matchesBoard) {
          uniqueRankers.set(r.userId, {
            id: r.userId,
            name,
            profile: userProfile,
            score: Number(r.score) || 0,
            accuracy: r.accuracy || 0,
            mockTitle: r.mockTitle || "Practice Mock",
            timestamp: r.timestamp,
            gender: r.gender || userProfile?.gender
          });
        }
      }
    });

    return Array.from(uniqueRankers.values()).sort((a, b) => b.score - a.score);
  }, [results, users, searchTerm, activeBoard, mounted]);

  const podium = useMemo(() => finalSortedList.slice(0, 3), [finalSortedList]);
  const listItems = useMemo(() => finalSortedList.slice(3), [finalSortedList]);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-body text-left selection:bg-primary/10 flex flex-col overflow-x-hidden">
      <Navbar />
      
      <main className="flex-1 w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-16 space-y-8 md:space-y-12 pb-32">
         
         <section className="space-y-4 px-1">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
               <div className="space-y-1">
                  <h1 className="text-2xl md:text-4xl font-black text-[#0F172A] tracking-tight">Top Rankers</h1>
                  <p className="text-slate-500 font-medium text-sm md:text-lg">Highest performing students across all Punjab Government exams.</p>
               </div>
               <div className="flex items-center gap-3 shrink-0">
                  <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] font-bold text-slate-400 tracking-tight">Registry Sync Live</span>
               </div>
            </div>
         </section>

         <div className="sticky top-[80px] z-[45] bg-[#F8FAFC]/95 backdrop-blur-xl -mx-4 px-4 py-4 md:py-6 border-b border-slate-100">
            <div className="max-w-4xl mx-auto space-y-6">
               <div className="relative group">
                  <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 group-focus-within:text-primary transition-colors" />
                  <Input 
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    placeholder="Search student or exam vertical..." 
                    className="h-14 md:h-16 pl-14 pr-12 rounded-2xl bg-white border-slate-200 shadow-xl text-base md:text-lg font-bold placeholder:text-slate-200 focus-visible:ring-4 focus-visible:ring-primary/5 transition-all"
                  />
                  {searchTerm && (
                    <button onClick={() => setSearchTerm('')} className="absolute right-4 top-1/2 -translate-y-1/2 p-2 hover:bg-slate-50 rounded-full transition-all">
                       <X className="h-6 w-6 text-slate-300" />
                    </button>
                  )}
               </div>

               <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 px-1">
                  {CATEGORY_CHIPS.map(chip => (
                     <button 
                       key={chip.id} 
                       onClick={() => setActiveBoard(chip.id)}
                       className={cn(
                          "h-9 px-6 rounded-full font-bold text-[10px] md:text-xs tracking-tight whitespace-nowrap transition-all border active:scale-95 shadow-sm",
                          activeBoard === chip.id 
                             ? "bg-primary border-primary text-white shadow-lg" 
                             : "bg-white border-slate-100 text-slate-400 hover:border-slate-300"
                       )}
                     >
                        {chip.label}
                     </button>
                  ))}
               </div>
            </div>
         </div>

         {!searchTerm && finalSortedList.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-10 pt-8">
               <PodiumCard rank={2} data={podium[1]} order="md:order-1" />
               <PodiumCard rank={1} data={podium[0]} order="md:order-2" isMain />
               <PodiumCard rank={3} data={podium[2]} order="md:order-3" />
            </div>
         )}

         <div className="max-w-4xl mx-auto space-y-3">
            <AnimatePresence mode="popLayout">
               {resultsLoading || usersLoading ? (
                  Array.from({ length: 8 }).map((_, i) => (
                     <div key={i} className="h-20 w-full bg-white rounded-2xl border border-slate-50 animate-pulse" />
                  ))
               ) : finalSortedList.length > 0 ? (
                  (searchTerm ? finalSortedList : listItems).map((entry, idx) => (
                     <motion.div 
                        key={entry.id}
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ delay: idx * 0.02 }}
                     >
                        <Card className="border border-slate-100 shadow-sm hover:shadow-4xl transition-all duration-300 rounded-2xl bg-white group overflow-hidden">
                           <CardContent className="p-0 flex items-center h-[72px] md:h-[80px]">
                              <div className="w-12 md:w-16 flex items-center justify-center shrink-0">
                                 <span className="text-lg md:text-2xl font-black text-slate-200 group-hover:text-primary transition-colors tabular-nums">
                                    #{searchTerm ? idx + 1 : idx + 4}
                                 </span>
                              </div>

                              <div className="flex-1 flex items-center gap-4 min-w-0 pr-4">
                                 <StudentAvatar 
                                    profile={entry.profile || entry} 
                                    className="h-10 w-10 md:h-12 md:w-12 rounded-xl shrink-0 shadow-inner bg-slate-50" 
                                 />
                                 <div className="min-w-0 flex-1">
                                    <h4 className="font-bold text-sm md:text-lg text-[#0F172A] truncate leading-tight group-hover:text-primary transition-colors">
                                       {entry.name}
                                    </h4>
                                    <div className="flex items-center gap-2 mt-0.5">
                                       <Badge variant="outline" className="text-[7px] md:text-[8px] font-bold border-slate-100 text-slate-400 uppercase tracking-widest px-1.5 h-4">
                                          {entry.mockTitle?.split(' ')[0] || 'State'} Hub
                                       </Badge>
                                       <span className="text-[9px] md:text-[10px] font-bold text-slate-300 uppercase truncate max-w-[120px]">
                                          {entry.mockTitle}
                                       </span>
                                    </div>
                                 </div>
                              </div>

                              <div className="flex items-center gap-4 md:gap-10 px-4 md:px-8 shrink-0">
                                 <div className="text-right hidden sm:block">
                                    <p className="text-[8px] font-bold text-slate-300 uppercase tracking-widest">Accuracy</p>
                                    <p className={cn("text-xs md:text-sm font-black tabular-nums", entry.accuracy > 70 ? "text-emerald-500" : "text-amber-500")}>
                                       {entry.accuracy}%
                                    </p>
                                 </div>
                                 <div className="text-right">
                                    <p className="text-[8px] font-bold text-slate-300 uppercase tracking-widest">Total score</p>
                                    <p className="text-base md:text-2xl font-black text-[#0F172A] tabular-nums tracking-tighter">
                                       {entry.score.toFixed(1)}
                                    </p>
                                 </div>
                                 <ChevronRight className="h-4 w-4 text-slate-200 group-hover:text-primary group-hover:translate-x-1 transition-all shrink-0" />
                              </div>
                           </CardContent>
                        </Card>
                     </motion.div>
                  ))
               ) : (
                  <motion.div 
                     initial={{ opacity: 0, scale: 0.95 }}
                     animate={{ opacity: 1, scale: 1 }}
                     className="py-32 flex flex-col items-center justify-center text-center space-y-6 bg-white rounded-[3rem] border-2 border-dashed border-slate-100 shadow-inner"
                  >
                     <div className="h-20 w-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-200">
                        <Trophy className="h-10 w-10" />
                     </div>
                     <div className="space-y-1">
                        <h2 className="text-xl font-bold text-[#0F172A]">No rankings available yet</h2>
                        <p className="text-slate-400 font-medium text-sm">Complete mock tests to appear on the merit list.</p>
                     </div>
                     <Button asChild className="rounded-full bg-primary hover:bg-blue-700 px-8 shadow-xl border-none font-bold text-xs uppercase tracking-widest h-12">
                        <Link href="/mocks">Explore Practice Hub</Link>
                     </Button>
                  </motion.div>
               )}
            </AnimatePresence>
         </div>
      </main>
      <Footer />
    </div>
  )
}

function PodiumCard({ rank, data, order, isMain }: any) {
   if (!data) return (
      <div className={cn("bg-white border border-dashed border-slate-200 rounded-[2rem] p-10 h-64 md:h-80 flex items-center justify-center opacity-40", order)}>
         <Trophy className="h-10 w-10 text-slate-200" />
      </div>
   );

   return (
      <motion.div 
         initial={{ opacity: 0, y: 30 }}
         animate={{ opacity: 1, y: 0 }}
         transition={{ delay: rank * 0.1 }}
         className={cn("flex", order)}
      >
         <Card className={cn(
            "border-none shadow-xl transition-all duration-500 rounded-[2.5rem] p-8 md:p-10 flex flex-col items-center text-center group hover:-translate-y-2 relative overflow-hidden w-full",
            isMain ? "bg-[#0F172A] text-white ring-4 ring-primary/20 scale-[1.05] z-10" : "bg-white text-[#0F172A]"
         )}>
            <div className={cn(
               "absolute top-6 left-6 h-8 w-8 md:h-10 md:w-10 rounded-xl flex items-center justify-center text-white font-black text-xs md:text-sm shadow-xl transition-transform group-hover:rotate-12",
               rank === 1 ? "bg-amber-400" : rank === 2 ? "bg-slate-300" : "bg-orange-400"
            )}>
               #{rank}
            </div>

            <div className="absolute top-0 right-0 p-6 opacity-5 rotate-12 group-hover:scale-110 transition-transform">
               {rank === 1 ? <Medal className="h-24 w-24" /> : <Trophy className="h-24 w-24" />}
            </div>

            <div className="space-y-6 relative z-10">
               <div className="relative inline-block">
                  <StudentAvatar 
                    profile={data.profile || data} 
                    className={cn(
                      "rounded-[2rem] border-4 shadow-2xl transition-all group-hover:scale-105", 
                      isMain ? "h-24 w-24 md:h-32 md:w-32 border-primary/20" : "h-20 w-20 md:h-24 md:w-24 border-white"
                    )} 
                  />
                  {rank === 1 && (
                     <div className="absolute -top-3 -right-3 bg-amber-400 text-white h-8 w-8 rounded-full flex items-center justify-center shadow-lg animate-bounce">
                        <Star className="h-4 w-4 fill-current" />
                     </div>
                  )}
               </div>

               <div className="space-y-1">
                  <h3 className="text-base md:text-xl font-black truncate max-w-[160px] md:max-w-[200px] leading-tight tracking-tight">{data.name}</h3>
                  <p className={cn("text-[9px] font-bold uppercase tracking-widest", isMain ? "text-primary" : "text-slate-400")}>
                    {data.mockTitle?.split(' ')[0] || 'Top'} Hub
                  </p>
               </div>

               <div className="h-px w-12 bg-slate-500/20 mx-auto" />

               <div className="grid grid-cols-2 gap-6">
                  <div className="text-center">
                     <p className={cn("text-[8px] font-bold uppercase tracking-widest", isMain ? "text-slate-400" : "text-slate-400")}>Score</p>
                     <p className={cn("text-lg md:text-2xl font-black tabular-nums tracking-tighter", isMain ? "text-white" : "text-primary")}>
                        {data.score.toFixed(1)}
                     </p>
                  </div>
                  <div className="text-center">
                     <p className={cn("text-[8px] font-bold uppercase tracking-widest", isMain ? "text-slate-400" : "text-slate-400")}>Accuracy</p>
                     <p className={cn("text-lg md:text-2xl font-black tabular-nums tracking-tighter", isMain ? "text-emerald-400" : "text-emerald-600")}>
                        {data.accuracy}%
                     </p>
                  </div>
               </div>
            </div>
         </Card>
      </motion.div>
   )
}
