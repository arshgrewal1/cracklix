"use client"

import { useState, useMemo, useEffect } from "react"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import { useCollection, useFirestore, useUser } from "@/firebase"
import { collection, query, where, doc, updateDoc, arrayUnion, arrayRemove, serverTimestamp } from "firebase/firestore"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Search, 
  Zap, 
  ChevronRight,
  Loader2, 
  Calendar,
  Download,
  Medal,
  X,
  Filter,
  Bookmark,
  Share2,
  Clock,
  Newspaper,
  BookOpen,
  FileText,
  History,
  TrendingUp,
  Target,
  ArrowRight,
  ShieldCheck
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { AuthorityLogo } from "@/lib/exam-icons"
import { useActiveSession } from "@/hooks/useStudyAnalytics"
import { motion, AnimatePresence } from "framer-motion"
import { useToast } from "@/hooks/use-toast"

/**
 * @fileOverview Premium Current Affairs Hub v5.5.
 * FIXED: ReferenceError for Link and ArrowRight/ShieldCheck imports.
 * UPDATED: Removed uppercase from headings.
 */

const CATEGORIES = [
  "All", "Punjab", "National", "International", "Economy", "Polity", "Science", "Technology", "Sports", "Awards", "Schemes"
];

const QUICK_ACTIONS = [
  { label: "Daily quiz", icon: Zap, href: "/mocks", color: "text-orange-500", bg: "bg-orange-50" },
  { label: "PDF notes", icon: FileText, href: "/notes", color: "text-blue-500", bg: "bg-blue-50" },
  { label: "Old papers", icon: History, href: "/pyqs", color: "text-purple-500", bg: "bg-purple-50" },
  { label: "Bookmarks", icon: Bookmark, href: "/bookmarks", color: "text-rose-500", bg: "bg-rose-50" },
];

export default function CurrentAffairsCenter() {
  const db = useFirestore()
  const { user, profile, loading: authLoading } = useUser()
  const router = useRouter()
  const { toast } = useToast()
  
  const [activeType, setActiveType] = useState<"DAILY" | "WEEKLY" | "MONTHLY">("DAILY")
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  
  const { startSession } = useActiveSession('CA')

  useEffect(() => {
    if (!authLoading && !user) {
      router.push(`/login?returnUrl=${encodeURIComponent('/current-affairs')}`);
    } else if (user) {
      startSession();
    }
  }, [user, authLoading, router, startSession]);

  const hubQuery = useMemo(() => (db ? query(collection(db, "current_affairs_hub"), where("status", "==", "PUBLISHED")) : null), [db])
  const { data: hubItems, loading } = useCollection<any>(hubQuery)

  const stats = useMemo(() => {
    if (!hubItems) return { today: 0, weekly: 0, monthly: 0, saved: profile?.savedCA?.length || 0 };
    return {
      today: hubItems.filter(i => i.type === 'DAILY').length,
      weekly: hubItems.filter(i => i.type === 'WEEKLY').length,
      monthly: hubItems.filter(i => i.type === 'MONTHLY').length,
      saved: profile?.savedCA?.length || 0
    };
  }, [hubItems, profile]);

  const filteredItems = useMemo(() => {
    if (!hubItems) return []
    const term = searchTerm.toLowerCase().trim();
    return hubItems
      .filter(item => {
        const matchesSearch = !term || item.title?.toLowerCase().includes(term);
        const matchesType = item.type === activeType;
        const matchesCat = selectedCategory === 'All' || item.title?.toLowerCase().includes(selectedCategory.toLowerCase());
        return matchesSearch && matchesType && matchesCat;
      })
      .sort((a, b) => {
        const tA = a.updatedAt?.seconds || 0;
        const tB = b.updatedAt?.seconds || 0;
        return tB - tA;
      })
  }, [hubItems, activeType, searchTerm, selectedCategory])

  const handleToggleBookmark = async (e: React.MouseEvent, id: string) => {
    e.preventDefault(); e.stopPropagation();
    if (!user || !db) return;
    const isSaved = profile?.savedCA?.includes(id);
    const userRef = doc(db, "users", user.uid);
    try {
      if (isSaved) {
        await updateDoc(userRef, { savedCA: arrayRemove(id), updatedAt: serverTimestamp() });
        toast({ title: "Removed from bookmarks" });
      } else {
        await updateDoc(userRef, { savedCA: arrayUnion(id), updatedAt: serverTimestamp() });
        toast({ title: "News bookmarked" });
      }
    } catch (e) { console.error(e); }
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#F8FAFC] font-body text-left">
      <Navbar />
      
      <main className="flex-1 w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-24 md:py-12 space-y-8 md:space-y-12">
        
        <section className="space-y-6 px-1 text-center md:text-left">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-1.5">
              <h1 className="text-2xl md:text-4xl lg:text-5xl font-black text-[#0F172A] tracking-tight">Current Affairs</h1>
              <p className="text-slate-500 font-medium text-sm md:text-lg max-w-xl leading-snug">
                Verified exam news, daily current affairs and bilingual preparation items.
              </p>
            </div>
            
            <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-1">
               <StatChip label="Today" val={stats.today} icon={<Zap className="h-3 w-3 text-orange-500" />} />
               <StatChip label="Weekly" val={stats.weekly} icon={<Calendar className="h-3 w-3 text-blue-500" />} />
               <StatChip label="Monthly" val={stats.monthly} icon={<BookOpen className="h-3 w-3 text-emerald-500" />} />
               <StatChip label="Saved" val={stats.saved} icon={<Bookmark className="h-3 w-3 text-rose-500" />} />
            </div>
          </div>
        </section>

        <div className="sticky top-[80px] z-40 bg-[#F8FAFC]/95 backdrop-blur-md -mx-4 px-4 py-4 border-b border-slate-100">
           <div className="max-w-5xl mx-auto space-y-6">
              <div className="flex flex-col md:flex-row items-center gap-4">
                 <div className="relative group flex-1 w-full">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 group-focus-within:text-primary transition-colors" />
                    <Input 
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                      placeholder="Search current affairs..." 
                      className="h-14 rounded-2xl bg-white border-slate-200 shadow-sm text-base font-bold pl-14 pr-12 focus-visible:ring-4 focus-visible:ring-primary/5"
                    />
                    <button className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-slate-300 hover:text-primary transition-all">
                       <Filter className="h-5 w-5" />
                    </button>
                 </div>

                 <div className="bg-slate-100 p-1 rounded-2xl flex items-center h-14 w-full md:w-auto shrink-0">
                    <SegmentButton active={activeType === 'DAILY'} onClick={() => setActiveType('DAILY')} label="Daily" />
                    <SegmentButton active={activeType === 'WEEKLY'} onClick={() => setActiveType('WEEKLY')} label="Weekly" />
                    <SegmentButton active={activeType === 'MONTHLY'} onClick={() => setActiveType('MONTHLY')} label="Monthly" />
                 </div>
              </div>

              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
                 {CATEGORIES.map(cat => (
                    <button 
                      key={cat} 
                      onClick={() => setSelectedCategory(cat)}
                      className={cn(
                        "h-9 px-6 rounded-full font-bold text-[10px] md:text-xs uppercase tracking-tight whitespace-nowrap transition-all border active:scale-95",
                        selectedCategory === cat 
                          ? "bg-primary border-primary text-white shadow-lg shadow-primary/20" 
                          : "bg-white border-slate-100 text-slate-400 hover:border-slate-300"
                      )}
                    >
                       {cat}
                    </button>
                 ))}
              </div>
           </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12">
           
           <div className="lg:col-span-8 space-y-6 md:space-y-8">
              {loading ? (
                 Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-36 w-full rounded-2xl bg-white" />)
              ) : filteredItems.length > 0 ? (
                 <div className="grid grid-cols-1 gap-4 md:gap-6">
                    {filteredItems.map((item, idx) => (
                       <motion.div
                         key={item.id}
                         initial={{ opacity: 0, y: 10 }}
                         animate={{ opacity: 1, y: 0 }}
                         transition={{ delay: idx * 0.05 }}
                       >
                          <Card className="border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 rounded-[18px] md:rounded-[22px] bg-white group overflow-hidden">
                             <CardContent className="p-4 md:p-6 flex flex-col md:flex-row gap-4 md:gap-8 items-center">
                                <div className="hidden md:flex h-20 w-20 rounded-2xl bg-slate-50 items-center justify-center shrink-0 shadow-inner group-hover:scale-105 transition-transform">
                                   <AuthorityLogo boardId="current-affairs" size="sm" className="p-0 shadow-none bg-transparent" />
                                </div>
                                
                                <div className="flex-1 space-y-2 w-full text-left">
                                   <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-2">
                                         <Badge className="bg-blue-50 text-primary border-none text-[8px] font-black uppercase px-2 py-0.5 rounded shadow-sm">
                                            {item.type} hub
                                         </Badge>
                                         <span className="text-[9px] font-bold text-slate-300 tabular-nums uppercase">{item.month} {item.year}</span>
                                      </div>
                                      <div className="flex items-center gap-1">
                                         <button onClick={(e) => handleToggleBookmark(e, item.id)} className={cn("p-1.5 rounded-lg transition-colors", profile?.savedCA?.includes(item.id) ? "text-primary" : "text-slate-300 hover:text-primary")}>
                                            <Bookmark className={cn("h-4 w-4", profile?.savedCA?.includes(item.id) && "fill-current")} />
                                         </button>
                                         <button className="p-1.5 text-slate-300 hover:text-primary transition-colors">
                                            <Share2 className="h-4 w-4" />
                                         </button>
                                      </div>
                                   </div>

                                   <h3 className="text-base md:text-lg font-bold text-[#0F172A] group-hover:text-primary transition-colors line-clamp-1">{item.title}</h3>
                                   <p className="text-[12px] md:text-sm text-slate-400 font-medium line-clamp-2 leading-relaxed">
                                      Stay updated with verified {item.type.toLowerCase()} current affairs items for upcoming Punjab government exams and recruitments.
                                   </p>

                                   <div className="flex items-center justify-between pt-2">
                                      <div className="flex items-center gap-3 text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                                         <span className="flex items-center gap-1.5"><Clock className="h-3 w-3" /> 2m read</span>
                                         <span className="w-1 h-1 rounded-full bg-slate-200" />
                                         <span>{item.language || "Bilingual"}</span>
                                      </div>
                                      <button 
                                        onClick={() => item.quizId ? router.push(`/mocks/instructions?id=${item.quizId}`) : item.pdfUrl ? window.open(item.pdfUrl, '_blank') : null}
                                        className="text-primary font-black text-[10px] md:text-[11px] uppercase tracking-widest flex items-center gap-1 hover:gap-2 transition-all"
                                      >
                                         {item.quizId ? 'Attempt' : 'Read more'} <ChevronRight className="h-3.5 w-3.5" />
                                      </button>
                                   </div>
                                </div>
                             </CardContent>
                          </Card>
                       </motion.div>
                    ))}
                 </div>
              ) : (
                 <div className="py-24 text-center bg-white rounded-[2rem] border-2 border-dashed border-slate-100 flex flex-col items-center gap-6 opacity-30">
                    <Newspaper className="h-16 w-16 text-slate-300" />
                    <p className="text-xl font-bold uppercase tracking-widest text-slate-400">Archives empty</p>
                 </div>
              )}
           </div>

           <div className="lg:col-span-4 space-y-8">
              <section className="space-y-4">
                 <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] ml-2 text-left">Quick actions</h3>
                 <div className="grid grid-cols-2 gap-3">
                    {QUICK_ACTIONS.map(action => (
                       <Link key={action.label} href={action.href}>
                          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg transition-all group flex flex-col items-start gap-3">
                             <div className={cn("h-9 w-9 rounded-xl flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform", action.bg, action.color)}>
                                <action.icon className="h-4.5 w-4.5" />
                             </div>
                             <span className="text-[11px] font-bold text-[#0F172A] uppercase">{action.label}</span>
                          </div>
                       </Link>
                    ))}
                 </div>
              </section>

              <Card className="border-none shadow-xl rounded-[2rem] bg-[#0F172A] text-white p-6 md:p-8 relative overflow-hidden group border border-white/5">
                 <div className="absolute top-0 right-0 p-6 opacity-10 rotate-12 group-hover:scale-110 transition-transform duration-1000"><TrendingUp className="h-48 w-48 text-primary" /></div>
                 <div className="relative z-10 space-y-6 text-left">
                    <div className="space-y-1">
                       <h3 className="text-xl font-black tracking-tight">Performance</h3>
                       <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Mastery index</p>
                    </div>
                    <div className="space-y-6">
                       <MetricNode label="Quiz score" val="82%" icon={<Target className="text-emerald-500" />} />
                       <MetricNode label="Weekly streak" val="12 days" icon={<Zap className="text-orange-500" />} />
                    </div>
                    <div className="pt-4 border-t border-white/5">
                       <Button asChild variant="ghost" className="w-full text-primary hover:text-white hover:bg-white/5 font-black uppercase text-[10px] tracking-widest gap-2">
                          <Link href="/leaderboard">View rankings <ArrowRight className="h-3.5 w-3.5" /></Link>
                       </Button>
                    </div>
                 </div>
              </Card>

              <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-md space-y-4 text-left group hover:translate-y-[-4px] transition-all duration-300">
                 <div className="flex items-center gap-3">
                    <ShieldCheck className="h-5 w-5 text-emerald-500" />
                    <h4 className="text-[11px] font-black uppercase text-[#0F172A]">Security protocol</h4>
                 </div>
                 <p className="text-[11px] text-slate-500 font-medium leading-relaxed tracking-tight">
                    All current affairs items are verified against official gazettes before registry sync. 100% accuracy guaranteed.
                 </p>
              </div>
           </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

function StatChip({ label, val, icon }: any) {
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-xl border border-slate-100 shadow-sm shrink-0">
       {icon}
       <span className="text-[11px] font-bold text-[#0F172A] tabular-nums leading-none">{val}</span>
       <span className="text-[8px] font-black text-slate-400 uppercase tracking-tight">{label}</span>
    </div>
  )
}

function SegmentButton({ active, onClick, label }: any) {
   return (
      <button 
        onClick={onClick}
        className={cn(
          "flex-1 h-full rounded-xl px-6 font-black uppercase text-[10px] tracking-widest transition-all",
          active ? "bg-white text-primary shadow-md" : "text-slate-400 hover:text-slate-600"
        )}
      >
         {label}
      </button>
   )
}

function MetricNode({ label, val, icon }: any) {
   return (
      <div className="flex items-center justify-between group">
         <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
               {icon}
            </div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-tight">{label}</span>
         </div>
         <span className="text-2xl md:text-3xl font-black tabular-nums tracking-tighter text-white">{val}</span>
      </div>
   )
}