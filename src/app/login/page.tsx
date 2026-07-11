
'use client';

import React, { useState, Suspense, useEffect, useMemo, useCallback, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import Logo from "@/components/brand/Logo"
import { 
  Mail, 
  Lock, 
  User, 
  Eye, 
  EyeOff, 
  Loader2, 
  ShieldCheck, 
  Zap, 
  RefreshCw, 
  ClipboardList,
  Users,
  FileText,
  ChevronLeft
} from "lucide-react"
import { useAuth, useFirestore, useUser, useDoc } from "@/firebase"
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider,
  sendPasswordResetEmail,
  updateProfile
} from "firebase/auth"
import { doc, setDoc, getDoc, serverTimestamp, updateDoc, increment } from "firebase/firestore"
import { useToast } from "@/hooks/use-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { motion } from "framer-motion"
import { Checkbox } from "@/components/ui/checkbox"
import Link from "next/link"
import { Capacitor } from "@capacitor/core"
import Image from "next/image"
import { generateReferralCode } from "@/lib/referral"

/**
 * @fileOverview Cracklix Premium Login Portal v96.0
 * UPDATED: Integrated incremental user counter for stats registry.
 */

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="h-screen w-full flex flex-col items-center justify-center bg-white"><Loader2 className="h-10 w-10 text-primary animate-spin" /></div>}>
      <LoginContent />
    </Suspense>
  )
}

function LoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const auth = useAuth()
  const db = useFirestore()
  const { toast } = useToast()
  const { user, profile, loading: authLoading } = useUser()

  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [resetEmail, setResetEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [resetLoading, setResetLoading] = useState(false)
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false)
  
  const returnUrl = useMemo(() => searchParams?.get("returnUrl") || "/dashboard", [searchParams]);
  const referralFromUrl = useMemo(() => searchParams?.get("ref"), [searchParams]);
  const initialMode = useMemo(() => searchParams?.get("mode"), [searchParams]);

  const syncAttempted = useRef(false);

  useEffect(() => {
     if (initialMode === 'register') setMode('register');
  }, [initialMode]);

  const syncGuestData = useCallback(async (uid: string, userName: string, userEmail: string) => {
     if (!db || syncAttempted.current) return;
     syncAttempted.current = true;

     const keys = Object.keys(localStorage);
     const resultKeys = keys.filter(k => k.startsWith('cracklix_guest_result_'));
     
     if (resultKeys.length > 0) {
        toast({ title: "Syncing Data", description: "Transferring guest attempts to your account." });
        
        for (const key of resultKeys) {
           try {
              const data = JSON.parse(localStorage.getItem(key) || '{}');
              const mockId = data.mockId;
              if (!mockId) continue;

              const resultRef = doc(db, "results", `${uid}_${mockId}`);
              const attemptRef = doc(db, "attempts", `${uid}_${mockId}`);

              await setDoc(resultRef, {
                 ...data,
                 userId: uid,
                 userName,
                 userEmail,
                 createdAt: serverTimestamp()
              }, { merge: true });

              await setDoc(attemptRef, {
                 status: 'COMPLETED',
                 updatedAt: serverTimestamp()
              }, { merge: true });

              localStorage.removeItem(key);
           } catch (e) {
              console.error("[GUEST_SYNC_FAILURE]:", e);
           }
        }
     }
  }, [db, toast]);

  useEffect(() => {
    if (!authLoading && user && profile) {
      syncGuestData(user.uid, profile.name, user.email || "").then(() => {
         router.replace(returnUrl);
      });
    }
  }, [user, profile, authLoading, router, returnUrl, syncGuestData]);

  const statsRef = useMemo(() => (db ? doc(db, "settings", "stats") : null), [db]);
  const { data: stats, loading: statsLoading } = useDoc<any>(statsRef);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    if (mode === 'register' && password !== confirmPassword) {
      toast({ variant: "destructive", title: "Passwords Mismatch", description: "Passwords must match." })
      return
    }

    setLoading(true)
    try {
      if (mode === 'login') {
        await signInWithEmailAndPassword(auth, email, password)
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password)
        const userNode = userCredential.user
        await updateProfile(userNode, { displayName: name })
        
        await setDoc(doc(db!, 'users', userNode.uid), {
          id: userNode.uid,
          name,
          email,
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
        })

        // Increment global user count incrementally
        await updateDoc(doc(db!, 'settings', 'stats'), {
           totalUsers: increment(1),
           updatedAt: serverTimestamp()
        }).catch(() => {});
      }
    } catch (error: any) {
      toast({ variant: "destructive", title: "Authentication Failed", description: error.message })
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    if (loading) return;
    if (Capacitor.isNativePlatform()) {
       toast({ title: "Mobile Login", description: "Use email/password on the Android app.", variant: "destructive" });
       return;
    }

    setLoading(true)
    try {
      const provider = new GoogleAuthProvider()
      const result = await signInWithPopup(auth, provider)
      const userNode = result.user
      if (!userNode.email) throw new Error("Email is required.");
      
      const userRef = doc(db!, 'users', userNode.uid)
      const userSnap = await getDoc(userRef)

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
        })

        // Increment global user count incrementally
        await updateDoc(doc(db!, 'settings', 'stats'), {
          totalUsers: increment(1),
          updatedAt: serverTimestamp()
        }).catch(() => {});
      }
    } catch (error: any) {
      toast({ variant: "destructive", title: "Social Login Error", description: error.message })
      setLoading(false)
    }
  }

  const handleResetPassword = async () => {
    if (!resetEmail) {
      toast({ variant: "destructive", title: "Email Required" })
      return
    }
    setResetLoading(true)
    try {
      await sendPasswordResetEmail(auth, resetEmail)
      toast({ title: "Reset Link Sent" })
      setIsResetDialogOpen(false)
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message })
    } finally {
      setResetLoading(false)
    }
  }

  const formatCompact = (num: number) => {
    if (!num || num === 0) return "0";
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  return (
    <div className="min-h-[100dvh] bg-white flex flex-col lg:flex-row text-[#0F172A] font-body selection:bg-primary/20 overflow-x-hidden">
      
      <div className="hidden lg:flex flex-[1.1] bg-[#020B2D] text-white px-12 xl:px-20 py-0 flex-col justify-center relative overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-primary/20 blur-[120px] rounded-full pointer-events-none" />

        <div className="relative z-10 space-y-12 xl:space-y-20 max-w-[650px]">
        <Logo variant="dark" align="left" className="my-0" />

          <div className="space-y-8">
            <h1 className="text-5xl xl:text-6xl font-black tracking-tight text-white leading-[1.05]">
              Punjab's Smart <br/> 
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-300">
                Exam Platform
              </span>
            </h1>
            <p className="text-base xl:text-xl text-slate-300 font-medium leading-relaxed">
              Practice mock tests and performance analytics verified by official recruitment standards.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8">
            <HeroStat icon={ClipboardList} label={`${statsLoading ? '...' : formatCompact(stats?.totalMocks)}+ Mock Tests`} />
            <HeroStat icon={Zap} label={`${statsLoading ? '...' : formatCompact(stats?.totalQuestions)}+ Questions`} />
            <HeroStat icon={Users} label={`${statsLoading ? '...' : formatCompact(stats?.totalUsers)}+ Aspirants`} />
            <HeroStat icon={ShieldCheck} label="Official Patterns" />
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-4 md:px-12 lg:px-20 py-0 relative bg-slate-50 lg:bg-white overflow-y-auto">
        <motion.div 
           initial={{ opacity: 0, scale: 0.95 }} 
           animate={{ opacity: 1, scale: 1 }} 
           className="w-full max-w-[480px] py-12" 
        >
          <Card className="border-none shadow-5xl lg:shadow-none bg-white rounded-[32px] p-6 md:p-12 space-y-6 md:space-y-10">
            <div className="space-y-2 text-center lg:text-left">
               <h2 className="text-2xl md:text-4xl font-black tracking-tight text-[#0F172A]">
                 {mode === 'login' ? 'Welcome Back' : 'Create Account'}
               </h2>
               <p className="text-slate-400 font-bold text-[10px] md:text-[11px] uppercase tracking-widest">
                 {mode === 'login' ? 'Access your portal' : 'Join the preparation portal'}
               </p>
            </div>

            <form onSubmit={handleEmailAuth} className="space-y-6">
              {mode === 'register' && (
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold text-slate-400 ml-1">Full Name</Label>
                  <div className="relative group">
                    <User className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 group-focus-within:text-primary transition-colors" />
                    <Input value={name} onChange={(e) => setName(e.target.value)} required className="h-14 md:h-16 rounded-2xl bg-slate-50 border-none text-[#0F172A] font-bold pl-12 md:pl-14 shadow-inner" placeholder="e.g. Arsh Grewal" />
                  </div>
                </div>
              )}
              
              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold text-slate-400 ml-1">Email Address</Label>
                <div className="relative group">
                  <Mail className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 group-focus-within:text-primary transition-colors" />
                  <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="h-14 md:h-16 rounded-2xl bg-slate-50 border-none text-[#0F172A] font-bold pl-12 md:pl-14 shadow-inner" placeholder="name@domain.com" />
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold text-slate-400 ml-1">Password</Label>
                  <div className="relative group">
                    <Lock className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 group-focus-within:text-primary transition-colors" />
                    <Input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} required className="h-14 md:h-16 rounded-2xl bg-slate-50 border-none text-[#0F172A] pl-12 md:pl-14 pr-12 font-bold shadow-inner" placeholder="Password" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary transition-colors">{showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}</button>
                  </div>
                </div>

                {mode === 'login' && (
                  <div className="flex items-center justify-between px-1">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="remember" className="rounded-md" />
                      <label htmlFor="remember" className="text-[11px] font-bold text-slate-500 uppercase tracking-wider cursor-pointer">Remember me</label>
                    </div>
                    <button type="button" onClick={() => setIsResetDialogOpen(true)} className="text-[11px] font-black text-primary hover:underline">Forgot password?</button>
                  </div>
                )}
              </div>

              <div className="pt-2 flex flex-col gap-4">
                <Button type="submit" className="w-full h-14 md:h-18 bg-blue-600 text-white font-bold text-xs rounded-full shadow-xl border-none transition-all active:scale-[0.98]" disabled={loading}>
                  {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Continue"}
                </Button>
                <div className="flex items-center gap-3 py-1">
                  <div className="h-px flex-1 bg-slate-100" />
                  <span className="text-[9px] font-bold text-slate-300 uppercase">OR</span>
                  <div className="h-px flex-1 bg-slate-100" />
                </div>
                <Button variant="outline" className="w-full h-14 border-2 border-slate-100 text-[#0F172A] gap-3 rounded-full font-bold text-[10px] md:text-[11px] hover:bg-slate-50 shadow-sm" onClick={handleGoogleSignIn} disabled={loading}>
                   <Image src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" width={20} height={20} className="h-5 w-5" alt="Google Logo" /> Google Login
                </Button>
              </div>
            </form>

            <div className="text-center pt-8 border-t border-slate-50">
               <p className="text-[11px] md:text-[13px] font-bold text-slate-400">
                {mode === 'login' ? "Don't have an account?" : "Already registered?"}
                <button 
                  type="button"
                  onClick={() => setMode(mode === 'login' ? 'register' : 'login')} 
                  className="text-primary font-black ml-2 hover:underline"
                >
                  {mode === 'login' ? 'Create Account' : 'Login Portal'}
                </button>
               </p>
            </div>
          </Card>
        </motion.div>
      </div>

      <Dialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
        <DialogContent className="bg-white rounded-[2rem] max-w-[440px] p-8 md:p-12 shadow-5xl text-left border-none">
          <DialogHeader className="text-center space-y-4">
            <div className="h-14 w-14 md:h-16 md:w-16 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto text-primary shadow-xl">{resetLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : <RefreshCw className="h-6 w-6" />}</div>
            <DialogTitle className="text-xl md:text-2xl font-black tracking-tight text-[#0F172A]">Recover Account</DialogTitle>
            <DialogDescription className="text-slate-400 text-[10px] md:sm font-bold text-center mt-2 leading-relaxed">Enter your email for reset link.</DialogDescription>
          </DialogHeader>
          <div className="py-8 space-y-6">
            <div className="space-y-1.5 text-left">
              <Label className="text-[10px] font-bold text-slate-400 ml-1">Your email</Label>
              <Input type="email" value={resetEmail} onChange={(e) => setResetEmail(e.target.value)} placeholder="aspirant@cracklix.com" className="h-16 bg-slate-50 border-none rounded-2xl text-[#0F172A] text-base font-bold px-6 shadow-inner" />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => handleResetPassword()} disabled={resetLoading} className="w-full h-16 bg-blue-600 hover:bg-blue-700 text-white font-bold text-[10px] rounded-full shadow-xl transition-all border-none">
              {resetLoading ? "Processing..." : "Send Reset Link"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function HeroStat({ icon: Icon, label }: { icon: any, label: string }) {
  return (
    <div className="flex items-center gap-4 group">
      <div className="h-10 w-10 md:h-12 md:w-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
        <Icon className="h-5 w-5 md:h-6 md:w-6 text-primary" />
      </div>
      <span className="text-[11px] md:sm xl:text-lg font-bold tracking-tight text-slate-200">{label}</span>
    </div>
  )
}
