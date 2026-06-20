"use client"

import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import { ShieldCheck, Lock, Eye, FileText } from "lucide-react"

/**
 * @fileOverview Institutional Privacy Policy (AI Cleaned).
 */

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-slate-50/50">
      <Navbar />
      <main className="container mx-auto px-6 py-24 max-w-4xl">
        <div className="space-y-12">
          <div className="text-center space-y-4">
             <div className="h-16 w-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto text-primary">
                <Lock className="h-8 w-8" />
             </div>
             <h1 className="text-5xl font-headline font-black text-[#0F172A] uppercase">Privacy Policy</h1>
             <p className="text-slate-500 font-medium">Last Updated: February 2026</p>
          </div>

          <div className="bg-white p-12 rounded-[3.5rem] shadow-2xl space-y-10 prose prose-slate max-w-none">
             <section className="space-y-4">
                <h2 className="text-2xl font-headline font-black text-[#0F172A] uppercase">1. Data Collection</h2>
                <p className="text-slate-600 leading-relaxed font-medium">
                   Cracklix collects personal information such as name, email, and mobile number to provide a personalized preparation experience. We also track mock attempt data to generate performance analytics.
                </p>
             </section>

             <section className="space-y-4">
                <h2 className="text-2xl font-headline font-black text-[#0F172A] uppercase">2. Use of Information</h2>
                <p className="text-slate-600 leading-relaxed font-medium">
                   Your information is used to:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-slate-600 font-medium">
                   <li>Generate All Punjab Rank and performance benchmarks.</li>
                   <li>Send exam notifications and admit card alerts.</li>
                   <li>Provide personalized mentors based on your performance.</li>
                </ul>
             </section>

             <section className="space-y-4">
                <h2 className="text-2xl font-headline font-black text-[#0F172A] uppercase">3. Security</h2>
                <p className="text-slate-600 leading-relaxed font-medium">
                   Cracklix employs institutional-grade security protocols. All data is stored on Google Firebase servers with encrypted communication. We never sell your personal data to third-party advertisers.
                </p>
             </section>

             <section className="space-y-4 pt-10 border-t border-slate-50">
                <div className="flex items-center gap-4 text-emerald-600">
                   <ShieldCheck className="h-6 w-6" />
                   <p className="font-black uppercase tracking-widest text-[10px]">Verified Data Protection Standards</p>
                </div>
             </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
