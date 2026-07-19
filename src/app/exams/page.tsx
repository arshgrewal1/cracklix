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

/**
 * @fileOverview Premium Exam Selection Hub v5.6.
 * UPDATED: Simplified language - replaced "registry," "boards," and "trending" with easy words.
 * UPDATED: Removed all uppercase styling.
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
  const { user, loading: authLoading } = useUser();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [isListening, setIsListening] = useState(false);

  const statsRef = useMemo(() => (db ? doc(db, "settings", "stats") : null), [db]);
  const { data: platformStats } = useDoc<any>(statsRef);

  const { data: rawCategories, loading: catLoading } = useCollection<any>(useMemo(() => (db ? query(collection(db, "categories"), orderBy("displayOrder", "asc")) : null), [db]));
  const { data: exams, loading: examsLoading } = useCollection<any>(useMemo(() => (db ? collection(db, "exams") : null), [db]));
  const { data: allMocks } = useCollection<any>(useMemo(() => (db ? query(collection(db, "mocks"), where("published", "==", true)) : null), [db]));

  const examStats = useMemo(() => {
    const stats: Record<string, number> = {};
    if (!exams || !allMocks) return stats;
    exams.forEach(e => {
       stats[e.id] = allMocks.filter((m: any) => m.examId === e.id || m.examIds?.includes(e.id)).length;
    });
    return stats;
  }, [exams, allMocks]);

  const categories = useMemo(() => {
    if (!rawCategories) return [];
    return rawCategories.filter((c: any) => AUTHORIZED_CATEGORY_IDS.includes(c.id));
  }, [rawCategories]);

  const featuredExams = useMemo(() => {
    if (!exams) return [];
    return exams.filter((e: any) => e.isTrending).slice(0, 4);
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
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      toast({ variant: "destructive", title: "Not Supported", description: "Voice search is not supported." });
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-IN';
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);
    recognition.onresult = (event: any) => {
      setSearchTerm(event.results[0][0].transcript);
    };
    recognition.start();
  };

  if (authLoading) return <div className="h-screen w-full flex items-center justify-center bg-white"><Zap className="h-10 w-10 text-primary animate-pulse" /></div>;

  return (
    <div className="flex flex-col min-h-screen bg-[#F8FAFC] font-body text-left overflow-x-hidden w-full">
      <Navbar />
      
      <main className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-16 space-y-12 md:space-y-24 pb-[env(safe-area-inset-bottom,40px)]">
        
        {/* 1. PREMIUM HERO SECTION */}
        <section className="relative px-1 overflow-hidden">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-12 text-center md:text-left"
          >
            <div className="space-y-6 max-w-4xl">
              <div className="flex items-center justify-center md:justify-start gap-3">
                 <Badge className="bg-primary/10 text-primary border-none px-4 py-1.5 rounded-full font-bold text-[10px] md:text-xs tracking-tight flex items-center gap-2">
                   <Landmark className="h-3.5 w-3.5" /> Exam list
                 </Badge>
              </div>
              <h1 className="text-[32px] sm:text-6xl lg:text-[72px] font-black tracking-tighter leading-[1.05] text-[#0F172A] antialiased">
                Find your <br className="hidden md:block"/>
                <span className="text-primary">Exam preparation portal.</span>
              </h1>
              <p className="text-slate-500 font-medium text-sm md:text-xl max-w-2xl leading-relaxed tracking-tight">
                Select your target board or exam vertical to begin practicing with Punjab's most accurate mock tests.
              </p>
            </div>

            <div className="relative w-full max-w-4xl group">
              <div className="absolute -inset-1 bg-gradient-to-r from-primary to-blue-400 rounded-[28px] blur opacity-5 group-focus-within:opacity-10 transition duration-1000"></div>
              <div className="relative min-h-[64px] md:min-h-[72px] bg-white border border-slate-200 rounded-[24px] shadow-xl flex items-center px-4 md:px-8 gap-4">
                <Search className="h-6 w-6 text-slate-300 shrink-0" />
                <input 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search exams like Patwari, Police, SSC..."
                  className="flex-1 min-w-0 bg-transparent border-none outline-none font-bold text-slate-700 placeholder:text-slate-200 text-sm md:text-xl"
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
                          <div className="flex items-center gap-4 min-w-0">
                            <AuthorityLogo boardId={e.boardId} size="sm" className="h-12 w-12 shrink-0" />
                            <div className="min-w-0">
                              <span className="font-bold text-[#0F172A] text-sm md:text-lg block truncate">{e.name}</span>
                              <span className="text-[10px] font-bold text-slate-400">{e.boardId} hub</span>
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
                    className="h-10 px-6 rounded-full bg-white border border-slate-200 text-[#0F172A] font-bold text-xs tracking-tight shadow-sm hover:border-primary/40 hover:text-primary transition-all whitespace-nowrap active:scale-95 flex items-center gap-2"
                  >
                    <span>{chip.icon}</span> {chip.label}
                  </button>
               ))}
            </div>
          </motion.div>
        </section>

        {/* 2. RECRUITMENT BOARDS (PREMIUM HORIZONTAL) */}
        <section className="space-y-8 md:space-y-12 w-full text-left">
           <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-4">
                 <div className="h-12 w-12 rounded-2xl bg-[#0F172A] flex items-center justify-center text-primary shadow-2xl">
                    <Landmark className="h-6 w-6" />
                 </div>
                 <div className="text-left">
                    <h2 className="text-2xl md:text-4xl font-black text-[#0F172A] tracking-tight">Exam boards</h2>
                    <p className="text-[10px] md:text-sm font-bold text-slate-400 mt-1">Official authority hubs</p>
                 </div>
              </div>
           </div>
           
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 lg:gap-10 w-full">
              {catLoading ? (
                 Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-32 w-full rounded-[24px]" />)
              ) : categories.map((cat: any, i: number) => (
                 <motion.div 
                    key={cat.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                 >
                    <Link href={`/exams/category/${cat.id}`}>
                       <Card className="border border-slate-100 shadow-sm hover:shadow-4xl transition-all duration-500 rounded-[28px] bg-white group overflow-hidden h-full flex flex-col p-6 md:p-8 relative text-left">
                          <div className="flex items-center gap-5 relative z-10">
                             <div className="h-14 w-14 md:h-16 md:w-16 bg-slate-50 rounded-2xl flex items-center justify-center shadow-inner shrink-0 group-hover:scale-105 transition-transform">
                                <AuthorityLogo category={cat} size="sm" className="p-0 shadow-none border-none bg-transparent" />
                             </div>
                             <div className="min-w-0 flex-1">
                                <h3 className="text-sm md:text-lg font-bold text-[#0F172A] leading-tight group-hover:text-primary transition-colors truncate">{cat.title}</h3>
                                <div className="mt-1 flex items-center justify-between">
                                   <span className="text-[9px] font-bold text-slate-400">12+ Exams</span>
                                   <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-primary transition-all" />
                                </div>
                             </div>
                          </div>
                          <div className="absolute top-0 right-0 p-8 opacity-[0.02] pointer-events-none">
                             <Layers className="h-32 w-32" />
                          </div>
                       </Card>
                    </Link>
                 </motion.div>
              ))}
           </div>
        </section>

        {/* 3. POPULAR EXAM VERTICALS */}
        <section className="space-y-10 w-full text-left">
           <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-4">
                 <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                    <Star className="h-6 w-6 fill-current" />
                 </div>
                 <div className="text-left">
                    <h2 className="text-2xl md:text-4xl font-black text-[#0F172A] tracking-tight">Popular exams</h2>
                    <p className="text-[10px] md:text-sm font-bold text-slate-400 mt-1">High aspirant traffic verticals</p>
                 </div>
              </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-10">
              {examsLoading ? (
                 Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-80 w-full rounded-[32px]" />)
              ) : featuredExams.map((exam: any, i: number) => (
                 <motion.div 
                    key={exam.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                 >
                    <Link href={`/exams/view?id=${exam.id}`}>
                       <Card className="border border-slate-100 shadow-xl hover:shadow-5xl transition-all duration-500 rounded-[32px] md:rounded-[40px] bg-white p-8 md:p-10 flex flex-col group h-full relative overflow-hidden text-left">
                          <div className="flex justify-between items-start mb-10">
                             <AuthorityLogo boardId={exam.boardId} size="md" className="shadow-2xl border-4 border-white bg-slate-50" />
                             <div className="flex flex-col items-end gap-2">
                                <Badge className="bg-emerald-50 text-emerald-600 border-none text-[8px] font-bold px-2.5 py-1 rounded-lg shadow-sm">Live patterns</Badge>
                                <div className="flex items-center gap-1 text-amber-500">
                                   <Star className="h-3 w-3 fill-current" />
                                   <span className="text-[10px] font-black text-slate-400">4.9</span>
                                </div>
                             </div>
                          </div>
                          <div className="space-y-4 flex-1">
                             <h3 className="text-xl md:text-2xl font-bold text-[#0F172A] leading-[1.1] tracking-tight group-hover:text-primary transition-colors">{exam.name}</h3>
                             <div className="flex items-center gap-6 pt-4">
                                <div className="flex items-center gap-2 text-slate-400 font-bold text-[11px]">
                                   <Zap className="h-4 w-4 text-primary" /> {examStats[exam.id] || 0} Mocks
                                </div>
                                <div className="flex items-center gap-2 text-slate-400 font-bold text-[11px]">
                                   <Users className="h-4 w-4 text-primary" /> Active
                                </div>
                             </div>
                          </div>
                          <div className="mt-10 pt-8 border-t border-slate-50 flex items-center justify-between group-hover:text-primary transition-all">
                             <span className="text-[10px] font-bold">Start practice</span>
                             <ChevronRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                          </div>
                       </Card>
                    </Link>
                 </motion.div>
              ))}
           </div>
        </section>

        {/* 4. WHY CRACKLIX SECTION */}
        <section className="py-12 md:py-24 bg-white rounded-[40px] md:rounded-[80px] shadow-sm border border-slate-100 overflow-hidden relative text-center">
           <div className="absolute top-0 right-0 p-16 opacity-[0.02] pointer-events-none"><ShieldCheck className="h-96 w-96" /></div>
           <div className="container mx-auto px-8 md:px-20 space-y-16">
              <div className="space-y-4 max-w-3xl mx-auto">
                 <h2 className="text-3xl md:text-6xl font-black text-[#0F172A] tracking-tighter leading-none">The Cracklix standard</h2>
                 <p className="text-slate-400 font-bold text-[11px] md:text-sm uppercase tracking-widest">Verified institutional learning items</p>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-16">
                 <ValueNode icon={ShieldCheck} title="Verified patterns" desc="Updated 24x7 as per official gazettes." />
                 <ValueNode icon={Zap} title="Instant solutions" desc="Bilingual rationale for every MCQ item." />
                 <ValueNode icon={GraduationCap} title="Merit ranking" desc="See your All Punjab Rank in real-time." />
                 <ValueNode icon={Users} title="Student community" desc="Join 100K+ aspirants preparing smarter." />
              </div>
           </div>
        </section>

        {/* 5. CTA HUB */}
        <section className="px-1 text-center">
           <motion.div 
             initial={{ opacity: 0, scale: 0.98 }}
             whileInView={{ opacity: 1, scale: 1 }}
             viewport={{ once: true }}
             className="bg-gradient-to-br from-[#0B1528] to-[#1E3A8A] rounded-[30px] md:rounded-[60px] p-10 md:p-32 space-y-10 md:space-y-16 text-white relative overflow-hidden shadow-5xl border border-white/5"
           >
              <div className="absolute top-0 right-0 p-16 opacity-10 rotate-12 group-hover:scale-110 transition-transform duration-1000">
                 <Sparkles className="h-64 w-64 text-primary" />
              </div>
              <div className="relative z-10 space-y-6">
                 <h2 className="text-3xl md:text-7xl lg:text-9xl font-black text-white tracking-tighter leading-[0.9] antialiased">
                   Ready to crack <br className="hidden md:block" /> your dream job?
                 </h2>
                 <p className="text-slate-400 font-medium text-sm md:text-2xl max-w-2xl mx-auto leading-relaxed">
                   Join Punjab's most trusted mock test platform. Official patterns, expert rationales, and verified success entries.
                 </p>
              </div>
              <div className="relative z-10 pt-4 flex justify-center">
                 <Button asChild className="h-16 md:h-24 px-12 md:px-24 bg-primary hover:bg-blue-700 text-white font-bold text-[10px] md:text-sm tracking-tight rounded-2xl md:rounded-[3rem] shadow-4xl border-none transition-all active:scale-95 group">
                    <Link href="/mocks" className="flex items-center justify-center gap-4">
                       Start practicing <ArrowRight className="h-5 w-5 md:h-8 md:w-8 group-hover:translate-x-2 transition-transform" />
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

function ValueNode({ icon: Icon, title, desc }: any) {
   return (
      <div className="flex flex-col items-center text-center space-y-6 group">
         <div className="h-16 w-16 md:h-24 md:w-24 rounded-[1.5rem] md:rounded-[2.5rem] bg-slate-50 flex items-center justify-center text-primary shadow-inner group-hover:scale-110 group-hover:bg-primary/5 transition-all">
            <Icon className="h-8 w-8 md:h-12 md:w-12" />
         </div>
         <div className="space-y-2">
            <h4 className="font-bold text-sm md:text-xl text-[#0F172A] leading-tight">{title}</h4>
            <p className="text-[10px] md:text-xs font-medium text-slate-400 leading-snug">{desc}</p>
         </div>
      </div>
   )
}
