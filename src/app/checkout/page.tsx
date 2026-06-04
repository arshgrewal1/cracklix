
"use client"

import { useSearchParams, useRouter } from "next/navigation"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ShieldCheck, Lock, CreditCard, ChevronRight, Zap, ArrowLeft, Loader2, Sparkles, AlertCircle } from "lucide-react"
import { useUser } from "@/firebase"
import { useEffect, useState, Suspense } from "react"
import { useToast } from "@/hooks/use-toast"
import { createRazorpayOrder, verifyRazorpayPayment } from "@/app/actions/payment"
import Script from "next/script"

/**
 * @fileOverview Institutional Production Checkout Node.
 * Integrates Razorpay SDK with secure Server Action verification.
 */

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

  const handlePayment = async () => {
    if (!user) return
    if (planData.price === 0) {
       toast({ title: "Free Tier Active", description: "You are already on the basic institutional tier." })
       return
    }

    setProcessing(true)

    try {
      // 1. Create Order on Server
      const order = await createRazorpayOrder(planId)

      // 2. Initialize Razorpay Checkout
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: "Cracklix Authority",
        description: `Upgrade to ${order.planName}`,
        image: "https://cracklix.com/logo.png",
        order_id: order.orderId,
        handler: async function (response: any) {
          // 3. Verify Payment on Server
          try {
             await verifyRazorpayPayment({
                orderId: order.orderId,
                paymentId: response.razorpay_payment_id,
                signature: response.razorpay_signature,
                userId: user.uid,
                userEmail: user.email || '',
                planId: order.planId
             })
             toast({ title: "Pass Activated", description: "Your institutional access has been upgraded." })
             router.push("/payment/success?plan=" + planId)
          } catch (err: any) {
             toast({ variant: "destructive", title: "Verification Failed", description: err.message })
             router.push("/payment/failed")
          }
        },
        prefill: {
          name: profile?.name || user.displayName || "",
          email: user.email || "",
          contact: profile?.phone || "",
        },
        theme: {
          color: "#0F172A",
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on('payment.failed', function (response: any) {
         toast({ variant: "destructive", title: "Payment Failed", description: response.error.description })
         router.push("/payment/failed")
      });
      rzp.open();

    } catch (e: any) {
      toast({ variant: "destructive", title: "Order Failed", description: e.message })
    } finally {
      setProcessing(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50/50">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      <Navbar />
      <main className="container mx-auto px-6 py-24 max-w-4xl">
        <div className="flex items-center gap-6 mb-12">
           <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-2xl h-14 w-14 border border-slate-200 bg-white shadow-sm">
             <ArrowLeft className="h-6 w-6 text-[#0F172A]" />
           </Button>
           <div className="text-left">
              <h1 className="text-4xl font-headline font-black text-[#0F172A] uppercase">Secure Checkout</h1>
              <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-1 text-left">Gateway Verification Node</p>
           </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 text-left">
           <div className="lg:col-span-7 space-y-8">
              <Card className="border-none shadow-3xl shadow-slate-900/5 rounded-[3rem] bg-white overflow-hidden">
                 <CardHeader className="p-12 border-b border-slate-50 bg-slate-50/50 text-left">
                    <CardTitle className="font-headline font-black text-2xl text-[#0F172A] uppercase flex items-center gap-4">
                       <CreditCard className="h-6 w-6 text-primary" /> Authority Billing
                    </CardTitle>
                 </CardHeader>
                 <CardContent className="p-12 space-y-8">
                    <div className="p-8 rounded-[2rem] border-2 border-primary bg-primary/5 flex items-center justify-between group cursor-pointer shadow-xl" onClick={handlePayment}>
                       <div className="flex items-center gap-6">
                          <div className="h-14 w-14 rounded-2xl bg-white flex items-center justify-center shadow-sm">
                             <Zap className="h-7 w-7 text-primary fill-current" />
                          </div>
                          <div className="text-left">
                             <p className="font-black text-[#0F172A] uppercase tracking-tight text-left">UPI / QR / Cards</p>
                             <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest text-left">Trusted Razorpay Gateway</p>
                          </div>
                       </div>
                       <div className="h-6 w-6 rounded-full border-4 border-primary bg-white" />
                    </div>

                    <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 flex items-start gap-4">
                       <AlertCircle className="h-5 w-5 text-slate-400 shrink-0 mt-0.5" />
                       <p className="text-[11px] text-slate-500 leading-relaxed">
                          Payments are processed securely via SSL. Your data is encrypted and never stored on our local registry.
                       </p>
                    </div>
                 </CardContent>
              </Card>

              <div className="bg-emerald-50 border border-emerald-100 p-8 rounded-[2.5rem] flex items-center gap-6 shadow-sm">
                 <ShieldCheck className="h-10 w-10 text-emerald-600 shrink-0" />
                 <p className="text-sm font-bold text-emerald-800 leading-relaxed italic antialiased text-left">
                   "Arsh Grewal Management guarantees 100% refund for failed audits or technical synchronization errors."
                 </p>
              </div>
           </div>

           <div className="lg:col-span-5 space-y-8">
              <Card className="border-none shadow-4xl rounded-[3rem] bg-[#0F172A] text-white p-12 overflow-hidden relative">
                 <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12"><Sparkles className="h-40 w-40" /></div>
                 <div className="relative z-10 space-y-10">
                    <div className="space-y-1 text-center">
                       <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Aspirant Pass</p>
                       <h3 className="text-3xl font-headline font-black uppercase">{planData.name}</h3>
                    </div>
                    
                    <div className="space-y-4 pt-4 border-t border-white/5">
                       <div className="flex justify-between items-center text-sm font-bold text-slate-400">
                          <span>Audit Fee</span>
                          <span className="text-white">₹{planData.price}</span>
                       </div>
                       <div className="flex justify-between items-center text-sm font-bold text-slate-400">
                          <span>Verification Fee</span>
                          <span className="text-emerald-500">FREE</span>
                       </div>
                       <div className="flex justify-between items-center pt-6 border-t border-white/5">
                          <span className="text-xl font-headline font-black uppercase">Grand Total</span>
                          <span className="text-3xl font-black text-primary">₹{planData.price}</span>
                       </div>
                    </div>

                    <Button 
                      disabled={processing}
                      onClick={handlePayment}
                      className="w-full h-20 bg-primary hover:bg-orange-600 text-white font-black uppercase tracking-[0.2em] text-xs rounded-2xl shadow-3xl shadow-primary/20 gap-4"
                    >
                       {processing ? <Loader2 className="h-5 w-5 animate-spin" /> : <Lock className="h-5 w-5" />}
                       {processing ? 'Connecting Gateway...' : 'Pay with Razorpay'}
                    </Button>

                    <p className="text-[9px] text-center text-slate-500 font-black uppercase tracking-[0.2em]">
                       Instant Activation Protocol Enabled
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
