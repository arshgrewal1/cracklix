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
import { getAuthorityIcon } from "@/lib/exam-icons"

/**
 * @fileOverview Elite Latest Mock Hub v51.0 (Hardened Expiry).
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
    
    if (profile.passExpiresAt) {
       const expiry = new Date(profile.passExpiresAt);
       return expiry > new Date() && profile.pass?.active !== false;
    }
    return false;
  }, [user, profile]);

  if (!mounted) return null;

  return (
    <section className="py-10 md:py-16 bg-white">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 md:mb-12 gap-4 text-left">
           <div className="space-y-2">
              <div className="flex items-center gap-3">
                <Zap className="h-5 w-5 text-blue-600 fill-current" />
                <span className="text-[10px] font-bold text-slate-400 tracking-tight">Punjab Registry</span>
              </div>
              <h2 className="text-2xl md:text-4xl font-extrabold text-[#04102B] tracking-tight leading-none">Latest Mock Tests</h2>
              <p className="text-[#64748B] font-medium text-sm md:text-base">High-fidelity preparation nodes recently deployed.</p>
           </div>
           <Link href="/mocks" className="bg-slate-50 px-5 py-2 rounded-xl text-blue-600 font-bold text-xs tracking-tight hover:bg-blue-600 hover:text-white transition-all flex items-center gap-2 shadow-sm">
              Explore All <ArrowRight className="h-3 w-3" />
           </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {loading ? (
             Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-[380px] w-full rounded-[24px] bg-slate-50" />)
          ) : mocks.map((mock, i) => {
            const board = boards?.find((b: any) => b.id === (mock.boardIds?.[0] || mock.boardId));
            const difficulty = mock.difficulty || "Medium";
            const tier = (mock.accessLevel || 'FREE').toUpperCase();
            const isPremium = tier === 'PREMIUM';
            const locked = isPremium && !isPassActive;
            const logoUrl = mock.iconUrl || board?.iconUrl;
            
            return (
              <motion.div key={mock.id} initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} viewport={{ once: true }}>
                <Card className="border border-[#E5E7EB] shadow-sm hover:shadow-xl transition-all duration-500 rounded-[24px] bg-white p-6 md:p-8 text-center flex flex-col h-[380px] group relative overflow-hidden">
                  <div className="absolute top-4 right-4 flex flex-col gap-1 items-end">
                    {(i === 0 || i === 1) && (
                      <Badge className="bg-orange-50 text-[#D97706] border-none text-[7px] font-bold px-2 py-0.5 shadow-sm">🔥 Popular</Badge>
                    )}
                  </div>
                  <div className="h-[60px] w-[60px] mx-auto rounded-full bg-[#F8FAFC] flex items-center justify-center p-1 shrink-0 shadow-inner group-hover:scale-105 transition-transform duration-500 mb-6 overflow-hidden border border-slate-100 relative">
                     {logoUrl && !failedImages[mock.id] ? (
                       <Image src={logoUrl} alt="Logo" fill sizes="64px" className="object-contain p-3" referrerPolicy="no-referrer" onError={() => setFailedImages(prev => ({...prev, [mock.id]: true}))} />
                     ) : (
                       <div className="p-3 w-full h-full opacity-40">
                         {getAuthorityIcon(board?.id, board?.abbreviation)}
                       </div>
                     )}
                  </div>
                  <CardHeader className="p-0 flex-1 space-y-4">
                     <CardTitle className="font-extrabold text-xl md:text-2xl text-[#04102B] leading-tight tracking-tight line-clamp-2 min-h-[50px]">{mock.title}</CardTitle>
                     <div className="flex items-center justify-center gap-3 text-[12px] font-bold text-[#64748B] tracking-tight">
                        <span className="flex items-center gap-1.5"><BookOpen className="h-3.5 w-3.5 text-blue-600 opacity-50" /> {mock.totalQuestions} Qs</span>
                        <div className="h-3 w-px bg-slate-100" />
                        <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5 text-blue-600 opacity-50" /> {mock.duration} Min</span>
                     </div>
                     <div className="flex items-center justify-center gap-2">
                        <DifficultyBadge level={difficulty} isPremium={isPremium} />
                        <Badge variant="outline" className="border-slate-100 text-[#94A3B8] text-[8px] font-bold px-2 py-0.5 rounded tracking-tight">{board?.abbreviation || 'PSSSB'}</Badge>
                     </div>
                  </CardHeader>
                  <CardContent className="p-0 mt-6">
                     {locked ? (
                       <Button asChild className="w-full h-12 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl transition-all shadow-md border-none gap-2">
                          <Link href="/pass">
                             <Lock className="h-3.5 w-3.5" /> {profile?.passStatus === 'expired' ? 'Renew Elite Pass' : 'Unlock Hub'}
                          </Link>
                       </Button>
                     ) : (
                       <Button asChild className="w-full h-12 bg-[#04102B] hover:bg-[#2F6BFF] text-white font-bold text-xs rounded-xl transition-all shadow-md border-none group/btn"><Link href={`/mocks/${mock.id}`} className="flex items-center justify-center gap-2">Attempt Now <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover/btn:translate-x-1" /></Link></Button>
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
  if (isPremium) return <Badge className="bg-[#EEF2FF] text-[#2F6BFF] border-none text-[8px] font-bold px-2 py-0.5 rounded tracking-tight">Premium</Badge>;
  if (level === 'Easy') return <Badge className="bg-[#DCFCE7] text-[#16A34A] border-none text-[8px] font-bold px-2 py-0.5 rounded tracking-tight">Easy</Badge>;
  if (level === 'Hard') return <Badge className="bg-[#FEE2E2] text-[#DC2626] border-none text-[8px] font-bold px-2 py-0.5 rounded tracking-tight">Hard</Badge>;
  return <Badge className="bg-[#FEF3C7] text-[#D97706] border-none text-[8px] font-bold px-2 py-0.5 rounded tracking-tight">Medium</Badge>;
}
