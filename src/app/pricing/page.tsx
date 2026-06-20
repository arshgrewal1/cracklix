"use client"

import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, Zap, ShieldCheck, Trophy, ArrowRight, Star, Award, Sparkles } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"

/**
 * @fileOverview Institutional Pass Center v15.1 (AI Cleaned).
 */

const PLANS = [
  {
    id: "free",
    name: "Aspirant Basic",
    price: 0,
    tier: "Free",
    desc: "Start your journey with verified patterns.",
    features: [
      "10 Free Mocks (PSSSB/Police)",
      "Public Exam Calendar",
      "Limited PYQ Previews",
      "Bilingual Engine Support"
    ],
    icon: <Zap className="h-6 w-6 text-slate-400" />
  },
  {
    id: "silver",
    name: "Silver Pass",
    price: 99,
    tier: "Silver",
    desc: "Targeted subject mastery for state exams.",
    features: [
      "All Subject-wise Mocks",
      "All Official PYQs (PDF)",
      "Performance Dashboard",
      "Bilingual Support Node",
      "Regional Rank Index"
    ],
    icon: <ShieldCheck className="h-6 w-6 text-blue-500" />
  },
  {
    id: "gold",
    name: "Gold Pass",
    price: 199,
    tier: "Gold",
    recommended: true,
    desc: "Institutional accuracy for the serious aspirant.",
    features: [
      "Everything in Silver",
      "All Full Length Mocks (500+)",
      "Detailed Solution Rationales",
      "Readiness Score Index",
      "Revision Vault Access",
      "Priority WhatsApp Alerts"
    ],
    icon: <Trophy className="h-6 w-6 text-amber-500" />
  },
  {
    id: "premium",
    name: "Elite Pass",
    price: 499,
    tier: "Premium",
    desc: "Full institutional access to the elite vault.",
    features: [
      "Everything in Gold",
      "Live Mentorship (Arsh Grewal)",
      "Advance Video Courses",
      "Early Access to Test Series",
      "Dedicated Technical Support",
      "Zero Advertisements"
    ],
    icon: <Star className="h-6 w-6 text-primary" />
  }
]

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-slate-50/50">
      <Navbar />
      <main className="container mx-auto px-6 py-24 max-w-7xl">
        <div className="text-center space-y-10 mb-20">
           <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Badge className="bg-primary/10 text-primary border-none px-6 py-2 rounded-full font-black uppercase text-[10px] tracking-[0.2em] mb-10 shadow-sm">
                 Elite Preparation Nodes
              </Badge>
              <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-8xl font-black text-[#0F172A] tracking-tight leading-[0.9] break-words antialiased">
                 Select Your <br/> <span className="text-primary">Cracklix Pass</span>
              </h1>
              <p className="text-sm md:text-2xl text-slate-500 font-medium max-w-2xl mx-auto mt-10 leading-tight tracking-tight">
                 Invest in institutional precision. Unlock verified patterns and expert audit rationalizations for Latest Pattern recruitments.
              </p>
           </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
           {PLANS.map((plan, idx) => (
             <motion.div 
               key={plan.id}
               initial={{ opacity: 0, y: 30 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: idx * 0.1 }}
             >
                <Card className={`h-full border-none shadow-3xl rounded-[3rem] overflow-hidden flex flex-col group hover:translate-y-[-10px] transition-all duration-500 ${plan.recommended ? 'ring-4 ring-primary ring-offset-8 scale-105 z-10' : 'bg-white'}`}>
                   {plan.recommended && (
                      <div className="bg-primary text-white py-3 text-center text-[10px] font-black uppercase tracking-[0.3em]">
                        Recommended Hub
                      </div>
                   )}
                   <CardHeader className="p-10 pb-6 text-center space-y-6">
                      <div className="h-16 w-16 rounded-2xl bg-slate-50 flex items-center justify-center mx-auto shadow-inner group-hover:scale-110 transition-transform">
                         {plan.icon}
                      </div>
                      <div className="space-y-1">
                        <CardTitle className="font-headline font-black text-2xl text-[#0F172A] uppercase">{plan.name}</CardTitle>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-relaxed px-4">{plan.desc}</p>
                      </div>
                      <div className="pt-4">
                         <span className="text-5xl font-black text-[#0F172A]">₹{plan.price}</span>
                         <span className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-2">/ month</span>
                      </div>
                   </CardHeader>
                   <CardContent className="p-10 pt-0 flex-1">
                      <div className="h-px w-full bg-slate-50 mb-8" />
                      <ul className="space-y-5">
                         {plan.features.map((f, i) => (
                            <li key={i} className="flex items-start gap-4">
                               <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                               <span className="text-sm font-bold text-slate-600 leading-tight">{f}</span>
                            </li>
                         ))}
                      </ul>
                   </CardContent>
                   <CardFooter className="p-10 pt-0">
                      <Button asChild className={`w-full h-16 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] shadow-2xl transition-all ${plan.recommended ? 'bg-primary hover:bg-orange-600 text-white' : 'bg-[#0F172A] hover:bg-black text-white'}`}>
                         <Link href={`/checkout?plan=${plan.id}`}>
                            {plan.price === 0 ? 'Get Started' : 'Unlock Pass'} <ArrowRight className="ml-3 h-4 w-4" />
                         </Link>
                      </Button>
                   </CardFooter>
                </Card>
             </motion.div>
           ))}
        </div>
      </main>
      <Footer />
    </div>
  )
}
