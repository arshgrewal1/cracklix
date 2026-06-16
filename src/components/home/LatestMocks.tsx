
'use client';

import React, { useMemo, useState, useEffect } from "react"
import { motion } from "framer-motion"
import { BookOpen, Clock, Zap, Lock, ArrowRight, Trophy, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Card,
  CardContent,
  CardHeader,
  CardTitle 
} from "@/components/ui/card"
import Link from "next/link"
import Image from "next/image"
import { useCollection, useFirestore, useUser } from "@/firebase"
import { collection, query, where, limit } from "firebase/firestore"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

/**
 * @fileOverview Elite Latest Mock Hub v42.0 (next/image optimized).
 */

const SUPER_ADMIN_WHITELIST = ['arshdeepgrewal1122@gmail.com'];

export default function LatestMocks() {
  const db = useFirestore()
  const { user, profile } = useUser()
  const [mounted, setMounted] = useState(false);
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setMounted(true);
  }, []);
  
  const mocksQuery = useMemo(() => (db ? query(collection(db, "mocks"), where("published", "==", true), limit(6)) : null), [db])
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

  if (!mounted) return null;

  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="container mx-auto px-4 max-w-7xl">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-6 text-left">
           <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Zap className="h-6 w-6 text-primary fill-current" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">PUNJAB REGISTRY</span>
              </div>
              <h2 className="text-3xl md:text-5xl font-headline font-black text-[#04102B] tracking-tight leading-none">Latest Mock Tests</h2>
              <p className="text-[#64748B] font-medium text-lg">High-fidelity preparation nodes recently deployed.</p>
           </div>
           <Link href="/mocks" className="bg-slate-50 px-6 py-3 rounded-xl text-primary font-black uppercase text-[10px] md:text-xs tracking-widest hover:bg-primary hover:text-white transition-all flex items-center gap-2 shadow-sm">
              Explore All <ArrowRight className="h-4 w-4" />
           </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
          {loading ? (
             Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-[420px] w-full rounded-[32px] bg-slate-50" />)
          ) : mocks.map((mock, i) => {
            const board = boards?.find((b: any) => b.id === (mock.boardIds?.[0] || mock.boardId));
            const difficulty = mock.difficulty || "Medium";
            const tier = (mock.accessLevel || 'FREE').toUpperCase();
            const isPremium = tier === 'PREMIUM';
            const locked = isPremium && !isPassActive;
            
            return (
              <motion.div key={mock.id} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} viewport={{ once: true }}>
                <Card className="border border-[#E5E7EB] shadow-sm hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] hover:translate-y-[-6px] transition-all duration-500 rounded-[32px] bg-white p-8 md:p-10 text-center flex flex-col h-[420px] group relative overflow-hidden">
                  
                  <div className="absolute top-6 right-6 flex flex-col gap-2 items-end">
                    {(i === 0 || i === 1) && (
                      <Badge className="bg-orange-50 text-[#D97706] border-none text-[8px] font-black uppercase tracking-widest px-3 py-1 shadow-sm">🔥 Popular</Badge>
                    )}
                    {mock.isTrending && (
                      <Badge className="bg-blue-50 text-[#2F6BFF] border-none text-[8px] font-black uppercase tracking-widest px-3 py-1 shadow-sm">⭐ Featured</Badge>
                    )}
                  </div>

                  <div className="h-[70px] w-[70px] mx-auto rounded-full bg-[#F8FAFC] flex items-center justify-center p-1 shrink-0 shadow-inner group-hover:scale-110 transition-transform duration-500 mb-8 overflow-hidden border border-slate-100 relative">
                     {board?.iconUrl && !failedImages[board.id] ? (
                       <Image 
                         src={board.iconUrl} 
                         alt="Logo" 
                         fill
                         className="object-contain p-3.5"
                         referrerPolicy="no-referrer"
                         onError={() => setFailedImages(prev => ({...prev, [board.id]: true}))}
                       />
                     ) : (
                       <Zap className="h-8 w-8 text-primary fill-current opacity-40" />
                     )}
                  </div>

                  <CardHeader className="p-0 flex-1 space-y-6">
                     <CardTitle className="font-extrabold text-[28px] text-[#04102B] leading-[1.1] tracking-tight line-clamp-2 min-h-[62px]">
                        {mock.title}
                     </CardTitle>

                     <div className="flex items-center justify-center gap-4 text-[14px] font-bold text-[#64748B] tracking-tight">
                        <span className="flex items-center gap-1.5"><BookOpen className="h-4 w-4 text-primary opacity-50" /> {mock.totalQuestions} Qs</span>
                        <div className="h-4 w-px bg-slate-100" />
                        <span className="flex items-center gap-1.5"><Clock className="h-4 w-4 text-primary opacity-50" /> {mock.duration} Min</span>
                     </div>

                     <div className="flex items-center justify-center gap-3">
                        <DifficultyBadge level={difficulty} isPremium={isPremium} />
                        <Badge variant="outline" className="border-slate-100 text-[#94A3B8] text-[9px] font-black px-3 py-1 rounded-lg uppercase tracking-widest">{board?.abbreviation || 'PSSSB'}</Badge>
                     </div>
                  </CardHeader>

                  <CardContent className="p-0 mt-10">
                     {locked ? (
                       <Button asChild className="w-full h-[56px] bg-amber-500 hover:bg-amber-600 text-white font-black text-xs uppercase tracking-widest rounded-[18px] transition-all shadow-xl shadow-amber-500/10 active:scale-95 border-none gap-2">
                          <Link href="/pass"><Lock className="h-4 w-4" /> Unlock Premium Pass</Link>
                       </Button>
                     ) : (
                       <Button asChild className="w-full h-[56px] bg-[#04102B] hover:bg-[#2F6BFF] text-white font-black text-xs uppercase tracking-widest rounded-[18px] transition-all shadow-xl shadow-slate-900/10 active:scale-95 border-none group/btn">
                          <Link href={`/mocks/${mock.id}`} className="flex items-center justify-center gap-2">
                             Attempt Now <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                          </Link>
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

function DifficultyBadge({ level, isPremium }: { level: string, isPremium: boolean }) {
  if (isPremium) return <Badge className="bg-[#EEF2FF] text-[#2F6BFF] border-none text-[9px] font-black px-3 py-1 rounded-lg uppercase tracking-widest">PREMIUM</Badge>;
  if (level === 'Easy') return <Badge className="bg-[#DCFCE7] text-[#16A34A] border-none text-[9px] font-black px-3 py-1 rounded-lg uppercase tracking-widest">EASY</Badge>;
  if (level === 'Hard') return <Badge className="bg-[#FEE2E2] text-[#DC2626] border-none text-[9px] font-black px-3 py-1 rounded-lg uppercase tracking-widest">HARD</Badge>;
  return <Badge className="bg-[#FEF3C7] text-[#D97706] border-none text-[9px] font-black px-3 py-1 rounded-lg uppercase tracking-widest">MEDIUM</Badge>;
}
