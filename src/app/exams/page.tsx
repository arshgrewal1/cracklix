
"use client"

import { useMemo, Suspense, useState } from "react"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import { useCollection, useFirestore, useUser } from "@/firebase"
import { collection, query, doc, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore"
import { Input } from "@/components/ui/input"
import { Search, GraduationCap, ChevronRight, Zap, BookOpen, Layers, FileText, Star, Shield } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"

/**
 * @fileOverview High-Density Responsive Exam Catalog v14.2.
 * FIXED: Strictly isolated CTET and PSTET official logos with optimized scaling.
 */

export default function ExamsCatalog() {
  return (
    <Suspense fallback={null}>
      <CatalogContent />
    </Suspense>
  )
}

function CatalogContent() {
  const db = useFirestore()
  const { user, profile } = useUser()
  const { toast } = useToast()
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({})

  const examsQuery = useMemo(() => (db ? query(collection(db, 'exams')) : null), [db])
  const boardsQuery = useMemo(() => (db ? query(collection(db, 'boards')) : null), [db])
  const mocksQuery = useMemo(() => (db ? query(collection(db, 'mocks')) : null), [db])
  const questionsQuery = useMemo(() => (db ? query(collection(db, 'questions')) : null), [db])

  const { data: rawExams, loading: examsLoading } = useCollection<any>(examsQuery)
  const { data: boards } = useCollection<any>(boardsQuery)
  const { data: mocks, loading: mocksLoading } = useCollection<any>(mocksQuery)
  const { data: questions } = useCollection<any>(questionsQuery)

  const statsMap = useMemo(() => {
    if (!mocks) return {};
    const map: Record<string, any> = {};
    
    mocks.forEach(m => {
      const eids = m.examIds || (m.examId ? [m.examId] : []);
      if (!eids.length) return;
      
      eids.forEach((eid: string) => {
        if (!map[eid]) map[eid] = { full: 0, pyq: 0, sectional: 0, qCount: 0, subjects: new Set<string>() };
        if (m.mockType === 'FULL') map[eid].full++;
        if (m.mockType === 'PYQ') map[eid].pyq++;
        if (m.mockType === 'SECTIONAL') map[eid].sectional++;
        if (m.subjectId) map[eid].subjects.add(m.subjectId);
      });
    });

    if (questions) {
      questions.forEach(q => {
        if (q.examId && map[q.examId]) {
          map[q.examId].qCount++;
        } else if (q.examId) {
          map[q.examId] = { full: 0, pyq: 0, sectional: 0, qCount: 1, subjects: new Set<string>() };
        }
      })
    }

    return map;
  }, [mocks, questions]);

  const exams = useMemo(() => {
    if (!rawExams) return [];
    const unique = new Map();
    rawExams.forEach(e => {
       const key = e.name?.toLowerCase().trim();
       if (!unique.has(key)) unique.set(key, e);
    });
    return Array.from(unique.values()).filter((e: any) => 
       e.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [rawExams, searchTerm])

  const togglePin = async (e: React.MouseEvent, examId: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
      router.push("/login?returnUrl=/exams");
      return;
    }

    const isPinned = profile?.pinnedExams?.includes(examId);
    try {
      await updateDoc(doc(db!, "users", user.uid), {
        pinnedExams: isPinned ? arrayRemove(examId) : arrayUnion(examId)
      });
      toast({ title: isPinned ? "Hub Unpinned" : "Pinned to My Exams" });
    } catch (err) {
      toast({ variant: "destructive", title: "Sync Failed" });
    }
  };

  const ctetOfficialLogo = "https://cdnbbsr.s3waas.gov.in/s3443dec3062d0286986e21dc0631734c9/uploads/2023/03/2023032156.png";
  const pstetOfficialLogo = "https://pstet.pseb.ac.in/img/main-logo-2.png";
  const psebOfficialLogo = "https://static.pseb.ac.in/uploads/1648628722_PSEBlogo_2.png";

  return (
    <div className="flex flex-col min-h-screen bg-slate-50/50 pb-safe overflow-x-hidden">
      <Navbar />
      <main className="container mx-auto px-4 py-6 md:py-16 max-w-7xl">
        <div className="flex flex-col md:flex-row justify-between items-end mb-8 md:mb-16 gap-4 text-left">
          <div className="space-y-1">
             <div className="flex items-center gap-2">
                <GraduationCap className="h-3.5 w-3.5 text-primary" />
                <span className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Official Registry 2026</span>
             </div>
             <h1 className="text-2xl md:text-6xl font-headline font-black text-[#0F172A] uppercase tracking-tight leading-none">MASTER <span className="text-primary">CATALOG</span></h1>
             <p className="text-[11px] md:text-lg text-slate-500 font-medium">Explore and pin your target recruitment hubs.</p>
          </div>
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <Input 
              className="pl-9 h-11 md:h-14 rounded-lg md:rounded-xl bg-white border-none shadow-sm text-sm" 
              placeholder="Search recruitment hubs..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-8">
           {examsLoading || mocksLoading ? (
              Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-80 w-full rounded-[3.5rem]" />)
           ) : exams.map((exam: any) => {
              const board = boards?.find((b: any) => 
                b.id.toLowerCase() === exam.boardId?.toLowerCase() || 
                b.abbreviation?.toLowerCase() === exam.boardId?.toLowerCase()
              );
              
              const abbrev = board?.abbreviation?.toUpperCase() || exam.boardId?.toUpperCase();
              let logoUrl = exam.iconUrl || board?.iconUrl;
              
              // STRICT BRANDING SYNC
              const isCtet = abbrev === 'CTET' || abbrev === 'CBSE' || exam.name.toUpperCase().includes('CTET');
              const isPstet = abbrev === 'PSTET' || (exam.name.toUpperCase().includes('PSTET') && !isCtet);
              const isPseb = abbrev === 'PSEB' || abbrev === 'EDUCATION' || (exam.name.toUpperCase().includes('PSEB') && !isCtet && !isPstet);

              if (isCtet) logoUrl = ctetOfficialLogo;
              else if (isPstet) logoUrl = pstetOfficialLogo;
              else if (isPseb) logoUrl = psebOfficialLogo;

              const stats = statsMap[exam.id] || { full: 0, pyq: 0, sectional: 0, qCount: 0, subjects: new Set() };
              const isPinned = profile?.pinnedExams?.includes(exam.id);
              const isImgFailed = failedImages[exam.id];
              
              const bid = exam.boardId?.toLowerCase() || "";
              
              const isArmy = bid === 'army' || exam.id?.toLowerCase().includes('army');
              const isPolice = bid.includes('police') || abbrev?.includes('POLICE');
              const isPower = bid.includes('pspcl') || bid.includes('pstcl') || abbrev?.includes('PSPCL');
              const isSsc = bid === 'ssc' || exam.id?.toLowerCase().includes('ssc') || abbrev === 'SSC';
              const isEdu = isPseb || exam.name?.toLowerCase().includes('ett') || exam.name?.toLowerCase().includes('master');

              return (
                <Card key={exam.id} className="border-none shadow-lg hover:shadow-2xl transition-all duration-300 rounded-xl md:rounded-[3rem] bg-white group overflow-hidden text-left h-full flex flex-col border border-slate-100 p-4 md:p-10 relative">
                   <button 
                     onClick={(e) => togglePin(e, exam.id)}
                     className={`absolute top-4 right-4 md:top-8 md:right-8 z-20 p-2 rounded-full transition-all ${isPinned ? 'bg-amber-100 text-amber-600' : 'bg-slate-50 text-slate-300 hover:text-primary'}`}
                   >
                      <Star className={`h-4 w-4 md:h-5 md:w-5 ${isPinned ? 'fill-current' : ''}`} />
                   </button>

                   <Link href={`/exams/${exam.id}`} className="flex-1 flex flex-col">
                       <div className="flex justify-between items-start mb-4 md:mb-10 pr-10">
                          <div className="h-10 w-10 md:h-20 md:w-20 rounded-lg md:rounded-3xl bg-white border border-slate-100 flex items-center justify-center relative overflow-hidden shrink-0 shadow-inner">
                             {logoUrl && !isImgFailed ? (
                                <img 
                                  src={logoUrl} 
                                  className={cn("w-full h-full object-contain p-1.5 md:p-2 transition-transform duration-500 group-hover:scale-105", 
                                    isArmy ? "scale-125" : (isPolice || isEdu || isCtet || isPstet) ? "scale-150 p-1" : (isPower || isSsc) ? "scale-110" : ""
                                  )} 
                                  alt="Board Logo" 
                                  referrerPolicy="no-referrer" 
                                  onError={() => setFailedImages(p => ({...p, [exam.id]: true}))}
                                />
                             ) : (
                                isPolice ? <Shield className="h-5 w-5 md:h-10 md:w-10 text-primary" /> : <GraduationCap className="h-5 w-5 md:h-10 md:w-10 text-slate-300" />
                             )}
                          </div>
                          <Badge className="bg-primary/5 text-primary border-none text-[6px] md:text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-md">
                             {board?.abbreviation || 'GOVT'} Hub
                          </Badge>
                       </div>
                       
                       <div className="space-y-1 md:space-y-4 flex-1">
                          <h3 className="text-[15px] md:text-3xl font-black text-[#0F172A] uppercase leading-tight tracking-tight group-hover:text-primary transition-colors">
                            {exam.name}
                          </h3>
                          <p className="text-[10px] md:sm font-medium text-slate-400 leading-relaxed line-clamp-1 md:line-clamp-2">
                            {exam.description || `Prepare for ${exam.name} with official patterns.`}
                          </p>
                       </div>

                       <div className="grid grid-cols-2 gap-y-4 gap-x-2 mt-6 pt-6 border-t border-slate-50">
                          <CounterNode icon={<Zap className="h-3 w-3 text-primary" />} val={stats.full} label="Full Mocks" />
                          <CounterNode icon={<BookOpen className="h-3 w-3 text-blue-500" />} val={stats.subjects.size} label="Subject Hubs" />
                          <CounterNode icon={<FileText className="h-3 w-3 text-emerald-500" />} val={stats.pyq} label="PYQ Archives" />
                          <CounterNode icon={<Layers className="h-3 w-3 text-orange-500" />} val={stats.qCount} label="Active MCQs" />
                       </div>

                       <div className="mt-6 md:mt-10">
                          <Button variant="ghost" className="w-full h-9 md:h-16 rounded-lg md:rounded-2xl bg-slate-900 text-white group-hover:bg-primary transition-all font-black uppercase text-[8px] md:text-[10px] tracking-widest gap-2 shadow-lg">
                             Enter Hub <ChevronRight className="h-3 w-3 md:h-3.5 md:w-3.5" />
                          </Button>
                       </div>
                   </Link>
                </Card>
              )
           })}
        </div>
      </main>
      <Footer />
    </div>
  )
}

function CounterNode({ icon, val, label }: { icon: React.ReactNode, val: number, label: string }) {
  return (
    <div className="space-y-0.5 text-left">
       <div className="flex items-center gap-1.5">
          {icon}
          <p className="text-[10px] md:text-[12px] font-black text-[#0F172A]">{val}</p>
       </div>
       <p className="text-[6px] md:text-[8px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
    </div>
  )
}
