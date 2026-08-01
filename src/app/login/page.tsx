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
  MousePointer2,
  Shield,
  Mail,
  KeyRound,
  Eye,
  EyeOff,
  ChevronRight,
  ArrowLeft
} from "lucide-react";
import { useAuth, useFirestore, useUser } from "@/firebase";
import { 
  signInWithPopup, 
  signInWithRedirect,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail
} from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp, updateDoc, increment } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { generateReferralCode } from "@/lib/referral";
import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * @fileOverview Premium Institutional Auth Portal v5.0.
 * RESTORED: Full Email/Password form, Sign Up toggle, and Password Recovery.
 * PRESERVED: Single-page UX, Custom Domain Google Auth, and Title Case terminology.
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
  
  // Form State
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  
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
      const result = await signInWithPopup(auth, provider);
      await finalizeUserNode(result.user, result.user.displayName || "Aspirant");
      router.replace(returnUrl);
    } catch (error: any) {
      if (error.code === 'auth/popup-blocked' || error.code === 'auth/cancelled-popup-request') {
        try {
          await signInWithRedirect(auth, provider);
        } catch (redirectError: any) {
          toast({ variant: "destructive", title: "Login failed", description: redirectError.message });
          setIsConnecting(false);
        }
      } else if (error.code !== 'auth/popup-closed-by-user') {
        toast({ variant: "destructive", title: "Authentication error", description: error.message });
        setIsConnecting(false);
      } else {
        setIsConnecting(false);
      }
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
      if (mode === 'signin') {
        const result = await signInWithEmailAndPassword(auth, email, password);
        await finalizeUserNode(result.user);
      } else if (mode === 'signup') {
        if (!name) {
          toast({ variant: "destructive", title: "Validation failed", description: "Name is required for registration." });
          setIsConnecting(false);
          return;
        }
        const result = await createUserWithEmailAndPassword(auth, email, password);
        await finalizeUserNode(result.user, name);
      } else if (mode === 'forgot') {
        await sendPasswordResetEmail(auth, email);
        toast({ title: "Reset link sent", description: "Check your email inbox to reset your password." });
        setMode('signin');
      }
      
      if (mode !== 'forgot') router.replace(returnUrl);
    } catch (error: any) {
      let msg = error.message;
      if (error.code === 'auth/user-not-found') msg = "No account found with this email.";
      if (error.code === 'auth/wrong-password') msg = "Incorrect password. Please try again.";
      if (error.code === 'auth/email-already-in-use') msg = "An account already exists with this email.";
      
      toast({ variant: "destructive", title: "Authentication failed", description: msg });
    } finally {
      setIsConnecting(false);
    }
  };

  const finalizeUserNode = async (userNode: any, customName?: string) => {
    if (!db) return;
    const userRef = doc(db, 'users', userNode.uid);
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
        status: 'Free',
        passType: 'FREE',
        pinnedExams: [],
        referralCode: generateReferralCode(userNode.uid),
        referredBy: referralFromUrl || null,
        coins: 0
      });

      await updateDoc(doc(db, 'settings', 'stats'), {
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
        className="w-full max-w-[460px]"
      >
        <Card className="border border-slate-100 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.08)] bg-white rounded-[32px] overflow-hidden flex flex-col p-6 md:p-12">
          
          <div className="mb-8 flex justify-center">
            <Logo variant="light" align="center" className="h-14 md:h-16" imgClassName="h-full w-auto" />
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
              <div className="space-y-1 text-left">
                <h1 className="text-2xl md:text-3xl font-black tracking-tight text-[#0F172A] antialiased">
                  {mode === 'signin' ? 'Welcome back' : mode === 'signup' ? 'Join Cracklix' : 'Reset password'}
                </h1>
                <p className="text-slate-400 font-medium text-xs md:text-sm tracking-tight">
                  {mode === 'signin' ? 'Continue your preparation with one secure login.' : 
                   mode === 'signup' ? 'Create an account to start your preparation journey.' : 
                   'Enter your email to receive a recovery link.'}
                </p>
              </div>

              <form onSubmit={handleEmailAuth} className="space-y-4">
                 {mode === 'signup' && (
                    <div className="space-y-1.5 text-left">
                       <Label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-widest">Full name</Label>
                       <div className="relative group">
                          <Image src="https://api.iconify.design/lucide:user.svg?color=%2394a3b8" width={16} height={16} alt="user" className="absolute left-4 top-1/2 -translate-y-1/2 opacity-40 group-focus-within:opacity-100 transition-opacity" />
                          <Input value={name} onChange={e => setName(e.target.value)} placeholder="Arsh Grewal" className="h-12 md:h-14 pl-12 rounded-xl bg-slate-50 border-none font-bold" />
                       </div>
                    </div>
                 )}

                 <div className="space-y-1.5 text-left">
                    <Label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-widest">Email address</Label>
                    <div className="relative group">
                       <Mail className="h-4 w-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors" />
                       <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="name@domain.com" className="h-12 md:h-14 pl-12 rounded-xl bg-slate-50 border-none font-bold" />
                    </div>
                 </div>

                 {mode !== 'forgot' && (
                    <div className="space-y-1.5 text-left">
                       <div className="flex items-center justify-between px-1">
                          <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Password</Label>
                          {mode === 'signin' && (
                            <button type="button" onClick={() => setMode('forgot')} className="text-[10px] font-black text-primary uppercase tracking-tight hover:underline bg-transparent border-none p-0 cursor-pointer">Forgot?</button>
                          )}
                       </div>
                       <div className="relative group">
                          <KeyRound className="h-4 w-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors" />
                          <Input 
                            type={showPassword ? "text" : "password"} 
                            value={password} 
                            onChange={e => setPassword(e.target.value)} 
                            placeholder="••••••••" 
                            className="h-12 md:h-14 pl-12 pr-12 rounded-xl bg-slate-50 border-none font-bold" 
                          />
                          <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 transition-colors bg-transparent border-none p-0 cursor-pointer">
                             {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                       </div>
                    </div>
                 )}

                 <Button 
                   type="submit" 
                   disabled={isConnecting}
                   className="w-full h-12 md:h-14 bg-[#0F172A] hover:bg-black text-white rounded-xl font-bold text-sm shadow-xl transition-all active:scale-[0.98] border-none mt-2"
                 >
                    {isConnecting ? <Loader2 className="h-4 w-4 animate-spin" /> : 
                     mode === 'signin' ? 'Sign In' : mode === 'signup' ? 'Create Account' : 'Send Recovery Link'}
                 </Button>
              </form>

              {mode !== 'forgot' && (
                 <div className="relative py-2">
                    <div className="absolute inset-0 flex items-center" aria-hidden="true">
                       <div className="w-full border-t border-slate-100"></div>
                    </div>
                    <div className="relative flex justify-center text-[10px] font-black uppercase tracking-widest">
                       <span className="bg-white px-4 text-slate-300">Or continue with</span>
                    </div>
                 </div>
              )}

              {mode !== 'forgot' && (
                 <Button 
                    onClick={handleGoogleSignIn}
                    disabled={isConnecting}
                    className="w-full h-12 md:h-14 bg-white hover:bg-slate-50 border-2 border-slate-100 text-[#0F172A] rounded-xl font-bold text-sm shadow-sm transition-all duration-300 active:scale-[0.98] flex items-center justify-center gap-3 relative overflow-hidden"
                 >
                    <div className="shrink-0">
                      <Image src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" width={20} height={20} className={cn("h-5 w-5", isConnecting && "animate-pulse")} alt="Google" />
                    </div>
                    <span>Google</span>
                 </Button>
              )}

              {mode === 'forgot' && (
                 <button onClick={() => setMode('signin')} className="w-full flex items-center justify-center gap-2 text-slate-400 hover:text-[#0F172A] transition-colors text-xs font-bold bg-transparent border-none cursor-pointer">
                    <ArrowLeft className="h-3.5 w-3.5" /> Back to sign in
                 </button>
              )}
            </motion.div>
          </AnimatePresence>

          <div className="mt-8 pt-6 border-t border-slate-50 text-center">
             <p className="text-xs font-bold text-slate-400">
                {mode === 'signin' ? "Don't have an account?" : "Already have an account?"}
                <button 
                  onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')} 
                  className="ml-2 text-primary hover:underline font-black bg-transparent border-none p-0 cursor-pointer"
                >
                   {mode === 'signin' ? 'Register here' : 'Sign in here'}
                </button>
             </p>
          </div>

          <div className="mt-8 flex flex-col items-center gap-4">
             <div className="flex items-center gap-3 text-slate-200">
                <Lock className="h-4 w-4" />
                <div className="w-px h-3 bg-slate-100" />
                <p className="text-[9px] font-bold text-slate-400 tracking-tight leading-relaxed max-w-[280px] text-left">
                  Your data is encrypted and secure. We never post without permission.
                </p>
             </div>
          </div>

        </Card>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-slate-400 font-bold text-[8px] md:text-[9px] tracking-widest uppercase antialiased">
           <div className="flex items-center gap-1.5"><Zap className="h-3 w-3 text-primary" /> Fast</div>
           <div className="flex items-center gap-1.5"><ShieldCheck className="h-3 w-3 text-emerald-500" /> Secure</div>
           <div className="flex items-center gap-1.5"><MousePointer2 className="h-3 w-3 text-primary" /> One tap</div>
           <div className="h-1 w-1 rounded-full bg-slate-200" />
           <div className="flex items-center gap-1.5 text-slate-300"><Shield className="h-3 w-3" /> Arsh Grewal verified</div>
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
