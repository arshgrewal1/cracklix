"use client"

import React, { useState, Suspense, useEffect, useTransition } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import Logo from "@/components/brand/Logo"
import { Mail, Lock, User, Phone, Eye, EyeOff, Loader2, ShieldCheck, CheckCircle2, Zap, ArrowRight, Star, AlertCircle, RefreshCw } from "lucide-react"
import { useAuth, useFirestore, useUser } from "@/firebase"
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider,
  sendPasswordResetEmail,
  updateProfile,
  sendEmailVerification
} from "firebase/auth"
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore"
import { useToast } from "@/hooks/use-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { getDeviceId, getBrowserInfo } from "@/lib/device"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

const SUPER_ADMIN_WHITELIST = ['arshdeepgrewal1122@gmail.com'];

/**
 * @fileOverview Institutional Login Hub v18.1
 * FIXED: Added missing RefreshCw import for the recovery dialog.
 */
export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginContent />
    </Suspense>
  )
}

function LoginContent() {
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [resetEmail, setResetEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [resetLoading, setResetLoading] = useState(false)
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  
  const { user, loading: authLoading } = useUser()
  const router = useRouter()
  const searchParams = useSearchParams()
  const auth = useAuth()
  const db = useFirestore()
  const { toast } = useToast()

  const returnUrl = searchParams.get("returnUrl") || "/"
  const sessionTerminated = searchParams.get('session') === 'terminated';

  useEffect(() => {
    if (!authLoading && user && !sessionTerminated) {
       if (user.emailVerified) {
          router.replace(returnUrl);
       } else {
          router.replace('/verify-email');
       }
    }
  }, [user, authLoading, router, returnUrl, sessionTerminated]);

  const updateActiveDevice = async (userId: string) => {
    if (!db) return;
    const deviceId = await getDeviceId();
    const { browser, platform } = getBrowserInfo();
    
    await setDoc(doc(db, 'users', userId), {
      activeDeviceId: deviceId,
      lastLoginAt: serverTimestamp(),
      activeBrowser: browser,
      activePlatform: platform,
      updatedAt: serverTimestamp()
    }, { merge: true });
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    if (mode === 'register' && password !== confirmPassword) {
      toast({ variant: "destructive", title: "Validation Error", description: "Passwords must match." })
      return
    }

    setLoading(true)
    try {
      if (mode === 'login') {
        const creds = await signInWithEmailAndPassword(auth, email, password)
        await creds.user.reload();
        
        if (!creds.user.emailVerified) {
          await sendEmailVerification(creds.user);
          router.push('/verify-email');
          return;
        }

        await updateActiveDevice(creds.user.uid);
        toast({ title: "Welcome to Cracklix" })
        startTransition(() => { router.replace(returnUrl) })
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password)
        const userNode = userCredential.user
        
        await updateProfile(userNode, { displayName: name })
        await sendEmailVerification(userNode);
        
        const isSuperAdmin = email && SUPER_ADMIN_WHITELIST.includes(email.toLowerCase());
        
        await setDoc(doc(db!, 'users', userNode.uid), {
          id: userNode.uid, 
          name, 
          email, 
          phone: `+91 ${phone}`,
          role: isSuperAdmin ? 'SUPER_ADMIN' : 'STUDENT',
          state: "Punjab", 
          createdAt: new Date().toISOString(),
          updatedAt: serverTimestamp(), 
          status: 'Free', 
          pinnedExams: [],
          verified: false
        })

        router.push('/verify-email');
      }
    } catch (error: any) {
      if (error.code === 'auth/unauthorized-domain') {
        toast({ 
          variant: "destructive", 
          title: "Domain Not Authorized", 
          description: "Please add this domain to 'Authorized Domains' in your Firebase Console." 
        })
      } else {
        toast({ variant: "destructive", title: "Sync Failed", description: error.message })
      }
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    if (loading) return;
    setLoading(true)
    try {
      const provider = new GoogleAuthProvider()
      provider.setCustomParameters({ prompt: 'select_account' })
      const result = await signInWithPopup(auth, provider)
      const userNode = result.user
      if (!userNode.email) throw new Error("Email mandatory.");
      
      const userRef = doc(db!, 'users', userNode.uid)
      const userSnap = await getDoc(userRef)
      const isSuperAdmin = SUPER_ADMIN_WHITELIST.includes(userNode.email.toLowerCase());
      
      if (!userSnap.exists()) {
        await setDoc(userRef, {
          id: userNode.uid, name: userNode.displayName || "Aspirant",
          email: userNode.email, role: isSuperAdmin ? 'SUPER_ADMIN' : 'STUDENT',
          state: "Punjab", createdAt: new Date().toISOString(),
          updatedAt: serverTimestamp(), status: 'Free', pinnedExams: [], phone: "",
          verified: userNode.emailVerified
        })
      }
      
      await updateActiveDevice(userNode.uid);
      toast({ title: "Welcome to Cracklix" })
      startTransition(() => { router.replace(returnUrl) })
    } catch (error: any) {
      if (error.code === 'auth/unauthorized-domain') {
        toast({ 
          variant: "destructive", 
          title: "Domain Not Authorized", 
          description: "Please whitelist this domain in Firebase Console -> Auth -> Settings." 
        })
      } else {
        toast({ variant: "destructive", title: "Sync Error", description: error.message })
      }
      setLoading(false)
    }
  }

  const handleResetPassword = async () => {
    if (!resetEmail) {
      toast({ variant: "destructive", title: "Email Required", description: "Please enter your email." });
      return;
    }
    setResetLoading(true);
    try {
      await sendPasswordResetEmail(auth, resetEmail);
      toast({ title: "Reset Link Sent", description: "Check your inbox." });
      setIsResetDialogOpen(false);
    } catch (error: any) {
      toast({ variant: "destructive", title: "Audit Error", description: error.message });
    } finally {
      setResetLoading(false);
    }
  };

  const isActuallyLoading = loading || isPending;

  return (
    <div className="min-h-screen bg-white flex flex-col lg:flex-row text-[#0F172A] text-left">
      
      {/* BRANDING SIDE PANEL (DESKTOP ONLY) */}
      <div className="hidden lg:flex flex-1 bg-[#0B1528] text-white p-20 flex-col justify-between relative overflow-hidden">
        <div className="absolute inset-0 bg-primary/5 blur-[120px] rounded-full translate-x-1/2 -translate-y-1/2" />
        <div className="relative z-10 space-y-12">
           <Logo variant="dark" imgClassName="h-[60px]" />
           <div className="space-y-6">
              <h1 className="text-5xl font-black leading-[1.1] uppercase tracking-tight">
                Punjab&apos;s Leading <br/> 
                <span className="text-primary">Exam Platform</span>
              </h1>
              <p className="text-xl text-slate-400 font-medium max-w-md">
                Master your preparation with institutional-grade mock tests and real-time state merit rankings.
              </p>
           </div>
           <div className="space-y-6 pt-10">
              <BenefitItem text="500+ Practice Mocks" />
              <BenefitItem text="Bilingual Engine (EN/PA)" />
              <BenefitItem text="Official Pattern Audit" />
              <BenefitItem text="AI-Driven Rationale" />
           </div>
        </div>
        <div className="relative z-10 flex items-center gap-4 text-slate-500">
           <ShieldCheck className="h-6 w-6 text-primary" />
           <p className="text-[10px] font-black uppercase tracking-[0.3em]">Institutional Registry Node v4.0</p>
        </div>
      </div>

      {/* FORM PANEL */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-12 lg:p-24 relative overflow-y-auto custom-scrollbar">
        <div className="w-full max-w-[640px] space-y-10">
          
          <div className="lg:hidden text-center space-y-6 mb-10">
             <Logo variant="light" align="center" imgClassName="h-[50px]" />
             {sessionTerminated && (
                <div className="bg-amber-50 border border-amber-100 p-4 rounded-2xl flex items-center gap-4 text-left">
                  <AlertCircle className="h-5 w-5 text-amber-600 shrink-0" />
                  <p className="text-xs font-bold text-amber-700 leading-tight">Session terminated. Account active on another device.</p>
                </div>
             )}
          </div>

          <div className="space-y-4">
             <h2 className="text-3xl md:text-5xl font-black tracking-tight text-[#0F172A]">
                {mode === 'login' ? "Welcome Back" : "Initialize Account"}
             </h2>
             <p className="text-slate-500 font-bold text-[12px] md:text-[14px] uppercase tracking-widest leading-none">
                {mode === 'login' ? "Login to access your hub" : "Start your journey to selection"}
             </p>
          </div>

          <form onSubmit={handleEmailAuth} className="space-y-6">
            {mode === 'register' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Full Identity</Label>
                  <div className="relative">
                    <User className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300" />
                    <Input 
                      value={name} 
                      onChange={(e) => setName(e.target.value)} 
                      required 
                      className="h-16 rounded-2xl bg-slate-50 border-none text-[#0F172A] placeholder:text-slate-400 focus-visible:ring-primary text-lg font-bold pl-16 shadow-inner" 
                      placeholder="e.g. Arsh Grewal" 
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Mobile Node</Label>
                  <div className="relative">
                    <span className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-lg">+91</span>
                    <Input 
                      value={phone} 
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0,10))} 
                      required 
                      className="h-16 rounded-2xl bg-slate-50 border-none text-[#0F172A] placeholder:text-slate-400 focus-visible:ring-primary text-lg font-bold pl-20 shadow-inner" 
                      placeholder="10 Digit Mobile Number" 
                    />
                  </div>
                </div>
              </div>
            )}
            
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300" />
                <Input 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  required 
                  className="h-16 rounded-2xl bg-slate-50 border-none text-[#0F172A] placeholder:text-slate-400 focus-visible:ring-primary text-lg font-bold pl-16 shadow-inner" 
                  placeholder="name@domain.com" 
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300" />
                  <Input 
                    type={showPassword ? "text" : "password"} 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    required 
                    className="h-16 rounded-2xl bg-slate-50 border-none text-[#0F172A] placeholder:text-slate-400 focus-visible:ring-primary pl-16 pr-12 text-lg font-bold shadow-inner" 
                    placeholder="Secret Key" 
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary transition-colors">
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
              {mode === 'register' && (
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Confirm Secret</Label>
                  <div className="relative">
                    <Input 
                      type={showConfirmPassword ? "text" : "password"} 
                      value={confirmPassword} 
                      onChange={(e) => setConfirmPassword(e.target.value)} 
                      required 
                      className="h-16 rounded-2xl bg-slate-50 border-none text-[#0F172A] placeholder:text-slate-400 focus-visible:ring-primary px-6 text-lg font-bold shadow-inner" 
                      placeholder="Repeat" 
                    />
                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary transition-colors">
                      {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {mode === 'login' && (
              <div className="flex justify-end">
                <button type="button" onClick={() => setIsResetDialogOpen(true)} className="text-[11px] font-black uppercase tracking-widest text-primary hover:text-blue-700 transition-colors">Forgot Password?</button>
              </div>
            )}

            <div className="pt-4 flex flex-col gap-6">
              <Button type="submit" className="w-full h-16 md:h-20 bg-primary hover:bg-blue-700 text-white font-black text-xs md:text-sm uppercase tracking-[0.3em] rounded-[2rem] shadow-4xl shadow-primary/20 border-none transition-all active:scale-95" disabled={isActuallyLoading}>
                {isActuallyLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : (mode === 'login' ? "Access Hub" : "Create Account")}
              </Button>

              <div className="flex items-center gap-4 py-2"><div className="h-px flex-1 bg-slate-100" /><span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">OR</span><div className="h-px flex-1 bg-slate-100" /></div>

              <Button variant="outline" className="w-full h-16 border-2 border-slate-100 bg-white text-[#0F172A] gap-4 rounded-2xl font-black text-xs md:text-sm hover:bg-slate-50 uppercase tracking-widest shadow-sm" onClick={handleGoogleSignIn} disabled={isActuallyLoading}>
                 <img src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" className="h-5 w-5" alt="G" /> Google Registry
              </Button>
            </div>
          </form>

          <div className="text-center pt-8 border-t border-slate-50">
             {mode === 'login' ? (
                <p className="text-[13px] font-bold text-slate-400">
                  New aspirant? 
                  <button onClick={() => setMode('register')} className="text-primary hover:underline font-black uppercase tracking-widest ml-2">Register Now</button>
                </p>
             ) : (
                <p className="text-[13px] font-bold text-slate-400">
                  Already registered? 
                  <button onClick={() => setMode('login')} className="text-primary hover:underline font-black uppercase tracking-widest ml-2">Login Hub</button>
                </p>
             )}
          </div>
        </div>
      </div>

      <Dialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
        <DialogContent className="bg-white rounded-[2rem] md:rounded-[3rem] max-w-[400px] p-10 shadow-5xl text-left border-none">
          <DialogHeader className="text-center space-y-4">
            <div className="h-14 w-14 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto text-primary shadow-xl">
              {resetLoading ? <Loader2 className="h-7 w-7 animate-spin" /> : <RefreshCw className="h-7 w-7" />}
            </div>
            <DialogTitle className="text-xl md:text-2xl font-black uppercase tracking-tight text-[#0F172A]">Recover Node</DialogTitle>
            <DialogDescription className="text-slate-400 text-sm font-bold uppercase tracking-widest text-center mt-2 leading-relaxed">Enter your registry email to receive a recovery link.</DialogDescription>
          </DialogHeader>
          <div className="py-8 space-y-6">
            <div className="space-y-2 text-left">
              <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Registry Email</Label>
              <Input 
                type="email" 
                value={resetEmail} 
                onChange={(e) => setResetEmail(e.target.value)} 
                placeholder="aspirant@cracklix.com" 
                className="h-14 bg-slate-50 border-none rounded-xl focus-visible:ring-primary text-[#0F172A] text-lg font-bold px-6 shadow-inner" 
              />
            </div>
          </div>
          <DialogFooter>
             <Button onClick={handleResetPassword} disabled={resetLoading} className="w-full h-16 bg-[#0F172A] hover:bg-black text-white font-black uppercase text-[10px] tracking-widest rounded-2xl shadow-xl transition-all border-none">
                {resetLoading ? "Transmitting..." : "Send Reset Link"}
             </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function BenefitItem({ text }: { text: string }) {
   return (
      <div className="flex items-center gap-4 text-slate-300">
         <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center shrink-0 border border-primary/20">
            <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
         </div>
         <span className="text-sm font-black uppercase tracking-widest">{text}</span>
      </div>
   )
}
