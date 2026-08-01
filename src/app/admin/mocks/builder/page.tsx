"use client"

import React, { useState, useMemo, useEffect, Suspense, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { 
  Database, 
  Loader2,
  Plus,
  Trash2,
  Zap,
  CheckCircle,
  X,
  RefreshCw,
  Check,
  Layers,
  Save,
  GraduationCap,
  AlertCircle,
  Search,
  Landmark,
  BookOpen,
  Target,
  ArrowRight,
  ShieldCheck,
  Timer,
  BookMarked,
  Settings,
  Lock,
  SquarePen
} from "lucide-react"
import { useCollection, useFirestore, useDoc, useUser } from "@/firebase"
import { 
  collection, 
  query, 
  where, 
  doc, 
  setDoc, 
  serverTimestamp, 
  getDocs, 
  writeBatch, 
  documentId, 
  orderBy, 
  updateDoc, 
  increment, 
  addDoc
} from "firebase/firestore"
import { useToast } from "@/hooks/use-toast"
import { MockType, Difficulty, AccessLevel, LanguageDisplayMode, MockAssignmentMode, ExamSection, Exam } from "@/types"
import { cn } from "@/lib/utils"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { AdminPageHeader } from "@/components/admin"
import { mcqEngine, DiagnosticReport } from "@/lib/mcq-engine"
import { motion, AnimatePresence } from "framer-motion"
import { Switch } from "@/components/ui/switch"

/**
 * @fileOverview Master Mock Builder v60.0 [Compact & Hardened].
 * FIXED: Removed malformed Firestore queries and restored full relational metadata.
 * FIXED: Removed all uppercase text classes for Title Case normalization.
 */

export default function MockBuilderPage() {
  return (
    <Suspense fallback={<div className="h-screen flex items-center justify-center bg-white"><Loader2 className="animate-spin text-primary" /></div>}>
      <MockBuilderContent />
    </Suspense>
  )
}

function MockBuilderContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const db = useFirestore()
  const { profile } = useUser()
  const { toast } = useToast()

  const id = searchParams?.get("id") ?? "";
  const isEditing = !!id

  const [bankLoading, setBankLoading] = useState(false);
  const [questionBank, setQuestionBank] = useState<any[]>([])
  const [diagnostic, setDiagnostic] = useState<DiagnosticReport | null>(null)
  const [initError, setInitError] = useState<string | null>(null);
  
  const boardsQuery = useMemo(() => (db ? query(collection(db, "boards"), orderBy("abbreviation", "asc")) : null), [db]);
  const examsQuery = useMemo(() => (db ? collection(db, "exams") : null), [db]);
  const subjectsQuery = useMemo(() => (db ? query(collection(db, "subjects"), orderBy("name", "asc")) : null), [db]);
  const seriesQuery = useMemo(() => (db ? collection(db, "test_series") : null), [db]);
  
  const { data: boards } = useCollection<any>(boardsQuery);
  const { data: rawExams } = useCollection<any>(examsQuery);
  const { data: subjects } = useCollection<any>(subjectsQuery);
  const { data: allSeries } = useCollection<any>(seriesQuery);
  
  const { data: existingMock } = useDoc<any>(useMemo(() => (db && id ? doc(db, "mocks", id) : null), [db, id]))
  
  const [isInitializing, setIsInitializing] = useState(true)
  const [isPublishing, setIsPublishing] = useState(false)
  const [activeRightTab, setActiveRightTab] = useState<'BANK' | 'ASSEMBLY'>('BANK')
  
  const [filterBoard, setFilterBoard] = useState("all")
  const [filterExam, setFilterExam] = useState("all")
  const [filterSubject, setSubjectFilter] = useState("all")
  const [filterStatus, setFilterStatus] = useState("UNUSED")
  const [searchTerm, setSearchTerm] = useState("")
  const [bankSelection, setBankSelection] = useState<string[]>([])
  
  const [mockData, setMockData] = useState<any>({
    title: "", 
    assignmentMode: "MULTIPLE" as MockAssignmentMode,
    boardIds: [] as string[],
    examIds: [] as string[],
    learningSubjectId: "",
    seriesId: "",
    mockType: "FULL" as MockType, 
    duration: 120, 
    difficulty: "Medium" as Difficulty, 
    accessLevel: "FREE" as AccessLevel,
    published: true,
    languageMode: "ENGLISH_PUNJABI" as LanguageDisplayMode,
    positiveMarks: 1,
    negativeMarks: 0.25,
    attemptLimit: 0,
  })

  const [sections, setSections] = useState<any[]>([
    { id: 'sec-1', name: 'General', questions: [] as any[] }
  ])
  const [activeSectionId, setActiveSectionId] = useState('sec-1')

  const fetchFilteredBank = useCallback(async () => {
    if (!db) return;
    setBankLoading(true);
    setDiagnostic(null);
    try {
      const result = await mcqEngine.fetch(db, {
        boardId: filterBoard,
        examId: filterExam,
        subjectId: filterSubject,
        status: filterStatus,
        searchTerm: searchTerm,
      }, 100);

      setQuestionBank(result.data);
      setDiagnostic(result.diagnostic);
    } catch (e: any) {
      setInitError("Registry connection degraded. Retrying...");
    } finally {
      setBankLoading(false);
    }
  }, [db, filterBoard, filterExam, filterSubject, filterStatus, searchTerm]);

  useEffect(() => {
    fetchFilteredBank();
  }, [fetchFilteredBank]);

  useEffect(() => {
    if (!db || !existingMock || !rawExams) {
       if (!isEditing) setIsInitializing(false);
       return;
    }

    setMockData({ 
      ...existingMock,
      assignmentMode: existingMock.assignmentMode || "MULTIPLE",
      boardIds: existingMock.boardIds || (existingMock.boardId ? [existingMock.boardId] : []),
      examIds: existingMock.examIds || (existingMock.examId ? [existingMock.examId] : []),
      accessLevel: existingMock.accessLevel || "FREE"
    });

    const hydrateExisting = async () => {
      if (existingMock.questionIds?.length > 0) {
        const fetched: any[] = [];
        const questionIds = existingMock.questionIds;
        const chunks = [];
        for (let i = 0; i < questionIds.length; i += 30) {
          chunks.push(questionIds.slice(i, i + 30));
        }
        for (const chunk of chunks) {
          const [mcqSnap, usedSnap, legacySnap] = await Promise.all([
            getDocs(query(collection(db, "mcqBank"), where(documentId(), "in", chunk))),
            getDocs(query(collection(db, "usedQuestions"), where(documentId(), "in", chunk))),
            getDocs(query(collection(db, "questions"), where(documentId(), "in", chunk)))
          ]);

          mcqSnap.docs.forEach(d => fetched.push({ ...d.data(), id: d.id }));
          usedSnap.forEach(d => {
            if (!fetched.find(f => f.id === d.id)) fetched.push({ ...d.data(), id: d.id });
          });
          legacySnap.forEach(d => {
            if (!fetched.find(f => f.id === d.id)) fetched.push({ ...d.data(), id: d.id });
          });
        }

        let currentIndex = 0;
        const hydratedSections = (existingMock.sections || [{ name: 'General', count: existingMock.questionIds.length }]).map((s: ExamSection, idx: number) => {
          const count = Number(s.count) || 0;
          const sectionQIds: string[] = (existingMock.questionIds as string[]).slice(currentIndex, currentIndex + count);
          currentIndex += count;
          return { 
            id: `sec-${idx + 1}`, 
            name: s.name, 
            questions: sectionQIds.map((id: string) => fetched.find((q: any) => q.id === id)).filter(Boolean)
          };
        });
        setSections(hydratedSections.length > 0 ? hydratedSections : [{ id: 'sec-1', name: 'General', questions: [] }]);
      }
      setIsInitializing(false);
    };

    hydrateExisting().catch(err => {
      setInitError("Failed to synchronize challenge data.");
      setIsInitializing(false);
    });
  }, [db, existingMock, isEditing, rawExams, id]);

  const uniqueExams = useMemo(() => {
    if (!rawExams) return [];
    if (mockData.boardIds?.length > 0) {
       return rawExams.filter((e: Exam) => mockData.boardIds.includes(e.boardId));
    }
    return rawExams;
  }, [rawExams, mockData.boardIds]);

  const filteredSeries = useMemo(() => {
     if (!allSeries || !mockData.learningSubjectId) return [];
     return allSeries.filter((s: any) => s.subjectId === mockData.learningSubjectId);
  }, [allSeries, mockData.learningSubjectId]);

  const displayBank = useMemo(() => {
    const allSelectedIds = new Set(sections.flatMap((s: any) => (s.questions || []).map((q: any) => q.id)));
    return questionBank.filter(q => !allSelectedIds.has(q.id));
  }, [questionBank, sections]);

  const handleLinkQuestions = () => {
    const toAdd = questionBank.filter((q: any) => bankSelection.includes(q.id));
    setSections((prev: any[]) => prev.map((s: any) => s.id === activeSectionId ? { ...s, questions: [...(s.questions || []), ...toAdd] } : s));
    setBankSelection([]);
    toast({ title: `Linked ${toAdd.length} items` });
  }

  const handlePublish = async (isDraft: boolean) => {
    if (!db || isPublishing) return
    if (!mockData.title?.trim()) {
      toast({ variant: "destructive", title: "Audit blocked", description: "Series title is mandatory." })
      return
    }
    const flatQuestions = sections.flatMap((s: any) => (s.questions || []));
    if (flatQuestions.length === 0) {
       toast({ variant: "destructive", title: "Assembly area empty", description: "Add items to the test series." });
       return;
    }

    setIsPublishing(true)
    const finalId = id || `mock-${Date.now()}`
    const mockRef = doc(db, "mocks", finalId)
    const sectionMetadata = sections.map((s: any) => ({ name: s.name, count: s.questions?.length || 0 })).filter((s: any) => s.count > 0);
    
    const payload = {
      ...mockData,
      id: finalId,
      boardId: mockData.boardIds[0] || "GENERAL",
      examId: mockData.examIds[0] || "GENERAL", 
      totalQuestions: flatQuestions.length,
      questionIds: flatQuestions.map(q => q.id),
      sections: sectionMetadata,
      totalMarks: flatQuestions.length * (Number(mockData.positiveMarks) || 1),
      published: !isDraft,
      status: isDraft ? 'DRAFT' : 'PUBLISHED',
      updatedAt: serverTimestamp(),
      createdAt: id ? (existingMock?.createdAt || serverTimestamp()) : serverTimestamp(),
    };

    try {
      const batch = writeBatch(db);
      
      batch.set(mockRef, payload, { merge: true });

      if (!isDraft) {
        flatQuestions.forEach(q => {
          const usedRef = doc(db, "usedQuestions", q.id);
          const bankRef = doc(db, "mcqBank", q.id);
          const legacyRef = doc(db, "questions", q.id);

          batch.set(usedRef, {
            ...q,
            originalQuestionId: q.id,
            usedAt: serverTimestamp(),
            usedBy: "Mock Builder",
            mockId: finalId,
            mockName: payload.title
          });
          
          batch.delete(bankRef);
          batch.delete(legacyRef);
        });
      }

      await batch.commit();

      if (!isEditing) {
        await updateDoc(doc(db, 'settings', 'stats'), { totalMocks: increment(1), updatedAt: serverTimestamp() }).catch(() => {});
      }

      await addDoc(collection(db, "audit_logs"), {
        user: profile?.name || "Administrator",
        action: isEditing ? "MOCK_UPDATE" : "MOCK_CREATE",
        details: `Mock test "${payload.title}" synchronized. ${isDraft ? 'Saved as Draft' : 'Published & Questions Moved to Archive'}.`,
        timestamp: serverTimestamp()
      });

      toast({ title: "Database synced" });
      router.push("/admin/mocks")
    } catch (e: any) {
      toast({ variant: "destructive", title: "Sync failed" })
    } finally {
      setIsPublishing(false)
    }
  }

  const toggleBoardId = (id: string) => {
     const currentBoards = mockData.boardIds || [];
     const isSelecting = !currentBoards.includes(id);
     
     const nextBoards = isSelecting 
        ? [...currentBoards, id] 
        : currentBoards.filter((x: string) => x !== id);

     let nextExams = [...(mockData.examIds || [])];
     const childExams = (rawExams || []).filter((e: any) => e.boardId === id);
     const childIds = childExams.map((e: any) => e.id);

     if (isSelecting) {
        childIds.forEach(cid => {
           if (!nextExams.includes(cid)) nextExams.push(cid);
        });
     } else {
        nextExams = nextExams.filter(eid => !childIds.includes(eid));
     }

     setMockData({ 
        ...mockData, 
        boardIds: nextBoards,
        examIds: nextExams
     });
  };

  const toggleExamId = (id: string) => {
     const current = mockData.examIds || [];
     setMockData({ ...mockData, examIds: current.includes(id) ? current.filter((x: string) => x !== id) : [...current, id] });
  };

  if (isInitializing) return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-white space-y-4">
       <Zap className="h-10 w-10 text-primary animate-pulse" />
       <p className="text-[10px] font-black uppercase text-slate-300">Loading database...</p>
    </div>
  );

  if (initError) return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-white p-6 text-center space-y-4">
       <div className="h-14 w-14 bg-rose-50 rounded-2xl flex items-center justify-center mx-auto text-rose-500 shadow-lg border border-rose-100">
          <AlertCircle className="h-7 w-7" />
       </div>
       <div className="space-y-2 max-w-sm mx-auto">
          <h2 className="text-xl font-black text-[#0F172A] tracking-tight">Sync failure</h2>
          <p className="text-slate-500 font-medium leading-relaxed text-xs">{initError}</p>
       </div>
       <div className="flex flex-col gap-2 w-full max-w-xs">
          <Button onClick={() => window.location.reload()} className="h-11 bg-primary hover:bg-blue-700 text-white rounded-xl font-bold gap-2">
             <RefreshCw className="h-4 w-4" /> Retry synchronization
          </Button>
          <Button onClick={() => router.replace('/admin/mocks')} variant="ghost" className="h-9 text-slate-400 font-bold uppercase text-[9px]">Return to list</Button>
       </div>
    </div>
  );

  const showHierarchy = ['FULL', 'SUBJECT', 'SECTIONAL'].includes(mockData.mockType);

  return (
    <div className="max-w-[1600px] mx-auto space-y-4 md:space-y-6 pb-40 text-left pt-2 px-2 md:px-6 break-words">
      <AdminPageHeader
        icon={SquarePen}
        label="Assembly area"
        title={isEditing ? "Modify series" : "Mock builder"}
        subtitle="Manage structure and details for the test series."
      >
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 w-full md:w-auto mt-4 md:mt-0">
           <button onClick={() => router.back()} className="h-10 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition-all border-none cursor-pointer text-slate-400 font-bold uppercase text-[9px]">Discard</button>
           <Button onClick={() => handlePublish(true)} disabled={isPublishing} variant="outline" className="h-10 px-4 rounded-xl font-bold uppercase text-[9px] tracking-tight border-slate-200">
              {isPublishing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save draft
           </Button>
           <Button onClick={() => handlePublish(false)} disabled={isPublishing} className="h-10 px-5 bg-primary hover:bg-blue-700 text-white rounded-full font-bold uppercase text-[9px] tracking-tight shadow-xl gap-2 border-none transition-all active:scale-95">
              {isPublishing ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />} Sync live
           </Button>
        </div>
      </AdminPageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
        <div className="lg:col-span-4 space-y-4">
           <Card className="border-none shadow-lg rounded-2xl bg-white p-5 md:p-6 space-y-6 border border-slate-50">
              <div className="space-y-1 text-left">
                 <Label className="text-[9px] font-bold uppercase text-slate-400 ml-1">Series title</Label>
                 <Input value={mockData.title} onChange={e => setMockData((p: any) => ({...p, title: e.target.value}))} className="h-10 rounded-xl bg-slate-50 border-none font-bold text-sm px-4 shadow-inner text-[#0F172A]" placeholder="e.g. Clerk Mock Series 01" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                 <div className="space-y-1 text-left">
                    <Label className="text-[9px] font-bold text-slate-400 ml-1 uppercase">Test type</Label>
                    <select value={mockData.mockType} onChange={e => setMockData((p: any) => ({...p, mockType: e.target.value}))} className="w-full h-9 md:h-10 bg-slate-50 border-none rounded-xl px-3 outline-none font-bold text-[10px] shadow-inner text-[#0F172A]">
                       <option value="FULL">Full Length</option>
                       <option value="SUBJECT">Subject-Wise</option>
                       <option value="SECTIONAL">Sectional</option>
                       <option value="PYQ">Official Paper (PYQ)</option>
                       <option value="CA_QUIZ">Current Affairs Quiz</option>
                    </select>
                 </div>
                 <div className="space-y-1 text-left">
                    <Label className="text-[9px] font-bold text-slate-400 ml-1 uppercase">Access tier</Label>
                    <select value={mockData.accessLevel} onChange={e => setMockData((p: any) => ({...p, accessLevel: e.target.value}))} className="w-full h-9 md:h-10 bg-slate-50 border-none rounded-xl px-3 outline-none font-bold text-[10px] shadow-inner text-[#0F172A]">
                       <option value="FREE">Free Preview</option>
                       <option value="PREMIUM">Premium Lock</option>
                    </select>
                 </div>
              </div>

              <AnimatePresence>
                {showHierarchy && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="space-y-3 overflow-hidden pt-3 border-t border-slate-50"
                  >
                    <div className="flex items-center justify-between px-1">
                        <Label className="text-[8px] font-black uppercase text-primary flex items-center gap-2">
                           <Layers className="h-3 w-3" /> Folder mapping
                        </Label>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1 text-left">
                            <Label className="text-[8px] font-bold text-slate-400 ml-1 uppercase">Subject hub</Label>
                            <select 
                              value={mockData.learningSubjectId || ""} 
                              onChange={e => setMockData({...mockData, learningSubjectId: e.target.value, seriesId: ""})}
                              className="w-full h-9 bg-blue-50 border-none rounded-xl px-3 font-bold text-[9px] outline-none shadow-sm text-[#0F172A]"
                            >
                                <option value="">Select hub</option>
                                {subjects?.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                        </div>
                        <div className="space-y-1 text-left">
                            <Label className="text-[8px] font-bold text-slate-400 uppercase tracking-widest ml-1">Series node</Label>
                            <select 
                              value={mockData.seriesId || ""} 
                              onChange={e => setMockData({...mockData, seriesId: e.target.value})}
                              className="w-full h-9 bg-blue-50 border-none rounded-xl px-3 font-bold text-[9px] outline-none shadow-sm text-[#0F172A]"
                              disabled={!mockData.learningSubjectId}
                            >
                                <option value="">Uncategorized</option>
                                {filteredSeries.map((s: any) => <option key={s.id} value={s.id}>{s.title}</option>)}
                            </select>
                        </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="grid grid-cols-2 gap-3">
                 <div className="space-y-1 text-left">
                    <Label className="text-[9px] font-bold text-slate-400 ml-1 uppercase">Duration (Min)</Label>
                    <Input type="number" value={mockData.duration} onChange={e => setMockData((p: any) => ({...p, duration: parseInt(e.target.value) || 0}))} className="h-9 md:h-10 rounded-xl bg-slate-50 border-none font-black text-center text-[10px] shadow-inner text-[#0F172A]" />
                 </div>
                 <div className="space-y-1 text-left">
                    <Label className="text-[9px] font-bold text-slate-400 ml-1 uppercase">Difficulty</Label>
                    <select value={mockData.difficulty} onChange={e => setMockData((p: any) => ({...p, difficulty: e.target.value}))} className="w-full h-9 md:h-10 bg-slate-50 border-none rounded-xl px-3 outline-none font-bold text-[10px] shadow-inner text-[#0F172A]">
                       <option value="Easy">Easy</option>
                       <option value="Medium">Medium</option>
                       <option value="Hard">Hard</option>
                    </select>
                 </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                 <div className="space-y-1 text-left">
                    <Label className="text-[9px] font-bold text-slate-400 ml-1 uppercase">Pts per item</Label>
                    <Input type="number" step="0.25" value={mockData.positiveMarks} onChange={e => setMockData((p: any) => ({...p, positiveMarks: parseFloat(e.target.value) || 1}))} className="h-9 md:h-10 rounded-xl bg-slate-50 border-none font-black text-center text-[10px] text-emerald-600 shadow-inner" />
                 </div>
                 <div className="space-y-1 text-left">
                    <Label className="text-[9px] font-bold text-slate-400 ml-1 uppercase">Negative penalty</Label>
                    <Input type="number" step="0.25" value={mockData.negativeMarks} onChange={e => setMockData((p: any) => ({...p, negativeMarks: parseFloat(e.target.value) || 0}))} className="h-9 md:h-10 rounded-xl bg-slate-50 border-none font-black text-center text-[10px] text-rose-500 shadow-inner" />
                 </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-slate-100">
                 <div className="space-y-2">
                    <div className="flex items-center gap-2">
                       <Landmark className="h-3.5 w-3.5 text-primary" />
                       <h4 className="text-[9px] font-black text-[#0F172A] uppercase tracking-tight">Authority mapping</h4>
                    </div>
                    <div className="grid grid-cols-1 gap-1.5 max-h-24 overflow-y-auto custom-scrollbar pr-1">
                       {boards?.map((b: any) => {
                          const isSelected = mockData.boardIds?.includes(b.id);
                          return (
                             <div 
                                key={b.id} 
                                onClick={() => toggleBoardId(b.id)} 
                                className={cn(
                                   "flex items-center justify-between p-2 rounded-lg border-2 transition-all cursor-pointer group active:scale-[0.98]",
                                   isSelected ? "bg-primary/5 border-primary" : "bg-white border-slate-50 hover:border-slate-200"
                                )}
                             >
                                <div className="flex items-center gap-2">
                                   <div className={cn(
                                      "h-3 w-3 rounded-md border-2 flex items-center justify-center transition-all",
                                      isSelected ? "bg-primary border-primary" : "bg-white border-slate-200 group-hover:border-slate-300"
                                   )}>
                                      {isSelected && <Check className="h-2 w-2 text-white stroke-[4px]" />}
                                   </div>
                                   <span className={cn("text-[9px] font-bold uppercase transition-colors", isSelected ? "text-primary" : "text-slate-500")}>
                                      {b.abbreviation}
                                   </span>
                                </div>
                             </div>
                          )
                       })}
                    </div>
                 </div>

                 <div className="space-y-2 pt-2 border-t border-slate-100">
                    <div className="flex items-center gap-2">
                       <Target className="h-3.5 w-3.5 text-emerald-600" />
                       <h4 className="text-[9px] font-black text-[#0F172A] uppercase tracking-tight">Exam mapping</h4>
                    </div>
                    <div className="grid grid-cols-1 gap-1.5 max-h-24 overflow-y-auto custom-scrollbar pr-1">
                       {uniqueExams.map((e: any) => {
                          const isSelected = mockData.examIds?.includes(e.id);
                          return (
                             <div 
                                key={e.id} 
                                onClick={() => toggleExamId(e.id)} 
                                className={cn(
                                   "flex items-center justify-between p-2 rounded-lg border-2 transition-all cursor-pointer group active:scale-[0.98]",
                                   isSelected ? "bg-emerald-50 border-emerald-500" : "bg-white border-slate-50 hover:border-slate-200"
                                )}
                             >
                                <div className="flex items-center gap-2">
                                   <div className={cn(
                                      "h-3 w-3 rounded-md border-2 flex items-center justify-center transition-all",
                                      isSelected ? "bg-emerald-600 border-emerald-600" : "bg-white border-slate-200 group-hover:border-slate-300"
                                   )}>
                                      {isSelected && <Check className="h-2 w-2 text-white stroke-[4px]" />}
                                   </div>
                                   <span className={cn("text-[8px] font-bold uppercase transition-colors truncate max-w-[140px]", isSelected ? "text-emerald-700" : "text-slate-500")}>
                                      {e.name}
                                   </span>
                                </div>
                             </div>
                          )
                       })}
                    </div>
                 </div>

                 <div className="space-y-2 pt-2 border-t border-slate-100">
                    <div className={cn("p-3 rounded-xl border flex items-center justify-between transition-all", mockData.published ? "bg-white border-slate-100 shadow-sm" : "bg-slate-50 opacity-60")}>
                       <div className="space-y-0.5 text-left">
                          <p className="text-[9px] font-bold uppercase text-[#0F172A] tracking-tight">Activation</p>
                          <p className="text-[7px] font-bold text-slate-400 uppercase tracking-widest leading-none">Live feed access</p>
                       </div>
                       <Switch checked={mockData.published} onCheckedChange={v => setMockData({...mockData, published: v})} />
                    </div>
                 </div>
              </div>
           </Card>
        </div>

        <div className="lg:col-span-8 space-y-6">
           <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl w-fit mb-2">
              <button onClick={() => setActiveRightTab('BANK')} className={cn("px-5 py-2 rounded-lg font-bold uppercase text-[9px] tracking-tight transition-all bg-transparent border-none cursor-pointer", activeRightTab === 'BANK' ? "bg-white text-[#0F172A] shadow-sm" : "text-slate-400 hover:text-slate-600")}>Database pool</button>
              <button onClick={() => setActiveRightTab('ASSEMBLY')} className={cn("px-5 py-2 rounded-lg font-bold uppercase text-[9px] tracking-tight transition-all bg-transparent border-none cursor-pointer", activeRightTab === 'ASSEMBLY' ? "bg-white text-[#0F172A] shadow-sm" : "text-slate-400 hover:text-slate-600")}>Composition</button>
           </div>

           {activeRightTab === 'BANK' ? (
             <div className="space-y-6 animate-in zoom-in-95 duration-500 relative">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 px-1">
                     <PremiumFilterCard 
                        icon={<Landmark className="text-blue-500" />}
                        label="Board"
                        value={filterBoard}
                        onChange={(v: string) => { setFilterBoard(v); setFilterExam('all'); }}
                        options={boards?.map((b: any) => ({ label: b.abbreviation, value: b.id })) || []}
                     />
                     <PremiumFilterCard 
                        icon={<BookOpen className="text-emerald-500" />}
                        label="Subject"
                        value={filterSubject}
                        onChange={setSubjectFilter}
                        options={subjects?.map((s: any) => ({ label: s.name, value: s.id })) || []}
                     />
                     <PremiumFilterCard 
                        icon={<Target className="text-rose-500" />}
                        label="Status"
                        value={filterStatus}
                        onChange={setFilterStatus}
                        options={[{ label: 'Unused', value: 'UNUSED' }, { label: 'Used', value: 'USED' }]}
                     />
                  </div>

                  <div className="relative group w-full px-1">
                     <div className="relative flex items-center h-10 bg-white border border-slate-100 rounded-xl shadow-sm px-4 gap-3">
                        <Search className="h-3.5 w-3.5 text-slate-400" />
                        <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="flex-1 bg-transparent border-none outline-none font-bold text-slate-700 placeholder:text-slate-300 text-[11px]" placeholder="Search statements..." />
                     </div>
                  </div>

                  <div className="grid grid-cols-1 px-1">
                     <Card className="border border-slate-100 shadow-xl rounded-2xl bg-white p-4 text-left">
                        <div className="flex flex-col md:flex-row items-center gap-4">
                           <div className="relative shrink-0 flex items-center justify-center w-12 h-12">
                              <svg className="absolute inset-0 h-full w-full transform -rotate-90">
                                 <circle cx="50%" cy="50%" r="42%" className="stroke-slate-100 fill-none" strokeWidth="3" />
                                 <motion.circle 
                                    cx="50%" cy="50%" r="42%" 
                                    className="stroke-[#2563EB] fill-none" 
                                    strokeWidth="3" 
                                    strokeLinecap="round"
                                    animate={{ strokeDashoffset: 130 - (130 * Math.min(bankSelection.length, 100) / 100) }}
                                    style={{ strokeDasharray: 130 }}
                                 />
                              </svg>
                              <span className="text-sm font-black text-[#0F172A] tabular-nums leading-none">{bankSelection.length}</span>
                           </div>

                           <div className="flex-1 space-y-2 text-center md:text-left w-full min-w-0">
                              <div className="space-y-0.5">
                                 <h4 className="text-sm font-black text-[#0F172A] uppercase tracking-tight">Assets Staged</h4>
                                 <p className="text-[9px] font-medium text-slate-500 uppercase">Selection ready</p>
                              </div>
                              <Button 
                                onClick={handleLinkQuestions} 
                                disabled={bankSelection.length === 0} 
                                className="w-full md:w-auto h-9 bg-[#0F172A] hover:bg-black text-white font-black uppercase text-[8px] tracking-widest rounded-xl shadow-lg border-none active:scale-95 flex items-center justify-center gap-2 px-6"
                              >
                                 Link items <ArrowRight className="h-3 w-3" />
                              </Button>
                           </div>
                        </div>
                     </Card>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-2 pt-2 px-1">
                   {bankLoading ? (
                      Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-14 w-full rounded-xl bg-white" />)
                   ) : displayBank.length > 0 ? displayBank.map((q: any) => {
                      const isSelected = bankSelection.includes(q.id);
                      return (
                        <div key={q.id} onClick={() => setBankSelection((p: string[]) => isSelected ? p.filter(id => id !== q.id) : [...p, q.id])} className={cn("p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between group", isSelected ? "bg-primary/5 border-primary shadow-sm" : "bg-white border-slate-50 hover:border-slate-100 shadow-sm")}>
                           <div className="flex items-center gap-3 min-w-0">
                              <div className={cn("h-4 w-4 rounded-full border flex items-center justify-center shrink-0 transition-all", isSelected ? "bg-primary border-primary" : "bg-white border-slate-200")}>
                                 {isSelected && <Check className="h-2 w-2 text-white stroke-[4px]" />}
                              </div>
                              <div className="min-w-0 text-left">
                                 <p className="font-bold text-[#0F172A] text-[11px] leading-tight break-words line-clamp-1">{q.englishQuestion}</p>
                                 <div className="flex items-center gap-2 mt-0.5">
                                    <Badge className="bg-slate-50 text-slate-500 border-none text-[7px] font-black uppercase px-1 py-0.5 rounded shadow-sm">{subjects?.find((s:any) => s.id === q.subjectId)?.name || 'General'}</Badge>
                                    <span className="text-[8px] font-bold text-slate-300 uppercase tracking-widest">{q.difficulty}</span>
                                 </div>
                              </div>
                           </div>
                        </div>
                      )
                   }) : (
                      <div className="py-20 text-center opacity-20 italic uppercase font-black tracking-widest text-xs flex flex-col items-center gap-3">
                         <Database className="h-8 w-8" />
                         Empty Pool
                      </div>
                   )}
                </div>
             </div>
           ) : (
             <div className="space-y-4 animate-in fade-in duration-500 px-1">
                <div className="flex items-center justify-between">
                   <h3 className="text-base font-black text-[#0F172A] uppercase flex items-center gap-2">
                      <Layers className="h-4 w-4 text-primary" /> Active area
                   </h3>
                   <Popover>
                      <PopoverTrigger asChild>
                         <button className="h-8 px-3 bg-[#0F172A] hover:bg-black text-white font-bold text-[8px] uppercase rounded-lg shadow-md flex items-center justify-center gap-2 border-none cursor-pointer">
                            <Plus className="h-3 w-3" /> Add section
                         </button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[260px] p-4 bg-[#0F172A] text-white rounded-2xl border-white/10 shadow-5xl z-[1001]">
                         <div className="space-y-2">
                            <Label className="text-[8px] font-black uppercase text-primary tracking-widest ml-1 text-left block">Section name</Label>
                            <Input placeholder="e.g. Punjab History" className="h-9 bg-white/5 border-white/10 text-white rounded-lg font-bold px-3 shadow-inner text-xs" onKeyDown={(e) => {
                               if(e.key === 'Enter') {
                                  const val = (e.target as HTMLInputElement).value;
                                  if(val.trim()) { setSections([...sections, { id: `sec-${Date.now()}`, name: val.trim(), questions: [] }]); (e.target as HTMLInputElement).value = ""; }
                               }
                            }} />
                         </div>
                      </PopoverContent>
                   </Popover>
                </div>
                
                <div className="grid grid-cols-1 gap-3">
                   {sections.map((sec: any, sIdx: number) => (
                        <Card key={sec.id} className="border-none shadow-md rounded-xl bg-white overflow-hidden border border-slate-100">
                           <div className="flex items-center justify-between p-3 md:p-4 bg-slate-50/50 border-b border-slate-50">
                              <div className="flex items-center gap-3">
                                 <div className="h-7 w-7 rounded-lg bg-[#0F172A] text-white flex items-center justify-center font-black text-xs shadow-md">{sIdx + 1}</div>
                                 <div className="text-left">
                                    <Input value={sec.name} onChange={e => setSections((p: any[]) => p.map((s: any) => s.id === sec.id ? { ...s, name: e.target.value } : s))} className="h-6 p-0 bg-transparent border-none font-black text-sm md:text-lg focus-visible:ring-0 text-[#0F172A] uppercase" />
                                    <p className="text-[7px] font-bold text-slate-400 uppercase mt-0.5">{(sec.questions?.length || 0)} items</p>
                                 </div>
                              </div>
                              <div className="flex gap-2">
                                 <button onClick={() => setActiveSectionId(sec.id)} className={cn("px-2.5 py-1 rounded-lg font-black text-[7px] uppercase transition-all shadow-sm cursor-pointer", activeSectionId === sec.id ? "bg-primary text-white" : "bg-white text-slate-400")}>{activeSectionId === sec.id ? 'Focus' : 'Select'}</button>
                                 <button onClick={() => setSections((p: any[]) => p.filter((s: any) => s.id !== sec.id))} className="text-rose-500 hover:bg-rose-50 rounded-lg h-7 w-7 flex items-center justify-center border-none bg-transparent cursor-pointer"><Trash2 className="h-3.5 w-3.5" /></button>
                              </div>
                           </div>
                           <div className="p-3 md:p-4 space-y-1.5">
                              {sec.questions?.map((q: any, qIdx: number) => (
                                 <div key={q.id} className="flex items-center justify-between p-2 md:px-4 bg-white border border-slate-50 rounded-lg group transition-all">
                                    <div className="flex items-center gap-3 min-w-0 text-left">
                                       <span className="text-[9px] font-black text-primary tabular-nums shrink-0">#{qIdx + 1}</span>
                                       <p className="font-bold text-[#0F172A] text-[10px] md:text-[11px] truncate max-w-md">{q.englishQuestion}</p>
                                    </div>
                                    <button onClick={() => setSections((p: any[]) => p.map((s: any) => s.id === sec.id ? { ...s, questions: s.questions?.filter((item: any) => item.id !== q.id) || [] } : s))} className="text-slate-300 hover:text-rose-500 transition-colors p-1 active:scale-90 border-none bg-transparent cursor-pointer"><X className="h-3 w-3" /></button>
                                 </div>
                              ))}
                           </div>
                        </Card>
                   ))}
                </div>
             </div>
           )}
        </div>
      </div>
    </div>
  )
}

function PremiumFilterCard({ icon, label, value, onChange, options }: any) {
   return (
      <Card className="border border-slate-100 bg-white shadow-sm hover:shadow-md transition-all rounded-xl p-3 space-y-2 group h-full">
         <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-slate-50 flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform">
               {React.isValidElement(icon) ? React.cloneElement(icon as React.ReactElement, { className: "h-3.5 w-3.5" }) : null}
            </div>
            <span className="text-[9px] font-black uppercase text-slate-400 tracking-tight">{label}</span>
         </div>
         <select 
            value={value} 
            onChange={e => onChange(e.target.value)} 
            className="w-full h-8 bg-slate-50 border-none rounded-lg px-2 font-bold text-[9px] outline-none appearance-none cursor-pointer text-[#0F172A]"
         >
            <option value="all">All</option>
            {options.map((opt: any) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
         </select>
      </Card>
   );
}
