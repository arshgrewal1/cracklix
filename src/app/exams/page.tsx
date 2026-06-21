"use client"

import { useMemo, useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import { useCollection, useFirestore, useUser } from "@/firebase"
import { collection, query, orderBy } from "firebase/firestore"
import { Landmark, ChevronRight, Zap, BookOpen, Layers } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"
import { AuthorityLogo } from "@/lib/exam-icons"

/**
 * @fileOverview High-Density Category Explorer v25.0.
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
  const pathname = usePathname();
  const { user, loading: authLoading } = useUser();
  
  useEffect(() => {
    if (!authLoading && !user) {
      router.push(`/login?returnUrl=${encodeURIComponent(pathname)}`);
    }
  }, [user, authLoading, router, pathname]);

  const { data: rawCategories, loading: catLoading } = useCollection<any>(useMemo(() => (db ? query(collection(db, "categories"), orderBy("displayOrder", "asc")) : null), [db]));
  const { data: exams } = useCollection<any>(useMemo(() => (db ? collection(db, "exams") : null), [db]));
  const { data: mocks } = useCollection<any>(useMemo(() => (db ? collection(db, "mocks") : null), [db]));
  const { data: pyqs } = useCollection<any>(useMemo(() => (db ? collection(db, "pyqs") : null), [db]));

  const categories = useMemo(() => {
    if (!rawCategories) return [];
    return rawCategories.filter(c => AUTHORIZED_CATEGORY_IDS.includes(c.id));
  }, [rawCategories]);

  if (authLoading || !user) return <div className="h-screen w-full flex flex-col items-center justify-center bg-white space-y-4"><Zap className="h-10 w-10 text-primary animate-pulse" /></div>;

  return (
    <div className="flex flex-col min-h-screen bg-slate-50/50 font-body text-left">
      <Navbar />
      <main className="container mx-auto px-3 md:px-6 py-6 md:py-12 max-w-7xl">
        <div className="text-left mb-6 md:mb-12 space-y-1 md:space-y-3 px-1">
          <div className="flex items-center gap-2">
             <div className="h-7 w-7 bg-primary/10 rounded-lg flex items-center justify-center text-primary shadow-inner"><Landmark className="h-4 w-4" /></div>
             <span className="text-[9px] font-black text-slate-400 tracking-[0.2em] uppercase">Recruitment Boards</span>
          </div>
          <h1 className="text-2xl md:text-6xl font-black text-[#0F172A] leading-tight tracking-tight uppercase">Choose Category</h1>
          <p className="text-slate-500 font-medium text-[11px] md:text-lg max-w-2xl">Select a vertical to browse verified exams and tests.</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-8">
           {catLoading ? (
             Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-40 md:h-80 w-full rounded-2xl bg-white" />)
           ) : categories.map((cat) => {
              const catExams = exams?.filter(e => e.categoryId === cat.id) || [];
              const catExamIds = catExams.map(e => e.id);
              const catMocksCount = mocks?.filter(m => catExamIds.includes(m.examId) || (m.examIds && m.examIds.some(id => catExamIds.includes(id)))).length || 0;
              
              return (
                <Link key={cat.id} href={`/exams/category/${cat.id}`}>
                    <Card className="border border-[#E5E7EB] shadow-sm hover:shadow-xl transition-all duration-500 rounded-xl md:rounded-[2.5rem] bg-white group overflow-hidden h-full flex flex-col p-3 md:p-8">
                       <div className="flex justify-between items-start mb-4 md:mb-8">
                          <AuthorityLogo category={cat} size="sm" className="md:w-16 md:h-16 bg-slate-50 rounded-lg md:rounded-2xl shadow-inner group-hover:scale-105 transition-transform" />
                          <Badge className="bg-[#0F172A] text-white border-none text-[6px] md:text-[8px] font-black uppercase px-1.5 py-0.5 rounded shadow-sm">VERIFIED</Badge>
                       </div>
                       <h3 className="text-[12px] md:text-[24px] font-black text-[#0F172A] group-hover:text-primary transition-colors leading-tight mb-2 md:mb-4">{cat.title}</h3>
                       
                       <div className="space-y-1 md:space-y-2 mt-auto flex-1">
                          <MiniStat label="Exams" count={catExams.length} icon={BookOpen} />
                          {catMocksCount > 0 && <MiniStat label="Tests" count={catMocksCount} icon={Zap} />}
                       </div>

                       <div className="mt-4 md:mt-10 pt-3 border-t border-slate-50">
                          <Button variant="ghost" className="w-full h-8 md:h-12 rounded-lg md:rounded-xl bg-[#0F172A] text-white group-hover:bg-primary transition-all font-black text-[8px] md:text-[10px] tracking-widest uppercase border-none shadow-md gap-2">
                             Open <ChevronRight className="h-3 w-3" />
                          </Button>
                       </div>
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

function MiniStat({ label, count, icon: Icon }: any) {
   return (
      <div className="flex items-center gap-2 text-slate-500 font-bold text-[8px] md:text-xs uppercase">
         <Icon className="h-3 w-3 md:h-3.5 md:w-3.5 text-primary/50" />
         <span className="text-[#0F172A] font-black tabular-nums">{count}</span>
         <span className="text-[7px] md:text-[9px] tracking-tight">{label}</span>
      </div>
   )
}