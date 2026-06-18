"use client"

import React, { useState } from "react"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import { useUser } from "@/firebase"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { 
  Smartphone, 
  ShieldCheck, 
  Lock, 
  Info,
} from "lucide-react"
import { getDeviceName } from "@/lib/device"
import BackButton from "@/components/navigation/BackButton"
import { Badge } from "@/components/ui/badge"

/**
 * @fileOverview Institutional Security Info Center v2.0.
 * Simplified: Displays current node information. Takeover is now automatic.
 */

export default function DeviceInfoPage() {
  const { profile, loading, currentDeviceId } = useUser()

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-white" />
  )

  if (!profile) return null

  return (
    <div className="min-h-screen bg-slate-50/50 font-body text-left">
      <Navbar />
      
      <main className="container mx-auto px-4 md:px-6 py-8 md:py-16 max-w-4xl space-y-12 pb-40">
        <div className="flex items-center gap-6">
           <BackButton label="Settings" fallback="/profile" />
           <div className="text-left">
              <h1 className="text-3xl md:text-5xl font-headline font-black text-[#0F172A] uppercase tracking-tight leading-none">Security</h1>
              <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-2">One Session • One Device Policy</p>
           </div>
        </div>

        <div className="grid grid-cols-1 gap-8">
           <Card className="border-none shadow-3xl rounded-[2.5rem] bg-white overflow-hidden border border-slate-100">
              <CardHeader className="p-8 md:p-10 border-b border-slate-50">
                 <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                       <Smartphone className="h-6 w-6 text-primary" />
                       <CardTitle className="font-headline font-black text-xl md:text-2xl uppercase">Active Node</CardTitle>
                    </div>
                    <Badge className="bg-emerald-50 text-emerald-600 px-4 py-1.5 rounded-xl font-black text-[10px] uppercase">
                       Authorized
                    </Badge>
                 </div>
              </CardHeader>
              <CardContent className="p-8 md:p-10 space-y-10">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">DEVICE IDENTITY</p>
                       <p className="text-lg font-black text-[#0F172A] uppercase">{getDeviceName()}</p>
                       <code className="text-[10px] font-mono text-slate-300">ID: {currentDeviceId}</code>
                    </div>
                    <div className="space-y-2">
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">SECURITY STATUS</p>
                       <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm">
                          <ShieldCheck className="h-4 w-4" /> Valid Session
                       </div>
                    </div>
                 </div>

                 <div className="bg-blue-50 border border-blue-100 p-6 md:p-8 rounded-[2rem] flex items-start gap-4 text-left">
                    <Info className="h-6 w-6 text-blue-600 shrink-0" />
                    <div className="space-y-1">
                       <p className="text-xs font-black text-blue-800 uppercase">Information Node</p>
                       <p className="text-xs text-blue-600 leading-relaxed font-medium">
                          To protect your premium preparation materials, Cracklix enforces a single-session policy. Signing in on a new device will automatically sign you out of any existing active sessions.
                       </p>
                    </div>
                 </div>
              </CardContent>
           </Card>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <PolicyCard 
                icon={<Lock className="text-blue-500" />} 
                title="Account Safety" 
                desc="Sharing credentials is strictly prohibited and can result in account suspension." 
              />
              <PolicyCard 
                icon={<ShieldCheck className="text-emerald-500" />} 
                title="Registry Guard" 
                desc="Every login is monitored against our institutional security benchmarks." 
              />
           </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

function PolicyCard({ icon, title, desc }: any) {
   return (
      <div className="p-8 bg-white rounded-[2.5rem] shadow-xl border border-slate-100 text-left space-y-4">
         <div className="h-12 w-12 rounded-2xl bg-slate-50 flex items-center justify-center shadow-inner">
            {icon}
         </div>
         <h3 className="font-headline font-black text-lg uppercase text-[#0F172A]">{title}</h3>
         <p className="text-xs text-slate-400 leading-relaxed font-medium uppercase tracking-tight">{desc}</p>
      </div>
   )
}
