"use client"

import React, { useState, useMemo } from "react"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import { Card, CardContent } from "@/components/ui/card"
import { 
  HelpCircle, 
  Search, 
  ChevronRight, 
  Zap, 
  CreditCard, 
  Smartphone, 
  Lock, 
  BookOpen,
  ShieldCheck,
  MessageCircle,
  Loader2,
  LucideIcon,
  X,
  ArrowLeft
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { useCollection, useFirestore } from "@/firebase"
import { collection, query, where } from "firebase/firestore"
import { Skeleton } from "@/components/ui/skeleton"
import { HelpArticle } from "@/types"
import { useRouter } from "next/navigation"

/**
 * @fileOverview Official Institutional Help Hub v6.1.
 * UPDATED: Reduced header height offset to top-[84px] md:top-[116px].
 */

const HELP_CATEGORIES = [
  { id: "PAYMENTS", label: "Payments", icon: CreditCard, desc: "UPI, Cards, and Refunds" },
  { id: "PASS", label: "Premium Pass", icon: Zap, desc: "Plans and Benefits" },
  { id: "PWA", label: "App Setup", icon: Smartphone, desc: "Install Cracklix PWA" },
  { id: "TECHNICAL", label: "CBT Issues", icon: ShieldCheck, desc: "Test engine help" },
  { id: "ACCOUNT", label: "Account Hub", icon: Lock, desc: "Security and Profile" }
]

export default function HelpCenterPage() {
  const db = useFirestore()
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  const helpQuery = useMemo(() => (db ? query(
    collection(db, "help_articles"), 
    where("published", "==", true)
  ) : null), [db])

  const { data: rawArticles, loading } = useCollection<HelpArticle>(helpQuery as any)

  const articles = useMemo(() => {
    if (!rawArticles) return [];
    return [...rawArticles].sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
  }, [rawArticles]);

  const filteredArticles = useMemo(() => {
    return articles.filter(a => {
      const matchesSearch = !searchTerm || 
        a.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        a.content?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = !selectedCategory || a.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    })
  }, [articles, searchTerm, selectedCategory])

  return (
    <div className="min-h-screen bg-slate-50/50 text-left font-body selection:bg-primary/10">
      <Navbar />
      
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-24 max-w-[1440px] space-y-12 md:space-y-24 pb-40">
        
        {/* 1. HERO HUB */}
        <div className="text-left space-y-10 md:space-y-16 max-w-5xl">
           <div className="space-y-6 md:space-y-10">
              <div className="flex items-center gap-4">
                 <button onClick={() => router.back()} className="h-10 w-10 rounded-xl border border-slate-200 bg-white flex items-center justify-center text-slate-400 hover:text-primary transition-all shadow-sm">
                    <ArrowLeft className="h-5 w-5" />
                 </button>
                 <div className="h-10 w-10 md:h-12 md:w-12 bg-primary/10 rounded-xl md:rounded-2xl flex items-center justify-center text-primary shadow-inner">
                    <HelpCircle className="h-5 w-5 md:h-6 md:w-6" />
                 </div>
                 <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.3em] text-slate-400">Institutional Help Hub</span>
              </div>
              <h1 className="text-4xl sm:text-6xl md:text-8xl lg:text-9xl font-black text-[#0F172A] tracking-tighter leading-[0.9] break-words antialiased">
                 Help <span className="text-primary italic">Center.</span>
              </h1>
              <p className="text-slate-500 font-medium text-sm md:text-2xl max-w-2xl leading-tight tracking-tight">
                 Access our verified preparation nodes and solve institutional queries instantly.
              </p>
           </div>

           <div className="sticky top-[84px] md:top-[116px] z-40 bg-[#F8FAFC]/80 backdrop-blur-xl -mx-4 px-4 py-2 border-b border-slate-100">
              <div className="relative max-w-2xl group">
                 <div className="absolute -inset-1 bg-gradient-to-r from-primary to-blue-400 rounded-2xl blur opacity-5 group-focus-within:opacity-20 transition duration-1000"></div>
                 <div className="relative">
                    <Search className={cn("absolute left-6 top-1/2 -translate-y-1/2 h-6 w-6 transition-colors", searchTerm ? "text-primary" : "text-slate-400")} />
                    <Input 
                      className="h-14 md:h-16 pl-16 rounded-2xl md:rounded-[2rem] bg-white border-none shadow-2xl text-lg md:text-xl font-bold text-[#0F172A]" 
                      placeholder="Search common issues..." 
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                    />
                 </div>
              </div>
           </div>
        </div>

        {/* 2. CATEGORY MATRIX */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-8">
           {HELP_CATEGORIES.map(cat => {
              const Icon = cat.icon;
              const isActive = selectedCategory === cat.id;
              return (
                <Card 
                  key={cat.id} 
                  onClick={() => setSelectedCategory(isActive ? null : cat.id)}
                  className={cn(
                    "border-none shadow-xl rounded-[2.5rem] bg-white group hover:translate-y-[-8px] transition-all duration-500 border-2 cursor-pointer",
                    isActive ? "border-primary ring-4 ring-primary/5" : "border-transparent"
                  )}
                >
                  <CardContent className="p-6 md:p-10 text-center space-y-6">
                      <div className={cn(
                        "h-12 w-12 md:h-16 md:w-16 rounded-xl md:rounded-2xl flex items-center justify-center mx-auto shadow-inner transition-all",
                        isActive ? "bg-primary text-white" : "bg-slate-50 group-hover:scale-110 group-hover:bg-primary/5 text-primary"
                      )}>
                        <Icon className="h-6 w-6 md:h-8 md:w-8" />
                      </div>
                      <div className="space-y-1">
                        <h3 className="font-headline font-black text-xs md:text-sm uppercase text-[#0F172A]">{cat.label}</h3>
                        <p className="text-[8px] md:text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-tight">{cat.desc}</p>
                      </div>
                  </CardContent>
                </Card>
              )
           })}
        </div>

        {/* 3. CONTENT STREAM */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 md:gap-20">
           <div className="lg:col-span-8 space-y-10 md:space-y-16 text-left">
              <div className="flex items-center justify-between px-2">
                 <h3 className="text-xl md:text-4xl font-headline font-black uppercase flex items-center gap-4 text-[#0F172A]">
                    <BookOpen className="h-6 w-6 md:h-10 md:w-10 text-primary" /> 
                    {selectedCategory ? `${selectedCategory.toLowerCase()} Guides` : "Common Guides"}
                 </h3>
                 {selectedCategory && (
                    <button onClick={() => setSelectedCategory(null)} className="text-[9px] md:text-[11px] font-black uppercase text-slate-400 flex items-center gap-2 hover:text-primary transition-all bg-white px-4 py-2 rounded-full shadow-sm border border-slate-100">
                       <X className="h-3.5 w-3.5" /> Clear Filter
                    </button>
                 )}
              </div>
              
              <div className="space-y-6 md:space-y-10">
                 {loading ? (
                    Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-48 w-full rounded-[2.5rem] md:rounded-[3.5rem] bg-white" />)
                 ) : filteredArticles.length > 0 ? (
                    filteredArticles.map((article) => (
                      <Card key={article.id} className="border-none shadow-xl hover:shadow-4xl rounded-[2.5rem] md:rounded-[3.5rem] bg-white group border border-slate-100 overflow-hidden transition-all duration-500">
                         <CardContent className="p-8 md:p-14 space-y-6">
                            <div className="flex items-center gap-3">
                               <Badge variant="outline" className="bg-primary/5 text-primary border-none text-[8px] md:text-[10px] font-black uppercase px-3 py-1 rounded-lg">{article.category} Hub</Badge>
                               <span className="h-1.5 w-1.5 rounded-full bg-slate-200" />
                               <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">Registry ID: {article.id.slice(-6)}</span>
                            </div>
                            <p className="text-lg md:text-3xl font-black text-[#0F172A] leading-tight group-hover:text-primary transition-colors tracking-tight uppercase">{article.title}</p>
                            <p className="text-sm md:text-xl text-slate-500 font-medium leading-relaxed max-w-3xl">{article.content}</p>
                            <div className="pt-6 border-t border-slate-50 flex items-center gap-4 text-[10px] font-bold text-slate-300 uppercase tracking-widest">
                               <ShieldCheck className="h-4 w-4 text-emerald-500" /> Verified solution node
                            </div>
                         </CardContent>
                      </Card>
                    ))
                 ) : (
                    <div className="py-32 text-center bg-white rounded-[4rem] border-2 border-dashed border-slate-100 shadow-inner flex flex-col items-center gap-6">
                       <div className="h-20 w-20 bg-slate-50 rounded-3xl flex items-center justify-center opacity-30"><Search className="h-10 w-10 text-slate-400" /></div>
                       <p className="text-xl font-bold tracking-tight text-slate-400 uppercase">No matching guides found</p>
                    </div>
                 )}
              </div>
           </div>

           {/* 4. SIDEBAR CTAS */}
           <div className="lg:col-span-4 space-y-8 md:space-y-12">
              <Card className="border-none shadow-4xl rounded-[3rem] bg-[#0B1528] text-white p-10 md:p-14 space-y-10 relative overflow-hidden group">
                 <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12 group-hover:scale-110 transition-transform duration-1000"><MessageCircle className="h-64 w-64 text-primary" /></div>
                 <div className="relative z-10 space-y-10 text-left">
                    <div className="h-16 w-16 bg-primary/20 rounded-2xl md:rounded-3xl flex items-center justify-center text-primary shadow-3xl border border-primary/20">
                      <MessageCircle className="h-8 w-8 fill-current" />
                    </div>
                    <div className="space-y-6">
                       <h3 className="text-3xl md:text-5xl font-black leading-none text-white tracking-tight uppercase">Audit <br/> Support</h3>
                       <p className="text-slate-400 text-sm md:text-xl font-medium leading-snug">Raise a support ticket and our management node will audit your issue within 24 hours.</p>
                    </div>
                    <Button asChild className="w-full h-16 md:h-20 bg-primary hover:bg-blue-700 text-white font-black uppercase text-[10px] md:text-xs tracking-widest rounded-2xl md:rounded-3xl shadow-4xl gap-3 border-none transition-all active:scale-95">
                       <Link href="/support">Open Support Hub <ChevronRight className="h-4 w-4 md:h-5 md:w-5 group-hover:translate-x-2 transition-transform" /></Link>
                    </Button>
                 </div>
              </Card>

              <div className="bg-white p-8 md:p-10 rounded-[3rem] border border-slate-100 shadow-xl space-y-6 text-left">
                 <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.3em]">Quick Links</h4>
                 <div className="grid grid-cols-1 gap-2">
                    <QuickHelpLink label="Refund Policy" href="/privacy" />
                    <QuickHelpLink label="Pass Activation" href="/pass" />
                    <QuickHelpLink label="Account Security" href="/profile" />
                 </div>
              </div>
           </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

function QuickHelpLink({ label, href }: { label: string, href: string }) {
   return (
      <Link href={href} className="flex items-center justify-between p-4 bg-slate-50/50 hover:bg-slate-50 rounded-2xl border border-slate-50 transition-all group active:scale-[0.98]">
         <span className="text-[13px] font-bold text-[#0F172A]">{label}</span>
         <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-primary transition-all" />
      </Link>
   )
}
