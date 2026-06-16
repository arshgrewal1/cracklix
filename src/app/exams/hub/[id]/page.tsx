'use client';

import { useMemo, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import { useDoc, useCollection, useFirestore } from "@/firebase"
import { collection, query, where, doc } from "firebase/firestore"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, GraduationCap, Zap, BookOpen, Layers, Shield, Loader2, FileText, Landmark, ShieldCheck } from "lucide-react"
import Link from "next/link"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

/**
 * @fileOverview Institutional Hub Explorer v10.0 (Fully Responsive).
 * FIXED: Oversized typography and logos on mobile.
 */

export default function HubExamsPage() {
  const params = useParams();
  const router = useRouter();
  const db = useFirestore();
  const hubId = params.id as string;
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

  const { data: hub, loading: hubLoading } = useDoc<any>(useMemo(() => (db ? doc(db, "boards", hubId) : null), [db, hubId]));
  
  const examsQuery = useMemo(() => {
     if (!db || !hub) return null;
     return query(collection(db, "exams"), where("boardId", "in", [hub.id, hub.abbreviation]));
  }, [db, hub]);

  const { data: exams, loading: examsLoading } = useCollection<any>(examsQuery);
  const { data: categories } = useCollection<any>(useMemo(() => (db ? collection(db, "categories") : null), [db]));
  const { data: mocks } = useCollection<any>(useMemo(() => (db ? collection(db, "mocks") : null), [db]));

  const statsMap = useMemo(() => {
    if (!mocks) return {};
    const map: Record<string, any> = {};
    mocks.forEach(m => {
      const eids = m.examIds || (m.examId ? [m.examId] : []);
      eids.forEach((eid: string) => {
        if (!map[eid]) map[eid] = { full: 0, subject: 0, pyq: 0, sectional: 0 };
        const type = m.mockType;
        if (type === 'FULL') map[eid].full++;
        else if (type === 'SUBJECT') map[eid].subject++;
        else if (type === 'PYQ') map[eid].pyq++;
        else if (type === 'SECTIONAL') map[eid].sectional++;
      });
    });
    return map;
  }, [mocks]);

  if (hubLoading) return <div className="h-screen bg-white flex items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>;

  return (
    <div className="min-h-screen bg-slate-50/50 font-body text-left">
      <Navbar />
      
      <section className="bg-white border-b border-slate-100 py-10 md:py-16 lg:py-20 overflow-hidden relative">
         <div className="absolute top-0 right-0 p-12 opacity-[0.03]"><GraduationCap className="h-32 w-32 md:h-64 md:w-64" /></div>
         <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl relative z-10">
            <button onClick={() => router.back()} className="h-10 w-10 rounded-full border border-slate-100 flex items-center justify-center text-slate-400 hover:text-black mb-6 md:mb-10 transition-all active:scale-90">
               <ChevronLeft className="h-5 w-5" />
            </button>
            
            <div className="flex flex-col lg:flex-row items-center lg:items-start gap-6 md:gap-10">
               <div className="h-20 w-20 sm:h-28 sm:w-28 md:h-32 md:w-32 rounded-2xl md:rounded-[2.5rem] bg-slate-50 border-2 md:border-4 border-white shadow-xl flex items-center justify-center overflow-hidden shrink-0">
                  {hub?.iconUrl && !failedImages['hub'] ? (
                    <img src={hub.iconUrl} className="h-full w-full object-contain p-3 md:p-4" alt="Logo" referrerPolicy="no-referrer" onError={() => setFailedImages(p => ({...p, 'hub': true}))} />
                  ) : (
                    <div className="text-primary opacity-40">{hub?.categoryId === 'punjab-govt' ? (hub.id.toLowerCase().includes('police') ? <ShieldCheck className="h-10 w-10 md:h-16 md:w-16" /> : <Landmark className="h-10 w-10 md:h-16 md:w-16" />) : <Landmark className="h-10 w-10 md:h-16 md:w-16" />}</div>
                  )}
               </div>
               
               <div className="space-y-3 md:space-y-4 text-center lg:text-left min-w-0">
                  <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3">
                     <Badge className="bg-primary text-white border-none font-black px-4 py-1 rounded-xl text-[9px] tracking-widest uppercase">
                       {hub?.abbreviation} EXAMS
                     </Badge>
                     <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">OFFICIAL VERTICALS</span>
                  </div>
                  <h1 className="text-3xl xs:text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-[#0F172A] uppercase leading-[0.95] tracking-tight max-w-4xl break-words antialiased">
                    {hub?.name}
                  </h1>
               </div>
            </div>
         </div>
      </section>

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-16 max-w-7xl">
         {examsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-[240px] w-full rounded-[2rem]" />)}
            </div>
         ) : exams && exams.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
               {exams.map((exam) => {
                  const stats = statsMap[exam.id] || { full: 0, subject: 0, pyq: 0, sectional: 0 };
                  const category = categories?.find((c: any) => c.id === exam.categoryId);
                  const effectiveLogo = exam.iconUrl || hub?.iconUrl || category?.iconUrl;

                  return (
                    <Link key={exam.id} href={`/exams/${exam.id}`}>
                       <Card className="border border-[#E5E7EB] shadow-sm hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] hover:translate-y-[-4px] transition-all duration-500 rounded-[2rem] bg-white group overflow-hidden h-full flex flex-col p-6 md:p-10 text-left">
                          <div className="flex justify-between items-start mb-6 md:mb-8">
                             <div className="h-14 w-14 md:h-18 md:w-18 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 shadow-inner">
                                {effectiveLogo && !failedImages[exam.id] ? (
                                   <img src={effectiveLogo} className="h-full w-full object-contain p-2" alt="Logo" referrerPolicy="no-referrer" onError={() => setFailedImages(p => ({ ...p, [exam.id]: true }))} />
                                ) : (
                                  <Landmark className="h-6 w-6 md:h-10 md:w-10 text-primary opacity-20" />
                                )}
                             </div>
                             <Badge variant="outline" className="text-[9px] font-black uppercase tracking-widest border-slate-100 text-slate-400">{hub?.abbreviation} EXAM</Badge>
                          </div>

                          <div className="space-y-2 flex-1">
                             <h3 className="text-xl md:text-2xl font-black text-[#0F172A] uppercase leading-tight group-hover:text-primary transition-colors line-clamp-2">{exam.name}</h3>
                             <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{stats.full + stats.subject + stats.pyq + stats.sectional} PREPARATION NODES</p>
                          </div>

                          <div className="mt-6 md:mt-8">
                             <Button variant="ghost" className="w-full h-12 md:h-14 rounded-xl md:rounded-2xl bg-slate-900 text-white font-black uppercase text-[10px] tracking-widest gap-2 group-hover:bg-primary transition-all border-none">
                                VIEW PREPARATION <ChevronRight className="h-4 w-4" />
                             </Button>
                          </div>
                       </Card>
                    </Link>
                  )
               })}
            </div>
         ) : (
            <div className="py-24 text-center opacity-20 flex flex-col items-center">
               <Layers className="h-16 w-16 mb-4" />
               <p className="font-headline font-black text-xl uppercase tracking-widest">No Exam Verticals Registered</p>
            </div>
         )}
      </main>
      <Footer />
    </div>
  )
}