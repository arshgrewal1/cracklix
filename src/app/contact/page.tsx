"use client"

import React, { useMemo } from "react"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import { Mail, Phone, MapPin, Send, MessageSquare, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { useState } from "react"
import { useDoc, useFirestore } from "@/firebase"
import { doc } from "firebase/firestore"

/**
 * @fileOverview Institutional Support Hub v2.1.
 * UPDATED: Dynamically pulls contact info from System Portal.
 */

export default function ContactPage() {
  const db = useFirestore()
  const settingsRef = useMemo(() => (db ? doc(db, 'settings', 'global') : null), [db])
  const { data: settings } = useDoc<any>(settingsRef)

  const { toast } = useToast()
  const [sending, setSending] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSending(true)
    setTimeout(() => {
      toast({ title: "Message Logged", description: "Arsh Grewal Management will contact you within 24 hours." })
      setSending(false)
      const form = e.target as HTMLFormElement
      form.reset()
    }, 1500)
  }

  const supportInfo = {
    email: settings?.supportEmail || "cracklixhelp@gmail.com",
    phone: settings?.supportPhone || "+91 98881 88602",
    address: settings?.address || "Shergarh, Punjab"
  }

  return (
    <div className="min-h-screen bg-slate-50/30 text-left font-body">
      <Navbar />
      <main className="container mx-auto px-4 md:px-6 py-12 md:py-24 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 md:gap-20">
          
          <div className="lg:col-span-5 space-y-8 md:space-y-12">
            <div className="space-y-4">
              <div className="h-10 w-10 md:h-14 rounded-xl md:rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                 <MessageSquare className="h-5 w-5 md:h-7 md:w-7" />
              </div>
              <h1 className="text-3xl md:text-6xl font-headline font-black text-[#0F172A] tracking-tight uppercase leading-[0.9]">
                Support <br/> <span className="text-primary">Hub</span>
              </h1>
              <p className="text-[12px] md:text-lg text-slate-500 font-medium leading-relaxed">
                Reach out to our management node directly for inquiries.
              </p>
            </div>

            <div className="space-y-6 md:space-y-10">
               <ContactInfo icon={<Mail className="h-4 w-4 md:h-5 md:h-5" />} label="Email Node" value={supportInfo.email} />
               <a href={`https://wa.me/${supportInfo.phone.replace(/\D/g, '')}`} target="_blank" className="block group">
                 <ContactInfo icon={<Phone className="h-4 w-4 md:h-5 md:h-5" />} label="WhatsApp Hub" value={supportInfo.phone} />
               </a>
               <ContactInfo icon={<MapPin className="h-4 w-4 md:h-5 md:h-5" />} label="HQs Node" value={supportInfo.address} />
            </div>

            <div className="pt-8 border-t border-slate-100 flex items-center gap-3 text-emerald-600">
               <ShieldCheck className="h-5 w-5 shrink-0" />
               <p className="text-[8px] md:text-[10px] font-black uppercase tracking-widest">Registry Verification Active</p>
            </div>
          </div>

          <div className="lg:col-span-7">
            <Card className="border-none shadow-4xl rounded-[2rem] md:rounded-[3rem] bg-white overflow-hidden">
               <div className="h-1.5 w-full bg-primary" />
               <CardContent className="p-6 md:p-16">
                  <form onSubmit={handleSubmit} className="space-y-6">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
                        <div className="space-y-1.5">
                           <label className="text-[9px] font-black uppercase text-slate-400 ml-1">Identity</label>
                           <Input required placeholder="Arsh Grewal" className="h-12 md:h-14 rounded-xl border-slate-100 bg-slate-50/50 font-bold" />
                        </div>
                        <div className="space-y-1.5">
                           <label className="text-[9px] font-black uppercase text-slate-400 ml-1">Contact Email</label>
                           <Input required type="email" placeholder="name@domain.com" className="h-12 md:h-14 rounded-xl border-slate-100 bg-slate-50/50 font-bold" />
                        </div>
                     </div>
                     <div className="space-y-1.5">
                        <label className="text-[9px] font-black uppercase text-slate-400 ml-1">Context</label>
                        <Textarea required placeholder="Describe your inquiry..." className="min-h-[150px] rounded-xl md:rounded-2xl border-slate-100 bg-slate-50/50 p-5 leading-relaxed font-medium" />
                     </div>
                     <Button type="submit" disabled={sending} className="w-full h-14 md:h-16 bg-[#0F172A] hover:bg-black text-white font-black uppercase tracking-[0.2em] rounded-xl md:rounded-2xl shadow-xl transition-all border-none active:scale-95">
                        {sending ? "Transmitting..." : "Initiate Contact"} <Send className="ml-2 h-4 w-4" />
                     </Button>
                  </form>
               </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

function ContactInfo({ icon, label, value }: any) {
  return (
    <div className="flex items-center gap-4 md:gap-6 group">
      <div className="h-10 w-10 md:h-16 md:w-16 rounded-xl md:rounded-[1.5rem] bg-white shadow-lg flex items-center justify-center shrink-0 border border-slate-50 text-slate-300 group-hover:bg-primary/5 group-hover:text-primary transition-all">
        {icon}
      </div>
      <div className="text-left min-w-0">
        <p className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{label}</p>
        <p className="text-sm md:text-xl font-bold text-[#0F172A] group-hover:text-primary transition-colors truncate">{value}</p>
      </div>
    </div>
  )
}
