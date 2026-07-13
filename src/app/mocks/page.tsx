
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
  ShieldCheck,
  Mic,
  Trophy,
  FileStack,
  Bookmark,
  Star,
  UserPlus,
  Play,
  Binary,
  Cpu,
  Calculator,
  Languages,
  FlaskConical,
  GraduationCap,
  Layers,
  Timer
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useCollection, useFirestore, useUser } from "@/firebase"
import { collection, query, where, orderBy } from "firebase/firestore"
import Link from "next/link"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { AuthorityLogo } from "@/lib/exam-icons"
import { motion, AnimatePresence } from "framer-motion"
import Logo from "@/components/brand/Logo"

/**
 * @fileOverview Premium Practice Hub v2.0.
 * Redesigned with Apple/Material 3 aesthetics, high-density metadata, and glassmorphic navigation.
 */

const QUICK_ACTIONS = [
  { label: "Mock Tests", icon: BookOpen, color: "text-blue-500", bg: "bg-blue-50/50", href: "/mocks" },
  { label: "Daily Quiz", icon: Zap, color: "text-orange-500", bg: "bg-orange-50/50", href: "/mocks" },
  { label: "Old Papers", icon: FileStack, color: "text-purple-500", bg: "bg-purple-50/50", href: "/pyqs" },
  { label: "Saved Tests", icon: Bookmark, color: "text-rose-500", bg: "bg-rose-50/50", href: "/bookmarks" },
];

const CATEGORIES = [
  { label: "Punjab GK", icon: Landmark, color: "from-amber-400 to-orange-500" },
  { label: "Reasoning", icon: Binary, color: "from-blue-400 to-indigo-600" },
  { label: "English", icon: Languages, color: "from-emerald-400 to-teal-600" },
  { label: "Punjabi", icon: GraduationCap, color: "from-rose-400 to-pink-600" },
  { label: "Math", icon: Calculator, color: "from-cyan-400 to-blue-600" },
  { label: "Computer", icon: Cpu, color: "from-slate-400 to-slate-700" },
  { label: "CA Hub", icon: Zap, color: "from-yellow-400 to-amber-600" },
  { label: "Science", icon: FlaskConical, color: "from-violet-400 to-purple-600" },
];

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
    <div className="min-h-screen bg-[#F8FAFC] font-body text-left pb-safe">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8 md:py-14 max-w-7xl space-y-12">
        
        {/* 1. PREMIUM HEADER HUB */}
        <section className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 px-1">
           <motion.div 
             initial={{ opacity: 0, x: -20 }} 
             animate={{ opacity: 1, x: 0 }}
             className="space-y-4"
           >
              <Logo variant="light" align="left" className="h-10 md:h-12 -ml-2 mb-2" />
              <div className="space-y-1">
                 <div className="flex items-center gap-3">
                    <h1 className="text-3xl md:text-[42px] font-[900] tracking-tighter leading-none text-transparent bg-clip-text bg-gradient-to-r from-[#2563EB] to-[#60A5FA]">
                       ⚡ Practice Hub
                    </h1>
                    <div className="h-6 w-6 bg-blue-600 rounded-full flex items-center justify-center shadow-lg shadow-blue-600/20">
                       <ShieldCheck className="h-4 w-4 text-white" />
                    </div>
                 </div>
                 <p className="text-slate-500 font-medium text-sm md:text-lg">
                    Practice with verified Punjab Government exam mock tests.
                 </p>
              </div>
           </motion.div>
        </section>

        {/* 2. SEARCH & QUICK ACTIONS */}
        <div className="space-y-8">
           {/* SEARCH BOX */}
           <motion.div 
             initial={{ opacity: 0, y: 10 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: 0.1 }}
             className="relative max-w-3xl mx-auto group"
           >
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-600/20 to-indigo-600/20 rounded-[22px] blur-md opacity-0 group-focus-within:opacity-100 transition duration-500"></div>
              <div className="relative h-[60px] md:h-[68px] bg-white/80 backdrop-blur-xl border border-slate-200 rounded-[20px] md:rounded-[24px] shadow-sm flex items-center px-6 gap-4">
                 <Search className="h-5 w-5 md:h-6 md:w-6 text-slate-400 group-focus-within:text-primary transition-colors" />
                 <input 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search Mock Tests..."
                    className="flex-1 bg-transparent border-none outline-none font-bold text-slate-700 placeholder:text-slate-300 text-sm md:text-xl"
                 />
                 <button className="h-10 w-10 md:h-12 md:w-12 rounded-xl flex items-center justify-center text-slate-400 hover:bg-slate-50 hover:text-primary transition-all">
                    <Mic className="h-5 w-5" />
                 </button>
              </div>
           </motion.div>

           {/* QUICK ACTIONS GRID */}
           <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {QUICK_ACTIONS.map((action, i) => (
                <motion.div 
                  key={action.label} 
                  initial={{ opacity: 0, y: 10 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  transition={{ delay: 0.2 + (i * 0.05) }}
                >
                   <Link href={action.href}>
                      <Card className="border-none shadow-sm hover:shadow-xl transition-all duration-300 rounded-[20px] md:rounded-[28px] bg-white/60 backdrop-blur-md hover:-translate-y-1 overflow-hidden group">
                         <CardContent className="p-5 md:p-8 flex items-center gap-4">
                            <div className={cn("h-10 w-10 md:h-14 md:w-14 rounded-xl md:rounded-2xl flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform", action.bg, action.color)}>
                               <action.icon className="h-5 w-5 md:h-7 md:w-7" />
                            </div>
                            <span className="font-black text-[11px] md:text-sm uppercase tracking-widest text-slate-600">{action.label}</span>
                         </CardContent>
                      </Card>
                   </Link>
                </motion.div>
              ))}
           </div>
        </div>

        {/* 3. MODERN FILTER CHIPS */}
        <div className="space-y-6">
           <div className="flex items-center justify-between px-1">
              <h3 className="text-[10px] md:text-xs font-black uppercase tracking-[0.3em] text-slate-400">Punjab Boards</h3>
              <div className="h-px flex-1 bg-slate-100 mx-6 hidden md:block" />
           </div>
           <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-2 -mx-4 px-4 md:mx-0 md:px-0">
              <FilterChip 
                label="All Boards" 
                active={selectedBoard === 'all'} 
                onClick={() => setSelectedBoard('all')} 
              />
              {boards?.map((b: any) => (
                <FilterChip 
                   key={b.id}
                   label={b.abbreviation}
                   active={selectedBoard === b.id}
                   onClick={() => setSelectedBoard(b.id)}
                />
              ))}
           </div>
        </div>

        {/* 4. MAIN TEST GRID */}
        <div className="space-y-10">
           <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-3">
                 <Trophy className="h-5 w-5 text-amber-500" />
                 <h2 className="text-xl md:text-3xl font-black text-[#0F172A] tracking-tight">Available Tests</h2>
              </div>
              <Badge variant="secondary" className="bg-white border-slate-100 text-slate-400 font-bold px-3 py-1 rounded-full shadow-sm">
                 {filteredMocks.length} Nodes Found
              </Badge>
           </div>

           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10">
              {mocksLoading ? (
                 Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="h-64 bg-white rounded-[3rem] animate-pulse border border-slate-100" />
                 ))
              ) : filteredMocks.length > 0 ? (
                 filteredMocks.map((mock, i) => (
                    <MockSeriesCard key={mock.id} mock={mock} isPassActive={isPassActive} index={i} />
                 ))
              ) : (
                 <div className="col-span-full py-40 text-center space-y-6 opacity-30">
                    <RefreshCw className="h-16 w-16 mx-auto text-slate-300" />
                    <p className="text-xl font-black uppercase tracking-widest text-slate-400">No matching tests in vault</p>
                    <Button onClick={() => { setSearchTerm(""); setSelectedBoard("all"); setSelectedTier("all"); }} variant="outline" className="rounded-full px-8">Reset Filters</Button>
                 </div>
              )}
           </div>
        </div>

        {/* 5. POPULAR CATEGORIES GRID */}
        <section className="space-y-10 pt-10">
           <div className="flex items-center gap-3 px-1">
              <Layers className="h-5 w-5 text-primary" />
              <h2 className="text-xl md:text-3xl font-black text-[#0F172A] tracking-tight">Popular Categories</h2>
           </div>
           <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 md:gap-6">
              {CATEGORIES.map((cat, i) => (
                <motion.div 
                  key={cat.label}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex flex-col items-center gap-4 cursor-pointer group"
                >
                   <div className={cn(
                     "h-16 w-16 md:h-20 md:w-20 rounded-[22px] md:rounded-[28px] bg-gradient-to-br flex items-center justify-center text-white shadow-xl transition-all duration-500 group-hover:rotate-6",
                     cat.color
                   )}>
                      <cat.icon className="h-6 w-6 md:h-8 md:w-8" />
                   </div>
                   <span className="text-[10px] md:text-xs font-black uppercase tracking-widest text-slate-500 group-hover:text-primary transition-colors text-center">{cat.label}</span>
                </motion.div>
              ))}
           </div>
        </section>

      </main>
      <Footer />
    </div>
  )
}

function FilterChip({ label, active, onClick }: { label: string, active: boolean, onClick: () => void }) {
   return (
      <button 
        onClick={onClick}
        className={cn(
          "h-10 md:h-12 px-6 md:px-8 rounded-full font-black text-[10px] md:text-xs uppercase tracking-widest transition-all duration-300 whitespace-nowrap shadow-sm border active:scale-95",
          active 
            ? "bg-gradient-to-r from-[#2563EB] to-[#60A5FA] border-transparent text-white shadow-blue-600/20 shadow-xl" 
            : "bg-white border-slate-100 text-slate-400 hover:border-slate-300 hover:text-slate-600"
        )}
      >
         {label}
      </button>
   )
}

function MockSeriesCard({ mock, isPassActive, index }: { mock: any, isPassActive: boolean, index: number }) {
   const isPremium = mock.accessLevel === 'PREMIUM'
   const locked = isPremium && !isPassActive
   const boardId = mock.boardId || mock.boardIds?.[0] || "GENERAL"

   return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
      >
         <Card className="border border-slate-100 shadow-sm hover:shadow-2xl transition-all duration-500 rounded-[2rem] md:rounded-[3rem] bg-white p-6 md:p-10 flex flex-col group h-full text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:rotate-12 transition-transform duration-1000 pointer-events-none">
               <Trophy className="h-32 w-32" />
            </div>

            <div className="flex justify-between items-start mb-6 md:mb-10 w-full relative z-10">
               <div className="h-12 w-12 md:h-16 md:w-16 flex items-center justify-center shrink-0">
                  <AuthorityLogo boardId={boardId} size="md" className="shadow-lg group-hover:scale-110 transition-transform bg-slate-50" />
               </div>
               <div className="flex flex-col items-end gap-2">
                  {isPremium ? (
                     <Badge className="bg-[#FEF3C7] text-[#92400E] border-none px-3 py-1 rounded-full font-black text-[9px] uppercase tracking-widest shadow-sm flex items-center gap-1.5">
                        <Lock className="h-3 w-3" /> Elite Pass
                     </Badge>
                  ) : (
                     <Badge className="bg-emerald-50 text-emerald-600 border-none px-3 py-1 rounded-full font-black text-[9px] uppercase tracking-widest">Free Portal</Badge>
                  )}
                  <div className="flex items-center gap-1 text-amber-400">
                     <Star className="h-3 w-3 fill-current" />
                     <span className="text-[10px] font-black text-slate-400">4.9</span>
                  </div>
               </div>
            </div>

            <div className="flex-1 space-y-5 text-left relative z-10">
               <h3 className="text-lg md:text-2xl font-black text-[#0F172A] group-hover:text-primary transition-colors leading-tight line-clamp-2 uppercase tracking-tight">
                  {mock.title}
               </h3>
               
               <div className="flex flex-wrap items-center gap-x-6 gap-y-3 pt-6 border-t border-slate-50">
                  <StatNode icon={BookOpen} label={`${mock.totalQuestions} Questions`} />
                  <StatNode icon={Timer} label={`${mock.duration} Min`} />
                  <StatNode icon={UserPlus} label={`12k+ Attempted`} />
               </div>
            </div>

            <div className="mt-10 pt-2 relative z-10">
               <Button asChild className={cn(
                  "w-full h-12 md:h-16 rounded-2xl font-[900] text-xs md:text-sm shadow-xl border-none transition-all active:scale-95 gap-3 uppercase tracking-widest", 
                  locked ? "bg-[#F59E0B] hover:bg-[#D97706] text-white" : "bg-[#0F172A] hover:bg-black text-white"
               )}>
                  <Link href={locked ? '/pass' : `/mocks/view?id=${mock.id}`}>
                     {locked ? <Lock className="h-4 w-4" /> : <Play className="h-4 w-4 fill-current text-primary" />}
                     {locked ? 'Unlock Series' : 'Start Preparation'}
                     <ChevronRight className="h-4 w-4 ml-auto opacity-30" />
                  </Link>
               </Button>
            </div>
         </Card>
      </motion.div>
   )
}

function StatNode({ icon: Icon, label }: any) {
   return (
      <div className="flex items-center gap-2 text-[10px] md:text-[11px] font-bold text-slate-400">
         <Icon className="h-4 w-4 text-primary/40" />
         <span className="uppercase tracking-tight">{label}</span>
      </div>
   )
}
