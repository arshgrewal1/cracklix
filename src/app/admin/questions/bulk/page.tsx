"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useFirestore, useCollection } from "@/firebase"
import { collection, doc, writeBatch, serverTimestamp } from "firebase/firestore"
import { useToast } from "@/hooks/use-toast"
import { parseBulkQuestions } from "@/lib/parser"
import { FileText, Zap, CheckCircle2, Database, ChevronLeft, AlertCircle, Trash2, Languages, Info, BookOpen, Layers, Clock, Trophy, LayoutGrid, ClipboardList } from "lucide-react"
import { errorEmitter } from "@/firebase/error-emitter"
import { FirestorePermissionError } from "@/firebase/errors"

/**
 * @fileOverview Enhanced Bulk Import with Mock Category and Subject selection.
 * Optimized for importing Full Mocks, Sectional Mocks, and PYQs.
 */

export default function BulkImportPage() {
  const router = useRouter()
  const db = useFirestore()
  const { toast } = useToast()
  
  const { data: boards } = useCollection<any>(useMemo(() => (db ? collection(db, "boards") : null), [db]))
  const { data: subjects } = useCollection<any>(useMemo(() => (db ? collection(db, "subjects") : null), [db]))

  const [rawText, setRawText] = useState("")
  const [targetLang, setTargetLang] = useState<"En" | "Pa" | "Hi">("En")
  const [metadata, setMetadata] = useState({
    boardId: "",
    examId: "",
    mockType: "FULL",
    subjectId: "",
    difficulty: "medium" as any
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
      toast({ title: "Extraction Complete", description: `Structured ${results.questions.length} ${targetLang} nodes with section detection.` })
    } else {
      toast({ variant: "destructive", title: "Extraction Failed", description: "Invalid format detected." })
    }
  }

  const handleImport = () => {
    if (!db || parsedQuestions.length === 0) return
    setIsImporting(true)

    const batch = writeBatch(db)
    parsedQuestions.forEach(q => {
      const newRef = doc(collection(db, "questions"))
      batch.set(newRef, {
        ...q,
        id: newRef.id,
        createdAt: serverTimestamp(),
        status: "DRAFT",
        author: "Arsh Grewal Management"
      })
    })

    batch.commit()
      .then(() => {
        toast({ title: "Repository Synced", description: `${parsedQuestions.length} Items committed to global bank.` })
        router.push("/admin/questions")
      })
      .catch(async () => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: '/questions',
          operation: 'write',
          requestResourceData: { batchSize: parsedQuestions.length },
        }));
      })
      .finally(() => setIsImporting(false))
  }

  return (
    <div className="space-y-10 pb-20 max-w-7xl mx-auto text-[#0F172A]">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
        <div className="flex items-center gap-6">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-2xl border border-slate-200 bg-white h-12 w-12 shadow-sm">
            <ChevronLeft className="h-6 w-6 text-[#0F172A]" />
          </Button>
          <div className="text-left">
            <h1 className="text-4xl font-black font-headline text-[#0F172A] uppercase tracking-tight">Mock Extraction Node</h1>
            <p className="text-slate-500 font-medium">Batch multi-subject entry for Punjab verticals.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-7 space-y-8 text-left">
          <Card className="border-slate-100 bg-white shadow-2xl rounded-[3rem] overflow-hidden">
            <div className="h-2 w-full bg-primary" />
            <CardHeader className="p-10 pb-4">
              <CardTitle className="font-headline font-black text-2xl uppercase">Test Import Controls</CardTitle>
              <CardDescription className="text-xs font-bold uppercase tracking-widest text-slate-400">Define the mock category and paste your content below.</CardDescription>
            </CardHeader>
            <CardContent className="p-10 pt-4 space-y-10">
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-3">
                  <p className="text-[10px] font-black uppercase text-slate-500 ml-1 flex items-center gap-2"><Layers className="h-3 w-3" /> Mock Category</p>
                  <Select value={metadata.mockType} onValueChange={(v) => setMetadata({...metadata, mockType: v})}>
                    <SelectTrigger className="rounded-xl bg-slate-50 border-slate-100 shadow-inner h-12 font-bold text-[#0F172A]"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="FULL">Full Length Mock</SelectItem>
                      <SelectItem value="SECTIONAL">Sectional Mock</SelectItem>
                      <SelectItem value="SUBJECT">Subject-wise Mock</SelectItem>
                      <SelectItem value="PYQ">Previous Year (PYQ)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-3">
                  <p className="text-[10px] font-black uppercase text-slate-500 ml-1">Board Authority</p>
                  <Select onValueChange={val => setMetadata({...metadata, boardId: val})}>
                    <SelectTrigger className="rounded-xl bg-slate-50 border-slate-100 shadow-inner h-12 font-bold text-[#0F172A]"><SelectValue placeholder="Select Authority" /></SelectTrigger>
                    <SelectContent className="max-h-[300px]">
                      {boards?.map(b => <SelectItem key={b.id} value={b.id}>{b.abbreviation}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {(metadata.mockType === 'SUBJECT' || metadata.mockType === 'SECTIONAL') && (
                <div className="space-y-3">
                   <p className="text-[10px] font-black uppercase text-slate-500 ml-1 flex items-center gap-2"><BookOpen className="h-3 w-3" /> Primary Subject Node</p>
                   <Select value={metadata.subjectId} onValueChange={val => setMetadata({...metadata, subjectId: val})}>
                     <SelectTrigger className="rounded-xl bg-slate-50 border-slate-100 shadow-inner h-14 font-bold text-[#0F172A]"><SelectValue placeholder="Select Target Subject" /></SelectTrigger>
                     <SelectContent className="max-h-[300px]">
                        {subjects?.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                     </SelectContent>
                   </Select>
                   <p className="text-[9px] text-slate-400 italic">This will be the default subject for all questions unless headers like 'Subject:' are detected in text.</p>
                </div>
              )}

              <div className="space-y-3">
                <p className="text-[10px] font-black uppercase text-slate-500 ml-1 flex items-center gap-2"><Languages className="h-3 w-3" /> Content Language</p>
                <Select value={targetLang} onValueChange={(v: any) => setTargetLang(v)}>
                  <SelectTrigger className="rounded-xl bg-slate-50 border-slate-100 shadow-inner h-12 font-bold text-[#0F172A]"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="En">English Node</SelectItem>
                    <SelectItem value="Pa">Punjabi Node</SelectItem>
                    <SelectItem value="Hi">Hindi Node</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="bg-blue-50 p-8 rounded-3xl border border-blue-100 space-y-4">
                 <h4 className="font-black text-[10px] uppercase text-blue-600 flex items-center gap-2 tracking-widest"><Info className="h-4 w-4" /> Multi-Subject Protocol</h4>
                 <p className="text-xs text-blue-800 leading-relaxed font-bold">
                   For Full Mocks, use headers like 'PART-A:', 'Section:' or 'Subject: Punjab GK' to split subjects automatically.
                 </p>
              </div>

              <Textarea 
                placeholder="Paste the entire test content here..."
                className="min-h-[400px] rounded-[2rem] bg-slate-50 border-slate-100 p-8 text-sm font-mono leading-relaxed shadow-inner text-[#0F172A]"
                value={rawText}
                onChange={e => setRawText(e.target.value)}
              />
              
              <Button onClick={handleParse} className="w-full h-16 bg-[#0F172A] hover:bg-black text-white font-black uppercase tracking-[0.2em] gap-3 rounded-2xl shadow-xl transition-all">
                <Zap className="h-5 w-5 text-primary" /> Run Extraction Engine
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-5 text-left">
          <Card className="border-slate-100 bg-white shadow-2xl rounded-[3rem] h-full flex flex-col overflow-hidden">
            <CardHeader className="p-10 bg-slate-50/50 border-b border-slate-50">
              <CardTitle className="font-headline font-black text-2xl uppercase flex items-center gap-3 text-[#0F172A]">
                <Database className="h-6 w-6 text-primary" /> Extraction Buffer
              </CardTitle>
              <CardDescription className="text-xs font-bold uppercase tracking-widest text-slate-400">{parsedQuestions.length} Items Validated.</CardDescription>
            </CardHeader>
            <CardContent className="p-10 flex-1 overflow-y-auto custom-scrollbar space-y-6">
              {detectedMock && (
                <div className="p-8 bg-primary/5 border border-primary/10 rounded-3xl space-y-4 mb-6">
                   <div className="flex items-center gap-3">
                      <Trophy className="h-5 w-5 text-primary" />
                      <span className="text-[10px] font-black uppercase text-primary tracking-widest">Metadata Detected</span>
                   </div>
                   <p className="text-xl font-black text-[#0F172A] leading-tight">{detectedMock.title || "Unknown Series"}</p>
                   <div className="flex items-center gap-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                      <span className="flex items-center gap-2"><Clock className="h-4 w-4" /> {detectedMock.duration} Min</span>
                      <span className="flex items-center gap-2"><Layers className="h-4 w-4" /> {detectedMock.totalQuestions} Qs</span>
                   </div>
                </div>
              )}

              {parsedQuestions.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-300 opacity-20 py-40">
                  <ClipboardList className="h-20 w-20 mb-6" />
                  <p className="font-black uppercase tracking-[0.3em] text-sm">Awaiting Mock Input</p>
                </div>
              ) : (
                parsedQuestions.map((q, idx) => (
                  <div key={idx} className="p-8 rounded-3xl bg-slate-50 border border-slate-100 space-y-4 group hover:border-primary transition-all">
                    <div className="flex justify-between items-center">
                       <Badge className="bg-primary/10 text-primary border-none text-[9px] font-black uppercase px-4 py-1.5 rounded-xl">{q.subjectId}</Badge>
                       <span className="text-[11px] font-black text-[#0F172A] font-mono">KEY: {q.correctAnswer}</span>
                    </div>
                    <p className="text-sm font-bold leading-relaxed text-slate-600 line-clamp-3">{(q as any)[`question${targetLang}`]}</p>
                    
                    <div className="pt-4 border-t border-slate-200">
                       <p className="text-[9px] font-black uppercase text-slate-400 mb-2 flex items-center gap-2"><BookOpen className="h-3 w-3" /> Rationale Node</p>
                       <p className="text-[11px] text-slate-500 italic line-clamp-2">{(q as any)[`explanation${targetLang}`] || "No explanation detected."}</p>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
            {parsedQuestions.length > 0 && (
               <div className="p-10 border-t border-slate-50 bg-slate-50/30">
                  <Button 
                    className="w-full h-16 bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase tracking-[0.2em] gap-3 rounded-2xl shadow-3xl shadow-emerald-900/40"
                    onClick={handleImport}
                    disabled={isImporting}
                  >
                    <CheckCircle2 className="h-5 w-5" /> {isImporting ? "Syncing Repository..." : `Commit ${parsedQuestions.length} Items`}
                  </Button>
               </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}
