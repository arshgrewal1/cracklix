
'use client';

import { useMemo, useState, useEffect } from "react"
import { motion } from "framer-motion"
import { BookOpen, Clock, ChevronRight, Zap, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { useCollection, useFirestore, useUser } from "@/firebase"
import { collection, query, where, limit, getDocs } from "firebase/firestore"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

/**
 * @fileOverview High-Density Mock Feed v9.2.
 * FIXED: Pass-gating logic normalization (Free vs FREE).
 */

export default function LatestMocks() {
  const db = useFirestore()
  const { user, profile } = useUser()
  
  const mocksQuery = useMemo(() => (db ? query(collection(db, "mocks"), where("published", "==", true)) : null), [db])
  const { data: rawMocks, loading } = useCollection<any>(mocksQuery)
  const { data: boards } = useCollection<any>(useMemo(() => (db ? collection(db, "boards") : null), [db]))

  const [hasPass, setHasPass] = useState(false);

  useEffect(() => {
    async function checkPass() {
      if (!user || !db) return;
      
      const role = (profile?.role || '').toUpperCase();
      if (role === 'ADMIN' || role === 'SUPER_ADMIN') {
        setHasPass(true);
        return;
      }
      
      const status = (profile?.status || '').toLowerCase();
      const activeStatus = status !== '' && status !== 'free';
      
      if (activeStatus) {
        setHasPass(true);
        return;
      }
      
      const subQuery = query(collection(db, "subscriptions"), where("userId", "==", user.uid), where("status", "==", "active"), limit(1));
      const snap = await getDocs(subQuery);
      if (!snap.empty && new Date(snap.docs[0].data().expiryDate) > new Date()) {
        setHasPass(true);
      }
    }
    checkPass();
  }, [user, db, profile]);

  const mocks = useMemo(() => {
    if (!rawMocks) return []
    return [...rawMocks].sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)).slice(0, 8)
  }, [rawMocks])

  return (
    <section className="py-8 md:py-16 bg-white">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 gap-4 text-left">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
               <Zap className="h-3 w-3 text-primary" />
               <span className="text-[7px] md:text-[10px] font-black uppercase tracking-widest text-slate-500">Live Feed</span>
            </div>
            <h2 className="text-2xl md:text-4xl font-headline font-black text-[#000000] uppercase tracking-tight">
              LATEST <span className="text-primary">MOCKS</span>
            </h2>
            <p className="text-[11px] md:text-lg text-slate-500 font-medium">Updated for upcoming exams.</p>
          </div>
          <Link href="/mocks" className="text-primary font-black text-[7px] md:text-[11px] uppercase tracking-widest bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100 shadow-sm hover:shadow-md transition-all">
            View All <ChevronRight className="h-3 w-3 inline" />
          </Link>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {loading ? (
             Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-32 md:h-64 w-full rounded-2xl" />)
          ) : mocks.map((mock, i) => {
            const boardId = mock.boardIds?.[0] || mock.boardId;
            const board = boards?.find((b: any) => b.id === boardId);
            const isPremium = (mock.accessType || 'FREE').toUpperCase() === 'PREMIUM';
            const locked = isPremium && !hasPass;

            return (
              <motion.div key={mock.id} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} viewport={{ once: true }}>
                <div className="bg-white rounded-xl md:rounded-[2.5rem] border border-slate-100 shadow-md hover:shadow-xl transition-all p-4 md:p-8 text-left flex flex-col h-full group relative">
                  {locked && <div className="absolute top-4 right-4 text-amber-500"><Lock className="h-3.5 w-3.5" /></div>}
                  <div className="flex justify-between items-start mb-3 md:mb-6">
                    <div className="h-8 w-8 md:h-12 md:w-12 rounded-lg bg-slate-50 flex items-center justify-center shrink-0 overflow-hidden shadow-inner">
                       {board?.iconUrl ? <img src={board.iconUrl} className="p-1.5 h-full w-full object-contain" alt="Logo" referrerPolicy="no-referrer" /> : <Zap className="h-4 w-4 text-primary" />}
                    </div>
                    <Badge className={cn("border-none text-[6px] md:text-[8px] font-black uppercase px-2 py-0.5 rounded shadow-sm", isPremium ? "bg-amber-100 text-amber-600" : "bg-primary/5 text-primary")}>
                       {isPremium ? "PREMIUM" : (board?.abbreviation || 'GOVT')}
                    </Badge>
                  </div>
                  <h3 className="font-black text-[13px] md:text-base text-[#000000] leading-tight mb-2 uppercase line-clamp-2 min-h-[32px] md:min-h-[40px] group-hover:text-primary transition-colors">{mock.title}</h3>
                  
                  <div className="flex items-center gap-3 mb-4 text-[7px] md:text-[9px] text-slate-400 font-bold uppercase tracking-widest border-t border-slate-50 pt-3">
                     <span className="flex items-center gap-1"><BookOpen className="h-2.5 w-2.5 text-primary" /> {mock.totalQuestions} Qs</span>
                     <span className="flex items-center gap-1"><Clock className="h-2.5 w-2.5 text-primary" /> {mock.duration}m</span>
                  </div>

                  <Button asChild className={cn(
                    "w-full h-9 md:h-12 font-black text-[8px] md:text-[10px] uppercase tracking-widest rounded-lg mt-auto transition-all shadow-lg border-none active:scale-95",
                    locked ? "bg-amber-500 hover:bg-amber-600 text-white" : "bg-[#0F172A] hover:bg-black text-white"
                  )}>
                    <Link href={locked ? "/pass" : `/mocks/${mock.id}`}>
                       {locked ? "UNLOCK TEST" : "ATTEMPT NOW"}
                    </Link>
                  </Button>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
