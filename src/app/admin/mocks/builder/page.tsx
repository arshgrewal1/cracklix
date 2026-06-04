
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
  ArrowRight,
  History,
  Languages,
  Calendar,
  Zap,
  Globe,
  Layout,
  Lock
} from "lucide-react"
import { useCollection, useFirestore, useDoc } from "@/firebase"
import { collection, doc, setDoc, serverTimestamp, query, where, writeBatch, increment, arrayUnion, orderBy } from "firebase/firestore"
import { useToast } from "@/hooks/use-toast"
import { errorEmitter } from "@/firebase/error-emitter"
import { FirestorePermissionError } from "@/firebase/errors"
import { MockType, MockSection, Difficulty } from "@/types"

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
  const { data: passes } = useCollection<any>(useMemo(() => (db ? query(collection(db, "passes"), where("active", "==", true), orderBy("displayOrder", "asc")) : null), [db]))
  const { data: questionBank } = useCollection<any>(useMemo(() => (db ? query(collection(db, "questions"), where("isStandalone", "==", true)) : null), [db]))

  const [isPublishing, setIsPublishing] = useState(false)
  const [mockData, setMockData] = useState<any>({
    title: "", 
    boardId: "", 
    examId: "",
    duration: 150, 
    difficulty: "Mixed" as Difficulty, 
    mockType: "FULL" as MockType, 
    language: "Bilingual",
    published: false,
    isPremium: true,
    requiredPass: "aspirant_free",
    subjectId: "",
    chapterId: "",
    year: new Date().getFullYear(),
    negativeMarking: 0.25,
    passingMarks: 50,
    sections: [] as MockSection[]
  })

  const [selectedQuestions, setSelectedQuestions] = useState<any[]>([])
  const [bankFilter, setBankFilter] = useState({ subjectId: "all", chapterId: "", search: "", unusedOnly: false })

  useEffect(() => {
    if (existingMock) {
      const sanitized = { ...existingMock };
      Object.keys(sanitized).forEach(key => {
        if (sanitized[key] === null) sanitized[key] = "";
      });
      setMockData(sanitized);
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
      const matchesUnused = !bankFilter.unusedOnly || (q.usageCount || 0) === 0
      const notSelected = !selectedQuestions.find(sq => sq.id === q.id)
      return matchesSub && matchesChap && matchesSearch && notSelected && matchesUnused
    })
  }, [questionBank, bankFilter, selectedQuestions])

  const totalQuestions = useMemo(() => {
    if (mockData.mockType === 'FULL') {
       return (mockData.sections || []).reduce((acc: number, s: any) => acc + (parseInt(s.questionCount) || 0), 0)
    }
    return selectedQuestions.length
  }, [mockData.mockType, mockData.sections, selectedQuestions])

  const handlePublish = async () => {
    if (!mockData.title || !mockData.boardId || !mockData.examId) {
      toast({ variant: "destructive", title: "Audit Blocked", description: "Title, Board, and Exam are mandatory." })
      return
    }

    setIsPublishing(true)
    const finalId = mockId || `mock-${Date.now()}`
    const mockRef = doc(db!, "mocks", finalId)
    
    const basePayload: any = {
      ...mockData,
      id: finalId,
      totalQuestions: totalQuestions,
      questionIds: selectedQuestions.map(q => q.id),
    };

    Object.keys(basePayload).forEach(key => {
      if (basePayload[key] === undefined) basePayload[key] = null;
    });

    const finalPayload = {
      ...basePayload,
      updatedAt: serverTimestamp(),
      createdAt: isEditing ? (existingMock?.createdAt || serverTimestamp()) : serverTimestamp(),
    };

    try {
      await setDoc(mockRef, finalPayload, { merge: true })
      toast({ title: isEditing ? "Audit Updated" : "Series Deployed", description: "Blueprints successfully synced to platform hubs." })
      router.push("/admin/mocks")
    } catch (err: any) {
      errorEmitter.emit("permission-error", new FirestorePermissionError({ path: mockRef.path, operation: 'write' }))
    } finally {
      setIsPublishing(false)
    }
  }

  return (
    <div className="space-y-10 pb-24 max-w-[1600px] mx-auto text-[#0F172A]">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8 px-6">
        <div className="flex items-center gap-6">
          <button onClick={() => router.back()} className="rounded-2xl h-14 w-14 border border-slate-200 bg-white shadow-sm flex items-center justify-center hover:bg-slate-50 transition-all"><ChevronLeft className="h-7 w-7" /></button>
          <div className="text-left">
            <h1 className="text-4xl font-black font-headline uppercase tracking-tight">Mock Architect</h1>
            <p className="text-slate-500 font-medium text-left">Categorized assembly node for institutional assessments.</p>
          </div>
        </div>
        <div className="flex gap-4">
           <Button className="bg-primary hover:bg-orange-600 text-white gap-3 font-black px-12 h-16 shadow-2xl rounded-2xl uppercase tracking-widest text-[10px]" onClick={handlePublish} disabled={isPublishing}>
            {isPublishing ? <Loader2 className="h-5 w-5 animate-spin" /> : <ClipboardCheck className="h-5 w-5" />} Publish Blueprint
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 px-6">
        <div className="lg:col-span-4 space-y-8">
          <Card className="border-none shadow-3xl rounded-[3rem] bg-white overflow-hidden text-left">
            <div className="h-2 w-full bg-primary" />
            <CardHeader className="p-10 pb-4">
               <CardTitle className="text-xl font-headline font-black uppercase flex items-center gap-4"><Settings2 className="h-6 w-6 text-primary" /> Classification</CardTitle>
            </CardHeader>
            <CardContent className="p-10 pt-4 space-y-8">
              <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Test Headline</Label>
                <Input placeholder="e.g. PSSSB Excise Inspector Mock 01" value={mockData.title || ""} onChange={e => setMockData({...mockData, title: e.target.value})} className="rounded-xl h-14 bg-slate-50 border-none font-bold text-lg" />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                   <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Required Pass Node</Label>
                   <Select value={mockData.requiredPass} onValueChange={v => setMockData({...mockData, requiredPass: v})}>
                      <SelectTrigger className="h-12 rounded-xl bg-amber-50 border-none font-black text-amber-700"><SelectValue placeholder="Select Pass" /></SelectTrigger>
                      <SelectContent>
                         {passes?.map((p: any) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                      </SelectContent>
                   </Select>
                </div>
                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Mock Category</Label>
                  <Select value={mockData.mockType} onValueChange={(v: MockType) => setMockData({...mockData, mockType: v})}>
                    <SelectTrigger className="h-12 rounded-xl bg-slate-50 border-none font-bold"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="FULL">Full Mock</SelectItem>
                      <SelectItem value="SUBJECT">Subject Test</SelectItem>
                      <SelectItem value="SECTIONAL">Sectional</SelectItem>
                      <SelectItem value="PYQ">PYQ Archive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                 <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Board Authority</Label>
                    <Select value={mockData.boardId} onValueChange={v => setMockData({...mockData, boardId: v})}>
                       <SelectTrigger className="h-12 rounded-xl bg-slate-50 border-none font-bold"><SelectValue placeholder="Select" /></SelectTrigger>
                       <SelectContent>{boards?.map((b: any) => <SelectItem key={b.id} value={b.id}>{b.abbreviation}</SelectItem>)}</SelectContent>
                    </Select>
                 </div>
                 <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Target Exam Hub</Label>
                    <Select value={mockData.examId} onValueChange={v => setMockData({...mockData, examId: v})}>
                       <SelectTrigger className="h-12 rounded-xl bg-slate-50 border-none font-bold"><SelectValue placeholder="Select" /></SelectTrigger>
                       <SelectContent>{exams?.filter((e: any) => e.boardId === mockData.boardId).map((e: any) => <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>)}</SelectContent>
                    </Select>
                 </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-3xl rounded-[3rem] bg-[#0F172A] text-white p-10 space-y-8">
             <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                   <Label className="text-[10px] font-black uppercase text-slate-400">Duration (Mins)</Label>
                   <Input type="number" value={mockData.duration} onChange={e => setMockData({...mockData, duration: parseInt(e.target.value) || 0})} className="h-12 bg-white/5 border-none rounded-xl font-black text-center" />
                </div>
                <div className="space-y-2">
                   <Label className="text-[10px] font-black uppercase text-slate-400">Status</Label>
                   <Select value={mockData.published ? "published" : "draft"} onValueChange={(v) => setMockData({...mockData, published: v === "published"})}>
                      <SelectTrigger className="h-12 bg-white/5 border-none rounded-xl font-bold"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Draft Node</SelectItem>
                        <SelectItem value="published">Production Live</SelectItem>
                      </SelectContent>
                   </Select>
                </div>
             </div>
          </Card>
        </div>

        <div className="lg:col-span-8 space-y-10">
           <Card className="border-none shadow-3xl rounded-[4rem] bg-white overflow-hidden text-left">
              <CardHeader className="p-12 border-b border-slate-50 bg-slate-50/20 flex flex-col md:flex-row justify-between items-center gap-12">
                 <div className="space-y-3">
                    <CardTitle className="font-headline font-black text-3xl uppercase">Bank Assembly Ledger</CardTitle>
                    <div className="flex gap-4">
                       <Badge className="bg-emerald-50 text-emerald-600 border-none px-4 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest">{selectedQuestions.length} NODES SELECTED</Badge>
                       <Badge className="bg-primary/5 text-primary border-none px-4 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest">{mockData.duration} MINS TARGET</Badge>
                    </div>
                 </div>
              </CardHeader>
              <CardContent className="p-0">
                 <Tabs defaultValue="bank" className="w-full">
                    <TabsList className="bg-white border-b border-slate-50 h-20 w-full justify-start px-12 gap-12">
                       <TabsTrigger value="bank" className="h-full border-b-4 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary font-black uppercase text-[11px] tracking-[0.2em] rounded-none">Query Global Bank</TabsTrigger>
                       <TabsTrigger value="selected" className="h-full border-b-4 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary font-black uppercase text-[11px] tracking-[0.2em] rounded-none">Active Assembly ({selectedQuestions.length})</TabsTrigger>
                    </TabsList>

                    <TabsContent value="bank" className="p-12 space-y-10 min-h-[600px]">
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <div className="relative">
                             <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                             <Input placeholder="Search bank nodes..." value={bankFilter.search} onChange={e => setBankFilter({...bankFilter, search: e.target.value})} className="pl-16 h-16 rounded-2xl bg-slate-50 border-none shadow-inner text-lg font-medium" />
                          </div>
                          <Select value={bankFilter.subjectId} onValueChange={v => setBankFilter({...bankFilter, subjectId: v})}>
                             <SelectTrigger className="h-16 rounded-2xl bg-slate-50 border-none font-black uppercase text-[10px] tracking-widest"><SelectValue placeholder="All Subjects" /></SelectTrigger>
                             <SelectContent>
                                <SelectItem value="all">All Subjects</SelectItem>
                                {subjects?.map((s:any) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                             </SelectContent>
                          </Select>
                       </div>

                       <div className="space-y-4">
                          {filteredBank.slice(0, 15).map(q => (
                             <div key={q.id} className="p-8 bg-white rounded-[2.5rem] border border-slate-100 flex items-center justify-between group hover:shadow-2xl transition-all duration-300">
                                <div className="flex items-center gap-8">
                                   <div className="h-12 w-12 rounded-2xl bg-primary/5 text-primary flex items-center justify-center font-black text-sm shadow-inner group-hover:scale-110 transition-transform">
                                      <Plus className="h-5 w-5" />
                                   </div>
                                   <div className="space-y-1.5 text-left">
                                      <p className="font-bold text-[#0F172A] text-lg leading-tight line-clamp-1">{q.questionEn}</p>
                                      <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{q.subjectId} • {q.chapterId || 'General'}</span>
                                   </div>
                                </div>
                                <Button size="sm" className="bg-[#0F172A] text-white rounded-xl h-11 px-8 gap-3 font-black uppercase text-[10px] tracking-widest shadow-xl" onClick={() => setSelectedQuestions([...selectedQuestions, q])}>
                                   <Plus className="h-4 w-4" /> Link Node
                                </Button>
                             </div>
                          ))}
                       </div>
                    </TabsContent>

                    <TabsContent value="selected" className="p-12 space-y-6 min-h-[600px]">
                       {selectedQuestions.length === 0 ? (
                          <div className="py-40 text-center opacity-10 italic font-black uppercase tracking-widest">
                             Blueprint Matrix Empty.
                          </div>
                       ) : (
                          <div className="space-y-4">
                             {selectedQuestions.map((q, idx) => (
                                <div key={q.id} className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 flex items-center justify-between group">
                                   <div className="flex items-center gap-8">
                                      <span className="text-xl font-black text-slate-200">#{idx + 1}</span>
                                      <div className="space-y-1 text-left">
                                         <p className="font-bold text-[#0F172A] line-clamp-1 text-lg leading-tight">{q.questionEn}</p>
                                         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{q.subjectId} • {q.chapterId}</p>
                                      </div>
                                   </div>
                                   <Button variant="ghost" size="icon" className="h-12 w-12 rounded-2xl text-rose-400 hover:bg-rose-50 shadow-sm" onClick={() => setSelectedQuestions(selectedQuestions.filter(sq => sq.id !== q.id))}>
                                      <Trash2 className="h-6 w-6" />
                                   </Button>
                                </div>
                             ))}
                          </div>
                       )}
                    </TabsContent>
                 </Tabs>
              </CardContent>
           </Card>
        </div>
      </div>
    </div>
  )
}
