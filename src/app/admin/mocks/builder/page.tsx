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
  Trash2,
  Loader2,
  Settings2,
  Clock,
  BookOpen,
  Target,
  Calendar,
  Zap
} from "lucide-react"
import { useCollection, useFirestore, useDoc } from "@/firebase"
import { collection, doc, setDoc, serverTimestamp } from "firebase/firestore"
import { useToast } from "@/hooks/use-toast"
import { errorEmitter } from "@/firebase/error-emitter"
import { FirestorePermissionError } from "@/firebase/errors"
import { cn } from "@/lib/utils"
import { MockType, CAQuizType } from "@/types"

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
  const { data: questionBank } = useCollection<any>(useMemo(() => (db ? collection(db, "questions") : null), [db]))

  const [isPublishing, setIsPublishing] = useState(false)
  const [mockData, setMockData] = useState<any>({
    title: "", 
    boardId: "", 
    examId: "", 
    duration: 120, 
    difficulty: "Medium", 
    mockType: "FULL" as MockType, 
    examType: "punjab",
    isPremium: false,
    subjectId: "",
    topicId: "",
    year: new Date().getFullYear(),
    caCategory: "Punjab",
    caQuizType: "DAILY" as CAQuizType,
    paperName: ""
  })

  const [selectedQuestions, setSelectedQuestions] = useState<any[]>([])
  const [bankSearch, setBankSearch] = useState("")

  useEffect(() => {
    if (existingMock) {
      setMockData({
        ...existingMock,
        mockType: existingMock.mockType || "FULL"
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
    if (!mockData.title || !mockData.boardId) {
      toast({ variant: "destructive", title: "Audit Failed", description: "Title and Board are mandatory." })
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
      author: "Institutional Pattern Manager"
    }

    setDoc(mockRef, payload, { merge: true })
      .then(() => {
        toast({ title: isEditing ? "Series Updated" : "Series Deployed", description: "Test series is now live." })
        router.push("/admin/mocks")
      })
      .catch(async () => {
        errorEmitter.emit("permission-error", new FirestorePermissionError({ path: mockRef.path, operation: 'write' }))
      })
      .finally(() => setIsPublishing(false))
  }

  const filteredBank = useMemo(() => {
    if (!questionBank) return []
    return bankSearch.length > 1 
      ? questionBank.filter(q => 
          (q.questionEn || "").toLowerCase().includes(bankSearch.toLowerCase()) ||
          (q.subjectId || "").toLowerCase().includes(bankSearch.toLowerCase())
        )
      : questionBank.slice(0, 50)
  }, [bankSearch, questionBank])

  return (
    <div className="space-y-10 pb-20 max-w-7xl mx-auto text-[#0F172A]">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
        <div className="flex items-center gap-6">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-2xl h-14 w-14 border border-slate-200 bg-white"><ChevronLeft className="h-7 w-7 text-[#0F172A]" /></Button>
          <div className="text-left">
            <h1 className="text-4xl font-black font-headline text-[#0F172A] uppercase">Test Management</h1>
            <p className="text-slate-500 mt-1 font-medium">Create Full Mocks, Subject Tests, Sectionals, PYQs, and CA Quizzes.</p>
          </div>
        </div>
        <Button className="bg-primary hover:bg-primary/90 gap-3 font-black px-12 h-16 shadow-2xl rounded-2xl uppercase tracking-widest text-[10px]" onClick={handlePublish} disabled={isPublishing}>
          <ClipboardCheck className="h-5 w-5" /> {isPublishing ? "Syncing..." : "Deploy Test Series"}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-5 space-y-8 text-left">
          <Card className="border-none shadow-2xl rounded-[3rem] bg-white overflow-hidden">
            <div className="h-2 w-full bg-primary" />
            <CardHeader className="p-10 border-b border-slate-50">
               <CardTitle className="text-xl font-headline font-black uppercase flex items-center gap-3"><Settings2 className="h-5 w-5 text-primary" /> Configuration Hub</CardTitle>
            </CardHeader>
            <CardContent className="p-10 space-y-8">
              <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Series Title</Label>
                <Input placeholder="e.g. PSSSB Clerk Full Mock 01" value={mockData.title} onChange={e => setMockData({...mockData, title: e.target.value})} className="rounded-xl h-14 bg-slate-50 border-none font-bold text-lg" />
              </div>

              <div className="grid grid-cols-2 gap-6">
                 <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Mock Type</Label>
                    <Select value={mockData.mockType} onValueChange={(v: MockType) => setMockData({...mockData, mockType: v})}>
                       <SelectTrigger className="rounded-xl h-12 bg-slate-50 border-none font-bold"><SelectValue /></SelectTrigger>
                       <SelectContent>
                          <SelectItem value="FULL">Full Exam Mock</SelectItem>
                          <SelectItem value="SUBJECT">Subject Mastery</SelectItem>
                          <SelectItem value="SECTIONAL">Sectional / Topic</SelectItem>
                          <SelectItem value="PYQ">Previous Year Paper</SelectItem>
                          <SelectItem value="CA_QUIZ">Current Affairs Quiz</SelectItem>
                       </SelectContent>
                    </Select>
                 </div>
                 <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Difficulty</Label>
                    <Select value={mockData.difficulty} onValueChange={v => setMockData({...mockData, difficulty: v})}>
                       <SelectTrigger className="rounded-xl h-12 bg-slate-50 border-none font-bold"><SelectValue /></SelectTrigger>
                       <SelectContent>
                          <SelectItem value="Easy">Aspirant (Easy)</SelectItem>
                          <SelectItem value="Medium">Standard (Medium)</SelectItem>
                          <SelectItem value="Hard">Advanced (Hard)</SelectItem>
                       </SelectContent>
                    </Select>
                 </div>
              </div>

              {mockData.mockType === 'PYQ' && (
                <div className="grid grid-cols-2 gap-6 p-6 bg-slate-50 rounded-2xl border border-slate-100">
                   <div className="space-y-3">
                      <Label className="text-[10px] font-black uppercase text-primary tracking-widest">Exam Year</Label>
                      <Input type="number" value={mockData.year} onChange={e => setMockData({...mockData, year: parseInt(e.target.value)})} className="rounded-xl bg-white border-none font-black" />
                   </div>
                   <div className="space-y-3">
                      <Label className="text-[10px] font-black uppercase text-primary tracking-widest">Paper/Shift Name</Label>
                      <Input placeholder="e.g. Morning Shift" value={mockData.paperName} onChange={e => setMockData({...mockData, paperName: e.target.value})} className="rounded-xl bg-white border-none font-bold" />
                   </div>
                </div>
              )}

              {mockData.mockType === 'CA_QUIZ' && (
                <div className="grid grid-cols-2 gap-6 p-6 bg-orange-50 rounded-2xl border border-orange-100">
                   <div className="space-y-3">
                      <Label className="text-[10px] font-black uppercase text-primary tracking-widest">CA Category</Label>
                      <Select value={mockData.caCategory} onValueChange={v => setMockData({...mockData, caCategory: v})}>
                        <SelectTrigger className="rounded-xl bg-white border-none font-bold"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Punjab">Punjab Current Affairs</SelectItem>
                          <SelectItem value="India">India Current Affairs</SelectItem>
                          <SelectItem value="Economy">Economy & Policy</SelectItem>
                        </SelectContent>
                      </Select>
                   </div>
                   <div className="space-y-3">
                      <Label className="text-[10px] font-black uppercase text-primary tracking-widest">Quiz Cycle</Label>
                      <Select value={mockData.caQuizType} onValueChange={(v: CAQuizType) => setMockData({...mockData, caQuizType: v})}>
                        <SelectTrigger className="rounded-xl bg-white border-none font-bold"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="DAILY">Daily Quiz</SelectItem>
                          <SelectItem value="WEEKLY">Weekly Round-up</SelectItem>
                          <SelectItem value="MONTHLY">Monthly Capsule</SelectItem>
                        </SelectContent>
                      </Select>
                   </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Authority</Label>
                  <Select value={mockData.boardId} onValueChange={val => setMockData({...mockData, boardId: val})}>
                    <SelectTrigger className="rounded-xl h-12 bg-slate-50 border-none font-bold"><SelectValue placeholder="Select Board" /></SelectTrigger>
                    <SelectContent>{boards?.map((b:any) => <SelectItem key={b.id} value={b.id}>{b.abbreviation}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Manual Duration (Mins)</Label>
                  <Input type="number" value={mockData.duration} onChange={e => setMockData({...mockData, duration: parseInt(e.target.value) || 0})} className="rounded-xl h-12 bg-slate-50 border-none font-black text-lg" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-7 space-y-8">
           <Tabs defaultValue="manual" className="space-y-8">
              <TabsList className="bg-slate-100 rounded-3xl p-1.5 h-16 w-fit shadow-lg">
                 <TabsTrigger value="manual" className="rounded-2xl h-full px-10 font-black uppercase text-[10px] gap-3 data-[state=active]:bg-[#0F172A] data-[state=active]:text-white"><Target className="h-4 w-4" /> Link Questions ({selectedQuestions.length})</TabsTrigger>
              </TabsList>

              <TabsContent value="manual" className="space-y-8">
                 <div className="relative group">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-6 w-6 text-slate-400" />
                    <Input className="pl-16 h-20 rounded-[2.5rem] bg-white border-none shadow-2xl text-xl font-medium" placeholder="Search question bank..." value={bankSearch} onChange={e => setBankSearch(e.target.value)} />
                 </div>
                 <div className="grid grid-cols-1 gap-4 max-h-[600px] overflow-y-auto pr-4 custom-scrollbar">
                    {filteredBank.map((q:any) => {
                      const isAdded = selectedQuestions.find(s => s.id === q.id)
                      return (
                        <div key={q.id} className="p-8 rounded-[2.5rem] border border-slate-100 bg-white flex items-center justify-between group hover:border-primary/30 transition-all shadow-xl">
                           <div className="flex-1 pr-8 text-left space-y-2">
                             <p className="font-bold text-[#0F172A] line-clamp-2 text-lg leading-tight">{q.questionEn}</p>
                             <div className="flex items-center gap-4">
                                <span className="text-[10px] font-black text-primary uppercase tracking-widest">{q.subjectId}</span>
                                <Badge className="bg-slate-50 text-slate-400 border-none text-[8px]">{q.difficulty}</Badge>
                             </div>
                           </div>
                           <Button 
                              onClick={() => isAdded ? setSelectedQuestions(selectedQuestions.filter(s => s.id !== q.id)) : setSelectedQuestions([...selectedQuestions, q])} 
                              variant={isAdded ? "default" : "outline"} 
                              className={cn("rounded-2xl h-14 px-10 font-black uppercase text-[10px] tracking-widest transition-all", isAdded ? 'bg-emerald-600 border-emerald-600 text-white shadow-xl shadow-emerald-500/20' : 'text-slate-400 border-slate-100')}
                            >
                             {isAdded ? <CheckCircle2 className="h-5 w-5 mr-3" /> : ''} {isAdded ? 'Linked' : 'Link MCQ'}
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
