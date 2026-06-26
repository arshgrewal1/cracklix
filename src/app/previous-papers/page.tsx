"use client"

import { useState, useMemo, useEffect } from "react"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { FileStack, Download, Eye, Search, Sparkles, ChevronRight, FileText, Zap } from "lucide-react"
import { useCollection, useFirestore, useUser } from "@/firebase"
import { collection, query, orderBy } from "firebase/firestore"
import { Skeleton } from "@/components/ui/skeleton"
import { useRouter, usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

/**
 * @fileOverview Institutional Previous Papers Hub v2.2.
 * RESPONSIVE: Expanded container and optimized desktop width.
 */

export default function PreviousPapersPage() {
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

  const pyqQuery = useMemo(() => {
    if (!db || !user) return null
    return query(collection(db, "pyqs"), orderBy("year", "desc"))
  }, [db, user])

  const { data: pyqs, loading } = useCollection<any>(pyqQuery)

  const groupedPyqs = useMemo(() => {
    if (!pyqs) return {}
    const filtered = pyqs.filter((p: any) => 
      p.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      p.boardId?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    
    const groups: Record<string, any[]> = {}
    filtered.forEach(p => {
      const groupTitle = p.title.replace(/\d{4}.*$/, '').trim() + " Papers"
      if (!groups[groupTitle]) groups[groupTitle] = []
      groups[groupTitle].push(p)
    })
    return groups
  }, [pyqs, searchTerm])

  if (authLoading || !user) return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-white space-y-4">
       <Zap className="h-10 w-10 text-primary animate-pulse" />
       <p className="text-[10px] font-black uppercase text-slate-300">Securing Archive...</p>
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen bg-slate-50/50 font-body">
      <Navbar />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-24 max-w-[1440px] text-center">
        <div className="space-y-16 md:space-y-24">
          <div className="space-y-6 md:space-y-10">
            <h1 className="text-3xl sm:text-5xl md:text-7xl lg:text-9xl font-black text-[#0F172A] break-words antialiased leading-[0.9] tracking-tighter uppercase">
              Previous <br/> <span className="text-primary">Papers Hub</span>
            </h1>
            <p className="text-slate-500 font-medium text-sm md:text-2xl max-w-4xl mx-auto leading-snug">
              Access authentic solved exam papers with verified official answer keys for all major Punjab Government recruitments.
            </p>
          </div>

          <div className="relative max-w-4xl mx-auto group">
             <div className="absolute -inset-1 bg-gradient-to-r from-primary/10 to-blue-400/10 rounded-2xl blur opacity-20 transition duration-1000"></div>
             <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-7 w-7 text-slate-300 group-focus-within:text-primary transition-colors" />
             <Input 
                className="h-16 md:h-24 pl-16 pr-8 rounded-2xl md:rounded-[2.5rem] bg-white border-none shadow-2xl text-lg md:text-2xl font-bold text-[#0F172A]" 
                placeholder="Search official archives..." 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
             />
          </div>

          <div className="grid grid-cols-1 gap-12 md:gap-20">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-64 w-full rounded-[3.5rem]" />
              ))
            ) : Object.entries(groupedPyqs).length > 0 ? (
              Object.entries(groupedPyqs).map(([groupTitle, items]: [string, any[]]) => (
                <Card key={groupTitle} className="border-none shadow-4xl rounded-[3rem] md:rounded-[4rem] bg-white overflow-hidden text-left border border-slate-100 p-6 md:p-16">
                  <CardHeader className="p-0 mb-10 md:mb-16 flex flex-row items-center gap-6 md:gap-12">
                    <div className="h-16 w-16 md:h-28 md:w-28 rounded-2xl md:rounded-[2.5rem] bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 shadow-inner">
                       <FileStack className="h-8 w-8 md:h-14 md:w-14 text-slate-300" />
                    </div>
                    <div>
                       <h2 className="text-2xl md:text-5xl font-headline font-black text-primary uppercase leading-tight tracking-tight">{groupTitle}</h2>
                       <p className="text-[10px] md:text-[14px] font-black text-slate-400 uppercase tracking-[0.4em] mt-2">{items[0]?.boardId || 'PSSSB'} REGISTRY HUB</p>
                    </div>
                  </CardHeader>

                  <CardContent className="p-0 space-y-4 md:space-y-6">
                    {items.map((paper) => (
                      <div 
                        key={paper.id} 
                        className="flex flex-col md:flex-row items-center justify-between p-6 md:p-10 rounded-[2rem] md:rounded-[2.5rem] bg-slate-50/50 border border-slate-100 hover:bg-white hover:shadow-2xl transition-all group/node"
                      >
                         <div className="flex flex-col mb-6 md:mb-0 text-center md:text-left">
                            <span className="text-xl md:text-3xl font-black text-[#0F172A] uppercase leading-none tracking-tight">{paper.title}</span>
                            <div className="flex items-center justify-center md:justify-start gap-4 mt-3">
                               <Badge className="bg-primary/5 text-primary border-none text-[8px] md:text-[11px] font-black uppercase px-3 py-1">Official Pattern</Badge>
                               <span className="text-[10px] md:text-[13px] font-bold text-slate-400 uppercase tracking-widest">Year: {paper.year}</span>
                            </div>
                         </div>
                         
                         <div className="flex items-center gap-4 w-full md:w-auto">
                            <Button 
                              asChild 
                              variant="ghost" 
                              className="h-12 md:h-16 px-8 rounded-2xl font-black uppercase text-[10px] md:text-[11px] tracking-widest gap-3 text-[#0F172A] hover:bg-slate-100 flex-1 md:flex-none"
                            >
                               <a href={paper.pdfUrl} target="_blank" rel="noopener noreferrer">
                                  <Eye className="h-5 w-5" /> View
                               </a>
                            </Button>
                            <Button 
                              asChild 
                              className="h-12 md:h-16 px-10 md:px-14 bg-[#0F172A] hover:bg-black text-white rounded-2xl md:rounded-3xl font-black uppercase text-[10px] md:text-[12px] tracking-widest gap-3 shadow-xl transition-all flex-1 md:flex-none border-none active:scale-95"
                            >
                               <a href={paper.pdfUrl} target="_blank" rel="noopener noreferrer">
                                  <Download className="h-5 w-5" /> Fetch PDF
                               </a>
                            </Button>
                         </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="py-40 flex flex-col items-center justify-center text-slate-300 opacity-20 text-center space-y-8">
                 <Sparkles className="h-24 w-24 text-slate-400" />
                 <p className="font-headline font-black text-3xl uppercase tracking-widest">Archive Hub Empty</p>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
