
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
  Database, 
  ChevronLeft, 
  Loader2, 
  Trash2, 
  Rocket, 
  Languages,
  CheckCircle2,
  ClipboardList,
  ArrowRight,
  FileText
} from "lucide-react"
import { useFirestore, useCollection } from "@/firebase"
import { collection, doc, writeBatch, serverTimestamp } from "firebase/firestore"
import { useToast } from "@/hooks/use-toast"
import { parseBulkQuestions } from "@/lib/parser"
import { Difficulty, Question, ContentStatus } from "@/types"
import QuestionRenderer from "@/components/questions/QuestionRenderer"

/**
 * @fileOverview Exam Content Ingestion Hub v10.0.
 * Focus: High-fidelity reading layout matching official solution pages.
 * Purged: AI jargon, validation reports, and secondary panels.
 */
export default function BulkImportPage() {
  const router = useRouter()
  const db = useFirestore()
  const { toast } = useToast()
  
  const { data: boards } = useCollection<any>(useMemo(() => (db ? collection(db, "boards") : null), [db]))
  const { data: subjects } = useCollection<any>(useMemo(() => (db ? collection(db, "subjects") : null), [db]))

  const [metadata, setMetadata] = useState({
    boardId: "",
    subjectId: "",
    difficulty: "Medium" as Difficulty,
    status: "PUBLISHED" as ContentStatus,
  })

  const [rawText, setRawText] = useState("")
  const [parsedQuestions, setParsedQuestions] = useState<Partial<Question>[]>([])
  const [isSyncing, setIsSyncing] = useState(false)

  const handleImport = () => {
    if (!rawText.trim()) return
    if (!metadata.boardId || !metadata.subjectId) {
      toast({ 
        variant: "destructive", 
        title: "Registry Required", 
        description: "Select Board and Subject to continue." 
      })
      return
    }

    const result = parseBulkQuestions(rawText, metadata);
    setParsedQuestions(result.questions);

    if (result.questions.length > 0) {
      toast({ title: "Preview Generated", description: `${result.questions.length} questions mapped.` });
    } else {
      toast({ variant: "destructive", title: "Parsing Failed", description: "Ensure questions follow the Q1 format." });
    }
  }

  const handleSave = async () => {
    if (!db || parsedQuestions.length === 0) return
    setIsSyncing(true)
    const batch = writeBatch(db)

    parsedQuestions.forEach(q => {
      const qRef = doc(collection(db, "questions"))
      const payload: any = {
        ...q,
        id: qRef.id,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      batch.set(qRef, payload)
    })

    try {
      await batch.commit()
      toast({ title: "Registry Updated", description: "Content successfully committed to live bank." })
      router.push("/admin/questions")
    } catch (e: any) {
      toast({ variant: "destructive", title: "Commit Rejected" })
    } finally {
      setIsSyncing(false)
    }
  }

  return (
    <div className="space-y-12 pb-32 text-left max-w-7xl mx-auto font-body pt-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 px-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-xl border border-slate-200 h-12 w-12 bg-white shadow-sm"><ChevronLeft className="h-6 w-6" /></Button>
          <div>
            <h1 className="text-4xl font-black font-headline text-[#0F172A] uppercase tracking-tight">Exam Content Paste</h1>
            <p className="text-slate-500 mt-1 font-medium">Bulk ingestion Hub for official series.</p>
          </div>
        </div>
        <div className="flex gap-4">
           <Button onClick={handleSave} disabled={isSyncing || parsedQuestions.length === 0} className="bg-[#0F172A] hover:bg-black text-white font-black uppercase text-[11px] tracking-widest rounded-xl h-14 px-12 gap-3 shadow-2xl transition-all">
              {isSyncing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Rocket className="h-4 w-4 text-primary fill-current" />} Save {parsedQuestions.length} Questions
           </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 px-4">
        <div className="lg:col-span-5 space-y-8">
          <Card className="border-none bg-white shadow-3xl rounded-[2.5rem] overflow-hidden">
            <div className="h-1.5 w-full bg-[#0F172A]" />
            <CardHeader className="p-8 pb-4">
              <CardTitle className="font-headline font-black text-xl uppercase flex items-center gap-3"><ClipboardList className="h-5 w-5 text-primary" /> Authority Context</CardTitle>
            </CardHeader>
            <CardContent className="p-8 pt-4 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Board Registry</Label>
                  <Select value={metadata.boardId} onValueChange={v => setMetadata({...metadata, boardId: v})}>
                    <SelectTrigger className="rounded-xl h-11 bg-slate-50 border-none font-bold shadow-inner"><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>{boards?.map((b: any) => <SelectItem key={b.id} value={b.id}>{b.abbreviation}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                   <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Subject Hub</Label>
                   <Select value={metadata.subjectId} onValueChange={v => setMetadata({...metadata, subjectId: v})}>
                      <SelectTrigger className="rounded-xl h-11 bg-slate-50 border-none font-bold shadow-inner"><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>{subjects?.map((s:any) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
                   </Select>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="space-y-4">
            <Textarea 
              value={rawText}
              onChange={e => setRawText(e.target.value)}
              placeholder="Paste raw pattern here..."
              className="min-h-[500px] rounded-[2.5rem] bg-white border-none p-10 text-sm font-bold shadow-4xl custom-scrollbar leading-relaxed"
            />
            <Button onClick={handleImport} disabled={!rawText.trim()} className="w-full h-20 bg-primary hover:bg-orange-600 text-white font-black uppercase tracking-[0.3em] text-[11px] rounded-[2rem] shadow-4xl gap-4 transition-all active:scale-95">
               Generate Preview <ArrowRight className="h-6 w-6" />
            </Button>
          </div>
        </div>

        <div className="lg:col-span-7 space-y-10">
           {parsedQuestions.length > 0 ? (
             <div className="space-y-8">
                <div className="flex items-center gap-4 px-4">
                   <div className="h-10 w-10 bg-emerald-500 rounded-xl flex items-center justify-center text-white shadow-lg"><CheckCircle2 className="h-6 w-6" /></div>
                   <h2 className="text-3xl font-headline font-black uppercase text-[#0F172A]">Preview: {parsedQuestions.length} Questions</h2>
                </div>
                <div className="space-y-12">
                   {parsedQuestions.map((q, idx) => (
                      <Card key={idx} className="border-none shadow-3xl rounded-[3rem] bg-white p-12 text-left group relative overflow-hidden">
                         <div className="flex justify-between items-center mb-10 border-b border-slate-50 pb-6">
                            <Badge className="bg-[#0F172A] text-white border-none text-[10px] font-black px-6 py-2 rounded-xl uppercase tracking-widest">Entry Hub: {idx + 1}</Badge>
                            <Button variant="ghost" size="icon" className="h-12 w-12 rounded-xl text-rose-500 bg-rose-50 hover:bg-rose-100 shadow-sm" onClick={() => setParsedQuestions(parsedQuestions.filter((_, i) => i !== idx))}><Trash2 className="h-5 w-5" /></Button>
                         </div>
                         <QuestionRenderer question={q} language="bilingual" showSolution={true} />
                      </Card>
                   ))}
                </div>
             </div>
           ) : (
             <div className="h-full min-h-[600px] flex flex-col items-center justify-center text-slate-300 opacity-20 text-center">
                <FileText className="h-32 w-32 mb-8" />
                <p className="font-headline font-black uppercase text-2xl tracking-[0.4em]">Content Hub Empty</p>
                <p className="text-lg font-bold mt-4 max-w-sm mx-auto">Paste your raw MCQ text on the left to generate the high-fidelity preview.</p>
             </div>
           )}
        </div>
      </div>
    </div>
  )
}
