"use client"

import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, Zap, ArrowRight, ShieldCheck, Gem, Loader2, Sparkles, Star, Lock, Gift, QrCode, Clock, Calendar } from "lucide-react"
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
 * @fileOverview Elite PASS Hub v15.0 (Management Overhaul).
 * DESIGN: Integrated management card with live countdown for active subscribers.
 */

export default function PassPage() {
  const { user, profile, loading: userLoading } = useUser()
  const db = useFirestore()
  const router = useRouter()
  const { toast } = useToast()
  const [mounted, setMounted] = useState(false)
  const [timeLeft, setTimeLeft] = useState<{ d: number, h: number, m: number, s: number } | null>(null)

  useEffect(() => {
    setMounted(true);
    if (!userLoading && !user) {
      router.push(`/login?returnUrl=${encodeURIComponent('/pass')}`);
    }
  }, [user, userLoading, router]);

  // Expiry Countdown Logic
  useEffect(() => {
    if (!profile?.passExpiresAt) return;
    const interval = setInterval(() => {
       const expiry = new Date(profile.passExpiresAt).getTime();
       const now = new Date().getTime();
       const diff = expiry - now;

       if (diff <= 0) {
          setTimeLeft(null);
          clearInterval(interval);
          return;
       }

       setTimeLeft({
          d: Math.floor(diff / (1000 * 60 * 60 * 24)),
          h: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          m: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
          s: Math.floor((diff % (1000 * 60)) / 1000)
       });
    }, 1000);

    return () => clearInterval(interval);
  }, [profile]);

  const passQuery = useMemo(() => (db ? collection(db, "passes") : null), [db])
  const { data: rawPasses, loading: passesLoading } = useCollection<any>(passQuery)

  const passes = useMemo(() => {
     if (!rawPasses) return []
     return [...rawPasses].filter(p => p.active !== false).sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))
  }, [rawPasses])

  const passStatus = useMemo(() => {
     if (!profile?.passExpiresAt) return 'none';
     return new Date(profile.passExpiresAt) > new Date() ? 'active' : 'expired';
  }, [profile]);

  if (userLoading || !user) return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-[#04102B]"><Zap className="h-10 w-10 text-[#2F6BFF] animate-pulse" /></div>
  );

  return (
    <div className="min-h-screen bg-[#04102B] font-body pb-safe overflow-x-hidden text-white" style={{ background: 'linear-gradient(180deg, #04102B 0%, #061A45 100%)' }}>
      <Navbar />
      
      <main className="container mx-auto px-4 py-12 md:py-24 max-w-7xl relative z-10 text-center space-y-12 md:space-y-24">
        
        {/* MANAGEMENT CARD - TESTBOOK STYLE */}
        {mounted && profile?.passStatus && passStatus !== 'none' && (
           <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
              <Card className="max-w-4xl mx-auto border-none bg-white rounded-[3rem] p-8 md:p-12 shadow-5xl text-left overflow-hidden relative">
                 <div className={cn("absolute top-0 left-0 w-2 h-full", passStatus === 'active' ? 'bg-emerald-500' : 'bg-rose-500')} />
                 <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 relative z-10">
                    <div className="space-y-6">
                       <div className="flex items-center gap-4">
                          <div className={cn("h-14 w-14 rounded-2xl flex items-center justify-center shadow-inner", passStatus === 'active' ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600")}>
                             <ShieldCheck className="h-8 w-8" />
                          </div>
                          <div>
                             <h2 className="text-2xl md:text-3xl font-headline font-black text-[#0F172A] uppercase tracking-tight">Elite Pass</h2>
                             <div className="flex items-center gap-3">
                                <Badge className={cn("border-none text-[8px] font-black px-3 py-1 rounded-lg uppercase", passStatus === 'active' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600')}>
                                   Status: {passStatus.toUpperCase()}
                                </Badge>
                                {passStatus === 'active' && <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Valid Till: {new Date(profile.passExpiresAt!).toLocaleDateString('en-GB')}</p>}
                             </div>
                          </div>
                       </div>

                       {passStatus === 'active' ? (
                          <div className="grid grid-cols-2 xs:grid-cols-4 gap-4">
                             <CountdownPill label="Days" val={timeLeft?.d || 0} />
                             <CountdownPill label="Hours" val={timeLeft?.h || 0} />
                             <CountdownPill label="Mins" val={timeLeft?.m || 0} />
                             <CountdownPill label="Secs" val={timeLeft?.s || 0} />
                          </div>
                       ) : (
                          <div className="p-6 bg-rose-50 rounded-2xl border border-rose-100 flex items-center gap-4 text-rose-600">
                             <AlertCircle className="h-6 w-6 shrink-0" />
                             <p className="text-sm font-bold uppercase tracking-tight">Your pass expired on {new Date(profile.passExpiresAt!).toLocaleDateString()}. Renew now to resume preparation.</p>
                          </div>
                       )}
                    </div>

                    <div className="shrink-0 w-full md:w-auto">
                       <Button asChild className={cn("w-full h-16 px-10 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl border-none transition-all", passStatus === 'active' ? "bg-slate-100 text-slate-400 cursor-default hover:bg-slate-100" : "bg-primary hover:bg-blue-700 text-white")}>
                          {passStatus === 'active' ? <span>Premium Enabled</span> : <Link href="#plans">Renew Elite Pass <ArrowRight className="ml-2 h-4 w-4" /></Link>}
                       </Button>
                    </div>
                 </div>
              </Card>
           </motion.div>
        )}

        <div id="plans" className="space-y-4 md:space-y-8">
           <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
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

function CountdownPill({ label, val }: { label: string, val: number }) {
   return (
      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center min-w-[70px] shadow-sm">
         <p className="text-xl md:text-2xl font-black text-[#0F172A] tabular-nums leading-none">{val}</p>
         <p className="text-[7px] md:text-[8px] font-black text-slate-400 uppercase tracking-widest mt-1.5">{label}</p>
      </div>
   )
}
