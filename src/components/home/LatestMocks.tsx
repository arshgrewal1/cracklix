'use client';

import React, { useMemo } from "react"
import { motion } from "framer-motion"
import { BookOpen, Clock, Zap, Lock, ArrowRight, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Card,
  CardHeader,
  CardTitle 
} from "@/components/ui/card"
import Link from "next/link"
import { useCollection, useFirestore, useUser } from "@/firebase"
import { collection, query, where, limit } from "firebase/firestore"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { AuthorityLogo } from "@/lib/exam-icons"

/**
 * @fileOverview Dynamic Latest Mock Tests Hub v62.0.
 * BRANDING: Added board-specific logo inheritance to every mock card.
 */

export default function LatestMocks() {
  const db = useFirestore()
  const { profile } = useUser()
  
  const mocksQuery = useMemo(() => (db ? query(collection(db, "mocks"), where("published", "==", true), limit(6)) : null), [db])
  const { data: rawMocks, loading } = useCollection<any>(mocksQuery)

  const mocks = useMemo(() => {
    if (!rawMocks) return []
    return [...rawMocks].sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))
  }, [rawMocks])

  const isPassActive = profile?.passStatus === 'active';

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-4 text-left">
           <div className="space-y-1">
              <h2 className="text-3xl md:text-5xl font-black text-[#0F172A] tracking-tight leading-none">Latest Mock Tests</h2>
              <p className="text-slate-500 font-medium text-sm md:text-lg">Freshly updated tests according to latest recruitment patterns.</p>
           </div>
           <Link href="/mocks" className="bg-slate-50 px-6 py-2.5 rounded-xl text-primary font-bold text-xs tracking-tight hover:bg-primary hover:text-white transition-all flex items-center gap-2 shadow-sm">
              Explore All <ArrowRight className="h-3.5 w-3.5" />
           </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {loading ? (
             Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-80 w-full rounded-[2.5rem] bg-white" />)
          ) : mocks.length > 0 ? mocks.map((mock, i) => {
            const tier = (mock.accessLevel || 'FREE').toUpperCase();
            const isPremium = tier === 'PREMIUM';
            const locked = isPremium && !isPassActive;
            const boardId = mock.boardIds?.[0] || mock.boardId;
            
            return (
              <motion.div key={mock.id} initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} viewport={{ once: true }}>
                <Card className="border border-[#E5E7EB] shadow-sm hover:shadow-xl transition-all duration-500 rounded-[2.5rem] bg-white p-8 text-center flex flex-col h-[400px] group relative overflow-hidden">
                  <div className="mb-6 flex justify-center">
                     <AuthorityLogo boardId={boardId} size="lg" className="shadow-inner rounded-xl bg-slate-50 p-2" />
                  </div>
                  <CardHeader className="p-0 flex-1 space-y-4">
                     <CardTitle className="font-black text-xl md:text-2xl text-[#0F172A] leading-tight tracking-tight line-clamp-2">
                        {mock.title}
                     </CardTitle>
                     <div className="flex flex-wrap items-center justify-center gap-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                        <span className="flex items-center gap-1.5"><BookOpen className="h-3.5 w-3.5" /> {mock.totalQuestions} Questions</span>
                        <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" /> {mock.duration} Mins</span>
                     </div>
                     <div className="flex items-center justify-center gap-3 pt-2">
                        {isPremium && <Badge className="bg-amber-50 text-amber-600 border-none text-[8px] font-black px-3 py-1 rounded-lg">PREMIUM</Badge>}
                        <div className="flex items-center gap-1.5 text-[9px] font-black text-slate-400 uppercase">
                           <Users className="h-3 w-3" /> {mock.attemptsCount || 450}+ Attempts
                        </div>
                     </div>
                  </CardHeader>
                  <div className="mt-8">
                     <Button asChild className={cn("w-full h-12 rounded-2xl font-black text-[10px] tracking-[0.2em] uppercase shadow-lg border-none transition-all active:scale-95", locked ? "bg-amber-500 hover:bg-amber-600" : "bg-[#0F172A] hover:bg-black")}>
                        <Link href={locked ? '/pass' : `/mocks/${mock.id}`}>
                           {locked ? <><Lock className="h-3.5 w-3.5 mr-2" /> Unlock Test</> : 'Start Test'}
                        </Link>
                     </Button>
                  </div>
                </Card>
              </motion.div>
            )
          }) : (
            <div className="col-span-full py-20 text-center opacity-20 italic font-black uppercase text-xs tracking-widest">
               No tests deployed in this cycle.
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
