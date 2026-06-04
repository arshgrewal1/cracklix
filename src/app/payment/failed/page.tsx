
"use client"

import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import { Button } from "@/components/ui/button"
import { XCircle, RefreshCw, ChevronLeft, ShieldAlert } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"

export default function PaymentFailed() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main className="container mx-auto px-6 py-32 flex flex-col items-center justify-center text-center">
        <motion.div 
           initial={{ scale: 0.8, opacity: 0 }}
           animate={{ scale: 1, opacity: 1 }}
           className="space-y-10 max-w-xl"
        >
           <div className="h-32 w-32 bg-rose-100 rounded-[3rem] flex items-center justify-center mx-auto text-rose-600 shadow-2xl">
              <XCircle className="h-16 w-16" />
           </div>

           <div className="space-y-4">
              <h1 className="text-5xl font-headline font-black text-[#0F172A] uppercase">Payment Failed</h1>
              <p className="text-lg text-slate-500 font-medium leading-relaxed">
                 The transaction was declined by the gateway or interrupted by a synchronization error. No funds were captured.
              </p>
           </div>

           <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild className="flex-1 bg-primary hover:bg-orange-600 text-white h-16 rounded-2xl font-black uppercase tracking-widest text-xs shadow-2xl gap-3">
                 <Link href="/checkout?plan=gold"><RefreshCw className="h-4 w-4" /> Try Again</Link>
              </Button>
              <Button asChild variant="outline" className="flex-1 h-16 rounded-2xl border-slate-200 font-black uppercase tracking-widest text-xs gap-3">
                 <Link href="/pass"><ChevronLeft className="h-4 w-4" /> Back to Pricing</Link>
              </Button>
           </div>

           <div className="bg-amber-50 border border-amber-100 p-8 rounded-[2.5rem] flex items-start gap-4 text-left">
              <ShieldAlert className="h-6 w-6 text-amber-600 shrink-0" />
              <p className="text-xs text-amber-800 font-medium leading-relaxed">
                 If money was deducted from your account, please contact <strong>cracklixhelp@gmail.com</strong> with your transaction ID. Refund nodes are audited within 24 hours.
              </p>
           </div>
        </motion.div>
      </main>
      <Footer />
    </div>
  )
}
