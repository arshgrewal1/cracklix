"use client"

import { useMemo, useState, useEffect } from "react"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import { useCollection, useFirestore, useUser } from "@/firebase"
import { collection, query, where } from "firebase/firestore"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Search, 
  Zap, 
  FileText, 
  Globe, 
  Newspaper, 
  ChevronRight,
  MessageCircle,
  Trophy,
  Sparkles,
  Bell,
  Medal,
  Users,
  Loader2,
  Calendar,
  Download,
  BookOpen,
  Layers
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { AuthorityLogo } from "@/lib/exam-icons"

/**
 * @fileOverview Official Current Affairs Center v17.0.
 * UPDATED: Integrated branded Current Affairs logo into header.
 */

const HUB_TYPES = [
  { id: "DAILY", label: "Daily Updates", icon: <Calendar className="h-5 w-5" /> },
  { id: "WEEKLY", label: "Weekly Updates", icon: <Layers className="h-5 w-5" /> },
  { id: "MONTHLY", label: "Monthly Updates", icon: <Newspaper className="h-5 w-5" /> },
  { id: "QUIZ", label: "Live Quizzes", icon: <Zap className="h-5 w-5" /> },
  { id: "PDF", label: "PDF Notes", icon: <FileText className="h-5 w-5" /> }
]

export default function CurrentAffairsCenter() {
  const db = useFirestore()
  const { user, loading: authLoading } = useUser()
  const router = useRouter()
  const [activeType, setActiveType] = useState("DAILY")
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    if (!authLoading && !user) {
      router.push(`/login?returnUrl=${encodeURIComponent('/current-affairs')}`);
    }
  }, [user, authLoading, router]);

  const hubQuery = useMemo(() => (db ? query(collection(db, "current_affairs_hub"), where("status", "==", "PUBLISHED")) : null), [db])
  const { data: hubItems, loading } = useCollection<any>(hubQuery)
  
  const rankingQuery = useMemo(() => (db ? query(collection(db, "results")) : null), [db])
  const { data: results } = useCollection<any>(rankingQuery)

  const topRankers = useMemo(() => {
     if (!results) return [];
     const map = new Map();
     results.forEach(r => {
        if (!map.has(r.userId) || map.get(r.userId).score < r.score) {
           map.set(r.userId, r);
        }
     });
     return Array.from(map.values()).sort((a, b) => b.score - a.score).slice(0, 5);
  }, [results]);

  const filteredItems = useMemo(() => {
    if (!hubItems) return []
    return hubItems
      .filter(item => {
        const matchesSearch = item.title?.toLowerCase().includes(searchTerm.toLowerCase())
        if (activeType === 'QUIZ') return matchesSearch && !!item.quizId
        if (activeType === 'PDF') return matchesSearch && !!item.pdfUrl
        return matchesSearch && item.type === activeType
      })
      .sort((a, b) => {
        const tA = a.updatedAt?.seconds || 0;
        const tB = b.updatedAt?.seconds || 0;
        return tB - tA;
      })
  }, [hubItems, activeType, searchTerm])

  const handleQuizAttempt = (quizId: string) => {
     if (!user) {
        router.push(`/login?returnUrl=${encodeURIComponent(`/mocks/${quizId}/instructions`)}`);
        return;
     }
     router.push(`/mocks/${quizId}/instructions`);
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50/50 font-body text-left">
      <Navbar />
      
      {authLoading ? (
         <div className="flex-1 flex flex-col items-center justify-center space-y-6 py-20">
            <Zap className="h-10 w-10 text-primary animate-pulse" />
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Syncing Study Hub...</p>
         </div>
      ) : (
         <main className="container mx-auto px-4 md:px-6 py-8 md:py-12 max-w-7xl">
            <div className="space-y-10 md:space-y-16 text-left">
               
               <div className="bg-[#0B1528] p-8 md:p-16 rounded-[2.5rem] md:rounded-[4rem] text-white relative overflow-hidden shadow-4xl group">
                  <div className="absolute top-0 right-0 p-12 opacity-5 rotate-12 group-hover:scale-110 transition-transform duration-1000"><AuthorityLogo boardId="current-affairs" size="xl" className="h-80 w-80 opacity-5" /></div>
                  <div className="space-y-10 relative z-10 max-w-4xl">
                    <div className="flex items-center gap-3">
                        <AuthorityLogo boardId="current-affairs" size="sm" className="bg-transparent shadow-none p-0" />
                        <Badge className="bg-primary text-white border-none px-4 py-1.5 rounded-full font-black uppercase text-[10px] tracking-[0.2em] shadow-xl">
                            STUDY CENTER
                        </Badge>
                    </div>
                    <div className="space-y-6 md:space-y-10">
                        <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-8xl font-black tracking-tight leading-[0.9] break-words antialiased">
                            Punjab <br/>
                            <span className="text-primary">Study Center</span>
                        </h1>
                        <p className="text-slate-400 font-medium text-base md:text-2xl max-w-2xl leading-tight tracking-tight">
                            Daily, Weekly, and Monthly exam updates verified for all upcoming Punjab recruitment exams.
                        </p>
                    </div>
                    
                    <div className="relative w-full md:w-[480px]">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-6 w-6 text-slate-500" />
                        <Input 
                            className="h-16 pl-16 rounded-[1.5rem] bg-white/10 border-white/10 text-white placeholder:text-slate-500 text-lg font-medium backdrop-blur-md shadow-2xl" 
                            placeholder="Search updates..." 
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                  </div>
               </div>

               <Tabs value={activeType} onValueChange={setActiveType} className="space-y-10">
                  <TabsList className="bg-white border border-slate-100 p-1.5 h-16 rounded-2xl shadow-sm flex w-full md:w-auto overflow-x-auto no-scrollbar justify-start gap-2">
                     {HUB_TYPES.map(hub => (
                        <TabsTrigger key={hub.id} value={hub.id} className="rounded-xl px-6 md:px-8 font-black uppercase text-[10px] gap-3 h-full shrink-0 data-[state=active]:bg-[#0F172A] data-[state=active]:text-white transition-all">
                           {hub.icon} {hub.label}
                        </TabsTrigger>
                     ))}
                  </TabsList>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                     <div className="lg:col-span-8 space-y-8">
                        {loading ? (
                           Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-40 w-full rounded-[2.5rem]" />)
                        ) : filteredItems.length > 0 ? (
                           <div className="grid grid-cols-1 gap-6">
                              {filteredItems.map((item) => (
                                 <Card key={item.id} className="bg-white border-none shadow-xl hover:shadow-4xl transition-all duration-500 rounded-[2.5rem] overflow-hidden group text-left border border-slate-100 p-8 md:p-10">
                                    <CardContent className="p-0 flex flex-col md:flex-row items-center gap-8">
                                       <div className={cn(
                                          "h-16 w-16 md:h-20 md:w-20 rounded-[1.5rem] md:rounded-[2rem] flex items-center justify-center shrink-0 shadow-inner group-hover:scale-110 transition-transform",
                                          item.type === 'DAILY' ? 'bg-orange-50 text-primary' : 
                                          item.type === 'WEEKLY' ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600'
                                       )}>
                                          <AuthorityLogo boardId="current-affairs" size="md" className="bg-transparent shadow-none p-0 opacity-80" />
                                       </div>
                                       <div className="flex-1 space-y-3 w-full">
                                          <div className="flex items-center justify-between">
                                             <Badge className="bg-slate-100 text-slate-400 border-none px-3 py-1 font-black uppercase text-[8px] tracking-widest">
                                                {item.type} CENTER
                                             </Badge>
                                             <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest flex items-center gap-2">
                                                <Calendar className="h-3 w-3 text-primary" /> {item.month} {item.year}
                                             </span>
                                          </div>
                                          <h2 className="text-xl md:text-2xl font-black text-[#0F172A] group-hover:text-primary transition-colors leading-tight">{item.title}</h2>
                                          <div className="flex items-center gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                             <Globe className="h-3 w-3" /> Language: {item.language || "Bilingual"}
                                          </div>
                                       </div>
                                       <div className="shrink-0 w-full md:w-auto flex flex-col gap-3">
                                          {item.quizId && (
                                             <Button onClick={() => handleQuizAttempt(item.quizId)} className="w-full md:w-auto h-12 px-8 bg-[#0F172A] hover:bg-primary text-white font-black uppercase text-[10px] tracking-widest rounded-xl shadow-xl transition-all active:scale-95 border-none">
                                                Attempt Quiz <Zap className="ml-2 h-4 w-4" />
                                             </Button>
                                          )}
                                          {item.pdfUrl && (
                                             <Button asChild variant="outline" className="w-full md:w-auto h-12 px-8 border-slate-200 text-[#0F172A] font-black uppercase text-[10px] tracking-widest rounded-xl hover:bg-slate-50">
                                                <a href={item.pdfUrl} target="_blank" rel="noopener noreferrer">
                                                   Download PDF <Download className="ml-2 h-4 w-4" />
                                                </a>
                                             </Button>
                                          )}
                                       </div>
                                    </CardContent>
                                 </Card>
                              ))}
                           </div>
                        ) : (
                           <div className="py-24 text-center border-2 border-dashed border-slate-100 rounded-[3rem] opacity-20">
                              <Sparkles className="h-12 w-12 mx-auto mb-4" />
                              <p className="font-headline font-black text-xl uppercase tracking-widest">Repository Empty</p>
                           </div>
                        )}
                     </div>

                     <div className="lg:col-span-4 space-y-12">
                        <Card className="border-none shadow-3xl rounded-[3rem] bg-white overflow-hidden border border-slate-100">
                           <div className="bg-[#0F172A] p-8 text-white">
                              <div className="flex items-center gap-4 mb-2">
                                 <Medal className="h-6 w-6 text-primary" />
                                 <h3 className="font-headline font-black text-xl uppercase">Top Students</h3>
                              </div>
                              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Merit List</p>
                           </div>
                           <CardContent className="p-8 space-y-6">
                              {topRankers?.map((res: any, idx: number) => {
                                 const name = (res.userName && res.userName !== 'Student' && !res.userName.includes('@')) ? res.userName : (res.userEmail || "Student");
                                 return (
                                 <div key={res.id} className="flex items-center justify-between">
                                    <div className="flex items-center gap-4 text-left">
                                       <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center text-white font-black text-xs shadow-lg", idx === 0 ? "bg-amber-400" : idx === 1 ? "bg-slate-300" : "bg-orange-400")}>
                                          #{idx + 1}
                                       </div>
                                       <div className="min-w-0">
                                          <p className="font-bold text-[#0F172A] text-sm uppercase truncate max-w-[120px]">{name}</p>
                                          <p className="text-[8px] font-black text-slate-400 uppercase">Score: {res.score}</p>
                                       </div>
                                    </div>
                                    <span className="text-xs font-black text-emerald-600">{res.accuracy}%</span>
                                 </div>
                                 );
                              })}
                              <div className="pt-4 border-t border-slate-50">
                                 <Button asChild variant="ghost" className="w-full font-black uppercase text-[9px] tracking-widest text-primary gap-2">
                                    <Link href="/leaderboard">Full Merit List <ChevronRight className="h-3 w-3" /></Link>
                                 </Button>
                              </div>
                           </CardContent>
                        </Card>
                     </div>
                  </div>
               </Tabs>
            </div>
         </main>
      )}

      {!authLoading && <Footer />}
    </div>
  )
}
