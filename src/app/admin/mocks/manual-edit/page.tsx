"use client"

import { useState, useMemo, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { 
  ChevronLeft, 
  Save, 
  Loader2, 
  Edit, 
  FileText, 
  Globe, 
  Languages, 
  Zap, 
  ClipboardCheck, 
  CheckCircle2, 
  AlertTriangle,
  Search,
  BookOpen,
  X
} from "lucide-react"
import { useFirestore, useDoc, useUser } from "@/firebase"
import { doc, setDoc, serverTimestamp, collection, query, where, documentId, getDocs } from "firebase/firestore"
import { useToast } from "@/hooks/use-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

/**
 * @fileOverview High-Fidelity Manual Content Editor v1.5.
 * FIXED: Responsive header stack to prevent button/title overlap on mobile.
 */

export default function ManualMockEditPage() {
  return (
    <Suspense fallback={<div className="h-screen flex items-center justify-center bg-white"><Loader2 className="h-10 w-10 text-primary animate-spin" /></div>}>
      <ManualEditContent />
    </Suspense>
  )
}

function ManualEditContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const db = useFirestore()
  const { toast } = useToast()
  
  const mockId = searchParams?.get("id") ?? ""
  const [questions, setQuestions] = useState<any[]>([])
  const [loadingContent, setLoadingContent] = useState(true)
  const [editingQuestion, setEditingQuestion] = useState<any>(null)
  const [activeLangTab, setActiveLangTab] = useState<'punjabi' | 'hindi'>('punjabi')

  const { data: mock } = useDoc<any>(useMemo(() => (db && mockId ? doc(db, "mocks", mockId) : null), [db, mockId]))

  useEffect(() => {
    async function loadQuestions() {
      if (!db || !mock?.questionIds) return
      setLoadingContent(true)
      try {
        const questionIds = mock.questionIds
        const chunks = []
        for (let i = 0; i < questionIds.length; i += 30) {
          chunks.push(questionIds.slice(i, i + 30))
        }

        const chunkSnaps = await Promise.all(
          chunks.map(chunk => getDocs(query(collection(db, "questions"), where(documentId(), "in", chunk))))
        )

        const fetched: any[] = []
        chunkSnaps.forEach(snap => snap.docs.forEach(d => fetched.push({ ...d.data(), id: d.id })))
        
        // Match order
        setQuestions(questionIds.map((id: string) => fetched.find(q => q.id === id)).filter(Boolean))
      } finally {
        setLoadingContent(false)
      }
    }
    loadQuestions()
  }, [db, mock])

  const handleSaveQuestion = async () => {
    if (!db || !editingQuestion) return
    const qRef = doc(db, "questions", editingQuestion.id)
    
    const payload = {
      ...editingQuestion,
      updatedAt: serverTimestamp()
    }

    try {
      await setDoc(qRef, payload, { merge: true })
      setQuestions(questions.map((q: any) => q.id === editingQuestion.id ? editingQuestion : q))
      toast({ title: "Node Updated", description: "Bilingual content synced to bank." })
      setEditingQuestion(null)
    } catch (e: any) {
      toast({ variant: "destructive", title: "Save Failed", description: e.message })
    }
  }

  const sections = useMemo(() => {
    const groups: Record<string, any[]> = {}
    questions.forEach((q, idx) => {
      const sectionName = q.sectionId || 'General Content'
      if (!groups[sectionName]) groups[sectionName] = []
      groups[sectionName].push({ ...q, originalIndex: idx + 1 })
    })
    return Object.entries(groups)
  }, [questions])

  if (loadingContent) return <div className="h-screen flex items-center justify-center bg-white"><Loader2 className="h-10 w-10 text-primary animate-spin" /></div>

  return (
    <div className="max-w-7xl mx-auto space-y-6 md:space-y-12 pb-32 text-left pt-2 md:pt-6">
      
      {/* HEADER - RESPONSIVE STACK */}
      <div className="flex flex-col md:flex-row md:items-center justify-between px-4 gap-6">
        <div className="flex items-center gap-4 md:gap-6">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-2xl h-10 w-10 md:h-12 md:w-12 border border-slate-200 bg-white shadow-sm shrink-0">
            <ChevronLeft className="h-5 w-5 md:h-6 md:w-6" />
          </Button>
          <div className="text-left min-w-0 flex-1">
            <h1 className="text-2xl md:text-4xl font-headline font-black text-[#0F172A] uppercase tracking-tight truncate">{mock?.title || "Mock Editor"}</h1>
            <p className="text-[9px] md:text-[10px] font-black uppercase text-slate-400 tracking-widest mt-1">Manual Content Hub • {questions.length} Questions</p>
          </div>
        </div>
        <Button className="w-full md:w-auto bg-[#0F172A] hover:bg-black text-white h-12 md:h-14 px-8 md:px-10 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-2xl gap-3" onClick={() => router.back()}>
          <ClipboardCheck className="h-4 w-4 text-primary" /> Finish Audit
        </Button>
      </div>

      {/* CONTENT LIST */}
      <div className="space-y-10 md:space-y-16 px-4">
        {sections.map(([name, qList]) => (
          <div key={name} className="space-y-6 md:space-y-8">
            <div className="flex items-center gap-4 border-b border-slate-100 pb-4">
               <div className="h-8 w-8 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                  <BookOpen className="h-4 w-4" />
               </div>
               <h2 className="text-lg md:text-2xl font-headline font-black uppercase text-[#0F172A]">{name}</h2>
               <Badge className="bg-slate-50 text-slate-400 border-none font-black text-[8px] md:text-[9px] uppercase px-3 py-1">{qList.length} Nodes</Badge>
            </div>

            <div className="grid grid-cols-1 gap-4 md:gap-6">
               {qList.map((q) => (
                  <Card key={q.id} className="border-none shadow-xl rounded-[2rem] md:rounded-[2.5rem] bg-white group hover:shadow-2xl transition-all border border-slate-100 overflow-hidden">
                     <CardContent className="p-6 md:p-10 flex flex-col md:flex-row items-start gap-6 md:gap-10">
                        <div className="h-10 w-10 md:h-12 md:w-12 rounded-xl md:rounded-2xl bg-slate-50 flex items-center justify-center text-[#0F172A] font-black text-base md:text-lg shadow-inner shrink-0">
                           {q.originalIndex}
                        </div>
                        <div className="flex-1 space-y-4 min-w-0">
                           <div className="space-y-2">
                              <p className="font-bold text-base md:text-lg text-[#0F172A] leading-snug">{q.englishQuestion}</p>
                              <p className="font-bold text-base md:text-lg text-slate-400 leading-snug">{q.punjabiQuestion || q.hindiQuestion}</p>
                           </div>
                           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                              {['A','B','C','D'].map(opt => (
                                <div key={opt} className={cn("p-2.5 md:p-3 rounded-xl border-2 text-[10px] md:text-[11px] font-black uppercase tracking-tight", q.correctAnswer === opt ? "bg-emerald-50 border-emerald-500 text-emerald-700" : "bg-slate-50 border-transparent text-slate-400")}>
                                   <span className="mr-2 opacity-50">{opt}</span> {q[`option${opt}English`]}
                                </div>
                              ))}
                           </div>
                        </div>
                        <Button 
                          onClick={() => setEditingQuestion({...q})} 
                          className="w-full md:w-auto h-11 md:h-12 px-6 md:px-8 bg-slate-50 hover:bg-primary text-slate-600 hover:text-white rounded-xl font-black uppercase text-[9px] md:text-[10px] tracking-widest gap-2 shadow-sm shrink-0"
                        >
                           <Edit className="h-4 w-4" /> Edit Content
                        </Button>
                     </CardContent>
                  </Card>
               ))}
            </div>
          </div>
        ))}
      </div>

      {/* EDIT DIALOG */}
      <Dialog open={!!editingQuestion} onOpenChange={o => !o && setEditingQuestion(null)}>
         <DialogContent className="sm:max-w-5xl max-h-[95vh] overflow-y-auto rounded-[2rem] md:rounded-[3rem] bg-white border-none shadow-5xl p-0 text-left flex flex-col">
            <div className="h-2 w-full bg-[#0F172A] shrink-0" />
            
            <Tabs value={activeLangTab} onValueChange={(v: any) => setActiveLangTab(v)} className="flex-1 flex flex-col overflow-hidden">
               <DialogHeader className="p-6 md:p-10 pb-4 flex flex-col md:flex-row items-center justify-between shrink-0 gap-4">
                  <div className="flex items-center gap-4 md:gap-6 w-full md:w-auto">
                     <div className="h-10 w-10 md:h-12 md:w-12 bg-primary/10 rounded-xl md:rounded-2xl flex items-center justify-center text-primary shadow-inner">
                        <Edit className="h-5 w-5 md:h-6 md:w-6" />
                     </div>
                     <DialogTitle className="text-xl md:text-3xl font-black font-headline uppercase text-[#0F172A]">Edit Question {editingQuestion?.originalIndex}</DialogTitle>
                     <DialogDescription className="sr-only">Edit question statement, options and rationalization.</DialogDescription>
                  </div>
                  <TabsList className="bg-slate-100 p-1 h-11 md:h-12 rounded-xl w-full md:w-auto">
                     <TabsTrigger value="punjabi" className="flex-1 md:flex-none rounded-lg px-4 md:px-6 font-black uppercase text-[8px] md:text-[9px] data-[state=active]:bg-[#0F172A] data-[state=active]:text-white">Punjab Hub</TabsTrigger>
                     <TabsTrigger value="hindi" className="flex-1 md:flex-none rounded-lg px-4 md:px-6 font-black uppercase text-[8px] md:text-[9px] data-[state=active]:bg-[#0F172A] data-[state=active]:text-white">Hindi Hub</TabsTrigger>
                  </TabsList>
               </DialogHeader>

               <div className="flex-1 overflow-y-auto custom-scrollbar px-6 md:px-10 pb-10 space-y-8 md:space-y-10">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                     <div className="space-y-2">
                        <Label className="text-[9px] md:text-[10px] font-black uppercase text-slate-500 ml-1">English Statement</Label>
                        <Textarea value={editingQuestion?.englishQuestion || ""} onChange={e => setEditingQuestion({...editingQuestion, englishQuestion: e.target.value})} className="h-28 md:h-32 rounded-xl md:rounded-2xl bg-slate-50 border-none font-bold text-base md:text-lg p-4 md:p-6 shadow-inner" />
                     </div>
                     <TabsContent value="punjabi" className="m-0 space-y-2 animate-in fade-in duration-300">
                        <Label className="text-[9px] md:text-[10px] font-black uppercase text-slate-500 ml-1">Punjabi Statement</Label>
                        <Textarea value={editingQuestion?.punjabiQuestion || ""} onChange={e => setEditingQuestion({...editingQuestion, punjabiQuestion: e.target.value})} className="h-28 md:h-32 rounded-xl md:rounded-2xl bg-slate-50 border-none font-bold text-base md:text-lg p-4 md:p-6 shadow-inner" />
                     </TabsContent>
                     <TabsContent value="hindi" className="m-0 space-y-2 animate-in fade-in duration-300">
                        <Label className="text-[9px] md:text-[10px] font-black uppercase text-slate-500 ml-1">Hindi Statement</Label>
                        <Textarea value={editingQuestion?.hindiQuestion || ""} onChange={e => setEditingQuestion({...editingQuestion, hindiQuestion: e.target.value})} className="h-28 md:h-32 rounded-xl md:rounded-2xl bg-slate-50 border-none font-bold text-base md:text-lg p-4 md:p-6 shadow-inner" />
                     </TabsContent>
                  </div>

                  <div className="space-y-6">
                     <p className="text-[9px] md:text-[10px] font-black text-primary uppercase tracking-[0.3em] ml-1">Options Matrix</p>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                        {['A','B','C','D'].map(opt => (
                           <div key={opt} className="bg-slate-50/50 p-4 md:p-6 rounded-[1.5rem] md:rounded-[2rem] border border-slate-100 space-y-4">
                              <div className="flex items-center justify-between">
                                 <div className="flex items-center gap-2 md:gap-3">
                                    <div className="h-6 w-6 md:h-7 md:w-7 rounded-full bg-[#0F172A] text-white flex items-center justify-center font-black text-[10px]">{opt}</div>
                                    <Label className="text-[9px] md:text-[10px] font-black uppercase text-slate-500">English Text</Label>
                                 </div>
                                 <button onClick={() => setEditingQuestion({...editingQuestion, correctAnswer: opt})} className={cn("h-6 w-6 rounded-full border-2 transition-all flex items-center justify-center", editingQuestion?.correctAnswer === opt ? "bg-emerald-50 border-emerald-500 text-white" : "border-slate-200 hover:border-primary")}>
                                    {editingQuestion?.correctAnswer === opt && <CheckCircle2 className="h-4 w-4" />}
                                 </button>
                              </div>
                              <Input value={editingQuestion?.[`option${opt}English`] || ""} onChange={e => setEditingQuestion({...editingQuestion, [`option${opt}English`]: e.target.value})} className="bg-white border-none font-bold h-10 md:h-12 rounded-lg md:rounded-xl" />
                              
                              <div className="pt-2 space-y-2">
                                 <Label className="text-[8px] md:text-[9px] font-black uppercase text-slate-400 flex items-center gap-2"><Globe className="h-3 w-3" /> {activeLangTab === 'punjabi' ? 'Punjabi' : 'Hindi'}</Label>
                                 <Input 
                                    value={activeLangTab === 'punjabi' ? (editingQuestion?.[`option${opt}Punjabi`] || "") : (editingQuestion?.[`option${opt}Hindi`] || "")} 
                                    onChange={e => setEditingQuestion({...editingQuestion, [activeLangTab === 'punjabi' ? `option${opt}Punjabi` : `option${opt}Hindi`]: e.target.value})} 
                                    className="bg-white border-none font-bold h-10 md:h-12 rounded-lg md:rounded-xl" 
                                 />
                              </div>
                           </div>
                        ))}
                     </div>
                  </div>

                  <div className="space-y-6 pt-6 border-t border-slate-100">
                     <p className="text-[9px] md:text-[10px] font-black text-primary uppercase tracking-[0.3em] ml-1">Rationalization (Explanation)</p>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                        <div className="space-y-2">
                           <Label className="text-[9px] md:text-[10px] font-black uppercase text-slate-500">English Logic</Label>
                           <Textarea value={editingQuestion?.englishExplanation || ""} onChange={e => setEditingQuestion({...editingQuestion, englishExplanation: e.target.value})} className="h-28 md:h-32 rounded-xl md:rounded-2xl bg-slate-900 text-emerald-400 font-medium p-4 md:p-6 shadow-2xl" />
                        </div>
                        <div className="space-y-2">
                           <Label className="text-[9px] md:text-[10px] font-black uppercase text-slate-500">{activeLangTab === 'punjabi' ? 'Punjabi Logic' : 'Hindi Logic'}</Label>
                           <Textarea 
                              value={activeLangTab === 'punjabi' ? (editingQuestion?.punjabiExplanation || "") : (editingQuestion?.hindiExplanation || "")} 
                              onChange={e => setEditingQuestion({...editingQuestion, [activeLangTab === 'punjabi' ? 'punjabiExplanation' : 'hindiExplanation']: e.target.value})} 
                              className="h-28 md:h-32 rounded-xl md:rounded-2xl bg-slate-900 text-blue-400 font-medium p-4 md:p-6 shadow-2xl" 
                           />
                        </div>
                     </div>
                  </div>
               </div>

               <DialogFooter className="p-6 md:p-10 pt-4 bg-slate-50 flex flex-row gap-4 shrink-0">
                  <Button variant="ghost" onClick={() => setEditingQuestion(null)} className="flex-1 md:flex-none h-12 md:h-14 px-6 md:px-10 font-black uppercase text-[10px] md:text-[11px] text-slate-400 tracking-widest">Discard</Button>
                  <Button onClick={handleSaveQuestion} className="bg-[#0F172A] hover:bg-black text-white h-12 md:h-14 px-10 md:px-16 rounded-xl md:rounded-2xl font-black uppercase text-[10px] md:text-[11px] tracking-[0.2em] flex-1 shadow-2xl transition-all active:scale-95 gap-3">
                     <CheckCircle2 className="h-5 w-5" /> Commit Registry Sync
                  </Button>
               </DialogFooter>
            </Tabs>
         </DialogContent>
      </Dialog>
    </div>
  )
}
