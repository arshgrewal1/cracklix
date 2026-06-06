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
  Database, 
  ChevronLeft, 
  Loader2, 
  Trash2, 
  Zap, 
  Rocket, 
  SearchCode, 
  Image as ImageIcon, 
  Edit3,
  Languages
} from "lucide-react"
import { useFirestore, useCollection, useStorage } from "@/firebase"
import { collection, doc, writeBatch, serverTimestamp } from "firebase/firestore"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { useToast } from "@/hooks/use-toast"
import { parseBulkQuestions } from "@/lib/parser"
import { Difficulty, Question, ContentStatus } from "@/types"
import QuestionRenderer from "@/components/questions/QuestionRenderer"

/**
 * @fileOverview Institutional High-Fidelity Bulk Ingestion Hub.
 * Permanent Fix: Full Bilingual Option Editing & Unrestricted Preview Visibility.
 */

export default function BulkImportPage() {
  const router = useRouter()
  const db = useFirestore()
  const storage = useStorage()
  const { toast } = useToast()
  
  const { data: boards } = useCollection<any>(useMemo(() => (db ? collection(db, "boards") : null), [db]))
  const { data: subjects } = useCollection<any>(useMemo(() => (db ? collection(db, "subjects") : null), [db]))
  const { data: exams } = useCollection<any>(useMemo(() => (db ? collection(db, "exams") : null), [db]))

  const [metadata, setMetadata] = useState({
    boardId: "",
    examId: "",
    subjectId: "",
    chapterId: "",
    difficulty: "Medium" as Difficulty,
    status: "PUBLISHED" as ContentStatus,
  })

  const [rawText, setRawText] = useState("")
  const [parsedQuestions, setParsedQuestions] = useState<Partial<Question>[]>([])
  const [parseErrors, setParseErrors] = useState<string[]>([])
  const [confidence, setConfidence] = useState(0)
  const [isSyncing, setIsSyncing] = useState(false)
  const [uploadingIdx, setUploadingIdx] = useState<number | null>(null)
  const [editingIdx, setEditingIdx] = useState<number | null>(null)

  const handleAnalyze = async () => {
    if (!rawText.trim()) return
    if (!metadata.boardId || !metadata.subjectId) {
      toast({ variant: "destructive", title: "Config Required", description: "Select Board and Subject." })
      return
    }

    const { questions, errors, confidence: conf } = parseBulkQuestions(rawText, metadata)
    
    setParsedQuestions(questions)
    setParseErrors(errors)
    setConfidence(conf)

    if (errors.length > 0) {
      toast({ variant: "destructive", title: "Split Warnings" })
    } else {
      toast({ title: "Audit Complete", description: `Matrix ready with ${questions.length} nodes.` })
    }
  }

  const handleUpdateQuestion = (idx: number, field: string, val: string) => {
    const updated = [...parsedQuestions]
    updated[idx] = { ...updated[idx], [field]: val }
    setParsedQuestions(updated)
  }

  const handleImageUpload = async (idx: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !storage) return

    setUploadingIdx(idx)
    const storageRef = ref(storage, `question_assets/${Date.now()}_${file.name.replace(/\s+/g, '_')}`)

    try {
      const snapshot = await uploadBytes(storageRef, file)
      const url = await getDownloadURL(snapshot.ref)
      
      handleUpdateQuestion(idx, 'imageUrl', url)
      toast({ title: "Asset Synced" })
    } catch (err) {
      toast({ variant: "destructive", title: "Upload Rejected" })
    } finally {
      setUploadingIdx(null)
    }
  }

  const handleSaveToBank = async () => {
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
        isStandalone: true,
      };
      
      // Cleanup undefined
      Object.keys(payload).forEach(key => (payload[key] === undefined || payload[key] === null) && delete payload[key]);
      batch.set(qRef, payload)
    })

    try {
      await batch.commit()
      toast({ title: "Global Bank Synced" })
      router.push("/admin/questions")
    } catch (e: any) {
      toast({ variant: "destructive", title: "Sync Failed" })
    } finally {
      setIsSyncing(false)
    }
  }

  return (
    <div className="space-y-10 pb-32 text-left max-w-[1600px] mx-auto">
      <div className="flex items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-2xl border bg-white h-12 w-12 shadow-sm"><ChevronLeft className="h-6 w-6" /></Button>
          <div className="text-left">
            <h1 className="text-4xl font-black font-headline text-[#0F172A] uppercase tracking-tight">Institutional Ingestion</h1>
            <p className="text-slate-500 font-medium">Injecting high-fidelity metadata nodes into the Atomic Bank.</p>
          </div>
        </div>
        <div className="flex gap-4">
           <Button onClick={handleSaveToBank} disabled={isSyncing || parsedQuestions.length === 0} className="bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase text-[10px] tracking-widest rounded-2xl h-16 px-12 gap-3 shadow-3xl shadow-emerald-900/20">
              {isSyncing ? <Loader2 className="h-5 w-5 animate-spin" /> : <Rocket className="h-5 w-5" />} Commit {parsedQuestions.length} Nodes
           </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 px-4">
        <div className="lg:col-span-4 space-y-8">
          <Card className="border-none bg-white shadow-3xl rounded-[3rem] overflow-hidden">
            <div className="h-2 w-full bg-primary" />
            <CardHeader className="p-10 pb-4">
              <CardTitle className="font-headline font-black text-2xl uppercase flex items-center gap-4">Registry Metadata</CardTitle>
            </CardHeader>
            <CardContent className="p-10 pt-4 space-y-6">
              <div className="space-y-5">
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Authority Board</Label>
                  <Select value={metadata.boardId} onValueChange={v => setMetadata({...metadata, boardId: v, examId: ""})}>
                    <SelectTrigger className="rounded-xl h-12 bg-slate-50 border-none font-bold text-[#0F172A] shadow-inner"><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>{boards?.map((b: any) => <SelectItem key={b.id} value={b.id}>{b.abbreviation}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                   <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Subject Registry</Label>
                   <Select value={metadata.subjectId} onValueChange={v => setMetadata({...metadata, subjectId: v})}>
                      <SelectTrigger className="rounded-xl h-12 bg-slate-50 border-none font-bold text-[#0F172A] shadow-inner"><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>{subjects?.map((s:any) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
                   </Select>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="p-10 bg-[#0F172A] rounded-[3rem] text-white space-y-8 shadow-4xl overflow-hidden relative">
             <div className="flex items-center gap-4 relative z-10">
                <SearchCode className="h-6 w-6 text-primary" />
                <h3 className="font-headline font-black uppercase">Fidelity Scan</h3>
             </div>
             <div className="space-y-6 relative z-10">
                <div className="flex justify-between items-center text-sm">
                   <span className="text-slate-400 font-bold uppercase text-[10px]">Nodes Detected</span>
                   <span className="font-black text-primary text-xl">{parsedQuestions.length}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                   <span className="text-slate-400 font-bold uppercase text-[10px]">Parse Confidence</span>
                   <span className="font-black text-emerald-400 text-xl">{confidence}%</span>
                </div>
             </div>
          </div>
        </div>

        <div className="lg:col-span-8 space-y-8">
           <div className="space-y-3">
              <Textarea 
                value={rawText}
                onChange={e => setRawText(e.target.value)}
                placeholder="Paste bilingual series text here..."
                className="min-h-[400px] rounded-[3.5rem] bg-white border-none p-12 text-sm font-bold leading-relaxed shadow-4xl custom-scrollbar text-[#0F172A] whitespace-pre"
              />
              <Button onClick={handleAnalyze} className="w-full h-20 bg-[#0F172A] hover:bg-black text-white font-black uppercase tracking-[0.3em] rounded-[2.5rem] shadow-4xl mt-6 gap-4 transition-all active:scale-95">
                 <Zap className="h-6 w-6 text-primary fill-current" /> Initialize Audit & Matrix
              </Button>
           </div>

           {parsedQuestions.length > 0 && (
             <Card className="border-none shadow-4xl rounded-[4rem] bg-white overflow-hidden text-left">
                <CardHeader className="p-12 border-b border-slate-50 bg-slate-50/30">
                   <CardTitle className="font-headline font-black text-3xl uppercase">Validated Matrix ({parsedQuestions.length})</CardTitle>
                </CardHeader>
                <CardContent className="p-12 space-y-12">
                   {parsedQuestions.map((q, idx) => (
                      <div key={idx} className="p-10 bg-slate-50/30 rounded-[3rem] border border-slate-100 space-y-8 group/item relative hover:bg-white transition-all shadow-sm">
                         <div className="flex items-center justify-between">
                            <Badge className="bg-primary text-white border-none text-[11px] font-black uppercase px-5 py-1 rounded-xl shadow-lg">Node {q.displayId}</Badge>
                            <div className="flex gap-3">
                               <Button 
                                 variant={editingIdx === idx ? "default" : "outline"} 
                                 size="sm" 
                                 className="rounded-xl h-11 px-6 gap-3 bg-white font-black uppercase text-[10px] tracking-widest shadow-sm"
                                 onClick={() => setEditingIdx(editingIdx === idx ? null : idx)}
                               >
                                  <Edit3 className="h-4 w-4" /> {editingIdx === idx ? "View Node" : "Edit Node"}
                               </Button>
                               <Button 
                                 variant="outline" 
                                 size="sm" 
                                 className="rounded-xl h-11 px-6 gap-3 bg-white font-black uppercase text-[10px] tracking-widest shadow-sm"
                                 onClick={() => {
                                   const input = document.createElement('input');
                                   input.type = 'file';
                                   input.accept = 'image/*';
                                   input.onchange = (e: any) => handleImageUpload(idx, e);
                                   input.click();
                                 }}
                                 disabled={uploadingIdx === idx}
                               >
                                  {uploadingIdx === idx ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImageIcon className="h-4 w-4 text-primary" />}
                                  {q.imageUrl ? "Asset Synced" : "Add Image Node"}
                               </Button>
                               <Button variant="ghost" size="icon" className="h-11 w-11 text-rose-500 bg-rose-50 rounded-xl" onClick={() => setParsedQuestions(parsedQuestions.filter((_, i) => i !== idx))}><Trash2 className="h-5 w-5" /></Button>
                            </div>
                         </div>
                         
                         <div className="border-t border-slate-100 pt-8">
                            {editingIdx === idx ? (
                               <div className="space-y-8 animate-in fade-in duration-300">
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                     <div className="space-y-2">
                                        <Label className="text-[9px] font-black uppercase text-slate-400">Statement (EN)</Label>
                                        <Textarea value={q.questionEn} onChange={e => handleUpdateQuestion(idx, 'questionEn', e.target.value)} className="rounded-xl h-32 text-sm font-bold" />
                                     </div>
                                     <div className="space-y-2">
                                        <Label className="text-[9px] font-black uppercase text-slate-400">ਸਵਾਲ (PA)</Label>
                                        <Textarea value={q.questionPa} onChange={e => handleUpdateQuestion(idx, 'questionPa', e.target.value)} className="rounded-xl h-32 text-sm font-bold" />
                                     </div>
                                  </div>
                                  
                                  <div className="space-y-6">
                                     <div className="flex items-center gap-3">
                                        <Languages className="h-4 w-4 text-primary" />
                                        <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Bilingual Options Registry</p>
                                     </div>
                                     <div className="grid grid-cols-1 gap-6">
                                        {['A', 'B', 'C', 'D'].map(opt => (
                                           <div key={opt} className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6 bg-white border border-slate-100 rounded-2xl shadow-inner">
                                              <div className="space-y-2">
                                                 <Label className="text-[9px] font-black uppercase text-slate-400">Option {opt} (EN)</Label>
                                                 <Input value={(q as any)[`option${opt}En`] || ""} onChange={e => handleUpdateQuestion(idx, `option${opt}En`, e.target.value)} className="rounded-xl h-11 text-xs font-bold bg-slate-50 border-none" />
                                              </div>
                                              <div className="space-y-2">
                                                 <Label className="text-[9px] font-black uppercase text-slate-400">ਵਿਕਲਪ {opt} (PA)</Label>
                                                 <Input value={(q as any)[`option${opt}Pa`] || ""} onChange={e => handleUpdateQuestion(idx, `option${opt}Pa`, e.target.value)} className="rounded-xl h-11 text-xs font-bold bg-emerald-50/30 border-none" />
                                              </div>
                                           </div>
                                        ))}
                                     </div>
                                  </div>
                               </div>
                            ) : (
                               <QuestionRenderer question={q} language="bilingual" showSolution={true} />
                            )}
                         </div>
                      </div>
                   ))}
                </CardContent>
             </Card>
           )}
        </div>
      </div>
    </div>
  )
}
