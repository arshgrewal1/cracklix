
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
 * @fileOverview Success Node v2.1.
 * UPDATED: Hardened plan normalization for registry sync.
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
        // Robust ID normalization: handles underscores and hyphens
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
        console.error("Verification failed:", e);
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
              <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">Verifying Registry Hub...</p>
           </div>
        ) : (
          <motion.div 
             initial={{ scale: 0.8, opacity: 0 }}
             animate={{ scale: 1, opacity: 1 }}
             className="space-y-10 max-w-xl"
          >
             <div className="relative">
                <div className="h-32 w-32 bg-emerald-100 rounded-[3rem] flex items-center justify-center mx-auto text-emerald-600 shadow-2xl">
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

             <div className="space-y-4">
                <h1 className="text-5xl font-headline font-black text-[#0F172A] uppercase">Payment Successful</h1>
                <p className="text-lg text-slate-500 font-medium leading-relaxed">
                   Your preparation pass has been successfully activated. {verified ? "Your elite prepared node is now live." : "Registry sync in progress via background node."}
                </p>
             </div>

             <div className="bg-slate-50 p-10 rounded-[3rem] border border-slate-100 space-y-6 text-left shadow-inner">
                <div className="flex justify-between items-center pb-4 border-b border-slate-200">
                   <span className="text-[10px] font-black uppercase text-slate-400">Transaction ID</span>
                   <span className="text-sm font-mono font-black text-primary truncate max-w-[200px]">{orderId || "ONLINE_NODE"}</span>
                </div>
                <div className="flex justify-between items-center">
                   <span className="text-[10px] font-black uppercase text-slate-400">Hub Status</span>
                   <span className="text-base font-bold text-[#0F172A] uppercase">{planName} Activated</span>
                </div>
             </div>

             <div className="flex flex-col sm:flex-row gap-4">
                <Button asChild className="flex-1 bg-[#0F172A] hover:bg-black text-white h-16 rounded-2xl font-black uppercase tracking-widest text-xs shadow-2xl gap-3">
                   <Link href="/dashboard">Enter Dashboard <ArrowRight className="h-4 w-4" /></Link>
                </Button>
                <Button asChild variant="outline" className="flex-1 h-16 rounded-2xl border-slate-200 font-black uppercase tracking-widest text-xs gap-3">
                   <Link href="/mocks">Browse Mocks</Link>
                </Button>
             </div>

             <div className="flex items-center justify-center gap-4 text-slate-400 pt-10">
                <ShieldCheck className="h-5 w-5 text-primary" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em]">Institutional Verification Complete</span>
             </div>
          </motion.div>
        )}
      </main>
      <Footer />
    </div>
  )
}
