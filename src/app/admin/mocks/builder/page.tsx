
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
  Filter,
  Layers,
  AlertTriangle,
  FileWarning,
  Plus,
  Trash2,
  BookOpen,
  LayoutGrid,
  ExternalLink,
  Edit,
  Languages
} from "lucide-react"
import { useCollection, useFirestore, useDoc } from "@/firebase"
import { collection, doc, setDoc, serverTimestamp } from "firebase/firestore"
import { useToast } from "@/hooks/use-toast"
import { errorEmitter } from "@/firebase/error-emitter"
import { FirestorePermissionError } from "@/firebase/errors"
import Link from "next/link"

export default function MockBuilderPage() {
  return (
    <Suspense fallback={<div className="h-screen flex items-center justify-center bg-white"><div className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>}>
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
  const { data: boards } = useCollection<any>(useMemo(() => (db ? collection(db, "boards") : null), [db]))
  const { data: exams } = useCollection<any>(useMemo(() => (db ? collection(db, "exams") : null), [db]))
  const { data: questionBank } = useCollection<any>(useMemo(() => (db ? collection(db, "questions") : null), [db]))
  const { data: subjects } = useCollection<any>(useMemo(() => (db ? collection(db, "subjects") : null), [db]))

  const [isPublishing, setIsPublishing] = useState(false)
  const [mockData, setMockData] = useState({
    title: "", 
    boardId: "", 
    examId: "", 
    duration: 120, 
    difficulty: "Medium", 
    mockType: "FULL",
    hasHindi: false
  })

  const [selectedQuestions, setSelectedQuestions] = useState<any[]>([])
  const [bankSearch, setBankSearch] = useState("")
  const [blueprint, setBlueprint] = useState<{subjectId: string, count: number}[]>([])

  const validation = useMemo(() => {
    const errors = []
    if (!mockData.title) errors.push("Series title is mandatory.")
    if (!mockData.examId) errors.push("Target exam vertical must be defined.")
    if (selectedQuestions.length === 0 && blueprint.length === 0) errors.push("No MCQs or Blueprint defined.")
    return {
      isValid: errors.length === 0,
      errors
    }
  }, [mockData, selectedQuestions, blueprint])

  useEffect(() => {
    if (existingMock) {
      setMockData({
        title: existingMock.title || "",
        boardId: existingMock.boardId || "",
        examId: existingMock.examId || "",
        duration: existingMock.duration || 120,
        difficulty: existingMock.difficulty || "Medium",
        mockType: existingMock.mockType || "FULL",
        hasHindi: existingMock.hasHindi || false
      })
    }
  }, [existingMock])

  useEffect(() => {
    if (existingMock && questionBank && existingMock.questionIds) {
      const selected = questionBank.filter((q: any) => existingMock.questionIds.includes(q.id))
      setSelectedQuestions(selected)
    }
  }, [existingMock, questionBank])

  const handleRunBlueprint = () => {
    if (!questionBank || questionBank.length === 0) return
    
    let finalSelection: any[] = []
    
    blueprint.forEach(item => {
      const pool = questionBank.filter(q => q.subjectId === item.subjectId)
      const sampled = pool.sort(() => 0.5 - Math.random()).slice(0, item.count)
      finalSelection = [...finalSelection, ...sampled]
    })

    if (finalSelection.length === 0) {
      toast({ variant: "destructive", title: "Blueprint Empty", description: "Define subjects and counts first." })
      return
    }

    setSelectedQuestions(finalSelection)
    toast({ title: "Syllabus Synced", description: `Successfully assembled ${finalSelection.length} MCQs from ${blueprint.length} sections.` })
  }

  const handlePublish = () => {
    if (!validation.isValid) {
      toast({ variant: "destructive", title: "Audit Failed", description: validation.errors[0] })
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
        errorEmitter.emit("permission-error", new FirestorePermissionError({ 
          path: mockRef.path, 
          operation: isEditing ? 'update' : 'create', 
          requestResourceData: payload 
        }))
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
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-2xl h-14 w-14 border border-slate-200 bg-white shadow-sm">
            <ChevronLeft className="h-7 w-7 text-[#0F172A]" />
          </Button>
          <div className="text-left">
            <h1 className="text-4xl font-black font-headline text-[#0F172A] uppercase tracking-tight">{isEditing ? "Audit Assembler" : "Mock Assembler"}</h1>
            <p className="text-slate-500 mt-1 font-medium">Syllabus-Aligned Workflow active.</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
           <Button className="bg-primary hover:bg-primary/90 gap-3 font-black px-12 h-16 shadow-3xl rounded-2xl uppercase tracking-widest text-[10px]" onClick={handlePublish} disabled={isPublishing || !validation.isValid}>
            <ClipboardCheck className="h-5 w-5" /> {isPublishing ? "Processing..." : (isEditing ? "Update Series" : "Publish Series")}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 text-[#0F172A]">
        <div className="lg:col-span-4 space-y-8 text-left">
          <Card className="border-none shadow-2xl rounded-[2.5rem] overflow-hidden bg-white">
            <CardHeader className="p-10 border-b border-slate-50">
               <CardTitle className="text-xl font-headline font-black uppercase flex items-center gap-3">
                  <Layers className="h-5 w-5 text-primary" /> Series Identity
               </CardTitle>
            </CardHeader>
            <CardContent className="p-10 space-y-8">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Official Title</Label>
                <Input placeholder="e.g. PSSSB Clerk Full Mock 01" value={mockData.title} onChange={e => setMockData({...mockData, title: e.target.value})} className="rounded-xl h-12 bg-slate-50 border-none shadow-inner font-bold" />
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Mock Category</Label>
                <Select value={mockData.mockType} onValueChange={val => setMockData({...mockData, mockType: val as any})}>
                  <SelectTrigger className="rounded-xl h-12 bg-slate-50 border-none shadow-sm font-bold"><SelectValue placeholder="Select Type" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="FULL">Full Length Mock</SelectItem>
                    <SelectItem value="SECTIONAL">Sectional Mock</SelectItem>
                    <SelectItem value="SUBJECT">Subject Wise Mock</SelectItem>
                    <SelectItem value="PYQ">Previous Year Paper (PYQ)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Institutional Language Switch */}
              <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 space-y-4">
                 <div className="flex items-center justify-between">
                    <div className="space-y-1">
                       <p className="font-black text-xs uppercase tracking-widest text-[#0F172A] flex items-center gap-2">
                          <Languages className="h-4 w-4 text-primary" /> Hindi Node
                       </p>
                       <p className="text-[9px] text-slate-400 font-bold uppercase">Required for Central Exams</p>
                    </div>
                    <Switch 
                      checked={mockData.hasHindi} 
                      onCheckedChange={(val) => setMockData({...mockData, hasHindi: val})} 
                    />
                 </div>
              </div>
              
              <div className="grid grid-cols-1 gap-6">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Recruitment Board</Label>
                  <Select value={mockData.boardId} onValueChange={val => setMockData({...mockData, boardId: val})}>
                    <SelectTrigger className="rounded-xl h-12 bg-slate-50 border-none shadow-sm font-bold"><SelectValue placeholder="Select Authority" /></SelectTrigger>
                    <SelectContent className="max-h-[300px]">{boards?.map(b => <SelectItem key={b.id} value={b.id}>{b.abbreviation}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Target Exam Hub</Label>
                  <Select value={mockData.examId} onValueChange={val => setMockData({...mockData, examId: val})}>
                    <SelectTrigger className="rounded-xl h-12 bg-slate-50 border-none shadow-sm font-bold" disabled={!mockData.boardId}><SelectValue placeholder="Select Post" /></SelectTrigger>
                    <SelectContent className="max-h-[300px]">{exams?.filter(e => e.boardId === mockData.boardId).map(e => <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Time (Min)</Label>
                  <Input type="number" value={mockData.duration} onChange={e => setMockData({...mockData, duration: parseInt(e.target.value)})} className="rounded-xl h-12 bg-slate-50 border-none text-center font-black" />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Level</Label>
                  <Select value={mockData.difficulty} onValueChange={val => setMockData({...mockData, difficulty: val})} defaultValue="Medium">
                    <SelectTrigger className="rounded-xl h-12 bg-slate-50 border-none shadow-sm font-bold"><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="Easy">Easy</SelectItem><SelectItem value="Medium">Medium</SelectItem><SelectItem value="Hard">Hard</SelectItem></SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-8">
           <Tabs defaultValue={isEditing ? "linked" : "blueprint"} className="space-y-8">
              <TabsList className="bg-slate-100 border border-slate-200 rounded-2xl p-1.5 h-16 w-fit shadow-xl">
                 {isEditing && (
                    <TabsTrigger value="linked" className="rounded-xl h-full px-8 font-black uppercase text-[10px] gap-3 data-[state=active]:bg-primary data-[state=active]:text-white"><LayoutGrid className="h-4 w-4" /> Linked Questions ({selectedQuestions.length})</TabsTrigger>
                 )}
                 <TabsTrigger value="blueprint" className="rounded-xl h-full px-8 font-black uppercase text-[10px] gap-3 data-[state=active]:bg-primary data-[state=active]:text-white"><Sparkles className="h-4 w-4" /> Smart Blueprint</TabsTrigger>
                 <TabsTrigger value="manual" className="rounded-xl h-full px-8 font-black uppercase text-[10px] gap-3 data-[state=active]:bg-primary data-[state=active]:text-white"><Database className="h-4 w-4" /> Manual Selector</TabsTrigger>
              </TabsList>

              <TabsContent value="linked" className="space-y-6">
                 <div className="grid grid-cols-1 gap-4 max-h-[700px] overflow-y-auto pr-3 custom-scrollbar">
                    {selectedQuestions.map((q, idx) => (
                       <div key={q.id} className="p-8 rounded-[2rem] border border-slate-100 bg-white flex items-center justify-between group hover:border-primary/30 transition-all shadow-xl">
                          <div className="flex items-center gap-6 flex-1">
                             <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center font-black text-xs text-slate-400">
                                {idx + 1}
                             </div>
                             <div className="space-y-2 text-left">
                                <p className="font-bold text-[#0F172A] line-clamp-1">{q.questionEn}</p>
                                <div className="flex gap-4">
                                   <Badge variant="outline" className="text-[9px] font-black uppercase border-slate-100 text-slate-400 tracking-widest">{q.subjectId || 'GK'}</Badge>
                                   <Badge className="text-[9px] font-black uppercase tracking-widest border-none bg-emerald-50 text-emerald-600">KEY: {q.correctAnswer}</Badge>
                                </div>
                             </div>
                          </div>
                          <div className="flex gap-2">
                             <Button asChild variant="ghost" size="icon" className="h-12 w-12 rounded-xl text-primary hover:bg-primary/5">
                                <Link href={`/admin/questions/add?id=${q.id}`} target="_blank"><Edit className="h-5 w-5" /></Link>
                             </Button>
                             <Button onClick={() => setSelectedQuestions(selectedQuestions.filter(s => s.id !== q.id))} variant="ghost" size="icon" className="h-12 w-12 rounded-xl text-rose-400 hover:bg-rose-50">
                                <Trash2 className="h-5 w-5" />
                             </Button>
                          </div>
                       </div>
                    ))}
                    {selectedQuestions.length === 0 && (
                       <div className="py-40 text-center opacity-30 italic">No questions linked to this series.</div>
                    )}
                 </div>
              </TabsContent>

              <TabsContent value="blueprint" className="space-y-6">
                 <Card className="border-none shadow-2xl rounded-[3rem] bg-white p-12">
                    <div className="space-y-10">
                       <div className="flex items-center justify-between">
                          <h3 className="text-2xl font-headline font-black uppercase text-[#0F172A]">Full Mock Pattern</h3>
                          <Button onClick={() => setBlueprint([...blueprint, {subjectId: "", count: 20}])} variant="outline" className="rounded-xl h-12 px-6 border-primary/20 text-primary font-black uppercase text-[10px] gap-2 shadow-sm">
                             <Plus className="h-4 w-4" /> Add Subject Section
                          </Button>
                       </div>

                       <div className="space-y-4">
                          {blueprint.map((item, idx) => (
                             <div key={idx} className="p-6 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-6 group">
                                <div className="flex-1 text-left">
                                   <Label className="text-[9px] font-black uppercase text-slate-400 mb-2 block">Section Subject</Label>
                                   <Select value={item.subjectId} onValueChange={(v) => {
                                      const nb = [...blueprint]; nb[idx].subjectId = v; setBlueprint(nb);
                                   }}>
                                      <SelectTrigger className="h-12 bg-white border-none shadow-sm font-bold"><SelectValue placeholder="Target Subject" /></SelectTrigger>
                                      <SelectContent>{subjects?.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
                                   </Select>
                                </div>
                                <div className="w-32 text-left">
                                   <Label className="text-[9px] font-black uppercase text-slate-400 mb-2 block">Quantity</Label>
                                   <Input type="number" value={item.count} onChange={(e) => {
                                      const nb = [...blueprint]; nb[idx].count = parseInt(e.target.value); setBlueprint(nb);
                                   }} className="h-12 bg-white border-none shadow-sm font-black text-center" />
                                </div>
                                <Button onClick={() => setBlueprint(blueprint.filter((_, i) => i !== idx))} variant="ghost" size="icon" className="mt-6 h-12 w-12 rounded-xl text-rose-400 hover:bg-rose-50"><Trash2 className="h-5 w-5" /></Button>
                             </div>
                          ))}
                          {blueprint.length === 0 && (
                             <div className="py-20 text-center text-slate-300 italic font-medium">No blueprint defined. Add subject sections to build a Full Mock.</div>
                          )}
                       </div>

                       {blueprint.length > 0 && (
                          <Button onClick={handleRunBlueprint} className="w-full h-16 bg-[#0F172A] hover:bg-black text-white font-black uppercase tracking-[0.2em] rounded-2xl gap-3 shadow-3xl shadow-slate-200">
                             <Zap className="h-5 w-5 text-primary" /> Run Blueprint Assembler
                          </Button>
                       )}
                    </div>
                 </Card>
              </TabsContent>

              <TabsContent value="manual" className="space-y-8">
                 <div className="relative group">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-6 w-6 text-slate-400 group-hover:text-primary transition-colors" />
                    <Input className="pl-16 h-16 rounded-[1.5rem] bg-white border-none shadow-2xl text-xl font-medium" placeholder="Search institutional library..." value={bankSearch} onChange={e => setBankSearch(e.target.value)} />
                 </div>

                 <div className="grid grid-cols-1 gap-4 max-h-[650px] overflow-y-auto pr-3 custom-scrollbar">
                    {filteredBank.map(q => {
                      const isAdded = selectedQuestions.find(s => s.id === q.id)
                      return (
                        <div key={q.id} className="p-8 rounded-[2rem] border border-slate-100 bg-white flex items-center justify-between group hover:border-primary/30 transition-all shadow-xl">
                           <div className="space-y-3 flex-1 pr-10 text-left">
                              <p className="font-bold text-[#0F172A] line-clamp-2 leading-relaxed">{q.questionEn}</p>
                              <div className="flex gap-4">
                                 <Badge variant="outline" className="text-[9px] font-black uppercase border-slate-100 text-slate-400 tracking-widest">{q.subjectId || 'GK'}</Badge>
                                 <Badge className={`text-[9px] font-black uppercase tracking-widest border-none ${
                                   q.difficulty === 'hard' ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'
                                 }`}>{q.difficulty}</Badge>
                              </div>
                           </div>
                           <Button 
                            onClick={() => isAdded ? setSelectedQuestions(selectedQuestions.filter(s => s.id !== q.id)) : setSelectedQuestions([...selectedQuestions, q])} 
                            variant={isAdded ? "default" : "outline"}
                            className={`rounded-2xl h-12 px-8 font-black uppercase text-[10px] tracking-[0.2em] transition-all ${isAdded ? 'bg-emerald-600 border-emerald-600 text-white shadow-lg' : 'border-slate-100 hover:border-primary text-slate-400'}`}
                           >
                             {isAdded ? <CheckCircle2 className="h-4 w-4 mr-2" /> : 'Link'} {isAdded ? 'Linked' : 'MCQ'}
                           </Button>
                        </div>
                      )
                    })}
                    {filteredBank.length === 0 && (
                      <div className="text-center py-20 opacity-20 italic">No MCQs detected in library.</div>
                    )}
                 </div>
              </TabsContent>
           </Tabs>
        </div>
      </div>
    </div>
  )
}
