"use client"

import { useMemo, useEffect } from "react"
import { useRouter } from "next/navigation"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import { useCollection, useFirestore, useUser } from "@/firebase"
import { collection, query, orderBy } from "firebase/firestore"
import { ShieldCheck, GraduationCap, Zap, Wallet, Globe, ChevronRight, Landmark } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"

/**
 * @fileOverview Institutional Exam List Landing v7.0 (Restored Punjab Icon).
 */

const CATEGORY_ICONS: Record<string, any> = {
  "punjab-govt": <img src="https://sssb.punjab.gov.in/wp-content/themes/ssbtheme/images/punjab-gov.svg" className="h-full w-full object-contain p-2" />,
  "punjab-teaching": <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQbNnoge6pNWx1HZYrUJKM58qWk1dDw85xvKPBoG-O4ew&s=10" className="h-full w-full object-contain p-2" />,
  "punjab-technical": <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRo0ZK9JI5KMfg9RoNdIwcsNlpx5IcPBWuKZw&s" className="h-full w-full object-contain p-2" />,
  "banking": <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ7McWqZqOgKy-BakccvR02WQdEQFrwuvmHBG5rYJzuEg&s=10" className="h-full w-full object-contain p-2" />,
  "central-govt": <img src="https://upload.wikimedia.org/wikipedia/commons/b/bc/Emblem_of_India.svg" className="h-full w-full object-contain p-2" />
};

export default function ExamsEntryPage() {
  const db = useFirestore();
  const router = useRouter();
  const { user, loading: authLoading } = useUser();
  
  useEffect(() => {
    if (!authLoading && !user) {
      router.push(`/login?returnUrl=${encodeURIComponent('/exams')}`);
    }
  }, [user, authLoading, router]);

  const catQuery = useMemo(() => (db ? query(collection(db, "categories"), orderBy("displayOrder", "asc")) : null), [db]);
  const boardsQuery = useMemo(() => (db ? collection(db, "boards") : null), [db]);

  const { data: categories, loading: catLoading } = useCollection<any>(catQuery);
  const { data: boards, loading: boardsLoading } = useCollection<any>(boardsQuery);

  const loading = catLoading || boardsLoading || authLoading;

  if (authLoading || !user) return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-white">
       <Zap className="h-10 w-10 text-primary animate-pulse" />
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen bg-slate-50/50 font-body text-left">
      <Navbar />
      
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16 lg:py-24 max-w-7xl">
        <div className="text-left mb-10 md:mb-16 lg:mb-24 space-y-4 md:space-y-6">
          <div className="flex items-center gap-4">
             <div className="h-10 w-10 md:h-12 md:w-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary shadow-inner">
                <Landmark className="h-5 w-5 md:h-6 md:w-6" />
             </div>
             <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.4em] text-slate-500">Official Exam List</span>
          </div>
          <h1 className="text-3xl xs:text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black text-[#0F172A] uppercase tracking-tighter leading-[0.95] break-words antialiased">
            Exam <br/> <span className="text-primary">List</span>
          </h1>
          <p className="text-slate-500 font-medium text-sm md:text-lg lg:text-2xl max-w-3xl leading-relaxed">
            Select a recruitment vertical to browse official centers and specific exam preparation nodes.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 lg:gap-10">
           {loading ? (
             Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-80 w-full rounded-[3.5rem]" />)
           ) : categories && categories.length > 0 ? (
             categories.map((cat) => {
                const hubCount = (boards || []).filter((b: any) => b.categoryId === cat.id).length;
                return (
                  <Link key={cat.id} href={`/exams/category/${cat.id}`}>
                     <Card className="border-none shadow-xl hover:shadow-5xl hover:translate-y-[-12px] transition-all duration-700 rounded-[2.5rem] md:rounded-[3.5rem] bg-white group overflow-hidden h-full flex flex-col border border-slate-100">
                        <CardContent className="p-8 md:p-10 lg:p-14 flex flex-col h-full">
                           <div className="flex justify-between items-start mb-8 md:mb-12">
                              <div className={cn("h-16 w-16 md:h-20 md:w-20 lg:h-24 lg:w-24 rounded-2xl md:rounded-[2.2rem] flex items-center justify-center transition-all group-hover:shadow-2xl shadow-inner relative overflow-hidden shrink-0 bg-slate-50 text-slate-300")}>
                                 {CATEGORY_ICONS[cat.id] || <ShieldCheck className="h-8 w-8 md:h-10 md:w-10" />}
                              </div>
                              <Badge className="bg-[#0F172A] text-white border-none text-[8px] md:text-[9px] font-black uppercase tracking-[0.2em] px-3 py-1 md:px-4 md:py-1.5 rounded-xl shadow-lg">
                                 {hubCount} EXAMS LIVE
                              </Badge>
                           </div>
                           
                           <div className="space-y-3 md:space-y-5 flex-1">
                              <h3 className="font-headline text-2xl md:text-3xl lg:text-4xl font-black text-[#0F172A] uppercase leading-[0.95] group-hover:text-primary transition-colors">
                                 {cat.title}
                              </h3>
                              <p className="text-xs md:text-base lg:text-lg font-medium text-slate-400 leading-relaxed">
                                 {cat.description}
                              </p>
                           </div>

                           <div className="mt-8 md:mt-12 pt-6 md:pt-8 border-t border-slate-50">
                              <Button variant="ghost" className="w-full h-12 md:h-14 rounded-xl md:rounded-2xl bg-[#0F172A] text-white group-hover:bg-primary transition-all shadow-xl font-black uppercase text-[8px] md:text-[9px] tracking-[0.2em] gap-3 border-none">
                                 OPEN EXAM CENTER <ChevronRight className="h-4 w-4" />
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
