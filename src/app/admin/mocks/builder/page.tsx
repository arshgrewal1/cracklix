
"use client"

import { useState, useMemo, useEffect } from "react"
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
  Zap,
  Sparkles,
  ClipboardCheck,
  Search,
  CheckCircle2,
  Filter,
  Layers,
  AlertTriangle
} from "lucide-react"
import { useCollection, useFirestore, useDoc } from "@/firebase"
import { collection, doc, setDoc, serverTimestamp } from "firebase/firestore"
import { useToast } from "@/hooks/use-toast"
import { errorEmitter } from "@/firebase/error-emitter"
import { FirestorePermissionError } from "@/firebase/errors"

/**
 * @fileOverview Final Smart Mock Builder.
 * Features: Blueprint-driven Auto-Assembly & Manual Library Selection.
 * Supports: Creation and Editing of existing mocks.
 */

export default function MockBuilderPage() {
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
    title: "", boardId: "", examId: "", duration: 120, difficulty: "Medium", mockType: "FULL" as any
  })

  const [selectedQuestions, setSelectedQuestions] = useState<any[]>([])
  const [bankSearch, setBankSearch] = useState("")

  const [smartConfig, setSmartConfig] = useState({ 
    count: 100, 
    difficulty: "all",
    subjectId: "all"
  })

  // Sync existing mock data if editing
  useEffect(() => {
    if (existingMock) {
      setMockData({
        title: existingMock.title || "",
        boardId: existingMock.boardId || "",
        examId: existingMock.examId || "",
        duration: existingMock.duration || 120,
        difficulty: existingMock.difficulty || "Medium",
        mockType: existingMock.mockType || "FULL"
      })
    }
  }, [existingMock])

  // Sync selected questions when questionBank and existingMock are both available
  useEffect(() => {
    if (existingMock && questionBank && existingMock.questionIds) {
      const selected = questionBank.filter((q: any) => existingMock.questionIds.includes(q.id))
      setSelectedQuestions(selected)
    }
  }, [existingMock, questionBank])

  const handleAutoPick = () => {
    if (!questionBank || questionBank.length === 0) {
      toast({ variant: "destructive", title: "Bank Empty", description: "Initialize institutional question bank first." })
      return
    }

    let pool = [...questionBank]
    
    // Filtering based on institutional blueprint
    if (smartConfig.difficulty !== 'all') {
      pool = pool.filter(q => q.difficulty === smartConfig.difficulty)
    }
    if (smartConfig.subjectId !== 'all') {
      pool = pool.filter(q => q.subjectId === smartConfig.subjectId)
    }

    if (pool.length < smartConfig.count) {
      toast({ 
        variant: "destructive", 
        title: "Blueprint Shortfall", 
        description: `Only ${pool.length} items match parameters. Target: ${smartConfig.count}` 
      })
      return
    }

    // Shuffle and extraction
    const selected = pool.sort(() => 0.5 - Math.random()).slice(0, smartConfig.count)
    setSelectedQuestions(selected)
    
    toast({ 
      title: "Assembly Complete", 
      description: `Structured ${selected.length} high-fidelity questions automatically.` 
    })
  }

  const handlePublish = () => {
    if (!mockData.title || !mockData.examId || selectedQuestions.length === 0) {
      toast({ variant: "destructive", title: "Audit Failed", description: "Title, Exam hub, and linked Questions are mandatory." })
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
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-2xl h-14 w-14 border border-foreground/5 bg-card/30">
            <ChevronLeft className="h-7 w-7" />
          </Button>
          <div>
            <h1 className="text-4xl font-black font-headline text-primary uppercase tracking-tight">{isEditing ? "Audit Assembler" : "Smart Assembler"}</h1>
            <p className="text-muted-foreground mt-1">Institutional Hub: Blueprint-driven mock generation.</p>
          </div>
        </div>
        <Button className="bg-primary hover:bg-primary/90 gap-3 font-black px-12 h-16 shadow-3xl rounded-2xl uppercase tracking-widest text-[10px]" onClick={handlePublish} disabled={isPublishing}>
          <ClipboardCheck className="h-5 w-5" /> {isPublishing ? "Processing..." : (isEditing ? "Update Series" : "Publish Series")}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-4 space-y-8">
          <Card className="border-foreground/5 bg-card/50 shadow-2xl rounded-[2.5rem] overflow-hidden">
            <CardHeader className="p-10 border-b border-white/5 bg-muted/20">
               <CardTitle className="text-xl font-headline font-black uppercase flex items-center gap-3">
                  <Layers className="h-5 w-5 text-primary" /> Series Identity
               </CardTitle>
            </CardHeader>
            <CardContent className="p-10 space-y-8">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Official Title</Label>
                <Input placeholder="e.g. PSSSB Clerk Mock 01" value={mockData.title} onChange={e => setMockData({...mockData, title: e.target.value})} className="rounded-xl h-12 bg-background border-none shadow-inner font-bold" />
              </div>
              
              <div className="grid grid-cols-1 gap-6">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Recruitment Board</Label>
                  <Select value={mockData.boardId} onValueChange={val => setMockData({...mockData, boardId: val})}>
                    <SelectTrigger className="rounded-xl h-12 bg-background border-none shadow-sm"><SelectValue placeholder="Select Authority" /></SelectTrigger>
                    <SelectContent className="max-h-[300px]">{boards?.map(b => <SelectItem key={b.id} value={b.id}>{b.abbreviation}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Target Exam Hub</Label>
                  <Select value={mockData.examId} onValueChange={val => setMockData({...mockData, examId: val})}>
                    <SelectTrigger className="rounded-xl h-12 bg-background border-none shadow-sm" disabled={!mockData.boardId}><SelectValue placeholder="Select Post" /></SelectTrigger>
                    <SelectContent className="max-h-[300px]">{exams?.filter(e => e.boardId === mockData.boardId).map(e => <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Audit Time (Min)</Label>
                  <Input type="number" value={mockData.duration} onChange={e => setMockData({...mockData, duration: parseInt(e.target.value)})} className="rounded-xl h-12 bg-background border-none text-center font-black" />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Difficulty</Label>
                  <Select value={mockData.difficulty} onValueChange={val => setMockData({...mockData, difficulty: val})} defaultValue="Medium">
                    <SelectTrigger className="rounded-xl h-12 bg-background border-none shadow-sm"><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="Easy">Easy</SelectItem><SelectItem value="Medium">Medium</SelectItem><SelectItem value="Hard">Hard</SelectItem></SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none bg-primary/5 rounded-[2.5rem] p-10 space-y-4 text-center border border-primary/10">
             <Database className="h-10 w-10 text-primary mx-auto opacity-40" />
             <div>
                <p className="text-6xl font-black font-headline text-slate-100 tracking-tighter">{selectedQuestions.length}</p>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mt-2">Questions In Registry</p>
             </div>
          </Card>
        </div>

        <div className="lg:col-span-8">
           <Tabs defaultValue="manual" className="space-y-8">
              <TabsList className="bg-white/5 border border-white/5 rounded-2xl p-1.5 h-16 w-fit">
                 <TabsTrigger value="smart" className="rounded-xl h-full px-8 font-black uppercase text-[10px] gap-3 data-[state=active]:bg-primary data-[state=active]:text-white"><Sparkles className="h-4 w-4" /> Auto Assembler</TabsTrigger>
                 <TabsTrigger value="manual" className="rounded-xl h-full px-8 font-black uppercase text-[10px] gap-3 data-[state=active]:bg-primary data-[state=active]:text-white"><Database className="h-4 w-4" /> Library Selector</TabsTrigger>
              </TabsList>

              <TabsContent value="smart" className="space-y-6">
                 <Card className="border-none shadow-3xl rounded-[3rem] bg-card/50 p-16 text-center space-y-12">
                    <div className="max-w-md mx-auto space-y-10">
                       <div className="h-24 w-24 bg-primary/10 rounded-[2.5rem] flex items-center justify-center mx-auto text-primary shadow-2xl">
                          <Zap className="h-12 w-12" />
                       </div>
                       <div className="space-y-3">
                          <h3 className="text-4xl font-headline font-black text-white uppercase tracking-tight">Extraction Engine</h3>
                          <p className="text-slate-400 font-medium">Generate high-fidelity mocks by defining blueprint parameters.</p>
                       </div>
                       
                       <div className="grid grid-cols-1 gap-8 text-left">
                          <div className="space-y-3">
                             <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Target Section</Label>
                             <Select onValueChange={val => setSmartConfig({...smartConfig, subjectId: val})} defaultValue="all">
                                <SelectTrigger className="h-14 rounded-xl bg-background border-none shadow-inner"><SelectValue /></SelectTrigger>
                                <SelectContent className="max-h-[300px]">
                                   <SelectItem value="all">Mixed (Balanced Pattern)</SelectItem>
                                   {subjects?.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                                </SelectContent>
                             </Select>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-8">
                             <div className="space-y-3">
                                <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Quantity</Label>
                                <Input type="number" value={smartConfig.count} onChange={e => setSmartConfig({...smartConfig, count: parseInt(e.target.value)})} className="h-14 rounded-xl bg-background border-none shadow-inner text-2xl font-black text-center" />
                             </div>
                             <div className="space-y-3">
                                <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Audit Level</Label>
                                <Select onValueChange={val => setSmartConfig({...smartConfig, difficulty: val})} defaultValue="all">
                                   <SelectTrigger className="h-14 rounded-xl bg-background border-none shadow-inner"><SelectValue /></SelectTrigger>
                                   <SelectContent><SelectItem value="all">Mixed Levels</SelectItem><SelectItem value="easy">Easy</SelectItem><SelectItem value="medium">Medium</SelectItem><SelectItem value="hard">Hard</SelectItem></SelectContent>
                                </Select>
                             </div>
                          </div>
                       </div>

                       <Button onClick={handleAutoPick} className="w-full h-20 bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-[0.3em] rounded-3xl gap-4 shadow-4xl shadow-primary/20 transition-all active:scale-95">
                          <Zap className="h-6 w-6 fill-current" /> Run Assembler
                       </Button>
                    </div>
                 </Card>
              </TabsContent>

              <TabsContent value="manual" className="space-y-8">
                 <div className="relative group">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-6 w-6 text-slate-500 group-hover:text-primary transition-colors" />
                    <Input className="pl-16 h-16 rounded-[1.5rem] bg-card/50 border-none shadow-2xl text-xl font-medium" placeholder="Search institutional library..." value={bankSearch} onChange={e => setBankSearch(e.target.value)} />
                 </div>

                 <div className="grid grid-cols-1 gap-4 max-h-[650px] overflow-y-auto pr-3 custom-scrollbar">
                    {filteredBank.map(q => {
                      const isAdded = selectedQuestions.find(s => s.id === q.id)
                      return (
                        <div key={q.id} className="p-8 rounded-[2rem] border border-white/5 bg-card/30 flex items-center justify-between group hover:border-primary/30 transition-all shadow-xl">
                           <div className="space-y-3 flex-1 pr-10">
                              <p className="font-bold text-slate-200 line-clamp-2 leading-relaxed">{q.questionEn}</p>
                              <div className="flex gap-4">
                                 <Badge variant="outline" className="text-[9px] font-black uppercase border-white/5 text-slate-400 tracking-widest">{q.subjectId || 'GK'}</Badge>
                                 <Badge className={`text-[9px] font-black uppercase tracking-widest border-none ${
                                   q.difficulty === 'hard' ? 'bg-rose-500/10 text-rose-500' : 'bg-emerald-500/10 text-emerald-500'
                                 }`}>{q.difficulty}</Badge>
                              </div>
                           </div>
                           <Button 
                            onClick={() => isAdded ? setSelectedQuestions(selectedQuestions.filter(s => s.id !== q.id)) : setSelectedQuestions([...selectedQuestions, q])} 
                            variant={isAdded ? "default" : "outline"}
                            className={`rounded-2xl h-12 px-8 font-black uppercase text-[10px] tracking-[0.2em] transition-all ${isAdded ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-white/10 hover:border-primary'}`}
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
