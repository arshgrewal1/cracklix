
'use client';

import React, { useMemo } from "react"
import { motion } from "framer-motion"
import { BookOpen, Zap, Lock, ChevronRight, Play } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"
import { useCollection, useFirestore, useUser } from "@/firebase"
import { collection, query, where, limit } from "firebase/firestore"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { AuthorityLogo } from "@/lib/exam-icons"

/**
 * @fileOverview High-Density Latest Tests Hub v51.1.
 * FIXED: Increased left padding on header to prevent clipping in PWA viewports.
 */
export default function LatestMocks() {
  const db = useFirestore()
  const { profile } = useUser()
  
  const mocksQuery = useMemo(() => (db ? query(collection(db, "mocks"), where("published", "==", true), limit(2)) : null), [db])
  const { data: mocks, loading } = useCollection<any>(mocksQuery)

  const isPassActive = useMemo(() => {
    if (!profile) return false;
    if (profile.role === 'ADMIN' || profile.role === 'SUPER_ADMIN') return true;
    return profile.passStatus === 'active';
  }, [profile]);

  return (
    <section className="py-10 md:py-16 bg-background border-y border-border">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        <div className="flex items-center justify-between px-2 text-left">
          <div className="flex items-center gap-3">
             <div className="h-8 w-8 md:h-10 md:w-10 rounded-xl bg-orange-50 dark:bg-orange-950/30 flex items-center justify-center text-orange-500 shadow-inner shrink-0">
               <Zap className="h-4 w-4 md:h-5 md:w-5 fill-current" />
             </div>
             <div className="text-left min-w-0">
                <h2 className="text-lg md:text-2xl font-black text-foreground tracking-tight truncate">Latest Mocks</h2>
                <p className="text-[10px] md:text-xs font-medium text-muted-foreground truncate">New practice series synced</p>
             </div>
          </div>
          <Link href="/mocks" className="text-primary font-bold text-[10px] md:text-xs flex items-center gap-1 hover:underline group shrink-0">
            View all <ChevronRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
        
        <div className="grid grid-cols-1 gap-4 md:gap-8">
          {loading ? (
             Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-40 w-full rounded-2xl bg-muted" />)
          ) : mocks && mocks.length > 0 ? mocks.map((mock, i) => {
            const isPremium = mock.accessLevel?.toUpperCase() === 'PREMIUM';
            const locked = isPremium && !isPassActive;
            const boardId = mock.boardId || mock.boardIds?.[0] || "GENERAL";
            
            return (
              <motion.div 
                key={mock.id} 
                initial={{ opacity: 0, y: 10 }} 
                whileInView={{ opacity: 1, y: 0 }} 
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="h-full"
              >
                <Card className="border border-border shadow-sm group-hover:shadow-xl transition-all duration-300 rounded-2xl bg-card p-4 md:p-6 flex flex-col group h-full relative overflow-hidden text-left flex-1 min-h-[160px] md:min-h-[220px]">
                  
                  <div className="flex justify-between items-start mb-4">
                    <AuthorityLogo boardId={boardId} size="sm" className="h-10 w-10 md:h-12 md:w-12 rounded-lg shadow-sm border-2 border-background bg-muted" />
                    {isPremium && (
                       <Badge className="bg-amber-50 dark:bg-amber-900/20 text-amber-600 border-none px-2 py-0.5 rounded-full font-bold text-[7px] flex items-center gap-1">
                          <Lock className="h-2 w-2" /> Elite
                       </Badge>
                    )}
                  </div>

                  <div className="flex-1 space-y-2 min-w-0">
                    <h3 className="text-sm md:text-lg font-bold leading-tight text-foreground group-hover:text-primary transition-colors line-clamp-1 truncate">
                        {mock.title}
                    </h3>
                    
                    <div className="flex items-center gap-3 pt-1">
                       <div className="flex items-center gap-1 text-[8px] md:text-[9px] font-bold text-muted-foreground uppercase tracking-tight">
                          <BookOpen className="h-3 w-3 text-primary/40" />
                          {mock.totalQuestions} questions
                       </div>
                       <div className="h-1 w-1 rounded-full bg-border" />
                       <span className="text-[8px] md:text-[9px] font-bold text-muted-foreground uppercase">{mock.difficulty} level</span>
                    </div>
                  </div>

                  <div className="mt-6 pt-2">
                    <Button asChild className={cn(
                      "w-full h-10 md:h-11 rounded-xl font-black uppercase text-[9px] md:text-[10px] tracking-widest shadow-md border-none transition-all active:scale-95 gap-2", 
                      locked ? "bg-amber-500 hover:bg-amber-600 text-white" : "bg-[#0F172A] hover:bg-primary text-white"
                    )}>
                        <Link href={locked ? '/pass' : `/mocks/view?id=${mock.id}`}>
                          {locked ? <Lock className="h-3 w-3" /> : <Play className="h-3 w-3 fill-current" />}
                          {locked ? "Unlock" : "Start Test"}
                        </Link>
                    </Button>
                  </div>
                </Card>
              </motion.div>
            )
          }) : (
            <div className="col-span-full py-12 text-center opacity-30 italic font-black uppercase text-[10px] border-2 border-dashed border-border rounded-2xl">
               Awaiting content sync
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
