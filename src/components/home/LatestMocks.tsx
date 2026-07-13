'use client';

import React, { useMemo, useEffect, useState } from "react"
import { motion } from "framer-motion"
import { BookOpen, Clock, Zap, Lock, ChevronRight, Star, Activity, UserPlus } from "lucide-react"
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
 * @fileOverview Premium Latest Tests Hub v40.0.
 */
export default function LatestMocks() {
  const db = useFirestore()
  const { profile } = useUser()
  
  const mocksQuery = useMemo(() => (db ? query(collection(db, "mocks"), where("published", "==", true)) : null), [db])
  const { data: rawMocks, loading } = useCollection<any>(mocksQuery)

  const mocks = useMemo(() => {
    if (!rawMocks) return []
    // Client-side sort to avoid index requirement
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
    <section className="py-10 md:py-24 bg-slate-50/50 border-y border-slate-100">
      <div className="max-w-[1440px] 2xl:max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        <div className="flex items-center justify-between px-1">
           <div className="flex items-center gap-4">
              <div className="h-10 w-10 md:h-12 md:w-12 rounded-xl bg-orange-50 flex items-center justify-center text-orange-500 shadow-inner shrink-0">
                <Zap className="h-5 w-5 md:h-6 md:w-6 fill-current" />
              </div>
              <div className="text-left">
                 <h2 className="text-xl md:text-3xl font-black text-[#0F172A] tracking-tight">Latest Mock Tests</h2>
                 <p className="text-[11px] md:text-sm font-medium text-slate-500">Newly added high-fidelity series with official patterns.</p>
              </div>
           </div>
           <Link href="/mocks" className="text-primary font-bold text-xs md:text-sm flex items-center gap-1 hover:underline">
              View All <ChevronRight className="h-4 w-4" />
           </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {loading ? (
             Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-80 w-full rounded-[2.5rem] bg-white border border-slate-100" />)
          ) : mocks.map((mock, i) => {
            const isPremium = mock.accessLevel?.toUpperCase() === 'PREMIUM';
            const locked = isPremium && !isPassActive;
            const boardId = mock.boardId || mock.boardIds?.[0] || "GENERAL";
            
            return (
              <motion.div 
                key={mock.id} 
                initial={{ opacity: 0, y: 15 }} 
                whileInView={{ opacity: 1, y: 0 }} 
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className="border border-slate-100 shadow-xl hover:shadow-4xl transition-all duration-500 rounded-[2.5rem] bg-white p-8 flex flex-col group h-full relative overflow-hidden text-left">
                  
                  <div className="flex justify-between items-start mb-6">
                    <AuthorityLogo boardId={boardId} size="md" className="shadow-xl" />
                    {isPremium && (
                       <Badge className="bg-amber-50 text-amber-600 border-none px-3 py-1 rounded-full font-black text-[9px] uppercase tracking-widest shadow-sm flex items-center gap-1.5">
                          <Lock className="h-3 w-3" /> Premium
                       </Badge>
                    )}
                  </div>

                  <div className="flex-1 space-y-4">
                    <div className="space-y-1.5">
                       <p className="text-[9px] font-black text-primary uppercase tracking-[0.3em]">{mock.difficulty || 'Mixed'} Level</p>
                       <h3 className="text-xl md:text-2xl font-bold leading-tight text-[#0F172A] group-hover:text-primary transition-colors line-clamp-2">
                           {mock.title}
                       </h3>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-50">
                       <StatPill icon={BookOpen} label={`${mock.totalQuestions} Qs`} />
                       <StatPill icon={Clock} label={`${mock.duration}m`} />
                       <StatPill icon={UserPlus} label={`Attempts`} />
                       <StatPill icon={Star} label={`4.8`} />
                    </div>
                  </div>

                  <div className="mt-8">
                    <Button asChild className={cn(
                      "w-full h-12 md:h-14 rounded-xl md:rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl border-none transition-all active:scale-95 gap-2", 
                      locked ? "bg-amber-500 hover:bg-amber-600" : "bg-[#0F172A] hover:bg-black"
                    )}>
                        <Link href={locked ? '/pass' : `/mocks/view?id=${mock.id}`}>
                          {locked ? 'Unlock' : 'Continue'}
                          <ChevronRight className="h-4 w-4" />
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
      <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
         <Icon className="h-3.5 w-3.5 text-slate-300" />
         <span className="truncate">{label}</span>
      </div>
   )
}
