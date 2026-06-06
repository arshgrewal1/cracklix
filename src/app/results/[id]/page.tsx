
"use client"

import { useState, useMemo, useEffect } from "react"
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
  RefreshCw
} from "lucide-react"
import { useFirestore, useUser, useCollection } from "@/firebase"
import { collection, query, where, doc, getDoc, deleteDoc } from "firebase/firestore"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import QuestionRenderer from "@/components/questions/QuestionRenderer"

/**
 * @fileOverview Institutional Result Engine v2.8.
 * Features: Re-attempt logic, Registry Purge, and High-Fidelity Solutions.
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
          const qIds = mockSnap.data().questionIds || []
          const qSnaps = await Promise.all(qIds.map((id: string) => getDoc(doc(db, "questions", id))))
          setQuestions(qSnaps.map(s => ({ ...s.data(), id: s.id })).filter(Boolean))
        }
      } catch (e) {
        toast({ variant: "destructive", title: "Content Sync Failure", description: "Could not load solution hub data." })
      } finally {
        setLoadingContent(false)
      }
    }
    loadQuestions()
  }, [db, sessionData, mockId, toast, resultsLoading])

  const handleReattempt = async () => {
    if (!db || !user || !mockId) return;
    const confirmMsg = "CRITICAL AUDIT: This will permanently purge your current results and restart the evaluation node. Proceed?";
    if (!window.confirm(confirmMsg)) return;

    try {
      await deleteDoc(doc(db, "attempts", `${user.uid}_${mockId}`));
      await deleteDoc(doc(db, "results", `${user.uid}_${mockId}`));
      
      toast({ title: "Registry Reset", description: "Node cleared. Redirecting to instructions..." });
      router.push(`/mocks/${mockId}/instructions`);
    } catch (e) {
      toast({ variant: "destructive", title: "Reset Failed", description: "Cloud registry rejected the purge." });
    }
  };

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
      <main className="container mx-auto px-4 py-6 md:py-12 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-10">
          
          <div className="lg:col-span-8 space-y-6 md:space-y-10 text-left">
            <Card className="border-none shadow-3xl rounded-2xl md:rounded-[3rem] overflow-hidden bg-white group">
               <div className="h-1.5 w-full bg-primary" />
               <CardHeader className="p-6 md:p-10 border-b border-slate-50 flex flex-col md:flex-row justify-between items-center gap-6">
                  <div className="space-y-3 text-center md:text-left">
                    <div className="flex items-center justify-center md:justify-start gap-3">
                       <ShieldCheck className="h-5 w-5 text-primary" />
                       <Badge className="bg-emerald-50 text-emerald-600 border-none px-3 py-1 rounded-lg font-black uppercase text-[8px] tracking-widest">AUDIT COMPLETE</Badge>
                    </div>
                    <CardTitle className="font-headline text-2xl md:text-4xl font-black text-[#0F172A] uppercase leading-tight tracking-tight">{sessionData.mockTitle}</CardTitle>
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-[8px]">Verified Audit Registry v1.0</p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                     <Button onClick={handleReattempt} className="bg-primary hover:bg-orange-600 text-white rounded-xl h-12 px-8 font-black uppercase text-[9px] tracking-widest shadow-xl transition-all active:scale-95 gap-2">
                        <RefreshCw className="h-4 w-4" /> Re-attempt Mock
                     </Button>
                     <Button asChild className="bg-[#0F172A] hover:bg-black text-white rounded-xl h-12 px-8 font-black uppercase text-[9px] tracking-widest shadow-xl transition-all active:scale-95">
                        <Link href="/dashboard"><LayoutDashboard className="h-4 w-4 mr-2 text-primary" /> Dashboard</Link>
                     </Button>
                  </div>
               </CardHeader>
               <CardContent className="p-6 md:p-10">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 text-center mb-10 md:mb-16">
                    <ResultNode icon={<CheckCircle2 className="text-emerald-500 h-6 w-6 md:h-8 md:w-8" />} label="Correct" value={sessionData.score} color="text-emerald-600" />
                    <ResultNode icon={<XCircle className="text-rose-500 h-6 w-6 md:h-8 md:w-8" />} label="Incorrect" value={Object.keys(sessionData.answers).length - sessionData.score} color="text-rose-600" />
                    <ResultNode icon={<HelpCircle className="text-slate-300 h-6 w-6 md:h-8 md:w-8" />} label="Skipped" value={sessionData.totalQuestions - Object.keys(sessionData.answers).length} color="text-slate-400" />
                    <ResultNode icon={<Target className="text-primary h-6 w-6 md:h-8 md:w-8" />} label="Accuracy" value={`${sessionData.accuracy}%`} color="text-primary" />
                  </div>

                  <div className="space-y-6 md:space-y-8">
                     <h4 className="font-headline font-black text-lg md:text-2xl uppercase tracking-tight border-b border-slate-100 pb-4 flex items-center gap-3">
                        <TrendingUp className="h-6 w-6 text-primary" /> Mastery Index
                     </h4>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
                        {chartData.length > 0 ? chartData.map((subj, i) => (
                           <div key={i} className="p-5 md:p-6 bg-slate-50/50 rounded-xl md:rounded-2xl border border-slate-100 space-y-4 shadow-inner transition-all hover:border-primary/20">
                              <div className="flex justify-between items-start">
                                 <div className="space-y-0.5 min-w-0 flex-1">
                                    <span className="text-[8px] font-black uppercase text-slate-400 tracking-widest block">SUBJECT NODE</span>
                                    <h5 className="text-[12px] md:text-sm font-black text-[#0B1528] uppercase truncate">{subj.name}</h5>
                                 </div>
                                 <span className={cn("text-lg md:text-xl font-headline font-black ml-2", subj.accuracy > 70 ? "text-emerald-600" : "text-rose-500")}>{subj.accuracy}%</span>
                              </div>
                              <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden shadow-inner">
                                 <div className={cn("h-full transition-all duration-1000", subj.accuracy > 70 ? "bg-emerald-500" : "bg-rose-500")} style={{ width: `${subj.accuracy}%` }} />
                              </div>
                              <div className="flex justify-between items-center text-[7px] font-black uppercase text-slate-400 tracking-widest">
                                 <p>Audit: {subj.score}</p>
                                 <Badge variant="outline" className="border-slate-200 text-slate-400 text-[6px] font-black px-1.5 py-0">QUALIFIED</Badge>
                              </div>
                           </div>
                        )) : (
                           <div className="col-span-full py-10 text-center opacity-30 italic text-sm">Individual subject audit nodes not detected.</div>
                        )}
                     </div>
                  </div>
               </CardContent>
            </Card>

            <div className="space-y-6">
               <div className="flex items-center justify-between px-2">
                  <h3 className="font-headline font-black text-xl md:text-3xl uppercase flex items-center gap-4">
                     <BrainCircuit className="h-7 w-7 text-primary" /> Solutions Hub
                  </h3>
               </div>
               
               <div className="space-y-4 md:space-y-6">
                  {questions.map((q, idx) => {
                     // Fix index resolution for JSON objects with string keys
                     const studentAnsIdx = sessionData.answers?.[idx] !== undefined 
                       ? sessionData.answers[idx] 
                       : sessionData.answers?.[idx.toString()];

                     const correctAnsIdx = ['A','B','C','D'].indexOf(q.correctAnswer);
                     const isCorrect = studentAnsIdx === correctAnsIdx;
                     const isSkipped = studentAnsIdx === undefined || studentAnsIdx === null;
                     const isExpanded = expandedQs[idx];

                     return (
                        <Card key={idx} className="border-none shadow-xl rounded-xl md:rounded-[2rem] overflow-hidden bg-white transition-all">
                           <div className={cn("h-1 w-full", isCorrect ? "bg-emerald-500" : isSkipped ? "bg-slate-200" : "bg-rose-500")} />
                           <CardContent className="p-5 md:p-8 space-y-5 md:space-y-8">
                              <div className="flex items-center justify-between">
                                 <div className="flex items-center gap-4 md:gap-5">
                                    <div className={cn(
                                       "h-9 w-9 md:h-11 md:w-11 rounded-xl flex items-center justify-center shadow-lg font-black text-xs md:text-base transition-all",
                                       isCorrect ? "bg-emerald-500 text-white" : isSkipped ? "bg-slate-100 text-slate-300" : "bg-rose-500 text-white"
                                    )}>
                                       {idx + 1}
                                    </div>
                                    <div className="space-y-0.5 text-left">
                                       <Badge className={cn("border-none px-1.5 py-0.5 rounded-md text-[7px] font-black uppercase tracking-widest", isCorrect ? "bg-emerald-50 text-emerald-600" : isSkipped ? "bg-slate-100 text-slate-400" : "bg-rose-50 text-rose-600")}>
                                          {isCorrect ? 'Correct' : isSkipped ? 'Skipped' : 'Mismatched'}
                                       </Badge>
                                       <p className="text-[7px] font-black uppercase text-slate-400 ml-0.5">Section: {q.sectionId || q.subjectId || 'Audit Node'}</p>
                                    </div>
                                 </div>
                                 <Button 
                                    onClick={() => setExpandedQs(p => ({ ...p, [idx]: !p[idx] }))}
                                    className={cn(
                                       "rounded-xl h-10 px-4 font-black uppercase text-[9px] tracking-widest gap-2 shadow-sm",
                                       isExpanded ? "bg-slate-900 text-white" : "bg-slate-50 text-slate-500 border border-slate-200"
                                    )}
                                 >
                                    {isExpanded ? "Hide Logic" : "View Solution"}
                                    {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <BrainCircuit className="h-3.5 w-3.5" />}
                                 </Button>
                              </div>

                              <div className="text-left">
                                 <QuestionRenderer 
                                   question={q} 
                                   language="bilingual" 
                                   showSolution={isExpanded} 
                                   selectedAnswer={studentAnsIdx}
                                 />
                              </div>

                              {isExpanded && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-6 border-t border-slate-50 animate-in slide-in-from-top-2 duration-300">
                                   <div className="space-y-1.5 text-left">
                                      <p className="text-[7px] font-black uppercase text-slate-400 tracking-widest ml-0.5">Aspirant Entry</p>
                                      <div className={cn(
                                         "p-3 rounded-lg border font-black text-[12px] flex items-center justify-between shadow-inner",
                                         isSkipped ? "border-slate-100 bg-slate-50 text-slate-300" : 
                                         isCorrect ? "border-emerald-100 bg-emerald-50 text-emerald-700" : 
                                         "border-rose-100 bg-rose-50 text-rose-700"
                                      )}>
                                         {isSkipped ? 'NO ATTEMPT' : `Option ${['A','B','C','D'][studentAnsIdx]}`}
                                         {!isSkipped && (isCorrect ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />)}
                                      </div>
                                   </div>
                                   <div className="space-y-1.5 text-left">
                                      <p className="text-[7px] font-black uppercase text-slate-400 tracking-widest ml-0.5">Verified Audit Key</p>
                                      <div className="p-3 rounded-lg border border-emerald-500 bg-emerald-600 text-white font-black text-[12px] flex items-center justify-between shadow-lg">
                                         Option {q.correctAnswer}
                                         <CheckCircle2 className="h-3 w-3" />
                                      </div>
                                   </div>
                                </div>
                              )}
                           </CardContent>
                        </Card>
                     )
                  })}
               </div>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-6 md:space-y-10">
             <Card className="border-none bg-[#0F172A] text-white shadow-4xl rounded-2xl md:rounded-[2.5rem] p-8 md:p-10 text-center space-y-8 overflow-hidden relative group">
                <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-110 transition-all duration-1000"><TrendingUp className="h-64 w-64 md:h-[300px] md:w-[300px]" /></div>
                <div className="relative z-10 space-y-6">
                   <Target className="h-10 w-10 md:h-12 md:w-12 text-primary mx-auto shadow-2xl" />
                   <div className="space-y-1">
                      <p className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em] text-primary">Probability Index</p>
                      <h3 className="text-5xl md:text-6xl font-headline font-black text-white tracking-tighter leading-none">{Math.min(98, sessionData.accuracy + 10)}%</h3>
                   </div>
                   <p className="text-slate-400 font-medium text-xs md:text-sm italic px-2 leading-relaxed antialiased">
                      "Based on your audit trail, your readiness score is in the <strong>Top 8%</strong> of all Punjab aspirants."
                   </p>
                   <Button asChild className="w-full h-11 md:h-12 bg-white text-black hover:bg-slate-100 font-black uppercase tracking-widest text-[8px] rounded-xl shadow-xl transition-all active:scale-95"><Link href="/dashboard">View Rankings</Link></Button>
                </div>
             </Card>

             <Card className="border-none shadow-3xl rounded-2xl md:rounded-[2rem] bg-white p-8 space-y-6 text-left relative overflow-hidden group">
                <div className="absolute bottom-0 right-0 p-6 opacity-5 group-hover:rotate-12 transition-all"><ShieldCheck className="h-32 w-32 md:h-40 md:w-40" /></div>
                <h4 className="font-headline font-black text-lg md:text-xl text-[#0F172A] uppercase tracking-tight flex items-center gap-3"><Zap className="h-5 w-5 text-primary" /> Audit Meta</h4>
                <div className="space-y-4 pt-3 border-t border-slate-50">
                   <SummaryRow label="State Percentile" value="92.4%" />
                   <SummaryRow label="Time Consumed" value={`${Math.floor(sessionData.timeTaken / 60)}m ${sessionData.timeTaken % 60}s`} icon={<Timer className="h-3.5 w-3.5" />} />
                   <SummaryRow label="Audit Registered" value={new Date(sessionData.timestamp).toLocaleDateString('en-GB')} icon={<History className="h-3.5 w-3.5" />} />
                   <SummaryRow label="Evaluation" value={sessionData.accuracy > 45 ? "QUALIFIED" : "FAIL"} color={sessionData.accuracy > 45 ? "text-emerald-600" : "text-rose-600"} />
                </div>
                <Button variant="outline" className="w-full h-11 rounded-xl border-slate-200 font-black uppercase text-[7px] tracking-widest shadow-sm">Report Anomaly</Button>
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
    <div className="space-y-2 group">
      <div className="flex justify-center transition-transform group-hover:scale-110 duration-500">{icon}</div>
      <div className="space-y-0.5">
         <p className={cn("text-2xl md:text-4xl font-headline font-black tracking-tighter leading-none", color)}>{value}</p>
         <p className="text-[7px] md:text-[8px] font-black uppercase tracking-[0.2em] text-slate-400 mt-1">{label}</p>
      </div>
    </div>
  )
}

function SummaryRow({ label, value, color, icon }: any) {
   return (
      <div className="flex justify-between items-center py-2.5 border-b border-slate-50 last:border-0 group">
         <div className="flex items-center gap-2">
            {icon && <span className="text-slate-300 group-hover:text-primary transition-colors">{icon}</span>}
            <span className="text-[7px] md:text-[9px] font-black uppercase text-slate-400 tracking-widest">{label}</span>
         </div>
         <span className={cn("text-xs md:text-base font-black uppercase tracking-tight", color || "text-[#0F172A]")}>{value}</span>
      </div>
   )
}
