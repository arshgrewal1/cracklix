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
  Database,
  CheckCircle2,
  ChevronRight
} from "lucide-react"
import { useCollection, useFirestore, useUser } from "@/firebase"
import { collection, doc, writeBatch, serverTimestamp, query, orderBy } from "firebase/firestore"
import { useToast } from "@/hooks/use-toast"
import { bulkParseMCQ } from "@/ai/flows/bulk-parse-ai"
import { aiManager } from "@/services/ai-manager"
import { Board, Subject } from "@/types"
import QuestionRenderer from "@/components/questions/QuestionRenderer"
import { cn } from "@/lib/utils"
import { AdminPageHeader } from "@/components/admin"
import { preprocessText, validateMCQSchema } from "@/lib/parser"

/**
 * @fileOverview Production AI Ingestion Center v32.0.
 * FIXED: Resolved modelSupply error in isolated Genkit calls.
 * FIXED: Optimized desktop grid scaling and button fidelity.
 */

export default function BulkIngestionPage() {
  const router = useRouter()
  const db = useFirestore()
  const { user, profile } = useUser()
  const { toast } = useToast()
  
  const { data: boards } = useCollection<Board>(useMemo(() => (db ? query(collection(db, "boards"), orderBy("abbreviation", "asc")) : null), [db]))
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
      toast({ variant: "destructive", title: "Audit Blocked", description: "Select Board and Subject nodes first." })
      return
    }

    setIsProcessing(true)
    setAiStatus('PROCESSING')

    try {
      const sanitizedText = preprocessText(rawText);
      
      const result = await aiManager.execute('BULK_PARSE_AI', async (apiKey) => {
         return await bulkParseMCQ({ 
           rawText: sanitizedText,
           examType: metadata.boardId,
           apiKey 
         });
      });

      if (!result?.questions) throw new Error("AI extraction failed to return structured data.");

      const mapped = result.questions.map((q: any, idx: number) => {
        const validationErrors = validateMCQSchema(q);
        return {
          ...q,
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
      toast({ title: "Extraction Success", description: `${mapped.length} nodes structured.` });
    } catch (e: any) {
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
        
        batch.set(qRef, {
          ...finalData,
          status: 'PUBLISHED',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      });

      await batch.commit();
      toast({ title: "Registry Updated", description: `${valids.length} nodes committed.` });
      router.push("/admin/questions");
    } catch (e) {
      toast({ variant: "destructive", title: "Commit Failed" });
    } finally {
      setIsSyncing(false);
    }
  }

  return (
    <div className="w-full max-w-[1600px] mx-auto space-y-8 pb-32 text-left animate-in fade-in duration-700 pt-2 px-4 md:px-8">
      
      <AdminPageHeader
        icon={Rocket}
        label="Enterprise AI Ingestion Hub"
        title="Smart Bulk Import"
        subtitle="Holistic document extraction using rotated Gemini nodes pool."
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
              <div className="space-y-6">
                 <div className="flex items-center justify-between border-b border-slate-50 pb-6">
                    <div className="flex items-center gap-4">
                       <Settings className="h-6 w-6 text-primary" />
                       <h3 className="font-bold text-xl uppercase text-[#0F172A]">Registry Target</h3>
                    </div>
                    {aiStatus === 'PROCESSING' && (
                       <Badge className="animate-pulse gap-1.5 h-7 bg-blue-50 text-blue-600 border-none px-3"><Loader2 className="h-3.5 w-3.5 animate-spin" /> AI Pool Active</Badge>
                    )}
                 </div>
                 
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="space-y-2">
                       <Select value={metadata.boardId} onValueChange={v => setMetadata({...metadata, boardId: v})}>
                          <SelectTrigger className="h-14 bg-slate-50 border-none rounded-xl font-bold px-5 shadow-inner text-[#0F172A]"><SelectValue placeholder="Board Hub" /></SelectTrigger>
                          <SelectContent className="bg-[#0B1528] text-white border-white/10">
                             {boards?.map(b => <SelectItem key={b.id} value={b.id}>{b.abbreviation} Hub</SelectItem>)}
                          </SelectContent>
                       </Select>
                    </div>
                    <div className="space-y-2">
                       <Select value={metadata.subjectId} onValueChange={v => setMetadata({...metadata, subjectId: v})}>
                          <SelectTrigger className="h-14 bg-slate-50 border-none rounded-xl font-bold px-5 shadow-inner text-[#0F172A]"><SelectValue placeholder="Subject Node" /></SelectTrigger>
                          <SelectContent className="bg-[#0B1528] text-white border-white/10 max-h-80">
                             {subjects?.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                          </SelectContent>
                       </Select>
                    </div>
                 </div>
              </div>

              <div className="space-y-8 pt-8 border-t border-slate-50">
                 <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase text-slate-400 flex items-center justify-between ml-1">
                        Raw Document Stream
                        <Badge variant="outline" className="text-[8px] border-blue-100 bg-blue-50 text-blue-600 font-black uppercase">Gemini Parser</Badge>
                    </Label>
                    <Textarea 
                        value={rawText}
                        onChange={(e) => setRawText(e.target.value)}
                        placeholder="Paste document text here..."
                        className="min-h-[600px] md:min-h-[850px] rounded-2xl bg-slate-50 border-none p-8 font-medium text-sm md:text-base leading-relaxed shadow-inner resize-none focus-visible:ring-primary/10 custom-scrollbar text-[#0F172A]"
                    />
                 </div>

                 <Button 
                    onClick={handleAIIngest} 
                    disabled={isProcessing} 
                    className="w-full h-14 bg-[#0F172A] hover:bg-black text-white font-bold uppercase text-[11px] rounded-xl shadow-2xl gap-4 active:scale-95 transition-all border-none px-12"
                 >
                    {isProcessing ? <Loader2 className="h-5 w-5 animate-spin" /> : <Zap className="h-5 w-5 text-primary fill-current" />} 
                    Initialize AI Pipeline
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
                          <Badge className="bg-[#0B1228] text-white border-none font-bold text-[9px] uppercase tracking-widest px-4 py-1.5 rounded-lg">AI Node #{idx + 1}</Badge>
                       </div>
                       <button onClick={() => setStagedQuestions(prev => prev.filter(item => item.id !== q.id))} className="h-10 w-10 bg-rose-50 text-rose-500 rounded-xl flex items-center justify-center active:scale-90 transition-all"><Trash2 className="h-5 w-5" /></button>
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
                             <div className="p-8 bg-rose-50 rounded-[2rem] border border-rose-100 space-y-4 shadow-inner">
                                <div className="flex items-center gap-3 text-rose-600">
                                   <AlertTriangle className="h-6 w-6" />
                                   <h4 className="font-bold text-base uppercase tracking-widest">Extraction Failure</h4>
                                </div>
                                <div className="space-y-2">
                                   {q.validationErrors.map((err: string, i: number) => (
                                      <p key={i} className="text-sm font-bold text-rose-400 flex items-center gap-2">
                                        <div className="h-1.5 w-1.5 rounded-full bg-rose-300 shrink-0" /> {err}
                                      </p>
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
                       <p className="text-sm font-bold uppercase tracking-widest text-primary">Awaiting AI Pool Initiation</p>
                    </div>
                 </div>
              )}
           </div>
        </div>
      </div>
    </div>
  )
}
