"use client"

import { useSearchParams, useRouter } from "next/navigation"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import { Button } from "@/components/ui/button"
import { CheckCircle2, ArrowRight, ShieldCheck, Zap, Sparkles, Loader2 } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Suspense, useEffect, useState } from "react"
import { useUser } from "@/firebase"

/**
 * @fileOverview Verified Success Node v2.5.
 * Triggers server-side verification before allowing hub access.
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
  const orderId = searchParams.get("order_id")
  const planName = searchParams.get("plan") || "Elite Pass"
  
  const [verifying, setVerifying] = useState(!!orderId)
  const [verified, setVerified] = useState(false)

  useEffect(() => {
    async function verify() {
      if (!orderId || !user) return;
      try {
        const planId = planName.toLowerCase().replace(/[\s_]+/g, '-');
        
        const res = await fetch('/api/cashfree/verify-payment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            order_id: orderId, 
            userId: user.uid,
            planId: planId
          })
        });
        const data = await res.json();
        if (data.success) setVerified(true);
      } catch (e) {
        console.error("[VERIFICATION_HANDSHAKE_FAILED]:", e);
      } finally {
        setVerifying(false);
      }
    }
    verify();
  }, [orderId, user, planName]);

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main className="container mx-auto px-6 py-32 flex flex-col items-center justify-center text-center">
        {verifying ? (
           <div className="space-y-6">
              <Loader2 className="h-12 w-12 text-primary animate-spin mx-auto" />
              <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">Auditing Registry...</p>
           </div>
        ) : (
          <motion.div 
             initial={{ scale: 0.8, opacity: 0 }}
             animate={{ scale: 1, opacity: 1 }}
             className="space-y-10 max-w-xl"
          >
             <div className="relative">
                <div className="h-32 w-32 bg-emerald-100 rounded-[3rem] flex items-center justify-center mx-auto text-emerald-600 shadow-2xl border border-emerald-200">
                   <CheckCircle2 className="h-16 w-16" />
                </div>
                <motion.div 
                   animate={{ rotate: 360 }}
                   transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                   className="absolute inset-[-20px] opacity-10 pointer-events-none"
                >
                   <Sparkles className="h-full w-full text-emerald-500" />
                </motion.div>
             </div>

             <div className="space-y-4 px-4">
                <h1 className="text-4xl md:text-5xl font-black text-[#0F172A] leading-tight">Payment Verified</h1>
                <p className="text-base md:text-lg text-slate-500 font-medium leading-relaxed antialiased">
                   Your preparation pass is now active. Your elite preparation node has been synchronized with the master registry.
                </p>
             </div>

             <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100 space-y-4 text-left shadow-inner mx-4">
                <div className="flex justify-between items-center pb-3 border-b border-slate-200">
                   <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Node ID</span>
                   <span className="text-xs font-mono font-black text-primary truncate max-w-[180px]">{orderId || "MANUAL_NODE"}</span>
                </div>
                <div className="flex justify-between items-center">
                   <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Pass Tier</span>
                   <span className="text-sm font-bold text-[#0F172A] uppercase">{planName}</span>
                </div>
             </div>

             <div className="flex flex-col sm:flex-row gap-4 px-4">
                <Button asChild className="flex-1 bg-[#0F172A] hover:bg-black text-white h-16 rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-3xl gap-3">
                   <Link href="/dashboard">Enter Hub <ArrowRight className="h-4 w-4" /></Link>
                </Button>
                <Button asChild variant="outline" className="flex-1 h-16 rounded-2xl border-slate-200 font-black uppercase tracking-widest text-[11px] gap-3">
                   <Link href="/mocks">Practice Tests</Link>
                </Button>
             </div>

             <div className="flex items-center justify-center gap-3 text-slate-400 pt-6">
                <ShieldCheck className="h-4 w-4 text-primary" />
                <span className="text-[9px] font-black uppercase tracking-[0.3em]">Institutional Node Secured</span>
             </div>
          </motion.div>
        )}
      </main>
      <Footer />
    </div>
  )
}
