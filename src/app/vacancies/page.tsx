"use client"

import React, { useMemo, useState, useEffect } from "react"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import { useCollection, useFirestore, useUser } from "@/firebase"
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
  FileText,
  AlertCircle,
  TrendingUp,
  Landmark,
  ArrowRight,
  Target
} from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { AuthorityLogo } from "@/lib/exam-icons"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import { Vacancy } from "@/types"
import { useToast } from "@/hooks/use-toast"

/**
 * @fileOverview Official Punjab Vacancy Registry v1.1.
 * FIXED: Removed server-side orderBy to bypass composite index requirement.
 */

const CATEGORY_CHIPS = [
  { label: "All Hubs", id: "all" },
  { label: "PSSSB", id: "PSSSB" },
  { label: "PPSC", id: "PPSC" },
  { label: "Punjab Police", id: "Punjab Police" },
  { label: "Teaching", id: "Education Board" },
  { label: "Technical", id: "National Hub" }
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
  }, [])

  const vacancyQuery = useMemo(() => {
    if (!db) return null
    // Simple query to avoid composite index requirements
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
    if (!user) { toast({ title: "Login Required", description: "Identity sync needed to save nodes." }); return; }
    
    const isSaved = profile?.savedVacancies?.includes(id)
    const userRef = doc(db!, "users", user.uid)
    
    try {
      if (isSaved) {
        await updateDoc(userRef, { savedVacancies: arrayRemove(id), updatedAt: serverTimestamp() })
        toast({ title: "Removed from Registry" })
      } else {
        await updateDoc(userRef, { savedVacancies: arrayUnion(id), updatedAt: serverTimestamp() })
        toast({ title: "Node Synchronized", description: "Added to your personal vault." })
      }
    } catch (e) {
      toast({ variant: "destructive", title: "Sync failed" })
    }
  }

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-body text-left selection:bg-primary/10">
      <Navbar />
      
      <main className="container mx-auto px-4 md:px-8 py-10 md:py-20 max-w-[1440px] space-y-12 md:space-y-24 pb-40">
         
         <section className="text-left space-y-10 md:space-y-16 max-w-5xl">
            <div className="space-y-6 md:space-y-10">
               <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-4">
                  <div className="h-10 w-10 md:h-12 md:w-12 bg-primary/10 rounded-xl md:rounded-2xl flex items-center justify-center text-primary shadow-inner shrink-0">
                    <Megaphone className="h-5 w-5 md:h-6 md:w-6" />
                  </div>
                  <Badge className="bg-primary/10 text-primary border-none px-4 py-1.5 rounded-full font-black text-[10px] md:text-xs tracking-widest uppercase">Official Recruitment Hub</Badge>
               </motion.div>
               <h1 className="text-4xl sm:text-6xl md:text-8xl lg:text-9xl font-black text-[#0F172A] tracking-tighter leading-[0.9] break-words antialiased">
                  Latest <br/> <span className="text-primary italic">Vacancies.</span>
               </h1>
               <p className="text-slate-500 font-medium text-sm md:text-2xl max-w-2xl leading-tight tracking-tight">
                  Discover verified Punjab Government job notifications, official PDFs, and direct apply nodes in real-time.
               </p>
            </div>

            <div className="relative max-w-3xl group">
               <div className="absolute -inset-1 bg-gradient-to-r from-primary to-blue-400 rounded-2xl blur opacity-5 group-focus-within:opacity-20 transition duration-1000"></div>
               <div className="relative">
                  <Search className={cn("absolute left-6 top-1/2 -translate-y-1/2 h-6 w-6 transition-colors", searchTerm ? "text-primary" : "text-slate-400")} />
                  <Input 
                    className="h-16 md:h-20 pl-16 pr-14 rounded-2xl md:rounded-[2rem] bg-white border-none shadow-2xl text-lg md:text-xl font-bold text-[#0F172A]" 
                    placeholder="Search by department or position..." 
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                  />
                  {searchTerm && (
                    <button onClick={() => setSearchTerm('')} className="absolute right-6 top-1/2 -translate-y-1/2 p-2 hover:bg-slate-50 rounded-full transition-all">
                       <X className="h-6 w-6 text-slate-300" />
                    </button>
                  )}
               </div>
            </div>

            <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-2">
               {CATEGORY_CHIPS.map(chip => (
                  <button 
                    key={chip.id} 
                    onClick={() => setActiveBoard(chip.id)}
                    className={cn(
                      "h-11 px-8 rounded-full font-black text-[10px] uppercase tracking-widest whitespace-nowrap transition-all border shadow-sm",
                      activeBoard === chip.id ? "bg-[#0F172A] border-[#0F172A] text-white shadow-xl" : "bg-white border-slate-100 text-slate-400 hover:border-slate-300"
                    )}
                  >
                     {chip.label}
                  </button>
               ))}
            </div>
         </section>

         <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 md:gap-20">
            <div className="lg:col-span-8 space-y-8 md:space-y-12">
               {loading ? (
                  Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-64 w-full rounded-[3rem] bg-white" />)
               ) : filteredVacancies.length > 0 ? (
                  <div className="grid grid-cols-1 gap-8 md:gap-12">
                     {filteredVacancies.map((v, i) => (
                        <motion.div key={v.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                           <Link href={`/vacancies/${v.id}`}>
                              <Card className="border border-slate-100 shadow-xl hover:shadow-4xl transition-all duration-500 rounded-[2.5rem] md:rounded-[3.5rem] bg-white group overflow-hidden flex flex-col md:flex-row text-left">
                                 <div className="p-8 md:p-12 flex-1 space-y-8">
                                    <div className="flex justify-between items-start">
                                       <div className="flex items-center gap-6">
                                          <AuthorityLogo boardId={v.board} size="md" className="h-16 w-16 md:h-20 md:w-20 shadow-2xl bg-slate-50 border-4 border-white" />
                                          <div className="space-y-1.5">
                                             <Badge className="bg-primary/5 text-primary border-none text-[8px] md:text-[10px] font-black uppercase tracking-widest px-3 py-0.5 rounded-lg">{v.department} Hub</Badge>
                                             <h3 className="text-xl md:text-3xl font-black text-[#0F172A] group-hover:text-primary transition-colors tracking-tight leading-tight uppercase">{v.title}</h3>
                                          </div>
                                       </div>
                                       <button onClick={(e) => handleToggleBookmark(e, v.id)} className={cn("h-12 w-12 rounded-2xl border flex items-center justify-center transition-all shadow-sm shrink-0 active:scale-90", profile?.savedVacancies?.includes(v.id) ? "bg-primary border-primary text-white" : "bg-white border-slate-100 text-slate-300 hover:text-primary")}>
                                          <Bookmark className={cn("h-6 w-6", profile?.savedVacancies?.includes(v.id) && "fill-current")} />
                                       </button>
                                    </div>

                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-6 border-t border-slate-50">
                                       <SummaryNode icon={Zap} label="Posts" val={v.totalPosts} />
                                       <SummaryNode icon={GraduationCap} label="Eligibility" val={v.education?.split(',')[0]} />
                                       <SummaryNode icon={DollarSign} label="Salary Hub" val={v.salary?.split(' ')[0]} />
                                       <SummaryNode icon={Clock} label="Last Date" val={new Date(v.lastDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })} color="text-rose-500" />
                                    </div>

                                    <div className="pt-4 flex flex-col sm:flex-row items-center gap-4">
                                       <Button className="w-full sm:w-auto h-14 md:h-16 px-10 bg-[#0F172A] hover:bg-black text-white font-black uppercase text-[10px] md:text-xs tracking-widest rounded-2xl shadow-xl gap-3 border-none active:scale-95 transition-all">
                                          Deep Audit Details <ChevronRight className="h-5 w-5" />
                                       </Button>
                                       {v.notificationPdfUrl && (
                                          <Button variant="ghost" className="w-full sm:w-auto h-14 text-primary font-black uppercase text-[10px] tracking-widest gap-2 hover:bg-primary/5 transition-all" asChild onClick={e => e.stopPropagation()}>
                                             <a href={v.notificationPdfUrl} target="_blank" rel="noopener noreferrer"><FileText className="h-5 w-5" /> Official PDF</a>
                                          </Button>
                                       )}
                                    </div>
                                 </div>
                              </Card>
                           </Link>
                        </motion.div>
                     ))}
                  </div>
               ) : (
                  <div className="py-40 text-center opacity-30 italic font-black uppercase text-xl md:text-3xl tracking-tighter flex flex-col items-center gap-8">
                     <AlertCircle className="h-16 w-16 md:h-24 md:w-24 text-slate-300" />
                     Registry Standby
                  </div>
               )}
            </div>

            <div className="lg:col-span-4 space-y-12 md:space-y-16">
               <Card className="border-none shadow-5xl rounded-[2.5rem] bg-[#0F172A] text-white p-8 md:p-12 space-y-10 relative overflow-hidden group border border-white/5">
                  <div className="absolute top-0 right-0 p-12 opacity-5 rotate-12 group-hover:scale-110 transition-transform duration-1000"><TrendingUp className="h-64 w-64 text-primary" /></div>
                  <div className="relative z-10 space-y-10 text-left">
                     <div className="space-y-2">
                        <h3 className="text-3xl font-black tracking-tight leading-none uppercase">Analytics</h3>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Network Demand Index</p>
                     </div>
                     <div className="space-y-10">
                        <MetricNode label="Active Vacancies" val={loading ? "..." : rawVacancies?.length} icon={<Megaphone className="text-primary" />} />
                        <MetricNode label="Daily Aspirants" val="12.4K" icon={<Target className="text-emerald-500" />} />
                        <MetricNode label="Verified Boards" val="12" icon={<ShieldCheck className="text-blue-500" />} />
                     </div>
                     <div className="pt-10 border-t border-white/5">
                        <Button asChild variant="ghost" className="w-full text-slate-400 hover:text-white group font-black uppercase text-[10px] tracking-widest gap-2">
                           <Link href="/leaderboard">Full Merit Index <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-all" /></Link>
                        </Button>
                     </div>
                  </div>
               </Card>

               <div className="p-10 bg-white rounded-[3rem] border border-slate-100 shadow-xl space-y-8 text-left group hover:translate-y-[-6px] transition-all duration-500">
                  <div className="flex items-center gap-4">
                     <ShieldCheck className="h-8 w-8 text-emerald-500" />
                     <h4 className="text-[11px] font-black uppercase tracking-0.3em text-[#0F172A]">Security Protocol</h4>
                  </div>
                  <p className="text-xs md:text-sm text-slate-500 leading-relaxed font-medium">All recruitment notifications are verified against official gazettes before being synchronized with the master registry. Instant push alerts for Last Date reminders are active for Elite Pass holders.</p>
               </div>
            </div>
         </div>

      </main>
      <Footer />
    </div>
  )
}

function SummaryNode({ icon: Icon, label, val, color = "text-[#0F172A]" }: any) {
   return (
      <div className="space-y-1.5 min-w-0">
         <div className="flex items-center gap-2 text-[8px] md:text-[9px] font-black uppercase text-slate-400 tracking-widest">
            <Icon className="h-3 w-3 text-primary" /> {label}
         </div>
         <p className={cn("text-xs md:text-base font-bold truncate leading-none", color)}>{val || 'N/A'}</p>
      </div>
   )
}

function MetricNode({ label, val, icon }: any) {
   return (
      <div className="flex items-center justify-between group">
         <div className="flex items-center gap-5">
            <div className="h-11 w-11 rounded-xl bg-white/5 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
               {icon}
            </div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest leading-tight">{label}</span>
         </div>
         <span className="text-2xl md:text-3xl font-black tabular-nums tracking-tighter text-white">{val}</span>
      </div>
   )
}
