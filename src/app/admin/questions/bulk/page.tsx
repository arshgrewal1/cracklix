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
import { useFirestore, useCollection } from "@/firebase"
import { collection, doc, writeBatch, serverTimestamp, setDoc } from "firebase/firestore"
import { useToast } from "@/hooks/use-toast"
import { parseBulkQuestions } from "@/lib/parser"
import { Zap, Database, ChevronLeft, Rocket, CheckCircle2, Settings2, ClipboardCheck, Info } from "lucide-react"
import { errorEmitter } from "@/firebase/error-emitter"
import { FirestorePermissionError } from "@/firebase/errors"
import QuestionRenderer from "@/components/questions/QuestionRenderer"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { MockType } from "@/types"

/**
 * @fileOverview Institutional Bulk Ingestion Hub v4.2.
 * ACCESSIBILITY: Added DialogDescription for ARIA compliance.
 */

export default function BulkImportPage() {
  const router = useRouter()
  const db = useFirestore()
  const { toast } = useToast()
  
  const { data: boards } = useCollection<any>(useMemo(() => (db ? collection(db, "boards") : null), [db]))
  const { data: subjects } = useCollection<any>(useMemo(() => (db ? collection(db, "subjects") : null), [db]))

  const [rawText, setRawText] = useState("")
  const [metadata, setMetadata] = useState({
    boardId: "",
    examId: "",
    subjectId: "",
    chapterId: "",
    difficulty: "Medium" as any,
    status: "PUBLISHED" as any,
    languagePreference: "bilingual" as any,
    duration: 120,
    mockType: "FULL" as MockType
  })
  
  const [parsedQuestions, setParsedQuestions] = useState<any[]>([])
  const [isImporting, setIsImporting] = useState(false)
  const [showMockCreator, setShowMockCreator] = useState(false)
  const [lastImportedIds, setLastImportedIds] = useState<string[]>([])

  const handleParse = () => {
    if (!rawText.trim()) return
    if (!metadata.boardId || !metadata.subjectId) {
      toast({ variant: "destructive", title: "Audit Blocked", description: "Select Board and Subject first." })
      return
    }
    
    const results = parseBulkQuestions(rawText, metadata)
    
    if (results.questions.length === 0) {
      toast({ variant: "destructive", title: "Parsing Failed", description: "Check format: Q1, Line 2 Pun, (A) EN/PA" })
      setParsedQuestions([])
    } else {
      setParsedQuestions(results.questions)
      toast({ title: "Extraction Success", description: `${results.questions.length} questions structured.` })
    }
  }

  const handleCommitToBank = async () => {
    if (!db || parsedQuestions.length === 0) return
    setIsImporting(true)
    const batch = writeBatch(db)
    const ids: string[] = []

    parsedQuestions.forEach(q => {
      const newRef = doc(collection(db, "questions"))
      const payload: any = {
        ...q,
        id: newRef.id,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        isStandalone: true
      };
      Object.keys(payload).forEach(key => payload[key] === undefined && delete payload[key]);
      batch.set(newRef, payload)
      ids.push(newRef.id)
    })

    try {
      await batch.commit()
      setLastImportedIds(ids)
      toast({ title: "Bank Updated", description: `${parsedQuestions.length} questions saved.` })
      setShowMockCreator(true)
    } catch (e) {
      console.error('[BULK_IMPORT_ERROR]:', e);
      errorEmitter.emit('permission-error', new FirestorePermissionError({ path: 'questions/bulk', operation: 'write' }));
    } finally {
      setIsImporting(false)
    }
  }

  const handleDeployMock = async () => {
    if (!db || lastImportedIds.length === 0) return
    const mockId = `mock-${Date.now()}`
    const mockRef = doc(db, "mocks", mockId)
    const payload: any = {
      id: mockId,
      title: `${metadata.boardId} ${metadata.mockType} Series - ${new Date().toLocaleDateString()}`,
      boardId: metadata.boardId,
      examId: metadata.examId,
      mockType: metadata.mockType,
      duration: metadata.duration,
      totalQuestions: lastImportedIds.length,
      questionIds: lastImportedIds,
      difficulty: metadata.difficulty,
      published: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      accessType: 'FREE'
    };
    Object.keys(payload).forEach(key => payload[key] === undefined && delete payload[key]);

    try {
      await setDoc(mockRef, payload)
      toast({ title: "Series Deployed", description: "Mock test is now live." })
      router.push("/admin/mocks")
    } catch (e) {
      console.error('[MOCK_DEPLOY_ERROR]:', e);
      toast({ variant: "destructive", title: "Deployment Failed", description: e instanceof Error ? e.message : "Could not deploy mock test." })
    }
  }

  const placeholderText = `Q25. A man stands facing North...
ਪ੍ਰਸ਼ਨ 25. ਇੱਕ ਵਿਅਕਤੀ ਉੱਤਰ ਵੱਲ ਮੂੰਹ ਕਰਕੇ ਖੜ੍ਹਾ ਹੈ...
(A) East / ਪੂਰਬ
(B) West / ਪੱਛਮ
(C) South / ਦੱਖਣ
(D) North-West / ਉੱਤਰ-ਪੱਛਮ
Correct Answer: (B) West / ਸਹੀ ਉੱਤਰ: ਪੱਛਮ * English Explanation: Net turn = 135 - 45 = 90 deg...`;

  return (
    <div className="space-y-10 pb-20 max-w-[1600px] mx-auto text-[#0F172A] text-left">
      <div className="flex items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-2xl border border-slate-200 bg-white h-14 w-14 shadow-sm">
            <ChevronLeft className="h-8 w-8" />
          </Button>
          <div className="text-left">
            <h1 className="text-4xl font-black font-headline text-[#0F172A] uppercase tracking-tight">Institutional Ingestion</h1>
            <p className="text-slate-500 font-medium uppercase text-[10px] tracking-widest mt-1">Direct Paste Protocol v4.0</p>
          </div>
        </div>
        <div className="flex gap-4">
           <Button onClick={handleCommitToBank} disabled={isImporting || parsedQuestions.length === 0} className="bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase text-[10px] tracking-widest rounded-2xl h-16 px-12 gap-3 shadow-3xl">
              <Rocket className="h-5 w-5" /> {isImporting ? 'Syncing...' : 'Commit to Bank'}
           </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 px-4">
        <div className="lg:col-span-5 space-y-8">
          <Card className="border-none bg-white shadow-3xl rounded-[3rem] overflow-hidden">
            <div className="h-2 w-full bg-primary" />
            <CardHeader className="p-10 pb-4">
              <CardTitle className="font-headline font-black text-2xl uppercase flex items-center gap-4">
                <Settings2 className="h-6 w-6 text-primary" /> Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="p-10 pt-4 space-y-8">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Board</Label>
                  <Select value={metadata.boardId} onValueChange={val => setMetadata({...metadata, boardId: val})}>
                    <SelectTrigger className="rounded-xl bg-slate-50 border-none h-14 font-bold text-sm">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>{boards?.map((b: any) => <SelectItem key={b.id} value={b.id}>{b.abbreviation}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                   <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Subject</Label>
                   <Select value={metadata.subjectId} onValueChange={val => setMetadata({...metadata, subjectId: val})}>
                     <SelectTrigger className="rounded-xl bg-slate-50 border-none h-14 font-bold text-sm">
                        <SelectValue placeholder="Select" />
                     </SelectTrigger>
                     <SelectContent>{subjects?.map((s: any) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
                   </Select>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between ml-1">
                   <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Pasted Blocks Hub</Label>
                   <Badge variant="outline" className="text-[8px] font-black uppercase border-primary/20 text-primary">High Fidelity</Badge>
                </div>
                <Textarea 
                  placeholder={placeholderText}
                  className="min-h-[400px] rounded-[2.5rem] bg-slate-50 border-none p-10 text-sm font-bold leading-relaxed shadow-inner custom-scrollbar text-[#0F172A]"
                  value={rawText}
                  onChange={e => setRawText(e.target.value)}
                />
              </div>
              
              <Button onClick={handleParse} className="w-full h-20 bg-[#0F172A] hover:bg-black text-white font-black uppercase tracking-[0.3em] gap-4 rounded-[2rem] shadow-4xl">
                <Zap className="h-6 w-6 text-primary fill-current" /> Initialize Extraction
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-7">
           {parsedQuestions.length > 0 ? (
            <Card className="border-none bg-white shadow-4xl rounded-[4rem] h-full flex flex-col overflow-hidden">
               <CardHeader className="p-12 bg-slate-50/50 border-b border-slate-50">
                  <CardTitle className="font-headline font-black text-3xl uppercase flex items-center gap-4 text-[#0F172A]">
                    <CheckCircle2 className="h-8 w-8 text-emerald-600" /> Audit Registry ({parsedQuestions.length})
                  </CardTitle>
               </CardHeader>
               <CardContent className="p-12 flex-1 overflow-y-auto custom-scrollbar space-y-12">
                  {parsedQuestions.map((q, idx) => (
                    <div key={idx} className="space-y-8 pb-12 border-b border-slate-100 last:border-0 last:pb-0">
                       <div className="flex items-center justify-between">
                          <Badge className="bg-[#0F172A] text-white border-none text-[10px] font-black uppercase px-4 py-1 rounded-lg">Question {idx + 1}</Badge>
                       </div>
                       <QuestionRenderer language="bilingual" question={q} showSolution={true} />
                    </div>
                  ))}
               </CardContent>
            </Card>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-300 opacity-20 py-60">
              <Database className="h-32 w-32 mb-8" />
              <p className="font-headline font-black uppercase tracking-[0.4em] text-xl text-center">Awaiting Data Paste</p>
              <div className="flex items-center gap-4 mt-12 bg-white px-8 py-4 rounded-full border border-slate-100 shadow-sm opacity-50">
                 <Info className="h-4 w-4" />
                 <p className="text-[10px] font-bold uppercase">Multi-line Questions supported</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <Dialog open={showMockCreator} onOpenChange={setShowMockCreator}>
        <DialogContent className="sm:max-w-2xl rounded-[3rem] bg-[#0F172A] text-white border-white/10 p-0 overflow-hidden shadow-4xl">
          <div className="p-12 space-y-12">
            <div className="text-center space-y-4">
               <div className="h-20 w-20 bg-primary/20 rounded-[2.5rem] flex items-center justify-center mx-auto text-primary shadow-2xl"><Rocket className="h-10 w-10" /></div>
               <DialogTitle className="text-4xl font-headline font-black uppercase tracking-tight">Deploy Series</DialogTitle>
               <DialogDescription className="text-slate-400 text-lg font-medium">{parsedQuestions.length} questions saved. Initialize mock test now?</DialogDescription>
            </div>
            <DialogFooter className="flex flex-col sm:flex-row gap-4">
               <Button variant="ghost" onClick={() => router.push("/admin/questions")} className="h-14 px-8 rounded-2xl text-slate-400 hover:text-white font-bold uppercase text-[10px]">View Bank</Button>
               <Button onClick={handleDeployMock} className="flex-1 h-16 bg-primary hover:bg-orange-600 text-white font-black uppercase text-[10px] tracking-[0.2em] rounded-2xl shadow-3xl shadow-primary/20 gap-3">
                  <ClipboardCheck className="h-5 w-5" /> Initialize Series
               </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
