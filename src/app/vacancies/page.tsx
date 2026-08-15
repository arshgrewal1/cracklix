"use client"

import React, { useMemo, useState, useEffect } from "react"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import { useCollection, useFirestore, useUser, useDoc } from "@/firebase"
import { collection, query, where, limit, doc, updateDoc, arrayUnion, arrayRemove, serverTimestamp } from "firebase/firestore"
import { 
  Megaphone, 
  Search, 
  ChevronRight, 
  Zap, 
  Clock, 
  GraduationCap, 
  DollarSign, 
  ShieldCheck, 
  Bookmark, 
  X,
  AlertCircle,
  TrendingUp,
  Landmark,
  ArrowRight,
  Target,
  Users,
  MapPin,
  Sparkles
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { AuthorityLogo } from "@/lib/exam-icons"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"
import { Vacancy } from "@/types"
import { useToast } from "@/hooks/use-toast"

/**
 * @fileOverview Official Punjab Vacancy Registry v3.4.
 * FIXED: Removed truncate from department field and added scroll-to-top logic.
 */

const CATEGORY_CHIPS = [
  { label: "All hubs", id: "all" },
  { label: "PSSSB", id: "PSSSB" },
  { label: "PPSC", id: "PPSC" },
  { label: "Police", id: "Punjab Police" },
  { label: "Teaching", id: "Education Board" },
  { label: "National", id: "National Hub" }
];

export default function VacanciesPortal() {
  const db = useFirestore()
  const { user, profile } = useUser()
  const { toast } = useToast()
  
  const [searchTerm, setSearchTerm] = useState("")
  const [activeBoard, setActiveBoard] = useState("all")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    if (typeof window !== 'undefined') {
       window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    }
  }, [])

  const statsRef = useMemo(() => (db ? doc(db, "settings", "stats") : null), [db]);
  const { data: stats } = useDoc<any>(statsRef);

  const vacancyQuery = useMemo(() => {
    if (!db) return null
    return query(collection(db, "vacancies"), where("status", "==", "PUBLISHED"), limit(100))
  }, [db])

  const { data: rawVacancies, loading } = useCollection<Vacancy>(vacancyQuery as any)

  const filteredVacancies = useMemo(() => {
    if (!rawVacancies) return []
    return rawVacancies
      .filter(v => {
        const matchesSearch = !searchTerm || v.title?.toLowerCase().includes(searchTerm.toLowerCase()) || v.department?.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesBoard = activeBoard === 'all' || v.board === activeBoard
        return matchesSearch && matchesBoard
      })
      .sort((a, b) => {
         const tA = a.publishedAt?.seconds || 0;
         const tB = b.publishedAt?.seconds || 0;
         return tB - tA;
      })
  }, [rawVacancies, searchTerm, activeBoard])

  const handleToggleBookmark = async (e: React.MouseEvent, id: string) => {
    e.preventDefault(); e.stopPropagation();
    if (!user) { toast({ title: "Identity required", description: "Please login to save recruitment items." }); return; }
    
    const isSaved = profile?.savedVacancies?.includes(id)
    const userRef = doc(db!, "users", user.uid)
    
    try {
      if (isSaved) {
        await updateDoc(userRef, { savedVacancies: arrayRemove(id), updatedAt: serverTimestamp() })
        toast({ title: "Removed from vault" })
      } else {
        await updateDoc(userRef, { savedVacancies: arrayUnion(id), updatedAt: serverTimestamp() })
        toast({ title: "Record synchronized", description: "Successfully saved to your personal portal." })
      }
    } catch (e) {
      toast({ variant: "destructive", title: "Sync failed" })
    }
  }

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-white font-body text-left selection:bg-primary/10">
      <Navbar />
      
      <main className="container mx-auto px-4 md:px-8 py-8 md:py-20 max-w-[1440px] space-y-12 md:space-y-24 pb-40">
         
         <section className="text-center md:text-left space-y-10 md:space-y-16 max-w-5xl">
            <div className="space-y-6 md:space-y-10">
               <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row items-center gap-4">
                  <div className="h-10 w-10 md:h-12 md:w-12 rounded-2xl bg-primary/5 flex items-center justify-center text-primary shadow-inner shrink-0">
                    <Megaphone className="h-5 w-5 md:h-6 md:w-6" />
                  </div>
                  <Badge className="bg-primary/10 text-primary border-none px-5 py-2 rounded-full font-black text-[10px] md:text-xs tracking-widest shadow-sm">Official Job Registry</Badge>
               </motion.div>
               <h1 className="text-4xl sm:text-6xl md:text-8xl lg:text-[100px] font-black text-[#0F172A] tracking-tighter leading-[0.95] break-words antialiased">
                  Target Your <br/> <span className="text-primary italic">Recruitment.</span>
               </h1>
               <p className="text-slate-500 font-medium text-sm md:text-2xl max-w-2xl leading-tight tracking-tight">
                  Real-time verified recruitment notifications, official PDFs, and direct apply portals for all Punjab government boards.
               </p>
            </div>

            <div className="relative max-w-3xl group mx-auto md:mx-0">
               <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-blue-400/20 rounded-[28px] blur opacity-10 group-focus-within:opacity-25 transition duration-1000"></div>
               <div className="relative flex items-center">
                  <Search className={cn("absolute left-6 top-1/2 -translate-y-1/2 h-6 w-6 transition-colors duration-300", searchTerm ? "text-primary" : "text-slate-300")} />
                  <Input 
                    className="h-16 md:h-20 pl-16 pr-14 rounded-[24px] md:rounded-[28px] bg-white border-2 border-slate-50 shadow-2xl text-lg md:text-2xl font-black text-[#0F172A] placeholder:text-slate-200" 
                    placeholder="Search by position or authority..." 
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                  />
               </div>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-4 pt-4 px-1">
               {CATEGORY_CHIPS.map(chip => (
                  <button 
                    key={chip.id} 
                    onClick={() => setActiveBoard(chip.id)}
                    className={cn(
                      "h-11 px-8 rounded-full font-black uppercase text-[10px] tracking-widest whitespace-nowrap transition-all border shadow-sm active:scale-95",
                      activeBoard === chip.id ? "bg-[#0F172A] border-[#0F172A] text-white shadow-xl translate-y-[-2px]" : "bg-white border-slate-100 text-slate-400 hover:border-primary/20 hover:text-primary"
                    )}
                  >
                     {chip.label}
                  </button>
               ))}
            </div>
         </section>

         <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 md:gap-20">
            <div className="lg:col-span-8 space-y-8 md:space-y-12">
               <AnimatePresence mode="popLayout">
                  {loading ? (
                     <div className="space-y-8">
                        {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-64 w-full rounded-[3rem] bg-slate-50" />)}
                     </div>
                  ) : filteredVacancies.length > 0 ? (
                     <div className="grid grid-cols-1 gap-8 md:gap-12">
                        {filteredVacancies.map((v, i) => (
                           <motion.div key={v.id} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.5, delay: i * 0.05 }}>
                              <Link href={`/vacancies/${v.id}`}>
                                 <Card className="border border-slate-50 shadow-xl hover:shadow-[0_40px_100px_rgba(0,0,0,0.08)] transition-all duration-700 rounded-[3rem] md:rounded-[4rem] bg-white group overflow-hidden flex flex-col text-left relative">
                                    <div className="p-8 md:p-14 space-y-10">
                                       
                                       <div className="flex justify-between items-start gap-4">
                                          <div className="flex flex-wrap items-center gap-3">
                                             <Badge className="bg-primary text-white border-none px-5 py-2 rounded-full font-black text-[10px] uppercase shadow-lg tracking-tighter">{v.board} Hub</Badge>
                                             {v.isUrgent && <Badge className="bg-rose-500 text-white border-none px-5 py-2 rounded-full font-black text-[10px] uppercase shadow-lg tracking-widest animate-pulse">Urgent</Badge>}
                                             {v.isFeatured && <div className="h-10 w-10 bg-amber-50 rounded-xl flex items-center justify-center text-amber-500 shadow-inner"><Sparkles className="h-5 w-5 fill-current" /></div>}
                                          </div>
                                          <button 
                                             onClick={(e) => handleToggleBookmark(e, v.id)} 
                                             className={cn(
                                                "h-12 w-12 rounded-2xl border flex items-center justify-center transition-all active:scale-90 border-none bg-slate-50 shadow-inner shrink-0", 
                                                profile?.savedVacancies?.includes(v.id) ? "text-primary bg-primary/5" : "text-slate-300 hover:text-primary"
                                             )}
                                          >
                                             <Bookmark className={cn("h-6 w-6", profile?.savedVacancies?.includes(v.id) && "fill-current")} />
                                          </button>
                                       </div>

                                       <div className="flex flex-col md:flex-row items-center gap-8 md:gap-14">
                                          <div className="shrink-0 relative group-hover:scale-105 transition-transform duration-700">
                                             <AuthorityLogo boardId={v.board} size="md" className="h-20 w-20 md:h-32 md:w-32 shadow-2xl border-[6px] border-white bg-slate-50" />
                                          </div>
                                          <div className="min-w-0 flex-1 space-y-4">
                                             <h3 className="text-2xl md:text-5xl font-black text-[#0F172A] group-hover:text-primary transition-colors tracking-tight leading-tight uppercase break-words">
                                                {v.title}
                                             </h3>
                                             <div className="flex flex-wrap items-center gap-4 text-slate-400 font-bold text-[10px] md:text-sm uppercase tracking-widest">
                                                <span className="flex items-center gap-2"><Landmark className="h-4 w-4 text-primary" /> {v.department}</span>
                                                <div className="h-1.5 w-1.5 rounded-full bg-slate-200 hidden md:block" />
                                                <span className="flex items-center gap-2"><MapPin className="h-4 w-4 text-rose-400" /> {v.district}</span>
                                             </div>
                                          </div>
                                       </div>

                                       <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-10 border-t border-slate-50">
                                          <SummaryCard icon={Zap} label="Posts" val={v.totalPosts} />
                                          <SummaryCard icon={GraduationCap} label="Qualification" val={v.education?.split(',')[0]} />
                                          <SummaryCard icon={DollarSign} label="Pay matrix" val={v.salary?.split(' ')[0]} color="text-emerald-600" />
                                          <SummaryCard icon={Clock} label="Closing Date" val={new Date(v.lastDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })} color="text-rose-500" highlight />
                                       </div>

                                       <div className="pt-6">
                                          <Button className="w-full h-16 md:h-20 bg-[#0F172A] hover:bg-black text-white font-black uppercase text-[10px] md:text-xs tracking-[0.2em] rounded-2xl md:rounded-[3rem] shadow-4xl border-none transition-all active:scale-95 group/btn flex items-center justify-center gap-4">
                                             <span>Open Recruitment Portal</span>
                                             <ArrowRight className="h-5 w-5 opacity-40 group-hover/btn:translate-x-2 transition-transform" />
                                          </Button>
                                       </div>
                                    </div>
                                 </Card>
                              </Link>
                           </motion.div>
                        ))}
                     </div>
                  ) : (
                     <div className="py-40 text-center opacity-30 italic font-black text-2xl md:text-5xl tracking-tighter flex flex-col items-center gap-10">
                        <AlertCircle className="h-24 w-24 text-slate-200" />
                        Awaiting Ingestion Sync
                     </div>
                  )}
               </AnimatePresence>
            </div>

            <div className="lg:col-span-4 space-y-12">
               <Card className="border-none shadow-5xl rounded-[3rem] bg-[#0F172A] text-white p-10 md:p-14 space-y-12 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-14 opacity-5 rotate-12 group-hover:scale-110 transition-transform duration-1000"><TrendingUp className="h-80 w-80 text-primary" /></div>
                  <div className="relative z-10 space-y-12 text-left">
                     <div className="space-y-3">
                        <h3 className="text-4xl font-black tracking-tight leading-none uppercase">Analytics</h3>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Network Demand Index</p>
                     </div>
                     <div className="space-y-10">
                        <AnalysisNode label="Active Hubs" val={loading ? "..." : rawVacancies?.length} icon={<Megaphone className="text-primary" />} />
                        <AnalysisNode label="Total Candidates" val={stats?.totalUsers?.toLocaleString() || "..."} icon={<Users className="text-emerald-500" />} />
                        <AnalysisNode label="Verified Boards" val="12" icon={<ShieldCheck className="text-blue-500" />} />
                     </div>
                     <div className="pt-10 border-t border-white/5">
                        <Button asChild variant="ghost" className="w-full h-14 text-slate-400 hover:text-white group font-black uppercase text-[10px] tracking-widest gap-3">
                           <Link href="/leaderboard">Full Merit Index <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-all" /></Link>
                        </Button>
                     </div>
                  </div>
               </Card>

               <div className="p-10 md:p-14 bg-[#F8FAFC] rounded-[3.5rem] border border-slate-100 shadow-xl space-y-8 text-left group hover:translate-y-[-4px] transition-all duration-500 relative overflow-hidden">
                  <div className="absolute top-[-10%] right-[-10%] w-[120px] h-[120px] bg-primary/5 blur-3xl rounded-full" />
                  <div className="flex items-center gap-4 relative z-10">
                     <ShieldCheck className="h-10 w-10 text-emerald-500" />
                     <h4 className="text-xl font-black tracking-tight text-[#0F172A] uppercase">Registry Audit</h4>
                  </div>
                  <p className="text-sm md:text-lg text-slate-500 font-medium leading-relaxed relative z-10">
                     Every recruitment notification in our registry is verified against official government gazettes before being pushed to your feed. Elite members receive instant push alerts for upcoming closures.
                  </p>
               </div>
            </div>
         </div>

      </main>
      <Footer />
    </div>
  )
}

function SummaryCard({ icon: Icon, label, val, color = "text-[#0F172A]", highlight = false }: any) {
  return (
     <div className={cn("space-y-2 min-w-0 flex flex-col items-center md:items-start p-4 rounded-3xl transition-all", highlight && "bg-slate-50 shadow-inner")}>
        <div className="flex items-center gap-2 text-[9px] font-black uppercase text-slate-400 tracking-widest">
           <Icon className="h-3.5 w-3.5 text-primary opacity-50" /> {label}
        </div>
        <p className={cn("text-xs md:text-xl font-black truncate leading-none mt-1", color)}>{val || 'TBD'}</p>
     </div>
  )
}

function AnalysisNode({ label, val, icon }: any) {
  return (
     <div className="flex items-center justify-between group">
        <div className="flex items-center gap-5">
           <div className="h-12 w-12 rounded-2xl bg-white/5 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
              {icon}
           </div>
           <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest leading-none">{label}</span>
        </div>
        <span className="text-3xl md:text-4xl font-black tabular-nums tracking-tighter text-white">{val}</span>
     </div>
  )
}
