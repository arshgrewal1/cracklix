'use client';

import React, { useMemo } from "react"
import { motion } from "framer-motion"
import { BookOpen, Clock, Zap, Lock, ChevronRight, Layers, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import Link from "next/link"
import { useCollection, useFirestore, useUser } from "@/firebase"
import { collection, query, where } from "firebase/firestore"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { AuthorityLogo } from "@/lib/exam-icons"

/**
 * @fileOverview Compact Latest Tests Hub v47.0.
 */
export default function LatestMocks() {
  const db = useFirestore()
  const { profile } = useUser()
  
  const mocksQuery = useMemo(() => (db ? query(collection(db, "mocks"), where("published", "==", true)) : null), [db])
  const { data: rawMocks, loading } = useCollection<any>(mocksQuery)

  const mocks = useMemo(() => {
    if (!rawMocks) return []
    return [...rawMocks].sort((a, b) => {
      const tA = a.createdAt?.seconds || 0;
      const tB = b.createdAt?.seconds || 0;
      return tB - tA;
    }).slice(0, 4);
  }, [rawMocks])

  const isPassActive = useMemo(() => {
    if (!profile) return false;
    if (profile.role === 'ADMIN' || profile.role === 'SUPER_ADMIN') return true;
    return profile.passStatus === 'active';
  }, [profile]);

  return (
    <section className="py-10 md:py-16 bg-background border-y border-slate-100 dark:border-slate-800">
      <div className="max-w-[1440px] 2xl:max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-3">
             <div className="h-9 w-9 md:h-11 md:w-11 rounded-xl bg-orange-50 dark:bg-orange-950/30 flex items-center justify-center text-orange-500 shadow-inner shrink-0">
               <Zap className="h-4 w-4 md:h-5 md:w-5 fill-current" />
             </div>
             <div className="text-left">
                <h2 className="text-xl md:text-2xl font-black text-foreground tracking-tight uppercase">Latest mocks</h2>
                <p className="text-[10px] md:text-xs font-medium text-muted-foreground uppercase">Recently synced items</p>
             </div>
          </div>
          <Link href="/mocks" className="text-primary font-bold text-[10px] md:text-xs flex items-center gap-1 hover:underline group uppercase">
            View all <ChevronRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {loading ? (
             Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-64 w-full rounded-2xl bg-muted border border-border" />)
          ) : mocks.map((mock, i) => {
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
                className="flex flex-col h-full"
              >
                <Card className="border border-border shadow-sm hover:shadow-xl transition-all duration-500 rounded-2xl bg-card p-4 md:p-6 flex flex-col group h-full relative overflow-hidden text-left flex-1 border-none">
                  
                  <div className="flex justify-between items-start mb-4 md:mb-6">
                    <AuthorityLogo boardId={boardId} size="sm" className="h-10 w-10 md:h-12 md:w-12 shadow-md" />
                    {isPremium && (
                       <Badge className="bg-amber-50 dark:bg-amber-900/20 text-amber-600 border-none px-2 py-0.5 rounded-full font-bold text-[7px] md:text-[8px] uppercase tracking-tighter flex items-center gap-1">
                          <Lock className="h-2 w-2" /> Elite
                       </Badge>
                    )}
                  </div>

                  <div className="flex-1 space-y-3">
                    <div className="space-y-1">
                       <p className="text-[8px] md:text-[9px] font-black text-primary uppercase tracking-tighter">{mock.difficulty || 'Mixed'} level</p>
                       <h3 className="text-[13px] md:text-[15px] font-bold leading-tight text-foreground group-hover:text-primary transition-colors line-clamp-2 uppercase min-h-[2.4em]">
                           {mock.title}
                       </h3>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 pt-3 border-t border-border">
                       <StatPill icon={BookOpen} label={`${mock.totalQuestions} Qs`} />
                       <StatPill icon={Clock} label={`${mock.duration}m`} />
                    </div>
                  </div>

                  <div className="mt-5 pt-3">
                    <Button asChild className={cn(
                      "w-full h-9 md:h-11 rounded-xl font-bold text-[9px] md:text-[10px] uppercase tracking-tight shadow-md border-none transition-all active:scale-95 gap-2", 
                      locked ? "bg-amber-500 hover:bg-amber-600 text-white" : "bg-[#0F172A] dark:bg-primary hover:bg-black text-white"
                    )}>
                        <Link href={locked ? '/pass' : `/mocks/view?id=${mock.id}`}>
                          {locked ? <Lock className="h-3 w-3" /> : null}
                          Start Test
                        </Link>
                    </Button>
                  </div>
                </Card>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

function StatPill({ icon: Icon, label }: any) {
   return (
      <div className="flex items-center gap-1.5 text-[8px] md:text-[9px] font-bold text-muted-foreground uppercase tracking-tight">
         <Icon className="h-2.5 w-2.5 text-primary/40 shrink-0" />
         <span className="truncate">{label}</span>
      </div>
   )
}
