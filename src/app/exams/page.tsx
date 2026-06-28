"use client"

import { useMemo, useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import { useCollection, useFirestore, useUser } from "@/firebase"
import { collection, query, orderBy, doc, updateDoc, arrayUnion, arrayRemove, serverTimestamp } from "firebase/firestore"
import { Landmark, ChevronRight, Zap, BookOpen, Search, Star, CheckCircle2, RefreshCw, Layers, GraduationCap } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"
import { AuthorityLogo } from "@/lib/exam-icons"
import { useToast } from "@/hooks/use-toast"

/**
 * @fileOverview High-Density Category Explorer v31.0.
 * UPDATED: Normalized typography - removed uppercase and reduced header scale.
 */

const AUTHORIZED_CATEGORY_IDS = [
  "punjab-government-exams",
  "punjab-teaching-exams",
  "punjab-technical-exams",
  "banking-exams",
  "judiciary-exams",
  "central-government-exams"
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
  const { data: mocks } = useCollection<any>(useMemo(() => (db ? collection(db, "mocks") : null), [db]));
  const { data: boards } = useCollection<any>(useMemo(() => (db ? collection(db, "boards") : null), [db]));

  const categories = useMemo(() => {
    if (!rawCategories) return [];
    return rawCategories.filter(c => AUTHORIZED_CATEGORY_IDS.includes(c.id));
  }, [rawCategories]);

  const filteredExams = useMemo(() => {
    if (!searchTerm || !exams) return [];
    const term = searchTerm.toLowerCase().trim();
    return exams.filter(e => 
      e.name?.toLowerCase().includes(term) || 
      e.boardId?.toLowerCase().includes(term)
    ).slice(0, 8);
  }, [exams, searchTerm]);

  const handleTogglePin = async (e: React.MouseEvent, examId: string) => {
    e.preventDefault(); e.stopPropagation();
    if (!db || !user || pinningId) return;
    setPinningId(examId);
    const isPinned = profile?.pinnedExams?.includes(examId);
    const userRef = doc(db, "users", user.uid);
    try {
      if (isPinned) {
        await updateDoc(userRef, { pinnedExams: arrayRemove(examId), updatedAt: serverTimestamp() });
        toast({ title: "Removed from hub" });
      } else {
        await updateDoc(userRef, { pinnedExams: arrayUnion(examId), updatedAt: serverTimestamp() });
        toast({ title: "Added to your hub" });
      }
    } catch (err) {
      toast({ variant: "destructive", title: "Sync failed" });
    } finally { setPinningId(null); }
  };

  if (authLoading || !user) return <div className="h-screen w-full flex flex-col items-center justify-center bg-white space-y-4"><Zap className="h-10 w-10 text-primary animate-pulse" /></div>;

  return (
    <div className="flex flex-col min-h-screen bg-slate-50/50 font-body text-left">
      <Navbar />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-16 max-w-[1440px]">
        
        <div className="text-left mb-8 md:mb-20 space-y-8">
          <div className="space-y-3">
             <div className="flex items-center gap-2">
                <div className="h-8 w-8 bg-primary/10 rounded-lg flex items-center justify-center text-primary shadow-inner"><Landmark className="h-5 w-5" /></div>
                <span className="text-[10px] font-black text-slate-400 tracking-wider">Registry Discovery</span>
             </div>
             <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-[#0F172A] leading-tight tracking-tight">Exam Selection</h1>
             <p className="text-slate-500 font-medium text-[12px] md:text-xl max-w-3xl">Find your exam vertical or browse by recruitment category below.</p>
          </div>

          <div className="relative max-w-3xl group">
             <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-6 w-6 text-slate-400 group-focus-within:text-primary transition-colors" />
             <Input 
                className="h-16 md:h-20 pl-16 rounded-2xl md:rounded-[2.5rem] bg-white border-slate-200 shadow-xl text-base md:text-xl font-bold" 
                placeholder="Search specific exam (e.g. Patwari)..." 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
             />
             
             {searchTerm.length >= 2 && (
                <div className="absolute top-full left-0 right-0 mt-3 bg-white rounded-[2rem] shadow-5xl border border-slate-100 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
                   <div className="p-5 border-b border-slate-50 bg-slate-50/30 flex items-center justify-between">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Matching Verticals</span>
                      <button onClick={() => setSearchTerm("")} className="text-slate-400 hover:text-rose-500"><RefreshCw className="h-4 w-4" /></button>
                   </div>
                   <div className="divide-y divide-slate-50 max-h-[400px] overflow-y-auto">
                      {filteredExams.length > 0 ? filteredExams.map((e) => {
                         const isPinned = profile?.pinnedExams?.includes(e.id);
                         const board = boards?.find((b: any) => b.id === e.boardId);
                         return (
                            <div key={e.id} className="flex items-center justify-between p-5 hover:bg-slate-50 transition-all">
                               <Link href={`/exams/view?id=${e.id}`} className="flex items-center gap-6 flex-1 min-w-0">
                                  <div className="h-12 w-12 bg-slate-100 rounded-xl flex items-center justify-center shrink-0">
                                     <GraduationCap className="h-6 w-6 text-slate-400" />
                                  </div>
                                  <div className="min-w-0">
                                     <p className="font-bold text-[#0F172A] truncate text-base md:text-lg">{e.name}</p>
                                     <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{board?.abbreviation || 'PSSSB'} HUB</p>
                                  </div>
                               </Link>
                               <button 
                                  onClick={(ev) => handleTogglePin(ev, e.id)} 
                                  disabled={pinningId === e.id}
                                  className={cn(
                                     "h-12 w-12 rounded-xl border flex items-center justify-center transition-all shadow-sm shrink-0 ml-4",
                                     isPinned ? "bg-primary border-primary text-white" : "bg-white border-slate-200 text-slate-300 hover:text-primary hover:border-primary/30"
                                  )}
                               >
                                  {pinningId === e.id ? <RefreshCw className="h-5 w-5 animate-spin" /> : isPinned ? <CheckCircle2 className="h-5 w-5" /> : <Star className="h-5 w-5" />}
                               </button>
                            </div>
                         )
                      }) : (
                         <div className="p-12 text-center text-slate-400 italic text-sm">No exam nodes matching your query.</div>
                      )}
                   </div>
                </div>
             )}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8 lg:gap-10">
           {catLoading ? (
             Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-64 md:h-96 w-full rounded-[2.5rem] bg-slate-50" />)
           ) : categories.map((cat) => {
              const catExams = exams?.filter(e => e.categoryId === cat.id) || [];
              const catExamIds = catExams.map(e => e.id);
              const catMocksCount = mocks?.filter(m => {
                const eids = m.examIds || (m.examId ? [m.examId] : []);
                return eids.some((id: string) => catExamIds.includes(id));
              }).length || 0;
              
              return (
                <Link key={cat.id} href={`/exams/category/${cat.id}`}>
                    <Card className="border border-[#E5E7EB] shadow-sm hover:shadow-2xl transition-all duration-500 rounded-[2rem] md:rounded-[3rem] bg-white group overflow-hidden h-full flex flex-col p-5 md:p-10">
                       <div className="flex justify-between items-start mb-6 md:mb-12">
                          <AuthorityLogo category={cat} size="sm" className="w-12 h-12 md:w-20 md:h-20 bg-slate-50 rounded-xl md:rounded-[2rem] shadow-inner group-hover:scale-105 transition-transform" />
                          <Badge className="bg-[#0F172A] text-white border-none text-[7px] md:text-[10px] font-black px-3 py-1 rounded shadow-sm">Canonical</Badge>
                       </div>
                       <h3 className="text-sm md:text-xl xl:text-2xl font-black text-[#0F172A] group-hover:text-primary transition-colors leading-tight mb-4 md:mb-6">{cat.title}</h3>
                       
                       <div className="space-y-2 md:space-y-3 mt-auto flex-1">
                          <MiniStat label="Exams Registered" count={catExams.length} icon={BookOpen} />
                          {catMocksCount > 0 && <MiniStat label="Tests Available" count={catMocksCount} icon={Zap} />}
                       </div>

                       <div className="mt-8 md:mt-16 pt-4 border-t border-slate-50">
                          <Button variant="ghost" className="w-full h-10 md:h-14 rounded-xl md:rounded-2xl bg-[#0F172A] text-white group-hover:bg-primary transition-all font-black text-[9px] md:text-[11px] tracking-tight border-none shadow-md gap-3">
                             Explore Hub <ChevronRight className="h-4 w-4" />
                          </Button>
                       </div>
                    </Card>
                </Link>
              )
           })}
        </div>
      </main>
      <Footer />
    </div>
  )
}

function MiniStat({ label, count, icon: Icon }: any) {
   return (
      <div className="flex items-center gap-2.5 text-slate-500 font-bold text-[9px] md:text-[13px] uppercase">
         <Icon className="h-4 w-4 md:h-5 md:w-5 text-primary/50" />
         <span className="text-[#0F172A] font-black tabular-nums">{count}</span>
         <span className="text-[8px] md:text-[11px] tracking-tight">{label}</span>
      </div>
   )
}
