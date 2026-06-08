
"use client"

import { useState, Suspense, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import Logo from "@/components/brand/Logo"
import { ShieldCheck, Mail, Lock, ChevronLeft, User, Phone, AlertCircle, RefreshCw, Eye, EyeOff } from "lucide-react"
import { useAuth, useFirestore } from "@/firebase"
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider,
  sendPasswordResetEmail,
  updateProfile
} from "firebase/auth"
import { doc, setDoc, getDoc } from "firebase/firestore"
import { useToast } from "@/hooks/use-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { motion } from "framer-motion"

/**
 * @fileOverview Login & Sign Up Hub v2.0.
 * UPDATED: Added password visibility toggles (Eye/EyeOff) for better UX.
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
  
  const router = useRouter()
  const searchParams = useSearchParams()
  const auth = useAuth()
  const db = useFirestore()
  const { toast } = useToast()

  const returnUrl = searchParams.get("returnUrl") || "/dashboard"

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
        router.push(returnUrl)
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password)
        const user = userCredential.user
        await updateProfile(user, { displayName: name })
        const isSuperAdmin = email.toLowerCase() === 'arshdeepgrewal1122@gmail.com';
        await setDoc(doc(db, 'users', user.uid), {
          id: user.uid,
          name, email, phone: `+91 ${phone}`,
          role: isSuperAdmin ? 'SUPER_ADMIN' : 'STUDENT',
          state: "Punjab",
          createdAt: new Date().toISOString(),
          status: 'Free',
          pinnedExams: []
        })
        toast({ title: "Account Created", description: "Welcome to Cracklix!" })
        router.push(returnUrl)
      }
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message })
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider()
    try {
      const result = await signInWithPopup(auth, provider)
      const user = result.user
      const userSnap = await getDoc(doc(db, 'users', user.uid))
      if (!userSnap.exists()) {
        const isSuperAdmin = user.email?.toLowerCase() === 'arshdeepgrewal1122@gmail.com';
        await setDoc(doc(db, 'users', user.uid), {
          id: user.uid, name: user.displayName || "Student",
          email: user.email, role: isSuperAdmin ? 'SUPER_ADMIN' : 'STUDENT',
          state: "Punjab", createdAt: new Date().toISOString(), status: 'Free',
          pinnedExams: []
        })
        router.push(returnUrl)
      } else {
        router.push(returnUrl)
      }
    } catch (error: any) {
      toast({ variant: "destructive", title: "Login Failed", description: error.message })
    }
  }

  const handleResetPassword = async () => {
    if (!resetEmail) {
      toast({ variant: "destructive", title: "Wait", description: "Please enter your registered email." });
      return;
    }

    setResetLoading(true);
    try {
      await sendPasswordResetEmail(auth, resetEmail);
      toast({ 
        title: "Reset Link Sent", 
        description: "Please check your inbox for password reset instructions." 
      });
      setIsResetDialogOpen(false);
      setResetEmail("");
    } catch (error: any) {
      toast({ variant: "destructive", title: "Failed to Send", description: error.message });
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020817] flex flex-col items-center justify-center p-6 relative overflow-hidden text-white">
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/10 blur-[120px] rounded-full" />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="z-10 w-full max-w-md">
        <div className="flex flex-col items-center mb-10"><Logo variant="light" className="scale-110" /></div>
        
        {returnUrl !== "/dashboard" && (
           <div className="bg-primary/10 border border-primary/20 p-4 rounded-xl mb-6 flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
              <AlertCircle className="h-5 w-5 text-primary shrink-0" />
              <p className="text-[11px] font-black uppercase tracking-widest text-primary">Please login to continue.</p>
           </div>
        )}

        <Card className="border-white/10 bg-white/[0.03] backdrop-blur-2xl shadow-2xl rounded-[2.5rem] overflow-hidden">
          <div className="h-1.5 w-full bg-primary" />
          <CardHeader className="text-center pt-10">
            <CardTitle className="text-2xl font-headline font-black uppercase tracking-tight text-white">
              {mode === 'login' ? "Login" : "Create Account"}
            </CardTitle>
            <CardDescription className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mt-2">
              MANAGE YOUR STUDY PROGRESS.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pb-12">
            <form onSubmit={handleEmailAuth} className="space-y-4">
              {mode === 'register' && (
                <div className="space-y-4">
                   <Input value={name} onChange={e => setName(e.target.value)} required className="h-12 rounded-xl bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus-visible:ring-primary" placeholder="Your Full Name" />
                   <Input value={phone} onChange={e => setPhone(e.target.value)} required maxLength={10} className="h-12 rounded-xl bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus-visible:ring-primary" placeholder="Mobile Number" />
                </div>
              )}
              <div className="space-y-4">
                <Input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="h-12 rounded-xl bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus-visible:ring-primary" placeholder="Email Address" />
                <div className="space-y-2">
                  <div className="relative">
                    <Input 
                      type={showPassword ? "text" : "password"} 
                      value={password} 
                      onChange={e => setPassword(e.target.value)} 
                      required 
                      className="h-12 rounded-xl bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus-visible:ring-primary pr-12" 
                      placeholder="Password" 
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {mode === 'login' && (
                    <div className="flex justify-end">
                      <button 
                        type="button" 
                        onClick={() => setIsResetDialogOpen(true)}
                        className="text-[10px] font-black uppercase text-primary hover:text-orange-400 transition-colors tracking-widest"
                      >
                        Forgot Password?
                      </button>
                    </div>
                  )}
                </div>
              </div>
              {mode === 'register' && (
                <div className="relative">
                  <Input 
                    type={showConfirmPassword ? "text" : "password"} 
                    value={confirmPassword} 
                    onChange={e => setConfirmPassword(e.target.value)} 
                    required 
                    className="h-12 rounded-xl bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus-visible:ring-primary pr-12" 
                    placeholder="Confirm Password" 
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              )}
              
              <Button type="submit" className="w-full h-14 bg-primary hover:bg-orange-600 text-white font-black uppercase tracking-[0.2em] text-[10px] rounded-xl shadow-xl border-none transition-all active:scale-95" disabled={loading}>
                {loading ? "Please Wait..." : (mode === 'login' ? "Login" : "Sign Up")}
              </Button>
            </form>
            
            <Button variant="outline" className="w-full h-12 border-white/10 bg-white/5 text-white gap-3 rounded-xl font-bold text-xs hover:bg-white/10" onClick={handleGoogleSignIn}>
              Continue with Google
            </Button>

            <div className="text-center text-[10px] font-black uppercase text-slate-500 tracking-widest">
               {mode === 'login' ? (
                 <p>NEW STUDENT? <button onClick={() => setMode('register')} className="text-primary hover:underline">Register Now</button></p>
               ) : (
                 <p>ALREADY A STUDENT? <button onClick={() => setMode('login')} className="text-primary hover:underline">Login</button></p>
               )}
            </div>
          </CardContent>
        </Card>
        
        {/* DEVELOPER CREDIT */}
        <div className="mt-10 text-center opacity-30 flex flex-col items-center gap-1">
           <p className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-400">Developed by Arsh Grewal</p>
           <div className="h-px w-8 bg-slate-500/20" />
        </div>
      </motion.div>

      {/* RESET PASSWORD DIALOG */}
      <Dialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
        <DialogContent className="bg-[#0F172A] text-white border-white/10 rounded-[2.5rem] max-w-[400px] p-10 shadow-5xl">
          <DialogHeader className="text-center space-y-4">
            <div className="h-16 w-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto text-primary shadow-xl">
               <RefreshCw className={cn("h-8 w-8", resetLoading && "animate-spin")} />
            </div>
            <DialogTitle className="text-2xl font-headline font-black uppercase tracking-tight">Recover Account</DialogTitle>
            <DialogDescription className="text-slate-400 text-xs font-bold uppercase tracking-widest leading-relaxed">
              ENTER YOUR EMAIL TO RECEIVE A RESET LINK IN YOUR INBOX.
            </DialogDescription>
          </DialogHeader>
          <div className="py-8 space-y-6">
            <div className="space-y-2 text-left">
               <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Registered Email</Label>
               <Input 
                 type="email" 
                 value={resetEmail} 
                 onChange={e => setResetEmail(e.target.value)}
                 placeholder="name@domain.com" 
                 className="h-12 bg-white/5 border-white/10 rounded-xl focus-visible:ring-primary text-white" 
               />
            </div>
          </div>
          <DialogFooter>
             <Button 
               onClick={handleResetPassword} 
               disabled={resetLoading}
               className="w-full h-14 bg-primary hover:bg-orange-600 text-white font-black uppercase tracking-widest text-[11px] rounded-xl shadow-2xl transition-all"
             >
               {resetLoading ? "Sending..." : "Send Reset Link"}
             </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
