
"use client"

import React, { useMemo, useState, useEffect } from "react"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  CheckCircle2, 
  Zap, 
  ArrowRight, 
  Gem, 
  AlertCircle, 
  Clock, 
  Layers, 
  Calendar,
  Trophy,
  ShieldCheck,
  Star,
  Award,
  Crown,
  Check,
  Lock,
  Smartphone,
  CreditCard,
  Target,
  BarChart3,
  UserPlus,
  ArrowUpRight,
  Loader2
} from "lucide-react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { useUser, useCollection, useFirestore } from "@/firebase"
import { collection } from "firebase/firestore"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"

/**
 * @fileOverview Institutional Elite Pass Portal v453.0 [Compacted].
 * UPDATED: Reduced card footprint and padding to match Home Hub style.
 */

const BENEFITS = [
  { icon: Trophy, label: "Unlimited mocks", desc: "Full access to 500+ tests", color: "text-blue-500", bg: "bg-blue-50" },
  { icon: ShieldCheck, label: "Verified solutions", desc: "Official board rationales", color: "text-emerald-500", bg: "bg-emerald-50" },
  { icon: BarChart3, label: "State rankings", desc: "Compare with 100K+ users", color: "text-purple-500", bg: "bg-purple-50" },
  { icon: Zap, label: "Daily challenge", desc: "Fresh practice questions daily", color: "text-orange-500", bg: "bg-orange-50" },
  { icon: Award, label: "Performance analytics", desc: "Deep subject-wise insights", color: "text-indigo-500", bg: "bg-indigo-50" },
  { icon: Lock, label: "Ad-free vault", desc: "No interruptions during prep", color: "text-rose-500", bg: "bg-rose-50" },
];

export default function PassPage() {
  const { user, profile, loading: userLoading } = useUser()
  const db = useFirestore()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [timeLeftStr, setTimeLeftStr] = useState("");
  const [progressPercent, setProgressPercent] = useState(0);
  const [passStatus, setPassStatus] = useState<'none' | 'active' | 'expired'>('none');

  useEffect(() => {
    setMounted(true);
    if (!userLoading && !user) {
      router.push(`/login?returnUrl=${encodeURIComponent('/pass')}`);
    }
  }, [user, userLoading, router]);

  const passQuery = useMemo(() => (db ? collection(db, "passes") : null), [db])
  const { data: rawPasses, loading: passesLoading } = useCollection<any>(passQuery)

  const passes = useMemo(() => {
     if (!rawPasses) return []
     return [...rawPasses].filter(p => p.active !== false).sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))
  }, [rawPasses])

  useEffect(() => {
     if (!profile) return;
     const expiryStr = profile?.passExpiresAt;
     if (!expiryStr) {
        setPassStatus('none');
        return;
     }
     const expiry = new Date(expiryStr).getTime();
     const now = new Date().getTime();
     setPassStatus(expiry > now ? 'active' : 'expired');
  }, [profile]);

  useEffect(() => {
    const expiryStr = profile?.passExpiresAt;
    if (!expiryStr || passStatus !== 'active') return;
    
    const expiryDate = new Date(expiryStr);
    const startDate = profile?.passActivatedAt ? new Date(profile.passActivatedAt) : new Date(new Date(expiryStr).getTime() - (30 * 24 * 60 * 60 * 1000));
    
    const interval = setInterval(() => {
       const now = new Date().getTime();
       const total = expiryDate.getTime() - startDate.getTime();
       const remaining = expiryDate.getTime() - now;

       if (remaining <= 0) {
          setTimeLeftStr("Expired");
          setProgressPercent(100);
          setPassStatus('expired');
          clearInterval(interval);
          return;
       }

       const d = Math.floor(remaining / (1000 * 60 * 60 * 24));
       const h = Math.floor((remaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
       
       setTimeLeftStr(d > 0 ? `${d} Days Left` : `${h} Hours Left`);
       setProgressPercent(Math.min(100, Math.round(((total - remaining) / total) * 100)));
    }, 1000);

    return () => clearInterval(interval);
  }, [profile?.passExpiresAt, passStatus, profile?.passActivatedAt]);

  if (userLoading || !user) return (
     <div className="h-screen w-full flex flex-col items-center justify-center bg-background space-y-6">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
        <p className="text-[10px] font-bold text-muted-foreground tracking-widest uppercase">Syncing database...</p>
     </div>
  );

  return (
    <div className="min-h-screen bg-background font-body pb-safe text-left overflow-x-hidden selection:bg-primary/10">
      <Navbar />
      
      <main className="container mx-auto px-4 md:px-8 py-8 md:py-16 max-w-7xl space-y-12 md:space-y-20">
        
        {/* HERO SECTION */}
        <section className="text-center space-y-6 md:space-y-8 relative">
           <motion.div
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             className="space-y-4 md:space-y-6"
           >
              <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-primary/5 border border-primary/20 shadow-sm mx-auto">
                 <Crown className="h-4 w-4 text-primary fill-primary animate-pulse" />
                 <span className="text-[10px] md:text-xs font-bold text-primary tracking-tight">
                   Institutional elite portal
                 </span>
              </div>

              <h1 className="text-3xl md:text-6xl font-black tracking-tighter text-foreground leading-none antialiased">
                Elite <span className="text-primary italic">Pass.</span>
              </h1>

              <p className="text-sm md:text-xl text-muted-foreground font-medium max-w-2xl mx-auto leading-relaxed tracking-tight antialiased px-4">
                Unlock unlimited Punjab Government exam preparation with one membership.
              </p>
           </motion.div>

           {/* ACTIVE PLAN HUB */}
           <AnimatePresence>
              {mounted && passStatus === 'active' && (
                 <motion.div 
                   initial={{ opacity: 0, scale: 0.95 }}
                   animate={{ opacity: 1, scale: 1 }}
                   className="pt-4 md:pt-8"
                 >
                    <Card className="max-w-3xl mx-auto border border-border shadow-2xl rounded-[2rem] bg-card p-4 md:p-8 relative overflow-hidden group">
                       <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:rotate-12 transition-transform duration-1000">
                          <Crown className="h-48 w-48 text-primary" />
                       </div>
                       
                       <div className="relative z-10 flex flex-col md:flex-row items-center gap-6 md:gap-10">
                          <div className="relative shrink-0">
                             <svg className="h-24 w-24 md:h-32 md:w-32 transform -rotate-90">
                                <circle cx="50%" cy="50%" r="44%" className="stroke-muted fill-none" strokeWidth="8" />
                                <motion.circle 
                                  cx="50%" cy="50%" r="44%" 
                                  className="stroke-emerald-500 fill-none" 
                                  strokeWidth="8" 
                                  strokeDasharray="100 100"
                                  initial={{ strokeDashoffset: 100 }}
                                  animate={{ strokeDashoffset: 100 - progressPercent }}
                                  transition={{ duration: 2, ease: "easeOut" }}
                                />
                             </svg>
                             <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                                <span className="text-lg md:text-xl font-black text-foreground tabular-nums tracking-tighter leading-none">{timeLeftStr.split(' ')[0]}</span>
                                <span className="text-[6px] md:text-[7px] font-bold text-muted-foreground tracking-tight mt-0.5">{timeLeftStr.split(' ').slice(1).join(' ')}</span>
                             </div>
                          </div>

                          <div className="flex-1 text-center md:text-left space-y-4">
                             <div className="space-y-1">
                                <Badge className="bg-emerald-50 text-emerald-600 border-none font-bold text-[8px] px-3 py-0.5 rounded-full shadow-sm flex w-fit mx-auto md:mx-0 items-center gap-2 tracking-tight">
                                   <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> Active membership
                                </Badge>
                                <h3 className="text-xl md:text-2xl font-black text-foreground tracking-tighter">{profile?.pass?.plan || 'Pro Pass'}</h3>
                             </div>
                             
                             <div className="grid grid-cols-2 gap-4 pt-1">
                                <div><p className="text-[8px] font-bold text-muted-foreground tracking-tight uppercase">Activated</p><p className="font-bold text-foreground text-sm">{new Date(profile?.pass?.purchaseDate || Date.now()).toLocaleDateString('en-GB')}</p></div>
                                <div><p className="text-[8px] font-bold text-muted-foreground tracking-tight uppercase">Next billing</p><p className="font-bold text-foreground text-sm">{new Date(profile?.pass?.expiryDate || Date.now()).toLocaleDateString('en-GB')}</p></div>
                             </div>

                             <div className="pt-2">
                                <Button asChild className="h-10 md:h-11 px-8 bg-primary hover:bg-blue-700 text-white font-bold text-[10px] tracking-tight rounded-xl shadow-xl transition-all border-none">
                                   <Link href="#plans">Renew membership <ArrowRight className="ml-2 h-3 w-3" /></Link>
                                </Button>
                             </div>
                          </div>
                       </div>
                    </Card>
                 </motion.div>
              )}
           </AnimatePresence>
        </section>

        {/* PRICING PLANS */}
        <section id="plans" className="space-y-8 md:space-y-12">
           <div className="text-center space-y-1">
              <h2 className="text-xl md:text-2xl font-black text-foreground tracking-tighter">Select access hub</h2>
              <p className="text-muted-foreground font-medium text-xs md:text-sm">Institutional preparation starting at zero cost.</p>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
              {passesLoading ? (
                 Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-[320px] w-full rounded-[2rem] bg-muted border border-border" />)
              ) : passes.map((plan, idx) => {
                 const isElite = plan.id.includes('elite');
                 const isFree = plan.price === 0;
                 return (
                    <motion.div 
                      key={plan.id}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: idx * 0.1 }}
                      className="flex"
                    >
                       <Card className={cn(
                         "border border-border shadow-md hover:shadow-xl transition-all duration-500 rounded-[24px] bg-card overflow-hidden flex flex-col group w-full relative",
                         isElite ? "ring-2 ring-primary ring-offset-background scale-[1.01] z-10 shadow-primary/10" : ""
                       )}>
                          {isElite && (
                             <div className="bg-primary text-white py-1 text-center text-[8px] font-black tracking-widest uppercase shadow-md">
                               Recommended hub
                             </div>
                          )}
                          <CardHeader className={cn("p-5 md:p-6 pb-2 text-center space-y-3", isElite ? "pt-6" : "")}>
                             <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center mx-auto shadow-inner transition-transform group-hover:scale-110", isFree ? "bg-muted text-muted-foreground" : isElite ? "bg-amber-50 text-amber-500" : "bg-blue-50 text-primary")}>
                                {isFree ? <Zap className="h-4 w-4" /> : isElite ? <Crown className="h-4 w-4 fill-current" /> : <Gem className="h-4 w-4" />}
                             </div>
                             <div className="space-y-0.5">
                                <CardTitle className="text-lg md:text-xl font-black text-foreground tracking-tighter">{plan.name}</CardTitle>
                                <div className="flex items-baseline justify-center gap-1">
                                   <span className="text-xl md:text-3xl font-black text-foreground tabular-nums tracking-tighter">₹{plan.price}</span>
                                   <span className="text-[8px] md:text-[9px] font-bold text-muted-foreground tracking-tight">/ {plan.durationDays} Days</span>
                                </div>
                             </div>
                          </CardHeader>

                          <CardContent className="px-5 md:px-6 pb-3 flex-1">
                             <div className="h-px w-full bg-border mb-3" />
                             <ul className="space-y-2">
                                {plan.features?.map((f: string, i: number) => (
                                   <li key={i} className="flex items-start gap-2">
                                      <div className={cn("h-3.5 w-3.5 rounded-full flex items-center justify-center shrink-0 mt-0.5 shadow-inner", isElite ? "bg-primary text-white" : "bg-emerald-50 text-emerald-500")}>
                                         <Check className="h-2 w-2 stroke-[4px]" />
                                      </div>
                                      <span className="text-[10px] md:text-xs font-bold text-muted-foreground leading-tight tracking-tight">{f}</span>
                                   </li>
                                ))}
                             </ul>
                          </CardContent>

                          <CardFooter className="p-5 md:p-6 pt-0">
                             <Button asChild className={cn(
                               "w-full h-10 md:h-11 rounded-xl font-black tracking-tight text-[9px] md:text-[10px] shadow-md transition-all active:scale-95 border-none",
                               isElite ? "bg-primary hover:bg-blue-700 text-white" : "bg-[#0F172A] hover:bg-black text-white"
                             )}>
                                <Link href={`/checkout?plan=${plan.id}`}>
                                   {isFree ? 'Activate hub' : 'Get Elite Pass'} <ArrowRight className="ml-2 h-3 w-3" />
                                </Link>
                             </Button>
                          </CardFooter>
                       </Card>
                    </motion.div>
                 )
              })}
           </div>
        </section>

        {/* BENEFITS MATRIX */}
        <section className="space-y-8 md:space-y-12">
           <div className="text-center space-y-2">
              <h2 className="text-lg md:text-2xl font-black text-foreground tracking-tighter">Vault benefits</h2>
              <div className="h-1 w-12 bg-primary mx-auto rounded-full" />
           </div>

           <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {BENEFITS.map((b, i) => (
                 <motion.div 
                   key={i} 
                   whileHover={{ y: -4 }}
                   className="p-4 md:p-6 bg-card rounded-[1.5rem] md:rounded-[2rem] shadow-sm border border-border transition-all duration-300 group hover:shadow-lg text-left h-full"
                 >
                    <div className={cn("h-9 w-9 md:h-11 md:h-11 rounded-xl flex items-center justify-center shadow-inner mb-3 md:mb-4 transition-transform group-hover:scale-110", b.bg, b.color)}>
                       <b.icon className="h-4.5 w-4.5 md:h-5 md:h-5" />
                    </div>
                    <h4 className="text-xs md:text-base font-black text-foreground mb-0.5 tracking-tight">{b.label}</h4>
                    <p className="text-[9px] md:text-xs text-muted-foreground font-medium leading-tight tracking-tight">{b.desc}</p>
                 </motion.div>
              ))}
           </div>
        </section>

      </main>
      <Footer />
    </div>
  )
}
