"use client"

import { useSearchParams, useRouter } from "next/navigation"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Loader2, Copy, Zap, Gem, ShieldCheck, CheckCircle2 } from "lucide-react"
import { useUser, useDoc, useFirestore } from "@/firebase"
import { useEffect, useState, Suspense, useMemo } from "react"
import { useToast } from "@/hooks/use-toast"
import { submitManualPayment, activateFreePass } from "@/app/actions/payment"
import { doc } from "firebase/firestore"
import Script from "next/script"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"

/**
 * @fileOverview Institutional Checkout Hub v11.0.
 * FIXED: Enhanced error handling and loading states for Cashfree order creation.
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
  const planId = searchParams.get("plan") || "monthly-pass"
  const { user, profile, loading } = useUser()
  const dbInstance = useFirestore()
  const { toast } = useToast()
  
  const [onlineProcessing, setOnlineProcessing] = useState(false);
  const [utr, setUtr] = useState("");

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
        toast({ title: "Pass Activated", description: "Your free tier is now live." });
        router.push("/dashboard");
      } catch (e) {
        toast({ variant: "destructive", title: "Activation Failed" });
        setOnlineProcessing(false);
      }
      return;
    }

    setOnlineProcessing(true);
    const cf = (window as any).Cashfree;
    
    if (!cf) {
       toast({ 
         variant: "destructive", 
         title: "Gateway Error", 
         description: "Payment engine failed to initialize. Please refresh the page." 
       });
       setOnlineProcessing(false);
       return;
    }

    try {
      const orderRes = await fetch(`/api/cashfree/create-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId, userId: user.uid, origin: window.location.origin })
      });

      const orderData = await orderRes.json();

      if (!orderRes.ok) {
         throw new Error(orderData.error || "Order creation failed.");
      }

      if (!orderData.payment_session_id) {
         throw new Error("Missing payment session node from gateway.");
      }
      
      const cashfreeInstance = cf({ mode: orderData.environment || 'sandbox' });
      await cashfreeInstance.checkout({
         paymentSessionId: orderData.payment_session_id,
         redirectTarget: "_self" 
      });

    } catch (e: any) {
      toast({ 
        variant: "destructive", 
        title: "Order Blocked", 
        description: e.message 
      });
    } finally {
      setOnlineProcessing(false);
    }
  };

  if (planLoading) return <div className="h-screen flex items-center justify-center bg-white"><Loader2 className="h-10 w-10 text-primary animate-spin" /></div>
  if (!planData) return <div className="h-screen flex flex-col items-center justify-center text-slate-300 font-black uppercase text-xs gap-4"><Zap className="h-10 w-10" /> Plan Not Registered</div>

  const upiId = settings?.upiId || "arshdeepgrewal1122-1@oksbi";

  return (
    <div className="min-h-screen bg-slate-50/50 font-body text-left">
      <Navbar />
      <Script src="https://sdk.cashfree.com/js/v3/cashfree.js" strategy="lazyOnload" />
      
      <main className="container mx-auto px-4 md:px-6 py-8 md:py-16 max-w-6xl pb-40">
        <div className="flex items-center gap-4 mb-10">
           <button onClick={() => router.back()} className="h-10 w-10 md:h-12 md:w-12 rounded-xl border border-slate-200 bg-white flex items-center justify-center hover:bg-slate-50 transition-all">
              <ArrowLeft className="h-5 w-5" />
           </button>
           <h1 className="text-2xl md:text-4xl font-black text-[#0F172A] tracking-tight leading-none">Checkout Hub</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 md:gap-16">
           <div className="lg:col-span-7 space-y-10">
              <Tabs defaultValue="online" className="w-full">
                 <TabsList className="bg-slate-100 p-1.5 h-14 rounded-2xl w-full mb-10 grid grid-cols-2 shadow-inner border border-slate-200">
                    <TabsTrigger value="online" className="rounded-xl font-bold text-sm h-full flex items-center justify-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-md transition-all">
                       <ShieldCheck className="h-3.5 w-3.5" /> Secure Gateway
                    </TabsTrigger>
                    {planData.price > 0 && (
                       <TabsTrigger value="manual" className="rounded-xl font-bold text-sm h-full flex items-center justify-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-md transition-all">
                          <Gem className="h-3.5 w-3.5" /> Manual Verify
                       </TabsTrigger>
                    )}
                 </TabsList>

                 <TabsContent value="online" className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <Card className="border-none shadow-5xl rounded-[3rem] bg-white p-8 md:p-14 text-center border border-slate-100">
                       <div className="mb-12 space-y-3">
                          <div className="h-16 w-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto text-blue-600 shadow-inner mb-6">
                             <ShieldCheck className="h-8 w-8" />
                          </div>
                          <h2 className="text-2xl font-black text-[#0F172A]">Direct Activation</h2>
                          <p className="text-slate-500 font-medium max-w-sm mx-auto leading-relaxed text-sm">Instant prep-node activation via encrypted Cashfree gateway.</p>
                       </div>
                       <Button onClick={handlePaymentInitiation} disabled={onlineProcessing} className="w-full h-16 md:h-20 bg-primary hover:bg-blue-700 text-white font-black text-sm rounded-full shadow-3xl border-none transition-all active:scale-95">
                          {onlineProcessing ? <Loader2 className="h-5 w-5 animate-spin" /> : <><Zap className="h-5 w-5 mr-2" /> Pay ₹{planData.price} Now</>}
                       </Button>
                    </Card>
                 </TabsContent>

                 <TabsContent value="manual" className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <Card className="border-none shadow-5xl rounded-[3rem] bg-white p-8 md:p-14 space-y-10 border border-slate-100">
                       <div className="flex flex-col items-center gap-8">
                          <div className="relative h-52 w-52 p-4 bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200">
                            <Image src={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent('upi://pay?pa='+upiId+'&pn=Cracklix&am='+planData.price+'&cu=INR')}`} alt="UPI QR" fill sizes="200px" className="object-contain p-4" unoptimized />
                          </div>
                          <div className="w-full p-4 bg-slate-900 rounded-xl flex items-center justify-between shadow-2xl">
                             <div className="text-left min-w-0">
                                <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Registry VPA</p>
                                <p className="text-sm font-black text-white truncate">{upiId}</p>
                             </div>
                             <Button size="icon" variant="ghost" onClick={() => { navigator.clipboard.writeText(upiId); toast({title:"Copied"}); }} className="text-primary hover:bg-white/5"><Copy className="h-5 w-5" /></Button>
                          </div>
                       </div>
                       <div className="space-y-6 pt-6 border-t border-slate-50">
                          <div className="space-y-2 text-left">
                             <Label className="text-[9px] font-black uppercase text-slate-500 ml-1">12-Digit UTR Number</Label>
                             <Input value={utr} onChange={e => setUtr(e.target.value.replace(/\D/g, '').slice(0,12))} className="h-14 rounded-2xl border-slate-200 bg-slate-50 text-center font-black text-xl tracking-[0.2em]" placeholder="---" />
                          </div>
                          <Button 
                             onClick={async () => {
                                if(utr.length < 12) { toast({ variant: "destructive", title: "Invalid UTR" }); return; }
                                setOnlineProcessing(true);
                                try { 
                                  await submitManualPayment({ 
                                    userId: user!.uid, 
                                    userEmail: user!.email || "", 
                                    userName: profile?.name || "Student", 
                                    planId, 
                                    transactionId: utr 
                                  }); 
                                  toast({ title: "Verification Staged", description: "Team node will audit shortly." }); 
                                  router.push("/dashboard"); 
                                } catch(e) { 
                                  toast({variant: "destructive", title:"Sync Failed"}); 
                                } finally { setOnlineProcessing(false); }
                             }}
                             disabled={onlineProcessing}
                             className="w-full h-16 bg-[#0F172A] hover:bg-black text-white font-black uppercase text-xs rounded-full shadow-2xl border-none transition-all"
                          >{onlineProcessing ? <Loader2 className="h-5 w-5 animate-spin" /> : "Verify Transaction"}</Button>
                       </div>
                    </Card>
                 </TabsContent>
              </Tabs>
           </div>

           <div className="lg:col-span-5">
              <Card className="border-none shadow-5xl rounded-[3.5rem] bg-[#0B1528] text-white p-10 md:p-14 sticky top-32 border border-white/5">
                 <div className="h-1 w-12 bg-primary rounded-full mb-8" />
                 <div className="space-y-4">
                    <h3 className="text-3xl md:text-5xl font-black leading-[0.9] tracking-tighter">{planData.name}</h3>
                    <Badge className="bg-primary/20 text-primary border-none text-[8px] font-black uppercase tracking-widest px-3 py-1">Premium Prep Node</Badge>
                 </div>
                 
                 <div className="mt-10 pt-10 border-t border-white/5 space-y-5">
                    {planData.features?.slice(0, 5).map((f: string, i: number) => (
                       <div key={i} className="flex items-center gap-3 text-slate-400">
                          <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                          <span className="text-[13px] font-bold tracking-tight leading-snug">{f}</span>
                       </div>
                    ))}
                 </div>

                 <div className="mt-14 pt-8 border-t border-white/5 flex justify-between items-end">
                    <div className="text-left">
                       <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Pass Amount</p>
                       <span className="text-5xl font-black text-white tabular-nums tracking-tighter">₹{planData.price}</span>
                    </div>
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">INR</span>
                 </div>
              </Card>
           </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
