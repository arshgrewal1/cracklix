
"use client"

import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from "@/components/ui/accordion"
import { HelpCircle, ShieldCheck, Sparkles, BookOpen, GraduationCap } from "lucide-react"

const FAQS = [
  {
    q: "Are the mock tests updated as per upcoming exams?",
    a: "Yes. All high-fidelity mock series on Cracklix are designed to mirror the latest PSSSB and PPSC cabinet notifications for upcoming recruitment cycles."
  },
  {
    q: "How does the 'Punjabi Qualifying' section work?",
    a: "Every mock includes a mandatory Part-A section (50 Marks) covering Gurmukhi grammar and Sikh history. You must score 50% for your main paper to be evaluated, just like real exams."
  },
  {
    q: "Is there any negative marking in the practice tests?",
    a: "Yes. Following official norms, Cracklix applies a penalty for every mismatched audit choice in standard PSSSB/PPSC mocks."
  },
  {
    q: "Can I attempt mocks in Punjabi language?",
    a: "Absolutely. Our CBT engine features a 'Bilingual Toggle' on the top-bar, allowing you to switch between English and Punjabi for every question instantly."
  },
  {
    q: "How often is the Daily Analysis updated?",
    a: "Strategic news and state governance updates are pushed to the 'Analysis Feed' every morning by 8:00 AM, verified by Arsh Grewal management."
  }
]

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-slate-50/50">
      <Navbar />
      <main className="container mx-auto px-6 py-24 max-w-4xl">
        <div className="space-y-16">
          <div className="text-center space-y-6">
             <div className="h-16 w-16 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto text-primary shadow-2xl">
                <HelpCircle className="h-8 w-8" />
             </div>
             <h1 className="text-5xl md:text-7xl font-headline font-black text-[#0F172A] uppercase tracking-tight">Institutional <span className="text-primary">FAQ</span></h1>
             <p className="text-slate-500 font-medium text-lg max-w-xl mx-auto">Everything you need to know about preparing for Punjab Government Exams with Cracklix.</p>
          </div>

          <div className="bg-white p-12 rounded-[4rem] shadow-3xl shadow-slate-900/5 space-y-8">
            <Accordion type="single" collapsible className="w-full">
              {FAQS.map((faq, idx) => (
                <AccordionItem key={idx} value={`item-${idx}`} className="border-b border-slate-50 py-4 last:border-0">
                  <AccordionTrigger className="text-left font-headline font-black text-xl text-[#0F172A] hover:text-primary transition-colors hover:no-underline px-4">
                    {faq.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-lg text-slate-500 font-medium leading-relaxed px-4 pt-4 pb-8">
                    {faq.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
             <QuickHelp icon={<ShieldCheck />} label="Verified Patterns" desc="Upcoming official norms" />
             <QuickHelp icon={<BookOpen />} label="Bilingual Hub" desc="Punjabi/English Support" />
             <QuickHelp icon={<GraduationCap />} label="Elite Mentors" desc="Arsh Grewal Management" />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

function QuickHelp({ icon, label, desc }: any) {
  return (
    <div className="p-10 bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 text-center space-y-4 border border-slate-50">
       <div className="h-12 w-12 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto text-primary">
          {icon}
       </div>
       <div className="space-y-1">
          <p className="font-headline font-black text-sm uppercase text-[#0F172A]">{label}</p>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{desc}</p>
       </div>
    </div>
  )
}
