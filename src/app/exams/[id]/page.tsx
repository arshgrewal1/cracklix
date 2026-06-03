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
  ShieldCheck, 
  ChevronRight,
  TrendingUp,
  Trophy,
  History,
  Target,
  CheckCircle2,
  Lock
} from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useMemo, useState } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { Progress } from "@/components/ui/progress"

const SYLLABUS = [
  { topic: "Punjab History (Sikh Gurus)", weight: "15 Qs", status: "Completed" },
  { topic: "Arithmetic & Mensuration", weight: "20 Qs", status: "In Progress" },
  { topic: "Mandatory Punjabi Grammar", weight: "50 Qs", status: "Pending" },
  { topic: "Logical Reasoning Patterns", weight: "15 Qs", status: "Completed" },
  { topic: "ICT & Digital Literacy", weight: "10 Qs", status: "Pending" },
]

const CUTOFFS = [
  { year: "2024", gen: "78.25", obc: "72.50", sc: "64.00", status: "Verified" },
  { year: "2022", gen: "74.50", obc: "68.20", sc: "61.75", status: "Archived" },
  { year: "2018", gen: "69.00", obc: "62.00", sc: "55.50", status: "Archived" },
]

export default function ExamHubPage() {
  const params = useParams()
  const db = useFirestore()
  const examId = params.id as string

  const { data: exam, loading } = useDoc<any>(useMemo(() => (db ? doc(db, "exams", examId) : null), [db, examId]))
  const { data: board } = useDoc<any>(useMemo(() => (db && exam ? doc(db, "boards", exam.boardId) : null), [db, exam]))
  
  const mocksQuery = useMemo(() => (db ? query(collection(db, "mocks"), where("examId", "==", examId), where("published", "==", true)) : null), [db, examId])
  const { data: mocks } = useCollection<any>(mocksQuery)

  const [completedTopics, setCompletedTopics] = useState([0, 3])

  if (loading) return <div className="h-screen flex items-center justify-center bg-white"><Skeleton className="h-20 w-20 rounded-full" /></div>
  if (!exam) return <div className="h-screen flex items-center justify-center text-slate-400 font-bold uppercase tracking-widest">Exam module not found.</div>

  const syllabusProgress = Math.round((completedTopics.length / SYLLABUS.length) * 100)

  return (
    <div className="flex flex-col min-h-screen bg-slate-50/30">
      <Navbar />
      
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
                  Central preparation portal for {exam.name}. Access official mocks, historical cutoffs, and track your syllabus progress monitored by Arsh Grewal.
               </p>
               <div className="flex flex-wrap gap-8 pt-8">
                  <HubStat icon={<TrendingUp className="text-primary" />} label="Competition" value="High" />
                  <HubStat icon={<History className="text-primary" />} label="Readiness" value={`${syllabusProgress}%`} />
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
                  <HubTab value="syllabus" label="Syllabus Tracker" />
                  <HubTab value="cutoffs" label="Cutoff DB" />
                  <HubTab value="pyqs" label="Previous Papers" />
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
                        <div className="absolute top-0 right-0 p-6 opacity-5"><Target className="h-40 w-40" /></div>
                        <div className="relative z-10 space-y-6">
                           <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Syllabus Completion</p>
                           <h4 className="text-4xl font-headline font-black text-white">{syllabusProgress}%</h4>
                           <Progress value={syllabusProgress} className="h-2 bg-white/5" />
                           <p className="text-slate-400 text-xs font-bold uppercase tracking-widest leading-relaxed">
                              {SYLLABUS.length - completedTopics.length} core topics pending in official curriculum.
                           </p>
                        </div>
                     </Card>

                     <Card className="border-none shadow-xl rounded-[2.5rem] bg-white p-10 space-y-6 text-center">
                        <Trophy className="h-12 w-12 text-primary mx-auto opacity-30" />
                        <h4 className="font-headline font-black text-lg text-[#0F172A] uppercase">Cutoff Alert</h4>
                        <p className="text-sm text-slate-500 leading-relaxed font-medium">To clear {exam.name} for General Category, target a score above 78% based on last 3 years.</p>
                        <Button asChild variant="outline" className="w-full h-12 rounded-xl border-slate-100 font-bold uppercase text-[10px] tracking-widest">
                           <Link href="/leaderboard">View Rank benchmarks</Link>
                        </Button>
                     </Card>
                  </div>
               </div>
            </TabsContent>

            <TabsContent value="syllabus">
               <Card className="border-none shadow-2xl rounded-[4rem] bg-white p-16">
                  <div className="max-w-4xl mx-auto space-y-12">
                     <div className="text-center space-y-4">
                        <h2 className="text-4xl font-headline font-black text-[#0F172A] uppercase">Syllabus Tracker</h2>
                        <p className="text-slate-500 font-medium text-lg italic">Personalized audit of your curriculum coverage.</p>
                     </div>
                     <div className="grid grid-cols-1 gap-4">
                        {SYLLABUS.map((item, i) => (
                           <div key={i} className="flex items-center justify-between p-8 bg-slate-50 rounded-[2rem] border border-slate-100 group hover:border-primary/30 transition-all">
                              <div className="flex items-center gap-6">
                                 <div 
                                    className={`h-10 w-10 rounded-xl flex items-center justify-center cursor-pointer transition-all ${completedTopics.includes(i) ? 'bg-emerald-500 text-white' : 'bg-white border border-slate-200 text-slate-300'}`}
                                    onClick={() => setCompletedTopics(prev => prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i])}
                                 >
                                    <CheckCircle2 className="h-5 w-5" />
                                 </div>
                                 <div>
                                    <p className={`text-xl font-bold ${completedTopics.includes(i) ? 'text-slate-400 line-through' : 'text-[#0F172A]'}`}>{item.topic}</p>
                                    <p className="text-[10px] font-black uppercase text-primary tracking-widest mt-1">Weightage: {item.weight}</p>
                                 </div>
                              </div>
                              <Badge className={`${completedTopics.includes(i) ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'} border-none px-4 py-1.5 rounded-lg text-[9px] font-black uppercase`}>
                                 {completedTopics.includes(i) ? 'Mastered' : 'Pending'}
                              </Badge>
                           </div>
                        ))}
                     </div>
                  </div>
               </Card>
            </TabsContent>

            <TabsContent value="cutoffs">
               <Card className="border-none shadow-2xl rounded-[4rem] bg-white p-16">
                  <div className="max-w-4xl mx-auto space-y-12">
                     <div className="text-center space-y-4">
                        <h2 className="text-4xl font-headline font-black text-[#0F172A] uppercase">Historical Cutoff Database</h2>
                        <p className="text-slate-500 font-medium text-lg italic">Category-wise minimum qualifying marks from previous recruitment cycles.</p>
                     </div>
                     <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                           <thead>
                              <tr className="border-b border-slate-100">
                                 <th className="py-6 px-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Exam Cycle</th>
                                 <th className="py-6 px-4 text-[10px] font-black uppercase tracking-widest text-[#0F172A]">Gen (Male)</th>
                                 <th className="py-6 px-4 text-[10px] font-black uppercase tracking-widest text-[#0F172A]">OBC / BC</th>
                                 <th className="py-6 px-4 text-[10px] font-black uppercase tracking-widest text-[#0F172A]">SC / ST</th>
                                 <th className="py-6 px-4 text-[10px] font-black uppercase tracking-widest text-emerald-600">Verification</th>
                              </tr>
                           </thead>
                           <tbody className="divide-y divide-slate-50">
                              {CUTOFFS.map((c, i) => (
                                 <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="py-8 px-4 font-headline font-black text-xl text-[#0F172A]">{c.year} Final</td>
                                    <td className="py-8 px-4 font-bold text-lg text-slate-600">{c.gen}</td>
                                    <td className="py-8 px-4 font-bold text-lg text-slate-600">{c.obc}</td>
                                    <td className="py-8 px-4 font-bold text-lg text-slate-600">{c.sc}</td>
                                    <td className="py-8 px-4">
                                       <Badge className="bg-emerald-50 text-emerald-600 border-none px-3 py-1 rounded-lg text-[9px] font-black uppercase">{c.status}</Badge>
                                    </td>
                                 </tr>
                              ))}
                           </tbody>
                        </table>
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
