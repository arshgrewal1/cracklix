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
  ArrowLeft,
  Star
} from "lucide-react";
import { useAuth, useFirestore, useUser } from "@/firebase";
import { 
  signInWithPopup, 
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  browserLocalPersistence,
  setPersistence
} from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp, updateDoc, increment } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { generateReferralCode } from "@/lib/referral";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { getDeviceId } from "@/lib/device";

/**
 * @fileOverview Hardened Institutional Auth Portal v6.0.
 * FIXED: Reverted to default authDomain for 100% reliability.
 * FIXED: Non-blocking profile sync to prevent "Blank Page" hangs.
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
  const [showPassword, setShowPassword] = useState(false);
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  
  const returnUrl = useMemo(() => searchParams?.get("returnUrl") || "/", [searchParams]);
  const referralFromUrl = useMemo(() => searchParams?.get("ref"), [searchParams]);

  // Handle existing session redirect
  useEffect(() => {
    if (!authLoading && user && !isConnecting) {
      router.replace(returnUrl);
    }
  }, [user, authLoading, router, returnUrl, isConnecting]);

  const handleGoogleSignIn = async () => {
    if (!auth || !db || isConnecting) return;
    
    setIsConnecting(true);
    const provider = new GoogleAuthProvider();
    
    try {
      // Ensure local persistence for PWA stability
      await setPersistence(auth, browserLocalPersistence);
      const result = await signInWithPopup(auth, provider);
      
      // BACKGROUND TASK: Don't wait for Firestore to redirect
      finalizeUserNode(result.user, result.user.displayName || "Aspirant");
      
      router.replace(returnUrl);
    } catch (error: any) {
      console.error("[AUTH_ERROR]:", error.code);
      if (error.code !== 'auth/popup-closed-by-user') {
        toast({ 
          variant: "destructive", 
          title: "Login failed", 
          description: "Connection timed out. Please try again." 
        });
      }
      setIsConnecting(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth || !db || isConnecting) return;
    
    if (!email || (mode !== 'forgot' && !password)) {
      toast({ variant: "destructive", title: "Validation failed", description: "All fields are required." });
      return;
    }

    setIsConnecting(true);
    try {
      await setPersistence(auth, browserLocalPersistence);
      
      if (mode === 'signin') {
        const result = await signInWithEmailAndPassword(auth, email, password);
        finalizeUserNode(result.user);
      } else if (mode === 'signup') {
        if (!name) throw new Error("Name is required.");
        const result = await createUserWithEmailAndPassword(auth, email, password);
        finalizeUserNode(result.user, name);
      } else if (mode === 'forgot') {
        await sendPasswordResetEmail(auth, email);
        toast({ title: "Reset link sent", description: "Check your inbox." });
        setMode('signin');
        setIsConnecting(false);
        return;
      }
      
      router.replace(returnUrl);
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
        await setDoc(userRef, {
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
        });

        await updateDoc(doc(db, 'settings', 'stats'), {
          totalUsers: increment(1),
          updatedAt: serverTimestamp()
        }).catch(() => {});
      } else {
        await updateDoc(userRef, {
          lastLoginAt: serverTimestamp(),
          activeDeviceId: deviceId,
          updatedAt: serverTimestamp()
        });
      }

      if (typeof window !== 'undefined') {
        localStorage.setItem('cracklix_session_id', deviceId);
      }
    } catch (e) {
      console.warn("[SYNC_WARNING]: Background profile update delayed.");
    }
  };

  return (
    <div className="min-h-[100dvh] bg-[#F8FAFC] flex flex-col items-center justify-center p-4 md:p-8 font-body selection:bg-primary/20">
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-[440px]"
      >
        <Card className="border border-slate-100 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.08)] bg-white rounded-[32px] overflow-hidden flex flex-col p-6 md:p-10">
          
          <div className="mb-8 flex justify-center">
            <Logo variant="light" align="center" className="h-12 md:h-14" imgClassName="h-full w-auto" />
          </div>

          <AnimatePresence mode="wait">
            <motion.div 
              key={mode}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-6 w-full"
            >
              <div className="space-y-1 text-center">
                <h1 className="text-2xl font-[900] tracking-tight text-[#0F172A]">
                  {mode === 'signin' ? 'Welcome back' : mode === 'signup' ? 'Create account' : 'Recover access'}
                </h1>
                <p className="text-slate-400 font-medium text-xs md:text-sm">
                  {mode === 'signin' ? 'Continue your preparation journey.' : 'Join Punjab\'s smartest prep community.'}
                </p>
              </div>

              <div className="flex items-center justify-center gap-6 text-slate-400 font-bold text-[8px] uppercase tracking-widest pb-2 border-b border-slate-50">
                 <div className="flex items-center gap-1.5"><Zap className="h-3 w-3 text-primary" /> Fast</div>
                 <div className="flex items-center gap-1.5"><ShieldCheck className="h-3 w-3 text-emerald-500" /> Secure</div>
                 <div className="flex items-center gap-1.5"><Star className="h-3 w-3 text-amber-500" /> Verified</div>
              </div>

              <div className="space-y-3">
                 <Button 
                    onClick={handleGoogleSignIn}
                    disabled={isConnecting}
                    className="w-full h-14 bg-white hover:bg-slate-50 border-2 border-slate-100 text-[#0F172A] rounded-xl font-bold text-sm shadow-sm transition-all duration-300 active:scale-[0.98] flex items-center justify-center gap-3 relative overflow-hidden"
                 >
                    <Image src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" width={20} height={20} className={cn("h-5 w-5", isConnecting && "animate-pulse")} alt="Google" />
                    <span>Continue with Google</span>
                 </Button>

                 <div className="relative py-2">
                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100"></div></div>
                    <div className="relative flex justify-center text-[10px] font-black uppercase tracking-widest">
                       <span className="bg-white px-4 text-slate-300">Or use email</span>
                    </div>
                 </div>

                 <form onSubmit={handleEmailAuth} className="space-y-4">
                    {mode === 'signup' && (
                       <div className="space-y-1 text-left">
                          <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Full name</Label>
                          <Input value={name} onChange={e => setName(e.target.value)} placeholder="Arsh Grewal" className="h-12 bg-slate-50 border-none font-bold rounded-xl" />
                       </div>
                    )}
                    <div className="space-y-1 text-left">
                       <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Email address</Label>
                       <div className="relative">
                          <Mail className="h-4 w-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                          <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="name@domain.com" className="h-12 pl-12 bg-slate-50 border-none font-bold rounded-xl" />
                       </div>
                    </div>
                    {mode !== 'forgot' && (
                       <div className="space-y-1 text-left">
                          <div className="flex justify-between px-1">
                             <Label className="text-[10px] font-black uppercase text-slate-400">Password</Label>
                             <button type="button" onClick={() => setMode('forgot')} className="text-[10px] font-bold text-primary hover:underline bg-transparent border-none">Forgot?</button>
                          </div>
                          <div className="relative">
                             <KeyRound className="h-4 w-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                             <Input type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" className="h-12 pl-12 pr-12 bg-slate-50 border-none font-bold rounded-xl" />
                             <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 bg-transparent border-none p-0"><Eye className="h-4 w-4" /></button>
                          </div>
                       </div>
                    )}
                    <Button type="submit" disabled={isConnecting} className="w-full h-14 bg-[#0F172A] hover:bg-black text-white font-bold rounded-xl shadow-xl transition-all border-none mt-2">
                       {isConnecting ? <Loader2 className="h-4 w-4 animate-spin" /> : mode === 'signin' ? 'Sign In' : mode === 'signup' ? 'Create Account' : 'Recover Account'}
                    </Button>
                 </form>
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="mt-8 pt-6 border-t border-slate-50 text-center">
             <p className="text-xs font-bold text-slate-400">
                {mode === 'signin' ? "Don't have an account?" : "Already have an account?"}
                <button onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')} className="ml-2 text-primary font-black bg-transparent border-none p-0 cursor-pointer">
                   {mode === 'signin' ? 'Register' : 'Login'}
                </button>
             </p>
          </div>

          <div className="mt-8 flex items-center justify-center gap-3 text-slate-300">
             <Lock className="h-4 w-4" />
             <p className="text-[9px] font-bold uppercase tracking-tight text-slate-400">Your data is encrypted and secure.</p>
          </div>
        </Card>
      </motion.div>
    </div>
  )
}
