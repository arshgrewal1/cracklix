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
  AlertTriangle,
  RefreshCw,
  Database,
  CloudOff,
  ChevronRight,
  Search
} from "lucide-react"
import { useCollection, useFirestore, useUser } from "@/firebase"
import { collection, doc, writeBatch, serverTimestamp, setDoc, query, orderBy, deleteDoc } from "firebase/firestore"
import { useToast } from "@/hooks/use-toast"
import { bulkParseMCQ } from "@/ai/flows/bulk-parse-ai"
import { aiManager } from "@/services/ai-manager"
import { Board, Subject, Exam } from "@/types"
import QuestionRenderer from "@/components/questions/QuestionRenderer"
import { cn } from "@/lib/utils"
import { AdminPageHeader } from "@/components/admin"
import { preprocessText, validateMCQSchema } from "@/lib/parser"

/**
 * @fileOverview Production AI Ingestion Center v12.0.
 * PIPELINE: Raw Text -> AI Parser (Gemini) -> Structured JSON -> Firestore.
 */

export default function BulkIngestionPage() {
  const router = useRouter()
  const db = useFirestore()
  const { user, profile } = useUser()
  const { toast } = useToast()
  
  const { data: boards } = useCollection<Board>(useMemo(() => (db ? query(collection(db, "boards"), orderBy("abbreviation", "asc")) : null), [db]))
  const { data: exams } = useCollection<Exam>(useMemo(() => (db ? collection(db, "exams") : null), [db]))
  const { data: subjects } = useCollection<Subject>(useMemo(() => (db ? query(collection(db, "subjects"), orderBy("name", "asc")) : null), [db]))

  const [metadata, setMetadata] = useState({
    boardId: "",
    examId: "",
    subjectId: "",
    difficulty: "Medium" as any,
  })

  const [rawText, setRawText] = useState("")
  const [stagedQuestions, setStagedQuestions] = useState<any[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)
  const [aiStatus, setAiStatus] = useState<'IDLE' | 'PROCESSING' | 'OFFLINE'>('IDLE')

  const handleAIIngest = async () => {
    if (!rawText.trim()) return
    if (!metadata.boardId || !metadata.subjectId) {
      toast({ variant: "destructive", title: "Config Blocked", description: "Select Board and Subject nodes first." })
      return
    }

    setIsProcessing(true)
    setAiStatus('PROCESSING')

    try {
      const sanitizedText = preprocessText(rawText);
      
      const result = await aiManager.execute('BULK_PARSE_AI', async () => {
         return await bulkParseMCQ({ 
           rawText: sanitizedText,
           examType: metadata.boardId 
         });
      });

      if (!result?.questions) throw new Error("Invalid response hub.");

      const mapped = result.questions.map((q: any, idx: number) => {
        const validationErrors = validateMCQSchema(q);
        return {
          ...q,
          // Adapt to internal Question interface for renderer
          englishQuestion: q.question_en,
          punjabiQuestion: q.question_pa,
          hindiQuestion: q.question_hi,
          optionAEnglish: q.optionA,
          optionBEnglish: q.optionB,
          optionCEnglish: q.optionC,
          optionDEnglish: q.optionD,
          correctAnswer: q.answer,
          englishExplanation: q.explanation_en,
          punjabiExplanation: q.explanation_pa,
          // Metadata
          ...metadata,
          id: `staged-${idx}-${Date.now()}`,
          status: 'PENDING_REVIEW',
          visibility: 'PUBLIC',
          questionType: 'MCQ',
          createdBy: profile?.name || "Admin",
          marks: 1,
          negativeMarks: 0.25,
          isValid: validationErrors.length === 0,
          validationErrors
        }
      });
      
      setStagedQuestions(mapped);
      toast({ title: "Extraction Success", description: `${mapped.length} nodes structured via AI.` });
    } catch (e: any) {
      console.error('[AI_INGEST_FAILURE]:', e);
      setAiStatus('OFFLINE');
      toast({ variant: "destructive", title: "AI Pipeline Error", description: e.message });
    } finally {
      setIsProcessing(false)
      setAiStatus('IDLE')
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
        const { id, isValid, validationErrors, ...finalData } = q;
        
        // Final mapping to requested storage schema
        const firestorePayload = {
          question_en: finalData.question_en || finalData.englishQuestion,
          question_pa: finalData.question_pa || finalData.punjabiQuestion || "",
          question_hi: finalData.question_hi || finalData.hindiQuestion || "",
          optionA: finalData.optionA || finalData.optionAEnglish,
          optionB: finalData.optionB || finalData.optionBEnglish,
          optionC: finalData.optionC || finalData.optionCEnglish,
          optionD: finalData.optionD || finalData.optionDEnglish,
          answer: finalData.answer || finalData.correctAnswer,
          explanation_en: finalData.explanation_en || finalData.englishExplanation || "",
          explanation_pa: finalData.explanation_pa || finalData.punjabiExplanation || "",
          subjectId: finalData.subjectId,
          boardId: finalData.boardId,
          examId: finalData.examId,
          difficulty: finalData.difficulty,
          status: 'PUBLISHED',
          diagram_required: !!finalData.diagram_required,
          diagram_caption: finalData.diagram_caption || "",
          table_data: finalData.table_data || "",
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        };

        batch.set(qRef, firestorePayload);
      });

      await batch.commit();
      toast({ title: "Registry Updated", description: `${valids.length} AI-extracted nodes committed.` });
      router.push("/admin/questions");
    } catch (e) {
      toast({ variant: "destructive", title: "Commit Failed" });
    } finally {
      setIsSyncing(false);
    }
  }

  return (
    <div className="space-y-6 md:space-y-12 pb-32 text-left animate-in fade-in duration-700 pt-2">
      
      <AdminPageHeader
        icon={Rocket}
        label="AI-Powered Ingestion Hub"
        title="Smart Bulk Import"
        subtitle="Holistic text-to-JSON pipeline using Gemini for high-fidelity extraction."
      >
        <div className="flex gap-4 w-full md:w-auto">
           <Button variant="outline" onClick={() => setStagedQuestions([])} className="h-12 md:h-14 px-8 rounded-xl border-slate-200 font-bold text-xs">Reset Hub</Button>
           <Button 
            onClick={handleFinalCommit} 
            disabled={isSyncing || stagedQuestions.filter(q => q.isValid).length === 0} 
            className="flex-1 md:w-auto h-12 md:h-14 px-10 bg-primary hover:bg-blue-700 text-white rounded-xl font-black uppercase text-[11px] tracking-widest gap-3 shadow-xl border-none active:scale-95"
           >
            {isSyncing ? <Loader2 className="h-5 w-5 animate-spin" /> : <Database className="h-5 w-5" />} Commit Bank
           </Button>
        </div>
      </AdminPageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 px-1">
        
        {/* INPUT PANEL */}
        <div className="lg:col-span-5 xl:col-span-4 space-y-6">
           <Card className="border-none shadow-xl rounded-[2rem] bg-white p-6 md:p-10 space-y-8 border border-slate-50">
              <div className="space-y-8">
                 <div className="flex items-center justify-between border-b border-slate-50 pb-4">
                    <div className="flex items-center gap-4">
                       <Settings className="h-5 w-5 text-primary" />
                       <h3 className="font-black text-lg uppercase text-[#0F172A]">Target Context</h3>
                    </div>
                    {aiStatus === 'PROCESSING' && (
                       <Badge className="animate-pulse gap-1.5 h-6 bg-blue-50 text-blue-600 border-none"><Loader2 className="h-3 w-3 animate-spin" /> AI Active</Badge>
                    )}
                 </div>
                 
                 <div className="space-y-5">
                    <div className="space-y-2">
                       <Label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-wider">Authority Board</Label>
                       <Select value={metadata.boardId} onValueChange={v => setMetadata({...metadata, boardId: v})}>
                          <SelectTrigger className="h-12 md:h-14 bg-slate-50 border-none rounded-xl font-bold shadow-inner px-5"><SelectValue placeholder="Select Board Hub" /></SelectTrigger>
                          <SelectContent className="bg-[#0B1528] text-white border-white/10">
                             {boards?.map(b => <SelectItem key={b.id} value={b.id}>{b.abbreviation} HUB</SelectItem>)}
                          </SelectContent>
                       </Select>
                    </div>
                    <div className="space-y-2">
                       <Label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-wider">Exam Vertical</Label>
                       <Select value={metadata.examId} onValueChange={v => setMetadata({...metadata, examId: v})}>
                          <SelectTrigger className="h-12 md:h-14 bg-slate-50 border-none rounded-xl font-bold shadow-inner px-5"><SelectValue placeholder="Select Exam Vertical" /></SelectTrigger>
                          <SelectContent className="bg-[#0B1528] text-white border-white/10">
                             {exams?.filter(e => e.boardId === metadata.boardId).map(e => <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>)}
                          </SelectContent>
                       </Select>
                    </div>
                    <div className="space-y-2">
                       <Label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-wider">Canonical Subject</Label>
                       <Select value={metadata.subjectId} onValueChange={v => setMetadata({...metadata, subjectId: v})}>
                          <SelectTrigger className="h-12 md:h-14 bg-slate-50 border-none rounded-xl font-bold shadow-inner px-5"><SelectValue placeholder="Select Subject Node" /></SelectTrigger>
                          <SelectContent className="bg-[#0B1528] text-white border-white/10 max-h-80">
                             {subjects?.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                          </SelectContent>
                       </Select>
                    </div>
                 </div>
              </div>

              <div className="space-y-6 pt-6 border-t border-slate-50">
                 <Label className="text-[10px] font-black uppercase text-slate-400 flex items-center justify-between ml-1 tracking-wider">
                    Raw Stream (Entire Document)
                    <Badge variant="outline" className="text-[8px] border-blue-100 bg-blue-50 text-blue-600 font-black">AI-FIRST</Badge>
                 </Label>
                 <Textarea 
                    value={rawText}
                    onChange={e => setQuery(e.target.value)}
                    placeholder="Paste entire PDF content, WhatsApp text, or OCR blocks here..."
                    className="min-h-[400px] md:min-h-[500px] rounded-2xl bg-slate-50 border-none p-6 font-medium text-sm md:text-base leading-relaxed shadow-inner resize-none focus-visible:ring-primary/10"
                    onChange={(e) => setRawText(e.target.value)}
                 />
                 <Button onClick={handleAIIngest} disabled={isProcessing} className="w-full h-14 md:h-16 bg-[#0F172A] hover:bg-black text-white font-black uppercase tracking-[0.2em] text-[10px] md:text-xs rounded-xl shadow-xl gap-4 active:scale-95 transition-all border-none">
                    {isProcessing ? <Loader2 className="h-5 w-5 animate-spin" /> : <Zap className="h-5 w-5 text-primary fill-current" />} Initialize AI Pipeline
                 </Button>
              </div>
           </Card>
        </div>

        {/* STAGING HUB */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-8">
           <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-5">
                 <Layers className="h-6 w-6 text-primary" />
                 <h3 className="text-xl md:text-3xl font-black text-[#0F172A] uppercase tracking-tight">Audit Registry</h3>
              </div>
              <Badge className="bg-[#0F172A] text-white border-none font-black text-[10px] px-4 py-1 rounded-lg shadow-lg">{stagedQuestions.length} Staged Nodes</Badge>
           </div>

           <div className="grid grid-cols-1 gap-6">
              {stagedQuestions.length > 0 ? stagedQuestions.map((q, idx) => (
                 <Card key={q.id} className={cn(
                    "border-none shadow-lg rounded-[2.5rem] bg-white overflow-hidden group border border-slate-100 relative transition-all duration-500",
                    !q.isValid && "ring-1 ring-rose-500/20"
                 )}>
                    <div className={cn("absolute top-0 left-0 w-1.5 h-full transition-all duration-700", q.isValid ? "bg-emerald-500" : "bg-rose-500")} />
                    
                    <CardHeader className="p-6 md:p-10 pb-0 flex flex-row items-center justify-between">
                       <div className="flex items-center gap-4">
                          <Badge className="bg-[#0B1228] text-white border-none font-black text-[9px] uppercase tracking-widest px-3 py-1 rounded-lg">AI Node #{idx + 1}</Badge>
                          {q.diagram_required && <Badge className="bg-blue-50 text-blue-600 border-none font-black text-[9px] uppercase px-2 py-0.5 rounded-lg">Diagram Required</Badge>}
                       </div>
                       <button onClick={() => setStagedQuestions(prev => prev.filter(item => item.id !== q.id))} className="h-8 w-8 bg-rose-50 text-rose-500 rounded-lg flex items-center justify-center active:scale-90 opacity-0 group-hover:opacity-100 transition-all"><Trash2 className="h-4 w-4" /></button>
                    </CardHeader>

                    <CardContent className="p-6 md:p-12 lg:p-16 pt-4">
                       {q.isValid ? (
                          <QuestionRenderer 
                             question={q} 
                             language="ENGLISH_PUNJABI" 
                             showSolution={true} 
                             className="p-0 shadow-none border-none max-w-none"
                          />
                       ) : (
                          <div className="space-y-6">
                             <div className="p-6 bg-rose-50 rounded-2xl border border-rose-100 space-y-4">
                                <div className="flex items-center gap-3 text-rose-600">
                                   <AlertTriangle className="h-5 w-5" />
                                   <h4 className="font-black text-sm uppercase tracking-widest">Incomplete Extraction</h4>
                                </div>
                                <div className="space-y-2">
                                   {q.validationErrors.map((err: string, i: number) => (
                                      <p key={i} className="text-[11px] font-bold text-rose-400 flex items-center gap-2">
                                        <div className="h-1 w-1 rounded-full bg-rose-300 shrink-0" /> {err}
                                      </p>
                                   ))}
                                </div>
                             </div>
                             <div className="space-y-2">
                                <Label className="text-[9px] font-black uppercase text-slate-400 tracking-wider ml-1">AI Output Node</Label>
                                <div className="p-6 bg-slate-50 rounded-2xl font-mono text-[10px] text-slate-500 border border-slate-100 shadow-inner max-h-40 overflow-y-auto">
                                   {JSON.stringify(q, null, 2)}
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
                       <p className="font-black text-3xl uppercase tracking-[0.4em]">Hub Empty</p>
                       <p className="text-sm font-bold uppercase tracking-widest text-primary">Awaiting AI Pipeline Initiation</p>
                    </div>
                 </div>
              )}
           </div>
        </div>
      </div>
    </div>
  )
}
