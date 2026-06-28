"use client";

import React, { Suspense, useMemo, useState, useEffect } from "react";
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
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { useUser, useDoc, useFirestore } from "@/firebase";
import { activateFreePass, submitManualPayment } from "@/app/actions/payment";
import { doc } from "firebase/firestore";
import Script from "next/script";
import { Badge } from "@/components/ui/badge";
import { useSearchParams, useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="h-screen flex items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin" />
        </div>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
}

function CheckoutContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();

  const planId = searchParams.get("plan") || "monthly-pass";

  const { user, profile, loading } = useUser();
  const dbInstance = useFirestore();

  const [onlineProcessing, setOnlineProcessing] = useState(false);
  const [utr, setUtr] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { data: settings } = useDoc<any>(
    useMemo(
      () =>
        dbInstance ? doc(dbInstance, "settings", "global") : null,
      [dbInstance]
    )
  );

  const { data: planData, loading: planLoading } = useDoc<any>(
    useMemo(
      () =>
        dbInstance && planId
          ? doc(dbInstance, "passes", planId)
          : null,
      [dbInstance, planId]
    )
  );

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [user, loading, router]);

  const handlePaymentInitiation = async () => {
    if (!user || !profile || !planData || onlineProcessing) return;

    setErrorMessage(null);
    const price = Number(planData?.price || 0);

    if (price === 0) {
      setOnlineProcessing(true);
      try {
        await activateFreePass(user.uid, planId);
        router.push("/dashboard");
      } catch (e) {
        setErrorMessage("Failed to activate free pass.");
      } finally {
        setOnlineProcessing(false);
      }
      return;
    }

    setOnlineProcessing(true);

    console.log("[CHECKOUT REQUEST]", { planId, userId: user?.uid });

    try {
      const res = await fetch("/api/razorpay/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId,
          userId: user.uid,
        }),
      });

      const responseText = await res.text();
      let orderData;
      
      try {
        orderData = JSON.parse(responseText);
      } catch (e) {
        console.error("[JSON_PARSE_ERROR]", responseText);
        throw new Error("Server returned a malformed response. Please try again.");
      }

      if (!res.ok) {
        console.error("[ORDER_API_ERROR]", orderData);
        throw new Error(orderData.reason || orderData.error || `Server error: ${res.status}`);
      }

      if (!(window as any).Razorpay) {
        throw new Error("Razorpay SDK not loaded. Check your connection.");
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
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                userId: user.uid,
                planId,
              }),
            });

            const verifyData = await verifyRes.json();

            if (verifyRes.ok && verifyData.success) {
              router.push(`/payment/success?order_id=${response.razorpay_order_id}&plan=${encodeURIComponent(planData.name)}`);
            } else {
              throw new Error(verifyData.reason || "Payment verification failed.");
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
        modal: {
          ondismiss: () => {
            setOnlineProcessing(false);
          },
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on("payment.failed", function (resp: any) {
        setErrorMessage(resp?.error?.description || "Payment failed");
        setOnlineProcessing(false);
      });
      rzp.open();
    } catch (err: any) {
      console.error("[CHECKOUT_CATCH_ERROR]", err);
      setErrorMessage(err.message);
      setOnlineProcessing(false);
    }
  };

  if (planLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin" />
      </div>
    );
  }

  if (!planData) {
    return (
      <div className="h-screen flex flex-col items-center justify-center gap-4">
        <AlertCircle className="h-10 w-10 text-slate-300" />
        <span className="font-bold">Plan Not Found</span>
        <Button onClick={() => router.push('/pass')}>Return to Plans</Button>
      </div>
    );
  }

  const upiId = settings?.upiId || "arshdeepgrewal1122-1@oksbi";

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="lazyOnload"
      />

      <main className="container mx-auto p-4 md:p-12 max-w-4xl text-left">
        <div className="flex items-center gap-4 mb-8">
           <button onClick={() => router.back()} className="h-10 w-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center shadow-sm"><ArrowLeft className="h-5 w-5" /></button>
           <h1 className="text-2xl md:text-4xl font-black text-[#0F172A]">Checkout</h1>
        </div>

        {errorMessage && (
          <div className="p-6 mb-8 bg-rose-50 border border-rose-100 rounded-[1.5rem] flex items-start gap-4 animate-in slide-in-from-top-4">
            <AlertCircle className="h-6 w-6 text-rose-500 shrink-0" />
            <div className="flex-1 space-y-3">
               <p className="font-bold text-rose-700 leading-tight">Order Audit Failure</p>
               <p className="text-sm text-rose-600 font-medium">{errorMessage}</p>
               <Button variant="outline" size="sm" className="h-9 px-4 rounded-lg bg-white border-rose-200 text-rose-600 font-bold" onClick={handlePaymentInitiation}>
                  <RefreshCw className="h-3.5 w-3.5 mr-2" /> Retry Handshake
               </Button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
           <div className="lg:col-span-7 space-y-6">
              <Tabs defaultValue="online" className="w-full">
                <TabsList className="grid grid-cols-2 h-14 bg-slate-100 rounded-2xl p-1 mb-6">
                  <TabsTrigger value="online" className="rounded-xl font-bold text-xs uppercase tracking-widest data-[state=active]:bg-white">Secure Gateway</TabsTrigger>
                  <TabsTrigger value="manual" className="rounded-xl font-bold text-xs uppercase tracking-widest data-[state=active]:bg-white">Manual UPI</TabsTrigger>
                </TabsList>

                <TabsContent value="online">
                  <Card className="p-8 border-none shadow-xl rounded-[2rem] space-y-8 bg-white">
                    <div className="space-y-2">
                       <h2 className="text-xl font-black">Pay Securely</h2>
                       <p className="text-sm text-slate-500 font-medium">Automatic pass activation via Razorpay.</p>
                    </div>
                    <Button
                      onClick={handlePaymentInitiation}
                      disabled={onlineProcessing}
                      className="w-full h-16 bg-primary hover:bg-blue-700 text-white font-black uppercase tracking-widest rounded-2xl shadow-xl gap-3 text-[10px]"
                    >
                      {onlineProcessing ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <ShieldCheck className="h-5 w-5" />
                      )}
                      Pay ₹{planData.price} Now
                    </Button>
                  </Card>
                </TabsContent>

                <TabsContent value="manual">
                  <Card className="p-8 border-none shadow-xl rounded-[2rem] space-y-8 bg-white">
                    <div className="space-y-2">
                       <h2 className="text-xl font-black">Manual Verification</h2>
                       <p className="text-sm text-slate-500 font-medium">Pay via UPI and enter UTR for manual audit.</p>
                    </div>

                    <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                       <div className="space-y-0.5">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Business UPI ID</p>
                          <p className="text-sm font-bold text-primary">{upiId}</p>
                       </div>
                       <Button variant="ghost" size="icon" onClick={() => { navigator.clipboard.writeText(upiId); toast({ title: "Copied" }); }}><Copy className="h-4 w-4" /></Button>
                    </div>

                    <div className="space-y-2">
                       <Label className="text-[9px] font-black uppercase text-slate-400 ml-1">UTR / Transaction ID</Label>
                       <Input
                         value={utr}
                         onChange={(e) => setUtr(e.target.value.replace(/\D/g, "").slice(0, 12))}
                         placeholder="12 digit UTR number"
                         className="h-14 rounded-xl border-slate-200 bg-slate-50 font-bold"
                       />
                    </div>

                    <Button
                      disabled={utr.length < 12 || onlineProcessing}
                      className="w-full h-16 bg-[#0F172A] hover:bg-black text-white font-black uppercase tracking-widest rounded-2xl shadow-xl text-[10px]"
                      onClick={async () => {
                        if (!user) return;
                        setOnlineProcessing(true);
                        try {
                          await submitManualPayment({
                            userId: user.uid,
                            userEmail: user.email || "",
                            userName: profile?.name || "User",
                            planId,
                            transactionId: utr,
                          });
                          toast({ title: "Request Staged", description: "Audit will be completed within 12 hours." });
                          router.push("/dashboard");
                        } catch (e: any) {
                          setErrorMessage(e.message);
                        } finally {
                          setOnlineProcessing(false);
                        }
                      }}
                    >
                      Submit for Verification
                    </Button>
                  </Card>
                </TabsContent>
              </Tabs>
           </div>

           <div className="lg:col-span-5">
              <Card className="p-8 border-none shadow-xl rounded-[2rem] bg-white space-y-8 sticky top-24">
                 <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                       <Gem className="h-6 w-6" />
                    </div>
                    <div className="space-y-0.5">
                       <h3 className="text-lg font-black uppercase tracking-tight">{planData.name}</h3>
                       <Badge className="bg-emerald-50 text-emerald-600 border-none font-black text-[9px] uppercase px-2">{planData.durationDays} Days</Badge>
                    </div>
                 </div>

                 <div className="space-y-4">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Premium Benefits</p>
                    <div className="space-y-3">
                       {planData.features?.map((f: string, i: number) => (
                          <div key={i} className="flex items-start gap-3">
                             <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                             <span className="text-sm font-medium text-slate-600">{f}</span>
                          </div>
                       ))}
                    </div>
                 </div>

                 <div className="pt-6 border-t border-slate-50 flex justify-between items-center">
                    <span className="font-bold text-slate-400">Total Payable</span>
                    <span className="text-3xl font-black text-primary">₹{planData.price}</span>
                 </div>
              </Card>
           </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
