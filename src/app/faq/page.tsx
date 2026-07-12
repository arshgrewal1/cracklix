"use client"

import React, { useMemo, useState } from "react"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from "@/components/ui/accordion"
import { HelpCircle, ShieldCheck, BookOpen, GraduationCap, LucideIcon, ArrowLeft, Zap } from "lucide-react"
import { useCollection, useFirestore } from "@/firebase"
import { collection, query, where } from "firebase/firestore"
import { Skeleton } from "@/components/ui/skeleton"
import { HelpArticle } from "@/types"
import { useRouter } from "next/navigation"

/**
 * @fileOverview Official Institutional FAQ Hub v6.0 (High-Fidelity Update).
 * FIXED: Applied global responsive scaling headers with leading-[0.9].
 * FIXED: Shifted sorting to client-side to bypass missing composite index requirement.
 */

export default function FAQPage() {
  const db = useFirestore()
  const router = useRouter()
  
  const faqQuery = useMemo(() => (db ? query(
    collection(db, "help_articles"), 
    where("category", "==", "FAQ"), 
    where("published", "==", true)
  ) : null), [db])

  const { data: rawFaqs, loading } = useCollection<HelpArticle>(faqQuery as any)

  const faqs = useMemo(() => {
    if (!rawFaqs) return [];
    return [...rawFaqs].sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
  }, [rawFaqs]);

  return (
    <div className="min-h-screen bg-slate-50/50 font-body text-left selection:bg-primary/10">
      <Navbar />
      <main className="container mx-auto px-4 md:px-6 py-12 md:py-24 max-w-[1440px] space-y-12 md:space-y-24">
        
        <div className="text-left space-y-6 md:space-y-10 max-w-4xl">
           <div className="flex items-center gap-4">
              <button onClick={() => router.back()} className="h-10 w-10 rounded-xl border border-slate-200 bg-white flex items-center justify-center text-slate-400 hover:text-primary transition-all shadow-sm">
                 <ArrowLeft className="h-5 w-5" />
              </button>
              <div className="h-10 w-10 md:h-12 md:w-12 bg-primary/10 rounded-xl md:rounded-2xl flex items-center justify-center text-primary shadow-2xl shrink-0">
                 <HelpCircle className="h-5 w-5 md:h-6 md:w-6" />
              </div>
              <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.3em] text-slate-400">Institutional Knowledge Base</span>
           </div>
           <h1 className="text-4xl sm:text-6xl md:text-8xl lg:text-9xl font-black text-[#0F172A] tracking-tighter leading-[0.9] break-words antialiased">
              F.A.Q<span className="text-primary italic">. Hub</span>
           </h1>
           <p className="text-slate-500 font-medium text-sm md:text-2xl max-w-xl leading-tight tracking-tight">
              Verified answers to common queries about preparing for Punjab recruitment verticals.
           </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 md:gap-20">
           <div className="lg:col-span-8">
              <div className="bg-white p-6 md:p-14 rounded-[2.5rem] md:rounded-[4rem] shadow-4xl border border-slate-100 space-y-8">
                 <Accordion type="single" collapsible className="w-full">
                    {loading ? (
                       Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-20 w-full rounded-2xl mb-4" />)
                    ) : faqs && faqs.length > 0 ? (
                       faqs.map((faq, idx) => (
                        <AccordionItem key={faq.id} value={`item-${idx}`} className="border-b border-slate-50 py-5 md:py-8 last:border-0">
                          <AccordionTrigger className="text-left font-headline font-black text-base md:text-2xl text-[#0F172A] hover:text-primary transition-all hover:no-underline px-4 uppercase tracking-tight antialiased">
                            {faq.title}
                          </AccordionTrigger>
                          <AccordionContent className="text-[13px] md:text-lg text-slate-500 font-medium leading-relaxed px-4 pt-6 pb-4">
                            {faq.content}
                          </AccordionContent>
                        </AccordionItem>
                      ))
                    ) : (
                       <div className="py-20 text-center opacity-30 italic font-black uppercase text-xl flex flex-col items-center gap-6">
                          <Zap className="h-12 w-12" />
                          Registry Empty
                       </div>
                    )}
                 </Accordion>
              </div>
           </div>

           <div className="lg:col-span-4 space-y-8 md:space-y-12">
              <QuickHelp icon={ShieldCheck} label="Verified Patterns" desc="Official commission norms" />
              <QuickHelp icon={BookOpen} label="Bilingual Hub" desc="Punjabi/English Support" />
              <QuickHelp icon={GraduationCap} label="Elite Mentors" desc="Arsh Grewal Management" />
           </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

function QuickHelp({ icon: Icon, label, desc }: { icon: LucideIcon, label: string, desc: string }) {
  return (
    <div className="p-8 md:p-12 bg-white rounded-[2.5rem] shadow-xl border border-slate-100 text-left space-y-6 group hover:translate-y-[-6px] transition-all duration-500">
       <div className="h-12 w-12 md:h-16 md:w-16 bg-slate-50 rounded-2xl flex items-center justify-center text-primary shadow-inner group-hover:scale-110 transition-transform">
          <Icon className="h-6 w-6 md:h-8 md:w-8" />
       </div>
       <div className="space-y-1">
          <p className="font-headline font-black text-sm md:text-xl uppercase text-[#0F172A] tracking-tight">{label}</p>
          <p className="text-[9px] md:text-[11px] font-bold text-slate-400 uppercase tracking-widest leading-snug">{desc}</p>
       </div>
    </div>
  )
}
