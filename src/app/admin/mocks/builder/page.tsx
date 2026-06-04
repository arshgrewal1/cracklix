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
import { 
  ChevronLeft, 
  Database, 
  ClipboardCheck,
  Search,
  CheckCircle2,
  Layers,
  Trash2,
  Globe,
  Loader2,
  Settings2,
  Target,
  Clock,
  Calendar,
  FileText,
  Zap,
  BookOpen
} from "lucide-react"
import { useCollection, useFirestore, useDoc } from "@/firebase"
import { collection, doc, setDoc, serverTimestamp, query, where } from "firebase/firestore"
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
  const { data: exams } = useCollection<any>(useMemo(() => (db ? collection(db, "exams") : null), [db]))
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
        title: existingMock.title || "",
        boardId: existingMock.boardId || "",
        examId: existingMock.examId || "",
        duration: existingMock.duration || 120,
        difficulty: existingMock.difficulty || "Medium",
        mockType: (existingMock.mockType as MockType) || "FULL",
        examType: existingMock.examType || "punjab",
        isPremium: existingMock.isPremium || false,
        subjectId: existingMock.subjectId || "",
        topicId: existingMock.topicId || "",
        year: existingMock.year || new Date().getFullYear(),
        caCategory: existingMock.caCategory || "Punjab",
        caQuizType: existingMock.caQuizType || "DAILY",
        paperName: existingMock.paperName || ""
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
    if (!mockData.title) {
      toast({ variant: "destructive", title: "Audit Failed", description: "Title is mandatory." })
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
        toast({ title: isEditing ? "Series Updated" : "Series Deployed", description: "Test series is now live in the repository." })
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
      ? questionBank.filter(q => 
          (q.questionEn || "").toLowerCase().includes(bankSearch.toLowerCase()) ||
          (q.subjectId || "").toLowerCase().includes(bankSearch.toLowerCase()) ||
          (q.topicId || "").toLowerCase().includes(bankSearch.toLowerCase())
        )
      : questionBank.slice(0, 50)
  }, [bankSearch, questionBank])

  return (
    <div className="space-y-10 pb-20 max-w-7xl mx-auto text-[#0F172A]">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
        <div className="flex items-center gap-6">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-2xl h-14 w-14 border border-slate-200 bg-white shadow-sm"><ChevronLeft className="h-7 w-7 text-[#0F172A]" /></Button>
          <div className="text-left">
            <h1 className="text-4xl font-black font-headline text-[#0F172A] uppercase">Test Management</h1>
            <p className="text-slate-500 mt-1 font-medium">Configure Full Mocks, Subject Tests, and PYQs.</p>
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
               <CardTitle className="text-xl font-headline font-black uppercase flex items-center gap-3"><Settings2 className="h-5 w-5 text-primary" /> Test Configuration</CardTitle>
            </CardHeader>
            <CardContent className="p-10 space-y-8">
              <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Series Title</Label>
                <Input placeholder="e.g. PSSSB Clerk Full Mock 01" value={mockData.title} onChange={e => setMockData({...mockData, title: e.target.value})} className="rounded-xl h-14 bg-slate-50 border-none font-bold text-lg" />
              </div>

              <div className="grid grid-cols-2 gap-6">
                 <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Audit Type</Label>
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

              {/* Conditional Fields Based on Type */}
              {mockData.mockType === 'PYQ' && (
                <div className="grid grid-cols-2 gap-6 p-6 bg-slate-50 rounded-2xl border border-slate-100">
                   <div className="space-y-3">
                      <Label className="text-[10px] font-black uppercase text-primary tracking-widest">Exam Year</Label>
                      <Input type="number" value={mockData.year} onChange={e => setMockData({...mockData, year: parseInt(e.target.value)})} className="rounded-xl bg-white border-none font-black" />
                   </div>
                   <div className="space-y-3">
                      <Label className="text-[10px] font-black uppercase text-primary tracking-widest">Paper Name</Label>
                      <Input placeholder="e.g. Morning Shift" value={mockData.paperName} onChange={e => setMockData({...mockData, paperName: e.target.value})} className="rounded-xl bg-white border-none font-bold" />
                   </div>
                </div>
              )}

              {mockData.mockType === 'SUBJECT' && (
                <div className="space-y-3 p-6 bg-slate-50 rounded-2xl border border-slate-100">
                   <Label className="text-[10px] font-black uppercase text-primary tracking-widest">Target Subject</Label>
                   <Select value={mockData.subjectId} onValueChange={v => setMockData({...mockData, subjectId: v})}>
                      <SelectTrigger className="rounded-xl bg-white border-none font-bold"><SelectValue placeholder="Select Subject" /></SelectTrigger>
                      <SelectContent>{subjects?.map((s:any) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
                   </Select>
                </div>
              )}

              {mockData.mockType === 'SECTIONAL' && (
                <div className="space-y-3 p-6 bg-slate-50 rounded-2xl border border-slate-100">
                   <Label className="text-[10px] font-black uppercase text-primary tracking-widest">Target Topic</Label>
                   <Input placeholder="e.g. Blood Relations" value={mockData.topicId} onChange={e => setMockData({...mockData, topicId: e.target.value})} className="rounded-xl bg-white border-none font-bold" />
                </div>
              )}

              {mockData.mockType === 'CA_QUIZ' && (
                <div className="grid grid-cols-2 gap-6 p-6 bg-slate-50 rounded-2xl border border-slate-100">
                   <div className="space-y-3">
                      <Label className="text-[10px] font-black uppercase text-primary tracking-widest">CA Category</Label>
                      <Select value={mockData.caCategory} onValueChange={v => setMockData({...mockData, caCategory: v})}>
                         <SelectTrigger className="rounded-xl bg-white border-none font-bold"><SelectValue /></SelectTrigger>
                         <SelectContent>
                            {["Punjab", "India", "International", "Sports", "Economy", "Schemes"].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                         </SelectContent>
                      </Select>
                   </div>
                   <div className="space-y-3">
                      <Label className="text-[10px] font-black uppercase text-primary tracking-widest">Quiz Cycle</Label>
                      <Select value={mockData.caQuizType} onValueChange={(v: CAQuizType) => setMockData({...mockData, caQuizType: v})}>
                         <SelectTrigger className="rounded-xl bg-white border-none font-bold"><SelectValue /></SelectTrigger>
                         <SelectContent>
                            <SelectItem value="DAILY">Daily Audit</SelectItem>
                            <SelectItem value="WEEKLY">Weekly Audit</SelectItem>
                            <SelectItem value="MONTHLY">Monthly Audit</SelectItem>
                         </SelectContent>
                      </Select>
                   </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Board Authority</Label>
                  <Select value={mockData.boardId} onValueChange={val => setMockData({...mockData, boardId: val})}>
                    <SelectTrigger className="rounded-xl h-12 bg-slate-50 border-none font-bold"><SelectValue placeholder="Select Board" /></SelectTrigger>
                    <SelectContent>{boards?.map((b:any) => <SelectItem key={b.id} value={b.id}>{b.abbreviation}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Target Exam</Label>
                  <Select value={mockData.examId} onValueChange={val => setMockData({...mockData, examId: val})}>
                    <SelectTrigger className="rounded-xl h-12 bg-slate-50 border-none font-bold" disabled={!mockData.boardId}><SelectValue placeholder="Select Exam" /></SelectTrigger>
                    <SelectContent>{exams?.filter((e:any) => e.boardId === mockData.boardId).map((e:any) => <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                 <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Manual Duration (Mins)</Label>
                    <div className="relative">
                       <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary" />
                       <Input type="number" value={mockData.duration} onChange={e => setMockData({...mockData, duration: parseInt(e.target.value) || 0})} className="pl-10 rounded-xl bg-slate-50 border-none font-black text-lg" />
                    </div>
                    <p className="text-[8px] text-slate-400 font-bold uppercase ml-1">Enter any value (30, 45, 120, 150...)</p>
                 </div>
                 <div className="flex items-center justify-between p-6 bg-primary/5 rounded-2xl border border-primary/10 mt-6">
                    <div className="space-y-1">
                       <p className="text-[10px] font-black uppercase text-primary">Premium Gate</p>
                       <p className="text-[8px] text-slate-400 font-bold uppercase">Requires Gold Pass</p>
                    </div>
                    <input type="checkbox" checked={mockData.isPremium} onChange={e => setMockData({...mockData, isPremium: e.target.checked})} className="h-6 w-6 accent-primary cursor-pointer" />
                 </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-7 space-y-8">
           <Tabs defaultValue="linked" className="space-y-8">
              <TabsList className="bg-slate-100 rounded-3xl p-1.5 h-16 w-fit shadow-lg">
                 <TabsTrigger value="linked" className="rounded-2xl h-full px-10 font-black uppercase text-[10px] gap-3 data-[state=active]:bg-[#0F172A] data-[state=active]:text-white"><Layers className="h-4 w-4" /> Linked Questions ({selectedQuestions.length})</TabsTrigger>
                 <TabsTrigger value="manual" className="rounded-2xl h-full px-10 font-black uppercase text-[10px] gap-3 data-[state=active]:bg-[#0F172A] data-[state=active]:text-white"><Target className="h-4 w-4" /> Add from Repository</TabsTrigger>
              </TabsList>

              <TabsContent value="linked" className="space-y-4">
                 {selectedQuestions.length > 0 ? selectedQuestions.map((q, idx) => (
                    <div key={q.id} className="p-8 rounded-[2.5rem] border border-slate-100 bg-white flex items-center justify-between group hover:border-primary/30 transition-all shadow-xl">
                       <div className="flex items-center gap-6 text-left">
                          <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center font-black text-xs text-slate-400">{idx + 1}</div>
                          <div className="space-y-1">
                             <p className="font-bold text-[#0F172A] line-clamp-1 text-lg">{q.questionEn || q.questionPa}</p>
                             <div className="flex gap-3">
                                <Badge variant="outline" className="text-[8px] font-black uppercase text-primary border-primary/20">{q.subjectId}</Badge>
                                {q.topicId && <Badge variant="outline" className="text-[8px] font-black uppercase text-slate-400 border-slate-200">{q.topicId}</Badge>}
                             </div>
                          </div>
                       </div>
                       <Button onClick={() => setSelectedQuestions(selectedQuestions.filter(s => s.id !== q.id))} variant="ghost" size="icon" className="h-12 w-12 rounded-xl text-rose-400 hover:bg-rose-50"><Trash2 className="h-6 w-6" /></Button>
                    </div>
                 )) : (
                    <div className="py-32 text-center bg-white rounded-[4rem] border-2 border-dashed border-slate-100 space-y-6">
                       <BookOpen className="h-16 w-16 mx-auto opacity-10" />
                       <div className="space-y-1">
                          <p className="font-black font-headline text-xl text-slate-300 uppercase">Audit Map Empty</p>
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Link MCQs from the global repository to build this series.</p>
                       </div>
                    </div>
                 )}
              </TabsContent>

              <TabsContent value="manual" className="space-y-8">
                 <div className="relative group">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-6 w-6 text-slate-400" />
                    <Input className="pl-16 h-20 rounded-[2.5rem] bg-white border-none shadow-2xl text-xl font-medium focus-visible:ring-primary" placeholder="Search standalone bank by question, subject, or topic..." value={bankSearch} onChange={e => setBankSearch(e.target.value)} />
                 </div>
                 <div className="grid grid-cols-1 gap-4 max-h-[700px] overflow-y-auto pr-4 custom-scrollbar">
                    {filteredBank.map((q:any) => {
                      const isAdded = selectedQuestions.find(s => s.id === q.id)
                      return (
                        <div key={q.id} className="p-8 rounded-[2.5rem] border border-slate-100 bg-white flex items-center justify-between group hover:border-primary/30 transition-all shadow-xl">
                           <div className="flex-1 pr-8 text-left space-y-2">
                             <p className="font-bold text-[#0F172A] line-clamp-2 text-lg leading-tight">{q.questionEn || q.questionPa}</p>
                             <div className="flex items-center gap-4">
                                <span className="text-[10px] font-black text-primary uppercase tracking-widest">{q.subjectId}</span>
                                {q.topicId && <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">• {q.topicId}</span>}
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
