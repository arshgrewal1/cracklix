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
import { Checkbox } from "@/components/ui/checkbox"
import { 
  ChevronLeft, 
  Database, 
  ClipboardCheck,
  Search,
  Layers,
  Loader2,
  Plus,
  Trash2,
  Zap,
  Clock,
  MinusCircle,
  PlusCircle,
  XCircle,
  Gem
} from "lucide-react"
import { useCollection, useFirestore, useDoc } from "@/firebase"
import { collection, doc, setDoc, serverTimestamp, query, where, limit, getDocs } from "firebase/firestore"
import { useToast } from "@/hooks/use-toast"
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
  const { data: passes } = useCollection<any>(useMemo(() => (db ? query(collection(db, "passes"), where("active", "==", true)) : null), [db]))
  
  const [bankLoading, setBankLoading] = useState(false)
  const [questionBank, setQuestionBank] = useState<any[]>([])
  const [bankFilter, setBankFilter] = useState({ subjectId: "all", search: "" })

  const [isPublishing, setIsPublishing] = useState(false)
  const [mockData, setMockData] = useState<any>({
    title: "", 
    boardId: "", 
    examId: "",
    duration: 120, 
    difficulty: "Medium" as Difficulty, 
    mockType: "FULL" as MockType, 
    accessType: "FREE" as AccessType,
    passId: "any", 
    published: false,
    positiveMarks: 1,
    negativeMarks: 0.25,
    questionIds: []
  })

  const [selectedQuestions, setSelectedQuestions] = useState<any[]>([])
  const [bankSelection, setBankSelection] = useState<string[]>([])

  useEffect(() => {
    async function fetchBank() {
      if (!db) return
      setBankLoading(true)
      try {
        const q = query(collection(db, "questions"), limit(250))
        const snap = await getDocs(q)
        setQuestionBank(snap.docs.map(d => ({ ...d.data(), id: d.id })))
      } finally {
        setBankLoading(false)
      }
    }
    fetchBank()
  }, [db])

  useEffect(() => {
    if (existingMock) {
      setMockData(prev => ({ 
        ...prev, 
        ...existingMock,
        passId: existingMock.passId || "any"
      }));
      if (existingMock.questionIds && questionBank.length > 0) {
        const staged = questionBank.filter(q => existingMock.questionIds.includes(q.id))
        setSelectedQuestions(staged)
      }
    }
  }, [existingMock, questionBank])

  const filteredBank = useMemo(() => {
    return questionBank.filter((q: any) => {
      const matchesSub = bankFilter.subjectId === "all" || q.subjectId === bankFilter.subjectId
      const matchesSearch = !bankFilter.search || (q.questionEn || "").toLowerCase().includes(bankFilter.search.toLowerCase())
      const notAlreadySelected = !selectedQuestions.find(sq => sq.id === q.id)
      return matchesSub && matchesSearch && notAlreadySelected
    })
  }, [questionBank, bankFilter, selectedQuestions])

  const handleBulkLink = () => {
    const toAdd = questionBank.filter(q => bankSelection.includes(q.id))
    setSelectedQuestions(prev => [...prev, ...toAdd])
    setBankSelection([])
    toast({ title: "Nodes Linked", description: `${toAdd.length} questions linked.` })
  }

  const handlePublish = async () => {
    if (!mockData.title || !mockData.boardId || !mockData.examId) {
      toast({ variant: "destructive", title: "Missing Node", description: "Title, Board, and Exam are mandatory." })
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
      passId: mockData.passId === 'any' ? '' : mockData.passId,
      updatedAt: serverTimestamp(),
      createdAt: isEditing ? (existingMock?.createdAt || serverTimestamp()) : serverTimestamp(),
    };

    Object.keys(payload).forEach(key => (payload[key] === undefined || payload[key] === null) && delete payload[key]);

    try {
      await setDoc(mockRef, payload, { merge: true })
      toast({ title: "Series Deployed" })
      router.push("/admin/mocks")
    } catch (err: any) {
      toast({ variant: "destructive", title: "Save Failed" })
    } finally {
      setIsPublishing(false)
    }
  }

  return (
    <div className="max-w-[1500px] mx-auto space-y-10 pb-32 text-left">
      <div className="flex items-center justify-between gap-6 px-4">
        <div className="flex items-center gap-6">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-2xl border bg-white h-12 w-12 shadow-sm"><ChevronLeft className="h-6 w-6" /></Button>
          <div className="text-left">
            <h1 className="text-4xl font-black font-headline uppercase tracking-tight text-[#0F172A]">Mock Architect</h1>
            <p className="text-[10px] uppercase font-black tracking-[0.2em] text-slate-400 mt-1">CBT Pattern Engineering & Logic</p>
          </div>
        </div>
        <div className="flex gap-4">
           <Button className="bg-primary hover:bg-orange-600 font-black px-12 h-16 rounded-2xl uppercase text-[11px] tracking-[0.2em] gap-3 shadow-3xl" onClick={handlePublish} disabled={isPublishing}>
             {isPublishing ? <Loader2 className="h-4 w-4 animate-spin" /> : <ClipboardCheck className="h-5 w-5" />} {isEditing ? "Update Module" : "Deploy Live Series"}
           </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 px-4">
        <div className="lg:col-span-4 space-y-8">
          <Card className="border-none shadow-4xl rounded-[3rem] bg-white p-10 space-y-8">
             <div className="space-y-6">
               <div className="space-y-2">
                 <Label className="text-[10px] font-black uppercase text-slate-500">Series Headline</Label>
                 <Input value={mockData.title} onChange={e => setMockData({...mockData, title: e.target.value})} className="rounded-xl h-14 font-bold text-lg" />
               </div>

               <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-slate-500">Series Category</Label>
                  <Select value={mockData.mockType} onValueChange={(v: MockType) => setMockData({...mockData, mockType: v})}>
                    <SelectTrigger className="rounded-xl h-12 bg-slate-50/50"><SelectValue placeholder="Category" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="FULL">Full Length Mock</SelectItem>
                      <SelectItem value="SECTIONAL">Sectional Test</SelectItem>
                      <SelectItem value="CHAPTER">Chapter Wise Test</SelectItem>
                      <SelectItem value="PYQ">Previous Year Paper</SelectItem>
                    </SelectContent>
                  </Select>
               </div>

               <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                   <Label className="text-[10px] font-black uppercase text-slate-500">Authority</Label>
                   <Select value={mockData.boardId} onValueChange={v => setMockData({...mockData, boardId: v, examId: ""})}>
                     <SelectTrigger className="rounded-xl h-12 bg-slate-50/50"><SelectValue placeholder="Select" /></SelectTrigger>
                     <SelectContent>{boards?.map((b: any) => <SelectItem key={b.id} value={b.id}>{b.abbreviation}</SelectItem>)}</SelectContent>
                   </Select>
                 </div>
                 <div className="space-y-2">
                   <Label className="text-[10px] font-black uppercase text-slate-500">Exam Hub</Label>
                   <Select value={mockData.examId} onValueChange={v => setMockData({...mockData, examId: v})}>
                     <SelectTrigger className="rounded-xl h-12 bg-slate-50/50"><SelectValue placeholder="Select" /></SelectTrigger>
                     <SelectContent>{exams?.filter((e: any) => e.boardId === mockData.boardId).map((e: any) => <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>)}</SelectContent>
                   </Select>
                 </div>
               </div>

               <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-50">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase text-slate-500 flex items-center gap-2"><Clock className="h-3 w-3" /> Time (Mins)</Label>
                    <Input type="number" value={mockData.duration} onChange={e => setMockData({...mockData, duration: parseInt(e.target.value) || 0})} className="h-12 rounded-xl text-center" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase text-slate-500 flex items-center gap-2"><PlusCircle className="h-3 w-3 text-emerald-500" /> Correct Marks</Label>
                    <Input type="number" step="0.1" value={mockData.positiveMarks} onChange={e => setMockData({...mockData, positiveMarks: parseFloat(e.target.value) || 0})} className="h-12 rounded-xl text-center" />
                  </div>
               </div>

               <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase text-slate-500 flex items-center gap-2"><MinusCircle className="h-3 w-3 text-rose-500" /> Penalty Nodes</Label>
                    <Input type="number" step="0.05" value={mockData.negativeMarks} onChange={e => setMockData({...mockData, negativeMarks: parseFloat(e.target.value) || 0})} className="h-12 rounded-xl text-center" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px) font-black uppercase text-slate-500">Access Protocol</Label>
                    <Select value={mockData.accessType} onValueChange={(v: AccessType) => setMockData({...mockData, accessType: v})}>
                      <SelectTrigger className="rounded-xl h-12 bg-slate-50/50"><SelectValue placeholder="Protocol" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="FREE">Free Node</SelectItem>
                        <SelectItem value="PREMIUM">Elite Vault</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
               </div>

               {mockData.accessType === 'PREMIUM' && (
                  <div className="space-y-2 animate-in slide-in-from-top-4">
                    <Label className="text-[10px] font-black uppercase text-primary">Required Pass Tier</Label>
                    <Select value={mockData.passId || "any"} onValueChange={(v: string) => setMockData({...mockData, passId: v})}>
                      <SelectTrigger className="rounded-xl h-14 bg-primary/5 border-primary/20 text-primary font-bold"><SelectValue placeholder="Any Premium Pass" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="any">Any Premium Pass</SelectItem>
                        {passes?.map((p: any) => (
                           <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
               )}

               <div className="pt-8 border-t border-slate-50 flex items-center justify-between p-6 bg-slate-50/50 rounded-3xl">
                  <p className="font-black text-[11px] uppercase">Production Status</p>
                  <Switch checked={mockData.published} onCheckedChange={val => setMockData({...mockData, published: val})} />
               </div>
            </div>
          </Card>
        </div>

        <div className="lg:col-span-8 space-y-6">
           <Card className="border-none shadow-4xl rounded-[4rem] bg-white overflow-hidden min-h-[700px] flex flex-col">
              <Tabs defaultValue="bank" className="flex-1 flex flex-col">
                 <TabsList className="bg-slate-50/50 border-b border-slate-100 w-full justify-start h-20 px-10 gap-12 rounded-none">
                    <TabsTrigger value="bank" className="font-black uppercase text-[11px] tracking-widest gap-3 h-12">
                       <Database className="h-4 w-4" /> Atomic Bank
                    </TabsTrigger>
                    <TabsTrigger value="assembly" className="font-black uppercase text-[11px] tracking-widest gap-3 h-12">
                       <Layers className="h-4 w-4" /> Active Assembly 
                       <Badge className="bg-primary text-white border-none text-[8px] ml-1">{selectedQuestions.length}</Badge>
                    </TabsTrigger>
                 </TabsList>

                 <TabsContent value="bank" className="p-10 flex-1 flex flex-col m-0">
                    <div className="flex flex-col md:flex-row gap-4 mb-8">
                       <div className="relative flex-1">
                          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                          <Input placeholder="Filter bank nodes..." value={bankFilter.search} onChange={e => setBankFilter({...bankFilter, search: e.target.value})} className="h-12 pl-12 rounded-xl bg-slate-50 border-none" />
                       </div>
                    </div>

                    <div className="bg-[#0F172A] p-4 rounded-2xl mb-6 flex items-center justify-between text-white">
                       <div className="flex items-center gap-6 px-4">
                          <Checkbox 
                            checked={filteredBank.length > 0 && bankSelection.length === filteredBank.length} 
                            onCheckedChange={(v) => {
                               if (v) setBankSelection(filteredBank.map(q => q.id))
                               else setBankSelection([])
                            }}
                          />
                          <p className="font-black uppercase text-[10px]">Select Visible ({bankSelection.length})</p>
                       </div>
                       <div className="flex gap-3">
                         <Button disabled={bankSelection.length === 0} onClick={handleBulkLink} className="bg-emerald-600 hover:bg-emerald-700 h-10 px-8 rounded-xl">
                            Link {bankSelection.length} Nodes
                         </Button>
                       </div>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar pr-4 space-y-3">
                       {bankLoading ? (
                          <Loader2 className="h-8 w-8 animate-spin mx-auto mt-20 text-slate-200" />
                       ) : filteredBank.map(q => (
                          <div key={q.id} className={cn(
                             "p-4 rounded-2xl border border-slate-100 flex items-center justify-between transition-all",
                             bankSelection.includes(q.id) ? "bg-primary/5 border-primary/20" : "bg-white"
                          )}>
                             <div className="flex items-center gap-6 min-w-0 flex-1">
                                <Checkbox 
                                  checked={bankSelection.includes(q.id)} 
                                  onCheckedChange={() => {
                                     setBankSelection(prev => prev.includes(q.id) ? prev.filter(id => id !== q.id) : [...prev, q.id])
                                  }}
                                />
                                <div className="min-w-0 flex-1">
                                   <p className="font-bold text-sm text-[#0F172A] truncate">{q.questionEn}</p>
                                   <Badge variant="outline" className="text-[8px] font-black uppercase mt-1">{q.subjectId}</Badge>
                                </div>
                             </div>
                             <Button size="sm" variant="ghost" className="text-primary font-black uppercase text-[9px]" onClick={() => setSelectedQuestions([...selectedQuestions, q])}>Link</Button>
                          </div>
                       ))}
                    </div>
                 </TabsContent>

                 <TabsContent value="assembly" className="p-10 flex-1 flex flex-col m-0">
                    <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 mb-8 flex items-center justify-between">
                       <p className="font-black uppercase text-[10px] text-[#0F172A]">Blueprint Assembly ({selectedQuestions.length} Nodes)</p>
                       <Button variant="ghost" size="sm" className="text-rose-500 font-black uppercase text-[9px]" onClick={() => setSelectedQuestions([])}>
                          <XCircle className="h-3 w-3 mr-2" /> Purge Selection
                       </Button>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar pr-4 space-y-2">
                       {selectedQuestions.map((q, idx) => (
                          <div key={`${q.id}-${idx}`} className="p-4 bg-white border border-slate-100 rounded-xl flex items-center justify-between group">
                             <div className="flex items-center gap-4 min-w-0 flex-1">
                                <span className="font-black text-[10px] text-slate-400 shrink-0">#{idx+1}</span>
                                <p className="font-bold text-xs text-[#0F172A] truncate">{q.questionEn}</p>
                             </div>
                             <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-300 hover:text-rose-500" onClick={() => setSelectedQuestions(selectedQuestions.filter((_, i) => i !== idx))}>
                                <Trash2 className="h-4 w-4" />
                             </Button>
                          </div>
                       ))}
                    </div>
                 </TabsContent>
              </Tabs>
           </Card>
        </div>
      </div>
    </div>
  )
}
