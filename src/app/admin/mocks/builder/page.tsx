
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
  MinusCircle,
  PlusCircle,
  Filter,
  CheckCircle2,
  ChevronDown,
  Landmark,
  ListTree,
  Globe,
  EyeOff,
  BookOpen,
  FileStack,
  Gem,
  Lock,
  Unlock,
  History
} from "lucide-react"
import { useCollection, useFirestore, useDoc } from "@/firebase"
import { collection, doc, setDoc, serverTimestamp, query, where, limit, getDocs, documentId } from "firebase/firestore"
import { useToast } from "@/hooks/use-toast"
import { MockType, Difficulty, AccessType, LanguageDisplayMode } from "@/types"
import { cn } from "@/lib/utils"

const LANGUAGE_MODES: { label: string, value: LanguageDisplayMode }[] = [
  { label: "BILINGUAL (EN+PA)", value: "ENGLISH_PUNJABI" },
  { label: "BILINGUAL (EN+HI)", value: "ENGLISH_HINDI" },
  { label: "ENGLISH ONLY", value: "ENGLISH" },
  { label: "PUNJABI ONLY", value: "PUNJABI" },
  { label: "HINDI ONLY", value: "HINDI" },
];

const MOCK_TYPES: { label: string, value: MockType, icon: any }[] = [
  { label: "FULL LENGTH MOCK", value: "FULL", icon: <Zap className="h-3 w-3" /> },
  { label: "SUBJECT TEST", value: "SUBJECT", icon: <BookOpen className="h-3 w-3" /> },
  { label: "CHAPTER TEST", value: "CHAPTER", icon: <ListTree className="h-3 w-3" /> },
  { label: "OFFICIAL PYQ", value: "PYQ", icon: <FileStack className="h-3 w-3" /> },
  { label: "SECTIONAL TEST", value: "SECTIONAL", icon: <Layers className="h-3 w-3" /> },
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

  const { data: existingMock, loading: mockLoading } = useDoc<any>(useMemo(() => (db && mockId ? doc(db, "mocks", mockId) : null), [db, mockId]))
  const { data: boards } = useCollection<any>(useMemo(() => (db ? query(collection(db, "boards")) : null), [db]))
  const { data: exams } = useCollection<any>(useMemo(() => (db ? query(collection(db, "exams")) : null), [db]))
  const { data: subjects } = useCollection<any>(useMemo(() => (db ? query(collection(db, "subjects")) : null), [db]))
  const { data: allMocks } = useCollection<any>(useMemo(() => (db ? query(collection(db, "mocks")) : null), [db]))
  
  const [bankLoading, setBankLoading] = useState(false)
  const [questionBank, setQuestionBank] = useState<any[]>([])
  const [hideUsed, setHideUsed] = useState(true)
  const [bankFilter, setBankFilter] = useState({ 
    boardId: "all",
    examId: "all",
    subjectId: "all", 
    search: "" 
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
    { id: 'sec-1', name: 'General Knowledge & Current Affairs', questions: [] }
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
    async function hydrateExistingMock() {
      if (!existingMock || questionBank.length === 0 || !db) return;

      setMockData(prev => ({ 
        ...prev, 
        ...existingMock,
        languageMode: existingMock.languageMode || "ENGLISH_PUNJABI"
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
      } else if (existingMock.questionIds) {
        setSections([{
           id: 'sec-1',
           name: 'Main Assessment',
           questions: questionBank.filter(q => existingMock.questionIds.includes(q.id))
        }]);
      }
    }
    hydrateExistingMock();
  }, [existingMock, questionBank, db])

  const filteredBank = useMemo(() => {
    const allSelectedIds = sections.flatMap(s => s.questions.map(q => q.id));
    return questionBank.filter((q: any) => {
      const matchesBoard = bankFilter.boardId === "all" || q.boardId === bankFilter.boardId
      const matchesExam = bankFilter.examId === "all" || q.examId === bankFilter.examId
      const matchesSub = bankFilter.subjectId === "all" || q.subjectId === bankFilter.subjectId
      const qText = (q.englishQuestion || q.questionEn || "").toLowerCase()
      const matchesSearch = !bankFilter.search || qText.includes(bankFilter.search.toLowerCase())
      const notAlreadySelected = !allSelectedIds.includes(q.id)
      
      const isUsedElsewhere = usedQuestionIds.has(q.id);
      const passesUsageCheck = !hideUsed || !isUsedElsewhere;

      return matchesBoard && matchesExam && matchesSub && matchesSearch && notAlreadySelected && passesUsageCheck
    })
  }, [questionBank, bankFilter, sections, hideUsed, usedQuestionIds])

  const handleBulkLink = () => {
    const toAdd = questionBank.filter(q => bankSelection.includes(q.id))
    setSections(sections.map(s => s.id === activeSectionId ? { ...s, questions: [...s.questions, ...toAdd] } : s));
    setBankSelection([])
    toast({ title: "Nodes Linked" })
  }

  const handlePublish = async () => {
    if (!db || !mockData.title || !mockData.boardId || !mockData.examId) {
      toast({ variant: "destructive", title: "Config Incomplete", description: "Title, Board, and Exam are mandatory." })
      return
    }

    const totalQuestions = sections.reduce((acc, s) => acc + s.questions.length, 0);
    if (totalQuestions === 0) {
       toast({ variant: "destructive", title: "No Questions", description: "Add at least one question to the mock." })
       return
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
      createdAt: isEditing ? (existingMock?.createdAt || serverTimestamp()) : serverTimestamp(),
    };

    try {
      await setDoc(mockRef, payload, { merge: true })
      toast({ title: "Series Deployed", description: `${mockData.title} is now live.` })
      router.push("/admin/mocks")
    } catch (err: any) {
      toast({ variant: "destructive", title: "Sync Failed" })
    } finally {
      setIsPublishing(false)
    }
  }

  const handleSwitchMock = (id: string) => {
     if (id === 'new') router.push("/admin/mocks/builder");
     else router.push(`/admin/mocks/builder?id=${id}`);
  };

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
          {isPublishing ? <Loader2 className="h-4 w-4 animate-spin" /> : <ClipboardCheck className="h-5 w-5" />} {isEditing ? "Update Registry" : "Deploy Live Series"}
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
                 <Select value={mockId || 'new'} onValueChange={handleSwitchMock}>
                    <SelectTrigger className="h-14 rounded-xl bg-slate-900 text-white border-none font-bold">
                       <SelectValue placeholder="Select a mock to edit" />
                    </SelectTrigger>
                    <SelectContent>
                       <SelectItem value="new" className="font-black text-primary uppercase text-[10px]">Create New Series +</SelectItem>
                       {allMocks?.sort((a:any, b:any) => a.title.localeCompare(b.title)).map((m: any) => (
                          <SelectItem key={m.id} value={m.id} className="font-bold text-[10px] uppercase">{m.title}</SelectItem>
                       ))}
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
                   <Select value={mockData.boardId} onValueChange={v => setMockData({...mockData, boardId: v, examId: ""})}>
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

               <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-slate-500 ml-1 flex items-center gap-2">
                     <Layers className="h-3 w-3" /> Test Category
                  </Label>
                  <Select value={mockData.mockType} onValueChange={(v: MockType) => setMockData({...mockData, mockType: v})}>
                     <SelectTrigger className="h-14 rounded-xl bg-slate-50/50 border-none font-bold">
                        <SelectValue />
                     </SelectTrigger>
                     <SelectContent>
                        {MOCK_TYPES.map(type => (
                           <SelectItem key={type.value} value={type.value} className="font-bold text-[10px] uppercase tracking-wider">
                              <div className="flex items-center gap-2">{type.icon} {type.label}</div>
                           </SelectItem>
                        ))}
                     </SelectContent>
                  </Select>
               </div>

               <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-slate-500 ml-1 flex items-center gap-2">
                     <Globe className="h-3 w-3" /> Default Language
                  </Label>
                  <Select value={mockData.languageMode} onValueChange={(v: LanguageDisplayMode) => setMockData({...mockData, languageMode: v})}>
                     <SelectTrigger className="h-14 rounded-xl bg-slate-50/50 border-none font-bold">
                        <SelectValue />
                     </SelectTrigger>
                     <SelectContent>
                        {LANGUAGE_MODES.map(mode => (
                           <SelectItem key={mode.value} value={mode.value} className="font-bold text-[10px] uppercase tracking-wider">
                              {mode.label}
                           </SelectItem>
                        ))}
                     </SelectContent>
                  </Select>
               </div>

               <div className="space-y-2 pt-2">
                  <Label className="text-[10px] font-black uppercase text-slate-500 ml-1 flex items-center gap-2">
                     <Gem className="h-3 w-3" /> Student Access Level
                  </Label>
                  <div className="grid grid-cols-2 gap-4">
                     <button 
                       onClick={() => setMockData({...mockData, accessType: 'FREE'})}
                       className={cn(
                         "h-14 rounded-xl font-black uppercase text-[10px] flex items-center justify-center gap-2 border-2 transition-all",
                         mockData.accessType === 'FREE' ? "bg-emerald-50 border-emerald-500 text-emerald-700 shadow-lg" : "bg-white border-slate-100 text-slate-400"
                       )}
                     >
                        <Unlock className="h-3.5 w-3.5" /> Public Free
                     </button>
                     <button 
                       onClick={() => setMockData({...mockData, accessType: 'PREMIUM'})}
                       className={cn(
                         "h-14 rounded-xl font-black uppercase text-[10px] flex items-center justify-center gap-2 border-2 transition-all",
                         mockData.accessType === 'PREMIUM' ? "bg-amber-50 border-amber-500 text-amber-700 shadow-lg" : "bg-white border-slate-100 text-slate-400"
                       )}
                     >
                        <Lock className="h-3.5 w-3.5" /> Elite Pass
                     </button>
                  </div>
               </div>

               <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-50">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase text-slate-500 ml-1 flex items-center gap-2"><Clock className="h-3 w-3" /> Duration (Mins)</Label>
                    <Input type="number" value={mockData.duration} onChange={e => setMockData({...mockData, duration: parseInt(e.target.value) || 0})} className="h-12 rounded-xl text-center border-slate-100 text-[#0F172A]" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Live Status</Label>
                    <div className="h-12 flex items-center justify-center bg-slate-50 rounded-xl px-4 border border-slate-100">
                       <Switch checked={mockData.published} onCheckedChange={val => setMockData({...mockData, published: val})} />
                    </div>
                  </div>
               </div>
            </div>
          </Card>
        </div>

        <div className="lg:col-span-8 space-y-6">
           <Card className="border-none shadow-4xl rounded-[4rem] bg-white overflow-hidden min-h-[750px] flex flex-col">
              <Tabs defaultValue="bank" className="flex-1 flex flex-col">
                 <TabsList className="bg-slate-50/50 border-b border-slate-100 w-full justify-start h-20 px-10 gap-12 rounded-none">
                    <TabsTrigger value="bank" className="font-black uppercase text-[11px] tracking-widest gap-3 h-12 data-[state=active]:text-primary">
                       <Database className="h-4 w-4" /> Question Bank
                    </TabsTrigger>
                    <TabsTrigger value="assembly" className="font-black uppercase text-[11px] tracking-widest gap-3 h-12 data-[state=active]:text-primary">
                       <Layers className="h-4 w-4" /> Active Assembly 
                    </TabsTrigger>
                 </TabsList>

                 <TabsContent value="bank" className="p-8 md:p-10 flex-1 flex flex-col m-0 text-left">
                    <div className="flex flex-wrap items-center gap-4 mb-8">
                       <div className="relative flex-1 min-w-[200px]">
                          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                          <Input placeholder="Search bank nodes..." value={bankFilter.search} onChange={e => setBankFilter({...bankFilter, search: e.target.value})} className="h-12 pl-12 rounded-xl bg-slate-50 border-none font-bold text-[#0F172A]" />
                       </div>
                       <div className="flex items-center gap-3 bg-slate-50 px-6 h-12 rounded-xl border border-slate-100">
                          <EyeOff className="h-4 w-4 text-slate-400" />
                          <span className="text-[10px] font-black uppercase text-slate-500 whitespace-nowrap">Hide Used</span>
                          <Switch checked={hideUsed} onCheckedChange={setHideUsed} />
                       </div>
                       <div className="w-full md:w-44">
                          <Select value={bankFilter.boardId} onValueChange={v => setBankFilter({...bankFilter, boardId: v})}>
                             <SelectTrigger className="h-12 rounded-xl bg-slate-50 border-none font-bold text-xs"><SelectValue placeholder="Filter Board" /></SelectTrigger>
                             <SelectContent>
                                <SelectItem value="all">All Boards</SelectItem>
                                {boards?.map((b: any) => <SelectItem key={b.id} value={b.id}>{b.abbreviation}</SelectItem>)}
                             </SelectContent>
                          </Select>
                       </div>
                    </div>

                    <div className="bg-[#0F172A] p-6 rounded-[2rem] mb-8 flex flex-col md:flex-row md:items-center justify-between gap-8 text-white shadow-2xl overflow-hidden">
                       <div className="flex-1 min-w-0 text-left">
                             <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest mb-1.5">Target Section</p>
                             <Select value={activeSectionId} onValueChange={setActiveSectionId}>
                                <SelectTrigger className="h-12 w-full bg-white/10 border-white/10 text-white font-black text-[10px] rounded-xl uppercase tracking-widest">
                                   <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                   {sections.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                                </SelectContent>
                             </Select>
                       </div>

                       <Button disabled={bankSelection.length === 0} onClick={handleBulkLink} className="bg-emerald-600 hover:bg-emerald-700 h-14 px-10 rounded-xl text-[10px] uppercase font-black tracking-[0.2em] shadow-xl w-full md:w-auto">
                          Link {bankSelection.length} Questions
                       </Button>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar pr-4 space-y-3">
                       {bankLoading ? (
                          <div className="flex flex-col items-center justify-center py-20 opacity-20">
                             <Loader2 className="h-8 w-8 animate-spin mb-4" />
                          </div>
                       ) : filteredBank.length > 0 ? filteredBank.map(q => {
                          const isUsed = usedQuestionIds.has(q.id);
                          return (
                            <div key={q.id} className={cn(
                               "p-4 rounded-xl border flex items-center justify-between transition-all",
                               bankSelection.includes(q.id) ? "bg-primary/5 border-primary/20" : "bg-white border-slate-100 hover:border-primary/10"
                            )}>
                               <div className="flex items-center gap-6 min-w-0 flex-1 text-left">
                                  <Checkbox checked={bankSelection.includes(q.id)} onCheckedChange={() => setBankSelection(prev => prev.includes(q.id) ? prev.filter(id => id !== q.id) : [...prev, q.id])} />
                                  <div className="min-w-0 flex-1">
                                     <div className="flex items-center gap-3 mb-1">
                                        {isUsed && <Badge className="bg-amber-50 text-amber-600 border-none text-[7px] font-black uppercase">Previously Used</Badge>}
                                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{q.subjectId}</p>
                                     </div>
                                     <p className="font-bold text-sm text-[#0F172A] truncate">{q.englishQuestion || q.questionEn}</p>
                                  </div>
                               </div>
                            </div>
                          )
                       }) : (
                          <div className="py-20 text-center opacity-20">
                             <Database className="h-12 w-12 mx-auto mb-4" />
                             <p className="font-black uppercase text-[10px]">No questions match filters.</p>
                          </div>
                       )}
                    </div>
                 </TabsContent>

                 <TabsContent value="assembly" className="p-10 flex-1 flex flex-col m-0 text-left">
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
                                   <Button variant="ghost" size="icon" className="h-8 w-8 text-rose-500 rounded-lg" onClick={() => setSections(sections.filter(s => s.id !== section.id))}>
                                      <Trash2 className="h-4 w-4" />
                                   </Button>
                                </div>
                             </div>

                             <div className="space-y-2 pl-11">
                                {section.questions.map((q: any) => (
                                   <div key={q.id} className="p-3.5 bg-white border border-slate-50 rounded-xl flex items-center justify-between group/q shadow-sm hover:border-primary/20">
                                      <div className="flex-1 min-w-0">
                                         <p className="font-bold text-xs text-[#0F172A] truncate">{q.englishQuestion || q.questionEn}</p>
                                         <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-1">BILINGUAL NODE</p>
                                      </div>
                                      <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-300 hover:text-rose-50 opacity-0 group-hover/q:opacity-100" onClick={() => setSections(sections.map(s => s.id === section.id ? { ...s, questions: s.questions.filter((item: any) => item.id !== q.id) } : s))}>
                                         <Trash2 className="h-4 w-4" />
                                      </Button>
                                   </div>
                                ))}
                                <Button variant="ghost" onClick={() => setActiveSectionId(section.id)} className="text-[9px] font-black uppercase text-primary tracking-widest h-8 px-4 gap-2">
                                   <Plus className="h-3 w-3" /> Add More to this section
                                </Button>
                             </div>
                          </div>
                       ))}
                       <Button onClick={() => setSections([...sections, { id: `sec-${Date.now()}`, name: 'New Section', questions: [] }])} className="w-full h-14 border-2 border-dashed border-slate-100 text-slate-400 hover:text-primary hover:border-primary/50 transition-all rounded-2xl bg-white font-black uppercase text-[10px] tracking-widest gap-2">
                          <PlusCircle className="h-4 w-4" /> Add Dynamic Section Hub
                       </Button>
                    </div>
                 </TabsContent>
              </Tabs>
           </Card>
        </div>
      </div>
    </div>
  )
}
