'use client';

import { useMemo, useState, useEffect } from "react"
import { motion } from "framer-motion"
import { BookOpen, Clock, Zap, Lock, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Card,
  CardContent,
  CardHeader,
  CardTitle 
} from "@/components/ui/card"
import Link from "next/link"
import { useCollection, useFirestore, useUser } from "@/firebase"
import { collection, query, where, limit } from "firebase/firestore"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

/**
 * @fileOverview Official Latest Mock Hub v34.1.
 * FIXED: Explicitly added all Card UI imports to resolve ReferenceError.
 */

const SUPER_ADMIN_WHITELIST = ['arshdeepgrewal1122@gmail.com'];

export default function LatestMocks() {
  const db = useFirestore()
  const { user, profile } = useUser()
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});
  
  const mocksQuery = useMemo(() => (db ? query(collection(db, "mocks"), where("published", "==", true), limit(5)) : null), [db])
  const { data: rawMocks, loading } = useCollection<any>(mocksQuery)
  const { data: boards } = useCollection<any>(useMemo(() => (db ? collection(db, "boards") : null), [db]))

  const mocks = useMemo(() => {
    if (!rawMocks) return []
    return [...rawMocks].sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))
  }, [rawMocks])

  const isPassActive = useMemo(() => {
    if (!user || !profile) return false;
    const userEmail = user.email?.toLowerCase();
    const isFounder = userEmail && SUPER_ADMIN_WHITELIST.includes(userEmail);
    if (profile.role === 'ADMIN' || profile.role === 'SUPER_ADMIN' || isFounder) return true;
    if (profile.pass?.active === true) {
      const expiry = new Date(profile.pass.expiryDate);
      return expiry > new Date();
    }
    return false;
  }, [user, profile]);

  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="container mx-auto px-4 max-w-7xl">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6 text-left">
           <div className="space-y-2">
              <h2 className="text-3xl md:text-5xl font-headline font-black text-[#0F172A] uppercase tracking-tight leading-none">Latest Mock Tests</h2>
              <p className="text-slate-500 font-medium">Recently deployed preparation nodes.</p>
           </div>
           <Link href="/mocks" className="text-primary font-black uppercase text-[10px] md:text-xs tracking-widest hover:underline flex items-center gap-2">
              View All Series <ArrowRight className="h-4 w-4" />
           </Link>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {loading ? (
             Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-80 w-full rounded-[2.5rem]" />)
          ) : mocks.map((mock, i) => {
            const board = boards?.find((b: any) => b.id === (mock.boardIds?.[0] || mock.boardId));
            const difficulty = mock.difficulty || "Medium";
            const tier = (mock.accessLevel || 'FREE').toUpperCase();
            const isPremium = tier === 'PREMIUM';
            const locked = isPremium && !isPassActive;
            
            return (
              <motion.div key={mock.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} viewport={{ once: true }}>
                <Card className="border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 rounded-[2.5rem] bg-white p-6 text-center flex flex-col h-full group">
                  
                  <div className="h-16 w-16 mx-auto rounded-full bg-slate-50 flex items-center justify-center p-3 shadow-inner group-hover:scale-110 transition-transform mb-6 relative overflow-hidden">
                     {board?.iconUrl && !failedImages[board.id] ? (
                       <img 
                         src={board.iconUrl} 
                         className="h-full w-full object-contain" 
                         alt="Logo" 
                         referrerPolicy="no-referrer"
                         onError={() => setFailedImages(prev => ({...prev, [board.id]: true}))}
                       />
                     ) : (
                       <Zap className="h-6 w-6 text-primary" />
                     )}
                  </div>

                  <CardHeader className="p-0 flex-1 space-y-4">
                     <CardTitle className="font-black text-sm md:text-base text-[#0F172A] leading-tight uppercase line-clamp-2 min-h-[40px] group-hover:text-primary transition-colors">
                        {mock.title}
                     </CardTitle>

                     <div className="flex items-center justify-center gap-3 text-[9px] font-bold text-slate-400 uppercase tracking-tight">
                        <span className="flex items-center gap-1.5"><BookOpen className="h-3 w-3 text-slate-300" /> {mock.totalQuestions} Qs</span>
                        <div className="h-3 w-px bg-slate-100" />
                        <span className="flex items-center gap-1.5"><Clock className="h-3 w-3 text-slate-300" /> {mock.duration}m</span>
                     </div>

                     <Badge className={cn(
                        "border-none text-[8px] font-black uppercase tracking-widest px-3 py-1 rounded shadow-sm",
                        difficulty === 'Hard' ? "bg-rose-50 text-rose-500" :
                        difficulty === 'Easy' ? "bg-emerald-50 text-emerald-600" :
                        "bg-orange-50 text-orange-500"
                     )}>
                        {isPremium ? '🔒 PREMIUM' : difficulty}
                     </Badge>
                  </CardHeader>

                  <CardContent className="p-0 mt-8 pt-4">
                     {locked ? (
                       <Button asChild className="w-full h-11 bg-orange-500 hover:bg-orange-600 text-white font-black text-[9px] uppercase tracking-widest rounded-xl transition-all shadow-sm active:scale-95 border-none">
                          <Link href="/pass">Unlock Test</Link>
                       </Button>
                     ) : (
                       <Button asChild className="w-full h-11 bg-[#0B1528] text-white hover:bg-black font-black text-[9px] uppercase tracking-widest rounded-xl transition-all shadow-sm active:scale-95 border-none">
                          <Link href={`/mocks/${mock.id}`}>Attempt Now</Link>
                       </Button>
                     )}
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
