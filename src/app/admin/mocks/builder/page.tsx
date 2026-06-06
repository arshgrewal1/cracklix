
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
  ListTree
} from "lucide-react"
import { useCollection, useFirestore, useDoc } from "@/firebase"
import { collection, doc, setDoc, serverTimestamp, query, where, limit, getDocs } from "firebase/firestore"
import { useToast } from "@/hooks/use-toast"
import { MockType, Difficulty, AccessType } from "@/types"
import { cn } from "@/lib/utils"

const PSSSB_SECTIONS = [
  "General Knowledge & Current Affairs",
  "Punjab History & Culture",
  "Logical Reasoning & Mental Ability",
  "Quantitative Aptitude",
  "Punjabi (Qualifying - Part A)",
  "Punjabi (Part B)",
  "English Language",
  "Information Technology (ICT)",
  "Agriculture & General Economy"
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

  const { data: existingMock } = useDoc<any>(useMemo(() => (db && typeof db === 'object' && mockId ? doc(db, "mocks", mockId) : null), [db, mockId]))
  const { data: boards } = useCollection<any>(useMemo(() => (db && typeof db === 'object' ? query(collection(db, "boards")) : null), [db]))
  const { data: exams } = useCollection<any>(useMemo(() => (db && typeof db === 'object' ? query(collection(db, "exams")) : null), [db]))
  const { data: subjects } = useCollection<any>(useMemo(() => (db && typeof db === 'object' ? query(collection(db, "subjects")) : null), [db]))
  const { data: passes } = useCollection<any>(useMemo(() => (db && typeof db === 'object' ? query(collection(db, "passes"), where("active", "==", true)) : null), [db]))
  
  const [bankLoading, setBankLoading] = useState(false)
  const [questionBank, setQuestionBank] = useState<any[]>([])
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
    passId: "any", 
    published: false,
    positiveMarks: 1,
    negativeMarks: 0.25,
  })

  const [sections, setSections] = useState<any[]>([
    { id: 'sec-1', name: 'General Knowledge & Current Affairs', questions: [] }
  ])
  const [activeSectionId, setActiveSectionId] = useState('sec-1')
  const [bankSelection, setBankSelection] = useState<string[]>([])

  useEffect(() => {
    async function fetchBank() {
      if (!db || typeof db !== 'object') return
      setBankLoading(true)
      try {
        const q = query(collection(db, "questions"), limit(1000))
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
        passId: existingMock.passId || "any"
      }));

      if (existingMock.sections && existingMock.sections.length > 0) {
        const hydratedSections = existingMock.sections.map((s: any, idx: number) => {
          const qIds = existingMock.questionIds?.slice(
            existingMock.sections.slice(0, idx).reduce((acc: number, curr: any) => acc + curr.count, 0),
            existingMock.sections.slice(0, idx + 1).reduce((acc: number, curr: any) => acc + curr.count, 0)
          ) || [];
          
          return {
            id: `sec-${idx + 1}`,
            name: s.name,
            questions: questionBank.filter(q => qIds.includes(q.id))
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
      const matchesSub = bankFilter.subjectId === "all" || q.subjectId === bankFilter.subjectId
      const qText = (q.englishQuestion || q.questionEn || q.questionText || "").toLowerCase()
      const matchesSearch = !bankFilter.search || qText.includes(bankFilter.search.toLowerCase())
      const notAlreadySelected = !allSelectedIds.includes(q.id)
      return matchesBoard && matchesExam && matchesSub && matchesSearch && notAlreadySelected
    })
  }, [questionBank, bankFilter, sections])

  const handleAddSection = (presetName?: string) => {
    const newId = `sec-${Date.now()}`;
    setSections([...sections, { id: newId, name: presetName || `New Section ${sections.length + 1}`, questions: [] }]);
    setActiveSectionId(newId);
  }

  const handleBulkLink = () => {
    const toAdd = questionBank.filter(q => bankSelection.includes(q.id))
    setSections(sections.map(s => s.id === activeSectionId ? { ...s, questions: [...s.questions, ...toAdd] } : s));
    setBankSelection([])
    toast({ title: "Nodes Linked", description: `${toAdd.length} questions linked to ${sections.find(s => s.id === activeSectionId)?.name}.` })
  }

  const handlePublish = async () => {
    if (!mockData.title || !mockData.boardId || !mockData.examId) {
      toast({ variant: "destructive", title: "Audit Blocked", description: "Title, Board, and Exam are mandatory." })
      return
    }

    const totalQuestions = sections.reduce((acc, s) => acc + s.questions.length, 0);
    setIsPublishing(true)
    const finalId = mockId || `mock-${Date.now()}`
    const mockRef = doc(db!, "mocks", finalId)
    
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
      toast({ title: "Series Deployed", description: "Blueprint committed to registry." })
      router.push("/admin/mocks")
    } catch (err: any) {
      toast({ variant: "destructive", title: "Sync Failed" })
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
            <h1 className="text-4xl font-black font-headline uppercase tracking-tight text-[#0F172A]">Mock Architect</h1>
            <p className="text-[10px] uppercase font-black tracking-[0.2em] text-slate-400 mt-1">Institutional CBT Blueprinting Engine</p>
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
                 <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Series Headline</Label>
                 <Input value={mockData.title} onChange={e => setMockData({...mockData, title: e.target.value})} className="rounded-xl h-14 font-bold text-lg border-slate-100" />
               </div>

               <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                   <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Authority</Label>
                   <Select value={mockData.boardId} onValueChange={v => setMockData({...mockData, boardId: v, examId: ""})}>
                     <SelectTrigger className="rounded-xl h-12 bg-slate-50/50 border-none"><SelectValue placeholder="Select" /></SelectTrigger>
                     <SelectContent className="max-h-60 overflow-y-auto">{boards?.map((b: any) => <SelectItem key={b.id} value={b.id}>{b.abbreviation}</SelectItem>)}</SelectContent>
                   </Select>
                 </div>
                 <div className="space-y-2">
                   <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Exam Hub</Label>
                   <Select value={mockData.examId} onValueChange={v => setMockData({...mockData, examId: v})}>
                     <SelectTrigger className="rounded-xl h-12 bg-slate-50/50 border-none"><SelectValue placeholder="Select" /></SelectTrigger>
                     <SelectContent className="max-h-60 overflow-y-auto">{exams?.filter((e: any) => e.boardId === mockData.boardId).map((e: any) => <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>)}</SelectContent>
                   </Select>
                 </div>
               </div>

               <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-50">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase text-slate-500 ml-1 flex items-center gap-2"><Clock className="h-3 w-3" /> Duration (Mins)</Label>
                    <Input type="number" value={mockData.duration} onChange={e => setMockData({...mockData, duration: parseInt(e.target.value) || 0})} className="h-12 rounded-xl text-center border-slate-100" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Access Tier</Label>
                    <Select value={mockData.accessType} onValueChange={(v: AccessType) => setMockData({...mockData, accessType: v})}>
                      <SelectTrigger className="rounded-xl h-12 bg-slate-50/50 border-none"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="FREE">Free Hub</SelectItem>
                        <SelectItem value="PREMIUM">Elite Vault</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
               </div>

               <div className="pt-8 border-t border-slate-50 flex items-center justify-between p-6 bg-slate-50/50 rounded-3xl">
                  <div className="space-y-0.5">
                     <p className="font-black text-[11px] uppercase text-[#0F172A]">Production Status</p>
                     <p className="text-[8px] text-slate-400 font-bold uppercase">Toggle to make series live</p>
                  </div>
                  <Switch checked={mockData.published} onCheckedChange={val => setMockData({...mockData, published: val})} />
               </div>
            </div>
          </Card>
        </div>

        <div className="lg:col-span-8 space-y-6">
           <Card className="border-none shadow-4xl rounded-[4rem] bg-white overflow-hidden min-h-[750px] flex flex-col">
              <Tabs defaultValue="bank" className="flex-1 flex flex-col">
                 <TabsList className="bg-slate-50/50 border-b border-slate-100 w-full justify-start h-20 px-10 gap-12 rounded-none">
                    <TabsTrigger value="bank" className="font-black uppercase text-[11px] tracking-widest gap-3 h-12 data-[state=active]:text-primary">
                       <Database className="h-4 w-4" /> Atomic Bank
                    </TabsTrigger>
                    <TabsTrigger value="assembly" className="font-black uppercase text-[11px] tracking-widest gap-3 h-12 data-[state=active]:text-primary">
                       <Layers className="h-4 w-4" /> Active Assembly 
                       <Badge className="bg-primary text-white border-none text-[8px] ml-1">{sections.reduce((acc, s) => acc + s.questions.length, 0)}</Badge>
                    </TabsTrigger>
                 </TabsList>

                 <TabsContent value="bank" className="p-8 md:p-10 flex-1 flex flex-col m-0">
                    <div className="flex flex-wrap gap-4 mb-8">
                       <div className="relative flex-1 min-w-[200px]">
                          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                          <Input placeholder="Search bank nodes..." value={bankFilter.search} onChange={e => setBankFilter({...bankFilter, search: e.target.value})} className="h-12 pl-12 rounded-xl bg-slate-50 border-none font-bold" />
                       </div>
                       <div className="w-full md:w-44">
                          <Select value={bankFilter.boardId} onValueChange={v => setBankFilter({...bankFilter, boardId: v, examId: "all"})}>
                             <SelectTrigger className="h-12 rounded-xl bg-slate-50 border-none font-bold text-xs"><SelectValue placeholder="Board" /></SelectTrigger>
                             <SelectContent className="max-h-60 overflow-y-auto">
                                <SelectItem value="all">All Boards</SelectItem>
                                {boards?.map((b: any) => <SelectItem key={b.id} value={b.id}>{b.abbreviation}</SelectItem>)}
                             </SelectContent>
                          </Select>
                       </div>
                       <div className="w-full md:w-44">
                          <Select value={bankFilter.examId} onValueChange={v => setBankFilter({...bankFilter, examId: v})}>
                             <SelectTrigger className="h-12 rounded-xl bg-slate-50 border-none font-bold text-xs"><SelectValue placeholder="Exam Paper" /></SelectTrigger>
                             <SelectContent className="max-h-60 overflow-y-auto">
                                <SelectItem value="all">All Exams</SelectItem>
                                {exams?.filter((e: any) => bankFilter.boardId === 'all' || e.boardId === bankFilter.boardId).map((e: any) => <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>)}
                             </SelectContent>
                          </Select>
                       </div>
                       <div className="w-full md:w-44">
                          <Select value={bankFilter.subjectId} onValueChange={v => setBankFilter({...bankFilter, subjectId: v})}>
                             <SelectTrigger className="h-12 rounded-xl bg-slate-50 border-none font-bold text-xs"><SelectValue placeholder="Subject" /></SelectTrigger>
                             <SelectContent className="max-h-60 overflow-y-auto">
                                <SelectItem value="all">All Subjects</SelectItem>
                                {subjects?.map((s: any) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                             </SelectContent>
                          </Select>
                       </div>
                    </div>

                    <div className="bg-[#0F172A] p-6 rounded-[2rem] mb-8 flex flex-col md:flex-row md:items-center justify-between gap-8 text-white shadow-2xl overflow-hidden relative">
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10 flex-1 min-w-0">
                          <div className="space-y-1.5 text-left w-full">
                             <p className="text-[7px] font-black uppercase text-slate-500 tracking-[0.3em]">Target</p>
                             <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest mb-1.5">Subject Node</p>
                             <Select value={activeSectionId} onValueChange={setActiveSectionId}>
                                <SelectTrigger className="h-12 w-full bg-white/10 border-white/10 text-white font-black text-[10px] rounded-xl uppercase tracking-widest">
                                   <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="max-h-[300px] overflow-y-auto">
                                   {sections.map(s => <SelectItem key={s.id} value={s.id} className="uppercase font-bold text-[10px]">{s.name}</SelectItem>)}
                                </SelectContent>
                             </Select>
                          </div>
                          
                          <div className="flex items-center gap-4 shrink-0 justify-center md:justify-start">
                             <div className="relative h-6 w-6">
                                <Checkbox 
                                  id="select-all"
                                  className="h-6 w-6 rounded-full border-primary data-[state=checked]:bg-primary"
                                  checked={filteredBank.length > 0 && bankSelection.length === filteredBank.length} 
                                  onCheckedChange={(v) => {
                                     if (v) setBankSelection(filteredBank.map(q => q.id))
                                     else setBankSelection([])
                                  }}
                                />
                             </div>
                             <div className="text-left">
                                <Label htmlFor="select-all" className="font-black uppercase text-[10px] tracking-widest text-white cursor-pointer">Select All</Label>
                                <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">({bankSelection.length} Nodes)</p>
                             </div>
                          </div>
                       </div>

                       <Button 
                         disabled={bankSelection.length === 0} 
                         onClick={handleBulkLink} 
                         className="bg-emerald-600 hover:bg-emerald-700 h-14 px-10 rounded-xl text-[10px] uppercase font-black tracking-[0.2em] shadow-xl w-full md:w-auto shrink-0"
                       >
                          Link {bankSelection.length} Nodes
                       </Button>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar pr-4 space-y-3">
                       {bankLoading ? (
                          <div className="flex flex-col items-center justify-center py-20 opacity-20">
                             <Loader2 className="h-8 w-8 animate-spin mb-4" />
                             <p className="font-black uppercase text-[10px]">Hydrating Atomic Registry...</p>
                          </div>
                       ) : filteredBank.map(q => (
                          <div key={q.id} className={cn(
                             "p-4 rounded-xl border flex items-center justify-between transition-all",
                             bankSelection.includes(q.id) ? "bg-primary/5 border-primary/20" : "bg-white border-slate-100 hover:border-primary/10"
                          )}>
                             <div className="flex items-center gap-6 min-w-0 flex-1 text-left">
                                <Checkbox 
                                  checked={bankSelection.includes(q.id)} 
                                  onCheckedChange={() => {
                                     setBankSelection(prev => prev.includes(q.id) ? prev.filter(id => id !== q.id) : [...prev, id])
                                  }}
                                />
                                <div className="min-w-0 flex-1">
                                   <p className="font-bold text-sm text-[#0F172A] truncate">{q.englishQuestion || q.questionEn}</p>
                                   <div className="flex items-center gap-3 mt-1.5">
                                      <Badge variant="outline" className="text-[7px] font-black uppercase border-slate-100 text-slate-400 px-2">{q.boardId || 'LEGACY'}</Badge>
                                      <span className="text-[7px] font-mono text-slate-300 uppercase">ID: {q.id?.slice(-8)}</span>
                                   </div>
                                </div>
                             </div>
                          </div>
                       ))}
                    </div>
                 </TabsContent>

                 <TabsContent value="assembly" className="p-10 flex-1 flex flex-col m-0">
                    <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100 mb-10 flex items-center justify-between gap-6">
                       <div className="space-y-1 text-left">
                          <p className="font-black uppercase text-[11px] text-[#0F172A] tracking-widest">CBT Blueprint Sections ({sections.length})</p>
                       </div>
                       <div className="flex items-center gap-3">
                          <Select onValueChange={(val) => handleAddSection(val)}>
                             <SelectTrigger className="h-11 w-64 bg-white border-slate-200 rounded-xl font-black uppercase text-[9px] tracking-widest">
                                <Plus className="h-3 w-3 text-primary mr-2" /> 
                                <SelectValue placeholder="Add Standard Section" />
                             </SelectTrigger>
                             <SelectContent className="max-h-60 overflow-y-auto">
                                {PSSSB_SECTIONS.map(s => <SelectItem key={s} value={s} className="font-bold text-[10px] uppercase">{s}</SelectItem>)}
                             </SelectContent>
                          </Select>
                          <Button variant="outline" size="sm" className="bg-white rounded-xl h-11 px-6 font-black uppercase text-[9px]" onClick={() => handleAddSection()}>
                             Custom Node
                          </Button>
                       </div>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar pr-4 space-y-10">
                       {sections.map((section, sIdx) => (
                          <div key={section.id} className="space-y-4">
                             <div className="flex items-center justify-between group">
                                <div className="flex items-center gap-4 flex-1">
                                   <div className="h-7 w-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 font-black text-[9px]">{sIdx + 1}</div>
                                   <input 
                                     value={section.name}
                                     onChange={(e) => setSections(sections.map(s => s.id === section.id ? { ...s, name: e.target.value } : s))}
                                     className="bg-transparent border-none font-black uppercase text-sm text-[#0F172A] outline-none w-full tracking-widest"
                                   />
                                </div>
                                <Badge className="bg-primary/10 text-primary border-none font-black text-[8px] px-3 py-1 rounded-lg uppercase">{section.questions.length} Linked</Badge>
                             </div>

                             <div className="space-y-2 pl-11">
                                {section.questions.map((q: any, qIdx: number) => (
                                   <div key={q.id} className="p-3.5 bg-white border border-slate-50 rounded-xl flex items-center justify-between group/q shadow-sm hover:border-primary/20">
                                      <p className="font-bold text-xs text-[#0F172A] truncate flex-1">{q.englishQuestion || q.questionEn}</p>
                                      <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-300 hover:text-rose-500 opacity-0 group-hover/q:opacity-100" onClick={() => setSections(sections.map(s => s.id === section.id ? { ...s, questions: s.questions.filter((item: any) => item.id !== q.id) } : s))}>
                                         <Trash2 className="h-4 w-4" />
                                      </Button>
                                   </div>
                                ))}
                             </div>
                          </div>
                       ))}
                    </div>
                 </TabsContent>
              </Tabs>
           </Card>
        </div>
      </div>
    </div>
  )
}
