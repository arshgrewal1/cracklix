'use client';

import React, { useMemo } from "react"
import { motion } from "framer-motion"
import { BookOpen, Zap, Lock, ChevronRight, Play } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"
import { useCollection, useFirestore, useUser } from "@/firebase"
import { collection, query, where } from "firebase/firestore"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { AuthorityLogo } from "@/lib/exam-icons"

/**
 * @fileOverview Compact Latest Tests Hub v50.0.
 * UPDATED: Shrinking card sizes, adding colorful action buttons, and removing uppercase labels.
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
    }).slice(0, 5);
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
             <div className="h-8 w-8 md:h-10 md:w-10 rounded-xl bg-orange-50 dark:bg-orange-950/30 flex items-center justify-center text-orange-500 shadow-inner shrink-0">
               <Zap className="h-4 w-4 md:h-5 md:w-5 fill-current" />
             </div>
             <div className="text-left">
                <h2 className="text-lg md:text-2xl font-black text-foreground tracking-tight">Latest mocks</h2>
                <p className="text-[10px] md:text-xs font-medium text-muted-foreground">Recently synced items</p>
             </div>
          </div>
          <Link href="/mocks" className="text-primary font-bold text-[10px] md:text-xs flex items-center gap-1 hover:underline group">
            View all <ChevronRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-5 gap-3 md:gap-6">
          {loading ? (
             Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-44 w-full rounded-xl bg-muted" />)
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
                <Card className="border-none shadow-sm group-hover:shadow-xl transition-all duration-500 rounded-xl bg-card p-3 md:p-5 flex flex-col group h-full relative overflow-hidden text-left flex-1 min-h-[180px] md:min-h-[260px]">
                  
                  <div className="flex justify-between items-start mb-3 md:mb-6">
                    <AuthorityLogo boardId={boardId} size="sm" className="h-8 w-8 md:h-10 md:w-10 rounded-lg shadow-sm" />
                    {isPremium && (
                       <Badge className="bg-amber-50 dark:bg-amber-900/20 text-amber-600 border-none px-1.5 py-0.5 rounded-full font-bold text-[7px] flex items-center gap-1">
                          <Lock className="h-2 w-2" /> Elite
                       </Badge>
                    )}
                  </div>

                  <div className="flex-1 space-y-2 min-w-0">
                    <div className="space-y-0.5 text-left">
                       <p className="text-[7px] md:text-[8px] font-black text-primary tracking-tighter uppercase">{mock.difficulty || 'Mixed'} level</p>
                       <h3 className="text-xs md:text-sm font-bold leading-tight text-foreground group-hover:text-primary transition-colors line-clamp-2 min-h-[2.4em]">
                           {mock.title}
                       </h3>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-1 pt-2 border-t border-border">
                       <StatPill icon={BookOpen} label={`${mock.totalQuestions} Qs`} />
                    </div>
                  </div>

                  <div className="mt-4 pt-2">
                    <Button asChild className={cn(
                      "w-full h-8 md:h-10 rounded-lg font-bold text-[9px] md:text-[10px] tracking-tight shadow-md border-none transition-all active:scale-95 gap-2", 
                      locked ? "bg-amber-500 hover:bg-amber-600 text-white" : "bg-[#0F172A] hover:bg-primary text-white"
                    )}>
                        <Link href={locked ? '/pass' : `/mocks/view?id=${mock.id}`}>
                          {locked ? <Lock className="h-3 w-3" /> : <Play className="h-3 w-3 fill-current" />}
                          {locked ? "Unlock" : "Start"}
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
      <div className="flex items-center gap-1 text-[7px] md:text-[8px] font-bold text-muted-foreground tracking-tight">
         <Icon className="h-2 w-2 text-primary/40 shrink-0" />
         <span className="truncate">{label}</span>
      </div>
   )
}
