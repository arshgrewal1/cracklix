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
  RefreshCw
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useCollection, useFirestore, useUser } from "@/firebase"
import { collection, query, where, orderBy } from "firebase/firestore"
import Link from "next/link"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { AuthorityLogo } from "@/lib/exam-icons"

/**
 * @fileOverview Student-facing Mock Test Hub v1.0.
 * UPDATED: Reduced padding and dropdown heights for a premium feel.
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
      
      <main className="container mx-auto px-4 py-6 md:py-10 max-w-7xl space-y-6 md:space-y-10">
        {/* Header Section */}
        <div className="space-y-2">
           <div className="flex items-center gap-3">
              <div className="h-8 w-8 md:h-10 md:w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-inner shrink-0">
                 <Zap className="h-4 w-4 md:h-5 md:w-5" />
              </div>
              <h1 className="text-2xl md:text-4xl font-black text-[#0F172A] tracking-tight leading-none">Practice hub</h1>
           </div>
           <p className="text-slate-500 font-medium text-sm md:text-base">Verified mock tests for Punjab recruitment verticals.</p>
        </div>

        {/* Filters Section */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
           <div className="md:col-span-6 relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors" />
              <Input 
                className="h-[52px] pl-11 rounded-xl bg-white border-slate-200 shadow-sm text-sm font-bold" 
                placeholder="Search test series..." 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
           </div>
           <div className="md:col-span-3">
              <select 
                value={selectedBoard} 
                onChange={e => setSelectedBoard(e.target.value)}
                className="w-full h-[52px] rounded-xl bg-white border border-slate-200 px-4 font-bold text-xs outline-none shadow-sm focus:ring-2 focus:ring-primary/10"
              >
                <option value="all">All boards</option>
                {boards?.map((b: any) => <option key={b.id} value={b.id}>{b.abbreviation} hub</option>)}
              </select>
           </div>
           <div className="md:col-span-3">
              <select 
                value={selectedTier} 
                onChange={e => setSelectedTier(e.target.value)}
                className="w-full h-[52px] rounded-xl bg-white border border-slate-200 px-4 font-bold text-xs outline-none shadow-sm focus:ring-2 focus:ring-primary/10"
              >
                <option value="all">All tiers</option>
                <option value="FREE">Free hub</option>
                <option value="PREMIUM">Elite hub</option>
              </select>
           </div>
        </div>

        {/* Mocks Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
           {mocksLoading ? (
             Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-48 w-full rounded-[1.5rem] md:rounded-[2.5rem] bg-white border border-slate-50" />)
           ) : filteredMocks.length > 0 ? (
             filteredMocks.map((mock) => (
                <MockCard key={mock.id} mock={mock} isPassActive={isPassActive} />
             ))
           ) : (
             <div className="col-span-full py-24 text-center flex flex-col items-center gap-4 opacity-30">
                <RefreshCw className="h-10 w-10 text-slate-300" />
                <p className="text-lg font-bold text-slate-400">No tests found</p>
                <Button onClick={() => { setSearchTerm(""); setSelectedBoard("all"); setSelectedTier("all"); }} variant="outline" size="sm" className="rounded-full px-6">Reset filters</Button>
             </div>
           )}
        </div>
      </main>
      <Footer />
    </div>
  )
}

function MockCard({ mock, isPassActive }: { mock: any, isPassActive: boolean }) {
   const isPremium = mock.accessLevel === 'PREMIUM'
   const locked = isPremium && !isPassActive
   const boardId = mock.boardId || mock.boardIds?.[0] || "GENERAL"

   return (
      <Card className="border border-slate-100 shadow-md hover:shadow-xl transition-all duration-500 rounded-[1.5rem] md:rounded-[2.5rem] bg-white p-5 md:p-8 flex flex-col group h-full text-center relative overflow-hidden">
         <div className="flex justify-between items-start mb-4 md:mb-6 w-full">
            <div className="h-10 w-10 md:h-12 md:w-12 flex items-center justify-center shrink-0">
               <AuthorityLogo boardId={boardId} size="md" className="shadow-md group-hover:scale-105 transition-transform" />
            </div>
            {isPremium && (
               <Badge className="bg-amber-50 text-amber-600 border-none px-2.5 py-1 rounded-full font-bold text-[9px] tracking-tight flex items-center gap-1 shadow-sm">
                  <Lock className="h-2.5 w-2.5" /> Elite
               </Badge>
            )}
         </div>

         <div className="flex-1 space-y-3 text-left min-w-0">
            <h3 className="text-base md:text-xl font-bold text-[#0F172A] group-hover:text-primary transition-colors leading-tight line-clamp-2">
               {mock.title}
            </h3>
            
            <div className="flex flex-wrap items-center gap-3 text-[10px] md:text-xs font-bold text-slate-400 tracking-tight pt-3 border-t border-slate-50">
               <span className="flex items-center gap-1"><BookOpen className="h-3 w-3 text-primary" /> {mock.totalQuestions} Qs</span>
               <span className="flex items-center gap-1"><Clock className="h-3 w-3 text-primary" /> {mock.duration}m</span>
            </div>
         </div>

         <div className="mt-6 pt-2">
            <Button asChild className={cn(
               "w-full h-11 md:h-12 rounded-full font-bold text-xs md:text-sm shadow-md border-none transition-all active:scale-95 gap-2", 
               locked ? "bg-amber-500 hover:bg-amber-600 text-white" : "bg-[#0F172A] text-white"
            )}>
               <Link href={locked ? '/pass' : `/mocks/view?id=${mock.id}`}>
                  {locked ? <Lock className="h-3.5 w-3.5" /> : null}
                  {locked ? 'Unlock series' : 'Start preparation'}
                  <ChevronRight className="h-3.5 w-3.5" />
               </Link>
            </Button>
         </div>
      </Card>
   )
}