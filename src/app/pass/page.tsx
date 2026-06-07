
"use client"

import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, Zap, ArrowRight, ShieldCheck, Gem, Loader2, Sparkles, Star } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import { useCollection, useFirestore } from "@/firebase"
import { collection } from "firebase/firestore"
import { useMemo } from "react"
import { cn } from "@/lib/utils"

/**
 * @fileOverview Final Cracklix Elite Pass Hub v16.0.
 * Rebuilt to match High-Fidelity screenshot: Dark Navy & Orange aesthetic.
 */
export default function PassPage() {
  const db = useFirestore()
  const passQuery = useMemo(() => (db ? collection(db, "passes") : null), [db])
  const { data: rawPasses, loading } = useCollection<any>(passQuery)

  const passes = useMemo(() => {
    if (!rawPasses) return []
    return rawPasses.filter((p: any) => p.active === true).sort((a: any, b: any) => (a.displayOrder || 0) - (b.displayOrder || 0))
  }, [rawPasses])

  return (
    <div className="min-h-screen bg-[#020817] font-body pb-safe overflow-x-hidden text-white">
      <Navbar />
      
      {/* Dynamic Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />

      <main className="container mx-auto px-4 py-16 md:py-24 max-w-7xl relative z-10">
        <div className="text-center space-y-6 mb-16 md:mb-20">
           <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Badge className="bg-primary/20 text-primary border-primary/30 px-5 py-2 rounded-full font-black uppercase text-[10px] tracking-[0.2em] mb-8 shadow-2xl">
                 Official Registry 2026
              </Badge>
              <h1 className="text-4xl md:text-7xl font-headline font-black tracking-tight uppercase leading-[0.9]">
                 UNLOCK YOUR <br/> <span className="text-primary">ELITE PASS</span>
              </h1>
              <p className="text-sm md:text-xl text-slate-400 font-medium max-w-2xl mx-auto mt-8 leading-relaxed">
                 Access high-fidelity mocks and official pattern rationalizations verified by Arsh Grewal Management.
              </p>
           </motion.div>
        </div>

        {loading ? (
           <div className="flex flex-col items-center justify-center py-24 space-y-6">
              <Loader2 className="h-12 w-12 text-primary animate-spin" />
              <p className="font-black uppercase text-[10px] tracking-[0.4em] text-slate-500">Syncing Registry...</p>
           </div>
        ) : (
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 items-stretch justify-center">
              {passes?.map((plan: any, idx: number) => (
                <motion.div 
                  key={plan.id} 
                  initial={{ opacity: 0, y: 30 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  transition={{ delay: idx * 0.1 }}
                  className="h-full"
                >
                   <Card className={cn(
                     "h-full border-none shadow-5xl rounded-[3.5rem] overflow-hidden flex flex-col transition-all duration-500",
                     plan.type === 'FREE' ? "bg-white/5 border border-white/5" : "bg-[#0B1528] ring-1 ring-primary/20"
                   )}>
                      <CardHeader className="p-10 md:p-12 pb-6 md:pb-8 text-center space-y-8">
                         <div className={cn(
                           "h-20 w-20 rounded-[2rem] flex items-center justify-center mx-auto shadow-2xl transition-transform hover:scale-110",
                           plan.type === 'FREE' ? "bg-white/5 text-primary" : "bg-primary/10 text-primary"
                         )}>
                            {plan.type === 'FREE' ? <Zap className="h-10 w-10 fill-current" /> : <Gem className="h-10 w-10 fill-current" />}
                         </div>
                         <div className="space-y-3">
                           <CardTitle className="font-headline font-black text-2xl md:text-3xl uppercase tracking-tight text-white leading-tight">
                              {plan.name}
                           </CardTitle>
                           <p className="text-[11px] font-bold uppercase tracking-widest leading-relaxed text-slate-400 px-2 min-h-[40px]">
                              {plan.description}
                           </p>
                         </div>
                         <div className="pt-4 flex flex-col items-center">
                            <div className="flex items-baseline gap-1">
                               <span className="text-6xl md:text-7xl font-headline font-black text-white tracking-tighter">₹{plan.price}</span>
                               <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">/ {plan.durationDays} Days</span>
                            </div>
                         </div>
                      </CardHeader>

                      <CardContent className="px-10 md:px-12 pb-8 md:pb-10 flex-1">
                         <div className="h-px w-full bg-white/5 mb-10" />
                         <ul className="space-y-5">
                            {(plan.features || []).map((feat: string, i: number) => (
                               <li key={i} className="flex items-start gap-4 text-left group/feat">
                                  <CheckCircle2 className="h-5 w-5 shrink-0 mt-0.5 text-primary group-hover/feat:scale-110 transition-transform" />
                                  <span className="text-xs md:text-sm font-bold uppercase leading-tight text-slate-300 group-hover/feat:text-white transition-colors">{feat}</span>
                               </li>
                            ))}
                         </ul>
                      </CardContent>

                      <CardFooter className="p-10 md:p-12 pt-0">
                         <Button asChild className="w-full h-16 md:h-20 rounded-[2rem] bg-primary hover:bg-orange-600 text-white font-black uppercase text-[11px] tracking-[0.2em] shadow-3xl transition-all active:scale-95 border-none">
                            <Link href={`/checkout?plan=${plan.id}`}>
                               Activate Pass <ArrowRight className="ml-3 h-5 w-5" />
                            </Link>
                         </Button>
                      </CardFooter>
                   </Card>
                </motion.div>
              ))}
           </div>
        )}

        {/* Institutional CTA */}
        <motion.div 
           initial={{ opacity: 0 }} 
           whileInView={{ opacity: 1 }} 
           viewport={{ once: true }}
           className="mt-32 md:mt-48 p-12 md:p-24 rounded-[4rem] bg-gradient-to-br from-[#0B1528] to-primary/10 text-white relative overflow-hidden shadow-5xl border border-white/5 text-left"
        >
           <div className="absolute top-0 right-0 p-16 opacity-5 rotate-12"><Star className="h-80 w-80" /></div>
           <div className="max-w-3xl relative z-10 space-y-10">
              <div className="flex items-center gap-6">
                 <ShieldCheck className="h-12 w-12 md:h-20 md:w-20 text-primary" />
                 <h2 className="text-4xl md:text-7xl font-headline font-black uppercase leading-[0.85] tracking-tighter">Your Success <br/> Is Gated.</h2>
              </div>
              <p className="text-lg md:text-2xl text-slate-400 font-medium leading-relaxed max-w-2xl antialiased">
                 Every elite pass node provides 24/7 access to the official PSSSB/PPSC registry and live current affairs rationalizations.
              </p>
              <div className="flex flex-col sm:flex-row items-center gap-6 pt-6">
                 <Button asChild className="w-full sm:w-auto h-16 md:h-20 px-12 md:px-20 bg-primary text-white hover:bg-orange-600 rounded-[2rem] font-black uppercase tracking-[0.3em] text-[11px] shadow-3xl border-none">
                    <Link href="/mocks">Explore All Mocks</Link>
                 </Button>
                 <Link href="/contact" className="text-slate-500 hover:text-white font-black uppercase text-[10px] tracking-widest transition-colors">Inquire for Institute</Link>
              </div>
           </div>
        </motion.div>
      </main>
      <Footer />
    </div>
  )
}
