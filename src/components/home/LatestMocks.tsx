'use client';

import React, { useMemo } from "react"
import { motion } from "framer-motion"
import { BookOpen, Clock, Zap, Lock, ChevronRight } from "lucide-react"
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
 * @fileOverview Latest Mock Tests Hub v26.4.
 * UPDATED: Reduced padding and removed uppercase for premium feel.
 */
export default function LatestMocks() {
  const db = useFirestore()
  const { profile } = useUser()
  
  const mocksQuery = useMemo(() => (db ? query(collection(db, "mocks"), where("published", "==", true), limit(8)) : null), [db])
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
    <section className="py-6 md:py-10 bg-white border-t border-slate-100">
      <div className="max-w-[1440px] 2xl:max-w-[1800px] mx-auto space-y-6 md:space-y-10 px-1">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-3 text-left px-4 sm:px-6 lg:px-8">
           <div className="space-y-1">
              <h2 className="text-[22px] md:text-[28px] font-bold tracking-tight text-[#0F172A]">Latest mock tests</h2>
              <p className="max-w-2xl text-sm md:text-base font-medium text-slate-500">Practise with verified patterns for Punjab board exams.</p>
           </div>
           <Link href="/mocks" className="text-primary font-bold text-[13px] md:text-base tracking-tight hover:underline flex items-center gap-2 group shrink-0">
              View all <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
           </Link>
        </div>
        
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-6 px-1.5 sm:px-6 lg:px-8">
          {loading ? (
             Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-[180px] md:h-[280px] w-full mx-auto rounded-[1.25rem] md:rounded-[2.5rem] bg-slate-50" />)
          ) : mocks.length > 0 ? mocks.slice(0, 4).map((mock, i) => {
            const tier = (mock.accessLevel || 'FREE').toUpperCase();
            const isPremium = tier === 'PREMIUM';
            const locked = isPremium && !isPassActive;
            const boardId = mock.boardId || mock.boardIds?.[0] || "GENERAL";
            
            return (
              <motion.div 
                key={mock.id} 
                initial={{ opacity: 0, y: 10 }} 
                whileInView={{ opacity: 1, y: 0 }} 
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: i * 0.05 }} 
                className="flex flex-col h-full"
              >
                <Card className="w-full mx-auto border border-slate-100 shadow-md hover:shadow-xl transition-all duration-500 rounded-[1.5rem] md:rounded-[2.5rem] bg-white p-4 md:p-8 h-full text-center flex flex-col group relative overflow-hidden">
                  
                  <div className="flex justify-center mb-4 md:mb-8 shrink-0">
                    <AuthorityLogo boardId={boardId} size="md" className="shadow-md group-hover:scale-105 transition-transform" />
                  </div>

                  <div className="flex-1 flex flex-col justify-center min-w-0">
                    <h3 className="text-[14px] md:text-lg font-bold leading-tight text-[#0F172A] group-hover:text-primary transition-colors mb-2 md:mb-3 line-clamp-2">
                        {mock.title}
                    </h3>
                    
                    <div className="mt-auto md:mt-0 space-y-2 md:space-y-3">
                       <div className="flex flex-wrap items-center justify-center gap-2 md:gap-3 text-[9px] md:text-xs font-bold text-slate-400 tracking-tight">
                          <span className="flex items-center gap-1"><BookOpen className="h-3.5 w-3.5 text-primary" /> {mock.totalQuestions} Qs</span>
                          <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5 text-primary" /> {mock.duration}m</span>
                       </div>

                       {isPremium && (
                         <div className="flex justify-center h-4 md:h-5">
                            <Badge className="bg-amber-50 text-amber-600 border-none text-[9px] md:text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm flex items-center gap-1">
                               <Lock className="h-2.5 w-2.5" /> Premium
                            </Badge>
                         </div>
                       )}
                    </div>
                  </div>

                  <div className="mt-auto pt-4 md:pt-8 shrink-0">
                    <Button asChild className={cn(
                      "w-full h-10 md:h-12 rounded-full font-bold text-[11px] md:text-sm shadow-md border-none transition-all active:scale-95 gap-2 tracking-tight", 
                      locked ? "bg-amber-500 hover:bg-amber-600 text-white" : "bg-[#0F172A] text-white"
                    )}>
                        <Link href={locked ? '/pass' : `/mocks/view?id=${mock.id}`} className="flex items-center justify-center">
                          {locked ? 'Unlock' : 'Start preparation'}
                          <ChevronRight className="h-3.5 w-3.5" />
                        </Link>
                    </Button>
                  </div>
                </Card>
              </motion.div>
            )
          }) : (
            <div className="col-span-full py-20 text-center opacity-30 italic font-bold text-slate-400">
               Syncing registry...
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
