
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
  AlertCircle
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
    if (!mockData.title || !mockData.boardId || selectedQuestions.length === 0) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please fill in the title and select at least one question."
      })
      return
    }

    setIsPublishing(true)
    const mockId = `mock-${Date.now()}`
    const mockRef = doc(db, "mocks", mockId)

    const payload = {
      ...mockData,
      id: mockId,
      questionIds: selectedQuestions.map(q => q.id),
      totalQuestions: selectedQuestions.length,
      attempts: 0,
      createdAt: serverTimestamp(),
      updatedBy: "Arsh Grewal"
    }

    setDoc(mockRef, payload)
      .then(() => {
        toast({ title: "Success", description: "Mock published successfully!" })
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
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-black font-headline text-primary">Mock Test Builder</h1>
            <p className="text-xs text-muted-foreground uppercase font-black tracking-widest">Master Portal / Mock Builder</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2 font-bold">
            <Eye className="h-4 w-4" /> Preview
          </Button>
          <Button 
            className="bg-primary hover:bg-primary/90 gap-2 font-bold px-8 shadow-xl shadow-primary/20"
            onClick={handlePublish}
            disabled={isPublishing}
          >
            <Save className="h-4 w-4" /> {isPublishing ? "Publishing..." : "Publish Mock"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Metadata */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="border-foreground/5 bg-card/50 shadow-2xl">
            <CardHeader>
              <CardTitle className="text-lg font-bold font-headline">Test Metadata</CardTitle>
              <CardDescription>Core configuration for the mock series.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Mock Title</Label>
                <Input 
                  placeholder="e.g. PSSSB Patwari Set 01" 
                  value={mockData.title}
                  onChange={e => setMockData({...mockData, title: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Board</Label>
                  <Select onValueChange={val => setMockData({...mockData, boardId: val})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Board" />
                    </SelectTrigger>
                    <SelectContent>
                      {boards?.map(b => (
                        <SelectItem key={b.id} value={b.id}>{b.abbreviation}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Exam Category</Label>
                  <Select onValueChange={val => setMockData({...mockData, examId: val})}>
                    <SelectTrigger>
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
                  <Label>Duration (Min)</Label>
                  <Input 
                    type="number" 
                    value={mockData.duration}
                    onChange={e => setMockData({...mockData, duration: parseInt(e.target.value)})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Difficulty</Label>
                  <Select onValueChange={val => setMockData({...mockData, difficulty: val})} defaultValue="Medium">
                    <SelectTrigger>
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
                <Label>Description</Label>
                <Textarea 
                  placeholder="Instructions for students..."
                  className="min-h-[100px]"
                  value={mockData.description}
                  onChange={e => setMockData({...mockData, description: e.target.value})}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border-foreground/5 bg-primary/5">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <AlertCircle className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-xl font-black font-headline">{selectedQuestions.length}</p>
                <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">Total Questions Loaded</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right: Question Assembly */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold font-headline">Question Assembly</h3>
            <div className="flex gap-2">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" className="gap-2 border-primary/20 text-primary hover:bg-primary/5">
                    <Database className="h-4 w-4" /> Add from Bank
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[700px] max-h-[80vh] flex flex-col p-0 overflow-hidden">
                  <DialogHeader className="p-6 pb-2">
                    <DialogTitle className="font-headline text-2xl">Global Question Bank</DialogTitle>
                    <div className="relative mt-4">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input 
                        className="pl-10 h-12" 
                        placeholder="Search by topic, text or subject..." 
                        value={bankSearch}
                        onChange={e => setBankSearch(e.target.value)}
                      />
                    </div>
                  </DialogHeader>
                  <div className="flex-1 overflow-y-auto p-6 pt-0 space-y-3">
                    {filteredBank.map(q => (
                      <div key={q.id} className="p-4 rounded-xl border border-foreground/5 bg-muted/20 flex items-center justify-between group hover:border-primary/30 transition-all">
                        <div className="space-y-1">
                          <p className="font-bold text-sm line-clamp-1">{q.text}</p>
                          <div className="flex gap-2">
                            <Badge variant="secondary" className="text-[10px]">{q.topic}</Badge>
                            <Badge variant="outline" className="text-[10px]">{q.difficulty}</Badge>
                          </div>
                        </div>
                        <Button 
                          size="sm" 
                          onClick={() => handleAddFromBank(q)}
                          className={selectedQuestions.find(s => s.id === q.id) ? "bg-green-500 hover:bg-green-600" : ""}
                        >
                          {selectedQuestions.find(s => s.id === q.id) ? "Added" : "Add to Mock"}
                        </Button>
                      </div>
                    ))}
                  </div>
                </DialogContent>
              </Dialog>
              <Button className="gap-2" onClick={() => router.push("/admin/questions/add")}>
                <Plus className="h-4 w-4" /> Create Manual
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            {selectedQuestions.length === 0 ? (
              <div className="h-60 border-2 border-dashed rounded-[2rem] flex flex-col items-center justify-center text-muted-foreground bg-muted/5">
                <Plus className="h-10 w-10 mb-4 opacity-20" />
                <p className="font-bold">No questions added yet.</p>
                <p className="text-xs">Start by adding from the bank or creating manually.</p>
              </div>
            ) : (
              selectedQuestions.map((q, idx) => (
                <Card key={q.id} className="border-foreground/5 overflow-hidden group">
                  <CardContent className="p-0 flex">
                    <div className="w-12 bg-muted/30 flex items-center justify-center cursor-grab active:cursor-grabbing border-r border-foreground/5">
                      <GripVertical className="h-4 w-4 text-muted-foreground/50" />
                    </div>
                    <div className="flex-1 p-5 flex items-center justify-between">
                      <div className="flex items-center gap-6">
                        <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-black text-xs">
                          {idx + 1}
                        </div>
                        <div className="space-y-1">
                          <p className="font-bold text-sm line-clamp-1">{q.text}</p>
                          <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">{q.topic}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                         <Badge variant="outline" className="text-[10px]">{q.difficulty}</Badge>
                         <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
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
