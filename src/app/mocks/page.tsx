
"use client"

import { useMemo, useState } from "react"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import AdPlacement from "@/components/ads/AdPlacement"
import { useCollection, useFirestore } from "@/firebase"
import { collection, query, where } from "firebase/firestore"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  ShieldCheck, 
  ChevronRight, 
  Zap, 
  BookOpen, 
  FileText, 
  Layout, 
  GraduationCap,
  Sparkles,
  Target,
  Shield,
  Trophy
} from "lucide-react"
import Link from "next/link"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

/**
 * @file Overview Final Exam Gateway Node v6.0.
 * HARDENED: Robust Board Logo lookup logic with Referrer Policy bypass for Government Assets.
 */

export default function MocksGatewayPage() {
  const db = useFirestore()
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({})
  
  const examsQuery = useMemo(() => (db ? query(collection(db, "exams")) : null), [db])
  const boardsQuery = useMemo(() => (db ? collection(db, "boards") : null), [db])
  const mocksQuery = useMemo(() => (db ? query(collection(db, "mocks"), where("published", "==", true)) : null), [db])

  const { data: exams, loading: examsLoading } = useCollection<any>(examsQuery)
  const { data: boards } = useCollection<any>(boardsQuery)
  const { data: mocks, loading: mocksLoading } = useCollection<any>(mocksQuery)

  const statsMap = useMemo(() => {
    if (!mocks) return {};
    const map: Record<string, any> = {};
    
    mocks.forEach(m => {
      const eid = m.examId;
      if (!eid) return;
      
      if (!map[eid]) {
        map[eid] = { full: 0, pyq: 0, sectional: 0, subjects: new Set<string>() };
      }
      
      if (m.mockType === 'FULL') map[eid].full++;
      if (m.mockType === 'PYQ') map[eid].pyq++;
      if (m.mockType === 'SECTIONAL') map[eid].sectional++;
      if (m.subjectId) map[eid].subjects.add(m.subjectId);
    });
    
    return map;
  }, [mocks]);

  return (
    <div className="flex flex-col min-h-screen bg-slate-50/50 font-body">
      <Navbar />
      <main className="container mx-auto px-4 py-12 md:py-20 max-w-7xl">
        <div className="text-left mb-16 space-y-6">
          <div className="flex items-center gap-3">
             <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary shadow-sm">
                <ShieldCheck className="h-6 w-6" />
             </div>
             <span className="text-[8px] font-black uppercase tracking-[0.4em] text-slate-500">Official Exam Registry</span>
          </div>
          <h1 className="text-3xl md:text-5xl lg:text-8xl font-headline font-black text-[#0F172A] uppercase tracking-tighter leading-[0.85]">
            Select Your <br/> <span className="text-primary">Mastery Hub</span>
          </h1>
          <p className="text-slate-500 font-medium text-lg md:text-xl max-w-2xl mt-4 leading-relaxed">
            Access strictly structured preparation matrices audited for upcoming exam patterns.
          </p>
        </div>

        <AdPlacement placement="MOCK_LISTING" />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
           {examsLoading || mocksLoading ? (
             Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-[450px] w-full rounded-[3.5rem]" />)
           ) : exams?.sort((a: any, b: any) => a.name.localeCompare(b.name)).map((exam: any) => {
             // HARDENED BOARD LOOKUP: Matches exams to their respective board icons
             const board = boards?.find((b: any) => 
               b.id.toLowerCase() === exam.boardId?.toLowerCase() || 
               b.abbreviation?.toLowerCase() === exam.boardId?.toLowerCase()
             );
             
             const logoUrl = board?.iconUrl || exam.iconUrl;
             const stats = statsMap[exam.id] || { full: 0, pyq: 0, sectional: 0, subjects: new Set() };
             const isImgFailed = failedImages[exam.id];

             return (
                <Link key={exam.id} href={`/exams/${exam.id}`}>
                   <Card className="border-none shadow-xl hover:shadow-4xl hover:-translate-y-2 transition-all duration-500 rounded-[3.5rem] bg-white group overflow-hidden text-left h-full flex flex-col border border-slate-100">
                      <CardContent className="p-10 flex flex-col h-full">
                         <div className="flex justify-between items-start mb-10">
                            <div className="h-20 w-20 rounded-3xl bg-slate-50 border border-slate-100 flex items-center justify-center transition-all group-hover:shadow-xl shadow-inner relative overflow-hidden shrink-0">
                               {logoUrl && !isImgFailed ? (
                                  <img 
                                    src={logoUrl} 
                                    referrerPolicy="no-referrer"
                                    alt="Board Logo" 
                                    className="w-full h-full object-contain p-2.5 transition-transform duration-500 group-hover:scale-110" 
                                    onError={() => setFailedImages(p => ({...p, [exam.id]: true}))}
                                  />
                               ) : (
                                  <div className="flex flex-col items-center justify-center text-primary">
                                     {board?.id === 'punjab-police' ? <Shield className="h-10 w-10" /> : <GraduationCap className="h-10 w-10" />}
                                  </div>
                               )}
                            </div>
                            <Badge className="bg-primary/5 text-primary border-none text-[8px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-lg shadow-sm">
                               {board?.abbreviation || 'GOVT'} Hub
                            </Badge>
                         </div>
                         
                         <div className="space-y-4 flex-1">
                            <h3 className="font-headline text-3xl font-black text-[#0F172A] uppercase leading-[0.95] group-hover:text-primary transition-colors">
                               {exam.name}
                            </h3>
                            <p className="text-sm font-medium text-slate-400 leading-relaxed line-clamp-2">
                               {exam.description || "Official institutional preparation matrix."}
                            </p>
                         </div>

                         <div className="mt-12 pt-8 border-t border-slate-50 grid grid-cols-2 gap-4">
                            <InventoryNode icon={<Zap className="text-primary h-3.5 w-3.5" />} count={stats.full} label="Full Mocks" />
                            <InventoryNode icon={<BookOpen className="text-blue-500 h-3.5 w-3.5" />} count={stats.subjects.size} label="Subject" />
                            <InventoryNode icon={<FileText className="text-emerald-500 h-3.5 w-3.5" />} count={stats.pyq} label="PYQs" />
                            <InventoryNode icon={<Layout className="text-orange-500 h-3.5 w-3.5" />} count={stats.sectional} label="Sectional" />
                         </div>

                         <div className="mt-10">
                            <Button variant="ghost" className="w-full h-16 rounded-2xl bg-slate-900 text-white group-hover:bg-primary transition-all shadow-xl font-black uppercase text-[10px] tracking-widest gap-3">
                               Open Exam Hub <ChevronRight className="h-4 w-4" />
                            </Button>
                         </div>
                      </CardContent>
                   </Card>
                </Link>
             )
           })}
        </div>

        <AdPlacement placement="SIDEBAR" className="my-16" />
      </main>
      <Footer />
    </div>
  )
}

function InventoryNode({ icon, count, label }: any) {
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
