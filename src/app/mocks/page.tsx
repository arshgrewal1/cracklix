"use client"

import { useMemo, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import { useCollection, useFirestore, useUser } from "@/firebase"
import { collection, query, orderBy } from "firebase/firestore"
import { Landmark, ChevronRight, Zap, BookOpen, Layers } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"
import { AuthorityLogo } from "@/lib/exam-icons"

/**
 * @fileOverview High-Density Exam Hub v18.0 (Branded).
 * UPDATED: Integrated branded Mock Test logo into header.
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
  const { data: pyqs } = useCollection<any>(useMemo(() => (db ? collection(db, "pyqs") : null), [db]));

  const categories = useMemo(() => {
    if (!rawCategories) return [];
    return rawCategories.filter(c => AUTHORIZED_CATEGORY_IDS.includes(c.id));
  }, [rawCategories]);

  if (!mounted || authLoading || !user) return <div className="h-screen w-full flex flex-col items-center justify-center bg-white"><Zap className="h-8 w-8 text-primary animate-pulse" /></div>;

  return (
    <div className="flex flex-col min-h-screen bg-slate-50/50 font-body text-left">
      <Navbar />
      <main className="flex-1">
        <section className="bg-white border-b border-slate-100 py-6 md:py-16">
          <div className="container mx-auto px-4 max-w-7xl">
            <div className="space-y-1.5 md:space-y-4 px-1">
               <div className="flex items-center gap-2">
                 <AuthorityLogo boardId="mock-test" size="sm" className="bg-transparent shadow-none p-0" />
                 <span className="text-[9px] md:text-xs font-black text-slate-400 tracking-widest uppercase">Exam Hub</span>
               </div>
               <h1 className="text-2xl md:text-6xl font-black text-[#0F172A] leading-tight tracking-tight uppercase">Exam Hub</h1>
               <p className="text-slate-500 font-medium text-[11px] md:text-xl max-w-2xl leading-tight">Verified authority boards and mock tests.</p>
            </div>
          </div>
        </section>

        <section className="container mx-auto px-3 md:px-6 py-6 md:py-16 max-w-7xl">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-8">
             {catLoading ? (
               Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-40 md:h-80 w-full rounded-xl bg-white" />)
             ) : categories.map((cat) => {
                const catExams = exams?.filter(e => e.categoryId === cat.id) || [];
                const catExamIds = catExams.map(e => e.id);
                const catMocksCount = mocks?.filter(m => {
                  const eids = m.examIds || (m.examId ? [m.examId] : []);
                  return eids.some((id: string) => catExamIds.includes(id));
                }).length || 0;

                return (
                  <Link key={cat.id} href={`/exams/category/${cat.id}`}>
                     <Card className="border border-[#E5E7EB] shadow-sm hover:shadow-xl transition-all duration-500 rounded-xl md:rounded-[2.5rem] bg-white flex flex-col h-full border border-slate-100 p-3 md:p-8">
                        <div className="flex justify-between items-start mb-4 md:mb-8">
                           <AuthorityLogo category={cat} size="sm" className="md:w-16 md:h-16 bg-slate-50 rounded-lg md:rounded-2xl group-hover:scale-105 transition-transform shadow-inner" />
                           <Badge className="bg-[#0F172A] text-white border-none text-[6px] md:text-[8px] font-black uppercase px-2 py-0.5 rounded shadow-sm">BOARD</Badge>
                        </div>
                        <h3 className="text-[12px] md:text-[24px] font-black leading-tight tracking-tight text-[#0F172A] group-hover:text-primary transition-colors flex-1 mb-2 md:mb-4">{cat.title}</h3>
                        
                        <div className="space-y-1 md:space-y-2 mt-auto">
                           <MetricBlock label="Exams" val={catExams.length} icon={BookOpen} />
                           {catMocksCount > 0 && <MetricBlock label="Tests" val={catMocksCount} icon={Zap} />}
                        </div>

                        <div className="mt-4 md:mt-10 pt-3 border-t border-slate-50">
                           <Button variant="ghost" className="w-full h-8 md:h-12 rounded-lg md:rounded-xl bg-[#0F172A] text-white group-hover:bg-primary transition-all shadow-md font-black text-[8px] md:text-xs tracking-widest uppercase border-none gap-2">
                              Explore <ChevronRight className="h-3 w-3" />
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
      <div className="flex items-center gap-1.5 text-slate-500 font-bold text-[8px] md:text-xs uppercase">
         <Icon className="h-3 w-3 text-primary/50" />
         <span className="text-[#0F172A] font-black tabular-nums">{val}</span>
         <span className="text-[7px] tracking-tight">{label}</span>
      </div>
   )
}
