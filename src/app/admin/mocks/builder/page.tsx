
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
  Zap,
  Globe,
  Lock,
  Unlock,
  AlertTriangle
} from "lucide-react"
import { useCollection, useFirestore, useDoc } from "@/firebase"
import { collection, doc, setDoc, serverTimestamp, query, where, orderBy } from "firebase/firestore"
import { useToast } from "@/hooks/use-toast"
import { errorEmitter } from "@/firebase/error-emitter"
import { FirestorePermissionError } from "@/firebase/errors"
import { MockType, Difficulty, AccessType } from "@/types"
import { cn } from "@/lib/utils"

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
  const { data: questionBank } = useCollection<any>(useMemo(() => (db ? query(collection(db, "questions"), where("isStandalone", "==", true)) : null), [db]))

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
    subjectId: "all",
    year: new Date().getFullYear(),
    questionIds: []
  })

  const [selectedQuestions, setSelectedQuestions] = useState<any[]>([])
  const [bankFilter, setBankFilter] = useState({ subjectId: "all", search: "" })

  useEffect(() => {
    if (existingMock) {
      setMockData(existingMock);
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
      const matchesSearch = !bankFilter.search || q.questionEn?.toLowerCase().includes(bankFilter.search.toLowerCase())
      const notSelected = !selectedQuestions.find(sq => sq.id === q.id)
      return matchesSub && matchesSearch && notSelected
    })
  }, [questionBank, bankFilter, selectedQuestions])

  const handlePublish = async () => {
    if (!mockData.title || !mockData.boardId || !mockData.examId) {
      toast({ variant: "destructive", title: "Audit Blocked", description: "Title, Board, and Exam are mandatory nodes." })
      return
    }

    setIsPublishing(true)
    const finalId = mockId || `mock-${Date.now()}`
    const mockRef = doc(db!, "mocks", finalId)
    
    const payload = {
      ...mockData,
      id: finalId,
      totalQuestions: selectedQuestions.length,
      questionIds: selectedQuestions.map(q => q.id),
      updatedAt: serverTimestamp(),
      createdAt: isEditing ? (existingMock?.createdAt || serverTimestamp()) : serverTimestamp(),
    };

    // Purge undefined
    Object.keys(payload).forEach(key => payload[key] === undefined && delete payload[key]);

    try {
      await setDoc(mockRef, payload, { merge: true })
      toast({ title: "Series Deployed", description: "Exam-specific content successfully synced." })
      router.push("/admin/mocks")
    } catch (err: any) {
      errorEmitter.emit("permission-error", new FirestorePermissionError({ path: mockRef.path, operation: 'write' }))
    } finally {
      setIsPublishing(false)
    }
  }

  return (
    <div className="max-w-[1400px] mx-auto space-y-8 pb-24 text-left">
      <div className="flex items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-xl border h-10 w-10"><ChevronLeft className="h-5 w-5" /></Button>
          <div className="text-left">
            <h1 className="text-2xl font-black font-headline uppercase">Mock Architect</h1>
            <p className="text-[10px] uppercase font-bold text-slate-400">Institutional Blueprint Entry</p>
          </div>
        </div>
        <Button className="bg-primary hover:bg-orange-600 font-black px-8 h-12 rounded-xl uppercase text-[10px] tracking-widest gap-2 shadow-xl" onClick={handlePublish} disabled={isPublishing}>
          {isPublishing ? <Loader2 className="h-4 w-4 animate-spin" /> : <ClipboardCheck className="h-4 w-4" />} Publish Module
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 px-4">
        <div className="lg:col-span-4 space-y-6">
          <Card className="border-none shadow-xl rounded-[2rem] bg-white p-8 space-y-8">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Series Headline</Label>
              <Input placeholder="e.g. CTET P1 Full Mock 01" value={mockData.title} onChange={e => setMockData({...mockData, title: e.target.value})} className="rounded-xl h-12 font-bold" />
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Authority</Label>
                <Select value={mockData.boardId} onValueChange={v => setMockData({...mockData, boardId: v, examId: ""})}>
                  <SelectTrigger className="rounded-xl h-10 font-bold"><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>{boards?.map((b: any) => <SelectItem key={b.id} value={b.id}>{b.abbreviation}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Target Exam Hub</Label>
                <Select value={mockData.examId} onValueChange={v => setMockData({...mockData, examId: v})}>
                  <SelectTrigger className="rounded-xl h-10 font-bold"><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>{exams?.filter((e: any) => e.boardId === mockData.boardId).map((e: any) => <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Module Type</Label>
                <Select value={mockData.mockType} onValueChange={(v: MockType) => setMockData({...mockData, mockType: v})}>
                  <SelectTrigger className="rounded-xl h-10 font-bold"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="FULL">Full Mock</SelectItem>
                    <SelectItem value="SECTIONAL">Sectional</SelectItem>
                    <SelectItem value="CHAPTER">Chapter Test</SelectItem>
                    <SelectItem value="PYQ">PYQ Archive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Access Protocol</Label>
                <Select value={mockData.accessType} onValueChange={(v: AccessType) => setMockData({...mockData, accessType: v})}>
                  <SelectTrigger className="rounded-xl h-10 font-bold"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="FREE">Free Access</SelectItem>
                    <SelectItem value="PREMIUM">Pass Restricted</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
               <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase text-slate-500">Live Status</p>
                  <p className="text-[8px] font-bold text-slate-400">Published nodes are visible to students.</p>
               </div>
               <Switch checked={mockData.published} onCheckedChange={val => setMockData({...mockData, published: val})} />
            </div>
          </Card>
        </div>

        <div className="lg:col-span-8">
           <Card className="border-none shadow-xl rounded-[2.5rem] bg-white overflow-hidden">
              <Tabs defaultValue="bank">
                 <TabsList className="bg-slate-50 border-b w-full justify-start h-14 px-8 gap-8">
                    <TabsTrigger value="bank" className="font-black uppercase text-[10px]">Bank Query</TabsTrigger>
                    <TabsTrigger value="selected" className="font-black uppercase text-[10px]">Active Assembly ({selectedQuestions.length})</TabsTrigger>
                 </TabsList>
                 <TabsContent value="bank" className="p-8 space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                       <Input placeholder="Search bank nodes..." value={bankFilter.search} onChange={e => setBankFilter({...bankFilter, search: e.target.value})} className="h-10 rounded-xl" />
                       <Select value={bankFilter.subjectId} onValueChange={v => setBankFilter({...bankFilter, subjectId: v})}>
                          <SelectTrigger className="rounded-xl h-10"><SelectValue placeholder="Filter Subject" /></SelectTrigger>
                          <SelectContent>
                             <SelectItem value="all">All Subjects</SelectItem>
                             {subjects?.map((s:any) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                          </SelectContent>
                       </Select>
                    </div>
                    <div className="space-y-2 max-h-[500px] overflow-y-auto custom-scrollbar pr-2">
                       {filteredBank.slice(0, 30).map(q => (
                          <div key={q.id} className="p-4 border rounded-xl flex items-center justify-between hover:bg-slate-50 transition-colors">
                             <div className="min-w-0 flex-1 mr-4">
                                <p className="font-bold text-sm truncate">{q.questionEn}</p>
                                <p className="text-[9px] font-black uppercase text-slate-400">{q.subjectId} • {q.boardId}</p>
                             </div>
                             <Button size="sm" variant="outline" className="rounded-lg h-8 px-4 text-[9px] font-black uppercase" onClick={() => setSelectedQuestions([...selectedQuestions, q])}>Link Node</Button>
                          </div>
                       ))}
                    </div>
                 </TabsContent>
                 <TabsContent value="selected" className="p-8 space-y-2 max-h-[600px] overflow-y-auto custom-scrollbar">
                    {selectedQuestions.map((q, idx) => (
                       <div key={q.id} className="p-4 bg-slate-50 rounded-xl flex items-center justify-between">
                          <span className="text-[10px] font-black text-slate-300 w-6">#{idx+1}</span>
                          <p className="flex-1 font-bold text-xs truncate mx-4">{q.questionEn}</p>
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-rose-500" onClick={() => setSelectedQuestions(selectedQuestions.filter(sq => sq.id !== q.id))}><Trash2 className="h-4 w-4" /></Button>
                       </div>
                    ))}
                 </TabsContent>
              </Tabs>
           </Card>
        </div>
      </div>
    </div>
  )
}
