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
 * @fileOverview Test Results Hub v22.0.
 * SIMPLIFIED: Replaced technical jargon with easy words (History, Explanation, Merit).
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
     const percentile = total > 0 ? Math.round(((total - actualRank + 1) / (total || 1)) * 1000) / 10 : 0;
     const topper = sortedGlobalResults[0];
     return { rank: actualRank, total, percentile, topper };
  }, [sortedGlobalResults, sessionData, user]);

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
          for (let i = 0; i < questionIds.length; i += 30) { chunks.push(questionIds.slice(i, i + 30)) }
          const chunkSnaps = await Promise.all(chunks.map(chunk => getDocs(query(collection(db, "questions"), where(documentId(), "in", chunk)))))
          const allFetched: any[] = []
          chunkSnaps.forEach(snap => snap.docs.forEach(d => allFetched.push({ ...d.data(), id: d.id })))
          setQuestions(questionIds.map(id => allFetched.find(q => q.id === id)).filter(Boolean))
        }
      } finally { setLoadingContent(false) }
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

  if (!sessionData) return (
     <div className="h-screen flex flex-col items-center justify-center text-center bg-white p-6 space-y-6">
        <AlertCircle className="h-12 w-12 text-slate-200" />
        <h2 className="text-2xl font-headline font-black uppercase">Result Not Found</h2>
        <Button asChild className="bg-[#0F172A] text-white rounded-xl h-12 px-8"><Link href="/dashboard">Return Home</Link></Button>
     </div>
  );

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 font-body pb-safe text-left">
      <Navbar />
      <main className="container mx-auto px-4 md:px-6 py-6 md:py-10 max-w-7xl space-y-6">
        
        {/* COMPACT SUMMARY STRIP */}
        <div className="bg-[#0B1528] rounded-2xl shadow-xl overflow-hidden flex flex-col md:flex-row items-center justify-between p-4 md:px-8 md:py-5 gap-4">
           <div className="flex items-center gap-4 min-w-0 flex-1">
              <div className="h-10 w-10 bg-primary/20 rounded-lg flex items-center justify-center text-primary shrink-0">
                 <Trophy className="h-5 w-5" />
              </div>
              <div className="min-w-0 truncate">
                 <h1 className="text-sm md:text-lg font-black text-white uppercase tracking-tight truncate">{sessionData.mockTitle}</h1>
                 <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{new Date(sessionData.timestamp).toLocaleDateString()}</p>
              </div>
           </div>

           <div className="flex items-center gap-6 md:gap-10 shrink-0">
              <ResultPill label="SCORE" val={sessionData.score.toFixed(1)} color={sessionData.score < 0 ? "text-rose-400" : "text-primary"} />
              <div className="w-px h-8 bg-white/10" />
              <ResultPill label="RANK" val={`#${merit.rank}`} color="text-white" />
              <div className="w-px h-8 bg-white/10" />
              <ResultPill label="ACCURACY" val={`${sessionData.accuracy}%`} color="text-emerald-400" />
              <div className="w-px h-8 bg-white/10 hidden sm:block" />
              <ResultPill label="LEVEL" val={`${merit.percentile}%`} color="text-blue-400" className="hidden sm:flex" />
           </div>

           <div className="flex gap-2 shrink-0 ml-0 md:ml-4">
              <Button asChild className="h-9 px-4 bg-primary hover:bg-orange-600 text-white font-black uppercase text-[8px] tracking-widest rounded-lg shadow-lg border-none">
                 <Link href={`/mocks/${mockId}/instructions`}><RefreshCw className="h-3 w-3 mr-1" /> RE-TAKE</Link>
              </Button>
           </div>
        </div>

        {/* REVIEW TABS */}
        <Tabs defaultValue="SOLUTIONS" className="space-y-6">
           <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <TabsList className="bg-white border border-slate-100 p-1 h-12 rounded-xl shadow-sm inline-flex">
                 <TabsTrigger value="SOLUTIONS" className="rounded-lg px-6 font-black uppercase text-[9px] h-full data-[state=active]:bg-[#0B1528] data-[state=active]:text-white">Check Solutions</TabsTrigger>
                 <TabsTrigger value="TOPPER" className="rounded-lg px-6 font-black uppercase text-[9px] h-full data-[state=active]:bg-[#0B1528] data-[state=active]:text-white">State Rank</TabsTrigger>
              </TabsList>
              
              <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                 <FilterBtn active={activeReviewFilter === 'ALL'} onClick={() => setActiveReviewFilter('ALL')} label="ALL" count={questions.length} icon={<BarChart3 className="h-3 w-3" />} activeColor="bg-slate-900 border-slate-900" />
                 <FilterBtn active={activeReviewFilter === 'CORRECT'} onClick={() => setActiveReviewFilter('CORRECT')} label="CORRECT" count={sessionData.correctCount} icon={<CheckCircle2 className="h-3 w-3" />} activeColor="bg-emerald-600 border-emerald-600" />
                 <FilterBtn active={activeReviewFilter === 'WRONG'} onClick={() => setActiveReviewFilter('WRONG')} label="WRONG" count={sessionData.wrongCount} icon={<XCircle className="h-3 w-3" />} activeColor="bg-rose-600 border-rose-600" />
              </div>
           </div>

           <TabsContent value="SOLUTIONS" className="space-y-4">
              {filteredQuestions.map((q) => {
                 const ans = sessionData.answers?.[q.index];
                 const isCorrect = ans !== undefined && ['A','B','C','D'][ans] === q.correctAnswer;
                 const isSkipped = ans === undefined || ans === null;
                 return (
                    <Card key={q.id} className="border-none shadow-md rounded-2xl overflow-hidden bg-white text-left relative">
                       <div className={cn("absolute top-0 left-0 w-1.5 h-full", isCorrect ? 'bg-emerald-500' : isSkipped ? 'bg-slate-200' : 'bg-rose-500')} />
                       <CardContent className="p-6 md:p-8">
                          <div className="flex items-center justify-between mb-4">
                             <div className="flex items-center gap-4">
                                <span className={cn("h-10 w-10 rounded-lg flex items-center justify-center font-black text-lg shadow-inner", isCorrect ? "bg-emerald-50 text-emerald-600" : isSkipped ? "bg-slate-50 text-slate-400" : "bg-rose-50 text-rose-600")}>{q.index + 1}</span>
                                <Badge variant="outline" className="border-slate-100 text-slate-400 uppercase text-[8px] font-black">{q.subjectId}</Badge>
                             </div>
                          </div>
                          <QuestionRenderer question={q} language={mockData?.languageMode || 'ENGLISH_PUNJABI'} showSolution={true} selectedAnswer={ans} className="p-0 border-none shadow-none" />
                       </CardContent>
                    </Card>
                 )
              })}
           </TabsContent>

           <TabsContent value="TOPPER" className="space-y-4">
              <Card className="border-none shadow-md rounded-2xl bg-white p-6">
                 <div className="space-y-3">
                    {sortedGlobalResults.slice(0, 50).map((r: any, i: number) => (
                       <div key={r.id} className="flex items-center justify-between p-3 bg-slate-50/50 rounded-xl border border-slate-50">
                          <div className="flex items-center gap-3">
                             <span className="font-black text-slate-300 w-5 text-xs">#{i+1}</span>
                             <p className="font-bold text-[#0F172A] text-xs uppercase">{r.userName || "Student"}</p>
                          </div>
                          <div className="flex gap-4 items-center">
                             <span className="text-[10px] font-black text-primary">{r.score.toFixed(1)} Pts</span>
                             <Badge className="bg-emerald-50 text-emerald-600 border-none font-black text-[7px]">{r.accuracy}%</Badge>
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

function ResultPill({ label, val, color, className }: any) {
   return (
      <div className={cn("flex flex-col items-start gap-0.5", className)}>
         <span className="text-[6px] md:text-[8px] font-black text-slate-500 uppercase tracking-widest leading-none">{label}</span>
         <span className={cn("text-sm md:text-xl font-headline font-black leading-none", color)}>{val}</span>
      </div>
   )
}

function FilterBtn({ active, onClick, label, count, icon, activeColor }: any) {
   return (
      <button onClick={onClick} className={cn("px-4 py-2 rounded-xl text-[8px] font-black uppercase tracking-widest border-2 transition-all flex items-center gap-2 whitespace-nowrap", active ? `${activeColor} text-white shadow-md` : "bg-white border-slate-100 text-slate-400 hover:border-slate-200")}>
         {icon} {label} <span>({count})</span>
      </button>
   )
}