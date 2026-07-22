
"use client"

import { useMemo, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import { useCollection, useFirestore, useUser, useDoc } from "@/firebase"
import { collection, query, orderBy, doc, where } from "firebase/firestore"
import { 
  Landmark, 
  ChevronRight, 
  Zap, 
  Search, 
  Star, 
  ShieldCheck, 
  Layers, 
  GraduationCap,
  Mic,
  Filter,
  Users,
  ArrowRight,
  Sparkles,
  X
} from "lucide-react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"
import { AuthorityLogo } from "@/lib/exam-icons"
import { motion, AnimatePresence } from "framer-motion"
import { useToast } from "@/hooks/use-toast"
import ExamCard from "@/components/exams/ExamCard"

/**
 * @fileOverview Premium Enterprise Exam Dashboard Hub v8.1.
 * FIXED: Removed truncate and uppercase for full text visibility.
 */

const AUTHORIZED_CATEGORY_IDS = [
  "punjab-government-exams",
  "punjab-teaching-exams",
  "punjab-technical-exams",
  "banking-exams",
  "judiciary-exams",
  "central-government-exams"
];

const POPULAR_CHIPS = [
  { label: "Patwari", icon: "⭐" },
  { label: "Clerk", icon: "🏛" },
  { label: "Punjab Police", icon: "🚔" },
  { label: "PSPCL", icon: "⚡" },
  { label: "ETT", icon: "📘" }
];

export default function ExamsEntryPage() {
  const db = useFirestore();
  const { user, profile, loading: authLoading } = useUser();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [isListening, setIsListening] = useState(false);

  // DATA FETCHING
  const statsRef = useMemo(() => (db ? doc(db, "settings", "stats") : null), [db]);
  const { data: platformStats } = useDoc<any>(statsRef);

  const categoriesQuery = useMemo(() => (db ? query(collection(db, "categories"), orderBy("displayOrder", "asc")) : null), [db]);
  const examsQuery = useMemo(() => (db ? collection(db, "exams") : null), [db]);
  const mocksQuery = useMemo(() => (db ? query(collection(db, "mocks"), where("published", "==", true)) : null), [db]);
  const pyqsQuery = useMemo(() => (db ? collection(db, "pyqs") : null), [db]);
  const notesQuery = useMemo(() => (db ? collection(db, "notes") : null), [db]);
  const resultsQuery = useMemo(() => (db && user ? query(collection(db, "results"), where("userId", "==", user.uid)) : null), [db, user]);

  const { data: rawCategories, loading: catLoading } = useCollection<any>(categoriesQuery);
  const { data: exams, loading: examsLoading } = useCollection<any>(examsQuery);
  const { data: mocks } = useCollection<any>(mocksQuery);
  const { data: pyqs } = useCollection<any>(pyqsQuery);
  const { data: notes } = useCollection<any>(notesQuery);
  const { data: results } = useCollection<any>(resultsQuery);

  const categories = useMemo(() => {
    if (!rawCategories) return [];
    return rawCategories.filter((c: any) => AUTHORIZED_CATEGORY_IDS.includes(c.id));
  }, [rawCategories]);

  const featuredExams = useMemo(() => {
    if (!exams) return [];
    return exams.filter((e: any) => e.isTrending).slice(0, 12);
  }, [exams]);

  const filteredExams = useMemo(() => {
    if (!searchTerm.trim() || !exams) return [];
    const term = searchTerm.toLowerCase().trim();
    return exams.filter((e: any) => 
      e.name?.toLowerCase().includes(term) || 
      e.boardId?.toLowerCase().includes(term)
    ).slice(0, 8);
  }, [exams, searchTerm]);

  const startListening = () => {
    if (typeof window === 'undefined') return;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitRecognition;
    if (!SpeechRecognition) {
      toast({ variant: "destructive", title: "Voice Search Locked", description: "Unsupported in this browser." });
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-IN';
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (e: any) => setSearchTerm(e.results[0][0].transcript);
    recognition.start();
  };

  if (authLoading) return <div className="h-screen w-full flex items-center justify-center bg-white"><Zap className="h-10 w-10 text-primary animate-pulse" /></div>;

  return (
    <div className="flex flex-col min-h-screen bg-[#F8FAFC] font-body text-left overflow-x-hidden w-full">
      <Navbar />
      
      <main className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-16 space-y-12 md:space-y-20">
        
        {/* ENTERPRISE HERO HUB */}
        <section className="relative px-1 overflow-hidden">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-12 text-center md:text-left"
          >
            <div className="space-y-6 max-w-4xl">
              <div className="flex items-center justify-center md:justify-start gap-3">
                 <Badge className="bg-primary/10 text-primary border-none px-4 py-1.5 rounded-full font-bold text-[10px] md:text-xs tracking-tight flex items-center gap-2">
                   <Landmark className="h-3.5 w-3.5" /> Institutional Registry
                 </Badge>
              </div>
              <h1 className="text-[32px] sm:text-6xl lg:text-[80px] font-[900] tracking-tighter leading-[1] text-[#0F172A] antialiased">
                Target Your <br className="hidden md:block"/>
                <span className="text-primary italic">Recruitment.</span>
              </h1>
              <p className="text-slate-500 font-medium text-sm md:text-xl max-w-2xl leading-relaxed tracking-tight">
                Access verified preparation verticals for PSSSB, PPSC, Punjab Police and Central exams. Every test series is audited by institutional mentors.
              </p>
            </div>

            <div className="relative w-full max-w-4xl group">
              <div className="absolute -inset-1 bg-gradient-to-r from-primary to-blue-400 rounded-[28px] blur opacity-5 group-focus-within:opacity-15 transition duration-1000"></div>
              <div className="relative min-h-[64px] md:min-h-[76px] bg-white border border-slate-200 rounded-[24px] shadow-2xl flex items-center px-4 md:px-8 gap-4">
                <Search className="h-6 w-6 text-slate-300 shrink-0" />
                <input 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search 12,000+ items across all verticals..."
                  className="flex-1 min-w-0 bg-transparent border-none outline-none font-[700] text-slate-700 placeholder:text-slate-200 text-sm md:text-2xl"
                />
                <div className="flex items-center gap-2 shrink-0 border-l border-slate-100 pl-4">
                  {searchTerm && (
                    <button onClick={() => setSearchTerm('')} className="p-2 hover:bg-slate-100 rounded-full transition-all">
                      <X className="h-4 w-4 text-slate-400" />
                    </button>
                  )}
                  <button 
                    onClick={startListening}
                    className={cn(
                      "h-10 w-10 md:h-12 md:w-12 rounded-xl flex items-center justify-center transition-all",
                      isListening ? "bg-rose-500 text-white animate-pulse" : "text-slate-400 hover:text-primary"
                    )}
                  >
                    <Mic className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <AnimatePresence>
                {searchTerm.length >= 2 && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute top-full left-0 right-0 mt-3 bg-white rounded-[24px] shadow-5xl border border-slate-100 z-50 overflow-hidden"
                  >
                    <div className="divide-y divide-slate-50">
                      {filteredExams.map((e: any) => (
                        <Link key={e.id} href={`/exams/view?id=${e.id}`} className="flex items-center justify-between p-4 md:p-6 hover:bg-slate-50 transition-all group">
                          <div className="flex items-center gap-4 min-w-0 text-left">
                            <AuthorityLogo boardId={e.boardId} size="sm" className="h-12 w-12 shrink-0" />
                            <div className="min-w-0">
                              <span className="font-bold text-[#0F172A] text-sm md:text-lg block truncate">{e.name}</span>
                              <span className="text-[10px] font-bold text-slate-400 tracking-widest">{e.boardId} hub</span>
                            </div>
                          </div>
                          <ChevronRight className="h-5 w-5 text-slate-300 group-hover:text-primary transition-all" />
                        </Link>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-1 px-1">
               {POPULAR_CHIPS.map((chip) => (
                  <button 
                    key={chip.label}
                    onClick={() => setSearchTerm(chip.label)}
                    className="h-11 px-7 rounded-full bg-white border border-slate-100 text-[#0F172A] font-bold text-[11px] tracking-tight shadow-sm hover:shadow-lg hover:border-primary/20 transition-all whitespace-nowrap active:scale-95 flex items-center gap-2.5"
                  >
                    <span className="text-sm">{chip.icon}</span> {chip.label}
                  </button>
               ))}
            </div>
          </motion.div>
        </section>

        {/* POPULAR VERTICALS GRID */}
        <section className="space-y-10 md:space-y-14 w-full text-left">
           <div className="flex items-center justify-between px-1 border-b border-slate-100 pb-8">
              <div className="flex items-center gap-4">
                 <div className="h-12 w-12 rounded-2xl bg-[#0F172A] flex items-center justify-center text-primary shadow-2xl">
                    <Star className="h-6 w-6 fill-current" />
                 </div>
                 <div className="text-left">
                    <h2 className="text-2xl md:text-3xl font-[900] text-[#0F172A] tracking-tighter">Popular Verticals</h2>
                    <p className="text-[10px] md:text-xs font-bold text-slate-400 tracking-widest mt-1">High-Aspirant Traffic Nodes</p>
                 </div>
              </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8 lg:gap-10">
              {examsLoading ? (
                 Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-[540px] w-full rounded-[2.5rem] md:rounded-[3rem] bg-white border border-slate-100" />)
              ) : featuredExams.map((exam: any) => (
                 <ExamCard 
                   key={exam.id} 
                   exam={exam} 
                   allMocks={mocks} 
                   userResults={results} 
                   allPyqs={pyqs} 
                   allNotes={notes} 
                 />
              ))}
           </div>
        </section>

        {/* OFFICIAL AUTHORITY HUBS */}
        <section className="space-y-10 md:space-y-14 w-full text-left pt-10">
           <div className="flex items-center justify-between px-1 border-b border-slate-100 pb-8">
              <div className="flex items-center gap-4">
                 <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                    <Landmark className="h-6 w-6" />
                 </div>
                 <div className="text-left">
                    <h2 className="text-2xl md:text-3xl font-[900] text-[#0F172A] tracking-tighter">Exam boards</h2>
                    <p className="text-[10px] md:text-xs font-bold text-slate-400 tracking-widest mt-1">Official Selection Authorities</p>
                 </div>
              </div>
           </div>
           
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-10 w-full">
              {catLoading ? (
                 Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-36 w-full rounded-[3rem] bg-white border border-slate-100" />)
              ) : categories.map((cat: any) => (
                 <motion.div 
                    key={cat.id}
                    whileHover={{ y: -6 }}
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                 >
                    <Link href={`/exams/category/${cat.id}`}>
                       <Card className="border border-slate-100 shadow-lg hover:shadow-4xl transition-all duration-500 rounded-[2.5rem] bg-white group overflow-hidden h-full flex flex-col p-6 md:p-8 relative text-left">
                          <div className="flex items-center gap-5 relative z-10">
                             <div className="h-16 w-16 md:h-20 md:w-20 bg-slate-50 rounded-2xl flex items-center justify-center shadow-inner shrink-0 group-hover:scale-110 transition-transform">
                                <AuthorityLogo category={cat} size="sm" className="p-0 shadow-none border-none bg-transparent" />
                             </div>
                             <div className="min-w-0 flex-1">
                                <h3 className="text-base md:text-lg font-[800] text-[#0F172A] leading-tight group-hover:text-primary transition-colors line-clamp-2">{cat.title}</h3>
                                <div className="mt-2 flex items-center justify-between">
                                   <Badge className="bg-emerald-50 text-emerald-600 border-none text-[8px] font-black tracking-widest px-2 py-0.5">Live now</Badge>
                                   <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-primary transition-all" />
                                </div>
                             </div>
                          </div>
                       </Card>
                    </Link>
                 </motion.div>
              ))}
           </div>
        </section>

      </main>
      <Footer />
    </div>
  )
}
