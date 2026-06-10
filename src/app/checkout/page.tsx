
"use client"

import { useSearchParams, useRouter } from "next/navigation"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ShieldCheck, Lock, ArrowLeft, Loader2, QrCode, CheckCircle2, Gem, Copy, Zap, CreditCard } from "lucide-react"
import { useUser, useDoc, useFirestore } from "@/firebase"
import { useEffect, useState, Suspense, useMemo } from "react"
import { useToast } from "@/hooks/use-toast"
import { submitManualPayment } from "@/app/actions/payment"
import { doc } from "firebase/firestore"
import Script from "next/script"

/**
 * @fileOverview Institutional Checkout Node v2.2.
 * UPDATED: Dynamic environment detection for Cashfree SDK.
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

  const handleCashfreePayment = async () => {
    if (!user || !profile || !planData || onlineProcessing) return;

    setOnlineProcessing(true);
    try {
      const orderRes = await fetch('/api/cashfree/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId, userId: user.uid })
      });

      const orderData = await orderRes.json();
      if (orderData.error) throw new Error(orderData.error);

      // Initialize SDK with dynamic environment
      const mode = process.env.NEXT_PUBLIC_CASHFREE_ENV === 'production' ? 'production' : 'sandbox';
      const cashfree = (window as any).Cashfree({ mode });

      await cashfree.checkout({
         paymentSessionId: orderData.payment_session_id,
         redirectTarget: "_self" 
      });

    } catch (e: any) {
      toast({ variant: "destructive", title: "Gateway Error", description: e.message });
      setOnlineProcessing(false);
    }
  };

  const upiId = settings?.upiId || "arshdeepgrewal1122-1@oksbi";
  const upiLink = `upi://pay?pa=${upiId}&pn=Cracklix&am=${planData?.price || 0}&cu=INR`;
  const qrUrl = settings?.qrCodeUrl || `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(upiLink)}`;

  if (planLoading) return <div className="h-screen flex items-center justify-center bg-white"><Loader2 className="h-10 w-10 text-primary animate-spin" /></div>
  if (!planData) return <div className="h-screen flex items-center justify-center text-slate-400 uppercase font-black tracking-widest text-xs">Registry Node Missing</div>

  return (
    <div className="min-h-screen bg-slate-50/50 font-body">
      <Navbar />
      <Script src="https://sdk.cashfree.com/js/v3/cashfree.js" strategy="lazyOnload" />
      
      <main className="container mx-auto px-4 md:px-6 py-12 md:py-24 max-w-5xl">
        <div className="flex items-center gap-6 mb-12">
           <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-2xl h-14 w-14 border border-slate-200 bg-white shadow-sm">
             <ArrowLeft className="h-6 w-6 text-[#0F172A]" />
           </Button>
           <div className="text-left">
              <h1 className="text-4xl font-headline font-black text-[#0F172A] uppercase tracking-tight">Checkout</h1>
              <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-1">Institutional Billing Node</p>
           </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 md:gap-16 text-left">
           <div className="lg:col-span-7 space-y-10">
              
              <Card className="border-none shadow-5xl rounded-[3rem] bg-[#0F172A] text-white overflow-hidden group">
                 <CardHeader className="p-10 pb-4">
                    <div className="flex items-center gap-4 mb-2">
                       <CreditCard className="h-6 w-6 text-primary" />
                       <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Fast Activation</span>
                    </div>
                    <CardTitle className="font-headline font-black text-2xl uppercase">Cashfree Checkout</CardTitle>
                    <CardDescription className="text-slate-400 font-medium">Automatic verification via UPI, Cards, or Netbanking.</CardDescription>
                 </CardHeader>
                 <CardContent className="p-10 pt-4">
                    <Button 
                      onClick={handleCashfreePayment}
                      disabled={onlineProcessing}
                      className="w-full h-20 bg-primary hover:bg-orange-600 text-white font-black uppercase tracking-[0.2em] text-[11px] rounded-2xl shadow-3xl shadow-primary/20 transition-all active:scale-95 border-none gap-4"
                    >
                       {onlineProcessing ? <Loader2 className="h-6 w-6 animate-spin" /> : <Zap className="h-6 w-6 fill-current" />}
                       PAY SECURELY WITH CASHFREE
                    </Button>
                 </CardContent>
              </Card>

              <Card className="border-none shadow-3xl rounded-[3rem] bg-white overflow-hidden">
                 <CardHeader className="p-10 bg-slate-50/50 border-b border-slate-100">
                    <div className="flex items-center gap-4 mb-2">
                       <QrCode className="h-5 w-5 text-slate-400" />
                       <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Manual Gateway</span>
                    </div>
                    <CardTitle className="font-headline font-black text-xl uppercase text-[#0F172A]">Direct UPI Node</CardTitle>
                 </CardHeader>
                 <CardContent className="p-10 space-y-10">
                    <div className="flex flex-col items-center gap-10">
                       <div className="h-48 w-48 bg-white rounded-3xl border-2 border-slate-50 flex items-center justify-center p-4 shadow-xl">
                          <img src={qrUrl} alt="QR" className="w-full h-full object-contain" />
                       </div>
                       <div className="w-full p-5 bg-slate-900 rounded-2xl border border-white/5 flex items-center justify-between shadow-2xl">
                          <div className="min-w-0 flex-1 text-left">
                             <p className="text-[8px] font-black text-primary uppercase tracking-widest mb-1">UPI ID</p>
                             <p className="text-base font-black text-white truncate">{upiId}</p>
                          </div>
                          <Button size="icon" variant="ghost" onClick={() => { navigator.clipboard.writeText(upiId); toast({title:"Copied"}); }} className="text-primary hover:bg-white/10 rounded-xl"><Copy className="h-5 w-5" /></Button>
                       </div>
                    </div>
                    <div className="space-y-4 pt-8 border-t border-slate-100">
                       <div className="space-y-2">
                          <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">12-Digit Transaction UTR</Label>
                          <Input 
                            value={utr}
                            onChange={e => setUtr(e.target.value.replace(/\D/g, '').slice(0,12))}
                            placeholder="Enter 12-digit number" 
                            className="h-14 rounded-xl border-slate-200 bg-slate-50 font-black text-xl tracking-widest text-center" 
                          />
                       </div>
                       <Button 
                          onClick={async () => {
                             if(utr.length < 12) { toast({variant:"destructive", title:"Invalid UTR"}); return; }
                             setProcessing(true);
                             await submitManualPayment({ userId: user!.uid, userEmail: user!.email!, userName: profile!.name, planId, transactionId: utr });
                             toast({title:"Submitted", description:"Admin will audit your payment shortly."});
                             router.push("/dashboard");
                          }}
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
                 <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12"><Gem className="h-48 w-48" /></div>
                 <div className="relative z-10 space-y-12">
                    <div className="space-y-2 text-center">
                       <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Order Registry</p>
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
           </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
