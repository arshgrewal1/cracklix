
'use client';

import { useMemo, useState, useEffect } from "react"
import { motion } from "framer-motion"
import { BookOpen, Clock, ChevronRight, Zap, Lock, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { useCollection, useFirestore, useUser } from "@/firebase"
import { collection, query, where, limit } from "firebase/firestore"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { useRouter, usePathname } from "next/navigation"

/**
 * @fileOverview High-Density Mock Feed v20.0.
 * UPDATED: Standardized Series labels: Full Length, Subject-Wise, etc.
 */

export default function LatestMocks() {
  const db = useFirestore()
  const { user, profile } = useUser()
  const router = useRouter()
  
  const mocksQuery = useMemo(() => (db ? query(collection(db, "mocks"), where("published", "==", true), limit(8)) : null), [db])
  const { data: rawMocks, loading } = useCollection<any>(mocksQuery)
  const { data: boards } = useCollection<any>(useMemo(() => (db ? collection(db, "boards") : null), [db]))

  const hasActivePass = useMemo(() => {
     if (!profile) return false;
     const isAdmin = profile.role === 'ADMIN' || profile.role === 'SUPER_ADMIN';
     if (isAdmin) return true;

     if (profile.pass && profile.pass.active === true) {
        const expiry = new Date(profile.pass.expiryDate);
        const now = new Date();
        return expiry > now;
     }
     
     return false;
  }, [profile]);

  const mocks = useMemo(() => {
    if (!rawMocks) return []
    return [...rawMocks].sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))
  }, [rawMocks])

  const handleAttemptClick = (mockId: string) => {
    if (!user) {
       router.push(`/login?returnUrl=${encodeURIComponent(`/mocks/${mockId}`)}`);
       return;
    }
    router.push(`/mocks/${mockId}`);
  };

  const formatMockType = (type: string) => {
    const map: Record<string, string> = {
      'FULL': 'Full Length Mock',
      'SUBJECT': 'Subject-Wise Test',
      'SECTIONAL': 'Sectional Test',
      'PYQ': 'PYQ Paper'
    };
    return map[type] || type;
  };

  return (
    <section className="py-8 md:py-16 bg-white">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 gap-4 text-left">
          <div className="space-y-1">
            <div className="flex items-center gap-2"><Zap className="h-3 w-3 text-primary" /><span className="text-[7px] md:text-[10px] font-black uppercase tracking-widest text-slate-500">Live Feed</span></div>
            <h2 className="text-2xl md:text-4xl font-black text-[#000000] font-headline uppercase tracking-tight">LATEST <span className="text-primary">MOCKS</span></h2>
            <p className="text-[11px] md:text-lg text-slate-500 font-medium">Updated for upcoming exams.</p>
          </div>
          <Link href="/mocks" className="text-primary font-black text-[7px] md:text-[11px] uppercase tracking-widest bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100 hover:shadow-md transition-all">View All <ChevronRight className="h-3 w-3 inline" /></Link>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {loading ? (
             Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-32 md:h-64 w-full rounded-2xl" />)
          ) : mocks.length > 0 ? mocks.map((mock, i) => {
            const board = boards?.find((b: any) => b.id === (mock.boardIds?.[0] || mock.boardId));
            const tier = (mock.accessLevel || mock.accessType || 'FREE').trim().toUpperCase();
            const isPremium = tier === 'PREMIUM';
            const locked = isPremium && user && !hasActivePass;

            return (
              <motion.div key={mock.id} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} viewport={{ once: true }}>
                <div className="bg-white rounded-xl md:rounded-[2.5rem] border border-slate-100 shadow-md hover:shadow-xl transition-all p-4 md:p-8 text-left flex flex-col h-full group relative">
                  <div className="flex justify-between items-start mb-3 md:mb-6">
                    <div className="h-8 w-8 md:h-12 md:w-12 rounded-lg bg-slate-50 flex items-center justify-center shrink-0 overflow-hidden shadow-inner">
                       {board?.iconUrl ? <img src={board.iconUrl} className="p-1.5 h-full w-full object-contain" alt="Logo" referrerPolicy="no-referrer" /> : <Zap className="h-4 w-4 text-primary" />}
                    </div>
                    <Badge className={cn("border-none text-[6px] md:text-[8px] font-black uppercase px-2 py-0.5 rounded shadow-sm", isPremium ? "bg-amber-100 text-amber-600" : "bg-primary/5 text-primary")}>
                       {isPremium ? 'PREMIUM' : 'FREE'}
                    </Badge>
                  </div>
                  <div className="mb-2">
                    <p className="text-[7px] md:text-[8px] font-black text-primary uppercase tracking-widest mb-1">{formatMockType(mock.mockType)}</p>
                    <h3 className="font-black text-[13px] md:text-base text-[#000000] leading-tight uppercase line-clamp-2 min-h-[32px] md:min-h-[40px] group-hover:text-primary transition-colors">{mock.title}</h3>
                  </div>
                  <div className="flex items-center gap-3 mb-4 text-[7px] md:text-[9px] text-slate-400 font-bold uppercase tracking-widest border-t border-slate-50 pt-3">
                     <span className="flex items-center gap-1"><BookOpen className="h-2.5 w-2.5 text-primary" /> {mock.totalQuestions} Qs</span>
                     <span className="flex items-center gap-1"><Clock className="h-2.5 w-2.5 text-primary" /> {mock.duration}m</span>
                  </div>
                  <div className="mt-auto">
                    {locked ? (
                       <Button onClick={() => router.push('/pass')} className="w-full h-9 md:h-12 bg-orange-500 hover:bg-orange-600 text-white font-black text-[8px] md:text-[10px] uppercase tracking-widest rounded-lg shadow-lg border-none active:scale-95 flex items-center justify-center gap-2">
                          <Lock className="h-3 w-3" /> UNLOCK TEST
                       </Button>
                    ) : (
                       <Button onClick={() => handleAttemptClick(mock.id)} className="w-full h-9 md:h-12 bg-[#0F172A] hover:bg-black text-white font-black text-[8px] md:text-[10px] uppercase tracking-widest rounded-lg shadow-lg border-none active:scale-95">
                          ATTEMPT NOW
                       </Button>
                    )}
                  </div>
                </div>
              </motion.div>
            )
          }) : !loading && (
            <div className="col-span-full py-20 text-center opacity-20 flex flex-col items-center gap-4">
               <Sparkles className="h-10 w-10 text-slate-300" />
               <p className="font-black uppercase tracking-widest text-[10px]">Awaiting Mock Node Deployment</p>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
