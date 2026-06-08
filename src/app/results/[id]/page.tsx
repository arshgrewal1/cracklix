
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
  ChevronDown,
  ChevronUp,
  BarChart3,
  TrendingUp,
  Trophy,
  Download,
  Award,
  Gem,
  ArrowRight,
  Clock,
  XCircle,
  AlertCircle,
  BookOpen,
  Printer,
  FileText,
  RefreshCw,
  Share2,
  MessageCircle,
  Facebook,
  Instagram,
  Send,
  MessageSquare,
  X
} from "lucide-react"
import { useUser, useFirestore, useCollection } from "@/firebase"
import { collection, query, where, doc, getDoc, documentId, getDocs } from "firebase/firestore"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import QuestionRenderer from "@/components/questions/QuestionRenderer"
import StudentAvatar from "@/components/brand/StudentAvatar"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"

/**
 * @fileOverview Test Results Hub v8.0.
 * UPDATED: Added comprehensive social sharing hub (WhatsApp, FB, IG, SMS).
 */

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
  const [expandedQs, setExpandedQs] = useState<Record<number, boolean>>({})
  const [isShareOpen, setIsShareOpen] = useState(false)

  const resultsQuery = useMemo(() => {
    if (!db || !user) return null
    return query(collection(db, "results"), where("userId", "==", user.uid), where("mockId", "==", mockId))
  }, [db, user, mockId])

  const { data: rawResultDocs, loading: resultsLoading } = useCollection<any>(resultsQuery)
  
  const globalResultsQuery = useMemo(() => {
    if (!db || !mockId) return null
    return query(collection(db, "results"), where("mockId", "==", mockId))
  }, [db, mockId])

  const { data: rawGlobalResults } = useCollection<any>(globalResultsQuery)

  const sessionData = useMemo(() => {
    if (!rawResultDocs || rawResultDocs.length === 0) return null
    return [...rawResultDocs].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0]
  }, [rawResultDocs])

  const merit = useMemo(() => {
     if (!rawGlobalResults || !sessionData) return { rank: '?', total: 0, percentile: 0, topper: null };
     const sorted = [...rawGlobalResults].sort((a, b) => (Number(b.score) || 0) - (Number(a.score) || 0));
     const rank = sorted.findIndex((r: any) => r.userId === user?.uid) + 1 || 1;
     const total = sorted.length;
     const percentile = Math.round(((total - rank) / (total || 1)) * 1000) / 10;
     const topper = sorted[0];
     return { rank, total, percentile, topper };
  }, [rawGlobalResults, sessionData, user]);

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
          
          const questionIds = mData.questionIds || []
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
        toast({ variant: "destructive", title: "Content Missing" })
      } finally {
        setLoadingContent(false)
      }
    }
    loadQuestions()
  }, [db, sessionData, mockId, toast, resultsLoading])

  const sectionalAnalysis = useMemo(() => {
     if (!questions.length || !sessionData) return [];
     const sections: Record<string, { total: number, correct: number, wrong: number, skipped: number }> = {};
     
     questions.forEach((q, i) => {
        const sid = q.sectionId || 'General Hub';
        if (!sections[sid]) sections[sid] = { total: 0, correct: 0, wrong: 0, skipped: 0 };
        sections[sid].total++;
        
        const studentAns = sessionData.answers?.[i];
        if (studentAns === undefined || studentAns === null) {
           sections[sid].skipped++;
        } else {
           const isCorrect = ['A','B','C','D'][studentAns] === q.correctAnswer;
           if (isCorrect) sections[sid].correct++;
           else sections[sid].wrong++;
        }
     });

     return Object.entries(sections).map(([name, data]) => ({
        name,
        ...data,
        accuracy: Math.round((data.correct / (data.correct + data.wrong || 1)) * 100) || 0,
        score: Number(data.correct) - (data.wrong * (mockData?.negativeMarks || 0.25))
     }));
  }, [questions, sessionData, mockData]);

  const filteredQuestions = useMemo(() => {
     return questions.map((q, i) => ({ ...q, index: i })).filter((q) => {
        const ans = sessionData?.answers?.[q.index];
        if (activeReviewFilter === 'ALL') return true;
        if (activeReviewFilter === 'CORRECT') return ans !== undefined && ['A','B','C','D'][ans] === q.correctAnswer;
        if (activeReviewFilter === 'WRONG') return ans !== undefined && ['A','B','C','D'][ans] !== q.correctAnswer;
        if (activeReviewFilter === 'SKIPPED') return ans === undefined || ans === null;
        return true;
     });
  }, [questions, sessionData, activeReviewFilter]);

  const handleShareResult = async () => {
    if (!sessionData) return;
    
    const shareText = `I scored ${sessionData.score.toFixed(1)}/${sessionData.totalQuestions} with ${sessionData.accuracy}% accuracy in ${sessionData.mockTitle} on Cracklix! Punjab's No. 1 Mock Hub.`;
    const shareUrl = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Cracklix Test Result',
          text: shareText,
          url: shareUrl
        });
      } catch (err) {
        setIsShareOpen(true);
      }
    } else {
      setIsShareOpen(true);
    }
  };

  const getShareLink = (platform: string) => {
    if (!sessionData) return "";
    const text = encodeURIComponent(`I scored ${sessionData.score.toFixed(1)}/${sessionData.totalQuestions} in ${sessionData.mockTitle} on Cracklix! Check it out: `);
    const url = encodeURIComponent(window.location.href);

    switch(platform) {
      case 'whatsapp': return `https://wa.me/?text=${text}${url}`;
      case 'facebook': return `https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${text}`;
      case 'sms': return `sms:?body=${text}${url}`;
      case 'twitter': return `https://twitter.com/intent/tweet?text=${text}&url=${url}`;
      default: return "";
    }
  };

  if (resultsLoading || loadingContent) return (
    <div className="h-screen flex flex-col items-center justify-center bg-white space-y-6">
       <Loader2 className="h-12 w-12 text-primary animate-spin" />
       <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Checking your result...</p>
    </div>
  )

  if (!sessionData) return (
     <div className="h-screen flex flex-col items-center justify-center text-slate-400 gap-4">
        <AlertCircle className="h-12 w-12 opacity-10" />
        <p className="font-black uppercase tracking-widest text-xs">Result entry not found.</p>
        <Button asChild variant="outline" className="rounded-xl border-slate-200">
           <Link href="/dashboard">Return to Dashboard</Link>
        </Button>
     </div>
  );

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 font-body pb-safe text-left print:bg-white print:pb-0">
      <div className="print:hidden"><Navbar /></div>
      
      <main className="container mx-auto px-4 md:px-6 py-6 md:py-12 max-w-7xl space-y-8 md:space-y-12 print:p-0 print:m-0 print:max-w-full">
        
        {/* HERO HUB */}
        <div className="flex flex-col lg:flex-row gap-6 md:gap-10">
           <Card className="flex-1 border-none shadow-5xl rounded-[2.5rem] bg-[#0B1528] text-white overflow-hidden relative group print:bg-white print:text-[#0F172A] print:shadow-none print:border-2 print:border-slate-100">
              <div className="absolute -top-20 -right-20 p-12 opacity-[0.02] rotate-12 group-hover:scale-110 transition-transform duration-1000 print:hidden"><Trophy className="h-[500px] w-[500px]" /></div>
              <CardContent className="p-6 md:p-14 lg:p-16 space-y-8 md:space-y-10 relative z-10 print:p-10">
                 <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-10">
                    <div className="space-y-6 max-w-full lg:max-w-[60%] text-left">
                       <div className="flex items-center gap-4 print:hidden">
                          <ShieldCheck className="h-5 w-5 text-primary" />
                          <Badge className="bg-primary/20 text-primary border-none px-4 py-1.5 rounded-full font-black uppercase text-[9px] tracking-[0.2em] shadow-xl">Test Completed</Badge>
                       </div>
                       <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-headline font-black uppercase leading-[0.95] tracking-tight break-words print:text-4xl">
                          {sessionData.mockTitle}
                       </h1>
                       <div className="flex flex-wrap gap-4 print:hidden">
                          <Button asChild className="bg-primary hover:bg-orange-600 text-white font-black uppercase text-[10px] tracking-widest h-12 px-8 rounded-xl shadow-xl gap-2 transition-all active:scale-95 border-none">
                             <Link href={`/mocks/${mockId}/instructions`}>
                                <RefreshCw className="h-4 w-4" /> Re-attempt Test
                             </Link>
                          </Button>
                          <Button onClick={handleShareResult} className="bg-[#10B981] hover:bg-emerald-600 text-white font-black uppercase text-[10px] tracking-widest h-12 px-8 rounded-xl shadow-xl gap-2 transition-all active:scale-95 border-none">
                             <Share2 className="h-4 w-4" /> Share Result
                          </Button>
                          <Button variant="outline" className="bg-white/5 border-white/10 hover:bg-white/10 text-white font-black uppercase text-[10px] tracking-widest h-12 px-8 rounded-xl" onClick={() => window.print()}>
                             <Printer className="h-4 w-4 mr-2" /> Print Result
                          </Button>
                       </div>
                    </div>
                    
                    <div className="flex items-center gap-4 md:gap-8 bg-white/5 backdrop-blur-3xl p-6 md:p-8 rounded-[2.5rem] border border-white/10 shadow-5xl group/merit w-full lg:w-auto print:bg-slate-50 print:border-slate-200">
                       <div className="flex-1 text-center space-y-1.5">
                          <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none">RANK</p>
                          <p className="text-3xl md:text-5xl font-headline font-black text-primary leading-none tabular-nums print:text-4xl">#{merit.rank || 0}</p>
                          <p className="text-[9px] font-black text-slate-50 uppercase">OF {merit.total || 0}</p>
                       </div>
                       <div className="h-12 md:h-20 w-px bg-white/10 shrink-0 print:bg-slate-200" />
                       <div className="flex-1 text-center space-y-1.5">
                          <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none">PERCENTILE</p>
                          <p className="text-3xl md:text-5xl font-headline font-black text-emerald-400 leading-none tabular-nums print:text-4xl">{merit.percentile || 0}</p>
                          <p className="text-[9px] font-black text-slate-50 uppercase">SCORE %</p>
                       </div>
                    </div>
                 </div>

                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 pt-8 border-t border-white/5 print:border-slate-100 print:grid-cols-4">
                    <MetricCard label="SCORE" val={Number(sessionData.score || 0).toFixed(1)} sub={`/${sessionData.totalQuestions} MARKS`} color="text-primary" />
                    <MetricCard label="ACCURACY" val={`${sessionData.accuracy || 0}%`} sub="PRECISION" color="text-emerald-400" />
                    <MetricCard label="CORRECT" val={Math.floor(sessionData.score || 0)} sub="CORRECT ANSWERS" color="text-emerald-400" />
                    <MetricCard label="TIME" val={`${Math.floor((sessionData.timeTaken || 0) / 60)}m`} sub="TIME SPENT" color="text-blue-400" />
                 </div>
              </CardContent>
           </Card>
        </div>

        {/* DETAILED ANALYSIS TABS */}
        <Tabs defaultValue="SECTIONAL" className="space-y-8">
           <div className="bg-white border border-slate-100 rounded-3xl p-1.5 shadow-xl inline-flex w-full md:w-auto overflow-x-auto no-scrollbar justify-start print:hidden">
             <TabsList className="bg-transparent border-none p-0 flex h-14 md:h-16 gap-1 md:gap-2 px-1">
                <TabsTrigger value="SECTIONAL" className="rounded-2xl px-4 md:px-8 font-black uppercase text-[8px] md:text-[10px] tracking-widest gap-2 h-full data-[state=active]:bg-[#0B1528] data-[state=active]:text-white data-[state=active]:shadow-2xl transition-all whitespace-nowrap">
                   <BarChart3 className="h-4 w-4" /> Section Performance
                </TabsTrigger>
                <TabsTrigger value="TOPPER" className="rounded-2xl px-4 md:px-8 font-black uppercase text-[8px] md:text-[10px] tracking-widest gap-2 h-full data-[state=active]:bg-[#0B1528] data-[state=active]:text-white data-[state=active]:shadow-2xl transition-all whitespace-nowrap">
                   <Trophy className="h-4 w-4" /> Compare with Topper
                </TabsTrigger>
                <TabsTrigger value="SOLUTIONS" className="rounded-2xl px-4 md:px-8 font-black uppercase text-[8px] md:text-[10px] tracking-widest gap-2 h-full data-[state=active]:bg-[#0B1528] data-[state=active]:text-white data-[state=active]:shadow-2xl transition-all whitespace-nowrap">
                   <BrainCircuit className="h-4 w-4" /> Answer Review
                </TabsTrigger>
             </TabsList>
           </div>

           <TabsContent value="SECTIONAL" className="m-0 animate-in fade-in slide-in-from-bottom-2 duration-500">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 print:grid-cols-2">
                 {sectionalAnalysis.map((s, i) => (
                    <Card key={i} className="border-none shadow-xl rounded-[3rem] bg-white p-8 md:p-10 group hover:translate-y-[-4px] transition-all border border-slate-100 hover:border-primary/20 print:p-6 print:rounded-2xl print:shadow-none print:border-slate-200">
                       <CardHeader className="p-0 mb-8 flex flex-row items-center justify-between">
                          <div className="space-y-0.5 text-left min-w-0 flex-1 pr-4">
                             <h4 className="font-headline font-black text-xl md:text-2xl uppercase text-[#0B1528] leading-none truncate print:text-lg">{s.name}</h4>
                             <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Section Results</p>
                          </div>
                          <Badge className={cn(
                             "border-none text-[10px] font-black uppercase px-3 py-1.5 rounded-xl shadow-lg print:shadow-none print:bg-slate-50 print:text-black", 
                             s.accuracy >= 70 ? 'bg-emerald-50 text-emerald-600 shadow-emerald-500/10' : s.accuracy >= 40 ? 'bg-amber-50 text-amber-600 shadow-amber-500/10' : 'bg-rose-50 text-rose-600 shadow-rose-500/10'
                          )}>
                             {s.accuracy}%
                          </Badge>
                       </CardHeader>
                       <div className="space-y-8">
                          <div className="grid grid-cols-2 gap-4">
                             <div className="text-left bg-slate-50/50 p-5 rounded-2xl border border-slate-100/50 shadow-inner print:p-4 print:rounded-xl">
                                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">MARKS</p>
                                <p className="text-2xl md:text-3xl font-headline font-black text-[#0B1528] tabular-nums print:text-xl">{Number(s.score || 0).toFixed(1)}</p>
                             </div>
                             <div className="text-left bg-rose-50/30 p-5 rounded-2xl border border-rose-100/50 print:p-4 print:rounded-xl">
                                <p className="text-[8px] font-black text-rose-300 uppercase tracking-widest mb-1">WRONG</p>
                                <p className="text-2xl md:text-3xl font-headline font-black text-rose-600 tabular-nums print:text-xl">{s.wrong}</p>
                             </div>
                          </div>
                       </div>
                    </Card>
                 ))}
              </div>
           </TabsContent>

           <TabsContent value="TOPPER" className="m-0 animate-in fade-in duration-500">
              <Card className="border-none shadow-3xl rounded-[4rem] bg-white overflow-hidden border border-slate-100 print:rounded-3xl print:border-slate-200">
                 <div className="grid grid-cols-1 lg:grid-cols-2 print:grid-cols-2">
                    <div className="p-10 md:p-16 lg:p-24 space-y-12 md:space-y-16 border-b lg:border-b-0 lg:border-r border-slate-50 print:p-10 print:space-y-8">
                       <div className="flex items-center gap-6">
                          <div className="h-14 w-14 md:h-20 md:w-20 rounded-[2rem] bg-amber-50 flex items-center justify-center text-amber-500 shadow-2xl print:h-12 print:w-12 print:rounded-xl">
                             <Trophy className="h-8 w-8 md:h-10 md:w-10 print:h-6 print:w-6" />
                          </div>
                          <div className="space-y-1 text-left">
                             <h3 className="font-headline font-black text-2xl md:text-4xl uppercase text-[#0B1528] tracking-tight print:text-2xl">Topper Comparison</h3>
                             <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Your results vs State Leader</p>
                          </div>
                       </div>
                       
                       <div className="space-y-12 print:space-y-8">
                          <CompareMetric label="SCORE PERFORMANCE" user={sessionData.score || 0} topper={merit.topper?.score || 0} max={sessionData.totalQuestions} />
                          <CompareMetric label="ACCURACY RATE" user={sessionData.accuracy || 0} topper={merit.topper?.accuracy || 0} unit="%" />
                          <CompareMetric label="TIME EFFICIENCY" user={Math.floor((sessionData.timeTaken || 0) / 60)} topper={Math.floor((merit.topper?.timeTaken || 0) / 60)} isTime />
                       </div>
                    </div>

                    <div className="p-12 md:p-24 flex flex-col items-center justify-center text-center space-y-10 bg-slate-50/50 relative overflow-hidden print:p-10">
                       <div className="absolute inset-0 opacity-5 print:hidden"><Target className="h-full w-full text-[#0B1528]" /></div>
                       <div className="relative group">
                          <StudentAvatar profile={merit.topper} className="h-40 w-40 md:h-64 md:w-64 border-[12px] border-white shadow-5xl rounded-[4rem] transition-transform duration-700 group-hover:scale-105 print:h-32 print:w-32 print:border-4" />
                       </div>
                       <div className="space-y-2 relative z-10">
                          <h4 className="text-3xl md:text-5xl font-headline font-black uppercase text-[#0B1528] tracking-tight leading-none print:text-2xl">{merit.topper?.name || 'Academic Topper'}</h4>
                       </div>
                    </div>
                 </div>
              </Card>
           </TabsContent>

           <TabsContent value="SOLUTIONS" className="m-0 space-y-8 animate-in fade-in duration-500">
              <div className="grid grid-cols-1 gap-6 md:gap-10 print:gap-4 pt-4">
                 {filteredQuestions.map((q) => {
                    const isExpanded = expandedQs[q.index];
                    const studentAns = sessionData.answers?.[q.index];
                    const isCorrect = studentAns !== undefined && ['A','B','C','D'][studentAns] === q.correctAnswer;
                    const isSkipped = studentAns === undefined || studentAns === null;

                    return (
                       <Card key={q.id} className="border-none shadow-2xl rounded-[3rem] overflow-hidden bg-white group border border-slate-100 relative text-left print:shadow-none print:rounded-xl print:border-slate-200 print:break-inside-avoid">
                          <div className={cn("absolute top-0 left-0 w-2 h-full transition-colors print:w-1", isCorrect ? 'bg-emerald-500' : isSkipped ? 'bg-slate-200' : 'bg-rose-500')} />
                          <CardContent className="p-8 md:p-14 space-y-8 md:space-y-12 print:p-6 print:space-y-4">
                             <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 print:flex-row print:gap-2">
                                <div className="flex items-center gap-6 print:gap-4">
                                   <div className={cn(
                                      "h-14 w-14 md:h-20 md:w-20 rounded-[2rem] flex items-center justify-center font-black text-2xl md:text-4xl shadow-inner transition-transform group-hover:scale-105 print:h-8 print:w-8 print:text-sm print:rounded-lg",
                                      isCorrect ? "bg-emerald-50 text-emerald-600 shadow-emerald-500/10" : isSkipped ? "bg-slate-50 text-slate-300" : "bg-rose-50 text-rose-600 shadow-rose-500/10"
                                   )}>
                                      {q.index + 1}
                                   </div>
                                </div>
                             </div>

                             <div className="px-1 md:px-4 print:px-0">
                                <QuestionRenderer 
                                   question={q} 
                                   language={mockData?.languageMode || 'ENGLISH_PUNJABI'}
                                   showSolution={isExpanded || true}
                                   selectedAnswer={studentAns}
                                   className="p-0 border-none shadow-none bg-transparent"
                                />
                             </div>
                          </CardContent>
                       </Card>
                    );
                 })}
              </div>
           </TabsContent>
        </Tabs>
      </main>
      <div className="print:hidden"><Footer /></div>

      {/* SHARE HUB DIALOG */}
      <Dialog open={isShareOpen} onOpenChange={setIsShareOpen}>
         <DialogContent className="bg-[#0F172A] text-white border-white/10 rounded-[2.5rem] max-w-[340px] p-0 overflow-hidden shadow-5xl text-left">
            <div className="h-1.5 w-full bg-[#10B981]" />
            <DialogHeader className="p-8 pb-4 text-center relative">
               <DialogTitle className="text-xl font-headline font-black uppercase tracking-tight">Share Your Result</DialogTitle>
               <button onClick={() => setIsShareOpen(false)} className="absolute top-8 right-8 text-slate-500 hover:text-white"><X className="h-5 w-5" /></button>
            </DialogHeader>
            <div className="p-8 pt-0 grid grid-cols-2 gap-4">
               <ShareOption label="WhatsApp" icon={<MessageCircle className="h-6 w-6" />} color="bg-emerald-500" href={getShareLink('whatsapp')} />
               <ShareOption label="Facebook" icon={<Facebook className="h-6 w-6" />} color="bg-blue-600" href={getShareLink('facebook')} />
               <ShareOption label="SMS" icon={<MessageSquare className="h-6 w-6" />} color="bg-indigo-500" href={getShareLink('sms')} />
               <ShareOption label="Twitter" icon={<Send className="h-6 w-6" />} color="bg-sky-500" href={getShareLink('twitter')} />
            </div>
            <div className="p-8 pt-0">
               <Button 
                 variant="outline" 
                 className="w-full border-white/5 bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white rounded-xl h-12 font-black uppercase text-[10px] tracking-[0.2em]"
                 onClick={async () => {
                    await navigator.clipboard.writeText(window.location.href);
                    toast({ title: "Link Copied", description: "Result link saved to clipboard." });
                    setIsShareOpen(false);
                 }}
               >
                  Copy Result URL
               </Button>
            </div>
         </DialogContent>
      </Dialog>
    </div>
  )
}

function ShareOption({ label, icon, color, href }: any) {
  return (
    <a 
      href={href} 
      target="_blank" 
      rel="noopener noreferrer"
      className="flex flex-col items-center gap-3 p-4 rounded-2xl bg-white/5 hover:bg-white/10 transition-all border border-white/5 group"
    >
       <div className={cn("h-12 w-12 rounded-xl flex items-center justify-center text-white shadow-lg transition-transform group-hover:scale-110", color)}>
          {icon}
       </div>
       <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</span>
    </a>
  );
}

function MetricCard({ label, val, sub, color }: any) {
   const valStr = String(val);
   return (
      <div className="space-y-3 p-6 md:p-8 bg-white/5 border border-white/5 rounded-[2.5rem] transition-all hover:bg-white/10 group text-left shadow-2xl relative overflow-hidden print:bg-slate-50 print:border-slate-100 print:shadow-none print:p-4 print:rounded-xl">
         <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] leading-none print:text-[7px]">{label}</p>
         <div className="space-y-1">
            <p className={cn("text-3xl md:text-5xl font-headline font-black leading-none tracking-tighter tabular-nums print:text-2xl", color)}>
               {valStr.includes('NaN') ? '0' : val}
            </p>
            <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest leading-none print:text-[8px]">
               {sub}
            </p>
         </div>
      </div>
   )
}

function CompareMetric({ label, user, topper, max, unit = "", isTime = false }: any) {
   const userVal = Number(user) || 0;
   const topperVal = Number(topper) || 0;
   const maxVal = max ? Number(max) : Math.max(userVal, topperVal, 100);
   
   const userPer = (userVal / (maxVal || 1)) * 100;
   const topperPer = (topperVal / (maxVal || 1)) * 100;

   return (
      <div className="space-y-5 text-left print:space-y-3">
         <div className="flex justify-between items-end">
            <span className="text-[11px] md:text-[13px] font-black uppercase tracking-[0.2em] text-[#0B1528] print:text-[10px]">{label}</span>
            <div className="flex gap-8">
               <div className="text-right">
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">YOU</p>
                  <p className="text-xl md:text-2xl font-black text-[#0B1528] tabular-nums print:text-lg">{user}{unit}{isTime && 'm'}</p>
               </div>
               <div className="text-right">
                  <p className="text-[8px] font-black text-amber-500 uppercase tracking-widest leading-none mb-1">TOPPER</p>
                  <p className="text-xl md:text-2xl font-black text-amber-600 tabular-nums print:text-lg">{topper}{unit}{isTime && 'm'}</p>
               </div>
            </div>
         </div>
         <div className="relative h-3 w-full bg-slate-100 rounded-full overflow-hidden shadow-inner border border-slate-200/50 print:h-2">
            <div className="absolute inset-0 bg-amber-400 transition-all ease-out" style={{ width: `${topperPer}%`, transitionDuration: '1800ms' }} />
            <div className="absolute inset-0 bg-primary/40 border-r-[4px] border-primary transition-all ease-out" style={{ width: `${userPer}%`, transitionDuration: '1200ms' }} />
         </div>
      </div>
   )
}
