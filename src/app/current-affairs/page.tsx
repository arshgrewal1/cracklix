
"use client"

import { useMemo, useState } from "react"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import { useCollection, useFirestore } from "@/firebase"
import { collection, query, orderBy } from "firebase/firestore"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, BookOpen, Share2, Search, ArrowRight, Zap, Award, Globe, Landmark, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"

const CATEGORIES = [
  { id: "All", icon: <Globe className="h-4 w-4" /> },
  { id: "Punjab", icon: <Landmark className="h-4 w-4" /> },
  { id: "India", icon: <Globe className="h-4 w-4" /> },
  { id: "Economy", icon: <TrendingUp className="h-4 w-4" /> },
  { id: "Sports", icon: <Award className="h-4 w-4" /> },
  { id: "Schemes", icon: <Zap className="h-4 w-4" /> }
]

export default function CurrentAffairs() {
  const db = useFirestore()
  const [activeCategory, setActiveCategory] = useState("All")
  const [searchTerm, setSearchTerm] = useState("")

  const caQuery = useMemo(() => {
    if (!db) return null
    return query(collection(db, "current_affairs"), orderBy("date", "desc"))
  }, [db])

  const { data: currentAffairs, loading } = useCollection<any>(caQuery)

  const filteredCA = useMemo(() => {
    if (!currentAffairs) return []
    return currentAffairs.filter(ca => {
      const matchesCategory = activeCategory === "All" || ca.category === activeCategory
      const matchesSearch = ca.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           ca.summary?.toLowerCase().includes(searchTerm.toLowerCase())
      return matchesCategory && matchesSearch
    })
  }, [currentAffairs, activeCategory, searchTerm])

  return (
    <div className="flex flex-col min-h-screen bg-slate-50/30">
      <Navbar />
      <main className="container mx-auto px-6 py-12">
        <div className="max-w-6xl mx-auto space-y-12">
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
            <div className="space-y-4">
              <Badge className="bg-primary/10 text-primary border-none px-4 py-1 rounded-full font-black uppercase text-[10px] tracking-[0.2em]">
                Content Hub
              </Badge>
              <h1 className="text-5xl md:text-7xl font-headline font-black text-[#0F172A] tracking-tight uppercase leading-[0.9]">
                Punjab Daily <br/> <span className="text-primary">Analysis</span>
              </h1>
              <p className="text-slate-500 font-medium text-lg max-w-xl">
                Strategic news highlights and in-depth analysis verified for Punjab Government recruitment exams.
              </p>
            </div>
            <div className="relative w-full md:w-96">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <Input 
                className="pl-12 h-16 rounded-[1.5rem] bg-white border-none shadow-2xl shadow-slate-200/50 text-lg" 
                placeholder="Search analysis..." 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-3 pb-4 overflow-x-auto custom-scrollbar">
             {CATEGORIES.map(cat => (
               <Button 
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                variant={activeCategory === cat.id ? "default" : "outline"}
                className={`rounded-2xl px-8 h-12 font-bold border-none transition-all flex items-center gap-3 ${activeCategory === cat.id ? 'bg-primary text-white shadow-xl shadow-primary/30' : 'bg-white text-slate-500 shadow-sm hover:shadow-lg'}`}
               >
                 {cat.icon}
                 {cat.id}
               </Button>
             ))}
          </div>

          <div className="grid grid-cols-1 gap-8">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-64 w-full rounded-[3rem]" />
              ))
            ) : filteredCA.length > 0 ? (
              filteredCA.map((ca) => (
                <Card key={ca.id} className="bg-white border-none shadow-2xl shadow-slate-200/40 hover:shadow-3xl transition-all duration-500 rounded-[3rem] overflow-hidden group">
                  <div className="flex flex-col md:flex-row items-stretch">
                    <div className="md:w-1/3 relative min-h-[250px] bg-slate-100 overflow-hidden">
                       <img 
                        src={ca.imageUrl || `https://picsum.photos/seed/${ca.id}/800/600`} 
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        alt={ca.title}
                       />
                       <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                       <div className="absolute bottom-6 left-6">
                          <Badge className="bg-primary text-white border-none px-3 py-1 font-black uppercase text-[9px] tracking-widest">
                            {ca.category}
                          </Badge>
                       </div>
                    </div>
                    <div className="md:w-2/3 p-10 md:p-14 flex flex-col justify-center space-y-6">
                      <div className="flex items-center gap-3 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                        <Calendar className="h-4 w-4" /> {ca.date}
                        <div className="h-1 w-1 rounded-full bg-slate-300" />
                        <BookOpen className="h-4 w-4" /> 4 Min Read
                      </div>
                      
                      <h2 className="text-3xl md:text-4xl font-headline font-black leading-tight text-[#0F172A] group-hover:text-primary transition-colors">
                        {ca.title}
                      </h2>
                      
                      <p className="text-slate-500 text-lg leading-relaxed font-medium line-clamp-2">
                        {ca.summary}
                      </p>

                      <div className="flex items-center justify-between pt-8 border-t border-slate-50">
                        <Button variant="ghost" className="text-primary font-black uppercase tracking-widest text-xs gap-3 p-0 hover:bg-transparent hover:translate-x-2 transition-all">
                          Start Deep Analysis <ArrowRight className="h-5 w-5" />
                        </Button>
                        <div className="flex gap-4">
                           <Button variant="ghost" size="icon" className="h-12 w-12 rounded-2xl bg-slate-50 hover:bg-primary hover:text-white transition-all">
                             <Share2 className="h-5 w-5" />
                           </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))
            ) : (
              <div className="h-96 flex flex-col items-center justify-center text-slate-400 bg-white rounded-[3rem] border-2 border-dashed border-slate-100 shadow-inner">
                <Search className="h-16 w-16 mb-6 opacity-10" />
                <p className="font-black font-headline text-xl">No Analysis Found</p>
                <p className="text-sm font-bold opacity-50 mt-1 uppercase tracking-widest">Try a different category or keyword.</p>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
