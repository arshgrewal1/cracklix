
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
  ChevronLeft, 
  Loader2, 
  Trash2, 
  Rocket, 
  ArrowRight, 
  FileText,
  Edit,
  Database,
  CheckCircle2,
  Zap,
  Layers,
  Settings,
  X,
  AlertTriangle,
  RefreshCw,
  Search,
  Eye,
  Languages,
  Save,
  CloudOff
} from "lucide-react"
import { useCollection, useFirestore, useUser } from "@/firebase"
import { collection, doc, writeBatch, serverTimestamp, setDoc, query, orderBy, deleteDoc } from "firebase/firestore"
import { useToast } from "@/hooks/use-toast"
import { parseMCQBlocks } from "@/lib/parser"
import { repairMCQ } from "@/ai/flows/bulk-parse-ai"
import { aiManager } from "@/services/ai-manager"
import { Board, Subject, Question, Exam } from "@/types"
import QuestionRenderer from "@/components/questions/QuestionRenderer"
import { cn } from "@/lib/utils"
import { AdminPageHeader } from "@/components/admin"

/**
 * @fileOverview Production-Ready AI Bulk Ingestion Center v11.0.
 * FIXED: Resolved layout squeezing and button distortion by normalizing widths and border radii.
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
  const [repairingId, setRepairingId] = useState<string | null>(null)
  const [aiStatus, setAiStatus] = useState<'IDLE' | 'PROCESSING' | 'OFFLINE'>('IDLE')

  // Auto-Save Draft to Registry
  const saveDraft = async (data: any[]) => {
    if (!db || !user || data.length === 0) return;
    const draftRef = doc(db, "bulk_import_drafts", user.uid);
    await setDoc(draftRef, {
      staged: data,
      metadata,
      rawText,
      updatedAt: serverTimestamp()
    }, { merge: true });
  }

  const handleInitialIngest = () => {
    if (!rawText.trim()) return
    if (!metadata.boardId || !metadata.subjectId) {
      toast({ variant: "destructive", title: "Target Blocked", description: "Please select a Board and Subject node." })
      return
    }

    setIsProcessing(true)
    try {
      const results = parseMCQBlocks(rawText);
      const mapped = results.map(q => ({
        ...q,
        ...metadata,
        status: 'PENDING_REVIEW' as const,
        visibility: 'PUBLIC' as const,
        questionType: 'MCQ' as const,
        createdBy: profile?.name || "Admin",
        marks: 1,
        negativeMarks: 0.25,
        tags: []
      }));
      
      setStagedQuestions(mapped);
      saveDraft(mapped);
      toast({ title: "Ingestion Success", description: `${mapped.length} blocks staging.` });
    } finally {
      setIsProcessing(false)
    }
  }

  const handleAIRepair = async (tempId: string) => {
    const target = stagedQuestions.find(q => q.id === tempId);
    if (!target) return;

    setRepairingId(tempId);
    setAiStatus('PROCESSING');

    try {
      const blockText = `
        QUESTION: ${target.englishQuestion || ""} ${target.punjabiQuestion || ""}
        A: ${target.optionAEnglish} / ${target.optionAPunjabi}
        B: ${target.optionBEnglish} / ${target.optionBPunjabi}
        C: ${target.optionCEnglish} / ${target.optionCPunjabi}
        D: ${target.optionDEnglish} / ${target.optionDPunjabi}
        ANS: ${target.correctAnswer}
      `;

      const repaired = await aiManager.execute('MCQ_REPAIR', async () => {
         return await repairMCQ({ rawText: blockText });
      });
      
      const updated = stagedQuestions.map(q => q.id === tempId ? {
        ...q,
        ...repaired,
        isValid: true,
        validationErrors: []
      } : q);

      setStagedQuestions(updated);
      saveDraft(updated);
      toast({ title: "AI Repair Successful", description: "Node normalized via fallback node." });
    } catch (e: any) {
      console.error('[AI_REPAIR_FAILURE]:', e);
      setAiStatus('OFFLINE');
      toast({ 
        variant: "destructive", 
        title: "AI Hub Unavailable", 
        description: "All providers exhausted. Please edit manually or try later." 
      });
    } finally {
      setRepairingId(null);
      setAiStatus('IDLE');
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
          id: qRef.id,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      });

      await batch.commit();
      await deleteDoc(doc(db, "bulk_import_drafts", user.uid));
      
      toast({ title: "Registry Updated", description: `${valids.length} nodes committed to MCQ Bank.` });
      router.push("/admin/questions");
    } catch (e) {
      toast({ variant: "destructive", title: "Commit Failed" });
    } finally {
      setIsSyncing(false);
    }
  }

  const duplicatesCount = useMemo(() => {
    const texts = stagedQuestions.map(q => q.englishQuestion.trim().toLowerCase());
    return texts.filter((item, index) => texts.indexOf(item) !== index).length;
  }, [stagedQuestions]);

  return (
    <div className="space-y-6 md:space-y-12 pb-32 text-left animate-in fade-in duration-700 pt-2">
      
      {/* HEADER */}
      <AdminPageHeader
        icon={CloudOff}
        label="Universal Multilingual Hub"
        title="Bulk Ingestion"
        subtitle="Staging hub with AI-failover architecture for high-fidelity extraction."
      >
        <div className="flex gap-4 w-full md:w-auto">
           <Button variant="outline" onClick={() => setStagedQuestions([])} className="h-12 md:h-14 px-8 rounded-xl border-slate-200 font-bold text-xs">Clear Hub</Button>
           <Button 
            onClick={handleFinalCommit} 
            disabled={isSyncing || stagedQuestions.filter(q => q.isValid).length === 0} 
            className="flex-1 md:w-auto h-12 md:h-14 px-10 bg-primary hover:bg-blue-700 text-white rounded-xl font-black uppercase text-[11px] tracking-widest gap-3 shadow-xl border-none active:scale-95"
           >
            {isSyncing ? <Loader2 className="h-5 w-5 animate-spin" /> : <Rocket className="h-5 w-5" />} Commit Assets
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
                       <h3 className="font-black text-lg uppercase text-[#0F172A]">Registry Target</h3>
                    </div>
                    {aiStatus === 'OFFLINE' && (
                       <Badge variant="destructive" className="animate-pulse gap-1.5 h-6"><CloudOff className="h-3 w-3" /> AI Offline</Badge>
                    )}
                 </div>
                 
                 <div className="space-y-5">
                    <div className="space-y-2">
                       <Label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-wider">Authority Board</Label>
                       <Select value={metadata.boardId} onValueChange={v => setMetadata({...metadata, boardId: v})}>
                          <SelectTrigger className="h-12 md:h-14 bg-slate-50 border-none rounded-xl font-bold shadow-inner px-5"><SelectValue placeholder="Select Board Hub" /></SelectTrigger>
                          <SelectContent className="bg-[#0B1528] text-white border-white/10">
                             {boards?.map(b => <SelectItem key={b.id} value={b.id} className="focus:bg-primary/20 cursor-pointer">{b.abbreviation} HUB</SelectItem>)}
                          </SelectContent>
                       </Select>
                    </div>
                    <div className="space-y-2">
                       <Label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-wider">Exam Vertical</Label>
                       <Select value={metadata.examId} onValueChange={v => setMetadata({...metadata, examId: v})}>
                          <SelectTrigger className="h-12 md:h-14 bg-slate-50 border-none rounded-xl font-bold shadow-inner px-5"><SelectValue placeholder="Select Exam Vertical" /></SelectTrigger>
                          <SelectContent className="bg-[#0B1528] text-white border-white/10">
                             {exams?.filter(e => e.boardId === metadata.boardId).map(e => <SelectItem key={e.id} value={e.id} className="focus:bg-primary/20 cursor-pointer">{e.name}</SelectItem>)}
                          </SelectContent>
                       </Select>
                    </div>
                    <div className="space-y-2">
                       <Label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-wider">Canonical Subject</Label>
                       <Select value={metadata.subjectId} onValueChange={v => setMetadata({...metadata, subjectId: v})}>
                          <SelectTrigger className="h-12 md:h-14 bg-slate-50 border-none rounded-xl font-bold shadow-inner px-5"><SelectValue placeholder="Select Subject Node" /></SelectTrigger>
                          <SelectContent className="bg-[#0B1528] text-white border-white/10 max-h-80">
                             {subjects?.map(s => <SelectItem key={s.id} value={s.id} className="focus:bg-primary/20 cursor-pointer">{s.name}</SelectItem>)}
                          </SelectContent>
                       </Select>
                    </div>
                 </div>
              </div>

              <div className="space-y-6 pt-6 border-t border-slate-50">
                 <Label className="text-[10px] font-black uppercase text-slate-400 flex items-center justify-between ml-1 tracking-wider">
                    Raw Text Stream
                    <Badge variant="outline" className="text-[8px] border-emerald-100 bg-emerald-50 text-emerald-600 font-black">REGEX-FIRST</Badge>
                 </Label>
                 <Textarea 
                    value={rawText}
                    onChange={e => setRawText(e.target.value)}
                    placeholder="Paste MCQs from WhatsApp, PDF or OCR here..."
                    className="min-h-[400px] md:min-h-[500px] rounded-2xl bg-slate-50 border-none p-6 font-medium text-sm md:text-base leading-relaxed shadow-inner resize-none focus-visible:ring-primary/10"
                 />
                 <Button onClick={handleInitialIngest} disabled={isProcessing} className="w-full h-14 md:h-16 bg-[#0F172A] hover:bg-black text-white font-black uppercase tracking-[0.2em] text-[10px] md:text-xs rounded-xl shadow-xl gap-4 active:scale-95 transition-all border-none">
                    {isProcessing ? <Loader2 className="h-5 w-5 animate-spin" /> : <Zap className="h-5 w-5 text-primary fill-current" />} Initialize Ingestion
                 </Button>
              </div>
           </Card>
        </div>

        {/* STAGING PANEL */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-8">
           <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-5">
                 <Layers className="h-6 w-6 text-primary" />
                 <h3 className="text-xl md:text-3xl font-black text-[#0F172A] uppercase tracking-tight">Staging Hub</h3>
              </div>
              <div className="flex gap-3">
                 {duplicatesCount > 0 && <Badge className="bg-amber-50 text-amber-600 border-none font-black text-[10px] px-3 py-1 rounded-lg">{duplicatesCount} Duplicates</Badge>}
                 <Badge className="bg-[#0F172A] text-white border-none font-black text-[10px] px-4 py-1 rounded-lg shadow-lg">{stagedQuestions.length} Nodes</Badge>
              </div>
           </div>

           <div className="grid grid-cols-1 gap-6">
              {stagedQuestions.length > 0 ? stagedQuestions.map((q, idx) => {
                 const isRepairing = repairingId === q.id;
                 return (
                    <Card key={q.id} className={cn(
                      "border-none shadow-lg rounded-[2rem] md:rounded-[2.5rem] bg-white overflow-hidden group border border-slate-100 relative transition-all duration-500",
                      !q.isValid && "ring-1 ring-rose-500/20"
                    )}>
                       <div className={cn("absolute top-0 left-0 w-1.5 h-full transition-all duration-700", q.isValid ? "bg-emerald-500" : "bg-rose-500")} />
                       
                       <CardHeader className="p-6 md:p-10 pb-0 flex flex-row items-center justify-between">
                          <div className="flex items-center gap-4">
                             <Badge className="bg-[#0B1228] text-white border-none font-black text-[9px] uppercase tracking-widest px-3 py-1 rounded-lg">Node #{idx + 1}</Badge>
                             {q.diagram_required && <Badge className="bg-blue-50 text-blue-600 border-none font-black text-[9px] uppercase px-2 py-0.5 rounded-lg">Diagram Req</Badge>}
                          </div>
                          <div className="flex gap-2 opacity-20 group-hover:opacity-100 transition-all">
                             {!q.isValid && (
                                <Button 
                                  onClick={() => handleAIRepair(q.id)} 
                                  disabled={isRepairing || aiStatus === 'PROCESSING'}
                                  size="sm"
                                  className="bg-amber-500 hover:bg-amber-600 text-white rounded-lg shadow-md border-none gap-2 font-black text-[9px] uppercase"
                                >
                                   {isRepairing ? <Loader2 className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />} AI Repair
                                </Button>
                             )}
                             <button onClick={() => setStagedQuestions(prev => prev.filter(item => item.id !== q.id))} className="h-8 w-8 bg-rose-50 text-rose-500 rounded-lg flex items-center justify-center active:scale-90 shadow-sm hover:bg-rose-100 transition-colors"><Trash2 className="h-4 w-4" /></button>
                          </div>
                       </CardHeader>

                       <CardContent className="p-6 md:p-10 lg:p-12 pt-4 space-y-8">
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
                                  <div className="space-y-2 pl-1">
                                     {q.validationErrors.map((err: string, i: number) => (
                                        <p key={i} className="text-[11px] font-bold text-rose-400 flex items-center gap-2">
                                          <div className="h-1 w-1 rounded-full bg-rose-300 shrink-0" /> {err}
                                        </p>
                                     ))}
                                  </div>
                               </div>
                               <div className="space-y-2">
                                  <Label className="text-[9px] font-black uppercase text-slate-400 tracking-wider ml-1">Source Block</Label>
                                  <div className="p-6 bg-slate-50 rounded-2xl font-mono text-[10px] md:text-xs text-slate-500 break-words border border-slate-100 shadow-inner max-h-40 overflow-y-auto leading-relaxed">
                                     {q.englishQuestion} {q.optionAEnglish} ...
                                  </div>
                               </div>
                            </div>
                          )}
                       </CardContent>
                    </Card>
                 )
              }) : (
                 <div className="py-60 flex flex-col items-center justify-center text-slate-300 opacity-20 space-y-10 text-center border-2 border-dashed border-slate-200 rounded-[3rem] mx-2">
                    <Database className="h-24 w-24" />
                    <div className="space-y-2">
                       <p className="font-black text-3xl uppercase tracking-[0.4em]">Vault Empty</p>
                       <p className="text-sm font-bold uppercase tracking-widest">Awaiting raw data stream ingestion</p>
                    </div>
                 </div>
              )}
           </div>
        </div>
      </div>
    </div>
  )
}
