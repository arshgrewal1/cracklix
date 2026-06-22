"use client"

import { useSearchParams, useRouter } from "next/navigation"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ShieldCheck, ArrowLeft, Loader2, QrCode, CreditCard, Clock, Gem, Copy, Zap, Layers, AlertCircle } from "lucide-react"
import { useUser, useDoc, useFirestore } from "@/firebase"
import { useEffect, useState, Suspense, useMemo } from "react"
import { useToast } from "@/hooks/use-toast"
import { submitManualPayment, activateFreePass } from "@/app/actions/payment"
import { doc } from "firebase/firestore"
import Script from "next/script"
import { cn } from "@/lib/utils"
import { Capacitor } from "@capacitor/core"

/**
 * @fileOverview Testbook-Style Checkout Hub v16.2 (Hardened).
 * FIXED: Decoupled API calls for APK compatibility. Targets remote Vercel node when on native.
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
    let cf = getCashfree();
    
    if (!cf) {
       toast({ variant: "destructive", title: "SDK Error", description: "Payment engine failed to initialize." });
       setOnlineProcessing(false);
       return;
    }

    try {
      // APK COMPATIBILITY: Point to deployed Vercel instance for order creation
      const baseUrl = Capacitor.isNativePlatform() ? "https://cracklix.vercel.app" : "";
      
      const orderRes = await fetch(`${baseUrl}/api/cashfree/create-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId, userId: user.uid, origin: window.location.origin })
      });

      const orderData = await orderRes.json();
      if (orderData.error) {
        toast({ variant: "destructive", title: "Gateway Error", description: orderData.error });
        setOnlineProcessing(false);
        return;
      }

      const cashfreeInstance = cf({ mode: orderData.environment || 'sandbox' });
      await cashfreeInstance.checkout({
         paymentSessionId: orderData.payment_session_id,
         redirectTarget: "_self" 
      });

    } catch (e: any) {
      toast({ variant: "destructive", title: "Transaction Error" });
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
      <Script src="https://sdk.cashfree.com/js/v3/cashfree.js" onLoad={() => setSdkReady(true)} />
      
      <main className="container mx-auto px-4 md:px-6 py-8 md:py-16 max-w-6xl pb-40">
        <div className="flex items-center gap-4 mb-8">
           <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-2xl h-12 w-12 border border-slate-200 bg-white"><ArrowLeft className="h-6 w-6" /></Button>
           <h1 className="text-2xl md:text-4xl font-black text-[#0F172A] uppercase">Checkout</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-16">
           <div className="lg:col-span-7 space-y-8">
              <Tabs defaultValue="online" className="w-full">
                 <TabsList className="bg-slate-100 p-1 h-14 rounded-2xl w-full mb-8 grid grid-cols-2">
                    <TabsTrigger value="online" className="rounded-xl font-black uppercase text-[10px] h-full flex items-center gap-2">SECURE ONLINE</TabsTrigger>
                    {planData.price > 0 && <TabsTrigger value="manual" className="rounded-xl font-black uppercase text-[10px] h-full flex items-center gap-2">MANUAL UPI</TabsTrigger>}
                 </TabsList>

                 <TabsContent value="online">
                    <Card className="border-none shadow-5xl rounded-[2.5rem] bg-white p-8 md:p-10 text-center">
                       <Button onClick={handlePaymentInitiation} disabled={onlineProcessing} className="w-full h-16 md:h-20 bg-primary hover:bg-orange-600 text-white font-black uppercase tracking-[0.2em] text-[11px] rounded-2xl shadow-3xl">
                          {onlineProcessing ? "INITIATING..." : "ACTIVATE PLAN NOW"}
                       </Button>
                    </Card>
                 </TabsContent>

                 <TabsContent value="manual">
                    <Card className="border-none shadow-3xl rounded-[2.5rem] bg-white p-8 md:p-10 space-y-10">
                       <div className="flex flex-col items-center gap-8">
                          <img src={qrUrl} alt="QR" className="h-44 w-44 md:h-52 md:w-52 object-contain" />
                          <div className="w-full p-4 bg-slate-900 rounded-xl flex items-center justify-between shadow-2xl">
                             <p className="text-[13px] md:text-base font-black text-white truncate">{upiId}</p>
                             <Button size="icon" variant="ghost" onClick={() => { navigator.clipboard.writeText(upiId); toast({title:"Copied"}); }} className="text-primary"><Copy className="h-4 w-4" /></Button>
                          </div>
                       </div>
                       <div className="space-y-4 pt-6 border-t">
                          <Label className="text-[10px] font-black uppercase text-slate-500">12-Digit UTR</Label>
                          <Input value={utr} onChange={e => setUtr(e.target.value.replace(/\D/g, '').slice(0,12))} className="h-14 rounded-xl border-slate-200 bg-slate-50 text-center font-black text-xl tracking-[0.3em]" />
                          <Button 
                             onClick={async () => {
                                if(utr.length < 12) return;
                                setProcessing(true);
                                try { await submitManualPayment({ userId: user!.uid, userEmail: user!.email || "", userName: profile?.name || "Student", planId, transactionId: utr }); router.push("/dashboard"); } catch(e) { toast({title:"Sync Error"}); } finally { setProcessing(false); }
                             }}
                             disabled={processing}
                             className="w-full h-16 bg-slate-200 text-slate-700 font-black uppercase rounded-2xl"
                          >SUBMIT FOR AUDIT</Button>
                       </div>
                    </Card>
                 </TabsContent>
              </Tabs>
           </div>

           <div className="lg:col-span-5">
              <Card className="border-none shadow-5xl rounded-[3.5rem] bg-[#0B1528] text-white p-12 sticky top-32">
                 <h3 className="text-4xl font-headline font-black uppercase leading-tight">{planData.name}</h3>
                 <div className="mt-10 pt-10 border-t border-white/5 flex justify-between items-center">
                    <span className="text-xl uppercase">Total</span>
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