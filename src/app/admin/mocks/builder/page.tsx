
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
  Eye, 
  Database, 
  Save, 
  GripVertical,
  CheckCircle2,
  Zap,
  Sparkles
} from "lucide-react"
import { useCollection, useFirestore } from "@/firebase"
import { collection, doc, setDoc, serverTimestamp } from "firebase/firestore"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { errorEmitter } from "@/firebase/error-emitter"
import { FirestorePermissionError } from "@/firebase/errors"

export default function MockBuilderPage() {
  const router = useRouter()
  const db = useFirestore()
  const { toast } = useToast()

  // --- Data ---
  const { data: boards } = useCollection<any>(useMemo(() => (db ? collection(db, "boards") : null), [db]))
  const { data: exams } = useCollection<any>(useMemo(() => (db ? collection(db, "exams") : null), [db]))
  const { data: questionBank } = useCollection<any>(useMemo(() => (db ? collection(db, "questions") : null), [db]))

  // --- State ---
  const [isPublishing, setIsPublishing] = useState(false)
  const [mockData, setMockData] = useState({
    title: "", boardId: "", examId: "", duration: 120, difficulty: "Medium", mockType: "FULL"
  })

  const [selectedQuestions, setSelectedQuestions] = useState<any[]>([])
  const [bankSearch, setBankSearch] = useState("")

  const [smartConfig, setSmartConfig] = useState({ count: 50, difficulty: "medium" })

  // --- Handlers ---
  const handleAutoPick = () => {
    if (!questionBank || questionBank.length === 0) return
    const filtered = questionBank.filter(q => q.difficulty === smartConfig.difficulty)
    const shuffled = [...filtered].sort(() => 0.5 - Math.random())
    const selected = shuffled.slice(0, smartConfig.count)
    setSelectedQuestions(selected)
    toast({ title: "Smart Build Success", description: `Assembled ${selected.length} questions automatically.` })
  }

  const handleAddFromBank = (q: any) => {
    if (selectedQuestions.find(item => item.id === q.id)) return
    setSelectedQuestions([...selectedQuestions, q])
  }

  const handleRemoveQuestion = (id: string) => {
    setSelectedQuestions(selectedQuestions.filter(q => q.id !== id))
  }

  const handlePublish = () => {
    if (!mockData.title || !mockData.examId || selectedQuestions.length === 0) {
      toast({ variant: "destructive", title: "Missing Data", description: "Title, Exam and at least 1 question required." })
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
      author: "Arsh Grewal"
    }

    setDoc(mockRef, payload)
      .then(() => {
        toast({ title: "Live", description: "Mock series published successfully." })
        router.push("/admin/mocks")
      })
      .catch(async () => {
        errorEmitter.emit("permission-error", new FirestorePermissionError({ path: mockRef.path, operation: 'create', requestResourceData: payload }))
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
    <div className="space-y-8 pb-20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-xl border border-foreground/5 bg-card/30"><ChevronLeft className="h-5 w-5" /></Button>
          <div>
            <h1 className="text-2xl font-black font-headline text-primary uppercase">Series Assembly</h1>
            <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest mt-1">Institutional Mode: Arsh Grewal</p>
          </div>
        </div>
        <Button className="bg-primary hover:bg-primary/90 gap-2 font-black px-8 h-12 shadow-xl shadow-primary/20 rounded-xl" onClick={handlePublish} disabled={isPublishing}>
          <Save className="h-4 w-4" /> {isPublishing ? "Syncing..." : "Commit Series"}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Configuration */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="border-foreground/5 bg-card/50 shadow-2xl rounded-[2.5rem]">
            <CardHeader><CardTitle className="text-lg font-bold uppercase tracking-widest">Metadata</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2"><Label className="text-[10px] font-black uppercase text-slate-500">Series Title</Label><Input placeholder="e.g. PSSSB Patwari Set 12" value={mockData.title} onChange={e => setMockData({...mockData, title: e.target.value})} className="rounded-xl bg-background/50 border-none" /></div>
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-slate-500">Authority</Label>
                  <Select onValueChange={val => setMockData({...mockData, boardId: val})}>
                    <SelectTrigger className="rounded-xl bg-background/50 border-none"><SelectValue placeholder="Select Board" /></SelectTrigger>
                    <SelectContent>{boards?.map(b => <SelectItem key={b.id} value={b.id}>{b.abbreviation}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-slate-500">Exam Hub</Label>
                  <Select onValueChange={val => setMockData({...mockData, examId: val})}>
                    <SelectTrigger className="rounded-xl bg-background/50 border-none"><SelectValue placeholder="Select Exam" /></SelectTrigger>
                    <SelectContent>{exams?.filter(e => e.boardId === mockData.boardId).map(e => <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none bg-primary/5 rounded-[2rem] p-8 space-y-4">
             <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary"><Database className="h-6 w-6" /></div>
                <div><p className="text-2xl font-black font-headline leading-none">{selectedQuestions.length}</p><p className="text-[9px] font-black uppercase tracking-widest text-slate-500 mt-1">Audit Ready MCQs</p></div>
             </div>
          </Card>
        </div>

        {/* Assembly Line */}
        <div className="lg:col-span-8">
           <Tabs defaultValue="manual" className="space-y-6">
              <TabsList className="bg-slate-100 rounded-2xl p-1 h-14">
                 <TabsTrigger value="manual" className="rounded-xl px-8 font-black uppercase text-[10px] gap-2"><Database className="h-3 w-3" /> Manual Selection</TabsTrigger>
                 <TabsTrigger value="smart" className="rounded-xl px-8 font-black uppercase text-[10px] gap-2 text-primary"><Sparkles className="h-3 w-3" /> Smart Generation</TabsTrigger>
              </TabsList>

              <TabsContent value="manual" className="space-y-6">
                 <div className="flex items-center justify-between bg-white p-6 rounded-[2rem] shadow-lg">
                    <div className="relative w-full max-w-md">
                       <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                       <Input className="pl-12 h-12 rounded-xl bg-slate-50 border-none" placeholder="Search global bank..." value={bankSearch} onChange={e => setBankSearch(e.target.value)} />
                    </div>
                    <Button variant="ghost" className="text-primary font-black uppercase text-xs">Refresh Bank</Button>
                 </div>

                 <div className="grid grid-cols-1 gap-4 max-h-[600px] overflow-y-auto custom-scrollbar pr-2">
                    {filteredBank.slice(0, 20).map(q => {
                      const isAdded = selectedQuestions.find(s => s.id === q.id)
                      return (
                        <div key={q.id} className="p-5 rounded-2xl border border-slate-100 bg-white flex items-center justify-between group hover:border-primary/30 transition-all">
                           <div className="space-y-1"><p className="font-bold text-sm text-slate-700 line-clamp-1">{q.questionEn}</p><div className="flex gap-2"><Badge variant="outline" className="text-[8px] uppercase">{q.topic || 'General'}</Badge><Badge className="text-[8px] uppercase bg-slate-100 text-slate-500 border-none">{q.difficulty}</Badge></div></div>
                           <Button size="sm" onClick={() => handleAddFromBank(q)} className={`rounded-xl h-10 px-6 ${isAdded ? 'bg-emerald-500' : 'bg-slate-900'}`}>{isAdded ? 'Added' : 'Add'}</Button>
                        </div>
                      )
                    })}
                 </div>
              </TabsContent>

              <TabsContent value="smart">
                 <Card className="border-none shadow-2xl rounded-[3rem] bg-white p-12 text-center space-y-8">
                    <div className="max-w-md mx-auto space-y-6">
                       <div className="h-20 w-20 bg-primary/10 rounded-[2rem] flex items-center justify-center mx-auto text-primary"><Sparkles className="h-10 w-10" /></div>
                       <h3 className="text-2xl font-headline font-black text-slate-800">Operational Smart Builder</h3>
                       <p className="text-slate-500 font-medium">Assembles high-fidelity mocks instantly based on your global verified question bank.</p>
                       
                       <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2 text-left">
                             <Label className="text-[10px] font-black uppercase ml-1">Quantity</Label>
                             <Input type="number" value={smartConfig.count} onChange={e => setSmartConfig({...smartConfig, count: parseInt(e.target.value)})} className="h-12 rounded-xl bg-slate-50" />
                          </div>
                          <div className="space-y-2 text-left">
                             <Label className="text-[10px] font-black uppercase ml-1">Target Difficulty</Label>
                             <Select onValueChange={val => setSmartConfig({...smartConfig, difficulty: val})} defaultValue="medium">
                                <SelectTrigger className="h-12 rounded-xl bg-slate-50 border-none"><SelectValue /></SelectTrigger>
                                <SelectContent><SelectItem value="easy">Easy</SelectItem><SelectItem value="medium">Medium</SelectItem><SelectItem value="hard">Hard</SelectItem></SelectContent>
                             </Select>
                          </div>
                       </div>

                       <Button onClick={handleAutoPick} className="w-full h-14 bg-slate-900 hover:bg-black text-white font-black uppercase tracking-widest rounded-2xl gap-3">
                          <Zap className="h-5 w-5 text-primary" /> Run Smart Build
                       </Button>
                    </div>
                 </Card>
              </TabsContent>
           </Tabs>
        </div>
      </div>
    </div>
  )
}
