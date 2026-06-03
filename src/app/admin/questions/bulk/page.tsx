"use client"

import { useState, useMemo } from "react"
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
import { parseBulkQuestions } from "@/lib/parser"
import { Zap, Database, ChevronLeft, Clock, Rocket, ShieldCheck, ClipboardList, Layers } from "lucide-react"
import { errorEmitter } from "@/firebase/error-emitter"
import { FirestorePermissionError } from "@/firebase/errors"

/**
 * @fileOverview Final Mock Extraction Node.
 * Features: Direct Mock Deployment with Manual Duration Overrides.
 */

export default function BulkImportPage() {
  const router = useRouter()
  const db = useFirestore()
  const { toast } = useToast()
  
  const { data: boards } = useCollection<any>(useMemo(() => (db ? collection(db, "boards") : null), [db]))
  const { data: exams } = useCollection<any>(useMemo(() => (db ? collection(db, "exams") : null), [db]))

  const [rawText, setRawText] = useState("")
  const [targetLang, setTargetLang] = useState<"En" | "Pa" | "Hi">("En")
  const [metadata, setMetadata] = useState({
    boardId: "",
    examId: "",
    mockType: "FULL",
    subjectId: "",
    difficulty: "medium" as any,
    duration: 120
  })
  
  const [parsedQuestions, setParsedQuestions] = useState<any[]>([])
  const [detectedMock, setDetectedMock] = useState<any>(null)
  const [isImporting, setIsImporting] = useState(false)

  const handleParse = () => {
    if (!rawText.trim()) return
    if (!metadata.boardId) {
      toast({ variant: "destructive", title: "Audit Error", description: "Select Board Authority first." })
      return
    }
    
    const results = parseBulkQuestions(rawText, { ...metadata, targetLang })
    setParsedQuestions(results.questions)
    setDetectedMock(results.mockMetadata)
    
    if (results.questions.length > 0) {
      toast({ title: "Extraction Complete", description: `Structured ${results.questions.length} ${targetLang} nodes.` })
    } else {
      toast({ variant: "destructive", title: "Extraction Failed", description: "No questions detected. Check format." })
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
        status: "PUBLISHED",
        author: "Mock Direct Deployment"
      })
    })

    const mockId = `mock-${Date.now()}`
    const mockRef = doc(db, "mocks", mockId)
    
    const mockPayload = {
      id: mockId,
      title: detectedMock?.title || `${metadata.boardId} ${metadata.mockType} Series`,
      boardId: metadata.boardId,
      examId: metadata.examId,
      mockType: metadata.mockType,
      duration: metadata.duration || detectedMock?.duration || 120,
      totalQuestions: parsedQuestions.length,
      questionIds: questionIds,
      published: true,
      status: "PUBLISHED",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      author: "Automatic Publisher"
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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
        <div className="flex items-center gap-6">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-2xl border border-slate-200 bg-white h-12 w-12 shadow-sm">
            <ChevronLeft className="h-6 w-6 text-[#0F172A]" />
          </Button>
          <div className="text-left">
            <h1 className="text-4xl font-black font-headline text-[#0F172A] uppercase tracking-tight">Direct Mock Publisher</h1>
            <p className="text-slate-500 font-medium italic">Configure time limits for Full Mocks, Sectional Tests, and PYQs.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-7 space-y-8 text-left">
          <Card className="border-slate-100 bg-white shadow-2xl rounded-[3rem] overflow-hidden">
            <div className="h-2 w-full bg-primary" />
            <CardHeader className="p-10 pb-4">
              <CardTitle className="font-headline font-black text-2xl uppercase">Test Deployment Node</CardTitle>
            </CardHeader>
            <CardContent className="p-10 pt-4 space-y-10">
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-3">
                  <p className="text-[10px] font-black uppercase text-slate-500 ml-1">Series Category</p>
                  <Select value={metadata.mockType} onValueChange={(v) => setMetadata({...metadata, mockType: v})}>
                    <SelectTrigger className="rounded-xl bg-slate-50 border-slate-100 h-12 font-bold text-[#0F172A]"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="FULL">Full Length Mock</SelectItem>
                      <SelectItem value="SECTIONAL">Sectional Test</SelectItem>
                      <SelectItem value="SUBJECT">Subject-wise Mock</SelectItem>
                      <SelectItem value="PYQ">Previous Year (PYQ)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-3">
                  <p className="text-[10px] font-black uppercase text-slate-500 ml-1">Duration (Minutes)</p>
                  <Input 
                    type="number" 
                    value={metadata.duration || ""} 
                    onChange={e => setMetadata({...metadata, duration: parseInt(e.target.value) || 0})} 
                    className="rounded-xl bg-slate-50 border-slate-100 h-12 font-black text-[#0F172A]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-3">
                  <p className="text-[10px] font-black uppercase text-slate-500 ml-1">Board Authority</p>
                  <Select value={metadata.boardId} onValueChange={val => setMetadata({...metadata, boardId: val})}>
                    <SelectTrigger className="rounded-xl bg-slate-50 border-slate-100 h-12 font-bold text-[#0F172A]"><SelectValue placeholder="Select Authority" /></SelectTrigger>
                    <SelectContent>{boards?.map(b => <SelectItem key={b.id} value={b.id}>{b.abbreviation}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-3">
                   <p className="text-[10px] font-black uppercase text-slate-500 ml-1">Target Exam Hub</p>
                   <Select value={metadata.examId} onValueChange={val => setMetadata({...metadata, examId: val})}>
                     <SelectTrigger className="rounded-xl bg-slate-50 border-slate-100 h-12 font-bold text-[#0F172A]" disabled={!metadata.boardId}><SelectValue placeholder="Select Hub" /></SelectTrigger>
                     <SelectContent>{exams?.filter(e => e.boardId === metadata.boardId).map(e => <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>)}</SelectContent>
                   </Select>
                </div>
              </div>

              <Textarea 
                placeholder="Paste your paper here..."
                className="min-h-[400px] rounded-[2rem] bg-slate-50 border-slate-100 p-8 text-sm font-mono leading-relaxed shadow-inner text-[#0F172A]"
                value={rawText}
                onChange={e => setRawText(e.target.value)}
              />
              
              <Button onClick={handleParse} className="w-full h-20 bg-[#0F172A] hover:bg-black text-white font-black uppercase tracking-[0.2em] gap-3 rounded-2xl shadow-xl transition-all">
                <Zap className="h-5 w-5 text-primary" /> Parse Data
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-5 text-left">
          <Card className="border-slate-100 bg-white shadow-2xl rounded-[3rem] h-full flex flex-col overflow-hidden">
            <CardHeader className="p-10 bg-slate-50/50 border-b border-slate-50">
              <CardTitle className="font-headline font-black text-2xl uppercase flex items-center gap-3 text-[#0F172A]">
                <Database className="h-6 w-6 text-primary" /> Deployment Buffer
              </CardTitle>
              <CardDescription className="text-xs font-bold uppercase tracking-widest text-slate-400">{parsedQuestions.length} Items Validated.</CardDescription>
            </CardHeader>
            <CardContent className="p-10 flex-1 overflow-y-auto custom-scrollbar space-y-6">
              {parsedQuestions.length > 0 ? (
                parsedQuestions.map((q, idx) => (
                  <div key={idx} className="p-8 rounded-3xl bg-slate-50 border border-slate-100 space-y-4">
                    <div className="flex justify-between items-center">
                       <Badge className="bg-primary/10 text-primary border-none text-[9px] font-black uppercase px-4 py-1.5 rounded-xl">{q.subjectId}</Badge>
                       <span className="text-[11px] font-black text-[#0F172A]">KEY: {q.correctAnswer}</span>
                    </div>
                    <p className="text-sm font-bold leading-relaxed text-slate-600 line-clamp-3">{(q as any)[`question${targetLang}`]}</p>
                  </div>
                ))
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-300 opacity-20 py-40">
                  <ClipboardList className="h-20 w-20 mb-6" />
                  <p className="font-black uppercase tracking-[0.3em] text-sm">Awaiting Input</p>
                </div>
              )}
            </CardContent>
            {parsedQuestions.length > 0 && (
               <div className="p-10 border-t border-slate-50 bg-slate-50/30">
                  <Button 
                    className="w-full h-16 bg-[#0F172A] hover:bg-black text-white font-black uppercase tracking-[0.2em] gap-3 rounded-2xl shadow-3xl"
                    onClick={handleDirectDeployMock}
                    disabled={isImporting}
                  >
                    <Rocket className="h-5 w-5 text-primary" /> Deploy Series ({metadata.duration}m)
                  </Button>
               </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}
