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
 * @fileOverview Elite PASS Registry Hub v13.0 (Cracklix Blue).
 * DESIGN SYSTEM: Dark Navy (#04102B) background, Primary Blue (#2F6BFF) highlights.
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
    <div className="h-screen w-full flex flex-col items-center justify-center bg-[#04102B]">
       <Zap className="h-10 w-10 text-[#2F6BFF] animate-pulse" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#04102B] font-body pb-safe overflow-x-hidden text-white" style={{ background: 'linear-gradient(180deg, #04102B 0%, #061A45 100%)' }}>
      <Navbar />
      
      <main className="container mx-auto px-4 py-12 md:py-24 max-w-7xl relative z-10 text-center">
        <div className="space-y-6 mb-16 md:mb-32">
           <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              {mounted && activePassLabel && (
                <Badge className={cn(
                  "px-6 py-2 rounded-full font-black uppercase mb-10 shadow-2xl transition-all",
                  activePassLabel === 'PASS EXPIRED' 
                    ? "bg-[rgba(255,0,80,0.12)] border-[1px] border-[rgba(255,0,80,0.25)] text-[#ff5d7d] text-[12px] tracking-[3px]" 
                    : "bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-[10px] tracking-[2px]"
                )}>
                  {activePassLabel}
                </Badge>
              )}
              
              <h1 className="text-[48px] md:text-[92px] font-black tracking-tight uppercase leading-[0.9] text-white">
                 Elite <span className="text-[#2F6BFF]">Master Pass</span>
              </h1>
              
              <p className="text-[18px] md:text-[28px] font-medium text-[#94A3B8] max-w-[850px] mx-auto mt-8 leading-relaxed">
                 Unlock all premium mock tests, verified answer keys, and performance reports to secure your selection.
              </p>
           </motion.div>
        </div>

        {mounted && showFreeTrial && (
           <div className="max-w-xl mx-auto mb-16 md:mb-32 animate-in zoom-in-95 duration-500">
              <Card className="bg-[#081632] border border-white/5 rounded-[40px] p-8 md:p-12 text-center space-y-8 shadow-3xl hover:border-[#2F6BFF]/30 transition-all">
                 <div className="h-16 w-16 bg-[#2F6BFF]/15 text-[#2F6BFF] rounded-2xl flex items-center justify-center mx-auto shadow-2xl">
                    <Gift className="h-8 w-8" />
                 </div>
                 <div className="space-y-2">
                    <h3 className="text-2xl md:text-3xl font-black uppercase text-[#2F6BFF]">Claim Trial Pass</h3>
                    <p className="text-[#94A3B8] font-bold uppercase text-[10px] tracking-[4px] leading-none">FREE {settings?.freeTrialDays || 7}-DAY ACCESS</p>
                 </div>
                 <Button 
                   onClick={handleClaimFreePass}
                   disabled={claiming || userLoading}
                   className="w-full h-[62px] bg-[#2F6BFF] hover:bg-[#1F5BFF] text-white font-black uppercase text-[11px] tracking-[2px] rounded-[18px] shadow-xl transition-all active:scale-95 border-none"
                 >
                    {claiming ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-5 w-5 mr-3" />}
                    CLAIM FREE TRIAL
                 </Button>
              </Card>
           </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
           {passesLoading ? (
              Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-[500px] w-full bg-white/5 rounded-[40px]" />)
           ) : passes.filter(p => p.price > 0).map((plan, idx) => {
             const isFeatured = plan.id.includes('quarterly');
             
             return (
               <motion.div key={plan.id} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}>
                  <Card className={cn(
                    "h-full border border-white/5 bg-[#081632] rounded-[40px] overflow-hidden flex flex-col transition-all duration-500 hover:translate-y-[-10px]",
                    isFeatured ? "shadow-[0_0_50px_rgba(47,107,255,.18)]" : "shadow-xl"
                  )}>
                     {isFeatured && (
                       <div className="bg-[#2F6BFF] h-[56px] flex items-center justify-center text-white text-[13px] font-black uppercase tracking-[6px]">
                          MANAGEMENT PICK
                       </div>
                     )}
                     <CardHeader className="p-10 md:p-14 pb-8 text-center space-y-8">
                        <div className="h-16 w-16 md:h-20 md:w-20 rounded-[40%] bg-[#2F6BFF]/15 text-[#2F6BFF] flex items-center justify-center mx-auto shadow-2xl transition-transform group-hover:scale-110">
                           <Gem className="h-8 w-8 md:h-10 md:w-10 fill-current" />
                        </div>
                        <div className="space-y-2">
                          <CardTitle className="font-black text-2xl md:text-3xl uppercase tracking-tight text-white leading-tight">
                             {plan.name}
                          </CardTitle>
                        </div>
                        <div className="flex items-baseline justify-center gap-2">
                           <span className="text-[32px] font-black text-[#2F6BFF]">₹</span>
                           <span className="text-[54px] md:text-[68px] font-black text-white tracking-tighter tabular-nums">{plan.price}</span>
                        </div>
                        <p className="text-[10px] font-black uppercase text-[#94A3B8] tracking-[3px]">VALDITY: {plan.durationDays} DAYS</p>
                     </CardHeader>

                     <CardContent className="px-10 md:px-14 pb-12 flex-1">
                        <div className="h-px w-full bg-white/5 mb-10" />
                        <ul className="space-y-5 md:space-y-6">
                           {plan.features?.map((feat: string, i: number) => (
                              <li key={i} className="flex items-start gap-4 text-left group/feat">
                                 <CheckCircle2 className="h-5 w-5 md:h-6 md:w-6 shrink-0 mt-0.5 text-[#22C55E]" />
                                 <span className="text-[16px] font-medium leading-snug text-[#CBD5E1] group-hover/feat:text-white transition-colors">{feat}</span>
                               </li>
                           ))}
                        </ul>
                     </CardContent>

                     <CardFooter className="p-10 md:p-14 pt-0">
                        <Button asChild className="w-full h-[62px] rounded-[18px] bg-[#2F6BFF] hover:bg-[#1F5BFF] text-white font-black uppercase text-[11px] tracking-[2px] shadow-3xl transition-all active:scale-95 border-none">
                           <Link href={`/checkout?plan=${plan.id}`}>
                              BUY PASS NOW <ArrowRight className="ml-3 h-5 w-5" />
                           </Link>
                        </Button>
                     </CardFooter>
                  </Card>
               </motion.div>
             )
           })}
        </div>

        <div className="mt-32 md:mt-48 grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
           <div className="space-y-8 text-left">
              <div className="flex items-center gap-4">
                 <QrCode className="h-10 w-10 text-[#2F6BFF]" />
                 <h2 className="text-3xl md:text-5xl font-black uppercase text-white leading-tight">Manual Hub <br /> Verification</h2>
              </div>
              <p className="text-[#94A3B8] text-[18px] font-medium leading-relaxed max-w-xl">
                 Secure your pass via direct institutional transaction nodes. Simply pay using the QR/UPI ID on the checkout page and upload your 12-digit UTR ID for rapid history audit.
              </p>
           </div>
           <div className="grid grid-cols-2 gap-6">
              <BenefitNode label="Pattern Based Mocks" icon={<ShieldCheck className="text-[#2F6BFF]" />} />
              <BenefitNode label="Official PYQ Hub" icon={<Zap className="text-[#2F6BFF]" />} />
              <BenefitNode label="State Merit Index" icon={<Star className="text-[#2F6BFF]" />} />
              <BenefitNode label="AI Explanation" icon={<Sparkles className="text-[#2F6BFF]" />} />
           </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

function BenefitNode({ label, icon }: any) {
   return (
      <div className="p-8 bg-[#081632] border border-white/5 rounded-[32px] space-y-5 shadow-inner hover:border-[#2F6BFF]/20 transition-all group">
         <div className="h-12 w-12 rounded-xl bg-[#2F6BFF]/10 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">{icon}</div>
         <p className="text-[10px] font-black uppercase tracking-[2px] text-[#94A3B8] leading-tight">{label}</p>
      </div>
   )
}