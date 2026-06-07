
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
  Target, 
  Zap, 
  Loader2, 
  BrainCircuit, 
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  BarChart3,
  Clock,
  TrendingUp,
  Activity,
  Trophy,
  Users
} from "lucide-react"
import { useFirestore, useUser, useCollection } from "@/firebase"
import { collection, query, where, doc, getDoc, documentId, getDocs, orderBy } from "firebase/firestore"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import QuestionRenderer from "@/components/questions/QuestionRenderer"
import BackButton from "@/components/navigation/BackButton"

/**
 * @fileOverview Elite Institutional Results Hub v23.0.
 * Responsive Mastery: Optimized for 360px to 1440px+ viewports.
 * Features: Real-Time State Ranking, Sectional Mastery, and Percentile Audit.
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
  const [mockLanguageMode, setMockLanguageMode] = useState<any>('ENGLISH_PUNJABI')

  // 1. Fetch User Result
  const resultsQuery = useMemo(() => {
    if (!db || !user) return null
    return query(collection(db, "results"), where("userId", "==", user.uid))
  }, [db, user])

  const { data: rawResultDocs, loading: resultsLoading } = useCollection<any>(resultsQuery)
  
  // 2. Fetch Global Results for this mock to calculate Rank
  const globalResultsQuery = useMemo(() => {
    if (!db || !mockId) return null
    return query(collection(db, "results"), where("mockId", "==", mockId), orderBy("score", "desc"))
  }, [db, mockId])

  const { data: globalResults } = useCollection<any>(globalResultsQuery)

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

  // 3. Calculate Merit Stats
  const merit = useMemo(() => {
     if (!globalResults || !sessionData) return { rank: '?', total: 0, percentile: 0 };
     const rank = globalResults.findIndex((r: any) => r.score <= sessionData.score) + 1;
     const percentile = Math.round(((globalResults.length - rank) / (globalResults.length || 1)) * 100);
     return { rank, total: globalResults.length, percentile };
  }, [globalResults, sessionData]);

  useEffect(() => {
    async function loadQuestions() {
      if (!db || !sessionData || resultsLoading) {
        if (!sessionData) setLoadingContent(false);
        return;
      }

      setLoadingContent(true)
      try {
        const mockSnap = await getDoc(doc(db, "mocks", mockId))
        if (mockSnap.exists()) {
          const mData = mockSnap.data();
          setMockLanguageMode(mData.languageMode || 'ENGLISH_PUNJABI');
          const questionIds = mData.questionIds || []
          const fetchedQuestions: any[] = []
          
          const chunks = []
          for (let i = 0; i < questionIds.length; i += 30) {
            chunks.push(questionIds.slice(i, i + 30))
          }

          const chunkSnaps = await Promise.all(
            chunks.map(chunk => {
               if (!db) return Promise.resolve({ docs: [] });
               return getDocs(query(collection(db, "questions"), where(documentId(), "in", chunk)))
            })
          )

          chunkSnaps.forEach(snap => {
            snap.docs.forEach(d => fetchedQuestions.push({ ...d.data(), id: d.id }))
          })

          setQuestions(questionIds.map(id => fetchedQuestions.find(q => q.id === id)).filter(Boolean))
        }
      } catch (e) {
        toast({ variant: "destructive", title: "Sync Failure" })
      } finally {
        setLoadingContent(false)
      }
    }
    loadQuestions()
  }, [db, sessionData, mockId, toast, resultsLoading])

  const sectionalAudit = useMemo(() => {
     if (!questions.length || !sessionData) return [];
     const sections: Record<string, { total: number, correct: number }> = {};
     questions.forEach((q, i) => {
        const sid = q.sectionId || 'General';
        if (!sections[sid]) sections[sid] = { total: 0, correct: 0 };
        sections[sid].total++;
        const studentAns = sessionData.answers?.[i];
        if (studentAns !== undefined && ['A','B','C','D'][studentAns] === q.correctAnswer) {
           sections[sid].correct++;
        }
     });
     return Object.entries(sections).map(([name, data]) => ({
        name,
        accuracy: Math.round((data.correct / data.total) * 100),
        color: (data.correct / data.total) > 0.7 ? 'bg-emerald-500' : (data.correct / data.total) > 0.4 ? 'bg-amber-500' : 'bg-rose-500'
     }));
  }, [questions, sessionData]);

  if (resultsLoading || loadingContent) return (
    <div className="h-screen flex flex-col items-center justify-center bg-white space-y-6">
       <Loader2 className="h-10 w-10 text-primary animate-spin" />
       <p className="text-[12px] font-black uppercase tracking-[0.4em] text-primary">Auditing Merit Registry...</p>
    </div>
  )

  if (!sessionData) return (
    <div className="h-screen flex flex-col items-center justify-center bg-slate-50 p-6 space-y-8 text-left">
       <Trophy className="h-20 w-20 text-slate-200" />
       <p className="text-lg font-bold text-slate-400 uppercase tracking-widest text-center">No Result Found</p>
       <Button asChild className="rounded-2xl h-16 px-12 bg-[#0B1528] text-white font-black uppercase text-[11px] tracking-widest shadow-xl">
          <Link href="/mocks">Browse Mock Series</Link>
       </Button>
    </div>
  )

  return (
    <div className="flex flex-col min-h-screen bg-slate-50/50 font-body pb-32 text-left">
      <Navbar />
      
      <main className="container mx-auto px-4 md:px-6 py-6 md:py-12 max-w-6xl space-y-8 md:space-y-10 text-left animate-in fade-in duration-700">
        
        <div className="flex items-center gap-3">
           <BackButton label="Home" fallback="/dashboard" className="p-0 h-auto" />
           <div className="h-4 w-px bg-slate-200" />
           <div className="flex items-center gap-2">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Verified Result Sync Active</p>
           </div>
        </div>

        {/* 1. ELITE PERFORMANCE HEADER */}
        <Card className="border-none shadow-3xl rounded-[2rem] md:rounded-[3rem] overflow-hidden bg-white">
           <div className="h-2 w-full bg-primary" />
           <CardHeader className="p-6 md:p-16 border-b border-slate-50 space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 md:gap-8">
                 <div className="space-y-4">
                    <div className="flex items-center gap-3">
                       <ShieldCheck className="h-6 w-6 md:h-8 md:w-8 text-primary" />
                       <Badge className="bg-emerald-50 text-emerald-600 border-none px-3 md:px-4 py-1.5 rounded-xl font-black uppercase text-[8px] md:text-[10px] tracking-[0.2em] shadow-md">OFFICIAL AUDIT</Badge>
                    </div>
                    <CardTitle className="text-xl md:text-5xl font-headline font-black text-[#0F172A] uppercase leading-tight tracking-tight">
                       {sessionData.mockTitle}
                    </CardTitle>
                 </div>
                 
                 <div className="flex items-center justify-around md:justify-center gap-4 md:gap-8 bg-slate-50 p-5 md:p-8 rounded-[1.5rem] md:rounded-[2.5rem] border border-slate-100 shadow-inner w-full md:w-auto">
                    <div className="text-center space-y-0.5 md:space-y-1">
                       <p className="text-[8px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">STATE RANK</p>
                       <p className="text-2xl md:text-5xl font-headline font-black text-[#0F172A] leading-none">#{merit.rank}</p>
                       <p className="text-[7px] md:text-[9px] font-bold text-primary uppercase">OF {merit.total}</p>
                    </div>
                    <div className="h-10 md:h-16 w-px bg-slate-200" />
                    <div className="text-center space-y-0.5 md:space-y-1">
                       <p className="text-[8px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">PERCENTILE</p>
                       <p className="text-2xl md:text-5xl font-headline font-black text-emerald-600 leading-none">{merit.percentile}%</p>
                       <p className="text-[7px] md:text-[9px] font-bold text-slate-300 uppercase">Registry Index</p>
                    </div>
                 </div>
              </div>
           </CardHeader>

           <CardContent className="p-6 md:p-16 bg-slate-50/30">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-10">
                <MetricNode icon={<CheckCircle2 className="text-emerald-500 h-5 w-5 md:h-6 md:w-6" />} val={sessionData.score} label="CORRECT" sub="Audit Success" />
                <MetricNode icon={<XCircle className="text-rose-500 h-5 w-5 md:h-6 md:w-6" />} val={Object.keys(sessionData.answers).length - sessionData.score} label="WRONG" sub="Logic Gap" />
                <MetricNode icon={<Clock className="text-slate-400 h-5 w-5 md:h-6 md:w-6" />} val={`${Math.floor(sessionData.timeTaken / 60)}m`} label="TIME" sub="Pace Index" />
                <MetricNode icon={<Target className="text-primary h-5 w-5 md:h-6 md:w-6" />} val={`${sessionData.accuracy}%`} label="PRECISION" sub="Registry Rank" />
              </div>
           </CardContent>
        </Card>

        {/* 2. SECTIONAL PERFORMANCE MATRIX */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-10">
           <Card className="lg:col-span-8 border-none shadow-xl rounded-[2rem] md:rounded-[2.5rem] bg-white p-6 md:p-12 space-y-8 md:space-y-10">
              <div className="flex items-center gap-3 border-b border-slate-50 pb-4 md:pb-6">
                 <BarChart3 className="h-5 w-5 md:h-6 md:w-6 text-primary" />
                 <h3 className="text-lg md:text-2xl font-headline font-black uppercase text-[#0F172A]">Sectional Mastery Audit</h3>
              </div>
              <div className="space-y-6 md:space-y-8">
                 {sectionalAudit.map((s, i) => (
                    <div key={i} className="space-y-2 md:space-y-3">
                       <div className="flex justify-between items-center text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-400">
                          <span className="truncate max-w-[200px]">{s.name}</span>
                          <span className="text-[#0F172A]">{s.accuracy}%</span>
                       </div>
                       <div className="h-1.5 md:h-2 w-full bg-slate-50 rounded-full overflow-hidden shadow-inner">
                          <div className={cn("h-full transition-all duration-1000", s.color)} style={{ width: `${s.accuracy}%` }} />
                       </div>
                    </div>
                 ))}
              </div>
           </Card>

           <Card className="lg:col-span-4 border-none shadow-xl rounded-[2rem] md:rounded-[2.5rem] bg-[#0F172A] text-white p-8 md:p-10 space-y-8 md:space-y-10 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform"><TrendingUp className="h-32 md:h-48 w-32 md:w-48" /></div>
              <div className="relative z-10 space-y-6 md:space-y-8">
                 <div className="h-12 w-12 md:h-14 md:w-14 bg-white/10 rounded-2xl flex items-center justify-center text-primary shadow-2xl">
                    <Activity className="h-6 w-6 md:h-8 md:w-8" />
                 </div>
                 <div className="space-y-1.5 md:space-y-2">
                    <p className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em] text-primary">State Comparison</p>
                    <h4 className="text-2xl md:text-3xl font-headline font-black uppercase leading-tight">Mastery <br/> Index Analysis</h4>
                 </div>
                 <p className="text-slate-400 text-[13px] md:text-sm font-medium leading-relaxed">
                    Aspirants in the Top 10% average <strong>84% accuracy</strong> in {sectionalAudit[0]?.name || 'GK'}. Your current trajectory is <strong>{merit.percentile > 50 ? 'Above' : 'Below'} Average</strong>.
                 </p>
                 <Button asChild variant="outline" className="w-full h-12 md:h-14 border-white/10 bg-white/5 hover:bg-white/10 text-white rounded-xl font-black uppercase text-[10px] tracking-widest gap-2">
                    <Link href="/leaderboard"><Trophy className="h-4 w-4" /> View State Rankings</Link>
                 </Button>
              </div>
           </Card>
        </div>

        {/* 3. SOLUTION REVIEW HUB */}
        <div className="space-y-8 md:space-y-10">
           <div className="flex items-center justify-between border-b border-slate-200 pb-6 md:pb-8">
              <div className="space-y-1.5 md:space-y-2">
                 <h3 className="font-headline font-black text-xl md:text-3xl uppercase text-[#0F172A] flex items-center gap-3 md:gap-4">
                    <BrainCircuit className="h-6 w-6 md:h-8 md:w-8 text-primary" /> Rationale Review
                 </h3>
                 <p className="text-slate-400 font-medium text-[11px] md:text-sm">Audit every question node for logic validation.</p>
              </div>
           </div>
           
           <div className="grid grid-cols-1 gap-6 md:gap-8">
              {questions.map((q, idx) => {
                 const studentAnsIdx = sessionData.answers?.[idx];
                 const correctAnsIdx = ['A','B','C','D'].indexOf(q.correctAnswer);
                 const isCorrect = studentAnsIdx === correctAnsIdx;
                 const isSkipped = studentAnsIdx === undefined || studentAnsIdx === null;
                 const isExpanded = expandedQs[idx];

                 return (
                    <Card key={idx} className="border-none shadow-xl rounded-[1.5rem] md:rounded-[2.5rem] overflow-hidden bg-white group hover:shadow-2xl transition-all duration-300">
                       <div className={cn("h-1.5 md:h-2.5 w-full", isCorrect ? "bg-emerald-500" : isSkipped ? "bg-slate-200" : "bg-rose-500")} />
                       <CardContent className="p-6 md:p-12 space-y-8 md:space-y-10">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                             <div className="flex items-center gap-4 md:gap-6">
                                <div className="h-10 w-10 md:h-14 md:w-14 rounded-xl md:rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center font-black text-lg md:text-xl text-slate-400 group-hover:text-primary transition-colors shrink-0">
                                   {idx + 1}
                                </div>
                                <div className="space-y-1">
                                   <Badge className={cn(
                                     "border-none px-3 md:px-4 py-1 md:py-1.5 rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] shadow-sm",
                                     isCorrect ? "bg-emerald-50 text-emerald-600" : isSkipped ? "bg-slate-50 text-slate-400" : "bg-rose-50 text-rose-600"
                                   )}>
                                      {isCorrect ? 'REGISTRY SUCCESS' : isSkipped ? 'NOT ATTEMPTED' : 'LOGIC FAILURE'}
                                   </Badge>
                                   <p className="text-[8px] md:text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">{q.sectionId || 'General'}</p>
                                </div>
                             </div>
                             
                             <Button 
                                variant="ghost"
                                onClick={() => setExpandedQs(p => ({ ...p, [idx]: !p[idx] }))}
                                className="w-full sm:w-auto h-11 md:h-12 px-6 md:px-8 font-black uppercase text-[10px] tracking-widest gap-3 text-primary bg-primary/5 hover:bg-primary/10 rounded-xl transition-all active:scale-95"
                             >
                                {isExpanded ? "Hide Logic" : "Audit Rationale"}
                                {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                             </Button>
                          </div>

                          <div className="px-0 md:px-4 overflow-x-hidden">
                            <QuestionRenderer 
                                question={q} 
                                language={mockLanguageMode} 
                                showSolution={isExpanded} 
                                selectedAnswer={studentAnsIdx}
                                hideOptions={false}
                                className="border-none shadow-none p-0 bg-transparent"
                            />
                          </div>
                       </CardContent>
                    </Card>
                 )
              })}
           </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

function MetricNode({ icon, val, label, sub }: any) {
  return (
    <div className="space-y-2 md:space-y-4 p-5 md:p-8 bg-white rounded-[1.5rem] md:rounded-[2.5rem] border border-slate-100 shadow-sm text-center group hover:translate-y-[-6px] transition-all">
      <div className="h-10 w-10 md:h-14 md:w-14 bg-slate-50 rounded-xl md:rounded-2xl flex items-center justify-center mx-auto shadow-inner group-hover:scale-110 transition-transform">
         {icon}
      </div>
      <div className="space-y-0.5 md:space-y-1">
         <p className="text-2xl md:text-4xl font-headline font-black text-[#0F172A] tracking-tighter leading-none">{val}</p>
         <p className="text-[8px] md:text-[10px] font-black uppercase text-slate-500 tracking-widest mt-1 md:mt-2">{label}</p>
         <p className="text-[6px] md:text-[8px] font-bold text-slate-300 uppercase tracking-tighter hidden xs:block">{sub}</p>
      </div>
    </div>
  )
}
