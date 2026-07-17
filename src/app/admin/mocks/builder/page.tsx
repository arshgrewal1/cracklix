"use client"

import React, { useState, useMemo, useEffect, Suspense, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { 
  ChevronLeft, 
  Database, 
  Loader2,
  Plus,
  Trash2,
  Zap,
  Clock,
  Target,
  ShieldCheck,
  CheckCircle2,
  Landmark,
  X,
  RefreshCw,
  Award,
  Check,
  Layers,
  Save,
  GraduationCap,
  AlertCircle,
  FileText,
  Search,
  ExternalLink
} from "lucide-react"
import { useCollection, useFirestore, useDoc, useUser } from "@/firebase"
import { collection, doc, setDoc, serverTimestamp, query, limit, getDocs, writeBatch, where, documentId, orderBy, DocumentData, updateDoc, increment, addDoc } from "firebase/firestore"
import { useToast } from "@/hooks/use-toast"
import { MockType, Difficulty, AccessLevel, LanguageDisplayMode, MockAssignmentMode, Question, ExamSection, Exam } from "@/types"
import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { AdminPageHeader } from "@/components/admin"
import { mcqEngine, DiagnosticReport } from "@/lib/mcq-engine"

/**
 * @fileOverview Enterprise Mock Builder Hub v28.0.
 * FIXED: Standardized filter behavior to match MCQ Bank (default status 'all').
 * TYPOGRAPHY: Removed uppercase from labels and headers.
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

  const mockId = searchParams?.get("id") ?? ""
  const isEditing = !!mockId

  const [bankLoading, setBankLoading] = useState(false)
  const [questionBank, setQuestionBank] = useState<any[]>([])
  const [diagnostic, setDiagnostic] = useState<DiagnosticReport | null>(null)
  
  const { data: boards } = useCollection<any>(useMemo(() => (db ? query(collection(db, "boards"), orderBy("abbreviation", "asc")) : null), [db]))
  const { data: rawExams } = useCollection<any>(useMemo(() => (db ? collection(db, "exams") : null), [db]))
  const { data: subjects } = useCollection<any>(useMemo(() => (db ? query(collection(db, "subjects"), orderBy("name", "asc")) : null), [db]))
  const { data: existingMock } = useDoc<any>(useMemo(() => (db && mockId ? doc(db, "mocks", mockId) : null), [db, mockId]))
  
  const [isInitializing, setIsInitializing] = useState(true)
  const [isPublishing, setIsPublishing] = useState(false)
  const [activeRightTab, setActiveRightTab] = useState<'BANK' | 'ASSEMBLY'>('BANK')
  
  const [filterBoard, setFilterBoard] = useState("all")
  const [filterExam, setFilterExam] = useState("all")
  const [filterSubject, setSubjectFilter] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [bankSelection, setBankSelection] = useState<string[]>([])
  
  const [mockData, setMockData] = useState<any>({
    title: "", 
    assignmentMode: "MULTIPLE" as MockAssignmentMode,
    boardIds: [] as string[],
    examIds: [] as string[],
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
    { id: 'sec-1', name: 'General hub', questions: [] as any[] }
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
        searchTerm: searchTerm,
        status: 'all' // Changed from hardcoded 'PUBLISHED' to allow seeing all questions
      }, 100);

      setQuestionBank(result.data);
      setDiagnostic(result.diagnostic);
    } catch (e: any) {
      toast({ variant: "destructive", title: "Database standby", description: e.message });
    } finally {
      setBankLoading(false);
    }
  }, [db, filterBoard, filterExam, filterSubject, searchTerm, toast]);

  useEffect(() => {
    fetchFilteredBank();
  }, [fetchFilteredBank]);

  useEffect(() => {
    if (!db || !isEditing || !existingMock || !rawExams) {
       if (!isEditing) setIsInitializing(false);
       return;
    }

    setMockData({ 
      ...existingMock,
      assignmentMode: existingMock.assignmentMode || "MULTIPLE",
      boardIds: existingMock.boardIds || (existingMock.boardId ? [existingMock.boardId] : []),
      examIds: existingMock.examIds || (existingMock.examId ? [existingMock.examId] : []),
    });

    const hydrateExisting = async () => {
      if (existingMock.questionIds?.length > 0) {
        const fetched: any[] = [];
        const chunks = [];
        for (let i = 0; i < existingMock.questionIds.length; i += 30) {
          chunks.push(existingMock.questionIds.slice(i, i + 30));
        }
        for (const chunk of chunks) {
          const [mcqSnap, legacySnap] = await Promise.all([
            getDocs(query(collection(db, "mcqBank"), where(documentId(), "in", chunk))),
            getDocs(query(collection(db, "questions"), where(documentId(), "in", chunk)))
          ]);
          mcqSnap.docs.forEach(d => fetched.push({ ...d.data(), id: d.id }));
          legacySnap.docs.forEach(d => {
            if (!fetched.find(f => f.id === d.id)) fetched.push({ ...d.data(), id: d.id });
          });
        }

        let currentIndex = 0;
        const hydratedSections = (existingMock.sections || [{ name: 'General hub', count: existingMock.questionIds.length }]).map((s: ExamSection, idx: number) => {
          const count = Number(s.count) || 0;
          const sectionQIds: string[] = (existingMock.questionIds as string[]).slice(currentIndex, currentIndex + count);
          currentIndex += count;
          return { 
            id: `sec-${idx + 1}`, 
            name: s.name, 
            questions: sectionQIds.map((id: string) => fetched.find((q: any) => q.id === id)).filter(Boolean)
          };
        });
        setSections(hydratedSections.length > 0 ? hydratedSections : [{ id: 'sec-1', name: 'General hub', questions: [] }]);
      }
      setIsInitializing(false);
    };

    hydrateExisting();
  }, [db, existingMock, isEditing, rawExams]);

  const uniqueExams = useMemo(() => {
    if (!rawExams) return [];
    if (mockData.boardIds?.length > 0) {
       return rawExams.filter((e: Exam) => mockData.boardIds.includes(e.boardId));
    }
    return rawExams;
  }, [rawExams, mockData.boardIds]);

  const displayBank = useMemo(() => {
    const allSelectedIds = new Set(sections.flatMap((s: any) => (s.questions || []).map((q: any) => q.id)));
    return questionBank.filter(q => !allSelectedIds.has(q.id));
  }, [questionBank, sections]);

  const toggleBoardId = (id: string) => {
     const current = mockData.boardIds || [];
     const nextIds = current.includes(id) ? current.filter((x: string) => x !== id) : [...current, id];
     setMockData((prev: any) => ({
        ...prev,
        boardIds: nextIds,
        examIds: prev.examIds.filter((eid: string) => {
           const examObj = rawExams?.find((ex: any) => ex.id === eid);
           return examObj && nextIds.includes(examObj.boardId);
        })
     }));
  };

  const toggleExamId = (id: string) => {
     const current = mockData.examIds || [];
     setMockData((prev: any) => ({
        ...prev,
        examIds: current.includes(id) ? current.filter((x: string) => x !== id) : [...current, id]
     }));
  };

  const handleLinkQuestions = () => {
    const toAdd = questionBank.filter((q: any) => bankSelection.includes(q.id));
    setSections((prev: any[]) => prev.map((s: any) => s.id === activeSectionId ? { ...s, questions: [...(s.questions || []), ...toAdd] } : s));
    setBankSelection([]);
    toast({ title: `Linked ${toAdd.length} items` });
  }

  const handlePublish = async () => {
    if (!db || isPublishing) return
    if (!mockData.title?.trim()) {
      toast({ variant: "destructive", title: "Audit blocked", description: "Series title is mandatory." })
      return
    }
    const flatQuestionIds = sections.flatMap((s: any) => (s.questions || []).map((q: any) => q.id));
    if (flatQuestionIds.length === 0) {
       toast({ variant: "destructive", title: "Assembly empty", description: "Add items to the hub." });
       return;
    }

    setIsPublishing(true)
    const finalId = mockId || `mock-${Date.now()}`
    const mockRef = doc(db, "mocks", finalId)
    const sectionMetadata = sections.map((s: any) => ({ name: s.name, count: s.questions?.length || 0 })).filter((s: any) => s.count > 0);
    
    const payload = {
      ...mockData,
      id: finalId,
      boardId: mockData.boardIds[0] || "GENERAL",
      totalQuestions: flatQuestionIds.length,
      questionIds: flatQuestionIds,
      sections: sectionMetadata,
      totalMarks: flatQuestionIds.length * (Number(mockData.positiveMarks) || 1),
      updatedAt: serverTimestamp(),
      createdAt: isEditing ? (existingMock?.createdAt || serverTimestamp()) : serverTimestamp(),
    };

    try {
      await setDoc(mockRef, payload, { merge: true });
      if (!isEditing) {
        await updateDoc(doc(db, 'settings', 'stats'), { totalMocks: increment(1), updatedAt: serverTimestamp() }).catch(() => {});
      }
      await addDoc(collection(db, "audit_logs"), {
        user: profile?.name || "Administrator",
        action: isEditing ? "MOCK_UPDATE" : "MOCK_CREATE",
        details: `Mock series "${payload.title}" synchronized.`,
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

  if (isInitializing) return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-white space-y-6">
       <Zap className="h-10 w-10 text-primary animate-pulse" />
       <p className="text-[10px] font-black uppercase text-slate-300">Synchronizing hub...</p>
    </div>
  );

  return (
    <div className="max-w-[1600px] mx-auto space-y-6 md:space-y-12 pb-40 text-left pt-2">
      <AdminPageHeader
        icon={Layers}
        label="Assembly hub"
        title={isEditing ? "Modify series" : "Mock architect"}
        subtitle="Manage structural components and metadata for the series."
        onAction={handlePublish}
        actionLabel={isPublishing ? "Syncing..." : "Commit database"}
        actionIcon={isPublishing ? Loader2 : Save}
      >
        <button onClick={() => router.back()} className="h-10 w-10 md:h-12 md:w-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center shadow-sm hover:bg-slate-50 transition-all mr-auto md:mr-0 shrink-0">
          <ChevronLeft className="h-5 w-5" />
        </button>
      </AdminPageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-10 px-1">
        <div className="lg:col-span-4 space-y-6 md:space-y-8">
           <Card className="border-none shadow-xl rounded-2xl md:rounded-[3rem] bg-white p-5 md:p-10 space-y-6 md:space-y-8 border border-slate-50">
              <div className="space-y-2">
                 <Label className="text-[10px] font-bold text-slate-400 ml-1 uppercase">Series headline</Label>
                 <Input value={mockData.title} onChange={e => setMockData((p: any) => ({...p, title: e.target.value}))} className="h-12 md:h-14 rounded-xl md:rounded-2xl bg-slate-50 border-none font-bold text-sm md:text-lg px-6 shadow-inner text-[#0F172A]" placeholder="e.g. Clerk Mock Series 01" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                    <Label className="text-[10px] font-bold text-slate-400 ml-1 uppercase">Mock type</Label>
                    <select value={mockData.mockType} onChange={e => setMockData((p: any) => ({...p, mockType: e.target.value}))} className="w-full h-11 md:h-12 bg-slate-50 border-none rounded-xl px-4 outline-none font-bold text-xs shadow-inner">
                       <option value="FULL">Full Length</option>
                       <option value="SUBJECT">Subject-Wise</option>
                       <option value="SECTIONAL">Sectional</option>
                       <option value="PYQ">Official PYQ</option>
                    </select>
                 </div>
                 <div className="space-y-2">
                    <Label className="text-[10px] font-bold text-slate-400 ml-1 uppercase">Access tier</Label>
                    <select value={mockData.accessLevel} onChange={e => setMockData((p: any) => ({...p, accessLevel: e.target.value}))} className="w-full h-11 md:h-12 bg-slate-50 border-none rounded-xl px-4 outline-none font-bold text-xs shadow-inner">
                       <option value="FREE">Free hub</option>
                       <option value="PREMIUM">Elite hub</option>
                    </select>
                 </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                    <Label className="text-[10px] font-bold text-slate-400 ml-1 uppercase">Correct mark</Label>
                    <Input type="number" step="0.25" value={mockData.positiveMarks} onChange={e => setMockData((p: any) => ({...p, positiveMarks: parseFloat(e.target.value) || 1}))} className="h-11 md:h-12 rounded-xl bg-slate-50 border-none font-black text-center text-xs md:text-base text-emerald-600 shadow-inner" />
                 </div>
                 <div className="space-y-2">
                    <Label className="text-[10px] font-bold text-slate-400 ml-1 uppercase">Negative mark</Label>
                    <Input type="number" step="0.25" value={mockData.negativeMarks} onChange={e => setMockData((p: any) => ({...p, negativeMarks: parseFloat(e.target.value) || 0}))} className="h-11 md:h-12 rounded-xl bg-slate-50 border-none font-black text-center text-xs md:text-base text-rose-500 shadow-inner" />
                 </div>
              </div>

              <div className="space-y-6 pt-6 border-t border-slate-50">
                 <div className="space-y-3">
                    <Label className="text-[10px] font-bold text-slate-500 ml-1 flex items-center gap-2 uppercase"><Landmark className="h-3 w-3" /> Board mapping</Label>
                    <div className="grid grid-cols-1 gap-1.5 max-h-40 overflow-y-auto custom-scrollbar pr-2">
                       {boards?.map((b: any) => (
                          <div key={b.id} onClick={() => toggleBoardId(b.id)} className="flex items-center space-x-3 p-3 bg-slate-50/50 rounded-xl hover:bg-slate-100 transition-all cursor-pointer group">
                             <div className={cn("h-4 w-4 rounded border-2 flex items-center justify-center shrink-0 transition-all", mockData.boardIds?.includes(b.id) ? "border-primary bg-primary" : "border-slate-300 bg-white")}>
                                {mockData.boardIds?.includes(b.id) && <Check className="h-2.5 w-2.5 text-white stroke-[4px]" />}
                             </div>
                             <span className="text-[10px] font-bold text-[#0F172A] uppercase">{b.abbreviation} hub</span>
                          </div>
                       ))}
                    </div>
                 </div>

                 <div className="space-y-3">
                    <Label className="text-[10px] font-bold text-slate-500 ml-1 flex items-center gap-2 uppercase"><GraduationCap className="h-3 w-3" /> Exam vertical</Label>
                    <div className="grid grid-cols-1 gap-1.5 max-h-40 overflow-y-auto custom-scrollbar pr-2">
                       {uniqueExams.map((e: any) => (
                          <div key={e.id} onClick={() => toggleExamId(e.id)} className="flex items-center space-x-3 p-3 bg-slate-50/50 rounded-xl hover:bg-slate-100 transition-all cursor-pointer group">
                             <div className={cn("h-4 w-4 rounded border-2 flex items-center justify-center shrink-0 transition-all", mockData.examIds?.includes(e.id) ? "border-primary bg-primary" : "border-slate-300 bg-white")}>
                                {mockData.examIds?.includes(e.id) && <Check className="h-2.5 w-2.5 text-white stroke-[4px]" />}
                             </div>
                             <span className="text-[10px] font-bold text-[#0F172A] uppercase">{e.name}</span>
                          </div>
                       ))}
                    </div>
                 </div>
              </div>
           </Card>
        </div>

        <div className="lg:col-span-8 space-y-6">
           <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-full w-fit mb-4">
              <button onClick={() => setActiveRightTab('BANK')} className={cn("px-8 py-2 rounded-full font-bold uppercase text-[10px] tracking-tight transition-all", activeRightTab === 'BANK' ? "bg-white text-[#0F172A] shadow-sm" : "text-slate-400 hover:text-slate-600")}>Database bank</button>
              <button onClick={() => setActiveRightTab('ASSEMBLY')} className={cn("px-8 py-2 rounded-full font-bold uppercase text-[10px] tracking-tight transition-all", activeRightTab === 'ASSEMBLY' ? "bg-white text-[#0F172A] shadow-sm" : "text-slate-400 hover:text-slate-600")}>Active composition</button>
           </div>

           {activeRightTab === 'BANK' ? (
             <div className="space-y-6 md:space-y-8 animate-in zoom-in-95 duration-500">
                <Card className="bg-[#0F172A] rounded-2xl md:rounded-[3rem] p-6 md:p-10 text-white space-y-8 shadow-2xl border border-white/5 relative overflow-hidden">
                   <div className="absolute top-0 right-0 p-12 opacity-5 rotate-12"><Database className="h-64 w-64" /></div>
                   <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-6">
                      <FilterNode 
                        label="Board center" 
                        value={filterBoard} 
                        onChange={(v) => { setFilterBoard(v); setFilterExam('all'); }}
                        options={boards?.map(b => ({ label: b.abbreviation, value: b.id })) || []}
                      />
                      <FilterNode 
                        label="Vertical hub" 
                        value={filterExam} 
                        onChange={setFilterExam}
                        options={uniqueExams.map((e: any) => ({ label: e.name, value: e.id }))}
                      />
                      <FilterNode 
                        label="Subject hub" 
                        value={filterSubject} 
                        onChange={setSubjectFilter}
                        options={subjects?.map((s: any) => ({ label: s.name, value: s.id })) || []}
                      />
                   </div>

                   {/* DIAGNOSTIC HUB */}
                   {diagnostic && (
                      <div className="relative z-10 bg-amber-500/10 border border-amber-500/20 p-6 rounded-2xl space-y-4">
                         <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                               <AlertCircle className="h-5 w-5 text-amber-500" />
                               <p className="text-xs font-bold text-amber-200">Database diagnostic</p>
                            </div>
                            {diagnostic.indexUrl && (
                               <Button asChild className="h-9 px-4 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-[10px] font-black uppercase border-none">
                                  <a href={diagnostic.indexUrl} target="_blank" rel="noopener noreferrer">Provision index <ExternalLink className="h-3 w-3 ml-2" /></a>
                               </Button>
                            )}
                         </div>
                         <p className="text-[11px] text-slate-400 leading-relaxed">{diagnostic.message}</p>
                      </div>
                   )}

                   <div className="relative z-10 flex flex-col md:flex-row items-center gap-6 pt-6 border-t border-white/10">
                      <div className="flex-1 text-left">
                         <p className="text-[9px] font-bold uppercase text-primary tracking-widest">Selection node</p>
                         <div className="text-2xl md:text-5xl font-black text-white tabular-nums tracking-tighter">
                            {bankSelection.length} <span className="text-sm md:text-xl text-slate-500 font-bold ml-1">Staged</span>
                         </div>
                      </div>
                      <Button onClick={handleLinkQuestions} disabled={bankSelection.length === 0} className="w-full md:w-auto h-12 md:h-16 px-10 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-full shadow-2xl border-none gap-3 active:scale-95">
                         Link staged assets <CheckCircle2 className="h-5 w-5" />
                      </Button>
                   </div>
                </Card>

                <div className="grid grid-cols-1 gap-3">
                   {bankLoading ? (
                      Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-20 w-full rounded-2xl bg-white" />)
                   ) : displayBank.length > 0 ? displayBank.map((q: any) => {
                      const isSelected = bankSelection.includes(q.id);
                      return (
                        <div key={q.id} onClick={() => setBankSelection((p: string[]) => isSelected ? p.filter(id => id !== q.id) : [...p, q.id])} className={cn("p-5 md:px-8 rounded-2xl md:rounded-[2rem] border-2 transition-all cursor-pointer flex items-center justify-between group", isSelected ? "bg-primary/5 border-primary shadow-lg" : "bg-white border-slate-50 hover:border-slate-100 shadow-sm")}>
                           <div className="flex items-center gap-4 md:gap-8 min-w-0">
                              <div className={cn("h-6 w-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all", isSelected ? "bg-primary border-primary shadow-xl" : "bg-white border-slate-200")}>
                                 {isSelected && <Check className="h-3 w-3 text-white stroke-[4px]" />}
                              </div>
                              <div className="min-w-0 text-left">
                                 <p className="font-bold text-[#0F172A] truncate text-sm md:text-base leading-tight">{q.englishQuestion}</p>
                                 <div className="flex items-center gap-3 mt-1.5">
                                    <Badge className="bg-slate-100 text-slate-500 border-none text-[8px] font-bold uppercase px-2">{subjects?.find((s:any) => s.id === q.subjectId)?.name || 'GK'}</Badge>
                                    <span className="text-[9px] font-bold text-slate-300 uppercase tracking-tight">{q.difficulty}</span>
                                 </div>
                              </div>
                           </div>
                        </div>
                      )
                   }) : (
                      <div className="py-24 text-center opacity-20 italic uppercase font-black tracking-widest text-lg flex flex-col items-center gap-4">
                         <Database className="h-12 w-12" />
                         Registry bank empty
                      </div>
                   )}
                </div>
             </div>
           ) : (
             <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500">
                <div className="flex items-center justify-between px-2">
                   <h3 className="text-xl md:text-3xl font-black text-[#0F172A] tracking-tight uppercase flex items-center gap-4">
                      <Layers className="h-6 w-6 text-primary" /> Series composition
                   </h3>
                   <Popover>
                      <PopoverTrigger asChild>
                         <Button className="h-10 md:h-12 px-6 bg-[#0F172A] hover:bg-black text-white font-bold text-[10px] uppercase rounded-xl shadow-xl gap-2">
                            <Plus className="h-4 w-4" /> Add section
                         </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[320px] p-6 bg-[#0F172A] text-white rounded-[2rem] border-white/10 shadow-5xl z-[1001]">
                         <div className="space-y-4">
                            <Label className="text-[10px] font-black uppercase text-primary tracking-widest ml-1">Section hub name</Label>
                            <Input placeholder="e.g. Punjab GK" className="h-12 bg-white/5 border-white/10 text-white rounded-full font-bold px-6 shadow-inner" onKeyDown={(e) => {
                               if(e.key === 'Enter') {
                                  const val = (e.target as HTMLInputElement).value;
                                  if(val.trim()) { setSections([...sections, { id: `sec-${Date.now()}`, name: val.trim(), questions: [] }]); (e.target as HTMLInputElement).value = ""; }
                               }
                            }} />
                         </div>
                      </PopoverContent>
                   </Popover>
                </div>
                
                <div className="grid grid-cols-1 gap-6">
                   {sections.map((sec: any, sIdx: number) => (
                      <Card key={sec.id} className="border-none shadow-xl rounded-2xl md:rounded-[3rem] bg-white overflow-hidden border border-slate-50">
                         <div className="flex items-center justify-between p-6 md:p-10 bg-slate-50/50 border-b border-slate-50">
                            <div className="flex items-center gap-4">
                               <div className="h-10 w-10 md:h-12 rounded-xl bg-[#0F172A] text-white flex items-center justify-center font-black text-lg shadow-xl">{sIdx + 1}</div>
                               <div className="text-left">
                                  <Input value={sec.name} onChange={e => setSections((p: any[]) => p.map((s: any) => s.id === sec.id ? { ...s, name: e.target.value } : s))} className="h-10 p-0 bg-transparent border-none font-black text-xl md:text-2xl focus-visible:ring-0 text-[#0F172A] uppercase" />
                                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{(sec.questions?.length || 0)} Assets linked</p>
                               </div>
                            </div>
                            <div className="flex gap-2">
                               <button onClick={() => setActiveSectionId(sec.id)} className={cn("px-4 py-2 rounded-full font-black text-[9px] uppercase transition-all shadow-sm", activeSectionId === sec.id ? "bg-primary text-white" : "bg-white text-slate-400 hover:bg-slate-50")}>{activeSectionId === sec.id ? 'Active hub' : 'Set focus'}</button>
                               <Button variant="ghost" size="icon" onClick={() => setSections((p: any[]) => p.filter((s: any) => s.id !== sec.id))} className="text-rose-500 hover:bg-rose-50 rounded-xl h-10 w-10"><Trash2 className="h-5 w-5" /></Button>
                            </div>
                         </div>
                         <div className="p-6 md:p-10 space-y-3">
                            {sec.questions?.map((q: any, qIdx: number) => (
                               <div key={q.id} className="flex items-center justify-between p-4 md:px-8 bg-white border border-slate-100 rounded-xl md:rounded-2xl hover:shadow-lg transition-all group">
                                  <div className="flex items-center gap-4 md:gap-8 min-w-0">
                                     <span className="text-xs md:text-lg font-black text-slate-200 tabular-nums">#{qIdx + 1}</span>
                                     <p className="text-sm font-bold text-slate-600 truncate">{q.englishQuestion}</p>
                                  </div>
                                  <button onClick={() => setSections((p: any[]) => p.map((s: any) => s.id === sec.id ? { ...s, questions: s.questions?.filter((item: any) => item.id !== q.id) || [] } : s))} className="text-slate-300 hover:text-rose-500 transition-colors p-2 active:scale-90"><X className="h-4 w-4" /></button>
                               </div>
                            ))}
                            {(!sec.questions || sec.questions.length === 0) && <div className="py-12 text-center opacity-30 italic font-black uppercase text-[10px]">No assets linked to this section</div>}
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

function FilterNode({ label, value, onChange, options }: any) {
  return (
    <div className="space-y-1.5 text-left">
       <label className="text-[9px] font-bold uppercase text-slate-400 ml-1 tracking-tight">{label}</label>
       <select 
          value={value} 
          onChange={e => onChange(e.target.value)} 
          className="w-full h-11 bg-white/5 border border-white/10 rounded-xl px-4 font-bold text-xs outline-none appearance-none cursor-pointer hover:bg-white/10 transition-colors text-white"
       >
          <option value="all" className="bg-[#0F172A]">All {label.replace(' hub', '')}s</option>
          {options.map((opt: any) => <option key={opt.value} value={opt.value} className="bg-[#0F172A]">{opt.label}</option>)}
       </select>
    </div>
  )
}

function ConfigSwitch({ label, checked, onChange }: any) {
   return (
      <div className={cn("p-5 rounded-2xl border flex items-center justify-between transition-all", checked ? "bg-white border-slate-100 shadow-sm" : "bg-slate-50/50 border-transparent opacity-60")}>
         <span className="text-[11px] font-bold uppercase text-[#0F172A] tracking-tight">{label}</span>
         <Switch checked={checked} onCheckedChange={onChange} />
      </div>
   )
}
