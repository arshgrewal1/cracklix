
"use client"

import { useSearchParams, useRouter } from "next/navigation"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ShieldCheck, Lock, CreditCard, ChevronRight, Zap, ArrowLeft, Loader2, Sparkles } from "lucide-react"
import { useUser, useFirestore } from "@/firebase"
import { useEffect, useState, Suspense } from "react"
import { doc, setDoc, addDoc, collection, serverTimestamp } from "firebase/firestore"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="h-screen flex items-center justify-center bg-white"><Loader2 className="h-10 w-10 text-primary animate-spin" /></div>}>
      <CheckoutContent />
    </Suspense>
  )
}

function CheckoutContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const planId = searchParams.get("plan") || "gold"
  const { user, profile, loading } = useUser()
  const { toast } = useToast()
  const db = useFirestore()
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    if (!loading && !user) router.push("/login")
  }, [user, loading, router])

  const planData = {
    free: { id: 'free', name: "Aspirant Free", price: 0, tier: 'Free' },
    silver: { id: 'silver', name: "Silver Pass", price: 99, tier: 'Silver' },
    gold: { id: 'gold', name: "Gold Pass", price: 199, tier: 'Gold' },
    premium: { id: 'premium', name: "Elite Pass", price: 499, tier: 'Premium' }
  }[planId] || { id: 'gold', name: "Gold Pass", price: 199, tier: 'Gold' }

  const handleSimulatePayment = async () => {
    if (!user || !db) return
    setProcessing(true)
    
    // In Phase 2, integrate Razorpay here
    // Currently simulating high-fidelity payment & activation cycle
    setTimeout(async () => {
      try {
        // 1. Log the Order
        const orderRef = await addDoc(collection(db, "orders"), {
          userId: user.uid,
          planId: planData.id,
          amount: planData.price,
          currency: "INR",
          status: "success",
          createdAt: serverTimestamp()
        })

        // 2. Activate Subscription
        await addDoc(collection(db, "subscriptions"), {
          userId: user.uid,
          planId: planData.id,
          status: "active",
          startDate: serverTimestamp(),
          expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 Days
        })

        // 3. Update User Profile Status
        const userRef = doc(db, "users", user.uid)
        await setDoc(userRef, { 
          status: planData.tier, 
          updatedAt: serverTimestamp() 
        }, { merge: true })
        
        toast({ title: "Pass Activated", description: `You have successfully upgraded to ${planData.name}.` })
        router.push("/dashboard")
      } catch (e) {
        toast({ variant: "destructive", title: "Sync Failed", description: "Could not finalize institutional activation." })
      } finally {
        setProcessing(false)
      }
    }, 2000)
  }

  return (
    <div className="min-h-screen bg-slate-50/50">
      <Navbar />
      <main className="container mx-auto px-6 py-24 max-w-4xl">
        <div className="flex items-center gap-6 mb-12">
           <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-2xl h-14 w-14 border border-slate-200 bg-white shadow-sm">
             <ArrowLeft className="h-6 w-6 text-[#0F172A]" />
           </Button>
           <div className="text-left">
              <h1 className="text-4xl font-headline font-black text-[#0F172A] uppercase">Audit Checkout</h1>
              <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-1 text-left">Finalizing Institutional Node Access</p>
           </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 text-left">
           <div className="lg:col-span-7 space-y-8">
              <Card className="border-none shadow-3xl shadow-slate-900/5 rounded-[3rem] bg-white overflow-hidden">
                 <CardHeader className="p-12 border-b border-slate-50 bg-slate-50/50 text-left">
                    <CardTitle className="font-headline font-black text-2xl text-[#0F172A] uppercase flex items-center gap-4">
                       <CreditCard className="h-6 w-6 text-primary" /> Payment Method
                    </CardTitle>
                 </CardHeader>
                 <CardContent className="p-12 space-y-8">
                    <div className="p-8 rounded-[2rem] border-2 border-primary bg-primary/5 flex items-center justify-between group cursor-pointer shadow-xl" onClick={handleSimulatePayment}>
                       <div className="flex items-center gap-6">
                          <div className="h-14 w-14 rounded-2xl bg-white flex items-center justify-center shadow-sm">
                             <Zap className="h-7 w-7 text-primary fill-current" />
                          </div>
                          <div className="text-left">
                             <p className="font-black text-[#0F172A] uppercase tracking-tight text-left">UPI / QR Scan</p>
                             <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest text-left">Powered by Razorpay Simulation</p>
                          </div>
                       </div>
                       <div className="h-6 w-6 rounded-full border-4 border-primary bg-white" />
                    </div>

                    <div className="p-8 rounded-[2rem] border border-slate-100 bg-slate-50 flex items-center justify-between opacity-50 cursor-not-allowed">
                       <div className="flex items-center gap-6">
                          <div className="h-14 w-14 rounded-2xl bg-white flex items-center justify-center shadow-sm">
                             <CreditCard className="h-7 w-7 text-slate-400" />
                          </div>
                          <div className="text-left">
                             <p className="font-black text-slate-400 uppercase tracking-tight text-left">Card / NetBanking</p>
                             <p className="text-[10px] text-slate-300 font-bold uppercase tracking-widest text-left">Maintenance Window</p>
                          </div>
                       </div>
                    </div>
                 </CardContent>
              </Card>

              <div className="bg-emerald-50 border border-emerald-100 p-8 rounded-[2.5rem] flex items-center gap-6 shadow-sm">
                 <ShieldCheck className="h-10 w-10 text-emerald-600 shrink-0" />
                 <p className="text-sm font-bold text-emerald-800 leading-relaxed italic antialiased text-left">
                   "Your transaction is encrypted using institutional-grade SSL standards. Arsh Grewal Management guarantees 100% security for all aspirant nodes."
                 </p>
              </div>
           </div>

           <div className="lg:col-span-5 space-y-8">
              <Card className="border-none shadow-4xl rounded-[3rem] bg-[#0F172A] text-white p-12 overflow-hidden relative">
                 <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12"><Sparkles className="h-40 w-40" /></div>
                 <div className="relative z-10 space-y-10">
                    <div className="space-y-1 text-center">
                       <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Summary Node</p>
                       <h3 className="text-3xl font-headline font-black uppercase">{planData.name}</h3>
                    </div>
                    
                    <div className="space-y-4 pt-4 border-t border-white/5">
                       <div className="flex justify-between items-center text-sm font-bold text-slate-400">
                          <span>Base Audit Fee</span>
                          <span className="text-white">₹{planData.price}</span>
                       </div>
                       <div className="flex justify-between items-center text-sm font-bold text-slate-400">
                          <span>Platform Maintenance</span>
                          <span className="text-emerald-500">FREE</span>
                       </div>
                       <div className="flex justify-between items-center pt-6 border-t border-white/5">
                          <span className="text-xl font-headline font-black uppercase">Grand Total</span>
                          <span className="text-3xl font-black text-primary">₹{planData.price}</span>
                       </div>
                    </div>

                    <Button 
                      disabled={processing}
                      onClick={handleSimulatePayment}
                      className="w-full h-20 bg-primary hover:bg-orange-600 text-white font-black uppercase tracking-[0.2em] text-xs rounded-2xl shadow-3xl shadow-primary/20 gap-4"
                    >
                       {processing ? <Loader2 className="h-5 w-5 animate-spin" /> : <Lock className="h-5 w-5" />}
                       {processing ? 'Transmitting Data...' : 'Initiate Secure Payment'}
                    </Button>

                    <p className="text-[9px] text-center text-slate-500 font-black uppercase tracking-[0.2em]">
                       Validity: 30 Days Audit Cycle
                    </p>
                 </div>
              </Card>
           </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
