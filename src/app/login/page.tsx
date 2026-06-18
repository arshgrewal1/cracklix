"use client"

import { useState, Suspense, useEffect, useTransition } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import Logo from "@/components/brand/Logo"
import { ShieldCheck, Mail, Lock, ChevronLeft, User, Phone, AlertCircle, RefreshCw, Eye, EyeOff, Loader2, Smartphone, ShieldAlert } from "lucide-react"
import { useAuth, useFirestore, useUser } from "@/firebase"
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider,
  sendPasswordResetEmail,
  updateProfile,
  signOut
} from "firebase/auth"
import { doc, setDoc, getDoc, serverTimestamp, collection, getDocs } from "firebase/firestore"
import { useToast } from "@/hooks/use-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { getDeviceId, getBrowserInfo } from "@/lib/device"
import { motion } from "framer-motion"

/**
 * @fileOverview Hardened Login Hub v23.0 (Responsive Fix).
 * FIXED: Reduced card padding for extra small screens (320px) to prevent layout break.
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
  const [deviceError, setDeviceError] = useState<string | null>(null)
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
    if (!authLoading && user && !deviceError) {
       router.replace(returnUrl);
    }
  }, [user, authLoading, router, returnUrl, deviceError]);

  const onAuthSuccess = async (userId: string) => {
    if (!db) return;
    
    setLoading(true);
    const deviceId = await getDeviceId();
    const { browser, platform } = getBrowserInfo();
    
    const deviceRef = doc(db, 'users', userId, 'devices', deviceId);
    const deviceSnap = await getDoc(deviceRef);
    
    if (!deviceSnap.exists()) {
      const devicesSnap = await getDocs(collection(db, 'users', userId, 'devices'));
      if (devicesSnap.size >= 2) {
        await signOut(auth);
        setDeviceError("Device limit exceeded. Maximum 2 registered devices allowed.");
        setLoading(false);
        return false;
      } else {
        await setDoc(deviceRef, {
          id: deviceId,
          browser,
          platform,
          deviceName: browser,
          firstLogin: serverTimestamp(),
          lastActive: serverTimestamp()
        });
        await setDoc(doc(db, 'users', userId), { deviceCount: devicesSnap.size + 1 }, { merge: true });
      }
    } else {
      await setDoc(deviceRef, { lastActive: serverTimestamp() }, { merge: true });
    }

    await setDoc(doc(db, 'users', userId), {
      activeDeviceId: deviceId,
      lastLoginAt: serverTimestamp(),
      activeBrowser: browser,
      activePlatform: platform,
      updatedAt: serverTimestamp()
    }, { merge: true });
    
    setLoading(false);
    return true;
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setDeviceError(null);
    if (mode === 'register' && password !== confirmPassword) {
      toast({ variant: "destructive", title: "Wait", description: "Passwords must match." })
      return
    }

    setLoading(true)
    try {
      if (mode === 'login') {
        const creds = await signInWithEmailAndPassword(auth, email, password)
        const authorized = await onAuthSuccess(creds.user.uid);
        if (authorized) {
          toast({ title: "Login Successful", description: "Welcome back!" })
          startTransition(() => { router.replace(returnUrl) })
        }
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password)
        const user = userCredential.user
        await updateProfile(user, { displayName: name })
        const isSuperAdmin = email && SUPER_ADMIN_WHITELIST.includes(email.toLowerCase());
        
        await setDoc(doc(db!, 'users', user.uid), {
          id: user.uid, name, email, phone: `+91 ${phone}`,
          role: isSuperAdmin ? 'SUPER_ADMIN' : 'STUDENT',
          state: "Punjab", createdAt: new Date().toISOString(),
          updatedAt: serverTimestamp(), status: 'Free', pinnedExams: [],
          deviceCount: 0
        })

        await onAuthSuccess(user.uid);
        toast({ title: "Account Created", description: "Welcome to Cracklix!" })
        startTransition(() => { router.replace(returnUrl) })
      }
    } catch (error: any) {
      toast({ variant: "destructive", title: "Sync Failed", description: error.message })
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    if (loading) return;
    setDeviceError(null);
    setLoading(true)
    try {
      const provider = new GoogleAuthProvider()
      provider.setCustomParameters({ prompt: 'select_account' })
      const result = await signInWithPopup(auth, provider)
      const user = result.user
      if (!user.email) throw new Error("Email mandatory.");
      
      const userRef = doc(db!, 'users', user.uid)
      const userSnap = await getDoc(userRef)
      const isSuperAdmin = SUPER_ADMIN_WHITELIST.includes(user.email.toLowerCase());
      
      if (!userSnap.exists()) {
        await setDoc(userRef, {
          id: user.uid, name: user.displayName || "Aspirant",
          email: user.email, role: isSuperAdmin ? 'SUPER_ADMIN' : 'STUDENT',
          state: "Punjab", createdAt: new Date().toISOString(),
          updatedAt: serverTimestamp(), status: 'Free', pinnedExams: [], phone: "",
          deviceCount: 0
        })
      }
      
      const authorized = await onAuthSuccess(user.uid);
      if (authorized) {
        toast({ title: "Registry Synced", description: `Authorized as ${user.displayName}` })
        startTransition(() => { router.replace(returnUrl) })
      }
    } catch (error: any) {
      toast({ variant: "destructive", title: "Sync Error", description: error.message })
      setLoading(false)
    }
  }

  const handleResetPassword = async () => {
    if (!resetEmail) {
      toast({ variant: "destructive", title: "Wait", description: "Enter email." });
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

  if (!authLoading && user && !deviceError) return null;

  const isActuallyLoading = loading || isPending;

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-4 md:p-10 relative overflow-hidden text-[#0F172A]">
      <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-primary/5 blur-[140px] rounded-full" />
      
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="z-10 w-full max-w-[440px] space-y-6 md:space-y-8">
        <div className="flex flex-col items-center h-auto w-full mb-2 md:mb-4">
          <Logo variant="light" />
        </div>

        {sessionTerminated && (
          <div className="bg-rose-50 border border-rose-100 p-4 md:p-6 rounded-[1.5rem] md:rounded-[2rem] flex items-center gap-4 animate-in slide-in-from-top-6 duration-700 shadow-sm">
            <ShieldAlert className="h-6 w-6 text-rose-500 shrink-0" />
            <p className="text-xs md:text-sm font-bold text-rose-600 tracking-tight leading-snug text-left">
              This account was just logged in on another device.
            </p>
          </div>
        )}

        {deviceError && (
          <div className="bg-rose-50 border border-rose-100 p-5 md:p-8 rounded-[2rem] md:rounded-[2.5rem] flex items-start gap-5 animate-in slide-in-from-top-6 duration-700 shadow-sm">
            <Smartphone className="h-7 w-7 text-rose-500 shrink-0" />
            <div className="space-y-2 text-left">
              <p className="text-sm font-bold text-rose-600 tracking-tight uppercase">Security Guard</p>
              <p className="text-[12px] md:text-[13px] text-slate-500 leading-relaxed font-medium">{deviceError}</p>
              <button onClick={() => setDeviceError(null)} className="text-primary font-bold text-[11px] hover:underline tracking-tight">Try Another Account</button>
            </div>
          </div>
        )}

        <Card className="border-slate-100 bg-white/80 backdrop-blur-3xl shadow-5xl rounded-[1.5rem] md:rounded-[3.5rem] overflow-hidden border-2">
          <div className="h-1.5 w-full bg-primary" />
          <CardHeader className="text-center pt-8 md:pt-14 pb-4 px-4 md:px-16">
            <CardTitle className="text-xl md:text-4xl font-black tracking-tight text-[#0F172A] uppercase">
              {mode === 'login' ? "Login" : "Sign Up"}
            </CardTitle>
            <CardDescription className="text-slate-400 font-bold text-[9px] md:text-[12px] tracking-widest mt-2 md:mt-3 uppercase">Registry Access v23.0</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 md:space-y-10 pb-10 md:pb-20 px-4 md:px-16">
            <form onSubmit={handleEmailAuth} className="space-y-4 md:space-y-6">
              {mode === 'register' && (
                <div className="space-y-4">
                  <Input 
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                    required 
                    className="h-12 md:h-16 rounded-xl md:rounded-2xl bg-slate-50 border-none text-[#0F172A] placeholder:text-slate-400 focus-visible:ring-primary text-sm md:text-lg font-bold px-4 md:px-6 shadow-inner" 
                    placeholder="Full Identity" 
                  />
                  <div className="relative">
                    <span className="absolute left-4 md:left-6 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm md:text-lg">+91</span>
                    <Input 
                      value={phone} 
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0,10))} 
                      required 
                      className="h-12 md:h-16 rounded-xl md:rounded-2xl bg-slate-50 border-none text-[#0F172A] placeholder:text-slate-400 focus-visible:ring-primary text-sm md:text-lg font-bold pl-14 md:pl-16 px-4 md:px-6 tracking-widest shadow-inner" 
                      placeholder="Mobile Node" 
                    />
                  </div>
                </div>
              )}
              <Input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
                className="h-12 md:h-16 rounded-xl md:rounded-2xl bg-slate-50 border-none text-[#0F172A] placeholder:text-slate-400 focus-visible:ring-primary text-sm md:text-lg font-bold px-4 md:px-6 shadow-inner" 
                placeholder="Email Address" 
              />
              <div className="space-y-2">
                <div className="relative">
                  <Input 
                    type={showPassword ? "text" : "password"} 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    required 
                    className="h-12 md:h-16 rounded-xl md:rounded-2xl bg-slate-50 border-none text-[#0F172A] placeholder:text-slate-400 focus-visible:ring-primary pr-12 md:pr-14 px-4 md:px-6 text-sm md:text-lg font-bold shadow-inner" 
                    placeholder="Password" 
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
                <div className="relative">
                  <Input 
                    type={showConfirmPassword ? "text" : "password"} 
                    value={confirmPassword} 
                    onChange={(e) => setConfirmPassword(e.target.value)} 
                    required 
                    className="h-12 md:h-16 rounded-xl md:rounded-2xl bg-slate-50 border-none text-[#0F172A] placeholder:text-slate-400 focus-visible:ring-primary pr-12 md:pr-14 px-4 md:px-6 text-sm md:text-lg font-bold shadow-inner" 
                    placeholder="Verify Password" 
                  />
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-4 md:right-6 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary transition-colors">
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              )}
              <Button type="submit" className="w-full h-14 md:h-20 bg-primary hover:bg-blue-700 text-white font-black uppercase text-base md:text-lg rounded-xl md:rounded-[2.5rem] shadow-4xl shadow-primary/20 border-none transition-all active:scale-95 tracking-widest" disabled={isActuallyLoading}>
                {isActuallyLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : (mode === 'login' ? "Enter Registry" : "Create Account")}
              </Button>
            </form>
            <div className="flex items-center gap-4 py-2 md:py-4"><div className="h-px flex-1 bg-slate-100" /><span className="text-[9px] font-bold text-slate-300 tracking-widest uppercase">OR</span><div className="h-px flex-1 bg-slate-100" /></div>
            <Button variant="outline" className="w-full h-12 md:h-16 border-slate-100 bg-white text-[#0F172A] gap-4 rounded-xl md:rounded-2xl font-bold text-sm hover:bg-slate-50 tracking-tight shadow-sm" onClick={handleGoogleSignIn} disabled={isActuallyLoading}>
               <img src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" className="h-4 w-4 md:h-5 md:w-5" alt="G" /> Google Account
            </Button>
            <div className="text-center text-[11px] md:text-[14px] font-bold text-slate-400 tracking-tight mt-4">
               {mode === 'login' ? (<p>New aspirant? <button onClick={() => setMode('register')} className="text-primary hover:text-blue-700 font-black transition-colors ml-1">Create account</button></p>) : (<p>Already registered? <button onClick={() => setMode('login')} className="text-primary hover:text-blue-700 font-black transition-colors ml-1">Login now</button></p>)}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <Dialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
        <DialogContent className="bg-white rounded-[2rem] md:rounded-[3rem] max-w-[90vw] sm:max-w-[400px] p-8 md:p-10 shadow-5xl text-left border-none">
          <DialogHeader className="text-center space-y-4">
            <div className="h-14 w-14 md:h-16 md:w-16 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto text-primary shadow-xl"><RefreshCw className={cn("h-7 w-7 md:h-8 md:w-8", resetLoading && "animate-spin")} /></div>
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