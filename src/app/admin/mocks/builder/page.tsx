
"use client"

import React, { useState, useMemo, useEffect, Suspense } from "react"
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
  ClipboardCheck,
  Search,
  Layers,
  Loader2,
  Plus,
  Trash2,
  Zap,
  Clock,
  Lock,
  Target,
  ShieldCheck,
  CheckCircle2,
  Landmark,
  GraduationCap,
  Languages,
  BookOpen,
  X,
  Globe,
  LayoutGrid,
  Tags,
  SearchCode,
  Box,
  Check,
  FileWarning,
  History,
  RefreshCw,
  Award,
  AlertTriangle
} from "lucide-react"
import { useCollection, useFirestore, useDoc } from "@/firebase"
import { collection, doc, setDoc, serverTimestamp, query, limit, getDocs, writeBatch, where, documentId, orderBy, deleteDoc } from "firebase/firestore"
import { useToast } from "@/hooks/use-toast"
import { MockType, Difficulty, AccessLevel, LanguageDisplayMode, MockAssignmentMode } from "@/types"
import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

/**
 * @fileOverview FINAL HIGH-FIDELITY Mock Architect v58.0.
 * UPDATED: Assignment Hub (Left Panel) perfectly matched to user screenshot.
 * FIXED: Test Type and Access Level labels/styles strictly synchronized.
 */

export default function MockBuilderPage() {
  return (
    <Suspense fallback={<div className="h-screen flex items-center justify-center bg-white"><Loader2 className="h-10 w-10 text-primary animate-spin" /></div>}>
      <MockBuilderContent />
    </Suspense>
  )
}

function MockBuilderContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const db = useFirestore()
  const { toast } = useToast()

  const mockId = searchParams.get("id")
  const isEditing = !!mockId

  // --- DATA LISTENERS ---
  const { data: existingMock } = useDoc<any>(useMemo(() => (db && mockId ? doc(db, "mocks", mockId) : null), [db, mockId]))
  const { data: categories } = useCollection<any>(useMemo(() => (db ? query(collection(db, "categories"), orderBy("displayOrder", "asc")) : null), [db]))
  const { data: boards } = useCollection<any>(useMemo(() => (db ? query(collection(db, "boards"), orderBy("displayOrder", "asc")) : null), [db]))
  const { data: rawExams } = useCollection<any>(useMemo(() => (db ? collection(db, "exams") : null), [db]))
  const { data: subjects } = useCollection<any>(useMemo(() => (db ? query(collection(db, "subjects"), orderBy("name", "asc")) : null), [db]))
  
  // --- STATE HUB ---
  const [bankLoading, setBankLoading] = useState(false)
  const [questionBank, setQuestionBank] = useState<any[]>([])
  const [isPublishing, setIsPublishing] = useState(false)
  const [activeRightTab, setActiveRightTab] = useState<'BANK' | 'ASSEMBLY'>('BANK')
  
  // Question Bank Filters
  const [filterBoard, setFilterBoard] = useState("all")
  const [filterExam, setFilterExam] = useState("all")
  const [filterSubject, setFilterSubject] = useState("all")
  const [hideUsed, setHideUsed] = useState(true)
  const [blockDuplicates, setBlockDuplicates] = useState(true)
  const [bankSelection, setBankSelection] = useState<string[]>([])
  
  // Subject Picker State
  const [subjectSearch, setSubjectSearch] = useState("")

  // Mock Metadata & Architecture
  const [mockData, setMockData] = useState<any>({
    title: "", 
    assignmentMode: "MULTIPLE" as MockAssignmentMode,
    targetCategoryId: "all",
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

  // Assembly State
  const [sections, setSections] = useState<any[]>([
    { id: 'sec-1', name: 'GENERAL HUB', questions: [] }
  ])
  const [activeSectionId, setActiveSectionId] = useState('sec-1')

  // --- DATA SYNC ---
  const fetchBank = async () => {
    if (!db) return
    setBankLoading(true)
    try {
      const q = query(collection(db, "questions"), limit(2000))
      const snap = await getDocs(q)
      setQuestionBank(snap.docs.map(d => ({ ...d.data(), id: d.id })))
    } finally {
      setBankLoading(false)
    }
  }

  useEffect(() => {
    fetchBank()
  }, [db])

  useEffect(() => {
    if (existingMock && questionBank.length > 0) {
      setMockData({ 
        ...existingMock,
        assignmentMode: existingMock.assignmentMode || "MULTIPLE",
        boardIds: existingMock.boardIds || (existingMock.boardId ? [existingMock.boardId] : []),
        examIds: existingMock.examIds || (existingMock.examId ? [existingMock.examId] : [])
      });

      if (existingMock.questionIds) {
        let currentIndex = 0;
        const hydratedSections = (existingMock.sections || [{ name: 'GENERAL HUB', count: existingMock.questionIds.length }]).map((s: any, idx: number) => {
          const count = parseInt(s.count) || 0;
          const sectionQIds = existingMock.questionIds.slice(currentIndex, currentIndex + count);
          currentIndex += count;
          return { 
            id: `sec-${idx + 1}`, 
            name: s.name, 
            questions: sectionQIds.map(id => questionBank.find(q => q.id === id)).filter(Boolean) 
          };
        });
        setSections(hydratedSections);
      }
    }
  }, [existingMock, questionBank])

  const uniqueExams = useMemo(() => {
    if (!rawExams) return [];
    const seen = new Set();
    const filtered = rawExams.filter((e: any) => {
      const key = e.name?.toLowerCase().trim();
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    }).sort((a: any, b: any) => a.name.localeCompare(b.name));

    if (mockData.boardIds?.length > 0) {
       return filtered.filter(e => mockData.boardIds.includes(e.boardId));
    }
    return filtered;
  }, [rawExams, mockData.boardIds]);

  const filteredBank = useMemo(() => {
    const allSelectedIds = sections.flatMap(s => s.questions.map(q => q.id));
    return questionBank.filter((q: any) => {
      const matchesBoard = filterBoard === "all" || q.boardId === filterBoard;
      const matchesExam = filterExam === "all" || q.examId === filterExam;
      const matchesSub = filterSubject === "all" || q.subjectId === filterSubject;
      const notInThisMock = !allSelectedIds.includes(q.id) || !blockDuplicates;
      const usedGuard = !hideUsed || (q.status !== 'USED');
      return matchesBoard && matchesExam && matchesSub && notInThisMock && usedGuard;
    })
  }, [questionBank, filterBoard, filterExam, filterSubject, hideUsed, blockDuplicates, sections])

  const filteredSubjectsForPicking = useMemo(() => {
    if (!subjects) return [];
    return subjects.filter((s: any) => 
      s.name?.toLowerCase().includes(subjectSearch.toLowerCase())
    ).sort((a: any, b: any) => a.name.localeCompare(b.name));
  }, [subjects, subjectSearch]);

  // --- ACTIONS ---
  const handleLinkQuestions = () => {
    const toAdd = questionBank.filter(q => bankSelection.includes(q.id));
    setSections(prev => prev.map(s => s.id === activeSectionId ? { ...s, questions: [...s.questions, ...toAdd] } : s));
    setBankSelection([]);
    toast({ title: `Linked ${toAdd.length} Assets` });
  }

  const handleSelectAllInBank = () => {
    if (bankSelection.length === filteredBank.length) {
      setBankSelection([]);
    } else {
      setBankSelection(filteredBank.map(q => q.id));
    }
  }

  const handleDeleteFromBank = async (qId: string) => {
    if (!db) return
    if (!confirm("CRITICAL: Permanently purge this question from Global Bank?")) return
    try {
      await deleteDoc(doc(db, "questions", qId))
      setQuestionBank(prev => prev.filter(q => q.id !== qId))
      toast({ title: "Asset Purged" })
    } catch (e) {
      toast({ variant: "destructive", title: "Purge Failed" })
    }
  }

  const handlePublish = async () => {
    if (!db || isPublishing) return
    if (!mockData.title) {
      toast({ variant: "destructive", title: "Audit Blocked", description: "Series Title is mandatory." })
      return
    }

    const flatQuestionIds = sections.flatMap(s => s.questions.map(q => q.id));
    if (flatQuestionIds.length === 0) {
       toast({ variant: "destructive", title: "Link Blocked", description: "Add questions first." });
       return;
    }

    setIsPublishing(true)
    const finalId = mockId || `mock-${Date.now()}`
    const mockRef = doc(db, "mocks", finalId)
    const sectionMetadata = sections.map(s => ({ name: s.name, count: s.questions.length })).filter(s => s.count > 0);

    const payload = {
      ...mockData,
      id: finalId,
      boardId: mockData.boardIds[0] || "",
      totalQuestions: flatQuestionIds.length,
      questionIds: flatQuestionIds,
      sections: sectionMetadata,
      totalMarks: flatQuestionIds.length * (mockData.positiveMarks || 1),
      updatedAt: serverTimestamp(),
      createdAt: existingMock?.createdAt || serverTimestamp(),
    };

    try {
      await setDoc(mockRef, payload, { merge: true });
      const batch = writeBatch(db);
      flatQuestionIds.forEach(id => {
        batch.update(doc(db, "questions", id), { 
          status: 'USED', 
          updatedAt: serverTimestamp() 
        });
      });
      await batch.commit();
      toast({ title: "Series Deployed", description: "Mock series is now live." });
      router.push("/admin/mocks")
    } catch (e: any) {
      toast({ variant: "destructive", title: "Sync Failed" })
    } finally {
      setIsPublishing(false)
    }
  }

  const toggleBoardId = (id: string) => {
     const current = mockData.boardIds || [];
     setMockData({
        ...mockData,
        boardIds: current.includes(id) ? current.filter(x => x !== id) : [...current, id]
     });
  };

  const toggleExamId = (id: string) => {
     const current = mockData.examIds || [];
     setMockData({
        ...mockData,
        examIds: current.includes(id) ? current.filter(x => x !== id) : [...current, id]
     });
  };

  const addNewSection = (name: string) => {
    const newId = `sec-${Date.now()}`;
    setSections([...sections, { id: newId, name: name.toUpperCase(), questions: [] }]);
    setSubjectSearch("");
    setActiveSectionId(newId);
  }

  return (
    <div className="max-w-[1600px] mx-auto space-y-6 pb-32 text-left pt-2 md:pt-4 px-2 md:px-4">
      
      {/* TOP HEADER */}
      <div className="flex flex-wrap items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-2xl border bg-white h-12 w-12 shadow-sm">
             <ChevronLeft className="h-6 w-6" />
          </Button>
          <div className="text-left">
            <h1 className="text-2xl md:text-3xl font-headline font-black uppercase tracking-tight text-[#0F172A]">{isEditing ? "Modify Series" : "Mock Architect"}</h1>
            <p className="text-[10px] uppercase font-black tracking-widest text-slate-400 mt-1">Institutional Assembly Hub</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
           <Button onClick={handlePublish} disabled={isPublishing} className="bg-[#0F172A] hover:bg-black text-white font-black px-8 md:px-10 h-14 rounded-xl uppercase text-[10px] tracking-[0.2em] gap-3 shadow-3xl">
            {isPublishing ? <Loader2 className="h-4 w-4 animate-spin" /> : <ClipboardCheck className="h-5 w-5" />} Deploy Series
           </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-10">
        
        {/* LEFT COLUMN: ASSIGNMENT HUB (SAME AS SAME) */}
        <div className="lg:col-span-4 space-y-8">
           <Card className="border-none shadow-xl rounded-[2.5rem] bg-white p-6 md:p-10 space-y-10 border border-slate-100">
              
              <div className="space-y-3">
                 <Label className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] ml-1">SERIES TITLE</Label>
                 <Input 
                   value={mockData.title} 
                   onChange={e => setMockData({...mockData, title: e.target.value})}
                   className="h-16 rounded-2xl bg-slate-50/50 border-none font-black text-lg px-6 shadow-inner" 
                   placeholder="e.g. Patwari High Fidelity Mock 1"
                 />
              </div>

              <div className="grid grid-cols-2 gap-6">
                 <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] ml-1">TEST TYPE</Label>
                    <Select value={mockData.mockType} onValueChange={(v: MockType) => setMockData({...mockData, mockType: v})}>
                       <SelectTrigger className="h-14 rounded-xl bg-slate-50/50 border-none font-black text-[10px] uppercase px-4">
                          <SelectValue />
                       </SelectTrigger>
                       <SelectContent className="rounded-xl">
                          <SelectItem value="FULL">Full Length Mock</SelectItem>
                          <SelectItem value="SUBJECT">Subject-Wise Test</SelectItem>
                          <SelectItem value="SECTIONAL">Sectional Test</SelectItem>
                          <SelectItem value="PYQ">PYQ Paper</SelectItem>
                       </SelectContent>
                    </Select>
                 </div>
                 <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] ml-1">ACCESS LEVEL</Label>
                    <Select value={mockData.accessLevel} onValueChange={(v: AccessLevel) => setMockData({...mockData, accessLevel: v})}>
                       <SelectTrigger className="h-14 rounded-xl bg-slate-50/50 border-none font-black text-[10px] uppercase px-4">
                          <SelectValue />
                       </SelectTrigger>
                       <SelectContent className="rounded-xl">
                          <SelectItem value="FREE">Public (FREE)</SelectItem>
                          <SelectItem value="PREMIUM">Elite (PREMIUM)</SelectItem>
                       </SelectContent>
                    </Select>
                 </div>
              </div>

              <div className="space-y-4">
                <Select value={mockData.assignmentMode} onValueChange={(v: MockAssignmentMode) => setMockData({...mockData, assignmentMode: v})}>
                  <SelectTrigger className="h-16 rounded-2xl bg-[#0B1528] text-white border-none font-black uppercase text-[11px] tracking-[0.15em] px-6 shadow-2xl flex items-center justify-between">
                     <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0B1528] text-white border-white/10 rounded-2xl">
                     <SelectItem value="SINGLE">SINGLE VERTICAL</SelectItem>
                     <SelectItem value="MULTIPLE">MULTIPLE VERTICALS</SelectItem>
                     <SelectItem value="AUTHORITY">AUTHORITY HUB (BROADCAST)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4 text-left">
                <Label className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] ml-1">TARGET AUTHORITY BOARDS</Label>
                <div className="space-y-2 max-h-[180px] overflow-y-auto custom-scrollbar pr-2">
                   {boards?.map((b: any) => (
                      <div 
                         key={b.id} 
                         onClick={() => toggleBoardId(b.id)}
                         className="flex items-center space-x-4 p-4 bg-slate-50/50 rounded-2xl hover:bg-slate-100 transition-all cursor-pointer group"
                      >
                         <div className={cn(
                            "h-6 w-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all",
                            mockData.boardIds?.includes(b.id) ? "border-[#F97316] bg-[#F97316] shadow-lg shadow-orange-500/20" : "border-slate-200"
                         )}>
                            {mockData.boardIds?.includes(b.id) && <Check className="h-3.5 w-3.5 text-white" />}
                         </div>
                         <span className="text-[11px] font-black text-[#0F172A] uppercase tracking-tight">{b.abbreviation} HUB</span>
                      </div>
                   ))}
                </div>
              </div>

              <div className="space-y-4 text-left">
                <Label className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] ml-1">TARGET RECRUITMENT VERTICALS</Label>
                <div className="space-y-2 max-h-[180px] overflow-y-auto custom-scrollbar pr-2">
                   {uniqueExams.map((e: any) => {
                      const isSelected = mockData.examIds?.includes(e.id);
                      return (
                        <div 
                           key={e.id} 
                           onClick={() => toggleExamId(e.id)}
                           className="flex items-center space-x-4 p-4 bg-slate-50/50 rounded-2xl hover:bg-slate-100 transition-all cursor-pointer group"
                        >
                           <div className={cn(
                              "h-6 w-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all",
                              isSelected ? "border-[#F97316] bg-[#F97316]" : "border-slate-200"
                           )}>
                              {isSelected && <Check className="h-3.5 w-3.5 text-white" />}
                           </div>
                           <span className="text-[11px] font-black text-[#0F172A] uppercase tracking-tight">{e.name}</span>
                        </div>
                      )
                   })}
                </div>
              </div>

              <div className="space-y-4 pt-6 border-t border-slate-50">
                <Label className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] ml-1">LANGUAGE MODE</Label>
                <Select value={mockData.languageMode} onValueChange={(v: LanguageDisplayMode) => setMockData({...mockData, languageMode: v})}>
                  <SelectTrigger className="h-16 rounded-2xl bg-white border-2 border-slate-100 shadow-sm font-black text-[11px] uppercase px-6 tracking-widest flex items-center justify-between">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl">
                    <SelectItem value="ENGLISH_PUNJABI">ENGLISH & ਪੰਜਾਬੀ</SelectItem>
                    <SelectItem value="ENGLISH_HINDI">ENGLISH & हिन्दी</SelectItem>
                    <SelectItem value="ENGLISH">ENGLISH ONLY</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-6 pt-4">
                 <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-1 flex items-center gap-2">
                       <Clock className="h-3 w-3" /> DURATION (MIN)
                    </Label>
                    <Input 
                       type="number" 
                       value={mockData.duration} 
                       onChange={e => setMockData({...mockData, duration: parseInt(e.target.value)})} 
                       className="h-16 rounded-2xl bg-slate-50 border-none font-black text-center text-xl shadow-inner" 
                    />
                 </div>
                 <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-1 flex items-center gap-2">
                       <Lock className="h-3 w-3" /> ATTEMPT LIMIT
                    </Label>
                    <Select 
                       value={mockData.attemptLimit?.toString()} 
                       onValueChange={v => setMockData({...mockData, attemptLimit: parseInt(v)})}
                    >
                       <SelectTrigger className="h-16 rounded-2xl bg-white border-2 border-[#F97316] font-black text-[11px] uppercase px-4 shadow-xl">
                          <SelectValue placeholder="UNLIMITED" />
                       </SelectTrigger>
                       <SelectContent className="rounded-xl">
                          <SelectItem value="0">UNLIMITED</SelectItem>
                          <SelectItem value="1">1 ATTEMPT</SelectItem>
                          <SelectItem value="2">2 ATTEMPTS</SelectItem>
                          <SelectItem value="3">3 ATTEMPTS</SelectItem>
                       </SelectContent>
                    </Select>
                 </div>
              </div>

              <div className="grid grid-cols-2 gap-6 pt-6">
                 <div className="bg-[#F0FDF4] p-8 rounded-[2.5rem] border border-[#DCFCE7] text-center space-y-4 shadow-sm group hover:shadow-lg transition-all">
                    <p className="text-[10px] font-black text-[#10B981] uppercase tracking-widest flex items-center justify-center gap-2">
                       <Zap className="h-3 w-3" /> POSITIVE (+)
                    </p>
                    <Input 
                       type="number" 
                       step="0.1"
                       value={mockData.positiveMarks} 
                       onChange={e => setMockData({...mockData, positiveMarks: parseFloat(e.target.value)})}
                       className="h-10 bg-transparent border-none text-center font-black text-4xl text-[#10B981] p-0 focus-visible:ring-0" 
                    />
                 </div>
                 <div className="bg-[#FEF2F2] p-8 rounded-[2.5rem] border border-[#FEE2E2] text-center space-y-4 shadow-sm group hover:shadow-lg transition-all">
                    <p className="text-[10px] font-black text-[#F43F5E] uppercase tracking-widest flex items-center justify-center gap-2">
                       <AlertTriangle className="h-3 w-3" /> PENALTY (-)
                    </p>
                    <Input 
                       type="number" 
                       step="0.01"
                       value={mockData.negativeMarks} 
                       onChange={e => setMockData({...mockData, negativeMarks: parseFloat(e.target.value)})}
                       className="h-10 bg-transparent border-none text-center font-black text-4xl text-[#F43F5E] p-0 focus-visible:ring-0" 
                    />
                 </div>
              </div>
           </Card>
        </div>

        {/* RIGHT COLUMN: TACTICAL HUB */}
        <div className="lg:col-span-8 flex flex-col space-y-6">
           
           <div className="flex items-center gap-4 bg-white p-2 rounded-2xl border border-slate-100 shadow-sm w-fit">
              <button 
                onClick={() => setActiveRightTab('BANK')}
                className={cn(
                  "px-6 md:px-8 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all flex items-center gap-2",
                  activeRightTab === 'BANK' ? "bg-[#0B1528] text-white shadow-xl" : "text-slate-400 hover:text-[#0B1528]"
                )}
              >
                 <Database className="h-4 w-4" /> QUESTION BANK
              </button>
              <button 
                onClick={() => setActiveRightTab('ASSEMBLY')}
                className={cn(
                  "px-6 md:px-8 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all flex items-center gap-2",
                  activeRightTab === 'ASSEMBLY' ? "bg-[#0B1528] text-white shadow-xl" : "text-slate-400 hover:text-[#0B1528]"
                )}
              >
                 <Layers className="h-4 w-4" /> ACTIVE ASSEMBLY
              </button>
           </div>

           <div className="flex-1 flex flex-col space-y-8">
              {activeRightTab === 'BANK' ? (
                <>
                  <div className="bg-[#0B1528] rounded-[2.5rem] md:rounded-[3rem] p-6 md:p-12 text-white space-y-10 shadow-4xl relative overflow-hidden flex flex-col">
                    <div className="absolute top-0 right-0 p-10 opacity-5"><Zap className="h-48 w-48" /></div>
                    
                    <div className="relative z-10 flex flex-col space-y-10">
                        {/* 1. TOP STATS (Registry Hub Styles) */}
                        <div className="flex flex-wrap items-center justify-between gap-6 pb-8 border-b border-white/5">
                           <div className="flex items-center gap-6">
                              <div className="bg-white/5 px-4 py-2.5 rounded-xl border border-white/10 flex items-center gap-3">
                                 <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">REGISTRY FILTERED</span>
                                 <span className="text-sm font-black text-primary">{filteredBank.length} ASSETS</span>
                              </div>
                              <div className="bg-white/5 px-4 py-2.5 rounded-xl border border-white/10 flex items-center gap-3">
                                 <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">TOTAL BANK</span>
                                 <span className="text-sm font-black text-white">{questionBank.length} ASSETS</span>
                              </div>
                           </div>
                           <Badge className="bg-[#F97316] text-white border-none text-[9px] font-black px-4 py-1.5 rounded-lg shadow-2xl uppercase tracking-tighter">
                              Verified Hub
                           </Badge>
                        </div>

                        {/* 2. THREE COLUMN FILTER */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
                           <div className="space-y-3">
                              <Label className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] ml-1">SOURCE BOARD HUB</Label>
                              <Select value={filterBoard} onValueChange={setFilterBoard}>
                                 <SelectTrigger className="h-16 bg-white/5 border-white/10 rounded-2xl font-bold text-xs text-white px-6"><SelectValue placeholder="All..." /></SelectTrigger>
                                 <SelectContent className="bg-[#0B1528] text-white border-white/10 rounded-2xl">
                                    <SelectItem value="all">All Boards</SelectItem>
                                    {boards?.map(b => <SelectItem key={b.id} value={b.id}>{b.abbreviation} Hub</SelectItem>)}
                                 </SelectContent>
                              </Select>
                           </div>
                           <div className="space-y-3">
                              <Label className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] ml-1">RECRUITMENT VERTICAL</Label>
                              <Select value={filterExam} onValueChange={setFilterExam}>
                                 <SelectTrigger className="h-16 bg-white/5 border-white/10 rounded-2xl font-bold text-xs text-white px-6"><SelectValue placeholder="All..." /></SelectTrigger>
                                 <SelectContent className="bg-[#0B1528] text-white border-white/10 rounded-2xl">
                                    <SelectItem value="all">All Exams</SelectItem>
                                    {uniqueExams.map(e => <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>)}
                                 </SelectContent>
                              </Select>
                           </div>
                           <div className="space-y-3">
                              <Label className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] ml-1">SUBJECT NODE</Label>
                              <Select value={filterSubject} onValueChange={setFilterSubject}>
                                 <SelectTrigger className="h-16 bg-white/5 border-white/10 rounded-2xl font-bold text-xs text-white px-6"><SelectValue placeholder="All..." /></SelectTrigger>
                                 <SelectContent className="bg-[#0B1528] text-white border-white/10 rounded-2xl">
                                    <SelectItem value="all">All Subjects</SelectItem>
                                    {subjects?.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                                 </SelectContent>
                              </Select>
                           </div>
                        </div>

                        <div className="h-px w-full bg-white/10" />

                        {/* 3. TACTICAL COMMAND BAR (MATCHING SCREENSHOT) */}
                        <div className="space-y-10">
                          <div className="flex flex-col md:flex-row items-end gap-6">
                              <div className="flex-1 space-y-4 text-left w-full">
                                <div className="text-[10px] font-black uppercase text-slate-500 tracking-[0.3em] leading-tight">
                                   TARGET<br/>SECTION<br/>HUB
                                </div>
                                <Popover>
                                   <PopoverTrigger asChild>
                                      <button className="w-full h-20 bg-[#F97316] hover:bg-orange-600 text-white rounded-[1.5rem] font-black uppercase text-[18px] shadow-5xl tracking-[0.1em] transition-all flex items-center justify-center px-4">
                                         {sections.find(s => s.id === activeSectionId)?.name || "GENERAL HUB"}
                                      </button>
                                   </PopoverTrigger>
                                   <PopoverContent className="w-[280px] bg-[#0F172A] border-white/10 p-2 rounded-[2rem] shadow-5xl z-[1001]">
                                      <ScrollArea className="h-60">
                                         <div className="space-y-1 p-2">
                                            {sections.map(s => (
                                               <button 
                                                  key={s.id} 
                                                  onClick={() => setActiveSectionId(s.id)}
                                                  className={cn(
                                                     "w-full p-4 rounded-xl text-left font-black uppercase text-[10px] tracking-widest transition-all",
                                                     activeSectionId === s.id ? "bg-[#F97316] text-white shadow-lg" : "text-slate-400 hover:bg-white/5 hover:text-white"
                                                  )}
                                               >
                                                  {s.name}
                                               </button>
                                            ))}
                                         </div>
                                      </ScrollArea>
                                   </PopoverContent>
                                </Popover>
                              </div>
                              
                              <div className="flex-[2] flex gap-4 w-full">
                                <div className="flex-1 flex items-center justify-between bg-white/5 px-6 py-4 rounded-[1.5rem] border border-white/10 h-20 group">
                                    <div className="flex flex-col text-left">
                                       <span className="text-[10px] font-black uppercase text-slate-300 leading-tight">UNUSED</span>
                                       <span className="text-[10px] font-black uppercase text-slate-300 leading-tight">ONLY</span>
                                    </div>
                                    <Switch checked={hideUsed} onCheckedChange={setHideUsed} className="data-[state=checked]:bg-[#F97316]" />
                                </div>
                                <div className="flex-1 flex items-center justify-between bg-white/5 px-6 py-4 rounded-[1.5rem] border border-white/10 h-20 group">
                                    <div className="flex flex-col text-left">
                                       <span className="text-[10px] font-black uppercase text-slate-300 leading-tight">BLOCK</span>
                                       <span className="text-[10px] font-black uppercase text-slate-300 leading-tight">DUPLICATES</span>
                                    </div>
                                    <Switch checked={blockDuplicates} onCheckedChange={setBlockDuplicates} className="data-[state=checked]:bg-[#10B981]" />
                                </div>
                              </div>
                          </div>

                          <div className="flex flex-col md:flex-row gap-6">
                              <Button 
                                  onClick={handleSelectAllInBank} 
                                  variant="outline"
                                  className="h-20 flex-1 border-white/10 bg-white/5 hover:bg-white/10 text-white font-black uppercase text-[12px] tracking-[0.2em] rounded-[1.5rem]"
                              >
                                  SELECT ALL FILTERED
                              </Button>
                              <Button 
                                onClick={handleLinkQuestions}
                                disabled={bankSelection.length === 0}
                                className="h-20 flex-[2] bg-[#10B981] hover:bg-[#0E946A] text-white font-black uppercase text-[18px] tracking-[0.3em] rounded-[1.5rem] shadow-5xl border-none transition-all active:scale-95 gap-4"
                              >
                                LINK {bankSelection.length} ASSETS <Zap className="h-7 w-7 fill-current" />
                              </Button>
                          </div>
                        </div>
                    </div>
                  </div>

                  {/* QUESTION LIST */}
                  <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-500">
                    {bankLoading ? (
                      Array.from({length: 4}).map((_, i) => <Skeleton key={i} className="h-32 w-full rounded-[2rem]" />)
                    ) : filteredBank.map((q) => {
                      const isSelected = bankSelection.includes(q.id);
                      const board = boards?.find(b => b.id === q.boardId);
                      const sub = subjects?.find(s => s.id === q.subjectId);
                      return (
                        <Card 
                          key={q.id} 
                          onClick={() => setBankSelection(prev => isSelected ? prev.filter(id => id !== q.id) : [...prev, q.id])}
                          className="border-none shadow-xl rounded-[2.5rem] bg-white p-8 md:p-12 flex items-center gap-8 cursor-pointer transition-all hover:translate-y-[-4px] border border-slate-100 group overflow-hidden"
                        >
                           <div className={cn(
                              "h-12 w-12 rounded-full border-2 flex items-center justify-center shrink-0 transition-all",
                              isSelected ? "border-[#F97316] bg-[#F97316]/10 shadow-[0_0_15px_rgba(249,115,22,0.2)]" : "border-slate-200"
                           )}>
                              {isSelected && <div className="h-5 w-5 rounded-full bg-[#F97316]" />}
                           </div>
                           
                           <div className="flex-1 min-w-0 space-y-4 text-left">
                              <div className="flex items-center gap-3">
                                 <Badge className="bg-[#0B1528] text-white border-none font-black text-[9px] px-3 py-1 rounded uppercase tracking-widest">{board?.abbreviation || 'PSSSB'}</Badge>
                                 <Badge variant="outline" className="text-slate-400 border-slate-200 text-[9px] font-black uppercase px-3 py-1">{sub?.name || 'ICT'}</Badge>
                              </div>
                              <p className="font-black text-lg md:text-2xl text-[#0F172A] leading-tight antialiased break-words">
                                {q.englishQuestion}
                              </p>
                           </div>

                           <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={(e) => { e.stopPropagation(); handleDeleteFromBank(q.id); }}
                              className="h-12 w-12 text-rose-500 hover:bg-rose-50 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                           >
                              <Trash2 className="h-6 w-6" />
                           </Button>
                        </Card>
                      )
                    })}
                    {filteredBank.length === 0 && !bankLoading && (
                      <div className="py-20 text-center opacity-20 italic font-black uppercase text-xs tracking-widest">No matching registry nodes</div>
                    )}
                  </div>
                </>
              ) : (
                <div className="space-y-6 flex-1 flex flex-col">
                    <div className="flex items-center justify-between px-4">
                      <h3 className="text-xl font-headline font-black text-[#0F172A] uppercase flex items-center gap-3">
                          <Layers className="h-5 w-5 text-primary" /> Active Assembly
                      </h3>
                      <Badge className="bg-primary/10 text-primary border-none px-4 py-1 font-black uppercase text-[9px]">{sections.reduce((acc,s) => acc + s.questions.length, 0)} TOTAL LINKED</Badge>
                    </div>

                    <ScrollArea className="h-[700px] pr-4 flex-1">
                      <div className="space-y-8">
                          {sections.map((sec, sIdx) => (
                            <Card key={sec.id} className="border-none shadow-3xl rounded-[3rem] bg-white overflow-hidden border border-slate-100">
                                <div className="flex items-center justify-between p-8 bg-slate-50/50 border-b border-slate-50">
                                  <div className="flex items-center gap-6 text-left">
                                      <div className="h-10 w-10 bg-[#0F172A] text-white rounded-xl flex items-center justify-center font-black text-sm shadow-xl shrink-0">{sIdx + 1}</div>
                                      <div>
                                        <Input 
                                            value={sec.name} 
                                            onChange={e => setSections(p => p.map(s => s.id === sec.id ? { ...s, name: e.target.value.toUpperCase() } : s))} 
                                            className="h-8 w-full md:w-80 bg-transparent border-none font-black uppercase text-xl focus-visible:ring-0 p-0 text-[#0F172A]" 
                                        />
                                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">{sec.questions.length} Linked Assets</p>
                                      </div>
                                  </div>
                                  <Button variant="ghost" size="icon" onClick={() => setSections(p => p.filter(s => s.id !== sec.id))} className="h-12 w-12 text-rose-500 hover:bg-rose-50 rounded-2xl"><Trash2 className="h-5 w-5" /></Button>
                                </div>
                                <div className="p-8 space-y-4">
                                  {sec.questions.map((q: any, qIdx: number) => (
                                      <div key={q.id} className="flex items-center justify-between p-4 bg-slate-50/50 border border-slate-100 rounded-2xl group/item hover:bg-white hover:shadow-lg transition-all">
                                        <div className="flex items-center gap-6 min-w-0 flex-1">
                                            <span className="text-sm font-black text-slate-300 w-6 shrink-0 uppercase">#{qIdx + 1}</span>
                                            <p className="text-sm font-bold text-slate-600 truncate text-left">{q.englishQuestion}</p>
                                        </div>
                                        <button 
                                            className="text-rose-400 hover:text-rose-600 p-2 shrink-0"
                                            onClick={() => setSections(p => p.map(s => s.id === sec.id ? { ...s, questions: s.questions.filter((item: any) => item.id !== q.id) } : s))} 
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                      </div>
                                  ))}
                                  {sec.questions.length === 0 && (
                                      <div className="py-10 text-center opacity-20 italic font-black uppercase text-[10px]">Awaiting link node synchronization...</div>
                                  )}
                                </div>
                            </Card>
                          ))}

                          <Popover>
                            <PopoverTrigger asChild>
                                <Button className="h-24 w-full bg-white border-dashed border-2 border-slate-200 rounded-[2.5rem] shadow-xl hover:border-primary transition-all flex items-center justify-center gap-4 text-slate-400 font-black uppercase text-[11px] tracking-widest group">
                                  <Plus className="h-6 w-6 group-hover:rotate-90 transition-transform" /> ADD NEW SUBJECT HUB
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[340px] p-0 rounded-[2.5rem] bg-[#0F172A] text-white border-white/10 shadow-5xl overflow-hidden" align="center">
                                <div className="p-8 border-b border-white/5 space-y-4">
                                  <p className="text-[11px] font-black uppercase text-[#F97316] tracking-[0.3em] text-center">SELECT SUBJECT HUB</p>
                                  <div className="relative">
                                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                                      <Input 
                                        placeholder="Search registry..." 
                                        value={subjectSearch}
                                        onChange={(e) => setSubjectSearch(e.target.value)}
                                        className="h-12 pl-12 bg-white/5 border-white/10 rounded-xl font-bold text-sm focus-visible:ring-[#F97316] text-white" 
                                      />
                                  </div>
                                </div>
                                <ScrollArea className="h-[380px]">
                                  <div className="p-4 space-y-1">
                                      {filteredSubjectsForPicking.map((s: any) => (
                                        <button 
                                            key={s.id}
                                            onClick={() => addNewSection(s.name)}
                                            className="w-full flex items-center justify-between p-4 rounded-xl hover:bg-white/5 transition-all text-left group"
                                        >
                                            <div className="flex items-center gap-4">
                                              <SearchCode className="h-4 w-4 text-slate-500 group-hover:text-[#F97316]" />
                                              <span className="text-[11px] font-black uppercase tracking-tight text-slate-200 group-hover:text-white">{s.name}</span>
                                            </div>
                                            <Plus className="h-3.5 w-3.5 text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </button>
                                      ))}
                                  </div>
                                  <ScrollBar className="bg-white/10" />
                                </ScrollArea>
                            </PopoverContent>
                          </Popover>
                      </div>
                    </ScrollArea>
                </div>
              )}
           </div>
        </div>
      </div>
    </div>
  )
}
