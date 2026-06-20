
"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth, useUser } from "@/firebase"
import { sendEmailVerification, signOut } from "firebase/auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import Logo from "@/components/brand/Logo"
import { Mail, RefreshCw, LogOut, CheckCircle2, Loader2, Sparkles, ShieldCheck } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { motion } from "framer-motion"

/**
 * @fileOverview Institutional Verification Hub v1.0.
 * Enforces email validation link flow for secure aspirant registration.
 */

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
      toast({ title: "Verification Sent", description: "Check your spam folder if not found." })
      setCooldown(60)
    } catch (e: any) {
      toast({ variant: "destructive", title: "Audit Error", description: e.message })
    } finally {
      setIsResending(false)
    }
  }

  const handleRefreshStatus = () => {
    window.location.reload()
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
        
        <Logo variant="light" align="center" imgClassName="h-[60px]" />

        <Card className="border-none shadow-5xl rounded-[2.5rem] bg-white overflow-hidden border border-slate-100">
           <div className="h-2 w-full bg-primary" />
           <CardHeader className="p-10 pb-4 text-center space-y-4">
              <div className="h-20 w-20 bg-primary/10 rounded-[2rem] flex items-center justify-center mx-auto text-primary shadow-xl">
                 <Mail className="h-10 w-10" />
              </div>
              <div className="space-y-2">
                 <CardTitle className="text-3xl font-black font-headline text-[#0F172A] uppercase tracking-tight">Verify Your Email</CardTitle>
                 <CardDescription className="text-slate-500 font-medium text-base">We have sent a secure verification link to:</CardDescription>
                 <p className="text-primary font-black text-lg underline decoration-primary/20 underline-offset-8">{user?.email}</p>
              </div>
           </CardHeader>
           
           <CardContent className="p-10 pt-6 space-y-8">
              <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 space-y-4">
                 <div className="flex items-center gap-3 text-emerald-600">
                    <CheckCircle2 className="h-5 w-5" />
                    <p className="text-[10px] font-black uppercase tracking-widest">Next Registry Steps</p>
                 </div>
                 <ul className="space-y-3">
                    <li className="flex items-center gap-3 text-sm font-bold text-slate-600">
                       <div className="h-1.5 w-1.5 rounded-full bg-slate-300" />
                       Click the link in your email inbox
                    </li>
                    <li className="flex items-center gap-3 text-sm font-bold text-slate-600">
                       <div className="h-1.5 w-1.5 rounded-full bg-slate-300" />
                       Refresh this page to activate access
                    </li>
                 </ul>
              </div>

              <div className="grid grid-cols-1 gap-4">
                 <Button onClick={handleRefreshStatus} className="w-full h-16 bg-primary hover:bg-blue-700 text-white font-black uppercase text-[11px] tracking-[0.2em] rounded-2xl shadow-3xl transition-all active:scale-95 border-none gap-3">
                    <RefreshCw className="h-4 w-4" /> Check Verification Status
                 </Button>
                 
                 <Button 
                   onClick={handleResend} 
                   disabled={isResending || cooldown > 0} 
                   variant="outline" 
                   className="w-full h-14 border-slate-200 text-[#0F172A] font-bold uppercase text-[10px] tracking-widest rounded-2xl"
                 >
                    {isResending ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                    {cooldown > 0 ? `Resend Link in ${cooldown}s` : "Resend Link"}
                 </Button>
              </div>

              <button 
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 text-[10px] font-black uppercase text-slate-400 hover:text-rose-500 transition-colors tracking-widest"
              >
                <LogOut className="h-3.5 w-3.5" /> Use different email address
              </button>
           </CardContent>
        </Card>

        <div className="flex items-center justify-center gap-4 text-slate-400">
           <ShieldCheck className="h-5 w-5 text-emerald-500" />
           <span className="text-[10px] font-black uppercase tracking-[0.3em]">Institutional Verification Hub</span>
        </div>
      </motion.div>
    </div>
  )
}
