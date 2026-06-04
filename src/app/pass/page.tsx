
"use client"

import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, XCircle, Trophy, Zap, Star, ArrowRight, ShieldCheck, Sparkles, Gem, Loader2 } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import { useCollection, useFirestore } from "@/firebase"
import { collection, query, where, orderBy } from "firebase/firestore"
import { useMemo } from "react"

/**
 * @fileOverview Institutional Dynamic Pass Center.
 * Fetches dynamic preparation tiers from Firestore registry.
 */

export default function PassPage() {
  const db = useFirestore()
  const passQuery = useMemo(() => (db ? query(collection(db, "passes"), where("active", "==", true), orderBy("displayOrder", "asc")) : null), [db])
  const { data: passes, loading } = useCollection<any>(passQuery)

  return (
    <div className="min-h-screen bg-slate-50/50 font-body">
      <Navbar />
      <main className="container mx-auto px-6 py-12 md:py-24 max-w-7xl">
        <div className="text-center space-y-8 mb-20">
           <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Badge className="bg-primary/10 text-primary border-none px-6 py-2 rounded-full font-black uppercase text-[10px] tracking-[0.3em] mb-6">
                 Official Pass Registry v2.0
              </Badge>
              <h1 className="text-5xl md:text-8xl font-headline font-black text-[#0F172A] tracking-tight uppercase leading-[0.85]">
                 Select Your <br/> <span className="text-primary">Mastery Hub</span>
              </h1>
              <p className="text-lg text-slate-500 font-medium max-w-2xl mx-auto mt-6">
                 Invest in institutional precision. Unlock verified patterns and AI-powered audit rationalizations for all 2026 recruitment cycles.
              </p>
           </motion.div>
        </div>

        {loading ? (
           <div className="flex flex-col items-center justify-center py-20 space-y-4">
              <Loader2 className="h-10 w-10 text-primary animate-spin" />
              <p className="font-black uppercase text-[10px] tracking-widest text-slate-400">Syncing Registry...</p>
           </div>
        ) : (
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 items-stretch">
              {passes?.map((plan: any, idx: number) => (
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
                           Management Choice
                         </div>
                      )}
                      <CardHeader className="p-10 pb-6 text-center space-y-6">
                         <div className="h-16 w-16 rounded-[2rem] bg-slate-50 flex items-center justify-center mx-auto shadow-inner group-hover:scale-110 transition-transform">
                            {plan.type === 'FREE' ? <Zap className="h-7 w-7 text-slate-300" /> : <Gem className="h-7 w-7 text-amber-500" />}
                         </div>
                         <div className="space-y-1">
                           <CardTitle className="font-headline font-black text-2xl text-[#0F172A] uppercase">{plan.name}</CardTitle>
                           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed line-clamp-2 px-4">{plan.description || plan.desc}</p>
                         </div>
                         <div className="pt-4">
                            <span className="text-5xl font-black text-[#0F172A]">₹{plan.price}</span>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-2">/ {plan.durationDays} Days</span>
                         </div>
                      </CardHeader>
                      <CardContent className="p-10 pt-0 flex-1">
                         <div className="h-px w-full bg-slate-50 mb-8" />
                         <ul className="space-y-4">
                            {plan.features?.map((feat: string, i: number) => (
                               <li key={i} className="flex items-start gap-4">
                                  <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                                  <span className="text-xs font-bold text-slate-600 leading-tight uppercase">{feat}</span>
                               </li>
                            ))}
                         </ul>
                      </CardContent>
                      <CardFooter className="p-10 pt-0">
                         <Button asChild className={`w-full h-16 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] shadow-2xl transition-all ${plan.recommended ? 'bg-primary hover:bg-orange-600 text-white' : 'bg-[#0F172A] hover:bg-black text-white'}`}>
                            <Link href={`/checkout?plan=${plan.id}`}>
                               {plan.price === 0 ? 'Initialize Entry' : 'Unlock Hub Access'} <ArrowRight className="ml-3 h-4 w-4" />
                            </Link>
                         </Button>
                      </CardFooter>
                   </Card>
                </motion.div>
              ))}
           </div>
        )}

        {/* Dynamic Gating Message */}
        <div className="mt-32 p-12 md:p-24 rounded-[5rem] bg-[#0F172A] text-white relative overflow-hidden shadow-4xl group">
           <div className="absolute top-0 right-0 p-12 opacity-5 rotate-12 group-hover:scale-110 transition-transform duration-1000"><Sparkles className="h-96 w-96" /></div>
           <div className="max-w-3xl relative z-10 space-y-12 text-left">
              <div className="flex items-center gap-6">
                 <ShieldCheck className="h-12 w-12 text-primary shadow-2xl" />
                 <h2 className="text-4xl md:text-7xl font-headline font-black uppercase tracking-tight leading-[0.85]">Audit Your <br/> Progress.</h2>
              </div>
              <p className="text-slate-400 text-xl font-medium leading-relaxed max-w-xl">
                 Official preparation nodes for PSSSB, PPSC, and Punjab Police are audited daily to ensure absolute pattern accuracy for 2026.
              </p>
           </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
