
"use client"

import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import { FileText, Scale, AlertCircle, ShieldAlert } from "lucide-react"

/**
 * @fileOverview Institutional Terms v2.0.
 * UPDATED: Removed Analysis articles from IP policy.
 */

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-slate-50/50">
      <Navbar />
      <main className="container mx-auto px-6 py-24 max-w-4xl">
        <div className="space-y-12">
          <div className="text-center space-y-4">
             <div className="h-16 w-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto text-primary">
                <Scale className="h-8 w-8" />
             </div>
             <h1 className="text-5xl font-headline font-black text-[#0F172A] uppercase">Terms of Service</h1>
             <p className="text-slate-500 font-medium">Institutional Usage Guidelines</p>
          </div>

          <div className="bg-white p-12 rounded-[3.5rem] shadow-2xl space-y-10 prose prose-slate max-w-none">
             <section className="space-y-4">
                <h2 className="text-2xl font-headline font-black text-[#0F172A] uppercase">1. Platform Usage</h2>
                <p className="text-slate-600 leading-relaxed font-medium">
                   Cracklix provides mock tests and study material for educational purposes only. While we mirror official exam patterns, Cracklix is an independent platform and not affiliated with PSSSB, PPSC, or Punjab Police.
                </p>
             </section>

             <section className="space-y-4">
                <h2 className="text-2xl font-headline font-black text-[#0F172A] uppercase">2. Content Integrity</h2>
                <p className="text-slate-600 leading-relaxed font-medium">
                   All MCQs, rationalizations, and study notes are copyrighted intellectual property of Arsh Grewal Management. Unauthorized reproduction or commercial redistribution is strictly prohibited.
                </p>
             </section>

             <section className="space-y-4">
                <h2 className="text-2xl font-headline font-black text-[#0F172A] uppercase">3. User Conduct</h2>
                <p className="text-slate-600 leading-relaxed font-medium">
                   Any attempt to scrape content, bypass security, or manipulate leaderboard rankings will result in permanent termination of the aspirant&apos;s node.
                </p>
             </section>

             <section className="space-y-4 pt-10 border-t border-slate-50">
                <div className="flex items-center gap-4 text-orange-600">
                   <AlertCircle className="h-6 w-6" />
                   <p className="font-black uppercase tracking-widest text-[10px]">Strict Enforcement of Fair Practice</p>
                </div>
             </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
