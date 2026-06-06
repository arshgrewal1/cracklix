
"use client"

import { useMemo, useState } from "react"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import { useCollection, useFirestore } from "@/firebase"
import { collection, query, orderBy, where } from "firebase/firestore"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, BookOpen, Share2, Search, ArrowRight, Zap, Award, Globe, Landmark, TrendingUp, FileText, FileStack, ExternalLink, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

/**
 * @fileOverview Institutional Free Study Hub v1.0.
 * Replaces Analysis section with a dynamic, category-based free content CMS.
 */

const CATEGORIES = [
  { id: "all", label: "All Items", icon: <Globe className="h-4 w-4" /> },
  { id: "mock", label: "Mock Tests", icon: <Zap className="h-4 w-4" /> },
  { id: "pdf", label: "Blueprints", icon: <FileText className="h-4 w-4" /> },
  { id: "current", label: "Current Affairs", icon: <TrendingUp className="h-4 w-4" /> },
  { id: "pyq", label: "Official PYQs", icon: <FileStack className="h-4 w-4" /> }
]

export default function FreeContentHub() {
  const db = useFirestore()
  const [activeFilter, setActiveFilter] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")

  const contentQuery = useMemo(() => {
    if (!db) return null
    return query(collection(db, "free_content"), orderBy("updatedAt", "desc"))
  }, [db])

  const { data: content, loading } = useCollection<any>(contentQuery)

  const filteredItems = useMemo(() => {
    if (!content) return []
    return content.filter(item => {
      const matchesType = activeFilter === "all" || item.type === activeFilter
      const matchesSearch = item.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           item.description?.toLowerCase().includes(searchTerm.toLowerCase())
      return matchesType && matchesSearch
    })
  }, [content, activeFilter, searchTerm])

  return (
    <div className="flex flex-col min-h-screen bg-slate-50/30 font-body">
      <Navbar />
      <main className="container mx-auto px-4 md:px-6 py-12">
        <div className="max-w-6xl mx-auto space-y-12">
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 text-left">
            <div className="space-y-4">
              <Badge className="bg-primary/10 text-primary border-none px-4 py-1 rounded-full font-black uppercase text-[10px] tracking-[0.2em]">
                Free Access Node
              </Badge>
              <h1 className="text-4xl md:text-7xl font-headline font-black text-[#0F172A] tracking-tight uppercase leading-[0.9]">
                FREE STUDY <br/> <span className="text-primary">MATERIAL</span>
              </h1>
              <p className="text-slate-500 font-medium text-base md:text-lg max-w-xl">
                High-fidelity repository of mock tests, blueprints, and verified analysis for Punjab recruitments.
              </p>
            </div>
            <div className="relative w-full md:w-96">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <Input 
                className="pl-12 h-16 rounded-[1.5rem] bg-white border-none shadow-2xl shadow-slate-200/50 text-lg font-medium" 
                placeholder="Search repository..." 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-3 pb-4 overflow-x-auto no-scrollbar">
             {CATEGORIES.map(cat => (
               <Button 
                key={cat.id}
                onClick={() => setActiveFilter(cat.id)}
                variant={activeFilter === cat.id ? "default" : "outline"}
                className={cn(
                  "rounded-2xl px-6 md:px-8 h-12 font-black uppercase text-[10px] tracking-widest border-none transition-all flex items-center gap-3 shrink-0",
                  activeFilter === cat.id ? 'bg-[#0B1528] text-white shadow-xl' : 'bg-white text-slate-400 shadow-sm hover:shadow-lg'
                )}
               >
                 {cat.icon}
                 {cat.label}
               </Button>
             ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pb-32">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-64 w-full rounded-[3rem]" />
              ))
            ) : filteredItems.length > 0 ? (
              filteredItems.map((item) => (
                <Card key={item.id} className="bg-white border-none shadow-2xl shadow-slate-200/40 hover:shadow-3xl transition-all duration-500 rounded-[3rem] overflow-hidden group text-left flex flex-col">
                  <CardContent className="p-10 flex-1 flex flex-col">
                    <div className="flex justify-between items-start mb-6">
                       <div className={cn(
                          "h-16 w-16 rounded-2xl flex items-center justify-center shrink-0 shadow-inner group-hover:scale-105 transition-transform",
                          item.type === 'mock' ? 'bg-orange-50 text-primary' : 'bg-blue-50 text-blue-500'
                       )}>
                          {item.type === 'mock' ? <Zap className="h-8 w-8" /> : 
                           item.type === 'pdf' ? <FileText className="h-8 w-8" /> : 
                           item.type === 'pyq' ? <FileStack className="h-8 w-8" /> : <TrendingUp className="h-8 w-8" />}
                       </div>
                       <Badge className="bg-slate-50 text-slate-400 border-none px-3 py-1 font-black uppercase text-[8px] tracking-widest">
                          {CATEGORIES.find(c => c.id === item.type)?.label || 'FREE NODE'}
                       </Badge>
                    </div>

                    <div className="space-y-3 flex-1">
                      <h2 className="text-2xl font-headline font-black leading-tight text-[#0F172A] group-hover:text-primary transition-colors uppercase">
                        {item.title}
                      </h2>
                      <p className="text-slate-400 text-sm font-medium leading-relaxed line-clamp-2">
                        {item.description}
                      </p>
                    </div>

                    <div className="mt-8 pt-8 border-t border-slate-50 flex items-center justify-between">
                       <div className="flex items-center gap-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                          <Calendar className="h-3.5 w-3.5" /> 
                          {item.updatedAt?.seconds ? new Date(item.updatedAt.seconds * 1000).toLocaleDateString('en-GB') : "Recently Updated"}
                       </div>
                       <Button asChild className="bg-[#0B1528] hover:bg-black text-white font-black uppercase text-[10px] tracking-[0.2em] h-12 px-8 rounded-xl shadow-xl">
                          <a href={item.link || "#"} target="_blank" rel="noopener noreferrer">
                             {item.type === 'mock' ? 'Attempt' : 'Open Node'} <ArrowRight className="ml-2 h-4 w-4" />
                          </a>
                       </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-full h-96 flex flex-col items-center justify-center text-slate-400 bg-white rounded-[4rem] border-2 border-dashed border-slate-100 shadow-inner">
                <Search className="h-16 w-16 mb-6 opacity-10" />
                <p className="font-headline font-black text-2xl uppercase text-[#0F172A]">No Content Found</p>
                <p className="text-sm font-bold opacity-50 mt-1 uppercase tracking-widest">Awaiting official content push to the registry.</p>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
