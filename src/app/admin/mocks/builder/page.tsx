
"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  ChevronLeft, 
  Plus, 
  Search, 
  Trash2, 
  Database, 
  Save, 
  Zap,
  Sparkles,
  Settings,
  Filter
} from "lucide-react"
import { useCollection, useFirestore } from "@/firebase"
import { collection, doc, setDoc, serverTimestamp } from "firebase/firestore"
import { useToast } from "@/hooks/use-toast"
import { errorEmitter } from "@/firebase/error-emitter"
import { FirestorePermissionError } from "@/firebase/errors"

export default function MockBuilderPage() {
  const router = useRouter()
  const db = useFirestore()
  const { toast } = useToast()

  // --- Data Fetching ---
  const { data: boards } = useCollection<any>(useMemo(() => (db ? collection(db, "boards") : null), [db]))
  const { data: exams } = useCollection<any>(useMemo(() => (db ? collection(db, "exams") : null), [db]))
  const { data: questionBank } = useCollection<any>(useMemo(() => (db ? collection(db, "questions") : null), [db]))
  const { data: subjects } = useCollection<any>(useMemo(() => (db ? collection(db, "subjects") : null), [db]))

  // --- State ---
  const [isPublishing, setIsPublishing] = useState(false)
  const [mockData, setMockData] = useState({
    title: "", boardId: "", examId: "", duration: 120, difficulty: "Medium", mockType: "FULL" as any
  })

  const [selectedQuestions, setSelectedQuestions] = useState<any[]>([])
  const [bankSearch, setBankSearch] = useState("")

  const [smartConfig, setSmartConfig] = useState({ 
    count: 100, 
    difficulty: "medium",
    subjectId: "all"
  })

  // --- Handlers ---
  const handleAutoPick = () => {
    if (!questionBank || questionBank.length === 0) {
      toast({ variant: "destructive", title: "Bank Empty", description: "No questions available in the repository." })
      return
    }

    let pool = [...questionBank]
    
    // Apply filters
    if (smartConfig.difficulty !== 'all') {
      pool = pool.filter(q => q.difficulty === smartConfig.difficulty)
    }
    if (smartConfig.subjectId !== 'all') {
      pool = pool.filter(q => q.subjectId === smartConfig.subjectId)
    }

    if (pool.length < smartConfig.count) {
      toast({ 
        variant: "destructive", 
        title: "Insufficient Data", 
        description: `Only ${pool.length} questions match these criteria. Required: ${smartConfig.count}` 
      })
      return
    }

    const shuffled = pool.sort(() => 0.5 - Math.random())
    const selected = shuffled.slice(0, smartConfig.count)
    setSelectedQuestions(selected)
    
    toast({ 
      title: "Smart Assembly Complete", 
      description: `Assembled ${selected.length} high-fidelity questions automatically.` 
    })
  }

  const handleAddFromBank = (q: any) => {
    if (selectedQuestions.find(item => item.id === q.id)) {
      toast({ title: "Already Added", description: "This question is already in the selection." })
      return
    }
    setSelectedQuestions([...selectedQuestions, q])
  }

  const handleRemoveQuestion = (id: string) => {
    setSelectedQuestions(selectedQuestions.filter(q => q.id !== id))
  }

  const handlePublish = () => {
    if (!mockData.title || !mockData.examId || selectedQuestions.length === 0) {
      toast({ 
        variant: "destructive", 
        title: "Audit Failed", 
        description: "Series Title, Exam Hub and at least 1 MCQ required." 
      })
      return
    }

    setIsPublishing(true)
    const mockId = `mock-${Date.now()}`
    const mockRef = doc(db, "mocks", mockId)
    const payload = {
      ...mockData,
      id: mockId,
      totalQuestions: selectedQuestions.length,
      questionIds: selectedQuestions.map(q => q.id),
      published: true,
      createdAt: serverTimestamp(),
      author: "Arsh Grewal Management"
    }

    setDoc(mockRef, payload)
      .then(() => {
        toast({ title: "Series Live", description: "Institutional practice series published to cloud." })
        router.push("/admin/mocks")
      })
      .catch(async () => {
        errorEmitter.emit("permission-error", new FirestorePermissionError({ 
          path: mockRef.path, 
          operation: 'create', 
          requestResourceData: payload 
        }))
      })
      .finally(() => setIsPublishing(false))
  }

  const filteredBank = useMemo(() => {
    if (!questionBank) return []
    return questionBank.filter(q => 
      q.questionEn?.toLowerCase().includes(bankSearch.toLowerCase()) || 
      q.id.includes(bankSearch)
    )
  }, [questionBank, bankSearch])

  return (
    <div className="space-y-8 pb-20 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-2xl h-12 w-12 border border-foreground/5 bg-card/30">
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <div>
            <h1 className="text-3xl font-black font-headline text-primary uppercase tracking-tight">Series Builder</h1>
            <p className="text-[10px] text-muted-foreground uppercase font-black tracking-[0.2em] mt-1">Audit Mode: Arsh Grewal</p>
          </div>
        </div>
        <div className="flex gap-4">
           <Button variant="outline" className="border-foreground/10 h-14 px-8 rounded-2xl font-bold gap-2">
              <Settings className="h-4 w-4" /> Config
           </Button>
           <Button className="bg-primary hover:bg-primary/90 gap-3 font-black px-10 h-14 shadow-2xl shadow-primary/20 rounded-2xl" onClick={handlePublish} disabled={isPublishing}>
            <Save className="h-4 w-4" /> {isPublishing ? "Publishing..." : "Commit Series"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Metadata Sidebar */}
        <div className="lg:col-span-4 space-y-8">
          <Card className="border-foreground/5 bg-card/50 shadow-2xl rounded-[2.5rem] overflow-hidden">
            <div className="h-2 w-full bg-primary" />
            <CardHeader className="p-8">
               <CardTitle className="text-xl font-headline font-black uppercase">Series Profile</CardTitle>
               <CardDescription>Define target board and assessment type.</CardDescription>
            </CardHeader>
            <CardContent className="px-8 pb-8 space-y-6">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Series Headline</Label>
                <Input placeholder="e.g. PSSSB Clerk Full Mock 01" value={mockData.title} onChange={e => setMockData({...mockData, title: e.target.value})} className="rounded-xl h-12 bg-background border-none shadow-inner" />
              </div>
              
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Recruitment Board</Label>
                  <Select onValueChange={val => setMockData({...mockData, boardId: val})}>
                    <SelectTrigger className="rounded-xl h-12 bg-background border-none shadow-inner"><SelectValue placeholder="Select Authority" /></SelectTrigger>
                    <SelectContent>{boards?.map(b => <SelectItem key={b.id} value={b.id}>{b.abbreviation}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Exam Hub</Label>
                  <Select onValueChange={val => setMockData({...mockData, examId: val})}>
                    <SelectTrigger className="rounded-xl h-12 bg-background border-none shadow-inner"><SelectValue placeholder="Select Category" /></SelectTrigger>
                    <SelectContent>{exams?.filter(e => e.boardId === mockData.boardId).map(e => <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Duration (Min)</Label>
                  <Input type="number" value={mockData.duration} onChange={e => setMockData({...mockData, duration: parseInt(e.target.value)})} className="rounded-xl h-12 bg-background border-none" />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Mock Type</Label>
                  <Select onValueChange={val => setMockData({...mockData, mockType: val as any})} defaultValue="FULL">
                    <SelectTrigger className="rounded-xl h-12 bg-background border-none"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="FULL">Full Length</SelectItem>
                      <SelectItem value="SECTIONAL">Sectional</SelectItem>
                      <SelectItem value="SUBJECT">Subject Wise</SelectItem>
                      <SelectItem value="PYQ">Previous Paper</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none bg-primary/5 rounded-[2.5rem] p-10 space-y-4">
             <div className="flex items-center gap-6">
                <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-xl shadow-primary/5"><Database className="h-7 w-7" /></div>
                <div>
                   <p className="text-4xl font-black font-headline leading-none text-slate-200">{selectedQuestions.length}</p>
                   <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mt-2">Verified MCQs Linked</p>
                </div>
             </div>
             {selectedQuestions.length > 0 && (
                <div className="pt-6 border-t border-primary/10">
                   <Button variant="ghost" onClick={() => setSelectedQuestions([])} className="w-full text-rose-500 font-black uppercase text-[10px] tracking-widest hover:bg-rose-500/5">Reset Selection</Button>
                </div>
             )}
          </Card>
        </div>

        {/* Assembly Line */}
        <div className="lg:col-span-8">
           <Tabs defaultValue="smart" className="space-y-8">
              <TabsList className="bg-slate-100/50 rounded-2xl p-1 h-16 border border-white/5">
                 <TabsTrigger value="smart" className="rounded-xl h-full px-10 font-black uppercase text-[10px] gap-2 text-primary data-[state=active]:bg-white data-[state=active]:shadow-lg"><Sparkles className="h-4 w-4" /> Smart Generation</TabsTrigger>
                 <TabsTrigger value="manual" className="rounded-xl h-full px-10 font-black uppercase text-[10px] gap-2 data-[state=active]:bg-white data-[state=active]:shadow-lg"><Database className="h-4 w-4" /> Manual Selection</TabsTrigger>
              </TabsList>

              <TabsContent value="smart" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                 <Card className="border-none shadow-2xl rounded-[3rem] bg-white p-16 text-center space-y-10">
                    <div className="max-w-md mx-auto space-y-8">
                       <div className="h-24 w-24 bg-primary/10 rounded-[2.5rem] flex items-center justify-center mx-auto text-primary shadow-2xl shadow-primary/10"><Sparkles className="h-12 w-12" /></div>
                       <div className="space-y-2">
                          <h3 className="text-3xl font-headline font-black text-slate-800 uppercase">Operational Builder</h3>
                          <p className="text-slate-500 font-medium text-base">Assembles test series instantly based on subject weighting and verified quality.</p>
                       </div>
                       
                       <div className="grid grid-cols-1 gap-6 text-left">
                          <div className="space-y-3">
                             <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Target Subject Weighting</Label>
                             <Select onValueChange={val => setSmartConfig({...smartConfig, subjectId: val})} defaultValue="all">
                                <SelectTrigger className="h-14 rounded-2xl bg-slate-50 border-none shadow-inner"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                   <SelectItem value="all">Across All Subjects</SelectItem>
                                   {subjects?.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                                </SelectContent>
                             </Select>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-6">
                             <div className="space-y-3">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Total MCQs</Label>
                                <Input type="number" value={smartConfig.count} onChange={e => setSmartConfig({...smartConfig, count: parseInt(e.target.value)})} className="h-14 rounded-2xl bg-slate-50 border-none shadow-inner text-lg font-black" />
                             </div>
                             <div className="space-y-3">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Audit Level</Label>
                                <Select onValueChange={val => setSmartConfig({...smartConfig, difficulty: val})} defaultValue="medium">
                                   <SelectTrigger className="h-14 rounded-2xl bg-slate-50 border-none shadow-inner"><SelectValue /></SelectTrigger>
                                   <SelectContent><SelectItem value="all">Any Difficulty</SelectItem><SelectItem value="easy">Easy Level</SelectItem><SelectItem value="medium">Medium Level</SelectItem><SelectItem value="hard">Hard Level</SelectItem></SelectContent>
                                </Select>
                             </div>
                          </div>
                       </div>

                       <Button onClick={handleAutoPick} className="w-full h-16 bg-[#0F172A] hover:bg-black text-white font-black uppercase tracking-[0.2em] text-xs rounded-2xl gap-4 shadow-3xl shadow-slate-200">
                          <Zap className="h-5 w-5 text-primary" /> Run Extraction Engine
                       </Button>
                    </div>
                 </Card>
              </TabsContent>

              <TabsContent value="manual" className="space-y-8 animate-in fade-in duration-500">
                 <div className="flex items-center justify-between bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-50">
                    <div className="relative w-full max-w-lg">
                       <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300" />
                       <Input className="pl-14 h-14 rounded-2xl bg-slate-50 border-none shadow-inner" placeholder="Search global MCQ bank..." value={bankSearch} onChange={e => setBankSearch(e.target.value)} />
                    </div>
                    <Button variant="ghost" className="text-primary font-black uppercase text-[10px] tracking-widest px-6 gap-2"><Filter className="h-4 w-4" /> Filter Bank</Button>
                 </div>

                 <div className="grid grid-cols-1 gap-4 max-h-[650px] overflow-y-auto custom-scrollbar pr-4">
                    {filteredBank.slice(0, 50).map(q => {
                      const isAdded = selectedQuestions.find(s => s.id === q.id)
                      return (
                        <div key={q.id} className="p-6 rounded-3xl border border-slate-100 bg-white flex items-center justify-between group hover:border-primary/40 transition-all shadow-sm hover:shadow-xl">
                           <div className="space-y-2 flex-1 pr-10">
                              <p className="font-bold text-base text-slate-700 line-clamp-1 leading-snug">{q.questionEn}</p>
                              <div className="flex gap-3">
                                 <Badge variant="outline" className="text-[9px] font-black uppercase tracking-widest border-slate-100 text-slate-400">{q.subjectId || 'GK'}</Badge>
                                 <Badge className={`text-[9px] font-black uppercase tracking-widest border-none ${q.difficulty === 'hard' ? 'bg-rose-50 text-rose-500' : 'bg-orange-50 text-orange-500'}`}>{q.difficulty}</Badge>
                              </div>
                           </div>
                           <Button 
                            onClick={() => isAdded ? handleRemoveQuestion(q.id) : handleAddFromBank(q)} 
                            className={`rounded-xl h-11 px-8 font-black uppercase text-[10px] tracking-widest transition-all ${isAdded ? 'bg-emerald-500 hover:bg-emerald-600 text-white' : 'bg-[#0F172A] hover:bg-black text-white'}`}
                           >
                             {isAdded ? 'Linked' : 'Add MCQ'}
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
