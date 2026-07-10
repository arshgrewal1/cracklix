"use client"

import React, { useState, useEffect } from "react"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import { motion } from "framer-motion"
import { 
  Smartphone, 
  Download, 
  ShieldCheck, 
  ChevronRight, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Zap,
  Info,
  Layers,
  ArrowDownCircle
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from "@/components/ui/accordion"
import { PLATFORM_VERSION } from "@/lib/version"
import PWAInstallButton from "@/components/PWAInstallButton"

/**
 * @fileOverview Official Cracklix App Hub v2.0.
 * Optimized for high-retention direct application distribution.
 */

const APK_DOWNLOAD_URL = "https://github.com/arshgrewal1/cracklix/releases/latest/download/cracklix.apk";

export default function DownloadPage() {
  const [apkExists, setApkExists] = useState(false);
  const { version, releaseDate } = PLATFORM_VERSION;

  useEffect(() => {
    fetch(APK_DOWNLOAD_URL, { method: 'HEAD' })
      .then(res => setApkExists(res.ok))
      .catch(() => setApkExists(false));
  }, []);

  return (
    <div className="min-h-screen bg-white font-body text-left selection:bg-primary/10">
      <Navbar />
      
      <main>
        {/* PREMIUM DOWNLOAD HERO */}
        <section className="relative pt-16 pb-24 md:pt-32 md:pb-48 overflow-hidden bg-[#0B1528] text-white">
           <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] bg-primary/20 blur-[160px] rounded-full" />
           
           <div className="container mx-auto px-4 md:px-6 relative z-10 text-center">
              <motion.div
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 className="space-y-10 max-w-4xl mx-auto"
              >
                 <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-xl">
                    <Zap className="h-4 w-4 text-primary animate-pulse" />
                    <span className="text-[10px] md:text-xs font-black tracking-[0.3em] uppercase">Enterprise Mobile Node v{version}</span>
                 </div>

                 <div className="space-y-6">
                    <h1 className="text-5xl md:text-8xl font-black tracking-tighter leading-[0.9] antialiased">
                       Crack Exams <br className="hidden md:block" /> 
                       <span className="text-primary">On The Go.</span>
                    </h1>
                    <p className="text-slate-400 font-medium text-sm md:text-2xl max-w-2xl mx-auto leading-snug">
                       Install the official Cracklix app for 10x faster performance, offline access, and real-time merit alerts.
                    </p>
                 </div>

                 <div className="flex flex-col md:flex-row items-center justify-center gap-6 pt-6">
                    {apkExists ? (
                       <Button asChild className="h-16 md:h-24 px-10 md:px-16 bg-primary hover:bg-blue-700 text-white rounded-2xl md:rounded-[2.5rem] shadow-5xl gap-4 group transition-all active:scale-95 border-none">
                          <a href={APK_DOWNLOAD_URL} download>
                             <ArrowDownCircle className="h-6 w-6 md:h-8 md:w-8 group-hover:translate-y-1 transition-transform" />
                             <div className="flex flex-col items-start text-left">
                                <span className="font-black tracking-tight text-xs md:text-xl leading-none">Download APK</span>
                                <span className="text-[8px] md:text-[10px] opacity-60 uppercase font-black">Direct Installer</span>
                             </div>
                          </a>
                       </Button>
                    ) : (
                       <Button disabled className="h-16 md:h-24 px-10 md:px-16 bg-white/5 text-slate-500 rounded-2xl md:rounded-[2.5rem] border-none gap-4">
                          <Loader2 className="h-6 w-6 animate-spin" />
                          <span className="font-black tracking-widest text-xs md:text-xl">Syncing Build Node...</span>
                       </Button>
                    )}
                    
                    <PWAInstallButton variant="outline" className="h-16 md:h-24 px-10 md:px-16 rounded-2xl md:rounded-[2.5rem] bg-white/5 border-white/10 text-white hover:bg-white/10" />
                 </div>

                 <div className="flex items-center justify-center gap-10 text-slate-500 font-black text-[9px] md:text-[12px] tracking-widest pt-4">
                    <span className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-emerald-500" /> SECURED</span>
                    <span className="flex items-center gap-2"><Layers className="h-4 w-4 text-primary" /> 15.4MB</span>
                    <span className="flex items-center gap-2"><Clock className="h-4 w-4 text-primary" /> {releaseDate}</span>
                 </div>
              </motion.div>
           </div>
        </section>

        {/* FEATURE MATRIX */}
        <section className="py-24 bg-white">
           <div className="container mx-auto px-4 max-w-7xl">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
                 <AppFeature 
                    icon={Zap} 
                    title="High Speed Hub" 
                    desc="Native rendering engine for zero-lag mock test attempts." 
                 />
                 <AppFeature 
                    icon={ShieldCheck} 
                    title="Offline Vault" 
                    desc="Access your saved notes and PYQs without an internet connection." 
                 />
                 <AppFeature 
                    icon={Info} 
                    title="Real-time Alerts" 
                    desc="Instant push notifications for admit cards and merit results." 
                 />
              </div>
           </div>
        </section>

        {/* INSTALLATION FLOW */}
        <section className="py-24 bg-slate-50 border-y border-slate-100">
           <div className="container mx-auto px-4 max-w-4xl">
              <div className="text-center space-y-4 mb-16">
                 <h2 className="text-3xl md:text-5xl font-black text-[#0F172A] tracking-tight">How to Install</h2>
                 <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.3em]">Easy 3-Step Registry Setup</p>
              </div>

              <div className="grid grid-cols-1 gap-6">
                 <InstallStep num="1" title="Download File" desc="Click the button above to retrieve the official cracklix.apk installer." />
                 <InstallStep num="2" title="Enable Sources" desc="Go to Settings > Security and enable 'Install from Unknown Sources' for your browser." />
                 <InstallStep num="3" title="Launch Hub" desc="Open the downloaded file, complete installation, and login to sync your progress." />
              </div>
           </div>
        </section>

        {/* SUPPORT ACCORDION */}
        <section className="py-24 bg-white">
           <div className="container mx-auto px-4 max-w-3xl">
              <Accordion type="single" collapsible className="space-y-4">
                 <FAQItem value="item-1" q="Is the APK safe to download?" a="Yes. Every build is digitally signed by Arsh Grewal Management and verified for data integrity and security." />
                 <FAQItem value="item-2" q="Can I use my existing pass in the app?" a="Absolutely. All your elite pass benefits and mock history are synchronized across all devices." />
                 <FAQItem value="item-3" q="Will I get notifications offline?" a="The app uses local caching to ensure important alerts are visible even without a stable connection." />
              </Accordion>
           </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

function AppFeature({ icon: Icon, title, desc }: any) {
   return (
      <div className="p-10 rounded-[3rem] bg-slate-50 border border-slate-100 space-y-6 text-left hover:translate-y-[-8px] transition-all duration-500">
         <div className="h-14 w-14 bg-white rounded-2xl flex items-center justify-center text-primary shadow-xl">
            <Icon className="h-6 w-6" />
         </div>
         <div className="space-y-2">
            <h3 className="text-xl font-black text-[#0F172A] uppercase">{title}</h3>
            <p className="text-sm text-slate-500 font-medium leading-relaxed">{desc}</p>
         </div>
      </div>
   )
}

function InstallStep({ num, title, desc }: any) {
   return (
      <div className="flex items-start gap-8 p-8 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm">
         <div className="h-12 w-12 rounded-xl bg-primary text-white flex items-center justify-center font-black text-xl shrink-0">
            {num}
         </div>
         <div className="space-y-1">
            <h4 className="text-lg font-black text-[#0F172A] uppercase">{title}</h4>
            <p className="text-sm text-slate-500 font-medium">{desc}</p>
         </div>
      </div>
   )
}

function FAQItem({ value, q, a }: { value: string, q: string, a: string }) {
  return (
    <AccordionItem value={value} className="bg-slate-50 border border-slate-100 rounded-2xl px-8 shadow-sm overflow-hidden">
       <AccordionTrigger className="hover:no-underline font-black text-left text-xs md:text-sm text-[#0F172A] py-6 uppercase tracking-tight">{q}</AccordionTrigger>
       <AccordionContent className="text-slate-500 font-medium text-[12px] md:text-base leading-relaxed pb-6">{a}</AccordionContent>
    </AccordionItem>
  )
}
