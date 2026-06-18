"use client"

import { useState, useMemo } from "react"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { FileStack, Download, Eye, Search, Sparkles, ChevronRight, FileText } from "lucide-react"
import { useCollection, useFirestore } from "@/firebase"
import { collection, query, orderBy } from "firebase/firestore"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

/**
 * @fileOverview Official Institutional Previous Papers Hub v1.0.
 */

export default function PreviousPapersPage() {
  const db = useFirestore()
  const [searchTerm, setSearchTerm] = useState("")

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
      <main className="container mx-auto px-4 md:px-6 py-12 md:py-24 max-w-5xl text-center">
        <div className="space-y-16">
          <div className="space-y-4">
            <h1 className="text-4xl md:text-7xl font-headline font-black text-primary uppercase tracking-tight leading-none">
              PREVIOUS PAPERS
            </h1>
            <p className="text-slate-500 font-medium text-lg md:text-xl max-w-2xl mx-auto">
              Access authentic exam papers with official answer keys for all major recruitments.
            </p>
          </div>

          <div className="relative max-w-2xl mx-auto group">
             <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 group-focus-within:text-primary transition-colors" />
             <Input 
                className="h-16 pl-14 pr-6 rounded-[1.5rem] bg-white border-none shadow-xl text-lg font-bold text-[#0F172A]" 
                placeholder="Search official archives..." 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
             />
          </div>

          <div className="grid grid-cols-1 gap-12">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-64 w-full rounded-[3.5rem]" />
              ))
            ) : Object.entries(groupedPyqs).length > 0 ? (
              Object.entries(groupedPyqs).map(([groupTitle, items]: [string, any[]]) => (
                <Card key={groupTitle} className="border-none shadow-3xl rounded-[3.5rem] bg-white overflow-hidden text-left border border-slate-100 p-8 md:p-14">
                  <CardHeader className="p-0 mb-10 flex flex-row items-center gap-6 md:gap-10">
                    <div className="h-16 w-16 md:h-20 md:w-20 rounded-[1.5rem] bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 shadow-inner">
                       <FileStack className="h-8 md:h-10 text-slate-300" />
                    </div>
                    <div>
                       <h2 className="text-2xl md:text-4xl font-headline font-black text-primary uppercase leading-tight">{groupTitle}</h2>
                       <p className="text-[10px] md:text-sm font-black text-slate-400 uppercase tracking-[0.3em] mt-1">{items[0]?.boardId || 'OFFICIAL'} HUB</p>
                    </div>
                  </CardHeader>

                  <CardContent className="p-0 space-y-4">
                    {items.map((paper) => (
                      <div 
                        key={paper.id} 
                        className="flex flex-col sm:flex-row items-center justify-between p-6 md:p-8 rounded-[2rem] bg-slate-50/50 border border-slate-100 hover:bg-white hover:shadow-xl transition-all group/node"
                      >
                         <div className="flex flex-col mb-4 sm:mb-0 text-center sm:text-left">
                            <span className="text-lg md:text-2xl font-black text-[#0F172A] uppercase leading-none">{paper.title}</span>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">Audit Year: {paper.year}</span>
                         </div>
                         
                         <div className="flex items-center gap-3">
                            <Button 
                              asChild 
                              variant="ghost" 
                              className="h-12 px-6 rounded-xl font-black uppercase text-[10px] tracking-widest gap-2 text-[#0F172A] hover:bg-slate-100"
                            >
                               <a href={paper.pdfUrl} target="_blank" rel="noopener noreferrer">
                                  <Eye className="h-4 w-4" /> View
                               </a>
                            </Button>
                            <Button 
                              asChild 
                              className="h-12 px-8 bg-white border-2 border-primary text-primary hover:bg-primary hover:text-white rounded-xl font-black uppercase text-[10px] tracking-widest gap-2 shadow-sm transition-all"
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
                 <Sparkles className="h-20 w-20 mb-8" />
                 <p className="font-headline font-black text-2xl uppercase tracking-[0.3em]">Registry Hub Empty</p>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
