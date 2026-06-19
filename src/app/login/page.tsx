"use client"

import React, { useState, Suspense, useEffect, useTransition } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import Logo from "@/components/brand/Logo"
import { Mail, Lock, User, Phone, Eye, EyeOff, Loader2, ShieldAlert } from "lucide-react"
import { useAuth, useFirestore, useUser } from "@/firebase"
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider,
  sendPasswordResetEmail,
  updateProfile,
} from "firebase/auth"
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore"
import { useToast } from "@/hooks/use-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { getDeviceId, getBrowserInfo } from "@/lib/device"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

/**
 * @fileOverview Hardened Login Hub v30.0.
 * BRAND SYSTEM: Logo centered, 60px height desktop / 50px mobile, 24px margin.
 */

const SUPER_ADMIN_WHITELIST = ['arshdeepgrewal1122@gmail.com'];

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
       router.replace(returnUrl);
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
        await updateActiveDevice(creds.user.uid);
        toast({ title: "Authorized", description: "Welcome to Cracklix" })
        startTransition(() => { router.replace(returnUrl) })
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password)
        const userNode = userCredential.user
        await updateProfile(userNode, { displayName: name })
        const isSuperAdmin = email && SUPER_ADMIN_WHITELIST.includes(email.toLowerCase());
        
        await setDoc(doc(db!, 'users', userNode.uid), {
          id: userNode.uid, name, email, phone: `+91 ${phone}`,
          role: isSuperAdmin ? 'SUPER_ADMIN' : 'STUDENT',
          state: "Punjab", createdAt: new Date().toISOString(),
          updatedAt: serverTimestamp(), status: 'Free', pinnedExams: []
        })

        await updateActiveDevice(userNode.uid);
        toast({ title: "Account Created", description: "Welcome to Cracklix" })
        startTransition(() => { router.replace(returnUrl) })
      }
    } catch (error: any) {
      toast({ variant: "destructive", title: "Sync Failed", description: error.message })
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
          updatedAt: serverTimestamp(), status: 'Free', pinnedExams: [], phone: ""
        })
      }
      
      await updateActiveDevice(userNode.uid);
      toast({ title: "Registry Synced", description: `Authorized as ${userNode.displayName}` })
      startTransition(() => { router.replace(returnUrl) })
    } catch (error: any) {
      toast({ variant: "destructive", title: "Sync Error", description: error.message })
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
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-4 md:p-10 relative overflow-hidden text-[#0F172A]">
      <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-primary/5 blur-[140px] rounded-full" />
      
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="z-10 w-full max-w-[440px] space-y-6">
        
        {/* BRAND OVERHAUL: Centered, specific heights, 24px bottom margin */}
        <Logo 
          variant="light" 
          align="center" 
          className="mb-6" 
          imgClassName="h-[50px] md:h-[60px]"
        />

        {sessionTerminated && (
          <div className="bg-amber-50 border border-amber-100 p-4 md:p-6 rounded-[1.5rem] md:rounded-[2rem] flex items-center gap-4 animate-in slide-in-from-top-6 duration-700 shadow-sm">
            <ShieldAlert className="h-6 w-6 text-amber-600 shrink-0" />
            <p className="text-xs md:text-sm font-bold text-amber-700 tracking-tight leading-snug text-left">
              Your session ended because this account was signed in on another device.
            </p>
          </div>
        )}

        <Card className="border-slate-100 bg-white/80 backdrop-blur-3xl shadow-5xl rounded-[1.5rem] md:rounded-[3.5rem] overflow-hidden border-2">
          <div className="h-1.5 w-full bg-primary" />
          <CardHeader className="text-center pt-8 md:pt-14 pb-4 px-4 md:px-16">
            <CardTitle className="text-xl md:text-4xl font-black tracking-tight text-[#0F172A] uppercase">
              {mode === 'login' ? "Login" : "Sign Up"}
            </CardTitle>
            <CardDescription className="text-slate-400 font-bold text-[9px] md:text-[12px] tracking-widest mt-2 md:mt-3 uppercase">Institutional Registry Access</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 md:space-y-10 pb-10 md:pb-20 px-4 md:px-16 text-left">
            <form onSubmit={handleEmailAuth} className="space-y-4 md:space-y-6">
              {mode === 'register' && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Full Identity</Label>
                    <Input 
                      value={name} 
                      onChange={(e) => setName(e.target.value)} 
                      required 
                      className="h-12 md:h-16 rounded-xl md:rounded-2xl bg-slate-50 border-none text-[#0F172A] placeholder:text-slate-400 focus-visible:ring-primary text-sm md:text-lg font-bold px-4 md:px-6 shadow-inner" 
                      placeholder="e.g. Arsh Grewal" 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Mobile Node</Label>
                    <div className="relative">
                      <span className="absolute left-4 md:left-6 top-1/2 -translate-y-1/2 text-slate-400 font-black text-sm md:text-lg">+91</span>
                      <Input 
                        value={phone} 
                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0,10))} 
                        required 
                        className="h-12 md:h-16 rounded-xl md:rounded-2xl bg-slate-50 border-none text-[#0F172A] placeholder:text-slate-400 focus-visible:ring-primary text-sm md:text-lg font-bold pl-20 md:pl-24 px-4 md:px-6 tracking-widest shadow-inner" 
                        placeholder="10-digit number" 
                      />
                    </div>
                  </div>
                </div>
              )}
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Email Address</Label>
                <Input 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  required 
                  className="h-12 md:h-16 rounded-xl md:rounded-2xl bg-slate-50 border-none text-[#0F172A] placeholder:text-slate-400 focus-visible:ring-primary text-sm md:text-lg font-bold px-4 md:px-6 shadow-inner" 
                  placeholder="name@domain.com" 
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Password</Label>
                <div className="relative">
                  <Input 
                    type={showPassword ? "text" : "password"} 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    required 
                    className="h-12 md:h-16 rounded-xl md:rounded-2xl bg-slate-50 border-none text-[#0F172A] placeholder:text-slate-400 focus-visible:ring-primary pr-12 md:pr-14 px-4 md:px-6 text-sm md:text-lg font-bold shadow-inner" 
                    placeholder="Enter secret key" 
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 md:right-6 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary transition-colors">
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {mode === 'login' && (
                  <div className="flex justify-end pr-1">
                    <button type="button" onClick={() => setIsResetDialogOpen(true)} className="text-[10px] md:text-[12px] font-bold text-primary hover:text-blue-700 transition-colors tracking-tight">Recover Password?</button>
                  </div>
                )}
              </div>
              {mode === 'register' && (
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Verify Password</Label>
                  <div className="relative">
                    <Input 
                      type={showConfirmPassword ? "text" : "password"} 
                      value={confirmPassword} 
                      onChange={(e) => setConfirmPassword(e.target.value)} 
                      required 
                      className="h-12 md:h-16 rounded-xl md:rounded-2xl bg-slate-50 border-none text-[#0F172A] placeholder:text-slate-400 focus-visible:ring-primary pr-12 md:pr-14 px-4 md:px-6 text-sm md:text-lg font-bold shadow-inner" 
                      placeholder="Repeat password" 
                    />
                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-4 md:right-6 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary transition-colors">
                      {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>
              )}
              <Button type="submit" className="w-full h-14 md:h-20 bg-primary hover:bg-blue-700 text-white font-black uppercase text-base md:text-lg rounded-xl md:rounded-[2.5rem] shadow-4xl shadow-primary/20 border-none transition-all active:scale-95 tracking-widest" disabled={isActuallyLoading}>
                {isActuallyLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : (mode === 'login' ? "Login" : "Create Account")}
              </Button>
            </form>
            <div className="flex items-center gap-4 py-2 md:py-4"><div className="h-px flex-1 bg-slate-100" /><span className="text-[9px] font-bold text-slate-300 tracking-widest uppercase">OR</span><div className="h-px flex-1 bg-slate-100" /></div>
            <Button variant="outline" className="w-full h-12 md:h-16 border-slate-100 bg-white text-[#0F172A] gap-4 rounded-xl md:rounded-2xl font-bold text-sm hover:bg-slate-50 tracking-tight shadow-sm" onClick={handleGoogleSignIn} disabled={isActuallyLoading}>
               <img src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" className="h-4 w-4 md:h-5 md:w-5" alt="G" /> Google Account
            </Button>
            <div className="text-center text-[11px] md:text-[14px] font-bold text-slate-400 tracking-tight mt-4">
               {mode === 'login' ? (<p>New aspirant? <button onClick={() => setMode('register')} className="text-primary hover:text-blue-700 font-black transition-colors ml-1">Create account</button></p>) : (<p>Already registered? <button onClick={() => mode === 'register' && setMode('login')} className="text-primary hover:text-blue-700 font-black transition-colors ml-1">Login now</button></p>)}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <Dialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
        <DialogContent className="bg-white rounded-[2rem] md:rounded-[3rem] max-w-[90vw] sm:max-w-[400px] p-8 md:p-10 shadow-5xl text-left border-none">
          <DialogHeader className="text-center space-y-4">
            <div className="h-14 w-14 md:h-16 md:w-16 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto text-primary shadow-xl">
              <Loader2 className={cn("h-7 w-7 md:h-8 md:w-8", resetLoading && "animate-spin")} />
            </div>
            <DialogTitle className="text-xl md:text-2xl font-black uppercase tracking-tight text-[#0F172A]">Recover Node</DialogTitle>
            <DialogDescription className="text-slate-400 text-[10px] md:text-[11px] font-bold tracking-widest uppercase leading-relaxed">Enter your email to receive a reset link.</DialogDescription>
          </DialogHeader>
          <div className="py-6 md:py-8 space-y-6">
            <div className="space-y-2 text-left">
              <Label className="text-[10px] md:text-[11px] font-black text-slate-400 ml-1 uppercase">Registry Email</Label>
              <Input 
                type="email" 
                value={resetEmail} 
                onChange={(e) => setResetEmail(e.target.value)} 
                placeholder="aspirant@cracklix.com" 
                className="h-12 md:h-14 bg-slate-50 border-none rounded-xl focus-visible:ring-primary text-[#0F172A] text-sm md:text-base px-6 font-bold shadow-inner" 
              />
            </div>
          </div>
          <DialogFooter><Button onClick={handleResetPassword} disabled={resetLoading} className="w-full h-14 md:h-16 bg-primary hover:bg-blue-700 text-white font-black uppercase text-sm md:text-lg rounded-xl md:rounded-2xl shadow-4xl shadow-primary/20 transition-all border-none tracking-widest">{resetLoading ? "Transmitting..." : "Send Reset Link"}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
