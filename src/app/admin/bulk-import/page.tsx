
"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { 
  ChevronLeft, 
  Loader2, 
  Trash2, 
  Rocket, 
  ArrowRight, 
  FileText,
  Edit,
  Database,
  CheckCircle2,
  Zap,
  Layers,
  Settings,
  X
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

/**
 * @fileOverview Smart Text Ingestion Hub v6.0.
 * FIXED: Explicitly handles bilingual extraction and OCR noise cleaning.
 */

export default function BulkImportPage() {
  const router = useRouter()
  const db = useFirestore()
  const { toast } = useToast()
  
  const { data: boards } = useCollection<Board>(useMemo(() => (db ? collection(db, "boards").withConverter(boardConverter) : null), [db]))
  const { data: subjects } = useCollection<Subject>(useMemo(() => (db ? collection(db, "subjects").withConverter(subjectConverter) : null), [db]))

  const [metadata, setMetadata] = useState({
    boardId: "",
    subjectId: "",
    difficulty: "Medium" as any,
  })

  const [rawText, setRawText] = useState("")
  const [parsedQuestions, setParsedQuestions] = useState<any[]>([])
  const [isSyncing, setIsSyncing] = useState(false)
  
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [editForm, setEditForm] = useState<any>(null)

  const handleSmartIngest = () => {
    if (!rawText.trim()) return
    if (!metadata.boardId || !metadata.subjectId) {
      toast({ variant: "destructive", title: "Target Missing", description: "Please select a Board and Subject node first." })
      return
    }

    const result = parseBulkQuestions(rawText, metadata);
    setParsedQuestions(result.questions);

    if (result.questions.length > 0) {
      toast({ title: "Ingestion Success", description: `${result.questions.length} MCQ nodes mapped correctly.` });
    } else {
      toast({ variant: "destructive", title: "Ingestion Failure", description: "No valid MCQs detected in the provided text." });
    }
  }

  const handleSaveToRegistry = async () => {
    if (!db || parsedQuestions.length === 0) return
    setIsSyncing(true)
    const batch = writeBatch(db)

    try {
      parsedQuestions.forEach(q => {
        const qRef = doc(collection(db, "questions"))
        batch.set(qRef, {
          ...q,
          id: qRef.id,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        })
      })

      await batch.commit()
      toast({ title: "Registry Updated", description: `${parsedQuestions.length} assets committed to bank.` })
      router.push("/admin/questions")
    } catch (e) {
      toast({ variant: "destructive", title: "Sync failed" })
    } finally {
      setIsSyncing(false)
    }
  }

  return (
    <div className="space-y-6 md:space-y-12 pb-32 text-left animate-in fade-in duration-500 pt-2">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 px-1">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
             <button onClick={() => router.back()} className="h-10 w-10 rounded-xl border border-slate-200 bg-white flex items-center justify-center text-slate-500 hover:text-primary transition-all"><ChevronLeft className="h-5 w-5" /></button>
             <h1 className="text-3xl md:text-5xl font-black text-[#0F172A] tracking-tight leading-none uppercase">Smart Ingestion</h1>
          </div>
          <p className="text-slate-500 text-[11px] md:text-lg font-medium leading-tight">Paste raw text to extract and verify bilingual MCQ nodes.</p>
        </div>
        <Button 
          onClick={handleSaveToRegistry} 
          disabled={isSyncing || parsedQuestions.length === 0} 
          className="w-full md:w-auto h-12 md:h-16 px-10 bg-primary hover:bg-blue-700 text-white rounded-full font-black uppercase text-[10px] tracking-widest gap-3 shadow-xl border-none active:scale-95"
        >
          {isSyncing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Rocket className="h-4 w-4" />} Commit to Registry
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12 px-1">
        <div className="lg:col-span-5 space-y-6 md:space-y-10">
           <Card className="border-none shadow-xl rounded-[2rem] md:rounded-[3rem] bg-white p-6 md:p-12 space-y-10 border border-slate-50">
              <div className="space-y-6">
                 <div className="flex items-center gap-3 border-b border-slate-50 pb-4">
                    <Settings className="h-5 w-5 text-primary" />
                    <h3 className="font-black text-lg uppercase text-[#0F172A]">Target Config</h3>
                 </div>
                 
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                       <Label className="text-[10px] font-black uppercase text-slate-400">Authority Board</Label>
                       <Select value={metadata.boardId} onValueChange={v => setMetadata({...metadata, boardId: v})}>
                          <SelectTrigger className="h-12 bg-slate-50 border-none rounded-xl font-bold"><SelectValue placeholder="Select" /></SelectTrigger>
                          <SelectContent className="bg-[#0B1528] text-white">
                             {boards?.map(b => <SelectItem key={b.id} value={b.id}>{b.abbreviation}</SelectItem>)}
                          </SelectContent>
                       </Select>
                    </div>
                    <div className="space-y-2">
                       <Label className="text-[10px] font-black uppercase text-slate-400">Subject hub</Label>
                       <Select value={metadata.subjectId} onValueChange={v => setMetadata({...metadata, subjectId: v})}>
                          <SelectTrigger className="h-12 bg-slate-50 border-none rounded-xl font-bold"><SelectValue placeholder="Select" /></SelectTrigger>
                          <SelectContent className="bg-[#0B1528] text-white">
                             {subjects?.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                          </SelectContent>
                       </Select>
                    </div>
                 </div>
              </div>

              <div className="space-y-4">
                 <Label className="text-[10px] font-black uppercase text-slate-400 flex items-center justify-between">
                    Raw Assessment Text
                    <Badge variant="outline" className="text-[8px] border-slate-100">AI Cleaning Active</Badge>
                 </Label>
                 <Textarea 
                    value={rawText}
                    onChange={e => setRawText(e.target.value)}
                    placeholder="Paste MCQs here... (Supports multiple questions, answers, and explanations)"
                    className="min-h-[400px] rounded-[1.5rem] md:rounded-[2.5rem] bg-slate-50 border-none p-6 md:p-10 font-medium text-sm leading-relaxed shadow-inner resize-none"
                 />
                 <Button onClick={handleSmartIngest} className="w-full h-16 md:h-20 bg-[#0F172A] hover:bg-black text-white font-black uppercase tracking-widest text-[10px] rounded-[1.5rem] md:rounded-[2.5rem] shadow-2xl gap-3">
                    <Zap className="h-5 w-5 text-primary fill-current" /> Initialize Ingestion
                 </Button>
              </div>
           </Card>
        </div>

        <div className="lg:col-span-7 space-y-8">
           <div className="flex items-center justify-between px-2">
              <h3 className="text-xl md:text-3xl font-black text-[#0F172A] uppercase flex items-center gap-3">
                 <Layers className="h-6 w-6 text-primary" /> Staged Hub
              </h3>
              {parsedQuestions.length > 0 && <Badge className="bg-emerald-50 text-emerald-600 border-none font-black text-[10px] px-3">{parsedQuestions.length} Nodes Verified</Badge>}
           </div>

           <div className="space-y-6 md:space-y-10">
              {parsedQuestions.length > 0 ? parsedQuestions.map((q, idx) => (
                 <Card key={idx} className="border-none shadow-xl rounded-[2.5rem] md:rounded-[3.5rem] bg-white overflow-hidden group border border-slate-100 relative">
                    <div className="absolute top-0 right-0 p-6 opacity-20 group-hover:opacity-100 transition-opacity">
                       <button onClick={() => setParsedQuestions(prev => prev.filter((_, i) => i !== idx))} className="h-10 w-10 bg-rose-50 text-rose-500 rounded-xl flex items-center justify-center active:scale-90"><Trash2 className="h-4 w-4" /></button>
                    </div>
                    <CardHeader className="p-8 md:p-12 pb-0">
                       <Badge className="bg-[#0B1228] text-white border-none font-bold text-[8px] uppercase tracking-[0.2em] w-fit">NODE {idx + 1}</Badge>
                    </CardHeader>
                    <CardContent className="p-8 md:p-12 pt-6">
                       <QuestionRenderer 
                          question={q} 
                          language="ENGLISH_PUNJABI" 
                          showSolution={true} 
                          className="p-0 shadow-none border-none"
                       />
                    </CardContent>
                 </Card>
              )) : (
                 <div className="py-40 flex flex-col items-center justify-center text-slate-300 opacity-20 space-y-6 text-center border-2 border-dashed border-slate-100 rounded-[4rem]">
                    <Database className="h-20 w-20" />
                    <p className="font-black text-2xl uppercase tracking-[0.3em]">No valid MCQs detected.</p>
                 </div>
              )}
           </div>
        </div>
      </div>
    </div>
  )
}
