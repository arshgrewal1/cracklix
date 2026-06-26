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
  ArrowDown
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

/**
 * @fileOverview Production-Grade APK Distribution Hub v1.0.
 * Designed for High-Fidelity brand presence and seamless installation.
 */

export default function DownloadPage() {
  const [apkExists, setApkExists] = useState(false);
  const version = "1.0.4"; // Standardized versioning

  useEffect(() => {
    // Audit check for APK presence
    fetch('/downloads/app-release.apk', { method: 'HEAD' })
      .then(res => setApkExists(res.ok))
      .catch(() => setApkExists(false));
  }, []);

  return (
    <div className="min-h-screen bg-white font-body text-left selection:bg-primary/10">
      <Navbar />
      
      <main>
        {/* DOWNLOAD HERO (Distinct from Homepage Hero) */}
        <section className="relative pt-12 pb-20 md:pt-24 md:pb-32 overflow-hidden bg-slate-50/50 border-b border-slate-100">
           <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/5 blur-[120px] rounded-full" />
           
           <div className="container mx-auto px-4 md:px-6 relative z-10">
              <div className="max-w-4xl mx-auto text-center space-y-8">
                 <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20"
                 >
                    <Smartphone className="h-4 w-4 text-primary" />
                    <span className="text-[10px] md:text-[11px] font-black uppercase tracking-widest text-primary">Native Android Distribution</span>
                 </motion.div>

                 <div className="space-y-4">
                    <h1 className="text-4xl md:text-7xl font-black text-[#0F172A] tracking-tighter uppercase leading-[0.95]">
                       Cracklix <br/> <span className="text-primary">Pro Mobile</span>
                    </h1>
                    <p className="text-[12px] md:text-xl text-slate-500 font-medium max-w-2xl mx-auto leading-relaxed">
                       Experience Punjab's smartest preparation platform with native performance, zero-latency tests, and instant job alerts.
                    </p>
                 </div>

                 <div className="flex flex-col items-center gap-6 pt-4">
                    {apkExists ? (
                       <Button asChild className="h-16 md:h-20 px-10 md:px-16 bg-[#0F172A] hover:bg-black text-white rounded-2xl md:rounded-[2.5rem] shadow-4xl gap-4 group transition-all active:scale-95 border-none">
                          <a href="/downloads/app-release.apk" download>
                             <Download className="h-6 w-6 group-hover:translate-y-1 transition-transform" />
                             <span className="font-black uppercase tracking-widest text-xs md:text-lg">Download APK V{version}</span>
                          </a>
                       </Button>
                    ) : (
                       <Button disabled className="h-16 md:h-20 px-10 md:px-16 bg-slate-200 text-slate-400 rounded-2xl md:rounded-[2.5rem] border-none gap-4">
                          <Zap className="h-6 w-6" />
                          <span className="font-black uppercase tracking-widest text-xs md:text-lg">APK COMING SOON</span>
                       </Button>
                    )}
                    
                    <div className="flex items-center gap-8 text-slate-400 font-bold text-[9px] md:text-[11px] uppercase tracking-[0.2em]">
                       <span className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-emerald-500" /> Play Protect Verified</span>
                       <span className="flex items-center gap-2"><Layers className="h-4 w-4 text-primary" /> Size: ~14MB</span>
                    </div>
                 </div>
              </div>
           </div>
        </section>

        {/* DETAILS GRID */}
        <section className="py-20 bg-white">
           <div className="container mx-auto px-4 max-w-6xl">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-24 items-start">
                 
                 <div className="space-y-10 text-left">
                    <div className="space-y-4">
                       <h2 className="text-2xl md:text-4xl font-black text-[#0F172A] uppercase tracking-tight">Installation Guide</h2>
                       <div className="h-1 w-16 bg-primary rounded-full" />
                    </div>

                    <div className="space-y-6">
                       <GuideStep num="01" title="Download" desc="Click the download button above to retrieve the Cracklix Pro APK file." />
                       <GuideStep num="02" title="Authorize" desc="Enable 'Install from Unknown Sources' in your Android security settings if prompted." />
                       <GuideStep num="03" title="Install" desc="Open the downloaded file and click Install. The app will appear on your home screen." />
                       <GuideStep num="04" title="Initialize" desc="Launch Cracklix and login with your existing registry credentials." />
                    </div>
                 </div>

                 <div className="space-y-10">
                    <Card className="border-none shadow-2xl rounded-[2.5rem] bg-slate-900 text-white overflow-hidden p-8 md:p-12 relative group">
                       <div className="absolute top-0 right-0 p-8 opacity-5 rotate-12 group-hover:scale-110 transition-transform duration-1000">
                          <Zap className="h-48 w-48" />
                       </div>
                       <CardContent className="p-0 space-y-8 relative z-10">
                          <div className="space-y-2">
                             <h3 className="text-2xl font-black uppercase tracking-tight">What's New</h3>
                             <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">Version {version} Release</p>
                          </div>
                          <ul className="space-y-4">
                             <UpdateFeature text="Optimized CBT engine for Punjab Police Mocks." />
                             <UpdateFeature text="New High-Speed PDF downloader for Notes." />
                             <UpdateFeature text="Biometric authentication support for Profile Hub." />
                             <UpdateFeature text="Reduced data consumption by 40%." />
                          </ul>
                       </CardContent>
                    </Card>

                    <div className="p-8 bg-blue-50 border border-blue-100 rounded-[2rem] flex items-start gap-4">
                       <Info className="h-6 w-6 text-blue-600 shrink-0" />
                       <p className="text-xs md:text-sm text-blue-700 font-medium leading-relaxed uppercase">
                          Minimum Requirement: Android 8.0 (Oreo) or higher. Recommended 2GB RAM for high-fidelity test simulations.
                       </p>
                    </div>
                 </div>

              </div>
           </div>
        </section>

        {/* FAQ SECTION */}
        <section className="py-20 bg-slate-50/30 border-t border-slate-100">
           <div className="container mx-auto px-4 max-w-4xl">
              <div className="text-center space-y-4 mb-16">
                 <h2 className="text-3xl md:text-5xl font-black text-[#0F172A] uppercase tracking-tight">Common Questions</h2>
                 <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.3em]">Mobile Deployment Help</p>
              </div>

              <Accordion type="single" collapsible className="space-y-4">
                 <FAQItem value="item-1" q="Is it safe to install APK directly?" a="Yes. Cracklix Pro is digitally signed and verified. Android shows a warning for all direct APK installs, but you can safely proceed by authorizing the source." />
                 <FAQItem value="item-2" q="Will I get automatic updates?" a="The app will notify you when a new version node is deployed. You can then download the update directly from this hub." />
                 <FAQItem value="item-3" q="Can I use the same account?" a="Absolutely. All your mocks, progress, and Elite Pass status are synchronized across Web and Mobile in real-time." />
              </Accordion>
           </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

function GuideStep({ num, title, desc }: { num: string, title: string, desc: string }) {
  return (
    <div className="flex gap-6 group">
       <div className="h-12 w-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 shadow-inner group-hover:bg-primary group-hover:text-white transition-all duration-300">
          <span className="font-black text-sm">{num}</span>
       </div>
       <div className="space-y-1">
          <h4 className="font-black text-lg text-[#0F172A] uppercase tracking-tight">{title}</h4>
          <p className="text-sm text-slate-500 font-medium leading-relaxed">{desc}</p>
       </div>
    </div>
  )
}

function UpdateFeature({ text }: { text: string }) {
  return (
    <li className="flex items-start gap-3">
       <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
       <span className="text-[11px] md:text-sm font-bold text-slate-300 uppercase tracking-tight">{text}</span>
    </li>
  )
}

function FAQItem({ value, q, a }: { value: string, q: string, a: string }) {
  return (
    <AccordionItem value={value} className="bg-white border border-slate-100 rounded-2xl px-6 md:px-8 shadow-sm overflow-hidden">
       <AccordionTrigger className="hover:no-underline font-black uppercase text-left text-xs md:text-sm text-[#0F172A] py-6">{q}</AccordionTrigger>
       <AccordionContent className="text-slate-500 font-medium text-[12px] md:text-base leading-relaxed pb-6">{a}</AccordionContent>
    </AccordionItem>
  )
}
