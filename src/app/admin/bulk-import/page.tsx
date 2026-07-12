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
  Rocket, 
  Zap, 
  Layers, 
  Settings, 
  Database,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  Globe,
  Info,
  Braces,
  X,
  Image as ImageIcon,
  Table as TableIcon
} from "lucide-react"
import { useCollection, useFirestore, useUser } from "@/firebase"
import { collection, doc, writeBatch, serverTimestamp, query, orderBy, updateDoc, increment } from "firebase/firestore"
import { useToast } from "@/hooks/use-toast"
import { Board, Subject } from "@/types"
import QuestionRenderer from "@/components/questions/QuestionRenderer"
import { cn } from "@/lib/utils"
import { AdminPageHeader } from "@/components/admin"
import { preprocessText, parseBulkQuestions, validateMCQSchema, ParserFormat } from "@/lib/parser"

/**
 * @fileOverview Modular Industrial Ingestion Hub v61.0.
 * FIXED: Hydration error resolved by replacing p with div in error list.
 * UPDATED: Implemented Industrial Table Data Parser with structural row-column extraction.
 */

const FORMATS: { label: string, value: ParserFormat }[] = [
  { label: "Bilingual MCQ (Eng+Pun/Hin)", value: "BILINGUAL_MCQ" },
  { label: "Current Affairs (Bilingual)", value: "CURRENT_AFFAIRS" },
  { label: "English Only MCQ", value: "ENGLISH_ONLY" },
  { label: "Punjabi Only MCQ", value: "PUNJABI_ONLY" },
  { label: "Mathematics Hub", value: "MATHEMATICS" },
  { label: "Diagram / Image Based", value: "DIAGRAM" },
  { label: "Table Based Hub", value: "TABLE" },
  { label: "Reasoning & Logic", value: "REASONING" },
  { label: "Match the Following", value: "MATCHING" },
  { label: "Assertion & Reason", value: "ASSERTION" }
];

export default function BulkIngestionPage() {
  const router = useRouter()
  const db = useFirestore()
  const { user, profile } = useUser()
  const { toast } = useToast()
  
  const { data: boards } = useCollection<Board>(useMemo(() => (db ? query(collection(db, "boards"), orderBy("abbreviation", "asc")) : null), [db]))
  const { data: subjects } = useCollection<Subject>(useMemo(() => (db ? query(collection(db, "subjects"), orderBy("name", "asc")) : null), [db]))

  const [metadata, setMetadata] = useState({
    boardId: "",
    subjectId: "",
    secondaryLanguage: "punjabi",
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
      const sanitizedText = preprocessText(rawText);
      const result = parseBulkQuestions(sanitizedText, metadata);

      if (!result?.questions || result.questions.length === 0) {
         throw new Error("No questions detected. Ensure each question block starts with Q1, Q2, etc.");
      }

      const validated = result.questions.map(q => {
         const validationErrors = validateMCQSchema(q);
         return {
            ...q,
            isValid: validationErrors.length === 0,
            validationErrors,
            createdBy: profile?.name || "Administrator"
         }
      });
      
      setStagedQuestions(validated);
      toast({ title: "Parsing Success", description: `${validated.length} nodes structured locally.` });
    } catch (e: any) {
      toast({ variant: "destructive", title: "Parsing Error", description: e.message });
    } finally {
      setIsProcessing(false)
    }
  }

  const handleFinalCommit = async () => {
    const valids = stagedQuestions.filter(q => q.isValid);
    if (valids.length === 0 || !db || !user) return;

    setIsSyncing(true);
    const batch = writeBatch(db);

    try {
      valids.forEach(q => {
        const qRef = doc(collection(db, "questions"));
        const { isValid, validationErrors, ...finalData } = q;
        
        batch.set(qRef, {
          ...finalData,
          status: 'PUBLISHED',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      });

      await batch.commit();

      await updateDoc(doc(db, 'settings', 'stats'), {
         totalQuestions: increment(valids.length),
         updatedAt: serverTimestamp()
      }).catch(() => {});

      toast({ title: "Registry Updated", description: `${valids.length} nodes committed.` });
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
        label="Modular Industrial Ingestion"
        title="MCQ Ingestion Hub"
        subtitle="Zero AI dependency. Dedicated local strategies for Current Affairs, Math and Table data."
      >
        <div className="flex gap-4 w-full md:w-auto shrink-0">
           <Button variant="outline" onClick={() => setStagedQuestions([])} className="h-12 md:h-14 px-8 rounded-xl border-slate-200 font-bold text-xs shadow-sm bg-white hover:bg-slate-50">Reset Staging</Button>
           <Button 
            onClick={handleFinalCommit} 
            disabled={isSyncing || stagedQuestions.filter(q => q.isValid).length === 0} 
            className="flex-1 md:w-auto h-12 md:h-14 px-10 bg-primary hover:bg-blue-700 text-white rounded-xl font-bold uppercase text-[11px] tracking-tight gap-3 shadow-xl border-none active:scale-95 transition-all"
           >
            {isSyncing ? <Loader2 className="h-5 w-5 animate-spin" /> : <Database className="h-5 w-5" />} Commit Bank
           </Button>
        </div>
      </AdminPageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12">
        
        {/* INPUT PANEL */}
        <div className="lg:col-span-5 space-y-8">
           <Card className="border-none shadow-2xl rounded-[2.5rem] bg-white p-6 md:p-10 space-y-10 border border-slate-50 overflow-hidden">
              <div className="space-y-8">
                 <div className="flex items-center gap-4 border-b border-slate-50 pb-6">
                    <Braces className="h-6 w-6 text-primary" />
                    <h3 className="font-bold text-xl uppercase text-[#0F172A]">Parser Strategy</h3>
                 </div>

                 <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Ingestion Format Node</Label>
                    <Select value={metadata.parserFormat} onValueChange={(v: ParserFormat) => setMetadata({...metadata, parserFormat: v})}>
                       <SelectTrigger className="h-14 bg-blue-50 border-none rounded-xl font-black text-primary px-5 shadow-inner">
                          <SelectValue placeholder="Select Format Strategy" />
                       </SelectTrigger>
                       <SelectContent className="bg-[#0B1528] text-white border-white/10 max-h-80">
                          {FORMATS.map(f => <SelectItem key={f.value} value={f.value} className="focus:bg-primary/20">{f.label}</SelectItem>)}
                       </SelectContent>
                    </Select>
                 </div>
                 
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="space-y-2">
                       <Label className="text-[9px] font-black uppercase text-slate-400 ml-1">Board hub</Label>
                       <Select value={metadata.boardId} onValueChange={v => setMetadata({...metadata, boardId: v})}>
                          <SelectTrigger className="h-14 bg-slate-50 border-none rounded-xl font-bold px-5 shadow-inner text-[#0F172A]"><SelectValue placeholder="Board Hub" /></SelectTrigger>
                          <SelectContent className="bg-[#0B1528] text-white border-white/10">
                             {boards?.map(b => <SelectItem key={b.id} value={b.id}>{b.abbreviation} Hub</SelectItem>)}
                          </SelectContent>
                       </Select>
                    </div>
                    <div className="space-y-2">
                       <Label className="text-[9px] font-black uppercase text-slate-400 ml-1">Subject node</Label>
                       <Select value={metadata.subjectId} onValueChange={v => setMetadata({...metadata, subjectId: v})}>
                          <SelectTrigger className="h-14 bg-slate-50 border-none rounded-xl font-bold px-5 shadow-inner text-[#0F172A]"><SelectValue placeholder="Subject Node" /></SelectTrigger>
                          <SelectContent className="bg-[#0B1528] text-white border-white/10 max-h-80">
                             {subjects?.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                          </SelectContent>
                       </Select>
                    </div>
                 </div>

                 <div className="space-y-2">
                    <Label className="text-[9px] font-black uppercase text-slate-400 ml-1 flex items-center gap-2"><Globe className="h-3 w-3" /> Language Hub</Label>
                    <div className="flex gap-3">
                       <button 
                         onClick={() => setMetadata({...metadata, secondaryLanguage: 'punjabi'})}
                         className={cn("flex-1 h-12 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all border-2", metadata.secondaryLanguage === 'punjabi' ? "bg-[#0F172A] border-[#0F172A] text-white shadow-lg" : "bg-white border-slate-100 text-slate-400 hover:border-primary/20")}
                       >English + Punjabi</button>
                       <button 
                         onClick={() => setMetadata({...metadata, secondaryLanguage: 'hindi'})}
                         className={cn("flex-1 h-12 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all border-2", metadata.secondaryLanguage === 'hindi' ? "bg-[#0F172A] border-[#0F172A] text-white shadow-lg" : "bg-white border-slate-100 text-slate-400 hover:border-primary/20")}
                       >English + Hindi</button>
                    </div>
                 </div>
              </div>

              <div className="space-y-8 pt-8 border-t border-slate-50">
                 <div className="space-y-2">
                    <div className="flex items-center justify-between px-1">
                       <Label className="text-[10px] font-black uppercase text-slate-400">Raw Document Stream</Label>
                       <Badge variant="outline" className="bg-slate-50 text-[8px] border-slate-200">Local Sanitization Active</Badge>
                    </div>
                    <Textarea 
                        value={rawText}
                        onChange={(e) => setRawText(e.target.value)}
                        placeholder="Paste question blocks with math or table markers here..."
                        className="min-h-[850px] rounded-2xl bg-slate-50 border-none p-8 font-medium text-sm md:text-base leading-relaxed shadow-inner resize-none focus-visible:ring-primary/10 custom-scrollbar text-[#0F172A]"
                    />
                 </div>

                 <Button 
                    onClick={handleLocalParse} 
                    disabled={isProcessing} 
                    className="w-full h-14 bg-[#0F172A] hover:bg-black text-white font-black uppercase text-[11px] rounded-xl shadow-2xl gap-4 active:scale-95 transition-all border-none px-12"
                 >
                    {isProcessing ? <Loader2 className="h-5 w-5 animate-spin" /> : <Zap className="h-5 w-5 text-primary fill-current" />} 
                    Initialize Ingestion Pipeline
                 </Button>
              </div>
           </Card>
        </div>

        {/* STAGING AREA */}
        <div className="lg:col-span-7 space-y-8">
           <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-5">
                 <Layers className="h-6 w-6 text-primary" />
                 <h3 className="text-xl md:text-3xl font-black text-[#0F172A] uppercase tracking-tight">Audit Staging</h3>
              </div>
              <Badge className="bg-[#0F172A] text-white border-none font-bold text-[10px] px-5 py-2 rounded-xl shadow-lg">{stagedQuestions.length} Staged Nodes</Badge>
           </div>

           <div className="grid grid-cols-1 gap-6">
              {stagedQuestions.length > 0 ? stagedQuestions.map((q, idx) => (
                 <Card key={q.id} className={cn(
                    "border-none shadow-lg rounded-[2.5rem] bg-white overflow-hidden group border border-slate-100 relative transition-all duration-500",
                    !q.isValid && "ring-1 ring-rose-500/20"
                 )}>
                    <div className={cn("absolute top-0 left-0 w-2 h-full transition-all duration-700", q.isValid ? "bg-emerald-500" : "bg-rose-500")} />
                    
                    <CardHeader className="p-6 md:p-10 pb-0 flex flex-row items-center justify-between">
                       <div className="flex items-center gap-4">
                          <Badge className="bg-[#0B1228] text-white border-none font-bold text-[9px] uppercase tracking-widest px-4 py-1.5 rounded-lg">Staged Node #{idx + 1}</Badge>
                          {q.diagram_required && (
                             <Badge className="bg-amber-50 text-amber-600 border-none text-[8px] font-black uppercase px-3 py-1 rounded shadow-sm flex items-center gap-2">
                                <ImageIcon className="h-3 w-3" /> Asset Map Required
                             </Badge>
                          )}
                          {q.table_data && (
                             <Badge className="bg-blue-50 text-blue-600 border-none text-[8px] font-black uppercase px-3 py-1 rounded shadow-sm flex items-center gap-2">
                                <TableIcon className="h-3 w-3" /> Table Structure
                             </Badge>
                          )}
                       </div>
                       <button onClick={() => setStagedQuestions(prev => prev.filter(item => item.id !== q.id))} className="h-10 w-10 bg-rose-50 text-rose-500 rounded-xl flex items-center justify-center active:scale-90 transition-all"><Trash2 className="h-5 w-5" /></button>
                    </CardHeader>

                    <CardContent className="p-6 md:p-12 lg:p-16 pt-4">
                       {q.isValid ? (
                          <div className="space-y-10">
                             {q.diagram_required && (
                                <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex items-center gap-4">
                                   <div className="h-10 w-10 bg-white rounded-xl flex items-center justify-center text-amber-500 shadow-sm"><ImageIcon className="h-5 w-5" /></div>
                                   <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">{q.diagram_caption}</p>
                                </div>
                             )}
                             <QuestionRenderer 
                                question={q} 
                                language={metadata.secondaryLanguage === 'punjabi' ? "ENGLISH_PUNJABI" : "ENGLISH_HINDI"} 
                                showSolution={true} 
                                className="p-0 shadow-none border-none max-w-none"
                             />
                          </div>
                       ) : (
                          <div className="space-y-6">
                             <div className="p-8 bg-rose-50 rounded-[2rem] border border-rose-100 space-y-4 shadow-inner text-left">
                                <h4 className="font-bold text-base uppercase tracking-widest text-rose-600 flex items-center gap-2"><Info className="h-4 w-4" /> Structural Violation</h4>
                                <div className="space-y-2">
                                   {q.validationErrors.map((err: string, i: number) => (
                                      <div key={i} className="text-sm font-bold text-rose-400 flex items-center gap-2">
                                        <div className="h-1.5 w-1.5 rounded-full bg-rose-300 shrink-0" /> 
                                        <span>{err}</span>
                                      </div>
                                   ))}
                                </div>
                             </div>
                          </div>
                       )}
                    </CardContent>
                 </Card>
              )) : (
                 <div className="py-60 flex flex-col items-center justify-center text-slate-300 opacity-20 space-y-10 text-center border-2 border-dashed border-slate-200 rounded-[3rem] mx-2">
                    <Database className="h-24 w-24" />
                    <div className="space-y-2">
                       <p className="font-bold text-3xl uppercase tracking-[0.4em]">Staging Hub Empty</p>
                       <p className="text-sm font-bold uppercase tracking-widest text-primary">Awaiting specialized format parsing</p>
                    </div>
                 </div>
              )}
           </div>
        </div>
      </div>
    </div>
  )
}
