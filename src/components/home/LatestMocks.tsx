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
 * @fileOverview Dynamic Latest Mock Tests Hub v68.0 (Mobile Compressed).
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

  const isPassActive = useMemo(() => {
    if (!profile) return false;
    if (profile.role === 'ADMIN' || profile.role === 'SUPER_ADMIN') return true;
    return profile.passStatus === 'active';
  }, [profile]);

  return (
    <section className="py-8 md:py-16 bg-white">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-4 md:mb-12 gap-2 text-left">
           <div className="space-y-0.5">
              <h2 className="text-xl md:text-4xl font-black text-[#0F172A] tracking-tight leading-none">Latest Mock Tests</h2>
              <p className="text-slate-500 font-medium text-[10px] md:text-lg">Freshly updated tests according to latest patterns.</p>
           </div>
           <Link href="/mocks" className="bg-slate-50 px-4 py-1.5 md:px-6 md:py-2.5 rounded-lg md:rounded-xl text-primary font-bold text-[9px] md:text-xs tracking-tight hover:bg-primary hover:text-white transition-all flex items-center gap-2 shadow-sm">
              Explore All <ArrowRight className="h-3 w-3" />
           </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
          {loading ? (
             Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-64 md:h-80 w-full rounded-2xl md:rounded-[2.5rem] bg-white" />)
          ) : mocks.length > 0 ? mocks.map((mock, i) => {
            const tier = (mock.accessLevel || 'FREE').toUpperCase();
            const isPremium = tier === 'PREMIUM';
            const locked = isPremium && !isPassActive;
            const boardId = mock.boardIds?.[0] || mock.boardId || "GENERAL";
            
            return (
              <motion.div key={mock.id} initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} viewport={{ once: true }}>
                <Card className="border border-[#E5E7EB] shadow-sm hover:shadow-xl transition-all duration-500 rounded-2xl md:rounded-[2.5rem] bg-white p-4 md:p-8 text-center flex flex-col h-auto min-h-[300px] md:h-[400px] group relative overflow-hidden">
                  <div className="mb-4 md:mb-6 flex justify-center">
                     <AuthorityLogo boardId={boardId} size="md" className="md:w-20 md:h-20 bg-slate-50 rounded-xl group-hover:scale-105 transition-transform" />
                  </div>
                  <CardHeader className="p-0 flex-1 space-y-2 md:space-y-4 text-left md:text-center">
                     <CardTitle className="font-black text-base md:text-2xl text-[#0F172A] leading-tight tracking-tight line-clamp-2">
                        {mock.title}
                     </CardTitle>
                     <div className="flex flex-wrap items-center justify-start md:justify-center gap-3 md:gap-4 text-[8px] md:text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                        <span className="flex items-center gap-1"><BookOpen className="h-3 w-3" /> {mock.totalQuestions} Qs</span>
                        <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {mock.duration}m</span>
                     </div>
                     <div className="flex items-center justify-start md:justify-center gap-2 pt-1 md:pt-2">
                        {isPremium && <Badge className="bg-orange-50 text-orange-600 border-none text-[7px] md:text-[8px] font-black px-2 py-0.5 rounded uppercase">PREMIUM</Badge>}
                        <div className="flex items-center gap-1 text-[8px] md:text-[9px] font-black text-slate-400 uppercase">
                           <Users className="h-2.5 w-2.5" /> {mock.attemptsCount || 450}+
                        </div>
                     </div>
                  </CardHeader>
                  <div className="mt-4 md:mt-8">
                     <Button asChild className={cn(
                       "w-full h-10 md:h-14 rounded-full font-black text-[9px] md:text-[11px] tracking-[0.2em] uppercase shadow-lg border-none transition-all active:scale-95 gap-2", 
                       locked ? "bg-orange-500 hover:bg-orange-600 text-white" : "bg-[#0F172A] hover:bg-black text-white"
                     )}>
                        <Link href={locked ? '/pass' : `/mocks/${mock.id}`}>
                           {locked ? <><Lock className="h-3 w-3" /> UNLOCK</> : 'Start Test'}
                        </Link>
                     </Button>
                  </div>
                </Card>
              </motion.div>
            )
          }) : (
            <div className="col-span-full py-20 text-center opacity-20 italic font-black uppercase text-xs tracking-widest">
               No tests deployed.
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
