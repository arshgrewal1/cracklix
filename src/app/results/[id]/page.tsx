"use client"

import { useState, useMemo, useEffect, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  CheckCircle2, 
  XCircle, 
  HelpCircle, 
  Trophy, 
  Target, 
  Zap, 
  LayoutDashboard, 
  Loader2, 
  TrendingUp, 
  BrainCircuit, 
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  History,
  Timer,
  ArrowRight,
  RefreshCw,
  LayoutGrid
} from "lucide-react"
import { useFirestore, useUser, useCollection } from "@/firebase"
import { collection, query, where, doc, getDoc, deleteDoc, documentId, getDocs } from "firebase/firestore"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import QuestionRenderer from "@/components/questions/QuestionRenderer"
import BackButton from "@/components/navigation/BackButton"

/**
 * @fileOverview Institutional Result Engine v5.1.
 * Optimized: High-density solution hub and instant re-attempt logic.
 */
export default function ResultPage() {
  const params = useParams()
  const router = useRouter()
  const mockId = params.id as string
  const db = useFirestore()
  const { user } = useUser()
  const { toast } = useToast()

  const [expandedQs, setExpandedQs] = useState<Record<number, boolean>>({})
  const [questions, setQuestions] = useState<any[]>([])
  const [loadingContent, setLoadingContent] = useState(true)

  const resultsQuery = useMemo(() => {
    if (!db || !user) return null
    return query(collection(db, "results"), where("userId", "==", user.uid))
  }, [db, user])

  const { data: rawResultDocs, loading: resultsLoading } = useCollection<any>(resultsQuery)
  
  const sessionData = useMemo(() => {
    if (!rawResultDocs || !mockId) return null
    const filtered = rawResultDocs.filter((r: any) => r.mockId === mockId);
    if (filtered.length === 0) return undefined;
    
    return filtered.sort((a: any, b: any) => {
         const tA = new Date(a.timestamp || 0).getTime()
         const tB = new Date(b.timestamp || 0).getTime()
         return tB - tA
      })[0]
  }, [rawResultDocs, mockId])

  useEffect(() => {
    async function loadQuestions() {
      if (resultsLoading) return;
      if (!sessionData) {
        setLoadingContent(false);
        return;
      }

      setLoadingContent(true)
      try {
        const mockSnap = await getDoc(doc(db, "mocks", mockId))
        if (mockSnap.exists()) {
          const questionIds = mockSnap.data().questionIds || []
          const fetchedQuestions: any[] = []
          
          const chunks = []
          for (let i = 0; i < questionIds.length; i += 30) {
            chunks.push(questionIds.slice(i, i + 30))
          }

          const chunkSnaps = await Promise.all(
            chunks.map(chunk => getDocs(query(collection(db, "questions"), where(documentId(), "in", chunk))))
          )

          chunkSnaps.forEach(snap => {
            snap.docs.forEach(d => fetchedQuestions.push({ ...d.data(), id: d.id }))
          })

          setQuestions(questionIds.map(id => fetchedQuestions.find(q => q.id === id)).filter(Boolean))
        }
      } catch (e) {
        toast({ variant: "destructive", title: "Content Sync Failure", description: "Could not load solution hub data." })
      } finally {
        setLoadingContent(false)
      }
    }
    loadQuestions()
  }, [db, sessionData, mockId, toast, resultsLoading])

  const handleReattempt = useCallback(async () => {
    if (!db || !user || !mockId) return;
    
    const confirmMsg = "CRITICAL AUDIT: Restart evaluation node? Current scores will be archived.";
    if (!window.confirm(confirmMsg)) return;

    // Instant non-blocking reset
    deleteDoc(doc(db, "attempts", `${user.uid}_${mockId}`)).catch(() => {});
    deleteDoc(doc(db, "results", `${user.uid}_${mockId}`)).catch(() => {});
    
    toast({ title: "Registry Reset", description: "Loading fresh attempt..." });
    router.push(`/mocks/${mockId}/instructions`);
  }, [db, user, mockId, router, toast]);

  const chartData = useMemo(() => {
    if (!sessionData?.subjectStats) return []
    return Object.entries(sessionData.subjectStats).map(([id, stats]: [string, any]) => ({
      name: String(id).replace(/-/g, ' ').toUpperCase(),
      accuracy: Math.round((stats.correct / (stats.attempted || 1)) * 100),
      score: `${stats.correct}/${stats.total}`
    })).sort((a, b) => b.accuracy - a.accuracy)
  }, [sessionData])

  if (resultsLoading || loadingContent) return (
    <div className="h-screen flex flex-col items-center justify-center bg-white space-y-6">
       <Loader2 className="h-10 w-10 text-primary animate-spin" />
       <div className="text-center space-y-1">
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Institutional Audit</p>
          <p className="text-sm font-bold text-slate-400">Syncing Results...</p>
       </div>
    </div>
  )

  if (!sessionData) return (
    <div className="h-screen flex flex-col items-center justify-center bg-slate-50 p-6">
       <Trophy className="h-20 w-20 text-slate-200 mb-6" />
       <h1 className="text-2xl font-headline font-black uppercase text-slate-300 tracking-tight text-center">Audit Trail Missing</h1>
       <p className="text-slate-400 text-sm font-medium mt-2 mb-8 uppercase tracking-widest">No previous attempts found for this series.</p>
       <Button asChild className="rounded-xl h-14 px-10 bg-[#0B1528] hover:bg-black text-white font-black uppercase tracking-widest text-xs shadow-2xl">
          <Link href="/mocks">Explore All Series</Link>
       </Button>
    </div>
  )

  return (
    <div className="flex flex-col min-h-screen bg-slate-50/50">
      <Navbar />
      <main className="container mx-auto px-4 py-4 md:py-8 max-w-7xl">
        <div className="flex items-center gap-4 mb-6">
           <BackButton label="Dashboard" fallback="/dashboard" />
           <div className="h-6 w-px bg-slate-200" />
           <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Audit Summary</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
          <div className="lg:col-span-8 space-y-6 md:space-y-8 text-left">
            <Card className="border-none shadow-3xl rounded-xl md:rounded-[2.5rem] overflow-hidden bg-white group">
               <div className="h-1.5 w-full bg-primary" />
               <CardHeader className="p-5 md:p-8 border-b border-slate-50 flex flex-col md:flex-row justify-between items-center gap-4">
                  <div className="space-y-2 text-center md:text-left">
                    <div className="flex items-center justify-center md:justify-start gap-3">
                       <ShieldCheck className="h-4 w-4 text-primary" />
                       <Badge className="bg-emerald-50 text-emerald-600 border-none px-2 py-0.5 rounded-lg font-black uppercase text-[7px] tracking-widest">AUDIT COMPLETE</Badge>
                    </div>
                    <CardTitle className="font-headline text-xl md:text-3xl font-black text-[#0F172A] uppercase leading-tight tracking-tight">{sessionData.mockTitle}</CardTitle>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                     <Button onClick={handleReattempt} className="bg-primary hover:bg-orange-600 text-white rounded-lg h-10 px-6 font-black uppercase text-[8px] tracking-widest shadow-lg transition-all active:scale-95 gap-2">
                        <RefreshCw className="h-3.5 w-3.5" /> Re-attempt
                     </Button>
                     <Button asChild className="bg-[#0F172A] hover:bg-black text-white rounded-lg h-10 px-6 font-black uppercase text-[8px] tracking-widest shadow-lg transition-all active:scale-95">
                        <Link href="/dashboard"><LayoutDashboard className="h-3.5 w-3.5 mr-2 text-primary" /> Dashboard</Link>
                     </Button>
                  </div>
               </CardHeader>
               <CardContent className="p-5 md:p-8">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center mb-8">
                    <ResultNode icon={<CheckCircle2 className="text-emerald-500 h-6 w-6" />} label="Correct" value={sessionData.score} color="text-emerald-600" />
                    <ResultNode icon={<XCircle className="text-rose-500 h-6 w-6" />} label="Incorrect" value={Object.keys(sessionData.answers).length - sessionData.score} color="text-rose-600" />
                    <ResultNode icon={<HelpCircle className="text-slate-300 h-6 w-6" />} label="Skipped" value={sessionData.totalQuestions - Object.keys(sessionData.answers).length} color="text-slate-400" />
                    <ResultNode icon={<Target className="text-primary h-6 w-6" />} label="Accuracy" value={`${sessionData.accuracy}%`} color="text-primary" />
                  </div>

                  <div className="space-y-4">
                     <h4 className="font-headline font-black text-sm md:text-xl uppercase tracking-tight border-b border-slate-100 pb-2 flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-primary" /> Mastery Index
                     </h4>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {chartData.length > 0 ? chartData.map((subj, i) => (
                           <div key={i} className="p-3 md:p-4 bg-slate-50/50 rounded-xl border border-slate-100 space-y-3 shadow-inner">
                              <div className="flex justify-between items-start">
                                 <div className="min-w-0 flex-1">
                                    <span className="text-[7px] font-black uppercase text-slate-400 tracking-widest block">SUBJECT NODE</span>
                                    <h5 className="text-[10px] md:text-xs font-black text-[#0B1528] uppercase truncate">{subj.name}</h5>
                                 </div>
                                 <span className={cn("text-sm md:text-base font-headline font-black ml-2", subj.accuracy > 70 ? "text-emerald-600" : "text-rose-500")}>{subj.accuracy}%</span>
                              </div>
                              <div className="h-1 w-full bg-slate-200 rounded-full overflow-hidden">
                                 <div className={cn("h-full transition-all duration-1000", subj.accuracy > 70 ? "bg-emerald-500" : "bg-rose-500")} style={{ width: `${subj.accuracy}%` }} />
                              </div>
                           </div>
                        )) : <div className="col-span-full py-6 text-center opacity-30 italic text-xs">Registry nodes not detected.</div>}
                     </div>
                  </div>
               </CardContent>
            </Card>

            <div className="space-y-4 md:space-y-6">
               <div className="flex items-center justify-between px-1">
                  <h3 className="font-headline font-black text-xl md:text-2xl uppercase flex items-center gap-3">
                     <BrainCircuit className="h-6 w-6 text-primary" /> Solutions Hub
                  </h3>
               </div>
               
               <div className="space-y-4">
                  {questions.map((q, idx) => {
                     const studentAnsIdx = sessionData.answers?.[idx] !== undefined 
                       ? sessionData.answers[idx] 
                       : sessionData.answers?.[idx.toString()];

                     const correctAnsIdx = ['A','B','C','D'].indexOf(q.correctAnswer);
                     const isCorrect = studentAnsIdx === correctAnsIdx;
                     const isSkipped = studentAnsIdx === undefined || studentAnsIdx === null;
                     const isExpanded = expandedQs[idx];

                     return (
                        <Card key={idx} className="border-none shadow-lg rounded-xl md:rounded-[2rem] overflow-hidden bg-white">
                           <div className={cn("h-1 w-full", isCorrect ? "bg-emerald-500" : isSkipped ? "bg-slate-200" : "bg-rose-500")} />
                           <CardContent className="p-4 md:p-6 space-y-4">
                              <div className="flex items-center justify-between">
                                 <div className="flex items-center gap-3">
                                    <div className={cn(
                                       "h-8 w-8 md:h-9 md:w-9 rounded-lg flex items-center justify-center shadow-md font-black text-xs md:text-sm transition-all",
                                       isCorrect ? "bg-emerald-500 text-white" : isSkipped ? "bg-slate-100 text-slate-300" : "bg-rose-500 text-white"
                                    )}>
                                       {idx + 1}
                                    </div>
                                    <div className="text-left">
                                       <Badge className={cn("border-none px-1 py-0.5 rounded text-[6px] font-black uppercase tracking-widest", isCorrect ? "bg-emerald-50 text-emerald-600" : isSkipped ? "bg-slate-100 text-slate-400" : "bg-rose-50 text-rose-600")}>
                                          {isCorrect ? 'Correct' : isSkipped ? 'Skipped' : 'Mismatched'}
                                       </Badge>
                                    </div>
                                 </div>
                                 <p className="text-[7px] font-black uppercase text-slate-400">Section: {q.sectionId || q.subjectId || 'Audit'}</p>
                              </div>

                              <div className="text-left">
                                 <QuestionRenderer 
                                   question={q} 
                                   language="bilingual" 
                                   showSolution={isExpanded} 
                                   selectedAnswer={studentAnsIdx}
                                 />
                              </div>

                              <div className="pt-2 flex justify-center">
                                 <Button 
                                    onClick={() => setExpandedQs(p => ({ ...p, [idx]: !p[idx] }))}
                                    className={cn(
                                       "rounded-xl h-10 px-8 md:px-12 font-black uppercase text-[8px] md:text-[9px] tracking-[0.2em] gap-2 shadow-sm transition-all",
                                       isExpanded ? "bg-slate-900 text-white" : "bg-primary text-white hover:bg-orange-600 shadow-orange-500/20"
                                    )}
                                 >
                                    {isExpanded ? "Hide Solution" : "View Full Solution"}
                                    {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <BrainCircuit className="h-3.5 w-3.5" />}
                                 </Button>
                              </div>
                           </CardContent>
                        </Card>
                     )
                  })}
               </div>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-6">
             <Card className="border-none bg-[#0F172A] text-white shadow-xl rounded-xl md:rounded-[2rem] p-6 md:p-10 text-center space-y-6 overflow-hidden relative">
                <div className="relative z-10 space-y-4">
                   <Target className="h-8 w-8 text-primary mx-auto shadow-2xl" />
                   <div className="space-y-1">
                      <p className="text-[8px] font-black uppercase tracking-[0.3em] text-primary">Probability Index</p>
                      <h3 className="text-4xl md:text-5xl font-headline font-black text-white tracking-tighter leading-none">{Math.min(98, sessionData.accuracy + 10)}%</h3>
                   </div>
                   <p className="text-slate-400 font-medium text-[10px] md:text-xs italic leading-relaxed px-2">
                      Ready for the official merit registry.
                   </p>
                   <Button asChild className="w-full h-10 bg-white text-black hover:bg-slate-100 font-black uppercase tracking-widest text-[8px] rounded-lg shadow-xl"><Link href="/dashboard">View Rankings</Link></Button>
                </div>
             </Card>

             <Card className="border-none shadow-lg rounded-xl bg-white p-6 space-y-4 text-left">
                <h4 className="font-headline font-black text-sm uppercase tracking-tight flex items-center gap-2"><Zap className="h-4 w-4 text-primary" /> Audit Meta</h4>
                <div className="space-y-3 pt-2 border-t border-slate-50">
                   <SummaryRow label="Time" value={`${Math.floor(sessionData.timeTaken / 60)}m ${sessionData.timeTaken % 60}s`} />
                   <SummaryRow label="Date" value={new Date(sessionData.timestamp).toLocaleDateString('en-GB')} />
                   <SummaryRow label="Evaluation" value={sessionData.accuracy > 45 ? "QUALIFIED" : "FAIL"} color={sessionData.accuracy > 45 ? "text-emerald-600" : "text-rose-600"} />
                </div>
             </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

function ResultNode({ icon, label, value, color }: any) {
  return (
    <div className="space-y-1">
      <div className="flex justify-center">{icon}</div>
      <p className={cn("text-xl md:text-2xl font-headline font-black tracking-tighter leading-none", color)}>{value}</p>
      <p className="text-[6px] md:text-[8px] font-black uppercase text-slate-400 tracking-widest">{label}</p>
    </div>
  )
}

function SummaryRow({ label, value, color }: any) {
   return (
      <div className="flex justify-between items-center text-[8px] md:text-[10px] uppercase font-black">
         <span className="text-slate-400">{label}</span>
         <span className={cn(color || "text-[#0F172A]")}>{value}</span>
      </div>
   )
}
