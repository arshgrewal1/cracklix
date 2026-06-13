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
 * @fileOverview High-Fidelity Manual Content Editor v1.3.
 * ACCESSIBILITY: Added DialogDescription for ARIA compliance.
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
  
  const mockId = searchParams.get("id")
  const [isSavingAll, setIsSavingAll] = useState(false)
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
        setQuestions(questionIds.map(id => fetched.find(q => q.id === id)).filter(Boolean))
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
      setQuestions(questions.map(q => q.id === editingQuestion.id ? editingQuestion : q))
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
    <div className="max-w-7xl mx-auto space-y-12 pb-32 text-left pt-6">
      
      {/* HEADER */}
      <div className="flex items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-2xl h-12 w-12 border border-slate-200 bg-white shadow-sm hover:bg-slate-50">
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <div className="text-left">
            <h1 className="text-4xl font-headline font-black text-[#0F172A] uppercase tracking-tight">{mock?.title || "Mock Editor"}</h1>
            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mt-1">Manual Content Hub • {questions.length} Questions</p>
          </div>
        </div>
        <Button className="bg-[#0F172A] hover:bg-black text-white h-14 px-10 rounded-2xl font-black uppercase tracking-widest text-xs shadow-2xl gap-3" onClick={() => router.back()}>
          <ClipboardCheck className="h-4 w-4 text-primary" /> Finish Audit
        </Button>
      </div>

      {/* CONTENT LIST */}
      <div className="space-y-16 px-4">
        {sections.map(([name, qList]) => (
          <div key={name} className="space-y-8">
            <div className="flex items-center gap-4 border-b border-slate-100 pb-4">
               <div className="h-8 w-8 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                  <BookOpen className="h-4 w-4" />
               </div>
               <h2 className="text-2xl font-headline font-black uppercase text-[#0F172A]">{name}</h2>
               <Badge className="bg-slate-50 text-slate-400 border-none font-black text-[9px] uppercase px-3 py-1">{qList.length} Nodes</Badge>
            </div>

            <div className="grid grid-cols-1 gap-6">
               {qList.map((q) => (
                  <Card key={q.id} className="border-none shadow-xl rounded-[2.5rem] bg-white group hover:shadow-2xl transition-all border border-slate-50 overflow-hidden">
                     <CardContent className="p-8 md:p-10 flex flex-col md:flex-row items-start gap-10">
                        <div className="h-12 w-12 rounded-2xl bg-slate-50 flex items-center justify-center text-[#0F172A] font-black text-lg shadow-inner shrink-0">
                           {q.originalIndex}
                        </div>
                        <div className="flex-1 space-y-4 min-w-0">
                           <div className="space-y-2">
                              <p className="font-bold text-lg text-[#0F172A] leading-snug">{q.englishQuestion}</p>
                              <p className="font-bold text-lg text-slate-400 leading-snug">{q.punjabiQuestion || q.hindiQuestion}</p>
                           </div>
                           <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                              {['A','B','C','D'].map(opt => (
                                <div key={opt} className={cn("p-3 rounded-xl border-2 text-[11px] font-black uppercase tracking-tight", q.correctAnswer === opt ? "bg-emerald-50 border-emerald-500 text-emerald-700" : "bg-slate-50 border-transparent text-slate-400")}>
                                   <span className="mr-2 opacity-50">{opt}</span> {q[`option${opt}English`]}
                                </div>
                              ))}
                           </div>
                        </div>
                        <Button 
                          onClick={() => setEditingQuestion({...q})} 
                          className="h-12 px-8 bg-slate-50 hover:bg-primary text-slate-600 hover:text-white rounded-xl font-black uppercase text-[10px] tracking-widest gap-2 shadow-sm shrink-0"
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
         <DialogContent className="sm:max-w-5xl max-h-[95vh] overflow-y-auto rounded-[3rem] bg-white border-none shadow-5xl p-0 text-left flex flex-col">
            <div className="h-2 w-full bg-[#0F172A] shrink-0" />
            
            <Tabs value={activeLangTab} onValueChange={(v: any) => setActiveLangTab(v)} className="flex-1 flex flex-col overflow-hidden">
               <DialogHeader className="p-10 pb-4 flex flex-row items-center justify-between shrink-0">
                  <div className="flex items-center gap-6">
                     <div className="h-12 w-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary shadow-inner">
                        <Edit className="h-6 w-6" />
                     </div>
                     <DialogTitle className="text-3xl font-black font-headline uppercase text-[#0F172A]">Edit Question {editingQuestion?.originalIndex}</DialogTitle>
                     <DialogDescription className="sr-only">Edit question statement, options and rationalization for this mock asset.</DialogDescription>
                  </div>
                  <TabsList className="bg-slate-100 p-1 h-12 rounded-xl">
                     <TabsTrigger value="punjabi" className="rounded-lg px-6 font-black uppercase text-[9px] data-[state=active]:bg-[#0F172A] data-[state=active]:text-white">Punjab Hub</TabsTrigger>
                     <TabsTrigger value="hindi" className="rounded-lg px-6 font-black uppercase text-[9px] data-[state=active]:bg-[#0F172A] data-[state=active]:text-white">Hindi Hub</TabsTrigger>
                  </TabsList>
               </DialogHeader>

               <div className="flex-1 overflow-y-auto custom-scrollbar px-10 pb-10 space-y-10">
                  {/* Statements */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">English Statement</Label>
                        <Textarea value={editingQuestion?.englishQuestion || ""} onChange={e => setEditingQuestion({...editingQuestion, englishQuestion: e.target.value})} className="h-32 rounded-2xl bg-slate-50 border-none font-bold text-lg p-6 shadow-inner" />
                     </div>
                     <TabsContent value="punjabi" className="m-0 space-y-2">
                        <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Punjabi Statement</Label>
                        <Textarea value={editingQuestion?.punjabiQuestion || ""} onChange={e => setEditingQuestion({...editingQuestion, punjabiQuestion: e.target.value})} className="h-32 rounded-2xl bg-slate-50 border-none font-bold text-lg p-6 shadow-inner" />
                     </TabsContent>
                     <TabsContent value="hindi" className="m-0 space-y-2">
                        <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Hindi Statement</Label>
                        <Textarea value={editingQuestion?.hindiQuestion || ""} onChange={e => setEditingQuestion({...editingQuestion, hindiQuestion: e.target.value})} className="h-32 rounded-2xl bg-slate-50 border-none font-bold text-lg p-6 shadow-inner" />
                     </TabsContent>
                  </div>

                  {/* Options Matrix */}
                  <div className="space-y-6">
                     <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em] ml-1">Options Matrix</p>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {['A','B','C','D'].map(opt => (
                           <div key={opt} className="bg-slate-50/50 p-6 rounded-[2rem] border border-slate-100 space-y-4">
                              <div className="flex items-center justify-between">
                                 <div className="flex items-center gap-3">
                                    <div className="h-7 w-7 rounded-full bg-[#0F172A] text-white flex items-center justify-center font-black text-xs">{opt}</div>
                                    <Label className="text-[10px] font-black uppercase text-slate-500">English Text</Label>
                                 </div>
                                 <button onClick={() => setEditingQuestion({...editingQuestion, correctAnswer: opt})} className={cn("h-6 w-6 rounded-full border-2 transition-all flex items-center justify-center", editingQuestion?.correctAnswer === opt ? "bg-emerald-500 border-emerald-500 text-white" : "border-slate-200 hover:border-primary")}>
                                    {editingQuestion?.correctAnswer === opt && <CheckCircle2 className="h-4 w-4" />}
                                 </button>
                              </div>
                              <Input value={editingQuestion?.[`option${opt}English`] || ""} onChange={e => setEditingQuestion({...editingQuestion, [`option${opt}English`]: e.target.value})} className="bg-white border-none font-bold h-12 rounded-xl" />
                              
                              <div className="pt-2 space-y-2">
                                 <Label className="text-[9px] font-black uppercase text-slate-400 flex items-center gap-2"><Globe className="h-3 w-3" /> {activeLangTab === 'punjabi' ? 'Punjabi Text' : 'Hindi Text'}</Label>
                                 <Input 
                                    value={activeLangTab === 'punjabi' ? (editingQuestion?.[`option${opt}Punjabi`] || "") : (editingQuestion?.[`option${opt}Hindi`] || "")} 
                                    onChange={e => setEditingQuestion({...editingQuestion, [activeLangTab === 'punjabi' ? `option${opt}Punjabi` : `option${opt}Hindi`]: e.target.value})} 
                                    className="bg-white border-none font-bold h-12 rounded-xl" 
                                 />
                              </div>
                           </div>
                        ))}
                     </div>
                  </div>

                  {/* Explanation Hub */}
                  <div className="space-y-6 pt-6 border-t border-slate-100">
                     <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em] ml-1">Rationalization (Explanation)</p>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                           <Label className="text-[10px] font-black uppercase text-slate-500">English Logic</Label>
                           <Textarea value={editingQuestion?.englishExplanation || ""} onChange={e => setEditingQuestion({...editingQuestion, englishExplanation: e.target.value})} className="h-32 rounded-2xl bg-slate-900 text-emerald-400 font-medium p-6 shadow-2xl" />
                        </div>
                        <div className="space-y-2">
                           <Label className="text-[10px] font-black uppercase text-slate-500">{activeLangTab === 'punjabi' ? 'Punjabi Logic' : 'Hindi Logic'}</Label>
                           <Textarea 
                              value={activeLangTab === 'punjabi' ? (editingQuestion?.punjabiExplanation || "") : (editingQuestion?.hindiExplanation || "")} 
                              onChange={e => setEditingQuestion({...editingQuestion, [activeLangTab === 'punjabi' ? `punjabiExplanation' : `hindiExplanation`]: e.target.value})} 
                              className="h-32 rounded-2xl bg-slate-900 text-blue-400 font-medium p-6 shadow-2xl" 
                           />
                        </div>
                     </div>
                  </div>
               </div>

               <DialogFooter className="p-10 pt-6 bg-slate-50 flex gap-6 shrink-0">
                  <Button variant="ghost" onClick={() => setEditingQuestion(null)} className="h-16 px-10 font-black uppercase text-[11px] text-slate-400 tracking-widest">Discard Audit</Button>
                  <Button onClick={handleSaveQuestion} className="bg-[#0F172A] hover:bg-black text-white h-16 px-16 rounded-2xl font-black uppercase text-[11px] tracking-[0.2em] flex-1 shadow-2xl transition-all active:scale-95 gap-3">
                     <CheckCircle2 className="h-5 w-5" /> Sync Content to Registry
                  </Button>
               </DialogFooter>
            </Tabs>
         </DialogContent>
      </Dialog>
    </div>
  )
}
