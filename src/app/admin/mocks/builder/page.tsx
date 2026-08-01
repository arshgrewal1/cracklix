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
 * @fileOverview Master Mock Builder v59.0 [Compact & Hardened].
 * FIXED: Removed all merge conflict markers and malformed queries.
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
        const chunks = [];
        const questionIds = existingMock.questionIds;
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
    <div className="h-screen w-full flex flex-col items-center justify-center bg-white p-10 text-center space-y-6">
       <div className="h-16 w-16 bg-rose-50 rounded-2xl flex items-center justify-center mx-auto text-rose-500 shadow-xl border border-rose-100">
          <AlertCircle className="h-8 w-8" />
       </div>
       <div className="space-y-2 max-w-sm mx-auto">
          <h2 className="text-xl md:text-2xl font-black text-[#0F172A] tracking-tight">Sync failure</h2>
          <p className="text-slate-500 font-medium leading-relaxed text-sm">{initError}</p>
       </div>
       <div className="flex flex-col gap-3 w-full max-w-xs">
          <Button onClick={() => window.location.reload()} className="h-12 bg-primary hover:bg-blue-700 text-white rounded-xl font-bold gap-2">
             <RefreshCw className="h-4 w-4" /> Retry synchronization
          </Button>
          <Button onClick={() => router.replace('/admin/mocks')} variant="ghost" className="h-10 text-slate-400 font-bold uppercase text-[9px]">Return to list</Button>
       </div>
    </div>
  );

  const showHierarchy = ['FULL', 'SUBJECT', 'SECTIONAL'].includes(mockData.mockType);

  return (
    <div className="max-w-[1600px] mx-auto space-y-6 md:space-y-8 pb-40 text-left pt-2 px-4 md:px-10 break-words">
      <AdminPageHeader
        icon={SquarePen}
        label="Assembly area"
        title={isEditing ? "Modify series" : "Mock builder"}
        subtitle="Manage structure and details for the test series."
      >
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 w-full md:w-auto mt-4 md:mt-0">
           <button onClick={() => router.back()} className="h-12 px-5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition-all border-none cursor-pointer text-slate-400 font-bold uppercase text-[9px]">Discard</button>
           <Button onClick={() => handlePublish(true)} disabled={isPublishing} variant="outline" className="h-12 px-5 rounded-xl font-bold uppercase text-[9px] tracking-tight border-slate-200">
              {isPublishing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save draft
           </Button>
           <Button onClick={() => handlePublish(false)} disabled={isPublishing} className="h-12 px-6 bg-primary hover:bg-blue-700 text-white rounded-full font-bold uppercase text-[9px] tracking-tight shadow-xl gap-2 border-none transition-all active:scale-95">
              {isPublishing ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />} Sync live
           </Button>
        </div>
      </AdminPageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
        <div className="lg:col-span-4 space-y-6">
           <Card className="border-none shadow-lg rounded-2xl bg-white p-5 md:p-8 space-y-6 border border-slate-50">
              <div className="space-y-1 text-left">
                 <Label className="text-[9px] font-bold uppercase text-slate-400 ml-1">Series title</Label>
                 <Input value={mockData.title} onChange={e => setMockData((p: any) => ({...p, title: e.target.value}))} className="h-11 md:h-12 rounded-xl bg-slate-50 border-none font-bold text-sm px-4 shadow-inner text-[#0F172A]" placeholder="e.g. Clerk Mock Series 01" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                 <div className="space-y-1 text-left">
                    <Label className="text-[9px] font-bold text-slate-400 ml-1 uppercase">Test type</Label>
                    <select value={mockData.mockType} onChange={e => setMockData((p: any) => ({...p, mockType: e.target.value}))} className="w-full h-10 md:h-11 bg-slate-50 border-none rounded-xl px-3 outline-none font-bold text-[11px] shadow-inner text-[#0F172A]">
                       <option value="FULL">Full Length</option>
                       <option value="SUBJECT">Subject-Wise</option>
                       <option value="SECTIONAL">Sectional</option>
                       <option value="PYQ">Official Paper (PYQ)</option>
                       <option value="CA_QUIZ">Current Affairs Quiz</option>
                    </select>
                 </div>
                 <div className="space-y-1 text-left">
                    <Label className="text-[9px] font-bold text-slate-400 ml-1 uppercase">Test access tier</Label>
                    <select value={mockData.accessLevel} onChange={e => setMockData((p: any) => ({...p, accessLevel: e.target.value}))} className="w-full h-10 md:h-11 bg-slate-50 border-none rounded-xl px-3 outline-none font-bold text-[11px] shadow-inner text-[#0F172A]">
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
                    className="space-y-4 overflow-hidden pt-4 border-t border-slate-50"
                  >
                    <div className="flex items-center justify-between px-1">
                        <Label className="text-[9px] font-black uppercase text-primary flex items-center gap-2">
                           <Layers className="h-3 w-3" /> Folder mapping
                        </Label>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1 text-left">
                            <Label className="text-[8px] font-bold text-slate-400 ml-1 uppercase">Subject hub</Label>
                            <select 
                              value={mockData.learningSubjectId || ""} 
                              onChange={e => setMockData({...mockData, learningSubjectId: e.target.value, seriesId: ""})}
                              className="w-full h-10 bg-blue-50 border-none rounded-xl px-3 font-bold text-[10px] outline-none shadow-sm text-[#0F172A]"
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
                              className="w-full h-10 bg-blue-50 border-none rounded-xl px-3 font-bold text-[10px] outline-none shadow-sm text-[#0F172A]"
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
                    <Input type="number" value={mockData.duration} onChange={e => setMockData((p: any) => ({...p, duration: parseInt(e.target.value) || 0}))} className="h-10 md:h-11 rounded-xl bg-slate-50 border-none font-black text-center text-[11px] shadow-inner text-[#0F172A]" />
                 </div>
                 <div className="space-y-1 text-left">
                    <Label className="text-[9px] font-bold text-slate-400 ml-1 uppercase">Difficulty</Label>
                    <select value={mockData.difficulty} onChange={e => setMockData((p: any) => ({...p, difficulty: e.target.value}))} className="w-full h-10 md:h-11 bg-slate-50 border-none rounded-xl px-3 outline-none font-bold text-[11px] shadow-inner text-[#0F172A]">
                       <option value="Easy">Easy</option>
                       <option value="Medium">Medium</option>
                       <option value="Hard">Hard</option>
                    </select>
                 </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                 <div className="space-y-1 text-left">
                    <Label className="text-[9px] font-bold text-slate-400 ml-1 uppercase">Points per item</Label>
                    <Input type="number" step="0.25" value={mockData.positiveMarks} onChange={e => setMockData((p: any) => ({...p, positiveMarks: parseFloat(e.target.value) || 1}))} className="h-10 md:h-11 rounded-xl bg-slate-50 border-none font-black text-center text-[11px] text-emerald-600 shadow-inner" />
                 </div>
                 <div className="space-y-1 text-left">
                    <Label className="text-[9px] font-bold text-slate-400 ml-1 uppercase">Negative penalty</Label>
                    <Input type="number" step="0.25" value={mockData.negativeMarks} onChange={e => setMockData((p: any) => ({...p, negativeMarks: parseFloat(e.target.value) || 0}))} className="h-10 md:h-11 rounded-xl bg-slate-50 border-none font-black text-center text-[11px] text-rose-500 shadow-inner" />
                 </div>
              </div>

              <div className="space-y-6 pt-6 border-t border-slate-100">
                 <div className="space-y-4">
                    <div className="flex items-center gap-3">
                       <div className="h-8 w-8 rounded-full bg-blue-50 flex items-center justify-center text-primary shadow-sm border border-blue-100">
                          <Landmark className="h-4 w-4" />
                       </div>
                       <div className="space-y-0.5 text-left">
                          <h4 className="text-[11px] font-black text-[#0F172A] uppercase tracking-tight">Authority hub</h4>
                       </div>
                    </div>
                    <div className="grid grid-cols-1 gap-2 max-h-32 overflow-y-auto custom-scrollbar pr-1">
                       {boards?.map((b: any) => {
                          const isSelected = mockData.boardIds?.includes(b.id);
                          return (
                             <div 
                                key={b.id} 
                                onClick={() => toggleBoardId(b.id)} 
                                className={cn(
                                   "flex items-center justify-between p-3 rounded-xl border-2 transition-all cursor-pointer group active:scale-[0.98]",
                                   isSelected ? "bg-primary/5 border-primary" : "bg-white border-slate-50 hover:border-slate-200"
                                )}
                             >
                                <div className="flex items-center gap-2">
                                   <div className={cn(
                                      "h-3.5 w-3.5 rounded-md border-2 flex items-center justify-center transition-all",
                                      isSelected ? "bg-primary border-primary" : "bg-white border-slate-200 group-hover:border-slate-300"
                                   )}>
                                      {isSelected && <Check className="h-2 w-2 text-white stroke-[4px]" />}
                                   </div>
                                   <span className={cn("text-[10px] font-bold uppercase transition-colors", isSelected ? "text-primary" : "text-slate-500")}>
                                      {b.abbreviation}
                                   </span>
                                </div>
                             </div>
                          )
                       })}
                    </div>
                 </div>

                 <div className="space-y-4 pt-4 border-t border-slate-100">
                    <div className="flex items-center gap-3">
                       <div className="h-8 w-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 shadow-sm border border-emerald-100">
                          <Target className="h-4 w-4" />
                       </div>
                       <div className="space-y-0.5 text-left">
                          <h4 className="text-[11px] font-black text-[#0F172A] uppercase tracking-tight">Exam vertical</h4>
                       </div>
                    </div>
                    <div className="grid grid-cols-1 gap-2 max-h-32 overflow-y-auto custom-scrollbar pr-1">
                       {uniqueExams.map((e: any) => {
                          const isSelected = mockData.examIds?.includes(e.id);
                          return (
                             <div 
                                key={e.id} 
                                onClick={() => toggleExamId(e.id)} 
                                className={cn(
                                   "flex items-center justify-between p-3 rounded-xl border-2 transition-all cursor-pointer group active:scale-[0.98]",
                                   isSelected ? "bg-emerald-50 border-emerald-500" : "bg-white border-slate-50 hover:border-slate-200"
                                )}
                             >
                                <div className="flex items-center gap-2">
                                   <div className={cn(
                                      "h-3.5 w-3.5 rounded-md border-2 flex items-center justify-center transition-all",
                                      isSelected ? "bg-emerald-600 border-emerald-600" : "bg-white border-slate-200 group-hover:border-slate-300"
                                   )}>
                                      {isSelected && <Check className="h-2 w-2 text-white stroke-[4px]" />}
                                   </div>
                                   <span className={cn("text-[9px] font-bold uppercase transition-colors truncate max-w-[140px]", isSelected ? "text-emerald-700" : "text-slate-500")}>
                                      {e.name}
                                   </span>
                                </div>
                             </div>
                          )
                       })}
                    </div>
                 </div>

                 <div className="space-y-4 pt-4 border-t border-slate-100">
                    <div className={cn("p-4 rounded-xl border flex items-center justify-between transition-all", mockData.published ? "bg-white border-slate-100 shadow-sm" : "bg-slate-50 opacity-60")}>
                       <div className="space-y-0.5 text-left">
                          <p className="text-[10px] font-bold uppercase text-[#0F172A] tracking-tight">Activation</p>
                          <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Live feed access</p>
                       </div>
                       <Switch checked={mockData.published} onCheckedChange={v => setMockData({...mockData, published: v})} />
                    </div>
                 </div>
              </div>
           </Card>
        </div>

        <div className="lg:col-span-8 space-y-8">
           <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl w-fit mb-2">
              <button onClick={() => setActiveRightTab('BANK')} className={cn("px-6 py-2 rounded-lg font-bold uppercase text-[9px] tracking-tight transition-all bg-transparent border-none cursor-pointer", activeRightTab === 'BANK' ? "bg-white text-[#0F172A] shadow-md" : "text-slate-400 hover:text-slate-600")}>Database pool</button>
              <button onClick={() => setActiveRightTab('ASSEMBLY')} className={cn("px-6 py-2 rounded-lg font-bold uppercase text-[9px] tracking-tight transition-all bg-transparent border-none cursor-pointer", activeRightTab === 'ASSEMBLY' ? "bg-white text-[#0F172A] shadow-md" : "text-slate-400 hover:text-slate-600")}>Composition</button>
           </div>

           {activeRightTab === 'BANK' ? (
             <div className="space-y-8 animate-in zoom-in-95 duration-500 relative">
                <div className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 px-1">
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
                        options={[{ label: 'Unused Items', value: 'UNUSED' }, { label: 'Used Items', value: 'USED' }]}
                     />
                  </div>

                  <div className="relative group w-full px-1">
                     <div className="relative flex items-center h-12 bg-white border border-slate-100 rounded-xl shadow-sm px-4 gap-3 focus-within:ring-4 focus-within:ring-primary/5 transition-all">
                        <Search className="h-4 w-4 text-slate-400 group-focus-within:text-primary" />
                        <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="flex-1 bg-transparent border-none outline-none font-bold text-slate-700 placeholder:text-slate-300 text-sm" placeholder="Search statements..." />
                     </div>
                  </div>

                  <div className="grid grid-cols-1 px-1">
                     <Card className="border border-slate-100 shadow-xl rounded-2xl bg-white p-5 md:p-6 text-left">
                        <div className="flex flex-col md:flex-row items-center gap-6">
                           <div className="relative shrink-0 flex items-center justify-center w-16 h-16">
                              <svg className="absolute inset-0 h-full w-full transform -rotate-90">
                                 <circle cx="50%" cy="50%" r="42%" className="stroke-slate-100 fill-none" strokeWidth="4" />
                                 <motion.circle 
                                    cx="50%" cy="50%" r="42%" 
                                    className="stroke-[#2563EB] fill-none" 
                                    strokeWidth="4" 
                                    strokeLinecap="round"
                                    animate={{ strokeDashoffset: 130 - (130 * Math.min(bankSelection.length, 100) / 100) }}
                                    style={{ strokeDasharray: 130 }}
                                 />
                              </svg>
                              <div className="flex flex-col items-center justify-center text-center">
                                 <span className="text-lg font-black text-[#0F172A] tabular-nums leading-none">{bankSelection.length}</span>
                                 <span className="text-[7px] font-black text-slate-400 uppercase mt-1">Ready</span>
                              </div>
                           </div>

                           <div className="flex-1 space-y-3 text-center md:text-left w-full min-w-0">
                              <div className="space-y-0.5">
                                 <h4 className="text-base font-black text-[#0F172A] uppercase tracking-tight">Assets Staged</h4>
                                 <p className="text-[10px] font-medium text-slate-500">Selection verified and ready.</p>
                              </div>
                              <Button 
                                onClick={handleLinkQuestions} 
                                disabled={bankSelection.length === 0} 
                                className="w-full md:w-auto h-10 bg-[#0F172A] hover:bg-black text-white font-black uppercase text-[9px] tracking-widest rounded-xl shadow-lg border-none active:scale-95 flex items-center justify-center gap-2 px-6"
                              >
                                 Link items <ArrowRight className="h-3 w-3" />
                              </Button>
                           </div>
                        </div>
                     </Card>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 pt-4 px-1">
                   {bankLoading ? (
                      Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-20 w-full rounded-xl bg-white" />)
                   ) : displayBank.length > 0 ? displayBank.map((q: any) => {
                      const isSelected = bankSelection.includes(q.id);
                      return (
                        <motion.div key={q.id} whileHover={{ scale: 1.005 }}>
                           <div onClick={() => setBankSelection((p: string[]) => isSelected ? p.filter(id => id !== q.id) : [...p, q.id])} className={cn("p-4 md:px-6 rounded-xl border transition-all cursor-pointer flex items-center justify-between group", isSelected ? "bg-primary/5 border-primary shadow-md" : "bg-white border-slate-50 hover:border-slate-100 shadow-sm")}>
                              <div className="flex items-center gap-4 min-w-0">
                                 <div className={cn("h-5 w-5 rounded-full border flex items-center justify-center shrink-0 transition-all", isSelected ? "bg-primary border-primary shadow-md" : "bg-white border-slate-200")}>
                                    {isSelected && <Check className="h-3 w-3 text-white stroke-[4px]" />}
                                 </div>
                                 <div className="min-w-0 text-left">
                                    <p className="font-bold text-[#0F172A] text-[12px] md:text-sm leading-tight break-words line-clamp-1">{q.englishQuestion}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                       <Badge className="bg-slate-50 text-slate-500 border-none text-[7px] font-black uppercase px-1.5 py-0.5 rounded shadow-sm">{subjects?.find((s:any) => s.id === q.subjectId)?.name || 'General'}</Badge>
                                       <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">{q.difficulty}</span>
                                    </div>
                                 </div>
                              </div>
                           </div>
                        </motion.div>
                      )
                   }) : (
                      <div className="py-20 text-center opacity-20 italic uppercase font-black tracking-widest text-base flex flex-col items-center gap-3">
                         <Database className="h-10 w-10" />
                         Empty Pool
                      </div>
                   )}
                </div>
             </div>
           ) : (
             <div className="space-y-6 animate-in fade-in duration-500 px-1">
                <div className="flex items-center justify-between">
                   <h3 className="text-xl md:text-2xl font-black text-[#0F172A] uppercase flex items-center gap-3">
                      <Layers className="h-5 w-5 text-primary" /> Active area
                   </h3>
                   <Popover>
                      <PopoverTrigger asChild>
                         <button className="h-9 px-4 bg-[#0F172A] hover:bg-black text-white font-bold text-[9px] uppercase rounded-lg shadow-xl flex items-center justify-center gap-2 border-none cursor-pointer">
                            <Plus className="h-3 w-3" /> Add section
                         </button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[280px] p-5 bg-[#0F172A] text-white rounded-2xl border-white/10 shadow-5xl z-[1001]">
                         <div className="space-y-3">
                            <Label className="text-[9px] font-black uppercase text-primary tracking-widest ml-1 text-left block">Section name</Label>
                            <Input placeholder="e.g. Punjab GK" className="h-10 bg-white/5 border-white/10 text-white rounded-lg font-bold px-4 shadow-inner" onKeyDown={(e) => {
                               if(e.key === 'Enter') {
                                  const val = (e.target as HTMLInputElement).value;
                                  if(val.trim()) { setSections([...sections, { id: `sec-${Date.now()}`, name: val.trim(), questions: [] }]); (e.target as HTMLInputElement).value = ""; }
                               }
                            }} />
                         </div>
                      </PopoverContent>
                   </Popover>
                </div>
                
                <div className="grid grid-cols-1 gap-4">
                   {sections.map((sec: any, sIdx: number) => (
                        <Card key={sec.id} className="border-none shadow-md rounded-xl bg-white overflow-hidden border border-slate-100">
                           <div className="flex items-center justify-between p-4 md:p-6 bg-slate-50/50 border-b border-slate-50">
                              <div className="flex items-center gap-3">
                                 <div className="h-8 w-8 rounded-lg bg-[#0F172A] text-white flex items-center justify-center font-black text-sm shadow-md">{sIdx + 1}</div>
                                 <div className="text-left">
                                    <Input value={sec.name} onChange={e => setSections((p: any[]) => p.map((s: any) => s.id === sec.id ? { ...s, name: e.target.value } : s))} className="h-8 p-0 bg-transparent border-none font-black text-lg md:text-xl focus-visible:ring-0 text-[#0F172A] uppercase" />
                                    <p className="text-[8px] font-bold text-slate-400 uppercase mt-0.5">{(sec.questions?.length || 0)} items linked</p>
                                 </div>
                              </div>
                              <div className="flex gap-2">
                                 <button onClick={() => setActiveSectionId(sec.id)} className={cn("px-3 py-1 rounded-lg font-black text-[8px] uppercase transition-all shadow-sm cursor-pointer", activeSectionId === sec.id ? "bg-primary text-white" : "bg-white text-slate-400")}>{activeSectionId === sec.id ? 'Active' : 'Focus'}</button>
                                 <button onClick={() => setSections((p: any[]) => p.filter((s: any) => s.id !== sec.id))} className="text-rose-500 hover:bg-rose-50 rounded-lg h-8 w-8 flex items-center justify-center border-none bg-transparent cursor-pointer"><Trash2 className="h-4 w-4" /></button>
                              </div>
                           </div>
                           <div className="p-4 md:p-6 space-y-2">
                              {sec.questions?.map((q: any, qIdx: number) => (
                                 <div key={q.id} className="flex items-center justify-between p-3 md:px-5 bg-white border border-slate-100 rounded-lg hover:shadow-md transition-all group">
                                    <div className="flex items-center gap-3 min-w-0 text-left">
                                       <span className="text-[10px] md:text-xs font-black text-primary tabular-nums shrink-0">#{qIdx + 1}</span>
                                       <p className="text-[11px] md:text-xs font-bold text-slate-600 truncate max-w-md">{q.englishQuestion}</p>
                                    </div>
                                    <button onClick={() => setSections((p: any[]) => p.map((s: any) => s.id === sec.id ? { ...s, questions: s.questions?.filter((item: any) => item.id !== q.id) || [] } : s))} className="text-slate-300 hover:text-rose-500 transition-colors p-1.5 active:scale-90 border-none bg-transparent cursor-pointer"><X className="h-3.5 w-3.5" /></button>
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
      <Card className="border border-slate-100 bg-white shadow-sm hover:shadow-lg transition-all duration-300 rounded-xl p-4 space-y-2 group">
         <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-slate-50 flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform">
               {React.isValidElement(icon) ? React.cloneElement(icon as React.ReactElement, { className: "h-4 w-4" }) : null}
            </div>
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-tight">{label}</span>
         </div>
         <select 
            value={value} 
            onChange={e => onChange(e.target.value)} 
            className="w-full h-9 bg-slate-50 border-none rounded-lg px-3 font-bold text-[10px] outline-none appearance-none cursor-pointer hover:bg-slate-100 transition-all text-[#0F172A]"
         >
            <option value="all">All</option>
            {options.map((opt: any) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
         </select>
      </Card>
   );
}
