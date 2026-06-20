
"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth, useUser } from "@/firebase"
import { sendEmailVerification, signOut } from "firebase/auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import Logo from "@/components/brand/Logo"
import { Mail, RefreshCw, LogOut, CheckCircle2, Loader2, ShieldCheck, ExternalLink } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { motion } from "framer-motion"

export default function VerifyEmailPage() {
  const { user, loading: authLoading } = useUser()
  const auth = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  
  const [isResending, setIsResending] = useState(false)
  const [cooldown, setCooldown] = useState(0)

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/login')
    } else if (user?.emailVerified) {
      router.replace('/dashboard')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [cooldown])

  const handleResend = async () => {
    if (!user || cooldown > 0) return
    setIsResending(true)
    try {
      await sendEmailVerification(user)
      toast({ title: "Email Sent", description: "Verification link sent. Check your inbox." })
      setCooldown(60)
    } catch (e: any) {
      toast({ variant: "destructive", title: "Error", description: e.message })
    } finally {
      setIsResending(false)
    }
  }

  const handleRefreshStatus = async () => {
    if (!user) return;
    try {
      await user.reload();
      if (user.emailVerified) {
        toast({ title: "Account Verified", description: "Your email has been confirmed." });
        router.replace('/dashboard');
      } else {
        toast({ title: "Not verified yet", description: "Please click the link in your email." });
      }
    } catch (e: any) {
       toast({ variant: "destructive", title: "Refresh failed" });
    }
  }

  const handleLogout = async () => {
    await signOut(auth)
    router.push('/login')
  }

  if (authLoading) return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-white">
       <Loader2 className="h-10 w-10 text-primary animate-spin" />
    </div>
  )

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-6 text-left">
      <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/5 blur-[120px] rounded-full" />
      
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="z-10 w-full max-w-[480px] space-y-8">
        
        <Logo variant="light" align="center" />

        <Card className="border-none shadow-5xl rounded-[2.5rem] bg-white overflow-hidden border border-slate-100">
           <div className="h-2 w-full bg-primary" />
           <CardHeader className="p-10 pb-4 text-center space-y-4">
              <div className="h-20 w-20 bg-primary/10 rounded-[2rem] flex items-center justify-center mx-auto text-primary shadow-xl">
                 <Mail className="h-10 w-10" />
              </div>
              <div className="space-y-2">
                 <CardTitle className="text-3xl font-black font-headline text-[#0F172A] uppercase tracking-tight leading-tight">Verify Email</CardTitle>
                 <CardDescription className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-2">Account Verification Required</CardDescription>
              </div>
           </CardHeader>
           
           <CardContent className="p-10 pt-6 space-y-8">
              <div className="p-8 bg-slate-50 rounded-2xl border border-slate-100 space-y-4 shadow-inner">
                 <p className="text-slate-500 font-medium text-sm text-center leading-relaxed">
                   We have sent a verification link to: <br/>
                   <span className="text-primary font-black text-lg underline decoration-primary/20 underline-offset-8 mt-2 block">{user?.email}</span>
                 </p>
              </div>

              <div className="grid grid-cols-1 gap-4">
                 <Button onClick={handleRefreshStatus} className="w-full h-16 bg-primary hover:bg-blue-700 text-white font-black uppercase text-[11px] tracking-[0.2em] rounded-2xl shadow-3xl transition-all active:scale-95 border-none gap-3">
                    <ShieldCheck className="h-4 w-4" /> I&apos;ve Verified My Email
                 </Button>

                 <div className="grid grid-cols-2 gap-4">
                    <Button 
                      asChild
                      variant="outline" 
                      className="h-14 border-slate-200 text-[#0F172A] font-black uppercase text-[9px] tracking-widest rounded-2xl gap-2 shadow-sm"
                    >
                       <a href="https://mail.google.com" target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-3.5 w-3.5 text-primary" /> Open Gmail
                       </a>
                    </Button>
                    <Button 
                      onClick={handleResend} 
                      disabled={isResending || cooldown > 0} 
                      variant="outline" 
                      className="h-14 border-slate-200 text-[#0F172A] font-black uppercase text-[9px] tracking-widest rounded-2xl shadow-sm"
                    >
                       {isResending ? <Loader2 className="h-4 w-4 animate-spin text-primary" /> : <RefreshCw className="h-4 w-4 text-primary" />}
                       {cooldown > 0 ? `${cooldown}s` : "Resend Link"}
                    </Button>
                 </div>
              </div>

              <button 
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 text-[10px] font-black uppercase text-slate-400 hover:text-rose-500 transition-colors tracking-widest"
              >
                <LogOut className="h-3.5 w-3.5" /> Use another email address
              </button>
           </CardContent>
        </Card>

        <div className="flex items-center justify-center gap-4 text-slate-300">
           <ShieldCheck className="h-5 w-5" />
           <span className="text-[10px] font-black uppercase tracking-[0.3em]">Official Verification Hub</span>
        </div>
      </motion.div>
    </div>
  )
}
