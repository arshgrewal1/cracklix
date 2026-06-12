
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
 * @fileOverview Elite PASS Registry Hub v12.1 (Hardened).
 * GATED: Access restricted to authenticated students only.
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
     return `ACTIVE: Expires ${expiry.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`;
  }, [profile]);

  const handleClaimFreePass = async () => {
    if (!user || !db || !settings) return
    if (profile?.pass?.freePassClaimed) {
      toast({ variant: "destructive", title: "Wait", description: "Free pass has already been claimed." })
      return
    }

    if (settings.freeTrialEnabled === false) {
       toast({ variant: "destructive", title: "Offer Inactive", description: "Free trial is currently disabled by Admin." })
       return
    }

    setClaiming(true)
    try {
      const trialDays = settings.freeTrialDays || 7;
      const expiry = new Date()
      expiry.setDate(expiry.getDate() + trialDays)
      
      await updateDoc(doc(db, "users", user.uid), {
        pass: {
          active: true,
          plan: 'FREE_PASS',
          purchaseDate: new Date().toISOString(),
          expiryDate: expiry.toISOString(),
          freePassClaimed: true
        },
        status: 'free-pass',
        updatedAt: serverTimestamp()
      })

      toast({ title: "Free Pass Activated", description: `Your ${trialDays}-day preparation node is now live.` })
    } catch (e: any) {
      toast({ variant: "destructive", title: "Claim Failed" })
    } finally {
      setClaiming(false)
    }
  }

  const showFreeTrial = useMemo(() => {
     if (!mounted) return false;
     return settings?.freeTrialEnabled !== false && !profile?.pass?.freePassClaimed;
  }, [settings, profile, mounted]);

  if (userLoading || !user) return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-[#020817]">
       <Zap className="h-10 w-10 text-primary animate-pulse" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#020817] font-body pb-safe overflow-x-hidden text-white">
      <Navbar />
      
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />

      <main className="container mx-auto px-4 py-12 md:py-24 max-w-7xl relative z-10 text-left">
        <div className="text-center space-y-6 mb-12 md:mb-24">
           <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Badge className={cn(
                 "px-6 py-2 rounded-full font-black uppercase text-[10px] tracking-[0.2em] mb-8 shadow-2xl transition-all",
                 activePassLabel === 'PASS EXPIRED' ? "bg-rose-500/20 text-rose-400 border-rose-500/30" :
                 (mounted && activePassLabel) ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" : "bg-primary/20 text-primary border-primary/30"
              )}>
                 {mounted ? (activePassLabel || "Institutional Preparation List") : "Syncing..."}
              </Badge>
              <h1 className="text-4xl md:text-8xl font-headline font-black tracking-tight uppercase leading-[0.9]">
                 ELITE <span className="text-primary">MASTER PASS</span>
              </h1>
              <p className="text-sm md:text-xl text-slate-400 font-medium max-w-2xl mx-auto mt-8 leading-relaxed">
                 Unlock all premium mock tests, verified answer keys, and performance reports to secure your selection.
              </p>
           </motion.div>
        </div>

        {mounted && showFreeTrial && (
           <div className="max-w-xl mx-auto mb-16 md:mb-24 animate-in zoom-in-95 duration-500">
              <Card className="bg-emerald-500/10 border-2 border-emerald-500/20 rounded-[2.5rem] md:rounded-[3rem] p-8 md:p-10 text-center space-y-8 shadow-3xl shadow-emerald-500/5 group hover:border-emerald-500/40 transition-all">
                 <div className="h-16 w-16 bg-emerald-500 text-white rounded-2xl flex items-center justify-center mx-auto shadow-2xl">
                    <Gift className="h-8 w-8" />
                 </div>
                 <div className="space-y-2">
                    <h3 className="text-2xl md:text-3xl font-headline font-black uppercase text-emerald-400">Claim Trial Pass</h3>
                    <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest leading-none">FREE {settings?.freeTrialDays || 7}-DAY UNRESTRICTED ACCESS</p>
                 </div>
                 <Button 
                   onClick={handleClaimFreePass}
                   disabled={claiming || userLoading}
                   className="w-full h-16 bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase text-[11px] tracking-[0.2em] rounded-2xl shadow-xl transition-all active:scale-95 border-none"
                 >
                    {claiming ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-5 w-5 mr-3" />}
                    Claim FREE TRIAL
                 </Button>
              </Card>
           </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10">
           {passesLoading ? (
              Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-[500px] w-full bg-white/5 rounded-[3.5rem]" />)
           ) : passes.filter(p => p.price > 0).map((plan, idx) => (
             <motion.div key={plan.id} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}>
                <Card className={cn(
                  "h-full border-none shadow-5xl rounded-[2.5rem] md:rounded-[3.5rem] overflow-hidden flex flex-col transition-all duration-500 hover:shadow-primary/10 hover:translate-y-[-8px]",
                  plan.id.includes('quarterly') ? "bg-[#0B1528] ring-2 ring-primary/40" : "bg-white/5 border border-white/10"
                )}>
                   {plan.id.includes('quarterly') && (
                     <div className="bg-primary text-white py-3 text-center text-[10px] font-black uppercase tracking-[0.4em]">Management Pick</div>
                   )}
                   <CardHeader className="p-8 md:p-12 pb-8 text-center space-y-6 md:space-y-8">
                      <div className={cn("h-16 w-16 md:h-20 md:w-20 rounded-[2.5rem] flex items-center justify-center mx-auto shadow-2xl", plan.id.includes('quarterly') ? "bg-primary text-white" : "bg-white/10 text-primary")}>
                         <Gem className="h-8 w-8 md:h-10 md:w-10 fill-current" />
                      </div>
                      <div className="space-y-2">
                        <CardTitle className="font-headline font-black text-2xl md:text-3xl uppercase tracking-tight text-white leading-tight">
                           {plan.name}
                        </CardTitle>
                      </div>
                      <div className="flex items-baseline justify-center gap-2">
                         <span className="text-5xl md:text-6xl font-headline font-black text-white tracking-tighter tabular-nums">₹{plan.price}</span>
                         <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">/ {plan.durationDays} Days</span>
                      </div>
                   </CardHeader>

                   <CardContent className="px-8 md:px-12 pb-10 flex-1">
                      <div className="h-px w-full bg-white/5 mb-8 md:mb-10" />
                      <ul className="space-y-4 md:space-y-5">
                         {plan.features?.map((feat: string, i: number) => (
                            <li key={i} className="flex items-start gap-4 text-left group/feat">
                               <CheckCircle2 className="h-4 w-4 md:h-5 md:w-5 shrink-0 mt-0.5 text-primary" />
                               <span className="text-xs md:text-sm font-bold uppercase leading-tight text-slate-300 group-hover/feat:text-white transition-colors">{feat}</span>
                             </li>
                         ))}
                      </ul>
                   </CardContent>

                   <CardFooter className="p-8 md:p-12 pt-0">
                      <Button asChild className="w-full h-16 rounded-[1.5rem] md:rounded-[2rem] bg-primary hover:bg-orange-600 text-white font-black uppercase text-[11px] tracking-[0.2em] shadow-3xl transition-all active:scale-95 border-none">
                         <Link href={`/checkout?plan=${plan.id}`}>
                            BUY PASS <ArrowRight className="ml-3 h-5 w-5" />
                         </Link>
                      </Button>
                   </CardFooter>
                </Card>
             </motion.div>
           ))}
        </div>

        <div className="mt-20 md:mt-32 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
           <div className="space-y-6 md:space-y-8">
              <div className="flex items-center gap-4">
                 <QrCode className="h-8 w-8 md:h-10 md:w-10 text-primary" />
                 <h2 className="text-2xl md:text-5xl font-headline font-black uppercase text-white leading-tight">Manual Hub <br className="hidden md:block" /> Verification</h2>
              </div>
              <p className="text-slate-400 text-base md:text-lg font-medium leading-relaxed max-w-xl">
                 Secure your pass via direct institutional transaction nodes. Simply pay using the QR/UPI ID on the checkout page and upload your 12-digit UTR ID for rapid history audit.
              </p>
           </div>
           <div className="grid grid-cols-2 gap-4">
              <BenefitNode label="Pattern Based Mocks" icon={<ShieldCheck className="text-emerald-500" />} />
              <BenefitNode label="Official PYQ Hub" icon={<Zap className="text-amber-500" />} />
              <BenefitNode label="State Merit Index" icon={<Star className="text-primary" />} />
              <BenefitNode label="AI Explanation" icon={<Sparkles className="text-blue-500" />} />
           </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

function BenefitNode({ label, icon }: any) {
   return (
      <div className="p-6 md:p-8 bg-white/5 border border-white/10 rounded-[2rem] md:rounded-[2.5rem] space-y-4 shadow-inner hover:bg-white/10 transition-all group">
         <div className="h-10 w-10 md:h-12 md:w-12 rounded-xl bg-white/5 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">{icon}</div>
         <p className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-slate-400 leading-tight">{label}</p>
      </div>
   )
}
