"use client"

import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, Zap, ArrowRight, ShieldCheck, Gem, Clock, AlertCircle } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import { useUser, useFirestore, useCollection } from "@/firebase"
import { collection } from "firebase/firestore"
import { useMemo, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"

/**
 * @fileOverview High-Density Pass Center v20.0.
 */

export default function PassPage() {
  const { user, profile, loading: userLoading } = useUser()
  const db = useFirestore()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [timeLeft, setTimeLeft] = useState<{ d: number, h: number, m: number, s: number } | null>(null)

  useEffect(() => {
    setMounted(true);
    if (!userLoading && !user) {
      router.push(`/login?returnUrl=${encodeURIComponent('/pass')}`);
    }
  }, [user, userLoading, router]);

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

  if (userLoading || !user) return <div className="h-screen w-full flex flex-col items-center justify-center bg-white space-y-4"><Zap className="h-8 w-8 text-primary animate-pulse" /></div>;

  return (
    <div className="min-h-screen bg-slate-50 font-body pb-safe text-left overflow-x-hidden">
      <Navbar />
      
      <main className="container mx-auto px-3 md:px-8 py-6 md:py-16 max-w-7xl space-y-8 md:space-y-20">
        
        {/* COMPACT MANAGEMENT CARD */}
        {mounted && profile?.passStatus && passStatus !== 'none' && (
           <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="max-w-4xl mx-auto border border-slate-100 bg-white rounded-2xl md:rounded-[2rem] p-4 md:p-10 shadow-xl text-left overflow-hidden relative">
                 <div className={cn("absolute top-0 left-0 w-1.5 h-full", passStatus === 'active' ? 'bg-emerald-500' : 'bg-rose-500')} />
                 <div className="flex flex-col md:flex-row justify-between items-center gap-4 relative z-10">
                    <div className="space-y-4 flex-1 w-full">
                       <div className="flex items-center gap-4">
                          <div className={cn("h-10 w-10 md:h-14 rounded-xl flex items-center justify-center shadow-inner shrink-0", passStatus === 'active' ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600")}>
                             <Gem className="h-6 w-6" />
                          </div>
                          <div>
                             <h2 className="text-lg md:text-2xl font-headline font-black text-[#0F172A] uppercase leading-none">
                               {passStatus === 'active' ? 'Active Pass' : 'Pass Expired'}
                             </h2>
                             <Badge className={cn("mt-1.5 border-none text-[8px] font-black uppercase px-2 py-0.5", passStatus === 'active' ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600")}>
                                Tier: {profile.pass?.plan || 'PREMIUM'}
                             </Badge>
                          </div>
                       </div>

                       {passStatus === 'active' && timeLeft ? (
                          <div className="grid grid-cols-4 gap-1.5 md:gap-3 max-w-xs md:max-w-sm">
                             <CountdownPill label="Days" val={timeLeft.d} />
                             <CountdownPill label="Hrs" val={timeLeft.h} />
                             <CountdownPill label="Mins" val={timeLeft.m} />
                             <CountdownPill label="Secs" val={timeLeft.s} />
                          </div>
                       ) : passStatus === 'expired' ? (
                          <div className="p-3 bg-rose-50 rounded-xl border border-rose-100 flex items-center gap-3 text-rose-600">
                             <AlertCircle className="h-4 w-4 shrink-0" />
                             <p className="text-[10px] font-bold uppercase">Pass expired. Renew to continue.</p>
                          </div>
                       ) : null}
                    </div>

                    <Button asChild className="w-full md:w-auto h-12 px-8 bg-primary hover:bg-blue-700 text-white rounded-xl font-black uppercase text-[10px] tracking-widest shadow-xl border-none">
                       <Link href="#plans">Get Pass <ArrowRight className="ml-2 h-3.5 w-3.5" /></Link>
                    </Button>
                 </div>
              </Card>
           </motion.div>
        )}

        <div id="plans" className="text-center space-y-2 md:space-y-8 px-1">
           <h1 className="text-2xl md:text-5xl font-black text-[#0F172A] uppercase leading-tight">Elite Plans</h1>
           <p className="text-[12px] md:text-lg text-slate-500 font-medium max-w-2xl mx-auto leading-relaxed">Verified patterns and official audit rationalizations.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
           {passesLoading ? Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-64 w-full rounded-2xl bg-white" />) : passes.map((plan, idx) => (
             <motion.div key={plan.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}>
                <Card className="h-full border border-slate-100 shadow-xl rounded-[1.5rem] md:rounded-[2rem] bg-white overflow-hidden flex flex-col hover:translate-y-[-4px] transition-all">
                   <CardHeader className="p-4 md:p-10 pb-2 md:pb-4 text-center space-y-3">
                      <div className="h-10 w-10 md:h-16 rounded-xl bg-slate-50 text-primary flex items-center justify-center mx-auto shadow-inner"><Gem className="h-6 w-6 md:h-8" /></div>
                      <CardTitle className="font-black text-sm md:text-2xl uppercase tracking-tight text-[#0F172A]">{plan.name}</CardTitle>
                      <div className="flex items-baseline justify-center gap-1">
                        <span className="text-xl md:text-6xl font-black text-[#0F172A] tabular-nums">₹{plan.price}</span>
                        <span className="text-[8px] md:text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">/ {plan.durationDays}d</span>
                      </div>
                   </CardHeader>
                   <CardContent className="px-4 md:px-10 pb-6 flex-1">
                      <div className="h-px w-full bg-slate-50 mb-4 md:mb-6" />
                      <ul className="space-y-2 md:space-y-3.5">
                         {plan.features?.map((feat: string, i: number) => (
                            <li key={i} className="flex items-start gap-2.5 text-left"><CheckCircle2 className="h-3.5 w-3.5 md:h-4 md:w-4 shrink-0 mt-0.5 text-emerald-500" /><span className="text-[11px] md:text-sm font-bold text-slate-600 leading-snug">{feat}</span></li>
                         ))}
                      </ul>
                   </CardContent>
                   <CardFooter className="p-4 md:p-10 pt-0">
                      <Button asChild className="w-full h-12 md:h-16 rounded-xl md:rounded-2xl bg-[#0F172A] hover:bg-black text-white font-black uppercase text-[10px] tracking-widest shadow-lg border-none active:scale-95">
                         <Link href={`/checkout?plan=${plan.id}`}>ACTIVATE <ArrowRight className="ml-2 h-3.5 w-3.5" /></Link>
                      </Button>
                   </CardFooter>
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
      <div className="p-2 bg-slate-50 rounded-lg border border-slate-100 text-center flex-1">
         <p className="text-sm md:text-xl font-black text-[#0F172A] tabular-nums leading-none">{val}</p>
         <p className="text-[6px] md:text-[7px] font-black text-slate-400 uppercase mt-1">{label}</p>
      </div>
   )
}