'use client';

import React, { useState, Suspense, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Logo from "@/components/brand/Logo";
import { 
  Loader2, 
  ShieldCheck, 
  Zap, 
  Lock,
  Mail,
  KeyRound,
  Eye,
  EyeOff,
  ArrowRight,
  Star,
  AlertCircle
} from "lucide-react";
import { useAuth, useFirestore, useUser } from "@/firebase";
import { 
  signInWithPopup, 
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  browserLocalPersistence,
  setPersistence,
  getRedirectResult,
  signInWithRedirect
} from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp, updateDoc, increment } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { generateReferralCode } from "@/lib/referral";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { getDeviceId } from "@/lib/device";

/**
 * @fileOverview Premium Institutional Auth Portal v16.5 [Safety Notice Added].
 * FIXED: Added red 'Spam check' notice to Forgot Password section.
 * FIXED: Optimized atomic handshake to eliminate "blank page" hangs.
 */

type AuthMode = 'signin' | 'signup' | 'forgot';

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="h-screen w-full flex flex-col items-center justify-center bg-white"><Loader2 className="h-10 w-10 text-primary animate-spin" /></div>}>
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

  const [mode, setMode] = useState<AuthMode>('signin');
  const [isConnecting, setIsConnecting] = useState(false);
  const [isRedirectProcessing, setIsRedirectProcessing] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  
  const returnUrl = useMemo(() => searchParams?.get("returnUrl") || "/", [searchParams]);
  const referralFromUrl = useMemo(() => searchParams?.get("ref"), [searchParams]);

  // 1. ATOMIC REDIRECT RECOVERY
  useEffect(() => {
    if (!auth || !db) return;

    const handleHandshake = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result?.user) {
          finalizeUserNode(result.user, result.user.displayName || "Aspirant");
          router.replace(returnUrl);
        } else {
          setIsRedirectProcessing(false);
        }
      } catch (error: any) {
        setIsRedirectProcessing(false);
        if (error.code !== 'auth/no-auth-event') {
          console.error("[AUTH_REDIRECT_ERROR]:", error);
          toast({ variant: "destructive", title: "Handshake Failed", description: error.message });
        }
      }
    };

    handleHandshake();
  }, [auth, db, router, returnUrl, toast]);

  // 2. SESSION SYNC
  useEffect(() => {
    if (!authLoading && !isRedirectProcessing && user && !isConnecting) {
      router.replace(returnUrl);
    }
  }, [user, authLoading, isRedirectProcessing, router, returnUrl, isConnecting]);

  const handleGoogleSignIn = async () => {
    if (!auth || !db || isConnecting) return;
    
    setIsConnecting(true);
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    
    try {
      await setPersistence(auth, browserLocalPersistence);
      
      const isStandalone = typeof window !== 'undefined' && (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone);
      const isMobile = typeof navigator !== 'undefined' && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

      if (isStandalone || isMobile) {
        await signInWithRedirect(auth, provider);
        return;
      }

      try {
        const result = await signInWithPopup(auth, provider);
        if (result.user) {
          finalizeUserNode(result.user, result.user.displayName || "Aspirant");
          router.replace(returnUrl);
        }
      } catch (e: any) {
         if (e.code === 'auth/popup-blocked' || e.code === 'auth/popup-closed-by-user') {
            await signInWithRedirect(auth, provider);
         } else {
            throw e;
         }
      }
    } catch (error: any) {
      toast({ variant: "destructive", title: "Login failed", description: "Identity sync error." });
      setIsConnecting(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth || !db || isConnecting) return;
    setIsConnecting(true);
    try {
      await setPersistence(auth, browserLocalPersistence);
      if (mode === 'signin') {
        const result = await signInWithEmailAndPassword(auth, email, password);
        finalizeUserNode(result.user);
        router.replace(returnUrl);
      } else if (mode === 'signup') {
        const result = await createUserWithEmailAndPassword(auth, email, password);
        finalizeUserNode(result.user, name);
        router.replace(returnUrl);
      } else if (mode === 'forgot') {
        await sendPasswordResetEmail(auth, email);
        toast({ title: "Reset link sent" });
        setMode('signin');
        setIsConnecting(false);
      }
    } catch (error: any) {
      toast({ variant: "destructive", title: "Auth failed", description: error.message });
      setIsConnecting(false);
    }
  };

  const finalizeUserNode = async (userNode: any, customName?: string) => {
    if (!db) return;
    const deviceId = await getDeviceId();
    const userRef = doc(db, 'users', userNode.uid);
    
    try {
      const userSnap = await getDoc(userRef);
      if (!userSnap.exists()) {
        setDoc(userRef, {
          id: userNode.uid,
          name: customName || userNode.displayName || "Aspirant",
          email: userNode.email,
          role: 'STUDENT',
          state: "Punjab",
          createdAt: new Date().toISOString(),
          updatedAt: serverTimestamp(),
          lastLoginAt: serverTimestamp(),
          activeDeviceId: deviceId,
          status: 'Free',
          pinnedExams: [],
          referralCode: generateReferralCode(userNode.uid),
          referredBy: referralFromUrl || null
        }, { merge: true });
        updateDoc(doc(db, 'settings', 'stats'), { totalUsers: increment(1), updatedAt: serverTimestamp() }).catch(() => {});
      } else {
        updateDoc(userRef, { 
          lastLoginAt: serverTimestamp(), 
          activeDeviceId: deviceId, 
          updatedAt: serverTimestamp(),
          online: true 
        }).catch(() => {});
      }
      if (typeof window !== 'undefined') localStorage.setItem('cracklix_session_id', deviceId);
    } catch (e) {
      console.warn("[AUTH_SYNC_WARNING]:", e);
    }
  };

  if (isRedirectProcessing || (authLoading && !user)) {
     return (
        <div className="min-h-screen w-full flex flex-col items-center justify-center bg-white space-y-6">
           <div className="relative">
              <Zap className="h-10 w-10 text-primary animate-pulse" />
              <Loader2 className="absolute -bottom-2 -right-2 h-6 w-6 text-primary animate-spin" />
           </div>
           <div className="text-center space-y-1">
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Authenticating</p>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Verifying Database Node...</p>
           </div>
        </div>
     );
  }

  return (
    <div className="min-h-[100dvh] bg-[#F8FAFC] flex flex-col items-center justify-center p-4 md:p-8 font-body selection:bg-primary/20">
      <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-[460px]">
        <Card className="border border-slate-100 shadow-[0_40px_100px_-12px_rgba(0,0,0,0.08)] bg-white rounded-[40px] overflow-hidden flex flex-col p-8 md:p-14">
          
          <div className="mb-14 flex justify-center w-full overflow-visible">
            <Logo variant="light" align="center" className="h-20 md:h-28" imgClassName="h-full w-auto" />
          </div>

          <AnimatePresence mode="wait">
            <motion.div key={mode} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8 w-full">
              <div className="space-y-1.5 text-center">
                <h1 className="text-2xl md:text-3xl font-[900] tracking-tighter text-[#0F172A] uppercase leading-none">
                  {mode === 'signin' ? 'Welcome back' : mode === 'signup' ? 'Create account' : 'Recover access'}
                </h1>
                <p className="text-slate-400 font-medium text-[12px] md:text-base">Continue your preparation journey.</p>
              </div>

              <div className="space-y-6">
                 {mode === 'forgot' && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95 }} 
                      animate={{ opacity: 1, scale: 1 }}
                      className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-start gap-3"
                    >
                       <AlertCircle className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" />
                       <p className="text-rose-600 font-bold text-[10px] leading-relaxed">
                          Please check your <span className="underline">Spam folder</span> in your mail for the reset link if it doesn't appear in Inbox.
                       </p>
                    </motion.div>
                 )}

                 <form onSubmit={handleEmailAuth} className="space-y-4">
                    {mode === 'signup' && (
                       <div className="space-y-1.5 text-left">
                          <Label className="text-[9px] font-black uppercase text-slate-400 ml-1 tracking-widest">Full name</Label>
                          <Input value={name} onChange={e => setName(e.target.value)} placeholder="Arsh Grewal" className="h-12 md:h-14 bg-slate-50 border-none font-bold rounded-xl px-5 text-sm shadow-inner" />
                       </div>
                    )}
                    <div className="space-y-1.5 text-left">
                       <Label className="text-[9px] font-black uppercase text-slate-400 ml-1 tracking-widest">Email address</Label>
                       <div className="relative">
                          <Mail className="h-4 w-4 absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" />
                          <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="name@domain.com" className="h-12 md:h-14 pl-12 bg-slate-50 border-none font-bold rounded-xl text-sm shadow-inner" />
                       </div>
                    </div>
                    {mode !== 'forgot' && (
                       <div className="space-y-1.5 text-left">
                          <div className="flex justify-between px-1">
                             <Label className="text-[9px] font-black uppercase text-slate-400 ml-1 tracking-widest">Password</Label>
                             <button type="button" onClick={() => setMode('forgot')} className="text-[9px] font-bold text-primary hover:underline bg-transparent border-none cursor-pointer">Forgot password?</button>
                          </div>
                          <div className="relative">
                             <KeyRound className="h-4 w-4 absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" />
                             <Input type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" className="h-12 md:h-14 pl-12 pr-12 bg-slate-50 border-none font-bold rounded-xl text-sm shadow-inner" />
                             <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 bg-transparent border-none p-0 cursor-pointer"><Eye className="h-4 w-4" /></button>
                          </div>
                       </div>
                    )}
                    <Button type="submit" disabled={isConnecting} className="w-full h-14 md:h-16 bg-[#0F172A] hover:bg-black text-white font-black uppercase tracking-widest text-[10px] rounded-xl shadow-xl border-none active:scale-95">
                       {isConnecting ? <Loader2 className="h-5 w-5 animate-spin" /> : mode === 'signin' ? 'Sign In' : mode === 'signup' ? 'Create Account' : 'Transmit Reset Link'}
                    </Button>
                 </form>

                 <div className="relative py-2">
                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100"></div></div>
                    <div className="relative flex justify-center text-[8px] font-black uppercase tracking-[0.3em]">
                       <span className="bg-white px-6 text-slate-300">Or continue with</span>
                    </div>
                 </div>

                 <Button 
                    onClick={handleGoogleSignIn}
                    disabled={isConnecting}
                    className="w-full h-14 md:h-16 bg-white hover:bg-slate-50 border-2 border-slate-100 text-[#0F172A] rounded-xl font-bold text-sm shadow-sm active:scale-[0.98] flex items-center justify-center gap-4"
                 >
                    <Image src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" width={20} height={20} className={cn("h-5 w-5", isConnecting && "animate-pulse")} alt="Google" />
                    <span>Continue with Google</span>
                 </Button>
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="mt-8 pt-8 border-t border-slate-50 text-center">
             <p className="text-xs font-bold text-slate-400">
                {mode === 'signin' ? "Don't have an account?" : "Already have an account?"}
                <button onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')} className="ml-2 text-primary font-black bg-transparent border-none p-0 cursor-pointer uppercase tracking-tight hover:underline">
                   {mode === 'signin' ? 'Register Now' : 'Login Hub'}
                </button>
             </p>
          </div>

          <div className="mt-8 flex items-center justify-center gap-3 opacity-60">
             <div className="flex items-center gap-1.5"><Zap className="h-3 w-3 text-primary fill-current" /> <span className="text-[8px] font-black uppercase text-slate-400 tracking-tighter">Fast</span></div>
             <div className="flex items-center gap-1.5"><ShieldCheck className="h-3 w-3 text-emerald-500" /> <span className="text-[8px] font-black uppercase text-slate-400 tracking-tighter">Secure</span></div>
          </div>
          
          <div className="mt-4 flex flex-col items-center justify-center text-center space-y-1">
             <div className="flex items-center gap-2 text-slate-300">
                <Lock className="h-2.5 w-2.5" />
                <p className="text-[8px] font-bold uppercase tracking-tight">End-to-end encrypted database node</p>
             </div>
             <p className="text-[7px] font-black uppercase tracking-[0.2em] text-primary/30">Arsh Grewal verified</p>
          </div>
        </Card>
      </motion.div>
    </div>
  )
}
