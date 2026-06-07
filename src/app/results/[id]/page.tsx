
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
  Loader2, 
  BrainCircuit, 
  ShieldCheck,
  ChevronDown,
  ChevronUp,
} from "lucide-react"
import { useFirestore, useUser, useCollection } from "@/firebase"
import { collection, query, where, doc, getDoc, deleteDoc, documentId, getDocs } from "firebase/firestore"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import QuestionRenderer from "@/components/questions/QuestionRenderer"
import BackButton from "@/components/navigation/BackButton"

/**
 * @fileOverview Standardized Results Hub with Firestore instance validation.
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

  const resultsQuery = useMemo(() => {
    if (!db || db.type !== 'firestore' || !user) return null
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
      if (!db || db.type !== 'firestore') return;
      if (resultsLoading) return;
      if (!sessionData) {
        setLoadingContent(false);
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
               if (!db || db.type !== 'firestore') return Promise.resolve({ docs: [] });
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

  const handleReattempt = async () => {
    if (!db || db.type !== 'firestore' || !user || !mockId) return;
    if (!window.confirm("Restart evaluation node?")) return;

    const attemptId = `${user.uid}_${mockId}`;
    
    // Non-blocking background reset
    deleteDoc(doc(db, "attempts", attemptId)).catch(() => {});
    deleteDoc(doc(db, "results", attemptId)).catch(() => {});
    
    localStorage.removeItem(`attempt_${mockId}`);
    localStorage.removeItem(`result_${mockId}`);

    toast({ title: "Registry Reset" });
    router.push(`/mocks/${mockId}/instructions`);
  };

  if (resultsLoading || loadingContent) return (
    <div className="h-full flex flex-col items-center justify-center bg-white space-y-4">
       <Loader2 className="h-8 w-8 text-primary animate-spin" />
       <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Auditing Node...</p>
    </div>
  )

  if (!sessionData) return (
    <div className="h-full flex flex-col items-center justify-center bg-slate-50 p-6 space-y-8">
       <Trophy className="h-16 w-16 text-slate-200" />
       <p className="text-sm font-bold text-slate-400 uppercase tracking-widest text-center">No Audit Node Detected</p>
       <Button asChild className="rounded-xl h-14 px-10 bg-[#0B1528] text-white font-black uppercase text-[10px]">
          <Link href="/mocks">Explore All Hubs</Link>
       </Button>
    </div>
  )

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <Navbar />
      <main className="mobile-app-shell py-4 px-2 space-y-6">
        <div className="flex items-center gap-2 mb-2">
           <BackButton label="Dashboard" fallback="/dashboard" className="h-10" />
           <div className="h-4 w-px bg-slate-200" />
           <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Audit Registry</p>
        </div>

        <Card className="border-none shadow-sm rounded-2xl overflow-hidden bg-white">
           <div className="h-1 w-full bg-primary" />
           <CardHeader className="p-5 border-b border-slate-50 space-y-3">
              <div className="flex items-center gap-3">
                 <ShieldCheck className="h-4 w-4 text-primary" />
                 <Badge className="bg-emerald-50 text-emerald-600 border-none px-2 py-0.5 rounded-lg font-black uppercase text-[7px] tracking-widest">VERIFIED</Badge>
              </div>
              <CardTitle className="text-lg font-black text-[#0F172A] uppercase leading-tight">{sessionData.mockTitle}</CardTitle>
              
              <div className="flex gap-2 pt-2">
                 <Button onClick={handleReattempt} type="button" className="flex-1 h-10 bg-primary text-white rounded-lg font-black uppercase text-[8px] tracking-widest relative z-10">Re-Attempt</Button>
                 <Button asChild className="flex-1 h-10 bg-[#0F172A] text-white rounded-lg font-black uppercase text-[8px] tracking-widest"><Link href="/dashboard">Dashboard</Link></Button>
              </div>
           </CardHeader>
           <CardContent className="p-5">
              <div className="grid grid-cols-4 gap-2 text-center">
                <MiniStat icon={<CheckCircle2 className="text-emerald-500 h-4 w-4" />} val={sessionData.score} label="CORRECT" />
                <MiniStat icon={<XCircle className="text-rose-500 h-4 w-4" />} val={Object.keys(sessionData.answers).length - sessionData.score} label="WRONG" />
                <MiniStat icon={<HelpCircle className="text-slate-300 h-4 w-4" />} val={sessionData.totalQuestions - Object.keys(sessionData.answers).length} label="SKIP" />
                <MiniStat icon={<Target className="text-primary h-4 w-4" />} val={`${sessionData.accuracy}%`} label="ACCURACY" />
              </div>
           </CardContent>
        </Card>

        <div className="space-y-4 pb-32">
           <h3 className="font-headline font-black text-sm uppercase px-1 flex items-center gap-2">
              <BrainCircuit className="h-4 w-4 text-primary" /> Performance Review
           </h3>
           
           <div className="space-y-3">
              {questions.map((q, idx) => {
                 const studentAnsIdx = sessionData.answers?.[idx];
                 const correctAnsIdx = ['A','B','C','D'].indexOf(q.correctAnswer);
                 const isCorrect = studentAnsIdx === correctAnsIdx;
                 const isSkipped = studentAnsIdx === undefined || studentAnsIdx === null;
                 const isExpanded = expandedQs[idx];

                 return (
                    <Card key={idx} className="border-none shadow-sm rounded-xl overflow-hidden bg-white">
                       <div className={cn("h-1 w-full", isCorrect ? "bg-emerald-500" : isSkipped ? "bg-slate-200" : "bg-rose-500")} />
                       <CardContent className="p-3 space-y-4">
                          <div className="flex items-center justify-between">
                             <div className="h-6 w-6 rounded-lg bg-slate-50 flex items-center justify-center font-black text-[10px] text-slate-400">
                                {idx + 1}
                             </div>
                             <Badge className={cn("border-none px-2 py-0.5 rounded text-[6px] font-black uppercase tracking-widest", isCorrect ? "bg-emerald-50 text-emerald-600" : isSkipped ? "bg-slate-50 text-slate-400" : "bg-rose-50 text-rose-600")}>
                                {isCorrect ? 'SUCCESS' : isSkipped ? 'SKIPPED' : 'FAILURE'}
                             </Badge>
                          </div>

                          <QuestionRenderer 
                            question={q} 
                            language={mockLanguageMode} 
                            showSolution={isExpanded} 
                            selectedAnswer={studentAnsIdx}
                            hideOptions={false}
                          />

                          <div className="flex justify-center">
                             <Button 
                                variant="ghost"
                                onClick={() => setExpandedQs(p => ({ ...p, [idx]: !p[idx] }))}
                                className="h-10 px-6 font-black uppercase text-[9px] tracking-widest gap-2 text-primary"
                             >
                                {isExpanded ? "Hide Logic" : "View Solution"}
                                {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                             </Button>
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

function MiniStat({ icon, val, label }: any) {
  return (
    <div className="space-y-1">
      <div className="flex justify-center">{icon}</div>
      <p className="text-sm font-headline font-black text-[#0F172A]">{val}</p>
      <p className="text-[6px] font-black uppercase text-slate-400">{label}</p>
    </div>
  )
}
