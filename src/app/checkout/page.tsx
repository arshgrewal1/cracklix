
"use client"

import { useSearchParams, useRouter } from "next/navigation"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ShieldCheck, Lock, CreditCard, ChevronRight, Zap, ArrowLeft, Loader2, Sparkles, AlertCircle, QrCode, Phone, CheckCircle2, Trophy, Star, Gem, Landmark } from "lucide-react"
import { useUser, useDoc, useFirestore } from "@/firebase"
import { useEffect, useState, Suspense, useMemo } from "react"
import { useToast } from "@/hooks/use-toast"
import { submitManualPayment } from "@/app/actions/payment"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { doc } from "firebase/firestore"
import Script from "next/script"

/**
 * @fileOverview Institutional Checkout Hub v26.0.
 * FIXED: Explicitly enabled UPI VPA (ID) entry field in Razorpay config to allow manual typing.
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
  const [utr, setUtr] = useState("")

  const { data: settings } = useDoc<any>(useMemo(() => (db ? doc(db, 'settings', 'global') : null), [db]));
  const { data: planData, loading: planLoading } = useDoc<any>(useMemo(() => (db && planId ? doc(db, 'passes', planId) : null), [db, planId]));

  useEffect(() => {
    if (!loading && !user) router.push("/login")
  }, [user, loading, router])

  const upiId = settings?.upiId || "arshdeepgrewal1122@okaxis";

  const handleRazorpayPayment = async () => {
    if (!user || !planData || !db) return;
    
    if (!(window as any).Razorpay) {
      toast({ variant: "destructive", title: "Gateway Script Error", description: "The payment engine failed to load. Please refresh the page." });
      return;
    }

    setProcessing(true);

    try {
      // 1. Create order node via backend hub
      const orderRes = await fetch('/api/razorpay/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: planData.price, planId: planId }),
      });

      const orderData = await orderRes.json();
      if (orderData.error) throw new Error(orderData.error);

      // 2. AGGRESSIVE SANITIZATION (Strict domestic node rules)
      const rawName = profile?.name || user?.displayName || 'Aspirant';
      const sanitizedName = rawName.replace(/[^a-zA-Z\s]/g, '').trim().slice(0, 40) || "Student";
      
      const phoneDigits = (profile?.phone || '').replace(/\D/g, '').slice(-10);
      const sanitizedPhone = phoneDigits.length === 10 ? `+91${phoneDigits}` : '';

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || orderData.key_id,
        amount: orderData.amount,
        currency: "INR",
        name: "CRACKLIX",
        description: `${planData.name} Activation`,
        image: "https://i.ibb.co/5hkxTtKS/Whats-App-Image-2026-05-28-at-10-31-36-AM.jpg",
        order_id: orderData.order_id,
        handler: async function (response: any) {
          setProcessing(true);
          try {
            const verifyRes = await fetch('/api/razorpay/verify-payment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                userId: user.uid,
                planId: planId
              }),
            });

            const verifyData = await verifyRes.json();
            if (verifyData.success) {
              toast({ title: "Pass Activated", description: "Your preparation hub is now fully unlocked." });
              router.push(`/payment/success?plan=${planData.name}`);
            } else {
              throw new Error("Security audit failed.");
            }
          } catch (e: any) {
            toast({ variant: "destructive", title: "Security Rejection", description: "Payment verification registry rejected." });
            setProcessing(false);
          }
        },
        prefill: {
          name: sanitizedName,
          email: user.email,
          contact: sanitizedPhone
        },
        theme: { color: "#F97316" },
        // CRITICAL: Explicitly enable VPA (UPI ID) entry field
        config: {
          display: {
            preferences: {
              show_default_blocks: true,
            },
            methods: {
              upi: {
                vpa: true,
                qr: true,
              }
            }
          }
        },
        modal: {
          ondismiss: function() { 
            setProcessing(false); 
          }
        }
      };

      const rzp = new (window as any).Razorpay(options);
      
      rzp.on('payment.failed', function (response: any) {
        toast({ 
          variant: "destructive", 
          title: "Gateway Rejection", 
          description: response.error.description || "The bank node declined the transaction." 
        });
        setProcessing(false);
      });

      rzp.open();
    } catch (e: any) {
      toast({ variant: "destructive", title: "Gateway Error", description: e.message });
      setProcessing(false);
    }
  };

  const handleManualPayment = async () => {
    if (!user || !profile || !planData) return
    if (!utr || utr.length < 10) {
       toast({ variant: "destructive", title: "UTR Code Invalid", description: "Please enter the 12-digit transaction ID." })
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
       toast({ title: "Audit Logged", description: "Admin will verify your payment node within 24 hours." })
       router.push("/dashboard")
    } catch (e: any) {
       toast({ variant: "destructive", title: "Registry Error" })
    } finally {
       setProcessing(false)
    }
  }

  if (planLoading) return <div className="h-screen flex items-center justify-center bg-white"><Loader2 className="h-10 w-10 text-primary animate-spin" /></div>
  if (!planData) return <div className="h-screen flex items-center justify-center bg-slate-50 text-slate-400 font-black uppercase tracking-widest text-xs">Registry Node Not Found</div>

  return (
    <div className="min-h-screen bg-slate-50/50 font-body">
      <Navbar />
      <Script 
        src="https://checkout.razorpay.com/v1/checkout.js" 
        strategy="afterInteractive" 
      />
      
      <main className="container mx-auto px-4 md:px-6 py-12 md:py-24 max-w-5xl">
        <div className="flex items-center gap-6 mb-12">
           <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-2xl h-14 w-14 border border-slate-200 bg-white shadow-sm">
             <ArrowLeft className="h-6 w-6 text-[#0F172A]" />
           </Button>
           <div className="text-left">
              <h1 className="text-4xl font-headline font-black text-[#0F172A] uppercase tracking-tight">Checkout Hub</h1>
              <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-1 text-left">Secure Transaction Registry</p>
           </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 md:gap-16 text-left">
           <div className="lg:col-span-7 space-y-10">
              <Tabs defaultValue="online" className="w-full">
                 <TabsList className="grid grid-cols-2 h-16 bg-white border border-slate-100 rounded-2xl p-1 shadow-sm mb-10">
                    <TabsTrigger value="online" className="rounded-xl font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-[#0B1528] data-[state=active]:text-white">Pay Online (Fast)</TabsTrigger>
                    <TabsTrigger value="manual" className="rounded-xl font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-[#0B1528] data-[state=active]:text-white">Manual Audit (QR)</TabsTrigger>
                 </TabsList>

                 <TabsContent value="online" className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <Card className="border-none shadow-3xl rounded-[3rem] bg-white overflow-hidden">
                       <CardHeader className="p-10 bg-slate-50/50 border-b border-slate-100">
                          <CardTitle className="font-headline font-black text-xl uppercase text-[#0F172A]">Direct Activation</CardTitle>
                          <CardDescription className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Secure transaction via Razorpay domestic gateway</CardDescription>
                       </CardHeader>
                       <CardContent className="p-10 space-y-10">
                          <div className="flex items-center gap-6 p-6 bg-emerald-50/50 rounded-3xl border border-emerald-100">
                             <div className="h-12 w-12 rounded-xl bg-emerald-500 flex items-center justify-center text-white shadow-lg">
                                <ShieldCheck className="h-6 w-6" />
                             </div>
                             <p className="text-sm font-medium text-emerald-800 leading-relaxed uppercase">
                                Your transaction is verified against the master Punjab Exam Hub registry instantly.
                             </p>
                          </div>
                          <Button 
                             onClick={handleRazorpayPayment}
                             disabled={processing}
                             className="w-full h-20 bg-primary hover:bg-orange-600 text-white font-black uppercase tracking-[0.2em] text-xs rounded-2xl shadow-xl shadow-primary/20 gap-4 transition-all active:scale-95 border-none"
                          >
                             {processing ? <Loader2 className="h-6 w-6 animate-spin" /> : <CreditCard className="h-6 w-6" />}
                             Pay Securely & Activate Now
                          </Button>
                       </CardContent>
                    </Card>
                 </TabsContent>

                 <TabsContent value="manual" className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <Card className="border-none shadow-3xl rounded-[3rem] bg-white overflow-hidden">
                       <CardHeader className="p-10 bg-slate-50/50 border-b border-slate-100">
                          <CardTitle className="font-headline font-black text-xl uppercase text-[#0F172A]">Manual Hub Audit</CardTitle>
                          <CardDescription className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Scan QR and submit transaction UTR code</CardDescription>
                       </CardHeader>
                       <CardContent className="p-10 space-y-10">
                          <div className="flex flex-col md:flex-row items-center gap-10">
                             <div className="h-48 w-48 bg-white rounded-3xl border-2 border-dashed border-slate-200 flex items-center justify-center p-4 shadow-inner relative group">
                                <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=upi://pay?pa=${upiId}%26pn=Cracklix%26am=${planData.price}%26cu=INR`} alt="Audit QR" className="w-full h-full object-contain" />
                             </div>
                             <div className="flex-1 space-y-4 text-left">
                                <div className="p-5 bg-[#0F172A] rounded-2xl border border-white/5 space-y-1 shadow-2xl">
                                   <p className="text-[9px] font-black text-primary uppercase tracking-widest">Institutional UPI Node</p>
                                   <p className="text-lg font-black text-white break-all leading-none">{upiId}</p>
                                </div>
                                <ul className="space-y-2">
                                   <li className="flex items-center gap-3 text-[10px] font-bold text-slate-500 uppercase"><CheckCircle2 className="h-3 w-3 text-emerald-500" /> Pay exactly ₹{planData.price}</li>
                                   <li className="flex items-center gap-3 text-[10px] font-bold text-slate-500 uppercase"><CheckCircle2 className="h-3 w-3 text-emerald-500" /> Copy 12-digit UTR from your app</li>
                                </ul>
                             </div>
                          </div>

                          <div className="space-y-4 pt-6 border-t border-slate-50">
                             <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">UTR / Transaction ID</Label>
                                <Input 
                                  value={utr}
                                  onChange={e => setUtr(e.target.value)}
                                  placeholder="Enter 12-digit UTR" 
                                  className="h-14 rounded-xl border-slate-100 bg-slate-50 font-black text-lg tracking-widest text-[#0F172A]" 
                                />
                             </div>
                             <Button 
                                onClick={handleManualPayment}
                                disabled={processing}
                                className="w-full h-16 bg-[#0F172A] hover:bg-black text-white font-black uppercase tracking-widest text-[11px] rounded-2xl shadow-xl transition-all active:scale-95 border-none"
                             >
                                {processing ? <Loader2 className="h-5 w-5 animate-spin" /> : <ShieldCheck className="h-5 w-5" />}
                                Submit Registry for Audit
                             </Button>
                          </div>
                       </CardContent>
                    </Card>
                 </TabsContent>
              </Tabs>
           </div>

           <div className="lg:col-span-5 space-y-8">
              <Card className="border-none shadow-5xl rounded-[3.5rem] bg-[#0F172A] text-white p-10 md:p-14 overflow-hidden relative">
                 <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12 group-hover:scale-110 transition-transform duration-1000"><Gem className="h-48 w-48" /></div>
                 <div className="relative z-10 space-y-12">
                    <div className="space-y-2 text-center">
                       <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Transaction Node Summary</p>
                       <h3 className="text-3xl md:text-5xl font-headline font-black uppercase leading-tight">{planData.name}</h3>
                    </div>
                    
                    <div className="space-y-5 pt-6 border-t border-white/5">
                       <div className="flex justify-between items-center text-sm font-bold text-slate-400 uppercase tracking-widest">
                          <span>Institutional Fee</span>
                          <span className="text-white font-black">₹{planData.price}</span>
                       </div>
                       <div className="flex justify-between items-center pt-8 border-t border-white/5">
                          <span className="text-xl font-headline font-black uppercase">Total Due</span>
                          <span className="text-5xl font-black text-primary tracking-tighter tabular-nums">₹{planData.price}</span>
                       </div>
                    </div>
                 </div>
              </Card>

              <div className="p-8 bg-white rounded-[2.5rem] border border-slate-100 shadow-xl flex items-start gap-4">
                 <Lock className="h-5 w-5 text-slate-300 shrink-0 mt-1" />
                 <p className="text-[10px] font-bold text-slate-500 leading-relaxed uppercase">
                    Institutional security active. All transactions are audited against the master Punjab recruitment database node.
                 </p>
              </div>
           </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
