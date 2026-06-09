
"use client"

import { useSearchParams, useRouter } from "next/navigation"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ShieldCheck, Lock, ArrowLeft, Loader2, QrCode, CheckCircle2, Gem, Copy, Download, Zap, CreditCard, Globe } from "lucide-react"
import { useUser, useDoc, useFirestore } from "@/firebase"
import { useEffect, useState, Suspense, useMemo } from "react"
import { useToast } from "@/hooks/use-toast"
import { submitManualPayment } from "@/app/actions/payment"
import { doc } from "firebase/firestore"
import Script from "next/script"

/**
 * @fileOverview Institutional Checkout Hub v50.0.
 * UPDATED: Integrated Razorpay Secure Online Gateway alongside Manual Node.
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
  const planId = searchParams.get("plan") || ""
  const { user, profile, loading } = useUser()
  const db = useFirestore()
  const { toast } = useToast()
  
  const [processing, setProcessing] = useState(false)
  const [onlineProcessing, setOnlineProcessing] = useState(false)
  const [utr, setUtr] = useState("")

  const { data: settings } = useDoc<any>(useMemo(() => (db ? doc(db, 'settings', 'global') : null), [db]));
  const { data: planData, loading: planLoading } = useDoc<any>(useMemo(() => (db && planId ? doc(db, 'passes', planId) : null), [db, planId]));

  useEffect(() => {
    if (!loading && !user) router.push("/login")
  }, [user, loading, router])

  const upiId = settings?.upiId || "arshdeepgrewal1122-1@oksbi";
  const upiLink = `upi://pay?pa=${upiId}&pn=Cracklix&am=${planData?.price || 0}&cu=INR`;
  const qrUrl = settings?.qrCodeUrl || `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(upiLink)}`;

  const handleCopyUPI = () => {
    navigator.clipboard.writeText(upiId);
    toast({ title: "UPI ID Copied" });
  };

  const handleRazorpayPayment = async () => {
    if (!user || !profile || !planData || onlineProcessing) return;

    setOnlineProcessing(true);
    try {
      // 1. Create Order Hub
      const orderRes = await fetch('/api/razorpay/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId, userId: user.uid })
      });

      const orderData = await orderRes.json();
      if (orderData.error) throw new Error(orderData.error);

      // 2. Launch Gateway Modal
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID, 
        amount: orderData.amount,
        currency: orderData.currency,
        name: "CRACKLIX",
        description: `${planData.name} Preparation Node`,
        order_id: orderData.orderId,
        handler: async function (response: any) {
          try {
            const verifyRes = await fetch('/api/razorpay/verify-payment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                ...response,
                userId: user.uid,
                planId: planId
              })
            });

            const verifyData = await verifyRes.json();
            if (verifyData.success) {
              toast({ title: "Payment Verified", description: "Elite Pass activated instantly." });
              router.push("/payment/success?plan=" + planData.name);
            } else {
              throw new Error(verifyData.error || "Verification failed");
            }
          } catch (e: any) {
            toast({ variant: "destructive", title: "Audit Failed", description: e.message });
            router.push("/payment/failed");
          }
        },
        prefill: {
          name: profile.name,
          email: user.email,
          contact: profile.phone
        },
        theme: { color: "#F97316" }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (e: any) {
      toast({ variant: "destructive", title: "Gateway Error", description: e.message });
    } finally {
      setOnlineProcessing(false);
    }
  };

  const handleManualPayment = async () => {
    if (!user || !profile || !planData) return
    if (!utr || utr.length < 10) {
       toast({ variant: "destructive", title: "UTR Invalid", description: "Please enter the 12-digit transaction ID." })
       return
    }

    setProcessing(true)
    try {
       await submitManualPayment({
          userId: user.uid,
          userEmail: user.email || '',
          userName: profile.name,
          planId: planId,
          transactionId: utr
       })
       toast({ title: "Registry Synced", description: "Admin will verify your payment node within 24 hours." })
       router.push("/dashboard")
    } catch (e: any) {
       toast({ variant: "destructive", title: "Submission Failed" })
    } finally {
       setProcessing(false)
    }
  }

  if (planLoading) return <div className="h-screen flex items-center justify-center bg-white"><Loader2 className="h-10 w-10 text-primary animate-spin" /></div>
  if (!planData) return <div className="h-screen flex items-center justify-center bg-slate-50 text-slate-400 font-black uppercase tracking-widest text-xs">Registry Node Not Found</div>

  return (
    <div className="min-h-screen bg-slate-50/50 font-body">
      <Navbar />
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      
      <main className="container mx-auto px-4 md:px-6 py-12 md:py-24 max-w-5xl">
        <div className="flex items-center gap-6 mb-12">
           <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-2xl h-14 w-14 border border-slate-200 bg-white shadow-sm">
             <ArrowLeft className="h-6 w-6 text-[#0F172A]" />
           </Button>
           <div className="text-left">
              <h1 className="text-4xl font-headline font-black text-[#0F172A] uppercase tracking-tight">Final Registry Audit</h1>
              <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-1 text-left">Secure Payment Gateway Hub</p>
           </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 md:gap-16 text-left">
           <div className="lg:col-span-7 space-y-10">
              
              {/* ONLINE GATEWAY NODE */}
              <Card className="border-none shadow-5xl rounded-[3rem] bg-[#0F172A] text-white overflow-hidden group">
                 <CardHeader className="p-10 pb-4">
                    <div className="flex items-center gap-4 mb-2">
                       <CreditCard className="h-6 w-6 text-primary" />
                       <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Recommended Gateway</span>
                    </div>
                    <CardTitle className="font-headline font-black text-2xl uppercase">Secure Online Payment</CardTitle>
                    <CardDescription className="text-slate-400 font-medium">Instant pass activation via Cards, UPI, or Netbanking.</CardDescription>
                 </CardHeader>
                 <CardContent className="p-10 pt-4">
                    <Button 
                      onClick={handleRazorpayPayment}
                      disabled={onlineProcessing}
                      className="w-full h-20 bg-primary hover:bg-orange-600 text-white font-black uppercase tracking-[0.2em] text-[11px] rounded-2xl shadow-3xl shadow-primary/20 transition-all active:scale-95 border-none gap-4"
                    >
                       {onlineProcessing ? <Loader2 className="h-6 w-6 animate-spin" /> : <Zap className="h-6 w-6 fill-current" />}
                       PAY SECURELY NOW
                    </Button>
                    <div className="mt-8 flex items-center justify-center gap-6 opacity-40">
                       <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" className="h-4 grayscale invert" alt="PP" />
                       <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" className="h-6 grayscale" alt="MC" />
                       <img src="https://upload.wikimedia.org/wikipedia/commons/d/d1/Visa_2014_logo_detail.svg" className="h-3 grayscale invert" alt="VI" />
                    </div>
                 </CardContent>
              </Card>

              {/* MANUAL HUB NODE */}
              <Card className="border-none shadow-3xl rounded-[3rem] bg-white overflow-hidden opacity-80 hover:opacity-100 transition-opacity">
                 <CardHeader className="p-10 bg-slate-50/50 border-b border-slate-100">
                    <div className="flex items-center gap-4 mb-2">
                       <QrCode className="h-5 w-5 text-slate-400" />
                       <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Alternative Node</span>
                    </div>
                    <CardTitle className="font-headline font-black text-xl uppercase text-[#0F172A]">Manual UPI Submission</CardTitle>
                 </CardHeader>
                 <CardContent className="p-10 space-y-10">
                    <div className="flex flex-col items-center gap-10">
                       <div className="h-48 w-48 bg-white rounded-3xl border-2 border-slate-50 flex items-center justify-center p-4 shadow-xl relative group overflow-hidden">
                          <img src={qrUrl} alt="Audit QR" className="w-full h-full object-contain" />
                       </div>
                       
                       <div className="w-full space-y-4">
                          <div className="p-5 bg-slate-900 rounded-2xl border border-white/5 flex items-center justify-between shadow-2xl">
                             <div className="min-w-0 flex-1">
                                <p className="text-[8px] font-black text-primary uppercase tracking-widest mb-1">Institutional UPI ID</p>
                                <p className="text-base font-black text-white truncate">{upiId}</p>
                             </div>
                             <Button size="icon" variant="ghost" onClick={handleCopyUPI} className="text-primary hover:bg-white/10 rounded-xl"><Copy className="h-5 w-5" /></Button>
                          </div>
                       </div>
                    </div>

                    <div className="space-y-4 pt-8 border-t border-slate-100">
                       <div className="space-y-2">
                          <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">UTR / 12-Digit Transaction ID</Label>
                          <Input 
                            value={utr}
                            onChange={e => setUtr(e.target.value.replace(/\D/g, '').slice(0,12))}
                            placeholder="Enter 12-digit number" 
                            className="h-14 rounded-xl border-slate-200 bg-slate-50 font-black text-xl tracking-widest text-[#0F172A] text-center" 
                          />
                       </div>
                       <Button 
                          onClick={handleManualPayment}
                          disabled={processing}
                          className="w-full h-14 bg-slate-200 hover:bg-slate-300 text-slate-600 font-black uppercase tracking-widest text-[10px] rounded-2xl transition-all border-none gap-3"
                       >
                          {processing ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
                          Submit Manual Proof
                       </Button>
                    </div>
                 </CardContent>
              </Card>
           </div>

           <div className="lg:col-span-5 space-y-8">
              <Card className="border-none shadow-5xl rounded-[3.5rem] bg-[#0B1528] text-white p-10 md:p-14 overflow-hidden relative">
                 <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12 group-hover:scale-110 transition-transform duration-[3000ms]"><Gem className="h-48 w-48" /></div>
                 <div className="relative z-10 space-y-12">
                    <div className="space-y-2 text-center">
                       <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Plan Node Registry</p>
                       <h3 className="text-3xl md:text-5xl font-headline font-black uppercase leading-tight">{planData.name}</h3>
                    </div>
                    
                    <div className="space-y-5 pt-8 border-t border-white/5">
                       <div className="flex justify-between items-center text-sm font-bold text-slate-400 uppercase tracking-widest">
                          <span>Institutional Fee</span>
                          <span className="text-white font-black">₹{planData.price}</span>
                       </div>
                       <div className="flex justify-between items-center pt-8 border-t border-white/5">
                          <span className="text-xl font-headline font-black uppercase">Grand Total</span>
                          <span className="text-5xl font-black text-primary tracking-tighter tabular-nums">₹{planData.price}</span>
                       </div>
                    </div>
                 </div>
              </Card>

              <div className="p-8 bg-white rounded-[2.5rem] border border-slate-100 shadow-xl flex items-start gap-4">
                 <Lock className="h-5 w-5 text-slate-300 shrink-0 mt-1" />
                 <p className="text-[10px] font-bold text-slate-500 leading-relaxed uppercase">
                    Your transaction node is audited via PCI-DSS compliant secure gateways. All data is encrypted with SSL/TLS protocols.
                 </p>
              </div>
           </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
