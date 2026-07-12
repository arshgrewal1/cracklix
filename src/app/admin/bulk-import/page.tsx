"use client"

import React, { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { 
  Loader2, 
  Trash2, 
  Database, 
  CheckCircle2, 
  ClipboardList, 
  Globe, 
  Braces, 
  Info, 
  Zap, 
  Layers,
  AlertTriangle,
  ArrowUp,
  FileBarChart,
  Target,
  PenLine,
  Languages
} from "lucide-react"
import { useCollection, useFirestore, useUser } from "@/firebase"
import { collection, doc, writeBatch, serverTimestamp, query, orderBy, updateDoc, increment } from "firebase/firestore"
import { useToast } from "@/hooks/use-toast"
import { Board, Subject } from "@/types"
import QuestionRenderer from "@/components/questions/QuestionRenderer"
import { cn } from "@/lib/utils"
import { AdminPageHeader } from "@/components/admin"
import { preprocessText, parseBulkQuestions, validateMCQSchema, type ParserFormat } from "@/lib/parser"

const FORMATS: { label: string, value: ParserFormat, icon: any }[] = [
  { label: "Current Affairs", value: "CURRENT_AFFAIRS", icon: Globe },
  { label: "Simple Bilingual", value: "BILINGUAL_MCQ", icon: Zap },
  { label: "English", value: "ENGLISH_ONLY", icon: Target },
  { label: "Punjabi", value: "PUNJABI_ONLY", icon: Target },
  { label: "Mathematics", value: "MATHEMATICS", icon: Braces },
  { label: "Reasoning", value: "REASONING", icon: ClipboardList },
  { label: "Diagram", value: "DIAGRAM", icon: Layers },
  { label: "Table", value: "TABLE", icon: Layers },
  { label: "Graph", value: "GRAPH", icon: FileBarChart },
  { label: "Match the Following", value: "MATCHING", icon: CheckCircle2 },
  { label: "Assertion & Reason", value: "ASSERTION", icon: AlertTriangle },
  { label: "Fill in the Blank", value: "FILL_BLANK", icon: PenLine }
];

const LANGUAGE_MODES = [
  { label: "English + Punjabi", value: "ENGLISH_PUNJABI" },
  { label: "English + Hindi", value: "ENGLISH_HINDI" },
  { label: "English Only", value: "ENGLISH" },
  { label: "Punjabi Only", value: "PUNJABI" },
  { label: "Hindi Only", value: "HINDI" }
];

/**
 * @fileOverview Institutional Bulk Ingestion Hub v48.0.
 * RESTORED: Multi-language mode selector (EN+PA, EN+HI, etc).
 */
export default function BulkIngestionPage() {
  const router = useRouter()
  const db = useFirestore()
  const { profile } = useUser()
  const { toast } = useToast()
  
  const { data: boards } = useCollection<Board>(useMemo(() => (db ? query(collection(db, "boards"), orderBy("abbreviation", "asc")) : null), [db]))
  const { data: subjects } = useCollection<Subject>(useMemo(() => (db ? query(collection(db, "subjects"), orderBy("name", "asc")) : null), [db]))

  const [metadata, setMetadata] = useState({
    boardId: "",
    subjectId: "",
    languageMode: "ENGLISH_PUNJABI",
    difficulty: "Medium" as any,
    parserFormat: "BILINGUAL_MCQ" as ParserFormat
  })

  const [rawText, setRawText] = useState("")
  const [stagedQuestions, setStagedQuestions] = useState<any[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)

  const handleLocalParse = () => {
    if (!rawText.trim()) return
    if (!metadata.boardId || !metadata.subjectId) {
      toast({ variant: "destructive", title: "Audit Blocked", description: "Select Board and Subject first." })
      return
    }

    setIsProcessing(true)
    try {
      const needsRawInput = ['DIAGRAM', 'MATCHING', 'TABLE', 'GRAPH', 'ASSERTION'].includes(metadata.parserFormat);
      const inputToParse = needsRawInput ? rawText : preprocessText(rawText);
      
      const result = parseBulkQuestions(inputToParse, {
         ...metadata,
         // Map legacy internal keys for parser compatibility
         secondaryLanguage: metadata.languageMode.includes('HINDI') ? 'hindi' : 'punjabi'
      });

      if (!result?.questions || result.questions.length === 0) {
         throw new Error("No questions detected. Verify formatting and question markers.");
      }

      const validated = result.questions.map((q: any) => {
         const { errors, warnings } = validateMCQSchema(q);
         return {
            ...q,
            language: metadata.languageMode,
            isValid: errors.length === 0,
            validationErrors: errors,
            validationWarnings: warnings,
            createdBy: profile?.name || "Administrator"
         }
      });
      
      setStagedQuestions(validated);
      toast({ title: "Extraction Complete", description: `${validated.length} nodes processed.` });
    } catch (e: any) {
      toast({ variant: "destructive", title: "Parsing Error", description: e.message });
    } finally {
      setIsProcessing(false)
    }
  }

  const handleFinalCommit = async () => {
    const valids = stagedQuestions.filter(q => q.isValid);
    if (valids.length === 0 || !db) return;

    setIsSyncing(true);
    const batch = writeBatch(db);

    try {
      valids.forEach(q => {
        const qRef = doc(collection(db, "questions"));
        const { isValid, validationErrors, validationWarnings, ...finalData } = q;
        batch.set(qRef, { 
          ...finalData, 
          status: 'PUBLISHED', 
          createdAt: serverTimestamp(), 
          updatedAt: serverTimestamp() 
        });
      });

      await batch.commit();
      await updateDoc(doc(db, 'settings', 'stats'), { totalQuestions: increment(valids.length), updatedAt: serverTimestamp() }).catch(() => {});
      toast({ title: "Registry Updated", description: "All valid nodes committed to bank." });
      router.push("/admin/questions");
    } catch (e) {
      toast({ variant: "destructive", title: "Commit Failed" });
    } finally {
      setIsSyncing(false);
    }
  }

  return (
    <div className="w-full max-w-[1600px] mx-auto space-y-8 pb-32 text-left animate-in fade-in duration-700 pt-2 px-4 md:px-12">
      <AdminPageHeader
        icon={ClipboardList}
        label="Modular Ingestion Hub"
        title="MCQ Ingestion"
        subtitle="Dedicated extraction for 12 preparation formats."
      >
        <div className="flex items-center gap-3">
           <button onClick={() => setStagedQuestions([])} className="h-12 px-6 rounded-xl border border-slate-200 font-bold text-[11px] uppercase bg-white hover:bg-slate-50">Reset</button>
           <Button onClick={handleLocalParse} disabled={isProcessing} className="bg-[#0F172A] hover:bg-black text-white rounded-xl h-12 px-8 font-bold uppercase text-[11px] gap-3 shadow-xl">
            {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4 text-primary fill-current" />} Parse
           </Button>
           <Button onClick={handleFinalCommit} disabled={isSyncing || stagedQuestions.filter(q => q.isValid).length === 0} className="bg-primary hover:bg-blue-700 text-white rounded-xl h-12 px-8 font-bold uppercase text-[11px] gap-3 shadow-xl">
            {isSyncing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Database className="h-4 w-4" />} Commit
           </Button>
        </div>
      </AdminPageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-5 space-y-8">
           <Card className="border-none shadow-2xl rounded-[2.5rem] bg-white p-6 md:p-10 space-y-8 border border-slate-50">
              <div className="space-y-6">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Question Format</Label>
                        <Select value={metadata.parserFormat} onValueChange={(v: ParserFormat) => setMetadata({...metadata, parserFormat: v})}>
                        <SelectTrigger className="h-12 bg-slate-50 border-none rounded-xl font-bold px-4">
                            <SelectValue placeholder="Format" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#0B1528] text-white border-white/10">
                            {FORMATS.map(f => (
                                <SelectItem key={f.value} value={f.value} className="py-2">
                                    <div className="flex items-center gap-2">
                                        <f.icon className="h-3.5 w-3.5 text-primary" />
                                        <span>{f.label}</span>
                                    </div>
                                </SelectItem>
                            ))}
                        </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Language Mode</Label>
                        <Select value={metadata.languageMode} onValueChange={(v) => setMetadata({...metadata, languageMode: v})}>
                        <SelectTrigger className="h-12 bg-slate-50 border-none rounded-xl font-bold px-4">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-[#0B1528] text-white border-white/10">
                            {LANGUAGE_MODES.map(m => (
                                <SelectItem key={m.value} value={m.value} className="py-2">
                                    <div className="flex items-center gap-2">
                                        <Languages className="h-3.5 w-3.5 text-primary" />
                                        <span>{m.label}</span>
                                    </div>
                                </SelectItem>
                            ))}
                        </SelectContent>
                        </Select>
                    </div>
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                       <Label className="text-[9px] font-black uppercase text-slate-400 ml-1">Board Hub</Label>
                       <Select value={metadata.boardId} onValueChange={v => setMetadata({...metadata, boardId: v})}>
                          <SelectTrigger className="h-12 bg-slate-50 border-none rounded-xl font-bold"><SelectValue placeholder="Board" /></SelectTrigger>
                          <SelectContent className="bg-[#0B1528] text-white">{boards?.map(b => <SelectItem key={b.id} value={b.id}>{b.abbreviation}</SelectItem>)}</SelectContent>
                       </Select>
                    </div>
                    <div className="space-y-2">
                       <Label className="text-[9px] font-black uppercase text-slate-400 ml-1">Subject Node</Label>
                       <Select value={metadata.subjectId} onValueChange={v => setMetadata({...metadata, subjectId: v})}>
                          <SelectTrigger className="h-12 bg-slate-50 border-none rounded-xl font-bold"><SelectValue placeholder="Subject" /></SelectTrigger>
                          <SelectContent className="bg-[#0B1528] text-white">{subjects?.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
                       </Select>
                    </div>
                 </div>

                 <Textarea 
                    value={rawText} 
                    onChange={(e) => setRawText(e.target.value)} 
                    placeholder="Paste text blocks from PDF/Docs here..." 
                    className="min-h-[400px] rounded-2xl bg-slate-50 border-none p-6 font-medium text-sm shadow-inner resize-none" 
                 />

                 <Button onClick={handleLocalParse} disabled={isProcessing || !rawText.trim()} className="w-full h-16 bg-primary hover:bg-blue-700 text-white rounded-2xl font-black uppercase text-[11px] tracking-widest shadow-2xl gap-3 active:scale-95 transition-all">
                    {isProcessing ? <Loader2 className="h-6 w-6 animate-spin" /> : <Zap className="h-6 w-6 text-white fill-current" />} Initialize Ingestion
                 </Button>
              </div>
           </Card>
        </div>

        <div className="lg:col-span-7 space-y-6">
           <div className="flex items-center justify-between px-2">
              <h3 className="text-xl font-black text-[#0F172A] uppercase flex items-center gap-4"><Layers className="h-6 w-6 text-primary" /> Staging Hub</h3>
              <Badge className="bg-[#0F172A] text-white border-none font-bold text-[10px] px-4 py-1.5 rounded-lg">{stagedQuestions.length} Nodes</Badge>
           </div>
           <div className="space-y-6">
              {stagedQuestions.map((q, idx) => (
                 <Card key={q.id} className="border-none shadow-lg rounded-[2.5rem] bg-white overflow-hidden border border-slate-100 relative">
                    <div className={cn("absolute top-0 left-0 w-2 h-full", q.isValid ? "bg-emerald-500" : "bg-rose-500")} />
                    <CardHeader className="p-6 md:p-10 pb-0 flex flex-row items-center justify-between">
                       <Badge className="bg-[#0B1228] text-white border-none font-bold text-[9px] uppercase px-4 py-1.5 rounded-lg">Staged Node #{idx + 1}</Badge>
                       <button onClick={() => setStagedQuestions(prev => prev.filter(item => item.id !== q.id))} className="h-8 w-8 text-rose-500 hover:bg-rose-50 rounded-lg flex items-center justify-center transition-all"><Trash2 className="h-4 w-4" /></button>
                    </CardHeader>
                    <CardContent className="p-6 md:p-10 pt-4">
                       {q.isValid ? (
                          <QuestionRenderer question={q} language={metadata.languageMode} showSolution={true} className="p-0 shadow-none border-none max-w-none" />
                       ) : (
                          <div className="p-6 bg-rose-50 rounded-2xl border border-rose-100 space-y-3">
                             <h4 className="font-bold text-rose-600 flex items-center gap-2 uppercase text-[10px]"><AlertTriangle className="h-4 w-4" /> Structural Violation</h4>
                             <div className="space-y-1">
                                {q.validationErrors.map((err: string, i: number) => <p key={i} className="text-[11px] font-bold text-rose-400">● {err}</p>)}
                             </div>
                          </div>
                       )}
                    </CardContent>
                 </Card>
              ))}
              {stagedQuestions.length === 0 && (
                 <div className="h-96 flex flex-col items-center justify-center text-slate-300 opacity-20 bg-slate-50 rounded-[4rem] border-2 border-dashed border-slate-200">
                    <Info className="h-16 w-16 mb-4" />
                    <p className="font-black uppercase tracking-widest">Awaiting Extraction</p>
                 </div>
              )}
           </div>
        </div>
      </div>
    </div>
  )
}
