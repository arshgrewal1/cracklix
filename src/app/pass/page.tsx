"use client"

import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, Zap, ArrowRight, ShieldCheck, Gem, Loader2, Sparkles, Star, Lock, Gift, QrCode } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import { useUser, useFirestore, useCollection, useDoc } from "@/firebase"
import { doc, updateDoc, serverTimestamp, collection } from "firebase/firestore"
import { useMemo, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"

/**
 * @fileOverview Elite PASS Hub v14.0.
 * DESIGN: Locked responsive typography and reduced section heights for mobile.
 */

export default function PassPage() {
  const { user, profile, loading: userLoading } = useUser()
  const db = useFirestore()
  const router = useRouter()
  const { toast } = useToast()
  const [claiming, setClaiming] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true);
    if (!userLoading && !user) {
      router.push(`/login?returnUrl=${encodeURIComponent('/pass')}`);
    }
  }, [user, userLoading, router]);

  const { data: settings } = useDoc<any>(useMemo(() => (db ? doc(db, 'settings', 'global') : null), [db]));
  const passQuery = useMemo(() => (db ? collection(db, "passes") : null), [db])
  const { data: rawPasses, loading: passesLoading } = useCollection<any>(passQuery)

  const passes = useMemo(() => {
     if (!rawPasses) return []
     return [...rawPasses].filter(p => p.active !== false).sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))
  }, [rawPasses])

  const activePassLabel = useMemo(() => {
     if (!profile?.pass?.active) return null;
     const expiry = new Date(profile.pass.expiryDate);
     if (expiry < new Date()) return "PASS EXPIRED";
     return `ACTIVE: EXPIRES ${expiry.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).toUpperCase()}`;
  }, [profile]);

  if (userLoading || !user) return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-[#04102B]"><Zap className="h-10 w-10 text-[#2F6BFF] animate-pulse" /></div>
  );

  return (
    <div className="min-h-screen bg-[#04102B] font-body pb-safe overflow-x-hidden text-white" style={{ background: 'linear-gradient(180deg, #04102B 0%, #061A45 100%)' }}>
      <Navbar />
      
      <main className="container mx-auto px-4 py-12 md:py-24 max-w-7xl relative z-10 text-center">
        <div className="space-y-4 md:space-y-8 mb-12 md:mb-24">
           <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              {mounted && activePassLabel && (
                <Badge className={cn("px-6 py-2 rounded-full font-black uppercase mb-8 shadow-2xl transition-all", activePassLabel === 'PASS EXPIRED' ? "bg-[rgba(255,0,80,0.12)] border border-[rgba(255,0,80,0.25)] text-[#ff5d7d] text-[10px] tracking-[2px]" : "bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-[10px] tracking-[2px]")}>{activePassLabel}</Badge>
              )}
              <h1 className="text-3xl sm:text-5xl md:text-8xl font-black tracking-tight uppercase leading-[0.95] text-white">Elite <span className="text-[#2F6BFF]">Master Pass</span></h1>
              <p className="text-sm md:text-2xl font-medium text-[#94A3B8] max-w-3xl mx-auto mt-6 md:mt-8 leading-relaxed">Unlock all premium mock tests, verified answer keys, and performance reports to secure your selection.</p>
           </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-12">
           {passesLoading ? Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-[400px] w-full bg-white/5 rounded-[32px]" />) : passes.filter(p => p.price > 0).map((plan, idx) => (
             <motion.div key={plan.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}>
                <Card className={cn("h-full border border-white/5 bg-[#081632] rounded-[32px] md:rounded-[40px] overflow-hidden flex flex-col transition-all duration-500 hover:translate-y-[-8px]", plan.id.includes('quarterly') ? "shadow-[0_0_40px_rgba(47,107,255,.15)]" : "shadow-xl")}>
                   {plan.id.includes('quarterly') && <div className="bg-[#2F6BFF] h-[48px] flex items-center justify-center text-white text-[10px] font-black uppercase tracking-[4px]">MANAGEMENT PICK</div>}
                   <CardHeader className="p-8 md:p-14 pb-6 text-center space-y-6">
                      <div className="h-14 w-14 md:h-18 md:w-18 rounded-[40%] bg-[#2F6BFF]/15 text-[#2F6BFF] flex items-center justify-center mx-auto shadow-2xl"><Gem className="h-7 w-7 md:h-9 md:w-9 fill-current" /></div>
                      <CardTitle className="font-black text-xl md:text-3xl uppercase tracking-tight text-white">{plan.name}</CardTitle>
                      <div className="flex items-baseline justify-center gap-2"><span className="text-[24px] font-black text-[#2F6BFF]">₹</span><span className="text-[48px] md:text-[64px] font-black text-white tracking-tighter tabular-nums">{plan.price}</span></div>
                      <p className="text-[9px] font-black uppercase text-[#94A3B8] tracking-[2px]">VALIDITY: {plan.durationDays} DAYS</p>
                   </CardHeader>
                   <CardContent className="px-8 md:px-14 pb-10 flex-1">
                      <ul className="space-y-4 md:space-y-5">
                         {plan.features?.map((feat: string, i: number) => (
                            <li key={i} className="flex items-start gap-3 text-left"><CheckCircle2 className="h-4 w-4 md:h-5 md:w-5 shrink-0 mt-0.5 text-[#22C55E]" /><span className="text-sm md:text-[16px] font-medium leading-snug text-[#CBD5E1]">{feat}</span></li>
                         ))}
                      </ul>
                   </CardContent>
                   <CardFooter className="p-8 md:p-14 pt-0"><Button asChild className="w-full h-[56px] md:h-[62px] rounded-xl md:rounded-[18px] bg-[#2F6BFF] hover:bg-[#1F5BFF] text-white font-black uppercase text-[11px] tracking-[2px] shadow-3xl transition-all active:scale-95 border-none"><Link href={`/checkout?plan=${plan.id}`}>BUY PASS NOW <ArrowRight className="ml-2 h-4 w-4" /></Link></Button></CardFooter>
                </Card>
             </motion.div>
           ))}
        </div>
      </main>
      <Footer />
    </div>
  )
}