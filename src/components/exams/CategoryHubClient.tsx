"use client"

import { useMemo, useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import { useCollection, useFirestore, useUser } from "@/firebase"
import { collection, query, where, doc, updateDoc, arrayUnion, arrayRemove, serverTimestamp } from "firebase/firestore"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, Star, CheckCircle2, RefreshCw, Zap, Landmark, ArrowRight, Layers, ShieldCheck } from "lucide-react"
import { AuthorityLogo } from "@/lib/exam-icons"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { motion } from "framer-motion"

interface CategoryHubClientProps {
  catId: string;
}

/**
 * @fileOverview Premium Category Hub Portal v5.8.
 * UPDATED: Removed uppercase styling and refined layouts.
 */

export default function CategoryHubClient({ catId }: CategoryHubClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const db = useFirestore();
  const { user, profile, loading: authLoading } = useUser();
  const { toast } = useToast();
  const [pinningId, setPinningId] = useState<string | null>(null);

  const { data: categories } = useCollection<any>(useMemo(() => (db ? collection(db, "categories") : null), [db]));
  const category = categories?.find(c => c.id === catId);

  const boardsQuery = useMemo(() => (db ? query(collection(db, "boards"), where("categoryId", "==", catId)) : null), [db, catId]);
  const examsQuery = useMemo(() => (db ? query(collection(db, "exams"), where("categoryId", "==", catId)) : null), [db, catId]);

  const { data: boards, loading: boardsLoading } = useCollection<any>(boardsQuery);
  const { data: rawExams, loading: examsLoading } = useCollection<any>(examsQuery);
  
  const activeExams = useMemo(() => {
     if (!rawExams) return [];
     return [...rawExams].sort((a: any, b: any) => (a.displayOrder || 0) - (b.displayOrder || 0));
  }, [rawExams]);

  const recruitmentBoards = useMemo(() => {
     if (!boards) return [];
     return boards.filter((b: any) => b.id !== 'current-affairs');
  }, [boards]);

  if (authLoading) return <div className="h-screen w-full flex items-center justify-center bg-white"><Zap className="h-10 w-10 text-primary animate-pulse" /></div>;

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-body text-left selection:bg-primary/10 flex flex-col overflow-x-hidden">
      <Navbar />
      
      <section className="bg-white border-b border-slate-100 py-10 md:py-24 relative overflow-hidden">
         <div className="absolute top-0 right-0 w-1/3 h-full bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
         
         <div className="container mx-auto px-4 md:px-12 max-w-7xl relative z-10 space-y-10">
            <div className="flex items-center gap-4">
               <button onClick={() => router.back()} className="h-10 w-10 rounded-xl md:rounded-2xl border border-slate-100 bg-white flex items-center justify-center text-slate-400 hover:text-primary transition-all shadow-sm active:scale-90">
                  <ChevronLeft className="h-5 w-5 md:h-6 md:w-6" />
               </button>
               <Badge className="bg-primary/10 text-primary border-none px-4 py-1.5 rounded-full font-bold text-[9px] md:text-[11px] tracking-widest shadow-sm">Official category</Badge>
            </div>

            <div className="flex flex-col lg:flex-row items-center gap-8 md:gap-14">
               <AuthorityLogo category={category} size="lg" className="h-24 w-24 md:h-36 md:w-36 rounded-[2rem] md:rounded-[3rem] bg-slate-50 border-[6px] border-slate-100 shadow-5xl group-hover:scale-105 transition-transform shrink-0" />
               <div className="space-y-4 text-center lg:text-left flex-1 min-w-0">
                  <h1 className="text-2xl sm:text-4xl md:text-6xl font-[800] text-[#0F172A] leading-1.1 tracking-tight antialiased">
                     {category?.title || "Exam selection"}
                  </h1>
                  <p className="text-sm md:text-xl text-slate-500 font-medium leading-relaxed max-w-3xl">
                     {category?.description || "Select a verified authority hub or exam vertical to start your journey."}
                  </p>
               </div>
            </div>
         </div>
      </section>

      <main className="container mx-auto px-4 md:px-12 py-10 md:py-20 max-w-7xl flex-1 space-y-16">
         
         {recruitmentBoards && recruitmentBoards.length > 0 && (
            <section className="space-y-10 text-left">
               <div className="flex items-center gap-3 px-2">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-inner"><Landmark className="h-5 w-5" /></div>
                  <h2 className="text-xl md:text-3xl font-black tracking-tight text-[#0F172A]">Recruitment boards</h2>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10">
                  {recruitmentBoards.map((board) => (
                     <Link key={board.id} href={`/exams/hub/${board.id}`}>
                        <Card className="border border-slate-100 shadow-xl hover:shadow-5xl transition-all duration-500 rounded-[2.5rem] bg-white group overflow-hidden flex flex-col p-8 md:p-12 text-left h-full relative">
                           <div className="flex justify-between items-start mb-10">
                              <AuthorityLogo board={board} size="md" className="h-16 w-16 md:h-20 md:w-20 bg-slate-50 rounded-xl group-hover:scale-105 transition-transform" />
                              <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-primary group-hover:text-white transition-all shadow-inner">
                                 <ArrowRight className="h-4 w-4" />
                              </div>
                           </div>
                           <div className="space-y-2 flex-1">
                              <h3 className="text-xl md:text-2xl font-black text-[#0F172A] group-hover:text-primary transition-colors leading-tight">{board.abbreviation} hub</h3>
                              <p className="text-[10px] md:text-xs font-bold text-slate-400 tracking-widest">{board.name}</p>
                           </div>
                           <div className="mt-10 pt-8 border-t border-slate-50 flex items-center justify-between">
                              <span className="text-[9px] font-bold text-slate-400 tracking-tight">View all tests</span>
                              <Badge className="bg-emerald-50 text-emerald-600 border-none font-black text-[8px] px-2 py-0.5 rounded shadow-sm">12+ Exams</Badge>
                           </div>
                        </Card>
                     </Link>
                  ))}
               </div>
            </section>
         )}

         {activeExams.length > 0 && (
            <section className="space-y-10 text-left">
               <div className="flex items-center gap-3 px-2">
                  <div className="h-10 w-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-500 shadow-inner"><Zap className="h-5 w-5" /></div>
                  <h2 className="text-xl md:text-3xl font-black tracking-tight text-[#0F172A]">Exam verticals</h2>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10">
                  {activeExams.map((exam) => (
                     <Link key={exam.id} href={`/exams/view?id=${exam.id}`}>
                        <Card className="border border-slate-100 shadow-xl hover:shadow-5xl transition-all duration-500 rounded-[2.5rem] bg-white group overflow-hidden flex flex-col p-8 md:p-12 text-left h-full">
                           <div className="flex justify-between items-start mb-8">
                              <AuthorityLogo boardId={exam.boardId} size="md" className="h-16 w-16 bg-slate-50 rounded-xl" />
                              <div className="flex items-center gap-1 text-amber-500">
                                 <Star className="h-3 w-3 fill-current" />
                                 <span className="text-[10px] font-black text-slate-400">4.8</span>
                              </div>
                           </div>
                           <h3 className="text-xl md:text-2xl font-black text-[#0F172A] group-hover:text-primary transition-colors leading-tight mb-6 flex-1">{exam.name}</h3>
                           <div className="mt-auto">
                              <Button className="w-full h-14 rounded-2xl bg-[#0F172A] hover:bg-black text-white font-black text-[10px] tracking-widest gap-3 shadow-xl border-none transition-all active:scale-95">
                                 Start prep <ChevronRight className="h-4 w-4 ml-auto opacity-30" />
                              </Button>
                           </div>
                        </Card>
                     </Link>
                  ))}
               </div>
            </section>
         )}

         {!boardsLoading && !examsLoading && recruitmentBoards?.length === 0 && activeExams.length === 0 && (
            <div className="py-40 text-center opacity-30 italic font-black uppercase tracking-0.5em flex flex-col items-center gap-10">
               <Layers className="h-20 w-20 text-slate-200" />
               <p className="text-xl md:text-3xl">Registry standby</p>
            </div>
         )}
      </main>

      <Footer />
    </div>
  )
}
