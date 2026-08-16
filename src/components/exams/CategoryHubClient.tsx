"use client"

import { useMemo, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import { useCollection, useFirestore, useUser } from "@/firebase"
import { collection, query, where, orderBy, doc } from "firebase/firestore"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronRight, Zap, Landmark, ArrowRight, Layers, ShieldCheck, ArrowLeft, Search } from "lucide-react"
import { AuthorityLogo } from "@/lib/exam-icons"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"
import ExamCard from "@/components/exams/ExamCard"
import { Skeleton } from "@/components/ui/skeleton"

interface CategoryHubClientProps {
  catId: string;
}

/**
 * @fileOverview Institutional Category Hub v10.0 [High-Density Redesign].
 * FIXED: Removed bulky cards in favor of a Testbook-style list UI.
 * FIXED: Title Case normalization and compact spatial balance.
 */

export default function CategoryHubClient({ catId }: CategoryHubClientProps) {
  const router = useRouter();
  const db = useFirestore();
  const { user, loading: authLoading } = useUser();
  
  const [mounted, setMounted] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [activeBoardFilter, setActiveBoardFilter] = useState("all");

  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined') {
       setIsStandalone(window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true);
    }
  }, []);

  const { data: categories } = useCollection<any>(useMemo(() => (db ? collection(db, "categories") : null), [db]));
  const category = categories?.find(c => c.id === catId);

  const boardsQuery = useMemo(() => (db ? query(collection(db, "boards"), where("categoryId", "==", catId)) : null), [db, catId]);
  const examsQuery = useMemo(() => (db ? query(collection(db, "exams"), where("categoryId", "==", catId)) : null), [db, catId]);
  const mocksQuery = useMemo(() => (db ? query(collection(db, "mocks"), where("published", "==", true)) : null), [db]);
  const resultsQuery = useMemo(() => (db && user ? query(collection(db, "results"), where("userId", "==", user.uid)) : null), [db, user]);

  const { data: boards, loading: boardsLoading } = useCollection<any>(boardsQuery);
  const { data: rawExams, loading: examsLoading } = useCollection<any>(examsQuery);
  const { data: mocks } = useCollection<any>(mocksQuery);
  const { data: results } = useCollection<any>(resultsQuery);
  
  const activeExams = useMemo(() => {
     if (!rawExams) return [];
     return [...rawExams].sort((a: any, b: any) => (a.displayOrder || 0) - (b.displayOrder || 0));
  }, [rawExams]);

  const recruitmentBoards = useMemo(() => {
     if (!boards) return [];
     return boards
       .filter((b: any) => b.id !== 'current-affairs')
       .filter((b: any) => activeBoardFilter === 'all' || b.abbreviation === activeBoardFilter || b.id === activeBoardFilter);
  }, [boards, activeBoardFilter]);

  const filterOptions = useMemo(() => {
     if (!boards) return [{ id: 'all', label: 'All hubs' }];
     const base = [{ id: 'all', label: 'All hubs' }];
     boards.filter((b: any) => b.id !== 'current-affairs').forEach((b: any) => {
        base.push({ id: b.abbreviation, label: b.abbreviation });
     });
     return base;
  }, [boards]);

  if (!mounted || authLoading) return <div className="h-screen w-full flex items-center justify-center bg-white"><Zap className="h-10 w-10 text-primary animate-pulse" /></div>;

  return (
    <div className="min-h-screen bg-white font-body text-left selection:bg-primary/10 flex flex-col overflow-x-hidden">
      <Navbar />
      
      {/* 1. COMPACT HERO SECTION */}
      <section className="bg-slate-50/50 pt-8 pb-8 md:pt-12 md:pb-16 relative overflow-hidden border-b border-slate-100">
         <div className="absolute top-0 right-0 w-1/3 h-full bg-primary/5 blur-[100px] rounded-full pointer-events-none" />
         
         <div className="container mx-auto px-4 md:px-8 max-w-5xl relative z-10 space-y-6 md:space-y-8">
            <div className="flex items-center gap-4">
               {!isStandalone && (
                  <button onClick={() => router.back()} className="h-10 w-10 rounded-xl border border-slate-200 bg-white flex items-center justify-center text-slate-400 hover:text-primary transition-all shadow-sm active:scale-90 shrink-0 cursor-pointer">
                     <ArrowLeft className="h-5 w-5" />
                  </button>
               )}
               <div className="flex flex-col">
                  <h1 className="text-2xl md:text-4xl font-black text-[#0F172A] tracking-tight antialiased">
                     {category?.title || "Exam Selection"}
                  </h1>
                  <p className="text-[13px] md:text-lg text-slate-500 font-medium tracking-tight">
                     {category?.description || "Select a verified authority hub to start your journey."}
                  </p>
               </div>
            </div>

            {/* 2. COMPACT FILTER ROW */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
               {filterOptions.map(opt => (
                  <button 
                    key={opt.id} 
                    onClick={() => setActiveBoardFilter(opt.id)}
                    className={cn(
                       "h-9 px-5 rounded-full font-bold text-[10px] md:text-xs tracking-tight transition-all border whitespace-nowrap active:scale-95",
                       activeBoardFilter === opt.id 
                        ? "bg-[#0F172A] border-[#0F172A] text-white shadow-lg" 
                        : "bg-white border-slate-200 text-slate-400 hover:border-slate-300"
                    )}
                  >
                     {opt.label}
                  </button>
               ))}
            </div>
         </div>
      </section>

      {/* 3. LIST HUB */}
      <main className="container mx-auto px-4 md:px-8 py-4 md:py-8 max-w-5xl flex-1">
         
         {recruitmentBoards && recruitmentBoards.length > 0 && (
            <section className="space-y-0 text-left">
               <div className="divide-y divide-slate-100">
                  {recruitmentBoards.map((board, idx) => (
                    <motion.div 
                      key={board.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                    >
                       <Link href={`/exams/hub/${board.id}`}>
                          <div className="py-6 md:py-8 flex items-center justify-between group cursor-pointer hover:bg-slate-50/50 -mx-4 px-4 transition-colors">
                             <div className="flex items-center gap-5 md:gap-8 flex-1 min-w-0">
                                {/* LOGO: Circular 48-60px */}
                                <div className="shrink-0 transition-transform duration-300 group-hover:scale-105">
                                   <AuthorityLogo board={board} size="md" className="h-14 w-14 md:h-16 md:w-16 rounded-full border-none shadow-sm bg-slate-50 p-2" />
                                </div>
                                
                                <div className="space-y-1 flex-1 min-w-0">
                                   <div className="flex items-center gap-3">
                                      <h3 className="text-[17px] md:text-2xl font-bold text-[#0F172A] group-hover:text-primary transition-colors tracking-tight truncate">
                                         {board.abbreviation} Hub
                                      </h3>
                                      <Badge className="bg-emerald-50 text-emerald-600 border-none font-bold text-[8px] px-2 py-0 h-4 uppercase tracking-widest hidden sm:flex">Verified</Badge>
                                   </div>
                                   <p className="text-[13px] md:text-base text-slate-400 font-medium truncate max-w-md">{board.name}</p>
                                   <div className="flex items-center gap-2 pt-1">
                                      <span className="text-[10px] md:text-xs font-bold text-slate-300 uppercase tracking-widest">Official Exams • Mock Tests • PYQs</span>
                                   </div>
                                </div>
                             </div>

                             <div className="shrink-0 flex items-center gap-4">
                                <div className="h-8 w-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-primary/10 group-hover:text-primary transition-all">
                                   <ChevronRight className="h-5 w-5" />
                                </div>
                             </div>
                          </div>
                       </Link>
                    </motion.div>
                  ))}
               </div>
            </section>
         )}

         {/* OPTIONAL: VERTICALS SECTION (Remaining as cards for hierarchy distinction) */}
         {activeExams.length > 0 && activeBoardFilter === 'all' && (
            <section className="space-y-8 text-left pt-12 border-t border-slate-50">
               <div className="flex items-center gap-3 px-1">
                  <div className="h-8 w-8 rounded-lg bg-orange-50 flex items-center justify-center text-orange-500 shadow-inner"><Zap className="h-4 w-4" /></div>
                  <h2 className="text-lg md:text-xl font-bold tracking-tight text-[#0F172A]">Individual verticals</h2>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                  {activeExams.map((exam) => (
                     <ExamCard 
                       key={exam.id} 
                       exam={exam} 
                       allMocks={mocks} 
                       userResults={results} 
                    />
                  ))}
               </div>
            </section>
         )}

         {!boardsLoading && !examsLoading && recruitmentBoards?.length === 0 && activeExams.length === 0 && (
            <div className="py-40 text-center opacity-30 flex flex-col items-center gap-8">
               <Layers className="h-16 w-16 text-slate-200" />
               <p className="font-bold text-xl md:text-3xl tracking-tight text-slate-400">Registry standby</p>
            </div>
         )}
      </main>

      <div className="pt-10 pb-20 flex items-center justify-center gap-3 text-slate-300 opacity-50">
         <ShieldCheck className="h-4 w-4" />
         <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Institutional Registry Verified</span>
      </div>

      <Footer />
    </div>
  )
}
