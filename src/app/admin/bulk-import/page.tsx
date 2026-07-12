"use client"

import React, { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
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
  ArrowUp
} from "lucide-react"
import { useCollection, useFirestore, useUser } from "@/firebase"
import { collection, doc, writeBatch, serverTimestamp, query, orderBy, updateDoc, increment } from "firebase/firestore"
import { useToast } from "@/hooks/use-toast"
import { Board, Subject } from "@/types"
import QuestionRenderer from "@/components/questions/QuestionRenderer"
import { cn } from "@/lib/utils"
import { AdminPageHeader } from "@/components/admin"
import { preprocessText, parseBulkQuestions, validateMCQSchema, ParserFormat, isQuestionStart } from "@/lib/parser"

const FORMATS: { label: string, value: ParserFormat }[] = [
  { label: "Current Affairs (English + Punjabi)", value: "CURRENT_AFFAIRS" },
  { label: "Simple Bilingual MCQ (Eng + Pun/Hin)", value: "BILINGUAL_MCQ" },
  { label: "English Only MCQ", value: "ENGLISH_ONLY" },
  { label: "Punjabi Only MCQ", value: "PUNJABI_ONLY" },
  { label: "Mathematics Hub", value: "MATHEMATICS" },
  { label: "Reasoning & Logic", value: "REASONING" },
  { label: "Diagram Based", value: "DIAGRAM" },
  { label: "Table Based", value: "TABLE" },
  { label: "Graph Based", value: "GRAPH" },
  { label: "Match the Following", value: "MATCHING" },
  { label: "Assertion & Reason", value: "ASSERTION" },
  { label: "Fill in the Blank", value: "FILL_BLANK" }
];

/**
 * @fileOverview Modular Industrial Ingestion Hub v46.1.
 * FIXED: Multi-line question text support in default parser.
 * FIXED: High-fidelity debug logging for ingestion tracing.
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
    secondaryLanguage: "punjabi" as "punjabi" | "hindi" | "english" | "punjabi_only" | "hindi_only",
    difficulty: "Medium" as any,
    parserFormat: "CURRENT_AFFAIRS" as ParserFormat
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
      console.log("[DEBUG_INGESTION] Selected Question Type:", metadata.parserFormat);
      
      const inputToParse = metadata.parserFormat === 'DIAGRAM' 
        ? rawText 
        : preprocessText(rawText);
      
      const lines = inputToParse.split('\n');
      console.log("[DEBUG_INGESTION] Total lines to process:", lines.length);

      const hasAnyQuestion = lines.some(line => isQuestionStart(line.trim()));
      console.log("[DEBUG_INGESTION] Any question marker found:", hasAnyQuestion);
      
      if (!hasAnyQuestion) {
         throw new Error("No questions detected. Please ensure your content uses supported markers like Q1, Q.1, or Question 1.");
      }

      const result = parseBulkQuestions(inputToParse, metadata);
      console.log("[DEBUG_INGESTION] Parser returned questions:", result?.questions?.length || 0);

      if (!result?.questions || result.questions.length === 0) {
         throw new Error("Parser failed to extract questions. Please verify your document structure.");
      }

      const validated = result.questions.map((q, idx) => {
         const { errors, warnings } = validateMCQSchema(q);
         if (errors.length > 0) {
            console.warn(`[DEBUG_INGESTION] Question #${idx + 1} validation failed:`, errors);
         }
         return {
            ...q,
            isValid: errors.length === 0,
            validationErrors: errors,
            validationWarnings: warnings,
            createdBy: profile?.name || "Administrator"
         }
      });
      
      setStagedQuestions(validated);
      toast({ title: "Extraction Complete", description: `${validated.length} nodes processed.` });
    } catch (e: any) {
      console.error("[DEBUG_INGESTION] FATAL ERROR:", e.message);
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

  const getRendererLanguage = (mode: string) => {
    switch(mode) {
      case 'punjabi': return "ENGLISH_PUNJABI";
      case 'hindi': return "ENGLISH_HINDI";
      case 'english': return "ENGLISH";
      case 'punjabi_only': return "PUNJABI";
      case 'hindi_only': return "HINDI";
      default: return "ENGLISH_PUNJABI";
    }
  }

  return (
    <div className="w-full max-w-[1600px] mx-auto space-y-8 pb-32 text-left animate-in fade-in duration-700 pt-2 px-4 md:px-12">
      
      <AdminPageHeader
        icon={ClipboardList}
        label="Modular Industrial Ingestion"
        title="MCQ Ingestion Hub"
        subtitle="Resilient extraction for English and Bilingual nodes."
      >
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto shrink-0">
           <button 
             onClick={() => setStagedQuestions([])} 
             className="h-12 md:h-14 px-6 rounded-xl border border-slate-200 font-bold text-[11px] uppercase tracking-tight shadow-sm bg-white hover:bg-slate-50 transition-all"
           >
             Reset Staging
           </button>
           <Button 
            onClick={handleLocalParse} 
            disabled={isProcessing} 
            className="flex-1 md:w-auto h-12 md:h-14 px-10 bg-[#0F172A] hover:bg-black text-white rounded-xl font-bold uppercase text-[11px] tracking-tight gap-3 shadow-xl border-none active:scale-95 transition-all"
           >
            {isProcessing ? <Loader2 className="h-5 w-5 animate-spin" /> : <Zap className="h-5 w-5 text-primary fill-current" />} Initialize Ingestion
           </Button>
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
        
        <div className="lg:col-span-5 space-y-8">
           <Card className="border-none shadow-2xl rounded-[2.5rem] bg-white p-6 md:p-10 space-y-10 border border-slate-50 overflow-hidden">
              <div className="space-y-8">
                 <div className="flex items-center gap-4 border-b border-slate-50 pb-6">
                    <Braces className="h-6 w-6 text-primary" />
                    <h3 className="font-bold text-xl uppercase text-[#0F172A]">Ingestion Logic</h3>
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

                 <div className="space-y-3">
                    <Label className="text-[9px] font-black uppercase text-slate-400 ml-1 flex items-center gap-2"><Globe className="h-3.5 w-3.5" /> Language Hub</Label>
                    <div className="flex overflow-x-auto no-scrollbar pb-2 gap-3 snap-x snap-mandatory">
                       {[
                         { id: 'punjabi', label: 'English + Punjabi' },
                         { id: 'hindi', label: 'English + Hindi' },
                         { id: 'english', label: 'English Only' },
                         { id: 'punjabi_only', label: 'Punjabi Only' },
                         { id: 'hindi_only', label: 'Hindi Only' }
                       ].map((item) => (
                          <button 
                            key={item.id}
                            onClick={() => setMetadata({...metadata, secondaryLanguage: item.id as any})}
                            className={cn(
                               "flex-shrink-0 min-w-[160px] h-12 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all border-2 snap-start", 
                               metadata.secondaryLanguage === item.id ? "bg-[#0F172A] border-[#0F172A] text-white shadow-lg" : "bg-white border-slate-100 text-slate-400 hover:border-primary/20"
                            )}
                          >
                             {item.label}
                          </button>
                       ))}
                    </div>
                 </div>
              </div>

              <div className="space-y-8 pt-8 border-t border-slate-50">
                 <div className="space-y-2">
                    <div className="flex items-center justify-between px-1">
                       <Label className="text-[10px] font-black uppercase text-slate-400">Raw Document Stream</Label>
                       <Badge variant="outline" className="bg-slate-50 text-[8px] border-slate-200">
                          Resilient Ingestion Active
                       </Badge>
                    </div>
                    <Textarea 
                        value={rawText}
                        onChange={(e) => setRawText(e.target.value)}
                        placeholder="Paste Q1 questions here..."
                        className="min-h-[400px] md:min-h-[500px] rounded-2xl bg-slate-50 border-none p-8 font-medium text-sm md:text-base leading-relaxed shadow-inner resize-none focus-visible:ring-primary/10 custom-scrollbar text-[#0F172A]"
                    />
                 </div>
                 
                 <Button 
                    onClick={handleLocalParse} 
                    disabled={isProcessing || !rawText.trim()} 
                    className="w-full h-16 bg-primary hover:bg-blue-700 text-white rounded-2xl font-black uppercase text-[11px] tracking-widest shadow-2xl gap-3 border-none active:scale-95 transition-all"
                 >
                    {isProcessing ? <Loader2 className="h-6 w-6 animate-spin" /> : <Zap className="h-6 w-6 text-white fill-current" />} Initialize Ingestion
                 </Button>
              </div>
           </Card>
        </div>

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
                    <div className={cn("absolute top-0 left-0 w-2 h-full transition-all duration-700", q.isValid ? "bg-emerald-50" : "bg-rose-50")} />
                    
                    <CardHeader className="p-6 md:p-10 pb-0 flex flex-row items-center justify-between">
                       <div className="flex items-center gap-4">
                          <Badge className="bg-[#0B1228] text-white border-none font-bold text-[9px] uppercase tracking-widest px-4 py-1.5 rounded-lg">Staged Node #{idx + 1}</Badge>
                       </div>
                       <button onClick={() => setStagedQuestions(prev => prev.filter(item => item.id !== q.id))} className="h-10 w-10 bg-rose-50 text-rose-500 rounded-xl flex items-center justify-center active:scale-90 transition-all"><Trash2 className="h-5 w-5" /></button>
                    </CardHeader>

                    <CardContent className="p-6 md:p-12 lg:p-16 pt-4">
                       {q.isValid ? (
                          <div className="space-y-10">
                             {q.validationWarnings?.length > 0 && (
                                <div className="p-6 bg-amber-50 rounded-2xl border border-amber-100 mb-8 flex items-start gap-4">
                                   <AlertTriangle className="h-6 w-6 text-amber-500 shrink-0 mt-1" />
                                   <div className="space-y-2">
                                      <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest">OCR Script Warnings</p>
                                      <ul className="space-y-1">
                                         {q.validationWarnings.map((w: string, i: number) => (
                                            <li key={i} className="text-[11px] font-bold text-amber-500 flex items-center gap-2">
                                               <div className="h-1 w-1 rounded-full bg-amber-400" /> {w}
                                            </li>
                                         ))}
                                      </ul>
                                   </div>
                                </div>
                             )}
                             <QuestionRenderer 
                                question={q} 
                                language={getRendererLanguage(metadata.secondaryLanguage)} 
                                showSolution={true} 
                                className="p-0 shadow-none border-none max-w-none"
                             />
                          </div>
                       ) : (
                          <div className="space-y-6 text-left">
                             <div className="p-8 bg-rose-50 rounded-[2rem] border border-rose-100 space-y-4 shadow-inner">
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
                       <p className="text-sm font-bold uppercase tracking-widest text-primary">Awaiting deterministic format parsing</p>
                    </div>
                 </div>
              )}
              
              {stagedQuestions.length > 5 && (
                 <div className="flex flex-col md:flex-row gap-4 pt-10">
                    <Button 
                       onClick={handleFinalCommit} 
                       disabled={isSyncing || stagedQuestions.filter(q => q.isValid).length === 0} 
                       className="flex-1 h-16 md:h-20 bg-primary hover:bg-blue-700 text-white rounded-3xl font-black uppercase text-[11px] tracking-widest gap-3 shadow-4xl border-none active:scale-95 transition-all"
                    >
                       {isSyncing ? <Loader2 className="h-6 w-6 animate-spin" /> : <CheckCircle2 className="h-6 w-6" />} Commit Verified Bank
                    </Button>
                    <button 
                      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                      className="h-16 md:h-20 px-8 rounded-3xl bg-slate-50 border border-slate-200 text-slate-400 hover:text-[#0F172A] transition-all flex items-center justify-center gap-2 font-black uppercase text-[9px] tracking-widest"
                    >
                      <ArrowUp className="h-4 w-4" /> Top
                    </button>
                 </div>
              )}
           </div>
        </div>
      </div>
    </div>
  )
}
