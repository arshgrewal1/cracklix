"use client"

import { useMemo } from "react"
import { useParams, useRouter } from "next/navigation"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import { useCollection, useFirestore } from "@/firebase"
import { collection, query, where } from "firebase/firestore"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Zap, Info, Landmark, GraduationCap, Building2, Globe, ShieldCheck, HeartPulse } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

/**
 * @fileOverview Hierarchical Category Hub v46.0.
 * FLOW: Category -> Board Selection Hub.
 */

const CATEGORY_ICONS: Record<string, any> = {
  "punjab-government-exams": <Landmark className="h-8 w-8" />,
  "punjab-teaching-exams": <GraduationCap className="h-8 w-8" />,
  "punjab-banking-exams": <Building2 className="h-8 w-8" />,
  "punjab-technical-exams": <Zap className="h-8 w-8" />,
  "central-government-exams": <Globe className="h-8 w-8" />,
  "punjab-health-exams": <HeartPulse className="h-8 w-8" />
};

export default function CategoryHubsPage() {
  const params = useParams();
  const router = useRouter();
  const db = useFirestore();
  const catId = params.id as string;

  const { data: categories } = useCollection<any>(useMemo(() => (db ? collection(db, "categories") : null), [db]));
  const category = categories?.find(c => c.id === catId);

  const boardsQuery = useMemo(() => (db ? query(collection(db, "boards"), where("categoryId", "==", catId)) : null), [db, catId]);
  const { data: boards, loading: boardsLoading } = useCollection<any>(boardsQuery);

  return (
    <div className="min-h-screen bg-slate-50/50 font-body text-left">
      <Navbar />
      
      <section className="bg-white border-b border-slate-100 py-12 md:py-20 relative overflow-hidden">
         <div className="container mx-auto px-4 max-w-7xl relative z-10">
            <button onClick={() => router.back()} className="h-10 w-10 rounded-xl border border-slate-100 flex items-center justify-center text-slate-400 hover:text-black mb-8 transition-all">
               <ChevronLeft className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-6">
               <div className="h-16 w-16 md:h-20 md:w-20 rounded-[2rem] bg-primary/5 text-primary flex items-center justify-center shrink-0 shadow-inner">
                  {CATEGORY_ICONS[category?.id || ""] || <Landmark className="h-8 w-8" />}
               </div>
               <div className="space-y-1">
                  <h1 className="text-3xl md:text-5xl font-black text-[#0F172A] leading-tight tracking-tight">
                     {category?.title || "Exam Category"}
                  </h1>
                  <p className="text-sm md:text-xl font-bold text-slate-400 tracking-tight max-w-3xl">
                     {category?.description || "Select a recruitment board to view official exams."}
                  </p>
               </div>
            </div>
         </div>
      </section>

      <main className="container mx-auto px-4 py-16 max-w-7xl">
         {boardsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
               {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-72 w-full rounded-[2.5rem]" />)}
            </div>
         ) : boards && boards.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
               {boards.map((board) => (
                  <Card key={board.id} onClick={() => router.push(`/exams/hub/${board.id}`)} className="border border-[#E5E7EB] shadow-sm hover:shadow-xl transition-all duration-500 rounded-[2.5rem] bg-white group overflow-hidden flex flex-col p-10 text-left cursor-pointer h-full">
                     <div className="h-14 w-14 rounded-2xl bg-slate-50 flex items-center justify-center mb-8 text-primary shadow-inner transition-transform group-hover:scale-110">
                        <Landmark className="h-8 w-8" />
                     </div>
                     <h3 className="text-2xl font-black text-[#0F172A] group-hover:text-primary transition-colors leading-tight mb-4">{board.abbreviation} Hub</h3>
                     <p className="text-sm text-slate-500 font-medium mb-10 flex-1 leading-relaxed">{board.name}</p>
                     <div className="mt-auto pt-8 border-t border-slate-50 flex items-center justify-between">
                        <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Board Authority</span>
                        <Button variant="ghost" className="h-11 px-8 rounded-xl bg-[#0F172A] text-white group-hover:bg-primary transition-all font-bold text-[11px] tracking-widest uppercase border-none shadow-md gap-2">
                           Open Hub <ChevronRight className="h-4 w-4" />
                        </Button>
                     </div>
                  </Card>
               ))}
            </div>
         ) : (
            <div className="py-40 text-center opacity-20 flex flex-col items-center gap-6">
               <Info className="h-16 w-16" />
               <p className="font-black text-2xl uppercase tracking-widest">Awaiting Content</p>
               <p className="text-sm font-bold max-w-xs">Official boards are being mapped to this category node.</p>
            </div>
         )}
      </main>
      <Footer />
    </div>
  )
}
