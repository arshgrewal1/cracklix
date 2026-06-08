
"use client"

import React, { useState, useMemo, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
  PlusCircle,
  Filter,
  Landmark,
  BookOpen,
  FileStack,
  Lock,
  Unlock,
  History,
  Target,
  AlertTriangle,
  ChevronDown,
  Languages,
  ShieldCheck,
  Settings2,
  CheckCircle2
} from "lucide-react"
import { useCollection, useFirestore, useDoc } from "@/firebase"
import { collection, doc, setDoc, serverTimestamp, query, where, limit, getDocs, documentId, writeBatch } from "firebase/firestore"
import { useToast } from "@/hooks/use-toast"
import { MockType, Difficulty, AccessType, LanguageDisplayMode } from "@/types"
import { cn } from "@/lib/utils"

const MOCK_TYPES: { label: string, value: MockType, icon: any }[] = [
  { label: "FULL LENGTH MOCK", value: "FULL", icon: <Zap className="h-3 w-3" /> },
  { label: "SUBJECT TEST", value: "SUBJECT", icon: <BookOpen className="h-3 w-3" /> },
  { label: "CHAPTER TEST", value: "CHAPTER", icon: <Layers className="h-3 w-3" /> },
  { label: "OFFICIAL PYQ", value: "PYQ", icon: <FileStack className="h-3 w-3" /> },
];

const SELECTION_RULES = [
  { id: 'unused-only', label: 'Use Only Unused Questions', icon: <Zap className="h-3 w-3" /> },
  { id: 'include-used', label: 'Allow Used Questions', icon: <History className="h-3 w-3" /> },
  { id: 'no-locked', label: 'Exclude Locked Assets', icon: <Lock className="h-3 w-3" /> },
  { id: 'no-duplicates', label: 'Block Duplicates', icon: <ShieldCheck className="h-3 w-3" /> },
  { id: 'topic-balanced', label: 'Balanced Topics', icon: <Target className="h-3 w-3" /> }
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
  const { data: boards } = useCollection<any>(useMemo(() => (db ? collection(db, "boards") : null), [db]))
  const { data: exams } = useCollection<any>(useMemo(() => (db ? collection(db, "exams") : null), [db]))
  const { data: subjects } = useCollection<any>(useMemo(() => (db ? collection(db, "subjects") : null), [db]))
  
  const [bankLoading, setBankLoading] = useState(false)
  const [questionBank, setQuestionBank] = useState<any[]>([])
  const [activeRules, setActiveRules] = useState<string[]>(['no-locked', 'no-duplicates'])
  const [bankFilter, setBankFilter] = useState({ 
    boardId: "all",
    examId: "all",
    subjectId: "all"
  })

  const [isPublishing, setIsPublishing] = useState(false)
  const [mockData, setMockData] = useState<any>({
    title: "", 
    boardId: "", 
    examId: "",
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
      setMockData(prev => ({ 
        ...prev, 
        ...existingMock,
        positiveMarks: existingMock.positiveMarks ?? 1,
        negativeMarks: existingMock.negativeMarks ?? 0.25,
        duration: existingMock.duration ?? 120,
        attemptLimit: existingMock.attemptLimit ?? 0
      }));

      if (existingMock.sections && existingMock.sections.length > 0 && existingMock.questionIds) {
        let currentIndex = 0;
        const qIds = existingMock.questionIds;
        const hydratedSections = existingMock.sections.map((s: any, idx: number) => {
          const sectionQIds = qIds.slice(currentIndex, currentIndex + s.count);
          currentIndex += s.count;
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
      const matchesBoard = bankFilter.boardId === "all" || q.boardId === bankFilter.boardId
      const matchesExam = bankFilter.examId === "all" || q.examId === bankFilter.examId
      const matchesSubject = bankFilter.subjectId === "all" || q.subjectId === bankFilter.subjectId
      const notAlreadySelected = !allSelectedIds.includes(q.id)
      
      // Advanced CBT Selection Logic
      if (activeRules.includes('unused-only') && q.status !== 'UNUSED') return false;
      if (activeRules.includes('no-locked') && q.status === 'LOCKED') return false;
      if (activeRules.includes('no-duplicates') && q.status === 'DUPLICATE') return false;

      return matchesBoard && matchesExam && matchesSubject && notAlreadySelected
    })
  }, [questionBank, bankFilter, sections, activeRules])

  const handleBulkLink = () => {
    const toAdd = questionBank.filter(q => bankSelection.includes(q.id))
    setSections(sections.map(s => s.id === activeSectionId ? { ...s, questions: [...s.questions, ...toAdd] } : s));
    setBankSelection([])
    toast({ title: "Assets Linked" })
  }

  const handlePublish = async () => {
    if (!db || !mockData.title || !mockData.boardId) {
      toast({ variant: "destructive", title: "Audit Blocked", description: "Metadata incomplete." })
      return
    }

    const totalQuestions = sections.reduce((acc, s) => acc + s.questions.length, 0);
    if (totalQuestions === 0) {
       toast({ variant: "destructive", title: "Assembly Empty" });
       return;
    }

    setIsPublishing(true)
    const finalId = mockId || `mock-${Date.now()}`
    const mockRef = doc(db, "mocks", finalId)
    
    const flatQuestionIds = sections.flatMap(s => s.questions.map(q => q.id));
    const sectionMetadata = sections.map(s => ({ name: s.name, count: s.questions.length })).filter(s => s.count > 0);

    const payload = {
      ...mockData,
      id: finalId,
      totalQuestions,
      questionIds: flatQuestionIds,
      sections: sectionMetadata,
      updatedAt: serverTimestamp(),
      createdAt: existingMock?.createdAt || serverTimestamp(),
      totalMarks: totalQuestions * (mockData.positiveMarks || 1),
    };

    try {
      await setDoc(mockRef, payload, { merge: true });
      
      // Update Question Usage Stats
      const batch = writeBatch(db);
      flatQuestionIds.forEach(id => {
         const qRef = doc(db, "questions", id);
         batch.update(qRef, {
            status: 'USED',
            usedCount: (questionBank.find(q => q.id === id)?.usedCount || 0) + 1,
            lastUsedDate: new Date().toISOString(),
            mockIdsUsedIn: Array.from(new Set([...(questionBank.find(q => q.id === id)?.mockIdsUsedIn || []), finalId]))
         });
      });
      await batch.commit();

      toast({ title: "Series Deployed", description: "Audit nodes and usage stats synced." });
      router.push("/admin/mocks")
    } finally {
      setIsPublishing(false)
    }
  }

  return (
    <div className="max-w-[1600px] mx-auto space-y-8 pb-32 text-left pt-4">
      <div className="flex items-center justify-between gap-6 px-4">
        <div className="flex items-center gap-6">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-2xl border bg-white h-12 w-12 shadow-sm"><ChevronLeft className="h-6 w-6" /></Button>
          <div className="text-left">
            <h1 className="text-4xl font-headline font-black uppercase tracking-tight text-[#0F172A]">{isEditing ? "Modify Mock" : "Mock Architect"}</h1>
            <p className="text-[10px] uppercase font-black tracking-widest text-slate-400 mt-1">Institutional Test Series Deployment</p>
          </div>
        </div>
        <Button className="bg-primary hover:bg-orange-600 font-black px-12 h-16 rounded-2xl uppercase text-[11px] tracking-[0.2em] gap-3 shadow-3xl shadow-primary/20" onClick={handlePublish} disabled={isPublishing}>
          {isPublishing ? <Loader2 className="h-4 w-4 animate-spin" /> : <ClipboardCheck className="h-5 w-5" />} Deploy Live Hub
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 px-4">
        <div className="lg:col-span-4 space-y-8">
          <Card className="border-none shadow-4xl rounded-[3rem] bg-white p-10 space-y-8">
             <div className="space-y-6">
               <div className="space-y-2">
                 <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Series Title</Label>
                 <Input value={mockData.title ?? ""} onChange={e => setMockData({...mockData, title: e.target.value})} className="rounded-xl h-14 font-bold text-lg border-slate-100 text-[#0F172A]" />
               </div>

               <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                   <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Authority Hub</Label>
                   <Select value={mockData.boardId ?? ""} onValueChange={v => setMockData({...mockData, boardId: v})}>
                     <SelectTrigger className="rounded-xl h-12 bg-slate-50/50 border-none font-bold"><SelectValue placeholder="Board" /></SelectTrigger>
                     <SelectContent>{boards?.map((b: any) => <SelectItem key={b.id} value={b.id}>{b.abbreviation}</SelectItem>)}</SelectContent>
                   </Select>
                 </div>
                 <div className="space-y-2">
                   <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Vertical</Label>
                   <Select value={mockData.examId ?? ""} onValueChange={v => setMockData({...mockData, examId: v})}>
                     <SelectTrigger className="rounded-xl h-12 bg-slate-50/50 border-none font-bold"><SelectValue placeholder="Exam" /></SelectTrigger>
                     <SelectContent>
                        {exams?.filter((e: any) => e.boardId === mockData.boardId).sort((a:any, b:any) => a.name.localeCompare(b.name)).map((e: any) => (
                           <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>
                        ))}
                     </SelectContent>
                   </Select>
                 </div>
               </div>

               <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Attempt Control (Limit)</Label>
                  <Select value={String(mockData.attemptLimit ?? 0)} onValueChange={(v) => setMockData({...mockData, attemptLimit: parseInt(v)})}>
                     <SelectTrigger className="h-12 rounded-xl bg-slate-50/50 border-none font-black"><SelectValue /></SelectTrigger>
                     <SelectContent>
                        <SelectItem value="0">Unlimited Attempts</SelectItem>
                        <SelectItem value="1">1 Attempt Strict</SelectItem>
                        <SelectItem value="2">2 Attempts Hub</SelectItem>
                        <SelectItem value="3">3 Attempts Hub</SelectItem>
                        <SelectItem value="5">5 Attempts Hub</SelectItem>
                     </SelectContent>
                  </Select>
               </div>

               <div className="space-y-4 pt-6 border-t border-slate-50">
                  <p className="text-[10px] font-black uppercase text-primary tracking-[0.3em] ml-1 flex items-center gap-2"><Settings2 className="h-3 w-3" /> CBT Selection Rules</p>
                  <div className="grid grid-cols-1 gap-2">
                     {SELECTION_RULES.map(rule => (
                        <button 
                           key={rule.id}
                           onClick={() => setActiveRules(prev => prev.includes(rule.id) ? prev.filter(r => r !== rule.id) : [...prev, rule.id])}
                           className={cn(
                              "flex items-center justify-between p-4 rounded-xl border transition-all text-left group",
                              activeRules.includes(rule.id) ? "bg-[#0F172A] border-[#0F172A] text-white shadow-lg" : "bg-white border-slate-100 text-slate-400 hover:border-primary/20"
                           )}
                        >
                           <div className="flex items-center gap-3">
                              {React.cloneElement(rule.icon as React.ReactElement, { className: cn("h-4 w-4", activeRules.includes(rule.id) ? "text-primary" : "text-slate-300") })}
                              <span className="text-[10px] font-bold uppercase tracking-tight">{rule.label}</span>
                           </div>
                           {activeRules.includes(rule.id) && <CheckCircle2 className="h-4 w-4 text-emerald-500" />}
                        </button>
                     ))}
                  </div>
               </div>
            </div>
          </Card>
        </div>

        <div className="lg:col-span-8 space-y-6">
           <Card className="border-none shadow-4xl rounded-[4rem] bg-white overflow-hidden min-h-[850px] flex flex-col border border-slate-100">
              <Tabs defaultValue="bank" className="flex-1 flex flex-col">
                 <TabsList className="bg-slate-50/50 border-b border-slate-100 w-full justify-start h-20 px-10 gap-12 rounded-none">
                    <TabsTrigger value="bank" className="font-black uppercase text-[11px] tracking-widest gap-3 h-12 data-[state=active]:text-primary"><Database className="h-4 w-4" /> Global Bank</TabsTrigger>
                    <TabsTrigger value="assembly" className="font-black uppercase text-[11px] tracking-widest gap-3 h-12 data-[state=active]:text-primary"><Layers className="h-4 w-4" /> Active Assembly</TabsTrigger>
                 </TabsList>

                 <TabsContent value="bank" className="p-8 md:p-10 flex-1 flex flex-col m-0 text-left">
                    <div className="bg-[#0F172A] p-6 rounded-[2.5rem] mb-8 flex flex-col gap-6 text-white shadow-2xl overflow-hidden shrink-0 border border-white/5">
                       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-end">
                          <div className="space-y-2">
                             <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest ml-1 flex items-center gap-2"><Filter className="h-3 w-3" /> Board Hub</p>
                             <Select value={bankFilter.boardId} onValueChange={v => setBankFilter({...bankFilter, boardId: v})}>
                                <SelectTrigger className="h-12 w-full bg-white/5 border-white/10 text-white font-bold text-xs rounded-xl focus:ring-0"><SelectValue placeholder="All Boards" /></SelectTrigger>
                                <SelectContent>
                                   <SelectItem value="all">All Boards</SelectItem>
                                   {boards?.map((b: any) => <SelectItem key={b.id} value={b.id}>{b.abbreviation}</SelectItem>)}
                                </SelectContent>
                             </Select>
                          </div>
                          <div className="space-y-2">
                             <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest ml-1 flex items-center gap-2"><BookOpen className="h-3 w-3" /> Subject Node</p>
                             <Select value={bankFilter.subjectId} onValueChange={v => setBankFilter({...bankFilter, subjectId: v})}>
                                <SelectTrigger className="h-12 w-full bg-white/5 border-white/10 text-white font-bold text-xs rounded-xl focus:ring-0"><SelectValue placeholder="All Subjects" /></SelectTrigger>
                                <SelectContent className="max-h-60">
                                   <SelectItem value="all">All Subjects</SelectItem>
                                   {subjects?.map((s: any) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                                </SelectContent>
                             </Select>
                          </div>
                          <div className="flex items-center gap-4">
                             <Button disabled={bankSelection.length === 0} onClick={handleBulkLink} className="bg-emerald-600 hover:bg-emerald-700 h-14 px-10 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl w-full">Link {bankSelection.length} Nodes</Button>
                          </div>
                       </div>
                       <div className="h-px w-full bg-white/5" />
                       <div className="flex items-center gap-4">
                          <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest mb-1.5 ml-1 flex-1">Targeting Section: <span className="text-primary ml-2">{sections.find(s => s.id === activeSectionId)?.name}</span></p>
                       </div>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar pr-4 space-y-3 min-h-0 bg-slate-50/50 rounded-[2.5rem] p-6 border border-slate-100/50">
                       {bankLoading ? (
                          <div className="flex flex-col items-center justify-center h-full opacity-20"><Loader2 className="h-8 w-8 animate-spin mb-4" /></div>
                       ) : filteredBank.length > 0 ? filteredBank.map(q => (
                            <div key={q.id} className={cn("p-4 rounded-xl border flex items-center justify-between transition-all", bankSelection.includes(q.id) ? "bg-primary/5 border-primary/20 shadow-inner" : "bg-white border-slate-100 hover:border-primary/10 shadow-sm")}>
                               <div className="flex items-center gap-6 min-w-0 flex-1 text-left">
                                  <Checkbox checked={bankSelection.includes(q.id)} onCheckedChange={() => setBankSelection(prev => prev.includes(q.id) ? prev.filter(id => id !== q.id) : [...prev, q.id])} />
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
                          <div className="h-full flex flex-col items-center justify-center opacity-20 text-center"><Database className="h-12 w-12 mx-auto mb-4" /><p className="font-black uppercase text-[10px]">No assets match current CBT rules.</p></div>
                       )}
                    </div>
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
                                      <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-300 hover:text-rose-50 opacity-0 group-hover/q:opacity-100" onClick={() => setSections(sections.map(s => s.id === section.id ? { ...s, questions: s.questions.filter((item: any) => item.id !== q.id) } : s))}><Trash2 className="h-4 w-4" /></Button>
                                   </div>
                                ))}
                             </div>
                          </div>
                       ))}
                       
                       <div className="pt-4 border-t border-slate-50">
                          <Select onValueChange={(val) => setSections([...sections, { id: `sec-${Date.now()}`, name: val, questions: [] }])}>
                             <SelectTrigger className="h-14 border-2 border-dashed border-slate-200 text-slate-400 hover:text-primary hover:border-primary/50 transition-all rounded-2xl bg-white font-black uppercase text-[10px] tracking-widest gap-2 w-full shadow-sm">
                                <PlusCircle className="h-4 w-4" /> Add Subject Section
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

