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
  Gem,
  ShieldCheck,
  Tag,
  AlertCircle
} from "lucide-react";
import { useUser, useDoc, useFirestore } from "@/firebase";
import { submitManualPayment } from "@/app/actions/payment";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import Script from "next/script";
import { Badge } from "@/components/ui/badge";
import { useSearchParams, useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";

/**
 * @fileOverview Official Checkout Hub v3.7.
 * FIXED: Cleaned up syntax errors and ensured robust state management.
 */

export default function CheckoutPage() {
  return (
    <React.Suspense fallback={<div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>}>
      <CheckoutContent />
    </React.Suspense>
  );
}

function CheckoutContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();

  const planId = searchParams?.get("plan") || "monthly-pass";
  const { user, profile, loading } = useUser();
  const db = useFirestore();

  const [onlineProcessing, setOnlineProcessing] = React.useState(false);
  const [utr, setUtr] = React.useState("");
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [coupon, setCoupon] = React.useState("");
  const [appliedCoupon, setAppliedCoupon] = React.useState<any>(null);
  const [verifyingCoupon, setVerifyingCoupon] = React.useState(false);

  const planRef = React.useMemo(() => (db && planId ? doc(db, "passes", planId) : null), [db, planId]);
  const { data: planData, loading: planLoading } = useDoc<any>(planRef);

  const upiId = "arshdeepgrewal1122-1@oksbi";
  const upiUrl = `upi://pay?pa=${upiId}&pn=Cracklix&cu=INR`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(upiUrl)}`;

  const handleApplyCoupon = async () => {
    if (!coupon.trim()) return;
    setVerifyingCoupon(true);
    try {
       const res = await fetch('/api/coupon/apply', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code: coupon.trim().toUpperCase() })
       });
       const data = await res.json();
       if (res.ok && !data.error) {
          setAppliedCoupon(data);
          toast({ title: "Coupon Applied" });
       } else {
          toast({ variant: "destructive", title: "Invalid Coupon" });
       }
    } finally {
       setVerifyingCoupon(false);
    }
  };

  const discountedPrice = React.useMemo(() => {
    if (!planData) return 0;
    const base = Number(planData.price) || 0;
    if (!appliedCoupon) return base;
    if (appliedCoupon.type === 'percent') return Math.max(1, base - (base * (Number(appliedCoupon.discount) || 0) / 100));
    return Math.max(1, base - (Number(appliedCoupon.discount) || 0));
  }, [planData, appliedCoupon]);

  const handlePaymentInitiation = async () => {
    if (!user || !planData || onlineProcessing) return;
    setOnlineProcessing(true);

    try {
      const res = await fetch("/api/razorpay/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId, userId: user.uid, couponCode: appliedCoupon ? coupon : null }),
      });

      const orderData = await res.json();
      if (!res.ok) throw new Error(orderData.error || "Order creation failed.");

      const options = {
        key: orderData.key,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Cracklix",
        description: `Pass: ${planData.name}`,
        order_id: orderData.orderId,
        handler: async function (response: any) {
          try {
            const verifyRes = await fetch("/api/razorpay/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ ...response, userId: user.uid, planId }),
            });
            if (verifyRes.ok) {
              const expiry = new Date();
              expiry.setDate(expiry.getDate() + (planData.durationDays || 30));
              
              await updateDoc(doc(db, "users", user.uid), {
                passStatus: 'active',
                passExpiresAt: expiry.toISOString(),
                status: planId,
                updatedAt: serverTimestamp()
              });

              router.push(`/payment/success?order_id=${response.razorpay_order_id}&plan=${encodeURIComponent(planData.name)}`);
            } else {
              throw new Error("Verification node failed.");
            }
          } catch (err: any) {
             setErrorMessage(err.message);
          }
        },
        prefill: {
          name: profile?.name || "",
          email: user.email || "",
          contact: profile?.phone || "",
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
    if (!user || !utr) return;
    setOnlineProcessing(true);
    try {
      await submitManualPayment({ userId: user.uid, userEmail: user.email || "", userName: profile?.name || "Aspirant", planId, transactionId: utr });
      toast({ title: "Audit Staged", description: "Verification node under review." });
      router.push("/dashboard");
    } catch (e: any) {
      setErrorMessage(e.message);
    } finally {
      setOnlineProcessing(false);
    }
  };

  if (planLoading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>;

  return (
    <div className="min-h-screen bg-slate-50 font-body">
      <Navbar />
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />

      <main className="container mx-auto p-4 md:p-12 max-w-6xl text-left pb-40">
        <div className="flex items-center gap-4 mb-8">
           <button onClick={() => router.back()} className="h-10 w-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center shadow-sm transition-all"><ArrowLeft className="h-5 w-5" /></button>
           <h1 className="text-2xl md:text-4xl font-black text-[#0F172A] tracking-tight">Checkout Hub</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
           <div className="lg:col-span-8 space-y-6">
              {errorMessage && (
                <div className="p-6 bg-rose-50 border border-rose-100 rounded-2xl flex items-start gap-4">
                  <AlertCircle className="h-6 w-6 text-rose-500 shrink-0" />
                  <p className="text-sm text-rose-600 font-medium">{errorMessage}</p>
                </div>
              )}

              <Tabs defaultValue="online" className="w-full">
                <TabsList className="grid grid-cols-2 h-14 bg-slate-100 rounded-2xl p-1 mb-6">
                  <TabsTrigger value="online" className="rounded-xl font-bold text-xs uppercase tracking-widest data-[state=active]:bg-white">Secure Gateway</TabsTrigger>
                  <TabsTrigger value="manual" className="rounded-xl font-bold text-xs uppercase tracking-widest data-[state=active]:bg-white">Manual UPI</TabsTrigger>
                </TabsList>

                <TabsContent value="online">
                  <Card className="p-8 border-none shadow-xl rounded-[2rem] space-y-8 bg-white">
                    <div className="space-y-4">
                       <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Promo Code (Optional)</Label>
                       <div className="flex gap-2">
                          <Input 
                             value={coupon} 
                             onChange={e => setCoupon(e.target.value.toUpperCase())} 
                             className="h-12 rounded-xl bg-slate-50 border-none font-bold" 
                             placeholder="PROMOCODE" 
                          />
                          <Button onClick={handleApplyCoupon} disabled={!coupon.trim() || verifyingCoupon} className="h-12 px-6 bg-[#0F172A] hover:bg-black">
                             {verifyingCoupon ? <Loader2 className="h-4 w-4 animate-spin" /> : "Apply"}
                          </Button>
                       </div>
                    </div>

                    <Button onClick={handlePaymentInitiation} disabled={onlineProcessing} className="w-full h-16 bg-primary hover:bg-blue-700 text-white font-black uppercase tracking-widest rounded-2xl shadow-xl gap-3">
                      {onlineProcessing ? <Loader2 className="h-5 w-5 animate-spin" /> : <ShieldCheck className="h-5 w-5" />}
                      Pay ₹{discountedPrice}
                    </Button>
                  </Card>
                </TabsContent>

                <TabsContent value="manual">
                  <Card className="p-8 border-none shadow-xl rounded-[2.5rem] bg-white text-center space-y-10">
                     <div className="relative h-64 w-64 md:h-80 md:w-80 mx-auto bg-white rounded-[2rem] border-2 border-slate-100 flex items-center justify-center overflow-hidden shadow-2xl p-6">
                        <Image src={qrCodeUrl} alt="UPI QR" fill className="object-contain" unoptimized />
                     </div>
                     <div className="space-y-6 max-w-sm mx-auto">
                        <div className="space-y-2">
                           <Label className="text-[9px] font-black uppercase text-slate-400">12 Digit UTR Number</Label>
                           <Input 
                             value={utr} 
                             onChange={(e) => setUtr(e.target.value.replace(/\D/g, "").slice(0, 12))} 
                             placeholder="000000000000" 
                             className="h-14 rounded-xl border-slate-100 bg-slate-50 font-black text-center text-xl tracking-[0.2em]" 
                           />
                        </div>
                        <Button 
                           disabled={utr.length < 12 || onlineProcessing} 
                           className="w-full h-16 bg-[#0F172A] hover:bg-black text-white font-black uppercase tracking-widest rounded-2xl" 
                           onClick={handleManualSubmit}
                        >
                           Submit Transaction
                        </Button>
                     </div>
                  </Card>
                </TabsContent>
              </Tabs>
           </div>

           <div className="lg:col-span-4">
              <Card className="p-8 border-none shadow-xl rounded-[2rem] bg-white space-y-8 sticky top-24 border border-slate-100">
                 <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                       <Gem className="h-6 w-6" />
                    </div>
                    <div className="text-left min-w-0">
                       <h3 className="text-lg font-black uppercase tracking-tight text-[#0F172A] truncate">{planData?.name}</h3>
                       <Badge className="bg-emerald-50 text-emerald-600 border-none font-black text-[9px] uppercase">{planData?.durationDays} Days</Badge>
                    </div>
                 </div>
                 
                 <div className="space-y-4 pt-4 border-t border-slate-50">
                    <div className="flex justify-between items-center text-sm font-medium text-slate-500">
                       <span>Base Price</span>
                       <span>₹{planData?.price}</span>
                    </div>
                    <div className="pt-4 flex justify-between items-center">
                       <span className="font-bold text-[#0F172A]">Total Amount</span>
                       <span className="text-3xl font-black text-primary">₹{discountedPrice}</span>
                    </div>
                 </div>
              </Card>
           </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
