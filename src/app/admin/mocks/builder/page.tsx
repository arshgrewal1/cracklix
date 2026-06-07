
"use client"

import { useState, useMemo, useEffect, Suspense } from "react"
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
  Languages
} from "lucide-react"
import { useCollection, useFirestore, useDoc } from "@/firebase"
import { collection, doc, setDoc, serverTimestamp, query, where, limit, getDocs, documentId } from "firebase/firestore"
import { useToast } from "@/hooks/use-toast"
import { MockType, Difficulty, AccessType, LanguageDisplayMode } from "@/types"
import { cn } from "@/lib/utils"

/**
 * @fileOverview Institutional Mock Architect v34.0.
 * FEATURES: Restored High-Fidelity Blueprint with Subject Selection Hub in the dark action bar.
 */

const MOCK_TYPES: { label: string, value: MockType, icon: any }[] = [
  { label: "FULL LENGTH MOCK", value: "FULL", icon: <Zap className="h-3 w-3" /> },
  { label: "SUBJECT TEST", value: "SUBJECT", icon: <BookOpen className="h-3 w-3" /> },
  { label: "CHAPTER TEST", value: "CHAPTER", icon: <Layers className="h-3 w-3" /> },
  { label: "OFFICIAL PYQ", value: "PYQ", icon: <FileStack className="h-3 w-3" /> },
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
  const { data: allMocks } = useCollection<any>(useMemo(() => (db ? collection(db, "mocks") : null), [db]))
  
  const [bankLoading, setBankLoading] = useState(false)
  const [questionBank, setQuestionBank] = useState<any[]>([])
  const [hideUsed, setHideUsed] = useState(true)
  const [bankFilter, setBankFilter] = useState({ 
    boardId: "all",
    subjectId: "all",
    examId: "all"
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
  })

  const [sections, setSections] = useState<any[]>([
    { id: 'sec-1', name: 'General Hub', questions: [] }
  ])
  const [activeSectionId, setActiveSectionId] = useState('sec-1')
  const [bankSelection, setBankSelection] = useState<string[]>([])

  const usedQuestionIds = useMemo(() => {
    if (!allMocks) return new Set<string>();
    const ids = new Set<string>();
    allMocks.forEach((m: any) => {
      if (m.id === mockId) return; 
      if (m.questionIds) m.questionIds.forEach((id: string) => ids.add(id));
    });
    return ids;
  }, [allMocks, mockId]);

  useEffect(() => {
    async function fetchBank() {
      if (!db) return
      setBankLoading(true)
      try {
        const q = query(collection(db, "questions"), limit(3000))
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
      setMockData(prev => ({ ...prev, ...existingMock }));

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
      const matchesSubject = bankFilter.subjectId === "all" || q.subjectId === bankFilter.subjectId
      const matchesExam = bankFilter.examId === "all" || q.examId === bankFilter.examId
      const notAlreadySelected = !allSelectedIds.includes(q.id)
      const passesUsageCheck = !hideUsed || !usedQuestionIds.has(q.id);

      return matchesBoard && matchesSubject && matchesExam && notAlreadySelected && passesUsageCheck
    })
  }, [questionBank, bankFilter, sections, hideUsed, usedQuestionIds])

  const handleBulkLink = () => {
    const toAdd = questionBank.filter(q => bankSelection.includes(q.id))
    setSections(sections.map(s => s.id === activeSectionId ? { ...s, questions: [...s.questions, ...toAdd] } : s));
    setBankSelection([])
    toast({ title: "Nodes Linked" })
  }

  const handlePublish = async () => {
    if (!db || !mockData.title || !mockData.boardId) {
      toast({ variant: "destructive", title: "Config Incomplete" })
      return
    }

    const totalQuestions = sections.reduce((acc, s) => acc + s.questions.length, 0);
    if (totalQuestions === 0) return;

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
      totalMarks: totalQuestions * (mockData.positiveMarks || 1),
    };

    try {
      await setDoc(mockRef, payload, { merge: true })
      toast({ title: "Series Deployed" })
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
            <h1 className="text-4xl font-black font-headline uppercase tracking-tight text-[#0F172A]">{isEditing ? "Modify Mock" : "Mock Architect"}</h1>
            <p className="text-[10px] uppercase font-black tracking-widest text-slate-400 mt-1">Design High-Fidelity Test Series</p>
          </div>
        </div>
        <Button className="bg-primary hover:bg-orange-600 font-black px-12 h-16 rounded-2xl uppercase text-[11px] tracking-[0.2em] gap-3 shadow-3xl" onClick={handlePublish} disabled={isPublishing}>
          {isPublishing ? <Loader2 className="h-4 w-4 animate-spin" /> : <ClipboardCheck className="h-5 w-5" />} Deploy Live Series
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 px-4">
        <div className="lg:col-span-4 space-y-8">
          <Card className="border-none shadow-4xl rounded-[3rem] bg-white p-10 space-y-8">
             <div className="space-y-6">
               <div className="space-y-2">
                 <Label className="text-[10px] font-black uppercase text-slate-500 ml-1 flex items-center gap-2">
                    <History className="h-3 w-3" /> Load Existing Series
                 </Label>
                 <Select value={mockId || 'new'} onValueChange={(id) => id === 'new' ? router.push("/admin/mocks/builder") : router.push(`/admin/mocks/builder?id=${id}`)}>
                    <SelectTrigger className="h-14 rounded-xl bg-slate-900 text-white border-none font-bold">
                       <SelectValue placeholder="Select a mock to edit" />
                    </SelectTrigger>
                    <SelectContent>
                       <SelectItem value="new">Create New +</SelectItem>
                       {allMocks?.map((m: any) => <SelectItem key={m.id} value={m.id}>{m.title}</SelectItem>)}
                    </SelectContent>
                 </Select>
               </div>

               <div className="space-y-2">
                 <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Series Title</Label>
                 <Input value={mockData.title} onChange={e => setMockData({...mockData, title: e.target.value})} className="rounded-xl h-14 font-bold text-lg border-slate-100 text-[#0F172A]" />
               </div>

               <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                   <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Authority</Label>
                   <Select value={mockData.boardId} onValueChange={v => setMockData({...mockData, boardId: v})}>
                     <SelectTrigger className="rounded-xl h-12 bg-slate-50/50 border-none"><SelectValue placeholder="Board" /></SelectTrigger>
                     <SelectContent>{boards?.map((b: any) => <SelectItem key={b.id} value={b.id}>{b.abbreviation}</SelectItem>)}</SelectContent>
                   </Select>
                 </div>
                 <div className="space-y-2">
                   <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Exam Hub</Label>
                   <Select value={mockData.examId} onValueChange={v => setMockData({...mockData, examId: v})}>
                     <SelectTrigger className="rounded-xl h-12 bg-slate-50/50 border-none"><SelectValue placeholder="Exam" /></SelectTrigger>
                     <SelectContent>{exams?.filter((e: any) => e.boardId === mockData.boardId).map((e: any) => <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>)}</SelectContent>
                   </Select>
                 </div>
               </div>

               <div className="grid grid-cols-2 gap-4 pt-6 border-t border-slate-50">
                  <div className="space-y-2">
                     <Label className="text-[10px] font-black uppercase text-slate-500 ml-1 flex items-center gap-2"><Target className="h-3 w-3 text-emerald-500" /> Positive (+)</Label>
                     <Input type="number" step="0.5" value={mockData.positiveMarks} onChange={e => setMockData({...mockData, positiveMarks: parseFloat(e.target.value)})} className="h-12 rounded-xl text-center font-black border-slate-100 text-emerald-600" />
                  </div>
                  <div className="space-y-2">
                     <Label className="text-[10px] font-black uppercase text-slate-500 ml-1 flex items-center gap-2"><AlertTriangle className="h-3 w-3 text-rose-500" /> Penalty (-)</Label>
                     <Input type="number" step="0.05" value={mockData.negativeMarks} onChange={e => setMockData({...mockData, negativeMarks: parseFloat(e.target.value)})} className="h-12 rounded-xl text-center font-black border-slate-100 text-rose-500" />
                  </div>
               </div>

               <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Test Category</Label>
                  <Select value={mockData.mockType} onValueChange={(v: MockType) => setMockData({...mockData, mockType: v})}>
                     <SelectTrigger className="h-14 rounded-xl bg-slate-50/50 border-none font-bold"><SelectValue /></SelectTrigger>
                     <SelectContent>
                        {MOCK_TYPES.map(type => (
                           <SelectItem key={type.value} value={type.value} className="font-bold text-[10px] uppercase">
                              <div className="flex items-center gap-2">{type.icon} {type.label}</div>
                           </SelectItem>
                        ))}
                     </SelectContent>
                  </Select>
               </div>

               <div className="space-y-2 pt-2">
                  <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Access Level</Label>
                  <div className="grid grid-cols-2 gap-4">
                     <button onClick={() => setMockData({...mockData, accessType: 'FREE'})} className={cn("h-14 rounded-xl font-black uppercase text-[10px] flex items-center justify-center gap-2 border-2 transition-all", mockData.accessType === 'FREE' ? "bg-emerald-50 border-emerald-500 text-emerald-700 shadow-lg" : "bg-white border-slate-100 text-slate-400")}><Unlock className="h-3.5 w-3.5" /> Public Free</button>
                     <button onClick={() => setMockData({...mockData, accessType: 'PREMIUM'})} className={cn("h-14 rounded-xl font-black uppercase text-[10px] flex items-center justify-center gap-2 border-2 transition-all", mockData.accessType === 'PREMIUM' ? "bg-amber-50 border-amber-500 text-amber-700 shadow-lg" : "bg-white border-slate-100 text-slate-400")}><Lock className="h-3.5 w-3.5" /> Elite Pass</button>
                  </div>
               </div>

               <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-50">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase text-slate-500 ml-1"><Clock className="h-3 w-3" /> Duration (Mins)</Label>
                    <Input type="number" value={mockData.duration} onChange={e => setMockData({...mockData, duration: parseInt(e.target.value)})} className="h-12 rounded-xl text-center border-slate-100" />
                  </div>
                  <div className="space-y-2 text-center">
                    <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Live Status</Label>
                    <div className="h-12 flex items-center justify-center bg-slate-50 rounded-xl px-4 border border-slate-100"><Switch checked={mockData.published} onCheckedChange={val => setMockData({...mockData, published: val})} /></div>
                  </div>
               </div>
            </div>
          </Card>
        </div>

        <div className="lg:col-span-8 space-y-6">
           <Card className="border-none shadow-4xl rounded-[4rem] bg-white overflow-hidden min-h-[850px] flex flex-col">
              <Tabs defaultValue="bank" className="flex-1 flex flex-col">
                 <TabsList className="bg-slate-50/50 border-b border-slate-100 w-full justify-start h-20 px-10 gap-12 rounded-none">
                    <TabsTrigger value="bank" className="font-black uppercase text-[11px] tracking-widest gap-3 h-12 data-[state=active]:text-primary"><Database className="h-4 w-4" /> Question Bank</TabsTrigger>
                    <TabsTrigger value="assembly" className="font-black uppercase text-[11px] tracking-widest gap-3 h-12 data-[state=active]:text-primary"><Layers className="h-4 w-4" /> Active Assembly</TabsTrigger>
                 </TabsList>

                 <TabsContent value="bank" className="p-8 md:p-10 flex-1 flex flex-col m-0 text-left">
                    
                    <div className="bg-[#0F172A] p-6 rounded-[2.5rem] mb-8 flex flex-col gap-6 text-white shadow-2xl overflow-hidden shrink-0 border border-white/5">
                       <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
                          <div className="space-y-2">
                             <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest ml-1 flex items-center gap-2"><Filter className="h-3 w-3" /> Filter Board</p>
                             <Select value={bankFilter.boardId} onValueChange={v => setBankFilter({...bankFilter, boardId: v})}>
                                <SelectTrigger className="h-12 w-full bg-white/5 border-white/10 text-white font-bold text-xs rounded-xl focus:ring-0"><SelectValue placeholder="All Boards" /></SelectTrigger>
                                <SelectContent>
                                   <SelectItem value="all">All Boards</SelectItem>
                                   {boards?.map((b: any) => <SelectItem key={b.id} value={b.id}>{b.abbreviation}</SelectItem>)}
                                </SelectContent>
                             </Select>
                          </div>
                          <div className="space-y-2">
                             <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest ml-1 flex items-center gap-2"><BookOpen className="h-3 w-3" /> Filter Subject</p>
                             <Select value={bankFilter.subjectId} onValueChange={v => setBankFilter({...bankFilter, subjectId: v})}>
                                <SelectTrigger className="h-12 w-full bg-white/5 border-white/10 text-white font-bold text-xs rounded-xl focus:ring-0"><SelectValue placeholder="All Subjects" /></SelectTrigger>
                                <SelectContent className="max-h-60">
                                   <SelectItem value="all">All Subjects</SelectItem>
                                   {subjects?.map((s: any) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                                </SelectContent>
                             </Select>
                          </div>
                          <div className="flex items-center gap-3 bg-white/5 px-4 h-12 rounded-xl border border-white/10">
                             <span className="text-[8px] font-black uppercase text-slate-400">Hide Used</span>
                             <Switch checked={hideUsed} onCheckedChange={setHideUsed} className="scale-75" />
                          </div>
                       </div>

                       <div className="h-px w-full bg-white/5" />

                       <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                          <div className="flex-1 min-w-0">
                                <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest mb-1.5 ml-1">Target Section Hub</p>
                                <Select value={activeSectionId} onValueChange={setActiveSectionId}>
                                   <SelectTrigger className="h-12 w-full bg-primary/20 border-primary/20 text-white font-black text-[10px] rounded-xl uppercase tracking-widest focus:ring-0 shadow-lg"><SelectValue /></SelectTrigger>
                                   <SelectContent>{sections.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
                                </Select>
                          </div>
                          <Button disabled={bankSelection.length === 0} onClick={handleBulkLink} className="bg-emerald-600 hover:bg-emerald-700 h-14 px-10 rounded-xl text-[10px] uppercase font-black tracking-[0.2em] shadow-xl w-full md:w-auto">Link {bankSelection.length} Questions</Button>
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
                                        <Badge className="bg-[#0F172A] text-white border-none text-[7px] font-black uppercase">NODE</Badge>
                                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{subjects?.find((s:any) => s.id === q.subjectId)?.name || q.subjectId}</p>
                                     </div>
                                     <p className="font-bold text-sm text-[#0F172A] truncate">{q.englishQuestion || q.questionEn}</p>
                                  </div>
                               </div>
                            </div>
                       )) : (
                          <div className="h-full flex flex-col items-center justify-center opacity-20"><Database className="h-12 w-12 mx-auto mb-4" /><p className="font-black uppercase text-[10px]">No matches found in Registry Hub.</p></div>
                       )}
                    </div>
                 </TabsContent>

                 <TabsContent value="assembly" className="p-10 flex-1 flex flex-col m-0 text-left overflow-hidden">
                    <div className="flex-1 overflow-y-auto custom-scrollbar pr-4 space-y-10">
                       {sections.map((section, sIdx) => (
                          <div key={section.id} className="space-y-4">
                             <div className="flex items-center justify-between group">
                                <div className="flex items-center gap-4 flex-1">
                                   <div className="h-7 w-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 font-black text-[9px]">{sIdx + 1}</div>
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
                                      <p className="font-bold text-xs text-[#0F172A] truncate flex-1">{q.englishQuestion || q.questionEn}</p>
                                      <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-300 hover:text-rose-50 opacity-0 group-hover/q:opacity-100" onClick={() => setSections(sections.map(s => s.id === section.id ? { ...s, questions: s.questions.filter((item: any) => item.id !== q.id) } : s))}><Trash2 className="h-4 w-4" /></Button>
                                   </div>
                                ))}
                             </div>
                          </div>
                       ))}
                       
                       <div className="pt-4 border-t border-slate-50">
                          <Select onValueChange={(val) => setSections([...sections, { id: `sec-${Date.now()}`, name: val, questions: [] }])}>
                             <SelectTrigger className="h-14 border-2 border-dashed border-slate-200 text-slate-400 hover:text-primary hover:border-primary/50 transition-all rounded-2xl bg-white font-black uppercase text-[10px] tracking-widest gap-2 w-full">
                                <PlusCircle className="h-4 w-4" /> Add Subject Hub
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
