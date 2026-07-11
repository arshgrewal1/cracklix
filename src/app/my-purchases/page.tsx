"use client"

import React, { useMemo, useState, useEffect } from "react"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import { useUser, useCollection, useFirestore } from "@/firebase"
import { collection, query, where, orderBy } from "firebase/firestore"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  CreditCard, 
  ChevronRight, 
  Download, 
  Zap, 
  Calendar, 
  ShieldCheck, 
  Gem, 
  History,
  Clock,
  ArrowRight,
  AlertCircle
} from "lucide-react"
import Link from "next/link"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

/**
 * @fileOverview Official Student Purchase Center v1.0.
 * Tracks active batches, subscription lifecycle and invoices.
 */

export default function MyPurchasesPage() {
  const { user, loading: authLoading } = useUser()
  const db = useFirestore()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const subsQuery = useMemo(() => {
    if (!db || !user) return null
    return query(collection(db, "subscriptions"), where("userId", "==", user.uid))
  }, [db, user])

  const { data: rawSubs, loading } = useCollection<any>(subsQuery)

  const sortedSubs = useMemo(() => {
    if (!rawSubs) return []
    return [...rawSubs].sort((a, b) => new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime())
  }, [rawSubs])

  const activeSub = useMemo(() => {
    return sortedSubs.find(s => s.status === 'ACTIVE' && new Date(s.expiryDate) > new Date())
  }, [sortedSubs])

  if (!mounted || authLoading) return <div className="h-screen w-full flex items-center justify-center bg-white"><Zap className="h-8 w-8 text-primary animate-pulse" /></div>

  return (
    <div className="min-h-screen bg-slate-50/50 font-body text-left">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8 md:py-16 max-w-6xl space-y-12 pb-40">
        
        <header className="space-y-2">
           <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-inner shrink-0">
                 <CreditCard className="h-5 w-5" />
              </div>
              <h1 className="text-3xl md:text-5xl font-black text-[#0F172A] tracking-tight">My Purchases</h1>
           </div>
           <p className="text-slate-500 font-medium text-sm md:text-lg">Track your active batches and billing history.</p>
        </header>

        {activeSub ? (
          <section className="space-y-6">
             <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">Active Batch</h3>
             <Card className="border-none shadow-xl rounded-[2.5rem] bg-[#0B1528] text-white p-6 md:p-12 overflow-hidden relative group border border-white/5">
                <div className="absolute top-0 right-0 p-12 opacity-5 rotate-12 group-hover:scale-110 transition-transform duration-1000">
                   <Gem className="h-64 w-64" />
                </div>
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
                   <div className="space-y-6 flex-1 w-full text-center md:text-left">
                      <div className="flex items-center justify-center md:justify-start gap-4">
                         <Badge className="bg-emerald-500 text-white border-none font-bold text-[10px] px-3 py-1 rounded-full uppercase tracking-widest shadow-lg">Active</Badge>
                         <span className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em]">Verified Registry Node</span>
                      </div>
                      <h2 className="text-3xl md:text-5xl font-black leading-tight tracking-tight uppercase">{activeSub.planName}</h2>
                      <div className="grid grid-cols-2 gap-8 max-w-md mx-auto md:mx-0 pt-4">
                         <div className="space-y-1">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Valid Until</p>
                            <p className="text-lg font-bold">{new Date(activeSub.expiryDate).toLocaleDateString('en-GB')}</p>
                         </div>
                         <div className="space-y-1 text-left">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Days Left</p>
                            <p className="text-lg font-bold text-emerald-400">
                               {Math.max(0, Math.ceil((new Date(activeSub.expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))} Days
                            </p>
                         </div>
                      </div>
                   </div>
                   <div className="shrink-0 w-full md:w-auto">
                      <Button asChild className="h-16 px-12 bg-primary hover:bg-blue-700 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-2xl border-none active:scale-95 transition-all">
                         <Link href="/mocks">Continue Learning <ChevronRight className="h-4 w-4 ml-2" /></Link>
                      </Button>
                   </div>
                </div>
             </Card>
          </section>
        ) : !loading && (
          <Card className="p-12 text-center bg-white rounded-[2.5rem] border border-slate-100 shadow-xl space-y-6">
             <div className="h-16 w-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto text-slate-300">
                <AlertCircle className="h-8 w-8" />
             </div>
             <div className="space-y-2">
                <h3 className="text-2xl font-black text-[#0F172A]">No Active Batch</h3>
                <p className="text-slate-500 max-w-sm mx-auto font-medium">You don&apos;t have an active premium pass. Upgrade to unlock all tests.</p>
             </div>
             <Button asChild className="h-14 px-10 bg-primary text-white rounded-full">
                <Link href="/pass">Browse Plans <ArrowRight className="h-4 w-4 ml-2" /></Link>
             </Button>
          </Card>
        )}

        <section className="space-y-8">
           <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="text-xl font-bold flex items-center gap-3">
                 <History className="h-5 w-5 text-slate-400" /> Payment History
              </h3>
           </div>

           <div className="grid grid-cols-1 gap-4">
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-32 w-full rounded-2xl" />)
              ) : sortedSubs.length > 0 ? (
                sortedSubs.map((sub: any) => (
                  <Card key={sub.id} className="border border-slate-100 shadow-sm rounded-2xl bg-white group hover:shadow-md transition-all overflow-hidden">
                     <CardContent className="p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-6 flex-1 w-full">
                           <div className="h-12 w-12 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 shadow-inner shrink-0">
                              <ShieldCheck className="h-6 w-6" />
                           </div>
                           <div className="min-w-0 text-left">
                              <h4 className="font-bold text-[#0F172A] text-lg uppercase truncate">{sub.planName}</h4>
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight mt-1 flex items-center gap-3">
                                 <span>{new Date(sub.purchaseDate).toLocaleDateString('en-GB')}</span>
                                 <span className="w-1 h-1 rounded-full bg-slate-200" />
                                 <span>UTR: {sub.paymentId?.slice(-12)}</span>
                              </p>
                           </div>
                        </div>

                        <div className="flex items-center justify-between md:justify-end gap-10 w-full md:w-auto shrink-0">
                           <div className="text-left md:text-right space-y-1">
                              <p className="text-xl font-black text-[#0F172A] tabular-nums">₹{sub.amount}</p>
                              <Badge className={cn(
                                "border-none text-[8px] font-black uppercase px-2 py-0.5 rounded",
                                sub.status === 'ACTIVE' ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-400"
                              )}>{sub.status}</Badge>
                           </div>
                           <Button variant="ghost" className="h-12 w-12 rounded-xl bg-slate-50 hover:bg-primary/5 hover:text-primary transition-all shadow-sm">
                              <Download className="h-5 w-5" />
                           </Button>
                        </div>
                     </CardContent>
                  </Card>
                ))
              ) : (
                <div className="py-20 text-center opacity-30 italic font-medium text-slate-400">No payment records found.</div>
              )}
           </div>
        </section>

      </main>
      <Footer />
    </div>
  )
}
