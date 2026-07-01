"use client"

import { useMemo, useEffect } from "react"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import { useCollection, useFirestore, useUser } from "@/firebase"
import { collection, query, where, orderBy } from "firebase/firestore"
import { Card, CardContent } from "@/components/ui/card"
import { Bookmark, Search, Trash2, ChevronRight, BookOpen, ShieldCheck, Languages, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"

/**
 * @fileOverview Official Bookmarks Hub (AI Cleaned).
 */

export default function BookmarksPage() {
  const db = useFirestore()
  const router = useRouter()
  const pathname = usePathname()
  const { user, loading: authLoading } = useUser()
  
  useEffect(() => {
    if (!authLoading && !user) {
      router.push(`/login?returnUrl=${encodeURIComponent(pathname)}`);
    }
  }, [user, authLoading, router, pathname]);

  const bookmarkQuery = useMemo(() => (db && user ? query(collection(db, "bookmarks"), where("userId", "==", user.uid)) : null), [db, user])
  const { data: bookmarks, loading } = useCollection<any>(bookmarkQuery)

  if (authLoading || !user) return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-white space-y-4">
       <Zap className="h-10 w-10 text-primary animate-pulse" />
       <p className="text-[10px] font-black uppercase text-slate-300">Syncing Identity...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50/30">
      <Navbar />
      <main className="container mx-auto px-6 py-16 max-w-5xl">
        <div className="space-y-12">
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                 <Bookmark className="h-5 w-5 text-primary" />
                 <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Your Study Repository</span>
              </div>
              <h1 className="text-5xl md:text-7xl font-headline font-black text-[#0F172A] tracking-tight uppercase leading-[0.9]">
                Saved <br/> <span className="text-primary">MCQs</span>
              </h1>
              <p className="text-slate-500 font-medium text-lg max-w-xl">
                Review and master questions you&apos;ve bookmarked during your high-fidelity mock attempts.
              </p>
            </div>
            <div className="relative w-full md:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input className="pl-12 h-14 rounded-2xl bg-white border-none shadow-xl shadow-slate-200/50" placeholder="Search saved questions..." />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-40 w-full rounded-[2.5rem]" />
              ))
            ) : bookmarks && bookmarks.length > 0 ? (
              bookmarks.map((b) => (
                <Card key={b.id} className="border-none shadow-2xl shadow-slate-200/30 bg-white hover:translate-y-[-4px] transition-all duration-300 rounded-[2.5rem] overflow-hidden group">
                  <CardContent className="p-10 space-y-6">
                    <div className="flex items-center justify-between">
                       <div className="flex items-center gap-4">
                          <Badge className="bg-primary/10 text-primary border-none text-[9px] font-black uppercase tracking-widest px-3">
                             {b.subject || 'General GK'}
                          </Badge>
                          <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Added: {new Date(b.timestamp).toLocaleDateString()}</span>
                       </div>
                       <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl text-rose-500 hover:bg-rose-50">
                          <Trash2 className="h-5 w-5" />
                       </Button>
                    </div>
                    
                    <h3 className="text-xl md:text-2xl font-bold text-[#0F172A] leading-tight">
                       {b.questionText}
                    </h3>

                    <div className="pt-6 border-t border-slate-50 flex items-center justify-between">
                       <div className="flex gap-4">
                          <Button variant="outline" className="rounded-xl border-slate-100 text-[10px] font-black uppercase h-10 px-6 gap-2">
                             <Languages className="h-4 w-4" /> English
                          </Button>
                          <Button variant="ghost" className="text-primary font-black uppercase text-[10px] gap-2">
                             <BookOpen className="h-4 w-4" /> View Solution
                          </Button>
                       </div>
                       <Button variant="ghost" className="h-12 w-12 rounded-2xl bg-slate-50 hover:bg-primary hover:text-white transition-all">
                          <ChevronRight className="h-5 w-5" />
                       </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="h-80 flex flex-col items-center justify-center text-slate-400 bg-white rounded-[3rem] border-2 border-dashed border-slate-100 shadow-inner">
                <Bookmark className="h-16 w-16 mb-6 opacity-10" />
                <p className="font-black font-headline text-xl text-[#0F172A]">No Bookmarks Yet</p>
                <p className="text-sm font-bold opacity-50 mt-1 uppercase tracking-widest">Save questions during tests to revise them later.</p>
                <Button asChild className="mt-8 bg-primary text-white rounded-xl h-11 px-8 font-black uppercase text-[10px]">
                   <Link href="/mocks">Start Practice</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
