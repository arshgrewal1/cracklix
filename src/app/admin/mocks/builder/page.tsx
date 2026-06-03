
"use client"

import { useState, useMemo, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
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
  Zap,
  Sparkles,
  ClipboardCheck,
  Search,
  CheckCircle2,
  Layers,
  Plus,
  Trash2,
  LayoutGrid,
  Edit,
  Languages,
  Globe
} from "lucide-react"
import { useCollection, useFirestore, useDoc } from "@/firebase"
import { collection, doc, setDoc, serverTimestamp } from "firebase/firestore"
import { useToast } from "@/hooks/use-toast"
import { errorEmitter } from "@/firebase/error-emitter"
import { FirestorePermissionError } from "@/firebase/errors"
import Link from "next/link"

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
  const { data: questionBank } = useCollection<any>(useMemo(() => (db ? collection(db, "questions") : null), [db]))
  const { data: subjects } = useCollection<any>(useMemo(() => (db ? collection(db, "subjects") : null), [db]))

  const [isPublishing, setIsPublishing] = useState(false)
  const [mockData, setMockData] = useState<any>({
    title: "", boardId: "", examId: "", duration: 120, difficulty: "Medium", mockType: "FULL", examType: "punjab"
  })

  const [selectedQuestions, setSelectedQuestions] = useState<any[]>([])
  const [bankSearch, setBankSearch] = useState("")

  useEffect(() => {
    if (existingMock) {
      setMockData({
        title: existingMock.title || "",
        boardId: existingMock.boardId || "",
        examId: existingMock.examId || "",
        duration: existingMock.duration || 120,
        difficulty: existingMock.difficulty || "Medium",
        mockType: existingMock.mockType || "FULL",
        examType: existingMock.examType || "punjab"
      })
    }
  }, [existingMock])

  useEffect(() => {
    if (existingMock && questionBank && existingMock.questionIds) {
      const selected = questionBank.filter((q: any) => existingMock.questionIds.includes(q.id))
      setSelectedQuestions(selected)
    }
  }, [existingMock, questionBank])

  const handlePublish = () => {
    if (!mockData.title || !mockData.examId) {
      toast({ variant: "destructive", title: "Audit Failed", description: "Title and Exam Hub are mandatory." })
      return
    }

    setIsPublishing(true)
    const finalId = mockId || `mock-${Date.now()}`
    const mockRef = doc(db, "mocks", finalId)
    const payload = {
      ...mockData,
      id: finalId,
      totalQuestions: selectedQuestions.length,
      questionIds: selectedQuestions.map(q => q.id),
      published: true,
      updatedAt: serverTimestamp(),
      createdAt: isEditing ? (existingMock?.createdAt || serverTimestamp()) : serverTimestamp(),
      author: "Arsh Grewal Management"
    }

    setDoc(mockRef, payload, { merge: true })
      .then(() => {
        toast({ title: isEditing ? "Series Updated" : "Series Deployed", description: "Test series is now live in the institutional repository." })
        router.push("/admin/mocks")
      })
      .catch(async () => {
        errorEmitter.emit("permission-error", new FirestorePermissionError({ path: mockRef.path, operation: 'write', requestResourceData: payload }))
      })
      .finally(() => setIsPublishing(false))
  }

  const filteredBank = useMemo(() => {
    if (!questionBank) return []
    return bankSearch.length > 1 
      ? questionBank.filter(q => (q.questionEn || "").toLowerCase().includes(bankSearch.toLowerCase()))
      : questionBank.slice(0, 50)
  }, [bankSearch, questionBank])

  return (
    <div className="space-y-10 pb-20 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
        <div className="flex items-center gap-6">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-2xl h-14 w-14 border border-slate-200 bg-white"><ChevronLeft className="h-7 w-7 text-[#0F172A]" /></Button>
          <div className="text-left">
            <h1 className="text-4xl font-black font-headline text-[#0F172A] uppercase">Audit Assembler</h1>
            <p className="text-slate-500 mt-1 font-medium">Configure trilingual modes and regional exam nodes.</p>
          </div>
        </div>
        <Button className="bg-primary hover:bg-primary/90 gap-3 font-black px-12 h-16 shadow-2xl rounded-2xl uppercase tracking-widest text-[10px]" onClick={handlePublish} disabled={isPublishing}>
          <ClipboardCheck className="h-5 w-5" /> {isPublishing ? "Syncing..." : "Commit Series"}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 text-[#0F172A]">
        <div className="lg:col-span-4 space-y-8 text-left">
          <Card className="border-none shadow-2xl rounded-[2.5rem] bg-white">
            <CardHeader className="p-10 border-b border-slate-50">
               <CardTitle className="text-xl font-headline font-black uppercase flex items-center gap-3"><Layers className="h-5 w-5 text-primary" /> Series Identity</CardTitle>
            </CardHeader>
            <CardContent className="p-10 space-y-8">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-slate-500">Official Title</Label>
                <Input placeholder="e.g. PSSSB Patwari Mock 01" value={mockData.title} onChange={e => setMockData({...mockData, title: e.target.value})} className="rounded-xl h-12 bg-slate-50 border-none font-bold" />
              </div>

              <div className="space-y-6 bg-slate-50 p-6 rounded-2xl border border-slate-100">
                <p className="text-[10px] font-black uppercase text-primary tracking-widest flex items-center gap-2"><Globe className="h-4 w-4" /> Exam Geographic Node</p>
                <Select value={mockData.examType} onValueChange={v => setMockData({...mockData, examType: v})}>
                   <SelectTrigger className="bg-white border-none shadow-sm font-bold"><SelectValue /></SelectTrigger>
                   <SelectContent>
                      <SelectItem value="punjab">Punjab State Exam (EN + PA)</SelectItem>
                      <SelectItem value="central">Central Govt Exam (EN + HI)</SelectItem>
                   </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 gap-6">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-slate-500">Recruitment Board</Label>
                  <Select value={mockData.boardId} onValueChange={val => setMockData({...mockData, boardId: val})}>
                    <SelectTrigger className="rounded-xl h-12 bg-slate-50 border-none shadow-sm font-bold"><SelectValue placeholder="Select Board" /></SelectTrigger>
                    <SelectContent>{boards?.map(b => <SelectItem key={b.id} value={b.id}>{b.abbreviation}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-slate-500">Exam Vertical</Label>
                  <Select value={mockData.examId} onValueChange={val => setMockData({...mockData, examId: val})}>
                    <SelectTrigger className="rounded-xl h-12 bg-slate-50 border-none shadow-sm font-bold" disabled={!mockData.boardId}><SelectValue placeholder="Select Exam" /></SelectTrigger>
                    <SelectContent>{exams?.filter(e => e.boardId === mockData.boardId).map(e => <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-8">
           <Tabs defaultValue="linked" className="space-y-8">
              <TabsList className="bg-slate-100 rounded-2xl p-1.5 h-16 w-fit shadow-xl">
                 <TabsTrigger value="linked" className="rounded-xl h-full px-8 font-black uppercase text-[10px] gap-3">Linked Assets ({selectedQuestions.length})</TabsTrigger>
                 <TabsTrigger value="manual" className="rounded-xl h-full px-8 font-black uppercase text-[10px] gap-3">Database Search</TabsTrigger>
              </TabsList>

              <TabsContent value="linked" className="space-y-4">
                 {selectedQuestions.map((q, idx) => (
                    <div key={q.id} className="p-8 rounded-[2rem] border border-slate-100 bg-white flex items-center justify-between group hover:border-primary/30 transition-all shadow-xl">
                       <div className="flex items-center gap-6 text-left">
                          <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center font-black text-xs text-slate-400">{idx + 1}</div>
                          <div className="space-y-1">
                             <p className="font-bold text-[#0F172A] line-clamp-1">{q.questionEn || q.questionPa}</p>
                             <Badge variant="outline" className="text-[9px] font-black uppercase text-primary border-primary/20">{q.subjectId}</Badge>
                          </div>
                       </div>
                       <Button onClick={() => setSelectedQuestions(selectedQuestions.filter(s => s.id !== q.id))} variant="ghost" size="icon" className="h-12 w-12 rounded-xl text-rose-400 hover:bg-rose-50"><Trash2 className="h-5 w-5" /></Button>
                    </div>
                 ))}
              </TabsContent>

              <TabsContent value="manual" className="space-y-8">
                 <div className="relative group">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-6 w-6 text-slate-400" />
                    <Input className="pl-16 h-16 rounded-[1.5rem] bg-white border-none shadow-2xl text-xl font-medium" placeholder="Search institutional library..." value={bankSearch} onChange={e => setBankSearch(e.target.value)} />
                 </div>
                 <div className="grid grid-cols-1 gap-4 max-h-[600px] overflow-y-auto pr-3 custom-scrollbar">
                    {filteredBank.map(q => {
                      const isAdded = selectedQuestions.find(s => s.id === q.id)
                      return (
                        <div key={q.id} className="p-8 rounded-[2rem] border border-slate-100 bg-white flex items-center justify-between group hover:border-primary/30 transition-all shadow-xl">
                           <p className="font-bold text-[#0F172A] line-clamp-2 text-left flex-1 pr-8">{q.questionEn || q.questionPa}</p>
                           <Button onClick={() => isAdded ? setSelectedQuestions(selectedQuestions.filter(s => s.id !== q.id)) : setSelectedQuestions([...selectedQuestions, q])} variant={isAdded ? "default" : "outline"} className={cn("rounded-xl h-12 px-8 font-black uppercase text-[10px]", isAdded ? 'bg-emerald-600 border-emerald-600 text-white' : 'text-slate-400')}>
                             {isAdded ? <CheckCircle2 className="h-4 w-4 mr-2" /> : ''} {isAdded ? 'Linked' : 'Link MCQ'}
                           </Button>
                        </div>
                      )
                    })}
                 </div>
              </TabsContent>
           </Tabs>
        </div>
      </div>
    </div>
  )
}

function Loader2({ className }: any) {
  return <Loader2 className={cn("animate-spin", className)} />
}
