
"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { 
  ChevronLeft, 
  Plus, 
  Search, 
  Trash2, 
  Eye, 
  Database, 
  Save, 
  GripVertical,
  AlertCircle,
  CheckCircle2
} from "lucide-react"
import { useCollection, useFirestore } from "@/firebase"
import { collection, query, doc, setDoc, serverTimestamp } from "firebase/firestore"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { errorEmitter } from "@/firebase/error-emitter"
import { FirestorePermissionError } from "@/firebase/errors"

export default function MockBuilderPage() {
  const router = useRouter()
  const db = useFirestore()
  const { toast } = useToast()

  // --- Firestore Data ---
  const { data: boards } = useCollection(useMemo(() => (db ? collection(db, "boards") : null), [db]))
  const { data: exams } = useCollection(useMemo(() => (db ? collection(db, "exams") : null), [db]))
  const { data: questionBank } = useCollection(useMemo(() => (db ? collection(db, "questions") : null), [db]))

  // --- State ---
  const [isPublishing, setIsPublishing] = useState(false)
  const [mockData, setMockData] = useState({
    title: "",
    boardId: "",
    examId: "",
    duration: 120,
    difficulty: "Medium",
    type: "Full Length",
    language: "Punjabi/English",
    description: ""
  })

  const [selectedQuestions, setSelectedQuestions] = useState<any[]>([])
  const [bankSearch, setBankSearch] = useState("")

  // --- Handlers ---
  const handleAddFromBank = (q: any) => {
    if (selectedQuestions.find(item => item.id === q.id)) return
    setSelectedQuestions([...selectedQuestions, q])
  }

  const handleRemoveQuestion = (id: string) => {
    setSelectedQuestions(selectedQuestions.filter(q => q.id !== id))
  }

  const handlePublish = () => {
    if (!mockData.title || !mockData.examId || selectedQuestions.length === 0) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please fill in all mandatory fields and select at least one question."
      })
      return
    }

    setIsPublishing(true)
    const mockId = `mock-${Date.now()}`
    const mockRef = doc(db, "mocks", mockId)

    // Strictly adhering to backend.json properties + metadata
    const payload = {
      id: mockId,
      examId: mockData.examId,
      title: mockData.title,
      duration: mockData.duration,
      totalQuestions: selectedQuestions.length,
      questionIds: selectedQuestions.map(q => q.id),
      attempts: 0,
      createdAt: serverTimestamp(),
      difficulty: mockData.difficulty,
      type: mockData.type,
      publishedBy: "Arsh Grewal"
    }

    setDoc(mockRef, payload)
      .then(() => {
        toast({ title: "Success", description: "Mock Test published successfully!" })
        router.push("/admin/mocks")
      })
      .catch(async (error) => {
        const permissionError = new FirestorePermissionError({
          path: mockRef.path,
          operation: "create",
          requestResourceData: payload
        })
        errorEmitter.emit("permission-error", permissionError)
      })
      .finally(() => setIsPublishing(false))
  }

  const filteredBank = useMemo(() => {
    if (!questionBank) return []
    return questionBank.filter(q => 
      q.text?.toLowerCase().includes(bankSearch.toLowerCase()) || 
      q.topic?.toLowerCase().includes(bankSearch.toLowerCase())
    )
  }, [questionBank, bankSearch])

  return (
    <div className="space-y-8 pb-20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-xl border border-foreground/5">
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-black font-headline text-primary">Mock Test Builder</h1>
            <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">Arsh Grewal Access / Professional Hub</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2 font-bold rounded-xl border-foreground/5 shadow-sm">
            <Eye className="h-4 w-4" /> Preview Draft
          </Button>
          <Button 
            className="bg-primary hover:bg-primary/90 gap-2 font-bold px-8 shadow-xl shadow-primary/20 rounded-xl"
            onClick={handlePublish}
            disabled={isPublishing}
          >
            <Save className="h-4 w-4" /> {isPublishing ? "Publishing..." : "Publish Series"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Metadata */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="border-foreground/5 bg-card/50 shadow-2xl rounded-[2rem] overflow-hidden">
            <div className="h-1.5 w-full bg-primary" />
            <CardHeader>
              <CardTitle className="text-lg font-bold font-headline">Test Metadata</CardTitle>
              <CardDescription>Core settings for the mock series.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-xs uppercase font-black tracking-widest opacity-60">Series Title</Label>
                <Input 
                  placeholder="e.g. PSSSB Patwari Set 01" 
                  value={mockData.title}
                  onChange={e => setMockData({...mockData, title: e.target.value})}
                  className="rounded-xl bg-background/50"
                />
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs uppercase font-black tracking-widest opacity-60">Recruitment Board</Label>
                  <Select onValueChange={val => setMockData({...mockData, boardId: val})}>
                    <SelectTrigger className="rounded-xl bg-background/50">
                      <SelectValue placeholder="Select Authority" />
                    </SelectTrigger>
                    <SelectContent>
                      {boards?.map(b => (
                        <SelectItem key={b.id} value={b.id}>{b.abbreviation}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs uppercase font-black tracking-widest opacity-60">Exam Category</Label>
                  <Select onValueChange={val => setMockData({...mockData, examId: val})}>
                    <SelectTrigger className="rounded-xl bg-background/50">
                      <SelectValue placeholder="Select Exam" />
                    </SelectTrigger>
                    <SelectContent>
                      {exams?.filter(e => e.boardId === mockData.boardId).map(e => (
                        <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs uppercase font-black tracking-widest opacity-60">Duration (Min)</Label>
                  <Input 
                    type="number" 
                    value={mockData.duration}
                    onChange={e => setMockData({...mockData, duration: parseInt(e.target.value)})}
                    className="rounded-xl bg-background/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs uppercase font-black tracking-widest opacity-60">Difficulty</Label>
                  <Select onValueChange={val => setMockData({...mockData, difficulty: val})} defaultValue="Medium">
                    <SelectTrigger className="rounded-xl bg-background/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Easy">Easy</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="Hard">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs uppercase font-black tracking-widest opacity-60">Description</Label>
                <Textarea 
                  placeholder="Instructions for students..."
                  className="min-h-[100px] rounded-xl bg-background/50"
                  value={mockData.description}
                  onChange={e => setMockData({...mockData, description: e.target.value})}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border-foreground/5 bg-primary/5 rounded-[1.5rem] border-dashed">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-xl font-black font-headline">{selectedQuestions.length}</p>
                <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">Active Questions in Draft</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right: Assembly */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold font-headline">Assembly Line</h3>
            <div className="flex gap-2">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" className="gap-2 border-primary/20 text-primary hover:bg-primary/5 rounded-xl font-bold">
                    <Database className="h-4 w-4" /> Global Bank
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[750px] max-h-[85vh] flex flex-col p-0 overflow-hidden rounded-[2.5rem] border-none shadow-2xl">
                  <DialogHeader className="p-8 pb-4">
                    <DialogTitle className="font-headline text-2xl font-black">Search Question Bank</DialogTitle>
                    <div className="relative mt-6">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <Input 
                        className="pl-12 h-14 rounded-2xl bg-muted/50 border-none text-lg" 
                        placeholder="Search topics or question text..." 
                        value={bankSearch}
                        onChange={e => setBankSearch(e.target.value)}
                      />
                    </div>
                  </DialogHeader>
                  <div className="flex-1 overflow-y-auto px-8 pb-8 space-y-3 custom-scrollbar">
                    {filteredBank.map(q => {
                      const isAdded = selectedQuestions.find(s => s.id === q.id)
                      return (
                        <div key={q.id} className="p-5 rounded-2xl border border-foreground/5 bg-slate-50/50 flex items-center justify-between group hover:border-primary/30 transition-all">
                          <div className="space-y-1 pr-8">
                            <p className="font-bold text-sm line-clamp-1 text-slate-700">{q.text}</p>
                            <div className="flex gap-2">
                              <Badge variant="outline" className="text-[10px] bg-white border-slate-200">{q.topic}</Badge>
                              <Badge variant="secondary" className="text-[10px] font-bold">{q.difficulty}</Badge>
                            </div>
                          </div>
                          <Button 
                            size="sm" 
                            onClick={() => handleAddFromBank(q)}
                            className={isAdded ? "bg-emerald-500 hover:bg-emerald-600 rounded-xl" : "rounded-xl"}
                          >
                            {isAdded ? "Added" : "Add to Mock"}
                          </Button>
                        </div>
                      )
                    })}
                  </div>
                </DialogContent>
              </Dialog>
              <Button className="gap-2 rounded-xl font-bold" onClick={() => router.push("/admin/questions/add")}>
                <Plus className="h-4 w-4" /> Manual Entry
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            {selectedQuestions.length === 0 ? (
              <div className="h-80 border-2 border-dashed rounded-[3rem] flex flex-col items-center justify-center text-muted-foreground bg-muted/5">
                <div className="h-16 w-16 rounded-full bg-slate-100 flex items-center justify-center mb-6">
                  <Plus className="h-8 w-8 opacity-40" />
                </div>
                <p className="font-black font-headline text-lg">Empty Draft</p>
                <p className="text-xs uppercase tracking-widest font-black opacity-50 mt-1">Add items from the bank to begin assembly.</p>
              </div>
            ) : (
              selectedQuestions.map((q, idx) => (
                <Card key={q.id} className="border-foreground/5 overflow-hidden group rounded-2xl shadow-sm hover:shadow-md transition-all">
                  <CardContent className="p-0 flex">
                    <div className="w-12 bg-muted/20 flex items-center justify-center cursor-grab active:cursor-grabbing border-r border-foreground/5">
                      <GripVertical className="h-4 w-4 text-muted-foreground/30" />
                    </div>
                    <div className="flex-1 p-5 flex items-center justify-between">
                      <div className="flex items-center gap-6">
                        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-black text-sm">
                          {idx + 1}
                        </div>
                        <div className="space-y-1">
                          <p className="font-bold text-sm line-clamp-1 text-[#0F172A]">{q.text}</p>
                          <div className="flex items-center gap-2">
                             <span className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">{q.topic}</span>
                             <div className="h-1 w-1 rounded-full bg-slate-300" />
                             <span className="text-[10px] font-bold text-slate-400">{q.difficulty}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                         <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-9 w-9 text-destructive hover:bg-destructive/10 rounded-xl"
                          onClick={() => handleRemoveQuestion(q.id)}
                         >
                           <Trash2 className="h-4 w-4" />
                         </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
