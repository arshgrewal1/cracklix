
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
  Info,
  Calendar,
  GraduationCap,
  FileText,
  CheckCircle2,
  Lock,
  ChevronRight,
  TrendingUp,
  MapPin,
  HelpCircle
} from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useMemo } from "react"
import { Skeleton } from "@/components/ui/skeleton"

export default function ExamHubPage() {
  const params = useParams()
  const db = useFirestore()
  const examId = params.id as string

  const { data: exam, loading } = useDoc<any>(useMemo(() => (db ? doc(db, "exams", examId) : null), [db, examId]))
  const { data: board } = useDoc<any>(useMemo(() => (db && exam ? doc(db, "boards", exam.boardId) : null), [db, exam]))
  
  const mocksQuery = useMemo(() => (db ? query(collection(db, "mocks"), where("examId", "==", examId)) : null), [db, examId])
  const { data: mocks } = useCollection<any>(mocksQuery)

  if (loading) return <div className="h-screen flex items-center justify-center bg-white"><Skeleton className="h-20 w-20 rounded-full" /></div>
  if (!exam) return <div className="h-screen flex items-center justify-center text-slate-400 font-bold">Exam module not found.</div>

  return (
    <div className="flex flex-col min-h-screen bg-slate-50/30">
      <Navbar />
      
      {/* Institutional Header */}
      <section className="bg-[#08152D] text-white py-24 relative overflow-hidden">
         <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[150%] bg-primary/10 blur-[120px] rounded-full" />
         <div className="container mx-auto px-6 max-w-7xl relative z-10">
            <div className="max-w-4xl space-y-8">
               <div className="flex items-center gap-4">
                  <Badge className="bg-primary text-white border-none px-4 py-1.5 rounded-full font-black uppercase text-[10px] tracking-[0.2em]">
                     Official {board?.abbreviation || 'PSSSB'} Vertical
                  </Badge>
                  <div className="flex items-center gap-2 text-emerald-400">
                     <ShieldCheck className="h-4 w-4" />
                     <span className="text-[10px] font-black uppercase tracking-widest">2026 Verified Pattern</span>
                  </div>
               </div>
               <h1 className="text-5xl md:text-8xl font-headline font-black leading-[0.9] tracking-tight uppercase">
                  {exam.name} <br/> <span className="text-primary">Exam Hub</span>
               </h1>
               <p className="text-xl text-slate-400 font-medium leading-relaxed max-w-2xl">
                  Central preparation portal for {exam.name}. Access official mocks, bilingual study material, and historical cutoffs monitored by Arsh Grewal.
               </p>
               <div className="flex flex-wrap gap-8 pt-8">
                  <HubStat icon={<TrendingUp className="text-primary" />} label="Competition" value="High" />
                  <HubStat icon={<FileText className="text-primary" />} label="PYQ Access" value="2018-2025" />
                  <HubStat icon={<Clock className="text-primary" />} label="Next Exam" value="March 2026" />
               </div>
            </div>
         </div>
      </section>

      <main className="container mx-auto px-6 -mt-10 max-w-7xl relative z-20 pb-32">
         <Tabs defaultValue="mocks" className="space-y-12">
            <div className="bg-white p-2 rounded-[2rem] shadow-3xl border border-slate-100 flex items-center justify-between">
               <TabsList className="bg-transparent border-none p-0 flex flex-wrap gap-2 h-auto">
                  <HubTab value="mocks" label="Mock Series" />
                  <HubTab value="syllabus" label="Full Syllabus" />
                  <HubTab value="pyqs" label="Previous Papers" />
                  <HubTab value="notifications" label="Alerts" />
               </TabsList>
               <Button asChild className="hidden md:flex bg-primary hover:bg-primary/90 rounded-2xl h-12 px-8 font-black uppercase text-[10px] tracking-widest shadow-xl shadow-primary/20">
                  <Link href="/mocks">Start Practice</Link>
               </Button>
            </div>

            <TabsContent value="mocks">
               <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                  <div className="lg:col-span-2 space-y-8">
                     <div className="flex items-center justify-between">
                        <h2 className="text-3xl font-headline font-black text-[#0F172A]">Available Practice Series</h2>
                        <Badge variant="outline" className="border-slate-200 text-slate-400 font-bold px-4 py-1.5 rounded-xl text-[10px] uppercase">{mocks?.length || 0} Sets Live</Badge>
                     </div>
                     <div className="space-y-6">
                        {mocks && mocks.length > 0 ? mocks.map((mock: any, idx: number) => (
                           <Card key={mock.id} className="border-none shadow-xl shadow-slate-200/40 hover:shadow-3xl transition-all duration-500 rounded-[2.5rem] bg-white group overflow-hidden">
                              <CardContent className="p-0 flex items-stretch">
                                 <div className="w-2 bg-primary" />
                                 <div className="p-10 flex-1 flex flex-col md:flex-row items-center justify-between gap-10">
                                    <div className="flex items-center gap-8">
                                       <div className="h-16 w-16 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center font-headline font-black text-2xl text-slate-300 group-hover:bg-primary/10 group-hover:text-primary transition-all">
                                          {idx + 1}
                                       </div>
                                       <div>
                                          <h3 className="text-2xl font-headline font-black text-[#0F172A] group-hover:text-primary transition-colors">{mock.title}</h3>
                                          <div className="flex items-center gap-6 mt-2 text-[10px] font-black uppercase text-slate-400 tracking-widest">
                                             <span className="flex items-center gap-2"><Clock className="h-4 w-4" /> {mock.duration} Min</span>
                                             <span className="flex items-center gap-2"><BookOpen className="h-4 w-4" /> {mock.totalQuestions} MCQs</span>
                                             <Badge className="bg-emerald-500/10 text-emerald-600 border-none px-3 py-1 rounded-lg">Verified</Badge>
                                          </div>
                                       </div>
                                    </div>
                                    <Button asChild className="w-full md:w-auto h-14 px-10 bg-[#0F172A] hover:bg-slate-800 text-white font-black uppercase tracking-widest text-xs rounded-2xl gap-3 shadow-2xl shadow-slate-200">
                                       <Link href={`/mocks/${mock.id}`}>Attempt Now <ChevronRight className="h-4 w-4" /></Link>
                                    </Button>
                                 </div>
                              </CardContent>
                           </Card>
                        )) : (
                           <div className="p-24 text-center text-slate-300 border-2 border-dashed rounded-[4rem] space-y-4 bg-white/50">
                              <Lock className="h-12 w-12 mx-auto opacity-10" />
                              <p className="font-black font-headline text-xl">Operational Audit in Progress</p>
                              <p className="text-sm font-bold uppercase tracking-widest">New high-fidelity sets are being audited by Arsh Grewal.</p>
                           </div>
                        )}
                     </div>
                  </div>

                  <div className="space-y-8">
                     <Card className="border-none shadow-2xl rounded-[3rem] bg-[#0F172A] text-white p-10 overflow-hidden relative">
                        <div className="absolute top-0 right-0 p-6 opacity-5"><TrendingUp className="h-40 w-40" /></div>
                        <div className="relative z-10 space-y-6">
                           <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Live Insights</p>
                           <h4 className="text-2xl font-headline font-black">Success Benchmark</h4>
                           <div className="space-y-4">
                              <BenchmarkItem label="Avg. Cutoff (Last 3 Yrs)" value="78.5%" />
                              <BenchmarkItem label="Punjabi Qualifying" value="50% Mandatory" />
                              <BenchmarkItem label="Total Vacancies" value="1,200+" />
                           </div>
                        </div>
                     </Card>

                     <Card className="border-none shadow-xl rounded-[2.5rem] bg-white p-10 space-y-6">
                        <h4 className="font-headline font-black text-lg text-[#0F172A]">Need Help?</h4>
                        <p className="text-sm text-slate-500 leading-relaxed font-medium">Join our community of 15,000+ aspirants preparing for {exam.name}.</p>
                        <Button variant="outline" className="w-full h-12 rounded-xl border-slate-100 font-bold uppercase text-[10px] tracking-widest">Join Telegram Group</Button>
                     </Card>
                  </div>
               </div>
            </TabsContent>

            <TabsContent value="syllabus">
               <Card className="border-none shadow-2xl rounded-[4rem] bg-white p-16">
                  <div className="max-w-4xl mx-auto space-y-12">
                     <div className="text-center space-y-4">
                        <h2 className="text-4xl font-headline font-black text-[#0F172A] uppercase">Full Curriculum Audit</h2>
                        <p className="text-slate-500 font-medium text-lg italic">Verified as per the latest cabinet notifications of Punjab Government.</p>
                     </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        <SyllabusSection title="Punjab General Studies" topics={["Punjab History & Freedom Struggle", "State Geography & Ecology", "Culture & Literature (Fairs, Festivals)", "State Governance & Local Bodies"]} />
                        <SyllabusSection title="Language Mastery" topics={["Punjabi Grammar (Tenses, Idioms)", "English Comprehension", "Bilingual Translation Logic", "Punjabi Vocabulary & Poetry Basics"]} />
                        <SyllabusSection title="Institutional Aptitude" topics={["Numerical Ability (Profit, Interest)", "Logical Reasoning Patterns", "Computer Basics & IT Awareness", "Mental Ability Matrix"]} />
                        <SyllabusSection title="Current Strategic News" topics={["State Budget Highlights", "New Welfare Schemes (2025-26)", "Punjab Sports Accomplishments", "Regional Infrastructure Projects"]} />
                     </div>
                  </div>
               </Card>
            </TabsContent>
         </Tabs>
      </main>

      <Footer />
    </div>
  )
}

function HubStat({ icon, label, value }: any) {
  return (
    <div className="flex items-center gap-5">
      <div className="h-12 w-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">{icon}</div>
      <div>
         <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">{label}</p>
         <p className="text-lg font-black">{value}</p>
      </div>
    </div>
  )
}

function HubTab({ value, label }: { value: string, label: string }) {
  return (
    <TabsTrigger value={value} className="rounded-xl px-8 h-12 font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-slate-900 data-[state=active]:text-white transition-all">
       {label}
    </TabsTrigger>
  )
}

function SyllabusSection({ title, topics }: any) {
  return (
    <div className="space-y-6">
       <h4 className="text-xl font-headline font-black text-[#0F172A] flex items-center gap-3">
          <div className="h-1.5 w-6 bg-primary rounded-full" /> {title}
       </h4>
       <ul className="space-y-4">
          {topics.map((t: any) => (
             <li key={t} className="flex items-center gap-4 text-slate-600 font-bold">
                <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
                <span>{t}</span>
             </li>
          ))}
       </ul>
    </div>
  )
}

function BenchmarkItem({ label, value }: any) {
  return (
    <div className="flex justify-between items-center py-3 border-b border-white/5">
       <span className="text-xs font-bold text-slate-400">{label}</span>
       <span className="text-sm font-black text-primary uppercase">{value}</span>
    </div>
  )
}
