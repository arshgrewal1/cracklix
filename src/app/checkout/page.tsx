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

/**
 * @fileOverview Testbook-Style Checkout Hub v15.0.
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
  const [origin, setOrigin] = useState("")
  const [sdkReady, setSdkReady] = useState(false)

  const { data: settings } = useDoc<any>(useMemo(() => (dbInstance ? doc(dbInstance, 'settings', 'global') : null), [dbInstance]));
  const { data: planData, loading: planLoading } = useDoc<any>(useMemo(() => (dbInstance && planId ? doc(dbInstance, 'passes', planId) : null), [dbInstance, planId]));

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setOrigin(window.location.origin);
    }
  }, []);

  useEffect(() => {
    if (!loading && !user) router.push("/login")
  }, [user, loading, router])

  const subscriptionCase = useMemo(() => {
    if (!profile || !planData) return 'NEW';
    const currentTier = profile.planTier || 0;
    const newTier = planData.tier || 0;
    const currentPlanId = profile.status;
    const expiryStr = profile.passExpiresAt;
    const isActive = expiryStr && new Date(expiryStr) > new Date();

    if (!isActive) return 'NEW';
    if (currentPlanId === planId) return 'EXTEND';
    if (newTier > currentTier) return 'UPGRADE';
    if (newTier < currentTier) return 'LOWER';
    return 'EXTEND';
  }, [profile, planData, planId]);

  const handlePaymentInitiation = async () => {
    if (!user || !profile || !planData || onlineProcessing) return;

    if (subscriptionCase === 'LOWER') {
      toast({ variant: "destructive", title: "Action Blocked", description: "You already have a superior pass active." });
      return;
    }
    
    if (planData.price === 0) {
      setOnlineProcessing(true);
      try {
        await activateFreePass(user.uid, planId);
        toast({ title: "Pass Activated", description: "Your preparation node is now live." });
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
       for (let i = 0; i < 30; i++) {
          await new Promise(r => setTimeout(r, 100));
          cf = getCashfree();
          if (cf) break;
       }
    }

    if (!cf) {
       toast({ variant: "destructive", title: "SDK Error", description: "Payment engine failed to initialize. Please reload." });
       setOnlineProcessing(false);
       return;
    }

    try {
      const orderRes = await fetch('/api/cashfree/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId, userId: user.uid, origin })
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
      toast({ variant: "destructive", title: "Transaction Error", description: "Secure node connection lost." });
      setOnlineProcessing(false);
    }
  };

  if (planLoading) return <div className="h-screen flex items-center justify-center bg-white"><Loader2 className="h-10 w-10 text-primary animate-spin" /></div>
  if (!planData) return <div className="h-screen flex items-center justify-center text-slate-400 font-black uppercase text-xs">Registry Node Missing</div>

  const upiId = settings?.upiId || "arshdeepgrewal1122-1@oksbi";
  const upiLink = `upi://pay?pa=${upiId}&pn=Cracklix&am=${planData.price}&cu=INR`;
  const qrUrl = settings?.qrCodeUrl || `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(upiLink)}`;
  
  const profileExpiry = profile?.passExpiresAt;

  return (
    <div className="min-h-screen bg-slate-50/50 font-body text-left">
      <Navbar />
      <Script 
        src="https://sdk.cashfree.com/js/v3/cashfree.js" 
        onLoad={() => setSdkReady(true)}
      />
      
      <main className="container mx-auto px-4 md:px-6 py-8 md:py-16 max-w-6xl pb-40">
        <div className="flex items-center gap-4 mb-8 md:mb-12">
           <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-2xl h-12 w-12 border border-slate-200 bg-white shadow-sm">
             <ArrowLeft className="h-6 w-6 text-[#0F172A]" />
           </Button>
           <div className="text-left">
              <h1 className="text-2xl md:text-4xl font-headline font-black text-[#0F172A] uppercase tracking-tight">Checkout</h1>
              <p className="text-slate-400 font-bold uppercase tracking-widest text-[8px] md:text-[10px] mt-1.5">Institutional Payment Hub</p>
           </div>
        </div>

        {subscriptionCase === 'EXTEND' && profileExpiry && (
           <Card className="mb-8 border-none bg-emerald-600 text-white p-6 rounded-[1.5rem] shadow-xl flex items-center gap-6 animate-in slide-in-from-top-4">
              <div className="h-12 w-12 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                 <Clock className="h-6 w-6 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                 <h4 className="text-sm md:text-lg font-black uppercase tracking-tight">Plan Extension</h4>
                 <p className="text-[10px] md:text-xs font-medium text-emerald-50 mt-1">This will extend your current access by {planData.durationDays} days starting from <span className="font-black underline">{new Date(profileExpiry).toLocaleDateString()}</span>.</p>
              </div>
           </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-16">
           <div className="lg:col-span-7 space-y-8">
              <Tabs defaultValue="online" className="w-full">
                 <TabsList className="bg-slate-100 border border-slate-200 p-1 h-14 rounded-2xl w-full mb-8 grid grid-cols-2">
                    <TabsTrigger value="online" className="rounded-xl font-black uppercase text-[10px] h-full flex items-center gap-2">
                       <Zap className="h-3.5 w-3.5" /> SECURE ONLINE
                    </TabsTrigger>
                    {planData.price > 0 && (
                      <TabsTrigger value="manual" className="rounded-xl font-black uppercase text-[10px] h-full flex items-center gap-2">
                         <QrCode className="h-3.5 w-3.5" /> MANUAL UPI
                      </TabsTrigger>
                    )}
                 </TabsList>

                 <TabsContent value="online" className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <Card className="border-none shadow-5xl rounded-[2.5rem] bg-white overflow-hidden border border-slate-100">
                       <CardHeader className="p-8 md:p-10 pb-4">
                          <div className="flex items-center gap-4 mb-2">
                             <CreditCard className="h-6 w-6 text-primary" />
                             <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Fast Activation</span>
                          </div>
                          <CardTitle className="font-headline font-black text-xl md:text-2xl uppercase text-[#0F172A]">Payment Gateway</CardTitle>
                          <CardDescription className="text-slate-400 font-medium">Verified by Cashfree Security Node.</CardDescription>
                       </CardHeader>
                       <CardContent className="p-8 md:p-10 pt-4">
                          <Button 
                            onClick={handlePaymentInitiation}
                            disabled={onlineProcessing || subscriptionCase === 'LOWER'}
                            className="w-full h-16 md:h-20 bg-primary hover:bg-orange-600 text-white font-black uppercase tracking-[0.2em] text-[11px] rounded-2xl shadow-3xl transition-all active:scale-95 border-none gap-4"
                          >
                             {onlineProcessing ? <Loader2 className="h-6 w-6 animate-spin" /> : <ShieldCheck className="h-6 w-6 fill-current" />}
                             {onlineProcessing ? "INITIATING NODE..." : "ACTIVATE PLAN NOW"}
                          </Button>
                       </CardContent>
                    </Card>
                 </TabsContent>

                 <TabsContent value="manual" className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <Card className="border-none shadow-3xl rounded-[2.5rem] bg-white overflow-hidden border border-slate-100">
                       <CardHeader className="p-8 md:p-10 bg-slate-50/50 border-b border-slate-100 text-left">
                          <div className="flex items-center gap-4 mb-2">
                             <QrCode className="h-5 w-5 text-slate-400" />
                             <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Manual Node</span>
                          </div>
                          <CardTitle className="font-headline font-black text-xl uppercase text-[#0F172A]">Direct UPI Transfer</CardTitle>
                       </CardHeader>
                       <CardContent className="p-8 md:p-10 space-y-10">
                          <div className="flex flex-col items-center gap-8">
                             <div className="h-44 w-44 md:h-52 md:w-52 bg-white rounded-[2rem] border-2 border-slate-100 flex items-center justify-center p-4 shadow-xl">
                                <img src={qrUrl} alt="QR" className="w-full h-full object-contain" />
                             </div>
                             <div className="w-full p-4 bg-slate-900 rounded-xl border border-white/5 flex items-center justify-between shadow-2xl">
                                <div className="min-w-0 flex-1 text-left">
                                   <p className="text-[8px] font-black text-primary uppercase tracking-widest mb-1">UPI ID</p>
                                   <p className="text-[13px] md:text-base font-black text-white truncate">{upiId}</p>
                                </div>
                                <Button size="icon" variant="ghost" onClick={() => { navigator.clipboard.writeText(upiId); toast({title:"Copied"}); }} className="text-primary hover:bg-white/10 rounded-xl"><Copy className="h-4 w-4" /></Button>
                             </div>
                          </div>
                          <div className="space-y-4 pt-6 border-t border-slate-100 text-left">
                             <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">12-Digit Transaction UTR</Label>
                                <Input 
                                  value={utr}
                                  onChange={e => setUtr(e.target.value.replace(/\D/g, '').slice(0,12))}
                                  placeholder="Enter 12-digit number" 
                                  className="h-14 rounded-xl border-slate-200 bg-slate-50 font-black text-xl tracking-[0.3em] text-center" 
                                />
                             </div>
                             <Button 
                                onClick={async () => {
                                   if(utr.length < 12) { toast({variant:"destructive", title:"Invalid UTR"}); return; }
                                   setProcessing(true);
                                   if (!user) return;
                                   try {
                                      await submitManualPayment({ userId: user.uid, userEmail: user.email || "", userName: profile?.name || "Student", planId, transactionId: utr });
                                      toast({title:"Submitted", description:"Management will review your activation shortly."});
                                      router.push("/dashboard");
                                   } catch(e) {
                                      toast({variant:"destructive", title:"Sync Error"});
                                   } finally { setProcessing(false); }
                                }}
                                disabled={processing || subscriptionCase === 'LOWER'}
                                className="w-full h-16 bg-slate-200 hover:bg-slate-300 text-slate-700 font-black uppercase tracking-widest text-[10px] rounded-2xl transition-all border-none gap-3"
                             >
                                {processing ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
                                SUBMIT FOR AUDIT
                             </Button>
                          </div>
                       </CardContent>
                    </Card>
                 </TabsContent>
              </Tabs>
           </div>

           <div className="hidden lg:block lg:col-span-5">
              <Card className="border-none shadow-5xl rounded-[3.5rem] bg-[#0B1528] text-white p-12 overflow-hidden sticky top-32">
                 <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12"><Gem className="h-48 w-48" /></div>
                 <div className="relative z-10 space-y-10 text-left">
                    <div className="space-y-4">
                       <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Order Summary</p>
                       <h3 className="text-5xl font-headline font-black uppercase leading-tight">{planData.name}</h3>
                    </div>
                    <div className="space-y-6 pt-10 border-t border-white/5">
                       <div className="flex justify-between items-center text-sm font-bold text-slate-400 uppercase tracking-widest">
                          <span>Institutional Fee</span>
                          <span className="text-white font-black">₹{planData.price}</span>
                       </div>
                       <div className="flex justify-between items-center pt-10 border-t border-white/5">
                          <span className="text-xl font-headline font-black uppercase">Total</span>
                          <span className="text-6xl font-black text-primary tracking-tighter tabular-nums">₹{planData.price}</span>
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
