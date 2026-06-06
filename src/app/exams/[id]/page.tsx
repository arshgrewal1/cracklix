
"use client"

import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import { useDoc, useCollection, useFirestore } from "@/firebase"
import { doc, collection, query, where } from "firebase/firestore"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { 
  Clock, 
  BookOpen, 
  ShieldCheck, 
  ChevronRight,
  Layers,
  FileText,
  Zap,
  Trophy,
  History,
  ChevronLeft,
  Sparkles,
  Shield,
  FileArchive,
  Info,
  Download
} from "lucide-react"
import { useParams, useRouter } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useMemo, useState } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import Link from "next/link"

/**
 * @fileOverview Final Exam-Specific Mastery Hub.
 * Strictly isolated tabs for Full Mocks, Sectionals, Chapter Wise, PYQs, and Notes.
 */

export default function ExamHubPage() {
  const params = useParams()
  const router = useRouter()
  const db = useFirestore()
  const examId = params.id as string
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({})

  const { data: exam, loading: examLoading } = useDoc<any>(useMemo(() => (db ? doc(db, "exams", examId) : null), [db, examId]))
  
  const mocksQuery = useMemo(() => {
    if (!db || !examId) return null;
    return query(
      collection(db, "mocks"), 
      where("examId", "==", examId), 
      where("published", "==", true)
    );
  }, [db, examId]);

  const notesQuery = useMemo(() => {
    if (!db || !examId) return null;
    return query(
      collection(db, "notes"), 
      where("examId", "==", examId)
    );
  }, [db, examId]);

  const { data: rawMocks, loading: mocksLoading } = useCollection<any>(mocksQuery)
  const { data: notes, loading: notesLoading } = useCollection<any>(notesQuery)
  const { data: boards } = useCollection<any>(useMemo(() => (db ? collection(db, "boards") : null), [db]))

  const groupedMocks = useMemo(() => {
    if (!rawMocks) return { FULL: [], SECTIONAL: [], CHAPTER: [], PYQ: [] };
    return {
      FULL: rawMocks.filter(m => m.mockType === 'FULL'),
      SECTIONAL: rawMocks.filter(m => m.mockType === 'SECTIONAL'),
      CHAPTER: rawMocks.filter(m => m.mockType === 'CHAPTER'),
      PYQ: rawMocks.filter(m => m.mockType === 'PYQ'),
    }
  }, [rawMocks])

  if (examLoading) return <div className="h-screen flex items-center justify-center bg-white"><Skeleton className="h-24 w-24 rounded-3xl" /></div>
  if (!exam) return <div className="h-screen flex flex-col items-center justify-center text-slate-400 gap-4"><Info className="h-16 w-16 opacity-10" /><p className="font-black uppercase tracking-widest">Exam Hub Not Found</p></div>

  const activeBoard = boards?.find((b: any) => b.id === exam.boardId);

  return (
    <div className="flex flex-col min-h-screen bg-white font-body">
      <Navbar />
      
      <section className="bg-slate-50 border-b border-slate-100 py-10 md:py-16 relative overflow-hidden">
         <div className="container mx-auto px-6 max-w-7xl relative z-10 text-left">
            <div className="max-w-4xl space-y-6">
               <div className="flex flex-wrap items-center gap-3">
                  <button onClick={() => router.back()} className="mr-4 text-slate-400 hover:text-black transition-colors flex items-center gap-2 font-black uppercase text-[8px] tracking-widest">
                     <ChevronLeft className="h-3 w-3" /> Back
                  </button>
                  <Badge className="bg-primary/5 text-primary border-none px-3 py-1 rounded-lg font-black uppercase text-[8px] tracking-[0.2em]">
                     {activeBoard?.abbreviation || exam.boardId?.toUpperCase() || "STATE"} HUB
                  </Badge>
               </div>

               <div className="flex flex-col md:flex-row md:items-center gap-6">
                  <div className="h-20 w-20 md:h-24 md:w-24 rounded-[2rem] bg-white border border-slate-200 flex items-center justify-center shadow-xl shrink-0 relative overflow-hidden">
                     {activeBoard?.iconUrl && !failedImages['hub-logo'] ? (
                        <img 
                           src={activeBoard.iconUrl} 
                           referrerPolicy="no-referrer"
                           className={cn("w-full h-full object-contain p-4", (activeBoard.id === 'indian-army' || activeBoard.id === 'punjab-police') ? "scale-125" : "")} 
                           alt="Board" 
                           onError={() => setFailedImages(p => ({...p, 'hub-logo': true}))}
                        />
                     ) : (
                        <div className="flex flex-col items-center justify-center text-primary">
                           {activeBoard?.id === 'punjab-police' ? <Shield className="h-10 w-10" /> : <Trophy className="h-10 w-10" />}
                        </div>
                     )}
                  </div>

                  <div className="space-y-1">
                     <h1 className="text-2xl md:text-5xl font-headline font-black leading-tight uppercase text-[#0F172A] tracking-tight">
                        {exam.name}
                     </h1>
                     <p className="text-sm md:text-lg text-slate-500 font-medium leading-relaxed max-w-2xl">
                        {exam.description || "Official syllabus and high-fidelity preparation matrix."}
                     </p>
                  </div>
               </div>
            </div>
         </div>
      </section>

      <main className="container mx-auto px-4 py-8 max-w-7xl relative z-20 pb-32">
         <Tabs defaultValue="FULL" className="space-y-8">
            <div className="bg-white p-1 rounded-xl md:rounded-2xl shadow-xl border border-slate-100 flex items-center overflow-x-auto no-scrollbar">
               <TabsList className="bg-transparent border-none p-0 flex gap-1 h-auto">
                  <TabTrigger value="FULL" icon={<Zap />} label="Full Mocks" count={groupedMocks.FULL.length} />
                  <TabTrigger value="SECTIONAL" icon={<Layers />} label="Sectionals" count={groupedMocks.SECTIONAL.length} />
                  <TabTrigger value="CHAPTER" icon={<History />} label="Chapter Wise" count={groupedMocks.CHAPTER.length} />
                  <TabTrigger value="PYQ" icon={<FileArchive />} label="PYQs" count={groupedMocks.PYQ.length} />
                  <TabTrigger value="NOTES" icon={<FileText />} label="Notes" count={notes?.length || 0} />
               </TabsList>
            </div>

            <TabsContent value="FULL" className="space-y-6">
               <HubGrid mocks={groupedMocks.FULL} emptyLabel="No Full Mocks published." logo={activeBoard?.iconUrl} boardId={exam.boardId} failedImages={failedImages} setFailedImages={setFailedImages} />
            </TabsContent>

            <TabsContent value="SECTIONAL" className="space-y-6">
               <HubGrid mocks={groupedMocks.SECTIONAL} emptyLabel="No Sectional mocks published." logo={activeBoard?.iconUrl} boardId={exam.boardId} failedImages={failedImages} setFailedImages={setFailedImages} />
            </TabsContent>

            <TabsContent value="CHAPTER" className="space-y-6">
               <HubGrid mocks={groupedMocks.CHAPTER} emptyLabel="No Chapter-wise mocks published." logo={activeBoard?.iconUrl} boardId={exam.boardId} failedImages={failedImages} setFailedImages={setFailedImages} />
            </TabsContent>

            <TabsContent value="PYQ" className="space-y-6">
               <HubGrid mocks={groupedMocks.PYQ} emptyLabel="No PYQ archives found." logo={activeBoard?.iconUrl} boardId={exam.boardId} failedImages={failedImages} setFailedImages={setFailedImages} />
            </TabsContent>

            <TabsContent value="NOTES" className="space-y-6">
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {notesLoading ? (
                    Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-40 rounded-3xl" />)
                  ) : notes && notes.length > 0 ? (
                    notes.map((note: any) => (
                      <Card key={note.id} className="border-none shadow-lg rounded-[2rem] bg-white group hover:shadow-2xl transition-all p-6 text-left">
                         <div className="flex items-center gap-4 mb-6">
                            <div className="h-12 w-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                               <FileText className="h-6 w-6" />
                            </div>
                            <div className="min-w-0">
                               <h3 className="font-bold text-[#0F172A] truncate uppercase text-sm">{note.title}</h3>
                               <p className="text-[10px] text-slate-400 font-bold uppercase">{note.subjectId} • PDF</p>
                            </div>
                         </div>
                         <Button asChild className="w-full h-12 bg-[#0F172A] hover:bg-black rounded-xl font-black uppercase text-[9px] tracking-widest gap-2 shadow-xl">
                            <a href={note.pdfUrl} target="_blank" rel="noopener noreferrer">
                               <Download className="h-3.5 w-3.5" /> Download Note
                            </a>
                         </Button>
                      </Card>
                    ))
                  ) : (
                    <div className="col-span-full py-20 text-center border-2 border-dashed border-slate-100 rounded-3xl opacity-20">
                       <FileText className="h-12 w-12 mx-auto mb-4" />
                       <p className="font-black uppercase tracking-widest text-xs">Official Study Notes Gated</p>
                    </div>
                  )}
               </div>
            </TabsContent>
         </Tabs>
      </main>

      <Footer />
    </div>
  )
}

function TabTrigger({ value, icon, label, count }: any) {
   return (
      <TabsTrigger 
         value={value} 
         className="rounded-lg md:rounded-xl px-4 md:px-6 h-10 md:h-12 font-black uppercase text-[8px] md:text-[10px] tracking-widest data-[state=active]:bg-[#0F172A] data-[state=active]:text-white flex items-center gap-2 transition-all group shrink-0"
      >
         <span className="shrink-0">{icon}</span>
         <span className="whitespace-nowrap">{label}</span>
         <Badge className="bg-primary/10 text-primary border-none text-[8px] font-black ml-1 px-1.5 min-w-[20px]">{count}</Badge>
      </TabsTrigger>
   )
}

function HubGrid({ mocks, emptyLabel, logo, boardId, failedImages, setFailedImages }: any) {
   if (mocks.length === 0) return (
      <div className="py-24 text-center border-2 border-dashed border-slate-100 rounded-[2.5rem] opacity-20">
         <Sparkles className="h-10 w-10 mx-auto mb-4" />
         <p className="font-black uppercase tracking-[0.2em] text-[10px]">{emptyLabel}</p>
      </div>
   );
   return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
         {mocks.map((mock: any) => (
           <Card key={mock.id} className="border-none shadow-lg hover:shadow-2xl transition-all duration-300 rounded-[2.5rem] bg-white group overflow-hidden text-left flex flex-col h-full border border-slate-50">
             <CardContent className="p-8 flex-1 flex flex-col h-full">
                <div className="flex justify-between items-start mb-6">
                   <div className="h-14 w-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 overflow-hidden shadow-inner">
                      {logo && !failedImages[mock.id] ? (
                        <img 
                          src={logo} 
                          referrerPolicy="no-referrer" 
                          className={cn("w-full h-full object-contain p-3", (boardId === 'indian-army' || boardId === 'punjab-police') ? "scale-125" : "")} 
                          alt="Logo" 
                          onError={() => setFailedImages((p: any) => ({ ...p, [mock.id]: true }))}
                        />
                      ) : (
                        <div className="bg-primary/10 text-primary h-full w-full flex items-center justify-center">
                           {boardId === 'punjab-police' ? <Shield className="h-7 w-7" /> : <Trophy className="h-7 w-7" />}
                        </div>
                      )}
                   </div>
                   <Badge className="bg-orange-50 text-primary border-none text-[7px] font-black uppercase px-2 py-0.5 rounded-md">
                      {mock.mockType || 'Standard'}
                   </Badge>
                </div>
                <h3 className="font-headline text-base md:text-lg font-black text-[#0F172A] leading-tight uppercase group-hover:text-primary transition-colors mb-4 line-clamp-2 min-h-[44px]">
                 {mock.title}
                </h3>
                <div className="flex items-center justify-between text-slate-400 font-bold uppercase text-[8px] tracking-widest pt-4 border-t border-slate-50 mt-auto">
                   <span className="flex items-center gap-1.5"><BookOpen className="h-3 w-3 text-primary" /> {mock.totalQuestions} Qs</span>
                   <span className="flex items-center gap-1.5"><Clock className="h-3 w-3 text-primary" /> {mock.duration}m</span>
                </div>
                <Button asChild className="w-full h-11 bg-[#0F172A] hover:bg-primary text-white font-black uppercase tracking-widest text-[9px] rounded-xl mt-6 shadow-lg">
                   <Link href={`/mocks/${mock.id}`}>Attempt Now</Link>
                </Button>
             </CardContent>
           </Card>
         ))}
      </div>
   )
}
