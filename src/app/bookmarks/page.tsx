
"use client"

import { useMemo, useEffect, useState } from "react"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import { useCollection, useFirestore, useUser } from "@/firebase"
import { collection, query, where, doc, deleteDoc, getDoc } from "firebase/firestore"
import { Card, CardContent } from "@/components/ui/card"
import { Bookmark, Search, Trash2, ChevronRight, BookOpen, ShieldCheck, Languages, Zap, X, AlertCircle, Loader2 } from "lucide-react"
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
 * @fileOverview Official Bookmarks Hub v5.0 (Premium Redesign).
 * FIXED: Integrated high-fidelity card system and sticky search hub.
 * ADDED: Direct Solution Preview Modal for frictionless revision.
 */

const FILTER_CHIPS = [
  { id: "all", label: "All Items" },
  { id: "Questions", label: "Questions" },
  { id: "Notes", label: "Study Notes" },
  { id: "CA", label: "Current Affairs" },
  { id: "History", label: "History" },
  { id: "Punjab GK", label: "Punjab GK" },
  { id: "Math", label: "Mathematics" },
];

export default function BookmarksPage() {
  const db = useFirestore()
  const router = useRouter()
  const pathname = usePathname()
  const { user, loading: authLoading } = useUser()
  
  const [searchTerm, setSearchTerm] = useState("")
  const [activeFilter, setActiveFilter] = useState("all")
  
  // Modal State for Quick Revision
  const [selectedQuestion, setSelectedQuestion] = useState<any>(null);
  const [isViewing, setIsViewing] = useState(false);
  const [loadingNode, setLoadingNode] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push(`/login?returnUrl=${encodeURIComponent(pathname)}`);
    }
  }, [user, authLoading, router, pathname]);

  const bookmarkQuery = useMemo(() => (db && user ? query(collection(db, "bookmarks"), where("userId", "==", user.uid)) : null), [db, user])
  const { data: rawBookmarks, loading } = useCollection<any>(bookmarkQuery)

  const bookmarks = useMemo(() => {
    if (!rawBookmarks) return [];
    const term = searchTerm.toLowerCase().trim();
    return rawBookmarks.filter((b: any) => {
       const matchesSearch = !term || 
          b.questionText?.toLowerCase().includes(term) || 
          b.subject?.toLowerCase().includes(term);
       
       const matchesFilter = activeFilter === 'all' || 
          b.subject?.toLowerCase() === activeFilter.toLowerCase() ||
          b.type?.toLowerCase() === activeFilter.toLowerCase();

       return matchesSearch && matchesFilter;
    }).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [rawBookmarks, searchTerm, activeFilter]);

  const handleDelete = async (id: string) => {
     if (!db) return;
     try {
       await deleteDoc(doc(db, "bookmarks", id));
     } catch (e) {
       console.error("[Purge_Failure]:", e);
     }
  }

  const handleViewSolution = async (questionId: string) => {
    if (!db || !questionId) return;
    setLoadingNode(true);
    try {
      // Audit both collections for the question node
      let qSnap = await getDoc(doc(db, "mcqBank", questionId));
      if (!qSnap.exists()) {
        qSnap = await getDoc(doc(db, "questions", questionId));
      }

      if (qSnap.exists()) {
        setSelectedQuestion(qSnap.data());
        setIsViewing(true);
      } else {
        // Handle case where original node was purged
        alert("Original question node has been archived from the bank.");
      }
    } finally {
      setLoadingNode(false);
    }
  };

  if (authLoading || !user) return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-white space-y-4">
       <Zap className="h-10 w-10 text-primary animate-pulse" />
       <p className="text-[10px] font-black uppercase text-slate-300 tracking-[0.4em]">Syncing Identity...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-white font-body text-left selection:bg-primary/10 flex flex-col">
      <Navbar />
      
      <main className="flex-1 w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-16 space-y-10 md:space-y-16 pb-32">
        
        {/* 1. COMPACT HEADER */}
        <section className="space-y-4 px-1">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-2"
          >
            <div className="flex items-center gap-3">
               <Bookmark className="h-5 w-5 text-primary" />
               <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Personal Registry</span>
            </div>
            <h1 className="text-3xl md:text-6xl font-black text-[#0F172A] tracking-tighter leading-none uppercase antialiased">
              Saved <span className="text-primary italic">Items.</span>
            </h1>
            <p className="text-slate-500 font-medium text-sm md:text-lg max-w-xl leading-snug">
              Review your bookmarked questions and notes for high-speed revision.
            </p>
          </motion.div>
        </section>

        {/* 2. STICKY SEARCH & FILTERS */}
        <div className="sticky top-[80px] z-[45] bg-white/90 backdrop-blur-xl -mx-4 px-4 py-4 md:py-6 border-b border-slate-50">
           <div className="max-w-4xl mx-auto space-y-6">
              <div className="relative group">
                 <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors">
                    <Search className="h-5 w-5" />
                 </div>
                 <Input 
                   value={searchTerm}
                   onChange={e => setSearchTerm(e.target.value)}
                   placeholder="Search saved statements..." 
                   className="h-14 md:h-16 pl-16 pr-14 rounded-2xl bg-white border-slate-200 shadow-xl text-base md:text-lg font-bold placeholder:text-slate-200 focus:ring-4 focus:ring-primary/5 transition-all"
                 />
                 {searchTerm && (
                   <button onClick={() => setSearchTerm('')} className="absolute right-6 top-1/2 -translate-y-1/2 p-2 hover:bg-slate-50 rounded-full transition-all">
                      <X className="h-5 w-5 text-slate-400" />
                   </button>
                 )}
              </div>

              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 px-1">
                 {FILTER_CHIPS.map(chip => (
                    <button 
                      key={chip.id} 
                      onClick={() => setActiveFilter(chip.id)}
                      className={cn(
                         "h-9 px-6 rounded-full font-black text-[9px] md:text-[10px] uppercase tracking-widest transition-all border active:scale-95 shadow-sm whitespace-nowrap",
                         activeFilter === chip.id 
                            ? "bg-primary border-primary text-white shadow-lg shadow-primary/20" 
                            : "bg-white border-slate-100 text-slate-400 hover:border-slate-300 hover:text-slate-600"
                      )}
                    >
                       {chip.label}
                    </button>
                 ))}
              </div>
           </div>
        </div>

        {/* 3. BOOKMARK FEED */}
        <div className="max-w-4xl mx-auto space-y-6">
          <AnimatePresence mode="popLayout">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="p-8 bg-white border border-slate-50 rounded-[2rem] space-y-4">
                  <div className="flex justify-between"><Skeleton className="h-6 w-32 rounded-lg" /><Skeleton className="h-6 w-10 rounded-lg" /></div>
                  <Skeleton className="h-20 w-full rounded-2xl" />
                  <Skeleton className="h-12 w-40 rounded-xl" />
                </div>
              ))
            ) : bookmarks && bookmarks.length > 0 ? (
              bookmarks.map((b, idx) => (
                <motion.div 
                  key={b.id}
                  layout
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3, delay: idx * 0.05 }}
                >
                  <Card className="border border-slate-100 shadow-sm hover:shadow-2xl transition-all duration-500 rounded-[2rem] bg-white group overflow-hidden">
                    <CardContent className="p-6 md:p-10 space-y-6 text-left">
                      <div className="flex items-center justify-between">
                         <div className="flex items-center gap-4">
                            <Badge className="bg-primary/5 text-primary border-none text-[9px] font-black uppercase tracking-widest px-3 py-1 shadow-sm">
                               {b.subject || 'Registry Hub'}
                            </Badge>
                            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest tabular-nums">
                               Saved: {new Date(b.timestamp).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                            </span>
                         </div>
                         <button 
                           onClick={() => handleDelete(b.id)}
                           className="h-10 w-10 rounded-xl text-slate-300 hover:text-rose-500 hover:bg-rose-50 active:scale-90 transition-all flex items-center justify-center opacity-40 group-hover:opacity-100"
                         >
                            <Trash2 className="h-5 w-5" />
                         </button>
                      </div>
                      
                      <div className="space-y-4">
                        <h3 className="text-xl md:text-2xl font-bold text-[#0F172A] leading-tight line-clamp-2 uppercase tracking-tight">
                           {b.questionText || b.title}
                        </h3>

                        <div className="flex flex-wrap items-center gap-4 pt-2">
                           <MetaNode icon={Languages} text="Bilingual" />
                           <MetaNode icon={ShieldCheck} text="Verified" />
                           <MetaNode icon={Target} text={b.difficulty || "Standard"} />
                        </div>
                      </div>

                      <div className="pt-6 border-t border-slate-50 flex flex-col sm:flex-row items-center justify-between gap-4">
                         <div className="flex items-center gap-3 w-full sm:w-auto">
                            <Button 
                              onClick={() => handleViewSolution(b.questionId)} 
                              variant="outline" 
                              className="flex-1 sm:flex-none h-11 px-8 rounded-xl border-2 border-slate-100 font-black uppercase text-[10px] tracking-widest hover:bg-primary/5 hover:text-primary transition-all active:scale-95 gap-2"
                            >
                               {loadingNode ? <Loader2 className="h-4 w-4 animate-spin" /> : <BookOpen className="h-4 w-4" />} 
                               View Rationale
                            </Button>
                         </div>
                         <div className="hidden md:flex h-11 w-11 rounded-xl bg-slate-50 items-center justify-center text-slate-200 group-hover:text-primary group-hover:bg-primary/5 transition-all">
                            <ChevronRight className="h-5 w-5" />
                         </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            ) : (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-32 flex flex-col items-center justify-center text-center space-y-10 bg-slate-50 rounded-[4rem] border-2 border-dashed border-slate-100 shadow-inner mx-1"
              >
                <div className="relative">
                   <div className="h-32 w-32 bg-white rounded-[3rem] flex items-center justify-center shadow-xl border border-slate-50">
                      <Bookmark className="h-16 w-16 text-slate-100" />
                   </div>
                   <div className="absolute -bottom-4 -right-4 h-12 w-12 bg-primary rounded-2xl flex items-center justify-center text-white shadow-2xl animate-bounce">
                      <Zap className="h-6 w-6 fill-current" />
                   </div>
                </div>
                <div className="space-y-4 max-w-sm px-6">
                   <h2 className="text-3xl font-black text-[#0F172A] uppercase tracking-tighter">No Saved Content</h2>
                   <p className="text-slate-400 font-bold text-sm md:text-base uppercase tracking-widest leading-relaxed">Bookmark important questions and notes for quick institutional revision.</p>
                </div>
                <Button asChild className="h-16 px-12 bg-[#0F172A] hover:bg-black text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-2xl border-none transition-all active:scale-95">
                   <Link href="/mocks">Explore Practice Hub</Link>
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      <Footer />

      {/* SOLUTION PREVIEW DIALOG */}
      <Dialog open={isViewing} onOpenChange={setIsViewing}>
        <DialogContent className="sm:max-w-3xl w-[95vw] max-h-[90vh] overflow-y-auto rounded-[2.5rem] md:rounded-[3.5rem] bg-white p-0 border-none shadow-5xl text-left flex flex-col">
          <div className="h-2 w-full bg-primary shrink-0" />
          <DialogHeader className="px-8 md:px-12 py-8 border-b border-slate-50 shrink-0">
             <DialogTitle className="text-2xl md:text-4xl font-black uppercase text-[#0F172A] tracking-tighter">Official Solution</DialogTitle>
             <DialogDescription className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] mt-2">Verified Institutional Rationale</DialogDescription>
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
          <div className="p-8 bg-slate-50 border-t border-slate-100 flex justify-center shrink-0">
             <Button onClick={() => setIsViewing(false)} className="rounded-full px-12 h-14 bg-[#0F172A] hover:bg-black text-white font-black uppercase text-[10px] tracking-widest shadow-xl">
                Close Node
             </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function MetaNode({ icon: Icon, text }: { icon: any, text: string }) {
   return (
      <div className="flex items-center gap-2 text-slate-400 font-bold text-[9px] uppercase tracking-widest bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
         <Icon className="h-3.5 w-3.5" />
         <span>{text}</span>
      </div>
   )
}
