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
 * @fileOverview Institutional Pass Center v15.3 (AI Cleaned).
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
    const expiresAt = profile?.passExpiresAt;
    if (!expiresAt) return;
    
    const interval = setInterval(() => {
       const expiry = new Date(expiresAt).getTime();
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
    <div className="h-screen w-full flex flex-col items-center justify-center bg-[#04102B]"><Zap className="h-10 w-10 text-primary animate-pulse" /></div>
  );

  return (
    <div className="min-h-screen bg-slate-50 font-body pb-safe text-left overflow-x-hidden">
      <Navbar />
      
      <main className="container mx-auto px-4 py-12 md:py-24 max-w-7xl space-y-12 md:space-y-24">
        
        {/* MANAGEMENT CARD */}
        {mounted && profile?.passStatus && passStatus !== 'none' && (
           <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="max-w-4xl mx-auto border-none bg-white rounded-[3rem] p-8 md:p-12 shadow-5xl text-left overflow-hidden relative">
                 <div className={cn("absolute top-0 left-0 w-2 h-full", passStatus === 'active' ? 'bg-emerald-500' : 'bg-rose-500')} />
                 <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 relative z-10">
                    <div className="space-y-6">
                       <div className="flex items-center gap-4">
                          <div className={cn("h-14 w-14 rounded-2xl flex items-center justify-center shadow-inner", passStatus === 'active' ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600")}>
                             <ShieldCheck className="h-8 w-8" />
                          </div>
                          <div>
                             <h2 className="text-2xl md:text-3xl font-headline font-black text-[#0F172A] uppercase tracking-tight">Active Pass Hub</h2>
                             <div className="flex items-center gap-3">
                                <Badge className={cn("border-none text-[8px] font-black px-3 py-1 rounded-lg uppercase", passStatus === 'active' ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600")}>
                                   Status: {passStatus.toUpperCase()}
                                </Badge>
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
                             <p className="text-sm font-bold uppercase tracking-tight">Your elite access has expired. Renew to continue.</p>
                          </div>
                       )}
                    </div>

                    <div className="shrink-0 w-full md:w-auto">
                       <Button asChild className="w-full h-16 px-10 bg-primary hover:bg-blue-700 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl border-none transition-all active:scale-95">
                          <Link href="#plans">Renew Pass <ArrowRight className="ml-2 h-4 w-4" /></Link>
                       </Button>
                    </div>
                 </div>
              </Card>
           </motion.div>
        )}

        <div id="plans" className="text-center space-y-6 md:space-y-10">
           <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight leading-[0.9] text-[#0F172A] break-words antialiased">
                 Master <span className="text-primary">Pass Plans</span>
              </h1>
              <p className="text-sm md:text-2xl font-medium text-slate-500 max-w-3xl mx-auto mt-6 md:mt-8 leading-tight tracking-tight">
                 Unlock all premium mock tests, solved papers, and institutional analytics to secure your success.
              </p>
           </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
           {passesLoading ? Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-[400px] w-full rounded-[32px] bg-white" />) : passes.filter(p => p.price > 0).map((plan, idx) => (
             <motion.div key={plan.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}>
                <Card className="h-full border-none shadow-3xl bg-white rounded-[3rem] overflow-hidden flex flex-col transition-all duration-500 hover:translate-y-[-8px]">
                   <CardHeader className="p-10 md:p-14 pb-6 text-center space-y-6">
                      <div className="h-16 w-16 md:h-20 md:w-20 rounded-2xl bg-slate-50 text-primary flex items-center justify-center mx-auto shadow-inner"><Gem className="h-8 w-8 md:h-10 md:w-10 fill-current" /></div>
                      <CardTitle className="font-black text-xl md:text-3xl uppercase tracking-tight text-[#0F172A]">{plan.name}</CardTitle>
                      <div className="flex items-baseline justify-center gap-2"><span className="text-2xl font-black text-primary">₹</span><span className="text-5xl md:text-7xl font-black text-[#0F172A] tracking-tighter tabular-nums">{plan.price}</span></div>
                      <p className="text-[10px] font-black uppercase text-slate-400 tracking-[2px]">VALIDITY: {plan.durationDays} DAYS</p>
                   </CardHeader>
                   <CardContent className="px-10 md:px-14 pb-10 flex-1">
                      <ul className="space-y-4 md:space-y-5 border-t border-slate-50 pt-8">
                         {plan.features?.map((feat: string, i: number) => (
                            <li key={i} className="flex items-start gap-4 text-left"><CheckCircle2 className="h-5 w-5 shrink-0 mt-0.5 text-emerald-500" /><span className="text-sm md:text-base font-bold text-slate-600 leading-snug">{feat}</span></li>
                         ))}
                      </ul>
                   </CardContent>
                   <CardFooter className="p-10 md:p-14 pt-0">
                      <Button asChild className="w-full h-16 md:h-20 rounded-2xl md:rounded-[2.5rem] bg-[#0F172A] hover:bg-black text-white font-black uppercase text-[11px] tracking-[2px] shadow-4xl transition-all active:scale-95 border-none">
                         <Link href={`/checkout?plan=${plan.id}`}>UPGRADE NOW <ArrowRight className="ml-2 h-4 w-4" /></Link>
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
      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center min-w-[70px] shadow-inner">
         <p className="text-xl md:text-2xl font-black text-[#0F172A] tabular-nums leading-none">{val}</p>
         <p className="text-[7px] md:text-[8px] font-black text-slate-400 uppercase tracking-widest mt-1.5">{label}</p>
      </div>
   )
}
