"use client"

import { useMemo, useEffect, useState } from "react"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import { useCollection, useFirestore, useUser } from "@/firebase"
import { collection, query, where, doc, deleteDoc } from "firebase/firestore"
import { Card, CardContent } from "@/components/ui/card"
import { Bookmark, Search, Trash2, ChevronRight, BookOpen, ShieldCheck, Languages, Zap, X, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

/**
 * @fileOverview Official Bookmarks Hub (Unified Persistence).
 */

export default function BookmarksPage() {
  const db = useFirestore()
  const router = useRouter()
  const pathname = usePathname()
  const { user, loading: authLoading } = useUser()
  const [searchTerm, setSearchTerm] = useState("")
  
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
    return rawBookmarks.filter((b: any) => 
       !term || 
       b.questionText?.toLowerCase().includes(term) || 
       b.subject?.toLowerCase().includes(term)
    );
  }, [rawBookmarks, searchTerm]);

  const handleDelete = async (id: string) => {
     if (!db) return;
     await deleteDoc(doc(db, "bookmarks", id));
  }

  if (authLoading || !user) return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-white space-y-4">
       <Zap className="h-10 w-10 text-primary animate-pulse" />
       <p className="text-[10px] font-black uppercase text-slate-300">Syncing Identity...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50/30">
      <Navbar />
      <main className="container mx-auto px-4 md:px-6 py-12 md:py-24 max-w-5xl text-left">
        <div className="space-y-12">
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                 <Bookmark className="h-5 w-5 text-primary" />
                 <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Study Repository</span>
              </div>
              <h1 className="text-4xl md:text-7xl font-headline font-black text-[#0F172A] tracking-tight uppercase leading-[0.9]">
                Saved <br/> <span className="text-primary">Registry</span>
              </h1>
              <p className="text-slate-500 font-medium text-sm md:text-lg max-w-xl">
                Review questions and articles you&apos;ve bookmarked across the platform.
              </p>
            </div>
            <div className="relative w-full md:w-80 group">
              <Search className={cn("absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 transition-colors", searchTerm ? "text-primary" : "text-slate-400")} />
              <Input 
                className="pl-12 pr-10 h-14 rounded-2xl bg-white border-none shadow-xl shadow-slate-200/50 font-bold" 
                placeholder="Search bookmarks..." 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-50 rounded-full">
                  <X className="h-4 w-4 text-slate-400" />
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-40 w-full rounded-[2.5rem] bg-white" />
              ))
            ) : bookmarks && bookmarks.length > 0 ? (
              bookmarks.map((b) => (
                <Card key={b.id} className="border-none shadow-2xl shadow-slate-200/30 bg-white hover:translate-y-[-4px] transition-all duration-300 rounded-[2.5rem] overflow-hidden group">
                  <CardContent className="p-8 md:p-12 space-y-6">
                    <div className="flex items-center justify-between">
                       <div className="flex items-center gap-4">
                          <Badge className="bg-primary/10 text-primary border-none text-[9px] font-black uppercase tracking-widest px-3">
                             {b.subject || 'General Hub'}
                          </Badge>
                          <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest tabular-nums">Saved: {new Date(b.timestamp).toLocaleDateString()}</span>
                       </div>
                       <Button variant="ghost" size="icon" onClick={() => handleDelete(b.id)} className="h-10 w-10 rounded-xl text-rose-500 hover:bg-rose-50 active:scale-95">
                          <Trash2 className="h-5 w-5" />
                       </Button>
                    </div>
                    
                    <h3 className="text-xl md:text-2xl font-bold text-[#0F172A] leading-tight line-clamp-3">
                       {b.questionText || b.title}
                    </h3>

                    <div className="pt-6 border-t border-slate-50 flex flex-col sm:flex-row items-center justify-between gap-4">
                       <div className="flex gap-4 w-full sm:w-auto">
                          <Button variant="outline" className="flex-1 sm:flex-none rounded-xl border-slate-100 text-[10px] font-black uppercase h-10 px-6 gap-2">
                             <Languages className="h-4 w-4" /> Bilingual
                          </Button>
                          <Button asChild variant="ghost" className="flex-1 sm:flex-none text-primary font-black uppercase text-[10px] gap-2">
                             <Link href={`/mocks/instructions?id=${b.mockId || 'manual'}`}><BookOpen className="h-4 w-4" /> View Solution</Link>
                          </Button>
                       </div>
                       <Button variant="ghost" className="h-12 w-12 rounded-2xl bg-slate-50 hover:bg-primary hover:text-white transition-all hidden sm:flex items-center justify-center">
                          <ChevronRight className="h-5 w-5" />
                       </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="h-80 flex flex-col items-center justify-center text-slate-400 bg-white rounded-[3rem] border-2 border-dashed border-slate-100 shadow-inner">
                {searchTerm ? <Search className="h-16 w-16 mb-6 opacity-10" /> : <Bookmark className="h-16 w-16 mb-6 opacity-10" />}
                <p className="font-black font-headline text-xl text-[#0F172A]">{searchTerm ? 'No matching nodes' : 'Registry empty'}</p>
                <p className="text-sm font-bold opacity-50 mt-1 uppercase tracking-widest text-center px-6">
                  {searchTerm ? 'Try a different search keyword.' : 'Save items across the platform to see them here.'}
                </p>
                {!searchTerm && (
                   <Button asChild className="mt-8 bg-primary rounded-full h-12 px-8">
                      <Link href="/mocks">Explore Content</Link>
                   </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
