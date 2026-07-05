"use client"

import React, { useMemo, useState, useEffect } from "react"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Search, 
  Zap, 
  Clock, 
  BookOpen, 
  ChevronRight, 
  Lock,
  Landmark,
  Filter,
  RefreshCw,
  Users,
  Globe,
  Signal,
  CheckCircle2
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useCollection, useFirestore, useUser } from "@/firebase"
import { collection, query, where, orderBy, getCountFromServer } from "firebase/firestore"
import Link from "next/link"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { AuthorityLogo } from "@/lib/exam-icons"

/**
 * @fileOverview Student-facing Mock Test Hub v1.0.
 * Allows students to browse, filter, and start mock tests.
 */

export default function MockTestsPage() {
  const db = useFirestore()
  const { profile, loading: userLoading } = useUser()
  
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedBoard, setSelectedBoard] = useState("all")
  const [selectedTier, setSelectedTier] = useState("all")

  const mocksQuery = useMemo(() => {
    if (!db) return null
    return query(collection(db, "mocks"), where("published", "==", true))
  }, [db])

  const { data: rawMocks, loading: mocksLoading } = useCollection<any>(mocksQuery)
  const { data: boards } = useCollection<any>(useMemo(() => (db ? query(collection(db, "boards"), orderBy("displayOrder", "asc")) : null), [db]))
  const { data: allResults } = useCollection<any>(useMemo(() => (db ? collection(db, "results") : null), [db]))

  const attemptCounts = useMemo(() => {
    if (!allResults) return new Map<string, number>()
    const counts = new Map<string, number>()
    allResults.forEach((r: any) => {
      const id = r.mockId
      if (id) counts.set(id, (counts.get(id) || 0) + 1)
    })
    return counts
  }, [allResults])

  const isPassActive = useMemo(() => {
    if (!profile) return false
    if (profile.role === 'ADMIN' || profile.role === 'SUPER_ADMIN') return true
    return profile.passStatus === 'active'
  }, [profile])

  const filteredMocks = useMemo(() => {
    if (!rawMocks) return []
    return rawMocks.filter(m => {
      const tier = (m.accessLevel || 'FREE').toUpperCase()
      const matchesSearch = m.title?.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesBoard = selectedBoard === "all" || m.boardId === selectedBoard || (m.boardIds && m.boardIds.includes(selectedBoard))
      const matchesTier = selectedTier === "all" || tier === selectedTier
      return matchesSearch && matchesBoard && matchesTier
    }).sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))
  }, [rawMocks, searchTerm, selectedBoard, selectedTier])

  return (
    <div className="min-h-screen bg-slate-50/50 font-body text-left pb-safe">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8 md:py-16 max-w-7xl space-y-8 md:space-y-12">
        {/* Header Section */}
        <div className="space-y-4">
           <div className="flex items-center gap-3">
              <div className="h-10 w-10 md:h-12 md:w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                 <Zap className="h-6 w-6" />
              </div>
              <div>
                 <h1 className="text-2xl md:text-5xl font-black text-[#0F172A] tracking-tight leading-none uppercase">Practice Hub</h1>
                 <p className="text-slate-500 font-medium text-[11px] md:text-lg mt-1">Verified mock tests for Punjab recruitment verticals.</p>
              </div>
           </div>
        </div>

        {/* Filters Section */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
           <div className="md:col-span-6 relative group">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-primary transition-colors" />
              <Input 
                className="h-14 md:h-16 pl-14 rounded-2xl bg-white border-slate-200 shadow-sm text-base font-bold" 
                placeholder="Search test series..." 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
           </div>
           <div className="md:col-span-3">
              <select 
                value={selectedBoard} 
                onChange={e => setSelectedBoard(e.target.value)}
                className="w-full h-14 md:h-16 rounded-2xl bg-white border border-slate-200 px-6 font-bold text-sm outline-none shadow-sm focus:ring-2 focus:ring-primary/20"
              >
                <option value="all">All Boards</option>
                {boards?.map((b: any) => <option key={b.id} value={b.id}>{b.abbreviation} Hub</option>)}
              </select>
           </div>
           <div className="md:col-span-3">
              <select 
                value={selectedTier} 
                onChange={e => setSelectedTier(e.target.value)}
                className="w-full h-14 md:h-16 rounded-2xl bg-white border border-slate-200 px-6 font-bold text-sm outline-none shadow-sm focus:ring-2 focus:ring-primary/20"
              >
                <option value="all">All Tiers</option>
                <option value="FREE">Free Hub</option>
                <option value="PREMIUM">Elite Hub</option>
              </select>
           </div>
        </div>

        {/* Mocks Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
           {mocksLoading ? (
             Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-64 w-full rounded-[2.5rem] bg-white border border-slate-100" />)
           ) : filteredMocks.length > 0 ? (
             filteredMocks.map((mock) => (
                <MockCard key={mock.id} mock={mock} isPassActive={isPassActive} attemptCount={attemptCounts.get(mock.id) || 0} />
             ))
           ) : (
             <div className="col-span-full py-32 text-center flex flex-col items-center gap-6 opacity-30">
                <RefreshCw className="h-16 w-16 text-slate-300" />
                <p className="text-xl font-black uppercase tracking-widest">No tests found matching your criteria</p>
                <Button onClick={() => { setSearchTerm(""); setSelectedBoard("all"); setSelectedTier("all"); }} variant="outline" className="rounded-full px-8">Reset Filters</Button>
             </div>
           )}
        </div>
      </main>
      <Footer />
    </div>
  )
}

function MockCard({ mock, isPassActive, attemptCount }: { mock: any, isPassActive: boolean, attemptCount: number }) {
   const isPremium = mock.accessLevel === 'PREMIUM'
   const isFree = !isPremium
   const locked = isPremium && !isPassActive
   const boardId = mock.boardId || mock.boardIds?.[0] || "GENERAL"
   const difficulty = mock.difficulty || 'Medium'
   const languages = mock.languages || ['English', 'Punjabi']

   const difficultyColor = difficulty === 'Easy' 
     ? 'bg-emerald-50 text-emerald-600' 
     : difficulty === 'Hard' 
       ? 'bg-red-50 text-red-600' 
       : 'bg-blue-50 text-blue-600'

   const formatAttempts = (count: number) => {
     if (count >= 1000) return `${(count / 1000).toFixed(1)}K`
     return count.toString()
   }

   return (
      <Card className="border border-slate-100 shadow-xl hover:shadow-2xl transition-all duration-500 rounded-[2.5rem] bg-white p-6 md:p-10 flex flex-col group h-full text-center relative overflow-hidden">
         <div className="flex justify-between items-start mb-6 md:mb-8 w-full">
            <div className="h-12 w-12 md:h-16 md:w-16 flex items-center justify-center shrink-0">
               <AuthorityLogo boardId={boardId} size="md" className="shadow-lg group-hover:scale-105 transition-transform" />
            </div>
            <div className="flex items-center gap-2">
               {isFree && (
                  <Badge className="bg-emerald-50 text-emerald-600 border-none px-3 py-1 font-black text-[8px] uppercase tracking-widest flex items-center gap-1.5 shadow-sm">
                     <CheckCircle2 className="h-2.5 w-2.5" /> Free
                  </Badge>
               )}
               {isPremium && (
                  <Badge className="bg-amber-50 text-amber-600 border-none px-3 py-1 font-black text-[8px] uppercase tracking-widest flex items-center gap-1.5 shadow-sm">
                     <Lock className="h-2.5 w-2.5" /> Elite
                  </Badge>
               )}
            </div>
         </div>

         <div className="flex-1 space-y-4 text-left">
            <h3 className="text-lg md:text-2xl font-black text-[#0F172A] group-hover:text-primary transition-colors leading-tight line-clamp-2 uppercase">
               {mock.title}
            </h3>

            {attemptCount > 0 && (
               <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400">
                  <Users className="h-3.5 w-3.5 text-slate-300" />
                  <span>{formatAttempts(attemptCount)} attempts</span>
               </div>
            )}
            
            <div className="flex flex-wrap items-center gap-3 text-[9px] md:text-[11px] font-bold text-slate-400 uppercase tracking-tight border-t border-slate-50 pt-4">
               <span className="flex items-center gap-1.5"><BookOpen className="h-3.5 w-3.5 text-primary" /> {mock.totalQuestions} Qs</span>
               <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5 text-primary" /> {mock.duration} Min</span>
               <Badge className={cn("border-none px-2 py-0.5 font-black text-[7px] uppercase tracking-widest", difficultyColor)}>
                  <Signal className="h-2.5 w-2.5 mr-1" />{difficulty}
               </Badge>
            </div>

            <div className="flex items-center gap-1.5 text-[9px] font-bold text-slate-400">
               <Globe className="h-3 w-3 text-slate-300" />
               <span>{languages.join(', ')}</span>
            </div>
         </div>

         <div className="mt-8 pt-4">
            <Button asChild className={cn(
               "w-full h-12 md:h-14 rounded-full font-black text-[10px] md:text-xs tracking-widest shadow-xl border-none transition-all active:scale-95 gap-3 uppercase", 
               locked ? "bg-amber-500 hover:bg-amber-600" : "bg-[#0F172A] hover:bg-primary"
            )}>
               <Link href={locked ? '/pass' : `/mocks/view?id=${mock.id}`}>
                  {locked ? <Lock className="h-4 w-4" /> : null}
                  {locked ? 'Unlock Series' : 'Start Preparation'}
                  <ChevronRight className="h-4 w-4" />
               </Link>
            </Button>
         </div>
      </Card>
   )
}
