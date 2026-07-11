"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { 
  ChevronLeft, 
  Loader2, 
  Trash2, 
  Rocket, 
  ClipboardList, 
  ArrowRight, 
  FileText,
  Edit,
  X,
  Database,
  SearchCode,
  CheckCircle2,
  Languages,
  Globe
} from "lucide-react"
import { useCollection, useFirestore } from "@/firebase"
import { collection, doc, writeBatch, serverTimestamp, DocumentData, FirestoreDataConverter } from "firebase/firestore"
import { useToast } from "@/hooks/use-toast"
import { parseBulkQuestions } from "@/lib/parser"
import { Board, Subject, Question } from "@/types"
import QuestionRenderer from "@/components/questions/QuestionRenderer"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

const boardConverter: FirestoreDataConverter<Board> = {
    toFirestore: (data: Board): DocumentData => data,
    fromFirestore: (snap): Board => snap.data() as Board
};

const subjectConverter: FirestoreDataConverter<Subject> = {
    toFirestore: (data: Subject): DocumentData => data,
    fromFirestore: (snap): Subject => snap.data() as Subject
};

export default function BulkImportPage() {
  const router = useRouter()
  const db = useFirestore()
  const { toast } = useToast()
  
  const { data: boards } = useCollection<Board>(useMemo(() => (db ? collection(db, "boards").withConverter(boardConverter) : null), [db]))
  const { data: subjects } = useCollection<Subject>(useMemo(() => (db ? collection(db, "subjects").withConverter(subjectConverter) : null), [db]))

  const [metadata, setMetadata] = useState({
    boardId: "",
    subjectId: "",
    secondaryLanguage: "punjabi" as 'punjabi' | 'hindi',
  })

  const [rawText, setRawText] = useState("")
  const [parsedQuestions, setParsedQuestions] = useState<Question[]>([])
  const [isSyncing, setIsSyncing] = useState(false)
  
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [editForm, setEditForm] = useState<Question | null>(null)

  const handleImport = () => {
    if (!rawText.trim()) return
    if (!metadata.boardId || !metadata.subjectId) {
      toast({ variant: "destructive", title: "Wait", description: "Please select a Board and Subject hub." })
      return
    }

    const result = parseBulkQuestions(rawText, metadata);
    const questionsWithStatus = result.questions.map(q => ({ 
       ...q, 
       status: 'UNUSED',
       usedCount: 0 
    }));
    setParsedQuestions(questionsWithStatus);

    if (result.questions.length > 0) {
      toast({ title: "Extraction Success", description: `${result.questions.length} blocks mapped correctly.` });
    } else {
      toast({ variant: "destructive", title: "Extraction Failed", description: "Could not find valid question patterns." });
    }
  }

  const handleOpenEdit = (idx: number) => {
    setEditingIndex(idx)
    setEditForm({ ...parsedQuestions[idx] })
  }

  const handleSaveEdit = () => {
    if (editingIndex === null || !editForm) return
    const updated = [...parsedQuestions]
    updated[editingIndex] = editForm
    setParsedQuestions(updated)
    setEditingIndex(null)
    toast({ title: "Node Updated" })
  }

  const handleDelete = (idx: number) => {
    setParsedQuestions(parsedQuestions.filter((_, i) => i !== idx))
    toast({ title: "Block Purged" })
  }

  const handleSaveToRegistry = async () => {
    if (!db || parsedQuestions.length === 0) return
    setIsSyncing(true)
    const batch = writeBatch(db)

    parsedQuestions.forEach(q => {
      const { debug, ...cleanQ } = q as Question & { debug?: any };
      const qRef = doc(collection(db, "questions"))
      batch.set(qRef, {
        ...cleanQ,
        id: qRef.id,
        status: 'UNUSED',
        usedCount: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
    })

    try {
      await batch.commit()
      toast({ title: "Registry Synced", description: `${parsedQuestions.length} assets committed.` })
      router.push("/admin/questions")
    } catch (e) {
      console.error(e);
      toast({ variant: "destructive", title: "Sync failed" })
    } finally {
      setIsSyncing(false)
    }
  }

  const isHindiMode = metadata.secondaryLanguage === 'hindi';

  return (
    <div className="space-y-6 md:space-y-10 pb-32 text-left max-w-7xl mx-auto pt-4 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 px-1">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-xl border border-slate-200 h-10 w-10 md:h-12 md:w-12 bg-white shadow-sm shrink-0">
             <ChevronLeft className="h-5 w-5 md:h-6 md:w-6" />
          </Button>
          <div>
            <h1 className="text-2xl md:text-5xl font-black text-[#0F172A] tracking-tight leading-none">Bulk Ingestion</h1>
            <p className="text-slate-500 font-medium text-[11px] md:text-lg mt-1">Stacked Multi-Language Mapping Hub.</p>
          </div>
        </div>
        <Button onClick={handleSaveToRegistry} disabled={isSyncing || parsedQuestions.length === 0} className="w-full md:w-auto bg-[#0F172A] hover:bg-black text-white font-bold rounded-full h-11 md:h-14 px-8 md:px-12 gap-3 shadow-xl">
          {isSyncing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Rocket className="h-4 w-4 text-primary" />} Commit Staged Assets
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-10 px-1">
        <div className="lg:col-span-5 space-y-6 md:space-y-8">
          <Card className="border-none bg-white shadow-xl rounded-2xl md:rounded-[2.5rem] overflow-hidden border border-slate-50">
            <div className="h-1.5 w-full bg-[#0F172A]" />
            <CardHeader className="p-6 md:p-10 pb-2 text-left">
              <CardTitle className="text-lg md:text-2xl font-black text-[#0F172A] flex items-center gap-3">
                 <ClipboardList className="h-5 w-5 text-primary" /> Ingestion Config
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 md:p-10 pt-4 space-y-6 md:space-y-8">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5 text-left">
                  <Label className="text-[9px] font-black text-slate-400 ml-1 uppercase tracking-widest">Target Board</Label>
                  <Select value={metadata.boardId} onValueChange={v => setMetadata({...metadata, boardId: v})}>
                    <SelectTrigger className="rounded-xl h-11 md:h-12 bg-slate-50 border-none font-bold text-xs">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>{boards?.map((b) => <SelectItem key={b.id} value={b.id}>{b.abbreviation}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5 text-left">
                   <Label className="text-[9px] font-black text-slate-400 ml-1 uppercase tracking-widest">Target Subject</Label>
                   <Select value={metadata.subjectId} onValueChange={v => setMetadata({...metadata, subjectId: v})}>
                      <SelectTrigger className="rounded-xl h-11 md:h-12 bg-slate-50 border-none font-bold text-xs">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>{subjects?.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
                   </Select>
                </div>
              </div>

              <div className="space-y-1.5 pt-2 text-left">
                 <Label className="text-[9px] font-black text-slate-400 ml-1 flex items-center gap-2 uppercase tracking-widest">
                    <Languages className="h-3 w-3" /> Secondary Assessment Language
                 </Label>
                 <Select value={metadata.secondaryLanguage} onValueChange={(v: 'punjabi' | 'hindi') => setMetadata({...metadata, secondaryLanguage: v})}>
                    <SelectTrigger className="rounded-xl h-12 md:h-14 bg-slate-900 text-white border-none font-bold text-[13px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                       <SelectItem value="punjabi">English + Punjabi</SelectItem>
                       <SelectItem value="hindi">English + Hindi</SelectItem>
                    </SelectContent>
                 </Select>
              </div>
            </CardContent>
          </Card>
          
          <div className="space-y-4">
            <Textarea 
                value={rawText}
                onChange={e => setRawText(e.target.value)}
                placeholder={`Q15. English Statement...\n${isHindiMode ? 'Hindi Statement...' : 'Punjabi Statement...'}\n(A) Option EN\n${isHindiMode ? 'Hindi Text' : 'Punjabi Text'}\nAnswer: C\nExplanation: Text...`}
                className="min-h-[400px] md:min-h-[500px] rounded-2xl md:rounded-[2.5rem] bg-white border-none p-6 md:p-12 text-sm font-bold shadow-xl leading-relaxed resize-none focus-visible:ring-primary text-[#0F172A] shadow-inner"
            />
            <Button onClick={handleImport} className="w-full h-14 md:h-20 bg-primary hover:bg-orange-600 text-white font-bold rounded-2xl md:rounded-[2.5rem] shadow-2xl gap-3 transition-all active:scale-95 border-none">
               Initialize Ingestion <ArrowRight className="h-5 w-5 md:h-6 md:w-6" />
            </Button>
          </div>
        </div>

        <div className="lg:col-span-7 space-y-6 md:space-y-10">
           {parsedQuestions.length > 0 ? (
             <div className="space-y-8 md:space-y-12">
                <div className="flex items-center justify-between px-2">
                   <h3 className="text-xl md:text-3xl font-black text-[#0F172A] flex items-center gap-3">
                      <Database className="h-6 w-6 text-primary" /> Staged Hub
                   </h3>
                   <Badge className="bg-emerald-50 text-emerald-600 border-none font-black px-4 py-1.5 rounded-xl text-[8px] md:text-[10px] tracking-widest uppercase shadow-sm">
                      {parsedQuestions.length} Blocks Verified
                   </Badge>
                </div>
                {parsedQuestions.map((q, idx) => (
                  <div key={idx} className="relative group">
                    <Card className="border-none shadow-xl rounded-2xl md:rounded-[3rem] bg-white p-6 md:p-12 text-left group border border-slate-50 transition-all hover:border-primary/20">
                       <div className="flex justify-between items-start mb-6 md:mb-10 border-b border-slate-50 pb-4 md:pb-8">
                          <Badge className="bg-[#0F172A] text-white border-none text-[8px] md:text-[9px] font-bold px-4 py-1.5 rounded-lg uppercase tracking-widest">Asset {idx + 1}</Badge>
                          <div className="flex gap-2 md:gap-3">
                             <button className="h-10 w-10 md:h-12 md:w-12 rounded-xl text-blue-500 bg-blue-50 shadow-sm flex items-center justify-center active:scale-90 transition-all" onClick={() => handleOpenEdit(idx)}><Edit className="h-5 w-5" /></button>
                             <button className="h-10 w-10 md:h-12 md:w-12 rounded-xl text-rose-500 bg-rose-50 shadow-sm flex items-center justify-center active:scale-90 transition-all" onClick={() => handleDelete(idx)}><Trash2 className="h-5 w-5" /></button>
                          </div>
                       </div>
                       <div className="space-y-8">
                          <QuestionRenderer question={q} language={isHindiMode ? "ENGLISH_HINDI" : "ENGLISH_PUNJABI"} showSolution={true} />
                       </div>
                    </Card>
                  </div>
                ))}
             </div>
           ) : (
             <div className="h-full flex flex-col items-center justify-center text-slate-300 opacity-20 pt-40">
                <FileText className="h-32 w-32 md:h-48 md:w-48 mb-8" />
                <p className="font-headline font-black uppercase text-xl md:text-3xl tracking-[0.4em]">Awaiting Hub</p>
             </div>
           )}
        </div>
      </div>

      <Dialog open={editingIndex !== null} onOpenChange={open => !open && setEditingIndex(null)}>
         <DialogContent className="sm:max-w-5xl max-h-[95vh] overflow-y-auto rounded-3xl md:rounded-[3rem] bg-white border-none shadow-5xl p-0 text-left flex flex-col">
            <div className="h-2 w-full bg-[#0F172A] shrink-0" />
            <DialogHeader className="p-6 md:p-10 pb-4 shrink-0">
               <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                     <div className="h-10 w-10 md:h-12 md:w-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600"><SearchCode className="h-6 w-6 md:h-7 md:w-7" /></div>
                     <DialogTitle className="text-xl md:text-3xl font-black text-[#0F172A]">Modify Explicit Fields</DialogTitle>
                  </div>
                  <button onClick={() => setEditingIndex(null)} className="p-2 rounded-xl hover:bg-slate-50 transition-colors"><X className="h-6 w-6 text-slate-400" /></button>
               </div>
               <DialogDescription className="sr-only">Edit the details of the staged question block.</DialogDescription>
            </DialogHeader>
            
            <div className="px-6 md:px-10 pb-6 md:pb-10 space-y-8 md:space-y-12 overflow-y-auto custom-scrollbar flex-1">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
                  <div className="space-y-2 text-left">
                     <Label className="text-[9px] font-black text-slate-500 ml-1 uppercase tracking-widest">English Statement</Label>
                     <Textarea value={editForm?.englishQuestion ?? ""} onChange={e => setEditForm({ ...editForm, englishQuestion: e.target.value } as Question)} className="h-32 rounded-xl bg-slate-50 border-none font-bold text-sm md:text-lg p-5 shadow-inner" />
                  </div>
                  <div className="space-y-2 text-left">
                     <Label className="text-[9px] font-black text-slate-500 ml-1 uppercase tracking-widest">{isHindiMode ? 'Hindi Statement' : 'Punjabi Statement'}</Label>
                     <Textarea 
                        value={isHindiMode ? (editForm?.hindiQuestion ?? "") : (editForm?.punjabiQuestion ?? "")} 
                        onChange={e => setEditForm({ ...editForm, [isHindiMode ? 'hindiQuestion' : 'punjabiQuestion']: e.target.value } as Question)} 
                        className="h-32 rounded-xl bg-slate-50 border-none font-bold text-sm md:text-lg p-5 shadow-inner" 
                     />
                  </div>
               </div>

               <div className="space-y-6 pt-6 border-t border-slate-50">
                  <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em] ml-1">Options Matrix</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                     {['A','B','C','D'].map(opt => (
                        <div key={opt} className="bg-slate-50/50 p-4 md:p-6 rounded-2xl md:rounded-[2.5rem] border border-slate-100 space-y-4">
                           <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                 <div className="h-6 w-6 md:h-7 md:w-7 rounded-full bg-[#0F172A] text-white flex items-center justify-center font-black text-xs">{opt}</div>
                                 <Label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">English Text</Label>
                              </div>
                              <button onClick={() => setEditForm({ ...editForm, correctAnswer: opt } as Question)} className={cn("h-6 w-6 rounded-full border-2 transition-all flex items-center justify-center", (editForm?.correctAnswer ?? "A") === opt ? "bg-emerald-50 border-emerald-500 text-emerald-600" : "border-slate-200 hover:border-primary bg-white")}>
                                 {(editForm?.correctAnswer ?? "A") === opt && <CheckCircle2 className="h-4 w-4" />}
                              </button>
                           </div>
                           <Input value={editForm?.[`option${opt}English` as keyof Question] ?? ""} onChange={e => setEditForm({ ...editForm, [`option${opt}English`]: e.target.value } as Question)} className="bg-white border-none font-bold h-10 md:h-12 rounded-xl" />
                           
                           <div className="pt-2 space-y-1.5">
                              <Label className="text-[8px] font-black text-slate-400 flex items-center gap-2 uppercase tracking-widest"><Globe className="h-2.5 w-2.5" /> {isHindiMode ? 'Hindi Text' : 'Punjabi Text'}</Label>
                              <Input 
                                 value={isHindiMode ? (editForm?.[`option${opt}Hindi` as keyof Question] ?? "") : (editForm?.[`option${opt}Punjabi` as keyof Question] ?? "")} 
                                 onChange={e => setEditForm({ ...editForm, [isHindiMode ? `option${opt}Hindi` : `option${opt}Punjabi`]: e.target.value } as Question)} 
                                 className="bg-white border-none font-bold h-10 md:h-12 rounded-xl" 
                              />
                           </div>
                        </div>
                     ))}
                  </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 pt-6 border-t border-slate-50">
                  <div className="space-y-2 text-left">
                     <Label className="text-[9px] font-black text-slate-500 ml-1 uppercase tracking-widest">English Rationalization</Label>
                     <Textarea value={editForm?.englishExplanation ?? ""} onChange={e => setEditForm({ ...editForm, englishExplanation: e.target.value } as Question)} className="h-32 rounded-2xl bg-slate-900 text-emerald-400 font-medium p-5 shadow-inner" />
                  </div>
                  <div className="space-y-2 text-left">
                     <Label className="text-[9px] font-black text-slate-500 ml-1 uppercase tracking-widest">{isHindiMode ? 'Hindi Rationalization' : 'Punjabi Rationalization'}</Label>
                     <Textarea 
                        value={isHindiMode ? (editForm?.hindiExplanation ?? "") : (editForm?.punjabiExplanation ?? "")} 
                        onChange={e => setEditForm({ ...editForm, [isHindiMode ? 'hindiExplanation' : 'punjabiExplanation']: e.target.value } as Question)} 
                        className="h-32 rounded-2xl bg-slate-900 text-blue-400 font-medium p-5 shadow-inner" 
                     />
                  </div>
               </div>
            </div>
            <DialogFooter className="p-6 md:p-10 pt-4 bg-slate-50 border-t border-slate-100 flex flex-row gap-4 shrink-0">
               <Button variant="ghost" onClick={() => setEditingIndex(null)} className="h-11 md:h-12 px-6 font-bold text-xs text-slate-400">Discard</Button>
               <Button onClick={handleSaveEdit} className="bg-[#0F172A] hover:bg-black text-white h-11 md:h-14 px-10 rounded-full font-bold text-sm flex-1 shadow-xl transition-all active:scale-95 border-none gap-3">
                  <CheckCircle2 className="h-4 w-4 md:h-5 md:w-5" /> Apply Modifications
               </Button>
            </DialogFooter>
         </DialogContent>
      </Dialog>
    </div>
  )
}
