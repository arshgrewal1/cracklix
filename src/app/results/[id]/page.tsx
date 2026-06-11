"use client"

import { useState, useMemo, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  CheckCircle2, 
  Target, 
  Zap, 
  Loader2, 
  BrainCircuit, 
  ShieldCheck,
  BarChart3,
  Trophy,
  RefreshCw,
  Share2,
  X,
  Clock,
  Printer,
  AlertCircle,
  Lock,
  ChevronLeft,
  XCircle,
  HelpCircle,
  Users,
  Medal,
  Award
} from "lucide-react"
import { useUser, useFirestore, useCollection } from "@/firebase"
import { collection, query, where, doc, getDoc, documentId, getDocs, limit, orderBy } from "firebase/firestore"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import QuestionRenderer from "@/components/questions/QuestionRenderer"
import StudentAvatar from "@/components/brand/StudentAvatar"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

/**
 * @fileOverview Test Results Hub v19.0 (Production Hardened).
 * UPDATED: Optimized percentile and rank calculations for institutional accuracy.
 * FIXED: High-fidelity breakdown display for scores and time taken.
 */

const SUPER_ADMIN_WHITELIST = ['arshdeepgrewal1122@gmail.com'];

export default function ResultPage() {
  const params = useParams()
  const router = useRouter()
  const mockId = params.id as string
  const db = useFirestore()
  const { user, profile } = useUser()
  const { toast } = useToast()

  const [questions, setQuestions] = useState<any[]>([])
  const [mockData, setMockData] = useState<any>(null)
  const [loadingContent, setLoadingContent] = useState(true)
  const [activeReviewFilter, setActiveReviewFilter] = useState<'ALL' | 'CORRECT' | 'WRONG' | 'SKIPPED'>('ALL')
  const [isShareOpen, setIsShareOpen] = useState(false)
  const [isLocked, setIsLocked] = useState(false);

  // 1. FETCH USER RESULT
  const resultsQuery = useMemo(() => {
    if (!db || !user) return null
    return query(collection(db, "results"), where("userId", "==", user.uid), where("mockId", "==", mockId), limit(1))
  }, [db, user, mockId])

  const { data: rawResultDocs, loading: resultsLoading } = useCollection<any>(resultsQuery)
  
  const sessionData = useMemo(() => {
    if (!rawResultDocs || rawResultDocs.length === 0) return null
    return rawResultDocs[0]
  }, [rawResultDocs])

  // 2. FETCH GLOBAL BENCHMARKS
  const globalResultsQuery = useMemo(() => {
    if (!db || !mockId) return null
    return query(collection(db, "results"), where("mockId", "==", mockId), limit(500))
  }, [db, mockId])

  const { data: rawGlobalResults } = useCollection<any>(globalResultsQuery)

  const sortedGlobalResults = useMemo(() => {
    if (!rawGlobalResults) return [];
    return [...rawGlobalResults].sort((a, b) => (b.score || 0) - (a.score || 0));
  }, [rawGlobalResults]);

  const merit = useMemo(() => {
     if (!sortedGlobalResults || sortedGlobalResults.length === 0 || !sessionData) {
        return { rank: '?', total: 0, percentile: 0, topper: null };
     }
     const rank = sortedGlobalResults.findIndex((r: any) => r.userId === user?.uid) + 1;
     const actualRank = rank > 0 ? rank : 1;
     const total = sortedGlobalResults.length;
     
     // Competitive Percentile Formula: ((Total - Rank + 1) / Total) * 100
     const percentile = total > 0 ? Math.round(((total - actualRank + 1) / (total || 1)) * 1000) / 10 : 0;
     const topper = sortedGlobalResults[0];
     
     return { rank: actualRank, total, percentile, topper };
  }, [sortedGlobalResults, sessionData, user]);

  // 3. LOAD QUESTIONS FOR REVIEW
  useEffect(() => {
    async function loadQuestions() {
      if (!db || !sessionData || !mockId) {
        if (!resultsLoading && !sessionData) setLoadingContent(false);
        return;
      }

      setLoadingContent(true)
      try {
        const mockSnap = await getDoc(doc(db, "mocks", mockId))
        if (mockSnap.exists()) {
          const mData = mockSnap.data();
          setMockData(mData);

          const tier = (mData.accessLevel || mData.accessType || 'FREE').trim().toUpperCase();
          const isPremium = tier === 'PREMIUM';
          const userEmail = user?.email?.toLowerCase();
          const isFounder = userEmail && SUPER_ADMIN_WHITELIST.includes(userEmail);
          const isAdmin = profile?.role === 'ADMIN' || profile?.role === 'SUPER_ADMIN' || isFounder;
          
          let hasActivePass = false;
          if (isAdmin) hasActivePass = true;
          else if (profile?.pass && profile.pass.active === true) {
             const expiry = new Date(profile.pass.expiryDate);
             if (expiry > new Date()) hasActivePass = true;
          }

          if (isPremium && !hasActivePass) {
             setIsLocked(true);
             setLoadingContent(false);
             return;
          }
          
          const questionIds = mData.questionIds || []
          const fetchedQuestions: any[] = []
          const chunks = []
          for (let i = 0; i < questionIds.length; i += 30) {
            chunks.push(questionIds.slice(i, i + 30))
          }

          const chunkSnaps = await Promise.all(
            chunks.map(chunk => getDocs(query(collection(db, "questions"), where(documentId(), "in", chunk))))
          )

          const allFetched: any[] = []
          chunkSnaps.forEach(snap => snap.docs.forEach(d => allFetched.push({ ...d.data(), id: d.id })))
          setQuestions(questionIds.map(id => allFetched.find(q => q.id === id)).filter(Boolean))
        }
      } finally {
        setLoadingContent(false)
      }
    }
    loadQuestions()
  }, [db, sessionData, mockId, resultsLoading, profile, user]);

  const filteredQuestions = useMemo(() => {
     return questions.map((q, i) => ({ ...q, index: i })).filter((q) => {
        const ans = sessionData?.answers?.[q.index];
        const isCorrect = ans !== undefined && ['A','B','C','D'][ans] === q.correctAnswer;
        
        if (activeReviewFilter === 'ALL') return true;
        if (activeReviewFilter === 'CORRECT') return isCorrect;
        if (activeReviewFilter === 'WRONG') return ans !== undefined && !isCorrect;
        if (activeReviewFilter === 'SKIPPED') return ans === undefined || ans === null;
        return true;
     });
  }, [questions, sessionData, activeReviewFilter]);

  if (resultsLoading || loadingContent) return <div className="h-screen flex items-center justify-center bg-white"><Loader2 className="h-10 w-10 text-primary animate-spin" /></div>

  if (isLocked) {
     return (
        <div className="min-h-screen bg-slate-50">
           <Navbar />
           <main className="container mx-auto px-6 py-24 flex flex-col items-center justify-center text-center max-w-xl">
              <div className="h-32 w-32 bg-amber-50 rounded-[3rem] flex items-center justify-center mb-10 text-amber-500 shadow-2xl">
                 <Lock className="h-16 w-16" />
              </div>
              <h1 className="text-4xl font-headline font-black text-[#0F172A] uppercase mb-4">Elite Pass Required</h1>
              <p className="text-lg text-slate-500 font-medium leading-relaxed mb-10">
                 Detailed solutions and performance rationalizations for this Premium Test are restricted to Elite Pass holders.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 w-full">
                 <Button asChild className="flex-1 h-16 bg-primary hover:bg-orange-600 text-white font-black uppercase text-[11px] tracking-widest rounded-2xl shadow-xl">
                    <Link href="/pass">Unlock Premium Hub</Link>
                 </Button>
                 <Button asChild variant="outline" className="flex-1 h-16 border-slate-200 text-slate-600 font-black uppercase text-[11px] tracking-widest rounded-2xl">
                    <Link href="/dashboard">Back to Dashboard</Link>
                 </Button>
              </div>
           </main>
           <Footer />
        </div>
     )
  }

  if (!sessionData) return (
     <div className="h-screen flex flex-col items-center justify-center text-center bg-white p-6 space-y-6">
        <AlertCircle className="h-12 w-12 text-slate-200" />
        <h2 className="text-2xl font-headline font-black uppercase">Result Synced Incorrectly</h2>
        <p className="text-slate-400 max-w-xs">We could not find your attempt result in the registry. Please try re-taking the test.</p>
        <Button asChild className="bg-[#0F172A] text-white rounded-xl h-12 px-8"><Link href="/dashboard">Return Home</Link></Button>
     </div>
  );

  const isNegativeScore = sessionData.score < 0;

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 font-body pb-safe text-left print:bg-white print:pb-0">
      <Navbar />
      <main className="container mx-auto px-4 md:px-6 py-6 md:py-12 max-w-7xl space-y-8 md:space-y-12">
        
        {/* SUMMARY CARD */}
        <Card className="border-none shadow-5xl rounded-[2.5rem] bg-[#0B1528] text-white overflow-hidden relative">
           <CardContent className="p-8 md:p-14 lg:p-16 space-y-10 relative z-10">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-10">
                 <div className="space-y-6 flex-1 text-left">
                    <h1 className="text-3xl md:text-5xl lg:text-6xl font-headline font-black uppercase leading-[0.95] tracking-tight">{sessionData.mockTitle}</h1>
                    <div className="flex flex-wrap gap-3">
                       <Button asChild className="bg-primary hover:bg-orange-600 text-white font-black uppercase text-[10px] tracking-widest h-12 px-6 rounded-xl shadow-xl border-none">
                          <Link href={`/mocks/${mockId}/instructions`}><RefreshCw className="h-4 w-4 mr-2" /> Re-attempt</Link>
                       </Button>
                       <Button onClick={() => setIsShareOpen(true)} className="bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase text-[10px] tracking-widest h-12 px-6 rounded-xl shadow-xl border-none">
                          <Share2 className="h-4 w-4 mr-2" /> Share Result
                       </Button>
                    </div>
                 </div>
                 
                 <div className="flex items-center gap-8 bg-white/5 backdrop-blur-3xl p-8 rounded-[2.5rem] border border-white/10 shadow-5xl">
                    <div className="text-center min-w-[100px] space-y-1">
                       <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">RANK</p>
                       <p className="text-3xl md:text-5xl font-headline font-black text-primary leading-none">#{merit.rank}</p>
                    </div>
                    <div className="h-16 w-px bg-white/10" />
                    <div className="text-center min-w-[100px] space-y-1">
                       <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">ACCURACY</p>
                       <p className="text-3xl md:text-5xl font-headline font-black text-emerald-400 leading-none">{sessionData.accuracy}%</p>
                    </div>
                 </div>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 pt-10 border-t border-white/5">
                 <div className="text-left space-y-1">
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">TOTAL SCORE</p>
                    <p className={cn("text-3xl md:text-5xl font-headline font-black", isNegativeScore ? "text-rose-500" : "text-primary")}>
                       {parseFloat(sessionData.score || 0).toFixed(2)}
                    </p>
                    {isNegativeScore && <Badge className="bg-rose-500/20 text-rose-400 border-none text-[8px] font-black uppercase px-2 py-0.5 mt-1">Penalty Zone</Badge>}
                 </div>
                 <div className="text-left space-y-1">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">ATTEMPTED</p>
                    <p className="text-3xl md:text-5xl font-headline font-black text-blue-400">{sessionData.attemptedCount}/{sessionData.totalQuestions}</p>
                 </div>
                 <div className="text-left space-y-1">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">TIME USED</p>
                    <p className="text-3xl md:text-5xl font-headline font-black text-white tabular-nums">
                       {Math.floor((sessionData.timeTaken || 0) / 60)}m {(sessionData.timeTaken || 0) % 60}s
                    </p>
                 </div>
                 <div className="text-left space-y-1">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">PERCENTILE</p>
                    <p className="text-3xl md:text-5xl font-headline font-black text-emerald-400">{merit.percentile}%</p>
                 </div>
              </div>
           </CardContent>
        </Card>

        {/* REVIEW TABS */}
        <Tabs defaultValue="SOLUTIONS" className="space-y-8">
           <TabsList className="bg-white border border-slate-100 p-1.5 h-14 rounded-2xl shadow-sm inline-flex">
              <TabsTrigger value="SOLUTIONS" className="rounded-xl px-8 font-black uppercase text-[10px] gap-2 h-full data-[state=active]:bg-[#0B1528] data-[state=active]:text-white">Detailed Analysis</TabsTrigger>
              <TabsTrigger value="TOPPER" className="rounded-xl px-8 font-black uppercase text-[10px] gap-2 h-full data-[state=active]:bg-[#0B1528] data-[state=active]:text-white">State Merit List</TabsTrigger>
           </TabsList>

           <TabsContent value="SOLUTIONS" className="space-y-8">
              <div className="flex flex-wrap gap-3 pb-2 overflow-x-auto no-scrollbar">
                 <FilterBtn 
                    active={activeReviewFilter === 'ALL'} 
                    onClick={() => setActiveReviewFilter('ALL')} 
                    label="ALL QUESTIONS" 
                    count={questions.length} 
                    icon={<BarChart3 className="h-3 w-3" />}
                    activeColor="bg-primary border-primary"
                 />
                 <FilterBtn 
                    active={activeReviewFilter === 'CORRECT'} 
                    onClick={() => setActiveReviewFilter('CORRECT')} 
                    label="CORRECT" 
                    count={sessionData.correctCount || 0} 
                    icon={<CheckCircle2 className="h-3 w-3" />}
                    activeColor="bg-emerald-500 border-emerald-500"
                    textColor="text-emerald-500"
                 />
                 <FilterBtn 
                    active={activeReviewFilter === 'WRONG'} 
                    onClick={() => setActiveReviewFilter('WRONG')} 
                    label="INCORRECT" 
                    count={sessionData.wrongCount || 0} 
                    icon={<XCircle className="h-3 w-3" />}
                    activeColor="bg-rose-500 border-rose-500"
                    textColor="text-rose-500"
                 />
                 <FilterBtn 
                    active={activeReviewFilter === 'SKIPPED'} 
                    onClick={() => setActiveReviewFilter('SKIPPED')} 
                    label="SKIPPED" 
                    count={sessionData.totalQuestions - (sessionData.attemptedCount || 0)} 
                    icon={<HelpCircle className="h-3 w-3" />}
                    activeColor="bg-slate-500 border-slate-500"
                    textColor="text-slate-400"
                 />
              </div>

              <div className="grid grid-cols-1 gap-6">
                 {filteredQuestions.length > 0 ? filteredQuestions.map((q) => {
                    const ans = sessionData.answers?.[q.index];
                    const isCorrect = ans !== undefined && ['A','B','C','D'][ans] === q.correctAnswer;
                    const isSkipped = ans === undefined || ans === null;
                    
                    return (
                       <Card key={q.id} className="border-none shadow-xl rounded-[2.5rem] overflow-hidden bg-white text-left relative transition-all hover:shadow-2xl">
                          <div className={cn(
                             "absolute top-0 left-0 w-2.5 h-full transition-all", 
                             isCorrect ? 'bg-emerald-500' : isSkipped ? 'bg-slate-200' : 'bg-rose-500'
                          )} />
                          <CardContent className="p-8 md:p-12">
                             <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-6">
                                   <div className={cn(
                                      "h-14 w-14 rounded-2xl flex items-center justify-center font-black text-2xl shadow-inner transition-all", 
                                      isCorrect ? "bg-emerald-50 text-emerald-600" : isSkipped ? "bg-slate-50 text-slate-400" : "bg-rose-50 text-rose-600"
                                   )}>
                                      {q.index + 1}
                                   </div>
                                   <div className="space-y-1">
                                      <Badge variant="outline" className="border-slate-100 text-slate-400 uppercase text-[8px] font-black tracking-widest">{q.subjectId}</Badge>
                                      <div className="flex items-center gap-2">
                                         {isCorrect ? (
                                            <span className="text-[10px] font-black text-emerald-600 uppercase flex items-center gap-1.5"><CheckCircle2 className="h-3 w-3" /> Correct Answer</span>
                                         ) : isSkipped ? (
                                            <span className="text-[10px] font-black text-slate-400 uppercase flex items-center gap-1.5"><HelpCircle className="h-3 w-3" /> Not Attempted</span>
                                         ) : (
                                            <span className="text-[10px] font-black text-rose-600 uppercase flex items-center gap-1.5"><XCircle className="h-3 w-3" /> Incorrect Choice</span>
                                         )}
                                      </div>
                                   </div>
                                </div>
                                <Button variant="ghost" size="icon" className="h-10 w-10 text-slate-200 hover:text-primary border-none"><BrainCircuit className="h-5 w-5" /></Button>
                             </div>

                             <QuestionRenderer 
                                question={q} 
                                language={mockData?.languageMode || 'ENGLISH_PUNJABI'}
                                showSolution={true}
                                selectedAnswer={ans}
                                className="p-0 border-none shadow-none"
                             />
                          </CardContent>
                       </Card>
                    )
                 }) : (
                    <div className="py-24 text-center bg-white rounded-[3rem] border-2 border-dashed border-slate-100 opacity-20">
                       <HelpCircle className="h-16 w-16 mx-auto mb-4" />
                       <p className="font-headline font-black text-xl uppercase tracking-widest">No matching questions in this category.</p>
                    </div>
                 )}
              </div>
           </TabsContent>

           <TabsContent value="TOPPER" className="space-y-4">
              <Card className="border-none shadow-3xl rounded-[3rem] bg-white overflow-hidden p-8">
                 <div className="space-y-4">
                    {sortedGlobalResults.slice(0, 100).map((r: any, i: number) => (
                       <div key={r.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 group hover:bg-white hover:shadow-xl transition-all">
                          <div className="flex items-center gap-4">
                             <span className="font-black text-slate-300 w-6 text-lg">#{i+1}</span>
                             <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-black uppercase text-xs">
                                {r.userName?.[0] || 'A'}
                             </div>
                             <p className="font-bold text-[#0F172A] uppercase tracking-tight">{r.userName || "Aspirant"}</p>
                          </div>
                          <div className="flex gap-8 items-center">
                             <div className="text-right hidden sm:block">
                                <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest">SCORE</p>
                                <p className="text-sm font-black text-primary leading-none">{r.score?.toFixed(2) || '0.00'}</p>
                             </div>
                             <Badge className="bg-emerald-50 text-emerald-600 border-none font-black text-[9px] h-8 px-4 flex items-center">{r.accuracy}% Accuracy</Badge>
                          </div>
                       </div>
                    ))}
                 </div>
              </Card>
           </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  )
}

function FilterBtn({ active, onClick, label, count, icon, activeColor, textColor = "text-slate-400" }: any) {
   return (
      <button 
        onClick={onClick} 
        className={cn(
           "px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border-2 transition-all flex items-center gap-3 active:scale-95",
           active ? `${activeColor} text-white shadow-xl` : `bg-white border-slate-100 ${textColor} hover:border-slate-200`
        )}
      >
         {icon} {label} <span className={cn("ml-1 opacity-60 tabular-nums")}>({count})</span>
      </button>
   )
}