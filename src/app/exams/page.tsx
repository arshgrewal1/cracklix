
"use client"

import { useMemo } from "react"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import { useCollection, useFirestore } from "@/firebase"
import { collection } from "firebase/firestore"
import { ShieldCheck, GraduationCap, Zap, Wallet, Globe, ChevronRight, Landmark } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { cn } from "@/lib/utils"

/**
 * @fileOverview Institutional Category Registry Hub v15.0.
 * Reorganized into 5 discrete recruitment verticals for scalable discovery.
 */

const MAIN_CATEGORIES = [
  {
    id: "punjab-govt",
    title: "Punjab Government Exams",
    desc: "PSSSB, PPSC, Punjab Police, Revenue & State Departments.",
    icon: <ShieldCheck className="h-10 w-10 md:h-12 md:w-12" />,
    color: "text-primary",
    bgColor: "bg-orange-50",
    highlight: "STATE LEVEL"
  },
  {
    id: "punjab-teaching",
    title: "Punjab Teaching Exams",
    desc: "PSTET, CTET, Master Cadre, ETT & Lecturer registries.",
    icon: <GraduationCap className="h-10 w-10 md:h-12 md:w-12" />,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    highlight: "EDUCATIONAL"
  },
  {
    id: "punjab-technical",
    title: "Punjab Technical Exams",
    desc: "PSPCL, PSTCL, Junior Engineer & Technical Assistant nodes.",
    icon: <Zap className="h-10 w-10 md:h-12 md:w-12" />,
    color: "text-amber-500",
    bgColor: "bg-amber-50",
    highlight: "POWER & IT"
  },
  {
    id: "banking",
    title: "Banking Exams",
    desc: "IBPS, PO, Clerk, SO, SBI, RBI & NABARD career prep.",
    icon: <Wallet className="h-10 w-10 md:h-12 md:w-12" />,
    color: "text-emerald-600",
    bgColor: "bg-emerald-50",
    highlight: "FINANCIAL"
  },
  {
    id: "central-govt",
    title: "Central Government Exams",
    desc: "SSC, Railways, Indian Army, Air Force & Navy Hubs.",
    icon: <Globe className="h-10 w-10 md:h-12 md:w-12" />,
    color: "text-indigo-600",
    bgColor: "bg-indigo-50",
    highlight: "NATIONAL"
  }
];

export default function ExamsEntryPage() {
  const db = useFirestore();
  const { data: boards } = useCollection<any>(useMemo(() => (db ? collection(db, "boards") : null), [db]));
  const { data: exams } = useCollection<any>(useMemo(() => (db ? collection(db, "exams") : null), [db]));

  return (
    <div className="flex flex-col min-h-screen bg-slate-50/50 font-body">
      <Navbar />
      
      <main className="container mx-auto px-4 md:px-6 py-12 md:py-24 max-w-7xl">
        <div className="text-left mb-16 md:mb-24 space-y-6">
          <div className="flex items-center gap-4">
             <div className="h-12 w-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary shadow-inner">
                <Landmark className="h-6 w-6" />
             </div>
             <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.4em] text-slate-500">Official Exam Registry 2026</span>
          </div>
          <h1 className="text-4xl md:text-8xl font-headline font-black text-[#0F172A] uppercase tracking-tighter leading-[0.85]">
            Master <br/> <span className="text-primary">Registry</span>
          </h1>
          <p className="text-slate-500 font-medium text-lg md:text-2xl max-w-3xl leading-relaxed">
            Select your recruitment category to find official boards and practice hubs.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
           {MAIN_CATEGORIES.map((cat, idx) => {
             const boardCount = (boards || []).filter((b: any) => b.categoryId === cat.id).length;
             const examCount = (exams || []).filter((e: any) => e.categoryId === cat.id).length;

             return (
                <Link key={cat.id} href={`/exams/category/${cat.id}`}>
                   <Card className="border-none shadow-xl hover:shadow-5xl hover:translate-y-[-12px] transition-all duration-700 rounded-[3.5rem] bg-white group overflow-hidden h-full flex flex-col border border-slate-100">
                      <CardContent className="p-10 md:p-14 flex flex-col h-full">
                         <div className="flex justify-between items-start mb-12">
                            <div className={cn("h-20 w-20 md:h-24 md:w-24 rounded-[1.8rem] md:rounded-[2.2rem] flex items-center justify-center transition-all group-hover:shadow-2xl shadow-inner relative overflow-hidden shrink-0", cat.bgColor, cat.color)}>
                               {cat.icon}
                            </div>
                            <Badge className="bg-[#0F172A] text-white border-none text-[8px] font-black uppercase tracking-[0.2em] px-4 py-1.5 rounded-xl shadow-lg">
                               {cat.highlight}
                            </Badge>
                         </div>
                         
                         <div className="space-y-5 flex-1">
                            <h3 className="font-headline text-3xl md:text-4xl font-black text-[#0F172A] uppercase leading-[0.95] group-hover:text-primary transition-colors">
                               {cat.title}
                            </h3>
                            <p className="text-sm md:text-lg font-medium text-slate-400 leading-relaxed">
                               {cat.desc}
                            </p>
                         </div>

                         <div className="mt-12 pt-8 border-t border-slate-50">
                            <Button variant="ghost" className="w-full h-16 rounded-2xl bg-slate-900 text-white group-hover:bg-primary transition-all shadow-xl font-black uppercase text-[10px] tracking-widest gap-3">
                               Open Category Hub <ChevronRight className="h-4 w-4" />
                            </Button>
                         </div>
                      </CardContent>
                   </Card>
                </Link>
             )
           })}
        </div>
      </main>
      <Footer />
    </div>
  )
}
