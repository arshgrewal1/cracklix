"use client"

import { useMemo, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import { useCollection, useFirestore, useUser } from "@/firebase"
import { collection, query, orderBy } from "firebase/firestore"
import { ShieldCheck, Landmark, ChevronRight, Zap } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"

/**
 * @fileOverview Institutional Master Registry v7.0 (Typography Refined).
 */

const CATEGORY_ICONS: Record<string, any> = {
  "punjab-govt": <img src="https://sssb.punjab.gov.in/wp-content/themes/ssbtheme/images/punjab-gov.svg" className="h-full w-full object-contain p-2" />,
  "punjab-teaching": <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQbNnoge6pNWx1HZYrUJKM58qWk1dDw85xvKPBoG-O4ew&s=10" className="h-full w-full object-contain p-2" />,
  "punjab-technical": <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRo0ZK9JI5KMfg9RoNdIwcsNlpx5IcPBWuKZw&s" className="h-full w-full object-contain p-2" />,
  "banking": <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ7McWqZqOgKy-BakccvR02WQdEQFrwuvmHBG5rYJzuEg&s=10" className="h-full w-full object-contain p-2" />,
  "central-govt": <img src="https://alchetron.com/cdn/government-of-india-973b74d1-e25f-41f2-ba2b-51595702248-resize-750.jpeg" className="h-full w-full object-contain p-2" />
};

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

  const catQuery = useMemo(() => (db ? query(collection(db, "categories"), orderBy("displayOrder", "asc")) : null), [db]);
  const { data: categories, loading } = useCollection<any>(catQuery);

  if (!mounted || authLoading || !user) return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-white">
       <Zap className="h-10 w-10 text-primary animate-pulse" />
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen bg-slate-50/50 font-body text-left">
      <Navbar />
      
      <main className="flex-1">
        {/* HERO SECTION */}
        <section className="bg-white border-b border-slate-100 py-16 md:py-24 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 items-center gap-12 lg:gap-16">
              
              <div className="flex flex-col items-center lg:items-start text-center lg:text-left space-y-6 md:space-y-8">
                <div className="space-y-4">
                  <div className="flex flex-col items-center lg:items-start gap-4">
                    <div className="h-12 w-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary shadow-inner">
                      <Landmark className="h-6 w-6" />
                    </div>
                    <p className="text-xs md:text-sm font-bold tracking-[0.3em] uppercase text-slate-400">
                      Official Exam Registry
                    </p>
                  </div>
                  
                  <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black tracking-tight text-[#0F172A] leading-[0.9] antialiased">
                    Master <br/>
                    <span className="text-primary">Registry</span>
                  </h1>

                  <p className="text-slate-500 font-medium text-base md:text-xl lg:text-2xl max-w-2xl leading-relaxed">
                    Select a recruitment vertical to browse official hubs and exam preparation resources.
                  </p>
                </div>
              </div>

              <div className="relative hidden lg:flex justify-end">
                <div className="relative h-[300px] md:h-[400px] w-full max-w-[500px]">
                  <Image 
                    src="/images/hero-student.png" 
                    alt="Registry Hub" 
                    fill 
                    priority
                    className="object-contain drop-shadow-2xl"
                    sizes="(max-width: 1024px) 100vw, 500px"
                  />
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* CONTENT AREA */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 max-w-7xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
             {loading ? (
               Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-80 w-full rounded-[3.5rem]" />)
             ) : categories && categories.length > 0 ? (
               categories.map((cat) => (
                  <Link key={cat.id} href={`/exams/category/${cat.id}`}>
                     <Card className="border-none shadow-xl hover:shadow-5xl hover:translate-y-[-12px] transition-all duration-700 rounded-[3.5rem] bg-white group overflow-hidden h-full flex flex-col border border-slate-100">
                        <CardContent className="p-10 md:p-14 flex flex-col h-full">
                           <div className="flex justify-between items-start mb-12">
                              <div className={cn("h-20 w-20 md:h-24 md:w-24 rounded-[1.8rem] md:rounded-[2.2rem] flex items-center justify-center transition-all group-hover:shadow-2xl shadow-inner relative overflow-hidden shrink-0 bg-slate-50 text-slate-300")}>
                                 {CATEGORY_ICONS[cat.id] || <ShieldCheck className="h-10 w-10" />}
                              </div>
                              <Badge className="bg-[#0F172A] text-white border-none text-[8px] font-black uppercase tracking-[0.2em] px-4 py-1.5 rounded-xl shadow-lg">
                                 {cat.highlight || "VERTICAL"}
                              </Badge>
                           </div>
                           
                           <div className="space-y-5 flex-1">
                              <h3 className="font-black text-3xl md:text-4xl lg:text-5xl text-[#0F172A] leading-[1.1] tracking-tight group-hover:text-primary transition-colors break-words">
                                 {cat.title}
                              </h3>
                              <p className="text-sm md:text-lg font-medium text-slate-400 leading-relaxed">
                                 {cat.description}
                              </p>
                           </div>

                           <div className="mt-12 pt-8 border-t border-slate-50">
                              <Button variant="ghost" className="w-full h-12 md:h-14 rounded-2xl bg-[#0F172A] text-white group-hover:bg-primary transition-all shadow-xl font-bold text-sm tracking-tight gap-3 border-none">
                                 OPEN CATEGORY HUB <ChevronRight className="h-4 w-4" />
                              </Button>
                           </div>
                        </CardContent>
                     </Card>
                  </Link>
               ))
             ) : (
               <div className="col-span-full py-20 text-center opacity-20 italic font-black uppercase tracking-widest text-sm">No categories deployed. Run admin sync.</div>
             )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
