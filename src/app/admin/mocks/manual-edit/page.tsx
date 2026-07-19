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
  X,
  Layers,
  Settings
} from "lucide-react"
import { useUser, useFirestore, useDoc } from "@/firebase"
import { doc, setDoc, serverTimestamp, collection, query, where, documentId, getDocs } from "firebase/firestore"
import { useToast } from "@/hooks/use-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

/**
 * @fileOverview High-Fidelity Manual Content Editor v2.1 [Audit Fixed].
 * FIXED: Hydration now searches mcqBank, questions, and usedQuestions archive.
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

        const fetched: any[] = []
        for (const chunk of chunks) {
          const [mcqSnap, legacySnap, usedSnap] = await Promise.all([
            getDocs(query(collection(db, "mcqBank"), where(documentId(), "in", chunk))),
            getDocs(query(collection(db, "questions"), where(documentId(), "in", chunk))),
            getDocs(query(collection(db, "usedQuestions"), where(documentId(), "in", chunk)))
          ])

          mcqSnap.docs.forEach(d => fetched.push({ ...d.data(), id: d.id }))
          legacySnap.forEach(d => {
             if (!fetched.find(f => f.id === d.id)) fetched.push({ ...d.data(), id: d.id })
          })
          usedSnap.forEach(d => {
             if (!fetched.find(f => f.id === d.id)) fetched.push({ ...d.data(), id: d.id })
          })
        }
        
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
    
    // We update in usedQuestions if it's there, or questions otherwise.
    // Easiest is to check where it came from or just update both to be safe in this context.
    const usedRef = doc(db, "usedQuestions", editingQuestion.id)
    const legacyRef = doc(db, "questions", editingQuestion.id)
    const bankRef = doc(db, "mcqBank", editingQuestion.id)
    
    const payload = {
      ...editingQuestion,
      updatedAt: serverTimestamp()
    }

    try {
      await Promise.all([
         setDoc(usedRef, payload, { merge: true }),
         setDoc(legacyRef, payload, { merge: true }),
         setDoc(bankRef, payload, { merge: true })
      ]);
      
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
      
      {/* 1. HEADER HUB */}
      <div className="flex flex-col md:flex-row md:items-center justify-between px-4 gap-6">
        <div className="flex items-center gap-4 md:gap-6">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-2xl h-10 w-10 md:h-12 md:w-12 border border-slate-200 bg-white shadow-sm shrink-0">
            <ChevronLeft className="h-5 w-5 md:h-6 md:w-6" />
          </Button>
          <div className="text-left min-w-0 flex-1">
            <h1 className="text-2xl md:text-4xl font-black text-[#0F172A] tracking-tight truncate uppercase leading-none">{mock?.title || "Manual Editor"}</h1>
            <p className="text-[10px] md:text-[11px] font-black uppercase text-slate-400 tracking-widest mt-2">Content Modification Hub • {questions.length} Nodes</p>
          </div>
        </div>
        <Button className="w-full md:w-auto bg-[#0F172A] hover:bg-black text-white h-12 md:h-14 px-8 md:px-10 rounded-xl md:rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl gap-3 transition-all active:scale-95" onClick={() => router.back()}>
          <CheckCircle2 className="h-4 w-4 text-primary" /> Finish Content Audit
        </Button>
      </div>

      {/* 2. SECTIONAL CONTENT LIST */}
      <div className="space-y-10 md:space-y-20 px-4">
        {sections.map(([name, qList]) => (
          <div key={name} className="space-y-6 md:space-y-10">
            <div className="flex items-center gap-4 border-b border-slate-100 pb-4">
               <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary shadow-inner shrink-0">
                  <Layers className="h-5 w-5" />
               </div>
               <div className="min-w-0">
                  <h2 className="text-xl md:text-3xl font-black uppercase text-[#0F172A] leading-none">{name}</h2>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">{qList.length} Ingested Nodes</p>
               </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:gap-6">
               {qList.map((q) => (
                  <Card key={q.id} className="border-none shadow-xl rounded-[2rem] md:rounded-[2.5rem] bg-white group hover:shadow-2xl transition-all border border-slate-100 overflow-hidden">
                     <CardContent className="p-6 md:p-12 flex flex-col md:flex-row items-start gap-6 md:gap-10">
                        <div className="h-10 w-10 md:h-16 md:w-16 rounded-xl md:rounded-[2rem] bg-slate-50 flex items-center justify-center text-[#0F172A] font-black text-base md:text-2xl shadow-inner shrink-0 group-hover:scale-105 transition-transform">
                           {q.originalIndex}
                        </div>
                        <div className="flex-1 space-y-4 md:space-y-6 min-w-0">
                           <div className="space-y-3">
                              <div className="font-bold text-base md:text-xl text-[#0F172A] leading-snug"><MathText text={q.englishQuestion} /></div>
                              {(q.punjabiQuestion || q.hindiQuestion) && (
                                 <div className="font-bold text-sm md:text-lg text-slate-400 leading-snug"><MathText text={q.punjabiQuestion || q.hindiQuestion} /></div>
                              )}
                           </div>
                           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                              {['A','B','C','D'].map(opt => (
                                <div key={opt} className={cn("p-3 md:p-4 rounded-xl border-2 text-[10px] md:text-[11px] font-black uppercase tracking-tight", q.correctAnswer === opt ? "bg-emerald-50 border-emerald-500 text-emerald-700 shadow-sm" : "bg-slate-50/50 border-transparent text-slate-400")}>
                                   <span className="mr-3 opacity-50">{opt}</span> {q[`option${opt}English`]}
                                </div>
                              ))}
                           </div>
                        </div>
                        <Button 
                          onClick={() => setEditingQuestion({...q})} 
                          className="w-full md:w-auto h-12 md:h-14 px-8 md:px-10 bg-slate-50 hover:bg-primary text-[#0F172A] hover:text-white rounded-xl md:rounded-2xl font-black uppercase text-[9px] md:text-[11px] tracking-widest gap-2 shadow-sm shrink-0 border-none transition-all active:scale-95"
                        >
                           <Edit className="h-4 w-4" /> Edit Node
                        </Button>
                     </CardContent>
                  </Card>
               ))}
            </div>
          </div>
        ))}
      </div>

      {/* 3. EDIT DIALOG - HARDENED */}
      <Dialog open={!!editingQuestion} onOpenChange={o => !o && setEditingQuestion(null)}>
         <DialogContent className="sm:max-w-5xl w-[95vw] max-h-[95vh] overflow-hidden rounded-[2rem] md:rounded-[3.5rem] bg-white border-none shadow-5xl p-0 text-left flex flex-col">
            <div className="h-2 w-full bg-[#0F172A] shrink-0" />
            
            <Tabs value={activeLangTab} onValueChange={(v: any) => setActiveLangTab(v)} className="flex-1 flex flex-col overflow-hidden">
               <DialogHeader className="p-6 md:p-14 pb-4 flex flex-col md:flex-row items-center justify-between shrink-0 gap-6 border-b border-slate-50">
                  <div className="flex items-center gap-4 md:gap-8 w-full md:w-auto">
                     <div className="h-12 w-12 md:h-16 md:w-16 bg-primary/10 rounded-xl md:rounded-[2rem] flex items-center justify-center text-primary shadow-inner">
                        <Settings className="h-6 w-6 md:h-8 md:w-8" />
                     </div>
                     <div className="text-left">
                        <DialogTitle className="text-xl md:text-4xl font-black font-headline uppercase text-[#0F172A] leading-none">Modify Asset</DialogTitle>
                        <p className="text-[10px] md:text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-2">Node {editingQuestion?.originalIndex} • Bilingual Hub</p>
                     </div>
                  </div>
                  <TabsList className="bg-slate-100 p-1 h-11 md:h-14 rounded-xl md:rounded-2xl w-full md:w-auto shadow-inner">
                     <TabsTrigger value="punjabi" className="flex-1 md:flex-none rounded-lg md:rounded-xl px-4 md:px-10 font-black uppercase text-[8px] md:text-[10px] data-[state=active]:bg-[#0F172A] data-[state=active]:text-white transition-all">Punjab Hub</TabsTrigger>
                     <TabsTrigger value="hindi" className="flex-1 md:flex-none rounded-lg md:rounded-xl px-4 md:px-10 font-black uppercase text-[8px] md:text-[10px] data-[state=active]:bg-[#0F172A] data-[state=active]:text-white transition-all">Hindi Hub</TabsTrigger>
                  </TabsList>
               </DialogHeader>

               <div className="flex-1 overflow-y-auto custom-scrollbar px-6 md:px-14 py-8 md:py-12 space-y-10 md:space-y-16">
                  {/* STATEMENT GRID */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-14">
                     <div className="space-y-3">
                        <Label className="text-[10px] md:text-[11px] font-black uppercase text-slate-500 ml-1">English Statement</Label>
                        <Textarea value={editingQuestion?.englishQuestion || ""} onChange={e => setEditingQuestion({...editingQuestion, englishQuestion: e.target.value})} className="h-32 md:h-44 rounded-xl md:rounded-[2rem] bg-slate-50 border-none font-bold text-base md:text-xl p-6 md:p-10 shadow-inner" />
                     </div>
                     <TabsContent value="punjabi" className="m-0 space-y-3 animate-in fade-in duration-300">
                        <Label className="text-[10px] md:text-[11px] font-black uppercase text-slate-500 ml-1">Punjabi Statement</Label>
                        <Textarea value={editingQuestion?.punjabiQuestion || ""} onChange={e => setEditingQuestion({...editingQuestion, punjabiQuestion: e.target.value})} className="h-32 md:h-44 rounded-xl md:rounded-[2rem] bg-slate-50 border-none font-bold text-base md:text-xl p-6 md:p-10 shadow-inner" />
                     </TabsContent>
                     <TabsContent value="hindi" className="m-0 space-y-3 animate-in fade-in duration-300">
                        <Label className="text-[10px] md:text-[11px] font-black uppercase text-slate-500 ml-1">Hindi Statement</Label>
                        <Textarea value={editingQuestion?.hindiQuestion || ""} onChange={e => setEditingQuestion({...editingQuestion, hindiQuestion: e.target.value})} className="h-32 md:h-44 rounded-xl md:rounded-[2rem] bg-slate-50 border-none font-bold text-base md:text-xl p-6 md:p-10 shadow-inner" />
                     </TabsContent>
                  </div>

                  {/* OPTION HUB */}
                  <div className="space-y-8">
                     <p className="text-[10px] md:text-[11px] font-black text-primary uppercase tracking-[0.3em] ml-1">2. Option Matrix</p>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
                        {['A','B','C','D'].map(opt => (
                           <div key={opt} className="bg-slate-50/50 p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] border border-slate-100 space-y-6 shadow-sm">
                              <div className="flex items-center justify-between">
                                 <div className="flex items-center gap-3 md:gap-4">
                                    <div className="h-8 w-8 md:h-10 md:w-10 rounded-full bg-[#0F172A] text-white flex items-center justify-center font-black text-xs md:text-lg shadow-xl">{opt}</div>
                                    <Label className="text-[10px] md:text-[11px] font-black uppercase text-slate-500">English Option</Label>
                                 </div>
                                 <button onClick={() => setEditingQuestion({...editingQuestion, correctAnswer: opt})} className={cn("h-8 w-8 md:h-10 md:w-10 rounded-full border-2 transition-all flex items-center justify-center", editingQuestion?.correctAnswer === opt ? "bg-emerald-500 border-emerald-500 text-white shadow-xl" : "border-slate-200 hover:border-primary bg-white")}>
                                    {editingQuestion?.correctAnswer === opt && <CheckCircle2 className="h-5 w-5" />}
                                 </button>
                              </div>
                              <div className="space-y-4">
                                 <Input value={editingQuestion?.[`option${opt}English`] || ""} onChange={e => setEditingQuestion({...editingQuestion, [`option${opt}English`]: e.target.value})} className="bg-white border-none font-bold h-12 md:h-16 rounded-xl md:rounded-2xl px-6 shadow-sm" />
                                 <div className="pt-2 space-y-2">
                                    <Label className="text-[9px] md:text-[10px] font-black uppercase text-slate-400 flex items-center gap-2 tracking-widest"><Globe className="h-3 w-3" /> {activeLangTab === 'punjabi' ? 'Punjabi Text' : 'Hindi Text'}</Label>
                                    <Input 
                                       value={activeLangTab === 'punjabi' ? (editingQuestion?.[`option${opt}Punjabi`] || "") : (editingQuestion?.[`option${opt}Hindi`] || "")} 
                                       onChange={e => setEditingQuestion({...editingQuestion, [activeLangTab === 'punjabi' ? `option${opt}Punjabi` : `option${opt}Hindi`]: e.target.value})} 
                                       className="bg-white border-none font-bold h-12 md:h-16 rounded-xl md:rounded-2xl px-6 shadow-sm" 
                                    />
                                 </div>
                              </div>
                           </div>
                        ))}
                     </div>
                  </div>

                  {/* RATIONALE HUB */}
                  <div className="space-y-8 pt-10 border-t border-slate-50">
                     <p className="text-[10px] md:text-[11px] font-black text-primary uppercase tracking-[0.3em] ml-1">3. Solution Rationale</p>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-14">
                        <div className="space-y-3">
                           <Label className="text-[10px] md:text-[11px] font-black uppercase text-slate-500 ml-1">English Rationale</Label>
                           <Textarea value={editingQuestion?.englishExplanation || ""} onChange={e => setEditingQuestion({...editingQuestion, englishExplanation: e.target.value})} className="h-32 md:h-52 rounded-xl md:rounded-[2.5rem] bg-slate-900 text-emerald-400 font-medium p-6 md:p-10 shadow-2xl leading-relaxed" placeholder="Type verified English logic..." />
                        </div>
                        <div className="space-y-3">
                           <Label className="text-[10px] md:text-[11px] font-black uppercase text-slate-500 ml-1">{activeLangTab === 'punjabi' ? 'Punjabi Rationale' : 'Hindi Rationale'}</Label>
                           <Textarea 
                              value={activeLangTab === 'punjabi' ? (editingQuestion?.punjabiExplanation || "") : (editingQuestion?.hindiExplanation || "")} 
                              onChange={e => setEditingQuestion({...editingQuestion, [activeLangTab === 'punjabi' ? 'punjabiExplanation' : 'hindiExplanation']: e.target.value})} 
                              className="h-32 md:h-52 rounded-xl md:rounded-[2.5rem] bg-slate-900 text-blue-400 font-medium p-6 md:p-10 shadow-2xl leading-relaxed" 
                              placeholder={`Type verified ${activeLangTab} logic...`}
                           />
                        </div>
                     </div>
                  </div>
               </div>

               <DialogFooter className="p-6 md:p-14 pt-4 bg-slate-50 border-t border-slate-100 flex flex-row gap-4 items-center shrink-0">
                  <Button variant="ghost" onClick={() => setEditingQuestion(null)} className="flex-1 md:flex-none h-12 md:h-18 px-6 md:px-12 font-black uppercase text-[10px] md:text-[11px] text-slate-400 tracking-widest bg-transparent">Discard</Button>
                  <Button onClick={handleSaveQuestion} className="bg-[#0F172A] hover:bg-black text-white h-12 md:h-18 px-12 md:px-24 rounded-xl md:rounded-full font-black uppercase text-[10px] md:text-[11px] tracking-[0.2em] flex-1 shadow-2xl transition-all active:scale-95 gap-3 border-none">
                     <CheckCircle2 className="h-5 w-5" /> Commit Node Registry Sync
                  </Button>
               </DialogFooter>
            </Tabs>
         </DialogContent>
      </Dialog>
    </div>
  )
}

function MathText({ text }: { text: string }) {
   if (!text) return null;
   return <div className="leading-relaxed">{text}</div>;
}
