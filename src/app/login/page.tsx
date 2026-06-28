'use client';

import React, { useState, Suspense, useEffect, useMemo } from "react"
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
  ChevronLeft,
  AlertCircle
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
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore"
import { useToast } from "@/hooks/use-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { motion } from "framer-motion"
import { Checkbox } from "@/components/ui/checkbox"
import Link from "next/link"
import { Capacitor } from "@capacitor/core"
import Image from "next/image"

const SUPER_ADMIN_WHITELIST = ['arshdeepgrewal1122@gmail.com'];

/**
 * @fileOverview Cracklix Premium Login Hub v85.0.
 * FIXED: Relocated welcome banner trigger from Dashboard to Login actions.
 */

const formatCompact = (num: number) => {
  if (!num || num === 0) return "0";
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toString();
};

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
  
  const { user, profile, loading: authLoading } = useUser()
  const router = useRouter()
  const searchParams = useSearchParams()
  const auth = useAuth()
  const db = useFirestore()
  const { toast } = useToast()

  const statsRef = useMemo(() => (db ? doc(db, "settings", "stats") : null), [db]);
  const { data: stats, loading: statsLoading } = useDoc<any>(statsRef);

  const returnUrl = searchParams.get("returnUrl") || "/dashboard"

  useEffect(() => {
    if (searchParams.get("returnUrl")) {
      toast({
        title: "Login Required",
        description: "Please login to access the preparation hub.",
      });
    }
  }, [searchParams, toast]);

  useEffect(() => {
    if (!authLoading && user && profile) {
      router.replace(returnUrl);
    }
  }, [user, profile, authLoading, router, returnUrl]);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    if (mode === 'register' && password !== confirmPassword) {
      toast({ variant: "destructive", title: "Wait", description: "Passwords must match." })
      return
    }

    setLoading(true)
    try {
      if (mode === 'login') {
        const userCredential = await signInWithEmailAndPassword(auth, email, password)
        
        // Fetch profile specifically for the greeting name
        const userRef = doc(db!, 'users', userCredential.user.uid)
        const userSnap = await getDoc(userRef)
        const firstName = (userSnap.data()?.name || "Aspirant").split(' ')[0]

        toast({
          title: `Welcome Back, ${firstName}!`,
          description: "Your preparation hub is synchronized.",
        });

        router.replace(returnUrl)
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password)
        const userNode = userCredential.user
        await updateProfile(userNode, { displayName: name })
        
        const isSuperAdmin = email && SUPER_ADMIN_WHITELIST.includes(email.toLowerCase());
        
        await setDoc(doc(db!, 'users', userNode.uid), {
          id: userNode.uid,
          name,
          email,
          role: isSuperAdmin ? 'SUPER_ADMIN' : 'STUDENT',
          state: "Punjab",
          createdAt: new Date().toISOString(),
          updatedAt: serverTimestamp(),
          status: 'Free',
          passType: 'FREE',
          pinnedExams: []
        })

        toast({ 
          title: `Welcome, ${name.split(' ')[0]}!`,
          description: "Account created successfully." 
        })
        router.replace(returnUrl)
      }
    } catch (error: any) {
      let message = error.message;
      if (error.code === 'auth/invalid-credential') {
        message = "Incorrect email or password. Please try again.";
      } else if (error.code === 'auth/user-not-found') {
        message = "No account found with this email.";
      } else if (error.code === 'auth/wrong-password') {
        message = "Incorrect password.";
      }
      
      toast({ variant: "destructive", title: "Auth Failed", description: message })
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    if (loading) return;

    if (Capacitor.isNativePlatform()) {
       toast({
         title: "📱 Mobile Login",
         description: "Please use your email and password to login on the Android app.",
         variant: "destructive"
       });
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
      const isSuperAdmin = SUPER_ADMIN_WHITELIST.includes(userNode.email.toLowerCase());
      
      let finalName = userNode.displayName || "Aspirant";

      if (!userSnap.exists()) {
        await setDoc(userRef, {
          id: userNode.uid,
          name: userNode.displayName || "Aspirant",
          email: userNode.email,
          role: isSuperAdmin ? 'SUPER_ADMIN' : 'STUDENT',
          state: "Punjab",
          createdAt: new Date().toISOString(),
          updatedAt: serverTimestamp(),
          status: 'Free',
          passType: 'FREE',
          pinnedExams: []
        })
      } else {
        finalName = userSnap.data()?.name || userNode.displayName || "Aspirant";
      }

      toast({
        title: `Welcome Back, ${finalName.split(' ')[0]}!`,
        description: "Your preparation hub is synchronized.",
      });

      router.replace(returnUrl)
    } catch (error: any) {
      toast({ variant: "destructive", title: "Social Auth Error", description: error.message })
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

  return (
    <div className="min-h-[100dvh] bg-white flex flex-col lg:flex-row text-[#0F172A] font-body selection:bg-primary/20 overflow-x-hidden">
      
      {/* LEFT PANEL: BRANDING */}
      <div className="hidden lg:flex flex-[1.1] bg-gradient-to-br from-[#020B2D] via-[#071B4D] to-[#0A2D7A] text-white p-12 xl:p-20 flex-col justify-start relative overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-primary/20 blur-[120px] rounded-full pointer-events-none" />

        <div className="relative z-10 space-y-12 xl:space-y-20 max-w-[650px] pt-12 xl:pt-20">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
            <Logo variant="dark" align="left" className="h-[180px] xl:h-[240px]" />
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="space-y-8">
            <h1 className="text-5xl xl:text-6xl font-[900] tracking-tight text-white leading-[1.05] max-w-[550px]">
              Punjab's Smart <br/> 
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-300">
                Exam Platform
              </span>
            </h1>
            <p className="text-base xl:text-xl text-slate-300 font-medium leading-relaxed tracking-wide">
              Real-time mock tests and performance analytics verified by the Punjab recruitment registry.
            </p>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="grid grid-cols-2 gap-8 pt-6">
            <HeroStat icon={ClipboardList} label={`${statsLoading ? '...' : formatCompact(stats?.totalMocks)}+ Mock Tests`} />
            <HeroStat icon={Zap} label={`${statsLoading ? '...' : formatCompact(stats?.totalQuestions)}+ Questions`} />
            <HeroStat icon={Users} label={`${statsLoading ? '...' : formatCompact(stats?.totalUsers)}+ Active Aspirants`} />
            <HeroStat icon={ShieldCheck} label="Real Exam Pattern" />
          </motion.div>
        </div>
      </div>

      {/* RIGHT PANEL: AUTH */}
      <div className="flex-1 flex flex-col items-center justify-start p-4 md:p-12 lg:p-20 relative bg-slate-50 lg:bg-white overflow-y-auto">
        
        <div className="w-full flex items-center justify-between mb-8 lg:hidden">
           <Link href="/" className="flex items-center gap-2 text-slate-400 font-bold uppercase text-[10px] tracking-widest hover:text-primary transition-colors">
              <ChevronLeft className="h-4 w-4" /> Home
           </Link>
           <Logo variant="light" align="left" className="h-28" />
           <div className="w-10" />
        </div>

        <motion.div 
           initial={{ opacity: 0, scale: 0.95 }} 
           animate={{ opacity: 1, scale: 1 }} 
           className="w-full max-w-[480px] pt-4 lg:pt-20 pb-24" 
        >
          <Card className="border-none shadow-5xl lg:shadow-none bg-white/92 backdrop-blur-[20px] rounded-[32px] p-6 md:p-12 space-y-6 md:space-y-10">
            <div className="space-y-2 text-center lg:text-left">
               <h2 className="text-2xl md:text-4xl font-[900] tracking-tight text-[#0F172A] leading-none">
                 {mode === 'login' ? 'Welcome Back' : 'Create Account'}
               </h2>
               <p className="text-slate-400 font-bold text-[10px] md:text-[11px] uppercase tracking-widest mt-2">
                 {mode === 'login' ? 'Access your preparation hub' : 'Join the elite preparation network'}
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
                    <Input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} required className="h-14 md:h-16 rounded-2xl bg-slate-50 border-none text-[#0F172A] pl-12 md:pl-14 pr-12 font-bold shadow-inner" placeholder="Secret key" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">{showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}</button>
                  </div>
                </div>

                {mode === 'register' && (
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-bold text-slate-400 ml-1">Confirm Password</Label>
                    <div className="relative group">
                      <Lock className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 group-focus-within:text-primary transition-colors" />
                      <Input type={showPassword ? "text" : "password"} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required className="h-14 md:h-16 rounded-2xl bg-slate-50 border-none text-[#0F172A] pl-12 md:pl-14 shadow-inner" placeholder="Repeat key" />
                    </div>
                  </div>
                )}

                {mode === 'login' && (
                  <div className="flex items-center justify-between px-1">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="remember" className="rounded-md" />
                      <label htmlFor="remember" className="text-[11px] font-bold text-slate-500 uppercase tracking-wider cursor-pointer">Remember me</label>
                    </div>
                    <button type="button" onClick={() => setIsResetDialogOpen(true)} className="text-[11px] font-black text-primary">Forgot password?</button>
                  </div>
                )}
              </div>

              <div className="pt-2 flex flex-col gap-4">
                <Button type="submit" className="w-full h-14 md:h-18 bg-blue-600 text-white font-bold text-xs uppercase tracking-widest rounded-full shadow-xl border-none transition-all active:scale-[0.98]" disabled={loading}>
                  {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : (mode === 'login' ? "Continue to Hub" : "Create My Account")}
                </Button>
                <div className="flex items-center gap-3 py-1">
                  <div className="h-px flex-1 bg-slate-100" />
                  <span className="text-[9px] font-bold text-slate-300 uppercase">OR</span>
                  <div className="h-px flex-1 bg-slate-100" />
                </div>
                <Button variant="outline" className="w-full h-14 border-2 border-slate-100 text-[#0F172A] gap-3 rounded-full font-bold text-[10px] md:text-[11px] hover:bg-slate-50 uppercase tracking-tight shadow-sm" onClick={handleGoogleSignIn} disabled={loading}>
                   <Image src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" width={20} height={20} className="h-5 w-5" alt="Google Logo" /> Google Login
                </Button>
              </div>
            </form>

            <div className="text-center pt-8 border-t border-slate-50">
               <p className="text-[11px] md:text-[13px] font-bold text-slate-400">
                {mode === 'login' ? "Don't have an account?" : "Already registered?"}
                <button 
                  onClick={() => {
                    setMode(mode === 'login' ? 'register' : 'login');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }} 
                  className="text-primary font-black ml-2 hover:underline"
                >
                  {mode === 'login' ? 'Create Account' : 'Login Hub'}
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
            <DialogTitle className="text-xl md:text-2xl font-[900] tracking-tight text-[#0F172A]">Recover Account</DialogTitle>
            <DialogDescription className="text-slate-400 text-[10px] md:sm font-bold text-center mt-2 leading-relaxed">Enter your email for reset link.</DialogDescription>
          </DialogHeader>
          <div className="py-8 space-y-6">
            <div className="space-y-1.5 text-left">
              <Label className="text-[10px] font-bold text-slate-400 ml-1">Your email</Label>
              <Input type="email" value={resetEmail} onChange={(e) => setResetEmail(e.target.value)} placeholder="aspirant@cracklix.com" className="h-16 bg-slate-50 border-none rounded-2xl text-[#0F172A] text-base font-bold px-6 shadow-inner" />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => handleResetPassword()} disabled={resetLoading} className="w-full h-16 bg-blue-600 hover:bg-blue-700 text-white font-bold text-[10px] tracking-widest rounded-full shadow-xl transition-all border-none">
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
      <span className="text-[11px] md:text-sm xl:text-lg font-bold tracking-tight text-slate-200">{label}</span>
    </div>
  )
}
