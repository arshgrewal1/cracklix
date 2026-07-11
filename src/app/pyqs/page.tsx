"use client"

import { useMemo, useState, useEffect } from "react"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import { useCollection, useFirestore } from "@/firebase"
import { collection, query, orderBy } from "firebase/firestore"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  FileText, 
  Download, 
  Eye, 
  Search, 
  ShieldCheck, 
  ChevronRight,
  FileStack,
  Loader2,
  Sparkles
} from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
import { AuthorityLogo } from "@/lib/exam-icons"
import { useStudyAnalytics } from "@/hooks/use-study-analytics";

/**
 * @fileOverview Official PYQ Hub v2.6 (Study Analytics Integration).
 */

export default function PYQPage() {
  const db = useFirestore()
  const [searchTerm, setSearchTerm] = useState("")
  const { startTracking, stopTracking } = useStudyAnalytics('pyq');

  useEffect(() => {
    startTracking();
    return () => {
      stopTracking();
    };
  }, [startTracking, stopTracking]);

  const pyqQuery = useMemo(() => {
    if (!db) return null
    return query(collection(db, "pyqs"), orderBy("year", "desc"))
  }, [db])

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

  return (
    <div className="flex flex-col min-h-screen bg-slate-50/50 font-body">
      <Navbar />
      
      <main className="container mx-auto px-4 md:px-6 py-12 md:py-20 max-w-5xl text-center">
        <div className="space-y-12 md:space-y-16">
          
          <div className="space-y-4 md:space-y-6">
            <div className="flex items-center justify-center gap-3">
               <AuthorityLogo boardId="pyq" size="sm" className="bg-transparent shadow-none p-0" />
               <Badge className="bg-primary/10 text-primary border-none px-4 py-1 rounded-full font-black text-[10px] tracking-widest">Archive Node</Badge>
            </div>
            <h1 className="text-2xl md:text-5xl font-headline font-black text-[#0F172A] tracking-tight leading-tight">
              Previous Year Papers
            </h1>
            <p className="text-slate-500 font-medium text-sm md:text-xl max-w-2xl mx-auto">
              Authentic exam papers with verified official answer keys.
            </p>
          </div>

          <div className="relative max-w-2xl mx-auto group">
             <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 group-focus-within:text-primary transition-colors" />
             <Input 
                className="h-14 md:h-16 pl-14 rounded-2xl md:rounded-[1.5rem] bg-white border-none shadow-xl text-base md:text-lg font-bold text-[#0F172A]" 
                placeholder="Search institutional archives..." 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
             />
          </div>

          <div className="grid grid-cols-1 gap-8 md:gap-12">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-64 w-full rounded-[2.5rem] bg-white" />
              ))
            ) : Object.entries(groupedPyqs).length > 0 ? (
              Object.entries(groupedPyqs).map(([groupTitle, items]: [string, any[]]) => (
                <Card key={groupTitle} className="border-none shadow-3xl rounded-[2.5rem] md:rounded-[3.5rem] bg-white overflow-hidden text-left border border-slate-100 p-6 md:p-14">
                  <CardHeader className="p-0 mb-8 flex flex-row items-center gap-5 md:gap-10">
                    <div className="h-14 w-14 md:h-20 md:w-20 rounded-[1.2rem] bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 shadow-inner">
                       <FileStack className="h-7 w-7 md:h-10 text-slate-300" />
                    </div>
                    <div>
                       <h2 className="text-xl md:text-3xl font-headline font-black text-primary leading-tight">{groupTitle}</h2>
                       <p className="text-[9px] md:text-xs font-black text-slate-400 uppercase tracking-[0.3em] mt-1">{items[0]?.boardId || 'Official'} Series</p>
                    </div>
                  </CardHeader>

                  <CardContent className="p-0 space-y-3 md:space-y-4">
                    {items.map((paper) => (
                      <div 
                        key={paper.id} 
                        className="flex flex-col sm:flex-row items-center justify-between p-5 md:p-8 rounded-xl md:rounded-[2rem] bg-slate-50/50 border border-slate-100 hover:bg-white hover:shadow-xl transition-all group/node"
                      >
                         <div className="flex flex-col mb-4 sm:mb-0 text-center sm:text-left">
                            <span className="text-base md:text-xl font-bold text-[#0F172A] leading-none">{paper.title}</span>
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-2">Audit Year: {paper.year}</span>
                         </div>
                         
                         <div className="flex items-center gap-3">
                            <Button 
                              asChild 
                              variant="ghost" 
                              className="h-10 md:h-12 px-5 rounded-xl font-black uppercase text-[9px] tracking-widest gap-2 text-[#0F172A] hover:bg-slate-100"
                            >
                               <a href={paper.pdfUrl} target="_blank" rel="noopener noreferrer">
                                  <Eye className="h-4 w-4" /> View
                               </a>
                            </Button>
                            <Button 
                              asChild 
                              className="h-10 md:h-12 px-6 bg-white border-2 border-primary text-primary hover:bg-primary hover:text-white rounded-xl font-black uppercase text-[9px] tracking-widest gap-2 shadow-sm transition-all"
                            >
                               <a href={paper.pdfUrl} target="_blank" rel="noopener noreferrer">
                                  <Download className="h-4 w-4" /> PDF
                               </a>
                            </Button>
                         </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="py-32 flex flex-col items-center justify-center text-slate-300 opacity-20 text-center">
                 <Sparkles className="h-16 w-16 mb-6" />
                 <p className="font-headline font-black text-xl uppercase tracking-[0.3em]">Registry Hub Empty</p>
                 <p className="text-sm font-bold uppercase mt-2">Awaiting institutional archive push.</p>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
