"use client"

import React, { useMemo } from "react"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from "@/components/ui/accordion"
import { HelpCircle, ShieldCheck, BookOpen, GraduationCap, Zap, LucideIcon } from "lucide-react"
import { useCollection, useFirestore } from "@/firebase"
import { collection, query, where, orderBy } from "firebase/firestore"
import { Skeleton } from "@/components/ui/skeleton"
import { HelpArticle } from "@/types"
import { cn } from "@/lib/utils"

/**
 * @fileOverview Official Institutional FAQ Hub v4.1 (Build Fixed).
 * FIXED: Added missing 'cn' import and explicitly typed React components.
 */

export default function FAQPage() {
  const db = useFirestore()
  
  const faqQuery = useMemo(() => (db ? query(collection(db, "help_articles"), where("category", "==", "FAQ"), where("published", "==", true), orderBy("displayOrder", "asc")) : null), [db])
  const { data: faqs, loading } = useCollection<HelpArticle>(faqQuery as any)

  return (
    <div className="min-h-screen bg-slate-50/50 font-body text-left">
      <Navbar />
      <main className="container mx-auto px-4 md:px-6 py-12 md:py-24 max-w-4xl">
        <div className="space-y-16">
          <div className="text-center space-y-6">
             <div className="h-16 w-16 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto text-primary shadow-2xl">
                <HelpCircle className="h-8 w-8" />
             </div>
             <h1 className="text-4xl md:text-7xl font-headline font-black text-[#0F172A] uppercase tracking-tighter leading-[0.9]">Institutional <span className="text-primary">FAQ</span></h1>
             <p className="text-slate-500 font-medium text-lg max-w-xl mx-auto leading-relaxed">Everything you need to know about preparing for Punjab Government Exams with Cracklix.</p>
          </div>

          <div className="bg-white p-8 md:p-12 rounded-[2.5rem] md:rounded-[4rem] shadow-3xl border border-slate-100 space-y-8">
            <Accordion type="single" collapsible className="w-full">
              {loading ? (
                 Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-xl mb-4" />)
              ) : faqs && faqs.length > 0 ? (
                 faqs.map((faq, idx) => (
                  <AccordionItem key={faq.id} value={`item-${idx}`} className="border-b border-slate-50 py-4 last:border-0">
                    <AccordionTrigger className="text-left font-headline font-black text-base md:text-xl text-[#0F172A] hover:text-primary transition-colors hover:no-underline px-4 uppercase tracking-tight">
                      {faq.title}
                    </AccordionTrigger>
                    <AccordionContent className="text-sm md:text-lg text-slate-500 font-medium leading-relaxed px-4 pt-4 pb-8">
                      {faq.content}
                    </AccordionContent>
                  </AccordionItem>
                ))
              ) : (
                 <div className="py-20 text-center opacity-30 italic font-black uppercase text-xl">FAQ Registry Empty</div>
              )}
            </Accordion>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
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
    <div className="p-8 md:p-10 bg-white rounded-[2.5rem] shadow-xl border border-slate-100 text-center space-y-4">
       <div className="h-12 w-12 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto text-primary shadow-inner">
          <Icon className="h-6 w-6" />
       </div>
       <div className="space-y-1">
          <p className="font-headline font-black text-sm uppercase text-[#0F172A] tracking-tight">{label}</p>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{desc}</p>
       </div>
    </div>
  )
}
