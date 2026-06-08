
"use client"

import React, { useState, useMemo, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
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
  PlusCircle,
  Filter,
  BookOpen,
  Lock,
  History,
  Target,
  Languages,
  ShieldCheck,
  Settings2,
  CheckCircle2,
  Gem,
  LayoutGrid,
  Landmark,
  ChevronRight,
  GraduationCap,
  AlertTriangle,
  FileStack,
  ListTree,
  SearchCode
} from "lucide-react"
import { useCollection, useFirestore, useDoc } from "@/firebase"
import { collection, doc, setDoc, serverTimestamp, query, limit, getDocs, writeBatch, where } from "firebase/firestore"
import { useToast } from "@/hooks/use-toast"
import { MockType, Difficulty, AccessType, LanguageDisplayMode } from "@/types"
import { cn } from "@/lib/utils"

/**
 * @fileOverview Elite Institutional Mock Architect v52.1.
 * FIXED: Resolved NaN input value error by implementing safe numeric casting.
 * FIXED: Recalibrated 'Unused Only' logic to be inclusive of fresh assets while blocking used ones.
 */

const SELECTION_RULES = [
  { id: 'unused-only', label: 'Use Only Unused Questions', icon: <Zap className="h-3 w-3" /> },
  { id: 'no-locked', label: 'Exclude Locked Assets', icon: <Lock className="h-3 w-3" /> },
  { id: 'no-duplicates', label: 'Block Duplicates', icon: <ShieldCheck className="h-3 w-3" /> }
];

const ASSIGNMENT_MODES = [
  { id: 'SINGLE', label: 'Single Vertical' },
  { id: 'MULTIPLE', label: 'Multiple Verticals' },
  { id: 'BOARD', label: 'Entire Authority Hub' }
];

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

  const { data: existingMock } = useDoc<any>(useMemo(() => (db && mockId ? doc(db, "mocks", mockId) : null), [db, mockId]))
  const { data: rawBoards } = useCollection<any>(useMemo(() => (db ? collection(db, "boards") : null), [db]))
  const { data: allExamsRaw } = useCollection<any>(useMemo(() => (db ? collection(db, "exams") : null), [db]))
  const { data: subjects } = useCollection<any>(useMemo(() => (db ? collection(db, "subjects") : null), [db]))
  
  const boards = useMemo(() => {
     if (!rawBoards) return [];
     const unique = new Map();
     rawBoards.forEach(b => {
        const key = b.abbreviation?.toLowerCase().trim() || b.id;
        if (!unique.has(key)) unique.set(key, b);
     });
     return Array.from(unique.values()).sort((a, b) => a.abbreviation.localeCompare(b.abbreviation));
  }, [rawBoards]);

  const allExams = useMemo(() => {
     if (!allExamsRaw) return [];
     const unique = new Map();
     allExamsRaw.forEach(e => {
        const normalizedName = e.name?.toLowerCase().trim();
        if (!unique.has(normalizedName)) {
           unique.set(normalizedName, e);
        }
     });
     return Array.from(unique.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [allExamsRaw]);

  const [bankLoading, setBankLoading] = useState(false)
  const [questionBank, setQuestionBank] = useState<any[]>([])
  const [activeRules, setActiveRules] = useState<string[]>(['unused-only', 'no-locked', 'no-duplicates'])
  const [assignmentMode, setAssignmentMode] = useState<'SINGLE' | 'MULTIPLE' | 'BOARD'>('SINGLE')
  const [searchBoard, setSearchBoard] = useState("")
  const [searchExam, setSearchExam] = useState("")
  
  const [isPublishing, setIsPublishing] = useState(false)
  const [mockData, setMockData] = useState<any>({
    title: "", 
    sourceBoardId: "", 
    boardIds: [] as string[], 
    examIds: [] as string[],
    duration: 120, 
    difficulty: "Medium" as Difficulty, 
    mockType: "FULL" as MockType, 
    accessType: "FREE" as AccessType,
    published: false,
    languageMode: "ENGLISH_PUNJABI" as LanguageDisplayMode,
    positiveMarks: 1,
    negativeMarks: 0.25,
    attemptLimit: 0,
  })

  const [sections, setSections] = useState<any[]>([
    { id: 'sec-1', name: 'General Hub', questions: [] }
  ])
  const [activeSectionId, setActiveSectionId] = useState('sec-1')
  const [bankSelection, setBankSelection] = useState<string[]>([])
  const [bankFilter, setBankFilter] = useState({ subjectId: "all" })

  useEffect(() => {
    async function fetchBank() {
      if (!db || !mockData.sourceBoardId) return
      setBankLoading(true)
      try {
        const q = query(
           collection(db, "questions"), 
           where("boardId", "==", mockData.sourceBoardId),
           limit(2000)
        )
        const snap = await getDocs(q)
        setQuestionBank(snap.docs.map(d => ({ ...d.data(), id: d.id })))
      } finally {
        setBankLoading(false)
      }
    }
    fetchBank()
  }, [db, mockData.sourceBoardId])

  useEffect(() => {
    if (existingMock && questionBank.length > 0) {
      setMockData(prev => ({ 
        ...prev, 
        ...existingMock,
        sourceBoardId: existingMock.sourceBoardId || existingMock.boardId || "",
        boardIds: existingMock.boardIds || (existingMock.boardId ? [existingMock.boardId] : []),
        examIds: existingMock.examIds || (existingMock.examId ? [existingMock.examId] : []),
      }));

      if (existingMock.sections && existingMock.sections.length > 0 && existingMock.questionIds) {
        let currentIndex = 0;
        const qIds = existingMock.questionIds;
        const hydratedSections = existingMock.sections.map((s: any, idx: number) => {
          const sectionQIds = qIds.slice(currentIndex, currentIndex + (s.count || 0));
          currentIndex += (s.count || 0);
          return {
            id: `sec-${idx + 1}`,
            name: s.name,
            questions: questionBank.filter(q => sectionQIds.includes(q.id))
          };
        });
        setSections(hydratedSections);
        if (hydratedSections[0]) setActiveSectionId(hydratedSections[0].id);
      }
    }
  }, [existingMock, questionBank])

  const filteredBank = useMemo(() => {
    const allSelectedIds = sections.flatMap(s => s.questions.map(q => q.id));
    return questionBank.filter((q: any) => {
      const matchesSubject = bankFilter.subjectId === "all" || q.subjectId === bankFilter.subjectId
      const notAlreadySelected = !allSelectedIds.includes(q.id)
      
      const qStatus = q.status || 'UNUSED';
      const qUsedCount = q.usedCount || 0;

      // RECALIBRATED UNUSED LOGIC: Exclude only if explicitly USED, REPEATED or usedCount > 0
      if (activeRules.includes('unused-only')) {
         if (qStatus === 'USED' || qStatus === 'REPEATED' || qUsedCount > 0) return false;
      }
      
      if (activeRules.includes('no-locked') && qStatus === 'LOCKED') return false;
      if (activeRules.includes('no-duplicates') && qStatus === 'DUPLICATE') return false;

      return matchesSubject && notAlreadySelected
    })
  }, [questionBank, bankFilter, sections, activeRules])

  const handleBulkLink = () => {
    const toAdd = questionBank.filter(q => bankSelection.includes(q.id))
    setSections(sections.map(s => s.id === activeSectionId ? { ...s, questions: [...s.questions, ...toAdd] } : s));
    setBankSelection([])
    toast({ title: "Assets Linked" })
  }

  const handlePublish = async () => {
    if (!db || isPublishing) return
    if (!mockData.title || !mockData.sourceBoardId) {
      toast({ variant: "destructive", title: "Audit Blocked", description: "Source Board and Title are mandatory." })
      return
    }

    const flatQuestionIds = sections.flatMap(s => s.questions.map(q => q.id));
    if (flatQuestionIds.length === 0) {
      toast({ variant: "destructive", title: "Deployment Rejected", description: "At least one question must be linked to a section." })
      return;
    }

    setIsPublishing(true)
    const finalId = mockId || `mock-${Date.now()}`
    const mockRef = doc(db, "mocks", finalId)
    
    const sectionMetadata = sections.map(s => ({ name: s.name, count: s.questions.length })).filter(s => s.count > 0);

    let finalExamIds = [...(mockData.examIds || [])];
    if (assignmentMode === 'BOARD') {
       const boardExams = allExams?.filter((e: any) => (mockData.boardIds || []).includes(e.boardId)).map((e: any) => e.id) || [];
       finalExamIds = Array.from(new Set([...finalExamIds, ...boardExams]));
    }

    const payload = {
      ...mockData,
      id: finalId,
      boardId: mockData.boardIds?.[0] || mockData.sourceBoardId,
      examIds: finalExamIds,
      totalQuestions: flatQuestionIds.length,
      questionIds: flatQuestionIds,
      sections: sectionMetadata,
      updatedAt: serverTimestamp(),
      createdAt: existingMock?.createdAt || serverTimestamp(),
      totalMarks: flatQuestionIds.length * (parseFloat(mockData.positiveMarks) || 1),
    };

    // Strict cleaning
    Object.keys(payload).forEach(k => (payload[k] === undefined || payload[k] === null) && delete payload[k]);

    try {
      await setDoc(mockRef, payload, { merge: true });
      
      // CHUNKED BATCH UPDATE
      const CHUNK_SIZE = 450;
      for (let i = 0; i < flatQuestionIds.length; i += CHUNK_SIZE) {
        const chunk = flatQuestionIds.slice(i, i + CHUNK_SIZE);
        const batch = writeBatch(db);
        chunk.forEach(id => {
          batch.update(doc(db, "questions", id), {
            status: 'USED',
            usedCount: (questionBank.find(q => q.id === id)?.usedCount || 0) + 1,
            lastUsedDate: new Date().toISOString()
          });
        });
        await batch.commit();
      }

      toast({ title: "Series Deployed", description: "The mock has been synced to the registry." });
      router.push("/admin/mocks")
    } catch (e: any) {
      toast({ variant: "destructive", title: "Sync Failed", description: e.message })
    } finally {
      setIsPublishing(false)
    }
  }

  return (
    <div className="max-w-[1600px] mx-auto space-y-8 pb-32 text-left pt-4">
      <div className="flex flex-wrap items-center justify-between gap-6 px-4">
        <div className="flex items-center gap-4 md:gap-6">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-2xl border bg-white h-12 w-12 shadow-sm"><ChevronLeft className="h-6 w-6" /></Button>
          <div className="text-left">
            <h1 className="text-2xl md:text-4xl font-headline font-black uppercase tracking-tight text-[#0F172A]">{isEditing ? "Modify Mock" : "Elite Architect"}</h1>
            <p className="text-[10px] uppercase font-black tracking-widest text-slate-400 mt-1">Language & Access Registry Hub</p>
          </div>
        </div>
        <Button 
          className="bg-primary hover:bg-orange-600 font-black px-6 md:px-12 h-14 md:h-16 rounded-2xl uppercase text-[10px] md:text-[11px] tracking-[0.2em] gap-3 shadow-3xl border-none transition-all active:scale-95 shrink-0" 
          onClick={handlePublish} 
          disabled={isPublishing}
        >
          {isPublishing ? <Loader2 className="h-4 w-4 animate-spin" /> : <ClipboardCheck className="h-5 w-5" />} 
          <span className="whitespace-nowrap">Deploy Live Registry</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 px-4">
        <div className="lg:col-span-4 space-y-8 overflow-y-auto max-h-[85vh] custom-scrollbar pr-2">
          
          <Card className="border-none shadow-4xl rounded-[3rem] bg-[#0F172A] text-white p-10 space-y-8">
             <div className="space-y-6">
               <div className="space-y-4">
                  <p className="text-[10px] font-black uppercase text-primary tracking-[0.3em] ml-1">Step 1: Source Bank Silo</p>
                  <Select value={mockData.sourceBoardId} onValueChange={(v) => setMockData({...mockData, sourceBoardId: v})}>
                     <SelectTrigger className="h-14 rounded-xl bg-white/5 border-none font-black uppercase text-[11px] tracking-widest">
                        <div className="flex items-center gap-2"><Landmark className="h-4 w-4" /> <SelectValue placeholder="Select Source Board" /></div>
                     </SelectTrigger>
                     <SelectContent>
                        {boards?.map((b: any) => <SelectItem key={b.id} value={b.id}>{b.abbreviation} Silo</SelectItem>)}
                     </SelectContent>
                  </Select>
               </div>
            </div>
          </Card>

          <Card className="border-none shadow-4xl rounded-[3rem] bg-white p-10 space-y-8">
             <div className="space-y-8">
                <p className="text-[10px] font-black uppercase text-primary tracking-[0.3em] ml-1">Step 2: Institutional Metadata</p>
                
                <div className="space-y-2">
                   <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Series Title</Label>
                   <Input value={mockData.title ?? ""} onChange={e => setMockData({...mockData, title: e.target.value})} className="rounded-xl h-14 font-bold text-lg border-slate-100" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase text-slate-500 ml-1 flex items-center gap-2"><Layers className="h-3 w-3" /> Category</Label>
                      <Select value={mockData.mockType} onValueChange={(v: any) => setMockData({...mockData, mockType: v})}>
                         <SelectTrigger className="h-12 rounded-xl bg-slate-50 border-none font-black text-[9px] uppercase"><SelectValue /></SelectTrigger>
                         <SelectContent>
                            <SelectItem value="FULL">Full Length</SelectItem>
                            <SelectItem value="SUBJECT">Subject-wise</SelectItem>
                            <SelectItem value="SECTIONAL">Sectional Test</SelectItem>
                            <SelectItem value="PYQ">PYQ Series</SelectItem>
                         </SelectContent>
                      </Select>
                   </div>
                   <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase text-slate-500 ml-1 flex items-center gap-2"><Languages className="h-3 w-3" /> Language Mode</Label>
                      <Select value={mockData.languageMode} onValueChange={(v: any) => setMockData({...mockData, languageMode: v})}>
                         <SelectTrigger className="h-12 rounded-xl bg-slate-50 border-none font-black text-[9px] uppercase"><SelectValue /></SelectTrigger>
                         <SelectContent>
                            <SelectItem value="ENGLISH_PUNJABI">English & Punjabi</SelectItem>
                            <SelectItem value="ENGLISH_HINDI">English & Hindi</SelectItem>
                            <SelectItem value="ENGLISH">English Only</SelectItem>
                            <SelectItem value="PUNJABI">Punjabi Only</SelectItem>
                            <SelectItem value="HINDI">Hindi Only</SelectItem>
                         </SelectContent>
                      </Select>
                   </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Duration (Mins)</Label>
                      <Input 
                        type="number" 
                        value={isNaN(mockData.duration) ? "" : mockData.duration} 
                        onChange={e => setMockData({...mockData, duration: parseInt(e.target.value) || 0})} 
                        className="h-12 rounded-xl bg-slate-50/50 border-none font-black text-center" 
                      />
                   </div>
                   <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Access Level</Label>
                      <Select value={mockData.accessType ?? "FREE"} onValueChange={(v: any) => setMockData({...mockData, accessType: v})}>
                         <SelectTrigger className="h-12 rounded-xl bg-slate-50/50 border-none font-black text-[10px] uppercase"><SelectValue /></SelectTrigger>
                         <SelectContent><SelectItem value="FREE">FREE PASS</SelectItem><SelectItem value="PREMIUM">PREMIUM PASS</SelectItem></SelectContent>
                      </Select>
                   </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Pos Marks (+)</Label>
                      <Input 
                        type="number" 
                        step="0.5" 
                        value={isNaN(mockData.positiveMarks) ? "" : mockData.positiveMarks} 
                        onChange={e => setMockData({...mockData, positiveMarks: parseFloat(e.target.value) || 0})} 
                        className="h-12 rounded-xl bg-slate-50/50 border-none font-black text-center" 
                      />
                   </div>
                   <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Neg Marks (-)</Label>
                      <Input 
                        type="number" 
                        step="0.05" 
                        value={isNaN(mockData.negativeMarks) ? "" : mockData.negativeMarks} 
                        onChange={e => setMockData({...mockData, negativeMarks: parseFloat(e.target.value) || 0})} 
                        className="h-12 rounded-xl bg-slate-50/50 border-none font-black text-center" 
                      />
                   </div>
                </div>

                <div className="space-y-4 pt-6 border-t border-slate-50">
                  <p className="text-[10px] font-black uppercase text-primary tracking-[0.3em] ml-1">Attempt Hub Enforcement</p>
                  <Select value={mockData.attemptLimit?.toString()} onValueChange={(v) => setMockData({...mockData, attemptLimit: parseInt(v) || 0})}>
                     <SelectTrigger className="h-12 rounded-xl bg-slate-50/50 border-none font-black text-[10px] uppercase"><SelectValue /></SelectTrigger>
                     <SelectContent>
                        <SelectItem value="0">Unlimited Attempts</SelectItem>
                        <SelectItem value="1">1 Attempt Max</SelectItem>
                        <SelectItem value="2">2 Attempts Max</SelectItem>
                        <SelectItem value="3">3 Attempts Max</SelectItem>
                        <SelectItem value="5">5 Attempts Max</SelectItem>
                     </SelectContent>
                  </Select>
               </div>
             </div>
          </Card>

          <Card className="border-none shadow-4xl rounded-[3rem] bg-white p-10 space-y-8">
             <div className="space-y-6">
                <p className="text-[10px] font-black uppercase text-primary tracking-[0.3em] ml-1">Step 3: Target Registries</p>
                <div className="grid grid-cols-1 gap-2">
                   {ASSIGNMENT_MODES.map(mode => (
                      <button 
                         key={mode.id}
                         onClick={() => setAssignmentMode(mode.id as any)}
                         className={cn(
                            "px-4 py-3 rounded-xl border font-black text-[10px] uppercase tracking-widest transition-all text-left flex items-center justify-between",
                            assignmentMode === mode.id ? "bg-[#0F172A] border-[#0F172A] text-white shadow-lg" : "bg-white border-slate-100 text-slate-400"
                         )}
                      >
                         {mode.label}
                         {assignmentMode === mode.id && <CheckCircle2 className="h-3 w-3 text-primary" />}
                      </button>
                   ))}
                </div>

                <div className="pt-4 space-y-6">
                  {assignmentMode === 'BOARD' ? (
                     <div className="space-y-4">
                        <div className="relative">
                           <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3 w-3 text-slate-400" />
                           <Input value={searchBoard} onChange={e => setSearchBoard(e.target.value)} placeholder="Search Authorities..." className="h-10 pl-9 rounded-xl border-slate-100 text-[10px] font-bold" />
                        </div>
                        <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto custom-scrollbar border-l-2 border-slate-100 pl-4">
                           {boards?.filter(b => b.abbreviation?.toLowerCase().includes(searchBoard.toLowerCase())).map((b: any) => (
                              <div key={b.id} className={cn("flex items-center gap-3 p-3 rounded-xl border transition-all", (mockData.boardIds || []).includes(b.id) ? "border-primary bg-primary/5" : "border-slate-50")}>
                                 <Checkbox checked={(mockData.boardIds || []).includes(b.id)} onCheckedChange={(checked) => {
                                    const current = mockData.boardIds || [];
                                    setMockData({...mockData, boardIds: checked ? [...current, b.id] : current.filter(id => id !== b.id)});
                                 }} />
                                 <span className="text-[10px] font-black uppercase truncate">{b.abbreviation} Hub</span>
                              </div>
                           ))}
                        </div>
                     </div>
                  ) : (
                     <div className="space-y-4">
                        <div className="relative">
                           <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3 w-3 text-slate-400" />
                           <Input value={searchExam} onChange={e => setSearchExam(e.target.value)} placeholder="Search Verticals..." className="h-10 pl-9 rounded-xl border-slate-100 text-[10px] font-bold" />
                        </div>
                        <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto custom-scrollbar border-l-2 border-slate-100 pl-4">
                           {allExams?.filter(e => e.name?.toLowerCase().includes(searchExam.toLowerCase())).map((e: any) => (
                              <div key={e.id} className={cn("flex items-center gap-3 p-3 rounded-lg border transition-all", (mockData.examIds || []).includes(e.id) ? "border-primary bg-primary/5" : "border-slate-50")}>
                                 <Checkbox checked={(mockData.examIds || []).includes(e.id)} onCheckedChange={(checked) => {
                                    const current = mockData.examIds || [];
                                    if (assignmentMode === 'SINGLE') {
                                       setMockData({...mockData, examIds: checked ? [e.id] : []});
                                    } else {
                                       setMockData({...mockData, examIds: checked ? [...current, e.id] : current.filter(id => id !== e.id)});
                                    }
                                 }} />
                                 <span className="text-[10px] font-black uppercase truncate">{e.name}</span>
                              </div>
                           ))}
                        </div>
                     </div>
                  )}
                </div>
             </div>
          </Card>

          <Card className="border-none shadow-4xl rounded-[3rem] bg-white p-10 space-y-8">
             <div className="space-y-6">
                <p className="text-[10px] font-black uppercase text-primary tracking-[0.3em] ml-1">Step 4: Selection Logic</p>
                <div className="grid grid-cols-1 gap-2">
                   {SELECTION_RULES.map(rule => (
                      <button 
                         key={rule.id}
                         onClick={() => setActiveRules(prev => prev.includes(rule.id) ? prev.filter(r => r !== rule.id) : [...prev, rule.id])}
                         className={cn(
                            "flex items-center justify-between p-4 rounded-xl border transition-all text-left group",
                            activeRules.includes(rule.id) ? "bg-[#0F172A] border-[#0F172A] text-white shadow-lg" : "bg-white border-slate-100 text-slate-400"
                         )}
                      >
                         <div className="flex items-center gap-3">
                            {React.isValidElement(rule.icon) ? React.cloneElement(rule.icon as React.ReactElement, { className: cn("h-4 w-4", activeRules.includes(rule.id) ? "text-primary" : "text-slate-300") }) : rule.icon}
                            <span className="text-[10px] font-bold uppercase tracking-tight">{rule.label}</span>
                         </div>
                         {activeRules.includes(rule.id) && <CheckCircle2 className="h-4 w-4 text-emerald-500" />}
                      </button>
                   ))}
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <p className="font-black text-[11px] uppercase text-[#0F172A]">Registry Live</p>
                  <Switch checked={mockData.published} onCheckedChange={v => setMockData({...mockData, published: v})} />
                </div>
             </div>
          </Card>
        </div>

        <div className="lg:col-span-8 space-y-6">
           <Card className="border-none shadow-4xl rounded-[4rem] bg-white overflow-hidden min-h-[800px] flex flex-col border border-slate-100">
              <Tabs defaultValue="bank" className="flex-1 flex flex-col">
                 <TabsList className="bg-slate-50/50 border-b border-slate-100 w-full justify-start h-20 px-10 gap-12 rounded-none">
                    <TabsTrigger value="bank" className="font-black uppercase text-[11px] tracking-widest gap-3 h-12 data-[state=active]:text-primary"><Database className="h-4 w-4" /> Global Silo</TabsTrigger>
                    <TabsTrigger value="assembly" className="font-black uppercase text-[11px] tracking-widest gap-3 h-12 data-[state=active]:text-primary"><Layers className="h-4 w-4" /> Section Builder</TabsTrigger>
                 </TabsList>

                 <TabsContent value="bank" className="p-8 md:p-10 flex-1 flex flex-col m-0 text-left">
                    {!mockData.sourceBoardId ? (
                       <div className="flex-1 flex flex-col items-center justify-center opacity-20 text-center">
                          <AlertTriangle className="h-16 w-16 mb-6 text-primary" />
                          <p className="font-headline font-black text-xl uppercase tracking-widest">Select Source Silo First</p>
                          <p className="text-slate-400 text-xs mt-2 font-bold uppercase">Step 1 in the sidebar</p>
                       </div>
                    ) : (
                       <>
                          <div className="bg-[#0B1528] p-8 rounded-[2.5rem] mb-8 flex flex-col gap-6 text-white shadow-2xl overflow-hidden shrink-0 border border-white/5">
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-2.5">
                                   <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Filter Subject Hub</p>
                                   <Select value={bankFilter.subjectId} onValueChange={v => setBankFilter({...bankFilter, subjectId: v})}>
                                      <SelectTrigger className="h-12 w-full bg-white/5 border-white/10 text-white font-bold text-xs rounded-xl focus:ring-0"><SelectValue placeholder="All Subjects" /></SelectTrigger>
                                      <SelectContent>
                                         <SelectItem value="all">All Subjects</SelectItem>
                                         {subjects?.map((s: any) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                                      </SelectContent>
                                   </Select>
                                </div>
                                <div className="flex items-end">
                                   <Button disabled={bankSelection.length === 0} onClick={handleBulkLink} className="bg-emerald-600 hover:bg-emerald-700 h-12 px-10 rounded-xl text-[11px] font-black uppercase tracking-[0.2em] shadow-xl w-full border-none transition-all active:scale-95">Link {bankSelection.length} Assets</Button>
                                </div>
                             </div>
                             
                             <div className="pt-6 border-t border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div className="space-y-2">
                                   <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Targeting Hub</p>
                                   <Select value={activeSectionId} onValueChange={setActiveSectionId}>
                                      <SelectTrigger className="h-10 w-full sm:w-48 bg-white/5 border-white/10 text-white font-bold text-[10px] rounded-lg focus:ring-0 uppercase"><SelectValue /></SelectTrigger>
                                      <SelectContent>
                                         {sections.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                                      </SelectContent>
                                   </Select>
                                </div>
                                <div className="flex items-center gap-3">
                                   <Checkbox 
                                     checked={bankSelection.length === filteredBank.length && filteredBank.length > 0} 
                                     onCheckedChange={(checked) => setBankSelection(checked ? filteredBank.map(q => q.id) : [])}
                                     className="border-primary h-5 w-5 rounded-md"
                                   />
                                   <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Select All Visible</span>
                                </div>
                             </div>
                          </div>

                          <div className="flex-1 overflow-y-auto custom-scrollbar pr-4 space-y-3 min-h-0 bg-slate-50/50 rounded-[2.5rem] p-6">
                             {bankLoading ? (
                                <div className="flex flex-col items-center justify-center h-full opacity-20"><Loader2 className="h-8 w-8 animate-spin mb-4" /></div>
                             ) : filteredBank.length > 0 ? filteredBank.map(q => (
                                  <div 
                                    key={q.id} 
                                    onClick={() => setBankSelection(prev => prev.includes(q.id) ? prev.filter(id => id !== q.id) : [...prev, q.id])}
                                    className={cn("p-4 rounded-xl border flex items-center justify-between transition-all cursor-pointer", bankSelection.includes(q.id) ? "bg-primary/5 border-primary/20 shadow-inner" : "bg-white border-slate-100 hover:border-primary/10 shadow-sm")}
                                  >
                                     <div className="flex items-center gap-6 min-w-0 flex-1 text-left">
                                        <Checkbox checked={bankSelection.includes(q.id)} onCheckedChange={() => {}} />
                                        <div className="min-w-0 flex-1">
                                           <div className="flex items-center gap-3 mb-1">
                                              <Badge className={cn("border-none text-[7px] font-black uppercase px-2", q.status === 'LOCKED' ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600')}>{q.status || 'UNUSED'}</Badge>
                                              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{subjects?.find((s:any) => s.id === q.subjectId)?.name || q.subjectId}</p>
                                           </div>
                                           <p className="font-bold text-sm text-[#0F172A] truncate">{q.englishQuestion}</p>
                                        </div>
                                     </div>
                                  </div>
                             )) : (
                                <div className="h-full flex flex-col items-center justify-center opacity-20 text-center"><Database className="h-12 w-12 mx-auto mb-4" /><p className="font-black uppercase text-[10px]">No assets match hub rules.</p></div>
                             )}
                          </div>
                       </>
                    )}
                 </TabsContent>

                 <TabsContent value="assembly" className="p-10 flex-1 flex flex-col m-0 text-left overflow-hidden">
                    <div className="flex-1 overflow-y-auto custom-scrollbar pr-4 space-y-10">
                       {sections.map((section, sIdx) => (
                          <div key={section.id} className="space-y-4">
                             <div className="flex items-center justify-between group cursor-pointer" onClick={() => setActiveSectionId(section.id)}>
                                <div className="flex items-center gap-4 flex-1">
                                   <div className={cn("h-7 w-7 rounded-lg flex items-center justify-center text-[9px] font-black transition-all", activeSectionId === section.id ? "bg-primary text-white" : "bg-slate-100 text-slate-400")}>{sIdx + 1}</div>
                                   <input value={section.name} onChange={(e) => setSections(sections.map(s => s.id === section.id ? { ...s, name: e.target.value } : s))} className="bg-transparent border-none font-black uppercase text-sm text-[#0F172A] outline-none w-full tracking-widest" />
                                </div>
                                <div className="flex items-center gap-3">
                                   <Badge className="bg-primary/10 text-primary border-none font-black text-[8px] px-3 py-1 rounded-lg uppercase">{section.questions.length} Linked</Badge>
                                   <Button variant="ghost" size="icon" className="h-8 w-8 text-rose-500 rounded-lg" onClick={() => setSections(sections.filter(s => s.id !== section.id))}><Trash2 className="h-4 w-4" /></Button>
                                </div>
                             </div>
                             <div className="space-y-2 pl-11">
                                {section.questions.map((q: any) => (
                                   <div key={q.id} className="p-3.5 bg-white border border-slate-50 rounded-xl flex items-center justify-between group/q shadow-sm hover:border-primary/20">
                                      <p className="font-bold text-xs text-[#0F172A] truncate flex-1">{q.englishQuestion}</p>
                                      <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-300 hover:text-rose-50 opacity-0 group-hover:q:opacity-100" onClick={() => setSections(sections.map(s => s.id === section.id ? { ...s, questions: s.questions.filter((item: any) => item.id !== q.id) } : s))}><Trash2 className="h-4 w-4" /></Button>
                                   </div>
                                ))}
                             </div>
                          </div>
                       ))}
                       
                       <div className="pt-4 border-t border-slate-50">
                          <Select onValueChange={(val) => setSections([...sections, { id: `sec-${Date.now()}`, name: val, questions: [] }])}>
                             <SelectTrigger className="h-14 border-2 border-dashed border-slate-200 text-slate-400 hover:text-primary hover:border-primary/50 transition-all rounded-2xl bg-white font-black uppercase text-[10px] tracking-widest gap-2 w-full shadow-sm">
                                <PlusCircle className="h-4 w-4" /> Add Modular Section Hub
                             </SelectTrigger>
                             <SelectContent>
                                {subjects?.map((s: any) => <SelectItem key={s.id} value={s.name}>{s.name}</SelectItem>)}
                             </SelectContent>
                          </Select>
                       </div>
                    </div>
                 </TabsContent>
              </Tabs>
           </Card>
        </div>
      </div>
    </div>
  )
}
