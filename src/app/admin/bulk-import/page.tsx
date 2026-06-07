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
  AlertTriangle,
  Database,
  SearchCode,
  CheckCircle2,
  Languages
} from "lucide-react"
import { useFirestore, useCollection } from "@/firebase"
import { collection, doc, writeBatch, serverTimestamp } from "firebase/firestore"
import { useToast } from "@/hooks/use-toast"
import { parseBulkQuestions } from "@/lib/parser"
import { Difficulty, ContentStatus } from "@/types"
import QuestionRenderer from "@/components/questions/QuestionRenderer"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

export default function BulkImportPage() {
  const router = useRouter()
  const db = useFirestore()
  const { toast } = useToast()
  
  const { data: boards } = useCollection<any>(useMemo(() => (db ? collection(db, "boards") : null), [db]))
  const { data: subjects } = useCollection<any>(useMemo(() => (db ? collection(db, "subjects") : null), [db]))

  const [metadata, setMetadata] = useState({
    boardId: "",
    subjectId: "",
    secondaryLanguage: "punjabi" as 'punjabi' | 'hindi',
    difficulty: "Medium" as Difficulty,
    status: "PUBLISHED" as ContentStatus,
  })

  const [rawText, setRawText] = useState("")
  const [parsedQuestions, setParsedQuestions] = useState<any[]>([])
  const [errors, setErrors] = useState<string[]>([])
  const [isSyncing, setIsSyncing] = useState(false)
  
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [editForm, setEditForm] = useState<any>(null)

  const handleImport = () => {
    if (!rawText.trim()) return
    if (!metadata.boardId || !metadata.subjectId) {
      toast({ variant: "destructive", title: "Audit Blocked", description: "Select Board and Subject first." })
      return
    }

    const result = parseBulkQuestions(rawText, metadata);
    setParsedQuestions(result.questions);
    setErrors(result.errors);

    if (result.questions.length > 0) {
      toast({ title: "Extraction Success", description: `${result.questions.length} blocks mapped to explicit fields.` });
    } else {
      toast({ variant: "destructive", title: "Audit Rejected", description: "Check field validation reports." });
    }
  }

  const handleOpenEdit = (idx: number) => {
    setEditingIndex(idx)
    setEditForm({ 
      ...parsedQuestions[idx],
      englishQuestion: parsedQuestions[idx].englishQuestion || "",
      punjabiQuestion: parsedQuestions[idx].punjabiQuestion || "",
      hindiQuestion: parsedQuestions[idx].hindiQuestion || "",
      optionAEnglish: parsedQuestions[idx].optionAEnglish || "",
      optionAPunjabi: parsedQuestions[idx].optionAPunjabi || "",
      optionAHindi: parsedQuestions[idx].optionAHindi || "",
      optionBEnglish: parsedQuestions[idx].optionBEnglish || "",
      optionBPunjabi: parsedQuestions[idx].optionBPunjabi || "",
      optionBHindi: parsedQuestions[idx].optionBHindi || "",
      optionCEnglish: parsedQuestions[idx].optionCEnglish || "",
      optionCPunjabi: parsedQuestions[idx].optionCPunjabi || "",
      optionCHindi: parsedQuestions[idx].optionCHindi || "",
      optionDEnglish: parsedQuestions[idx].optionDEnglish || "",
      optionDPunjabi: parsedQuestions[idx].optionDPunjabi || "",
      optionDHindi: parsedQuestions[idx].optionDHindi || "",
      englishExplanation: parsedQuestions[idx].englishExplanation || "",
      punjabiExplanation: parsedQuestions[idx].punjabiExplanation || "",
      hindiExplanation: parsedQuestions[idx].hindiExplanation || ""
    })
  }

  const handleSaveEdit = () => {
    if (editingIndex === null || !editForm) return
    const updated = [...parsedQuestions]
    updated[editingIndex] = editForm
    setParsedQuestions(updated)
    setEditingIndex(null)
    toast({ title: "Entry Node Tweaked" })
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
      const { debug, ...cleanQ } = q;
      const qRef = doc(collection(db, "questions"))
      batch.set(qRef, {
        ...cleanQ,
        id: qRef.id,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
    })

    try {
      await batch.commit()
      toast({ title: "Master Registry Synced", description: `${parsedQuestions.length} assets committed.` })
      router.push("/admin/questions")
    } catch (e) {
      toast({ variant: "destructive", title: "Cloud Rejection", description: "Check security permissions." })
    } finally {
      setIsSyncing(false)
    }
  }

  const isHindiMode = metadata.secondaryLanguage === 'hindi';

  return (
    <div className="space-y-10 pb-32 text-left max-w-7xl mx-auto pt-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 px-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-xl border border-slate-200 h-12 w-12 bg-white shadow-sm"><ChevronLeft className="h-6 w-6" /></Button>
          <div>
            <h1 className="text-4xl font-black font-headline text-[#0F172A] uppercase tracking-tight leading-none">Bulk Ingestion</h1>
            <p className="text-slate-500 font-medium">High-Fidelity Multi-Language Mapping Hub.</p>
          </div>
        </div>
        <Button onClick={handleSaveToRegistry} disabled={isSyncing || parsedQuestions.length === 0} className="bg-[#0F172A] hover:bg-black text-white font-black uppercase text-[11px] tracking-widest rounded-xl h-14 px-12 gap-3 shadow-2xl">
          {isSyncing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Rocket className="h-4 w-4 text-primary fill-current" />} Commit Staged Assets
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 px-4">
        <div className="lg:col-span-5 space-y-8">
          <Card className="border-none bg-white shadow-3xl rounded-[2.5rem] overflow-hidden">
            <div className="h-1.5 w-full bg-[#0F172A]" />
            <CardHeader className="p-10 pb-4 text-left">
              <CardTitle className="font-headline font-black text-xl uppercase flex items-center gap-3"><ClipboardList className="h-5 w-5 text-primary" /> Registry Config</CardTitle>
            </CardHeader>
            <CardContent className="p-10 pt-4 space-y-8">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Board Hub</Label>
                  <Select value={metadata.boardId} onValueChange={v => setMetadata({...metadata, boardId: v})}>
                    <SelectTrigger className="rounded-xl h-12 bg-slate-50/50 border-none font-bold text-sm"><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>{boards?.map((b: any) => <SelectItem key={b.id} value={b.id}>{b.abbreviation}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                   <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Subject Hub</Label>
                   <Select value={metadata.subjectId} onValueChange={v => setMetadata({...metadata, subjectId: v})}>
                      <SelectTrigger className="rounded-xl h-12 bg-slate-50/50 border-none font-bold text-sm"><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>{subjects?.map((s:any) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
                   </Select>
                </div>
              </div>

              <div className="space-y-1.5 pt-2">
                 <Label className="text-[10px] font-black uppercase text-slate-400 ml-1 flex items-center gap-2"><Languages className="h-3 w-3" /> Target Secondary Language</Label>
                 <Select value={metadata.secondaryLanguage} onValueChange={(v: any) => setMetadata({...metadata, secondaryLanguage: v})}>
                    <SelectTrigger className="rounded-xl h-14 bg-slate-900 text-white border-none font-black uppercase text-[10px] tracking-widest"><SelectValue /></SelectTrigger>
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
                placeholder={`Paste Q1. English Statement...\n${isHindiMode ? 'Hindi Statement...' : 'Punjabi Statement...'}\n(A) EN / ${isHindiMode ? 'HI' : 'PA'}...\nCorrect Answer: A`}
                className="min-h-[550px] rounded-[2.5rem] bg-white border-none p-12 text-sm font-bold shadow-4xl leading-relaxed resize-none focus-visible:ring-primary text-[#0F172A]"
            />
            <Button onClick={handleImport} className="w-full h-20 bg-primary hover:bg-orange-600 text-white font-black uppercase tracking-[0.3em] text-[11px] rounded-[2rem] shadow-4xl gap-4 group transition-all active:scale-95">
               Initialize Extraction <ArrowRight className="h-6 w-6 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>

        <div className="lg:col-span-7 space-y-10">
           {parsedQuestions.length > 0 ? (
             <div className="space-y-12">
                <div className="flex items-center justify-between px-2">
                   <h3 className="font-headline font-black text-2xl uppercase flex items-center gap-4 text-[#0F172A]">
                      <Database className="h-6 w-6 text-primary" /> Staged Hub
                   </h3>
                   <Badge className="bg-emerald-50 text-emerald-600 border-none font-black px-6 py-2 rounded-xl text-[10px] tracking-widest uppercase">
                      {parsedQuestions.length} Blocks Verified
                   </Badge>
                </div>
                {parsedQuestions.map((q, idx) => (
                  <div key={idx} className="relative group">
                    <Card className="border-none shadow-3xl rounded-[3rem] bg-white p-12 text-left group overflow-visible border border-slate-50 transition-all hover:border-primary/20">
                       <div className="flex justify-between items-start mb-10 border-b border-slate-50 pb-8">
                          <div className="space-y-2">
                             <Badge className="bg-[#0F172A] text-white border-none text-[10px] font-black px-6 py-2 rounded-xl uppercase tracking-widest">Asset {idx + 1}</Badge>
                             <div className="flex flex-wrap gap-2 pt-2">
                                <DebugIndicator label="EN" active={q.debug.EN_Q === 'YES'} />
                                <DebugIndicator label={isHindiMode ? "HI" : "PA"} active={q.debug.SEC_Q === 'YES'} />
                                <DebugIndicator label="OPTS" active={q.debug.OPT === 'YES'} />
                                <DebugIndicator label="KEY" active={q.debug.KEY === 'YES'} />
                             </div>
                          </div>
                          <div className="flex gap-3">
                             <Button variant="ghost" size="icon" className="h-14 w-14 rounded-2xl text-blue-500 bg-blue-50 shadow-sm hover:scale-110 transition-transform" onClick={() => handleOpenEdit(idx)}><Edit className="h-6 w-6" /></Button>
                             <Button variant="ghost" size="icon" className="h-14 w-14 rounded-2xl text-rose-500 bg-rose-50 shadow-sm hover:scale-110 transition-transform" onClick={() => handleDelete(idx)}><Trash2 className="h-6 w-6" /></Button>
                          </div>
                       </div>
                       <QuestionRenderer question={q} language={isHindiMode ? "ENGLISH_HINDI" : "ENGLISH_PUNJABI"} showSolution={true} />
                    </Card>
                  </div>
                ))}
             </div>
           ) : (
             <div className="h-full flex flex-col items-center justify-center text-slate-300 opacity-20 pt-40">
                <FileText className="h-40 w-40 mb-10" />
                <p className="font-headline font-black uppercase text-2xl tracking-[0.2em]">Awaiting Content Registry</p>
             </div>
           )}
        </div>
      </div>

      <Dialog open={editingIndex !== null} onOpenChange={open => !open && setEditingIndex(null)}>
         <DialogContent className="sm:max-w-5xl max-h-[95vh] overflow-y-auto rounded-[3rem] bg-white border-none shadow-4xl p-0 text-left flex flex-col">
            <div className="h-2 w-full bg-[#0F172A] shrink-0" />
            <DialogHeader className="p-10 pb-6 flex flex-row items-center justify-between shrink-0">
               <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600"><SearchCode className="h-7 w-7" /></div>
                  <DialogTitle className="text-3xl font-black font-headline uppercase text-[#0F172A]">Modify Explicit Fields</DialogTitle>
               </div>
               <Button variant="ghost" size="icon" onClick={() => setEditingIndex(null)} className="rounded-xl h-12 w-12"><X className="h-6 w-6 text-slate-400" /></Button>
            </DialogHeader>
            <div className="px-10 pb-10 space-y-10 overflow-y-auto custom-scrollbar flex-1">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-3">
                     <Label className="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-1">English Statement</Label>
                     <Textarea value={editForm?.englishQuestion || ""} onChange={e => setEditForm({...editForm, englishQuestion: e.target.value})} className="h-32 rounded-2xl bg-slate-50 border-none font-bold text-lg p-6 shadow-inner text-[#0F172A]" />
                  </div>
                  <div className="space-y-3">
                     <Label className="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-1">{isHindiMode ? 'Hindi Statement' : 'Punjabi Statement'}</Label>
                     <Textarea 
                        value={isHindiMode ? (editForm?.hindiQuestion || "") : (editForm?.punjabiQuestion || "")} 
                        onChange={e => setEditForm({...editForm, [isHindiMode ? 'hindiQuestion' : 'punjabiQuestion']: e.target.value})} 
                        className="h-32 rounded-2xl bg-slate-50 border-none font-bold text-lg p-6 shadow-inner text-[#0F172A]" 
                     />
                  </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-3">
                     <Label className="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-1">English Rationalization</Label>
                     <Textarea value={editForm?.englishExplanation || ""} onChange={e => setEditForm({...editForm, englishExplanation: e.target.value})} className="h-32 rounded-2xl bg-slate-50 border-none font-medium p-6 shadow-inner text-[#0F172A]" />
                  </div>
                  <div className="space-y-3">
                     <Label className="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-1">{isHindiMode ? 'Hindi Rationalization' : 'Punjabi Rationalization'}</Label>
                     <Textarea 
                        value={isHindiMode ? (editForm?.hindiExplanation || "") : (editForm?.punjabiExplanation || "")} 
                        onChange={e => setEditForm({...editForm, [isHindiMode ? 'hindiExplanation' : 'punjabiExplanation']: e.target.value})} 
                        className="h-32 rounded-2xl bg-slate-50 border-none font-medium p-6 shadow-inner text-[#0F172A]" 
                     />
                  </div>
               </div>
            </div>
            <DialogFooter className="p-10 pt-6 bg-slate-50 flex gap-6 shrink-0">
               <Button variant="ghost" onClick={() => setEditingIndex(null)} className="h-16 px-10 font-black uppercase text-[11px] text-slate-400 tracking-widest">Discard Audit</Button>
               <Button onClick={handleSaveEdit} className="bg-[#0F172A] hover:bg-black text-white h-16 px-16 rounded-2xl font-black uppercase text-[11px] tracking-[0.2em] flex-1 shadow-2xl transition-all active:scale-95">
                  <CheckCircle2 className="h-5 w-5 mr-3" /> Apply Modifications
               </Button>
            </DialogFooter>
         </DialogContent>
      </Dialog>
    </div>
  )
}

function DebugIndicator({ label, active }: { label: string, active: boolean }) {
   return (
      <div className={cn(
         "px-2 py-0.5 rounded text-[7px] font-black uppercase tracking-tighter flex items-center gap-1 border",
         active ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-rose-50 text-rose-600 border-rose-100"
      )}>
         <div className={cn("h-1 w-1 rounded-full", active ? "bg-emerald-500" : "bg-rose-500")} />
         {label}
      </div>
   )
}
