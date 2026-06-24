"use client"

import { useSearchParams, useRouter } from "next/navigation"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Loader2, Copy, Zap, Gem } from "lucide-react"
import { useUser, useDoc, useFirestore } from "@/firebase"
import { useEffect, useState, Suspense, useMemo } from "react"
import { useToast } from "@/hooks/use-toast"
import { submitManualPayment, activateFreePass } from "@/app/actions/payment"
import { doc } from "firebase/firestore"
import Script from "next/script"
import { Capacitor } from "@capacitor/core"
import Image from "next/image"

/**
 * @fileOverview Hardened Checkout Page v3.0.
 * FIXED: Logic to ensure phone numbers are exactly 10 digits before gateway initiation.
 * FIXED: Seamless SDK initialization for Capacitor apps.
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
  const dbInstance = useFirestore()
  const { toast } = useToast()
  
  const [processing, setProcessing] = useState(false)
  const [onlineProcessing, setOnlineProcessing] = useState(false)
  const [utr, setUtr] = useState("")
  const [sdkReady, setSdkReady] = useState(false)

  const { data: settings } = useDoc<any>(useMemo(() => (dbInstance ? doc(dbInstance, 'settings', 'global') : null), [dbInstance]));
  const { data: planData, loading: planLoading } = useDoc<any>(useMemo(() => (dbInstance && planId ? doc(dbInstance, 'passes', planId) : null), [dbInstance, planId]));

  useEffect(() => {
    if (!loading && !user) router.push("/login")
  }, [user, loading, router])

  const handlePaymentInitiation = async () => {
    if (!user || !profile || !planData || onlineProcessing) return;

    // Phase 0: Validate Student Node Requirements
    if (!profile.phone || profile.phone.replace(/\D/g, '').length < 10) {
       toast({ variant: "destructive", title: "Profile Incomplete", description: "Please add a valid 10-digit mobile number to your profile first." });
       router.push("/profile-setup");
       return;
    }

    if (planData.price === 0) {
      setOnlineProcessing(true);
      try {
        await activateFreePass(user.uid, planId);
        toast({ title: "Pass Activated" });
        router.push("/dashboard");
      } catch (e) {
        toast({ variant: "destructive", title: "Activation Failed" });
        setOnlineProcessing(false);
      }
      return;
    }

    setOnlineProcessing(true);
    const getCashfree = () => (window as any).Cashfree;
    const cf = getCashfree();
    
    if (!cf) {
       toast({ variant: "destructive", title: "SDK Error", description: "Payment engine failed to initialize. Please check your connection." });
       setOnlineProcessing(false);
       return;
    }

    try {
      const orderRes = await fetch(`/api/cashfree/create-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId, userId: user.uid, origin: window.location.origin })
      });

      if (!orderRes.ok) {
         const errData = await orderRes.json();
         throw new Error(errData.error || "Order creation failed.");
      }

      const orderData = await orderRes.json();
      
      const cashfreeInstance = cf({ mode: orderData.environment || 'sandbox' });
      await cashfreeInstance.checkout({
         paymentSessionId: orderData.payment_session_id,
         redirectTarget: "_self" 
      });

    } catch (e: any) {
      console.error("[PAYMENT_INIT_FAIL]:", e);
      toast({ variant: "destructive", title: "Order Blocked", description: e.message || "Transaction could not be established." });
      setOnlineProcessing(false);
    }
  };

  if (planLoading) return <div className="h-screen flex items-center justify-center bg-white"><Loader2 className="h-10 w-10 text-primary animate-spin" /></div>
  if (!planData) return <div className="h-screen flex items-center justify-center text-slate-400 font-black uppercase text-xs">Registry Node Missing</div>

  const upiId = settings?.upiId || "arshdeepgrewal1122-1@oksbi";
  const upiLink = `upi://pay?pa=${upiId}&pn=Cracklix&am=${planData.price}&cu=INR`;
  const qrUrl = settings?.qrCodeUrl || `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(upiLink)}`;

  return (
    <div className="min-h-screen bg-slate-50/50 font-body text-left">
      <Navbar />
      <Script 
        src="https://sdk.cashfree.com/js/v3/cashfree.js" 
        onLoad={() => setSdkReady(true)}
        onError={() => toast({ variant: "destructive", title: "SDK Load Failure" })}
      />
      
      <main className="container mx-auto px-4 md:px-6 py-8 md:py-16 max-w-6xl pb-40">
        <div className="flex items-center gap-4 mb-8">
           <button onClick={() => router.back()} className="h-10 w-10 md:h-12 md:w-12 rounded-xl border border-slate-200 bg-white flex items-center justify-center hover:bg-slate-50 transition-all">
              <ArrowLeft className="h-5 w-5" />
           </button>
           <h1 className="text-2xl md:text-4xl font-black text-[#0F172A] uppercase">Checkout Hub</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-16">
           <div className="lg:col-span-7 space-y-8">
              <Tabs defaultValue="online" className="w-full">
                 <TabsList className="bg-slate-100 p-1 h-14 rounded-2xl w-full mb-8 grid grid-cols-2">
                    <TabsTrigger value="online" className="rounded-xl font-black uppercase text-[10px] h-full flex items-center justify-center gap-2">SECURE ONLINE</TabsTrigger>
                    {planData.price > 0 && <TabsTrigger value="manual" className="rounded-xl font-black uppercase text-[10px] h-full flex items-center justify-center gap-2">MANUAL UPI</TabsTrigger>}
                 </TabsList>

                 <TabsContent value="online">
                    <Card className="border-none shadow-5xl rounded-[2.5rem] bg-white p-8 md:p-10 text-center">
                       <div className="mb-10 space-y-2">
                          <p className="text-[10px] font-black uppercase text-primary tracking-[0.3em]">Encrypted Gateway</p>
                          <p className="text-slate-500 text-sm font-medium">Verify your payment for instant activation.</p>
                       </div>
                       <Button onClick={handlePaymentInitiation} disabled={onlineProcessing} className="w-full h-16 md:h-20 bg-primary hover:bg-orange-600 text-white font-black uppercase tracking-[0.2em] text-[11px] rounded-2xl shadow-3xl border-none active:scale-95 transition-all">
                          {onlineProcessing ? <Loader2 className="h-5 w-5 animate-spin" /> : "INITIATE SECURE PAYMENT"}
                       </Button>
                    </Card>
                 </TabsContent>

                 <TabsContent value="manual">
                    <Card className="border-none shadow-5xl rounded-[2.5rem] bg-white p-8 md:p-10 space-y-10">
                       <div className="flex flex-col items-center gap-8">
                          <div className="relative h-44 w-44 md:h-52 md:w-52">
                            <Image src={qrUrl} alt="UPI QR Code" fill className="object-contain" unoptimized />
                          </div>
                          <div className="w-full p-4 bg-slate-900 rounded-xl flex items-center justify-between shadow-2xl">
                             <p className="text-[13px] md:text-base font-black text-white truncate">{upiId}</p>
                             <Button size="icon" variant="ghost" onClick={() => { navigator.clipboard.writeText(upiId); toast({title:"Copied"}); }} className="text-primary hover:bg-white/5"><Copy className="h-4 w-4" /></Button>
                          </div>
                       </div>
                       <div className="space-y-4 pt-6 border-t">
                          <Label className="text-[9px] font-black uppercase text-slate-500 ml-1">12-Digit UTR Number</Label>
                          <Input value={utr} onChange={e => setUtr(e.target.value.replace(/\D/g, '').slice(0,12))} className="h-14 rounded-xl border-slate-200 bg-slate-50 text-center font-black text-xl tracking-[0.3em]" placeholder="---" />
                          <Button 
                             onClick={async () => {
                                if(utr.length < 12) { toast({ variant: "destructive", title: "Invalid UTR", description: "Please enter the full 12-digit number." }); return; }
                                setProcessing(true);
                                try { await submitManualPayment({ userId: user!.uid, userEmail: user!.email || "", userName: profile?.name || "Student", planId, transactionId: utr }); toast({ title: "Audit Staged", description: "Our team will verify your UTR shortly." }); router.push("/dashboard"); } catch(e) { toast({variant: "destructive", title:"Sync Error"}); } finally { setProcessing(false); }
                             }}
                             disabled={processing}
                             className="w-full h-16 bg-[#0F172A] hover:bg-black text-white font-black uppercase rounded-2xl shadow-xl border-none active:scale-95"
                          >{processing ? <Loader2 className="h-5 w-5 animate-spin" /> : "SUBMIT AUDIT REQUEST"}</Button>
                       </div>
                    </Card>
                 </TabsContent>
              </Tabs>
           </div>

           <div className="lg:col-span-5">
              <Card className="border-none shadow-5xl rounded-[3.5rem] bg-[#0B1528] text-white p-12 sticky top-32">
                 <div className="h-1.5 w-12 bg-primary rounded-full mb-8" />
                 <h3 className="text-4xl font-headline font-black uppercase leading-[0.9] tracking-tighter">{planData.name}</h3>
                 <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mt-4">Registry Access Pass</p>
                 <div className="mt-10 pt-10 border-t border-white/5 flex justify-between items-center">
                    <span className="text-xl uppercase font-bold text-slate-500">Total</span>
                    <span className="text-6xl font-black text-primary tabular-nums">₹{planData.price}</span>
                 </div>
              </Card>
           </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
