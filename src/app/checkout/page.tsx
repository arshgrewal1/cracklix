"use client";

import * as React from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  Loader2,
  Copy,
  Gem,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ShieldCheck,
  Tag,
  QrCode
} from "lucide-react";
import { useUser, useDoc, useFirestore } from "@/firebase";
import { submitManualPayment } from "@/app/actions/payment";
import { doc } from "firebase/firestore";
import Script from "next/script";
import { Badge } from "@/components/ui/badge";
import { useSearchParams, useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";

/**
 * @fileOverview Institutional Checkout Hub v21.1.
 * FIXED: Resolved 'lucide-material' import error.
 * FIXED: Corrected useMemo and useDoc hook signatures.
 */
export default function CheckoutPage() {
  return (
    <React.Suspense
      fallback={
        <div className="h-screen flex items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      }
    >
      <CheckoutContent />
    </React.Suspense>
  );
}

function CheckoutContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();

  const planId = searchParams.get("plan") || "monthly-pass";

  const { user, profile, loading } = useUser();
  const dbInstance = useFirestore();

  const [onlineProcessing, setOnlineProcessing] = React.useState(false);
  const [utr, setUtr] = React.useState("");
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [coupon, setCoupon] = React.useState("");
  const [appliedCoupon, setAppliedCoupon] = React.useState<any>(null);
  const [verifyingCoupon, setVerifyingCoupon] = React.useState(false);

  const settingsRef = React.useMemo(
    () => (dbInstance ? doc(dbInstance, "settings", "global") : null), 
    [dbInstance]
  );
  const { data: settings } = useDoc<any>(settingsRef);

  const planRef = React.useMemo(
    () => (dbInstance && planId ? doc(dbInstance, "passes", planId) : null), 
    [dbInstance, planId]
  );
  const { data: planData, loading: planLoading } = useDoc<any>(planRef);

  const upiId = settings?.upiId || "arshdeepgrewal1122-1@oksbi";
  const upiUrl = `upi://pay?pa=${upiId}&pn=Cracklix&cu=INR`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(upiUrl)}`;

  React.useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [user, loading, router]);

  const handleApplyCoupon = async () => {
    if (!coupon.trim()) return;
    setVerifyingCoupon(true);
    try {
       const res = await fetch('/api/coupon/apply', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code: coupon.trim().toUpperCase(), userId: user?.uid })
       });
       const data = await res.json();
       if (res.ok) {
          setAppliedCoupon(data);
          toast({ title: "Coupon Applied", description: `Discount verified.` });
       } else {
          toast({ variant: "destructive", title: "Invalid Code", description: data.error });
       }
    } finally {
       setVerifyingCoupon(false);
    }
  };

  const discountedPrice = React.useMemo(() => {
    if (!planData) return 0;
    const base = Number(planData.price);
    if (!appliedCoupon) return base;
    if (appliedCoupon.type === 'percent') return Math.max(1, base - (base * appliedCoupon.discount / 100));
    return Math.max(1, base - appliedCoupon.discount);
  }, [planData, appliedCoupon]);

  const handlePaymentInitiation = async () => {
    if (!user || !profile || !planData || onlineProcessing) return;

    setErrorMessage(null);
    setOnlineProcessing(true);

    try {
      const res = await fetch("/api/razorpay/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          planId, 
          userId: user.uid,
          couponCode: appliedCoupon ? coupon.trim().toUpperCase() : null
        }),
      });

      const orderData = await res.json();
      
      if (!res.ok) {
        throw new Error(orderData.reason || orderData.error || `Gateway error code ${res.status}`);
      }

      if (!(window as any).Razorpay) {
        throw new Error("Razorpay SDK not loaded. Check connection.");
      }

      const options = {
        key: orderData.key,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Cracklix",
        description: `Elite Pass: ${planData.name}`,
        order_id: orderData.orderId,
        handler: async function (response: any) {
          setOnlineProcessing(true);
          try {
            const verifyRes = await fetch("/api/razorpay/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ ...response, userId: user.uid, planId }),
            });

            const vData = await verifyRes.json();
            if (verifyRes.ok && vData.success) {
              router.push(`/payment/success?order_id=${response.razorpay_order_id}&plan=${encodeURIComponent(planData.name)}`);
            } else {
              throw new Error(vData.reason || "Verification signature mismatch.");
            }
          } catch (err: any) {
             setErrorMessage(err.message);
          } finally {
            setOnlineProcessing(false);
          }
        },
        prefill: {
          name: profile?.name || "Aspirant",
          email: user.email || "",
          contact: profile?.phone?.replace(/\D/g, '').slice(-10) || "",
        },
        theme: { color: "#2563EB" },
        modal: { ondismiss: () => setOnlineProcessing(false) }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (err: any) {
      setErrorMessage(err.message);
      setOnlineProcessing(false);
    }
  };

  const handleManualSubmit = async () => {
    if (!user) return;
    setOnlineProcessing(true);
    try {
      await submitManualPayment({ userId: user.uid, userEmail: user.email || "", userName: profile?.name || "Aspirant", planId, transactionId: utr });
      toast({ title: "Request Staged", description: "Manual verification in progress." });
      router.push("/dashboard");
    } catch (e: any) {
      setErrorMessage(e.message);
    } finally {
      setOnlineProcessing(false);
    }
  };

  if (planLoading) return <div className="h-screen flex items-center justify-center bg-white"><Loader2 className="animate-spin text-primary" /></div>;

  return (
    <div className="min-h-screen bg-slate-50 font-body">
      <Navbar />
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />

      <main className="container mx-auto p-4 md:p-12 max-w-6xl text-left pb-40">
        <div className="flex items-center gap-4 mb-8">
           <button onClick={() => router.back()} className="h-10 w-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center shadow-sm active:scale-95 transition-all"><ArrowLeft className="h-5 w-5" /></button>
           <h1 className="text-2xl md:text-4xl font-black text-[#0F172A] tracking-tight">Checkout Hub</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
           <div className="lg:col-span-8 space-y-6">
              {errorMessage && (
                <div className="p-6 bg-rose-50 border border-rose-100 rounded-[1.5rem] flex items-start gap-4 animate-in slide-in-from-top-4">
                  <AlertCircle className="h-6 w-6 text-rose-500 shrink-0" />
                  <div className="flex-1 space-y-3">
                     <p className="font-bold text-rose-700 leading-tight">Payment Node Failure</p>
                     <p className="text-sm text-rose-600 font-medium">{errorMessage}</p>
                     <Button variant="outline" size="sm" className="h-9 rounded-lg bg-white border-rose-200 text-rose-600 font-bold" onClick={handlePaymentInitiation}>
                        <RefreshCw className="h-3.5 w-3.5 mr-2" /> Retry Sync
                     </Button>
                  </div>
                </div>
              )}

              <Tabs defaultValue="online" className="w-full">
                <TabsList className="grid grid-cols-2 h-14 bg-slate-100 rounded-2xl p-1 mb-6 shadow-inner">
                  <TabsTrigger value="online" className="rounded-xl font-bold text-xs uppercase tracking-widest data-[state=active]:bg-white">Secure Gateway</TabsTrigger>
                  <TabsTrigger value="manual" className="rounded-xl font-bold text-xs uppercase tracking-widest data-[state=active]:bg-white">Manual UPI</TabsTrigger>
                </TabsList>

                <TabsContent value="online">
                  <Card className="p-8 border-none shadow-xl rounded-[2rem] space-y-8 bg-white">
                    <div className="space-y-2">
                       <h2 className="text-xl font-black text-[#0F172A]">Pro Activation</h2>
                       <p className="text-sm text-slate-500 font-medium leading-relaxed">Verified activation via encrypted gateway.</p>
                    </div>

                    <div className="space-y-4 border-y border-slate-50 py-6">
                       <div className="flex items-center justify-between">
                          <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Have a promo code?</Label>
                       </div>
                       <div className="flex gap-2">
                          <div className="relative flex-1">
                             <Tag className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                             <Input 
                                value={coupon} 
                                onChange={e => setCoupon(e.target.value.toUpperCase())} 
                                className="h-12 pl-12 rounded-xl bg-slate-50 border-none font-bold placeholder:text-slate-300 shadow-inner" 
                                placeholder="ENTER CODE" 
                             />
                          </div>
                          <Button onClick={handleApplyCoupon} disabled={!coupon.trim() || verifyingCoupon} className="h-12 px-6 rounded-xl bg-[#0F172A] hover:bg-black font-black uppercase text-[10px]">
                             {verifyingCoupon ? <Loader2 className="h-4 w-4 animate-spin" /> : "Apply"}
                          </Button>
                       </div>
                    </div>

                    <Button onClick={handlePaymentInitiation} disabled={onlineProcessing} className="w-full h-16 bg-primary hover:bg-blue-700 text-white font-black uppercase tracking-widest rounded-2xl shadow-xl gap-3 text-[10px]">
                      {onlineProcessing ? <Loader2 className="h-5 w-5 animate-spin" /> : <ShieldCheck className="h-5 w-5" />}
                      Pay ₹{discountedPrice} Now
                    </Button>
                  </Card>
                </TabsContent>

                <TabsContent value="manual">
                  <Card className="p-8 border-none shadow-xl rounded-[2rem] space-y-8 bg-white">
                    <div className="space-y-2">
                       <h2 className="text-xl font-black text-[#0F172A]">Manual Audit</h2>
                       <p className="text-sm text-slate-500 font-medium leading-relaxed">Scan the official QR below to complete your payment.</p>
                    </div>

                    <div className="flex flex-col md:flex-row gap-10 items-center justify-center">
                       <div className="w-full md:w-1/2 flex flex-col items-center gap-4">
                          <div className="relative h-64 w-64 md:h-80 md:w-80 bg-white rounded-[2.5rem] border-2 border-slate-100 flex items-center justify-center overflow-hidden shadow-2xl p-6 group transition-all hover:border-primary/30">
                             <div className="relative w-full h-full">
                                <Image 
                                  src={qrCodeUrl} 
                                  alt="UPI QR Code" 
                                  fill 
                                  className="object-contain"
                                  unoptimized
                                />
                             </div>
                             <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                          </div>
                          <div className="flex items-center gap-2 text-slate-400 bg-slate-50 px-4 py-2 rounded-full border border-slate-100 shadow-sm">
                             <ShieldCheck className="h-4 w-4 text-emerald-500" />
                             <p className="text-[10px] font-bold uppercase tracking-widest">Scan with any UPI App</p>
                          </div>
                       </div>

                       <div className="w-full md:w-1/2 space-y-6">
                          <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between shadow-sm">
                             <div className="space-y-0.5">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Payable To</p>
                                <p className="text-sm font-bold text-[#0F172A]">Cracklix Prep Hub</p>
                             </div>
                             <Gem className="h-5 w-5 text-primary" />
                          </div>

                          <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between shadow-sm">
                             <div className="space-y-0.5">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">UPI ID</p>
                                <p className="text-sm font-bold text-primary">{upiId}</p>
                             </div>
                             <Button variant="ghost" size="icon" onClick={() => { navigator.clipboard.writeText(upiId); toast({ title: "Copied" }); }}><Copy className="h-4 w-4" /></Button>
                          </div>
                          
                          <div className="space-y-2">
                             <Label className="text-[9px] font-black uppercase text-slate-400 ml-1">After Payment: Enter UTR / Transaction ID</Label>
                             <Input 
                                value={utr} 
                                onChange={(e) => setUtr(e.target.value.replace(/\D/g, "").slice(0, 12))} 
                                placeholder="12 digit UTR Number" 
                                className="h-14 rounded-xl border-slate-100 bg-slate-50 font-bold shadow-inner" 
                             />
                          </div>

                          <Button 
                             disabled={utr.length < 12 || onlineProcessing} 
                             className="w-full h-16 bg-[#0F172A] hover:bg-black text-white font-black uppercase tracking-widest rounded-2xl shadow-xl text-[10px] border-none" 
                             onClick={handleManualSubmit}
                          >
                             {onlineProcessing ? <Loader2 className="h-5 w-5 animate-spin" /> : "Verify Transaction"}
                          </Button>
                       </div>
                    </div>
                  </Card>
                </TabsContent>
              </Tabs>
           </div>

           <div className="lg:col-span-4 space-y-6">
              <Card className="p-8 border-none shadow-xl rounded-[2rem] bg-white space-y-8 sticky top-24 border border-slate-50">
                 <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                       <Gem className="h-6 w-6" />
                    </div>
                    <div className="space-y-0.5 text-left">
                       <h3 className="text-lg font-black uppercase tracking-tight text-[#0F172A]">{planData?.name}</h3>
                       <Badge className="bg-emerald-50 text-emerald-600 border-none font-black text-[9px] uppercase px-2">{planData?.durationDays} Days Hub</Badge>
                    </div>
                 </div>
                 
                 <div className="space-y-4">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Summary</p>
                    <div className="space-y-3">
                       <div className="flex justify-between items-center text-sm font-medium text-slate-500">
                          <span>Base Price</span>
                          <span>₹{planData?.price}</span>
                       </div>
                       {appliedCoupon && (
                          <div className="flex justify-between items-center text-sm font-bold text-emerald-600">
                             <span className="flex items-center gap-2"><Tag className="h-3 w-3" /> Discount</span>
                             <span>-₹{planData.price - discountedPrice}</span>
                          </div>
                       )}
                       <div className="pt-4 border-t border-slate-50 flex justify-between items-center">
                          <span className="font-bold text-[#0F172A]">Total</span>
                          <span className="text-3xl font-black text-primary">₹{discountedPrice}</span>
                       </div>
                    </div>
                 </div>

                 <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl flex items-start gap-3">
                    <ShieldCheck className="h-5 w-5 text-blue-600 shrink-0" />
                    <p className="text-[10px] text-blue-700 font-bold uppercase leading-relaxed">
                       Your preparation node will be activated immediately after verification.
                    </p>
                 </div>
              </Card>
           </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
