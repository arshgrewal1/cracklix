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
 * @fileOverview Institutional Mock Hub v21.0 - Alignment Hardened.
 * FIXED: Replaced mt-6 with mt-auto to ensure Start/Unlock buttons align perfectly.
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
    <section className="section-py bg-white border-t border-slate-100">
      <div className="max-w-[1440px] mx-auto container-px space-y-8 md:space-y-16">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-3 text-left">
           <div className="space-y-1">
              <h2 className="text-[28px] md:text-5xl font-black tracking-tight leading-none text-[#0F172A]">Latest Mock Tests</h2>
              <p className="max-w-2xl text-sm md:text-xl font-medium text-slate-500">Freshly updated practice series mapped to the latest recruitment patterns.</p>
           </div>
           <Link href="/mocks" className="text-primary font-bold text-sm md:text-base tracking-tight hover:underline flex items-center gap-2 group shrink-0">
              View All <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
           </Link>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8 lg:gap-10">
          {loading ? (
             Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-[280px] md:h-[380px] w-full rounded-[24px] md:rounded-[3rem] bg-slate-50" />)
          ) : mocks.length > 0 ? mocks.map((mock, i) => {
            const tier = (mock.accessLevel || 'FREE').toUpperCase();
            const isPremium = tier === 'PREMIUM';
            const locked = isPremium && !isPassActive;
            const boardId = mock.boardId || mock.boardIds?.[0] || "GENERAL";
            
            const title = (mock.title || "Practice Mock")
              .split(' ')
              .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
              .join(' ');

            return (
              <motion.div 
                key={mock.id} 
                initial={{ opacity: 0, y: 15 }} 
                whileInView={{ opacity: 1, y: 0 }} 
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.05 }} 
                className="flex flex-col"
              >
                <Card className="border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-500 rounded-[24px] md:rounded-[3rem] bg-white p-5 md:p-10 flex flex-col group h-[280px] md:h-[400px] relative overflow-hidden">
                  
                  <div className="flex justify-center mb-4 md:mb-10 shrink-0">
                    <div className="h-12 w-12 md:h-20 md:w-20 bg-slate-50 rounded-xl md:rounded-3xl shadow-inner group-hover:scale-110 transition-transform overflow-hidden flex items-center justify-center p-1.5">
                        <AuthorityLogo boardId={boardId} size="sm" className="h-full w-full" />
                    </div>
                  </div>

                  <div className="flex-1 flex flex-col justify-start text-center space-y-3 md:space-y-6 min-w-0">
                    <h3 className="text-[15px] md:text-2xl font-black leading-tight tracking-tight line-clamp-2 text-[#0F172A] group-hover:text-primary transition-colors">
                        {title}
                    </h3>
                    
                    <div className="space-y-3">
                       <div className="flex flex-wrap items-center justify-center gap-3 md:gap-5 text-[9px] md:text-sm font-bold text-slate-400 uppercase tracking-tight">
                          <span className="flex items-center gap-1.5"><BookOpen className="h-3.5 w-3.5 md:h-4 md:w-4 text-primary" /> {mock.totalQuestions} Qs</span>
                          <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5 md:h-4 md:w-4 text-primary" /> {mock.duration}m</span>
                       </div>

                       {isPremium && (
                         <div className="flex justify-center h-6">
                            <Badge className="bg-amber-50 text-amber-600 border-none text-[9px] md:text-[12px] font-black px-3 py-1 rounded-lg shadow-sm flex items-center gap-1.5">
                               <Lock className="h-3 w-3" /> Elite
                            </Badge>
                         </div>
                       )}
                    </div>
                  </div>

                  <div className="mt-auto pt-4 shrink-0">
                    <Button asChild className={cn(
                      "w-full h-11 md:h-16 rounded-full font-black text-xs md:text-base tracking-widest shadow-md border-none transition-all active:scale-95 gap-2 uppercase", 
                      locked ? "bg-amber-500 hover:bg-amber-600 text-white" : "bg-[#0F172A] hover:bg-black text-white"
                    )}>
                        <Link href={locked ? '/pass' : `/mocks/view?id=${mock.id}`} className="flex items-center justify-center gap-2">
                          {locked ? 'Unlock' : 'Start'}
                          <ChevronRight className="h-4 w-4" />
                        </Link>
                    </Button>
                  </div>
                </Card>
              </motion.div>
            )
          }) : (
            <div className="col-span-full py-20 text-center opacity-30 italic font-bold text-base text-slate-400">
               Awaiting verified mock series push.
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
