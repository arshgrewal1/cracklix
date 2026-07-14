"use client"

import { useMemo, useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import { useCollection, useFirestore, useUser } from "@/firebase"
import { collection, query, orderBy, doc, updateDoc, arrayUnion, arrayRemove, serverTimestamp } from "firebase/firestore"
import { 
  Landmark, 
  ChevronRight, 
  Zap, 
  BookOpen, 
  Search, 
  Star, 
  CheckCircle2, 
  RefreshCw, 
  Layers, 
  GraduationCap,
  Mic,
  Filter,
  Users,
  Timer,
  ShieldCheck,
  BarChart3,
  FileText,
  ArrowRight,
  Sparkles,
  X,
  AlertCircle
} from "lucide-react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"
import { AuthorityLogo } from "@/lib/exam-icons"
import { useToast } from "@/hooks/use-toast"
import { motion, AnimatePresence } from "framer-motion"
import Logo from "@/components/brand/Logo"

/**
 * @fileOverview Premium Exam Selection Hub v302.0 [Reference Redesign].
 * UPDATED: Re-engineered Featured Cards to match exactly with the provided image (Blue Title, Navy Pill Button).
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
  { label: "ETT", icon: "📘" },
  { label: "Master Cadre", icon: "🎓" },
  { label: "Excise Inspector", icon: "📑" },
  { label: "Senior Assistant", icon: "💼" },
];

export default function ExamsEntryPage() {
  const db = useFirestore();
  const router = useRouter();
  const pathname = usePathname();
  const { user, profile, loading: authLoading } = useUser();
  const { toast } = useToast();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [pinningId, setPinningId] = useState<string | null>(null);

  const { data: rawCategories, loading: catLoading } = useCollection<any>(useMemo(() => (db ? query(collection(db, "categories"), orderBy("displayOrder", "asc")) : null), [db]));
  const { data: exams, loading: examsLoading } = useCollection<any>(useMemo(() => (db ? collection(db, "exams") : null), [db]));

  const categories = useMemo(() => {
    if (!rawCategories) return [];
    return rawCategories.filter(c => AUTHORIZED_CATEGORY_IDS.includes(c.id));
  }, [rawCategories]);

  const featuredExams = useMemo(() => {
    if (!exams) return [];
    return exams.filter(e => e.isTrending).slice(0, 6);
  }, [exams]);

  const filteredExams = useMemo(() => {
    if (!searchTerm.trim() || !exams) return [];
    const term = searchTerm.toLowerCase().trim();
    return exams.filter(e => 
      e.name?.toLowerCase().includes(term) || 
      e.boardId?.toLowerCase().includes(term)
    ).slice(0, 8);
  }, [exams, searchTerm]);

  if (authLoading || !user) return <div className="h-screen w-full flex flex-col items-center justify-center bg-white space-y-4"><Zap className="h-10 w-10 text-primary animate-pulse" /></div>;

  return (
    <div className="flex flex-col min-h-screen bg-[#F8FAFC] font-body text-left overflow-x-hidden w-full max-w-full">
      <Navbar />
      <main className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-16 space-y-12 md:space-y-24 overflow-x-hidden">
        
        {/* 1. HEADER HUB */}
        <section className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 px-1 w-full overflow-hidden">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4 w-full"
          >
            <div className="flex items-center gap-2">
              <Badge className="bg-primary/10 text-primary border-none px-4 py-1.5 rounded-full font-black text-[10px] md:text-xs tracking-widest flex items-center gap-2 uppercase">
                <Landmark className="h-3.5 w-3.5" /> Official Choice
              </Badge>
            </div>
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-4">
                <h1 className="text-[28px] sm:text-5xl lg:text-[56px] font-[900] tracking-tighter leading-tight text-transparent bg-clip-text bg-gradient-to-r from-[#2563EB] to-[#60A5FA]">
                  Select Your Exam
                </h1>
                <div className="h-8 w-8 md:h-10 md:w-10 bg-blue-600 rounded-full flex items-center justify-center shadow-lg shadow-blue-600/20 shrink-0">
                  <ShieldCheck className="h-5 w-5 md:h-6 md:w-6 text-white" />
                </div>
              </div>
              <p className="text-slate-500 font-medium text-sm md:text-lg max-w-2xl leading-tight">
                Find your official Punjab Government exam and begin practicing with verified mock tests.
              </p>
            </div>
          </motion.div>
        </section>

        {/* 2. PREMIUM SEARCH & CHIPS */}
        <section className="space-y-8 w-full">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="relative w-full max-w-4xl mx-auto group"
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600/20 to-indigo-600/20 rounded-[28px] blur-md opacity-0 group-focus-within:opacity-100 transition duration-500"></div>
            <div className="relative min-h-[64px] bg-white/80 backdrop-blur-xl border border-slate-200 rounded-[24px] shadow-[0_15px_40px_rgba(0,0,0,0.08)] flex items-center px-4 md:px-6 gap-3 md:gap-4 w-full">
              <Search className="h-5 w-5 md:h-6 md:w-6 text-slate-400 group-focus-within:text-primary transition-colors shrink-0" />
              <input 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search exams..."
                className="flex-1 min-w-0 bg-transparent border-none outline-none font-bold text-[#0F172A] placeholder:text-slate-300 text-sm md:text-xl"
              />
              <div className="flex items-center gap-1 md:gap-2 border-l border-slate-100 pl-2 md:pl-4 shrink-0">
                {searchTerm && (
                  <button onClick={() => setSearchTerm('')} className="h-8 w-8 md:h-10 md:w-10 rounded-full hover:bg-slate-100 flex items-center justify-center transition-all mr-1">
                    <X className="h-4 w-4 md:h-5 md:w-5 text-slate-400" />
                  </button>
                )}
                <button className="h-10 w-10 md:h-12 md:w-12 rounded-xl flex items-center justify-center text-slate-400 hover:bg-slate-50 hover:text-primary transition-all shrink-0">
                  <Mic className="h-4 w-4 md:h-5 md:w-5" />
                </button>
                <button className="h-10 w-10 md:h-12 md:w-12 rounded-xl flex items-center justify-center text-slate-400 hover:bg-slate-50 hover:text-primary transition-all shrink-0">
                  <Filter className="h-4 w-4 md:h-5 md:w-5" />
                </button>
              </div>
            </div>

            {/* SEARCH RESULTS DROPDOWN */}
            <AnimatePresence>
              {searchTerm.length >= 2 && (
                <motion.div 
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 5 }}
                  className="absolute top-full left-0 right-0 mt-3 bg-white rounded-[24px] shadow-5xl border border-slate-100 z-50 overflow-hidden"
                >
                  <div className="divide-y divide-slate-50">
                    {filteredExams.length > 0 ? filteredExams.map((e) => (
                      <Link key={e.id} href={`/exams/view?id=${e.id}`} className="flex items-center justify-between p-4 md:p-5 hover:bg-slate-50 transition-all group">
                        <div className="flex items-center gap-4 min-w-0">
                          <div className="h-10 w-10 md:h-12 md:w-12 bg-slate-50 rounded-xl flex items-center justify-center border border-slate-100 shrink-0">
                            <GraduationCap className="h-5 w-5 md:h-6 md:w-6 text-primary" />
                          </div>
                          <div className="min-w-0">
                            <span className="font-bold text-[#0F172A] text-sm md:text-lg block truncate">{e.name}</span>
                            <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{e.boardId} Center</span>
                          </div>
                        </div>
                        <ChevronRight className="h-5 w-5 text-slate-300 group-hover:text-primary transition-all shrink-0" />
                      </Link>
                    )) : (
                      <div className="p-10 text-center space-y-3">
                        <AlertCircle className="h-10 w-10 mx-auto text-slate-200" />
                        <p className="text-slate-400 font-medium italic">No matching exam found.</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* POPULAR CHIPS */}
          <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-2 px-1 w-full">
            {POPULAR_CHIPS.map((chip) => (
              <button 
                key={chip.label}
                onClick={() => setSearchTerm(chip.label)}
                className={cn(
                  "h-10 px-5 md:px-6 rounded-full font-black text-[10px] md:text-xs uppercase tracking-widest transition-all duration-300 whitespace-nowrap shadow-sm border active:scale-95 flex items-center gap-2",
                  searchTerm === chip.label 
                    ? "bg-gradient-to-r from-[#2563EB] to-[#60A5FA] border-transparent text-white shadow-xl shadow-blue-600/20" 
                    : "bg-white border-slate-200 text-slate-500 hover:border-primary/30 hover:text-primary"
                )}
              >
                <span>{chip.icon}</span> {chip.label}
              </button>
            ))}
          </div>
        </section>

        {/* 3. FEATURED EXAMS - REDESIGNED PER REFERENCE */}
        <section className="space-y-8 w-full overflow-hidden">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-3">
              <Star className="h-6 w-6 text-amber-500 fill-amber-500" />
              <h2 className="text-xl md:text-3xl font-[900] text-[#0F172A] tracking-tight">Featured Exams</h2>
            </div>
          </div>

          <div className="flex gap-4 md:gap-8 overflow-x-auto no-scrollbar pb-6 -mx-4 px-4 md:mx-0 md:px-0 w-full snap-x snap-mandatory">
            {examsLoading ? (
              Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-[450px] w-[85%] sm:w-[48%] lg:w-[320px] rounded-[40px] shrink-0" />)
            ) : featuredExams.map((exam, i) => (
              <motion.div 
                key={exam.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
                className="shrink-0 w-[85%] sm:w-[48%] lg:w-[350px] xl:w-[400px] snap-center"
              >
                <Card className="border border-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.05)] rounded-[40px] bg-white p-8 md:p-10 flex flex-col group h-full relative overflow-hidden transition-all duration-500 hover:-translate-y-2">
                  
                  {/* TOP HEADER: Logo & Ratings */}
                  <div className="flex justify-between items-start mb-10">
                    <AuthorityLogo boardId={exam.boardId} size="md" className="shadow-2xl border-4 border-white shrink-0 bg-slate-50" />
                    <div className="flex flex-col items-end gap-2">
                      <div className="flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-lg">
                        <Star className="h-3 w-3 text-amber-400 fill-current" />
                        <span className="text-[10px] font-black text-[#0F172A]">4.9</span>
                      </div>
                      <Badge className="bg-emerald-50 text-emerald-600 border-none text-[8px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg shadow-sm">
                        {exam.difficulty || 'MIXED'}
                      </Badge>
                    </div>
                  </div>

                  {/* BODY: Institutional Identity */}
                  <div className="space-y-6 flex-1 text-left">
                    <div className="space-y-2">
                      <h3 className="text-2xl md:text-[32px] font-black text-primary leading-[1.1] tracking-tight uppercase group-hover:brightness-90 transition-all">
                        {exam.name}
                      </h3>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em]">
                        Board: {exam.boardId}
                      </p>
                    </div>

                    {/* Stats Matrix: Institutional Style */}
                    <div className="flex items-center gap-8 pt-4">
                       <div className="flex items-center gap-2.5">
                          <Zap className="h-5 w-5 text-primary" />
                          <span className="text-[11px] md:text-sm font-bold text-slate-400 uppercase tracking-tight">
                             {exam.totalMocks || "40+"} Mocks
                          </span>
                       </div>
                       <div className="flex items-center gap-2.5">
                          <Users className="h-5 w-5 text-primary" />
                          <span className="text-[11px] md:text-sm font-bold text-slate-400 uppercase tracking-tight">
                             {exam.studentCount || "12K+"} Students
                          </span>
                       </div>
                    </div>
                  </div>

                  {/* FOOTER: Navy Pill Button */}
                  <div className="mt-12">
                    <Button asChild className="w-full h-16 md:h-20 bg-[#0F172A] hover:bg-black text-white font-[900] uppercase text-[11px] md:text-sm tracking-[0.15em] rounded-full shadow-2xl transition-all active:scale-95 border-none group/btn">
                      <Link href={`/exams/view?id=${exam.id}`} className="flex items-center justify-between w-full px-8">
                        <span>Start Preparation</span>
                        <ChevronRight className="h-5 w-5 transition-transform group-hover/btn:translate-x-1" />
                      </Link>
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>

        {/* 4. EXAM CATEGORIES GRID */}
        <section className="space-y-10 w-full">
           <div className="flex items-center gap-3 px-1">
              <Layers className="h-6 w-6 text-primary" />
              <h2 className="text-xl md:text-3xl font-[900] text-[#0F172A] tracking-tight">Recruitment Boards</h2>
           </div>
           
           <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8 lg:gap-10 w-full">
              {catLoading ? (
                 Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-64 w-full rounded-[24px]" />)
              ) : categories.map((cat, i) => (
                 <motion.div 
                    key={cat.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full"
                 >
                    <Link href={`/exams/category/${cat.id}`} className="block h-full">
                       <Card className="border border-[#E5E7EB] shadow-sm hover:shadow-2xl transition-all duration-500 rounded-[24px] md:rounded-[32px] bg-white group overflow-hidden h-full flex flex-col p-5 md:p-10 relative">
                          <div className="flex justify-between items-start mb-6 md:mb-12">
                             <div className="h-12 w-12 md:h-16 md:w-16 bg-gradient-to-br from-[#2563EB] to-[#60A5FA] rounded-full flex items-center justify-center text-white shadow-xl group-hover:rotate-6 transition-transform shrink-0">
                                <AuthorityLogo category={cat} size="sm" className="bg-transparent shadow-none p-0 w-full h-full" />
                             </div>
                             <div className="h-10 w-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-primary group-hover:text-white transition-all shrink-0">
                                <ArrowRight className="h-5 w-5" />
                             </div>
                          </div>
                          
                          <div className="space-y-3 md:space-y-4 flex-1">
                             <h3 className="text-sm md:text-xl font-black text-[#0F172A] group-hover:text-primary transition-colors leading-tight uppercase line-clamp-2">{cat.title}</h3>
                             <div className="flex items-center gap-2 text-[8px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                <BookOpen className="h-3 w-3 shrink-0" /> 12+ Sections
                             </div>
                          </div>

                          <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-data-[state=hover]:scale-125 transition-transform duration-1000 pointer-events-none">
                             <Landmark className="h-32 w-32" />
                          </div>
                       </Card>
                    </Link>
                 </motion.div>
              ))}
           </div>
        </section>

        {/* 5. WHY CRACKLIX */}
        <section className="py-10 md:py-16 bg-white rounded-[40px] shadow-sm border border-slate-100 w-full overflow-hidden">
           <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-12 px-4 md:px-8">
              <FeatureCard icon={CheckCircle2} title="Verified Content" desc="100% official pattern MCQs" color="text-emerald-500" bg="bg-emerald-50" />
              <FeatureCard icon={Zap} title="Daily Practice" desc="Fresh challenge every 24h" color="text-blue-500" bg="bg-blue-50" />
              <FeatureCard icon={FileText} title="Old Papers" desc="10 years of solved papers" color="text-purple-500" bg="bg-purple-50" />
              <FeatureCard icon={BarChart3} title="Deep Analytics" desc="Detailed performance stats" color="text-orange-500" bg="bg-orange-50" />
           </div>
        </section>

        {/* 6. BOTTOM CTA BANNER */}
        <section className="relative px-1 w-full overflow-hidden">
           <motion.div 
              initial={{ opacity: 0, scale: 0.98 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-[#0B1528] to-[#1E3A8A] rounded-[30px] md:rounded-[48px] p-8 md:p-20 text-center space-y-8 md:space-y-12 relative overflow-hidden shadow-5xl border border-white/5"
           >
              <div className="absolute top-0 right-0 p-16 opacity-10 rotate-12 group-hover:scale-110 transition-transform duration-1000">
                 <Sparkles className="h-64 w-64 text-primary" />
              </div>
              <div className="absolute -top-20 -left-20 w-64 h-64 bg-primary/20 blur-[100px] rounded-full" />
              
              <div className="relative z-10 space-y-4 md:space-y-6">
                 <h2 className="text-3xl md:text-7xl font-[900] text-white tracking-tighter leading-[1] uppercase antialiased">
                    Ready to Crack <br/> <span className="text-primary italic">Your Dream Exam?</span>
                 </h2>
                 <p className="text-slate-400 font-medium text-sm md:text-2xl max-w-2xl mx-auto leading-relaxed">
                    Start practicing with Punjab&apos;s most trusted mock test platform. Join 100K+ successful students.
                 </p>
              </div>

              <div className="relative z-10 pt-4 flex justify-center">
                 <Button asChild className="h-14 md:h-24 px-8 md:px-24 bg-primary hover:bg-blue-700 text-white font-[900] uppercase text-[10px] md:text-sm tracking-[0.3em] rounded-2xl md:rounded-[32px] shadow-4xl border-none transition-all active:scale-95 group">
                    <Link href="/mocks" className="flex items-center justify-center gap-4">
                       Start Practice <ArrowRight className="h-5 w-5 md:h-8 md:w-8 group-hover:translate-x-2 transition-transform" />
                    </Link>
                 </Button>
              </div>
           </motion.div>
        </section>

      </main>
      <Footer />
    </div>
  )
}

function FeatureCard({ icon: Icon, title, desc, color, bg }: any) {
   return (
      <div className="flex flex-col items-center text-center space-y-4 group w-full">
         <div className={cn("h-12 w-12 md:h-14 rounded-2xl flex items-center justify-center shadow-inner transition-transform group-hover:scale-110 shrink-0", bg, color)}>
            <Icon className="h-6 w-6 md:h-7 md:w-7" />
         </div>
         <div className="space-y-1">
            <h4 className="font-black text-xs md:text-lg text-[#0F172A] uppercase leading-tight line-clamp-2">{title}</h4>
            <p className="text-[8px] md:text-xs font-bold text-slate-400 uppercase tracking-tight leading-snug line-clamp-2">{desc}</p>
         </div>
      </div>
   )
}
