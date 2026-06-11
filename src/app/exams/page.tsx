"use client"

import { useMemo } from "react"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import { useCollection, useFirestore } from "@/firebase"
import { collection, query, orderBy } from "firebase/firestore"
import { ShieldCheck, GraduationCap, Zap, Wallet, Globe, ChevronRight, Landmark } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"

/**
 * @fileOverview Institutional Master Registry Landing v2.7.
 * UPDATED: Locked permanent logo for Central Govt category.
 */

const CATEGORY_ICONS: Record<string, any> = {
  "punjab-govt": <img src="https://static.pseb.ac.in/psebwebsite/front_assets/sites/default/files/inline-images/emblem.png" className="h-full w-full object-contain p-2" />,
  "punjab-teaching": <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQbNnoge6pNWx1HZYrUJKM58qWk1dDw85xvKPBoG-O4ew&s=10" className="h-full w-full object-contain p-2" />,
  "punjab-technical": <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRo0ZK9JI5KMfg9RoNdIwcsNlpx5IcPBWuKZw&s" className="h-full w-full object-contain p-2" />,
  "banking": <img src="https://3.imimg.com/data3/KV/NL/MY-14548641/bank-exams.png" className="h-full w-full object-contain p-2" />,
  "central-govt": <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRmRNHVIV2W9Pn_87u6EQmluADidwUQWhOotUwQUV_VWtEBWqoxjf-OBEt4&s=10" className="h-full w-full object-contain p-2" />
};

export default function ExamsEntryPage() {
  const db = useFirestore();
  
  const catQuery = useMemo(() => (db ? query(collection(db, "categories"), orderBy("displayOrder", "asc")) : null), [db]);
  const boardsQuery = useMemo(() => (db ? collection(db, "boards") : null), [db]);

  const { data: categories, loading: catLoading } = useCollection<any>(catQuery);
  const { data: boards, loading: boardsLoading } = useCollection<any>(boardsQuery);

  const loading = catLoading || boardsLoading;

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
            Select a recruitment vertical to browse official hubs and vertical exam preparation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
           {loading ? (
             Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-80 w-full rounded-[3.5rem]" />)
           ) : categories && categories.length > 0 ? (
             categories.map((cat) => {
                const hubCount = (boards || []).filter((b: any) => b.categoryId === cat.id).length;
                return (
                  <Link key={cat.id} href={`/exams/category/${cat.id}`}>
                     <Card className="border-none shadow-xl hover:shadow-5xl hover:translate-y-[-12px] transition-all duration-700 rounded-[3.5rem] bg-white group overflow-hidden h-full flex flex-col border border-slate-100">
                        <CardContent className="p-10 md:p-14 flex flex-col h-full">
                           <div className="flex justify-between items-start mb-12">
                              <div className={cn("h-20 w-20 md:h-24 md:w-24 rounded-[1.8rem] md:rounded-[2.2rem] flex items-center justify-center transition-all group-hover:shadow-2xl shadow-inner relative overflow-hidden shrink-0 bg-slate-50 text-slate-300")}>
                                 {CATEGORY_ICONS[cat.id] || <ShieldCheck className="h-10 w-10" />}
                              </div>
                              <Badge className="bg-[#0F172A] text-white border-none text-[8px] font-black uppercase tracking-[0.2em] px-4 py-1.5 rounded-xl shadow-lg">
                                 {hubCount} HUBS LIVE
                              </Badge>
                           </div>
                           
                           <div className="space-y-5 flex-1">
                              <h3 className="font-headline text-3xl md:text-4xl font-black text-[#0F172A] uppercase leading-[0.95] group-hover:text-primary transition-colors">
                                 {cat.title}
                              </h3>
                              <p className="text-sm md:text-lg font-medium text-slate-400 leading-relaxed">
                                 {cat.description}
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
             })
           ) : (
             <div className="col-span-full py-20 text-center opacity-20 italic">No categories deployed. Run admin sync.</div>
           )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
