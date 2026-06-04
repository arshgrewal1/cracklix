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
  Target,
  Trophy,
  History,
  Layout,
  Info,
  ChevronLeft
} from "lucide-react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useMemo } from "react"
import { Skeleton } from "@/components/ui/skeleton"

/**
 * @fileOverview Final Exam-Specific Mastery Hub.
 * Optimized for Testbook Aesthetic: Absolute black typography and modular practice nodes.
 */

export default function ExamHubPage() {
  const params = useParams()
  const router = useRouter()
  const db = useFirestore()
  const examId = params.id as string

  const { data: exam, loading: examLoading } = useDoc<any>(useMemo(() => (db ? doc(db, "exams", examId) : null), [db, examId]))
  
  const mocksQuery = useMemo(() => {
    if (!db || !examId) return null;
    return query(
      collection(db, "mocks"), 
      where("examId", "==", examId), 
      where("published", "==", true)
    );
  }, [db, examId]);

  const { data: rawMocks, loading: mocksLoading } = useCollection<any>(mocksQuery)

  const groupedMocks = useMemo(() => {
    if (!rawMocks) return { FULL: [], SUBJECT: [], SECTIONAL: [], PYQ: [], CA_QUIZ: [], CHAPTER: [] };
    
    const sortedMocks = [...rawMocks].sort((a, b) => {
      const timeA = a.createdAt?.seconds || 0;
      const timeB = b.createdAt?.seconds || 0;
      return timeB - timeA;
    });

    return {
      FULL: sortedMocks.filter(m => m.mockType === 'FULL'),
      SUBJECT: sortedMocks.filter(m => m.mockType === 'SUBJECT'),
      SECTIONAL: sortedMocks.filter(m => m.mockType === 'SECTIONAL'),
      CHAPTER: sortedMocks.filter(m => m.mockType === 'CHAPTER'),
      PYQ: sortedMocks.filter(m => m.mockType === 'PYQ'),
      CA_QUIZ: sortedMocks.filter(m => m.mockType === 'CA_QUIZ'),
    }
  }, [rawMocks])

  if (examLoading) return <div className="h-screen flex items-center justify-center bg-white"><Skeleton className="h-24 w-24 rounded-3xl" /></div>
  if (!exam) return <div className="h-screen flex flex-col items-center justify-center text-slate-400 gap-4"><Layout className="h-16 w-16 opacity-10" /><p className="font-black uppercase tracking-widest">Exam Hub Not Found</p></div>

  return (
    <div className="flex flex-col min-h-screen bg-slate-50/50 font-body">
      <Navbar />
      
      <section className="bg-[#0B1528] text-white py-12 md:py-20 relative overflow-hidden">
         <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[150%] bg-primary/10 blur-[140px] rounded-full" />
         <div className="container mx-auto px-6 max-w-7xl relative z-10 text-left">
            <div className="max-w-4xl space-y-6">
               <div className="flex flex-wrap items-center gap-3">
                  <button onClick={() => router.back()} className="mr-4 text-slate-400 hover:text-white transition-colors flex items-center gap-2 font-black uppercase text-[10px] tracking-widest">
                     <ChevronLeft className="h-4 w-4" /> Back to Registry
                  </button>
                  <Badge className="bg-primary text-white border-none px-4 py-1.5 rounded-lg font-black uppercase text-[10px] tracking-[0.2em]">
                     Official {exam.boardId?.toUpperCase() || "State"} Hub
                  </Badge>
                  <div className="flex items-center gap-2 text-emerald-400">
                     <ShieldCheck className="h-4 w-4" />
                     <span className="text-[10px] font-black uppercase tracking-widest">2026 Registry Verified</span>
                  </div>
               </div>
               <h1 className="text-4xl md:text-6xl lg:text-7xl font-headline font-black leading-[0.95] tracking-tight uppercase">
                  {exam.name} <br/> <span className="text-primary">Mastery Hub</span>
               </h1>
               <p className="text-lg md:text-xl text-slate-400 font-medium leading-relaxed max-w-2xl">
                  {exam.description || "High-fidelity preparation matrix including full mocks, previous papers, and specialized subject tests."}
               </p>
               <div className="flex flex-wrap gap-8 pt-4">
                  <HubMetric label="Active Mocks" value={rawMocks?.length || 0} icon={<Zap className="text-primary" />} />
                  <HubMetric label="MCQ Bank" value={exam.activeQuestions || "1,000+"} icon={<BookOpen className="text-blue-400" />} />
                  <HubMetric label="Aspirants" value="12k+" icon={<Trophy className="text-amber-400" />} />
               </div>
            </div>
         </div>
      </section>

      <main className="container mx-auto px-4 -mt-10 max-w-7xl relative z-20 pb-32">
         <Tabs defaultValue="FULL" className="space-y-10">
            <div className="bg-white p-1.5 rounded-2xl md:rounded-3xl shadow-2xl border border-slate-100 flex items-center overflow-x-auto no-scrollbar">
               <TabsList className="bg-transparent border-none p-0 flex gap-1 h-auto">
                  <TabTrigger value="FULL" icon={<Zap />} label="Full Mocks" count={groupedMocks.FULL.length} />
                  <TabTrigger value="SUBJECT" icon={<Layers />} label="Subject Mastery" count={groupedMocks.SUBJECT.length} />
                  <TabTrigger value="SECTIONAL" icon={<Target />} label="Sectionals" count={groupedMocks.SECTIONAL.length} />
                  <TabTrigger value="CHAPTER" icon={<History />} label="Chapter Wise" count={groupedMocks.CHAPTER.length} />
                  <TabTrigger value="PYQ" icon={<FileText />} label="PYQs" count={groupedMocks.PYQ.length} />
                  <TabTrigger value="CA_QUIZ" icon={<Sparkles />} label="CA Quizzes" count={groupedMocks.CA_QUIZ.length} />
               </TabsList>
            </div>

            <TabsContent value="FULL" className="space-y-6">
               <HubGrid mocks={groupedMocks.FULL} emptyLabel="No Full-Length Mocks structured for this exam." />
            </TabsContent>

            <TabsContent value="SUBJECT" className="space-y-6">
               <HubGrid mocks={groupedMocks.SUBJECT} emptyLabel="Subject mastery tests are being audited for this hub." />
            </TabsContent>

            <TabsContent value="SECTIONAL" className="space-y-6">
               <HubGrid mocks={groupedMocks.SECTIONAL} emptyLabel="No Sectional nodes linked to this recruitment." />
            </TabsContent>

            <TabsContent value="CHAPTER" className="space-y-6">
               <HubGrid mocks={groupedMocks.CHAPTER} emptyLabel="Chapter-wise preparation nodes pending registry." />
            </TabsContent>

            <TabsContent value="PYQ" className="space-y-6">
               <HubGrid mocks={groupedMocks.PYQ} emptyLabel="Official previous papers for this vertical are in registry." />
            </TabsContent>

            <TabsContent value="CA_QUIZ" className="space-y-6">
               <HubGrid mocks={groupedMocks.CA_QUIZ} emptyLabel="Daily current affairs quizzes for this board." />
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
         className="rounded-xl px-4 md:px-8 h-12 md:h-14 font-black uppercase text-[9px] md:text-[11px] tracking-widest data-[state=active]:bg-[#0F172A] data-[state=active]:text-white flex items-center gap-2 md:gap-3 transition-all group"
      >
         <span className="shrink-0 group-data-[state=active]:text-primary">{icon}</span>
         <span className="whitespace-nowrap">{label}</span>
         <Badge className="bg-primary/10 text-primary border-none text-[8px] font-black group-data-[state=active]:bg-white/10 group-data-[state=active]:text-white ml-1">{count}</Badge>
      </TabsTrigger>
   )
}

function HubGrid({ mocks, emptyLabel }: { mocks: any[], emptyLabel: string }) {
   if (mocks.length === 0) return <EmptyState label={emptyLabel} />;
   return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
         {mocks.map((mock) => <MockCard key={mock.id} mock={mock} />)}
      </div>
   )
}

function MockCard({ mock }: { mock: any }) {
  return (
    <Card className="border-none shadow-xl hover:shadow-3xl transition-all duration-500 rounded-[2.5rem] bg-white group overflow-hidden text-left flex flex-col h-full border border-slate-50">
      <CardContent className="p-0 flex-1 flex flex-col h-full">
         <div className="p-8 pb-4 space-y-6 flex-1">
            <div className="flex justify-between items-start">
               <div className="h-16 w-16 rounded-2xl bg-white border border-slate-100 flex items-center justify-center relative overflow-hidden shadow-lg group-hover:scale-105 transition-transform duration-500">
                  {mock.boardId === 'psssb' ? (
                     <img src="https://sssb.punjab.gov.in/images/logo.png" className="w-full h-full object-contain p-2" alt="PSSSB" />
                  ) : (
                     <ShieldCheck className="h-8 w-8 text-primary opacity-20" />
                  )}
               </div>
               <div className="text-right space-y-1">
                  <Badge className="bg-orange-50 text-primary border-none text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-lg">
                     {mock.mockType || 'Standard'}
                  </Badge>
                  <p className="text-[7px] font-bold text-slate-300 uppercase tracking-widest">Official Pattern</p>
               </div>
            </div>

            <div className="space-y-4">
               <h3 className="font-headline text-lg md:text-xl font-black text-[#000000] leading-tight uppercase group-hover:text-primary transition-colors min-h-[52px] line-clamp-2">
                {mock.title}
               </h3>
               <div className="space-y-2.5 pt-3 border-t border-slate-50">
                  <div className="flex items-center justify-between text-slate-400 font-bold uppercase text-[9px] tracking-tight">
                     <span className="flex items-center gap-1.5"><BookOpen className="h-3.5 w-3.5 text-primary" /> {mock.totalQuestions} Questions</span>
                     <span className="text-[#0F172A]">{mock.totalQuestions} Marks</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-400 font-bold uppercase text-[9px] tracking-tight">
                     <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5 text-primary" /> {mock.duration} Minutes</span>
                     <span className="text-[#0F172A]">{mock.language || 'Bilingual'}</span>
                  </div>
               </div>
            </div>
         </div>

         <div className="p-6 pt-0 mt-auto">
            <Button asChild className="w-full h-14 bg-[#0B1528] hover:bg-primary text-white font-black uppercase tracking-[0.2em] text-[10px] rounded-xl shadow-lg transition-all group">
               <Link href={`/mocks/${mock.id}`} className="flex items-center justify-center gap-3">
                  Start Practice <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
               </Link>
            </Button>
         </div>
      </CardContent>
    </Card>
  )
}

function HubMetric({ label, value, icon }: any) {
   return (
      <div className="flex items-center gap-3">
         <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center shadow-inner">{icon}</div>
         <div className="space-y-0.5 text-left">
            <p className="text-xl font-headline font-black leading-none">{value}</p>
            <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 leading-none">{label}</p>
         </div>
      </div>
   )
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="col-span-full py-24 text-center text-slate-300 border-2 border-dashed border-slate-200 rounded-[3rem] space-y-6 bg-white/50">
       <ShieldCheck className="h-16 w-16 mx-auto opacity-10" />
       <div className="space-y-1 px-10">
          <p className="font-headline font-black text-xl md:text-2xl uppercase tracking-widest">{label}</p>
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Content for this node is being audited.</p>
       </div>
    </div>
  )
}
