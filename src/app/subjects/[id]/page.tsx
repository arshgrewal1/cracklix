"use client"

import React, { useMemo, useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import { useDoc, useCollection, useFirestore, useUser } from "@/firebase"
import { collection, query, where, doc, orderBy } from "firebase/firestore"
import { Card, CardContent } from "@/components/ui/card"
import { 
  Zap, 
  ChevronRight, 
  ShieldCheck, 
  Target, 
  Layers, 
  ArrowLeft,
  Trophy,
  Star,
  RefreshCw,
  LayoutGrid
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { Skeleton } from "@/components/ui/skeleton"
import Image from "next/image"
import { TestSeries, Subject } from "@/types"

/**
 * @fileOverview Level 2: Series Selection Hub v1.0.
 * Displays all series belonging to a specific learning subject.
 */

export default function SubjectDetailPortal() {
  const params = useParams()
  const subjectId = params?.id as string
  const db = useFirestore()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const { data: subject, loading: sLoading } = useDoc<Subject>(useMemo(() => (db && subjectId ? doc(db, "subjects", subjectId) : null), [db, subjectId]));
  
  const seriesQuery = useMemo(() => (db && subjectId ? query(collection(db, "test_series"), where("subjectId", "==", subjectId), where("isActive", "==", true), orderBy("displayOrder", "asc")) : null), [db, subjectId]);
  const { data: series, loading: serLoading } = useCollection<TestSeries>(seriesQuery as any);

  const mocksQuery = useMemo(() => (db && subjectId ? query(collection(db, "mocks"), where("published", "==", true), where("learningSubjectId", "==", subjectId)) : null), [db, subjectId]);
  const { data: mocks } = useCollection<any>(mocksQuery);

  const resultsQuery = useMemo(() => (db ? collection(db, "results") : null), [db]);
  const { data: results } = useCollection<any>(resultsQuery);

  const seriesStats = useMemo(() => {
     const map: Record<string, { total: number, attempted: number, progress: number }> = {};
     if (!series) return map;

     series.forEach(ser => {
        const testsInSer = (mocks || []).filter(m => m.seriesId === ser.id);
        const attempted = testsInSer.filter(m => (results || []).some((r: any) => r.mockId === m.id)).length;
        map[ser.id] = {
           total: testsInSer.length,
           attempted,
           progress: testsInSer.length > 0 ? Math.round((attempted / testsInSer.length) * 100) : 0
        };
     });
     return map;
  }, [series, mocks, results]);

  const uncategorizedTests = useMemo(() => {
     if (!mocks) return [];
     return mocks.filter(m => !m.seriesId);
  }, [mocks]);

  if (!mounted || sLoading) return <div className="h-screen w-full flex items-center justify-center bg-white"><Loader2 className="animate-spin text-primary" /></div>

  if (!subject) return (
     <div className="h-screen flex flex-col items-center justify-center text-center space-y-6">
        <AlertCircle className="h-16 w-16 text-slate-200" />
        <h2 className="text-2xl font-black">Subject Node Not Found</h2>
        <Button onClick={() => router.push('/subjects')} variant="outline">Back to Vault</Button>
     </div>
  )

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-body text-left">
      <Navbar />
      
      <section className="bg-[#0B1528] text-white pt-10 pb-16 md:pt-20 md:pb-32 relative overflow-hidden">
         <div className="absolute top-0 right-0 w-1/2 h-full bg-primary/10 blur-[120px] rounded-full" />
         <div className="container mx-auto px-4 md:px-12 max-w-7xl relative z-10 space-y-10">
            <button onClick={() => router.push('/subjects')} className="h-10 w-10 md:h-12 md:w-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-white transition-all"><ArrowLeft className="h-5 w-5" /></button>
            <div className="flex flex-col md:flex-row items-center gap-10 md:gap-16">
               <div className="relative shrink-0">
                  <div className="h-32 w-32 md:h-64 md:w-64 rounded-[2.5rem] md:rounded-[4rem] border-[8px] border-white/5 overflow-hidden bg-[#0F172A] shadow-5xl">
                     {subject.imageUrl ? <Image src={subject.imageUrl} alt={subject.name} fill className="object-cover opacity-80" /> : <Layers className="h-24 w-24 m-auto text-white/5" />}
                  </div>
                  <div className="absolute -bottom-4 -right-4 h-14 w-14 md:h-20 md:w-20 bg-primary rounded-3xl flex items-center justify-center text-white shadow-2xl border-[6px] border-[#0B1528]"><Zap className="h-8 w-8 md:h-10 md:w-10 fill-current" /></div>
               </div>
               <div className="text-center md:text-left space-y-6 flex-1">
                  <div className="space-y-4">
                     <Badge className="bg-primary/20 text-[#60A5FA] border-none px-4 py-1.5 rounded-full font-black text-[10px] tracking-widest uppercase">Learning Hub Active</Badge>
                     <h1 className="text-4xl md:text-8xl font-[900] tracking-tighter leading-none antialiased uppercase">{subject.name}</h1>
                  </div>
                  <p className="text-slate-400 text-sm md:text-xl font-medium max-w-2xl leading-relaxed">{subject.description || "Master core concepts through specialized preparation nodes."}</p>
               </div>
            </div>
         </div>
      </section>

      <main className="container mx-auto px-4 md:px-12 py-12 md:py-24 max-w-7xl space-y-16">
         <div className="flex items-center justify-between border-b border-slate-100 pb-8 px-1">
            <div className="flex items-center gap-4">
               <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-inner"><Target className="h-6 w-6" /></div>
               <h2 className="text-xl md:text-4xl font-black text-[#0F172A] uppercase tracking-tight">Practice Series</h2>
            </div>
            <Badge variant="outline" className="bg-white text-slate-400 border-slate-100 font-bold px-4 py-1.5 rounded-full shadow-sm">{series?.length || 0} Specialized Hubs</Badge>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
            {serLoading ? (
               Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-80 w-full rounded-[3rem] bg-white border border-slate-50" />)
            ) : series && series.length > 0 ? (
               series.map((item, idx) => {
                  const stats = seriesStats[item.id] || { total: 0, attempted: 0, progress: 0 };
                  return (
                    <motion.div key={item.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}>
                       <Link href={`/subjects/${subjectId}/series/${item.id}`}>
                          <Card className="border border-slate-100 shadow-xl hover:shadow-4xl transition-all duration-500 rounded-[2.5rem] bg-white group overflow-hidden flex flex-col p-8 md:p-10 text-left h-full group">
                             <div className="flex justify-between items-start mb-8">
                                <div className="h-16 w-16 md:h-20 md:w-20 rounded-2xl md:rounded-[2rem] bg-slate-50 overflow-hidden relative shadow-inner">
                                   {item.thumbnailUrl ? <Image src={item.thumbnailUrl} alt={item.title} fill className="object-cover" /> : <div className="h-full w-full flex items-center justify-center text-slate-200"><Star className="h-10 w-10" /></div>}
                                </div>
                                <Badge className={cn(
                                   "border-none text-[8px] md:text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-lg shadow-sm",
                                   item.difficulty === 'Easy' ? "bg-emerald-50 text-emerald-600" : item.difficulty === 'Medium' ? "bg-blue-50 text-blue-600" : "bg-rose-50 text-rose-600"
                                )}>{item.difficulty}</Badge>
                             </div>

                             <div className="space-y-4 flex-1">
                                <h3 className="text-xl md:text-2xl font-[800] text-[#0F172A] group-hover:text-primary transition-colors tracking-tight leading-tight uppercase line-clamp-2">{item.title}</h3>
                                <p className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                   <Layers className="h-3.5 w-3.5" /> {stats.total} Tests Linked
                                </p>
                             </div>

                             <div className="mt-8 pt-8 border-t border-slate-50 space-y-4">
                                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                                   <span className="text-slate-400">Mastery Index</span>
                                   <span className="text-primary">{stats.progress}%</span>
                                </div>
                                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden shadow-inner">
                                   <motion.div initial={{ width: 0 }} whileInView={{ width: `${stats.progress}%` }} transition={{ duration: 1 }} className="h-full bg-primary shadow-lg" />
                                </div>
                             </div>
                          </Card>
                       </Link>
                    </motion.div>
                  )
               })
            ) : (
               <div className="col-span-full py-40 text-center space-y-6 opacity-30">
                  <LayoutGrid className="h-20 w-20 mx-auto text-slate-300" />
                  <p className="font-black text-2xl uppercase tracking-[0.4em]">Hub Registry Empty</p>
               </div>
            )}
         </div>

         {/* UNCATEGORIZED FALLBACK */}
         {uncategorizedTests.length > 0 && (
            <section className="pt-12 md:pt-24 space-y-10">
               <div className="flex items-center gap-4 border-b border-slate-100 pb-6 px-1">
                  <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 shadow-inner"><X className="h-5 w-5" /></div>
                  <h3 className="text-lg md:text-3xl font-black text-[#0F172A] uppercase tracking-tight">Uncategorized Hub</h3>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
                  {uncategorizedTests.map((mock) => (
                    <Link key={mock.id} href={`/mocks/view?id=${mock.id}`}>
                       <Card className="border border-slate-100 shadow-lg hover:shadow-4xl transition-all rounded-[2rem] bg-white p-6 md:p-8 flex flex-col group h-full">
                          <h4 className="font-bold text-sm md:text-lg text-[#0F172A] group-hover:text-primary leading-tight line-clamp-2 uppercase mb-4">{mock.title}</h4>
                          <div className="mt-auto pt-4 flex items-center justify-between text-primary font-black text-[10px] uppercase tracking-widest">
                             <span>Start Test</span>
                             <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                          </div>
                       </Card>
                    </Link>
                  ))}
               </div>
            </section>
         )}
      </main>

      <Footer />
    </div>
  )
}

function Loader2({ className }: any) { return <Zap className={cn("animate-pulse", className)} /> }
function AlertCircle({ className }: any) { return <AlertTriangle className={className} /> }
import { AlertTriangle } from "lucide-react"
