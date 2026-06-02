"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import Logo from "@/components/brand/Logo"
import { ShieldCheck, Mail, Lock, ChevronLeft, User } from "lucide-react"
import { useAuth } from "@/firebase"
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider,
  sendPasswordResetEmail,
  updateProfile
} from "firebase/auth"
import { useToast } from "@/hooks/use-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog"
import Link from "next/link"
import { motion } from "framer-motion"

export default function LoginPage() {
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [resetEmail, setResetEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false)
  
  const router = useRouter()
  const auth = useAuth()
  const { toast } = useToast()

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password || (mode === 'register' && !name)) return
    
    setLoading(true)
    try {
      if (mode === 'login') {
        await signInWithEmailAndPassword(auth, email, password)
        toast({ title: "Welcome back!", description: "Successfully logged in." })
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password)
        await updateProfile(userCredential.user, { displayName: name })
        toast({ title: "Account created!", description: `Welcome, ${name}! Please complete your profile.` })
        router.push("/profile-setup")
        return
      }
      router.push("/")
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Authentication Failed",
        description: error.message || "Invalid credentials. Please try again."
      })
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider()
    try {
      await signInWithPopup(auth, provider)
      toast({ title: "Success", description: "Signed in with Google." })
      router.push("/")
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Google Sign-In Failed",
        description: error.message
      })
    }
  }

  const handleForgotPassword = async () => {
    if (!resetEmail) {
      toast({ variant: "destructive", title: "Email required", description: "Please enter your email address." })
      return
    }
    try {
      await sendPasswordResetEmail(auth, resetEmail)
      toast({ title: "Reset link sent!", description: "Check your inbox for the recovery email." })
      setIsResetDialogOpen(false)
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message })
    }
  }

  return (
    <div className="min-h-screen bg-[#020817] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decorative Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/10 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="z-10 w-full max-w-md"
      >
        <div className="flex flex-col items-center mb-10">
          <Logo variant="light" className="scale-110" />
        </div>

        <Card className="border-white/10 bg-white/[0.03] backdrop-blur-2xl shadow-2xl overflow-hidden">
          <div className="h-1.5 w-full bg-gradient-to-r from-primary via-orange-500 to-amber-500" />
          <CardHeader className="text-center space-y-3 pt-10">
            <CardTitle className="text-3xl font-headline font-black text-white tracking-tight">
              {mode === 'login' ? "Welcome Back" : "Create Account"}
            </CardTitle>
            <CardDescription className="text-slate-400 text-sm font-medium">
              {mode === 'login' 
                ? "Access Punjab's smartest exam preparation platform." 
                : "Join 15,000+ aspirants on their journey to success."}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6 px-8 pb-10">
            <form onSubmit={handleEmailAuth} className="space-y-5">
              {mode === 'register' && (
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-slate-300 text-xs font-black uppercase tracking-widest">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                    <Input 
                      id="name" 
                      type="text"
                      className="pl-12 h-13 bg-white/[0.05] border-white/10 text-white rounded-xl focus:ring-primary/50" 
                      placeholder="Arsh Grewal"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-300 text-xs font-black uppercase tracking-widest">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                  <Input 
                    id="email" 
                    type="email"
                    className="pl-12 h-13 bg-white/[0.05] border-white/10 text-white rounded-xl focus:ring-primary/50" 
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="password" name="password" className="text-slate-300 text-xs font-black uppercase tracking-widest">Password</Label>
                  {mode === 'login' && (
                    <Dialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
                      <DialogTrigger asChild>
                        <button type="button" className="text-[10px] text-primary font-black uppercase tracking-widest hover:underline">Forgot?</button>
                      </DialogTrigger>
                      <DialogContent className="bg-[#0B1528] border-white/10 text-white rounded-3xl">
                        <DialogHeader>
                          <DialogTitle className="font-headline font-black text-2xl">Reset Password</DialogTitle>
                          <DialogDescription className="text-slate-400">
                            Enter your email and we'll send a recovery link.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="py-6 space-y-4">
                          <div className="space-y-2">
                            <Label className="text-xs uppercase font-black tracking-widest">Email Address</Label>
                            <Input 
                              value={resetEmail} 
                              onChange={(e) => setResetEmail(e.target.value)}
                              placeholder="your@email.com"
                              className="h-12 bg-white/5 border-white/10 rounded-xl"
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" className="rounded-xl" onClick={() => setIsResetDialogOpen(false)}>Cancel</Button>
                          <Button onClick={handleForgotPassword} className="bg-primary hover:bg-primary/90 rounded-xl px-6 font-bold">Send Link</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  )}
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                  <Input 
                    id="password" 
                    type="password"
                    className="pl-12 h-13 bg-white/[0.05] border-white/10 text-white rounded-xl focus:ring-primary/50" 
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <Button 
                type="submit"
                className="w-full h-14 bg-primary hover:bg-primary/90 font-black uppercase tracking-[0.2em] text-xs text-white shadow-xl shadow-primary/20 rounded-xl transition-all hover:-translate-y-1"
                disabled={loading}
              >
                {loading ? "Authenticating..." : (mode === 'login' ? "Login to Dashboard" : "Create Free Account")}
              </Button>
            </form>

            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-white/5" />
              </div>
              <div className="relative flex justify-center text-[10px] uppercase font-black tracking-[0.2em]">
                <span className="bg-[#020817] px-4 text-slate-500">Or continue with</span>
              </div>
            </div>

            <Button 
              variant="outline" 
              className="w-full h-14 border-white/10 bg-white/[0.03] hover:bg-white/[0.08] text-white gap-3 rounded-xl font-bold transition-all"
              onClick={handleGoogleSignIn}
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Sign in with Google
            </Button>

            <div className="pt-8 border-t border-white/5 text-[10px] text-center text-slate-500 uppercase font-black tracking-[0.2em]">
              {mode === 'login' ? (
                <p>New to Cracklix? <button onClick={() => setMode('register')} className="text-primary hover:underline">Register Now</button></p>
              ) : (
                <p>Have an account? <button onClick={() => setMode('login')} className="text-primary hover:underline">Log In</button></p>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="mt-8 flex items-center justify-center gap-2 text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">
          <ShieldCheck className="h-4 w-4 text-primary" />
          Institutional Grade Security
        </div>
        
        <div className="mt-12 text-center">
           <Button variant="ghost" asChild className="text-slate-500 hover:text-white gap-2">
             <Link href="/">
                <ChevronLeft className="h-4 w-4" /> Back to Home
             </Link>
           </Button>
        </div>
      </motion.div>
    </div>
  )
}
