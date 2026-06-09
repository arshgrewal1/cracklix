
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
import { Checkbox } from "@/components/ui/checkbox"
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
  Check
} from "lucide-react"
import { useCollection, useFirestore, useDoc } from "@/firebase"
import { collection, doc, setDoc, serverTimestamp, query, limit, getDocs, writeBatch, where, documentId, orderBy } from "firebase/firestore"
import { useToast } from "@/hooks/use-toast"
import { MockType, Difficulty, AccessLevel, LanguageDisplayMode, MockAssignmentMode } from "@/types"
import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

/**
 * @fileOverview Institutional Mock Architect v23.0.
 * UPDATED: High-Fidelity Subject Picker matching user screenshot.
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
  const { data: subjects } = useCollection<any>(useMemo(() => (db ? collection(db, "subjects") : null), [db]))
  
  // --- STATE HUB ---
  const [bankLoading, setBankLoading] = useState(false)
  const [questionBank, setQuestionBank] = useState<any[]>([])
  const [isPublishing, setIsPublishing] = useState(false)
  
  // Question Bank Filters
  const [searchTerm, setSearchTerm] = useState("")
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
    assignmentMode: "SINGLE" as MockAssignmentMode,
    targetCategoryId: "",
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
    { id: 'sec-1', name: 'General Hub', questions: [] }
  ])
  const [activeSectionId, setActiveSectionId] = useState('sec-1')

  // --- DATA SYNC ---
  useEffect(() => {
    async function fetchBank() {
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
    fetchBank()
  }, [db])

  useEffect(() => {
    if (existingMock && questionBank.length > 0) {
      setMockData({ 
        ...existingMock,
        assignmentMode: existingMock.assignmentMode || "SINGLE",
        boardIds: existingMock.boardIds || (existingMock.boardId ? [existingMock.boardId] : []),
        examIds: existingMock.examIds || (existingMock.examId ? [existingMock.examId] : [])
      });

      if (existingMock.questionIds) {
        let currentIndex = 0;
        const hydratedSections = (existingMock.sections || [{ name: 'General Hub', count: existingMock.questionIds.length }]).map((s: any, idx: number) => {
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

  // STRICT UNIQUENESS PROTOCOL
  const uniqueExams = useMemo(() => {
    if (!rawExams) return [];
    const seen = new Set();
    const filtered = rawExams.filter((e: any) => {
      const key = e.name?.toLowerCase().trim();
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    }).sort((a: any, b: any) => a.name.localeCompare(b.name));

    // Filter by Board if boards are selected
    if (mockData.boardIds.length > 0) {
       return filtered.filter(e => mockData.boardIds.includes(e.boardId));
    }
    return filtered;
  }, [rawExams, mockData.boardIds]);

  const filteredBoardsByCat = useMemo(() => {
     if (!boards) return [];
     if (!mockData.targetCategoryId) return boards;
     return boards.filter(b => b.categoryId === mockData.targetCategoryId);
  }, [boards, mockData.targetCategoryId]);

  // --- BANK FILTER LOGIC ---
  const filteredBank = useMemo(() => {
    const allSelectedIds = sections.flatMap(s => s.questions.map(q => q.id));
    const assemblyHashes = new Set(
      sections.flatMap(s => s.questions.map(q => 
        `${q.englishQuestion?.trim()}_${q.correctAnswer}`.toLowerCase()
      ))
    );

    return questionBank.filter((q: any) => {
      const matchesSearch = !searchTerm || (q.englishQuestion?.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesBoard = filterBoard === "all" || q.boardId === filterBoard;
      const matchesExam = filterExam === "all" || q.examId === filterExam;
      const matchesSub = filterSubject === "all" || q.subjectId === filterSubject;
      
      const notInThisMock = !allSelectedIds.includes(q.id);
      const usedGuard = !hideUsed || (q.status !== 'USED');
      
      const qHash = `${q.englishQuestion?.trim()}_${q.correctAnswer}`.toLowerCase();
      const isContentDuplicate = assemblyHashes.has(qHash);
      const duplicateGuard = !blockDuplicates || (!isContentDuplicate && q.status !== 'DUPLICATE');
      
      return matchesSearch && matchesBoard && matchesExam && matchesSub && notInThisMock && usedGuard && duplicateGuard;
    })
  }, [questionBank, searchTerm, filterBoard, filterExam, filterSubject, hideUsed, blockDuplicates, sections])

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

  const toggleExamId = (id: string) => {
     const current = mockData.examIds || [];
     if (mockData.assignmentMode === 'SINGLE') {
        setMockData({ ...mockData, examIds: [id] });
     } else {
        setMockData({
           ...mockData,
           examIds: current.includes(id) ? current.filter(x => x !== id) : [...current, id]
        });
     }
  };

  const toggleBoardId = (id: string) => {
    const current = mockData.boardIds || [];
    setMockData({
       ...mockData,
       boardIds: current.includes(id) ? current.filter(x => x !== id) : [...current, id]
    });
  };

  const addNewSection = (name: string) => {
    setSections([...sections, { id: `sec-${Date.now()}`, name: name, questions: [] }]);
    setSubjectSearch("");
  }

  return (
    <div className="max-w-[1600px] mx-auto space-y-6 pb-32 text-left pt-2 md:pt-4">
      
      {/* TOP COMMAND BAR */}
      <div className="flex flex-wrap items-center justify-between gap-6 px-4">
        <div className="flex items-center gap-6">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-2xl border bg-white h-12 w-12 shadow-sm">
             <ChevronLeft className="h-6 w-6" />
          </Button>
          <div className="text-left">
            <h1 className="text-2xl md:text-4xl font-headline font-black uppercase tracking-tight text-[#0F172A]">{isEditing ? "Modify Series" : "Mock Architect"}</h1>
            <p className="text-[9px] md:text-[10px] uppercase font-black tracking-widest text-slate-400 mt-1">Institutional Assembly Hub</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
           <Button onClick={handlePublish} disabled={isPublishing} className="bg-[#0F172A] hover:bg-black text-white font-black px-8 md:px-12 h-14 md:h-16 rounded-2xl uppercase text-[10px] md:text-[11px] tracking-[0.2em] gap-3 shadow-3xl border-none">
             {isPublishing ? <Loader2 className="h-4 w-4 animate-spin" /> : <ClipboardCheck className="h-5 w-5" />} {isEditing ? "Sync Hub" : "Deploy Series"}
           </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-10 px-4">
        
        {/* LEFT: ASSIGNMENT HUB */}
        <div className="lg:col-span-4 space-y-8">
           <div className="space-y-8 bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100">
              
              <div className="space-y-6">
                 <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Series Title</Label>
                    <Input 
                      value={mockData.title || ""} 
                      onChange={e => setMockData({...mockData, title: e.target.value})} 
                      className="rounded-xl h-14 border-slate-100 bg-slate-50/50 font-bold text-lg" 
                      placeholder="e.g. Patwari Full Mock 01" 
                    />
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                       <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Test Type</Label>
                       <Select value={mockData.mockType || "FULL"} onValueChange={(v: any) => setMockData({...mockData, mockType: v})}>
                          <SelectTrigger className="h-12 rounded-xl bg-slate-50 border-none font-black text-[10px] uppercase">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                             <SelectItem value="FULL">Full Length Mock</SelectItem>
                             <SelectItem value="SUBJECT">Subject-Wise Test</SelectItem>
                             <SelectItem value="SECTIONAL">Sectional Test</SelectItem>
                             <SelectItem value="PYQ">PYQ Paper</SelectItem>
                          </SelectContent>
                       </Select>
                    </div>
                    <div className="space-y-2">
                       <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Access Level</Label>
                       <Select value={mockData.accessLevel || "FREE"} onValueChange={(v: any) => setMockData({...mockData, accessLevel: v})}>
                          <SelectTrigger className="h-12 rounded-xl bg-slate-50 border-none font-black text-[10px] uppercase">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                             <SelectItem value="FREE">Public (FREE)</SelectItem>
                             <SelectItem value="PREMIUM">Elite (PREMIUM)</SelectItem>
                          </SelectContent>
                       </Select>
                    </div>
                 </div>

                 {/* DISTRIBUTION HUB */}
                 <div className="space-y-6 pt-6 border-t border-slate-50">
                    <div className="space-y-1">
                       <p className="text-[11px] font-black uppercase text-primary tracking-[0.3em]">Assignment Hub</p>
                    </div>
                    
                    <div className="space-y-4">
                       <div className="space-y-2">
                          <Label className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Target Category</Label>
                          <Select value={mockData.targetCategoryId} onValueChange={(v: any) => setMockData({...mockData, targetCategoryId: v, boardIds: []})}>
                             <SelectTrigger className="h-12 rounded-xl bg-slate-50 border-none font-bold text-xs">
                                <SelectValue placeholder="Select Category" />
                             </SelectTrigger>
                             <SelectContent>
                                <SelectItem value="all">All Categories</SelectItem>
                                {categories?.map(c => <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>)}
                             </SelectContent>
                          </Select>
                       </div>

                       <div className="space-y-2">
                          <Label className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Distribution Mode</Label>
                          <Select 
                            value={mockData.assignmentMode || "SINGLE"} 
                            onValueChange={(v: any) => setMockData({...mockData, assignmentMode: v, examIds: [], boardIds: []})}
                          >
                             <SelectTrigger className="h-14 bg-[#0F172A] text-white border-none rounded-xl px-4 font-black uppercase text-[10px] outline-none shadow-xl">
                                <SelectValue />
                             </SelectTrigger>
                             <SelectContent>
                                <SelectItem value="SINGLE">Single Vertical</SelectItem>
                                <SelectItem value="MULTIPLE">Multiple Verticals</SelectItem>
                                <SelectItem value="AUTHORITY">Authority Hub (Broadcast)</SelectItem>
                             </SelectContent>
                          </Select>
                       </div>

                       <div className="space-y-2">
                          <Label className="text-[9px] font-black uppercase text-slate-500 tracking-widest">
                            {mockData.assignmentMode === 'AUTHORITY' ? 'Target Authority Hubs' : 'Target Recruitment Verticals'}
                          </Label>
                          <div className="max-h-80 overflow-y-auto custom-scrollbar pr-2 space-y-1.5 bg-slate-50/50 p-4 rounded-2xl border border-slate-100 shadow-inner">
                             {mockData.assignmentMode === 'AUTHORITY' ? (
                               filteredBoardsByCat.map((b: any) => (
                                  <div key={b.id} className="flex items-center space-x-3 p-3 bg-white rounded-xl hover:bg-slate-100 transition-colors cursor-pointer shadow-sm border border-slate-100" onClick={() => toggleBoardId(b.id)}>
                                     <Checkbox checked={mockData.boardIds?.includes(b.id)} className="border-slate-300" />
                                     <span className="text-[10px] font-black text-[#0F172A] uppercase tracking-tighter">{b.abbreviation} Hub</span>
                                  </div>
                               ))
                             ) : (
                               uniqueExams.map((e: any) => (
                                  <div key={e.id} className="flex items-center space-x-3 p-3 bg-white rounded-xl hover:bg-slate-100 transition-colors cursor-pointer shadow-sm border border-slate-100" onClick={() => toggleExamId(e.id)}>
                                     <Checkbox checked={mockData.examIds?.includes(e.id)} className="border-slate-300" />
                                     <span className="text-[10px] font-black text-[#0F172A] uppercase tracking-tighter">{e.name}</span>
                                  </div>
                               ))
                             )}
                          </div>
                       </div>
                    </div>
                 </div>
              </div>
           </div>
        </div>

        {/* RIGHT: GLOBAL QUESTION BANK */}
        <div className="lg:col-span-8 space-y-6">
           <div className="bg-[#0B1528] rounded-[2.5rem] p-10 md:p-14 text-white space-y-10 shadow-4xl relative overflow-hidden border border-white/5">
              <div className="absolute top-0 right-0 p-10 opacity-5"><Zap className="h-40 w-40" /></div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10 text-left">
                 <div className="space-y-3">
                    <Label className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Source Board Hub</Label>
                    <select value={filterBoard} onChange={e => setFilterBoard(e.target.value)} className="w-full h-14 bg-white/5 border border-white/10 rounded-xl px-4 font-black uppercase text-[10px] outline-none text-white focus:border-primary transition-all">
                       <option value="all" className="bg-[#0B1528]">All Boards</option>
                       {boards?.map((b:any) => <option key={b.id} value={b.id} className="bg-[#0B1528]">{b.abbreviation}</option>)}
                    </select>
                 </div>
                 <div className="space-y-3">
                    <Label className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Recruitment Vertical</Label>
                    <select value={filterExam} onChange={e => setFilterExam(e.target.value)} className="w-full h-14 bg-white/5 border border-white/10 rounded-xl px-4 font-black uppercase text-[10px] outline-none text-white focus:border-primary transition-all">
                       <option value="all" className="bg-[#0B1528]">All Exams</option>
                       {uniqueExams.map((ex:any) => <option key={ex.id} value={ex.id} className="bg-[#0B1528]">{ex.name}</option>)}
                    </select>
                 </div>
                 <div className="space-y-3">
                    <Label className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Subject Node</Label>
                    <select value={filterSubject} onChange={e => setFilterSubject(e.target.value)} className="w-full h-14 bg-white/5 border border-white/10 rounded-xl px-4 font-black uppercase text-[10px] outline-none text-white focus:border-primary transition-all">
                       <option value="all" className="bg-[#0B1528]">All Subjects</option>
                       {subjects?.map((s:any) => <option key={s.id} value={s.id} className="bg-[#0B1528]">{s.name}</option>)}
                    </select>
                 </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center pt-10 border-t border-white/5 relative z-10">
                 <div className="lg:col-span-5 space-y-3 text-left">
                    <Label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.3em] ml-1">Target Section Hub</Label>
                    <select 
                      value={activeSectionId} 
                      onChange={e => setActiveSectionId(e.target.value)} 
                      className="w-full h-16 bg-[#F97316] text-white border-none rounded-2xl px-6 font-black uppercase text-[12px] md:text-[14px] outline-none shadow-2xl tracking-[0.1em]"
                    >
                       {sections.map(s => <option key={s.id} value={s.id}>{s.name.toUpperCase()}</option>)}
                    </select>
                 </div>

                 <div className="lg:col-span-7 flex flex-wrap items-center justify-end gap-6 pt-4 lg:pt-0">
                    <div className="flex items-center gap-4 bg-white/5 px-6 h-14 rounded-2xl border border-white/5 shadow-inner">
                       <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Unused Only</span>
                       <Switch checked={hideUsed} onCheckedChange={setHideUsed} className="data-[state=checked]:bg-primary" />
                    </div>
                    
                    <div className="flex items-center gap-4 bg-white/5 px-6 h-14 rounded-2xl border border-white/5 shadow-inner">
                       <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Block Duplicates</span>
                       <Switch checked={blockDuplicates} onCheckedChange={setBlockDuplicates} className="data-[state=checked]:bg-emerald-500" />
                    </div>

                    <button 
                      onClick={handleSelectAllInBank} 
                      className="h-14 px-8 bg-white/5 border border-white/10 hover:bg-white/10 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-white transition-all shadow-xl"
                    >
                       {bankSelection.length === filteredBank.length ? 'Deselect All' : 'Select All'}
                    </button>
                 </div>
              </div>

              <div className="pt-6">
                <Button 
                   onClick={handleLinkQuestions}
                   disabled={bankSelection.length === 0}
                   className="w-full h-20 bg-[#10B981] hover:bg-[#059669] text-white font-black uppercase text-[12px] md:text-[14px] tracking-[0.3em] rounded-3xl shadow-4xl border-none transition-all active:scale-95 gap-4"
                >
                   LINK {bankSelection.length} ASSETS <Zap className="h-5 w-5 fill-current" />
                </Button>
              </div>
           </div>

           {/* QUESTION LIST PREVIEW - ACTIVE ASSEMBLY */}
           <div className="space-y-6 pt-10">
              <div className="flex items-center justify-between px-4">
                 <div className="flex items-center gap-3">
                    <Database className="h-5 w-5 text-primary" />
                    <h3 className="text-xl font-headline font-black text-[#0F172A] uppercase">Active Assembly</h3>
                 </div>
                 <Badge className="bg-primary/10 text-primary border-none px-4 py-1 font-black uppercase text-[9px]">{sections.reduce((acc,s) => acc + s.questions.length, 0)} Total Linked</Badge>
              </div>

              <ScrollArea className="h-[600px] pr-4">
                <div className="space-y-10">
                  {sections.map((sec, sIdx) => (
                    <Card key={sec.id} className="border-none shadow-3xl rounded-[3rem] bg-white overflow-hidden border border-slate-100 hover:border-primary/20 transition-all group">
                       <div className="flex items-center justify-between p-8 bg-slate-50/50 border-b border-slate-50">
                          <div className="flex items-center gap-6">
                             <div className="h-10 w-10 bg-[#0F172A] text-white rounded-xl flex items-center justify-center font-black text-sm shadow-xl shrink-0">{sIdx + 1}</div>
                             <div className="space-y-1 text-left">
                                <Input 
                                  value={sec.name} 
                                  onChange={e => setSections(p => p.map(s => s.id === sec.id ? { ...s, name: e.target.value } : s))} 
                                  className="h-10 w-full md:w-80 bg-transparent border-none font-black uppercase text-xl focus-visible:ring-0 p-0 text-[#0F172A]" 
                                />
                             </div>
                          </div>
                          <div className="flex items-center gap-4">
                             <Button variant="ghost" size="icon" onClick={() => setSections(p => p.filter(s => s.id !== sec.id))} className="h-12 w-12 text-rose-500 hover:bg-rose-50 rounded-2xl transition-colors"><Trash2 className="h-5 w-5" /></Button>
                          </div>
                       </div>
                       <div className="p-8 space-y-4">
                          {sec.questions.map((q: any, qIdx: number) => (
                             <div key={q.id} className="flex items-center justify-between p-4 bg-slate-50/50 border border-slate-100 rounded-2xl group/item hover:bg-white hover:shadow-lg transition-all">
                                <div className="flex items-center gap-6 min-w-0">
                                   <span className="text-[10px] font-black text-slate-300 w-6 uppercase">#{qIdx + 1}</span>
                                   <p className="text-sm font-bold text-slate-600 truncate max-w-2xl text-left">{q.englishQuestion}</p>
                                </div>
                                <button onClick={() => setSections(p => p.map(s => s.id === sec.id ? { ...s, questions: s.questions.filter((item: any) => item.id !== q.id) } : s))} className="opacity-0 group-hover/item:opacity-100 text-rose-400 hover:text-rose-600 p-2"><X className="h-4 w-4" /></button>
                             </div>
                          ))}
                       </div>
                    </Card>
                  ))}
                  
                  {/* SEARCHABLE SUBJECT PICKER (Matches User Screenshot) */}
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button className="h-20 w-full bg-white border-dashed border-2 border-slate-200 rounded-[2.5rem] shadow-xl hover:border-primary transition-all flex items-center justify-center gap-4 text-slate-400 font-black uppercase text-[11px] tracking-widest">
                         <Plus className="h-6 w-6" /> ADD NEW SUBJECT NODE
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[320px] p-0 rounded-[2rem] bg-[#0F172A] text-white border-white/10 shadow-5xl overflow-hidden" align="center">
                       <div className="p-6 border-b border-white/5 space-y-4">
                          <p className="text-[11px] font-black uppercase text-[#F97316] tracking-[0.2em] text-center">SELECT SUBJECT NODE</p>
                          <div className="relative">
                             <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                             <Input 
                               placeholder="Search registry..." 
                               value={subjectSearch}
                               onChange={(e) => setSubjectSearch(e.target.value)}
                               className="h-12 pl-12 bg-white/5 border-white/10 rounded-xl font-bold text-sm focus-visible:ring-[#F97316] text-white placeholder:text-slate-500" 
                             />
                          </div>
                       </div>
                       <ScrollArea className="h-[350px]">
                          <div className="p-3 space-y-1">
                             {filteredSubjectsForPicking.map((s: any) => (
                                <button 
                                   key={s.id}
                                   onClick={() => addNewSection(s.name)}
                                   className="w-full flex items-center justify-between p-4 rounded-xl hover:bg-white/5 transition-all text-left group"
                                >
                                   <div className="flex items-center gap-4">
                                      <SearchCode className="h-3.5 w-3.5 text-slate-500 group-hover:text-[#F97316]" />
                                      <span className="text-[11px] font-black uppercase tracking-tight text-slate-200 group-hover:text-white">{s.name}</span>
                                   </div>
                                   <Plus className="h-3 w-3 text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </button>
                             ))}
                             <div className="p-2 pt-4 border-t border-white/5 mt-2">
                                <button 
                                   onClick={() => addNewSection(`Section ${sections.length + 1}`)}
                                   className="w-full flex items-center justify-center h-12 rounded-xl bg-primary/10 border border-[#F97316]/20 text-[#F97316] font-black uppercase text-[9px] tracking-widest hover:bg-[#F97316] hover:text-white transition-all shadow-lg"
                                >
                                   + Custom Section
                                </button>
                             </div>
                          </div>
                          <ScrollBar className="bg-white/10" />
                       </ScrollArea>
                    </PopoverContent>
                  </Popover>
                </div>
              </ScrollArea>
           </div>
        </div>
      </div>
    </div>
  )
}
