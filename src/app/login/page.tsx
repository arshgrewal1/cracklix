
"use client"

import React, { useState, Suspense, useEffect, useTransition } from "react"
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
  CheckCircle2, 
  Zap, 
  RefreshCw, 
  ClipboardList,
  Languages,
  Target,
  Smartphone
} from "lucide-react"
import { useAuth, useFirestore, useUser } from "@/firebase"
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
import { motion, AnimatePresence } from "framer-motion"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"

const SUPER_ADMIN_WHITELIST = ['arshdeepgrewal1122@gmail.com'];

/**
 * @fileOverview Cracklix Premium Login Hub v62.0.
 * FIXED: Removed vertical centering to align content 80px from top (Top-weighted SaaS Layout).
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
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
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

  useEffect(() => {
    if (!authLoading && user) {
      router.replace(returnUrl);
    }
  }, [user, authLoading, router, returnUrl]);

  const establishAuthority = async (userId: string) => {
    if (!db) return;
    const sessionId = crypto.randomUUID();
    localStorage.setItem('cracklix_session_id', sessionId);
    
    await updateDoc(doc(db, 'users', userId), {
      activeDeviceId: sessionId,
      sessionVersion: increment(1),
      lastLoginAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    if (mode === 'register' && password !== confirmPassword) {
      toast({ variant: "destructive", title: "Wait", description: "Passwords must match." })
      return
    }

    setLoading(true)
    try {
      if (mode === 'login') {
        const result = await signInWithEmailAndPassword(auth, email, password)
        await establishAuthority(result.user.uid);
        toast({ title: "Welcome Back" })
        startTransition(() => {
          router.replace(returnUrl)
          router.refresh()
        })
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password)
        const userNode = userCredential.user
        await updateProfile(userNode, { displayName: name })
        const isSuperAdmin = email && SUPER_ADMIN_WHITELIST.includes(email.toLowerCase());
        const sessionId = crypto.randomUUID();
        localStorage.setItem('cracklix_session_id', sessionId);
        
        await setDoc(doc(db!, 'users', userNode.uid), {
          id: userNode.uid, name, email, role: isSuperAdmin ? 'SUPER_ADMIN' : 'STUDENT',
          state: "Punjab", createdAt: new Date().toISOString(), updatedAt: serverTimestamp(),
          status: 'Free', passType: 'FREE', activeDeviceId: sessionId, sessionVersion: 1,
          lastLoginAt: serverTimestamp(), pinnedExams: [], verified: true
        })

        toast({ title: "Account Created" })
        startTransition(() => {
          router.replace(returnUrl)
          router.refresh()
        })
      }
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message })
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    if (loading) return;
    setLoading(true)
    try {
      const provider = new GoogleAuthProvider()
      const result = await signInWithPopup(auth, provider)
      const userNode = result.user
      if (!userNode.email) throw new Error("Email is required.");
      const userRef = doc(db!, 'users', userNode.uid)
      const userSnap = await getDoc(userRef)
      const isSuperAdmin = SUPER_ADMIN_WHITELIST.includes(userNode.email.toLowerCase());
      const sessionId = crypto.randomUUID();
      localStorage.setItem('cracklix_session_id', sessionId);
      
      if (!userSnap.exists()) {
        await setDoc(userRef, {
          id: userNode.uid, name: userNode.displayName || "Aspirant", email: userNode.email,
          role: isSuperAdmin ? 'SUPER_ADMIN' : 'STUDENT', state: "Punjab", createdAt: new Date().toISOString(),
          updatedAt: serverTimestamp(), status: 'Free', passType: 'FREE', activeDeviceId: sessionId,
          sessionVersion: 1, lastLoginAt: serverTimestamp(), pinnedExams: [], verified: true
        })
      } else {
        await updateDoc(userRef, { activeDeviceId: sessionId, sessionVersion: increment(1), lastLoginAt: serverTimestamp(), updatedAt: serverTimestamp() });
      }
      
      toast({ title: "Welcome" })
      startTransition(() => {
        router.replace(returnUrl)
        router.refresh()
      })
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message })
      setLoading(false)
    }
  }

  const handleResetPassword = async () => {
    if (!resetEmail) { toast({ variant: "destructive", title: "Wait", description: "Enter your email." }); return; }
    setResetLoading(true);
    try {
      await sendPasswordResetEmail(auth, resetEmail);
      toast({ title: "Reset Link Sent" });
      setIsResetDialogOpen(false);
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    } finally { setResetLoading(false); }
  };

  const isActuallyLoading = loading || isPending;

  return (
    <div className="min-h-screen bg-white flex flex-col lg:flex-row text-[#0F172A] font-body selection:bg-primary/20 overflow-x-hidden">
      
      {/* LEFT PANEL: BRANDING (Top Aligned) */}
      <div className="hidden lg:flex flex-[1.1] bg-gradient-to-br from-[#020B2D] via-[#071B4D] to-[#0A2D7A] text-white p-12 xl:p-20 flex-col justify-start relative overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-primary/20 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-[-5%] left-[-5%] w-[300px] h-[300px] bg-blue-400/10 blur-[100px] rounded-full pointer-events-none" />

        <div className="relative z-10 space-y-12 xl:space-y-16 max-w-[550px]">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Logo variant="dark" align="left" imgClassName="h-[90px] xl:h-[110px]" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="space-y-6"
          >
            <h1 className="text-5xl xl:text-6xl font-[900] tracking-tight text-white leading-[1.05] uppercase">
              Punjab's Smart <br/> 
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-300">
                Exam Platform
              </span>
            </h1>
            <p className="text-base xl:text-xl text-slate-300 font-medium leading-relaxed tracking-wide">
              Practice Mock Tests. Track Progress. <br/> Crack Government Exams.
            </p>
          </motion.div>

          {/* Stats Section */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="grid grid-cols-2 gap-6 pt-2"
          >
            <HeroStat icon={ClipboardList} label="500+ Mock Tests" />
            <HeroStat icon={Zap} label="50,000+ Questions" />
            <HeroStat icon={Languages} label="Bilingual Support" />
            <HeroStat icon={ShieldCheck} label="Real Exam Simulation" />
          </motion.div>
        </div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.6 }}
          transition={{ delay: 0.6 }}
          className="absolute bottom-12 left-12 flex items-center gap-4 text-slate-400"
        >
          <ShieldCheck className="h-5 w-5 text-primary" />
          <p className="text-[10px] font-black uppercase tracking-[0.4em]">Trusted By Punjab Aspirants</p>
        </motion.div>
      </div>

      {/* RIGHT PANEL: AUTH (Top Aligned) */}
      <div className="flex-1 flex flex-col items-center justify-start p-6 md:p-12 lg:p-20 relative bg-slate-50 lg:bg-white overflow-y-auto">
        
        {/* Mobile Logo */}
        <div className="lg:hidden mb-12">
          <Logo variant="light" align="center" imgClassName="h-[80px]" />
        </div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-[500px]"
        >
          <Card className="border-none shadow-5xl lg:shadow-none bg-white/92 backdrop-blur-[20px] rounded-[32px] p-8 md:p-12 space-y-8">
            <div className="space-y-1.5 text-center lg:text-left">
               <h2 className="text-3xl md:text-4xl font-[900] tracking-tight text-[#0F172A] leading-none uppercase">Welcome Back</h2>
               <p className="text-slate-400 font-bold text-[11px] uppercase tracking-[0.2em] leading-none">Access your preparation hub</p>
            </div>

            <form onSubmit={handleEmailAuth} className="space-y-6">
              {mode === 'register' && (
                <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                  <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Full Name</Label>
                  <div className="relative group">
                    <User className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 group-focus-within:text-primary transition-colors" />
                    <Input value={name} onChange={(e) => setName(e.target.value)} required className="h-14 rounded-xl bg-slate-50 border-none text-[#0F172A] placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-primary/20 text-base font-bold pl-14 shadow-inner" placeholder="e.g. Arsh Grewal" />
                  </div>
                </div>
              )}
              
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Email Address</Label>
                <div className="relative group">
                  <Mail className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 group-focus-within:text-primary transition-colors" />
                  <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="h-14 rounded-xl bg-slate-50 border-none text-[#0F172A] placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-primary/20 text-base font-bold pl-14 shadow-inner" placeholder="name@domain.com" />
                </div>
              </div>

              <div className="space-y-5">
                <div className="grid grid-cols-1 gap-5">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Password</Label>
                    <div className="relative group">
                      <Lock className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 group-focus-within:text-primary transition-colors" />
                      <Input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} required className="h-14 rounded-xl bg-slate-50 border-none text-[#0F172A] placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-primary/20 pl-14 pr-12 text-base font-bold shadow-inner" placeholder="Secret Key" />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary transition-colors">{showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}</button>
                    </div>
                  </div>
                  {mode === 'register' && (
                    <div className="space-y-2 animate-in fade-in slide-in-from-right-2">
                      <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Repeat Key</Label>
                      <Input type={showPassword ? "text" : "password"} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required className="h-14 rounded-xl bg-slate-50 border-none text-[#0F172A] placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-primary/20 px-6 text-base font-bold shadow-inner" placeholder="Repeat password" />
                    </div>
                  )}
                </div>

                {mode === 'login' && (
                  <div className="flex items-center justify-between px-1">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="remember" className="rounded-md border-slate-300" />
                      <label htmlFor="remember" className="text-[11px] font-bold text-slate-500 uppercase tracking-wider cursor-pointer select-none">Remember Me</label>
                    </div>
                    <button type="button" onClick={() => setIsResetDialogOpen(true)} className="text-[11px] font-[900] uppercase tracking-widest text-primary hover:text-blue-700 transition-colors">Forgot Password?</button>
                  </div>
                )}
              </div>

              <div className="pt-2 flex flex-col gap-4">
                <Button 
                  type="submit" 
                  className="w-full h-14 md:h-16 bg-gradient-to-r from-[#0A5FFF] to-[#2E89FF] hover:from-[#2E89FF] hover:to-[#0A5FFF] text-white font-black text-xs uppercase tracking-[0.2em] rounded-xl shadow-xl shadow-blue-500/20 border-none transition-all active:scale-[0.98] hover:translate-y-[-1px]" 
                  disabled={isActuallyLoading}
                >
                  {isActuallyLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : (mode === 'login' ? "Continue to Hub" : "Create My Account")}
                </Button>

                <div className="flex items-center gap-4 py-1">
                  <div className="h-px flex-1 bg-slate-100" />
                  <span className="text-[9px] font-black text-slate-300 uppercase tracking-[0.3em]">OR</span>
                  <div className="h-px flex-1 bg-slate-100" />
                </div>

                <Button 
                  variant="outline" 
                  className="w-full h-14 border-2 border-slate-100 bg-white text-[#0F172A] gap-4 rounded-xl font-black text-[11px] hover:bg-slate-50 uppercase tracking-widest transition-all shadow-sm" 
                  onClick={handleGoogleSignIn} 
                  disabled={isActuallyLoading}
                >
                   <img src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" className="h-5 w-5" alt="G" /> Google Login
                </Button>
              </div>
            </form>

            <div className="text-center pt-6 border-t border-slate-50">
               <p className="text-[12px] font-bold text-slate-400">
                {mode === 'login' ? "Don't have an account?" : "Already registered?"}
                <button onClick={() => setMode(mode === 'login' ? 'register' : 'login')} className="text-primary hover:underline font-black uppercase tracking-widest ml-2">
                  {mode === 'login' ? 'Create Account' : 'Login Hub'}
                </button>
               </p>
            </div>
          </Card>

          <div className="mt-8 text-center space-y-3 opacity-40">
             <div className="flex items-center justify-center gap-3">
                <ShieldCheck className="h-4 w-4 text-primary" />
                <p className="text-[9px] font-black uppercase tracking-[0.3em]">Secure Authentication Node</p>
             </div>
          </div>
        </motion.div>
      </div>

      <Dialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
        <DialogContent className="bg-white rounded-[2rem] md:rounded-[3rem] max-w-[440px] p-10 shadow-5xl text-left border-none">
          <DialogHeader className="text-center space-y-4">
            <div className="h-14 w-14 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto text-primary shadow-xl">{resetLoading ? <Loader2 className="h-7 w-7 animate-spin" /> : <RefreshCw className="h-7 w-7" />}</div>
            <DialogTitle className="text-2xl font-[900] uppercase tracking-tight text-[#0F172A]">Recover Account</DialogTitle>
            <DialogDescription className="text-slate-400 text-sm font-bold uppercase tracking-widest text-center mt-2 leading-relaxed">Enter your email to receive a reset link.</DialogDescription>
          </DialogHeader>
          <div className="py-8 space-y-6">
            <div className="space-y-2 text-left">
              <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Your Email</Label>
              <Input type="email" value={resetEmail} onChange={(e) => setResetEmail(e.target.value)} placeholder="aspirant@cracklix.com" className="h-16 bg-slate-50 border-none rounded-2xl focus-visible:ring-primary text-[#0F172A] text-lg font-bold px-6 shadow-inner" />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleResetPassword} disabled={resetLoading} className="w-full h-16 bg-[#0F172A] hover:bg-black text-white font-black uppercase text-[10px] tracking-widest rounded-2xl shadow-xl transition-all border-none">
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
    <div className="flex items-center gap-3.5 group">
      <div className="h-10 w-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
        <Icon className="h-5 w-5 text-primary" />
      </div>
      <span className="text-xs xl:text-[13px] font-bold uppercase tracking-widest text-slate-200">{label}</span>
    </div>
  )
}
