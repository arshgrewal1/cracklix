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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { 
  Upload, 
  Database, 
  ChevronLeft, 
  CheckCircle2, 
  AlertCircle, 
  Settings2, 
  Loader2, 
  Trash2, 
  Rocket,
  Zap,
  Copy,
  Layers,
  Save,
  FileCode,
  DatabaseBackup
} from "lucide-react"
import { useFirestore, useCollection } from "@/firebase"
import { collection, doc, writeBatch, serverTimestamp } from "firebase/firestore"
import { useToast } from "@/hooks/use-toast"
import { parseBulkQuestions } from "@/lib/parser"
import { Difficulty, MockType, Question, ContentStatus } from "@/types"

/**
 * @fileOverview Institutional Bank Ingestion Node.
 * Imports structured questions into the global reusable bank.
 */

export default function BulkImportPage() {
  const router = useRouter()
  const db = useFirestore()
  const { toast } = useToast()
  
  const { data: boards } = useCollection<any>(useMemo(() => (db ? collection(db, "boards") : null), [db]))
  const { data: subjects } = useCollection<any>(useMemo(() => (db ? collection(db, "subjects") : null), [db]))

  // 1. Config State
  const [metadata, setMetadata] = useState({
    boardId: "",
    examId: "",
    subjectId: "",
    chapterId: "",
    difficulty: "Medium" as Difficulty,
    status: "PUBLISHED" as ContentStatus,
  })

  // 2. Buffer State
  const [rawText, setRawText] = useState("")
  const [parsedQuestions, setParsedQuestions] = useState<Partial<Question>[]>([])
  const [parseErrors, setParseErrors] = useState<string[]>([])
  const [confidence, setConfidence] = useState(0)
  
  const [isSyncing, setIsSyncing] = useState(false)

  const handleAnalyze = () => {
    if (!rawText.trim()) return
    if (!metadata.boardId || !metadata.subjectId) {
      toast({ variant: "destructive", title: "Config Required", description: "Select Board and Subject before analysis." })
      return
    }

    const { questions, errors, confidence: conf } = parseBulkQuestions(rawText, metadata)
    setParsedQuestions(questions)
    setParseErrors(errors)
    setConfidence(conf)

    if (errors.length > 0) {
      toast({ variant: "destructive", title: "Format Mismatch", description: `Found ${errors.length} errors in text structure.` })
    } else {
      toast({ title: "Audit Complete", description: `${questions.length} reusable nodes structured with ${conf}% confidence.` })
    }
  }

  const handleSaveToBank = async () => {
    if (!db || parsedQuestions.length === 0) return
    setIsSyncing(true)

    const batch = writeBatch(db)

    parsedQuestions.forEach(q => {
      const qRef = doc(collection(db, "questions"))
      batch.set(qRef, {
        ...q,
        id: qRef.id,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        isStandalone: true,
        status: metadata.status
      })
    })

    try {
      await batch.commit()
      toast({ title: "Bank Sync Success", description: `${parsedQuestions.length} nodes successfully added to global registry.` })
      router.push("/admin/questions")
    } catch (e) {
      toast({ variant: "destructive", title: "Sync Failed", description: "Database rejected the transaction." })
    } finally {
      setIsSyncing(false)
    }
  }

  return (
    <div className="space-y-10 pb-24 text-left max-w-[1600px] mx-auto">
      <div className="flex items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-2xl border bg-white h-12 w-12 shadow-sm">
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <div>
            <h1 className="text-4xl font-black font-headline text-[#0F172A] uppercase tracking-tight">Atomic Bank Ingestion</h1>
            <p className="text-slate-500 font-medium text-left">Group content by subject/chapter for maximum reuse across mocks.</p>
          </div>
        </div>
        <div className="flex gap-4">
           <Button variant="outline" onClick={() => { setRawText(""); setParsedQuestions([]); }} className="h-16 px-8 rounded-2xl font-black uppercase text-[10px] tracking-widest gap-3 shadow-sm bg-white">
              <DatabaseBackup className="h-5 w-5" /> Reset Buffer
           </Button>
           <Button onClick={handleSaveToBank} disabled={isSyncing || parsedQuestions.length === 0} className="bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase text-[10px] tracking-widest rounded-2xl h-16 px-12 gap-3 shadow-3xl shadow-emerald-900/20">
              {isSyncing ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />} Commit to Question Bank
           </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 px-4">
        <div className="lg:col-span-4 space-y-8">
          <Card className="border-none bg-white shadow-3xl rounded-[3rem] overflow-hidden">
            <div className="h-2 w-full bg-primary" />
            <CardHeader className="p-10 pb-4">
              <CardTitle className="font-headline font-black text-2xl uppercase flex items-center gap-4 text-left">
                <Settings2 className="h-6 w-6 text-primary" /> Target Metadata
              </CardTitle>
            </CardHeader>
            <CardContent className="p-10 pt-4 space-y-8">
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Recruitment Board</Label>
                  <Select value={metadata.boardId} onValueChange={v => setMetadata({...metadata, boardId: v})}>
                    <SelectTrigger className="rounded-xl h-12 bg-slate-50 border-none font-bold text-[#0F172A]"><SelectValue placeholder="Select Board" /></SelectTrigger>
                    <SelectContent>{boards?.map((b: any) => <SelectItem key={b.id} value={b.id}>{b.abbreviation}</SelectItem>)}</SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                   <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Focus Subject</Label>
                   <Select value={metadata.subjectId} onValueChange={v => setMetadata({...metadata, subjectId: v})}>
                      <SelectTrigger className="rounded-xl h-12 bg-slate-50 border-none font-bold text-[#0F172A]"><SelectValue placeholder="Select Subject" /></SelectTrigger>
                      <SelectContent>{subjects?.map((s:any) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
                   </Select>
                </div>

                <div className="space-y-2">
                   <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Topic / Chapter</Label>
                   <Input value={metadata.chapterId} onChange={e => setMetadata({...metadata, chapterId: e.target.value})} placeholder="e.g. Percentage" className="h-12 bg-slate-50 border-none rounded-xl font-bold" />
                </div>

                <div className="space-y-2">
                   <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Difficulty Baseline</Label>
                   <Select value={metadata.difficulty} onValueChange={(v: Difficulty) => setMetadata({...metadata, difficulty: v})}>
                      <SelectTrigger className="rounded-xl h-12 bg-slate-50 border-none font-bold text-[#0F172A]"><SelectValue /></SelectTrigger>
                      <SelectContent>
                         <SelectItem value="Easy">Easy</SelectItem>
                         <SelectItem value="Medium">Medium</SelectItem>
                         <SelectItem value="Hard">Hard</SelectItem>
                      </SelectContent>
                   </Select>
                </div>
              </div>

              <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                 <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2"><FileCode className="h-3 w-3" /> ULTIMATE FORMAT TAGS</p>
                 <ul className="text-[9px] font-bold text-slate-600 space-y-2">
                    <li>• QUESTION_TYPE: MCQ | MATCHING | DI_SET | PASSAGE</li>
                    <li>• QUESTION_EN / QUESTION_PA</li>
                    <li>• OPTION_A_EN / OPTION_A_PA (up to D)</li>
                    <li>• DI_SET_ID / PASSAGE_ID (for linkage)</li>
                    <li>• TABLE_DATA: Header | Header (Use | )</li>
                 </ul>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-8 space-y-8">
           <div className="space-y-3">
              <Label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] ml-1">Ingestion Buffer (Atomic Mode)</Label>
              <Textarea 
                value={rawText}
                onChange={e => setRawText(e.target.value)}
                placeholder="Paste Subject/Chapter specific content using ULTIMATE tags..."
                className="min-h-[500px] rounded-[3.5rem] bg-white border-none p-12 text-sm font-mono shadow-4xl custom-scrollbar text-[#0F172A]"
              />
              <Button onClick={handleAnalyze} className="w-full h-20 bg-primary hover:bg-orange-600 text-white font-black uppercase tracking-[0.3em] rounded-[2.5rem] shadow-4xl mt-6 gap-4">
                 <Zap className="h-6 w-6 fill-current" /> Structure & Audit Nodes
              </Button>
           </div>

           {parsedQuestions.length > 0 && (
             <Card className="border-none shadow-4xl rounded-[4rem] bg-white overflow-hidden text-left">
                <CardHeader className="p-16 border-b border-slate-50 bg-slate-50/30 flex flex-row justify-between items-center">
                   <div className="space-y-2 text-left">
                      <CardTitle className="font-headline font-black text-3xl uppercase">Bank Preview ({parsedQuestions.length})</CardTitle>
                      <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest text-left">Confidence: {confidence}% • Tag: {metadata.subjectId} / {metadata.chapterId}</p>
                   </div>
                   <Badge className="bg-emerald-100 text-emerald-600 border-none font-black px-6 py-2 rounded-xl text-xs uppercase tracking-widest">READY FOR BANK</Badge>
                </CardHeader>
                <CardContent className="p-0">
                   <Table>
                      <TableHeader className="bg-slate-50">
                         <TableRow className="h-20 border-slate-50">
                            <TableHead className="px-12 text-[10px] font-black uppercase text-left">Node</TableHead>
                            <TableHead className="text-[10px] font-black uppercase text-left">Type & Statement</TableHead>
                            <TableHead className="text-center text-[10px] font-black uppercase">Logic</TableHead>
                            <TableHead className="text-right px-12 text-[10px] font-black uppercase">Control</TableHead>
                         </TableRow>
                      </TableHeader>
                      <TableBody>
                         {parsedQuestions.map((q, idx) => (
                           <TableRow key={idx} className="group hover:bg-slate-50/50 border-slate-50 transition-colors">
                              <TableCell className="px-12 py-10 font-black text-slate-300 text-left">#{idx + 1}</TableCell>
                              <TableCell className="py-10 max-w-lg text-left">
                                 <div className="space-y-3">
                                    <Badge className="bg-slate-100 text-slate-500 border-none text-[8px] font-black uppercase px-2">{q.questionType}</Badge>
                                    <p className="font-bold text-[#0F172A] line-clamp-1">{q.questionEn}</p>
                                 </div>
                              </TableCell>
                              <TableCell className="text-center">
                                 <div className="h-8 w-8 rounded-lg bg-emerald-50 text-emerald-600 font-black text-xs flex items-center justify-center mx-auto">{q.correctAnswer}</div>
                              </TableCell>
                              <TableCell className="text-right px-12">
                                 <div className="flex justify-end gap-3 opacity-20 group-hover:opacity-100 transition-opacity">
                                    <Button variant="ghost" size="icon" className="h-12 w-12 rounded-xl" onClick={() => {
                                       const dup = [...parsedQuestions];
                                       dup.splice(idx, 0, {...q});
                                       setParsedQuestions(dup);
                                    }}><Copy className="h-5 w-5" /></Button>
                                    <Button variant="ghost" size="icon" className="h-12 w-12 rounded-xl text-rose-500" onClick={() => setParsedQuestions(parsedQuestions.filter((_, i) => i !== idx))}><Trash2 className="h-5 w-5" /></Button>
                                 </div>
                              </TableCell>
                           </TableRow>
                         ))}
                      </TableBody>
                   </Table>
                </CardContent>
             </Card>
           )}

           {parseErrors.length > 0 && (
             <Card className="border-rose-100 bg-rose-50/50 p-16 rounded-[4rem] shadow-4xl text-left">
                <div className="flex items-center gap-6 text-rose-600 mb-10 text-left">
                   <AlertCircle className="h-12 w-12" />
                   <h4 className="font-headline font-black text-3xl uppercase tracking-tight">Extraction Failures</h4>
                </div>
                <div className="space-y-4">
                   {parseErrors.map((err, i) => (
                      <div key={i} className="p-6 bg-white rounded-3xl border border-rose-100 shadow-xl flex items-start gap-4 text-left">
                         <div className="h-6 w-6 rounded-full bg-rose-500 text-white flex items-center justify-center text-[10px] font-black shrink-0 mt-1">!</div>
                         <p className="text-base font-bold text-rose-900 leading-tight">{err}</p>
                      </div>
                   ))}
                </div>
             </Card>
           )}
        </div>
      </div>
    </div>
  )
}
