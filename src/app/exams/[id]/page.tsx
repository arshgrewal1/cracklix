"use client"

import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import { useDoc, useCollection, useFirestore } from "@/firebase"
import { doc, collection, query, where } from "firebase/firestore"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { 
  Clock, 
  BookOpen, 
  ArrowRight, 
  ShieldCheck, 
  Map, 
  Info,
  Calendar,
  GraduationCap,
  FileText,
  CheckCircle2,
  Lock,
  ChevronRight
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useParams } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useMemo } from "react"
import { Skeleton } from "@/components/ui/skeleton"

export default function ExamDetails() {
  const params = useParams()
  const db = useFirestore()
  const examId = params.id as string

  const { data: exam, loading } = useDoc<any>(useMemo(() => (db ? doc(db, "exams", examId) : null), [db, examId]))
  const { data: board } = useDoc<any>(useMemo(() => (db && exam ? doc(db, "boards", exam.boardId) : null), [db, exam]))
  
  const mocksQuery = useMemo(() => (db ? query(collection(db, "mocks"), where("examId", "==", examId)) : null), [db, examId])
  const { data: mocks } = useCollection<any>(mocksQuery)

  if (loading) return <div className="h-screen flex items-center justify-center"><Skeleton className="h-20 w-20 rounded-full" /></div>
  if (!exam) return <div className="h-screen flex items-center justify-center text-slate-400 font-bold">Exam module not found.</div>

  return (
    <div className="flex flex-col min-h-screen bg-slate-50/30">
      <Navbar />
      <main className="container mx-auto px-6 py-12 max-w-7xl">
        
        {/* Header Section */}
        <section className="mb-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-8 space-y-8">
              <div className="flex flex-wrap items-center gap-4">
                <Badge className="bg-primary text-white border-none px-4 py-1.5 rounded-xl font-black uppercase text-[10px] tracking-[0.2em]">
                  {board?.abbreviation || "Official"} Verified
                </Badge>
                <Badge variant="outline" className="border-slate-200 text-slate-500 font-bold px-4 py-1.5 rounded-xl text-[10px] uppercase tracking-widest">
                  {exam.category} Series
                </Badge>
              </div>
              <h1 className="text-5xl md:text-7xl font-headline font-black text-[#0F172A] leading-[0.95] tracking-tight uppercase">
                {exam.name}
              </h1>
              <p className="text-xl text-slate-500 font-medium leading-relaxed max-w-3xl">
                {exam.description} Trust Cracklix's institutional grade mock series for high-fidelity preparation.
              </p>
              
              <div className="flex flex-wrap gap-8 py-10 border-y border-slate-100">
                <InfoStat icon={<Clock className="text-primary" />} label="Duration" value={`${exam.duration || 120} Min`} />
                <InfoStat icon={<BookOpen className="text-primary" />} label="Bank Size" value={`${exam.activeQuestions || 1000}+ MCQs`} />
                <InfoStat icon={<ShieldCheck className="text-primary" />} label="Board" value={board?.abbreviation || "PSSSB"} />
              </div>
            </div>

            <div className="lg:col-span-4">
               <Card className="border-none shadow-2xl shadow-slate-200 rounded-[3rem] overflow-hidden bg-white">
                  <div className="p-10 space-y-8">
                     <div className="space-y-2 text-center">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Preparation Series Status</p>
                        <p className="text-6xl font-headline font-black text-primary">{exam.totalMocks || 0}</p>
                        <p className="text-sm font-bold text-[#0F172A]">Active Mock Tests</p>
                     </div>
                     <div className="space-y-4">
                        <Button asChild className="w-full h-14 bg-[#0F172A] hover:bg-slate-800 text-white font-black uppercase tracking-widest text-xs rounded-2xl shadow-xl shadow-slate-200">
                           <Link href="/mocks">Start Preparation <ArrowRight className="ml-2 h-4 w-4" /></Link>
                        </Button>
                        <p className="text-[10px] text-center text-slate-400 font-bold uppercase">Includes Punjabi Qualifying Section</p>
                     </div>
                  </div>
               </Card>
            </div>
          </div>
        </section>

        {/* Detailed Tabs (SEO Traffic Generator) */}
        <section className="mb-20">
           <Tabs defaultValue="overview" className="space-y-10">
              <TabsList className="bg-white/50 border border-slate-100 p-1 rounded-2xl h-14 w-full md:w-auto overflow-x-auto overflow-y-hidden custom-scrollbar">
                 <TabsTrigger value="overview" className="rounded-xl px-8 font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-lg">Overview</TabsTrigger>
                 <TabsTrigger value="syllabus" className="rounded-xl px-8 font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-lg">Syllabus</TabsTrigger>
                 <TabsTrigger value="pattern" className="rounded-xl px-8 font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-lg">Exam Pattern</TabsTrigger>
                 <TabsTrigger value="eligibility" className="rounded-xl px-8 font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-lg">Eligibility</TabsTrigger>
              </TabsList>

              <TabsContent value="overview">
                 <Card className="border-none shadow-xl shadow-slate-200/50 rounded-[2.5rem] bg-white p-12 space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                       <div className="space-y-6">
                          <h3 className="text-3xl font-headline font-black text-[#0F172A] flex items-center gap-3">
                             <Info className="text-primary h-7 w-7" /> Selection Process
                          </h3>
                          <div className="space-y-4">
                             <TimelineItem step="01" title="Written Examination" desc="OMR based or Computer Based Test (CBT) covering multiple subjects." />
                             <TimelineItem step="02" title="Counseling / Document Verification" desc="Verification of educational certificates and identity proof." />
                             <TimelineItem step="03" title="Final Merit List" desc="Based on marks obtained in the written exam and qualifying sections." />
                          </div>
                       </div>
                       <div className="bg-slate-50 rounded-[2rem] p-10 space-y-6 border border-slate-100">
                          <h4 className="text-xl font-headline font-black text-[#0F172A]">Official Resources</h4>
                          <ul className="space-y-4">
                             <ResourceLink label="Latest Notification PDF" />
                             <ResourceLink label="Official Answer Key 2025" />
                             <ResourceLink label="Apply Online Link" />
                             <ResourceLink label="Syllabus PDF Download" />
                          </ul>
                       </div>
                    </div>
                 </Card>
              </TabsContent>

              <TabsContent value="syllabus">
                 <Card className="border-none shadow-xl shadow-slate-200/50 rounded-[2.5rem] bg-white p-12">
                    <div className="space-y-8">
                       <h3 className="text-3xl font-headline font-black text-[#0F172A]">Detailed Subject Breakdown</h3>
                       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <SyllabusCard title="General Knowledge" topics={["Punjab History & Culture", "Geography of Punjab", "Current Affairs (States & National)", "Science & Tech"]} />
                          <SyllabusCard title="Bilingual Language" topics={["Punjabi Grammar (Qualifying)", "English Comprehension", "Basic Punjabi Literature", "Vocabulary & Idioms"]} />
                          <SyllabusCard title="Aptitude & Logic" topics={["Numerical Ability", "Logical Reasoning", "Mental Ability", "Data Interpretation"]} />
                       </div>
                    </div>
                 </Card>
              </TabsContent>
           </Tabs>
        </section>

        {/* Practice Section */}
        <section className="space-y-8">
           <div className="flex items-center justify-between">
              <h2 className="text-3xl font-headline font-black text-[#0F172A]">Mock Assessment Series</h2>
              <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest hidden sm:block">Updated as per {new Date().getFullYear()} Notification</p>
           </div>
           
           <div className="grid grid-cols-1 gap-6">
              {mocks && mocks.length > 0 ? (
                mocks.map((mock: any, idx: number) => (
                  <Card key={mock.id} className="border-none shadow-xl shadow-slate-200/30 hover:shadow-2xl transition-all duration-300 rounded-[2rem] bg-white group">
                     <CardContent className="p-8 flex flex-col md:flex-row items-center justify-between gap-8">
                        <div className="flex items-center gap-8">
                           <div className="h-16 w-16 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center font-headline font-black text-2xl text-slate-400 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                              {idx + 1}
                           </div>
                           <div>
                              <h3 className="text-xl font-headline font-black text-[#0F172A] group-hover:text-primary transition-colors">{mock.title}</h3>
                              <div className="flex items-center gap-5 mt-2">
                                 <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2"><Clock className="h-3 w-3" /> {mock.duration} Min</span>
                                 <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2"><BookOpen className="h-3 w-3" /> {mock.totalQuestions} Questions</span>
                                 <Badge className="bg-emerald-500/10 text-emerald-600 border-none text-[8px] font-black uppercase py-0.5">Free Access</Badge>
                              </div>
                           </div>
                        </div>
                        <Button asChild className="w-full md:w-auto bg-[#0F172A] hover:bg-slate-800 text-white font-black uppercase tracking-widest text-[10px] h-12 px-10 rounded-xl gap-2">
                           <Link href={`/mocks/${mock.id}`}>Attempt Mock <ChevronRight className="h-4 w-4" /></Link>
                        </Button>
                     </CardContent>
                  </Card>
                ))
              ) : (
                <div className="p-20 text-center text-slate-400 border-2 border-dashed rounded-[3rem] space-y-4 bg-white/50">
                   <Lock className="h-12 w-12 mx-auto opacity-10" />
                   <p className="font-bold">New mock series for this exam is under audit by Arsh Grewal.</p>
                   <Button variant="link" className="text-primary font-black uppercase text-[10px]">Notify Me on Launch</Button>
                </div>
              )}
           </div>
        </section>

      </main>
      <Footer />
    </div>
  )
}

function InfoStat({ icon, label, value }: any) {
  return (
    <div className="flex items-center gap-5">
      <div className="h-14 w-14 rounded-2xl bg-white shadow-xl shadow-slate-100 flex items-center justify-center border border-slate-50 shrink-0">
         {icon}
      </div>
      <div>
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{label}</p>
        <p className="text-lg font-headline font-black text-[#0F172A]">{value}</p>
      </div>
    </div>
  )
}

function TimelineItem({ step, title, desc }: any) {
  return (
    <div className="flex gap-6 group">
       <div className="text-2xl font-headline font-black text-primary/20 group-hover:text-primary transition-colors">{step}</div>
       <div className="space-y-1">
          <h4 className="font-bold text-[#0F172A]">{title}</h4>
          <p className="text-sm text-slate-500 leading-relaxed font-medium">{desc}</p>
       </div>
    </div>
  )
}

function ResourceLink({ label }: any) {
   return (
      <li className="flex items-center justify-between group cursor-pointer hover:bg-white p-3 rounded-xl transition-all border border-transparent hover:border-slate-100 hover:shadow-lg">
         <span className="text-sm font-bold text-slate-700">{label}</span>
         <FileText className="h-4 w-4 text-slate-300 group-hover:text-primary transition-colors" />
      </li>
   )
}

function SyllabusCard({ title, topics }: any) {
   return (
      <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 space-y-4">
         <h4 className="font-headline font-black text-[#0F172A] uppercase text-xs tracking-widest border-b border-slate-200 pb-4">{title}</h4>
         <ul className="space-y-3">
            {topics.map((t: any) => (
               <li key={t} className="flex items-center gap-3 text-xs font-bold text-slate-600">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> {t}
               </li>
            ))}
         </ul>
      </div>
   )
}
