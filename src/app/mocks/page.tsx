"use client"

import { useMemo, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import { useCollection, useFirestore, useUser } from "@/firebase"
import { collection, query, orderBy } from "firebase/firestore"
import { ChevronRight, Zap, BookOpen, Layers } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Skeleton } from "@/components/ui/skeleton"
import { AuthorityLogo } from "@/lib/exam-icons"

/**
 * @fileOverview High-Density Exam Hub v19.0.
 * UPDATED: Normalized typography - removed uppercase and reduced header scale.
 */

const AUTHORIZED_CATEGORY_IDS = [
  "punjab-government-exams",
  "punjab-teaching-exams",
  "punjab-technical-exams",
  "banking-exams",
  "judiciary-exams",
  "central-government-exams"
];

export default function MocksDiscoveryPage() {
  const db = useFirestore();
  const router = useRouter();
  const { user, loading: authLoading } = useUser();
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
    if (!authLoading && !user) {
      router.push(`/login?returnUrl=${encodeURIComponent('/mocks')}`);
    }
  }, [user, authLoading, router]);

  const { data: rawCategories, loading: catLoading } = useCollection<any>(useMemo(() => (db ? query(collection(db, "categories"), orderBy("displayOrder", "asc")) : null), [db]));
  const { data: exams } = useCollection<any>(useMemo(() => (db ? collection(db, "exams") : null), [db]));
  const { data: mocks } = useCollection<any>(useMemo(() => (db ? collection(db, "mocks") : null), [db]));

  const categories = useMemo(() => {
    if (!rawCategories) return [];
    return rawCategories.filter(c => AUTHORIZED_CATEGORY_IDS.includes(c.id));
  }, [rawCategories]);

  if (!mounted || authLoading || !user) return <div className="h-screen w-full flex flex-col items-center justify-center bg-white"><Zap className="h-8 w-8 text-primary animate-pulse" /></div>;

  return (
    <div className="flex flex-col min-h-screen bg-slate-50/50 font-body text-left">
      <Navbar />
      <main className="flex-1">
        <section className="bg-white border-b border-slate-100 py-10 md:py-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-[1440px]">
            <div className="space-y-4">
               <div className="flex items-center gap-2">
                 <AuthorityLogo boardId="mock-test" size="sm" className="bg-transparent shadow-none p-0" />
                 <span className="text-[10px] md:text-sm font-black text-slate-400 tracking-wider">Verified Hub</span>
               </div>
               <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-[#0F172A] leading-tight tracking-tight">Exam Hub</h1>
               <p className="text-slate-500 font-medium text-sm md:text-2xl max-w-3xl leading-tight">Access verified authority boards and premium mock tests for all state exams.</p>
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-24 max-w-[1440px]">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8 lg:gap-10">
             {catLoading ? (
               Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-64 md:h-96 w-full rounded-[2rem] bg-white" />)
             ) : categories.map((cat) => {
                const catExams = exams?.filter(e => e.categoryId === cat.id) || [];
                const catExamIds = catExams.map(e => e.id);
                const catMocksCount = mocks?.filter(m => {
                  const eids = m.examIds || (m.examId ? [m.examId] : []);
                  return eids.some((id: string) => catExamIds.includes(id));
                }).length || 0;

                return (
                  <Link key={cat.id} href={`/exams/category/${cat.id}`}>
                     <Card className="border border-[#E5E7EB] shadow-sm hover:shadow-2xl transition-all duration-500 rounded-[2rem] md:rounded-[3rem] bg-white flex flex-col h-full border border-slate-100 p-5 md:p-10 group">
                        <div className="flex justify-between items-start mb-6 md:mb-12">
                           <AuthorityLogo category={cat} size="sm" className="w-12 h-12 md:w-20 md:h-20 bg-slate-50 rounded-xl md:rounded-[2rem] group-hover:scale-105 transition-transform shadow-inner" />
                           <Badge className="bg-[#0F172A] text-white border-none text-[7px] md:text-[10px] font-black px-2 py-0.5 rounded shadow-sm">Verified</Badge>
                        </div>
                        <h3 className="text-sm md:text-xl xl:text-2xl font-black leading-tight tracking-tight text-[#0F172A] group-hover:text-primary transition-colors flex-1 mb-4 md:mb-8">{cat.title}</h3>
                        
                        <div className="space-y-2 md:space-y-4 mt-auto">
                           <MetricBlock label="Active Verticals" val={catExams.length} icon={BookOpen} />
                           {catMocksCount > 0 && <MetricBlock label="Practice Series" val={catMocksCount} icon={Zap} />}
                        </div>

                        <div className="mt-8 md:mt-16 pt-4 border-t border-slate-50">
                           <Button variant="ghost" className="w-full h-10 md:h-14 rounded-xl md:rounded-2xl bg-[#0F172A] text-white group-hover:bg-primary transition-all shadow-md font-black text-[9px] md:text-[11px] tracking-tight border-none gap-3">
                              Explore Hub <ChevronRight className="h-4 w-4" />
                           </Button>
                        </div>
                     </Card>
                  </Link>
                )
             })}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}

function MetricBlock({ label, val, icon: Icon }: any) {
   return (
      <div className="flex items-center gap-2.5 text-slate-500 font-bold text-[9px] md:text-[13px] uppercase">
         <Icon className="h-4 w-4 md:h-5 md:w-5 text-primary/50" />
         <span className="text-[#0F172A] font-black tabular-nums">{count}</span>
         <span className="text-[8px] md:text-[11px] tracking-tight">{label}</span>
      </div>
   )
}
