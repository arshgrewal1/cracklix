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
import { Zap, Database, ChevronLeft, Rocket, ShieldCheck, ClipboardList, Layers, Settings2, Globe, Languages, AlertTriangle, FileWarning, CheckCircle2, LayoutList } from "lucide-react"
import { errorEmitter } from "@/firebase/error-emitter"
import { FirestorePermissionError } from "@/firebase/errors"
import QuestionRenderer from "@/components/questions/QuestionRenderer"

/**
 * @fileOverview Final Strict Template Extraction Node.
 * Replaced AI guessing with strict position-based validation and Format Selection.
 */

export default function BulkImportPage() {
  const router = useRouter()
  const db = useFirestore()
  const { toast } = useToast()
  
  const { data: boards } = useCollection<any>(useMemo(() => (db ? collection(db, "boards") : null), [db]))
  const { data: exams } = useCollection<any>(useMemo(() => (db ? collection(db, "exams") : null), [db]))
  const { data: patterns } = useCollection<any>(useMemo(() => (db ? collection(db, "exam_patterns") : null), [db]))
  const { data: subjects } = useCollection<any>(useMemo(() => (db ? collection(db, "subjects") : null), [db]))

  const [rawText, setRawText] = useState("")
  const [importFormat, setImportFormat] = useState<ImportFormat>("BILINGUAL_MCQ")
  const [metadata, setMetadata] = useState({
    boardId: "",
    examId: "",
    mockType: "FULL" as any,
    subjectId: "",
    difficulty: "medium" as any,
    duration: 120
  })
  
  const [parsedQuestions, setParsedQuestions] = useState<any[]>([])
  const [parseErrors, setParseErrors] = useState<string[]>([])
  const [isImporting, setIsImporting] = useState(false)

  const activePattern = useMemo(() => {
    if (!patterns || !metadata.examId) return null
    return patterns.find((p: any) => p.examId === metadata.examId)
  }, [metadata.examId, patterns])

  const availableSubjects = useMemo(() => {
    if (activePattern && subjects) {
      return activePattern.sections.map((sec: any, idx: number) => {
        const baseSubject = subjects.find((s: any) => s.id === sec.subjectId);
        return {
          id: sec.subjectId,
          name: `Section ${idx + 1}: ${baseSubject?.name || sec.name} (${sec.count} Qs)`
        };
      });
    }
    return subjects || []
  }, [activePattern, subjects])

  const handleParse = () => {
    if (!rawText.trim()) return
    if (!metadata.boardId) {
      toast({ variant: "destructive", title: "Audit Error", description: "Select Board Authority first." })
      return
    }
    
    const results = parseBulkQuestions(rawText, importFormat, { ...metadata })
    
    if (results.errors.length > 0) {
      setParseErrors(results.errors)
      setParsedQuestions([])
      toast({ variant: "destructive", title: "Template Mismatch", description: "Validation failed. Correct the errors below." })
    } else {
      setParseErrors([])
      setParsedQuestions(results.questions)
      toast({ title: "Extraction Success", description: `${results.questions.length} nodes structured using strict ${importFormat} template.` })
    }
  }

  const handleDirectDeployMock = async () => {
    if (!db || parsedQuestions.length === 0) return
    if (!metadata.examId) {
      toast({ variant: "destructive", title: "Deployment Blocked", description: "Select target Exam Hub first." })
      return
    }

    setIsImporting(true)
    const batch = writeBatch(db)
    const questionIds: string[] = []

    parsedQuestions.forEach(q => {
      const newRef = doc(collection(db, "questions"))
      questionIds.push(newRef.id)
      batch.set(newRef, {
        ...q,
        id: newRef.id,
        isStandalone: false,
        createdAt: serverTimestamp(),
        author: "Institutional Bulk Engine"
      })
    })

    const mockId = `mock-${Date.now()}`
    const mockRef = doc(db, "mocks", mockId)
    
    const mockPayload = {
      id: mockId,
      title: `${metadata.boardId} ${metadata.mockType} Series ${new Date().toLocaleDateString()}`,
      boardId: metadata.boardId,
      examId: metadata.examId,
      mockType: metadata.mockType,
      duration: metadata.duration || 120,
      totalQuestions: parsedQuestions.length,
      questionIds: questionIds,
      published: true,
      status: "PUBLISHED",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      author: "Automatic Pattern Publisher"
    }

    batch.set(mockRef, mockPayload)

    try {
      await batch.commit()
      toast({ title: "Series Deployed", description: `"${mockPayload.title}" is now live.` })
      router.push("/admin/mocks")
    } catch (e) {
      errorEmitter.emit('permission-error', new FirestorePermissionError({ path: mockRef.path, operation: 'write' }));
    } finally {
      setIsImporting(false)
    }
  }

  return (
    <div className="space-y-10 pb-20 max-w-7xl mx-auto text-[#0F172A]">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-2xl border border-slate-200 bg-white h-12 w-12 shadow-sm">
            <ChevronLeft className="h-6 w-6 text-[#0F172A]" />
          </Button>
          <div className="text-left">
            <h1 className="text-4xl font-black font-headline text-[#0F172A] uppercase tracking-tight">Institutional Importer</h1>
            <p className="text-slate-500 font-medium italic">Strict Position-Based Parsing Engine v3.0</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left: Input & Config */}
        <div className="lg:col-span-5 space-y-8 text-left">
          <Card className="border-slate-100 bg-white shadow-2xl rounded-[3rem] overflow-hidden">
            <div className="h-2 w-full bg-primary" />
            <CardHeader className="p-10 pb-4">
              <CardTitle className="font-headline font-black text-2xl uppercase flex items-center gap-3">
                <Settings2 className="h-6 w-6 text-primary" /> Import Protocol
              </CardTitle>
            </CardHeader>
            <CardContent className="p-10 pt-4 space-y-8">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                  <p className="text-[10px] font-black uppercase text-slate-500 ml-1">Board Authority</p>
                  <Select value={metadata.boardId} onValueChange={val => setMetadata({...metadata, boardId: val})}>
                    <SelectTrigger className="rounded-xl bg-slate-50 border-slate-100 h-12 font-bold"><SelectValue placeholder="Select Board" /></SelectTrigger>
                    <SelectContent>{boards?.map((b: any) => <SelectItem key={b.id} value={b.id}>{b.abbreviation}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-3">
                   <p className="text-[10px] font-black uppercase text-slate-500 ml-1">Target Exam Hub</p>
                   <Select value={metadata.examId} onValueChange={val => setMetadata({...metadata, examId: val})}>
                     <SelectTrigger className="rounded-xl bg-slate-50 border-slate-100 h-12 font-bold" disabled={!metadata.boardId}><SelectValue placeholder="Select Exam" /></SelectTrigger>
                     <SelectContent>{exams?.filter((e: any) => e.boardId === metadata.boardId).map((e: any) => <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>)}</SelectContent>
                   </Select>
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-[10px] font-black uppercase text-slate-500 ml-1">Default Section/Subject</p>
                <Select value={metadata.subjectId} onValueChange={val => setMetadata({...metadata, subjectId: val})}>
                  <SelectTrigger className="rounded-xl bg-slate-50 border-slate-100 h-12 font-bold"><SelectValue placeholder="Select Section" /></SelectTrigger>
                  <SelectContent>
                    {availableSubjects.map((s: any) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <p className="text-[10px] font-black uppercase text-primary ml-1 flex items-center gap-2">
                  <LayoutList className="h-3 w-3" /> Import Template Format
                </p>
                <Select value={importFormat} onValueChange={(val: any) => setImportFormat(val)}>
                  <SelectTrigger className="rounded-xl bg-primary/5 border-primary/20 h-14 font-black uppercase text-[10px] tracking-widest">
                    <SelectValue placeholder="Select Format" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="STANDARD_MCQ">Standard MCQ (English Only)</SelectItem>
                    <SelectItem value="BILINGUAL_MCQ">Bilingual MCQ (Line 1: EN, Line 2: PA)</SelectItem>
                    <SelectItem value="DI_SET">DI Set (Table / Chart Data)</SelectItem>
                    <SelectItem value="REASONING_DIAGRAM">Reasoning Diagram</SelectItem>
                    <SelectItem value="PASSAGE_BASED">Passage Based (Shared Context)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Textarea 
                placeholder={`Paste content for ${importFormat}...`}
                className="min-h-[500px] rounded-[2rem] bg-slate-50 border-slate-100 p-8 text-sm font-mono leading-relaxed shadow-inner"
                value={rawText}
                onChange={e => setRawText(e.target.value)}
              />
              
              <Button onClick={handleParse} className="w-full h-20 bg-[#0F172A] hover:bg-black text-white font-black uppercase tracking-[0.2em] gap-3 rounded-2xl shadow-xl transition-all">
                <Zap className="h-5 w-5 text-primary" /> Run Strict Audit
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Right: Validation & High-Fidelity Preview */}
        <div className="lg:col-span-7 text-left">
          {parseErrors.length > 0 ? (
            <Card className="border-rose-100 bg-rose-50/50 shadow-2xl rounded-[3rem] p-10 space-y-6">
              <div className="flex items-center gap-4 text-rose-600">
                <FileWarning className="h-10 w-10" />
                <div>
                   <h3 className="text-xl font-headline font-black uppercase">Validation Failed</h3>
                   <p className="text-sm font-bold uppercase tracking-widest opacity-70">{parseErrors.length} Schema Violations Detected</p>
                </div>
              </div>
              <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                {parseErrors.map((err, i) => (
                  <div key={i} className="flex items-start gap-4 p-5 bg-white rounded-2xl border border-rose-100 shadow-sm">
                    <AlertTriangle className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" />
                    <p className="text-sm font-bold text-rose-800">{err}</p>
                  </div>
                ))}
              </div>
            </Card>
          ) : parsedQuestions.length > 0 ? (
            <Card className="border-slate-100 bg-white shadow-2xl rounded-[3rem] h-full flex flex-col overflow-hidden">
               <CardHeader className="p-10 bg-slate-50/50 border-b border-slate-50 flex flex-col md:flex-row justify-between items-center">
                 <div>
                    <CardTitle className="font-headline font-black text-2xl uppercase flex items-center gap-3">
                      <CheckCircle2 className="h-6 w-6 text-emerald-600" /> Extraction Ready
                    </CardTitle>
                    <CardDescription className="text-[10px] font-black uppercase tracking-widest text-slate-400">{parsedQuestions.length} Questions Verified for Deployment.</CardDescription>
                 </div>
                 <Button onClick={handleDirectDeployMock} disabled={isImporting} className="bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase text-[10px] tracking-widest rounded-xl h-12 px-8 gap-3 shadow-xl shadow-emerald-500/20">
                    <Rocket className="h-4 w-4" /> Deploy Live Series
                 </Button>
               </CardHeader>
               <CardContent className="p-10 flex-1 overflow-y-auto custom-scrollbar space-y-12">
                  {parsedQuestions.map((q, idx) => (
                    <div key={idx} className="space-y-8 pb-12 border-b border-slate-50 last:border-0 last:pb-0">
                       <div className="flex justify-between items-start">
                          <Badge className="bg-primary/10 text-primary border-none text-[10px] font-black uppercase tracking-widest px-3">Question {idx + 1}</Badge>
                          <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Key: {q.correctAnswer}</span>
                       </div>

                       <QuestionRenderer language="en" question={q} />

                       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {['A','B','C','D'].map(l => (
                             <div key={l} className={`p-6 rounded-2xl border transition-all ${q.correctAnswer === l ? 'bg-emerald-50 border-emerald-100 ring-2 ring-emerald-500/10' : 'bg-slate-50 border-slate-100 opacity-60'}`}>
                                <div className="flex items-center gap-4 mb-3">
                                   <div className={`h-6 w-6 rounded-lg flex items-center justify-center text-[10px] font-black ${q.correctAnswer === l ? 'bg-emerald-500 text-white' : 'bg-white text-slate-400 shadow-sm'}`}>{l}</div>
                                   <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Option Node</span>
                                </div>
                                <p className="text-sm font-bold text-[#0F172A] mb-1">{q[`option${l}En`]}</p>
                                <p className="text-sm font-medium text-slate-500 italic">{q[`option${l}Pa`]}</p>
                             </div>
                          ))}
                       </div>

                       <div className="bg-[#0F172A] p-8 rounded-[2rem] space-y-6">
                          <div className="flex items-center gap-4">
                             <div className="h-8 w-8 rounded-xl bg-primary/20 flex items-center justify-center">
                                <Languages className="h-4 w-4 text-primary" />
                             </div>
                             <p className="text-[10px] font-black uppercase text-primary tracking-widest">Institutional Rationale</p>
                          </div>
                          <div className="space-y-4">
                             <p className="text-sm font-medium text-slate-300 leading-relaxed"><span className="text-white font-black">EN:</span> {q.explanationEn}</p>
                             {q.explanationPa && <p className="text-sm font-medium text-slate-400 leading-relaxed italic border-t border-white/5 pt-4"><span className="text-white font-black">PA:</span> {q.explanationPa}</p>}
                          </div>
                       </div>
                    </div>
                  ))}
               </CardContent>
            </Card>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-300 opacity-20 py-40">
              <ClipboardList className="h-20 w-20 mb-6" />
              <p className="font-black uppercase tracking-[0.3em] text-sm">Awaiting Input Protocol</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
