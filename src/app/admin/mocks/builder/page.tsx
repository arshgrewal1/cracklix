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
import { 
  ChevronLeft, 
  Database, 
  ClipboardCheck,
  Search,
  CheckCircle2,
  Layers,
  Loader2,
  Settings2,
  Plus,
  Trash2,
  ShieldCheck,
  SearchCode,
  Filter,
  ArrowRight
} from "lucide-react"
import { useCollection, useFirestore, useDoc } from "@/firebase"
import { collection, doc, setDoc, serverTimestamp, query, where } from "firebase/firestore"
import { useToast } from "@/hooks/use-toast"
import { errorEmitter } from "@/firebase/error-emitter"
import { FirestorePermissionError } from "@/firebase/errors"
import { MockType, MockSection } from "@/types"

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
  const { data: subjects } = useCollection<any>(useMemo(() => (db ? collection(db, "subjects") : null), [db]))
  const { data: questionBank } = useCollection<any>(useMemo(() => (db ? query(collection(db, "questions"), where("isStandalone", "==", true)) : null), [db]))

  const [isPublishing, setIsPublishing] = useState(false)
  const [mockData, setMockData] = useState<any>({
    title: "", 
    boardId: "", 
    duration: 120, 
    difficulty: "Medium", 
    mockType: "FULL" as MockType, 
    isPremium: true,
    subjectId: "",
    chapterId: "",
    year: new Date().getFullYear(),
    caCategory: "Punjab",
    negativeMarking: 0.25,
    passingMarks: 50,
    sections: [] as MockSection[]
  })

  const [selectedQuestions, setSelectedQuestions] = useState<any[]>([])
  const [bankFilter, setBankFilter] = useState({ subjectId: "all", chapterId: "", search: "" })

  useEffect(() => {
    if (existingMock) {
      setMockData({ ...existingMock })
    }
  }, [existingMock])

  useEffect(() => {
    if (existingMock && questionBank && existingMock.questionIds) {
      const selected = questionBank.filter((q: any) => existingMock.questionIds.includes(q.id))
      setSelectedQuestions(selected)
    }
  }, [existingMock, questionBank])

  const filteredBank = useMemo(() => {
    if (!questionBank) return []
    return questionBank.filter((q: any) => {
      const matchesSub = bankFilter.subjectId === "all" || q.subjectId === bankFilter.subjectId
      const matchesChap = !bankFilter.chapterId || q.chapterId?.toLowerCase().includes(bankFilter.chapterId.toLowerCase())
      const matchesSearch = !bankFilter.search || q.questionEn?.toLowerCase().includes(bankFilter.search.toLowerCase())
      const notSelected = !selectedQuestions.find(sq => sq.id === q.id)
      return matchesSub && matchesChap && matchesSearch && notSelected
    })
  }, [questionBank, bankFilter, selectedQuestions])

  const addSection = () => {
    const newSections = [...(mockData.sections || []), { id: `sec-${Date.now()}`, name: `Section ${(mockData.sections?.length || 0) + 1}`, subjectId: '', questionCount: 0, duration: 30, marksPerQuestion: 1 }]
    setMockData({ ...mockData, sections: newSections })
  }

  const removeSection = (id: string) => {
    setMockData({ ...mockData, sections: (mockData.sections || []).filter((s: any) => s.id !== id) })
  }

  const updateSection = (idx: number, field: keyof MockSection, val: any) => {
     const newSecs = [...mockData.sections];
     newSecs[idx] = { ...newSecs[idx], [field]: val };
     setMockData({...mockData, sections: newSecs});
  }

  const totalQuestions = useMemo(() => {
    if (mockData.mockType !== 'FULL') return selectedQuestions.length
    return (mockData.sections || []).reduce((acc: number, s: any) => acc + (parseInt(s.questionCount) || 0), 0)
  }, [mockData.mockType, mockData.sections, selectedQuestions])

  const totalDuration = useMemo(() => {
    if (mockData.mockType !== 'FULL') return mockData.duration
    return (mockData.sections || []).reduce((acc: number, s: any) => acc + (parseInt(s.duration) || 0), 0)
  }, [mockData.mockType, mockData.sections, mockData.duration])

  const handlePublish = () => {
    if (!mockData.title || !mockData.boardId) {
      toast({ variant: "destructive", title: "Assembly Failed", description: "Title and Board are mandatory." })
      return
    }

    setIsPublishing(true)
    const finalId = mockId || `mock-${Date.now()}`
    const mockRef = doc(db, "mocks", finalId)
    const payload = {
      ...mockData,
      id: finalId,
      totalQuestions: totalQuestions,
      duration: totalDuration,
      questionIds: selectedQuestions.map(q => q.id),
      published: true,
      updatedAt: serverTimestamp(),
      createdAt: isEditing ? (existingMock?.createdAt || serverTimestamp()) : serverTimestamp(),
    }

    setDoc(mockRef, payload, { merge: true })
      .then(() => {
        toast({ title: isEditing ? "Blueprint Updated" : "Mock Test Deployed", description: "Series is now live in the student hub." })
        router.push("/admin/mocks")
      })
      .catch(async () => {
        errorEmitter.emit("permission-error", new FirestorePermissionError({ path: mockRef.path, operation: 'write' }))
      })
      .finally(() => setIsPublishing(false))
  }

  return (
    <div className="space-y-10 pb-20 max-w-7xl mx-auto text-[#0F172A]">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 px-4">
        <div className="flex items-center gap-6">
          <button onClick={() => router.back()} className="rounded-2xl h-14 w-14 border border-slate-200 bg-white shadow-sm flex items-center justify-center hover:bg-slate-50 transition-all"><ChevronLeft className="h-7 w-7 text-[#0F172A]" /></button>
          <div className="text-left">
            <h1 className="text-4xl font-black font-headline text-[#0F172A] uppercase tracking-tight">Mock Architect</h1>
            <p className="text-slate-500 mt-1 font-medium">Assemble Full or Subject mocks by pulling questions from the bank.</p>
          </div>
        </div>
        <div className="flex gap-4">
           <Button variant="outline" className="h-16 px-8 rounded-2xl font-black uppercase text-[10px] tracking-widest bg-white shadow-sm">Save Blueprint</Button>
           <Button className="bg-[#0F172A] hover:bg-black text-white gap-3 font-black px-12 h-16 shadow-2xl rounded-2xl uppercase tracking-widest text-[10px]" onClick={handlePublish} disabled={isPublishing}>
            {isPublishing ? <Loader2 className="h-5 w-5 animate-spin" /> : <ClipboardCheck className="h-5 w-5" />} {isPublishing ? "Syncing..." : "Assemble & Deploy"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 px-4">
        <div className="lg:col-span-4 space-y-8 text-left">
          <Card className="border-none shadow-2xl rounded-[3rem] bg-white overflow-hidden">
            <div className="h-2 w-full bg-primary" />
            <CardHeader className="p-10 border-b border-slate-50">
               <CardTitle className="text-xl font-headline font-black uppercase flex items-center gap-3 text-left"><Settings2 className="h-5 w-5 text-primary" /> Test Blueprint</CardTitle>
            </CardHeader>
            <CardContent className="p-10 space-y-10">
              <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Mock Title</Label>
                <Input placeholder="e.g. PSSSB Clerk Full Mock 01" value={mockData.title} onChange={e => setMockData({...mockData, title: e.target.value})} className="rounded-xl h-14 bg-slate-50 border-none font-bold text-lg" />
              </div>

              <div className="space-y-3">
                 <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Mock Type</Label>
                 <Select value={mockData.mockType} onValueChange={(v: MockType) => setMockData({...mockData, mockType: v})}>
                    <SelectTrigger className="rounded-xl h-12 bg-slate-50 border-none font-bold text-[#0F172A]"><SelectValue /></SelectTrigger>
                    <SelectContent>
                       <SelectItem value="FULL">Full Exam Pattern</SelectItem>
                       <SelectItem value="SUBJECT">Subject Mastery</SelectItem>
                       <SelectItem value="SECTIONAL">Sectional / Topic</SelectItem>
                       <SelectItem value="PYQ">Previous Year Paper</SelectItem>
                       <SelectItem value="CA_QUIZ">Current Affairs Quiz</SelectItem>
                    </SelectContent>
                 </Select>
              </div>

              <div className="space-y-6">
                 <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Target Authority</Label>
                    <Select value={mockData.boardId} onValueChange={v => setMockData({...mockData, boardId: v})}>
                       <SelectTrigger className="rounded-xl h-12 bg-slate-50 border-none font-bold text-[#0F172A]"><SelectValue placeholder="Select Board" /></SelectTrigger>
                       <SelectContent>{boards?.map((b: any) => <SelectItem key={b.id} value={b.id}>{b.abbreviation}</SelectItem>)}</SelectContent>
                    </Select>
                 </div>

                 {mockData.mockType === 'FULL' ? (
                    <div className="space-y-8 bg-slate-50 p-6 rounded-[2.5rem] border border-slate-100">
                       <div className="flex justify-between items-center mb-2">
                          <h4 className="font-headline font-black text-sm uppercase text-[#0F172A] flex items-center gap-2"><Layers className="h-4 w-4 text-primary" /> Section Builder</h4>
                          <Button variant="ghost" size="sm" onClick={addSection} className="h-8 rounded-lg bg-white border border-slate-200 font-black uppercase text-[9px]"><Plus className="h-3 w-3 mr-1" /> Add Node</Button>
                       </div>
                       <div className="space-y-5 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                          {(mockData.sections || []).map((sec: any, idx: number) => (
                             <div key={sec.id} className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm relative group space-y-4">
                                <Button variant="ghost" size="icon" onClick={() => removeSection(sec.id)} className="absolute top-2 right-2 h-8 w-8 text-rose-400 opacity-0 group-hover:opacity-100"><Trash2 className="h-4 w-4" /></Button>
                                <Input value={sec.name} onChange={e => updateSection(idx, 'name', e.target.value)} className="h-9 rounded-xl bg-slate-50 border-none text-xs font-bold" placeholder="Section Name" />
                                <Select value={sec.subjectId} onValueChange={v => updateSection(idx, 'subjectId', v)}>
                                   <SelectTrigger className="h-9 rounded-xl bg-slate-50 border-none text-xs font-bold"><SelectValue placeholder="Focus Subject" /></SelectTrigger>
                                   <SelectContent>{subjects?.map((s:any) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
                                </Select>
                                <div className="grid grid-cols-3 gap-3 pt-3 border-t border-slate-50">
                                   <div className="text-center"><Label className="text-[8px] font-black uppercase text-slate-400">QS</Label><Input type="number" value={sec.questionCount} onChange={e => updateSection(idx, 'questionCount', e.target.value)} className="h-8 text-center text-[10px] font-black" /></div>
                                   <div className="text-center"><Label className="text-[8px] font-black uppercase text-slate-400">MINS</Label><Input type="number" value={sec.duration} onChange={e => updateSection(idx, 'duration', e.target.value)} className="h-8 text-center text-[10px] font-black" /></div>
                                   <div className="text-center"><Label className="text-[8px] font-black uppercase text-slate-400">MARKS</Label><Input type="number" value={sec.marksPerQuestion} onChange={e => updateSection(idx, 'marksPerQuestion', e.target.value)} className="h-8 text-center text-[10px] font-black" /></div>
                                </div>
                             </div>
                          ))}
                       </div>
                    </div>
                 ) : (
                    <div className="grid grid-cols-2 gap-6">
                       <div className="space-y-3">
                          <Label className="text-[10px] font-black uppercase text-slate-500">Subject</Label>
                          <Select value={mockData.subjectId} onValueChange={v => setMockData({...mockData, subjectId: v})}>
                             <SelectTrigger className="rounded-xl h-12 bg-slate-50 border-none font-bold text-[#0F172A]"><SelectValue /></SelectTrigger>
                             <SelectContent>{subjects?.map((s:any) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
                          </Select>
                       </div>
                       <div className="space-y-3">
                          <Label className="text-[10px] font-black uppercase text-slate-500">Manual Time</Label>
                          <Input type="number" value={mockData.duration} onChange={e => setMockData({...mockData, duration: parseInt(e.target.value) || 0})} className="rounded-xl h-12 bg-slate-50 border-none font-black text-lg" />
                       </div>
                    </div>
                 )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-8 space-y-8 text-left">
           <Card className="border-none shadow-2xl rounded-[3.5rem] bg-white overflow-hidden text-left">
              <CardHeader className="p-12 border-b border-slate-50 bg-slate-50/20 flex flex-col md:flex-row justify-between items-center gap-10">
                 <div className="space-y-2 text-left">
                    <CardTitle className="font-headline font-black text-2xl uppercase">Bank Assembly Matrix</CardTitle>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest text-left">Assembling {selectedQuestions.length} reusable nodes.</p>
                 </div>
                 <div className="flex gap-4">
                    <div className="bg-emerald-50 px-6 py-3 rounded-2xl border border-emerald-100 flex items-center gap-4">
                       <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Total MCQs</p>
                       <span className="text-2xl font-black text-emerald-600">{totalQuestions}</span>
                    </div>
                    <div className="bg-primary/5 px-6 py-3 rounded-2xl border border-primary/10 flex items-center gap-4">
                       <p className="text-[10px] font-black text-primary uppercase tracking-widest">Time Limit</p>
                       <span className="text-2xl font-black text-primary">{totalDuration}m</span>
                    </div>
                 </div>
              </CardHeader>
              <CardContent className="p-0">
                 <Tabs defaultValue="selected" className="w-full">
                    <TabsList className="bg-white border-b border-slate-50 h-16 w-full justify-start px-12 gap-10">
                       <TabsTrigger value="selected" className="h-full border-b-4 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary font-black uppercase text-[10px] tracking-[0.2em] rounded-none">Active Blueprint ({selectedQuestions.length})</TabsTrigger>
                       <TabsTrigger value="bank" className="h-full border-b-4 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary font-black uppercase text-[10px] tracking-[0.2em] rounded-none">Browse Global Bank</TabsTrigger>
                    </TabsList>

                    <TabsContent value="selected" className="p-12 space-y-6 min-h-[500px]">
                       {selectedQuestions.length === 0 ? (
                          <div className="py-40 text-center opacity-20 italic font-bold uppercase text-slate-400">
                             <SearchCode className="h-16 w-16 mx-auto mb-4" />
                             Blueprint Empty. Add questions from the bank to start.
                          </div>
                       ) : (
                          <div className="grid grid-cols-1 gap-4">
                             {selectedQuestions.map((q, idx) => (
                                <div key={q.id} className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 flex items-center justify-between group hover:border-primary/20 transition-all">
                                   <div className="flex items-center gap-6">
                                      <span className="text-[10px] font-black text-slate-300">#{idx + 1}</span>
                                      <div className="space-y-1">
                                         <p className="font-bold text-[#0F172A] line-clamp-1">{q.questionEn}</p>
                                         <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{q.subjectId} • {q.chapterId}</p>
                                      </div>
                                   </div>
                                   <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl text-rose-400 hover:bg-rose-50" onClick={() => setSelectedQuestions(selectedQuestions.filter(sq => sq.id !== q.id))}><Trash2 className="h-4 w-4" /></Button>
                                </div>
                             ))}
                          </div>
                       )}
                    </TabsContent>

                    <TabsContent value="bank" className="p-12 space-y-8 min-h-[500px]">
                       <div className="grid grid-cols-3 gap-6 mb-8">
                          <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" /><Input placeholder="Search bank..." value={bankFilter.search} onChange={e => setBankFilter({...bankFilter, search: e.target.value})} className="pl-10 h-12 rounded-xl bg-slate-50 border-none shadow-inner" /></div>
                          <Select value={bankFilter.subjectId} onValueChange={v => setBankFilter({...bankFilter, subjectId: v})}>
                             <SelectTrigger className="h-12 rounded-xl bg-slate-50 border-none font-bold"><SelectValue /></SelectTrigger>
                             <SelectContent><SelectItem value="all">All Subjects</SelectItem>{subjects?.map((s:any) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
                          </Select>
                          <Input placeholder="Chapter filter..." value={bankFilter.chapterId} onChange={e => setBankFilter({...bankFilter, chapterId: e.target.value})} className="h-12 rounded-xl bg-slate-50 border-none shadow-inner" />
                       </div>

                       <div className="grid grid-cols-1 gap-4">
                          {filteredBank.slice(0, 15).map(q => (
                             <div key={q.id} className="p-6 bg-white rounded-[2rem] border border-slate-100 flex items-center justify-between group hover:shadow-xl transition-all">
                                <div className="flex items-center gap-6">
                                   <div className="h-10 w-10 rounded-xl bg-primary/5 text-primary flex items-center justify-center font-black text-xs">MCQ</div>
                                   <div className="space-y-1 text-left">
                                      <p className="font-bold text-[#0F172A] line-clamp-1">{q.questionEn}</p>
                                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest text-left">{q.subjectId} • {q.chapterId}</p>
                                   </div>
                                </div>
                                <Button size="sm" className="bg-[#0F172A] text-white rounded-xl h-10 px-6 gap-2 font-black uppercase text-[10px]" onClick={() => setSelectedQuestions([...selectedQuestions, q])}>
                                   <Plus className="h-4 w-4" /> Add to Mock
                                </Button>
                             </div>
                          ))}
                          {filteredBank.length === 0 && <div className="py-20 text-center text-slate-300 italic">No matching reusable nodes found in bank.</div>}
                       </div>
                    </TabsContent>
                 </Tabs>
              </CardContent>
           </Card>
        </div>
      </div>
    </div>
  )
}
