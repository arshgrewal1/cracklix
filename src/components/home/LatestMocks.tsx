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
 * @fileOverview Latest Mock Tests Hub v20.0.
 * UPDATED: Restricted to strict 4-column grid on desktop for visual consistency.
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
    <section className="py-6 md:py-24 bg-white border-t border-slate-100">
      <div className="max-w-[1440px] 2xl:max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 space-y-6 md:space-y-16">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-3 text-left px-1">
           <div className="space-y-2">
              <h2 className="text-[22px] md:text-[clamp(24px,4vw,36px)] font-bold tracking-tight text-[#0F172A]">Latest Mock Tests</h2>
              <p className="max-w-2xl text-[14px] md:text-[clamp(13px,1.5vw,16px)] font-medium text-slate-500">Best mock tests checked by latest Punjab boards.</p>
           </div>
           <Link href="/mocks" className="text-primary font-bold text-[13px] md:text-base tracking-tight hover:underline flex items-center gap-2 group shrink-0">
              View All <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
           </Link>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8 lg:gap-10">
          {loading ? (
             Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-[210px] md:h-[420px] w-full rounded-2xl md:rounded-[3rem] bg-slate-50" />)
          ) : mocks.length > 0 ? mocks.map((mock, i) => {
            const tier = (mock.accessLevel || 'FREE').toUpperCase();
            const isPremium = tier === 'PREMIUM';
            const locked = isPremium && !isPassActive;
            const boardId = mock.boardId || mock.boardIds?.[0] || "GENERAL";
            
            return (
              <motion.div 
                key={mock.id} 
                initial={{ opacity: 0, y: 15 }} 
                whileInView={{ opacity: 1, y: 0 }} 
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.05 }} 
                className="flex flex-col h-full"
              >
                <Card className="border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-500 rounded-[24px] md:rounded-[3rem] bg-white p-4 md:p-10 lg:p-12 flex flex-col group h-full min-h-[220px] md:min-h-[420px] relative overflow-hidden">
                  
                  <div className="flex justify-center mb-4 md:mb-12 shrink-0">
                    <div className="h-10 w-10 md:h-24 md:w-24 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-500 overflow-hidden">
                        <AuthorityLogo boardId={boardId} size="lg" className="bg-transparent shadow-none border-none p-0 h-full w-full" />
                    </div>
                  </div>

                  <div className="flex-1 flex flex-col justify-start text-center min-w-0">
                    <h3 className="text-[15px] md:text-[clamp(15px,1.7vw,20px)] font-semibold leading-tight tracking-tight line-clamp-2 text-[#0F172A] group-hover:text-primary transition-colors mb-3 md:mb-8">
                        {mock.title}
                    </h3>
                    
                    <div className="mt-auto md:mt-0 space-y-3 md:space-y-5">
                       <div className="flex flex-wrap items-center justify-center gap-3 md:gap-8 text-[11px] md:text-[clamp(9px,1vw,12px)] font-bold text-slate-400 tracking-tight">
                          <span className="flex items-center gap-1.5"><BookOpen className="h-4 w-4 md:h-5 md:w-5 text-primary" /> {mock.totalQuestions} Qs</span>
                          <span className="flex items-center gap-1.5"><Clock className="h-4 w-4 md:h-5 md:w-5 text-primary" /> {mock.duration}m</span>
                       </div>

                       {isPremium && (
                         <div className="flex justify-center h-4 md:h-7">
                            <Badge className="bg-amber-50 text-amber-600 border-none text-[11px] font-bold px-3 py-1 rounded-full shadow-sm flex items-center gap-1.5 tracking-tight">
                               <Lock className="h-3 w-3" /> Premium
                            </Badge>
                         </div>
                       )}
                    </div>
                  </div>

                  <div className="mt-auto pt-5 md:pt-10 shrink-0">
                    <Button asChild className={cn(
                      "w-full h-12 md:h-16 lg:h-18 rounded-full font-bold text-[14px] md:text-[15px] shadow-lg border-none transition-all active:scale-95 gap-2 md:gap-3", 
                      locked ? "bg-amber-500 hover:bg-amber-600 text-white" : "bg-[#0F172A] text-white"
                    )}>
                        <Link href={locked ? '/pass' : `/mocks/view?id=${mock.id}`} className="flex items-center justify-center">
                          {locked ? 'Unlock' : 'Start'}
                          <ChevronRight className="h-4 w-4 md:h-5 md:w-5" />
                        </Link>
                    </Button>
                  </div>
                </Card>
              </motion.div>
            )
          }) : (
            <div className="col-span-full py-24 text-center opacity-30 italic font-bold text-lg text-slate-400">
               Syncing tests...
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
