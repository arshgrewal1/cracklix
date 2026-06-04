
"use client"

import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, XCircle, Trophy, Zap, Star, ArrowRight, ShieldCheck, Sparkles, Gem } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"

/**
 * @fileOverview Final Cracklix Pass Center (Phase 156).
 * Tiered monetization gateway for Punjab Government aspirants.
 */

const PLANS = [
  {
    id: "free",
    name: "Aspirant Free",
    price: 0,
    tier: "Free",
    desc: "Test the platform with essential pattern mocks.",
    features: { mocks: "10 Free", premiumMocks: false, pyqs: false, ca: true, analytics: false, courses: false },
    icon: <Zap className="h-6 w-6 text-slate-400" />
  },
  {
    id: "silver",
    name: "Silver Pass",
    price: 99,
    tier: "Silver",
    desc: "Subject Mastery for state exams.",
    features: { mocks: "Subject Only", premiumMocks: false, pyqs: true, ca: true, analytics: false, courses: false },
    icon: <ShieldCheck className="h-6 w-6 text-blue-500" />
  },
  {
    id: "gold",
    name: "Gold Pass",
    price: 199,
    tier: "Gold",
    recommended: true,
    desc: "The standard for serious preparation.",
    features: { mocks: "Subject + Sectional", premiumMocks: true, pyqs: true, ca: true, analytics: true, courses: false },
    icon: <Trophy className="h-6 w-6 text-amber-500" />
  },
  {
    id: "premium",
    name: "Elite Pass",
    price: 499,
    tier: "Premium",
    desc: "Full institutional access (All Mocks).",
    features: { mocks: "Unlimited (Full/Sub/Sec)", premiumMocks: true, pyqs: true, ca: true, analytics: true, courses: true },
    icon: <Star className="h-6 w-6 text-primary" />
  }
]

export default function PassPage() {
  return (
    <div className="min-h-screen bg-slate-50/50">
      <Navbar />
      <main className="container mx-auto px-6 py-12 md:py-24 max-w-7xl">
        <div className="text-center space-y-8 mb-20">
           <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Badge className="bg-primary/10 text-primary border-none px-6 py-2 rounded-full font-black uppercase text-[10px] tracking-[0.3em] mb-6">
                 Pass Hub v1.0
              </Badge>
              <h1 className="text-5xl md:text-8xl font-headline font-black text-[#0F172A] tracking-tight uppercase leading-[0.9]">
                 Select Your <br/> <span className="text-primary">Cracklix Pass</span>
              </h1>
              <p className="text-lg text-slate-500 font-medium max-w-2xl mx-auto mt-6">
                 Unlock institutional accuracy and AI-powered audit rationalizations for all 2026 Punjab recruitment cycles.
              </p>
           </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 items-stretch">
           {PLANS.map((plan, idx) => (
             <motion.div 
               key={plan.id}
               initial={{ opacity: 0, y: 30 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: idx * 0.1 }}
               className="h-full"
             >
                <Card className={`h-full border-none shadow-3xl rounded-[3.5rem] overflow-hidden flex flex-col group hover:translate-y-[-10px] transition-all duration-500 ${plan.recommended ? 'ring-4 ring-primary ring-offset-8 scale-105 z-10' : 'bg-white'}`}>
                   {plan.recommended && (
                      <div className="bg-primary text-white py-3 text-center text-[10px] font-black uppercase tracking-[0.4em]">
                        Recommended Pass
                      </div>
                   )}
                   <CardHeader className="p-10 pb-6 text-center space-y-6">
                      <div className="h-16 w-16 rounded-[2rem] bg-slate-50 flex items-center justify-center mx-auto shadow-inner group-hover:scale-110 transition-transform">
                         {plan.icon}
                      </div>
                      <div className="space-y-1">
                        <CardTitle className="font-headline font-black text-2xl text-[#0F172A] uppercase">{plan.name}</CardTitle>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest px-4">{plan.desc}</p>
                      </div>
                      <div className="pt-4">
                         <span className="text-5xl font-black text-[#0F172A]">₹{plan.price}</span>
                         <span className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-2">/ month</span>
                      </div>
                   </CardHeader>
                   <CardContent className="p-10 pt-0 flex-1">
                      <div className="h-px w-full bg-slate-50 mb-8" />
                      <ul className="space-y-4">
                         <FeatureRow label="Mocks" val={plan.features.mocks} />
                         <FeatureRow label="Full Mocks" active={plan.id === 'premium'} />
                         <FeatureRow label="Verified PYQs" active={plan.features.pyqs} />
                         <FeatureRow label="Daily Analysis" active={plan.features.ca} />
                         <FeatureRow label="Deep Analytics" active={plan.features.analytics} />
                      </ul>
                   </CardContent>
                   <CardFooter className="p-10 pt-0">
                      <Button asChild className={`w-full h-16 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] shadow-2xl transition-all ${plan.recommended ? 'bg-primary hover:bg-orange-600 text-white' : 'bg-[#0F172A] hover:bg-black text-white'}`}>
                         <Link href={`/checkout?plan=${plan.id}`}>
                            {plan.price === 0 ? 'Activate Free' : 'Unlock Now'} <ArrowRight className="ml-3 h-4 w-4" />
                         </Link>
                      </Button>
                   </CardFooter>
                </Card>
             </motion.div>
           ))}
        </div>

        {/* Locked Feature Teaser */}
        <div className="mt-32 p-12 md:p-20 rounded-[4rem] bg-[#0F172A] text-white relative overflow-hidden shadow-4xl group">
           <div className="absolute top-0 right-0 p-12 opacity-5 rotate-12 group-hover:scale-110 transition-transform"><Sparkles className="h-64 w-64" /></div>
           <div className="max-w-3xl relative z-10 space-y-10">
              <div className="flex items-center gap-4 text-left">
                 <ShieldCheck className="h-10 w-10 text-primary" />
                 <h2 className="text-4xl md:text-5xl font-headline font-black uppercase leading-tight">Institutional Access</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 text-left">
                 <div className="space-y-6">
                    <p className="text-slate-400 font-medium text-lg leading-relaxed">
                       Upgrade to a <span className="text-white font-black underline decoration-primary underline-offset-4">Strategic Pass</span> to unlock high-fidelity mock series and deep performance auditing.
                    </p>
                    <ul className="space-y-3">
                       <li className="flex items-center gap-3 text-xs font-bold uppercase text-slate-300">
                          <CheckCircle2 className="h-4 w-4 text-emerald-500" /> 500+ Official Pattern Mocks
                       </li>
                       <li className="flex items-center gap-3 text-xs font-bold uppercase text-slate-300">
                          <CheckCircle2 className="h-4 w-4 text-emerald-500" /> AI-Powered Logic Explanations
                       </li>
                    </ul>
                 </div>
                 <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-10 flex flex-col justify-center space-y-6 text-center shadow-inner">
                    <div className="h-12 w-12 bg-white/5 rounded-2xl flex items-center justify-center mx-auto"><Trophy className="h-6 w-6 text-amber-500" /></div>
                    <p className="text-xl font-headline font-black uppercase tracking-tight">Management Choice</p>
                    <Button asChild className="bg-white text-black hover:bg-slate-200 h-14 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-3xl">
                       <Link href="/checkout?plan=gold">Get Gold Pass</Link>
                    </Button>
                 </div>
              </div>
           </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

function FeatureRow({ label, active, val }: { label: string, active?: boolean, val?: string }) {
   return (
      <li className="flex items-center justify-between py-1">
         <span className="text-xs font-bold text-slate-500 uppercase tracking-tight">{label}</span>
         {val ? (
            <span className="text-xs font-black text-[#0F172A]">{val}</span>
         ) : active ? (
            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
         ) : (
            <XCircle className="h-5 w-5 text-slate-200" />
         )}
      </li>
   )
}
