"use client"

import { useMemo, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import { useCollection, useFirestore, useUser } from "@/firebase"
import { collection, query, orderBy } from "firebase/firestore"
import { Landmark, ChevronRight, Zap, ShieldCheck } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"

/**
 * @fileOverview Strict Category Explorer v22.0.
 * ENFORCED: Whitelist filter ensures only the 7 authorized categories are listed.
 */

const AUTHORIZED_CATEGORY_IDS = [
  "punjab-government-exams",
  "punjab-teaching-exams",
  "punjab-technical-exams",
  "banking-exams",
  "punjab-health-exams",
  "judiciary-exams",
  "high-court-exams"
];

export default function ExamsEntryPage() {
  const db = useFirestore();
  const router = useRouter();
  const { user, loading: authLoading } = useUser();
  
  useEffect(() => {
    if (!authLoading && !user) router.push(`/login?returnUrl=/exams`);
  }, [user, authLoading, router]);

  const catQuery = useMemo(() => (db ? query(collection(db, "categories"), orderBy("displayOrder", "asc")) : null), [db]);
  const { data: rawCategories, loading: catLoading } = useCollection<any>(catQuery);
  const { data: exams } = useCollection<any>(useMemo(() => (db ? collection(db, "exams") : null), [db]));

  const categories = useMemo(() => {
    if (!rawCategories) return [];
    return rawCategories.filter(c => AUTHORIZED_CATEGORY_IDS.includes(c.id));
  }, [rawCategories]);

  if (authLoading || !user) return <div className="h-screen w-full flex items-center justify-center bg-white"><Zap className="h-10 w-10 text-primary animate-pulse" /></div>;

  return (
    <div className="flex flex-col min-h-screen bg-slate-50/50 font-body text-left">
      <Navbar />
      <main className="container mx-auto px-4 py-12 max-w-7xl">
        <div className="text-left mb-12 space-y-3">
          <div className="flex items-center gap-3">
             <div className="h-8 w-8 bg-primary/10 rounded-xl flex items-center justify-center text-primary shadow-inner"><Landmark className="h-4 w-4" /></div>
             <span className="text-[10px] font-black text-slate-400 tracking-widest uppercase">Exam Selection</span>
          </div>
          <h1 className="text-3xl md:text-6xl font-black text-[#0F172A] leading-tight">Choose Your Exam</h1>
          <p className="text-slate-600 font-medium text-sm md:text-lg max-w-2xl">Select an official category to explore verified exams and boards.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
           {catLoading ? (
             Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-64 w-full rounded-[2rem]" />)
           ) : categories.map((cat) => (
             <Link key={cat.id} href={`/exams/category/${cat.id}`}>
                <Card className="border-none shadow-xl hover:shadow-4xl transition-all duration-500 rounded-[2rem] bg-white group overflow-hidden h-full flex flex-col p-6">
                   <div className="flex justify-between items-start mb-6">
                      <div className="h-12 w-12 rounded-xl bg-slate-50 flex items-center justify-center text-primary shadow-inner">
                         <ShieldCheck className="h-6 w-6" />
                      </div>
                      <Badge className="bg-[#0F172A] text-white border-none text-[8px] font-black uppercase px-3 py-1 rounded-lg">AUTHORIZED</Badge>
                   </div>
                   <h3 className="text-xl font-black text-[#0F172A] group-hover:text-primary transition-colors uppercase leading-tight mb-3">{cat.title}</h3>
                   <p className="text-sm text-slate-600 font-medium leading-relaxed line-clamp-3">{cat.description}</p>
                   <div className="mt-8 pt-6 border-t border-slate-50 flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-xs font-black text-[#0F172A]">{exams?.filter(e => e.categoryId === cat.id).length || 0}</span>
                        <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-1">Exams</span>
                      </div>
                      <Button variant="ghost" className="h-10 px-6 rounded-xl bg-[#0F172A] text-white group-hover:bg-primary transition-all font-bold text-[10px] tracking-widest uppercase border-none shadow-md">View Exams <ChevronRight className="ml-2 h-3.5 w-3.5" /></Button>
                   </div>
                </Card>
             </Link>
           ))}
        </div>
      </main>
      <Footer />
    </div>
  )
}
