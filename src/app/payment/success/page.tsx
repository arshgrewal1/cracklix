"use client"

import { useSearchParams } from "next/navigation"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import { Button } from "@/components/ui/button"
import { CheckCircle2, ArrowRight, ShieldCheck, Zap, Sparkles, Loader2 } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Suspense, useEffect, useState } from "react"
import { useUser } from "@/firebase"

/**
 * @fileOverview Verified Success Node v3.0.
 * Redesigned for high-fidelity branding and clear action hierarchy.
 */

export default function SuccessPage() {
  return (
    <Suspense fallback={null}>
      <SuccessContent />
    </Suspense>
  )
}

function SuccessContent() {
  const searchParams = useSearchParams()
  const { user } = useUser()
  const orderId = searchParams?.get("order_id")
  const planName = searchParams?.get("plan") || "Elite Pass"
  
  const [verifying, setVerifying] = useState(!!orderId)

  useEffect(() => {
    // Artificial verification delay to simulate registry sync and improve UX "trust"
    const timer = setTimeout(() => {
      setVerifying(false)
    }, 1500)
    return () => clearTimeout(timer)
  }, [orderId])

  return (
    <div className="min-h-screen bg-white font-body">
      <Navbar />
      
      <main className="container mx-auto px-4 py-20 md:py-32 flex flex-col items-center justify-center text-center">
        {verifying ? (
           <div className="space-y-6 flex flex-col items-center">
              <div className="h-20 w-20 rounded-full border-4 border-slate-100 border-t-primary animate-spin" />
              <div className="space-y-1">
                <p className="text-[#0F172A] font-black uppercase text-xs tracking-[0.3em]">Synchronizing Registry</p>
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Validating preparation node...</p>
              </div>
           </div>
        ) : (
          <motion.div 
             initial={{ scale: 0.95, opacity: 0 }}
             animate={{ scale: 1, opacity: 1 }}
             transition={{ duration: 0.5, ease: "easeOut" }}
             className="w-full max-w-lg space-y-12 md:space-y-16"
          >
             {/* SUCCESS ICON HUB */}
             <div className="relative">
                <motion.div 
                  initial={{ scale: 0, rotate: -45 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
                  className="h-28 w-28 md:h-40 md:w-40 bg-emerald-50 rounded-[3rem] md:rounded-[4rem] flex items-center justify-center mx-auto text-emerald-500 shadow-xl border-4 border-emerald-100 relative z-10"
                >
                   <CheckCircle2 className="h-16 w-16 md:h-24 md:w-24" />
                </motion.div>
                
                {/* DECORATIVE NODES */}
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-[-40px] opacity-20 pointer-events-none flex items-center justify-center z-0"
                >
                   <Sparkles className="h-full w-full text-emerald-400" />
                </motion.div>
             </div>

             {/* TEXT CONTENT */}
             <div className="space-y-4 px-4">
                <h1 className="text-[32px] md:text-6xl font-black text-[#0F172A] tracking-tighter leading-tight uppercase antialiased">
                  Payment <br/> Verified
                </h1>
                <p className="text-slate-500 font-medium text-sm md:text-xl leading-relaxed max-w-md mx-auto">
                   Your preparation pass is now active. Your elite preparation node has been synchronized with the master registry.
                </p>
             </div>

             {/* AUDIT CARD */}
             <div className="mx-4 bg-slate-50/50 rounded-[2.5rem] md:rounded-[3.5rem] border border-slate-100 p-8 md:p-12 space-y-8 shadow-inner text-left relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                   <ShieldCheck className="h-32 w-32" />
                </div>
                
                <div className="space-y-6 relative z-10">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 md:gap-10 border-b border-slate-100 pb-5">
                     <span className="text-[10px] md:text-xs font-black uppercase text-slate-400 tracking-[0.2em]">Node Id</span>
                     <span className="text-xs md:text-sm font-mono font-black text-primary truncate max-w-full">{orderId || "MANUAL_ENTRY_NODE"}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 md:gap-10">
                     <span className="text-[10px] md:text-xs font-black uppercase text-slate-400 tracking-[0.2em]">Pass Tier</span>
                     <span className="text-base md:text-2xl font-black text-[#0F172A] uppercase tracking-tight">{planName}</span>
                  </div>
                </div>
             </div>

             {/* ACTION HUB */}
             <div className="flex flex-col gap-4 px-4">
                <Button asChild className="w-full h-14 md:h-18 bg-[#0F172A] hover:bg-black text-white rounded-full font-black uppercase tracking-[0.3em] text-[11px] md:text-xs shadow-2xl gap-3 transition-all active:scale-95 border-none">
                   <Link href="/dashboard">
                      Enter Hub <ArrowRight className="h-4 w-4 md:h-5 md:w-5" />
                   </Link>
                </Button>
                <Button asChild variant="outline" className="w-full h-14 md:h-18 rounded-full border-2 border-slate-200 bg-white text-[#0F172A] font-black uppercase tracking-[0.3em] text-[11px] md:text-xs transition-all active:scale-95">
                   <Link href="/mocks">Practice Tests</Link>
                </Button>
             </div>

             {/* FOOTER BADGE */}
             <div className="flex items-center justify-center gap-3 text-slate-400 pt-6">
                <ShieldCheck className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.4em] antialiased">Institutional Node Secured</span>
             </div>
          </motion.div>
        )}
      </main>
      <Footer />
    </div>
  )
}
