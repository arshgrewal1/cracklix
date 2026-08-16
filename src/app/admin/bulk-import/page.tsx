
"use client"

import React, { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
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
  Zap, 
  Layers,
  AlertTriangle,
  FileBarChart,
  Target,
  PenLine,
  Languages,
  LayoutGrid,
  BarChart3,
  Image as ImageIcon,
  Plus,
  ArrowRight,
  RefreshCw,
  X,
  Edit,
  Save
} from "lucide-react"
import { useCollection, useFirestore, useUser } from "@/firebase"
import { 
  collection, 
  doc, 
  writeBatch, 
  serverTimestamp, 
  query, 
  orderBy, 
  updateDoc, 
  increment, 
  getDocs, 
  where, 
  limit,
  setDoc
} from "firebase/firestore"
import { useToast } from "@/hooks/use-toast"
import { Board, Subject, Exam, MockType, LanguageDisplayMode } from "@/types"
import QuestionRenderer from "@/components/questions/QuestionRenderer"
import { cn } from "@/lib/utils"
import { AdminPageHeader } from "@/components/admin"
import { preprocessText, parseBulkQuestions, validateMCQSchema, type ParserFormat } from "@/lib/parser"
import { nanoid } from "nanoid"

const FORMATS: { label: string, value: ParserFormat, icon: any }[] = [
  { label: "Current Affairs", value: "CURRENT_AFFAIRS", icon: Globe },
  { label: "Simple Bilingual", value: "BILINGUAL_MCQ", icon: Zap },
  { label: "English Only", value: "ENGLISH_ONLY", icon: Target },
  { label: "Punjabi Only", value: "PUNJABI_ONLY", icon: Target },
  { label: "Mathematics", value: "MATHEMATICS", icon: Braces },
  { label: "Reasoning", value: "REASONING", icon: ClipboardList },
  { label: "Match following", value: "MATCHING", icon: CheckCircle2 },
  { label: "Assertion & Reason", value: "ASSERTION", icon: AlertTriangle },
  { label: "Fill in the Blank", value: "FILL_BLANK", icon: PenLine },
  { label: "Table Based", value: "TABLE", icon: LayoutGrid },
  { label: "Graph/Chart", value: "GRAPH", icon: BarChart3 },
  { label: "Diagram Based", value: "DIAGRAM", icon: ImageIcon }
];

const LANGUAGE_MODES = [
  { label: "English + Punjabi", value: "ENGLISH_PUNJABI" },
  { label: "English + Hindi", value: "ENGLISH_HINDI" },
  { label: "English Only", value: "ENGLISH" },
  { label: "Punjabi Only", value: "PUNJABI" }
];

export default function BulkIngestionPage() {
  const router = useRouter()
  const db = useFirestore()
  const { profile } = useUser()
  const { toast } = useToast()
  
  const { data: boards } = useCollection<Board>(useMemo(() => (db ? query(collection(db, "boards"), orderBy("abbreviation", "asc")) : null), [db]))
  const { data: subjects } = useCollection<Subject>(useMemo(() => (db ? query(collection(db, "subjects"), orderBy("name", "asc")) : null), [db]))
  const { data: exams } = useCollection<Exam>(useMemo(() => (db ? query(collection(db, "exams"), orderBy("name", "asc")) : null), [db]))

  // Mode state
  const [ingestionMode, setIngestionMode] = useState<'subject-wise' | 'mixed'>('subject-wise');

  // Subject-wise state
  const [metadata, setMetadata] = useState({
    boardId: "",
    subjectId: "",
    languageMode: "ENGLISH_PUNJABI",
    difficulty: "Medium" as any,
    parserFormat: "BILINGUAL_MCQ" as ParserFormat
  })
  const [rawText, setRawText] = useState("")
  const [stagedQuestions, setStagedQuestions] = useState<any[]>([])

  // Mixed Exam state
  const [mixedConfig, setMixedConfig] = useState({
    title: "",
    boardId: "",
    examId: "",
    languageMode: "ENGLISH_PUNJABI" as LanguageDisplayMode,
    orderMode: "subject-wise" as "subject-wise" | "random",
    duration: 120,
    positiveMarks: 1,
    negativeMarks: 0.25,
    subjects: [] as { subjectId: string, count: number }[]
  });
  const [isAddingSubject, setIsAddingSubject] = useState(false);
  const [newSubEntry, setNewSubEntry] = useState({ subjectId: "", count: 20 });
  const [availabilityResults, setAvailabilityResults] = useState<Record<string, { available: number, required: number, ok: boolean }>>({});

  const [isProcessing, setIsProcessing] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)

  const handleLocalParse = async () => {
    if (ingestionMode === 'subject-wise') {
      if (!rawText.trim()) return
      if (!metadata.boardId || !metadata.subjectId) {
        toast({ variant: "destructive", title: "Audit Blocked", description: "Select Board and Subject first." })
        return
      }

      setIsProcessing(true)
      try {
        const inputToParse = preprocessText(rawText);
        const result = parseBulkQuestions(inputToParse, {
           ...metadata,
           secondaryLanguage: metadata.languageMode.includes('HINDI') ? 'hindi' : 'punjabi'
        });

        if (!result?.questions || result.questions.length === 0) {
           throw new Error("No questions detected. Check markers.");
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
        toast({ title: "Extraction Complete", description: `${validated.length} items staged.` });
      } catch (e: any) {
        toast({ variant: "destructive", title: "Parsing Error", description: e.message });
      } finally {
        setIsProcessing(false)
      }
    } else {
      // Mixed Mode Parse = Availability Check
      if (mixedConfig.subjects.length === 0) {
        toast({ variant: "destructive", title: "Audit Blocked", description: "Add at least one subject to the exam." });
        return;
      }
      setIsProcessing(true);
      const results: any = {};
      try {
        for (const item of mixedConfig.subjects) {
          const q = query(
            collection(db!, "mcqBank"),
            where("subjectId", "==", item.subjectId),
            where("status", "==", "UNUSED"),
            limit(item.count + 1)
          );
          const snap = await getDocs(q);
          results[item.subjectId] = {
            available: snap.size,
            required: item.count,
            ok: snap.size >= item.count
          };
        }
        setAvailabilityResults(results);
        const hasErrors = Object.values(results).some((r: any) => !r.ok);
        if (hasErrors) {
           toast({ variant: "destructive", title: "Inventory Shortage", description: "One or more subjects have insufficient questions." });
        } else {
           toast({ title: "Inventory Verified", description: "All subject counts are available in the bank." });
        }
      } finally {
        setIsProcessing(false);
      }
    }
  }

  const handleFinalCommit = async () => {
    if (!db) return;

    if (ingestionMode === 'subject-wise') {
      const valids = stagedQuestions.filter(q => q.isValid);
      if (valids.length === 0) return;

      setIsSyncing(true);
      const batch = writeBatch(db);

      try {
        valids.forEach(q => {
          const qRef = doc(collection(db, "mcqBank"));
          const { isValid, validationErrors, validationWarnings, ...finalData } = q;
          batch.set(qRef, { 
            ...finalData, 
            status: 'UNUSED', 
            createdAt: serverTimestamp(), 
            updatedAt: serverTimestamp() 
          });
        });

        await batch.commit();
        await updateDoc(doc(db, 'settings', 'stats'), { totalQuestions: increment(valids.length), updatedAt: serverTimestamp() }).catch(() => {});
        toast({ title: "Registry Updated", description: `${valids.length} items committed to bank.` });
        setStagedQuestions([]);
        setRawText("");
      } catch (e) {
        toast({ variant: "destructive", title: "Commit Failed" });
      } finally {
        setIsSyncing(false);
      }
    } else {
      // Mixed Exam Commit
      if (!mixedConfig.title || !mixedConfig.boardId || !mixedConfig.examId) {
        toast({ variant: "destructive", title: "Audit Blocked", description: "Title, Board, and Vertical are required." });
        return;
      }
      
      const allVerified = mixedConfig.subjects.every(s => availabilityResults[s.subjectId]?.ok);
      if (!allVerified || mixedConfig.subjects.length === 0) {
        toast({ variant: "destructive", title: "Audit Blocked", description: "Verify inventory availability first." });
        return;
      }

      setIsSyncing(true);
      try {
        const batch = writeBatch(db);
        const mockId = `mock-${nanoid(10)}`;
        const allQuestionIds: string[] = [];
        const sections: any[] = [];

        for (const item of mixedConfig.subjects) {
          const subName = subjects?.find(s => s.id === item.subjectId)?.name || item.subjectId;
          const q = query(
            collection(db, "mcqBank"),
            where("subjectId", "==", item.subjectId),
            where("status", "==", "UNUSED"),
            limit(item.count)
          );
          const snap = await getDocs(q);
          const qDocs = snap.docs.map(d => ({ ...d.data(), id: d.id }));
          
          sections.push({ name: subName, count: qDocs.length });
          
          qDocs.forEach(question => {
            allQuestionIds.push(question.id);
            const usedRef = doc(db, "usedQuestions", question.id);
            const bankRef = doc(db, "mcqBank", question.id);
            const legacyRef = doc(db, "questions", question.id);

            batch.set(usedRef, {
               ...question,
               usedAt: serverTimestamp(),
               usedBy: "Bulk Test Generator",
               mockId: mockId,
               mockName: mixedConfig.title,
               status: 'USED'
            });
            batch.delete(bankRef);
            batch.update(legacyRef, { status: 'USED', updatedAt: serverTimestamp() });
          });
        }

        const totalQuestions = allQuestionIds.length;
        const payload = {
          id: mockId,
          title: mixedConfig.title,
          boardId: mixedConfig.boardId,
          boardIds: [mixedConfig.boardId],
          examIds: [mixedConfig.examId],
          mockType: 'FULL' as MockType,
          accessLevel: 'FREE',
          duration: mixedConfig.duration,
          totalQuestions,
          totalMarks: totalQuestions * mixedConfig.positiveMarks,
          negativeMarks: mixedConfig.negativeMarks,
          positiveMarks: mixedConfig.positiveMarks,
          questionIds: mixedConfig.orderMode === 'random' ? [...allQuestionIds].sort(() => Math.random() - 0.5) : allQuestionIds,
          sections: mixedConfig.orderMode === 'random' ? [] : sections,
          published: true,
          languageMode: mixedConfig.languageMode,
          status: 'PUBLISHED',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        };

        batch.set(doc(db, "mocks", mockId), payload);
        await batch.commit();
        
        await updateDoc(doc(db, 'settings', 'stats'), { totalMocks: increment(1), updatedAt: serverTimestamp() }).catch(() => {});
        
        toast({ title: "Full Exam Created", description: `"${mixedConfig.title}" is now live.` });
        router.push("/admin/mocks");
      } catch (e) {
        toast({ variant: "destructive", title: "Exam Creation Failed" });
      } finally {
        setIsSyncing(false);
      }
    }
  }

  const addSubjectToMixed = () => {
    if (!newSubEntry.subjectId || newSubEntry.count <= 0) return;
    if (mixedConfig.subjects.find(s => s.subjectId === newSubEntry.subjectId)) {
       toast({ variant: "destructive", title: "Duplicate Subject", description: "Subject is already added. Edit count instead." });
       return;
    }
    setMixedConfig({
       ...mixedConfig,
       subjects: [...mixedConfig.subjects, newSubEntry]
    });
    setNewSubEntry({ subjectId: "", count: 20 });
    setIsAddingSubject(false);
    setAvailabilityResults({}); // Reset verification
  }

  const totalMixedQuestions = useMemo(() => {
     return mixedConfig.subjects.reduce((sum, s) => sum + Number(s.count), 0);
  }, [mixedConfig.subjects]);

  return (
    <div className="w-full max-w-[1600px] mx-auto space-y-8 pb-32 text-left animate-in fade-in duration-700 pt-2 px-4 md:px-12 overflow-x-hidden">
      <AdminPageHeader
        icon={ClipboardList}
        label="Modular Ingestion Hub"
        title="MCQ Ingestion"
        subtitle="Dedicated extraction for 12 preparation formats."
      >
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full md:w-auto mt-4 md:mt-0">
           <button 
             onClick={() => ingestionMode === 'subject-wise' ? setStagedQuestions([]) : setMixedConfig({...mixedConfig, subjects: []})} 
             className="h-[52px] md:h-11 px-6 rounded-xl border border-slate-200 font-bold text-[11px] bg-white hover:bg-slate-50 transition-all flex items-center justify-center min-w-0"
           >
              Reset
           </button>
           <Button 
             onClick={handleLocalParse} 
             disabled={isProcessing} 
             className="bg-[#0F172A] hover:bg-black text-white rounded-xl h-[52px] md:h-11 px-8 font-bold text-[11px] gap-3 shadow-xl w-full min-w-0"
           >
              {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4 text-primary fill-current" />} {ingestionMode === 'subject-wise' ? 'Parse' : 'Verify'}
           </Button>
           <Button 
             onClick={handleFinalCommit} 
             disabled={isSyncing || (ingestionMode === 'subject-wise' ? stagedQuestions.filter(q => q.isValid).length === 0 : mixedConfig.subjects.length === 0)} 
             className="bg-primary hover:bg-blue-700 text-white rounded-xl h-[52px] md:h-11 px-8 font-bold text-[11px] gap-3 shadow-xl w-full min-w-0"
           >
              {isSyncing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Database className="h-4 w-4" />} Commit
           </Button>
        </div>
      </AdminPageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* LEFT COLUMN: CONFIGURATION */}
        <div className="lg:col-span-5 space-y-8 w-full min-w-0">
           <Card className="border-none shadow-2xl rounded-[2.5rem] bg-white p-6 md:p-10 space-y-8 border border-slate-50 w-full overflow-hidden">
              <div className="space-y-8">
                 {/* MODE SELECTOR */}
                 <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-widest">Ingestion mode</Label>
                    <div className="flex bg-slate-100 p-1 rounded-xl w-full gap-2">
                       <button 
                         onClick={() => setIngestionMode('subject-wise')}
                         className={cn(
                           "flex-1 py-3 rounded-lg font-bold text-[10px] uppercase transition-all",
                           ingestionMode === 'subject-wise' ? "bg-white text-primary shadow-sm" : "text-slate-400 hover:text-slate-600"
                         )}
                       >Subject-wise</button>
                       <button 
                         onClick={() => setIngestionMode('mixed')}
                         className={cn(
                           "flex-1 py-3 rounded-lg font-bold text-[10px] uppercase transition-all",
                           ingestionMode === 'mixed' ? "bg-white text-primary shadow-sm" : "text-slate-400 hover:text-slate-600"
                         )}
                       >Mixed exam</button>
                    </div>
                 </div>

                 {ingestionMode === 'subject-wise' ? (
                   /* SUBJECT-WISE CONFIG */
                   <div className="space-y-6 animate-in fade-in duration-300">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <div className="space-y-2 w-full">
                             <Label className="text-[10px] font-bold text-slate-400 ml-1 tracking-tight">Question format</Label>
                             <Select value={metadata.parserFormat} onValueChange={(v: ParserFormat) => setMetadata({...metadata, parserFormat: v})}>
                             <SelectTrigger className="h-12 bg-slate-50 border-none rounded-xl font-bold px-4 w-full">
                                 <SelectValue placeholder="Format" />
                             </SelectTrigger>
                             <SelectContent className="bg-[#0B1528] text-white border-white/10">
                                 {FORMATS.map(f => (
                                     <SelectItem key={f.value} value={f.value} className="py-2 cursor-pointer">
                                         <div className="flex items-center gap-2">
                                             <f.icon className="h-3.5 w-3.5 text-primary" />
                                             <span>{f.label}</span>
                                         </div>
                                     </SelectItem>
                                 ))}
                             </SelectContent>
                             </Select>
                         </div>

                         <div className="space-y-2 w-full">
                             <Label className="text-[10px] font-bold text-slate-400 ml-1 tracking-tight">Language mode</Label>
                             <Select value={metadata.languageMode} onValueChange={(v) => setMetadata({...metadata, languageMode: v})}>
                             <SelectTrigger className="h-12 bg-slate-50 border-none rounded-xl font-bold px-4 w-full">
                                 <SelectValue />
                             </SelectTrigger>
                             <SelectContent className="bg-[#0B1528] text-white border-white/10">
                                 {LANGUAGE_MODES.map(m => (
                                     <SelectItem key={m.value} value={m.value} className="py-2 cursor-pointer">
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

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                         <div className="space-y-2 w-full">
                            <Label className="text-[9px] font-bold text-slate-400 ml-1">Board hub</Label>
                            <Select value={metadata.boardId} onValueChange={v => setMetadata({...metadata, boardId: v})}>
                               <SelectTrigger className="h-12 bg-slate-50 border-none rounded-xl font-bold w-full"><SelectValue placeholder="Board" /></SelectTrigger>
                               <SelectContent className="bg-[#0B1528] text-white">{boards?.map(b => <SelectItem key={b.id} value={b.id} className="cursor-pointer">{b.abbreviation}</SelectItem>)}</SelectContent>
                            </Select>
                         </div>
                         <div className="space-y-2 w-full">
                            <Label className="text-[9px] font-bold text-slate-400 ml-1">Subject entry</Label>
                            <Select value={metadata.subjectId} onValueChange={v => setMetadata({...metadata, subjectId: v})}>
                               <SelectTrigger className="h-12 bg-slate-50 border-none rounded-xl font-bold w-full"><SelectValue placeholder="Subject" /></SelectTrigger>
                               <SelectContent className="bg-[#0B1528] text-white">{subjects?.map(s => <SelectItem key={s.id} value={s.id} className="cursor-pointer">{s.name}</SelectItem>)}</SelectContent>
                            </Select>
                         </div>
                      </div>

                      <div className="space-y-2">
                         <Label className="text-[10px] font-bold text-slate-400 ml-1">Raw data feed</Label>
                         <Textarea 
                            value={rawText} 
                            onChange={(e) => setRawText(e.target.value)} 
                            placeholder="Paste blocks from PDF here..." 
                            className="min-h-[300px] md:min-h-[450px] rounded-2xl bg-slate-50 border-none p-6 font-medium text-sm shadow-inner resize-none focus-visible:ring-primary/20 w-full" 
                         />
                      </div>
                   </div>
                 ) : (
                   /* MIXED EXAM CONFIG */
                   <div className="space-y-6 animate-in fade-in duration-300">
                      <div className="space-y-2">
                         <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Full exam title</Label>
                         <Input value={mixedConfig.title} onChange={e => setMixedConfig({...mixedConfig, title: e.target.value})} className="h-14 rounded-xl bg-slate-50 border-none font-bold text-lg px-6" placeholder="ETT Cadre Full Exam" />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <div className="space-y-2 w-full">
                            <Label className="text-[9px] font-bold text-slate-400 ml-1">Board authority</Label>
                            <Select value={mixedConfig.boardId} onValueChange={v => setMixedConfig({...mixedConfig, boardId: v})}>
                               <SelectTrigger className="h-12 bg-slate-50 border-none rounded-xl font-bold w-full"><SelectValue placeholder="Board" /></SelectTrigger>
                               <SelectContent className="bg-[#0B1528] text-white">{boards?.map(b => <SelectItem key={b.id} value={b.id} className="cursor-pointer">{b.abbreviation}</SelectItem>)}</SelectContent>
                            </Select>
                         </div>
                         <div className="space-y-2 w-full">
                            <Label className="text-[9px] font-bold text-slate-400 ml-1">Target vertical</Label>
                            <Select value={mixedConfig.examId} onValueChange={v => setMixedConfig({...mixedConfig, examId: v})}>
                               <SelectTrigger className="h-12 bg-slate-50 border-none rounded-xl font-bold w-full"><SelectValue placeholder="Vertical" /></SelectTrigger>
                               <SelectContent className="bg-[#0B1528] text-white">{exams?.filter(e => !mixedConfig.boardId || e.boardId === mixedConfig.boardId).map(e => <SelectItem key={e.id} value={e.id} className="cursor-pointer">{e.name}</SelectItem>)}</SelectContent>
                            </Select>
                         </div>
                      </div>

                      <div className="space-y-4 pt-4 border-t border-slate-100">
                         <div className="flex items-center justify-between">
                            <h4 className="text-[11px] font-black uppercase text-slate-500 tracking-widest flex items-center gap-2"><Layers className="h-4 w-4" /> Exam subjects</h4>
                            <Button onClick={() => setIsAddingSubject(true)} variant="ghost" size="sm" className="h-8 rounded-lg font-bold text-[9px] uppercase gap-1 text-primary"><Plus className="h-3 w-3" /> Add subject</Button>
                         </div>

                         <div className="space-y-2">
                            {mixedConfig.subjects.map((item, idx) => {
                               const subName = subjects?.find(s => s.id === item.subjectId)?.name || item.subjectId;
                               const status = availabilityResults[item.subjectId];
                               return (
                                  <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl group transition-all">
                                     <div className="flex-1 min-w-0">
                                        <p className="font-bold text-[#0F172A] text-sm truncate">{subName}</p>
                                        <div className="flex items-center gap-2 mt-1">
                                           <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{item.count} Questions</span>
                                           {status && (
                                              <span className={cn("text-[8px] font-bold uppercase", status.ok ? "text-emerald-500" : "text-rose-500")}>
                                                 {status.ok ? `Verified (${status.available})` : `Shortage (${status.available})`}
                                              </span>
                                           )}
                                        </div>
                                     </div>
                                     <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                                        <button onClick={() => setMixedConfig({...mixedConfig, subjects: mixedConfig.subjects.filter((_, i) => i !== idx)})} className="h-8 w-8 text-rose-500 hover:bg-rose-50 rounded-lg flex items-center justify-center border-none bg-transparent cursor-pointer"><Trash2 className="h-4 w-4" /></button>
                                     </div>
                                  </div>
                               )
                            })}
                            {mixedConfig.subjects.length === 0 && (
                               <div className="py-10 text-center bg-slate-50 rounded-xl border-2 border-dashed border-slate-100 opacity-40 italic font-bold text-xs uppercase tracking-widest">No subjects added</div>
                            )}
                         </div>

                         {isAddingSubject && (
                            <div className="p-4 bg-blue-50/50 rounded-xl border border-primary/10 space-y-4 animate-in slide-in-from-top-2">
                               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div className="space-y-1">
                                     <Label className="text-[8px] font-bold text-slate-400 ml-1 uppercase">Select subject</Label>
                                     <Select value={newSubEntry.subjectId} onValueChange={v => setNewSubEntry({...newSubEntry, subjectId: v})}>
                                        <SelectTrigger className="h-10 bg-white border-none rounded-lg font-bold text-xs"><SelectValue /></SelectTrigger>
                                        <SelectContent className="bg-[#0B1528] text-white">{subjects?.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
                                     </Select>
                                  </div>
                                  <div className="space-y-1">
                                     <Label className="text-[8px] font-bold text-slate-400 ml-1 uppercase">Question count</Label>
                                     <Input type="number" value={newSubEntry.count} onChange={e => setNewSubEntry({...newSubEntry, count: parseInt(e.target.value) || 0})} className="h-10 bg-white border-none rounded-lg font-black text-center text-xs" />
                                  </div>
                               </div>
                               <div className="flex gap-2">
                                  <Button onClick={() => setIsAddingSubject(false)} variant="ghost" className="flex-1 h-9 rounded-lg font-bold text-[10px] uppercase text-slate-400">Cancel</Button>
                                  <Button onClick={addSubjectToMixed} className="flex-1 h-9 bg-primary text-white rounded-lg font-bold text-[10px] uppercase">Add subject</Button>
                               </div>
                            </div>
                         )}
                      </div>

                      <div className="pt-6 border-t border-slate-100 space-y-4">
                         <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black uppercase text-slate-400 tracking-[0.3em]">Exam summary</span>
                            <span className="font-black text-xl text-[#0F172A] tabular-nums">{totalMixedQuestions} Questions</span>
                         </div>
                         <div className="space-y-2">
                            <Label className="text-[10px] font-bold text-slate-400 ml-1 uppercase">Question distribution</Label>
                            <div className="flex bg-slate-100 p-1 rounded-xl w-full gap-2">
                               <button onClick={() => setMixedConfig({...mixedConfig, orderMode: 'subject-wise'})} className={cn("flex-1 py-3 rounded-lg font-bold text-[9px] uppercase", mixedConfig.orderMode === 'subject-wise' ? "bg-white text-primary shadow-sm" : "text-slate-400")}>Subject sections</button>
                               <button onClick={() => setMixedConfig({...mixedConfig, orderMode: 'random'})} className={cn("flex-1 py-3 rounded-lg font-bold text-[9px] uppercase", mixedConfig.orderMode === 'random' ? "bg-white text-primary shadow-sm" : "text-slate-400")}>Randomized</button>
                            </div>
                         </div>
                      </div>
                   </div>
                 )}

                 <Button 
                   onClick={handleLocalParse} 
                   disabled={isProcessing || (ingestionMode === 'subject-wise' ? !rawText.trim() : mixedConfig.subjects.length === 0)} 
                   className="w-full h-16 bg-primary hover:bg-blue-700 text-white rounded-2xl font-bold text-[13px] shadow-2xl gap-3 active:scale-95 transition-all border-none"
                 >
                    {isProcessing ? <Loader2 className="h-6 w-6 animate-spin" /> : <Zap className="h-6 w-6 text-white fill-current" />} {ingestionMode === 'subject-wise' ? 'Initialize Ingestion' : 'Verify Inventory'}
                 </Button>
              </div>
           </Card>
        </div>

        {/* RIGHT COLUMN: PREVIEW / STAGING */}
        <div className="lg:col-span-7 space-y-6 w-full min-w-0">
           {ingestionMode === 'subject-wise' ? (
              <>
                 <div className="flex items-center justify-between px-2">
                    <h3 className="text-xl font-bold text-[#0F172A] flex items-center gap-4"><Layers className="h-6 w-6 text-primary" /> Staging hub</h3>
                    <Badge className="bg-[#0F172A] text-white border-none font-bold text-[10px] px-4 py-1.5 rounded-lg shadow-sm">{stagedQuestions.length} Items</Badge>
                 </div>
                 <div className="space-y-6 w-full">
                    {stagedQuestions.map((q, idx) => (
                       <Card key={q.id || idx} className="border-none shadow-lg rounded-[2.5rem] bg-white overflow-hidden border border-slate-100 relative group w-full">
                          <div className={cn("absolute top-0 left-0 w-2 h-full transition-colors", q.isValid ? "bg-emerald-500" : "bg-rose-500")} />
                          <CardHeader className="p-6 md:p-10 pb-0 flex flex-row items-center justify-between">
                             <Badge className="bg-[#0B1228] text-white border-none font-bold text-[9px] px-4 py-1 rounded-lg shadow-sm">Staged item #{idx + 1}</Badge>
                             <button onClick={() => setStagedQuestions(prev => prev.filter((_, i) => i !== idx))} className="h-8 w-8 text-rose-500 hover:bg-rose-50 rounded-lg flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 border-none bg-transparent cursor-pointer"><Trash2 className="h-4 w-4" /></button>
                          </CardHeader>
                          <CardContent className="p-6 md:p-10 pt-4 w-full overflow-hidden">
                             {q.isValid ? (
                                <QuestionRenderer question={q} language={metadata.languageMode} showSolution={true} className="p-0 shadow-none border-none max-w-none" />
                             ) : (
                                <div className="p-6 bg-rose-50 rounded-2xl border border-rose-100 space-y-3">
                                   <h4 className="font-bold text-rose-600 flex items-center gap-2 text-[11px] tracking-tight"><AlertTriangle className="h-4 w-4" /> Integrity violation</h4>
                                   <div className="space-y-1">
                                      {q.validationErrors?.map((err: string, i: number) => <p key={i} className="text-[11px] font-bold text-rose-400">● {err}</p>)}
                                   </div>
                                </div>
                             )}
                          </CardContent>
                       </Card>
                    ))}
                    {stagedQuestions.length === 0 && (
                       <div className="h-[500px] flex flex-col items-center justify-center text-slate-300 opacity-20 bg-slate-50 rounded-[4rem] border-2 border-dashed border-slate-200 w-full">
                          <Database className="h-16 w-16 mb-4" />
                          <p className="font-black tracking-[0.4em]">Awaiting extraction</p>
                       </div>
                    )}
                 </div>
              </>
           ) : (
              /* MIXED EXAM PREVIEW HUB */
              <div className="space-y-6">
                 <div className="flex items-center justify-between px-2">
                    <h3 className="text-xl font-bold text-[#0F172A] flex items-center gap-4"><FileBarChart className="h-6 w-6 text-primary" /> Exam architecture</h3>
                    <Badge className="bg-emerald-50 text-emerald-600 border-none font-bold text-[10px] px-4 py-1.5 rounded-lg shadow-sm">Verified Node</Badge>
                 </div>
                 
                 <Card className="border-none shadow-2xl rounded-[3rem] bg-white p-10 md:p-14 space-y-12 relative overflow-hidden border border-slate-50">
                    <div className="absolute top-0 right-0 p-10 opacity-5 rotate-12"><LayoutGrid className="h-44 w-44" /></div>
                    <div className="space-y-8 relative z-10 text-left">
                       <div className="space-y-3">
                          <h4 className="text-2xl md:text-4xl font-black text-[#0F172A] tracking-tight">{mixedConfig.title || "Untitled Exam Registry"}</h4>
                          <div className="flex flex-wrap items-center gap-4 text-slate-400 font-bold uppercase text-[10px] tracking-widest">
                             <span className="flex items-center gap-2"><Landmark className="h-3.5 w-3.5" /> {mixedConfig.boardId || "General"} hub</span>
                             <span className="flex items-center gap-2"><Clock className="h-3.5 w-3.5" /> {mixedConfig.duration} mins</span>
                             <span className="flex items-center gap-2"><Zap className="h-3.5 w-3.5 text-primary" /> {mixedConfig.orderMode.replace('-', ' ')}</span>
                          </div>
                       </div>

                       <div className="h-px w-full bg-slate-100" />

                       <div className="space-y-6">
                          {mixedConfig.subjects.map((s, i) => (
                             <div key={i} className="flex items-center justify-between group">
                                <div className="flex items-center gap-4">
                                   <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center font-black text-[#0F172A] shadow-inner group-hover:bg-primary group-hover:text-white transition-all">{i+1}</div>
                                   <span className="font-bold text-lg text-[#0F172A]">{subjects?.find(sub => sub.id === s.subjectId)?.name || s.subjectId}</span>
                                </div>
                                <div className="flex items-center gap-6">
                                   <span className="font-black text-xl text-[#0F172A] tabular-nums">{s.count} <span className="text-[10px] text-slate-300 font-bold uppercase tracking-widest ml-1">Qs</span></span>
                                   <div className={cn("h-2.5 w-2.5 rounded-full", availabilityResults[s.subjectId]?.ok ? "bg-emerald-500" : "bg-slate-200")} />
                                </div>
                             </div>
                          ))}
                          {mixedConfig.subjects.length === 0 && <p className="text-center py-10 opacity-30 italic font-bold">No sections configured</p>}
                       </div>

                       <div className="pt-8 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-6">
                          <div className="text-left">
                             <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Max capacity</p>
                             <p className="text-3xl font-black text-[#0F172A] tabular-nums">{totalMixedQuestions * mixedConfig.positiveMarks} <span className="text-lg text-slate-300 font-bold ml-1">Total points</span></p>
                          </div>
                          <Badge className="bg-[#0F172A] text-white border-none px-6 py-2 rounded-full font-black uppercase text-[10px] tracking-widest shadow-xl">Verified architecture</Badge>
                       </div>
                    </div>
                 </Card>

                 <div className="p-8 bg-blue-50 rounded-[2.5rem] border border-blue-100 flex items-start gap-4 shadow-inner text-left">
                    <ShieldCheck className="h-6 w-6 text-blue-600 shrink-0" />
                    <div className="space-y-1">
                       <p className="text-[10px] font-black uppercase text-blue-800 tracking-widest">Aspirant assurance</p>
                       <p className="text-xs text-blue-600 leading-relaxed font-medium">Full exams pull existing questions from the bank and mark them as used. This ensures no question is repeated across different official series.</p>
                    </div>
                 </div>
              </div>
           )}
        </div>
      </div>
    </div>
  )
}
