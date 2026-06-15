"use client"

import { useState, Suspense, useEffect, useTransition } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import Logo from "@/components/brand/Logo"
import { ShieldCheck, Mail, Lock, ChevronLeft, User, Phone, AlertCircle, RefreshCw, Eye, EyeOff, Loader2 } from "lucide-react"
import { useAuth, useFirestore, useUser } from "@/firebase"
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider,
  sendPasswordResetEmail,
  updateProfile
} from "firebase/auth"
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore"
import { useToast } from "@/hooks/use-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

/**
 * @fileOverview Optimized Login Hub v12.0 (Bug Fix).
 * FIXED: Resolved [object Object] error in input fields by updating onChange handlers.
 * UPDATED: Logo scaling calibrated for a high-fidelity institutional feel.
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

  useEffect(() => {
    if (!authLoading && user) {
       router.replace(returnUrl);
    }
  }, [user, authLoading, router, returnUrl]);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    if (mode === 'register' && password !== confirmPassword) {
      toast({ variant: "destructive", title: "Wait", description: "Passwords must match." })
      return
    }

    setLoading(true)
    try {
      if (mode === 'login') {
        await signInWithEmailAndPassword(auth, email, password)
        toast({ title: "Login Successful", description: "Welcome back!" })
        startTransition(() => { router.replace(returnUrl) })
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password)
        const user = userCredential.user
        await updateProfile(user, { displayName: name })
        const isSuperAdmin = email && SUPER_ADMIN_WHITELIST.includes(email.toLowerCase());
        await setDoc(doc(db, 'users', user.uid), {
          id: user.uid, name, email, phone: `+91 ${phone}`,
          role: isSuperAdmin ? 'SUPER_ADMIN' : 'STUDENT',
          state: "Punjab", createdAt: new Date().toISOString(),
          updatedAt: serverTimestamp(), status: 'Free', pinnedExams: []
        })
        toast({ title: "Account Created", description: "Welcome to Cracklix!" })
        startTransition(() => { router.replace(returnUrl) })
      }
    } catch (error: any) {
      toast({ variant: "destructive", title: "Auth Error", description: error.message })
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
      const user = result.user
      if (!user.email) throw new Error("Google account email is mandatory.");
      const userRef = doc(db, 'users', user.uid)
      const userSnap = await getDoc(userRef)
      const isSuperAdmin = SUPER_ADMIN_WHITELIST.includes(user.email.toLowerCase());
      if (!userSnap.exists()) {
        await setDoc(userRef, {
          id: user.uid, name: user.displayName || "Aspirant",
          email: user.email, role: isSuperAdmin ? 'SUPER_ADMIN' : 'STUDENT',
          state: "Punjab", createdAt: new Date().toISOString(),
          updatedAt: serverTimestamp(), status: 'Free', pinnedExams: [], phone: ""
        })
      }
      toast({ title: "Welcome", description: `Signed in as ${user.displayName}` })
      startTransition(() => { router.replace(returnUrl) })
    } catch (error: any) {
      toast({ variant: "destructive", title: "Login Failed", description: error.message })
      setLoading(false)
    }
  }

  const handleResetPassword = async () => {
    if (!resetEmail) {
      toast({ variant: "destructive", title: "Wait", description: "Please enter your email." });
      return;
    }
    setResetLoading(true);
    try {
      await sendPasswordResetEmail(auth, resetEmail);
      toast({ title: "Reset Link Sent", description: "Check your inbox for instructions." });
      setIsResetDialogOpen(false);
    } catch (error: any) {
      toast({ variant: "destructive", title: "Failed to Send", description: error.message });
    } finally {
      setResetLoading(false);
    }
  };

  if (!authLoading && user) return null;

  const isActuallyLoading = loading || isPending;

  return (
    <div className="min-h-screen bg-[#020817] flex flex-col items-center justify-center p-4 md:p-6 relative overflow-hidden text-white">
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/10 blur-[120px] rounded-full" />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="z-10 w-full max-w-md">
        <div className="flex flex-col items-center mb-8 h-12 md:h-16 w-full">
          <Logo variant="light" imgClassName="h-full" />
        </div>
        <Card className="border-white/10 bg-white/[0.03] backdrop-blur-2xl shadow-2xl rounded-[2rem] md:rounded-[2.5rem] overflow-hidden">
          <div className="h-1 w-full bg-primary" />
          <CardHeader className="text-center pt-8 md:pt-10">
            <CardTitle className="text-xl md:text-2xl font-headline font-black uppercase tracking-tight text-white">{mode === 'login' ? "Login" : "Create Account"}</CardTitle>
            <CardDescription className="text-slate-400 font-bold uppercase text-[8px] md:text-[10px] tracking-widest mt-2">MANAGE YOUR STUDY PROGRESS.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 md:space-y-6 pb-10 md:pb-12">
            <form onSubmit={handleEmailAuth} className="space-y-3 md:space-y-4">
              {mode === 'register' && (
                <div className="space-y-3 md:space-y-4">
                  <Input 
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                    required 
                    className="h-10 md:h-12 rounded-xl bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus-visible:ring-primary text-xs md:text-sm" 
                    placeholder="Your Full Name" 
                  />
                  <Input 
                    value={phone} 
                    onChange={(e) => setPhone(e.target.value)} 
                    required 
                    maxLength={10} 
                    className="h-10 md:h-12 rounded-xl bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus-visible:ring-primary text-xs md:text-sm" 
                    placeholder="Mobile Number" 
                  />
                </div>
              )}
              <Input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
                className="h-10 md:h-12 rounded-xl bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus-visible:ring-primary text-xs md:text-sm" 
                placeholder="Email Address" 
              />
              <div className="relative">
                <Input 
                  type={showPassword ? "text" : "password"} 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  required 
                  className="h-10 md:h-12 rounded-xl bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus-visible:ring-primary pr-10 text-xs md:text-sm" 
                  placeholder="Password" 
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors">
                  {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                </button>
              </div>
              {mode === 'login' && (
                <div className="flex justify-end">
                  <button type="button" onClick={() => setIsResetDialogOpen(true)} className="text-[8px] md:text-[10px] font-black uppercase text-primary hover:text-orange-400 transition-colors tracking-widest">Forgot Password?</button>
                </div>
              )}
              {mode === 'register' && (
                <div className="relative">
                  <Input 
                    type={showConfirmPassword ? "text" : "password"} 
                    value={confirmPassword} 
                    onChange={(e) => setConfirmPassword(e.target.value)} 
                    required 
                    className="h-10 md:h-12 rounded-xl bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus-visible:ring-primary pr-10 text-xs md:text-sm" 
                    placeholder="Confirm Password" 
                  />
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors">
                    {showConfirmPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  </button>
                </div>
              )}
              <Button type="submit" className="w-full h-12 md:h-14 bg-primary hover:bg-orange-600 text-white font-black uppercase tracking-[0.2em] text-[12px] md:text-[14px] rounded-xl shadow-xl border-none transition-all active:scale-95" disabled={isActuallyLoading}>{isActuallyLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : (mode === 'login' ? "Login" : "Sign Up")}</Button>
            </form>
            <div className="flex items-center gap-3 py-1"><div className="h-px flex-1 bg-white/10" /><span className="text-[8px] font-black text-slate-500 uppercase">OR</span><div className="h-px flex-1 bg-white/10" /></div>
            <Button variant="outline" className="w-full h-10 md:h-12 border-white/10 bg-white/5 text-white gap-3 rounded-xl font-bold text-[10px] md:text-xs hover:bg-white/10" onClick={handleGoogleSignIn} disabled={isActuallyLoading}>Continue with Google</Button>
            <div className="text-center text-[8px] md:text-[10px] font-black uppercase text-slate-500 tracking-widest">{mode === 'login' ? (<p>NEW STUDENT? <button onClick={() => setMode('register')} className="text-primary hover:underline">Register Now</button></p>) : (<p>ALREADY A STUDENT? <button onClick={() => setMode('login')} className="text-primary hover:underline">Login</button></p>)}</div>
          </CardContent>
        </Card>
      </motion.div>

      <Dialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
        <DialogContent className="bg-[#0F172A] text-white border-white/10 rounded-[2rem] max-w-[360px] p-8 shadow-5xl text-left">
          <DialogHeader className="text-center space-y-3">
            <div className="h-14 w-14 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto text-primary shadow-xl"><RefreshCw className={cn("h-7 w-7", resetLoading && "animate-spin")} /></div>
            <DialogTitle className="text-xl font-headline font-black uppercase tracking-tight">Recover Account</DialogTitle>
            <DialogDescription className="text-slate-400 text-[8px] md:text-[10px] font-bold uppercase tracking-widest leading-relaxed">ENTER YOUR EMAIL TO RECEIVE A RESET LINK.</DialogDescription>
          </DialogHeader>
          <div className="py-6 space-y-4">
            <div className="space-y-1.5 text-left">
              <Label className="text-[8px] md:text-[10px] font-black uppercase text-slate-500 ml-1">Registered Email</Label>
              <Input 
                type="email" 
                value={resetEmail} 
                onChange={(e) => setResetEmail(e.target.value)} 
                placeholder="name@domain.com" 
                className="h-10 bg-white/5 border-white/10 rounded-xl focus-visible:ring-primary text-white text-xs" 
              />
            </div>
          </div>
          <DialogFooter><Button onClick={handleResetPassword} disabled={resetLoading} className="w-full h-12 bg-primary hover:bg-orange-600 text-white font-black uppercase tracking-widest text-[10px] rounded-xl shadow-2xl transition-all">{resetLoading ? "Sending..." : "Send Reset Link"}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
