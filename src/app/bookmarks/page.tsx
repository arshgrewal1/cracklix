"use client"

import { useMemo, useEffect, useState } from "react"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import { useCollection, useFirestore, useUser } from "@/firebase"
import { collection, query, where, doc, deleteDoc, getDoc, writeBatch, getDocs } from "firebase/firestore"
import { 
  Bookmark, 
  Search, 
  Trash2, 
  ChevronRight, 
  BookOpen, 
  ShieldCheck, 
  Languages, 
  Zap, 
  X, 
  AlertCircle, 
  Loader2, 
  Target, 
  BrainCircuit, 
  Calculator, 
  Cpu, 
  Landmark, 
  History as HistoryIcon, 
  Newspaper,
  ArrowUpDown,
  FileText
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import QuestionRenderer from "@/components/questions/QuestionRenderer"
import { motion, AnimatePresence } from "framer-motion"

/**
 * @fileOverview Official Bookmarks Hub v9.0 [Compact List Redesign].
 * FIXED: Removed card-based layout in favor of high-density list items.
 * FIXED: Implemented text-based category tabs with blue underline.
 */

const CATEGORY_TABS = [
  { id: "all", label: "All" },
  { id: "Current Affairs", label: "Current Affairs" },
  { id: "Study Materials", label: "Study Materials" },
  { id: "PDFs", label: "PDFs" },
  { id: "Mocks", label: "Mocks" },
];

export default function BookmarksPage() {
  const db = useFirestore()
  const router = useRouter()
  const { user, loading: authLoading } = useUser()
  
  const [mounted, setMounted] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [activeFilter, setActiveFilter] = useState("all")
  
  const [selectedQuestion, setSelectedQuestion] = useState<any>(null);
  const [isViewing, setIsViewing] = useState(false);
  const [loadingItem, setLoadingItem] = useState(false);
  const [isClearingAll, setIsClearingAll] = useState(false);

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted && !authLoading && !user) {
      const returnUrl = window.location.pathname + window.location.search;
      router.push(`/login?returnUrl=${encodeURIComponent(returnUrl)}`);
    }
  }, [user, authLoading, router, mounted]);

  const bookmarkQuery = useMemo(() => (db && user ? query(collection(db, "bookmarks"), where("userId", "==", user.uid)) : null), [db, user])
  const { data: rawBookmarks, loading } = useCollection<any>(bookmarkQuery)

  const bookmarks = useMemo(() => {
    if (!rawBookmarks) return [];
    const term = searchTerm.toLowerCase().trim();
    return rawBookmarks.filter((b: any) => {
       const matchesSearch = !term || 
          b.questionText?.toLowerCase().includes(term) || 
          b.subject?.toLowerCase().includes(term);
       
       const sub = (b.subject || "").toLowerCase();
       const type = (b.type || "").toLowerCase();

       const matchesFilter = activeFilter === 'all' || 
          sub.includes(activeFilter.toLowerCase()) ||
          type.includes(activeFilter.toLowerCase()) ||
          (activeFilter === 'Current Affairs' && (sub.includes('current') || type.includes('ca'))) ||
          (activeFilter === 'Study Materials' && (sub.includes('note') || type.includes('notes'))) ||
          (activeFilter === 'PDFs' && (sub.includes('pdf') || type.includes('pdf'))) ||
          (activeFilter === 'Mocks' && (sub.includes('mock') || type.includes('test')));

       return matchesSearch && matchesFilter;
    }).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [rawBookmarks, searchTerm, activeFilter]);

  const handleDelete = async (e: React.MouseEvent, id: string) => {
     e.stopPropagation();
     if (!db) return;
     try {
       await deleteDoc(doc(db, "bookmarks", id));
     } catch (e) {
       console.error("[Purge_Failure]:", e);
     }
  }

  const handleClearAll = async () => {
    if (!db || !user || bookmarks.length === 0) return;
    setIsClearingAll(true);
    try {
      const batch = writeBatch(db);
      const q = query(collection(db, "bookmarks"), where("userId", "==", user.uid));
      const snap = await getDocs(q);
      snap.docs.forEach(d => batch.delete(d.ref));
      await batch.commit();
    } finally {
      setIsClearingAll(false);
    }
  };

  const handleViewSolution = async (questionId: string) => {
    if (!db || !questionId) return;
    setLoadingItem(true);
    try {
      let qSnap = await getDoc(doc(db, "mcqBank", questionId));
      if (!qSnap.exists()) {
        qSnap = await getDoc(doc(db, "questions", questionId));
      }

      if (qSnap.exists()) {
        setSelectedQuestion(qSnap.data());
        setIsViewing(true);
      } else {
        alert("Original question has been archived from the bank.");
      }
    } finally {
      setLoadingItem(false);
    }
  };

  if (authLoading || !user || !mounted) return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-background space-y-4">
       <Zap className="h-10 w-10 text-primary animate-pulse" />
       <p className="text-[10px] font-bold text-muted-foreground tracking-widest uppercase">Syncing vault...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-white font-body text-left selection:bg-primary/10 flex flex-col">
      <Navbar />
      
      <main className="flex-1 w-full max-w-4xl mx-auto px-4 md:px-6 py-8 md:py-12 space-y-6 md:space-y-10 pb-32">
        
        {/* 1. COMPACT HEADER */}
        <header className="flex items-start justify-between px-1">
          <div className="space-y-1">
            <h1 className="text-2xl md:text-4xl font-black text-[#0F172A] tracking-tighter antialiased">
              Bookmarks
            </h1>
            <p className="text-muted-foreground font-medium text-[11px] md:text-sm">
              Your saved questions, articles and resources
            </p>
          </div>
          <button 
            onClick={handleClearAll}
            disabled={isClearingAll || bookmarks.length === 0}
            className="h-10 w-10 md:h-12 md:w-12 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-all border border-slate-100 shadow-sm active:scale-90 shrink-0 cursor-pointer disabled:opacity-30"
            title="Clear all bookmarks"
          >
            {isClearingAll ? <Loader2 className="h-5 w-5 animate-spin" /> : <Trash2 className="h-5 w-5" />}
          </button>
        </header>

        {/* 2. CATEGORY NAVIGATION */}
        <div className="border-b border-slate-100 -mx-4 px-4">
           <div className="flex items-center gap-6 md:gap-10 overflow-x-auto no-scrollbar pb-0">
              {CATEGORY_TABS.map(tab => (
                 <button 
                   key={tab.id} 
                   onClick={() => setActiveFilter(tab.id)}
                   className={cn(
                      "pb-4 text-[13px] md:text-[15px] font-bold transition-all relative whitespace-nowrap border-none bg-transparent cursor-pointer",
                      activeFilter === tab.id 
                        ? "text-primary" 
                        : "text-slate-400 hover:text-slate-600"
                   )}
                 >
                    {tab.label}
                    {activeFilter === tab.id && (
                       <motion.div 
                         layoutId="activeTabUnderline"
                         className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" 
                       />
                    )}
                 </button>
              ))}
           </div>
        </div>

        {/* 3. SORT & COUNT ROW */}
        <div className="flex items-center justify-between px-1 text-[11px] md:text-xs font-bold text-slate-400 uppercase tracking-widest">
           <div className="flex items-center gap-1 hover:text-[#0F172A] transition-colors cursor-pointer">
              Latest first <ChevronRight className="h-3 w-3 rotate-90" />
           </div>
           <div className="tabular-nums">
              Total {bookmarks.length} items
           </div>
        </div>

        {/* 4. SEARCH BAR */}
        <div className="relative group">
           <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 group-focus-within:text-primary transition-colors" />
           <Input 
             value={searchTerm}
             onChange={e => setSearchTerm(e.target.value)}
             placeholder="Search saved items..." 
             className="h-11 md:h-12 pl-11 rounded-xl bg-slate-50 border-slate-100 shadow-inner font-bold text-sm"
           />
        </div>

        {/* 5. BOOKMARK LIST */}
        <div className="space-y-0">
          <AnimatePresence mode="popLayout">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="py-6 border-b border-slate-50 space-y-3">
                  <Skeleton className="h-3 w-32 rounded bg-slate-50" />
                  <Skeleton className="h-5 w-full rounded bg-slate-50" />
                  <Skeleton className="h-3 w-48 rounded bg-slate-50" />
                </div>
              ))
            ) : bookmarks && bookmarks.length > 0 ? (
              bookmarks.map((b, idx) => (
                <motion.div 
                  key={b.id}
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  onClick={() => handleViewSolution(b.questionId)}
                  className="group relative flex flex-col py-6 md:py-8 border-b border-slate-100 hover:bg-slate-50/50 transition-all cursor-pointer px-1"
                >
                  <div className="flex items-center justify-between gap-4 mb-2">
                     <div className="flex items-center gap-3">
                        <span className="text-[11px] md:text-xs font-black text-primary uppercase tracking-tighter">
                           {b.subject || 'Database vault'}
                        </span>
                        <div className="w-1 h-1 rounded-full bg-slate-200" />
                        <span className="text-[10px] md:text-[11px] font-bold text-slate-300 tabular-nums">
                           Saved: {new Date(b.timestamp).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </span>
                     </div>
                     <button 
                       onClick={(e) => handleDelete(e, b.id)}
                       className="h-8 w-8 rounded-lg text-slate-300 hover:text-rose-500 hover:bg-rose-50 active:scale-90 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100 border-none bg-transparent cursor-pointer"
                     >
                        <Trash2 className="h-4 w-4" />
                     </button>
                  </div>
                  
                  <div className="flex items-start justify-between gap-6">
                     <div className="flex-1 space-y-3">
                        <h3 className="text-[16px] md:text-[19px] font-bold text-[#0F172A] leading-snug line-clamp-2 tracking-tight">
                           {b.questionText || b.title}
                        </h3>

                        <div className="flex flex-wrap items-center gap-4">
                           <MetaNode icon={Languages} text="Bilingual" />
                           <MetaNode icon={ShieldCheck} text="Verified" />
                           <MetaNode icon={Target} text={b.difficulty || "Standard"} />
                        </div>
                     </div>
                     
                     <div className="shrink-0 pt-2">
                        <div className="h-8 w-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:text-primary group-hover:bg-primary/10 transition-all shadow-inner">
                           <ChevronRight className="h-4 w-4" />
                        </div>
                     </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="py-32 flex flex-col items-center justify-center text-center space-y-6 opacity-20">
                <Bookmark className="h-16 w-16 text-slate-400" />
                <div className="space-y-1">
                   <p className="font-black text-xl uppercase tracking-widest">Vault Empty</p>
                   <p className="text-sm font-bold">No saved items found in this section.</p>
                </div>
              </div>
            )}
          </AnimatePresence>
        </div>
      </main>

      <Footer />

      <Dialog open={isViewing} onOpenChange={setIsViewing}>
        <DialogContent className="sm:max-w-3xl w-[95vw] max-h-[90vh] overflow-y-auto rounded-3xl bg-white p-0 border-none shadow-5xl text-left flex flex-col">
          <div className="h-1.5 w-full bg-primary shrink-0" />
          <DialogHeader className="px-8 md:px-12 py-8 border-b border-slate-50 shrink-0 text-left">
             <div className="flex justify-between items-center">
                <DialogTitle className="text-xl md:text-3xl font-black text-[#0F172A] tracking-tighter">Official solution</DialogTitle>
                <button onClick={() => setIsViewing(false)} className="p-2 rounded-xl hover:bg-slate-50 text-slate-400 cursor-pointer border-none bg-transparent"><X className="h-6 w-6" /></button>
             </div>
             <DialogDescription className="text-[10px] font-bold text-slate-400 mt-2 tracking-widest uppercase">Verified institutional rationale</DialogDescription>
          </DialogHeader>
          <div className="px-6 md:px-12 py-10 flex-1">
             {selectedQuestion && (
                <QuestionRenderer 
                  question={selectedQuestion} 
                  language="ENGLISH_PUNJABI" 
                  showSolution={true} 
                  className="p-0 shadow-none border-none bg-transparent"
                />
             )}
          </div>
          <div className="p-8 bg-slate-50/50 border-t border-slate-100 flex justify-center shrink-0">
             <Button onClick={() => setIsViewing(false)} className="rounded-full px-12 h-14 bg-[#0F172A] hover:bg-black text-white font-black text-[10px] tracking-widest">
                Close Preview
             </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function MetaNode({ icon: Icon, text }: { icon: any, text: string }) {
   return (
      <div className="flex items-center gap-2 text-slate-400 font-bold text-[10px] md:text-[11px] tracking-tight">
         <Icon className="h-3.5 w-3.5 text-primary/40" />
         <span>{text}</span>
      </div>
   )
}