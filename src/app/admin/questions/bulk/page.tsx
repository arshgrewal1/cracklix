"use client"

import { useState, useMemo, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useFirestore, useCollection } from "@/firebase"
import { collection, doc, writeBatch, serverTimestamp } from "firebase/firestore"
import { useToast } from "@/hooks/use-toast"
import { parseBulkQuestions, ImportFormat } from "@/lib/parser"
import { Zap, Database, ChevronLeft, Rocket, ShieldCheck, ClipboardList, Layers, Settings2, Globe, Languages, AlertTriangle, FileWarning, CheckCircle2, LayoutList, DatabaseBackup } from "lucide-react"
import { errorEmitter } from "@/firebase/error-emitter"
import { FirestorePermissionError } from "@/firebase/errors"
import QuestionRenderer from "@/components/questions/QuestionRenderer"

/**
 * @fileOverview Institutional Content Extraction Engine.
 * Supports bulk metadata injection for Board, Exam, Subject, and Topic.
 */

export default function BulkImportPage() {
  const router = useRouter()
  const db = useFirestore()
  const { toast } = useToast()
  
  const { data: boards } = useCollection<any>(useMemo(() => (db ? collection(db, "boards") : null), [db]))
  const { data: exams } = useCollection<any>(useMemo(() => (db ? collection(db, "exams") : null), [db]))
  const { data: subjects } = useCollection<any>(useMemo(() => (db ? collection(db, "subjects") : null), [db]))

  const [rawText, setRawText] = useState("")
  const [importFormat, setImportFormat] = useState<ImportFormat>("BILINGUAL_MCQ")
  const [metadata, setMetadata] = useState({
    boardId: "",
    examId: "",
    subjectId: "",
    topicId: "",
    difficulty: "Medium" as any,
    status: "PUBLISHED" as any
  })
  
  const [parsedQuestions, setParsedQuestions] = useState<any[]>([])
  const [parseErrors, setParseErrors] = useState<string[]>([])
  const [isImporting, setIsImporting] = useState(false)

  const handleParse = () => {
    if (!rawText.trim()) return
    if (!metadata.boardId || !metadata.subjectId) {
      toast({ variant: "destructive", title: "Audit Blocked", description: "Select Board and Subject before parsing." })
      return
    }
    
    // Position-based parser with metadata wrapper
    const results = parseBulkQuestions(rawText, importFormat, { ...metadata })
    
    if (results.errors.length > 0) {
      setParseErrors(results.errors)
      setParsedQuestions([])
      toast({ variant: "destructive", title: "Template Match Failed", description: "Position-based audit failed. Correct markers." })
    } else {
      setParseErrors([])
      setParsedQuestions(results.questions)
      toast({ title: "Extraction Success", description: `${results.questions.length} nodes successfully structured.` })
    }
  }

  const handleCommitToBank = async () => {
    if (!db || parsedQuestions.length === 0) return
    setIsImporting(true)
    const batch = writeBatch(db)

    parsedQuestions.forEach(q => {
      const newRef = doc(collection(db, "questions"))
      batch.set(newRef, {
        ...q,
        id: newRef.id,
        isStandalone: true, // Default to bank asset
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        author: "Management Ingestion Hub"
      })
    })

    try {
      await batch.commit()
      toast({ title: "Bank Updated", description: `${parsedQuestions.length} questions deployed to the global repository.` })
      router.push("/admin/questions")
    } catch (e) {
      errorEmitter.emit('permission-error', new FirestorePermissionError({ path: 'questions/bulk', operation: 'write' }));
    } finally {
      setIsImporting(false)
    }
  }

  return (
    <div className="space-y-10 pb-20 max-w-7xl mx-auto text-[#0F172A]">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-2xl border border-slate-200 bg-white h-14 w-14 shadow-sm">
            <ChevronLeft className="h-8 w-8 text-[#0F172A]" />
          </Button>
          <div className="text-left">
            <h1 className="text-4xl font-black font-headline text-[#0F172A] uppercase tracking-tight">Institutional Ingestion</h1>
            <p className="text-slate-500 font-medium">Bulk Ingest 10-500 Questions with automatic metadata injection.</p>
          </div>
        </div>
        <div className="flex gap-4">
           <Button variant="outline" className="h-16 px-10 rounded-2xl font-black uppercase text-[10px] tracking-widest gap-3 border-slate-200 bg-white shadow-sm" onClick={() => { setRawText(""); setParsedQuestions([]); setParseErrors([]); }}>
              <DatabaseBackup className="h-5 w-5" /> Reset Buffer
           </Button>
           <Button onClick={handleCommitToBank} disabled={isImporting || parsedQuestions.length === 0} className="bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase text-[10px] tracking-widest rounded-2xl h-16 px-12 gap-3 shadow-3xl shadow-emerald-900/20">
              <Rocket className="h-5 w-5" /> {isImporting ? 'Syncing Repo...' : 'Deploy to Bank'}
           </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-5 space-y-8 text-left">
          <Card className="border-none bg-white shadow-3xl rounded-[3rem] overflow-hidden">
            <div className="h-2 w-full bg-primary" />
            <CardHeader className="p-10 pb-4">
              <CardTitle className="font-headline font-black text-2xl uppercase flex items-center gap-4">
                <Settings2 className="h-6 w-6 text-primary" /> Extraction Protocol
              </CardTitle>
            </CardHeader>
            <CardContent className="p-10 pt-4 space-y-8">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                  <p className="text-[10px] font-black uppercase text-slate-500 ml-1">Board Authority</p>
                  <Select value={metadata.boardId} onValueChange={val => setMetadata({...metadata, boardId: val})}>
                    <SelectTrigger className="rounded-xl bg-slate-50 border-none h-14 font-bold text-sm"><SelectValue placeholder="Select Board" /></SelectTrigger>
                    <SelectContent>{boards?.map((b: any) => <SelectItem key={b.id} value={b.id}>{b.abbreviation}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-3">
                   <p className="text-[10px] font-black uppercase text-slate-500 ml-1">Target Exam Hub</p>
                   <Select value={metadata.examId} onValueChange={val => setMetadata({...metadata, examId: val})}>
                     <SelectTrigger className="rounded-xl bg-slate-50 border-none h-14 font-bold text-sm" disabled={!metadata.boardId}><SelectValue placeholder="Select Exam" /></SelectTrigger>
                     <SelectContent>{exams?.filter((e: any) => e.boardId === metadata.boardId).map((e: any) => <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>)}</SelectContent>
                   </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                  <p className="text-[10px] font-black uppercase text-slate-500 ml-1">Core Subject</p>
                  <Select value={metadata.subjectId} onValueChange={val => setMetadata({...metadata, subjectId: val})}>
                    <SelectTrigger className="rounded-xl bg-slate-50 border-none h-14 font-bold text-sm"><SelectValue placeholder="Select Subject" /></SelectTrigger>
                    <SelectContent>{subjects?.map((s: any) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-3">
                  <p className="text-[10px] font-black uppercase text-slate-500 ml-1">Topic / Section</p>
                  <Input placeholder="e.g. Percentage" value={metadata.topicId} onChange={e => setMetadata({...metadata, topicId: e.target.value})} className="h-14 rounded-xl bg-slate-50 border-none font-bold" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                  <p className="text-[10px] font-black uppercase text-primary ml-1 flex items-center gap-2"><LayoutList className="h-3 w-3" /> Template Format</p>
                  <Select value={importFormat} onValueChange={(val: any) => setImportFormat(val)}>
                    <SelectTrigger className="rounded-xl bg-primary/5 border-primary/20 h-14 font-black uppercase text-[10px] tracking-widest"><SelectValue placeholder="Select Format" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="STANDARD_MCQ">Standard MCQ (English)</SelectItem>
                      <SelectItem value="BILINGUAL_MCQ">Bilingual MCQ (Strict EN/PA)</SelectItem>
                      <SelectItem value="DI_SET">Data Interpretation Hub</SelectItem>
                      <SelectItem value="REASONING_DIAGRAM">Logical Reasoning Diagram</SelectItem>
                      <SelectItem value="PASSAGE_BASED">Reading Comprehension</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-3">
                   <p className="text-[10px] font-black uppercase text-slate-500 ml-1">Workflow Status</p>
                   <Select value={metadata.status} onValueChange={v => setMetadata({...metadata, status: v})}>
                     <SelectTrigger className="rounded-xl bg-slate-50 border-none h-14 font-bold text-sm"><SelectValue /></SelectTrigger>
                     <SelectContent>
                       <SelectItem value="DRAFT">Internal Draft</SelectItem>
                       <SelectItem value="REVIEW">Audit Queue</SelectItem>
                       <SelectItem value="PUBLISHED">Go Live Node</SelectItem>
                     </SelectContent>
                   </Select>
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] ml-1">Paste Institutional Content (Batch 10–500)</Label>
                <Textarea 
                  placeholder={`Paste ${importFormat} content here...`}
                  className="min-h-[500px] rounded-[2.5rem] bg-slate-50 border-none p-10 text-sm font-mono leading-relaxed shadow-inner custom-scrollbar"
                  value={rawText}
                  onChange={e => setRawText(e.target.value)}
                />
              </div>
              
              <Button onClick={handleParse} className="w-full h-24 bg-[#0F172A] hover:bg-black text-white font-black uppercase tracking-[0.3em] gap-4 rounded-[2rem] shadow-4xl transition-all">
                <Zap className="h-6 w-6 text-primary fill-current" /> Run Ingestion Engine
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-7 text-left">
          {parseErrors.length > 0 ? (
            <Card className="border-rose-100 bg-rose-50/50 shadow-3xl rounded-[4rem] p-16 space-y-10">
              <div className="flex items-center gap-6 text-rose-600">
                <FileWarning className="h-16 w-16" />
                <div>
                   <h3 className="text-3xl font-headline font-black uppercase">Ingestion Failed</h3>
                   <p className="text-sm font-bold uppercase tracking-widest opacity-70">{parseErrors.length} Schema Violations Detected</p>
                </div>
              </div>
              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-4 custom-scrollbar">
                {parseErrors.map((err, i) => (
                  <div key={i} className="flex items-start gap-5 p-6 bg-white rounded-3xl border border-rose-100 shadow-xl">
                    <AlertTriangle className="h-5 w-5 text-rose-500 shrink-0 mt-1" />
                    <p className="text-base font-bold text-rose-900 leading-tight">{err}</p>
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-rose-400 font-black uppercase tracking-widest text-center">Correct the position-based markers in the paste box and retry.</p>
            </Card>
          ) : parsedQuestions.length > 0 ? (
            <Card className="border-none bg-white shadow-4xl rounded-[4rem] h-full flex flex-col overflow-hidden">
               <CardHeader className="p-16 bg-slate-50/50 border-b border-slate-50 flex flex-col md:flex-row justify-between items-center gap-8">
                 <div>
                    <CardTitle className="font-headline font-black text-3xl uppercase flex items-center gap-4 text-[#0F172A]">
                      <CheckCircle2 className="h-8 w-8 text-emerald-600" /> Extraction Ready
                    </CardTitle>
                    <CardDescription className="text-xs font-black uppercase tracking-[0.3em] text-slate-400 mt-2">{parsedQuestions.length} Institutional Nodes Mapped Successfully.</CardDescription>
                 </div>
                 <div className="flex gap-4">
                    <Button variant="outline" className="rounded-2xl h-14 border-slate-200 bg-white font-black uppercase text-[10px] tracking-widest shadow-sm">Audit JSON</Button>
                 </div>
               </CardHeader>
               <CardContent className="p-16 flex-1 overflow-y-auto custom-scrollbar space-y-16">
                  {parsedQuestions.map((q, idx) => (
                    <div key={idx} className="space-y-10 pb-16 border-b border-slate-100 last:border-0 last:pb-0">
                       <div className="flex justify-between items-start">
                          <div className="flex items-center gap-4">
                             <Badge className="bg-primary/10 text-primary border-none text-[11px] font-black uppercase tracking-widest px-4 py-1 rounded-lg">Audit Node {idx + 1}</Badge>
                             <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">• {metadata.subjectId}</span>
                          </div>
                          <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-lg">Key: {q.correctAnswer}</span>
                       </div>

                       <QuestionRenderer language="en" question={q} />

                       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {['A','B','C','D'].map(l => (
                             <div key={l} className={`p-8 rounded-[2rem] border transition-all ${q.correctAnswer === l ? 'bg-emerald-50 border-emerald-100 ring-2 ring-emerald-500/10' : 'bg-slate-50 border-slate-100 opacity-60'}`}>
                                <div className="flex items-center gap-4 mb-4">
                                   <div className={`h-8 w-8 rounded-xl flex items-center justify-center text-[11px] font-black ${q.correctAnswer === l ? 'bg-emerald-500 text-white shadow-lg' : 'bg-white text-slate-400 shadow-sm border border-slate-100'}`}>{l}</div>
                                   <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Option Node</span>
                                </div>
                                <p className="text-base font-bold text-[#0F172A] mb-2">{q[`option${l}En`]}</p>
                                {q[`option${l}Pa`] && <p className="text-sm font-medium text-slate-500 italic border-t border-slate-200/50 pt-2 mt-2">{q[`option${l}Pa`]}</p>}
                             </div>
                          ))}
                       </div>

                       <div className="bg-[#0F172A] p-10 rounded-[3rem] space-y-8 relative overflow-hidden">
                          <div className="absolute top-0 right-0 p-8 opacity-5"><Languages className="h-32 w-32" /></div>
                          <div className="flex items-center gap-4 relative z-10">
                             <div className="h-10 w-10 rounded-2xl bg-primary/20 flex items-center justify-center">
                                <Languages className="h-5 w-5 text-primary" />
                             </div>
                             <p className="text-[11px] font-black uppercase text-primary tracking-[0.2em]">Institutional Rationale</p>
                          </div>
                          <div className="space-y-6 relative z-10">
                             <div className="space-y-2">
                                <p className="text-[9px] font-black uppercase text-slate-500 tracking-widest">English Rationale</p>
                                <p className="text-base font-medium text-slate-300 leading-relaxed antialiased">{q.explanationEn}</p>
                             </div>
                             {q.explanationPa && (
                                <div className="space-y-2 border-t border-white/5 pt-6">
                                   <p className="text-[9px] font-black uppercase text-slate-500 tracking-widest">ਪੰਜਾਬੀ ਵਿਆਖਿਆ</p>
                                   <p className="text-base font-medium text-slate-400 leading-relaxed italic">{q.explanationPa}</p>
                                </div>
                             )}
                          </div>
                       </div>
                    </div>
                  ))}
               </CardContent>
            </Card>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-300 opacity-20 py-60">
              <ClipboardList className="h-32 w-32 mb-8" />
              <p className="font-headline font-black uppercase tracking-[0.4em] text-xl">Awaiting extraction input</p>
              <p className="text-sm font-bold uppercase tracking-widest mt-4">Paste official content in the extraction box to begin audit.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
