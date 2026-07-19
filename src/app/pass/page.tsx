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
import { useUser, useFirestore, useCollection } from "@/firebase"
import { collection } from "firebase/firestore"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"

/**
 * @fileOverview Institutional Elite Pass Portal v450.1.
 * UPDATED: Normalized casing for headings and labels.
 */

const BENEFITS = [
  { icon: Trophy, label: "Unlimited mocks", desc: "Full access to 500+ tests", color: "text-blue-500", bg: "bg-blue-50" },
  { icon: ShieldCheck, label: "Verified solutions", desc: "Official board rationales", color: "text-emerald-500", bg: "bg-emerald-50" },
  { icon: BarChart3, label: "State rankings", desc: "Compare with 100K+ users", color: "text-purple-500", bg: "bg-purple-50" },
  { icon: Zap, label: "Daily challenge", desc: "Fresh practice nodes daily", color: "text-orange-500", bg: "bg-orange-50" },
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

  const passStatus = useMemo(() => {
     const expiryStr = profile?.passExpiresAt;
     if (!expiryStr) return 'none';
     const expiry = new Date(expiryStr).getTime();
     return expiry > new Date().getTime() ? 'active' : 'expired';
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
     <div className="h-screen w-full flex flex-col items-center justify-center bg-white space-y-6">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
        <p className="text-[10px] font-bold text-slate-300 tracking-tight">Syncing hub...</p>
     </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-body pb-safe text-left overflow-x-hidden selection:bg-primary/10">
      <Navbar />
      
      <main className="container mx-auto px-4 md:px-8 py-8 md:py-20 max-w-7xl space-y-12 md:space-y-24">
        
        {/* HERO SECTION */}
        <section className="text-center space-y-6 md:space-y-10 relative">
           <motion.div
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             className="space-y-6 md:space-y-8"
           >
              <div className="inline-flex items-center gap-3 px-6 py-2.5 rounded-full bg-blue-50 border border-blue-100 shadow-sm mx-auto">
                 <Crown className="h-4 w-4 text-primary fill-primary animate-pulse" />
                 <span className="text-[10px] md:text-xs font-bold text-primary tracking-tight antialiased">
                   Institutional elite portal
                 </span>
              </div>

              <h1 className="text-3xl md:text-7xl lg:text-8xl font-black tracking-tighter text-[#0F172A] leading-[0.95] antialiased">
                Cracklix <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-400">Elite Pass</span>
              </h1>

              <p className="text-sm md:text-2xl text-slate-500 font-medium max-w-2xl mx-auto leading-relaxed tracking-tight antialiased">
                Unlock unlimited Punjab Government exam preparation with one membership. Trusted by 100K+ successful aspirants.
              </p>
           </motion.div>

           {/* ACTIVE PLAN HUB */}
           <AnimatePresence>
              {passStatus === 'active' && (
                 <motion.div 
                   initial={{ opacity: 0, scale: 0.95 }}
                   animate={{ opacity: 1, scale: 1 }}
                   className="pt-6 md:pt-12"
                 >
                    <Card className="max-w-3xl mx-auto border-none shadow-[0_30px_60px_rgba(0,0,0,0.12)] rounded-[3rem] bg-white p-6 md:p-14 relative overflow-hidden group">
                       <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:rotate-12 transition-transform duration-1000">
                          <Crown className="h-48 w-48 text-[#0F172A]" />
                       </div>
                       <div className="absolute -top-10 -left-10 w-40 h-40 bg-primary/5 rounded-full blur-3xl" />
                       
                       <div className="relative z-10 flex flex-col md:flex-row items-center gap-10 md:gap-16">
                          <div className="relative shrink-0">
                             <svg className="h-32 w-32 md:h-44 md:w-44 transform -rotate-90">
                                <circle cx="50%" cy="50%" r="44%" className="stroke-slate-50 fill-none" strokeWidth="12" />
                                <motion.circle 
                                  cx="50%" cy="50%" r="44%" 
                                  className="stroke-emerald-500 fill-none" 
                                  strokeWidth="12" 
                                  strokeDasharray="100 100"
                                  initial={{ strokeDashoffset: 100 }}
                                  animate={{ strokeDashoffset: progressPercent }}
                                  transition={{ duration: 2, ease: "easeOut" }}
                                />
                             </svg>
                             <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                                <span className="text-2xl md:text-4xl font-black text-[#0F172A] tabular-nums tracking-tighter leading-none">{timeLeftStr.split(' ')[0]}</span>
                                <span className="text-[7px] md:text-[8px] font-bold text-slate-400 tracking-tight mt-1">{timeLeftStr.split(' ').slice(1).join(' ')}</span>
                             </div>
                          </div>

                          <div className="flex-1 text-center md:text-left space-y-4 md:space-y-6">
                             <div className="space-y-2">
                                <Badge className="bg-emerald-50 text-emerald-600 border-none font-bold text-[9px] px-4 py-1 rounded-full shadow-sm flex w-fit mx-auto md:mx-0 items-center gap-2">
                                   <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> ✨ Active membership
                                </Badge>
                                <h3 className="text-2xl md:text-4xl font-black text-[#0F172A] tracking-tight">{profile?.pass?.plan || 'Pro Pass'}</h3>
                             </div>
                             
                             <div className="grid grid-cols-2 gap-6 pt-2">
                                <div><p className="text-[9px] font-bold text-slate-400 tracking-tight uppercase">Activated</p><p className="font-bold text-[#0F172A] text-sm md:text-lg">{new Date(profile?.pass?.purchaseDate || Date.now()).toLocaleDateString('en-GB')}</p></div>
                                <div><p className="text-[9px] font-bold text-slate-400 tracking-tight uppercase">Next billing</p><p className="font-bold text-[#0F172A] text-sm md:text-lg">{new Date(profile?.pass?.expiryDate || Date.now()).toLocaleDateString('en-GB')}</p></div>
                             </div>

                             <div className="pt-2">
                                <Button asChild className="h-12 md:h-14 px-8 bg-[#0F172A] hover:bg-black text-white font-bold text-[10px] rounded-2xl shadow-xl transition-all border-none">
                                   <Link href="#plans">Renew membership <ArrowRight className="ml-2 h-4 w-4" /></Link>
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
        <section id="plans" className="space-y-12">
           <div className="text-center space-y-2">
              <h2 className="text-2xl md:text-4xl font-black text-[#0F172A] tracking-tight">Select your access</h2>
              <p className="text-slate-500 font-medium text-sm md:text-lg">Institutional-grade preparation nodes starting at zero cost.</p>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10">
              {passesLoading ? (
                 Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-[500px] w-full rounded-[3rem] bg-white border border-slate-100" />)
              ) : passes.map((plan, idx) => {
                 const isElite = plan.id.includes('elite');
                 const isFree = plan.price === 0;
                 return (
                    <motion.div 
                      key={plan.id}
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: idx * 0.1 }}
                      className="flex"
                    >
                       <Card className={cn(
                         "border-none shadow-xl hover:shadow-[0_40px_80px_rgba(0,0,0,0.12)] transition-all duration-500 rounded-[3rem] bg-white overflow-hidden flex flex-col group w-full relative",
                         isElite ? "ring-4 ring-primary/20 scale-[1.03] z-10" : "border border-slate-100"
                       )}>
                          {isElite && (
                             <div className="absolute top-0 left-0 right-0 bg-primary text-white py-3 text-center text-[10px] font-bold tracking-tight shadow-lg">
                               Most recommended hub
                             </div>
                          )}
                          <CardHeader className={cn("p-10 pb-6 text-center space-y-6", isElite ? "pt-16" : "")}>
                             <div className={cn("h-16 w-16 rounded-2xl flex items-center justify-center mx-auto shadow-inner transition-transform group-hover:scale-110", isFree ? "bg-slate-50 text-slate-400" : isElite ? "bg-amber-50 text-amber-500" : "bg-blue-50 text-primary")}>
                                {isFree ? <Zap className="h-8 w-8" /> : isElite ? <Crown className="h-8 w-8 fill-current" /> : <Gem className="h-8 w-8" />}
                             </div>
                             <div className="space-y-1">
                                <CardTitle className="text-2xl md:text-3xl font-black text-[#0F172A] tracking-tight">{plan.name}</CardTitle>
                                <div className="flex items-baseline justify-center gap-1.5 pt-2">
                                   <span className="text-4xl md:text-5xl font-black text-[#0F172A] tabular-nums tracking-tighter">₹{plan.price}</span>
                                   <span className="text-[10px] md:text-xs font-bold text-slate-400 tracking-tight">/ {plan.durationDays} Days</span>
                                </div>
                             </div>
                          </CardHeader>

                          <CardContent className="px-10 pb-10 flex-1">
                             <div className="h-px w-full bg-slate-50 mb-8" />
                             <ul className="space-y-4">
                                {plan.features?.map((f: string, i: number) => (
                                   <li key={i} className="flex items-start gap-4">
                                      <div className={cn("h-5 w-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 shadow-inner", isElite ? "bg-primary text-white" : "bg-emerald-50 text-emerald-500")}>
                                         <Check className="h-3 w-3 stroke-[4px]" />
                                      </div>
                                      <span className="text-[13px] font-bold text-slate-600 leading-tight">{f}</span>
                                   </li>
                                ))}
                             </ul>
                          </CardContent>

                          <CardFooter className="p-10 pt-0">
                             <Button asChild className={cn(
                               "w-full h-16 rounded-2xl font-bold tracking-tight text-[10px] shadow-2xl transition-all active:scale-95 border-none",
                               isElite ? "bg-primary hover:bg-blue-700 text-white" : "bg-[#0F172A] hover:bg-black text-white"
                             )}>
                                <Link href={`/checkout?plan=${plan.id}`}>
                                   {isFree ? 'Activate hub' : 'Get Elite Pass'} <ArrowRight className="ml-3 h-4 w-4" />
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
        <section className="space-y-16">
           <div className="text-center space-y-4">
              <h2 className="text-2xl md:text-4xl font-black text-[#0F172A] tracking-tight">Platform benefits</h2>
              <div className="h-1.5 w-24 bg-primary mx-auto rounded-full" />
           </div>

           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10">
              {BENEFITS.map((b, i) => (
                 <motion.div 
                   key={i} 
                   whileHover={{ y: -8 }}
                   className="p-8 md:p-12 bg-white rounded-[3rem] shadow-xl border border-slate-50 transition-all duration-300 group hover:shadow-2xl text-left"
                 >
                    <div className={cn("h-14 w-14 rounded-2xl flex items-center justify-center shadow-inner mb-8 transition-transform group-hover:scale-110 group-hover:rotate-6", b.bg, b.color)}>
                       <b.icon className="h-7 w-7" />
                    </div>
                    <h4 className="text-xl md:text-2xl font-black text-[#0F172A] mb-3">{b.label}</h4>
                    <p className="text-sm md:text-base text-slate-500 font-medium leading-relaxed">{b.desc}</p>
                 </motion.div>
              ))}
           </div>
        </section>

      </main>
      <Footer />
    </div>
  )
}

function MetricNode({ label, value, icon }: any) {
  return (
    <Card className="border border-slate-100 shadow-xl rounded-[2rem] bg-white p-6 md:p-10 flex flex-col gap-4 text-left group hover:-translate-y-1 transition-all">
       <div className="h-10 w-10 md:h-12 md:w-12 rounded-xl bg-slate-50 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
          {React.cloneElement(icon as React.ReactElement, { className: "h-5 w-5 md:h-6 md:w-6" })}
       </div>
       <div className="space-y-0.5">
          <p className="text-xl md:text-3xl font-black text-[#0F172A] tracking-tighter tabular-nums">{value}</p>
          <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{label}</p>
       </div>
    </Card>
  )
}

function ClipboardList({ className }: any) { return <Zap className={className} /> }
function TrendingUp({ className }: any) { return <ArrowUpRight className={className} /> }
