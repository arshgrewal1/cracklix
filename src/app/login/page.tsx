'use client';

import React, { useState, Suspense, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Logo from "@/components/brand/Logo";
import { 
  Loader2, 
  ShieldCheck, 
  Zap, 
  Lock,
  MousePointer2,
  Shield
} from "lucide-react";
import { useAuth, useFirestore, useUser } from "@/firebase";
import { 
  signInWithPopup, 
  signInWithRedirect,
  GoogleAuthProvider
} from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp, updateDoc, increment } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { generateReferralCode } from "@/lib/referral";
import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * @fileOverview Premium Single-Page Login Hub v4.0.
 * UX: Single-page, one-tap authentication. No intermediate screens.
 * LOGIC: Atomic Google Sign-In with popup/redirect fallback.
 */

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="h-screen w-full flex items-center justify-center bg-white"><Loader2 className="h-10 w-10 text-primary animate-spin" /></div>}>
      <LoginContent />
    </Suspense>
  )
}

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const auth = useAuth();
  const db = useFirestore();
  const { toast } = useToast();
  const { user, loading: authLoading } = useUser();

  const [isConnecting, setIsConnecting] = useState(false);
  
  const returnUrl = useMemo(() => searchParams?.get("returnUrl") || "/", [searchParams]);
  const referralFromUrl = useMemo(() => searchParams?.get("ref"), [searchParams]);

  // Direct redirect if already authenticated
  useEffect(() => {
    if (!authLoading && user && !isConnecting) {
      router.replace(returnUrl);
    }
  }, [user, authLoading, router, returnUrl, isConnecting]);

  const handleGoogleSignIn = async () => {
    if (!auth || !db || isConnecting) return;
    
    setIsConnecting(true);
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });

    try {
      // 1. Primary Attempt: Popup (Sleekest experience)
      const result = await signInWithPopup(auth, provider);
      await finalizeUserNode(result.user);
      router.replace(returnUrl);
    } catch (error: any) {
      // 2. Fallback: Redirect (If popup blocked or unsupported)
      if (error.code === 'auth/popup-blocked' || error.code === 'auth/cancelled-popup-request') {
        try {
          await signInWithRedirect(auth, provider);
        } catch (redirectError: any) {
          toast({ variant: "destructive", title: "Login Failed", description: redirectError.message });
          setIsConnecting(false);
        }
      } else if (error.code !== 'auth/popup-closed-by-user') {
        toast({ variant: "destructive", title: "Authentication Error", description: error.message });
        setIsConnecting(false);
      } else {
        setIsConnecting(false);
      }
    }
  };

  const finalizeUserNode = async (userNode: any) => {
    const userRef = doc(db!, 'users', userNode.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      await setDoc(userRef, {
        id: userNode.uid,
        name: userNode.displayName || "Aspirant",
        email: userNode.email,
        role: 'STUDENT',
        state: "Punjab",
        createdAt: new Date().toISOString(),
        updatedAt: serverTimestamp(),
        status: 'Free',
        passType: 'FREE',
        pinnedExams: [],
        referralCode: generateReferralCode(userNode.uid),
        referredBy: referralFromUrl || null,
        coins: 0
      });

      await updateDoc(doc(db!, 'settings', 'stats'), {
        totalUsers: increment(1),
        updatedAt: serverTimestamp()
      }).catch(() => {});
    }
  };

  return (
    <div className="min-h-[100dvh] bg-[#F8FAFC] flex flex-col items-center justify-center p-4 md:p-8 font-body selection:bg-primary/20">
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="w-full max-w-[440px]"
      >
        <Card className="border border-slate-100 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.08)] bg-white rounded-[32px] overflow-hidden flex flex-col items-center p-8 md:p-14 text-center">
          
          <div className="mb-10">
            <Logo variant="light" align="center" className="h-16 md:h-20" imgClassName="h-full w-auto" />
          </div>

          <div className="space-y-3 mb-10 text-left w-full">
            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-[#0F172A] antialiased">
              Welcome back
            </h1>
            <p className="text-slate-400 font-medium text-sm md:text-base leading-snug tracking-tight">
              Continue your preparation with one secure login.
            </p>
          </div>

          <div className="flex items-center justify-start gap-4 md:gap-6 mb-12 w-full px-1">
             <BenefitNode icon={<Zap className="h-3.5 w-3.5" />} label="Fast" />
             <BenefitNode icon={<ShieldCheck className="h-3.5 w-3.5" />} label="Secure" />
             <BenefitNode icon={<MousePointer2 className="h-3.5 w-3.5" />} label="One Tap" />
          </div>

          <div className="w-full space-y-8">
             <Button 
                onClick={handleGoogleSignIn}
                disabled={isConnecting}
                className="w-full h-14 md:h-16 bg-white hover:bg-slate-50 border-2 border-slate-100 text-[#0F172A] rounded-2xl font-bold text-base md:text-lg shadow-sm transition-all duration-300 active:scale-[0.98] flex items-center justify-center gap-4 relative overflow-hidden"
             >
                <div className="shrink-0">
                  <Image src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" width={24} height={24} className={cn("h-6 w-6", isConnecting && "animate-pulse")} alt="Google" />
                </div>
                <span>{isConnecting ? 'Syncing...' : 'Continue with Google'}</span>
             </Button>

             <div className="space-y-4 pt-4 border-t border-slate-50 flex flex-col items-center">
                <div className="flex items-center gap-3 text-slate-300">
                   <Lock className="h-4 w-4" />
                   <div className="w-px h-3 bg-slate-100" />
                   <p className="text-[10px] md:text-[11px] font-bold text-slate-400 tracking-tight leading-relaxed max-w-[280px] text-left">
                     Your data is encrypted and secure. We never post without permission.
                   </p>
                </div>
             </div>
          </div>

        </Card>

        <div className="mt-12 flex items-center justify-center gap-2 text-slate-400">
           <Shield className="h-3.5 w-3.5 text-emerald-500" />
           <span className="text-[9px] font-black uppercase tracking-[0.3em] antialiased">Institutional Hub Secure</span>
        </div>
      </motion.div>
    </div>
  )
}

function BenefitNode({ icon, label }: { icon: React.ReactNode, label: string }) {
  return (
    <div className="flex items-center gap-2 text-slate-400">
       <span className="text-primary">{icon}</span>
       <span className="text-[10px] md:text-[11px] font-black uppercase tracking-widest">{label}</span>
    </div>
  )
}
