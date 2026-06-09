
"use client"

import { useMemo, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import { useDoc, useCollection, useFirestore } from "@/firebase"
import { collection, query, where, doc } from "firebase/firestore"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, GraduationCap, Zap, BookOpen, Layers, Shield, Loader2, FileText } from "lucide-react"
import Link from "next/link"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

/**
 * @fileOverview Institutional Hub Explorer.
 * UPDATED: Hardened relational mapping and permanent logos.
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

  // PERMANENT LOGO REGISTRY
  const govtEmblem = "https://static.pseb.ac.in/psebwebsite/front_assets/sites/default/files/inline-images/emblem.png";
  const technicalLogo = "https://affiliation.pbteched.net/assets/images/banner-5.png";
  const teachingLogo = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT77AiJp2d3yn7Lwjk7LG6nDeLpQC_ZnFs6FZg4yAieypyMsmctxNGWRdk&s=10";

  return (
    <div className="min-h-screen bg-slate-50/50 font-body">
      <Navbar />
      
      <section className="bg-white border-b border-slate-100 py-12 md:py-24 text-left relative overflow-hidden">
         <div className="absolute top-0 right-0 p-12 opacity-5"><GraduationCap className="h-64 w-64" /></div>
         <div className="container mx-auto px-4 max-w-7xl relative z-10">
            <button onClick={() => router.back()} className="h-10 w-10 rounded-full border border-slate-100 flex items-center justify-center text-slate-400 hover:text-black mb-10 transition-all">
               <ChevronLeft className="h-5 w-5" />
            </button>
            <div className="flex flex-col md:flex-row items-center gap-10">
               <div className="h-24 w-24 md:h-36 md:w-36 rounded-[2rem] md:rounded-[3rem] bg-slate-50 border-4 border-white shadow-2xl flex items-center justify-center overflow-hidden shrink-0">
                  {hub?.categoryId ? (
                    <img 
                      src={hub.categoryId === 'punjab-govt' ? govtEmblem : hub.categoryId === 'punjab-teaching' ? teachingLogo : technicalLogo} 
                      className="h-full w-full object-contain p-4 scale-140" 
                      alt="Hub Logo" 
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <Shield className="h-12 w-12 text-slate-200" />
                  )}
               </div>
               <div className="space-y-3 text-center md:text-left">
                  <div className="flex items-center justify-center md:justify-start gap-4">
                     <Badge className="bg-primary text-white border-none font-black px-4 py-1 rounded-xl text-[10px] tracking-widest shadow-lg">{hub?.abbreviation} HUB</Badge>
                     <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Official verticals</span>
                  </div>
                  <h1 className="text-4xl md:text-7xl font-headline font-black text-[#0F172A] uppercase tracking-tighter leading-none">{hub?.name}</h1>
               </div>
            </div>
         </div>
      </section>

      <main className="container mx-auto px-4 py-12 md:py-24 max-w-7xl">
         {examsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
               {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-[450px] w-full rounded-[3.5rem]" />)}
            </div>
         ) : exams && exams.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
               {exams.map((exam) => {
                  const stats = statsMap[exam.id] || { full: 0, subject: 0, pyq: 0, sectional: 0 };
                  const categoryId = hub?.categoryId;

                  let forcedLogo = govtEmblem;
                  if (categoryId === 'punjab-teaching') forcedLogo = teachingLogo;
                  else if (categoryId === 'punjab-technical') forcedLogo = technicalLogo;

                  return (
                    <Link key={exam.id} href={`/exams/${exam.id}`}>
                       <Card className="border-none shadow-xl hover:shadow-4xl transition-all duration-500 rounded-[3rem] bg-white group overflow-hidden h-full flex flex-col border border-slate-100 p-10 text-left">
                          <div className="flex justify-between items-start mb-10">
                             <div className="h-16 w-16 md:h-20 md:w-20 rounded-3xl bg-slate-50 border border-slate-100 flex items-center justify-center transition-all group-hover:shadow-xl shadow-inner relative overflow-hidden shrink-0">
                                <img src={forcedLogo} className="w-full h-full object-contain p-2.5 scale-140" alt="Logo" referrerPolicy="no-referrer" />
                             </div>
                             <Badge variant="outline" className="text-[8px] font-black uppercase tracking-widest border-slate-100 text-slate-400">
                                {hub?.abbreviation} VERTICAL
                             </Badge>
                          </div>

                          <div className="space-y-4 flex-1">
                             <h3 className="text-2xl md:text-3xl font-black text-[#0F172A] uppercase tracking-tight leading-tight group-hover:text-primary transition-colors">{exam.name}</h3>
                             <p className="text-xs font-medium text-slate-400 leading-relaxed line-clamp-2">Complete practice for {exam.name}.</p>
                          </div>

                          <div className="mt-12 pt-8 border-t border-slate-50 grid grid-cols-2 gap-4">
                             <StatNode icon={<Zap className="text-primary h-3 w-3" />} count={stats.full} label="FULL MOCKS" />
                             <StatNode icon={<BookOpen className="text-blue-500 h-3 w-3" />} count={stats.subject} label="SUBJECT" />
                             <StatNode icon={<FileText className="text-emerald-500 h-3 w-3" />} count={stats.pyq} label="PYQS" />
                             <StatNode icon={<Layers className="text-orange-500 h-3 w-3" />} count={stats.sectional} label="SECTIONAL" />
                          </div>

                          <div className="mt-10">
                             <Button variant="ghost" className="w-full h-16 rounded-2xl bg-slate-900 text-white font-black uppercase text-[10px] tracking-widest gap-2 group-hover:bg-primary transition-all border-none">
                                OPEN EXAM HUB <ChevronRight className="h-4 w-4" />
                             </Button>
                          </div>
                       </Card>
                    </Link>
                  )
               })}
            </div>
         ) : (
            <div className="py-40 text-center opacity-20 flex flex-col items-center">
               <Layers className="h-20 w-20 mb-6" />
               <p className="font-headline font-black text-2xl uppercase tracking-widest">No Exam Verticals Registered</p>
            </div>
         )}
      </main>
      <Footer />
    </div>
  )
}

function StatNode({ icon, count, label }: any) {
  return (
    <div className="flex items-center gap-3 bg-slate-50 px-4 py-2.5 rounded-2xl border border-slate-100 shadow-sm transition-all group-hover:bg-white">
      <div className="shrink-0">{icon}</div>
      <div className="flex flex-col">
         <span className="text-xs font-black text-[#0F172A] leading-none">{count}</span>
         <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-1">{label}</span>
      </div>
    </div>
  )
}
