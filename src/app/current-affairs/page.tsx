
"use client"

import { useMemo, useState } from "react"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import { useCollection, useFirestore } from "@/firebase"
import { collection, query, orderBy } from "firebase/firestore"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Search, 
  ArrowRight, 
  Zap, 
  FileText, 
  FileStack, 
  TrendingUp, 
  Download, 
  ExternalLink,
  MessageCircle,
  Sparkles,
  Trophy,
  Globe,
  Bell,
  Target,
  Medal,
  ChevronRight,
  User,
  Library
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import Link from "next/link"

/**
 * @fileOverview Institutional Free Hub v7.0.
 * UPDATED: Renamed to FREE HUB and consolidated PYQs and Study Materials.
 */

const CATEGORIES = [
  { id: "all", label: "All Hubs", icon: <Globe className="h-6 w-6" />, color: "bg-blue-50 text-blue-600" },
  { id: "mock", label: "Free Mocks", icon: <Zap className="h-6 w-6" />, color: "bg-orange-50 text-primary" },
  { id: "pdf", label: "Blueprints", icon: <Library className="h-6 w-6" />, color: "bg-emerald-50 text-emerald-600" },
  { id: "pyq", label: "Previous Papers", icon: <FileStack className="h-6 w-6" />, color: "bg-rose-50 text-rose-600" }
]

export default function FreeContentHub() {
  const db = useFirestore()
  const [activeFilter, setActiveFilter] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")

  const contentQuery = useMemo(() => {
    if (!db) return null
    return query(collection(db, "free_content"), orderBy("updatedAt", "desc"))
  }, [db])

  const { data: content, loading } = useCollection<any>(contentQuery)

  const filteredItems = useMemo(() => {
    if (!content) return []
    return content.filter(item => {
      const matchesType = activeFilter === "all" || item.type === activeFilter
      const matchesSearch = item.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           item.description?.toLowerCase().includes(searchTerm.toLowerCase())
      return matchesType && matchesSearch
    })
  }, [content, activeFilter, searchTerm])

  return (
    <div className="flex flex-col min-h-screen bg-slate-50/50 font-body">
      <Navbar />
      
      <main className="container mx-auto px-4 md:px-6 py-8 md:py-12 max-w-7xl">
        <div className="space-y-10 md:space-y-16">
          
          {/* HERO HUB */}
          <div className="flex flex-col lg:flex-row justify-between items-center gap-12 text-left bg-[#0B1528] p-8 md:p-16 rounded-[2.5rem] md:rounded-[4rem] text-white relative overflow-hidden shadow-4xl group">
            <div className="absolute top-0 right-0 p-12 opacity-5 rotate-12 group-hover:scale-110 transition-transform duration-1000"><Trophy className="h-80 w-80" /></div>
            <div className="space-y-8 relative z-10 max-w-3xl">
              <div className="flex items-center gap-3">
                 <Badge className="bg-primary text-white border-none px-4 py-1.5 rounded-full font-black uppercase text-[10px] tracking-[0.2em] shadow-xl">
                    Official Free Hub
                 </Badge>
                 <Badge className="bg-white/10 text-white border border-white/20 px-3 py-1.5 rounded-full font-bold uppercase text-[9px]">
                    100% Free Nodes
                 </Badge>
              </div>
              <h1 className="text-4xl md:text-8xl font-headline font-black tracking-tighter uppercase leading-[0.85]">
                PUNJAB EXAM <br/>
                <span className="text-primary">FREE HUB</span>
              </h1>
              <p className="text-slate-400 font-medium text-base md:text-xl max-w-2xl leading-relaxed">
                Access high-fidelity mocks, previous papers, and study blueprints curated by Arsh Grewal Management.
              </p>
              
              <div className="relative w-full md:w-[480px]">
                 <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-6 w-6 text-slate-500" />
                 <Input 
                   className="h-16 pl-16 rounded-[1.5rem] bg-white/10 border-white/10 text-white placeholder:text-slate-500 text-lg font-medium backdrop-blur-md focus-visible:ring-primary shadow-2xl" 
                   placeholder="Search free repository..." 
                   value={searchTerm}
                   onChange={e => setSearchTerm(e.target.value)}
                 />
              </div>
            </div>

            <div className="hidden lg:grid grid-cols-2 gap-4 relative z-10">
               <HeroStat val="500+" label="Free Mocks" />
               <HeroStat val="1.2k+" label="PDF Nodes" />
               <HeroStat val="15k+" label="Aspirants" />
               <HeroStat val="Real" label="PYQ Archive" />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
             {/* LEFT: CONTENT HUB */}
             <div className="lg:col-span-8 space-y-12">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                   {CATEGORIES.map(cat => (
                     <button 
                      key={cat.id}
                      onClick={() => setActiveFilter(cat.id)}
                      className={cn(
                        "p-6 rounded-[2rem] transition-all flex flex-col items-center justify-center gap-4 shadow-sm hover:shadow-2xl border-2",
                        activeFilter === cat.id ? 'bg-[#0B1528] border-[#0B1528] text-white' : 'bg-white border-white text-slate-400 hover:border-primary/20'
                      )}
                     >
                       <div className={cn(
                         "h-14 w-14 rounded-2xl flex items-center justify-center shadow-inner",
                         activeFilter === cat.id ? 'bg-white/10 text-primary' : cat.color
                       )}>
                         {cat.icon}
                       </div>
                       <span className="text-[10px] font-black uppercase tracking-[0.2em]">{cat.label}</span>
                     </button>
                   ))}
                </div>

                <div className="grid grid-cols-1 gap-6 md:gap-8">
                  {loading ? (
                    Array.from({ length: 4 }).map((_, i) => (
                      <Skeleton key={i} className="h-40 w-full rounded-[2.5rem]" />
                    ))
                  ) : filteredItems.length > 0 ? (
                    filteredItems.map((item) => {
                      const isInternal = item.link?.startsWith('/');
                      return (
                        <Card key={item.id} className="bg-white border-none shadow-xl hover:shadow-4xl transition-all duration-500 rounded-[2.5rem] overflow-hidden group text-left">
                          <CardContent className="p-8 md:p-10 flex flex-col md:row items-center gap-8">
                             <div className={cn(
                                "h-16 w-16 md:h-20 md:w-20 rounded-[1.5rem] md:rounded-[2rem] flex items-center justify-center shrink-0 shadow-inner group-hover:scale-110 transition-transform",
                                item.type === 'mock' ? 'bg-orange-50 text-primary' : 
                                item.type === 'pyq' ? 'bg-rose-50 text-rose-600' : 'bg-blue-50 text-blue-600'
                             )}>
                                {item.type === 'mock' ? <Zap className="h-8 md:h-10 md:w-10" /> : 
                                 item.type === 'pyq' ? <FileStack className="h-8 md:h-10 md:w-10" /> : <FileText className="h-8 md:h-10 md:w-10" />}
                             </div>
                             <div className="flex-1 space-y-3 w-full">
                                <div className="flex items-center justify-between">
                                   <Badge className="bg-slate-100 text-slate-400 border-none px-3 py-1 font-black uppercase text-[8px] tracking-widest">{item.type?.toUpperCase()}</Badge>
                                   <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest flex items-center gap-2">
                                      <Bell className="h-3 w-3 text-primary" /> New Entry
                                   </span>
                                </div>
                                <h2 className="text-xl md:text-2xl font-headline font-black text-[#0F172A] group-hover:text-primary transition-colors uppercase leading-tight">{item.title}</h2>
                                <p className="text-slate-400 text-sm font-medium line-clamp-2">{item.description}</p>
                             </div>
                             <div className="shrink-0 w-full md:w-auto">
                                <Button asChild className="w-full md:w-auto h-14 px-10 bg-[#0F172A] hover:bg-primary text-white font-black uppercase text-[10px] tracking-[0.2em] rounded-2xl shadow-xl transition-all active:scale-95">
                                   {isInternal ? (
                                     <Link href={item.link}>
                                        {item.type === 'mock' ? 'Attempt Now' : 'View Content'} <ArrowRight className="ml-2 h-4 w-4" />
                                     </Link>
                                   ) : (
                                     <a href={item.link || "#"} target="_blank" rel="noopener noreferrer">
                                        {item.type === 'mock' ? 'Attempt' : 'Open PDF'} <ArrowRight className="ml-2 h-4 w-4" />
                                     </a>
                                   )}
                                </Button>
                             </div>
                          </CardContent>
                        </Card>
                      )
                    })
                  ) : (
                    <div className="py-24 text-center border-2 border-dashed border-slate-100 rounded-[3rem] opacity-20">
                       <Sparkles className="h-12 w-12 mx-auto mb-4" />
                       <p className="font-headline font-black text-xl uppercase">Registry Empty</p>
                    </div>
                  )}
                </div>
             </div>

             {/* RIGHT: RANKING PODIUM & TELEGRAM */}
             <div className="lg:col-span-4 space-y-12 text-left">
                <Card className="border-none shadow-3xl rounded-[3rem] bg-white overflow-hidden">
                   <div className="bg-[#0F172A] p-8 text-white">
                      <div className="flex items-center gap-4 mb-2">
                         <Medal className="h-6 w-6 text-primary" />
                         <h3 className="font-headline font-black text-xl uppercase">State Merit Index</h3>
                      </div>
                      <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Hall of Rankers (Live)</p>
                   </div>
                   <CardContent className="p-8 space-y-6">
                      <RankingItem rank={1} name="Harmanjit Kaur" score="145/150" color="bg-amber-400" />
                      <RankingItem rank={2} name="Amritpal Singh" score="142/150" color="bg-slate-300" />
                      <RankingItem rank={3} name="Gursewak Singh" score="139/150" color="bg-orange-400" />
                      <div className="pt-4 border-t border-slate-50">
                         <Button asChild variant="ghost" className="w-full font-black uppercase text-[9px] tracking-widest text-primary gap-2">
                            <Link href="/leaderboard">Full Registry Hub <ChevronRight className="h-3 w-3" /></Link>
                         </Button>
                      </div>
                   </CardContent>
                </Card>

                <Card className="border-none bg-primary text-white shadow-4xl rounded-[3rem] p-10 space-y-8 relative overflow-hidden group cursor-pointer">
                   <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12 group-hover:scale-110 transition-transform"><MessageCircle className="h-40 w-40" /></div>
                   <div className="relative z-10 space-y-6">
                      <div className="h-14 w-14 bg-white rounded-2xl flex items-center justify-center text-primary shadow-2xl">
                         <MessageCircle className="h-8 w-8 fill-current" />
                      </div>
                      <h3 className="text-3xl font-headline font-black uppercase leading-tight">Join Official <br/> Telegram</h3>
                      <p className="text-white/80 text-sm font-medium leading-relaxed">Direct recruitment updates verified by Arsh Grewal Management.</p>
                      <Button asChild className="w-full h-14 bg-white text-black hover:bg-slate-100 font-black uppercase text-[10px] tracking-widest rounded-2xl shadow-2xl">
                         <a href="https://t.me/cracklixapp" target="_blank">Join 15k+ Aspirants</a>
                      </Button>
                   </div>
                </Card>
             </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

function HeroStat({ val, label }: any) {
   return (
      <div className="bg-white/5 border border-white/10 p-5 rounded-3xl backdrop-blur-sm group hover:border-primary/50 transition-all">
         <p className="text-3xl font-headline font-black text-white leading-none">{val}</p>
         <p className="text-[9px] font-black uppercase text-slate-500 tracking-widest mt-1.5">{label}</p>
      </div>
   )
}

function RankingItem({ rank, name, score, color }: any) {
   return (
      <div className="flex items-center justify-between group cursor-pointer">
         <div className="flex items-center gap-4">
            <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center text-white font-black text-xs shadow-lg", color)}>
               {rank}
            </div>
            <div className="text-left">
               <p className="font-bold text-[#0F172A] text-sm uppercase">{name}</p>
               <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Regional Node 0{rank}</p>
            </div>
         </div>
         <span className="text-xs font-black text-emerald-600">{score}</span>
      </div>
   )
}
