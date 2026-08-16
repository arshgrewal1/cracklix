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
  Save,
  Clock,
  Landmark,
  ShieldCheck,
  ChevronRight,
  FileText
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

interface IngestionSection {
  id: string;
  subjectId: string;
  rawText: string;
}

export default function BulkIngestionPage() {
  const router = useRouter()
  const db = useFirestore()
  const { profile } = useUser()
  const { toast } = useToast()
  
  const { data: boards } = useCollection<any>(useMemo(() => (db ? query(collection(db, "boards"), orderBy("abbreviation", "asc")) : null), [db]))
  const { data: subjects } = useCollection<any>(useMemo(() => (db ? query(collection(db, "subjects"), orderBy("name", "asc")) : null), [db]))
  const { data: exams } = useCollection<any>(useMemo(() => (db ? query(collection(db, "exams"), orderBy("name", "asc")) : null), [db]))

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
  
  // Mixed Exam Ingestion state
  const [mixedConfig, setMixedConfig] = useState({
    title: "",
    boardId: "",
    examId: "",
    languageMode: "ENGLISH_PUNJABI",
    duration: 120,
    positiveMarks: 1,
    negativeMarks: 0.25,
    orderMode: "subject-wise" as "subject-wise" | "random"
  });

  const [mixedSections, setMixedSections] = useState<IngestionSection[]>([
    { id: nanoid(5), subjectId: "", rawText: "" }
  ]);

  const [stagedQuestions, setStagedQuestions] = useState<any[]>([])
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
              subjectId: metadata.subjectId,
              boardId: metadata.boardId,
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
      // Mixed Mode Parse
      if (!mixedConfig.boardId) {
        toast({ variant: "destructive", title: "Audit Blocked", description: "Select Board first." });
        return;
      }
      
      const validSections = mixedSections.filter(s => s.subjectId && s.rawText.trim());
      if (validSections.length === 0) {
        toast({ variant: "destructive", title: "Audit Blocked", description: "Add at least one subject section with text." });
        return;
      }

      setIsProcessing(true);
      try {
        const allStaged: any[] = [];
        
        validSections.forEach(section => {
          const inputToParse = preprocessText(section.rawText);
          const result = parseBulkQuestions(inputToParse, {
             boardId: mixedConfig.boardId,
             subjectId: section.subjectId,
             languageMode: mixedConfig.languageMode,
             secondaryLanguage: mixedConfig.languageMode.includes('HINDI') ? 'hindi' : 'punjabi'
          });

          if (result?.questions) {
            result.questions.forEach((q: any) => {
              const { errors, warnings } = validateMCQSchema(q);
              allStaged.push({
                ...q,
                subjectId: section.subjectId,
                boardId: mixedConfig.boardId,
                language: mixedConfig.languageMode,
                isValid: errors.length === 0,
                validationErrors: errors,
                validationWarnings: warnings,
                createdBy: profile?.name || "Administrator"
              });
            });
          }
        });

        setStagedQuestions(allStaged);
        toast({ title: "Multi-Section Parse Complete", description: `${allStaged.length} items staged across ${validSections.length} subjects.` });
      } catch (e: any) {
        toast({ variant: "destructive", title: "Parsing Error", description: e.message });
      } finally {
        setIsProcessing(false);
      }
    }
  }

  const handleFinalCommit = async () => {
    if (!db || isSyncing) return;

    const valids = stagedQuestions.filter(q => q.isValid);
    if (valids.length === 0) return;

    setIsSyncing(true);
    const batch = writeBatch(db);

    try {
      const questionIds: string[] = [];
      const sectionMap: Record<string, number> = {};

      valids.forEach(q => {
        const qRef = doc(collection(db, "mcqBank"));
        const { isValid, validationErrors, validationWarnings, ...finalData } = q;
        
        const qId = qRef.id;
        questionIds.push(qId);
        
        // Track section counts for Mixed Exam
        const subName = subjects?.find((s: any) => s.id === q.subjectId)?.name || q.subjectId;
        sectionMap[subName] = (sectionMap[subName] || 0) + 1;

        batch.set(qRef, { 
          ...finalData, 
          id: qId,
          status: ingestionMode === 'mixed' ? 'USED' : 'UNUSED', 
          createdAt: serverTimestamp(), 
          updatedAt: serverTimestamp() 
        });

        // If Mixed Mode, also add to Used Archive immediately to prevent duplicates in other mocks
        if (ingestionMode === 'mixed') {
           const usedRef = doc(db, "usedQuestions", qId);
           batch.set(usedRef, {
             ...finalData,
             id: qId,
             usedAt: serverTimestamp(),
             usedBy: "Bulk Mixed Ingestion",
             status: 'USED'
           });
        }
      });

      // 2. Create the Exam Document if in Mixed Mode
      if (ingestionMode === 'mixed') {
         const mockId = `mock-${nanoid(10)}`;
         const sections = Object.entries(sectionMap).map(([name, count]) => ({ name, count }));
         
         const payload = {
            id: mockId,
            title: mixedConfig.title || "Full Length Exam",
            boardId: mixedConfig.boardId,
            boardIds: [mixedConfig.boardId],
            examIds: mixedConfig.examId ? [mixedConfig.examId] : [],
            mockType: 'FULL' as const,
            accessLevel: 'FREE' as const,
            duration: mixedConfig.duration,
            totalQuestions: valids.length,
            totalMarks: valids.length * mixedConfig.positiveMarks,
            negativeMarks: mixedConfig.negativeMarks,
            positiveMarks: mixedConfig.positiveMarks,
            questionIds,
            sections,
            published: true,
            status: 'PUBLISHED',
            languageMode: mixedConfig.languageMode,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
         };

         batch.set(doc(db, "mocks", mockId), payload);
         
         // Update each question with the mock reference
         valids.forEach((_, i) => {
            const qId = questionIds[i];
            batch.update(doc(db, "mcqBank", qId), {
               usedInMocks: [mockId],
               updatedAt: serverTimestamp()
            });
         });
      }

      await batch.commit();
      
      // Update global counters
      await updateDoc(doc(db, 'settings', 'stats'), { 
         totalQuestions: increment(valids.length),
         totalMocks: ingestionMode === 'mixed' ? increment(1) : increment(0),
         updatedAt: serverTimestamp() 
      }).catch(() => {});

      toast({ title: "Registry Updated", description: `${valids.length} items committed successfully.` });
      
      // Reset
      setStagedQuestions([]);
      if (ingestionMode === 'subject-wise') setRawText("");
      else setMixedSections([{ id: nanoid(5), subjectId: "", rawText: "" }]);

    } catch (e) {
      toast({ variant: "destructive", title: "Commit Failed" });
    } finally {
      setIsSyncing(false);
    }
  }

  const addMixedSection = () => {
    setMixedSections([...mixedSections, { id: nanoid(5), subjectId: "", rawText: "" }]);
  };

  const removeMixedSection = (id: string) => {
    if (mixedSections.length <= 1) return;
    setMixedSections(mixedSections.filter(s => s.id !== id));
  };

  const updateMixedSection = (id: string, field: keyof IngestionSection, value: string) => {
    setMixedSections(mixedSections.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  return (
    <div className="w-full max-w-[1600px] mx-auto space-y-8 pb-32 text-left animate-in fade-in duration-700 pt-2 px-4 md:px-12 overflow-x-hidden">
      <AdminPageHeader
        icon={ClipboardList}
        label="Modular Ingestion Hub"
        title="MCQ Ingestion"
        subtitle="Dedicated extraction for subject-wise or full mixed exams."
      >
        <div className="flex flex-wrap items-center justify-end gap-3 w-full md:w-auto mt-4 md:mt-0">
           <button 
             onClick={() => {
                setStagedQuestions([]);
                if (ingestionMode === 'subject-wise') setRawText("");
                else setMixedSections([{ id: nanoid(5), subjectId: "", rawText: "" }]);
             }} 
             className="h-11 px-6 rounded-xl border border-slate-200 font-bold text-[11px] bg-white hover:bg-slate-50 transition-all flex items-center justify-center whitespace-nowrap"
           >
              Reset
           </button>
           <Button 
             onClick={handleLocalParse} 
             disabled={isProcessing} 
             className="bg-[#0F172A] hover:bg-black text-white rounded-xl h-11 px-8 font-bold text-[11px] gap-3 shadow-xl whitespace-nowrap min-w-fit"
           >
              {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4 text-primary fill-current" />} Parse All
           </Button>
           <Button 
             onClick={handleFinalCommit} 
             disabled={isSyncing || stagedQuestions.filter(q => q.isValid).length === 0} 
             className="bg-primary hover:bg-blue-700 text-white rounded-xl h-11 px-8 font-bold text-[11px] gap-3 shadow-xl whitespace-nowrap min-w-fit"
           >
              {isSyncing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Database className="h-4 w-4" />} Commit Hub
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
                   /* MIXED EXAM INGESTION HUB */
                   <div className="space-y-8 animate-in fade-in duration-300">
                      <div className="space-y-4">
                         <div className="space-y-1.5">
                            <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Exam / Test Name</Label>
                            <Input value={mixedConfig.title} onChange={e => setMixedConfig({...mixedConfig, title: e.target.value})} className="h-14 rounded-xl bg-slate-50 border-none font-bold text-lg" placeholder="ETT Cadre Full Exam" />
                         </div>

                         <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5 text-left">
                               <Label className="text-[9px] font-bold text-slate-400 ml-1">Board authority</Label>
                               <Select value={mixedConfig.boardId} onValueChange={v => setMixedConfig({...mixedConfig, boardId: v})}>
                                  <SelectTrigger className="h-12 bg-slate-50 border-none rounded-xl font-bold w-full"><SelectValue placeholder="Board" /></SelectTrigger>
                                  <SelectContent className="bg-[#0B1528] text-white">{boards?.map(b => <SelectItem key={b.id} value={b.id}>{b.abbreviation}</SelectItem>)}</SelectContent>
                               </Select>
                            </div>
                            <div className="space-y-1.5 text-left">
                               <Label className="text-[9px] font-bold text-slate-400 ml-1">Target vertical</Label>
                               <Select value={mixedConfig.examId} onValueChange={v => setMixedConfig({...mixedConfig, examId: v})}>
                                  <SelectTrigger className="h-12 bg-slate-50 border-none rounded-xl font-bold w-full"><SelectValue placeholder="Vertical" /></SelectTrigger>
                                  <SelectContent className="bg-[#0B1528] text-white">{exams?.filter(e => !mixedConfig.boardId || e.boardId === mixedConfig.boardId).map(e => <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>)}</SelectContent>
                               </Select>
                            </div>
                         </div>
                      </div>

                      <div className="space-y-6 pt-4 border-t border-slate-100">
                         <div className="flex items-center justify-between">
                            <h4 className="text-[11px] font-black uppercase text-slate-500 tracking-widest flex items-center gap-2"><Layers className="h-4 w-4" /> Ingestion sections</h4>
                            <Button onClick={addMixedSection} variant="ghost" size="sm" className="h-8 rounded-lg font-bold text-[9px] uppercase gap-1 text-primary"><Plus className="h-3 w-3" /> Add subject block</Button>
                         </div>

                         <div className="space-y-8">
                            {mixedSections.map((section, idx) => (
                               <div key={section.id} className="p-5 bg-slate-50/50 rounded-[2rem] border border-slate-100 space-y-4 relative group/section">
                                  <div className="flex items-center justify-between">
                                     <div className="flex items-center gap-3">
                                        <div className="h-7 w-7 rounded-lg bg-[#0F172A] text-white flex items-center justify-center font-bold text-xs">{idx + 1}</div>
                                        <div className="w-48">
                                          <Select value={section.subjectId} onValueChange={v => updateMixedSection(section.id, 'subjectId', v)}>
                                             <SelectTrigger className="h-9 bg-white border-slate-200 rounded-lg font-bold text-[10px]"><SelectValue placeholder="Select Subject" /></SelectTrigger>
                                             <SelectContent className="bg-[#0B1528] text-white">{subjects?.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
                                          </Select>
                                        </div>
                                     </div>
                                     {mixedSections.length > 1 && (
                                        <button onClick={() => removeMixedSection(section.id)} className="text-rose-500 hover:bg-rose-50 p-1.5 rounded-lg border-none bg-transparent cursor-pointer"><Trash2 className="h-4 w-4" /></button>
                                     )}
                                  </div>
                                  <Textarea 
                                     value={section.rawText} 
                                     onChange={e => updateMixedSection(section.id, 'rawText', e.target.value)} 
                                     placeholder="Paste this subject's questions here..." 
                                     className="min-h-[120px] bg-white border-none rounded-xl text-xs font-medium shadow-inner p-4" 
                                  />
                               </div>
                            ))}
                         </div>
                      </div>
                   </div>
                 )}

                 <Button 
                   onClick={handleLocalParse} 
                   disabled={isProcessing} 
                   className="w-full h-16 bg-primary hover:bg-blue-700 text-white rounded-2xl font-bold text-[13px] shadow-2xl gap-3 active:scale-95 transition-all border-none"
                 >
                    {isProcessing ? <Loader2 className="h-6 w-6 animate-spin" /> : <Zap className="h-6 w-6 text-white fill-current" />} Initialize Extraction
                 </Button>
              </div>
           </Card>
        </div>

        {/* RIGHT COLUMN: PREVIEW / STAGING */}
        <div className="lg:col-span-7 space-y-6 w-full min-w-0">
           <div className="flex items-center justify-between px-2">
              <h3 className="text-xl font-bold text-[#0F172A] flex items-center gap-4"><Layers className="h-6 w-6 text-primary" /> Staging hub</h3>
              <Badge className="bg-[#0F172A] text-white border-none font-bold text-[10px] px-4 py-1.5 rounded-lg shadow-sm">{stagedQuestions.length} Items</Badge>
           </div>
           
           <div className="space-y-6 w-full">
              {stagedQuestions.map((q, idx) => (
                 <Card key={q.id || idx} className="border-none shadow-lg rounded-[2.5rem] bg-white overflow-hidden border border-slate-100 relative group w-full">
                    <div className={cn("absolute top-0 left-0 w-2 h-full transition-colors", q.isValid ? "bg-emerald-500" : "bg-rose-500")} />
                    <CardHeader className="p-6 md:p-10 pb-0 flex flex-row items-center justify-between">
                       <div className="flex items-center gap-3">
                          <Badge className="bg-[#0B1228] text-white border-none font-bold text-[9px] px-4 py-1 rounded-lg">Item #{idx + 1}</Badge>
                          <Badge variant="outline" className="text-[8px] font-black uppercase text-primary border-primary/20">{subjects?.find(s => s.id === q.subjectId)?.name}</Badge>
                       </div>
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

           {stagedQuestions.length > 0 && (
              <div className="p-8 bg-blue-50 rounded-[2.5rem] border border-blue-100 flex items-start gap-4 shadow-inner text-left">
                 <ShieldCheck className="h-6 w-6 text-blue-600 shrink-0" />
                 <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase text-blue-800 tracking-widest">Ingestion safety node</p>
                    <p className="text-xs text-blue-600 leading-relaxed font-medium">Committing will sync questions to the central bank. In Mixed Exam mode, they will be bundled into a new mock series automatically.</p>
                 </div>
              </div>
           )}
        </div>
      </div>
    </div>
  )
}
