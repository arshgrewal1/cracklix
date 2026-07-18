"use client"

import React, { useMemo, useState } from "react"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import { useCollection, useFirestore, useUser } from "@/firebase"
import { collection, query, where, orderBy } from "firebase/firestore"
import { Card, CardContent } from "@/components/ui/card"
import { 
  Zap, 
  ChevronRight, 
  BookOpen, 
  Star, 
  ShieldCheck, 
  Layers, 
  Search,
  BookMarked
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { motion } from "framer-motion"
import { Skeleton } from "@/components/ui/skeleton"
import Image from "next/image"
import { Subject } from "@/types"

/**
 * @fileOverview Level 1: Subject Selection Hub v1.0.
 * Displays beautiful cards for each learning subject.
 */

export default function SubjectsPage() {
  const db = useFirestore()
  const { user } = useUser()
  const [searchTerm, setSearchTerm] = useState("")

  const subjectsQuery = useMemo(() => (db ? query(collection(db, "subjects"), where("isActive", "==", true), orderBy("displayOrder", "asc")) : null), [db]);
  const { data: subjects, loading: sLoading } = useCollection<Subject>(subjectsQuery as any);

  const seriesQuery = useMemo(() => (db ? collection(db, "test_series") : null), [db]);
  const { data: allSeries } = useCollection<any>(seriesQuery);

  const mocksQuery = useMemo(() => (db ? query(collection(db, "mocks"), where("published", "==", true), where("mockType", "==", "SUBJECT")) : null), [db]);
  const { data: allMocks } = useCollection<any>(mocksQuery);

  const statsMap = useMemo(() => {
    const map: Record<string, { seriesCount: number, testCount: number }> = {};
    if (!subjects) return map;

    subjects.forEach(s => {
       map[s.id] = {
          seriesCount: (allSeries || []).filter(ser => ser.subjectId === s.id).length,
          testCount: (allMocks || []).filter(m => m.learningSubjectId === s.id).length
       };
    });
    return map;
  }, [subjects, allSeries, allMocks]);

  const filteredSubjects = useMemo(() => {
     if (!subjects) return [];
     return subjects.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [subjects, searchTerm]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-body text-left">
      <Navbar />
      
      <main className="container mx-auto px-4 md:px-8 py-12 md:py-20 max-w-7xl space-y-12 md:space-y-20">
        
        <header className="space-y-6 max-w-3xl">
           <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-3">
              <Badge className="bg-primary/10 text-primary border-none px-4 py-1.5 rounded-full font-black text-[10px] tracking-widest uppercase">
                 Learning Hub
              </Badge>
           </motion.div>
           <h1 className="text-4xl md:text-7xl font-black text-[#0F172A] tracking-tighter leading-[1.1] antialiased">
              Subject <span className="text-primary italic">Vault.</span>
           </h1>
           <p className="text-slate-500 font-medium text-sm md:text-2xl leading-tight tracking-tight">
              Select a subject to explore targeted preparation series and high-fidelity mock tests.
           </p>

           <div className="relative group pt-4">
              <div className="absolute -inset-1 bg-gradient-to-r from-primary to-blue-400 rounded-2xl blur opacity-5 group-focus-within:opacity-20 transition duration-1000"></div>
              <div className="relative">
                 <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-6 w-6 text-slate-400" />
                 <Input 
                   className="h-16 md:h-20 pl-16 pr-8 rounded-2xl md:rounded-[2rem] bg-white border-none shadow-2xl text-lg md:text-xl font-bold" 
                   placeholder="Search subjects like Math, Punjab GK..." 
                   value={searchTerm}
                   onChange={e => setSearchTerm(e.target.value)}
                 />
              </div>
           </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
           {sLoading ? (
              Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-[400px] w-full rounded-[3rem] bg-white border border-slate-100" />)
           ) : filteredSubjects.length > 0 ? filteredSubjects.map((subject, idx) => {
              const stats = statsMap[subject.id] || { seriesCount: 0, testCount: 0 };
              return (
                 <motion.div 
                    key={subject.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                 >
                    <Link href={`/subjects/${subject.id}`}>
                       <Card className="border border-slate-100 shadow-xl hover:shadow-[0_40px_80px_rgba(0,0,0,0.08)] transition-all duration-500 rounded-[2.5rem] md:rounded-[3.5rem] bg-white group overflow-hidden h-full flex flex-col relative">
                          <div className="relative aspect-[16/10] overflow-hidden bg-[#0B1528]">
                             {subject.imageUrl ? (
                                <Image 
                                  src={subject.imageUrl} 
                                  alt={subject.name} 
                                  fill 
                                  className="object-cover group-hover:scale-110 transition-transform duration-1000 opacity-80" 
                                />
                             ) : (
                                <div className="h-full w-full flex items-center justify-center text-white/10">
                                   <BookMarked className="h-24 w-24" />
                                </div>
                             )}
                             <div className="absolute inset-0 bg-gradient-to-t from-[#0B1528] via-transparent to-transparent opacity-60" />
                             <div className="absolute bottom-6 left-6 flex gap-2">
                                <Badge className="bg-primary text-white border-none px-3 py-1 font-black text-[9px] uppercase tracking-widest">{stats.seriesCount} Series</Badge>
                                <Badge className="bg-white/10 backdrop-blur-md text-white border-white/20 px-3 py-1 font-black text-[9px] uppercase tracking-widest">{stats.testCount} Tests</Badge>
                             </div>
                          </div>

                          <CardContent className="p-8 md:p-12 flex flex-col flex-1 space-y-6">
                             <div className="space-y-3">
                                <h3 className="text-2xl md:text-3xl font-black text-[#0F172A] group-hover:text-primary transition-colors tracking-tight uppercase">
                                   {subject.name}
                                </h3>
                                <p className="text-slate-400 font-medium text-sm md:text-base leading-relaxed line-clamp-2">
                                   {subject.description || "In-depth preparation nodes for standard recruitment patterns."}
                                </p>
                             </div>

                             <div className="mt-auto pt-8 border-t border-slate-50 flex items-center justify-between">
                                <div className="flex items-center gap-3 text-emerald-500 font-bold text-[10px] uppercase tracking-widest">
                                   <ShieldCheck className="h-4 w-4" /> Verified Patterns
                                </div>
                                <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-primary group-hover:text-white transition-all shadow-inner">
                                   <ChevronRight className="h-5 w-5" />
                                </div>
                             </div>
                          </CardContent>
                       </Card>
                    </Link>
                 </motion.div>
              )
           }) : (
              <div className="col-span-full py-40 text-center space-y-6 bg-white rounded-[3rem] border-2 border-dashed border-slate-100 opacity-30">
                 <Layers className="h-20 w-20 mx-auto text-slate-300" />
                 <p className="font-black text-2xl uppercase tracking-[0.4em]">Vault Standby</p>
              </div>
           )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
